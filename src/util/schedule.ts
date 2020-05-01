export const startSeekCheck = (player: YT.Player, interval: number, cb: () => void): () => void => {
    // https://stackoverflow.com/questions/29293877/how-to-listen-to-seek-event-in-youtube-embed-api
    let lastTime = -1;

    const checkPlayerTime = () => {
        if (lastTime !== -1) {
            if(player.getPlayerState() === window.YT.PlayerState.PLAYING ) {
                const time = player.getCurrentTime();

                // expecting 1 second interval , with 500 ms margin
                if (Math.abs(time - lastTime - 1) > 0.5) {
                    // there was a seek occuring
                    cb();
                }
            }
        }
        lastTime = player.getCurrentTime();
    };

    const handler = setInterval(checkPlayerTime, interval);
    return () => {
        clearTimeout(handler);
    };
};


export const startUrlChangeCheck = (interval: number, cb: (o: Location, n: Location) => void): () => void => {
    let old: Location = null;
    const checkURL = () => {
        const current = window.location;

        if(old === null) {
            old = JSON.parse(JSON.stringify(current));
        }

        if (old.href !== current.href) {
            cb(old, current);
        }

        old = JSON.parse(JSON.stringify(current));
    };

    const handler = setInterval(checkURL, interval);
    return () => {
        clearTimeout(handler);
    };
};