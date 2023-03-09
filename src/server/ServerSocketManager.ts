import http from 'http';
import WebSocket, { Server } from 'ws';
import Environments from '../shared/Environments';
import MessageType from '../shared/MessageTypes';
import { lobbyManager } from './server';

require('dotenv').config();
const ENV = process.env.NODE_ENV || Environments.DEVELOPMENT;

export default class ServerSocketManager {
    wsServer: Server<WebSocket>;
    sockets = new Set<WebSocket>();

    constructor(httpServer: http.Server, wsPort: number) {
        let options: WebSocket.ServerOptions = (ENV === Environments.DEVELOPMENT) ? { port: wsPort } : { server: httpServer };
        this.wsServer = new WebSocket.Server(options);
        this.wsServer.on("connection", (ws: WebSocket) => {
            this.setUpSocket(ws);
            this.setUpEvents(ws);
        });
    }

    setUpSocket(ws: WebSocket) {
        console.log(`New websocket connection established: connections = ${this.wsServer.clients.size}`);
        this.sockets.add(ws);
        ws.send(JSON.stringify({ type: MessageType.TEST }));
    }

    setUpEvents(ws: WebSocket) {
        ws.on("message", (msg: string) => this.handleMessage(ws, msg));
        ws.on('close', () => this.handleClose(ws));
    }

    handleMessage(ws: WebSocket, msg: string) {
        try {
            const message = JSON.parse(msg);
            switch (message.type) {
                case MessageType.TEST:
                    console.log("TEST");
                    break;
                case MessageType.PING:
                    console.log("PING");
                    break;
                case MessageType.CHAT:  // FIXME: The lobby manager should be responsible for sending this to the correct people
                    // // let chat = `${message.data.user}: ${message.data.message}`;
                    // console.log(message.data);
                    // ws.send(JSON.stringify({ type: MessageType.CHAT, user: message.data.user, message: message.data.message }));  // Sends the message back to the user who dunnit
                    lobbyManager.chat(message.data.auth, message.data.message);
                    break;
                default:
                    console.error("invalid incoming message: " + msg);
            }
        } catch (e) {
            console.error("invalid incoming message: " + msg);
        }
    }

    handleClose(ws: WebSocket) {
        this.sockets.delete(ws);
        console.log(`A websocket connection was dropped: connections: =  ${this.wsServer.clients.size}`);
    }
}