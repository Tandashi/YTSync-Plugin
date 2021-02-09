/**
 * Create a SVG
 *
 * @param d The SVG <path> commands
 */
function createSvg(d: string): JQuery<HTMLElement> {
  return $(`
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      class="style-scope yt-icon"
      style="pointer-events: none; display: block; width: 100%; height: 100%;"
    >
      <g class="style-scope yt-icon">
        <path d="${d}" class="style-scope yt-icon" />
      </g>
    </svg>
  `);
}

/**
 * Create a Plus SVG Icon
 */
export function createPlusIcon(): JQuery<HTMLElement> {
  return createSvg('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z');
}

/**
 * Create a Leave SVG Icon
 */
export function createLeaveIcon(): JQuery<HTMLElement> {
  return createSvg('M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z');
}

/**
 * Create a Trash SVG Icon
 */
export function createTrashIcon(): JQuery<HTMLElement> {
  return createSvg('M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z');
}