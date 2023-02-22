import { NextFunction, Request, Response } from "express";
import UserService from "../services/userService";
import getDb from "../services/db-connect";
import User from "../../shared/User";
import Crypto from "crypto";

const service = new UserService(getDb());
export default class UserController {

    /**
     * Return the list of users from the database
     */
    static async users(req: Request, res: Response, next: NextFunction) {
        await service.getUsers().then(users => res.json(users)).catch(() => console.log("Error getting users"));
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
    static async addUser(req: Request, res: Response, next: NextFunction) {
        let user: User;
        try {
            user = req.body as User;
            user.salt = UserController.createSalt(user.username, user.password);
            user.password = UserController.saltedHash(user.salt, user.password);
        } catch {
            console.error('invalid JSON message in request body');
            return res.sendStatus(400);

        }
        await service.addUser(user)
            .then(() => res.status(200).json({ message: "Successfully inserted" }))
            .catch(() => res.status(409).json({ message: "Duplicate username" }));
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        await service.getUserWithName(req.body.username)
            .then(user => {
                if (!user)
                    return res.status(403).json({ message: `No user '${req.body.username}' exists` });
                if (!user.salt)
                    return res.status(500).json({ message: `Could not get salt for user '${user.username}'` });
                if (user.password == UserController.saltedHash(user.salt, req.body.password))
                    return res.status(200).json({ message: "Successfully authenticated" });
                return res.status(401).json({ message: "Invalid credentials" });
            })
            .catch((e: Error) => {
                console.error(e.message);
                return res.status(500).json();
            });
    }
}