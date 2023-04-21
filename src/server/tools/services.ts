import getDbConnection from "./db-connect";

import AuthTokenService from "../services/AuthTokenService";
import UserService from "../services/UserService";
import FriendService from "../services/FriendService";
import LobbyService from "../services/LobbyService";

const userService = new UserService(getDbConnection());
const authTokenService = new AuthTokenService(getDbConnection());
const friendService = new FriendService(getDbConnection());
const lobbyService = new LobbyService(getDbConnection());

export { userService, authTokenService, friendService, lobbyService }