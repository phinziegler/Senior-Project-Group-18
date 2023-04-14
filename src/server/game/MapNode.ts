export default class MapNode {
    left: MapNode | null;
    right: MapNode | null;
    forward: MapNode | null;
    back: MapNode | null;
    isSafe: Boolean;
    isGoal: Boolean;
    isVisited: Boolean;

    constructor(left: (MapNode | null) = null,
     right: (MapNode | null) = null,
     forward: (MapNode | null) = null, 
     back: (MapNode | null) = null, 
     isSafe: Boolean = true, isGoal: Boolean = false) {
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