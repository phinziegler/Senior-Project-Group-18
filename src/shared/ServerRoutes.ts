/**
 * ServerRoutes contains the string name for all server routes.
 */
const ServerRoutes = {
    SHOW_USERS: "/users",
    ADD_USER: "/add-user",
    MAKE_LOBBY: "/make-lobby",
    GET_LOBBY: ((lobbyId: string) => "/get-lobby/" + lobbyId),
    GET_ALL_LOBBIES: "/get-lobbies",
    LOGIN: "/login",
    TOKEN_LOGIN: "/login-token",
    ANY: "*",
    USER: ((username: string) => "/get-user/" + username),
}
export default ServerRoutes;