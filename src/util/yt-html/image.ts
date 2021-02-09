/**
 * Create a Observer that observes the src attribute of the img#img of the provided renderer.
 * This is needed in some casese because YouTube removes images sometimes.
 *
 * @param renderer The renderer whos image should be observed
 * @param imgUrl The url of the image
 */
export function createImageSrcObserver(renderer: JQuery<Element>, imgUrl: string) {
  const img = renderer.find('img#img');
  img.attr('src', imgUrl);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const newImg = renderer.find('img#img');
      if (mutation.type === 'attributes' && newImg.attr('src') !== imgUrl) {
        img.attr('src', imgUrl);

        renderer.find('yt-img-shadow')
          .off()
          .css('background-color', 'transparent')
          .attr('loaded', '')
          .removeClass('empty');
      }
    });
  });

  observer.observe(img.get(0), {
    attributes: true
  });
}