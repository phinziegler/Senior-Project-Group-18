export default class Room {
    left: Boolean;
    right: Boolean;
    forward: Boolean;
    back: Boolean;
    isSafe: Boolean;
    isGoal: Boolean;
    isVisited: Boolean;

    constructor(left: Boolean = false, right: Boolean = false, forward: Boolean = false,
          back: Boolean = false, isSafe: Boolean = true, isGoal: Boolean = false) {
        this.left = left;
        this.right = right;
        this.forward = forward;
        this.back = back;
        this.isSafe = isSafe;
        this.isGoal = isGoal;
        this.isVisited = false;
    }

    // public toString(): string {
    //     return "{Left: " + this.left?.toString() + "\nRight: \n" + this.right?.toString() + "\nForward: \n" + this.forward?.toString() + "\nBack: \n" + this.back?.toString() + "}";
    // }
}