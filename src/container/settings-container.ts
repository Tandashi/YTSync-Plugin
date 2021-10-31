import IContainer from './container';
import SyncSocket from '../model/sync-socket';
import { injectSettingsPanel } from '../util/yt-html/settings';
import { setPapperToggleButtonState } from '../util/yt-html/button';
import Store from '../util/store';

export default class SettingsContainer implements IContainer {
  private toggleRefs = {
    autoplay: null,
    showReactions: null,
  };

  private autoplay = true;

  private syncSocket: SyncSocket;

  constructor(syncSocket: SyncSocket) {
    this.syncSocket = syncSocket;
  }

  create(): void {
    injectSettingsPanel(
      'Settings',
      'Customize to fit your experience!',
      true,
      Store.getSettings().collapseStates.settings,
      this.handleCollapseChange.bind(this),
      [
        {
          title: 'Queue Autoplay',
          subtitle: 'If Videos should autoplay',
          initialValue: this.autoplay,
          toggleRef: (ref) => {
            this.toggleRefs.autoplay = ref;
          },
          handler: this.handleAutoplaySetting.bind(this),
        },
        {
          title: 'Show Reactions',
          subtitle: 'Show reactions of others',
          initialValue: Store.getSettings().showReactions,
          toggleRef: (ref) => {
            this.toggleRefs.showReactions = ref;
          },
          handler: this.handleShowReactionSetting.bind(this),
        },
      ]
    );
  }

  private handleCollapseChange(state: boolean) {
    const settings = Store.getSettings();
    settings.collapseStates.settings = state;
    Store.setSettings(settings);
  }

  private handleAutoplaySetting(state: boolean): void {
    this.setAutoplay(state, false, false);
  }

  private handleShowReactionSetting(state: boolean): void {
    const settings = Store.getSettings();
    settings.showReactions = state;
    Store.setSettings(settings);
  }

  /**
   * Set autoplay. Will also update the toggle.
   *
   * @param autoplay
   * @param force If the autoplay should be set even if its not different to the current state.
   *              Might be used to send a initial Message.AUTOPLAY.
   */
  public setAutoplay(autoplay: boolean, force: boolean = false, updateToggleState: boolean = true): void {
    if (this.autoplay === autoplay && !force) return;

    this.autoplay = autoplay;

    if (updateToggleState) {
      setPapperToggleButtonState(this.toggleRefs.autoplay, autoplay);
    }
    this.syncSocket.sendWsAutoplayMessage(this.autoplay);
  }

  public shouldAutoplay(): boolean {
    return this.autoplay;
  }
}
