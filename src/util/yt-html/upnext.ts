/**
 * Remove the Upnext section and disable autoplay.
 */
export function  removeUpnext(): void {
  const handle = setInterval(() => {
    const container = $('ytd-compact-autoplay-renderer.ytd-watch-next-secondary-results-renderer');
    if (container && container.length === 1) {
      const autoplayButton = container.find('paper-toggle-button');

      if (autoplayButton && autoplayButton.attr('active') === '') {
        autoplayButton.trigger('click');
      }

      container.remove();
      clearInterval(handle);
    }
  }, 200);
}
