import AuthToken from "../../shared/AuthToken";
import Environments from "../../shared/Environments";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import requestUrl from "./requestUrl";
import { POST } from "./fetch";

export async function login(username: string | undefined, password: string | undefined): Promise<(User | undefined)> {

    if (!(username && password)) return;    // if one of the parameters is missing, fail to authenticate;

    const loc = process.env.NODE_ENV == Environments.PRODUCTION
        ? window.location.protocol + "//" + window.location.host + ServerRoutes.LOGIN
        : "http://localhost:8000" + ServerRoutes.LOGIN;

    let obj = {
        username: username,
        password: password
    }

    return await POST(loc, obj).then(res => {
        if (res.status != 200) {
            console.log("failed authentication");
            return;
        }
        console.log("successful authentication");
        return res.json();
    });
}

/**
 * Authenticate a user by using the locally stored authentication token
 * @returns true if successfully authenticated, false otherwise
 */
export async function tokenLogin(): Promise<boolean> {
    let storageString = window.localStorage.getItem('user');
    if (!storageString) 
        return false;
        
    let storage = JSON.parse(storageString);

    let token: AuthToken = {
        username: storage.user.username,
        token: storage.token
    }

    let loc = requestUrl(ServerRoutes.TOKEN_LOGIN);
    return await POST(loc, token).then((res: Response) => {
        if (res.status == 200) {
            console.log("successful authentication from token");
            return true;
        }
        return false;
    });
}

export function getAuthToken() {
    let storageString = window.localStorage.getItem('user');
    if (!storageString) 
        throw new Error("Cannot get auth token, user may not be logged in.");
        
    let storage = JSON.parse(storageString);

    let token: AuthToken = {
        username: storage.user.username,
        token: storage.token
    }

    return token;
}