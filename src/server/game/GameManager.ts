import GameState from "./GameState";
import { lobbyService } from "../tools/services";
import UserAction from "../../shared/UserAction";
import Player from "./Player";
import { socketManager } from "../server";
import MessageType from "../../shared/MessageTypes";
import Traitor from "./Traitor";
import Board from "./Board";
import Room from "../../shared/Room";
import GameEvent from "../../shared/GameEvent";

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

    async handleMessage(username: string, message: { action: UserAction, data: any }) {
        let lobbyId = await lobbyService.lobbyOfUser(username);
        if (!lobbyId) {
            return;
        }

        let gameState = this.games.get(lobbyId);
        if (!gameState) {
            return;
        }

        let player: Player | void = gameState.getPlayerByUsername(username);
        if (!player) {
            return;
        }

        switch (message.action) {
            case UserAction.UPDATE:
                this.sendRole(player);
                this.sendBoard(player, gameState);
                this.sendTorchAssignments(player, gameState);
                break;
            case UserAction.SABOTAGE:
                break;
            case UserAction.VIEW:
                break;
            case UserAction.VOTE:
                break;
        }
    }

    sendRole(player: Player) {
        let isTraitor: boolean = typeof player == typeof Traitor;
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: {type: GameEvent.ROLE_ASSIGN, isTraitor: isTraitor}}));
    }

    sendBoard(player: Player, gameState: GameState) {
        let isTraitor: boolean = typeof player == typeof Traitor;
        let exploredRooms: Room[] = gameState.exploredRooms;
        let board: Board = gameState.board;

        if (!isTraitor) {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: {type: GameEvent.BOARD_UPDATE, exploredRooms: exploredRooms} }));
        } else {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: {type: GameEvent.BOARD_UPDATE, exploredRooms: exploredRooms, board: board} }));
        }
    }

    sendTorchAssignments(player: Player, gameState: GameState) {
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: {type: GameEvent.TORCH_ASSIGN, torchAssignments: gameState.getTorchbearers()}}));
    }
}

const GameManager = new GameManagerClass();

export default GameManager;
