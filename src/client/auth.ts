import Environments from "../shared/Environments";
import ServerRoutes from "../shared/ServerRoutes";
import User from "../shared/User";
import { POST } from "./fetch";

export default async function login(username: string | undefined, password: string | undefined): Promise<(User | void)> {

    if (!(username && password)) return;    // if one of the parameters is missing, fail to authenticate;

    const loc = process.env.NODE_ENV == Environments.PRODUCTION
        ? window.location.protocol + "//" + window.location.host + ServerRoutes.LOGIN
        : "http://localhost:8000" + ServerRoutes.LOGIN;

    let obj = {
        username: username,
        password: password
    }

    POST(loc, obj).then(res => {
        if (res.status == 200) {
            console.log("successful authentication");
            return res.json();
        }
    }).then((data) => {
        if (!data) {
            console.log("failed to authenticate");
            return;
        }
        return JSON.parse(data.user)
    });
}