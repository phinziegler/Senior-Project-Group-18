import GameState from "./GameState";
import UserAction from "../../shared/UserAction";
import Player from "./Player";
import { socketManager } from "../server";
import MessageType from "../../shared/MessageTypes";
import Traitor from "./Traitor";
import Board from "./Board";
import Room from "../../shared/Room";
import GameEvent from "../../shared/GameEvent";
import Direction from "../../shared/Direction";
import Role from "../../shared/Role";
import GamePhase from "../../shared/GamePhase";
import LobbyService from "../services/LobbyService";

class GameManagerClass {
    games: Map<string, GameState> = new Map();

    lobbyHasActiveGame(lobbyId: string) {
        return this.games.has(lobbyId);
    }

    async addGame(lobbyId: string) {
        let players = await LobbyService.getUsers(lobbyId);

        if (!players) {
            return;
        }

        try {
            this.games.set(lobbyId, new GameState(lobbyId, players, Math.max(1, Math.floor(players.length / 4))));
            players.forEach(player => socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME_START })));
        } catch {
            console.log("Failed to create game: too many traitors");
        }

        console.log(this.games.size);
    }

    removeGame(lobbyId: string) {
        let toRemove = this.games.get(lobbyId);
        if(!toRemove) {
            return;
        }
        toRemove.clearIntervals();
        toRemove.players.forEach(player => socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME_END })));
        this.games.delete(lobbyId);
        console.log(this.games.size);
    }

    async handleMessage(username: string, message: { action: UserAction, data: any }) {
        let lobbyId = await LobbyService.lobbyOfUser(username);

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
                this.updatePhase(player, gameState.currentPhase);
                this.updateTimer(player, gameState.time);
                if (gameState.gameOver) {
                    this.sendGameOutcome(player, gameState.gameOutcome, gameState.playerData);
                }
                break;
            case UserAction.UNSABOTAGE:
                this.handleUnsabotage(player, gameState, message.data.victim);
                break;
            case UserAction.SABOTAGE:
                this.handleSabotage(player, gameState, message.data.victim);
                break;
            case UserAction.VIEW:
                this.handleViewRoom(player, gameState, message.data.direction);
                break;
            case UserAction.VOTE:
                this.handleVote(player, gameState, message.data.direction);
                break;
            default:
                break;
        }
    }

    handleSabotage(sabotager: Player, gameState: GameState, victimUsername: string) {
        if (gameState.setSabotage(sabotager, victimUsername)) {
            gameState.traitors.forEach(traitor => socketManager.sendMessageToUser(traitor.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.SABOTAGE, data: { sabotager: sabotager.username, victim: victimUsername, success: true } } })));
        } else {
            socketManager.sendMessageToUser(sabotager.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.SABOTAGE, data: { message: "Sabotage failed.", success: false } } }));
        }
    }

    handleUnsabotage(sabotager: Player, gameState: GameState, victimUsername: string) {
        if (gameState.resetSabotage(sabotager, victimUsername)) {
            gameState.traitors.forEach(traitor => socketManager.sendMessageToUser(traitor.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.UNSABOTAGE, data: { sabotager: sabotager.username, victim: victimUsername, success: true } } })));
        } else {
            socketManager.sendMessageToUser(sabotager.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.UNSABOTAGE, data: { message: "Sabotage failed.", success: false } } }));
        }
    }

    sendSabotageNumber(traitor: Player, sabotages: number) {
        socketManager.sendMessageToUser(traitor.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.SABOTAGE_NUMBER, data: { remainingSabotages: sabotages, success: true } } }));
    }

    handleViewRoom(playerToView: Player, gameState: GameState, direction: Direction) {
        if (gameState.setRoomToView(playerToView, direction)) {
            gameState.players.forEach((player) => socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.ROOM_SELECT, data: { player: playerToView.username, direction: direction, success: true } } })));
        } else {
            socketManager.sendMessageToUser(playerToView.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.ROOM_SELECT, data: { message: "Room selection failed.", success: false } } }));
        }
    }

    handleVote(playerToView: Player, gameState: GameState, direction: Direction) {
        if (gameState.setVote(playerToView, direction)) {
            gameState.players.forEach((player) => socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.PLAYER_VOTE, data: { player: playerToView.username, direction: direction, success: true } } })));
        } else {
            socketManager.sendMessageToUser(playerToView.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.PLAYER_VOTE, data: { message: "Vote operation failed.", success: false } } }));
        }
    }

    sendRole(player: Player, gameState: GameState) {
        let isTraitor: boolean = player instanceof Traitor;
        let traitorUsernames: string[] = [];
        gameState.traitors.forEach((traitor => traitorUsernames.push(traitor.username)));
        if (isTraitor) {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.ROLE_ASSIGN, data: { isTraitor: isTraitor, traitors: traitorUsernames, sabotages: (player as Traitor).sabotages } } }));
        } else {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.ROLE_ASSIGN, data: { isTraitor: isTraitor } } }));
        }
    }

    sendVoteResult(voteDir: string, gameState: GameState) {
        gameState.players.forEach(player => {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.VOTE_RESULT, data: { voteDir: voteDir } } }));
        });
    }

    sendMovementResult(nextRoomIsSafe: boolean, gameState: GameState) {
        gameState.players.forEach(player => {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.MOVE_RESULT, data: { nextRoomIsSafe: nextRoomIsSafe } } }));
        });
    }

    sendBoard(player: Player, gameState: GameState) {
        let isTraitor: boolean = player instanceof Traitor;
        let exploredRooms: Room[] = gameState.exploredRooms;
        let board: Board = gameState.board;


        if (!isTraitor && !gameState.gameOver) {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.BOARD_UPDATE, data: { lobbyId: gameState.lobbyId, currentRoom: gameState.currentRoom, exploredRooms: exploredRooms, rows: board.rows, cols: board.cols } } }));
        } else {
            socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.BOARD_UPDATE, data: { lobbyId: gameState.lobbyId, currentRoom: gameState.currentRoom, exploredRooms: exploredRooms, board: board } } }));
        }
    }

    sendTorchAssignments(player: Player, gameState: GameState) {
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.TORCH_ASSIGN, data: { torchAssignments: gameState.getTorchbearers() } } }));
    }

    sendRoomInfo(player: Player, direction: Direction, isSafe: boolean) {
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.VIEW_ROOM, data: { direction: direction, isSafe: isSafe } } }));
    }

    sendGameOutcome(player: Player, outcome: Role | null, playerData: { username: string, role: Role }[]) {
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.GAME_END, data: { winning: outcome, playerData: playerData } } }));
    }

    updatePhase(player: Player, phase: GamePhase) {
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.UPDATE_PHASE, data: { phase: phase } } }));
    }

    updateTimer(player: Player, time: number) {
        socketManager.sendMessageToUser(player.username, JSON.stringify({ type: MessageType.GAME, data: { event: GameEvent.UPDATE_TIMER, data: { time: time } } }));
    }
}

const GameManager = new GameManagerClass();

export default GameManager;
