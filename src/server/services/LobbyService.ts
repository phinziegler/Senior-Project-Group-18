import { Connection, escape } from "mysql";
import Service from "../tools/Service";
import Lobby from "../../shared/Lobby";
import User from "../../shared/User";
import LobbyUserService from "./LobbyUserService";
import getDb from "../tools/db-connect";

/**
 * Performs queries on the Lobby table
 */
export default class LobbyService extends Service {
    lobbyUserService = new LobbyUserService(getDb());

    constructor(db: Connection) {
        super(db, 'lobby');
    }

    public async addLobby(lobby: Lobby) {
        return await this.insert(lobby).then(() => this.addUser(lobby.id, lobby.leader));
    }
    
    public async addUser(lobbyId: string, username: string) {
        return await this.lobbyUserService.add(lobbyId, username);
    }

    public async getLobby(lobbyId: string) {
        return await this.findOne("*", "id = " + escape(lobbyId)) as Lobby;
    }

    public async getLobbies() {
        return await this.find("*") as Lobby[];
    }

    public async userInLobby(username: string) {
        return await this.lobbyUserService.userInLobby(username);
    }

    public async lobbyOfUser(username: string) {
        return await this.lobbyUserService.lobbyOfUser(username).then(data => data.lobby_id).catch(() => null);
    }

    // TODO: implement this
    public async removeUser() {
        
    }

    public async getUsers(lobbyId: string) {
        return await this.lobbyUserService.getUsers(lobbyId) as any[];
    }
}