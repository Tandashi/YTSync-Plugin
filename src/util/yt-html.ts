export function createPlusIcon(): JQuery<HTMLElement> {
    return $(`
        <svg
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            class="style-scope yt-icon"
            style="pointer-events: none; display: block; width: 100%; height: 100%;"
        >
            <g class="style-scope yt-icon">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" class="style-scope yt-icon" />
            </g>
        </svg>
    `);
}

export function createLeaveIcon(): JQuery<HTMLElement> {
    return $(`
        <svg
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            class="style-scope yt-icon"
            style="pointer-events: none; display: block; width: 100%; height: 100%;"
        >
            <g class="style-scope yt-icon">
                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" class="style-scope yt-icon" />
            </g>
        </svg>
    `);
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

function createYtRenderedButtonContainer(id: string): JQuery<HTMLElement> {
    return $(`
        <ytd-button-renderer id="${id}" class="style-scope ytd-menu-renderer force-icon-button style-default size-default" button-renderer="" use-keyboard-focused="" is-icon-button="" />
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
export function injectYtRenderedButton(objId: string, containerId: string, text: string, icon: JQuery<HTMLElement>, cb: () => void): void {
    // The complete button needs to be injected exactly like this
    // because when we inject the completely build button
    // YT removes all its content so we need to partially inject
    // everything in order to get it to work
    const container = createYtRenderedButtonContainer(containerId);
    $(objId)
        .append(container);

    const a = document.createElement("a");
    $(a)
        .addClass("yt-simple-endpoint style-scope ytd-button-renderer")
        .attr("tabindex", -1);

    $(container)
        .append(a);

    const iconButton = createYtIconButtonShell();
    const formattedString = createYtFormattedString(cb);
    $(a)
        .append(iconButton)
        .append(formattedString);

    $(formattedString)
        .text(text);

    const iconShell = createYtIconShell();
    $(iconButton).find("button#button")
        .append(iconShell)
        .click(cb);

    $(iconShell)
        .append(icon);
}
