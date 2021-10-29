/**
 * Create a <yt-formatted-string> Shell.
 * Will not contain text since YT deleted it opon inject.
 * Text must be set after injection.
 *
 * @param cb The function that should be called on click
 */
export function createYtFormattedStringShell(cb?: () => void): JQuery<HTMLElement> {
  const formattedText = $(`<yt-formatted-string id="text" class="style-scope style-default size-default" />`);

  if (cb) {
    return formattedText.on('click', cb);
  }

  return formattedText;
}
