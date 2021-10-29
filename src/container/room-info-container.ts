import IContainer from './container';
import { injectRoomInfoPanel } from '../util/yt-html/room';
import { Role } from '../enum/role';
import SyncSocket from '../model/sync-socket';
import { BADGE_MEMBER_ID, BADGE_MODERATOR_ID, BADGE_SUB_HOST_ID } from '../util/consts';
import { injectYtLiveChatParticipantRenderer } from '../util/yt-html/participant';
import { changeYtPlaylistPanelRendererDescription } from '../util/yt-html/playlist';

export default class RoomInfoContainer implements IContainer {
  private roomInfoElement: JQuery<Element>;
  private options: PlayerOptions;
  private clients: Client[] = [];

  private syncSocket: SyncSocket;

  constructor(syncSocket: SyncSocket, options: PlayerOptions) {
    this.syncSocket = syncSocket;
    this.options = options;
  }

  create(): void {
    this.roomInfoElement = injectRoomInfoPanel('Room Info', 'Not connected', true, false);
  }

  /**
   * Populate the client renderer.
   *
   * @param clients The clients the renderer should be populated with
   */
  public populateClients(clients: Client[]): void {
    this.clients = [];
    this.roomInfoElement.find('#items').children().remove();

    clients.forEach((c) => {
      this.addClient(c);
    });
  }

  /**
   * Add clients visually.
   *
   * @param client The clients to add
   */
  public addClient(client: Client): void {
    const socketIds = this.clients.map((c) => c.socketId);

    if (socketIds.includes(client.socketId)) return;

    const badges = [];
    switch (client.role) {
      case Role.MEMBER:
        badges.push({
          id: BADGE_MEMBER_ID,
          onClick: () => {
            this.syncSocket.sendWsRoleUpdateMessage(client, Role.MODERATOR);
          },
        });
        break;
      case Role.MODERATOR:
        badges.push({
          id: BADGE_MODERATOR_ID,
          onClick: () => {
            this.syncSocket.sendWsRoleUpdateMessage(client, Role.SUB_HOST);
          },
        });
        break;
      case Role.SUB_HOST:
        badges.push({
          id: BADGE_SUB_HOST_ID,
          onClick: () => {
            this.syncSocket.sendWsRoleUpdateMessage(client, Role.MEMBER);
          },
        });
        break;
    }

    injectYtLiveChatParticipantRenderer(this.roomInfoElement.find('#items'), this.options.connection, {
      prefix: '',
      sufix: this.syncSocket.socket.id === client.socketId ? ' (You)' : '',
      client,
      badges,
    });

    this.clients.push(client);

    changeYtPlaylistPanelRendererDescription(this.roomInfoElement, `Connected (${this.clients.length})`);
  }

  /**
   * Remove a clients visually.
   *
   * @param socketId The socketId of the client that should be removed
   */
  public removeClient(socketId: string): void {
    this.roomInfoElement.find(`#items [socketId="${socketId}"]`).remove();

    this.clients = this.clients.filter((c) => c.socketId !== socketId);
    changeYtPlaylistPanelRendererDescription(this.roomInfoElement, `Connected (${this.clients.length})`);
  }
}
