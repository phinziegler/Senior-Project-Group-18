import { Connection, escape } from "mysql";
import Service from "../tools/Service";
import AuthToken from "../../shared/AuthToken";

/**
 * Performs queries on the user table
 */
export default class AuthTokenService extends Service {
    constructor(db: Connection) {
        super(db, 'authTokens');
    }

    /** Check if a user is authenticated */
    async checkAuthorized(token: AuthToken) {
        return await this.findOne("*", "username = " + escape(token.username) + " AND token = " + escape(token.token)).then(data => {
            if(!data) {
                return false;
            }
            return true;
        })
    }

    /** Add an authenticated user */
    async add(token: AuthToken) {
        await this.insert(token);
    }
}