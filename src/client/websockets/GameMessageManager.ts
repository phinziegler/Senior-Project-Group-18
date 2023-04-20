import GameEvent from "../../shared/GameEvent";

class GameMessageHandlerClass {
    handle(messageData: { event: GameEvent, data?: any }) {
        console.log(messageData.event);
        if(messageData.event == GameEvent.VIEW_ROOM) {
            console.log(messageData.data);
        }
        let gameEvent = new CustomEvent(messageData.event, { detail: { data: messageData.data } });
        window.dispatchEvent(gameEvent);
    }
}

const GameMessageHandler = new GameMessageHandlerClass();
export default GameMessageHandler;