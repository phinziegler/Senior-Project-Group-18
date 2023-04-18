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
import Direction from "../../shared/Direction";

class GameManagerClass {
    games: Map<string, GameState> = new Map();

    async addGame(lobbyId: string, numTraitors: number) {
        let players = await lobbyService.getUsers(lobbyId);

        if (!players) {
            return;
        }

        try {
            this.games.set(lobbyId, new GameState(lobbyId, players, numTraitors));
            players.forEach(player => socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME_START })));
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
                this.sendRole(player, gameState);
                this.sendBoard(player, gameState);
                this.sendTorchAssignments(player, gameState);
                break;
            case UserAction.SABOTAGE:
                this.handleSabotage(player, gameState, message.data.victim);
                break;
            case UserAction.VIEW:
                this.handleViewRoom(player, gameState, message.data.direction);
                break;
            case UserAction.VOTE:
                break;
            default:
                break;
        }
    }

    handleSabotage(sabotager: Player, gameState: GameState, victimUsername: string) {
        if (gameState.setSabotage(sabotager, victimUsername)) {
            gameState.traitors.forEach(traitor => socketManager.sendMessageToUser(traitor.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.SABOTAGE, data: { sabotager: sabotager.username, victim: victimUsername, remainingSabotages: (sabotager as Traitor).sabotages, success: true } } })));
        } else {
            socketManager.sendMessageToUser(sabotager.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.SABOTAGE, data: { message: "Sabotage failed.", success: false } } }));
        }
    }

    handleViewRoom(playerToView: Player, gameState: GameState, direction: Direction) {
        if (gameState.setRoomToView(playerToView, direction)) {
            gameState.players.forEach((player) => socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.ROOM_SELECT, data: { player: playerToView.username, direction: direction, success: true } } })));
        } else {
            socketManager.sendMessageToUser(playerToView.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.ROOM_SELECT, data: { message: "Room selection failed.", success: false } } }));
        }
    }

    sendRole(player: Player, gameState: GameState) {
        let isTraitor: boolean = player instanceof Traitor;
        if (isTraitor) {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.ROLE_ASSIGN, data: { traitors: gameState.traitors, isTraitor: isTraitor } } }));
        } else {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.ROLE_ASSIGN, data: { isTraitor: isTraitor } } }));
        }
    }

    sendBoard(player: Player, gameState: GameState) {
        let isTraitor: boolean = player instanceof Traitor;
        let exploredRooms: Room[] = gameState.exploredRooms;
        let board: Board = gameState.board;


        if (!isTraitor) {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.BOARD_UPDATE, data: { lobbyId: gameState.lobbyId, exploredRooms: exploredRooms, rows: board.rows, cols: board.cols } } }));
        } else {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.BOARD_UPDATE, data: { lobbyId: gameState.lobbyId, exploredRooms: exploredRooms, board: board } } }));
        }
    }

    sendTorchAssignments(player: Player, gameState: GameState) {
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.TORCH_ASSIGN, data: { torchAssignments: gameState.getTorchbearers() } } }));
    }
}

const GameManager = new GameManagerClass();

export default GameManager;
