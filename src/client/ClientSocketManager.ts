import Environments from "../shared/Environments";
import MessageType from "../shared/MessageTypes";

export default class ClientSocketManager {
    ws: WebSocket;
    constructor() {
        this.ws = this.connect();
        this.setupEvents();
        this.socket();
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
        this.ws.onopen = () => console.log("established websocket connection");
        this.ws.onclose = () => console.log("closed websocket connection");
    }

    socket() {
        this.ws.addEventListener('message', (e: MessageEvent) => {
            let message = JSON.parse(e.data);
            switch (message.type) {
                case MessageType.PING:
                    console.log('ping');
                    break;
                case MessageType.TEST:
                    console.log('test');
                    break;
                default:
                    console.error("Invalid Socket Message: " + e.data);
            }
        });
    }

    public close() {
        this.ws.close();
    }
}