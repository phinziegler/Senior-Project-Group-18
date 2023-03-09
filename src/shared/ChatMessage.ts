export default interface ChatMessage {
    message: string,
    lobbyId: string,
    user: string,
    time?: Date         // TODO: do we want this? if we do it should be required
}