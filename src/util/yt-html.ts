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

export function createPlusIcon(): JQuery<HTMLElement> {
    return createSvg("M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z");
}

export function createLeaveIcon(): JQuery<HTMLElement> {
    return createSvg("M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z");
}

export function createTrashIcon(): JQuery<HTMLElement> {
    return createSvg("M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z");
}

function createYtIconShell(): JQuery<HTMLElement> {
    return $(`<yt-icon class="style-scope ytd-button-renderer" />`);
}

function createYtIconButtonShell(): JQuery<HTMLElement> {
    return $(`<yt-icon-button class="style-scope ytd-button-renderer style-default size-default" id="button">`);
}

function createYtFormattedString(cb: () => void): JQuery<HTMLElement> {
    return $(`<yt-formatted-string id="text" class="style-scope ytd-button-renderer style-default size-default" />`)
        .click(cb);
}

function createYtSimpleEndpoint(): JQuery<HTMLElement> {
    return $(`
        <a class="yt-simple-endpoint style-scope ytd-button-renderer" tabindex="-1">
    `);
}

function createYtIconButtonRenderer(id: string, hasText: boolean): JQuery<HTMLElement> {
    return $(`
        <ytd-button-renderer
            id="${id}"
            class="style-scope ytd-menu-renderer force-icon-button style-default size-default"
            button-renderer=""
            use-keyboard-focused=""
            is-icon-button=""
            ${!hasText ? "has-no-text" : ""}
        />
    `);
}

function createYtMenuRenderer(): JQuery<HTMLElement> {
    return $(`
        <ytd-menu-renderer class="style-scope ytd-playlist-panel-video-renderer">
    `);
}

function createYtPlaylistPanelVideoRenderer(selected: boolean): JQuery<HTMLElement> {
    return $(`
        <ytd-playlist-panel-video-renderer
            id="playlist-items"
            class="style-scope ytd-playlist-panel-renderer"
            lockup=""
            watch-color-update_=""
            can-reorder=""
            touch-persistent-drag-handle=""
            ${selected ? 'selected' : ''}
        />
    `);
}

function createYtPlaylistPanelRenderer(): JQuery<HTMLElement> {
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
 * Inject a YtRenderedButton into an object
 *
 * @param objId The Id of the object the YtRenderedButton should be injected to
 * @param text The text of the button
 * @param icon The icon of the button (needs to be a svg Element)
 * @param cb The function that should be called on button click
 */
export function injectYtRenderedButton(objId: JQuery<Element>, containerId: string, text: string | null, icon: JQuery<HTMLElement>, cb: () => void): void {
    // The complete button needs to be injected exactly like this
    // because when we inject the completely build button
    // YT removes all its content so we need to partially inject
    // everything in order to get it to work
    const hasText = text !== "" && text !== null;

    const container = createYtIconButtonRenderer(containerId, hasText);
    $(objId)
        .append(container);

    const a = createYtSimpleEndpoint();
    $(container)
        .append(a);

    const iconButton = createYtIconButtonShell();

    const formattedString = hasText ? createYtFormattedString(cb) : null;
    $(a)
        .append(iconButton)
        .append(formattedString);

    if (hasText) {
        $(formattedString)
            .text(text);
    }

    const iconShell = createYtIconShell();
    $(iconButton).find("button#button")
        .append(iconShell)
        .click(cb);

    $(iconShell)
        .append(icon);
}

export function removeUpnext(): void {
    $('ytd-compact-autoplay-renderer.ytd-watch-next-secondary-results-renderer').remove();
}

export function injectVideoQueueElement(obj: JQuery<Element>, selected: boolean, videoId: string, title: string, byline: string, ccb: () => void, dcb: () => void): JQuery<HTMLElement> {
    const playlistVideoRenderer = createYtPlaylistPanelVideoRenderer(selected);
    $(obj)
        .append(playlistVideoRenderer);

    const menuRenderer = createYtMenuRenderer();
    $(playlistVideoRenderer).find('div#menu')
        .append(menuRenderer);

    $(menuRenderer).find('yt-icon-button#button')
        .attr('hidden', '');

    injectYtRenderedButton($(menuRenderer).find('div#top-level-buttons'), "", null, createTrashIcon(), dcb);

    $(playlistVideoRenderer).find('a#thumbnail > yt-img-shadow')
        .css('background-color', 'transparent')
        .removeClass('empty');

    setTimeout(() => {
        $(playlistVideoRenderer).find('img#img')
            .attr('src', `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);

        $(playlistVideoRenderer).find('a#thumbnail > yt-img-shadow')
            .attr('loaded');
    }, 500);

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

export function injectEmptyQueueShell(title: string, collapsible: boolean, collapsed: boolean): JQuery<HTMLElement> {
    const renderer = createYtPlaylistPanelRenderer();
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