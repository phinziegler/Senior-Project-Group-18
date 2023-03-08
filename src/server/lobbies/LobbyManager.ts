import AuthToken from "../../shared/AuthToken";
import Lobby from "./lobby";

export default class LobbyController {
    lobbies: Map<string, Lobby>;        // maps the lobby id to the lobby object
    userToLobby: Map<string, Lobby>;    // maps a user to the lobby they are a part of

    constructor() {
        this.lobbies = new Map<string, Lobby>();
        this.userToLobby = new Map<string, Lobby>();
    }

    addLobby(name: string, password: string, leader: AuthToken) {
        let lobby = new Lobby(name, password, leader)
        this.lobbies.set(lobby.id, lobby);
        this.userToLobby.set(leader.username, lobby);
        return lobby.id;
    }

    getLobby(lobbyId: string) {
        return this.lobbies.get(lobbyId)?.toJson();
    }

    getLobbies() {
        let output: { id: string, name: string, leader: string }[] = [];
        this.lobbies.forEach((lobby: Lobby) => {
            output.push(lobby.toJson());
        });
        return output;
    }

    userInLobby(leader: AuthToken) {
        if (this.userToLobby.has(leader.username)) {
            return true;
        }
        return false;
    }
}