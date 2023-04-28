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
import { Link, Navigate } from "react-router-dom";
import GamePlayer from "./GamePlayer";
import DirectionalVote from "./DirectionalVote";
import GameMap from "./GameMap";
import GamePhase from "../../shared/GamePhase";
import { SocketEvent } from "../websockets/SocketEvent";

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
    sabotagedByOthersList: Set<string>,
    sabotagedBySelfList: Set<string>,
    playerToDirectionRoomSelect: Map<string, Direction>,
    playerToDirectionVote: Map<string, Direction>,
    clearedRoomSafe: boolean | null,
    clearedDirection: Direction,
    gamePhase: GamePhase,
    prevGamePhase: GamePhase,
    time: number,
    roomWasSafe: boolean | null,
    voteResult: Direction | null,
    winner: Role | null,
    endGamePlayerData: { username: string, role: Role }[],
    navigate: string,
    lobbyLeader: string,
    openChat: boolean,
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
            sabotagedByOthersList: new Set(),
            sabotagedBySelfList: new Set(),
            playerToDirectionRoomSelect: new Map(),
            playerToDirectionVote: new Map(),
            clearedRoomSafe: null,
            clearedDirection: Direction.NONE,
            gamePhase: GamePhase.UNKNOWN,
            prevGamePhase: GamePhase.UNKNOWN,
            time: 0,
            roomWasSafe: null,
            voteResult: null,
            winner: null,
            endGamePlayerData: [],
            navigate: "",
            lobbyLeader: "",
            openChat: false,
        }

        // BIND LISTENERS
        this.wsConnectListener = this.wsConnectListener.bind(this);
        this.roomSelectEvent = this.roomSelectEvent.bind(this);
        this.sabotageEvent = this.sabotageEvent.bind(this);
        this.unsabotageEvent = this.unsabotageEvent.bind(this);
        this.roleAssignEvent = this.roleAssignEvent.bind(this);
        this.boardUpdateEvent = this.boardUpdateEvent.bind(this);
        this.torchAssignEvent = this.torchAssignEvent.bind(this);
        this.viewRoomEvent = this.viewRoomEvent.bind(this);
        this.playerVoteEvent = this.playerVoteEvent.bind(this);
        this.voteResultEvent = this.voteResultEvent.bind(this);
        this.gameEndEvent = this.gameEndEvent.bind(this);
        this.updateTimeEvent = this.updateTimeEvent.bind(this);
        this.updatePhaseEvent = this.updatePhaseEvent.bind(this);
        this.moveResultEvent = this.moveResultEvent.bind(this);
        this.gameStartListener = this.gameStartListener.bind(this);
        this.gameEndedExternallyListener = this.gameEndedExternallyListener.bind(this);

    }

    // REMOVE EVENT LISTENERS
    componentWillUnmount(): void {
        window.removeEventListener("wsConnect", this.wsConnectListener);
        window.removeEventListener(GameEvent.ROOM_SELECT, this.roomSelectEvent);
        window.removeEventListener(GameEvent.SABOTAGE, this.sabotageEvent);
        window.removeEventListener(GameEvent.UNSABOTAGE, this.unsabotageEvent);
        window.removeEventListener(GameEvent.ROLE_ASSIGN, this.roleAssignEvent);
        window.removeEventListener(GameEvent.BOARD_UPDATE, this.boardUpdateEvent);
        window.removeEventListener(GameEvent.TORCH_ASSIGN, this.torchAssignEvent);
        window.removeEventListener(GameEvent.VIEW_ROOM, this.viewRoomEvent);
        window.removeEventListener(GameEvent.PLAYER_VOTE, this.playerVoteEvent);
        window.removeEventListener(GameEvent.VOTE_RESULT, this.voteResultEvent);
        window.removeEventListener(GameEvent.GAME_END, this.gameEndEvent);
        window.removeEventListener(GameEvent.UPDATE_TIMER, this.updateTimeEvent);
        window.removeEventListener(GameEvent.UPDATE_PHASE, this.updatePhaseEvent);
        window.removeEventListener(GameEvent.MOVE_RESULT, this.moveResultEvent);
        window.removeEventListener(SocketEvent.GAME_START, this.gameStartListener);
        window.removeEventListener(SocketEvent.GAME_END, this.gameEndedExternallyListener);

    }


    // ADD EVENT LISTENERS
    componentDidMount() {
        window.addEventListener("wsConnect", this.wsConnectListener);
        window.addEventListener(GameEvent.ROOM_SELECT, this.roomSelectEvent);
        window.addEventListener(GameEvent.SABOTAGE, this.sabotageEvent);
        window.addEventListener(GameEvent.UNSABOTAGE, this.unsabotageEvent);
        window.addEventListener(GameEvent.ROLE_ASSIGN, this.roleAssignEvent);
        window.addEventListener(GameEvent.BOARD_UPDATE, this.boardUpdateEvent);
        window.addEventListener(GameEvent.TORCH_ASSIGN, this.torchAssignEvent);
        window.addEventListener(GameEvent.VIEW_ROOM, this.viewRoomEvent);
        window.addEventListener(GameEvent.PLAYER_VOTE, this.playerVoteEvent);
        window.addEventListener(GameEvent.VOTE_RESULT, this.voteResultEvent);
        window.addEventListener(GameEvent.GAME_END, this.gameEndEvent);
        window.addEventListener(GameEvent.UPDATE_TIMER, this.updateTimeEvent);
        window.addEventListener(GameEvent.UPDATE_PHASE, this.updatePhaseEvent);
        window.addEventListener(GameEvent.MOVE_RESULT, this.moveResultEvent);
        window.addEventListener(SocketEvent.GAME_START, this.gameStartListener);
        window.addEventListener(SocketEvent.GAME_END, this.gameEndedExternallyListener);

        // REQUEST UPDATE
        if (!clientSocketManager) {
            return; // not logged in
        }

        if (clientSocketManager.connected) {
            this.requestUpdate();
            return;
        }
    }

    /****************************************************************************/
    /***************************** EVENT HANDLERS ******************************/
    /****************************************************************************/

    gameStartListener() {
        this.newGame()
    }

    gameEndedExternallyListener() {
        console.log("Game Ended Externally");
        this.setState({
            navigate: `/lobby/${this.state.lobbyId}`
        });
    }

    // Connect to websocket listener
    wsConnectListener() {
        this.requestUpdate();
    }

    // Tell the user what happened in the move
    moveResultEvent(e: any) {
        this.setState({
            roomWasSafe: e.detail.data.nextRoomIsSafe
        });
    }

    // Assign a role to the user -- also # of sabotages for traitors
    roleAssignEvent(e: any) {
        let sabotages;
        let isTraitor = e.detail.data.isTraitor;
        let traitors;
        try {
            sabotages = e.detail.data.sabotages;
            traitors = e.detail.data.traitors;
        } catch {
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
        let currentRoom = e.detail.data.currentRoom;
        let rows;
        let cols;
        let hasDimensions = false;
        try {
            rows = e.detail.data.rows;
            cols = e.detail.data.cols;
            hasDimensions = true;
        } catch { }

        let board;
        try {
            board = e.detail.data.board.rooms;
        } catch { }

        this.setState({
            exploredRooms: exploredRooms,
            currentRoom: currentRoom
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
            this.getLobbyInfo(lobbyId);
        }
    }

    // Display when a fellow traitor sabotages someone
    sabotageEvent(e: any) {
        if (!this.props.user) {
            return;
        }
        if (e.detail.data.sabotager == this.props.user.username) {
            let selfSabotage = this.state.sabotagedBySelfList;
            selfSabotage.add(e.detail.data.victim);
            this.setState({ sabotagedBySelfList: selfSabotage });
            return;
        }
        let others = this.state.sabotagedByOthersList;
        others.add(e.detail.data.victim);
        this.setState({ sabotagedByOthersList: others });
    }

    // Display when a fellow traitor revokes their sabotage
    unsabotageEvent(e: any) {
        if (!this.props.user) {
            return;
        }
        if (e.detail.data.sabotager == this.props.user.username) {
            let selfSabotage = this.state.sabotagedBySelfList;
            selfSabotage.delete(e.detail.data.victim);
            this.setState({ sabotagedBySelfList: selfSabotage });
            return;
        }
        let others = this.state.sabotagedByOthersList;
        others.delete(e.detail.data.victim);
        this.setState({ sabotagedByOthersList: others });
    }

    // Inform the user who has torches
    torchAssignEvent(e: any) {
        this.setState({ torchAssignments: e.detail.data.torchAssignments });
    }

    // Tell the user what info they got from using a torch in a room
    viewRoomEvent(e: any) {
        let isSafe = e.detail.data.isSafe;
        let direction = e.detail.data.direction;

        this.setState({
            clearedRoomSafe: isSafe,
            clearedDirection: direction
        });
    }

    // Triggered when a player declares that they will check a room
    roomSelectEvent(e: any) {
        let user = e.detail.data.player;
        let direction = e.detail.data.direction;
        let map = this.state.playerToDirectionRoomSelect;
        map.set(user, direction);
        this.setState({
            playerToDirectionRoomSelect: map
        });
    }

    // Tell the user when a player places a vote
    playerVoteEvent(e: any) {
        let player = e.detail.data.player;
        let direction = e.detail.data.direction;

        let map = this.state.playerToDirectionVote;
        map.set(player, direction);
        this.setState({
            playerToDirectionVote: map
        });
    }

    // Tell the user the result of the voting
    voteResultEvent(e: any) {
        this.setState({ voteResult: e.detail.data.voteDir });
    }

    // Tell the user that the game has ended
    gameEndEvent(e: any) {
        let winning = e.detail.data.winning;
        let playerData: { username: string, role: Role }[] = e.detail.data.playerData;
        this.setState({
            winner: winning,
            endGamePlayerData: playerData,
        });
    }

    // Tell the user how much time remains in the given phase
    updateTimeEvent(e: any) {
        let time = e.detail.data.time;
        this.setState({ time: time });
    }

    // Tell the user when the game phase updates
    updatePhaseEvent(e: any) {
        let oldPhase: GamePhase = this.state.gamePhase;
        let newPhase: GamePhase = e.detail.data.phase;
        this.setState({ gamePhase: newPhase, prevGamePhase: oldPhase }, () => {
            // VOTE --> SABOTAGE
            if (oldPhase == GamePhase.VOTE && newPhase == GamePhase.SABOTAGE) {
                this.setState({
                    playerToDirectionVote: new Map(),
                    clearedDirection: Direction.NONE,
                    clearedRoomSafe: null,
                    sabotagedByOthersList: new Set(),
                    sabotagedBySelfList: new Set()
                });
            }

            // SABOTAGE --> VOTE
            if (oldPhase == GamePhase.SABOTAGE && newPhase == GamePhase.VOTE) {
                this.setState({
                    sabotaging: false,
                    playerToDirectionRoomSelect: new Map(),
                });
            }
        })

    }


    // Get the list of users for a lobby
    async getUsersLobby(lobbyId: string) {
        await GET(requestUrl(ServerRoutes.GET_LOBBY_USERS(lobbyId))).then(res => res.json()).then((data: any) => {
            this.setState({
                players: data
            });
        });
    }

    // Get Lobby Information
    async getLobbyInfo(lobbyId: string) {
        await GET(requestUrl(ServerRoutes.GET_LOBBY(lobbyId))).then(res => res.json()).then((data: any) => {
            this.setState({ lobbyLeader: data.leader })
        })
    }

    /**************************************************************/
    /**********************  PLAYER ACTIONS  **********************/
    /**************************************************************/

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
        if (!this.props.user) {
            return;
        }
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.SABOTAGE, data: { sabotager: this.props.user.username, victim: victim } });
    }

    // Unsabotage
    unsabotage(victim: string) {
        if (!this.props.user) {
            return;
        }
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.UNSABOTAGE, data: { sabotager: this.props.user.username, victim: victim } });
    }

    // Tell the server that you intend to view a room
    viewRoom(direction: Direction) {
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.VIEW, data: { direction: direction } });
    }

    // Tell the server that you voted for a room to enter
    vote(direction: Direction) {
        clientSocketManager?.send(MessageType.GAME, { action: UserAction.VOTE, data: { direction: direction } });
    }

    // I personally hate doing this
    newGame() {
        let data: GameState = {
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
            sabotagedByOthersList: new Set(),
            sabotagedBySelfList: new Set(),
            playerToDirectionRoomSelect: new Map(),
            playerToDirectionVote: new Map(),
            clearedRoomSafe: null,
            clearedDirection: Direction.NONE,
            gamePhase: GamePhase.UNKNOWN,
            prevGamePhase: GamePhase.UNKNOWN,
            time: 0,
            roomWasSafe: null,
            voteResult: null,
            winner: null,
            endGamePlayerData: [],
            navigate: "",
            lobbyLeader: "",
            openChat: false,
        }
        this.setState(data);
        this.requestUpdate();
    }

    // Render the players
    players() {
        let output: JSX.Element[] = [];
        this.state.players.forEach((player, index) => {
            output.push(
                <GamePlayer
                    playerDirectionRoomSelect={this.state.playerToDirectionRoomSelect.get(player)}
                    playerDirectionVote={this.state.playerToDirectionVote.get(player)}
                    sabotagedByOthersList={this.state.sabotagedByOthersList}
                    sabotagedBySelfList={this.state.sabotagedBySelfList}

                    doSabotage={(victim) => {
                        let sabotagedBySelfList = this.state.sabotagedBySelfList;
                        sabotagedBySelfList.add(victim);
                        this.setState({ sabotagedBySelfList: sabotagedBySelfList })
                        this.sabotage(victim);
                    }}
                    doUnsabotage={(victim) => {
                        let sabotagedBySelfList = this.state.sabotagedBySelfList;
                        sabotagedBySelfList.delete(victim);
                        this.setState({ sabotagedBySelfList: sabotagedBySelfList })
                        this.unsabotage(victim);
                    }}

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

    // Show the result of the clear room
    viewRoomResult() {
        // let direction = this.state.clearedDirection == Direction.NONE ? "NOTHING" : this.state.clearedDirection.toUpperCase();
        if (this.state.clearedDirection == Direction.NONE) {
            return <span>You checked NOTHING</span>
        }
        let message = `You checked ${this.state.clearedDirection ? `${this.state.clearedDirection.toUpperCase()} and saw that it is ` : "NOTHING and saw "}`;
        let keyword = this.state.clearedRoomSafe == null ? "NOTHING" : this.state.clearedRoomSafe ? "SAFE" : "UNSAFE";
        let color = this.state.clearedRoomSafe == null ? "text-white" : this.state.clearedRoomSafe ? "text-success" : "text-danger";
        return (<>
            <span>{message}</span><span className={color}>{keyword}</span><span>.</span>
        </>);
    }

    displayPlayerWithRole(username: string, role: Role) {
        let color = role == Role.TRAITOR ? "text-danger" : "text-success";
        return (
            <div key={username} className="d-flex">
                <div style={{ width: "100px" }} className="text-center ">
                    {username}
                </div>
                <div className="border border-secondary border-right-0"></div>
                <div style={{ width: "100px" }} className={" text-center " + color}>
                    {String(role).toUpperCase()}
                </div>
            </div>
        );
    }

    roles() {
        let traitors: JSX.Element[] = [];
        let adventurers: JSX.Element[] = [];

        this.state.endGamePlayerData.forEach(player => {
            if (player.role == Role.TRAITOR) {
                traitors.push(this.displayPlayerWithRole(player.username, player.role));
            }
            if (player.role == Role.INNOCENT) {
                adventurers.push(this.displayPlayerWithRole(player.username, player.role));
            }
        })


        return (
            <div className="d-flex justify-content-center">

                <div className="me-3 border-right">
                    {traitors}
                    <hr />
                    {adventurers}
                </div>
                <div className="mx-e">
                </div>
            </div>
        );
    }

    endGame() {
        if (!this.state.winner) {
            return;
        }

        if (!this.props.user) {
            return;
        }

        let winner = this.state.winner == Role.TRAITOR ? "TRAITORS " : "ADVENTURERS ";
        let color = this.state.winner == Role.TRAITOR ? "text-danger" : "text-success";
        let userWins = this.state.role == this.state.winner ? "VICTORY" : "DEFEAT";
        let userColor = this.state.role == this.state.winner ? "text-success" : "text-danger";

        let isOwner = this.state.lobbyLeader == this.props.user.username;

        return (
            <div className="d-flex flex-column flex-grow-1">
                <h2 className="text-center"><span className={color}>{winner}</span><span>win!</span></h2>
                <hr />
                <h1 className={userColor + " text-center"}>{userWins}</h1>
                <hr />
                {this.roles()}
                <div className="flex-grow-1"></div>

                {isOwner && <>
                    {/* NEW GAME */}
                    <button onClick={() => {
                        clientSocketManager?.send(MessageType.GAME_START, { lobbyId: this.state.lobbyId });
                    }} className="my-1 m-auto d-inline btn btn-success">Play again</button>

                    {/* END GAME */}
                    <button onClick={() => {
                        clientSocketManager?.send(MessageType.GAME_END, { lobbyId: this.state.lobbyId });
                    }} className="my-1 m-auto d-inline btn btn-danger">End Game</button>
                </>
                }

            </div>
        );
    }

    // Gaming
    game() {
        if (this.state.winner) {
            return this.endGame();
        }
        if (!this.props.user) {
            return;
        }

        let phase: string = this.state.gamePhase == GamePhase.VOTE ? "Vote" : this.state.role == Role.INNOCENT ? "Clear" : "Sabotage";

        let phraseResult: string = this.state.voteResult ? (this.state.voteResult == Direction.NONE ? "The group could not agree where to go next..." : `The group moves ${this.state.voteResult.toUpperCase()}.`) : "";
        let secondaryPhrase: string = ` The path is `;
        let colorResult: string = this.state.roomWasSafe != null && this.state.roomWasSafe ? "text-success" : "text-danger";
        let resultResult: string = this.state.roomWasSafe != null && this.state.roomWasSafe ? `SAFE` : `UNSAFE`;
        let post: string = this.state.roomWasSafe != null && this.state.roomWasSafe ? ". A stroke of luck." : ". A gust of wind sweeps through, and the room darkens as a torch is blown out.";

        return <>
            <div className="d-flex flex-column text-center position-relative flex-grow-1">
                {/* Phase */}
                <h2>Phase: {phase}</h2>
                <hr />

                {/* Clear Room*/}
                {this.state.gamePhase == GamePhase.SABOTAGE && (this.state.torchAssignments.includes(this.props.user?.username) ?
                    <>
                        <h3>Pick a room to clear</h3>
                        <DirectionalVote
                            currentRoom={this.state.currentRoom}
                            voteAction={(direction) => this.viewRoom(direction)} />
                    </> :
                    <div>
                        The torch bearers are making their selections...
                    </div>)}

                {/* Room Result */}
                {this.state.gamePhase == GamePhase.VOTE && <>
                    {this.viewRoomResult()}
                    <hr />
                </>}

                {/* Vote Room */}
                {this.state.gamePhase == GamePhase.VOTE &&
                    <>
                        <h3>Vote for a room to enter</h3>
                        <DirectionalVote
                            currentRoom={this.state.currentRoom}
                            voteAction={(direction) => this.vote(direction)} />
                    </>}

                {/* VOTE/MOVE RESULT */}
                {this.state.voteResult && <>
                    <hr />
                    <div>
                        <span>{phraseResult}</span>
                        {this.state.voteResult != Direction.NONE && <span>{secondaryPhrase}</span>}
                        {this.state.voteResult != Direction.NONE && <span className={colorResult}>{resultResult}</span>}
                        {this.state.voteResult != Direction.NONE && <span>{post}</span>}
                    </div>
                    <hr />
                </>}

                {/* Sabotage Tooltip */}
                {this.state.gamePhase == GamePhase.SABOTAGE && this.state.sabotaging && <div className="text-danger">Click on a torchbearer to sabotage their room clear.</div>}

                <div className="d-flex flex-grow-1 align-items-end justify-content-between">
                    {/* TIMER */}
                    <div>
                        Time: {this.state.time}
                    </div>
                    {/* SABOTAGE */}
                    {this.isTraitor() && this.state.gamePhase == GamePhase.SABOTAGE && <div>
                        <button onClick={() => {
                            if (this.state.sabotaging) {
                                this.setState({ sabotaging: false });
                                return;
                            }
                            this.setState({ sabotaging: true });
                        }} className="btn btn-danger">SABOTAGE</button>
                        <div className="text-danger small">Remaining: {this.state.sabotages}</div>
                    </div>}
                </div>
            </div>
        </>
    }

    // Whether or not the player is a traitor
    isTraitor() {
        return this.state.role == Role.TRAITOR;
    }

    openCloseChat = () => {
        this.setState((prevState) => ({ openChat: !prevState.openChat }));
    }

    // Render the game page
    render() {
        // Navigate away
        if (this.state.navigate != "") {
            return <Navigate to={this.state.navigate} />
        }

        // No game started page
        if (this.state.exploredRooms.length == 0) {
            return <div className="p-3 text-center rounded container-sm my-3 border border-success">
                <h2>
                    You are not in a game.
                </h2>
                <Link className="h3 btn btn-success" replace to="/lobby-list">Return to lobby List</Link>
            </div>
        }

        // Game has started

        let border = " border-success"
        if (this.isTraitor()) {
            border = " border-danger"
        }

        let gameDisplay = ""
        let chatDisplay = " d-none"
        let chatFlexRow = ""
        if (this.state.openChat)
        {
            gameDisplay = " d-none"
            chatDisplay = ""
            chatFlexRow = " flex-row"
        }

        let color = this.state.role == Role.INNOCENT ? "success" : "danger";
        let phrase = this.state.role == Role.INNOCENT ? "You are an " : "You are a ";
        let role = this.state.role == Role.INNOCENT ? "ADVENTURER" : "TRAITOR"

        return (
        <>
            <div className={"d-flex w-100 flex-column flex-md-row mobile-vh100 border" + border}>
                {/* NOT CHAT (vertical flex) */}
                <div className="d-flex flex-column flex-grow-1">
                    {/* Game/MAP horizontal */}
                    <div className="d-flex flex-column flex-md-row flex-grow-1">
                        {/* MAP */}
                        <div className={"border p-3 d-flex d-md-block flex-row flex-md-column justify-content-center" + border + gameDisplay}>
                            <h2>MAP</h2>
                            <GameMap
                                endGame={this.state.winner != null}
                                fontSize={10}
                                className="d-flex justify-content-center flex-grow-1"
                                role={this.state.role}
                                exploredRooms={this.state.exploredRooms}
                                rows={this.state.rows}
                                cols={this.state.cols}
                                rooms={this.state.rooms}
                                currentRoom={this.state.currentRoom}
                            />
                            {/* OPEN CHAT BUTTON (mobile only)*/}
                            <button className={"d-md-none open-chat-button align-self-start"} onClick={this.openCloseChat}>"Open Chat"</button>
                        </div>

                        {/* GAME */}
                        <div className={"border flex-grow-1 p-3 d-flex flex-column" + border}>
                            <div className={"d-flex flex-row justify-content-between"}>
                                <h2>GAME</h2>
                                <span>{phrase}<span className={`text-${color}`}>{role}</span></span>
                            </div>
                            {this.game()}
                        </div>
                    </div>

                    {/* PLAYERS */}
                    <div className={"border d-flex justify-content-around flex-wrap" + border}>
                        {this.players()}
                        <div className="flex-grow-1" />
                    </div>
                </div>
                {/* ----------------------------------------------------------------------------------------------- */}
                {/* CHAT */}
                <div className={"border p-3 d-md-block order-first order-md-last" + border + chatDisplay}>
                    <div className={"d-flex flex-row justify-content-between"}>
                        <h2>Chat</h2>
                        {/* CLOSE CHAT BUTTON (mobile only) */}
                        <button className={"d-md-none mb-auto align-self-start close-chat-button"} onClick={this.openCloseChat}>"Close Chat"</button>
                    </div>
                    <Chat lobbyId={this.state.lobbyId} user={this.props.user} />
                </div>
            </div>
        </>
        );
    }
}
