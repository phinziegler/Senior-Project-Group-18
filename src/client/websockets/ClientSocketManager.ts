import Environments from "../../shared/Environments";
import MessageType from "../../shared/MessageTypes";
import { getAuthToken } from "../tools/auth";
import GameMessageHandler from "./GameMessageManager";
import { SocketEvent } from "./SocketEvent";

export default class ClientSocketManager {
    ws: WebSocket;
    connected: boolean;
    username: string;

    constructor(username: string) {
        this.connected = false;
        this.ws = this.connect();
        this.setupEvents();
        this.socket();
        this.username = username;
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
        let connectEvent: CustomEvent;
        connectEvent = new CustomEvent("wsConnect", { detail: {}});

        this.ws.onopen = () => {
            console.log("established websocket connection");
            this.connected = true;
            this.ws.send(JSON.stringify({type: MessageType.ASSIGN_WEBSOCKET_USER, username: this.username}))
            window.dispatchEvent(connectEvent);
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
                case MessageType.CHAT:
                    messageEvent = new CustomEvent(SocketEvent.CHAT, { detail: { message: message.message, user: message.user } });
                    break;
                case MessageType.UPDATE_USER_LIST:
                    messageEvent = new CustomEvent(SocketEvent.UPDATE_USER_LIST);
                    break;
                case MessageType.GAME:
                    GameMessageHandler.handle(message);
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
}