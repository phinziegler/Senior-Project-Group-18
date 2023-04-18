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
    handle(messageData: { event: GameEvent, data?: any }) {
        console.log(JSON.stringify(messageData));
        let gameEvent = new CustomEvent(messageData.event, { detail: { data: messageData.data } });

        // switch (messageData.event) {
        //     case GameEvent.ROLE_ASSIGN:
        //         console.log("ROLE ASSIGN");
        //         gameEvent = new CustomEvent(GameEvent.ROLE_ASSIGN, {detail: {data: messageData.data}});
        //         break;
        //     case GameEvent.BOARD_UPDATE:
        //         console.log("BOARD UPDATE");
        //         gameEvent = new CustomEvent(GameEvent.ROLE_ASSIGN, {detail: {data: messageData.data}});
        //         break;
        //     case GameEvent.TORCH_ASSIGN:
        //         console.log("TORCH ASSIGN");
        //         gameEvent = new CustomEvent(GameEvent.ROLE_ASSIGN, {detail: {data: messageData.data}});
        //         break;
        //     case GameEvent.VIEW_ROOM:
        //         console.log("VIEW ROOM");
        //         gameEvent = new CustomEvent(GameEvent.ROLE_ASSIGN, {detail: {data: messageData.data}});
        //         break;
        //     case GameEvent.PLAYER_VOTE:
        //         console.log("PLAYER VOTE");
        //         gameEvent = new CustomEvent(GameEvent.ROLE_ASSIGN, {detail: {data: messageData.data}});
        //         break;
        //     case GameEvent.VOTE_RESULT:
        //         console.log("VOTE RESULT");
        //         gameEvent = new CustomEvent(GameEvent.ROLE_ASSIGN, {detail: {data: messageData.data}});
        //         break;
        //     case GameEvent.GAME_END:
        //         console.log("GAME END");
        //         gameEvent = new CustomEvent(GameEvent.ROLE_ASSIGN, {detail: {data: messageData.data}});
        //         break;
        //     default:
        //         console.log("INVALID GAME EVENT");
        // }

        window.dispatchEvent(gameEvent);
    }
}

const GameMessageHandler = new GameMessageHandlerClass();
export default GameMessageHandler;