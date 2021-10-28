import { createPaperToggleButtonShell } from './button';
import { injectEmptyPlaylistShell } from './playlist';
import { createPaperTooltipShell } from './tooltip';

export const AUTOPLAY_TOGGLE_ID = 'autoplay-toggle';

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
export function injectEmptyQueueShell(
  title: string,
  description: string,
  collapsible: boolean,
  collapsed: boolean,
  cb: (state: boolean) => void
): JQuery<HTMLElement> {
  const renderer = injectEmptyPlaylistShell(title, description, collapsible, collapsed);

  const autoplayToggle = createPaperToggleButtonShell(AUTOPLAY_TOGGLE_ID);
  // autoplayButton.off();
  // Set onClick to report to callback
  autoplayToggle.on('click', () => {
    cb(autoplayToggle.attr('active') === '');
  });

  autoplayToggle.on('tap', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  });

  const autoplayTooltip = createPaperTooltipShell('Autoplay');

  renderer.find('#top-row-buttons').append(autoplayToggle).append(autoplayTooltip);

  return renderer;
}
