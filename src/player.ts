import anime from 'animejs';

import { Message } from './enum/message';
import { Role } from './enum/role';
import ScheduleUtil from './util/schedule';
import VideoUtil from './util/video';
import YTUtil from './util/yt';
import Store from './util/store';
import SyncSocket from './model/sync-socket';

import { Reactions, ReactionsMap, BADGE_MEMBER_ID, BADGE_MODERATOR_ID, BADGE_SUB_HOST_ID } from './util/consts';
import { setPapperToggleButtonState } from './util/yt-html/button';
import { injectYtLiveChatParticipantRenderer } from './util/yt-html/participant';
import {
  changeYtPlaylistPanelRendererDescription,
  injectEmptyPlaylistShell,
  injectYtPlaylistPanelVideoRendererElement,
  PLAYLIST_CONTAINER_SELECTOR,
} from './util/yt-html/playlist';
import {
  addReaction,
  getReactionId,
  injectReactionsPanel,
  REACTIONS_CONTAINER_SELECTOR,
  setReactionToggle,
} from './util/yt-html/reaction';
import { removeRelated } from './util/yt-html/related';
import { AUTOPLAY_TOGGLE_ID, injectEmptyRoomInfoShell, ROOM_INFO_CONTAINER_SELECTOR } from './util/yt-html/room';
import { removeUpnext } from './util/yt-html/upnext';
import URLUtil from './util/url';

declare global {
  interface Window {
    YT: typeof YT;
  }
}

interface BufferCondition {
  check: () => boolean;
  types: Message[];
  buffer: string[];
}

const PLAYER_STATE_ENDED = 0;
const PLAYER_STATE_PLAYING = 1;
const PLAYER_STATE_PAUSED = 2;

export default class Player {
  private sessionId: string;
  private ytPlayer: YTPlayer = null;
  private ws: SyncSocket;
  private options: PlayerOptions;
  private queueItemsElement: JQuery<Element> = null;
  private roomInfoElement: JQuery<HTMLElement> = null;
  private reactionPanelElement: JQuery<HTMLElement> = null;

  private currentAnimation: anime.AnimeInstance = null;

  private bufferedQueueWsMessages: string[] = [];
  private bufferedRoomInfoWsMessages: string[] = [];

  private autoplay: boolean = true;

  private clients: Client[] = [];

  private bufferConditions: BufferCondition[] = [
    {
      check: () => this.queueItemsElement === null,
      types: [
        Message.PLAY_VIDEO,
        Message.QUEUE,
        Message.ADD_TO_QUEUE,
        Message.REMOVE_FROM_QUEUE,
        Message.SET_PLAYBACK_RATE,
      ],
      buffer: this.bufferedQueueWsMessages,
    },
    {
      check: () => this.roomInfoElement === null,
      types: [Message.AUTOPLAY, Message.CLIENTS, Message.CLIENT_CONNECT, Message.CLIENT_DISCONNECT],
      buffer: this.bufferedRoomInfoWsMessages,
    },
  ];

  constructor(options: PlayerOptions) {
    this.options = options;
  }

  /**
   * Create a Player.
   *
   * @param sessionId
   */
  public create(sessionId: string) {
    if (this.ytPlayer !== null) return;

    this.ytPlayer = YTUtil.getPlayer();
    // Check if the YtPlayer exists.
    // This might not be always the cause e.g. when the Autoplay feature of the browser is turned off.
    if (this.ytPlayer === null) {
      const clearSchedule = ScheduleUtil.startYtPlayerSchedule((player) => {
        this.ytPlayer = player;
        clearSchedule();

        this.onPlayerReady();
      });
    } else {
      // Wierd casting because the YT.Player on YT returns the state not a PlayerEvent.
      this.onPlayerReady();
    }

    const clearWaitForQueueContainer = ScheduleUtil.waitForElement(PLAYLIST_CONTAINER_SELECTOR, () => {
      const queueRenderer = injectEmptyPlaylistShell('Queue', '', true, false);
      this.queueItemsElement = queueRenderer.find('#items');

      clearWaitForQueueContainer();

      this.executeBufferedWsMessages(this.bufferedQueueWsMessages);
      this.bufferedQueueWsMessages = [];
    });

    const clearWaitForRoomInfoContainer = ScheduleUtil.waitForElement(ROOM_INFO_CONTAINER_SELECTOR, () => {
      this.roomInfoElement = injectEmptyRoomInfoShell('Room Info', 'Not connected', true, false, (state: boolean) => {
        this.setAutoplay(state);
      });

      clearWaitForRoomInfoContainer();

      this.executeBufferedWsMessages(this.bufferedRoomInfoWsMessages);
      this.bufferedRoomInfoWsMessages = [];
    });

    const clearWaitForReactionsContainer = ScheduleUtil.waitForElement(REACTIONS_CONTAINER_SELECTOR, () => {
      this.reactionPanelElement = injectReactionsPanel(
        'Reactions',
        'Find it funny? React!',
        Reactions,
        (reaction: Reaction) => {
          this.ws.sendWsReactionMessage(reaction);

          if (this.currentAnimation !== null) {
            this.currentAnimation.restart();
            this.currentAnimation.seek(this.currentAnimation.duration);
          }

          this.currentAnimation = anime({
            targets: `#${getReactionId(reaction)}`,
            duration: 400,
            rotate: '+=1turn',
            easing: 'linear',
          });
        },
        (state: boolean) => {
          setReactionToggle(this.reactionPanelElement, state);
        },
        true,
        false
      );

      clearWaitForReactionsContainer();
    });

    ScheduleUtil.startUrlChangeSchedule((o, n) => this.onUrlChange(o, n));
    ScheduleUtil.startQueueStoreSchedule((v) => this.ws.sendWsRequestToAddToQueue(v));

    this.connectWs(sessionId);
  }

