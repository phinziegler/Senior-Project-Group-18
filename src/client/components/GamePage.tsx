import React from "react";
import Room from "../../shared/Room";
import User from "../../shared/User";
import Role from "../../shared/Role";
import { clientSocketManager } from "../tools/auth";
import MessageType from "../../shared/MessageTypes";
import UserAction from "../../shared/UserAction";
import Direction from "../../shared/Direction";
import GameEvent from "../../shared/GameEvent";


interface GameState {
    board: Room[][];
    exploredRooms: Room[];
    currentRoom: Room | null,
    players: User[];
    torchAssignments: string[];
    role: Role;
    sabotages: number;
}

export default class GamePage extends React.Component<{}, GameState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            board: [],
            exploredRooms: [],
            currentRoom: null,
            players: [],
            torchAssignments: [],
            role: Role.INNOCENT,
            sabotages: 0
        }

        this.wsConnectListener = this.wsConnectListener.bind(this);

        this.roleAssignEvent = this.roleAssignEvent.bind(this);
        this.boardUpdateEvent = this.boardUpdateEvent.bind(this);
        this.torchAssignEvent = this.torchAssignEvent.bind(this);
        this.viewRoomEvent = this.playerVoteEvent.bind(this);
        this.playerVoteEvent = this.playerVoteEvent.bind(this);
        this.voteResultEvent = this.voteResultEvent.bind(this);
        this.gameEndEvent = this.gameEndEvent.bind(this);

    }

    // REMOVE EVENT LISTENERS
    componentWillUnmount(): void {
        window.removeEventListener("wsConnect", this.wsConnectListener);

        window.removeEventListener(GameEvent.ROLE_ASSIGN, this.roleAssignEvent);
        window.removeEventListener(GameEvent.BOARD_UPDATE, this.boardUpdateEvent);
        window.removeEventListener(GameEvent.TORCH_ASSIGN, this.torchAssignEvent);
        window.removeEventListener(GameEvent.VIEW_ROOM, this.viewRoomEvent);
        window.removeEventListener(GameEvent.PLAYER_VOTE, this.playerVoteEvent);
        window.removeEventListener(GameEvent.VOTE_RESULT, this.voteResultEvent);
        window.removeEventListener(GameEvent.GAME_END, this.gameEndEvent);
    }


    componentDidMount() {
        // ADD EVENT LISTENERS
        window.addEventListener("wsConnect", this.wsConnectListener);

        window.addEventListener(GameEvent.ROLE_ASSIGN, this.roleAssignEvent);
        window.addEventListener(GameEvent.BOARD_UPDATE, this.boardUpdateEvent);
        window.addEventListener(GameEvent.TORCH_ASSIGN, this.torchAssignEvent);
        window.addEventListener(GameEvent.VIEW_ROOM, this.viewRoomEvent);
        window.addEventListener(GameEvent.PLAYER_VOTE, this.playerVoteEvent);
        window.addEventListener(GameEvent.VOTE_RESULT, this.voteResultEvent);
        window.addEventListener(GameEvent.GAME_END, this.gameEndEvent);

        // REQUEST UPDATE
        if (!clientSocketManager) {
            return; // not logged in
        }

        if (clientSocketManager.connected) {
            this.requestUpdate();
            console.log("requested update after game page loading");
            return;
        }
    }

    /****************************************************************************/
    /***************************** EVENT LISTENERS ******************************/
    /****************************************************************************/

    // Connect to websocket listener
    wsConnectListener() {
        this.requestUpdate();
        console.log("requested update after connection to WS")
    }

    roleAssignEvent(e: any) {
        console.log(e.detail.data.isTraitor)
    }

    boardUpdateEvent(e: any) {
        let exploredRooms = e.detail.data.exploredRooms;
        let board = e.detail.data.board.board;

        this.setState({
            exploredRooms: exploredRooms
        });

        if (board) {
            this.setState({
                board: board
            });
        }
    }

    torchAssignEvent(e: any) {
        console.log(e.detail.data.torchAssignments);
    }

    viewRoomEvent(e: any) {
        // this.setState({});
    }

    playerVoteEvent(e: any) {
        // this.setState({});
    }

    voteResultEvent(e: any) {
        // this.setState({});
    }

    gameEndEvent(e: any) {
        // this.setState({})
    }

    // Returns a text representation of the map
    // TODO: add some color stuff
    printMap() {
        let rooms = this.bfs();
        let output = "";
        this.state.board.forEach(row => {
            row.forEach(node => {
                if(!rooms.has(node)) {
                    output += ``.padStart(7);
                    return;
                }
                if (!(node.up || node.right || node.down || node.left)) {
                    output += ''.padStart(7);
                    return;
                }
                let up = node.up ? "||" : "  ";
                output += `   ${up}  `;
            });
            output += "\n";
            row.forEach(node => {
                if(!rooms.has(node)) {
                    output += ``.padStart(7);
                    return;
                }
                if (!(node.up || node.right || node.down || node.left)) {
                    output += ''.padStart(7);
                    return;
                }
                let right = node.right ? "==" : "  ";
                let left = node.left ? "==" : "  ";
                let nodeType = node.isGoal ? "W" : node.isSafe ? "O" : "X";

                output += `${left}[${nodeType}]${right}`;  // length is 7
            });
            output += "\n";
            row.forEach(node => {
                if(!rooms.has(node)) {
                    output += ``.padStart(7);
                    return;
                }
                if (!(node.up || node.right || node.down || node.left)) {
                    output += ''.padStart(7);
                    return;
                }
                let down = node.down ? "||" : "  ";
                output += `   ${down}  `;
            });
            output += "\n";
        });

        return output;
    }

    bfs(): Set<Room> {
        if(this.state.board.length == 0) {
            return new Set();
        }
        let currRow = 0;
        let currCol = Math.floor(this.state.board[0].length / 2);
        let visitedRooms: Set<Room> = new Set();
        let roomsToVisit: Room[] = [];
        roomsToVisit.push(this.state.board[currRow][currCol]);

        while (roomsToVisit.length > 0) {
            currRow = roomsToVisit[0].row;
            currCol = roomsToVisit[0].col;
            if (!visitedRooms.has(this.state.board[currRow][currCol])) {
                visitedRooms.add(this.state.board[currRow][currCol]);

                if (this.state.board[currRow][currCol].up && !visitedRooms.has(this.state.board[currRow - 1][currCol])) {
                    roomsToVisit.push(this.state.board[currRow - 1][currCol]);
                }
                if (this.state.board[currRow][currCol].right && !visitedRooms.has(this.state.board[currRow][currCol + 1])) {
                    roomsToVisit.push(this.state.board[currRow][currCol + 1])
                }
                if (this.state.board[currRow][currCol].down && !visitedRooms.has(this.state.board[currRow + 1][currCol])) {
                    roomsToVisit.push(this.state.board[currRow + 1][currCol]);
                }
                if (this.state.board[currRow][currCol].left && !visitedRooms.has(this.state.board[currRow][currCol - 1])) {
                    roomsToVisit.push(this.state.board[currRow][currCol - 1]);
                }
            }
            roomsToVisit.shift();
        }
        return visitedRooms;
    }

    // Render the map 
    map() {
        <div>
            {this.printMap()}
        </div>
    }

    // Request update from server
    requestUpdate() {
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.UPDATE, data: {} });     // Sends a WS message requesting an update
    }

    // Send Vote to server
    placeVote(direction: Direction) {
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.VOTE, data: { direction: direction } });
    }

    // Tell the server to sabotage a player
    sabotage(victim: string) {
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.SABOTAGE, data: { victim: victim } });
    }

    // Tell the server that you intend to view a room
    viewRoom(direction: Direction) {
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.VIEW, data: { direction: direction } })
    }


    /*
        1. MAP
        2. CHAT
        3. TEXT AREA FOR ROOM INFO
        4. PLAYER LIST
        5. SABOTAGE BUTTON?? --> connected to players in player list
        6. ??
    */
    render() {
        console.log(this.printMap());
        return (<>
            <div>GAME PAGE</div>
            {this.map()}
        </>);
    }
}