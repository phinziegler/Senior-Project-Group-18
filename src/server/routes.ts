import Controller from "./controllers/Controller";
import UserController from "./controllers/UserController";
import ServerRoutes from "../shared/ServerRoutes";
import LobbyController from "./controllers/LobbyController";

const express = require("express");
const router = express.Router();

// 'Other' page
router.route(ServerRoutes.SHOW_USERS).get(UserController.users);
router.route(ServerRoutes.ADD_USER).post(UserController.addUser);

// Authentication
router.route(ServerRoutes.LOGIN).post(UserController.login);
router.route(ServerRoutes.TOKEN_LOGIN).post(UserController.tokenLogin);

// User page
router.route(ServerRoutes.USER(":username")).get(UserController.getUser);

// Lobbies
router.route(ServerRoutes.MAKE_LOBBY).post(LobbyController.makeLobby)
router.route(ServerRoutes.GET_ALL_LOBBIES).get(LobbyController.getLobbies);
router.route(ServerRoutes.GET_LOBBY(":lobbyId")).get(LobbyController.getLobby);
router.route(ServerRoutes.JOIN_LOBBY).post(LobbyController.joinLobby);
router.route(ServerRoutes.GET_LOBBY_USERS(":lobbyId")).get(LobbyController.getUsers);

// Friends
router.route(ServerRoutes.ADD_FRIEND).post(UserController.addFriend);
router.route(ServerRoutes.IS_FRIEND(":user", ":friend")).get(UserController.isFriend)

/*  This route catches any unexpected route and returns index.html
    This allows the client side router to see if it has a valid route, and if not, shows the custom error screen 
    CRITCAL: this route should always be at the BOTTOM of this page.*/
router.route(ServerRoutes.ANY).get(Controller.sendHtml);

// the router object so that it can be used by the express app (see server.ts)
export { router }