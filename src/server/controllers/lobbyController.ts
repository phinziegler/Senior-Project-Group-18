import { randomUUID } from "crypto";
import { Request, Response } from "express";
import AuthToken from "../../shared/AuthToken";
import ChatMessage from "../../shared/ChatMessage";
import Lobby from "../../shared/Lobby";
import MessageType from "../../shared/MessageTypes";
import { socketManager } from "../server";
import { authTokenService, lobbyService } from "../tools/services";

export default class LobbyController {
    /**
     * Create a lobby using the request data. 
     * @param req body has the form {lobbyName: string, lobbyPassword: string, leader: AuthToken}
     * @returns a JSON object containing the ID of the newly created lobby
     */
    static async makeLobby(req: Request, res: Response) {
        let name: string;
        let password: string;
        let leader: AuthToken;

        try {
            name = req.body.lobbyName;
            password = req.body.lobbyPassword;
            leader = req.body.leader;
        } catch {
            return res.status(400).json({ message: "Could not create lobby, request body is invalid" });
        }

        // Fail to create the lobby if the leader cannot be authorized with the server
        if (!await authTokenService.checkAuthorized(leader)) {
            return res.status(401).json({ message: "Could not create lobby, user is not authenticated" });
        }

        // Fail to create the lobby if there is already a lobby for that user OR if the user is in a different lobby
        if (await lobbyService.userInLobby(leader.username)) {
            return res.status(403).json({ message: "User is already in a lobby, or is the owner of an existing lobby" });    // TODO: is this too restrictive?
        }

        // Create the lobby
        // let id = lobbyManager.addLobby(name, password, leader);
        let lobby: Lobby = {
            id: randomUUID(),
            name: name,
            password: password,
            leader: leader.username
        }

        return await lobbyService.addLobby(lobby)
            .then(data => res.status(200).json({ message: "Successfully created lobby", id: lobby.id }))
            .catch(() => res.status(500).json({ message: "failed to add lobby" }));
    }

    /**
     * Get information for all lobbies (exluding passwords) */
    /* TODO: this could theoretically cause crashes if there were enough lobbies. 
       Solution is to paginate this data instead of sending it in bulk...
       Too bad I dont want to do that :)
    */
    static async getLobbies(req: Request, res: Response) {
        return await lobbyService.getLobbies().then(data => {
            if (!data) {
                return res.status(500).json({ message: "failed to get lobbies" });
            }

            data.forEach((lobby: Lobby) => {
                if (lobby.password != "") {
                    lobby.password = "****";
                }
            });

            return res.status(200).json(data);
        })
    }

    /**
     * Get information for a specific lobby
     * @param req has a parameter 'lobbyId'
     */
    static async getLobby(req: Request, res: Response) {
        /* FIXME: the body of this if statement never gets run, ven when no params are provided,
            luckily it seems like this has no effect on behavior in practice...*/
        if (!req.params.lobbyId) {
            console.error("no lobby id provided");
            return res.status(400).json({ message: "Invalid request" });
        }

        let lobby = await lobbyService.getLobby(req.params.lobbyId);
        if (!lobby) {
            return res.status(403).json({ message: `No lobby with id ${req.params.lobbyId} could be found.` })
        }

        return res.status(200).json(lobby);
    }

    static async getLobbyOfUser(req: Request, res: Response) {
        let username: string;

        try {
            username = req.params.username;
        } catch {
            return res.status(400).json({ message: "Invalid request" })
        }
        let lobbyId = await lobbyService.lobbyOfUser(username);

        if (!lobbyId) {
            return res.status(200).json();
        }

        let lobby: Lobby = await lobbyService.getLobby(lobbyId);
        return res.status(200).json(lobby);
    }

    static async joinLobby(req: Request, res: Response) {
        let lobbyId: string;
        let password: string;   // TODO: enforce password use to join a lobby
        let user: AuthToken;

        try {
            lobbyId = req.body.lobbyId;
            password = req.body.password;
            user = req.body.user;
        } catch {
            return res.status(400).json({ message: "Could not join lobby, request body is invalid" });
        }

        // Fail to create the lobby if the leader cannot be authorized with the server
        if (!await authTokenService.checkAuthorized(user)) {
            return res.status(401).json({ message: "Could not join lobby, user is not authenticated" });
        }

        let lobby = await lobbyService.getLobby(lobbyId);

        if(!lobby) {
            return res.status(404).json({message: "Could not join lobby, lobby not foud"});
        }

        if(lobby.password && (password != lobby.password)) {
            return res.status(403).json({message: "Incorrect password"});
        }

        // Fail to join a lobby if the user is in a different lobby
        // TODO: this should not be the case... The user should instead be removed from any previous lobbies and kept in this one
        if (await lobbyService.userInLobby(user.username)) {
            return res.status(403).json({ message: "Could not join lobby, already part of another lobby" });
        }

        await lobbyService.addUser(lobbyId, user.username)
            .then(() => {
                LobbyController.updateUserList(lobbyId);
                res.status(200).json({ message: "added user to lobby" })
            })
            .catch(() => res.status(500).json({ message: "Could not join lobby due to server error" }));
    }