  /**
   * Exectue buffered Websocket Commands.
   *
   * @param buffer
   */
  private executeBufferedWsMessages(buffer: string[]): void {
    buffer.forEach((c) => this.onWsMessage(c));
  }

  /**
   * Add the onStateChange Listener
   */
  private onPlayerReady(): void {
    // Disable YouTube Autoplay
    this.ytPlayer.setAutonav(false);

    // Wierd casting because the YT.Player on YT returns the state not a PlayerEvent.
    this.ytPlayer.addEventListener('onStateChange', (e) => this.onStateChange(e as unknown as YT.PlayerState));

    ScheduleUtil.startPlaybackRateSchedule(this.ytPlayer, () => this.onPlayerPlaybackRateChanged());

    ScheduleUtil.startSeekSchedule(this.ytPlayer, () => this.onPlayerSeek());
  }

  /**
   * Handler function for a YT.Player -> OnStateChange.
   *
   * @param state The new state the player is now in
   */
  private onStateChange(state: YT.PlayerState): void {
    switch (state) {
      case PLAYER_STATE_PLAYING:
        this.ws.sendWsTimeMessage(Message.PLAY, this.ytPlayer);
        break;
      case PLAYER_STATE_PAUSED:
        this.ws.sendWsTimeMessage(Message.PAUSE, this.ytPlayer);
        break;
      case PLAYER_STATE_ENDED:
        if (this.autoplay) this.playNextVideoInQueue();
        break;
    }

    this.ws.sendWsPlaybackRateMessage(this.ytPlayer.getPlaybackRate());
  }

  /**
   * Handler function for the URLSchedule
   *
   * @param o The old window Location
   * @param n The new window Location
   *
   * @see startUrlChangeSchedule
   */
  private onUrlChange(o: Location, n: Location): void {
    const oldSessionId = URLUtil.getSessionIdWithLocation(o);
    const newSessionId = URLUtil.getSessionIdWithLocation(n);
    if (oldSessionId !== null && newSessionId === null) {
      // newParams.set(SessionId, oldSessionId);
      // changeQueryString(newParams.toString(), undefined);
      // window.location.search = newParams.toString();
      location.reload();
      return;
    }

    const videoId = URLUtil.getVideoId();
    if (videoId !== null) {
      this.ws.sendWsRequestToPlayVideo(videoId);
    }
  }

  /**
   * Handler for a Player seek.
   * Will send a SEEK Message.
   */
  private onPlayerSeek(): void {
    this.ws.sendWsTimeMessage(Message.SEEK, this.ytPlayer);
  }

  /**
   * Handler for Player playback rate changes
   * Will send a PLAYBACK_RATE Message
   */
  private onPlayerPlaybackRateChanged(): void {
    this.ws.sendWsTimeMessage(Message.SEEK, this.ytPlayer);
    this.ws.sendWsPlaybackRateMessage(this.ytPlayer.getPlaybackRate());
  }

  /**
   * Connect to the Server with the given sessionId.
   *
   * @param sessionId
   */
  private connectWs(sessionId: string): void {
    // We have to replace = with nothing because YouTube likes to fuck with our session Id...
    this.sessionId = sessionId.replace('=', '');
    const { protocol, host, port } = this.options.connection;

    const socket = io(`${protocol}://${host}:${port}/${sessionId}`, {
      autoConnect: true,
      path: '/socket.io',
    });

    this.ws = new SyncSocket(socket);
    this.ws.socket.on('connect', () => this.onWsConnected());
    this.ws.socket.on('message', (d: string) => this.onWsMessage(d));
  }

