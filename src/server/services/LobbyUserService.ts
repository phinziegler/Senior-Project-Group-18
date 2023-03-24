import { Connection, escape } from "mysql";
import Lobby from "../../shared/Lobby";
import Service from "../tools/Service";

/**
 * Performs queries on the lobby_user table
 */
export default class LobbyUserService extends Service {
    constructor(db: Connection) {
        super(db, 'lobby_user');
    }

    public async add(lobbyId: string, username: string) {
        return await this.insert({ lobby_id: lobbyId, username: username });
    }

    public async userInLobby(username: string) {
        return await this.findOne("*", `username = ${escape(username)}`).then(data => {
            if(!data) {
                return false;
            }
            return true;
        });
    }

    public async lobbyOfUser(username: string) {
        return await this.findOne(["lobby_id"], `username = ${escape(username)}`) as {lobby_id: string};
    }

    public async getUsers(lobbyId: string) {
        return await this.find(["username"], `lobby_id = ${escape(lobbyId)}`);
    }
}