interface Reaction {
  id: string;
  symbol: string;
  tooltip: string;
  text: string;
}

interface Settings {
  showReactions: boolean;
  collapseStates: {
    queue: boolean;
    actionLog: boolean;
    roomInfo: boolean;
    reactions: boolean;
    settings: boolean;
  };
}
