import Board from "./Board";
import Direction from "../../shared/Direction";
import Player from "./Player";
import Traitor from "./Traitor";
import Room from "../../shared/Room";
import GamePhase from "../../shared/GamePhase";
import GameManager from "./GameManager";
import Role from "../../shared/Role";
import Environments from "../../shared/Environments";
import { clearInterval } from "timers";

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
    playerToRoomView: Map<Player, { direction: Direction, room: Room }> = new Map();
    playerToVoteDirection: Map<Player, Direction> = new Map();
    directionToVotes: Map<Direction, number> = new Map();
    currentPhase: GamePhase = GamePhase.SABOTAGE;
    gameOver: boolean = false;
    gameOutcome: Role | null = null;
    playerData: { username: string, role: Role }[] = [];
    time: number;
    timerId: NodeJS.Timer | null = null;
    readonly sabotageTime: number;
    readonly voteTime: number;

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

        this.sabotageTime = process.env.NODE_ENV === Environments.PRODUCTION ? 20 : 10;
        this.voteTime = process.env.NODE_ENV === Environments.PRODUCTION ? 20 : 10;
        
        this.time = this.sabotageTime;

        this.updateGame();
    }

    updateGame() {
        this.timerId = setInterval(() => {
            this.time--;
            this.players.forEach(player => GameManager.updateTimer(player, this.time));
        }, 1000);
        if (this.currentPhase === GamePhase.SABOTAGE) {
            setTimeout(() => {
                if (!this.timerId) {
                    return;
                }
                clearInterval(this.timerId);
                this.handleSabotagePhase();
            }, this.sabotageTime * 1000);
        }
        if (this.currentPhase == GamePhase.VOTE) {
            setTimeout(() => {
                if (!this.timerId) {
                    return;
                }
                clearInterval(this.timerId);
                this.handleVotePhase();
            }, this.voteTime * 1000);
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
        this.time = this.voteTime;
        this.players.forEach(player => GameManager.updatePhase(player, this.currentPhase));
        this.players.forEach(player => GameManager.updateTimer(player, this.time));
        this.updateGame();
    }

    handleVotePhase() {
        let max: number = 0;
        let maxVoteDir: Direction = Direction.NONE;

        // Calculate the majority vote direction
        this.directionToVotes.forEach((voteCount, voteDir) => {
            if(voteCount == max) {
                maxVoteDir = Direction.NONE;
            }
            if(voteCount > max) {
                max = voteCount;
                maxVoteDir = voteDir;
            }

        });

        // Send result
        GameManager.sendVoteResult(maxVoteDir, this);
        
        // There was a tie
        if(maxVoteDir == Direction.NONE) {
            this.currentPhase = GamePhase.VOTE;
            this.time = this.voteTime;
            this.players.forEach(player => GameManager.updatePhase(player, this.currentPhase));
            this.players.forEach(player => GameManager.updateTimer(player, this.time));
            this.updateGame();
            return;
        }
        
        this.playerToVoteDirection.clear();
        this.directionToVotes.clear();

        // No tie, party moves
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
            return;
        }

        this.clearTorchAssignments();

        let roomIsExplored = this.exploredRooms.includes(this.currentRoom);

        if (!roomIsExplored) {
            this.assignTorchbearers();
            this.exploredRooms.push(this.currentRoom);
        }

        this.players.forEach(player => GameManager.sendTorchAssignments(player, this));

        this.players.forEach(player => GameManager.sendBoard(player, this));

        this.currentPhase = roomIsExplored ? GamePhase.VOTE : GamePhase.SABOTAGE;
        this.time = roomIsExplored ? this.voteTime : this.sabotageTime;
        this.players.forEach(player => GameManager.updatePhase(player, this.currentPhase));
        this.players.forEach(player => GameManager.updateTimer(player, this.time));
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
            case Direction.NONE:
                this.playerToRoomView.set(player, { direction: direction, room: this.currentRoom });
                return true;
        }
        return false;
    }

    // handles vote selection. Returns true if vote is successful, otherwise returns false
    setVote(player: Player, direction: Direction): boolean {
        if (this.currentPhase != GamePhase.VOTE) {
            return false;
        }

        // Handle Repeat votes
        if (this.playerToVoteDirection.has(player)) {
            // Get their previous vote direction
            let prevVoteDir = this.playerToVoteDirection.get(player);

            // This shouldn't happen
            if (!prevVoteDir) {
                return false;
            }

            // Decrement their previous vote direction
            this.decrementVote(prevVoteDir);

            // Clear previous vote direction
            this.playerToVoteDirection.delete(player);
        }

        // Increment new vote direction and set player vote direction
        this.playerToVoteDirection.set(player, direction);
        this.incrementVote(direction);
        return true;
    }

    private decrementVote(direction: Direction) {
        let votes = this.directionToVotes.get(direction);
        if (votes) {
            votes--;
        } else {
            votes = 0;
        }
        this.directionToVotes.set(direction, votes);
    }

    private incrementVote(direction: Direction) {
        let votes = this.directionToVotes.get(direction)?.valueOf();
        if (votes) {
            votes++;
        } else {
            votes = 1;
        }
        this.directionToVotes.set(direction, votes);
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
        let isTraitor = false;
        this.players.forEach(player => {
            if (player instanceof Traitor) {
                isTraitor = true;
            } else {
                isTraitor = false;
            }
            this.playerData.push({ username: player.username, role: this.gameOutcome = isTraitor ? Role.TRAITOR : Role.INNOCENT })
        })
        this.players.forEach(player => GameManager.sendBoard(player, this));
        this.gameOver = true;
        this.gameOutcome = outcome;
        this.players.forEach(player => GameManager.sendGameOutcome(player, outcome, this.playerData));
    }

    clearIntervals() {
        if (!this.timerId) {
            return;
        }
        clearInterval(this.timerId);
    }
}