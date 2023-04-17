export default interface Room {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
    isSafe: boolean;
    isGoal: boolean;
    isVisited: boolean;
}