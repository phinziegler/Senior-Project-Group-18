import { escape } from "mysql";
import Service from "../tools/Service";

/**
 * Performs queries on the lobby_user table
 */
class LobbyUserServiceClass extends Service {
    constructor() {
        super('lobby_user');
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

    
    public async removeUser(lobbyId: string, username: string) {
        return await this.delete(`lobby_id = ${escape(lobbyId)} AND username = ${escape(username)}`);
    }
}

const LobbyUserService = new LobbyUserServiceClass();
export default LobbyUserService;