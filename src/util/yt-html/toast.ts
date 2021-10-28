interface YTPaperToast extends JQuery<Element> {
  open(): void;
  close(): void;
}

function injectToastContainer(popupContainer: JQuery<Element>): void {
  const notificationActionRenderer = $(`
    <yt-notification-action-renderer class="style-scope ytd-popup-container" tabindex="-1">
    </yt-notification-action-renderer>
  `);
  popupContainer.append(notificationActionRenderer);
}

function getToastContainer(): YTPaperToast {
  const popupContainer = $('ytd-popup-container');

  let toastContainer = popupContainer.find('tp-yt-paper-toast') as unknown as YTPaperToast;

  if (toastContainer.length === 0) {
    injectToastContainer(popupContainer);
    toastContainer = popupContainer.find('tp-yt-paper-toast') as unknown as YTPaperToast;
  }

  return toastContainer;
}

/**
 * Create a <tp-yt-paper-toast> Shell.
 *
 * @param text The toast text
 * @param subtext The subtext for the toast
 */
export function createToast(text: string, subtext: string = ''): void {
  const toastContainer = getToastContainer();
  const toastTextContainer = toastContainer.find('yt-formatted-string#text');
  const toastSubTextContainer = toastContainer.find('yt-formatted-string#sub-text');

  toastTextContainer.text(text);
  toastSubTextContainer.text(subtext);

  (toastContainer.get(0) as unknown as YTPaperToast).open();
}
