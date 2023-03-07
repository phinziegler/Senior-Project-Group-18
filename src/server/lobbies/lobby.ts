import { randomUUID } from "crypto";
import AuthToken from "../../shared/AuthToken";

export default class Lobby {
    name: string;
    password: string;
    leader: AuthToken;
    id: string;

    constructor(name: string, password: string, leader: AuthToken) {
        this.name = name;
        this.password = password;
        this.leader = leader;
        this.id = randomUUID();
    }
}