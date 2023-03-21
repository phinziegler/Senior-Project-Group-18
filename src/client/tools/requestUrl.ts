import Environments from "../../shared/Environments";

export default function requestUrl(path: string) {
    return process.env.NODE_ENV == Environments.PRODUCTION
    ? window.location.protocol + "//" + window.location.host + path
    : "http://localhost:8000" + path;
}