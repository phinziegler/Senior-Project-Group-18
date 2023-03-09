import AuthToken from "../../shared/AuthToken";
import Lobby from "./lobby";
import ChatMessage from '../../shared/ChatMessage';
import { WebSocket } from "ws";

export default class LobbyManager {
    lobbies: Map<string, Lobby>;        // maps the lobby id to the lobby object
    userToLobby: Map<string, Lobby>;    // maps a user to the lobby they are a part of
    userToSocket: Map<string, WebSocket>;

    constructor() {
        this.lobbies = new Map<string, Lobby>();
        this.userToLobby = new Map<string, Lobby>();
        this.userToSocket = new Map<string, WebSocket>();   // this is populated as users join the lobby
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

    chat(auth: AuthToken, message: ChatMessage) {

        // ws.send(JSON.stringify({ type: MessageType.CHAT, user: message.data.user, message: message.data.message }));  // Sends the message back to the user who dunnit
    }
}