import { Connection } from "mysql";
import Service from "./Service";
import User from "../../shared/User";

/**
 * Performs queries on the user table
 */
export default class UserService extends Service {
    constructor(db: Connection) {
        super(db, 'user');
    }

    /**
     * Get all user data
     * @returns an array containing all user information
     */
    public async getUsers(): Promise<User[]> {
        return await this.find("*") as User[];
    }

    /**
     * Get the user with the given username
     * @param username the username being searched for
     * @returns a single user object
     */
    public async getUserWithName(username: string): Promise<User> {
        return await this.findOne("*", "username = ?", username) as User;
    }
}