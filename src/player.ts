import { Message } from './enum/message';
import ScheduleUtil from './util/schedule';
import VideoUtil from './util/video';
import YTUtil from './util/yt';
import Store from './util/store';
import SyncSocket from './model/sync-socket';

import { ReactionsMap } from './util/consts';
import { PLAYLIST_CONTAINER_SELECTOR } from './util/yt-html/playlist';
import { addReaction, REACTIONS_CONTAINER_SELECTOR } from './util/yt-html/reaction';
import { removeRelated } from './util/yt-html/related';
import { ROOM_INFO_CONTAINER_SELECTOR } from './util/yt-html/room';
import { removeUpnext } from './util/yt-html/upnext';
import URLUtil from './util/url';
import QueueContainer from './container/queue-container';
import ReactionsContainer from './container/reactions-container';
import RoomInfoContainer from './container/room-info-container';
import SettingsContainer from './container/settings-container';
import ActionLogContainer from './container/action-log-container';
import { SETTINGS_CONTAINER_SELECTOR } from './util/yt-html/settings';
import { ACTION_LOG_CONTAINER_SELECTOR } from './util/yt-html/action-log';

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
  private actionLogContainer: ActionLogContainer = null;
  private queueContainer: QueueContainer = null;
  private roomInfoContainer: RoomInfoContainer = null;
  private reactionContainer: ReactionsContainer = null;
  private settingsContainer: SettingsContainer = null;

  private wsMessageBuffers = {
    queue: [],
    roomInfo: [],
    settings: [],
  };

  private bufferConditions: BufferCondition[] = [
    {
      check: () => this.queueContainer === null,
      types: [
        Message.PLAY_VIDEO,
        Message.QUEUE,
        Message.ADD_TO_QUEUE,
        Message.REMOVE_FROM_QUEUE,
        Message.SET_PLAYBACK_RATE,
      ],
      buffer: this.wsMessageBuffers.queue,
    },
    {
      check: () => this.roomInfoContainer === null,
      types: [Message.CLIENTS, Message.CLIENT_CONNECT, Message.CLIENT_DISCONNECT],
      buffer: this.wsMessageBuffers.roomInfo,
    },
    {
      check: () => this.settingsContainer === null,
      types: [Message.AUTOPLAY],
      buffer: this.wsMessageBuffers.settings,
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

    this.connectWs(sessionId);

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
      this.onPlayerReady();
    }

    const clearWaitForActionLogContainer = ScheduleUtil.waitForElement(ACTION_LOG_CONTAINER_SELECTOR, () => {
      this.actionLogContainer = new ActionLogContainer();
      this.actionLogContainer.create();

      clearWaitForActionLogContainer();
    });

    const clearWaitForQueueContainer = ScheduleUtil.waitForElement(PLAYLIST_CONTAINER_SELECTOR, () => {
      this.queueContainer = new QueueContainer(this.ws);
      this.queueContainer.create();

      clearWaitForQueueContainer();

      this.executeBufferedWsMessages(this.wsMessageBuffers.queue);
    });

    const clearWaitForRoomInfoContainer = ScheduleUtil.waitForElement(ROOM_INFO_CONTAINER_SELECTOR, () => {
      this.roomInfoContainer = new RoomInfoContainer(this.ws, this.options);
      this.roomInfoContainer.create();

      clearWaitForRoomInfoContainer();

      this.executeBufferedWsMessages(this.wsMessageBuffers.roomInfo);
    });

    const clearWaitForReactionsContainer = ScheduleUtil.waitForElement(REACTIONS_CONTAINER_SELECTOR, () => {
      this.reactionContainer = new ReactionsContainer(this.ws);
      this.reactionContainer.create();

      clearWaitForReactionsContainer();
    });

    const clearWaitForSettingsContainer = ScheduleUtil.waitForElement(SETTINGS_CONTAINER_SELECTOR, () => {
      this.settingsContainer = new SettingsContainer(this.ws);
      this.settingsContainer.create();

      clearWaitForSettingsContainer();

      this.executeBufferedWsMessages(this.wsMessageBuffers.settings);
    });

    ScheduleUtil.startUrlChangeSchedule((o, n) => this.onUrlChange(o, n));
    ScheduleUtil.startQueueStoreSchedule((v) => this.ws.sendWsRequestToAddToQueue(v));
  }

  /**
   * Exectue buffered Websocket Commands.
   *
   * @param buffer
   */
  private executeBufferedWsMessages(buffer: string[]): void {
    buffer.forEach((c) => this.onWsMessage(c));
    buffer = [];
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
        if (this.settingsContainer.shouldAutoplay()) this.playNextVideoInQueue();
        break;
    }
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
          this.queueContainer.populateQueue(data);
          break;
        case Message.ADD_TO_QUEUE:
          this.queueContainer.addToQueue(data, false);
          break;
        case Message.REMOVE_FROM_QUEUE:
          this.queueContainer.removeFromQueue(data);
          break;
        case Message.AUTOPLAY:
          this.settingsContainer.setAutoplay(data);
          break;
        case Message.CLIENTS:
          this.roomInfoContainer.populateClients(data);
          break;
        case Message.CLIENT_CONNECT:
          this.roomInfoContainer.addClient(data);
          break;
        case Message.CLIENT_DISCONNECT:
          this.roomInfoContainer.removeClient(data);
          break;
        case Message.REACTION:
          const reaction = ReactionsMap[data];
          if (!reaction) return;

          if (!Store.getSettings().showReactions) return;

          addReaction(reaction);
          break;
        case Message.ACTION_LOG:
          this.actionLogContainer.addEntry(data.clientName, data.actionText);
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Navigate to the videoId using the YT Hook.
   * Will also select the video in the Queue.
   *
   * @param videoId
   */
  private navigateToVideo(videoId: string): void {
    this.queueContainer.selectQueueElement(videoId);

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
    const nextVideoId = this.queueContainer.getNextVideoInQueue();
    this.navigateToVideo(nextVideoId);
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
