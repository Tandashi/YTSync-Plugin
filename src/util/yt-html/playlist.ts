import { InjectAction } from '../../enum/action';
import { injectYtRenderedButton } from './button';
import { createImageSrcObserver } from './image';
import { createYtMenuRendererShell } from './menu';
import { createTrashIcon } from './svg';
import { createPaperTooltipShell } from './tooltip';

const PLAYLIST_CONTAINER_ID = 'playlist';
export const PLAYLIST_CONTAINER_SELECTOR = 'div#secondary #playlist';

/**
 * Create a <ytd-playlist-panel-video-renderer> Shell.
 * Mostly contained in a <ytd-playlist-panel-renderer>.
 * Represents one Video entry in the Playlist Queue.
 *
 * @param videoId The id of the video that this renderer represents
 * @param selected If it is selected
 */
function createYtPlaylistPanelVideoRendererShell(videoId: string, selected: boolean): JQuery<HTMLElement> {
  return $(`
    <ytd-playlist-panel-video-renderer
      id="playlist-items"
      videoId="${videoId}"
      class="style-scope ytd-playlist-panel-renderer"
      lockup=""
      watch-color-update_=""
      can-reorder=""
      touch-persistent-drag-handle=""
      ${selected ? 'selected' : ''}
    />
  `);
}

/**
 * Create a <ytd-playlist-panel-renderer> Shell.
 *
 * @param id The element id
 */
function createYtPlaylistPanelRendererShell(id: string): JQuery<HTMLElement> {
  return $(`
    <ytd-playlist-panel-renderer
      id="${id}"
      class="style-scope ytd-watch-flexy"
      js-panel-height_=""
      has-playlist-buttons=""
      has-toolbar_=""
      playlist-type_="TLPQ",
      style="margin-bottom: var(--ytd-margin-6x)"
    />
  `);
}

/**
 * Inject a empty <ytd-playlist-panel-renderer> Shell.
 * YT will fill it with life automtically after inject and will remove everything inside it first.
 * So inject this first and then fill it with custom content.
 *
 * @param title The title of the Playlist
 * @param description The description of the Playlist
 * @param collapsible If the Playlist should be collapsible
 * @param collapsed If the Playlist should be initially collapsed
 *
 * @return The created <ytd-playlist-panel-renderer>
 */
export function injectEmptyPlaylistShell(title: string, description: string, collapsible: boolean, collapsed: boolean): JQuery<HTMLElement> {
  return injectYtPlaylistPanelRenderer(PLAYLIST_CONTAINER_SELECTOR, PLAYLIST_CONTAINER_ID, title, description, collapsible, collapsed, InjectAction.REPLACE);
}

/**
 * Inject a Video Queue element.
 *
 * @param obj The object the element should be injected as child into. (Most likly "ytd-playlist-panel-renderer #items")
 * @param selected If the element is currently selected
 * @param videoId The videoId of the element
 * @param title The title of the element
 * @param byline The byline of the element
 * @param ccb The function that should be called if the element is clicked
 * @param dcb The function that should be called if the elements delete button is clicked
 *
 * @return The created ytd-playlist-panel-video-renderer>
 */
export function injectYtPlaylistPanelVideoRendererElement(obj: JQuery<Element>, selected: boolean, videoId: string, title: string, byline: string, ccb: () => void, dcb: () => void): JQuery<HTMLElement> {
  const playlistVideoRenderer = createYtPlaylistPanelVideoRendererShell(videoId, selected);
  obj.append(playlistVideoRenderer);

  const menuRenderer = createYtMenuRendererShell();
  playlistVideoRenderer.find('div#menu')
    .append(menuRenderer);

  menuRenderer.find('yt-icon-button#button')
    .attr('hidden', '');

  injectYtRenderedButton(menuRenderer.find('div#top-level-buttons'), 0, '', null, createTrashIcon(), dcb);

  createImageSrcObserver(playlistVideoRenderer, `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);

  playlistVideoRenderer.find('a#wc-endpoint')
    .on('click', ccb);

  playlistVideoRenderer.find('a#thumbnail')
    .on('click', ccb);

  playlistVideoRenderer.find('span#video-title')
    .text(title);

  playlistVideoRenderer.find('span#byline')
    .text(byline);

  const tooltip = createPaperTooltipShell(title);
  playlistVideoRenderer.find('a#wc-endpoint > div#container')
    .append(tooltip);

  return playlistVideoRenderer;
}

/**
 * Inject a Shell <ytd-playlist-panel-renderer> into the given object.
 *
 * @param element The element to inject the <ytd-playlist-panel-renderer>
 * @param id The id of the <ytd-playlist-panel-renderer>
 * @param title The title of the <ytd-playlist-panel-renderer>
 * @param description The description of <ytd-playlist-panel-renderer>
 * @param collapsible If the <ytd-playlist-panel-renderer> should be collapsible
 * @param collapsed If the <ytd-playlist-panel-renderer> should be initally collapsed
 * @param action The method to use to inject the <ytd-playlist-panel-renderer>
 */
export function injectYtPlaylistPanelRenderer(element: string, id: string, title: string, description: string, collapsible: boolean, collapsed: boolean, action: InjectAction): JQuery<HTMLElement> {
  const renderer = createYtPlaylistPanelRendererShell(id);

  switch (action) {
    case InjectAction.APPEND:
      $(element).append(renderer);
      break;
    case InjectAction.REPLACE:
      $(element).replaceWith(renderer);
      break;
  }

  if (!collapsible) {
    renderer
      .removeAttr('collapsible')
      .removeAttr('collapsed');
  }
  else {
    if (!collapsed) {
      $(renderer)
        .removeAttr('collapsed');
    }
  }

  changeYtPlaylistPanelRendererTitle(renderer, title);
  changeYtPlaylistPanelRendererDescription(renderer, description);

  renderer
    .find('div.header')
    .css('padding-bottom', '12px');

  return renderer;
}

/**
 * Change the title of a <ytd-playlist-panel-renderer> Element.
 *
 * @param renderer The <ytd-playlist-panel-renderer> Element
 * @param title The new title text
 */
export function changeYtPlaylistPanelRendererTitle(renderer: JQuery<HTMLElement>, title: string) {
  renderer
    .find('h3 yt-formatted-string')
    .text(title);
}

/**
 * Change the description of a <ytd-playlist-panel-renderer> Element.
 *
 * @param renderer The <ytd-playlist-panel-renderer> Element
 * @param description The new description text
 */
export function changeYtPlaylistPanelRendererDescription(renderer: JQuery<HTMLElement>, description: string): void {
  renderer.find('div.index-message-wrapper span.index-message').text(description);
}
