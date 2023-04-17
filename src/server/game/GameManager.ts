import GameState from "./GameState";
import { lobbyService } from "../tools/services";

export default class GameManager {
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
}