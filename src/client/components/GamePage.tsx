import React from "react";
import Room from "../../shared/Room";
import User from "../../shared/User";
import Role from "../../shared/Role";
import { clientSocketManager } from "../tools/auth";
import MessageType from "../../shared/MessageTypes";
import PlayerAction from "../../shared/PlayerAction";
import Direction from "../../shared/Direction";


interface GameState {
    board: Room[][];
    explored: Room[];
    currentRoom: Room | null,
    players: User[];
    role: Role;
    sabotages: number;
}

export default class GamePage extends React.Component<{}, GameState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            board: [],
            explored: [],
            currentRoom: null,
            players: [],
            role: Role.INNOCENT,
            sabotages: 0
        }
    }

    // On load
    componentDidMount() {
        this.requestUpdate();
    }

    // Returns a text representation of the map
    // TODO: add some color stuff
    printMap() {
        let output = "";
        this.state.board.forEach(row => {
            row.forEach(node => {
                if (!(node.up || node.right || node.down || node.left)) {
                    output += ''.padStart(7);
                    return;
                }
                let up = node.up ? "||" : "  ";
                output += `   ${up}  `;
            });
            output += "\n";
            row.forEach(node => {
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

    // Render the map 
    map() {
        <div>
            {this.printMap()}
        </div>
    }

    // Request update from server
    requestUpdate() {
        clientSocketManager?.send(MessageType.GAME, { action: PlayerAction.UPDATE, data: {} });     // Sends a WS message requesting an update
    }

    // Send Vote to server
    placeVote(direction: Direction) {
        clientSocketManager?.send(MessageType.GAME, { action: PlayerAction.VOTE, data: { direction: direction } });
    }

    // Tell the server to sabotage a player
    sabotage(victim: string) {
        clientSocketManager?.send(MessageType.GAME, { action: PlayerAction.SABOTAGE, data: { victim: victim } });
    }

    // Tell the server that you intend to view a room
    viewRoom(direction: Direction) {
        clientSocketManager?.send(MessageType.GAME, { action: PlayerAction.VIEW, data: { direction: direction } })
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
            <div>GAME PAGE</div>
            {this.map()}
        </>);
    }
}