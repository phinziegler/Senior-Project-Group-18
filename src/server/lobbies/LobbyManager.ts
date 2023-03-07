import AuthToken from "../../shared/AuthToken";
import Lobby from "./lobby";

export default class LobbyController {
    lobbies: Set<Lobby>;
    userToLobby: Map<string, Lobby>;

    constructor() {
        this.lobbies = new Set<Lobby>();
        this.userToLobby = new Map<string, Lobby>();
    }

    addLobby(name: string, password: string, leader: AuthToken) {
        let lobby = new Lobby(name, password, leader)
        this.lobbies.add(lobby);
        this.userToLobby.set(name, lobby);
    }
}