import getDb from "./db-connect";

import AuthTokenService from "../services/AuthTokenService";
import UserService from "../services/UserService_";
import FriendService from "../services/FriendService_";
import LobbyService from "../services/LobbyService";

const userService = new UserService(getDb());
const authTokenService = new AuthTokenService(getDb());
const friendService = new FriendService(getDb());
const lobbyService = new LobbyService(getDb());

export { userService, authTokenService, friendService, lobbyService }