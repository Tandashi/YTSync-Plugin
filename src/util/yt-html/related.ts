/**
 * Removes the related section.
 */
export function removeRelated(): void {
  const handle = setInterval(() => {
    const container = $('#related');
    if (container && container.length === 1) {
      container.remove();
      clearInterval(handle);
    }
  }, 200);
}
