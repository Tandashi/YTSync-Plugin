import { createImageSrcObserver } from './image';

/**
 * Create a <yt-live-chat-participant-renderer> Shell.
 * Will not contain any text. Text must be set after injection.
 *
 * @param socketId The id of the socket that this renderer represents
 */
function createYtLiveChatParticipantRendererShell(socketId: string): JQuery<HTMLElement> {
  return $(`
    <yt-live-chat-participant-renderer
      socketId="${socketId}"
    />
  `);
}

/**
 * Create a <yt-live-chat-author-badge-renderer> Shell.
 */
function createYtLiveChatAuthorBadgeRendererShell() {
  return $(`
    <yt-live-chat-author-badge-renderer class="style-scope yt-live-chat-author-chip" style="margin-left: 10px"/>
  `);
}

/**
 * Inject a <yt-live-chat-participant-renderer> into the given element.
 *
 * @param element The element that the created element should be appended to
 * @param config The server connection configuration of this plugin
 * @param client The client that should be represented
 * @param badges The badges that should be displayed
 */
export function injectYtLiveChatParticipantRenderer(element: JQuery<Element>, config: ServerConnectionOptions, renderClient: RenderClient): JQuery<HTMLElement> {
  const renderer = createYtLiveChatParticipantRendererShell(renderClient.client.socketId);
  element.append(renderer);
  
  renderer
    .find('span#author-name')
    .text((renderClient.prefix ?? '') + renderClient.client.name + (renderClient.sufix ?? ''));

  const serverBasePath = `${config.protocol}://${config.host}:${config.port}`;

  const badgeContainer = renderer.find('span#chat-badges');
  for (const badge of renderClient.badges) {
    const badgeRenderer = createYtLiveChatAuthorBadgeRendererShell();
    badgeContainer.append(badgeRenderer);

    badgeRenderer
      .on('click', badge.onClick)
      .find('#image')
      .append(`<img src="${serverBasePath}/img/badge/${badge.id}.png" class="style-scope yt-live-chat-author-badge-renderer" />`);
  }

  createImageSrcObserver(renderer, `${serverBasePath}/img/role/${renderClient.client.role}.png`);

  return renderer;
}
