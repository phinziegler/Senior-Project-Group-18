import { NextFunction, Request, Response } from "express";
import UserService from "../services/userService";
import getDb from "../services/db-connect";

const service = new UserService(getDb());
export default class UserController {

    /**
     * Return the list of users from the database
     */
    static async users(req: Request, res: Response, next: NextFunction) {
        await service.getUsers().then(users => res.json(users));
    }
}