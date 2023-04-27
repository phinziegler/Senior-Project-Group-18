/**
 * ServerRoutes contains the string name for all server routes.
 */
const ServerRoutes = {
    SHOW_USERS: "/server/users",
    ADD_USER: "/server/add-user",
    MAKE_LOBBY: "/server/make-lobby",
    GET_LOBBY: ((lobbyId: string) => "/server/get-lobby/" + lobbyId),
    GET_LOBBY_USERS: ((lobbyId: string) => "/server/get-lobby-users/" + lobbyId),
    GET_ALL_LOBBIES: "/server/get-lobbies",
    GET_LOBBY_OF_USER: ((username: string) => "/server/get-lobby-of-user/" + username),
    DELETE_LOBBY: (authTokenJSON: string, lobbyId: string) => `/server/delete-lobby/${authTokenJSON}/${lobbyId}`,
    REMOVE_USER: (authTokenJSON: string, lobbyId: string, username: string) => `/server/remove-user/${authTokenJSON}/${lobbyId}/${username}`,
    LOGIN: "/server/login",
    TOKEN_LOGIN: "/server/login-token",
    ANY: "*",
    USER: ((username: string) => "/server/get-user/" + username),
    JOIN_LOBBY: "/server/join-lobby",
    ADD_FRIEND: "/server/add-friend",
    IS_FRIEND:((username: string, friend: string) => `/server/is-friend/${username}/${friend}`),
    GET_FRIENDS: (username: string) => `/server/get-friends/${username}`
}
export default ServerRoutes;