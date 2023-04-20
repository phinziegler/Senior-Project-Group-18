import http from 'http';
import WebSocket, { Server } from 'ws';
import Environments from '../shared/Environments';
import MessageType from '../shared/MessageTypes';
import LobbyController from './controllers/LobbyController';
import GameManager from './game/GameManager';
import { authTokenService } from './tools/services';

require('dotenv').config();
const ENV = process.env.NODE_ENV || Environments.DEVELOPMENT;

export default class ServerSocketManager {
    wsServer: Server<WebSocket>;
    usernameToSocket = new Map<string, WebSocket>();        // TODO: eventually the username and socket relation should be stored in the database
                                                            //       instead of a hashmap... this currently eats up ram... but do I care?
    socketToUsername = new Map<WebSocket, string>();
    sockets = new Set<WebSocket>();

    constructor(httpServer: http.Server, wsPort: number) {
        let options: WebSocket.ServerOptions = (ENV === Environments.DEVELOPMENT) ? { port: wsPort } : { server: httpServer };
        this.wsServer = new WebSocket.Server(options);
        this.wsServer.on("connection", (ws: WebSocket) => {
            this.setUpSocket(ws);
        });
    }

    setUpSocket(ws: WebSocket) {
        // console.log(`New websocket connection established: connections = ${this.wsServer.clients.size}`);
        ws.on("message", (msg: string) => {
            if(this.sockets.has(ws)) {
                this.handleMessage(ws, msg);
                return;
            }
            try {
                const message = JSON.parse(msg);
                switch (message.type) {
                    case MessageType.ASSIGN_WEBSOCKET_USER:
                        this.usernameToSocket.set(message.username, ws);
                        this.socketToUsername.set(ws, message.username);
                        this.sockets.add(ws);
                        break;
                    default:
                        console.log("Cannot accept message of type " + message.type + " right now. user must be assigned to this websocket.");
                }
            } catch {
                console.log("Unacceptable socket message");
                ws.close();
            }
        });
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
                case MessageType.CHAT:
                    LobbyController.chat(message.auth, message.data);
                    break;
                case MessageType.GAME:
                    GameManager.handleMessage(message.auth.username, message.data);
                    break;
                case MessageType.GAME_START:
                    LobbyController.startGame(message.auth, message.data.lobbyId);
                    break;
                case MessageType.GAME_END:
                    LobbyController.deleteGame(message.auth, message.data.lobbyId);
                default:
                    console.error("invalid incoming message: " + msg);
            }
        } catch (e: any) {
            console.error("error processing message: " + e.stack);
        }
    }

    handleClose(ws: WebSocket) {
        let username = this.socketToUsername.get(ws);
        if (!username) {
            console.log("failed to close websocket correctly");
            return;
        }
        this.sockets.delete(ws);
        this.usernameToSocket.delete(username);
        this.socketToUsername.delete(ws);
    }

    public sendMessageToUser(username: string, message: string) {
        let ws = this.usernameToSocket.get(username);
        if (!ws) {
            // console.log("could not message user " + JSON.stringify(username) + " not connected");
            return;
        }
        ws.send(message);
    }
}