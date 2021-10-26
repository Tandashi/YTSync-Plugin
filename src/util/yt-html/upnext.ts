/**
 * Remove the Upnext section and disable autoplay.
 */
export function removeUpnext(): void {
  const handle = setInterval(() => {
    const container = $('ytd-compact-autoplay-renderer.ytd-watch-next-secondary-results-renderer');
    if (container && container.length === 1) {
      container.remove();
      clearInterval(handle);
    }
  }, 200);
}
