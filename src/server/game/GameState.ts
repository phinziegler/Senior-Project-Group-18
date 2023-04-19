import Board from "./Board";
import Direction from "../../shared/Direction";
import Player from "./Player";
import Traitor from "./Traitor";
import Room from "../../shared/Room";
import GamePhase from "./GamePhase";
import GameManager from "./GameManager";
import Role from "../../shared/Role";

export default class GameState {
    lobbyId: string;
    board: Board;
    currentRoom: Room;
    exploredRooms: Room[] = [];
    players: Player[] = [];
    traitors: Traitor[] = [];
    traitorToVictims: Map<Traitor, Set<Player>> = new Map();
    torches: number;
    currTorchIndex: number = 0;
    playerToRoomView: Map<Player, {direction: Direction, room: Room}> = new Map();
    playerToVoteDirection: Map<Player, Direction> = new Map();
    directionToVotes: Map<Direction, number> = new Map();
    currentPhase: GamePhase = GamePhase.SABOTAGE;
    time: number = 0;

    constructor(lobbyId: string, players: { username: string }[], numTraitors: number) {
        this.lobbyId = lobbyId;

        if (players.length <= numTraitors) {
            throw new Error("Too many traitors");
        }

        let traitorIndexes = this.pickRandomNumbers(numTraitors, players.length);

        let boardSize = players.length * 4;
        this.board = new Board(boardSize, boardSize, true);
        this.currentRoom = this.board.rooms[0][boardSize / 2];
        this.exploredRooms.push(this.currentRoom);

        players.forEach((player, index) => {
            if (traitorIndexes.has(index)) {
                console.log(`TRAITOR: ${player.username}`);
                let traitor = new Traitor(player.username, 2);
                this.players.push(traitor);
                this.traitors.push(traitor);
            } else {
                this.players.push(new Player(player.username));
            }
        });

        this.torches = Math.min(this.players.length, 3 + ((numTraitors - 1) * 2));

        this.assignTorchbearers();

        this.updateGame();
    }

    updateGame() {
        setInterval(() => {
            this.time++;
            this.players.forEach(player => GameManager.updateTimer(player, this.time));
        }, 1000);
        if (this.currentPhase == GamePhase.SABOTAGE) {
            this.time = 0;
            setTimeout(() => this.handleSabotagePhase(), 20000);
        }
        if (this.currentPhase == GamePhase.VOTE) {
            this.time = 0;
            setTimeout(() => this.handleVotePhase(), 60000);
        }
    }

    handleSabotagePhase() {
        let sabotagedPlayers: Set<Player> = new Set();
        this.traitorToVictims.forEach((players, traitor) => {
            players.forEach(player => {
                sabotagedPlayers.add(player);
                traitor.sabotages--;
            }
            )
        });

        this.traitors.forEach(traitor => GameManager.sendSabotageNumber(traitor, traitor.sabotages));

        this.playerToRoomView.forEach((value, player) => {
            let isSafe = value.room.isSafe;
            if (sabotagedPlayers.has(player)) {
                isSafe = !isSafe;
            }
            GameManager.sendRoomInfo(player, value.direction, isSafe);
        });

        this.traitorToVictims.clear();
        this.playerToRoomView.clear();

        this.currentPhase = GamePhase.VOTE;
        this.updateGame();
    }

    handleVotePhase() {
        let max: number = -1;
        let maxVoteDir: Direction = Direction.UP;

        this.directionToVotes.forEach((voteCount, voteDir) => {
            if (voteCount > max) {
                max = voteCount;
                maxVoteDir = voteDir;
            } else if (voteCount == max) {
                // The vote was tied, revote
                this.playerToVoteDirection.clear();
                this.directionToVotes.clear();
                GameManager.sendVoteResult("tie", this);
                this.currentPhase = GamePhase.VOTE;
                this.updateGame();
                return;
            }
        });

        this.playerToVoteDirection.clear();
        this.directionToVotes.clear();
        GameManager.sendVoteResult(maxVoteDir, this);

        this.handlePartyMovement(maxVoteDir);
    }

    handlePartyMovement(maxVoteDir: Direction) {
        let nextRoomIsSafe: boolean = true;
        let nextRoom: Room = this.currentRoom;
        let row: number;
        let col: number;

        switch (maxVoteDir) {
            case Direction.UP:
                if (this.currentRoom.up) {
                    row = this.currentRoom.row - 1;
                    col = this.currentRoom.col;
                    nextRoom = this.board.rooms[row][col];
                    nextRoomIsSafe = this.board.rooms[row][col].isSafe;
                }
                break;
            case Direction.RIGHT:
                if (this.currentRoom.right) {
                    row = this.currentRoom.row;
                    col = this.currentRoom.col + 1;
                    nextRoom = this.board.rooms[row][col];
                    nextRoomIsSafe = this.board.rooms[row][col].isSafe;
                }
                break;
            case Direction.DOWN:
                if (this.currentRoom.down) {
                    row = this.currentRoom.row + 1;
                    col = this.currentRoom.col;
                    nextRoom = this.board.rooms[row][col];
                    nextRoomIsSafe = this.board.rooms[row][col].isSafe;
                }
                break;
            case Direction.LEFT:
                if (this.currentRoom.left) {
                    row = this.currentRoom.row;
                    col = this.currentRoom.col - 1;
                    nextRoom = this.board.rooms[row][col];
                    nextRoomIsSafe = this.board.rooms[row][col].isSafe;
                }
                break;
        }

        GameManager.sendMovementResult(nextRoomIsSafe, this);

        this.currentRoom = nextRoom;

        if (!this.currentRoom.isSafe) {
            this.torches--;
            if (this.torches == 0) {
                this.endGame(Role.TRAITOR);
                return;
            }
            this.currentRoom.isSafe = true;
        }

        if (this.currentRoom === this.board.goal) {
            this.endGame(Role.INNOCENT);
        }

        this.clearTorchAssignments();
        if (!this.exploredRooms.includes(this.currentRoom)) {
            this.assignTorchbearers();
            this.players.forEach(player => GameManager.sendTorchAssignments(player, this));
            this.exploredRooms.push(this.currentRoom);
        }

        this.players.forEach(player => GameManager.sendBoard(player, this));

        this.currentPhase = GamePhase.SABOTAGE;
        this.updateGame();
    }

