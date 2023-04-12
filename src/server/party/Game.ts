import Party from "./Party";

export default class Game {
    party: Party;

    constructor() {
        this.party = new Party(/*createMap()*/);
        // this.partyMap = partyMap;
        // this.fullMap = fullMap;
    }

    // createMap():(Map) {
    //     let map: Map = new Map;
    //     // create map
    // }
}