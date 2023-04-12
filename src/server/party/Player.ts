import Party from "../party/Party";

export default class Player {
    party: Party;
    id: number;
    isLeader: Boolean;
    isTraitor: Boolean;

    constructor(party: Party, id: number, isTraitor: Boolean = false) {
        this.party = party;
        this.id = id;
        this.isTraitor = isTraitor;
        this.isLeader = false;
    }

    sendMessage(message: String, target: number) {
        this.party.broadcast(message, target);
    }
}