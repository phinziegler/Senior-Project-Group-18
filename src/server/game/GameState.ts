import Board from "./Board";
import Direction from "../../shared/Direction";
import Player from "./Player";
import Traitor from "./Traitor";
import Room from "../../shared/Room";

export default class GameState {
    board: Board;
    exploredRooms: Room[] = [];
    players: Player[] = [];
    sabotaged: Player[] = [];
    torches: number;
    playerToDirection: Map<Player, Direction> = new Map();
    directionToVotes: Map<Direction, number> = new Map();

    constructor(players: { username: string }[], numTraitors: number) {

        if (players.length <= numTraitors) {
            throw new Error("Too many traitors");
        }

        let traitorIndexes = this.pickRandomNumbers(numTraitors, players.length);

        let boardSize = players.length * 4;
        this.board = new Board(boardSize, boardSize, true);

        players.forEach((player, index) => {
            if (traitorIndexes.has(index)) {
                console.log(`TRAITOR: ${player.username}`);
                this.players.push(new Traitor(player.username, 3));    // TODO: make this not hardcoded
            } else {
                this.players.push(new Player(player.username));
            }
        });

        this.torches = 3;
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