export default interface Room {
    row: number;
    col: number;
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
    isSafe: boolean;
    isGoal: boolean;
    isVisited: boolean;
}