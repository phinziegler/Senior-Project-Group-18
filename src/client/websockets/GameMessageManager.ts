import GameEvent from "../../shared/GameEvent";

class GameMessageHandlerClass {
    /*
    Handle Websocket Game messages
        ROLE_ASSIGN,
        BOARD_UPDATE,
        TORCH_ASSIGN,
        VIEW_ROOM,
        PLAYER_VOTE,
        VOTE_RESULT,
        GAME_END,
    */
    handle(messageData: { event: GameEvent, data: any }) {
        console.log(messageData);
        switch (messageData.event) {
            case GameEvent.ROLE_ASSIGN:
                console.log("ROLE ASSIGN");
                break;
            case GameEvent.BOARD_UPDATE:
                console.log("BOARD UPDATE");
                break;
            case GameEvent.TORCH_ASSIGN:
                console.log("TORCH ASSIGN");
                break;
            case GameEvent.VIEW_ROOM:
                console.log("VIEW ROOM");
                break;
            case GameEvent.PLAYER_VOTE:
                console.log("PLAYER VOTE");
                break;
            case GameEvent.VOTE_RESULT:
                console.log("VOTE RESULT");
                break;
            case GameEvent.GAME_END:
                console.log("GAME END");
                break;
            default:
                console.log("INVALID GAME EVENT");
        }
    }
}

const GameMessageHandler = new GameMessageHandlerClass();
export default GameMessageHandler;