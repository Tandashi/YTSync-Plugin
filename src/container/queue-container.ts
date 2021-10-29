import IContainer from './container';
import SyncSocket from '../model/sync-socket';
import { injectYtPlaylistPanelVideoRendererElement } from '../util/yt-html/playlist';
import { injectQueuePanel } from '../util/yt-html/queue';

export default class QueueContainer implements IContainer {
  private queueItemsElement: JQuery<Element>;

  private syncSocket: SyncSocket;

  constructor(syncSocket: SyncSocket) {
    this.syncSocket = syncSocket;
  }

  create(): void {
    const queueRenderer = injectQueuePanel('Queue', 'All the videos to watch', true, false);
    this.queueItemsElement = queueRenderer.find('#items');
  }

  /**
   * Populate the Queue.
   *
   * **Caution**: Will clear existing Queue.
   *
   * @param data The data to populate the Queue with
   */
  public populateQueue(data: QueueMessageData): void {
    this.queueItemsElement.empty();

    data.videos.forEach((video) => {
      this.addToQueue(video, data.video !== null && video.videoId === data.video.videoId);
    });
  }

  /**
   * Add the given Video to the Queue.
   *
   * **Caution**: This will only add the Video visually.
   * There will not be send a request to add the Video to the Queue.
   * For this please use: {@link sendWsRequestToAddToQueue}
   *
   * @param video
   * @param selected
   */
  public addToQueue(video: Video, selected: boolean = false): void {
    injectYtPlaylistPanelVideoRendererElement(
      this.queueItemsElement,
      selected,
      video.videoId,
      video.title,
      video.byline,
      this.queueElementClickHandler(video.videoId),
      this.queueElementDeleteHandler(video.videoId)
    );
  }

  /**
   * Remove the Video from the Queue.
   *
   * **Caution**: This will only remove the Video visually.
   * There will not be send a request to remove the Video from the Queue.
   *
   * @param video
   */
  public removeFromQueue(video: Video): void {
    this.queueItemsElement.find(`[videoId="${video.videoId}"]`).remove();
  }

  /**
   * Select the Video with given videoId in the Queue
   *
   * @param videoId
   */
  public selectQueueElement(videoId: string): void {
    // Deselect all selected
    this.queueItemsElement.children().removeAttr('selected');
    // Select Video
    this.queueItemsElement.find(`[videoId="${videoId}"]`).attr('selected', '');
  }

  /**
   * Get the Queue Element that has the selected attribute
   *
   * @returns The Element that has the selected attribute
   */
  private getSelectedQueueElement(): JQuery<Element> {
    return this.queueItemsElement.find(`[selected]`);
  }

  /**
   * Get all Elements in the Queue
   *
   * @returns All Elements in the Queue
   */
  private getAllQueueElements(): JQuery<Element> {
    return this.queueItemsElement.children();
  }

  /**
   * Get the video Id of the Queue element that is next up
   *
   * @returns The video Id of the next video in the Queue
   */
  public getNextVideoInQueue(): string {
    const current = this.getSelectedQueueElement();
    const children = this.getAllQueueElements();
    const index = children.index(current.get(0));

    if (index === children.length - 1) return;

    const next = children.get(index + 1);
    return $(next).attr('videoId');
  }

  /**
   * Returns a Handler function for a Queue Element click.
   *
   * @param videoId
   */
  private queueElementClickHandler(videoId: string): () => void {
    return () => {
      this.syncSocket.sendWsRequestToPlayVideo(videoId);
    };
  }

  /**
   * Returns a Handler function for a Queue Element delete.
   * @param videoId
   */
  private queueElementDeleteHandler(videoId: string): () => void {
    return () => {
      this.syncSocket.sendWsRequestToRemoveFromQueue(videoId);
    };
  }
}
