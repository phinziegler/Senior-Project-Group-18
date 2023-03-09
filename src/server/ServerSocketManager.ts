import { randomUUID } from 'crypto';
import http from 'http';
import WebSocket, { Server } from 'ws';
import Environments from '../shared/Environments';
import MessageType from '../shared/MessageTypes';
import { authTokenService } from '../tools/services';
import { lobbyManager } from './server';

require('dotenv').config();
const ENV = process.env.NODE_ENV || Environments.DEVELOPMENT;

export default class ServerSocketManager {
    wsServer: Server<WebSocket>;
    idToSocket = new Map<string, WebSocket>();
    socketToId = new Map<WebSocket, string>();
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
        let id = randomUUID();
        this.idToSocket.set(id, ws);
        this.sockets.add(ws);
        this.socketToId.set(ws, id);
        ws.send(JSON.stringify({ type: MessageType.WEBSOCKET_ID, id: id }));
    }

    setUpEvents(ws: WebSocket) {
        ws.on("message", (msg: string) => this.handleMessage(ws, msg));
        ws.on('close', () => this.handleClose(ws));
    }

    async handleMessage(ws: WebSocket, msg: string) {
        try {
            const message = JSON.parse(msg);

            let authorized = await authTokenService.checkAuthorized(message.auth);
            if (!authorized) {
                console.log("Did not process websocket request from unauthorized user");
                return;
            }

            switch (message.type) {
                case MessageType.TEST:
                    console.log("TEST");
                    break;
                case MessageType.PING:
                    console.log("PING");
                    break;
                case MessageType.CHAT:  // FIXME: The lobby manager should be responsible for sending this to the correct people
                    lobbyManager.chat(message.auth, message.data);
                    break;
                default:
                    console.error("invalid incoming message: " + msg);
            }
        } catch (e: any) {
            console.error("error processing message: " + e.stack);
        }
    }

    handleClose(ws: WebSocket) {
        let id = this.socketToId.get(ws);
        if (!id) {
            console.log("failed to close websocket correctly");
            return;
        }
        this.sockets.delete(ws);
        this.socketToId.delete(ws);
        this.idToSocket.delete(id);

        lobbyManager.removeUserBySocketId(id);
        console.log(`A websocket connection was dropped: connections: =  ${this.wsServer.clients.size}`);
    }

    getSocketFromId(socketId: string) {
        return this.idToSocket.get(socketId);
    }
}