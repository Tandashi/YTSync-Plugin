import { InjectAction } from '../../enum/action';
import { NON_PLAYLIST_CONTAINER_SELECTOR } from '../consts';

import { injectYtPlaylistPanelRenderer, PlaylistPanelRendererElement } from './playlist';
import { createPaperTooltipShell } from './tooltip';

const REACTION_OVERLAY_ID = 'reaction-overlay';
const REACTION_CONTAINER_ID = 'reactions';

const REACTION_TIME_TILL_REMOVE = 8000;
const REACTION_FADE_IN_TIME = 600;

export function getReactionId(reaction: Reaction): string {
  return `emoji-${reaction.id}`;
}

function createReaction(reaction: Reaction): JQuery<HTMLElement> {
  const id = getReactionId(reaction);
  const tooltip = createPaperTooltipShell(reaction.tooltip);

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

function createReactionChip(text: string, symbol: string): JQuery<HTMLElement> {
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

function createReactionOverlay(): JQuery<HTMLElement> {
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

export function addReaction(reaction: Reaction): JQuery<HTMLElement> {
  const renderer = createReactionChip(reaction.text, reaction.symbol);
  $(`#${REACTION_OVERLAY_ID}`).append(renderer);

  renderer.animate({ opacity: 1 }, REACTION_FADE_IN_TIME);

  setTimeout(() => renderer.remove(), REACTION_TIME_TILL_REMOVE);
  renderer.on('click', () => renderer.remove());

  return renderer;
}

/**
 * Inject a reactions panel using a <ytd-playlist-panel-renderer>.
 *
 * @param title The title of the reaction panel
 * @param description The description of the reaction panel
 * @param reactions The reactions that should be displayed
 * @param onReactionClicked Callback which gets fired when a reaction was clicked
 * @param collapsible If the reaction should be collapsible
 * @param collapsed If the reaction should be initally collapsed
 *
 * @return The created <ytd-playlist-panel-renderer>
 */
export function injectReactionsPanel(
  title: string,
  description: string,
  reactions: Reaction[],
  onReactionClicked: (reaction: Reaction) => void,
  collapsible: boolean,
  collapsed: boolean,
  onCollapseChange: (state: boolean) => void
): JQuery<PlaylistPanelRendererElement> {
  const renderer = injectYtPlaylistPanelRenderer(
    NON_PLAYLIST_CONTAINER_SELECTOR,
    REACTION_CONTAINER_ID,
    title,
    description,
    collapsible,
    collapsed,
    onCollapseChange,
    InjectAction.APPEND
  );

  const items = renderer.find('#items');
  items.css('text-align', 'center');
  items.css('overflow-y', 'hidden');
  // Make items non selectable
  items.css('-moz-user-select', 'none');
  items.css('-webkit-user-select', 'none');
  items.css('-ms-user-select', 'none');
  items.css('user-select', 'none');
  items.css('-o-user-select', 'none');

  for (const reaction of reactions) {
    const reactionRenderer = createReaction(reaction);
    reactionRenderer.on('click', () => {
      onReactionClicked(reaction);
    });
    items.append(reactionRenderer);
  }

  $('.html5-video-container').append(createReactionOverlay());
  return renderer;
}
