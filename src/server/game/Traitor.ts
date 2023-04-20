import Player from "./Player";

export default class Traitor extends Player {
    sabotages: number;

    constructor(username: string, sabotages: number) {
        super(username);
        this.sabotages = sabotages;
    }
}