import { Connection } from "mysql";
import Service from "./Service";
import User from "../../shared/User";

export default class UserService extends Service {
    constructor(connection: Connection) {
        super(connection);
    }

    /**
     * Get all user data
     * @returns an array containing all user information
     */
    async getUsers(): Promise<User[]> {
        const queryString = `SELECT * FROM user`;
        return await this.query(queryString) as User[];
    }

    /**
     * Get the user with the given username
     * @param username the username being searched for
     * @returns a single user object
     */
    async getUserWithName(username: string): Promise<User> {
        const queryString = `SELECT * FROM user WHERE username = ?`;
        return await this.findOne(queryString, username) as User;
    }
}