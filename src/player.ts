import { startSeekCheck, startUrlChangeCheck } from "./util/schedule";
import { SessionId } from "./util/consts";
import { changeQueryString } from "./util/url";

declare global {
    interface Window { cucu: any; }
}

interface PlayerOptions {
    connection: {
        protocol: string;
        host: string;
        port: string;
    };
}

enum Messages {
    PLAY = "play",
    PAUSE = "pause",
    SEEK = "seek"
}

export default class Player {
    private ytPlayer: YT.Player;
    public ws: SocketIOClient.Socket;
    private options: PlayerOptions;

    constructor(options: PlayerOptions) {
        this.options = options;
    }

    public create(videoId: string, sessionId: string) {
        this.connectWs(sessionId);

        this.ytPlayer = new window.YT.Player('ytd-player', {
            width: "100%",
            height: "100%",
            videoId,
            playerVars: {
                color: "red",
                autoplay: YT.AutoPlay.AutoPlay
            },
            events: {
                onReady: (e) => this.onReady(e),
                onStateChange: (e) => this.onStateChange(e)
            }
        });

        window.cucu = {};
        window.cucu.player = this.ytPlayer;
    }

    private onReady(_: YT.PlayerEvent): void {
        startSeekCheck(this.ytPlayer, 1000, () => this.onPlayerSeek());
        startUrlChangeCheck(1000, (o, n) => this.onUrlChange(o, n));
    }

    private onStateChange(event: YT.OnStateChangeEvent): void {
        switch(event.data) {
            case window.YT.PlayerState.PLAYING:
                this.sendWsMessage(Messages.PLAY);
                break;
            case window.YT.PlayerState.PAUSED:
                this.sendWsMessage(Messages.PAUSE);
                break;
        }
    }

    private onPlayerSeek(): void {
        this.sendWsMessage(Messages.SEEK);
    }

    private sendWsMessage(message: string) {
        this.ws.send(`${message} ${this.ytPlayer.getCurrentTime()}`);
    }

    private onUrlChange(o: Location, n: Location): void {
        const oldParams = new URLSearchParams(o.search);
        const newParams = new URLSearchParams(n.search);

        const oldSessionId = oldParams.get(SessionId);
        const newSessionId = newParams.get(SessionId);
        if(oldSessionId !== null && newSessionId === null) {
            newParams.set(SessionId, oldSessionId);
            changeQueryString(newParams.toString(), undefined);
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

    private onWsMessage(message: string, player: Player): void {
        const [command, data] = message.split(" ");
        switch(command) {
            case Messages.PLAY.toString():
                player.ytPlayer.seekTo(parseFloat(data), true);
                player.ytPlayer.playVideo();
                break;
            case Messages.PAUSE.toString():
                player.ytPlayer.seekTo(parseFloat(data), true);
                player.ytPlayer.pauseVideo();
                break;
            case Messages.SEEK.toString():
                player.ytPlayer.seekTo(parseFloat(data), true);
                break;
        }
    }

}