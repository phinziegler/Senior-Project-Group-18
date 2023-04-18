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
        let players = await lobbyService.getUsers(lobbyId);

        if (!players) {
            return;
        }

        try {
            this.games.set(lobbyId, new GameState(players, numTraitors));
            players.forEach(player => socketManager.sendMessageToUser(player.username, JSON.stringify({type: MessageType.GAME_START})));
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
            default:
                break;
        }
    }

    sendRole(player: Player) {
        let isTraitor: boolean = player instanceof Traitor;
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: {event: GameEvent.ROLE_ASSIGN, data: {isTraitor: isTraitor}}}));
    }

    sendBoard(player: Player, gameState: GameState) {
        let isTraitor: boolean = player instanceof Traitor;
        let exploredRooms: Room[] = gameState.exploredRooms;
        let board: Board = gameState.board;


        if (!isTraitor) {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: {event: GameEvent.BOARD_UPDATE, data:{exploredRooms: exploredRooms}} }));
        } else {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: {event: GameEvent.BOARD_UPDATE, data: {exploredRooms: exploredRooms, board: board}} }));
        }
    }

    sendTorchAssignments(player: Player, gameState: GameState) {
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: {event: GameEvent.TORCH_ASSIGN, data: {torchAssignments: gameState.getTorchbearers()}}}));
    }
}

const GameManager = new GameManagerClass();

export default GameManager;
