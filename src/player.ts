import { generateRoomId } from "./util/websocket";

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

    public create(videoId: string, roomId: string) {
        this.connectWs(roomId);

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
        this.ytPlayer.pauseVideo();

        // https://stackoverflow.com/questions/29293877/how-to-listen-to-seek-event-in-youtube-embed-api
        let lastTime = -1;
        const interval = 1000;

        const checkPlayerTime = () => {
            if (lastTime !== -1) {
                if(this.ytPlayer.getPlayerState() === window.YT.PlayerState.PLAYING ) {
                    const time = this.ytPlayer.getCurrentTime();

                    // expecting 1 second interval , with 500 ms margin
                    if (Math.abs(time - lastTime - 1) > 0.5) {
                        // there was a seek occuring
                        this.onPlayerSeek();
                    }
                }
            }
            lastTime = this.ytPlayer.getCurrentTime();
            setTimeout(checkPlayerTime, interval); // repeat function call in 1 second
        };

        setTimeout(checkPlayerTime, interval); // initial call delayed
    }

    private onStateChange(event: YT.OnStateChangeEvent): void {
        console.log(`New State ${event.data}`);
        switch(event.data) {
            case window.YT.PlayerState.PLAYING:
                console.log(Messages.PLAY);
                this.ws.send(Messages.PLAY);
                break;
            case window.YT.PlayerState.PAUSED:
                console.log(Messages.PAUSE);
                this.ws.send(Messages.PAUSE);
                break;
        }
    }

    private onPlayerSeek(): void {
        console.log(`${Messages.SEEK} ${this.ytPlayer.getCurrentTime()}`);
        this.ws.send(`${Messages.SEEK} ${this.ytPlayer.getCurrentTime()}`);
    }

    private connectWs(roomId: string) {
        const { protocol, host, port } = this.options.connection;

        this.ws = io(`${protocol}://${host}:${port}/${roomId}`, {
            autoConnect: true,
            path: '/socket.io'
        });
        this.ws.on('connect', () => this.onWsConnected());
        this.ws.on('message', (d: string) => this.onWsMessage(d, this));
    }

    private onWsConnected() {
        console.log("Connected");
    }

    private onWsMessage(message: string, player: Player): void {
        console.log(`Message: ${message}`);
        const [command, data] = message.split(" ");
        console.log(command);
        console.log(data);
        switch(command) {
            case Messages.PLAY.toString():
                console.log("PLAY COMMAND RECEIVED");
                console.log(player);
                player.ytPlayer.playVideo();
                break;
            case Messages.PAUSE.toString():
                console.log("PAUSE COMMAND RECEIVED");
                console.log(player);
                player.ytPlayer.pauseVideo();
                break;
            case Messages.SEEK.toString():
                console.log("SEEK COMMAND RECEIVED");
                console.log(player);
                player.ytPlayer.seekTo(parseFloat(data), true);
                break;
        }

    }

}