import { startSeekCheck, startUrlChangeCheck, startQueueAddChecker } from "./util/schedule";
import { SessionId } from "./util/consts";
import { changeQueryString } from "./util/url";
import * as ytHTML from './util/yt-html';
import { getCurrentVideo } from "./util/video";

declare global {
    interface Window {
        cucu: any;
        YT: any;
    }
}

interface PlayerOptions {
    connection: {
        protocol: string;
        host: string;
        port: string;
    };
}

enum Message {
    PLAY = 'play',
    PAUSE = 'pause',
    SEEK = 'seek',
    PLAY_VIDEO = 'play-video',
    ADD_TO_QUEUE = "add-to-queue",
    DELETE_FROM_QUEUE = "delete-from-queue",
    QUEUE = 'queue'
}

export default class Player {
    private ytPlayer: YT.Player;
    private ws: SocketIOClient.Socket;
    private options: PlayerOptions;
    private queueElement: JQuery<Element>;

    constructor(options: PlayerOptions) {
        this.options = options;
    }

    public create(videoId: string, sessionId: string, queueElement: JQuery<Element>) {
        this.queueElement = queueElement;

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

        window.cucu = {};
        window.cucu.player = this.ytPlayer;
    }

    private onReady(_: YT.PlayerEvent, sessionId: string, videoId: string): void {
        startSeekCheck(this.ytPlayer, 1000, () => this.onPlayerSeek());
        startUrlChangeCheck(1000, (o, n) => this.onUrlChange(o, n));
        startQueueAddChecker(1000, (v) => this.addVideoToQueue(v));

        this.connectWs(sessionId);
        this.addVideoToQueue(getCurrentVideo());
        this.sendWsMessage(Message.PLAY_VIDEO, videoId);
    }

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

    private onPlayerSeek(): void {
        this.sendWsTimeMessage(Message.SEEK);
    }

    private sendWsTimeMessage(message: Message) {
        this.sendWsMessage(message, this.ytPlayer.getCurrentTime().toString());
    }

    private sendWsMessage(type: Message, data: any) {
        const message = {
            action: type,
            data
        };
        this.ws.send(JSON.stringify(message));
    }

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

    private connectWs(sessionId: string): void {
        const { protocol, host, port } = this.options.connection;

        this.ws = io(`${protocol}://${host}:${port}/${sessionId}`, {
            autoConnect: true,
            path: '/socket.io'
        });
        this.ws.on('connect', () => this.onWsConnected());
        this.ws.on('message', (d: string) => this.onWsMessage(d, this));
    }

    private onWsConnected(): void {
        console.log("Connected");
    }

    private syncPlayerTime(videoTime: number, margin: number = 1.0): void {
        if (Math.abs(videoTime - this.ytPlayer.getCurrentTime()) > margin) {
            this.ytPlayer.seekTo(videoTime, true);
        }
    }

    private populateQueue(data: { videos: Video[], video: Video }): void {
        this.queueElement.empty();

        data.videos.forEach((v) => {
            ytHTML.injectVideoQueueElement(
                this.queueElement,
                data.video !== null && v.videoId === data.video.videoId,
                v.videoId,
                v.title,
                v.byline,
                this.queueElementClickHandler(v.videoId),
                this.queueElementDeleteHandler(v.videoId)
            );
        });
    }

    private addVideoToQueue(video: Video) {
        this.sendWsMessage(Message.ADD_TO_QUEUE, video);
    }

    private queueElementClickHandler(vId: string): () => void {
        return () => {
            this.changeQueryStringVideoId(vId);
        };
    }

    private queueElementDeleteHandler(vId: string): () => void {
        return () => {
            this.sendWsMessage(Message.DELETE_FROM_QUEUE, vId);
        };
    }

    private changeQueryStringVideoId(vid: string): void {
        const params = new URLSearchParams(window.location.search);
        params.set('v', vid);
        changeQueryString(params.toString(), undefined);
    }

    private onWsMessage(message: string, player: Player): void {
        try {
            const json = JSON.parse(message);
            const command = json.action;
            const data = json.data;

            console.log(`Message: ${message}`);

            const playerState = player.ytPlayer.getPlayerState();

            switch(command) {
                case Message.PLAY.toString():
                    player.syncPlayerTime(parseFloat(data));

                    if(playerState === unsafeWindow.YT.PlayerState.PAUSED)
                        player.ytPlayer.playVideo();

                    break;
                case Message.PAUSE.toString():
                    player.syncPlayerTime(parseFloat(data));

                    if(playerState === unsafeWindow.YT.PlayerState.PLAYING)
                        player.ytPlayer.pauseVideo();

                    break;
                case Message.SEEK.toString():
                    player.ytPlayer.seekTo(parseFloat(data), true);
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

}