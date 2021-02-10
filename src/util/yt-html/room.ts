import { InjectAction } from '../../enum/action';
import { createPaperToggleButtonShell } from './button';
import { injectYtPlaylistPanelRenderer } from './playlist';
import { createPaperTooltipShell } from './tooltip';

const ROOM_INFO_CONTAINER_ID = 'room-info';

export const AUTOPLAY_TOGGLE_ID = 'autoplay-toggle';
const AUTOPLAY_TOGGLE_TOOLTIP_ID = 'autoplay-toggle-tooltip';

export const ROOM_INFO_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';

/**
 * Inject a empty room info shell using a <ytd-playlist-panel-renderer>.
 *
 * @param title The title of the room info panel
 * @param description The description of the room info panel
 * @param collapsible If the room info should be collapsible
 * @param collapsed If the room info should be initally collapsed
 * @param cb The function that should be called when the autoplay toggle gets clicked
 *
 * @return The created <ytd-playlist-panel-renderer>
 */
export function injectEmptyRoomInfoShell(title: string, description: string, collapsible: boolean, collapsed: boolean, cb: (state: boolean) => void): JQuery<HTMLElement> {
  const renderer = injectYtPlaylistPanelRenderer(ROOM_INFO_CONTAINER_SELECTOR, ROOM_INFO_CONTAINER_ID, title, description, collapsible, collapsed, InjectAction.APPEND);

  const autoplayToggle = createPaperToggleButtonShell(AUTOPLAY_TOGGLE_ID);
  // autoplayButton.off();
  // Set onClick to report to callback
  autoplayToggle.click(() => {
    cb(autoplayToggle.attr('active') === '');
  });

  const autoplayTooltip = createPaperTooltipShell(AUTOPLAY_TOGGLE_TOOLTIP_ID, AUTOPLAY_TOGGLE_ID, 'Autoplay');

  renderer
    .find('#top-row-buttons')
    .append(autoplayToggle)
    .append(autoplayTooltip);

  return renderer;
}