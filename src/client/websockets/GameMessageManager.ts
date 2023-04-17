import GameEvent from "../../shared/GameEvent";

class GameMessageHandlerClass {
    handle(messageData: { event: GameEvent, data: any }) {
        console.log(messageData);
        switch (messageData.event) {
            case GameEvent.ROLE_ASSIGN:
                console.log("ROLE ASSIGN");
                break;
            case GameEvent.MAP_UPDATE:
                console.log("MAP UPDATE");
                break;
            case GameEvent.FULL_MAP:
                console.log("FULL MAP");
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
            case GameEvent.UPDATE:
                console.log("UPDATE");
                break;
            default:
                console.log("INVALID GAME EVENT");
        }
    }
}

const GameMessageHandler = new GameMessageHandlerClass();
export default GameMessageHandler;