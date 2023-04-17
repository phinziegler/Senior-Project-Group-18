import Board from "./Board";
import Direction from "../../shared/Direction";
import Player from "./Player";
import Traitor from "./Traitor";

export default class GameState {
    board: Board;
    players: Player[] = [];
    torches: number;
    playerToDirection: Map<Player, Direction> = new Map();
    directionToVotes: Map<Direction, number> = new Map();

    constructor(usernames: string[], numTraitors: number) {

        if (usernames.length >= numTraitors) {
            throw new Error("Too many traitors");
        }

        let traitorIndexes = this.pickRandomNumbers(numTraitors, usernames.length);

        let boardSize = usernames.length * 2;
        this.board = new Board(boardSize, boardSize, true);

        usernames.forEach((username, index) => {
            if (traitorIndexes.has(index)) {
                this.players.push(new Traitor(username, 3));    // TODO: make this not hardcoded
            } else {
                this.players.push(new Player(username));
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
}