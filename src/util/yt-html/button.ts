import { createYtSimpleEndpointShell } from './endpoint';
import { createYtIconShell } from './icon';
import { createYtFormattedStringShell } from './string';

/**
 * Create a <paper-toggle-button> Shell.
 *
 * @param id The id that this toggle should get
 */
export function createPaperToggleButtonShell(id: string): JQuery<HTMLElement> {
  return $(`
      <tp-yt-paper-toggle-button
        id="${id}"
      />
    `);
}

/**
 * Set toggle state of a toggle button.
 *
 * @param button The toggle button
 * @param state The state to set
 */
export function setPapperToggleButtonState(button: JQuery<Element>, state: boolean): void {
  state ? button.attr('active', '') : button.removeAttr('active');
}

/**
 * Get the current state of the given button.
 *
 * @param button The button whos state should be checked
 */
export function getPapperToggleButtonState(button: JQuery<Element>): boolean {
  return button.attr('active') === '';
}

/**
 * Create a <ytd-button-renderer> Shell
 *
 * @param id The id of the renderer
 * @param hasText If the renderer can contain text or not
 */
export function createYtIconButtonRendererShell(id: string, hasText: boolean): JQuery<HTMLElement> {
  return $(`
      <ytd-button-renderer
        id="${id}"
        class="style-scope ytd-menu-renderer force-icon-button style-default size-default"
        button-renderer=""
        use-keyboard-focused=""
        is-icon-button=""
        ${!hasText ? 'has-no-text' : ''}
      />
    `);
}

/**
 * Create a <yt-icon-button> Shell
 */
export function createYtIconButtonShell(): JQuery<HTMLElement> {
  return $(`<yt-icon-button class="style-scope ytd-button-renderer style-default size-default" id="button">`);
}

/**
 * Inject a <ytd-button-renderer> into an object.
 *
 * @param objId The Id of the object the YtRenderedButton should be injected to
 * @param insertAfter The index of the object we want to inject the button after
 * @param containerId The Id the container should get
 * @param text The text of the button
 * @param icon The icon of the button (needs to be a svg Element)
 * @param cb The function that should be called on button click
 *
 * @returns The created <ytd-button-renderer>
 */
export function injectYtRenderedButton(
  objId: JQuery<Element>,
  insertAfter: number,
  containerId: string,
  text: string | null,
  icon: JQuery<HTMLElement>,
  cb: () => void
): JQuery<HTMLElement> {
  // The complete button needs to be injected exactly like this
  // because when we inject the completely build button
  // YT removes all its content so we need to partially inject
  // everything in order to get it to work
  const hasText = text !== '' && text !== null;

  const container = createYtIconButtonRendererShell(containerId, hasText);
  if (objId.children().length < insertAfter + 1) {
    objId.append(container);
  } else {
    objId.children().eq(insertAfter).after(container);
  }

  const endpoint = createYtSimpleEndpointShell();
  container.append(endpoint);

  const iconButton = createYtIconButtonShell();
  const formattedString = hasText ? createYtFormattedStringShell(cb) : null;
  endpoint.append(iconButton).append(formattedString);

  if (hasText) {
    formattedString.text(text);
  }

  const iconShell = createYtIconShell();
  iconButton.find('button#button').append(iconShell).on('click', cb);

  iconShell.append(icon);

  container.on('tap', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  });

  return container;
}
