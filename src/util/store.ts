const STORAGE_QUEUE_ID = 'syncQueue';
const STORAGE_SETTINGS_ID = 'syncSettings-v2';

const DEFAULT_SETTINGS: Settings = {
  showReactions: true,
  collapseStates: {
    queue: false,
    actionLog: false,
    roomInfo: false,
    reactions: false,
    settings: false,
  },
};

export default class Store {
  /**
   * Get the currently stored videos
   */
  public static getQueue(): Video[] {
    return Store.getItem(STORAGE_QUEUE_ID) || [];
  }

  /**
   * Set the currently stored videos
   *
   * @param videos The videos that should be set
   */
  private static setQueue(videos: Video[]): void {
    Store.setItem(STORAGE_QUEUE_ID, videos);
  }

  /**
   * Add a video to the Store
   *
   * @param video The video to add to the Store
   */
  public static addElement(video: Video): void {
    const data = Store.getQueue();
    data.push(video);

    Store.setQueue(data);
  }

  /**
   * Remove a video from the Store
   *
   * @param video The video that should be removed
   */
  public static removeElement(video: Video): void {
    const data = Store.getQueue().filter((v) => v.videoId !== video.videoId);
    Store.setQueue(data);
  }

  /**
   * Get the stored settings
   */
  public static getSettings(): Settings {
    return Store.getItem(STORAGE_SETTINGS_ID) || DEFAULT_SETTINGS;
  }

  /**
   * Store the given settings
   *
   * @param settings The settings to store
   */
  public static setSettings(settings: Settings): void {
    Store.setItem(STORAGE_SETTINGS_ID, settings);
  }

  /**
   * Get the item of the given id
   *
   * @param id The id of the item to get
   * @returns The item or null if it could not be found
   */
  private static getItem<T>(id: string): T | null {
    const json: string | null = window.localStorage.getItem(id) || null;
    return json !== null ? JSON.parse(json) : null;
  }

  /**
   * Set an Item with the given Id to the given value
   *
   * @param id The id under which the item should be stored
   * @param value The value that should be stored
   */
  private static setItem<T>(id: string, value: T): void {
    window.localStorage.setItem(id, JSON.stringify(value));
  }
}
