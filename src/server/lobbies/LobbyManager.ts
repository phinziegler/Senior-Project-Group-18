import AuthToken from "../../shared/AuthToken";
import Lobby from "./lobby";
import ChatMessage from '../../shared/ChatMessage';
import { socketManager } from "../server";
import MessageType from "../../shared/MessageTypes";

export default class LobbyManager {
    lobbies: Map<string, Lobby>;                // maps the lobby id to the lobby object
    userToLobby: Map<string, Lobby>;            // maps a user to the lobby they are a part of
    lobbyToUsers: Map<Lobby, Set<string>>;      // Maps a lobby to the usernames part of them
    userToSocket: Map<string, string>;          // Maps a username to a websocket id
    socketToUser: Map<string, string>;   // Maps a socket id to a username

    constructor() {
        this.lobbies = new Map<string, Lobby>();
        this.userToLobby = new Map<string, Lobby>();
        this.lobbyToUsers = new Map<Lobby, Set<string>>();
        this.userToSocket = new Map<string, string>();
        this.socketToUser = new Map<string, string>();
    }

    addUser(user: AuthToken, lobbyId: string, socketId: string) {
        let lobby = this.lobbies.get(lobbyId);
        if (!lobby) {
            return;
        }

        // Associate a user with their lobby
        this.userToLobby.set(user.username, lobby);

        // Associate a user to their websocket
        this.userToSocket.set(user.username, socketId);     // TODO: verify that the websocket id exists?
        this.socketToUser.set(socketId, user.username);

        // Update the lobbies user Set
        let users = this.lobbyToUsers.get(lobby);
        if (!users) {
            this.lobbyToUsers.set(lobby, new Set<string>());
        }
        users = this.lobbyToUsers.get(lobby);
        users?.add(user.username);
    }

    addLobby(name: string, password: string, leader: AuthToken, socketId: string) {
        let lobby = new Lobby(name, password, leader)
        this.lobbies.set(lobby.id, lobby);
        this.addUser(leader, lobby.id, socketId);
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

    removeUserBySocketId(socketId: string) {
        let username = this.socketToUser.get(socketId);
        if(!username) {
            console.log("error getting username from socketId");
            return;
        }

        let lobby = this.userToLobby.get(username);
        if(!lobby) {
            console.log("getting lobby from username");
            return;
        }

        this.lobbyToUsers.get(lobby)?.delete(username);
        this.userToLobby.delete(username);
        this.socketToUser.delete(socketId);
        this.userToSocket.delete(username);
    }

    chat(auth: AuthToken, message: ChatMessage) {
        let lobby = this.userToLobby.get(auth.username);
        if(!lobby) {
            console.log("cannot chat in lobby you have not joined");
            return;
        }

        let users = this.lobbyToUsers.get(lobby);
        if(!users) {
            return;
        }

        users.forEach((username: string) => {
            let socketId = this.userToSocket.get(username);
            if(!socketId) {
                return;
            }

            let ws = socketManager.getSocketFromId(socketId);
            if(!ws) {
                return;
            }

            ws.send(JSON.stringify({ type: MessageType.CHAT, user: message.user, message: message.message }));
        });
    }

    getUsers(lobbyId: string) {
        console.log(lobbyId);
        let lobby = this.lobbies.get(lobbyId);

        if (!lobby) {
            return;
        }

        console.log("here");
        return this.lobbyToUsers.get(lobby);
    }
}