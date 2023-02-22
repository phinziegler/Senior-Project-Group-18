import Controller from "./controllers/controller";
import UserController from "./controllers/userController";
import ServerRoutes from "../shared/ServerRoutes";

const express = require("express");
const router = express.Router();

/*  note that get() refers to a GET request on "/hello"
    if you wanted to accept POST requests on "/hello" you would use post() and pass in whichever logic you wanted */
router.route("/hello").get(Controller.hello);
router.route("/world").get(Controller.world);

// 'Other' page
router.route(ServerRoutes.SHOW_USERS).get(UserController.users);
router.route(ServerRoutes.ADD_USER).post(UserController.addUser);

// Login page
router.route(ServerRoutes.LOGIN).post(UserController.login)

/*  This route catches any unexpected route and returns index.html
    This allows the client side router to see if it has a valid route, and if not, shows the custom error screen 
    CRITCAL: this route should always be at the BOTTOM of this page.*/
router.route(ServerRoutes.ANY).get(Controller.sendHtml);

// the router object so that it can be used by the express app (see server.ts)
export { router }