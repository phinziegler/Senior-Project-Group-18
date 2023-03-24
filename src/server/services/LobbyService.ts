import { Connection, escape } from "mysql";
import Service from "../tools/Service";
import AuthToken from "../../shared/AuthToken";

/**
 * Performs queries on the user table
 */
export default class LobbyService extends Service {
    constructor(db: Connection) {
        super(db, 'lobby');
    }

    addUser() {

    }

    addLobby() {

    }

    getLobby() {

    }

    getLobbies() {

    }

    userInLobby() {

    }

    removeUser() {
        
    }
}