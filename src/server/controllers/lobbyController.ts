import { Request, Response } from "express";
import AuthToken from "../../shared/AuthToken";
import { authTokenService } from "../../tools/services";
import { lobbyManager } from "../server";


export default class LobbyController {

    /**
     * Create a lobby using the request data
     * @param req body has the form {lobbyName: string, lobbyPassword: string, leader: AuthToken}
     */
    static async makeLobby(req: Request, res: Response) {
        let name: string;
        let password: string;
        let leader: AuthToken;

        try {
            name = req.body.lobbyName;
            password = req.body.lobbyPassword;
            leader = req.body.leader;
            console.log(leader);
        } catch {
            return res.status(400).json({ message: "Could not create lobby, request body is invalid" });
        }

        if (!authTokenService.checkAuthorized(leader)) {
            return res.status(401).json({ message: "Could not create lobby, user is not authenticated" });
        }
        lobbyManager.addLobby(name, password, leader);
        return res.status(200).json({ message: "Successfully created lobby" });       // TODO: return the lobby id so that users can navigate to it

    }
}