import anime from 'animejs';
import IContainer from './container';
import SyncSocket from '../model/sync-socket';
import Store from '../util/store';

import { Reactions } from '../util/consts';
import { injectReactionsPanel, getReactionId } from '../util/yt-html/reaction';

export default class ReactionsContainer implements IContainer {
  private currentAnimation: anime.AnimeInstance = null;

  private syncSocket: SyncSocket;

  constructor(syncSocket: SyncSocket) {
    this.syncSocket = syncSocket;
  }

  create(): void {
    injectReactionsPanel(
      'Reactions',
      'Find it funny? React!',
      Reactions,
      (reaction: Reaction) => {
        this.syncSocket.sendWsReactionMessage(reaction);

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
      true,
      Store.getSettings().collapseStates.reactions,
      this.handleCollapseChange.bind(this)
    );
  }

  private handleCollapseChange(state: boolean) {
    const settings = Store.getSettings();
    settings.collapseStates.reactions = state;
    Store.setSettings(settings);
  }
}
