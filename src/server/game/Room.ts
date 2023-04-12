export default class Room {
    up: Boolean;
    right: Boolean;
    down: Boolean;
    left: Boolean;
    isSafe: Boolean;
    isGoal: Boolean;
    isVisited: Boolean;

    constructor(forward: Boolean = false, right: Boolean = false, back: Boolean = false, 
        left: Boolean = false, isSafe: Boolean = true, isGoal: Boolean = false) {
        this.up = forward;
        this.right = right;
        this.down = back;
        this.left = left;
        this.isSafe = isSafe;
        this.isGoal = isGoal;
        this.isVisited = false;
    }

    // public toString(): string {
    //     return "{Left: " + this.left?.toString() + "\nRight: \n" + this.right?.toString() + "\nForward: \n" + this.forward?.toString() + "\nBack: \n" + this.back?.toString() + "}";
    // }
}