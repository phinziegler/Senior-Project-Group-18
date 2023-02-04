import { NextFunction, Request, Response } from "express";
import path from "path";
import STATIC_PATH from "../static-path";

/**
 * This is a General controller class. If the app was more complex, you might have separate controllers for various aspects.
 * For example, if you had a database with users that have their own specific functions, you might make a UserController class.
 * 
 * EXPORT DEFAULT -->   The "export" keyword allows you to use created classes, functions, and variables.
 *                      The "default" keyword means that you can use the form "import Controller from '<relative-path>'"
 */
export default class Controller {

    // Basic "send" response which simply returns a string to the user
    static hello(req: Request, res: Response, next: NextFunction) {
        res.send("Hello");
    }

    // example sending a json response
    static world(req: Request, res: Response, next: NextFunction) {
        res.json({ message: "world" });
    }

    static sendHtml(req: Request, res: Response, next: NextFunction) {
        let file = path.join(STATIC_PATH, 'index.html');
        res.sendFile(file);
    }
}