    clearTorchAssignments() {
        this.players.forEach(player => player.hasTorch = false);
    }

    assignTorchbearers() {
        for (let i = 0; i < this.torches; i++) {
            this.players[this.currTorchIndex].hasTorch = true;
            this.currTorchIndex = (this.currTorchIndex + 1) % this.players.length;
        }
    }

    // handles player sabotage. Returns true if sabotage is successful, otherwise returns false
    setSabotage(traitor: Player, victimUsername: string): boolean {
        if (!(traitor instanceof Traitor) || this.currentPhase !== GamePhase.SABOTAGE || traitor.sabotages <= 0) {
            return false;
        }
        let sabotagedPlayer = this.getPlayerByUsername(victimUsername);
        if (!sabotagedPlayer || !sabotagedPlayer.hasTorch) {
            return false;
        }

        if (!this.traitorToVictims.get(traitor)) {
            this.traitorToVictims.set(traitor, new Set<Player>().add(sabotagedPlayer));
        } else {
            this.traitorToVictims.get(traitor)?.add(sabotagedPlayer);
        }

        return true;
    }

    resetSabotage(traitor: Player, victimUsername: string): boolean {
        if (!(traitor instanceof Traitor) || this.currentPhase !== GamePhase.SABOTAGE) {
            return false;
        }

        let victimsOfTraitor = this.traitorToVictims.get(traitor);

        if (!victimsOfTraitor) {
            return false;
        }

        let victim = this.getPlayerByUsername(victimUsername);

        if (!victim) {
            return false;
        }

        return victimsOfTraitor.delete(victim);
    }

    // sets room that the player will view. Returns true if successful, otherwise returns false
    setRoomToView(player: Player, direction: Direction): boolean {
        if (!player.hasTorch) {
            return false;
        }

        let row;
        let col;

        switch (direction) {
            case Direction.UP:
                if (this.currentRoom.up) {
                    row = this.currentRoom.row - 1;
                    col = this.currentRoom.col;
                    this.playerToRoomView.set(player, { direction: direction, room: this.board.rooms[row][col] });
                    return true;
                }
                break;
            case Direction.RIGHT:
                if (this.currentRoom.right) {
                    row = this.currentRoom.row;
                    col = this.currentRoom.col + 1;
                    this.playerToRoomView.set(player, { direction: direction, room: this.board.rooms[row][col] });
                    return true;
                }
                break;
            case Direction.DOWN:
                if (this.currentRoom.down) {
                    row = this.currentRoom.row + 1;
                    col = this.currentRoom.col;
                    this.playerToRoomView.set(player, { direction: direction, room: this.board.rooms[row][col] });
                    return true;
                }
                break;
            case Direction.LEFT:
                if (this.currentRoom.left) {
                    row = this.currentRoom.row;
                    col = this.currentRoom.col - 1;
                    this.playerToRoomView.set(player, { direction: direction, room: this.board.rooms[row][col] });
                    return true;
                }
                break;
        }
        return false;
    }

    // handles vote selection. Returns true if vote is successful, otherwise returns false
    setVote(player: Player, direction: Direction): boolean {
        if (this.currentPhase != GamePhase.VOTE) {
            return false;
        }
        this.playerToVoteDirection.set(player, direction);
        return true;
    }


    pickRandomNumbers(amount: number, limit: number): Set<number> {
        let numbers: Set<number> = new Set();

        while (numbers.size < amount) {
            numbers.add(Math.floor(Math.random() * limit));
        }

        return numbers;
    }

    getPlayerByUsername(username: string): Player | void {
        for (let player of this.players) {
            if (player.username === username) {
                return player;
            }
        }
    }

    getTorchbearers(): string[] {
        let torchbearers: string[] = [];
        this.players.forEach(player => {
            if (player.hasTorch) {
                torchbearers.push(player.username);
            }
        });
        return torchbearers;
    }

    endGame(outcome: Role) {
        let playerData: { username: string, role: Role }[] = [];
        let isTraitor = false;
        this.players.forEach(player => {
            if (player instanceof Traitor) {
                isTraitor = true;
            } else {
                isTraitor = false;
            }
            playerData.push({ username: player.username, role: isTraitor ? Role.TRAITOR : Role.INNOCENT })
        })
        GameManager.sendGameOutcome(outcome, playerData, this);
    }
}