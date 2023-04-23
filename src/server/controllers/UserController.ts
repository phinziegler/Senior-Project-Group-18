import { Request, Response } from "express";
import User, { safeUser } from "../../shared/User";
import Crypto, { randomUUID } from "crypto";
import AuthToken from "../../shared/AuthToken";
import UserService from "../services/UserService";
import AuthTokenService from "../services/AuthTokenService";
import FriendService from "../services/FriendService";


export default class UserController {

    /**
     * Return non-sensitive user information
     * @param req The request should have a username parameter
     */
    static async getUser(req: Request, res: Response) {
        if (!req.params.username) {
            console.log("no username given");
        }
        await UserService.getUserWithName(req.params.username).then((user: User) => {
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
        await UserService.addUser(user)
            .then(() => res.status(200).json({ message: "Successfully inserted" }))
            .catch(() => res.status(409).json({ message: "Duplicate username" }));
    }

    /**
     * Attempt to log in by comparing the username and password from the DB to the input given
     * @param req the request with a body of the form {username:"", password:""}
     */
    static async login(req: Request, res: Response) {
        await UserService.getUserWithName(req.body.username)
            .then(user => {
                if (!user)
                    return res.status(403).json({ message: `No user '${req.body.username}' exists` });
                if (!user.salt)
                    return res.status(500).json({ message: `Could not get salt for user '${user.username}'` });
                if (user.password == UserController.saltedHash(user.salt, req.body.password)) {
                    let token: AuthToken = { username: user.username, token: randomUUID() }
                    AuthTokenService.add(token);
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
            await AuthTokenService.checkAuthorized(token).then(success => {
                if (!success)
                    return res.status(401).json({ message: "Invalid credentials" });
                return res.status(200).json({ message: "Successfully authenticated" });
            });
        } catch {
            return res.status(400).json({ message: "Invalid Request format" })
        }
    }

    /**
     * Add a user/friend pairing in the database
     * @param req body of the form {auth: AuthToken, target: string}
     */
    static async addFriend(req: Request, res: Response) {
        let auth: AuthToken;
        let targetUsername: string;

        try {
            auth = req.body.auth;
            targetUsername = req.body.target;
        } catch {
            return res.status(403).json({ message: "invalid request body" })
        }

        // Check if the user is authenticated
        if (!await AuthTokenService.checkAuthorized(auth)) {
            return res.status(401).json({ message: "user could not be authenticated" })
        }

        // Check if the user is friending themselves
        if (auth.username == targetUsername) {
            return res.status(403).json({ message: "cannot add self oneself as a friend" })
        }

        // Get the user and friend objects
        let user = (await UserService.getUserWithName(auth.username));
        let friend = (await UserService.getUserWithName(targetUsername));

        // Check that the user and friend exist in the database
        if (!(user && friend)) {
            return res.status(404).json({ message: "could not find friend/user" });
        }

        // Check if already friends
        if (await FriendService.isFriend(user, friend)) {
            return res.status(403).json({ message: "This user is already a friend" });
        }


        // Add the friend for the user
        await FriendService.addFriend(user, friend)
            .then(() => res.status(200).json({ message: "successfully added friend" }))
            .catch(() => res.status(500).json({ message: "server error" }))
    }

    static async isFriend(req: Request, res: Response) {
        let username: string;
        let friendUsername: string;

        try {
            username = req.params.user;
            friendUsername = req.params.friend;
        } catch {
            return res.status(403).json({ message: "invalid request body" })
        }

        // Get the user and friend objects
        let user = (await UserService.getUserWithName(username));
        let friend = (await UserService.getUserWithName(friendUsername));

        // Check that the user and friend exist in the database
        if (!(user && friend)) {
            return res.status(404).json({ message: "could not find friend/user" });
        }

        let isFriend = await FriendService.isFriend(user, friend).catch(() => {
            return res.status(500).json({ message: "server error" });
        });

        return res.status(200).json({ message: "successfully checked if friends", friends: isFriend });

    }
}