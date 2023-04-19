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
import { Link } from "react-router-dom";
import GamePlayer from "./GamePlayer";

interface GameProps {
    user: User | null
}

interface GameState {
    rooms: Room[][];
    exploredRooms: Room[];
    currentRoom: Room | null,
    players: string[];
    torchAssignments: string[];
    traitors: string[],
    role: Role;
    sabotages: number;
    lobbyId: string;
    rows: number,
    cols: number,
    sabotaging: boolean,
    isSabotaged: Set<string>
}

export default class GamePage extends React.Component<GameProps, GameState> {
    constructor(props: GameProps) {
        super(props);
        this.state = {
            traitors: [],
            rooms: [],
            exploredRooms: [],
            currentRoom: null,
            players: [],
            torchAssignments: [],
            role: Role.INNOCENT,
            sabotages: 0,
            lobbyId: "",
            rows: 0,
            cols: 0,
            sabotaging: false,
            isSabotaged: new Set()
        }

        this.wsConnectListener = this.wsConnectListener.bind(this);

        this.sabotageEvent = this.sabotageEvent.bind(this);
        this.unsabotageEvent = this.unsabotageEvent.bind(this);
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

        window.removeEventListener(GameEvent.SABOTAGE, this.sabotageEvent);
        window.removeEventListener(GameEvent.UNSABOTAGE, this.unsabotageEvent);
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

        window.addEventListener(GameEvent.SABOTAGE, this.sabotageEvent);
        window.addEventListener(GameEvent.UNSABOTAGE, this.unsabotageEvent);
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
        let sabotages;
        let isTraitor = e.detail.data.isTraitor;
        let traitors;
        try {
            sabotages = e.detail.data.sabotages;
            traitors = e.detail.data.traitors;
        } catch {
            console.log("innocent, did not get traitors list");
        }

        if (isTraitor) {
            this.setState({
                role: Role.TRAITOR
            });
        }

        if (traitors) {
            this.setState({ traitors: traitors, sabotages: sabotages });
        }
    }

