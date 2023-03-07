import AuthTokenService from "../server/services/AuthTokenService";
import getDb from "./db-connect";
import UserService from "../server/services/userService";

const userService = new UserService(getDb());
const authTokenService = new AuthTokenService(getDb());

export { userService, authTokenService }