    static async getUsers(req: Request, res: Response) {
        let lobbyId: string;
        try {
            lobbyId = req.params.lobbyId;
        } catch {
            return res.status(400).json({ message: "Could not get users for lobby, invalid request" })
        }

        try {
            return await LobbyController.getUserList(lobbyId).then(data => res.status(200).json(data));
        } catch {
            return res.status(500).json({ message: "Failed to get users, server error" });
        }
    }

    static async getUserList(lobbyId: string) {
        return await lobbyService.getUsers(lobbyId)
            .then((data) => {
                // console.log(data);
                let output: string[] = [];
                data.forEach(entry => {
                    output.push(entry.username);
                });
                return output;
            })
            .catch(() => {
                throw new Error("Failed to get users, server error")
            });
    }

    static async chat(auth: AuthToken, message: ChatMessage) {
        let userLobbyId: any = await lobbyService.lobbyOfUser(auth.username);

        if (userLobbyId != message.lobbyId) {
            console.log("cannot participate in a different lobby's chatroom");
            return;
        }

        let users = await LobbyController.getUserList(message.lobbyId);
        users.forEach((username: string) => {
            socketManager.sendMessageToUser(username, JSON.stringify({ type: MessageType.CHAT, user: message.user, message: message.message }));
        });
    }

    static async updateUserList(lobbyId: string) {
        let users = await LobbyController.getUserList(lobbyId);
        users.forEach((username: string) => {
            socketManager.sendMessageToUser(username, JSON.stringify({ type: MessageType.UPDATE_USER_LIST }));
        });
    }

    /**
     * Delete a lobby
     * @param req {auth: AuthToken, lobbyId: string}
     */
    static async deleteLobby(req: Request, res: Response) {
        let auth: AuthToken;
        let lobbyId: string;

        try {
            auth = JSON.parse(req.params.auth);
            lobbyId = req.params.lobbyId;
        } catch {
            return res.status(400).json({ message: "Failed to delete lobby, invalid request" });
        }

        // Check if requesting user is logged in.
        if (!await authTokenService.checkAuthorized(auth)) {
            return res.status(401).json({ message: "Could not delete lobby, requesting user is not authenticated" });
        }

        let lobby = await lobbyService.getLobby(lobbyId);
        if (!lobby) {
            return res.status(403).json({ message: `No lobby with id ${lobbyId} could be found.` });
        }

        if (lobby.leader != auth.username) {
            return res.status(401).json({ messae: `Only the lobby leader can delete a lobby` });
        }

        await lobbyService.deleteLobby(lobbyId);
        return res.status(200).json({ message: "Successfully deleted lobby" });
    }

    /**
     * Remove a user from a lobby - succeeds if the authToken is that of the lobby leader, OR the user being removed
     * @param req {auth: AuthToken, lobbyId: string, username: string}
     */
    static async removeUser(req: Request, res: Response) {
        let auth: AuthToken;
        let lobbyId: string;
        let username: string;

        try {
            auth = JSON.parse(req.params.auth);
            lobbyId = req.params.lobbyId;
            username = req.params.username;
        } catch {
            return res.status(400).json({ message: "Failed to remove user, invalid request" });
        }

        // Check if requesting user is logged in.
        if (!await authTokenService.checkAuthorized(auth)) {
            return res.status(401).json({ message: "Could not remove user, requesting user is not authenticated" });
        }

        // Check if lobby exists and get lobby
        let lobby = await lobbyService.getLobby(lobbyId);
        if (!lobby) {
            return res.status(403).json({ message: `No lobby with id ${lobbyId} could be found.` });
        }

        // If the requesting user is not the lobby leader OR the user being removed, fail to remove them
        if ((username != auth.username) && (lobby.leader != auth.username)) {
            return res.status(401).json({ messae: `Only the lobby leader or oneself can remove a user from the lobby` });
        }

        await lobbyService.removeUser(lobbyId, username);
        LobbyController.updateUserList(lobbyId);
        return res.status(200).json({ message: "Successfully removed user" });
    }
}