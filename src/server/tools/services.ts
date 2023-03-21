import AuthTokenService from "../services/AuthTokenService";
import getDb from "./db-connect";
import UserService from "../services/userService";

const userService = new UserService(getDb());
const authTokenService = new AuthTokenService(getDb());

export { userService, authTokenService }