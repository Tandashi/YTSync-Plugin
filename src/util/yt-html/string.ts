/**
 * Create a <yt-formatted-string> Shell.
 * Will not contain text since YT deleted it opon inject.
 * Text must be set after injection.
 *
 * @param cb The function that should be called on click
 */
export function createYtFormattedStringShell(cb: () => void): JQuery<HTMLElement> {
  return $(`<yt-formatted-string id="text" class="style-scope ytd-button-renderer style-default size-default" />`)
    .on('click', cb);
}