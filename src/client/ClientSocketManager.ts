import Environments from "../shared/Environments";
import MessageType from "../shared/MessageTypes";
import { getAuthToken } from "./auth";

const SocketEvent = {
    CHAT: "chat"
}

export { SocketEvent };

class ClientSocketManager {
    ws: WebSocket;
    connected: boolean;
    id: string;

    constructor() {
        this.connected = false;
        this.ws = this.connect();
        this.setupEvents();
        this.socket();
        this.id = "";
    }

    public send(type: MessageType, data?: any) {
        if (!this.connected) {
            return;
        }
        this.ws.send(JSON.stringify({ type: type, auth: getAuthToken(), data: data }));
    }

    connect(): WebSocket {
        let HOST = window.location.origin.replace(/^http/, 'ws');
        if (process.env.NODE_ENV === Environments.DEVELOPMENT) {
            HOST = "ws://" + window.location.hostname + ":8080";
        }
        let ws = new WebSocket(HOST);
        return ws;
    }

    setupEvents() {
        this.ws.onopen = () => {
            console.log("established websocket connection");
            this.connected = true;
        }
        this.ws.onclose = () => {
            console.log("closed websocket connection");
            this.connected = false;
        }
    }

    socket() {
        this.ws.addEventListener('message', (e: MessageEvent) => {
            let message = JSON.parse(e.data);
            let messageEvent: CustomEvent;
            messageEvent = new CustomEvent("no-event", { detail: { data: e.data } });
            switch (message.type) {
                case MessageType.WEBSOCKET_ID:
                    this.id = message.id;
                    console.log("WebSocket id: " + this.id);
                    break;
                case MessageType.PING:
                    console.log('ping');
                    break;
                case MessageType.TEST:
                    console.log('test');
                    break;
                case MessageType.CHAT:
                    messageEvent = new CustomEvent(SocketEvent.CHAT, { detail: { message: message.message, user: message.user } });
                    break;
                default:
                    console.error("Invalid Socket Message: " + e.data);
            }
            window.dispatchEvent(messageEvent);
        });
    }

    public close() {
        this.ws.close();
    }

    public getId() {
        return this.id;
    }
}


const clientSocketManager = new ClientSocketManager();
export default clientSocketManager;