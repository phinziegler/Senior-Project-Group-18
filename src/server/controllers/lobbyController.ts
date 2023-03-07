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

        try {
            name = req.body.lobbyName;
            password = req.body.lobbyPassword;
            leader = req.body.leader;
        } catch {
            return res.status(400).json({ message: "Could not create lobby, request body is invalid" });
        }

        if (!authTokenService.checkAuthorized(leader)) {
            return res.status(401).json({ message: "Could not create lobby, user is not authenticated" });
        }
        let id = lobbyManager.addLobby(name, password, leader);
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
}