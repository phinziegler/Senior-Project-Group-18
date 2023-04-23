import { Connection, escape } from "mysql";
import Service from "../tools/Service";
import User from "../../shared/User";

/**
 * Performs queries on the user table
 */
class UserServiceClass extends Service {
    constructor() {
        super('user');
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
        return await this.findOne("*", "username = " + escape(username)) as User;
    }

    public async usernameFromId(id: number): Promise<User> {
        return await this.findOne(["*"], "id = " + id);
    }

    /**
     * Add a user to the user table
     * @param user the user being added
     * @throws a generic error when the insert could not
     *      be completed, likely due to a duplicate username
     */
    public async addUser(user: User) {
        await this.insert(user);
    }
}

const UserService = new UserServiceClass();
export default UserService;