  /**
   * Handler function for the Websocket 'connect' event
   */
  private onWsConnected(): void {
    const video = VideoUtil.getCurrentVideo();
    this.ws.sendWsRequestToAddToQueue(video);
    this.ws.sendWsRequestToPlayVideo(video.videoId);

    this.setAutoplay(this.autoplay, this.roomInfoElement !== null);
    setReactionToggle(this.reactionPanelElement, Store.getSettings().showReactions, false);
  }

  /**
   * Handler function for a Websocket message.
   *
   * @param message The message that was received
   */
  private onWsMessage(message: string): void {
    try {
      const json = JSON.parse(message);
      const command = json.action;
      const data = json.data;

      // Filter all messages who's container hasn't been injected yet.
      if (
        this.bufferConditions.some((c) => {
          if (c.check() && c.types.includes(command)) {
            c.buffer.push(message);
            return true;
          }
          return false;
        })
      ) {
        return;
      }

      if (this.ytPlayer !== null) {
        const playerState = this.ytPlayer.getPlayerState();

        switch (command) {
          case Message.PLAY:
            this.syncPlayerTime(parseFloat(data));

            if (playerState === PLAYER_STATE_PAUSED) {
              this.ytPlayer.playVideo();
            }

            break;
          case Message.PAUSE:
            this.syncPlayerTime(parseFloat(data));

            if (playerState === PLAYER_STATE_PLAYING) {
              this.ytPlayer.pauseVideo();
            }

            break;
          case Message.SEEK:
            this.ytPlayer.seekTo(parseFloat(data), true);
            break;

          case Message.SET_PLAYBACK_RATE:
            this.ytPlayer.setPlaybackRate(parseFloat(data));
            break;
        }
      }

      switch (command) {
        case Message.PLAY_VIDEO:
          this.navigateToVideo(data);
          break;
        case Message.QUEUE:
          this.populateQueue(data);
          break;
        case Message.ADD_TO_QUEUE:
          this.addToQueue(data, false);
          break;
        case Message.REMOVE_FROM_QUEUE:
          this.removeFromQueue(data);
          break;
        case Message.AUTOPLAY:
          this.setAutoplay(data);
          break;
        case Message.CLIENTS:
          this.clients = [];
          this.populateClients(data);
          break;
        case Message.CLIENT_CONNECT:
          this.addClient(data);
          break;
        case Message.CLIENT_DISCONNECT:
          this.removeClient(data);
          break;
        case Message.REACTION:
          const reaction = ReactionsMap[data];
          if (reaction === null || reaction === undefined) return;

          if (!Store.getSettings().showReactions) return;

          addReaction(reaction);
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Populate the Queue.
   *
   * **Caution**: Will clear existing Queue.
   *
   * @param data The data to populate the Queue with
   */
  private populateQueue(data: QueueMessageData): void {
    this.queueItemsElement.empty();

    data.videos.forEach((video) => {
      this.addToQueue(video, data.video !== null && video.videoId === data.video.videoId);
    });
  }

  /**
   * Add the given Video to the Queue.
   *
   * **Caution**: This will only add the Video visually.
   * There will not be send a request to add the Video to the Queue.
   * For this please use: {@link sendWsRequestToAddToQueue}
   *
   * @param video
   * @param selected
   */
  private addToQueue(video: Video, selected: boolean = false): void {
    injectYtPlaylistPanelVideoRendererElement(
      this.queueItemsElement,
      selected,
      video.videoId,
      video.title,
      video.byline,
      this.queueElementClickHandler(video.videoId),
      this.queueElementDeleteHandler(video.videoId)
    );
  }

  /**
   * Remove the Video from the Queue.
   *
   * **Caution**: This will only remove the Video visually.
   * There will not be send a request to remove the Video from the Queue.
   *
   * @param video
   */
  private removeFromQueue(video: Video): void {
    this.queueItemsElement.find(`[videoId="${video.videoId}"]`).remove();
  }

  /**
   * Select the Video with given videoId in the Queue
   *
   * @param videoId
   */
  private selectQueueElement(videoId: string): void {
    // Deselect all selected
    this.queueItemsElement.children().removeAttr('selected');
    // Select Video
    this.queueItemsElement.find(`[videoId="${videoId}"]`).attr('selected', '');
  }

  /**
   * Returns a Handler function for a Queue Element click.
   *
   * @param videoId
   */
  private queueElementClickHandler(videoId: string): () => void {
    return () => {
      this.ws.sendWsRequestToPlayVideo(videoId);
    };
  }

  /**
   * Returns a Handler function for a Queue Element delete.
   * @param videoId
   */
  private queueElementDeleteHandler(videoId: string): () => void {
    return () => {
      this.ws.sendWsRequestToRemoveFromQueue(videoId);
    };
  }

  /**
   * Navigate to the videoId using the YT Hook.
   * Will also select the video in the Queue.
   *
   * @param videoId
   */
  private navigateToVideo(videoId: string): void {
    this.selectQueueElement(videoId);

    const currentVideoId = URLUtil.getVideoId();
    if (currentVideoId !== videoId) {
      YTUtil.navigateToVideo(videoId, this.sessionId);
    }

    removeUpnext();
    removeRelated();
  }

  /**
   * Playes the next Video in Queue if there is one
   */
  private playNextVideoInQueue(): void {
    const current = this.queueItemsElement.find(`[selected]`);
    const children = this.queueItemsElement.children();
    const index = children.index(current.get(0));

    if (index === children.length - 1) return;

    const next = children.get(index + 1);
    const nextVideoId = $(next).attr('videoId');
    this.navigateToVideo(nextVideoId);
  }

  /**
   * Set autoplay. Will also update the toggle.
   *
   * @param autoplay
   * @param force If the autoplay should be set even if its not different to the current state.
   *              Might be used to send a initial Message.AUTOPLAY.
   */
  private setAutoplay(autoplay: boolean, force: boolean = false): void {
    if (this.autoplay === autoplay && !force) return;

    const autoplayToggle = this.roomInfoElement.find(`#${AUTOPLAY_TOGGLE_ID}`);
    this.autoplay = autoplay;

    setPapperToggleButtonState(autoplayToggle, autoplay);
    this.ws.sendWsAutoplayMessage(this.autoplay);
  }

  /**
   * Populate the client renderer.
   *
   * @param clients The clients the renderer should be populated with
   */
  private populateClients(clients: Client[]): void {
    this.clients = [];
    this.roomInfoElement.find('#items').children().remove();

    clients.forEach((c) => {
      this.addClient(c);
    });
  }

  /**
   * Add clients visually.
   *
   * @param client The clients to add
   */
  private addClient(client: Client): void {
    const socketIds = this.clients.map((c) => c.socketId);

    if (socketIds.includes(client.socketId)) return;

    const badges = [];
    switch (client.role) {
      case Role.MEMBER:
        badges.push({
          id: BADGE_MEMBER_ID,
          onClick: () => {
            this.ws.sendWsRoleUpdateMessage(client, Role.MODERATOR);
          },
        });
        break;
      case Role.MODERATOR:
        badges.push({
          id: BADGE_MODERATOR_ID,
          onClick: () => {
            this.ws.sendWsRoleUpdateMessage(client, Role.SUB_HOST);
          },
        });
        break;
      case Role.SUB_HOST:
        badges.push({
          id: BADGE_SUB_HOST_ID,
          onClick: () => {
            this.ws.sendWsRoleUpdateMessage(client, Role.MEMBER);
          },
        });
        break;
    }

    injectYtLiveChatParticipantRenderer(this.roomInfoElement.find('#items'), this.options.connection, {
      prefix: '',
      sufix: this.ws.socket.id === client.socketId ? ' (You)' : '',
      client,
      badges,
    });

    this.clients.push(client);

    changeYtPlaylistPanelRendererDescription(this.roomInfoElement, `Connected (${this.clients.length})`);
  }

  /**
   * Remove a clients visually.
   *
   * @param socketId The socketId of the client that should be removed
   */
  private removeClient(socketId: string): void {
    this.roomInfoElement.find(`#items [socketId="${socketId}"]`).remove();

    this.clients = this.clients.filter((c) => c.socketId !== socketId);
    changeYtPlaylistPanelRendererDescription(this.roomInfoElement, `Connected (${this.clients.length})`);
  }

  /**
   * Will seek the YT.Player to the given videoTime if the current time differers more than the given margin to the videoTime.
   *
   * @param videoTime The time the video should be set to
   * @param margin The difference the current video time and the to set video time need in order to seek
   */
  private syncPlayerTime(videoTime: number, margin: number = 1.0): void {
    if (Math.abs(videoTime - this.ytPlayer.getCurrentTime()) > margin) {
      this.ytPlayer.seekTo(videoTime, true);
    }
  }
}
