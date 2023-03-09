import { randomUUID } from "crypto";
import AuthToken from "../../shared/AuthToken";

export default class Lobby {
    private _name: string;
    private _password: string;
    private _leader: AuthToken;
    private _id: string;
    private _hasPassword: boolean;

    constructor(name: string, password: string, leader: AuthToken) {
        this._name = name;
        this._password = password;
        this._leader = leader;
        this._id = randomUUID();
        this._hasPassword = Boolean(password);
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get leader() {
        return this._leader;
    }

    get hasPassword() {
        return this._hasPassword;
    }

    /**
     * Convert the lobby object into a simple and sanitized JSON 
     */
    toJson() {
        return {
            id: this._id,
            name: this._name,
            leader: this._leader.username,
            hasPassword: this._hasPassword,
        }
    }
}