import { Request, Response } from "express";
import AuthToken from "../../shared/AuthToken";
import { authTokenService } from "../../tools/services";
import { lobbyManager } from "../server";


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
        let socketId: string;

        try {
            name = req.body.lobbyName;
            password = req.body.lobbyPassword;
            leader = req.body.leader;
            socketId = req.body.socketId;
        } catch {
            return res.status(400).json({ message: "Could not create lobby, request body is invalid" });
        }

        // Fail to create the lobby if there is already a lobby for that user OR if the user is in a different lobby
        if (lobbyManager.userInLobby(leader)) {
            return res.status(403).json({ message: "User is already in a lobby, or is the owner of an existing lobby" });    // TODO: is this too restrictive?
        }

        // Fail to create the lobby if the leader cannot be authorized with the server
        if (!await authTokenService.checkAuthorized(leader)) {
            return res.status(401).json({ message: "Could not create lobby, user is not authenticated" });
        }

        // Create the lobby
        let id = lobbyManager.addLobby(name, password, leader, socketId);
        return res.status(200).json({ message: "Successfully created lobby", id: id });
    }

    /**
     * Get information for all lobbies (exluding passwords) */
    /* TODO: this could theoretically cause crashes if there were enough lobbies. 
       Solution is to paginate this data instead of sending it in bulk...
       Too bad I dont want to do that :)
    */
    static async getLobbies(req: Request, res: Response) {
        return res.status(200).json(lobbyManager.getLobbies());
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

        let lobby = lobbyManager.getLobby(req.params.lobbyId);
        if (!lobby) {
            return res.status(403).json({ message: `No lobby with id ${req.params.lobbyId} could be found.` })
        }

        return res.status(200).json(lobby);
    }

    static async joinLobby(req: Request, res: Response) {
        let lobbyId: string;
        let password: string;
        let user: AuthToken;
        let socketId: string;

        try {
            lobbyId = req.body.lobbyId;
            password = req.body.lobbyPassword;
            user = req.body.user;
            socketId = req.body.socketId;
        } catch {
            return res.status(400).json({ message: "Could not join lobby, request body is invalid" });
        }

        // Fail to create the lobby if the leader cannot be authorized with the server
        if (!await authTokenService.checkAuthorized(user)) {
            return res.status(401).json({ message: "Could not join lobby, user is not authenticated" });
        }

        lobbyManager.addUser(user, lobbyId, socketId);
        return res.status(200).json({ message: "added user to lobby" });
    }

    static async getUsers(req: Request, res: Response) {
        let lobbyId: string;
        try {
            lobbyId = req.params.lobbyId;
        } catch {
            return res.status(400).json({ message: "Could not get users for lobby, invalid request" })
        }

        let users = lobbyManager.getUsers(lobbyId);

        let usersOutput: string[] = [];
        if(users) {
            users.forEach((user: string) => {
                usersOutput.push(user);
            });
        }

        return res.status(200).json(usersOutput);
    }
}