import IContainer from './container';

import { injectActionLogPanel } from '../util/yt-html/action-log';
import { createYtFormattedStringShell } from '../util/yt-html/string';

export default class ActionLogContainer implements IContainer {
  private actionLogElement: JQuery<Element>;

  create(): void {
    this.actionLogElement = injectActionLogPanel('Action Log', 'All the activity in one place', true, false);
  }

  public addEntry(clientName: string, actionText: string): void {
    const container = $(
      `<div class="style-scope" style="margin: 6px 0px; color: var(--yt-live-chat-secondary-text-color);" />`
    );
    this.actionLogElement.find('#items').append(container);

    const formattedText = createYtFormattedStringShell();
    container.append(formattedText);
    formattedText.append(`<b>${clientName}</b>: ${actionText}</div>`);
  }
}
