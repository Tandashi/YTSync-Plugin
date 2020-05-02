import ScheduleUtil from "./util/schedule";
import { SessionId } from "./util/consts";
import URLUtil from "./util/url";
import * as ytHTML from './util/yt-html';
import VideoUtil from "./util/video";
import { Message } from "./enum/message";

declare global {
    interface Window {
        YT: typeof YT;
    }
}

export default class Player {
    private ytPlayer: YT.Player;
    private ws: SocketIOClient.Socket;
    private options: PlayerOptions;
    private queueItemsElement: JQuery<Element>;

    constructor(options: PlayerOptions) {
        this.options = options;
    }

    /**
     * Create a Player.
     *
     * @param videoId The video that should be initially be played
     * @param sessionId
     * @param queueElement The element of the playlist items (Mostly 'ytd-playlist-panel-renderer #items')
     */
    public create(videoId: string, sessionId: string, queueElement: JQuery<Element>) {
        this.queueItemsElement = queueElement;

        this.ytPlayer = new unsafeWindow.YT.Player('ytd-player', {
            width: "100%",
            height: "100%",
            videoId,
            playerVars: {
                color: "red",
                autoplay: YT.AutoPlay.AutoPlay
            },
            events: {
                onReady: (e) => this.onReady(e, sessionId, videoId),
                onStateChange: (e) => this.onStateChange(e)
            }
        });
    }

    /**
     * Handler function for the YT.Player -> onReady
     *
     * @param _
     * @param sessionId
     * @param videoId The videoId of the initial video
     */
    private onReady(_: YT.PlayerEvent, sessionId: string, videoId: string): void {
        ScheduleUtil.startSeekSchedule(this.ytPlayer, () => this.onPlayerSeek());
        ScheduleUtil.startUrlChangeSchedule((o, n) => this.onUrlChange(o, n));
        ScheduleUtil.startQueueStoreSchedule((v) => this.addVideoToQueue(v));

        this.connectWs(sessionId);
    }

    /**
     * Handler function for a YT.Player -> OnStateChange
     *
     * @param event
     */
    private onStateChange(event: YT.OnStateChangeEvent): void {
        switch(event.data) {
            case unsafeWindow.YT.PlayerState.PLAYING:
                this.sendWsTimeMessage(Message.PLAY);
                break;
            case unsafeWindow.YT.PlayerState.PAUSED:
                this.sendWsTimeMessage(Message.PAUSE);
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
        console.log(`URL CHANGE: ${o.href} -> ${n.href}`);
        const oldParams = new URLSearchParams(o.search);
        const newParams = new URLSearchParams(n.search);

        const oldSessionId = oldParams.get(SessionId);
        const newSessionId = newParams.get(SessionId);
        if(oldSessionId !== null && newSessionId === null) {
            // newParams.set(SessionId, oldSessionId);
            // changeQueryString(newParams.toString(), undefined);
            window.location.search = newParams.toString();
            return;
        }

        const videoId = newParams.get('v');
        if(videoId !== null) {
            this.sendWsMessage(Message.PLAY_VIDEO, videoId);
            console.log(`Loading new VIDEO: ${videoId}`);
            this.ytPlayer.loadVideoById(videoId);
        }
    }

    /**
     * Handler for a Player seek.
     * Will send a SEEK Message.
     */
    private onPlayerSeek(): void {
        this.sendWsTimeMessage(Message.SEEK);
    }

    /**
     * Connect to the Server with the given sessionId.
     *
     * @param sessionId
     */
    private connectWs(sessionId: string): void {
        const { protocol, host, port } = this.options.connection;

        this.ws = io(`${protocol}://${host}:${port}/${sessionId}`, {
            autoConnect: true,
            path: '/socket.io'
        });
        this.ws.on('connect', () => this.onWsConnected());
        this.ws.on('message', (d: string) => this.onWsMessage(d));
    }

    /**
     * Handler function for the Websocket 'connect' event
     */
    private onWsConnected(): void {
        console.log("Connected");
        const video = VideoUtil.getCurrentVideo();
        this.addVideoToQueue(video);
        this.sendWsMessage(Message.PLAY_VIDEO, video.videoId);
    }

    /**
     * Handler function for a Websocket message.
     *
     * @param message
     * @param player
     */
    private onWsMessage(message: string): void {
        try {
            const json = JSON.parse(message);
            const command = json.action;
            const data = json.data;

            console.log(`Message: ${message}`);

            const playerState = this.ytPlayer.getPlayerState();

            switch(command) {
                case Message.PLAY.toString():
                    this.syncPlayerTime(parseFloat(data));

                    if(playerState === unsafeWindow.YT.PlayerState.PAUSED)
                    this.ytPlayer.playVideo();

                    break;
                case Message.PAUSE.toString():
                    this.syncPlayerTime(parseFloat(data));

                    if(playerState === unsafeWindow.YT.PlayerState.PLAYING)
                        this.ytPlayer.pauseVideo();

                    break;
                case Message.SEEK.toString():
                    this.ytPlayer.seekTo(parseFloat(data), true);
                    break;
                case Message.PLAY_VIDEO.toString():
                    this.changeQueryStringVideoId(data);
                    break;
                case Message.QUEUE.toString():
                    this.populateQueue(data);
                    break;
            }
        }
        catch(e) { console.error(e); }
    }

    /**
     * Send a message to the session containing the current video time as data
     *
     * @param type The type of the message
     */
    private sendWsTimeMessage(type: Message.PLAY | Message.PAUSE | Message.SEEK): void {
        this.sendWsMessage(type, this.ytPlayer.getCurrentTime().toString());
    }

    /**
     * Send a message to the session
     *
     * @param type The message type
     * @param data The message data
     */
    private sendWsMessage(type: Message, data: any): void {
        console.log(`Sending Message: ${type} | ${data}`);
        const message = {
            action: type,
            data
        };
        this.ws.send(JSON.stringify(message));
    }

    /**
     * Populate the Queue
     *
     * @param data The data to populate the Queue with
     */
    private populateQueue(data: QueueMessageData): void {
        this.queueItemsElement.empty();

        data.videos.forEach((v) => {
            ytHTML.injectVideoQueueElement(
                this.queueItemsElement,
                data.video !== null && v.videoId === data.video.videoId,
                v.videoId,
                v.title,
                v.byline,
                this.queueElementClickHandler(v.videoId),
                this.queueElementDeleteHandler(v.videoId)
            );
        });
    }

    /**
     * Request to add the given Video to the Queue.
     * Will only work if the client has the needed Permissions.
     *
     * @param video The video that should be added to the Queue
     */
    private addVideoToQueue(video: Video) {
        this.sendWsMessage(Message.ADD_TO_QUEUE, video);
    }

    /**
     * Returns a Handler function for a Queue Element click.
     *
     * @param videoId
     */
    private queueElementClickHandler(videoId: string): () => void {
        return () => {
            this.changeQueryStringVideoId(videoId);
        };
    }

    /**
     * Returns a Handler function for a Queue Element delete.
     * @param videoId
     */
    private queueElementDeleteHandler(videoId: string): () => void {
        return () => {
            this.sendWsMessage(Message.DELETE_FROM_QUEUE, videoId);
        };
    }

    /**
     * Change the videoId in the current URL without reloading the page.
     *
     * @param videoId
     */
    private changeQueryStringVideoId(videoId: string): void {
        const params = new URLSearchParams(window.location.search);
        params.set('v', videoId);
        URLUtil.changeQueryString(params);
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