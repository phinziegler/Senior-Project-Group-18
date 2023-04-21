import { Connection, escape } from "mysql";
import Service from "../tools/Service";
import Lobby from "../../shared/Lobby";
import LobbyUserService from "./LobbyUserService";
import getDbConnection from "../tools/db-connect";

/**
 * Performs queries on the Lobby table
 */
export default class LobbyService extends Service {
    lobbyUserService = new LobbyUserService(getDbConnection());

    constructor(db: Connection) {
        super(db, 'lobby');
    }

    /**
     * Create a lobby and store in the database
     * @param lobby the lobby being created
     */
    public async addLobby(lobby: Lobby) {
        return await this.insert(lobby).then(() => this.addUser(lobby.id, lobby.leader));
    }
    
    /**
     * Add a user to a lobby
     * @param lobbyId the lobby the user is being added to
     * @param username the username of the added user
     */
    public async addUser(lobbyId: string, username: string) {
        return await this.lobbyUserService.add(lobbyId, username);
    }

    /**
     * Get the lobby information of a single lobby
     * @param lobbyId the id of the lobby being fetched
     */
    public async getLobby(lobbyId: string) {
        return await this.findOne("*", "id = " + escape(lobbyId)) as Lobby;
    }

    /**
     * Get the information of all lobbies
     */
    public async getLobbies() {
        return await this.find("*") as Lobby[];
    }

    /**
     * Check if a user is in any lobby
     * @param username the user being checked
     */
    public async userInLobby(username: string) {
        return await this.lobbyUserService.userInLobby(username);
    }

    /**
     * Return the lobby id of the lobby the user is in, or null if not exists
     * @param username the username of the user we want to find the lobby of
     * @returns a string lobby id or null
     */
    public async lobbyOfUser(username: string) {
        return await this.lobbyUserService.lobbyOfUser(username).then(data => data.lobby_id).catch(() => null);
    }

    /**
     * Remove a user from a lobby
     * @param lobbyId the lobby the user is being removed from
     * @param username the user being removed
     */
    public async removeUser(lobbyId: string, username: string) {
        return await this.lobbyUserService.removeUser(lobbyId, username)
    }

    /**
     * Delete a lobby
     * @param lobbyId the lobby being deleted
     */
    public async deleteLobby(lobbyId: string) {
        this.delete(`id = ${escape(lobbyId)}`);
    }

    /**
     * Get the list of users for a lobby
     * @param lobbyId the lobby to get the users of
     */
    public async getUsers(lobbyId: string) {
        return await this.lobbyUserService.getUsers(lobbyId) as any[];
    }
}