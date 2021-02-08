interface PlayerOptions {
  connection: ServerConnectionOptions;
}

interface ServerConnectionOptions {
  protocol: string;
  host: string;
  port: string;
}