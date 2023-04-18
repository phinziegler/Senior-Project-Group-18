import Board from "./Board";
import Direction from "../../shared/Direction";
import Player from "./Player";
import Traitor from "./Traitor";
import Room from "../../shared/Room";
import GamePhase from "./GamePhase";

export default class GameState {
    lobbyId: string;
    board: Board;
    currentRoom: Room;
    exploredRooms: Room[] = [];
    players: Player[] = [];
    traitors: Traitor[] = [];
    traitorToVictim: Map<Traitor, Player> = new Map();
    torches: number;
    playerToRoomView: Map<Player, Room> = new Map();
    playerToVoteDirection: Map<Player, Direction> = new Map();
    directionToVotes: Map<Direction, number> = new Map();
    currentPhase: GamePhase = GamePhase.SABOTAGE;

    // TODO: deal with torchbearers/torch assignments
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
                let traitor = new Traitor(player.username, 3);
                this.players.push(traitor);    // TODO: make this not hardcoded
                this.traitors.push(traitor);
            } else {
                this.players.push(new Player(player.username));
            }
        });

        this.torches = 3;
    }

    // handles player sabotage. Returns true if sabotage is successful, otherwise returns false
    setSabotage(traitor: Player, victimUsername: string): boolean {
        if (!(traitor instanceof Traitor) || this.currentPhase !== GamePhase.SABOTAGE || traitor.sabotages <= 0) {
            return false;
        }
        let sabotagedPlayer = this.getPlayerByUsername(victimUsername);
        if (!sabotagedPlayer) {
            return false;
        }
        this.traitorToVictim.set(traitor, sabotagedPlayer);
        return true;
    }

    // sets room that the player will view. Returns true if successful, otherwise returns false
    setRoomToView(player: Player, direction: Direction) {
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
                    this.playerToRoomView.set(player, this.board.rooms[row][col]);
                    return true;
                }
                break;
            case Direction.RIGHT:
                if (this.currentRoom.right) {
                    row = this.currentRoom.row;
                    col = this.currentRoom.col + 1;
                    this.playerToRoomView.set(player, this.board.rooms[row][col]);
                    return true;
                }
                break;
            case Direction.DOWN:
                if (this.currentRoom.down) {
                    row = this.currentRoom.row + 1;
                    col = this.currentRoom.col;
                    this.playerToRoomView.set(player, this.board.rooms[row][col]);
                    return true;
                }
                break;
            case Direction.LEFT:
                if (this.currentRoom.left) {
                    row = this.currentRoom.row;
                    col = this.currentRoom.col - 1;
                    this.playerToRoomView.set(player, this.board.rooms[row][col]);
                    return true;
                }
                break;
        }
        return false;
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
}