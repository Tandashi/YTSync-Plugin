export default class Client {
  /**
   * @param socketId The socket id of the client
   * @param name The name of the client
   * @param role The role of the client
   */
  constructor(
    public socketId: string,
    public name: string,
    public role: string
  ) { }
}