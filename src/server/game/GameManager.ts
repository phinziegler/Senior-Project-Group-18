import GameState from "./GameState";
import { lobbyService } from "../tools/services";
import UserAction from "../../shared/UserAction";

class GameManagerClass {
    games: Map<string, GameState> = new Map();

    async addGame(lobbyId: string, numTraitors: number) {
        let usernames = await lobbyService.getUsers(lobbyId);

        if (!usernames) {
            return;
        }

        try {
            this.games.set(lobbyId, new GameState(usernames, numTraitors));
        } catch {
            console.log("Failed to create game: too many traitors");
        }
    }

    removeGame(lobbyId: string) {
        this.games.delete(lobbyId);
    }

    async handleMessage(username: string, data: {action: UserAction, data: any}) {
        let lobbyId = await lobbyService.lobbyOfUser(username);
        if (!lobbyId) {
            return;
        }
        let gameState = this.games.get(lobbyId);
        switch (data.action) {
            case UserAction.UPDATE:
                
                break;
        }
    }
}

const GameManager = new GameManagerClass();

export default GameManager;