    // Explored rooms, full board, and lobbyId
    boardUpdateEvent(e: any) {
        let exploredRooms = e.detail.data.exploredRooms;
        let lobbyId = e.detail.data.lobbyId;
        let rows;
        let cols;
        let hasDimensions = false;
        try {
            rows = e.detail.data.rows;
            cols = e.detail.data.cols;
            hasDimensions = true;
        } catch {
            console.log("Got Dimensions");
        }
        let board;
        try {
            board = e.detail.data.board.rooms;
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

        if (hasDimensions) {
            this.setState({
                rows: rows,
                cols: cols
            })
        }

        // Now that we have the lobby ID, we can also look up the list of players
        if (lobbyId != this.state.lobbyId) {
            this.setState({
                lobbyId: lobbyId
            });
            this.getUsersLobby(lobbyId);
        }
    }

    sabotageEvent(e: any) {
        if(!this.props.user) {
            return;
        }
        if(e.detail.data.sabotager == this.props.user.username) {
            return;
        }
        this.state.isSabotaged.add(e.detail.data.victim);
    }

    unsabotageEvent(e: any) {
        if(!this.props.user) {
            return;
        }
        if(e.detail.data.sabotager == this.props.user.username) {
            return;
        }
        this.state.isSabotaged.delete(e.detail.data.victim);
    }

    torchAssignEvent(e: any) {
        this.setState({ torchAssignments: e.detail.data.torchAssignments });
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
            this.setState({
                players: data
            });
        });
    }

    prefillRooms() {
        let possibleRooms: (Room | null)[][] = [];

        // Fill PossibleRooms
        for (let r = 0; r < this.state.rows; r++) {
            let row: (Room | null)[] = [];
            for (let c = 0; c < this.state.cols; c++) {
                row.push(null);
            }
            possibleRooms.push(row);
        }
        return possibleRooms;
    }

    innocentMap(fontSize: number) {
        let output: JSX.Element[] = [];
        let possibleRooms: (Room | null)[][] = this.prefillRooms();

        // Fill possibleRooms
        this.state.exploredRooms.forEach(room => {
            possibleRooms[room.row][room.col] = room;
        });

        possibleRooms.forEach((row: (Room | null)[], rowIndex) => {
            let rowElements1: JSX.Element[] = [];
            row.forEach((node: Room | null, index) => {
                if (rowIndex == 0) {
                    return;
                }
                if (!node) {
                    rowElements1.push(<span key={`${rowIndex},${index}`}>{``.padStart(7, " ")}</span>);
                    return;
                }
                let up = node.up ? "| " : "  ";
                rowElements1.push(<span key={`${rowIndex},${index}`}>{`   ${up}  `}</span>);
            });

            let rowElements2: JSX.Element[] = [];
            row.forEach((node: Room | null, index) => {
                if (!node) {
                    rowElements2.push(<span key={`${rowIndex},${index}`}>{``.padStart(7, " ")}</span>);
                    return;
                }
                let right = node.right ? "――" : "  ";
                let left = node.left ? "――" : "  ";
                let nodeType = node.isGoal ? "W" : node.isSafe ? "O" : "X";
                // let nodeType = " "

                let start = this.state.exploredRooms[0];
                rowElements2.push(<span key={`${rowIndex},${index}`}>
                    <span>{`${left}`}</span><span className={node.isGoal ? "text-success" : (node.row == start.row && node.col == start.col) ? "text-warning" : !node.isSafe ? "text-danger" : ""}>{`[${nodeType}]`}</span><span>{`${right}`}</span>
                </span>)
            });

            let rowElements3: JSX.Element[] = [];
            row.forEach((node, index) => {
                if (rowIndex == this.state.rooms.length - 1) {
                    return;
                }
                if (!node) {
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

    // Returns a text representation of the map
    map(fontSize: number = 1) {

        if (this.state.role == Role.INNOCENT) {
            return this.innocentMap(fontSize);
        }

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

                let start = this.state.exploredRooms[0];
                rowElements2.push(<span key={`${rowIndex},${index}`}>
                    <span>{`${left}`}</span><span className={node.isGoal ? "text-success" : (node.row == start.row && node.col == start.col) ? "text-warning" : !node.isSafe ? "text-danger" : ""}>{`[${nodeType}]`}</span><span>{`${right}`}</span>
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
        if(!this.props.user) {
            return;
        }
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.SABOTAGE, data: { sabotager: this.props.user.username, victim: victim } });
    }

    // Unsabotage
    unsabotage(victim: string) {
        if(!this.props.user) {
            return;
        }
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.UNSABOTAGE, data: { sabotager: this.props.user.username, victim: victim } });
    }

    // Tell the server that you intend to view a room
    viewRoom(direction: Direction) {
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.VIEW, data: { direction: direction } })
    }

    // Render the players
    players() {
        let color = this.state.role == Role.INNOCENT ? "success" : "danger";
        let output: JSX.Element[] = [];
        this.state.players.forEach((player, index) => {
            output.push(
                <GamePlayer
                    sabotagedList={this.state.isSabotaged}
                    doSabotage={(victim) => this.sabotage(victim)}
                    doUnsabotage={(victim) => this.unsabotage(victim)}
                    changeSabotages={(amount: number) => {
                        let sabotages = this.state.sabotages + amount;
                        this.setState({ sabotages: sabotages });
                    }}
                    canSabotage={this.state.sabotaging}
                    role={this.state.role}
                    key={index}
                    username={player}
                    user={this.props.user}
                    isTraitor={this.state.traitors.includes(player)}
                    torchBearer={this.state.torchAssignments.includes(player)}
                />);
        });

        return output;
    }

    // Gaming
    game() {
        let color = this.state.role == Role.INNOCENT ? "success" : "danger";
        let phrase = this.state.role == Role.INNOCENT ? "You are an " : "You are a ";
        let role = this.state.role == Role.INNOCENT ? "ADVENTURER" : "TRAITOR"

        return <>
            <div className="text-center position-relative flex-grow-1">
                {/* ROLE */}
                <div style={{ right: "0" }} className="position-absolute">
                    <span>{phrase}</span><span className={`text-${color}`}>{role}</span>
                </div>

                {/* SABOTAGES */}
                {this.isTraitor() && <div style={{ right: "0", bottom: "0" }} className="position-absolute">
                    <button onClick={() => {
                        if (this.state.sabotaging) {
                            this.setState({ sabotaging: false });
                            return;
                        }
                        this.setState({ sabotaging: true });
                    }} className="btn btn-danger">SABOTAGE</button>
                    <div className="text-danger small">Remaining: {this.state.sabotages}</div>
                </div>}
                <br />
                {this.state.sabotaging && <div className="text-danger">Click on a torchbearer to sabotage their room clear.</div>}
            </div>


        </>
    }

    isTraitor() {
        return this.state.role == Role.TRAITOR;
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
        if (this.state.exploredRooms.length == 0) {
            return <>
                <div>
                    You are not in a game.
                </div>
                <Link replace to="/lobby-list">Return to lobby List</Link>
            </>
        }

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
                            <div className="border border-success flex-grow-1 p-3 d-flex flex-column">
                                <h2>GAME</h2>
                                {this.game()}
                            </div>
                        </div>

                        {/* PLAYERS */}
                        <div className="border border-primary d-flex justify-content-around">
                            {this.players()}
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