import React from "react";
import Room from "../../shared/Room";
import User from "../../shared/User";
import Role from "../../shared/Role";
import { clientSocketManager } from "../tools/auth";
import MessageType from "../../shared/MessageTypes";
import UserAction from "../../shared/UserAction";
import Direction from "../../shared/Direction";
import GameEvent from "../../shared/GameEvent";
import Chat from "./Chat";
import { GET } from "../tools/fetch";
import requestUrl from "../tools/requestUrl";
import ServerRoutes from "../../shared/ServerRoutes";

interface GameProps {
    user: User | null
}

interface GameState {
    rooms: Room[][];
    exploredRooms: Room[];
    currentRoom: Room | null,
    players: User[];
    torchAssignments: string[];
    role: Role;
    sabotages: number;
    lobbyId: string;
}

export default class GamePage extends React.Component<GameProps, GameState> {
    constructor(props: GameProps) {
        super(props);
        this.state = {
            rooms: [],
            exploredRooms: [],
            currentRoom: null,
            players: [],
            torchAssignments: [],
            role: Role.INNOCENT,
            sabotages: 0,
            lobbyId: ""
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
        let isTraitor = e.detail.data.isTraitor;

        if (isTraitor) {
            this.setState({
                role: Role.TRAITOR
            });
        }
    }

    // Explored rooms, full board, and lobbyId
    boardUpdateEvent(e: any) {
        let exploredRooms = e.detail.data.exploredRooms;
        let lobbyId = e.detail.data.lobbyId;
        let board;
        try {
            board = e.detail.data.board.board;
        } catch {
            console.log("Innocent");
        }


        this.setState({
            exploredRooms: exploredRooms,
        });

        if (board) {
            this.setState({
                rooms: board
            });
        }
        // Now that we have the lobby ID, we can also look up the list of players
        if (lobbyId != this.state.lobbyId) {
            this.setState({
                lobbyId: lobbyId
            });
            this.getUsersLobby(lobbyId);
        }
    }

    torchAssignEvent(e: any) {
        // console.log(e.detail.data.torchAssignments);
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


    // Get the list of users for a lobby
    async getUsersLobby(lobbyId: string) {
        GET(requestUrl(ServerRoutes.GET_LOBBY_USERS(lobbyId))).then(res => res.json()).then((data: any) => {
            console.log(data);
            this.setState({
                players: data
            });
        });
    }

    // Returns a text representation of the map
    map(fontSize: number = 1) {
        let rooms = this.bfs();
        let output: JSX.Element[] = [];
        this.state.rooms.forEach((row, rowIndex) => {
            let rowElements1: JSX.Element[] = [];
            row.forEach((node, index) => {
                if (rowIndex == 0) {
                    return;
                }
                if (!rooms.has(node)) {
                    rowElements1.push(<span key={`${rowIndex},${index}`}>{``.padStart(7, " ")}</span>);
                    return;
                }
                if (!(node.up || node.right || node.down || node.left)) {
                    rowElements1.push(<span key={`${rowIndex},${index}`}>{``.padStart(7, " ")}</span>);
                    return;
                }
                let up = node.up ? "| " : "  ";
                rowElements1.push(<span key={`${rowIndex},${index}`}>{`   ${up}  `}</span>);
            });
            let rowElements2: JSX.Element[] = [];
            row.forEach((node, index) => {
                if (!rooms.has(node)) {
                    rowElements2.push(<span key={`${rowIndex},${index}`}>{``.padStart(7, " ")}</span>);
                    return;
                }
                if (!(node.up || node.right || node.down || node.left)) {
                    rowElements2.push(<span key={`${rowIndex},${index}`}>{``.padStart(7, " ")}</span>);
                    return;
                }
                let right = node.right ? "――" : "  ";
                let left = node.left ? "――" : "  ";
                let nodeType = node.isGoal ? "W" : node.isSafe ? "O" : "X";

                rowElements2.push(<span key={`${rowIndex},${index}`}>
                    <span>{`${left}`}</span><span className={node.isGoal ? "text-success" : !node.isSafe ? "text-danger" : ""}>{`[${nodeType}]`}</span><span>{`${right}`}</span>
                </span>)
            });
            let rowElements3: JSX.Element[] = [];
            row.forEach((node, index) => {
                if (rowIndex == this.state.rooms.length - 1) {
                    return;
                }
                if (!rooms.has(node)) {
                    rowElements3.push(<span key={`${rowIndex},${index}`}>{``.padStart(7, " ")}</span>);
                    return;
                }
                if (!(node.up || node.right || node.down || node.left)) {
                    rowElements3.push(<span key={`${rowIndex},${index}`}>{``.padStart(7, " ")}</span>);
                    return;
                }
                let down = node.down ? "| " : "  ";
                rowElements3.push(<span key={`${rowIndex},${index}`}>{`   ${down}  `}</span>);
            });

            output.push(
                <div key={rowIndex}>
                    <div>
                        {rowElements1}
                    </div>
                    <div>
                        {rowElements2}
                    </div>
                    <div>
                        {rowElements3}
                    </div>
                </div>
            );
        });

        return <div style={{ whiteSpace: "pre", lineHeight: `${fontSize}em`, fontSize: `${fontSize}em` }} className="m-0" >{output}</div>;
    }

    bfs(): Set<Room> {
        if (this.state.rooms.length == 0) {
            return new Set();
        }
        let currRow = 0;
        let currCol = Math.floor(this.state.rooms[0].length / 2);
        let visitedRooms: Set<Room> = new Set();
        let roomsToVisit: Room[] = [];
        roomsToVisit.push(this.state.rooms[currRow][currCol]);

        while (roomsToVisit.length > 0) {
            currRow = roomsToVisit[0].row;
            currCol = roomsToVisit[0].col;
            if (!visitedRooms.has(this.state.rooms[currRow][currCol])) {
                visitedRooms.add(this.state.rooms[currRow][currCol]);

                if (this.state.rooms[currRow][currCol].up && !visitedRooms.has(this.state.rooms[currRow - 1][currCol])) {
                    roomsToVisit.push(this.state.rooms[currRow - 1][currCol]);
                }
                if (this.state.rooms[currRow][currCol].right && !visitedRooms.has(this.state.rooms[currRow][currCol + 1])) {
                    roomsToVisit.push(this.state.rooms[currRow][currCol + 1])
                }
                if (this.state.rooms[currRow][currCol].down && !visitedRooms.has(this.state.rooms[currRow + 1][currCol])) {
                    roomsToVisit.push(this.state.rooms[currRow + 1][currCol]);
                }
                if (this.state.rooms[currRow][currCol].left && !visitedRooms.has(this.state.rooms[currRow][currCol - 1])) {
                    roomsToVisit.push(this.state.rooms[currRow][currCol - 1]);
                }
            }
            roomsToVisit.shift();
        }
        return visitedRooms;
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

    // Gaming
    game() {
        let color = this.state.role == Role.INNOCENT ? "success" : "danger";
        let phrase = this.state.role == Role.INNOCENT ? "You are an " : "You are a ";
        let role = this.state.role == Role.INNOCENT ? "ADVENTURER" : "TRAITOR"

        return <>
            <div className="position-relative">
                <div style={{
                    right: "0"
                }} className="position-absolute">
                    <span>{phrase}</span><span className={`text-${color}`}>{role}</span>
                </div>
            </div>
        </>
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
        return (<>

            <div className="border border-warning w-100 mw-100">
                <div className="d-flex w-100 h-100">
                    {/* NOT CHAT (vertical flex) */}
                    <div className="d-flex flex-column flex-grow-1">
                        {/* Game/MAP horizontal */}
                        <div className="d-flex flex-row flex-grow-1">
                            {/* MAP */}
                            <div className="border border-white p-3">
                                <h2>MAP</h2>
                                {this.map()}
                            </div>

                            {/* GAME */}
                            <div className="border border-success flex-grow-1 p-3">
                                <h2>GAME</h2>
                                {this.game()}
                            </div>
                        </div>

                        {/* PLAYERS */}
                        <div className="border border-primary p-3 d-flex justify-content-around">
                            <span>Player 1</span>
                            <span>Player 2</span>
                        </div>
                    </div>
                    {/* ----------------------------------------------------------------------------------------------- */}
                    {/* CHAT */}
                    <div className="border border-danger p-3">
                        <h3>Chat</h3>
                        <Chat lobbyId={this.state.lobbyId} user={this.props.user} />
                    </div>
                </div>
            </div>
        </>);
    }
}