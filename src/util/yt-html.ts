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

/**
 * Create a <yt-icon> Shell
 */
function createYtIconShell(): JQuery<HTMLElement> {
    return $(`<yt-icon class="style-scope ytd-button-renderer" />`);
}

/**
 * Create a <yt-icon-button> Shell
 */
function createYtIconButtonShell(): JQuery<HTMLElement> {
    return $(`<yt-icon-button class="style-scope ytd-button-renderer style-default size-default" id="button">`);
}

/**
 * Create a <yt-fomratted-string> Shell.
 * Will not contain text since YT deleted it opon inject.
 * Text must be set after injection.
 *
 * @param cb The function that should be called on click
 */
function createYtFormattedStringShell(cb: () => void): JQuery<HTMLElement> {
    return $(`<yt-formatted-string id="text" class="style-scope ytd-button-renderer style-default size-default" />`)
        .click(cb);
}

/**
 * Create a <a class="yt-simple-endoint"> Shell
 */
function createYtSimpleEndpointShell(): JQuery<HTMLElement> {
    return $(`
        <a class="yt-simple-endpoint style-scope ytd-button-renderer" tabindex="-1">
    `);
}

/**
 * Create a <ytd-button-renderer> Shell
 *
 * @param id The id of the renderer
 * @param hasText If the renderer can contain text or not
 */
function createYtIconButtonRendererShell(id: string, hasText: boolean): JQuery<HTMLElement> {
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
 * Create a <ytd-menu-renderer> Shell
 */
function createYtMenuRendererShell(): JQuery<HTMLElement> {
    return $(`
        <ytd-menu-renderer class="style-scope ytd-playlist-panel-video-renderer">
    `);
}

/**
 * Create a <ytd-playlist-panel-video-renderer> Shell.
 * Mostly contained in a <ytd-playlist-panel-renderer>.
 * Represents one Video entry in the Playlist Queue.
 *
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
 * Create a <ytd-playlist-panel-renderer>
 */
function createYtPlaylistPanelRendererShell(): JQuery<HTMLElement> {
    return $(`
        <ytd-playlist-panel-renderer
            id="playlist"
            class="style-scope ytd-watch-flexy"
            js-panel-height_=""
            has-playlist-buttons=""
            has-toolbar_=""
            playlist-type_="TLPQ",
            collapsible=""
            collapsed=""
        />
    `);
}

/**
 * Inject a <ytd-button-renderer> into an object
 *
 * @param objId The Id of the object the YtRenderedButton should be injected to
 * @param text The text of the button
 * @param icon The icon of the button (needs to be a svg Element)
 * @param cb The function that should be called on button click
 *
 * @returns The created <ytd-button-renderer>
 */
export function injectYtRenderedButton(objId: JQuery<Element>, containerId: string, text: string | null, icon: JQuery<HTMLElement>, cb: () => void): JQuery<HTMLElement> {
    // The complete button needs to be injected exactly like this
    // because when we inject the completely build button
    // YT removes all its content so we need to partially inject
    // everything in order to get it to work
    const hasText = text !== '' && text !== null;

    const container = createYtIconButtonRendererShell(containerId, hasText);
    $(objId)
        .append(container);

    const a = createYtSimpleEndpointShell();
    $(container)
        .append(a);

    const iconButton = createYtIconButtonShell();

    const formattedString = hasText ? createYtFormattedStringShell(cb) : null;
    $(a)
        .append(iconButton)
        .append(formattedString);

    if (hasText) {
        $(formattedString)
            .text(text);
    }

    const iconShell = createYtIconShell();
    $(iconButton).find('button#button')
        .append(iconShell)
        .click(cb);

    $(iconShell)
        .append(icon);

    return container;
}

/**
 * Remove the Upnext Entry on the side.
 */
export function removeUpnext(): void {
    $('ytd-compact-autoplay-renderer.ytd-watch-next-secondary-results-renderer').remove();
}

/**
 * Inject a Video Queue element
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
export function injectVideoQueueElement(obj: JQuery<Element>, selected: boolean, videoId: string, title: string, byline: string, ccb: () => void, dcb: () => void): JQuery<HTMLElement> {
    const playlistVideoRenderer = createYtPlaylistPanelVideoRendererShell(videoId, selected);
    $(obj)
        .append(playlistVideoRenderer);

    const menuRenderer = createYtMenuRendererShell();
    $(playlistVideoRenderer).find('div#menu')
        .append(menuRenderer);

    $(menuRenderer).find('yt-icon-button#button')
        .attr('hidden', '');

    injectYtRenderedButton($(menuRenderer).find('div#top-level-buttons'), '', null, createTrashIcon(), dcb);

    const img = $(playlistVideoRenderer).find('img#img');
    const imgURL = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    img.attr('src', imgURL);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const newImg = $(playlistVideoRenderer).find('img#img');
            if (mutation.type === 'attributes' && newImg.attr('src') !== imgURL) {
                img.attr('src', imgURL);

                $(playlistVideoRenderer).find('a#thumbnail > yt-img-shadow')
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

    $(playlistVideoRenderer).find('a#wc-endpoint')
        .click(ccb);

    $(playlistVideoRenderer).find('a#thumbnail')
        .click(ccb);

    $(playlistVideoRenderer).find('span#video-title')
        .text(title);

    $(playlistVideoRenderer).find('span#byline')
        .text(byline);

    return playlistVideoRenderer;
}

/**
 * Inject a empty <ytd-playlist-panel-renderer> Shell.
 * YT will fill it with life automtically after inject and will remove everything inside it first.
 * So inject this first and then fill it with custom content.
 *
 * @param title The title of the Playlist
 * @param collapsible If the Playlist should be collapsible
 * @param collapsed If the Playlist should be initially collapsed
 *
 * @return The created <ytd-playlist-panel-renderer>
 */
export function injectEmptyQueueShell(title: string, collapsible: boolean, collapsed: boolean): JQuery<HTMLElement> {
    const renderer = createYtPlaylistPanelRendererShell();
    $('div#secondary #playlist')
        .replaceWith(renderer);

    if(!collapsible) {
        $(renderer)
            .removeAttr('collapsible')
            .removeAttr('collapsed');
    }
    else {
        if(!collapsed) {
            $(renderer)
                .removeAttr('collapsed');
        }
    }

    $('div#secondary #playlist h3 yt-formatted-string')
        .text(title);

    return renderer;
}