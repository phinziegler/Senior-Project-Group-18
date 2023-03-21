import { Request, Response } from "express";
import User, { safeUser } from "../../shared/User";
import Crypto, { randomUUID } from "crypto";
import AuthToken from "../../shared/AuthToken";
import { userService, authTokenService } from "../tools/services";


export default class UserController {

    /**
     * Return the list of users from the database
     */
    static async users(req: Request, res: Response) {
        await userService.getUsers().then(users => res.json(users)).catch(() => console.log("Error getting users"));
    }

    /**
     * Return non-sensitive user information
     * @param req The request should have a username parameter
     */
    static async getUser(req: Request, res: Response) {
        if (!req.params.username) {
            console.log("no username given");
        }
        await userService.getUserWithName(req.params.username).then((user: User) => {
            if (!user) {
                return res.sendStatus(404);
            }
            return res.json(safeUser(user));
        });
    }

    /**
     * Hash a password using a salt
     * @param salt the salt added to the password before hashing
     * @param password the password being hashed
     * @returns the value of a sha256 hash in base 64
     */
    private static saltedHash(salt: string, password: string) {
        return Crypto.createHash('sha256').update(salt + password).digest('base64');
    }

    /**
     * Create salt treating the combination of the username and password as a source of true random.
     * @param username the users username
     * @param password the users password
     * @returns the value of a sha256 hash in base 64
     */
    private static createSalt(username: string, password: string) {
        return Crypto.createHash('sha256').update(password + Math.random() + username).digest('base64');
    }

    /**
     * Add a new user to the database.
     * @param req the request body should be in the form {username:"", password:""}
     */
    static async addUser(req: Request, res: Response) {
        let user: User;
        try {
            user = req.body as User;
            if (!user.password) {
                throw new Error();
            }
            user.salt = UserController.createSalt(user.username, user.password);
            user.password = UserController.saltedHash(user.salt, user.password);
        } catch {
            console.error('invalid JSON message in request body');
            return res.status(400).json({ message: "Failed request" });

        }
        await userService.addUser(user)
            .then(() => res.status(200).json({ message: "Successfully inserted" }))
            .catch(() => res.status(409).json({ message: "Duplicate username" }));
    }

    /**
     * Attempt to log in by comparing the username and password from the DB to the input given
     * @param req the request with a body of the form {username:"", password:""}
     */
    static async login(req: Request, res: Response) {
        await userService.getUserWithName(req.body.username)
            .then(user => {
                if (!user)
                    return res.status(403).json({ message: `No user '${req.body.username}' exists` });
                if (!user.salt)
                    return res.status(500).json({ message: `Could not get salt for user '${user.username}'` });
                if (user.password == UserController.saltedHash(user.salt, req.body.password)) {
                    let token: AuthToken = { username: user.username, token: randomUUID() }
                    authTokenService.add(token);
                    let data = { user: user, token: token.token }
                    return res.status(200).json(data);

                }
                return res.status(401).json({ message: "Invalid credentials" });
            })
            .catch((e: Error) => {
                console.error(e);
                return res.status(500).json();
            });
    }

    /**
     * Authenticate a user using an authentication token instead of a username and password
     * @param req the body should be in the form of an AuthToken (see '/shared/AuthToken.ts')
     */
    static async tokenLogin(req: Request, res: Response) {
        try {
            let token = req.body as AuthToken;
            await authTokenService.checkAuthorized(token).then(success => {
                if (!success)
                    return res.status(401).json({ message: "Invalid credentials" });
                return res.status(200).json({ message: "Successfully authenticated" });
            });
        } catch {
            return res.status(400).json({ message: "Invalid Request format" })
        }
    }

    static async addFriend(req: Request, res: Response) {

    }
}