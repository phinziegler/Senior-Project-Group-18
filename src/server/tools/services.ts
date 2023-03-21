import AuthTokenService from "../services/AuthTokenService";
import getDb from "./db-connect";
import UserService from "../services/userService";
import FriendService from "../services/friendService";

const userService = new UserService(getDb());
const authTokenService = new AuthTokenService(getDb());
const friendService = new FriendService(getDb());

export { userService, authTokenService, friendService }