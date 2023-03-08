/**
 * ServerRoutes contains the string name for all server routes.
 */
const ServerRoutes = {
    SHOW_USERS: "/server/users",
    ADD_USER: "/server/add-user",
    MAKE_LOBBY: "/server/make-lobby",
    GET_LOBBY: ((lobbyId: string) => "/server/get-lobby/" + lobbyId),
    GET_ALL_LOBBIES: "/server/get-lobbies",
    LOGIN: "/server/login",
    TOKEN_LOGIN: "/server/login-token",
    ANY: "*",
    USER: ((username: string) => "/server/get-user/" + username),
}
export default ServerRoutes;