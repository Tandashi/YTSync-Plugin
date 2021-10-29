import { InjectAction } from '../../enum/action';
import { setPapperToggleButtonState } from './button';
import { injectYtPlaylistPanelRenderer } from './playlist';

const SETTINGS_CONTAINER_ID = 'settings';
export const SETTINGS_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';

interface Setting {
  title: string;
  subtitle?: string;
  initialValue: boolean;
  toggleRef: (element: JQuery<Element>) => void;
  handler: (state: boolean) => void;
}

function createYtSettingsSwitchRenderer(): JQuery<Element> {
  return $(`
    <ytd-settings-switch-renderer />
  `);
}

export function injectSettingsPanel(
  title: string,
  description: string,
  collapsible: boolean,
  collapsed: boolean,
  settings: Setting[]
): JQuery<HTMLElement> {
  const renderer = injectYtPlaylistPanelRenderer(
    SETTINGS_CONTAINER_SELECTOR,
    SETTINGS_CONTAINER_ID,
    title,
    description,
    collapsible,
    collapsed,
    InjectAction.APPEND
  );

  const items = renderer.find('#items');
  items.css('padding', '5%');

  settings.forEach((setting) => {
    const optionRenderer = createYtSettingsSwitchRenderer();
    items.append(optionRenderer);

    // Hide icon
    optionRenderer.find('div#icon').attr('hidden', 'true');

    // Set texts
    optionRenderer.find('yt-formatted-string#title').text(setting.title);
    optionRenderer.find('yt-formatted-string#subtitle').text(setting.subtitle);

    const toggle = optionRenderer.find('tp-yt-paper-toggle-button#toggle');
    toggle.on('click', () => {
      setting.handler(toggle.attr('active') === '');
    });

    // To prevent the collapsible to open / close
    toggle.on('tap', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    });

    setPapperToggleButtonState(toggle, setting.initialValue);

    setting.toggleRef(toggle);
  });

  return renderer;
}
