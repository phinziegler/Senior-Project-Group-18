import { NextFunction, Request, Response } from "express";
import UserService from "../services/userService";
import getDb from "../services/db-connect";
import User from "../../shared/User";

const service = new UserService(getDb());
export default class UserController {

    /**
     * Return the list of users from the database
     */
    static async users(req: Request, res: Response, next: NextFunction) {
        await service.getUsers().then(users => res.json(users)).catch(() => console.log("Error getting users"));
    }

    /**
     * Add a new user to the database.
     * TODO: This method should eventually generate salt, and hash the password before
     * passing it into the service function
     * @param req the request body should be in the form {username:"", password:""}
     */
    static async addUser(req: Request, res: Response, next: NextFunction) {
        let user: User = req.body as User;
        try {
            user = req.body as User;
            user.salt = "THIS SALT WAS DESIGNATED BY THE SERVER";
        } catch {
            console.error('invalid JSON message in request body');
            res.sendStatus(400);
            return;
        }
        await service.addUser(user)
        .then(() => {
            res.status(200);
            res.json({message: "Successfully inserted"});
        })
        .catch(() => {
            res.status(409);
            res.json({message: "Duplicate username"});
        });
    }
}