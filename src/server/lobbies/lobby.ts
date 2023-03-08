import { randomUUID } from "crypto";
import AuthToken from "../../shared/AuthToken";

export default class Lobby {
    private _name: string;
    private _password: string;
    private _leader: AuthToken;
    private _id: string;

    constructor(name: string, password: string, leader: AuthToken) {
        this._name = name;
        this._password = password;
        this._leader = leader;
        this._id = randomUUID();
    }

    get id() {
        return this._id;
    }

    /**
     * Convert the lobby object into a simple and sanitized JSON 
     */
    toJson() {
        return {
            id: this._id,
            name: this._name,
            leader: this._leader.username
        }
    }
}