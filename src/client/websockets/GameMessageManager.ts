import GameEvent from "../../shared/GameEvent";

class GameMessageHandlerClass {
    handle(messageData: { event: GameEvent, data?: any }) {
        let gameEvent = new CustomEvent(messageData.event, { detail: { data: messageData.data } });
        window.dispatchEvent(gameEvent);
    }
}

const GameMessageHandler = new GameMessageHandlerClass();
export default GameMessageHandler;