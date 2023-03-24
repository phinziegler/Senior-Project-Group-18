import AuthToken from "../../shared/AuthToken";
import Lobby from "./lobby";
import ChatMessage from '../../shared/ChatMessage';
import { socketManager } from "../server";
import MessageType from "../../shared/MessageTypes";

export default class LobbyManager {
    lobbies: Map<string, Lobby>;                // maps the lobby id to the lobby object
    userToLobby: Map<string, Lobby>;            // maps a user to the lobby they are a part of
    lobbyToUsers: Map<Lobby, Set<string>>;      // Maps a lobby to the usernames part of them

    constructor() {
        this.lobbies = new Map<string, Lobby>();
        this.userToLobby = new Map<string, Lobby>();
        this.lobbyToUsers = new Map<Lobby, Set<string>>();
    }

    addUser(user: AuthToken, lobbyId: string) {
        let lobby = this.lobbies.get(lobbyId);
        if (!lobby) {
            return;
        }

        // Associate a user with their lobby
        this.userToLobby.set(user.username, lobby);

        // Update the lobbies user Set
        let users = this.lobbyToUsers.get(lobby);
        if (!users) {
            this.lobbyToUsers.set(lobby, new Set<string>());
        }
        users = this.lobbyToUsers.get(lobby);
        users?.add(user.username);

        this.updateUserList(lobby);
    }

    addLobby(name: string, password: string, leader: AuthToken, socketId: string) {
        let lobby = new Lobby(name, password, leader)
        this.lobbies.set(lobby.id, lobby);
        this.addUser(leader, lobby.id);
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

    /**
     * Broadcast a chat message to all users in a given lobby
     */
    chat(auth: AuthToken, message: ChatMessage) {
        let lobby = this.userToLobby.get(auth.username);
        if (!lobby) {
            return;
        }

        let users = this.lobbyToUsers.get(lobby);
        if (!users) {
            return;
        }

        users.forEach((username: string) => {
            socketManager.sendMessageToUser(username, JSON.stringify({ type: MessageType.CHAT, user: message.user, message: message.message }));
        });
    }

    getUsers(lobbyId: string) {
        let lobby = this.lobbies.get(lobbyId);

        if (!lobby) {
            return;
        }

        return this.lobbyToUsers.get(lobby);
    }

    updateUserList(lobby: Lobby) {
        let users = this.lobbyToUsers.get(lobby);

        if (!users) {
            return;
        } 

        users.forEach((username: string) => {
            socketManager.sendMessageToUser(username, JSON.stringify({ type: MessageType.UPDATE_USER_LIST }));
        });
    }
}