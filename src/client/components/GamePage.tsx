import React from "react";
import Room from "../../shared/Room";
import User from "../../shared/User";
import Role from "../../shared/Role";


export default class GamePage extends React.Component {
    board: Room[][];
    players: User[];
    role: Role;
    
    constructor(props: {}) {
        super(props);
        this.board = [];
        this.players = [];
        this.role = Role.INNOCENT;  // default is innocent
    }

    print() {
        let output = "";

        this.board.forEach(row => {
            row.forEach(node => {
                if (!(node.up || node.right || node.down || node.left)) {
                    output += ''.padStart(7);
                    return;
                }
                let up = node.up ? "||" : "  ";
                output += `   ${up}  `;
            });
            output+="\n";
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
            output+="\n";
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

        console.log(output);
    }
    
    // Render the map 
    map() {
        <div>

        </div>
    }

    render() {
        return <div>GAME PAGE</div>
    }
}