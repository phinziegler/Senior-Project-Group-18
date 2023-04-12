import Player from "../party/Player";

export default class Party {
    players: Player[];
    // partyMap: Map;
    // fullMap: Map;

    constructor(/*Map fullMap*/) {
        this.players = this.addPlayers();
        // this.fullMap = fullMap;
        // this.partyMap = partyMap;
    }

    addPlayers():(Player[]) {
        let players: Player[] = [new Player(this, 0, false)];


        return players;
    }

    broadcast(message: String, target: number) {
        if (target == -1) {
            this.broadcastAll(message);
        } else {

        }
    }

    broadcastAll(message: String) {
        for (let player of this.players) {
            this.broadcast(message, player.id);
        }
    }

    // createMap():(Map) {
    //     let map: Map = new Map;
    //     // create map
    // }
}