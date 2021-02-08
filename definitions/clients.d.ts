interface Client {
  socketId: string;
  name: string;
  role: string;
}

interface RenderClient {
  client: Client;
  prefix?: string;
  sufix?: string;
  badges: Badge[]
}

interface Badge {
  id: string;
  onClick: () => void;
}