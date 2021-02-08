import { InjectAction } from '../enum/action';
import {
  QUEUE_CONTAINER_SELECTOR,
  ROOM_INFO_CONTAINER_SELECTOR,
  REACTIONS_CONTAINER_SELECTOR,
  REACTION_TIME_TILL_REMOVE,
  REACTION_FADE_IN_TIME,
  getReactionId,
  getReactionTooltipId,
  REACTION_OVERLAY_ID,
  ROOM_INFO_CONTAINER_ID,
  AUTOPLAY_TOGGLE_ID,
  AUTOPLAY_TOGGLE_TOOLTIP_ID,
  REACTION_TOGGLE_ID,
  REACTION_TOGGLE_TOOLTIP_ID,
  REACTION_CONTAINER_ID,
  QUEUE_CONTAINER_ID
} from './consts';

export default class YTHTMLUtil {
  /**
   * Create a SVG
   *
   * @param d The SVG <path> commands
   */
  private static createSvg(d: string): JQuery<HTMLElement> {
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
  public static createPlusIcon(): JQuery<HTMLElement> {
    return YTHTMLUtil.createSvg('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z');
  }

  /**
   * Create a Leave SVG Icon
   */
  public static createLeaveIcon(): JQuery<HTMLElement> {
    return YTHTMLUtil.createSvg('M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z');
  }

  /**
   * Create a Trash SVG Icon
   */
  public static createTrashIcon(): JQuery<HTMLElement> {
    return YTHTMLUtil.createSvg('M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z');
  }

  /**
   * Create a <yt-icon> Shell
   */
  private static createYtIconShell(): JQuery<HTMLElement> {
    return $(`<yt-icon class="style-scope ytd-button-renderer" />`);
  }

  /**
   * Create a <yt-icon-button> Shell
   */
  private static createYtIconButtonShell(): JQuery<HTMLElement> {
    return $(`<yt-icon-button class="style-scope ytd-button-renderer style-default size-default" id="button">`);
  }

  private static createReaction(reaction: Reaction): JQuery<HTMLElement> {
    const id = getReactionId(reaction);
    const tooltip = YTHTMLUtil.createPaperTooltipShell(getReactionTooltipId(reaction), id, reaction.tooltip);

    return $(`
      <div style="justify-content: center; display: inline-flex; cursor: pointer;" >
        <div id="${id}"
            style="font-size: 24px; margin: 4px;"
        >
          ${reaction.symbol}
        </div>
      </div>
    `).append(tooltip);
  }

  private static createReactionChip(text: string, symbol: string): JQuery<HTMLElement> {
    if (text !== '') {
      return $(`
        <div
          style="
            opacity: 0.0;
            padding: 0 24px;
            margin: 20px;
            height: 28px;
            font-size: 16px;
            line-height: 24px;
            border-radius: 25px;
            background-color: #f1f1f1;
          "
        >
          <div style="
              float: left;
              margin: 0 10px 0 -25px;
              height: 24px;
              width: 30px;
              border-radius: 50%;
              font-size: 24px;"
          >
            ${symbol}
          </div>
          ${text}
        </div>
      `);
    }

    return $(`
      <div style="
        margin: 10px;
        height: 24px;
        width: 30px;
        border-radius: 50%;
        font-size: 24px;"
      >
        ${symbol}
      </div>
    `);
  }

  private static createReactionOverlay(): JQuery<HTMLElement> {
    return $(`
      <div
        id="${REACTION_OVERLAY_ID}"
        style="
          position: relative;
          float: right;
          color: #000;
          z-index: 2;
        "
      />
    `);
  }

  public static addReaction(reaction: Reaction): JQuery<HTMLElement> {
    const renderer = YTHTMLUtil.createReactionChip(reaction.text, reaction.symbol);
    $(`#${REACTION_OVERLAY_ID}`)
      .append(renderer);

    renderer.
      animate({ opacity: 1 }, REACTION_FADE_IN_TIME);

    setTimeout(() => renderer.remove(), REACTION_TIME_TILL_REMOVE);
    renderer.click(() => renderer.remove());

    return renderer;
  }

  /**
   * Create a <yt-fomratted-string> Shell.
   * Will not contain text since YT deleted it opon inject.
   * Text must be set after injection.
   *
   * @param cb The function that should be called on click
   */
  private static createYtFormattedStringShell(cb: () => void): JQuery<HTMLElement> {
    return $(`<yt-formatted-string id="text" class="style-scope ytd-button-renderer style-default size-default" />`)
      .click(cb);
  }

  /**
   * Create a <a class="yt-simple-endoint"> Shell.
   */
  private static createYtSimpleEndpointShell(): JQuery<HTMLElement> {
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
  private static createYtIconButtonRendererShell(id: string, hasText: boolean): JQuery<HTMLElement> {
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
  private static createYtMenuRendererShell(): JQuery<HTMLElement> {
    return $(`
      <ytd-menu-renderer class="style-scope ytd-playlist-panel-video-renderer">
    `);
  }

  /**
   * Create a <ytd-playlist-panel-video-renderer> Shell.
   * Mostly contained in a <ytd-playlist-panel-renderer>.
   * Represents one Video entry in the Playlist Queue.
   *
   * @param videoId The id of the video that this renderer represents
   * @param selected If it is selected
   */
  private static createYtPlaylistPanelVideoRendererShell(videoId: string, selected: boolean): JQuery<HTMLElement> {
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
   * Create a <ytd-playlist-panel-renderer> Shell.
   *
   * @param id The element id
   */
  private static createYtPlaylistPanelRendererShell(id: string): JQuery<HTMLElement> {
    return $(`
      <ytd-playlist-panel-renderer
        id="${id}"
        class="style-scope ytd-watch-flexy"
        js-panel-height_=""
        has-playlist-buttons=""
        has-toolbar_=""
        playlist-type_="TLPQ",
        style="margin-bottom: var(--ytd-margin-6x)"
      />
    `);
  }

  /**
   * Create a <yt-live-chat-participant-renderer> Shell.
   * Will not contain any text. Text must be set after injection.
   *
   * @param socketId The id of the socket that this renderer represents
   */
  private static createYtLiveChatParticipantRendererShell(socketId: string): JQuery<HTMLElement> {
    return $(`
      <yt-live-chat-participant-renderer
        socketId="${socketId}"
      />
    `);
  }

  /**
   * Create a <yt-live-chat-author-badge-renderer> Shell.
   */
  private static createYtLiveChatAuthorBadgeRendererShell() {
    return $(`
      <yt-live-chat-author-badge-renderer class="style-scope yt-live-chat-author-chip" style="margin-left: 10px"/>
    `);
  }

  /**
   * Create a <paper-tooltip> Shell. You still need to set the Text inside!
   *
   * @param id The tooltip Id
   * @param forId The element Id the tooltip is for
   * @param text The tooltip text
   */
  private static createPaperTooltipShell(id: string, forId: string, text: string): JQuery<HTMLElement> {
    return $(`
      <paper-tooltip id="${id}" for="${forId}">
        ${text}
      </paper-tooltip>
    `);
  }

  /**
   * Create a <paper-toggle-button> Shell.
   *
   * @param id The id that this toggle should get
   */
  private static createPaperToggleButtonShell(id: string): JQuery<HTMLElement> {
    return $(`
      <paper-toggle-button
        id="${id}"
      />
    `);
  }

  /**
   * Set toggle state of a toggle button.
   *
   * @param button The toggle button
   * @param state The state to set
   */
  public static setPapperToggleButtonState(button: JQuery<Element>, state: boolean): void {
    state ? button.attr('active', '') : button.removeAttr('active');
  }

  /**
   * Get the current state of the given button.
   *
   * @param button The button whos state should be checked
   */
  public static getPapperToggleButtonState(button: JQuery<Element>): boolean {
    return button.attr('active') === '';
  }

  /**
   * Inject a <ytd-button-renderer> into an object.
   *
   * @param objId The Id of the object the YtRenderedButton should be injected to
   * @param insertAfter The index of the object we want to inject the button after
   * @param containerId The Id the container should get
   * @param text The text of the button
   * @param icon The icon of the button (needs to be a svg Element)
   * @param cb The function that should be called on button click
   *
   * @returns The created <ytd-button-renderer>
   */
  public static injectYtRenderedButton(objId: JQuery<Element>, insertAfter: number, containerId: string, text: string | null, icon: JQuery<HTMLElement>, cb: () => void): JQuery<HTMLElement> {
    // The complete button needs to be injected exactly like this
    // because when we inject the completely build button
    // YT removes all its content so we need to partially inject
    // everything in order to get it to work
    const hasText = text !== '' && text !== null;

    const container = YTHTMLUtil.createYtIconButtonRendererShell(containerId, hasText);
    if (objId.children().length < insertAfter + 1) {
      objId.append(container);
    }
    else {
      objId.children().eq(insertAfter).after(container);
    }

    const endpoint = YTHTMLUtil.createYtSimpleEndpointShell();
    container.append(endpoint);

    const iconButton = YTHTMLUtil.createYtIconButtonShell();
    const formattedString = hasText ? YTHTMLUtil.createYtFormattedStringShell(cb) : null;
    endpoint
      .append(iconButton)
      .append(formattedString);

    if (hasText) {
      formattedString
        .text(text);
    }

    const iconShell = YTHTMLUtil.createYtIconShell();
    iconButton.find('button#button')
      .append(iconShell)
      .on('click', cb);

    iconShell
      .append(icon);

    return container;
  }

  /**
   * Remove the Upnext section and disable autoplay.
   */
  public static removeUpnext(): void {
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

  /**
   * Removes the related section.
   */
  public static removeRelated(): void {
    const handle = setInterval(() => {
      const container = $('#related');
      if (container && container.length === 1) {
        container.remove();
        clearInterval(handle);
      }
    }, 200);
  }

  /**
   * Inject a Video Queue element.
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
  public static injectYtPlaylistPanelVideoRendererElement(obj: JQuery<Element>, selected: boolean, videoId: string, title: string, byline: string, ccb: () => void, dcb: () => void): JQuery<HTMLElement> {
    const playlistVideoRenderer = YTHTMLUtil.createYtPlaylistPanelVideoRendererShell(videoId, selected);
    obj.append(playlistVideoRenderer);

    const menuRenderer = YTHTMLUtil.createYtMenuRendererShell();
    playlistVideoRenderer.find('div#menu')
      .append(menuRenderer);

    menuRenderer.find('yt-icon-button#button')
      .attr('hidden', '');

    YTHTMLUtil.injectYtRenderedButton(menuRenderer.find('div#top-level-buttons'), 0, '', null, YTHTMLUtil.createTrashIcon(), dcb);

    YTHTMLUtil.createImageSrcObserver(playlistVideoRenderer, `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);

    playlistVideoRenderer.find('a#wc-endpoint')
      .click(ccb);

    playlistVideoRenderer.find('a#thumbnail')
      .click(ccb);

    playlistVideoRenderer.find('span#video-title')
      .text(title);

    playlistVideoRenderer.find('span#byline')
      .text(byline);

    const tooltip = YTHTMLUtil.createPaperTooltipShell(`${videoId}-tooltip`, 'meta', title);
    playlistVideoRenderer.find('a#wc-endpoint > div#container')
      .append(tooltip);

    return playlistVideoRenderer;
  }

  /**
   * Inject a empty <ytd-playlist-panel-renderer> Shell.
   * YT will fill it with life automtically after inject and will remove everything inside it first.
   * So inject this first and then fill it with custom content.
   *
   * @param title The title of the Playlist
   * @param description The description of the Playlist
   * @param collapsible If the Playlist should be collapsible
   * @param collapsed If the Playlist should be initially collapsed
   *
   * @return The created <ytd-playlist-panel-renderer>
   */
  public static injectEmptyQueueShell(title: string, description: string, collapsible: boolean, collapsed: boolean): JQuery<HTMLElement> {
    return YTHTMLUtil.injectYtPlaylistPanelRenderer(QUEUE_CONTAINER_SELECTOR, QUEUE_CONTAINER_ID, title, description, collapsible, collapsed, InjectAction.REPLACE);
  }

  /**
   * Inject a empty room info shell using a <ytd-playlist-panel-renderer>.
   *
   * @param title The title of the room info panel
   * @param description The description of the room info panel
   * @param collapsible If the room info should be collapsible
   * @param collapsed If the room info should be initally collapsed
   * @param cb The function that should be called when the autoplay toggle gets clicked
   *
   * @return The created <ytd-playlist-panel-renderer>
   */
  public static injectEmptyRoomInfoShell(title: string, description: string, collapsible: boolean, collapsed: boolean, cb: (state: boolean) => void): JQuery<HTMLElement> {
    const renderer = YTHTMLUtil.injectYtPlaylistPanelRenderer(ROOM_INFO_CONTAINER_SELECTOR, ROOM_INFO_CONTAINER_ID, title, description, collapsible, collapsed, InjectAction.APPEND);

    const autoplayToggle = YTHTMLUtil.createPaperToggleButtonShell(AUTOPLAY_TOGGLE_ID);
    // autoplayButton.off();
    // Set onClick to report to callback
    autoplayToggle.click(() => {
      cb(autoplayToggle.attr('active') === '');
    });

    const autoplayTooltip = YTHTMLUtil.createPaperTooltipShell(AUTOPLAY_TOGGLE_TOOLTIP_ID, AUTOPLAY_TOGGLE_ID, 'Autoplay');

    renderer
      .find('#top-row-buttons')
      .append(autoplayToggle)
      .append(autoplayTooltip);

    return renderer;
  }

  /**
   * Inject a reactions panel using a <ytd-playlist-panel-renderer>.
   *
   * @param title The title of the reaction panel
   * @param description The description of the reaction panel
   * @param reactions The reactions that should be displayed
   * @param onReactionClicked Callback which gets fired when a reaction was clicked
   * @param onReactionToggle Callback which gets fired when the toggle status of the reaction toggle changes
   * @param collapsible If the reaction should be collapsible
   * @param collapsed If the reaction should be initally collapsed
   *
   * @return The created <ytd-playlist-panel-renderer>
   */
  public static injectReactionsPanel(title: string, description: string, reactions: Reaction[], onReactionClicked: (reaction: Reaction) => void, onReactionToggle: (state: boolean) => void, collapsible: boolean, collapsed: boolean): JQuery<HTMLElement> {
    const renderer = YTHTMLUtil.injectYtPlaylistPanelRenderer(REACTIONS_CONTAINER_SELECTOR, REACTION_CONTAINER_ID, title, description, collapsible, collapsed, InjectAction.APPEND);

    const items = renderer.find('#items');
    items.css('text-align', 'center');
    items.css('overflow-y', 'hidden');

    for (const reaction of reactions) {
      const reactionRenderer = YTHTMLUtil.createReaction(reaction);
      reactionRenderer.click(() => {
        onReactionClicked(reaction);
      });
      items.append(reactionRenderer);
    }

    $('.html5-video-container')
      .append(YTHTMLUtil.createReactionOverlay());


    const reactionToggle = YTHTMLUtil.createPaperToggleButtonShell(REACTION_TOGGLE_ID);
    // reactionToggle.off();
    // Set onClick to report to callback
    reactionToggle.on('click', () => {
      onReactionToggle(reactionToggle.attr('active') === '');
    });

    const reactionToggleTooltip = YTHTMLUtil.createPaperTooltipShell(REACTION_TOGGLE_TOOLTIP_ID, REACTION_TOGGLE_ID, 'Show Reactions');

    renderer
      .find('#top-row-buttons')
      .append(reactionToggle)
      .append(reactionToggleTooltip);

    return renderer;
  }

  /**
   * Inject a Shell <ytd-playlist-panel-renderer> into the given object.
   *
   * @param element The element to inject the <ytd-playlist-panel-renderer>
   * @param id The id of the <ytd-playlist-panel-renderer>
   * @param title The title of the <ytd-playlist-panel-renderer>
   * @param description The description of <ytd-playlist-panel-renderer>
   * @param collapsible If the <ytd-playlist-panel-renderer> should be collapsible
   * @param collapsed If the <ytd-playlist-panel-renderer> should be initally collapsed
   * @param action The method to use to inject the <ytd-playlist-panel-renderer>
   */
  public static injectYtPlaylistPanelRenderer(element: string, id: string, title: string, description: string, collapsible: boolean, collapsed: boolean, action: InjectAction): JQuery<HTMLElement> {
    const renderer = YTHTMLUtil.createYtPlaylistPanelRendererShell(id);

    switch (action) {
      case InjectAction.APPEND:
        $(element).append(renderer);
        break;
      case InjectAction.REPLACE:
        $(element).replaceWith(renderer);
        break;
    }

    if (!collapsible) {
      renderer
        .removeAttr('collapsible')
        .removeAttr('collapsed');
    }
    else {
      if (!collapsed) {
        $(renderer)
          .removeAttr('collapsed');
      }
    }

    YTHTMLUtil.changeYtPlaylistPanelRendererTitle(renderer, title);
    YTHTMLUtil.changeYtPlaylistPanelRendererDescription(renderer, description);

    renderer
      .find('div.header')
      .css('padding-bottom', '12px');

    return renderer;
  }

  /**
   * Change the title of a <ytd-playlist-panel-renderer> Element.
   *
   * @param renderer The <ytd-playlist-panel-renderer> Element
   * @param title The new title text
   */
  public static changeYtPlaylistPanelRendererTitle(renderer: JQuery<HTMLElement>, title: string) {
    renderer
      .find('h3 yt-formatted-string')
      .text(title);
  }

  /**
   * Change the description of a <ytd-playlist-panel-renderer> Element.
   *
   * @param renderer The <ytd-playlist-panel-renderer> Element
   * @param description The new description text
   */
  public static changeYtPlaylistPanelRendererDescription(renderer: JQuery<HTMLElement>, description: string): void {
    renderer.find('div.index-message-wrapper span.index-message').text(description);
  }

  /**
   * Inject a <yt-live-chat-participant-renderer> into the given element.
   *
   * @param element The element that the created element should be appended to
   * @param config The server connection configuration of this plugin
   * @param client The client that should be represented
   * @param badges The badges that should be displayed
   */
  public static injectYtLiveChatParticipantRenderer(element: JQuery<Element>, config: ServerConnectionOptions, renderClient: RenderClient): JQuery<HTMLElement> {
    const renderer = YTHTMLUtil.createYtLiveChatParticipantRendererShell(renderClient.client.socketId);
    element.append(renderer);

    console.log(renderClient);

    renderer
      .find('span#author-name')
      .text((renderClient.prefix ?? '') + renderClient.client.name + (renderClient.sufix ?? ''));

    const serverBasePath = `${config.protocol}://${config.host}:${config.port}`;

    const badgeContainer = renderer.find('span#chat-badges');
    for (const badge of renderClient.badges) {
      const badgeRenderer = YTHTMLUtil.createYtLiveChatAuthorBadgeRendererShell();
      badgeContainer.append(badgeRenderer);

      badgeRenderer
        .on('click', badge.onClick)
        .find('#image')
        .append(`<img src="${serverBasePath}/img/badge/${badge.id}.png" class="style-scope yt-live-chat-author-badge-renderer" />`);
    }

    YTHTMLUtil.createImageSrcObserver(renderer, `${serverBasePath}/img/role/${renderClient.client.role}.png`);

    return renderer;
  }

  /**
   * Create a Observer that observes the src attribute of the img#img of the provided renderer.
   * This is needed in some casese because YouTube removes images sometimes.
   *
   * @param renderer The renderer whos image should be observed
   * @param imgUrl The url of the image
   */
  private static createImageSrcObserver(renderer: JQuery<Element>, imgUrl: string) {
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
}