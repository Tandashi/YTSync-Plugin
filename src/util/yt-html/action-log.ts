import { InjectAction } from '../../enum/action';
import { injectYtPlaylistPanelRenderer } from './playlist';

const ACTION_LOG_CONTAINER_ID = 'action-log';
export const ACTION_LOG_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';

export function injectActionLogPanel(
  title: string,
  description: string,
  collapsible: boolean,
  collapsed: boolean
): JQuery<HTMLElement> {
  const renderer = injectYtPlaylistPanelRenderer(
    ACTION_LOG_CONTAINER_SELECTOR,
    ACTION_LOG_CONTAINER_ID,
    title,
    description,
    collapsible,
    collapsed,
    InjectAction.APPEND
  );

  const items = renderer.find('#items');
  items.css('padding', '0 5%');

  return renderer;
}
