import React from "react";
import Room from "../../shared/Room";
import Role from "../../shared/Role";

interface Props {
    endGame: boolean
    fontSize?: number
    className: string
    role: Role,
    exploredRooms: Room[]
    rows: number,
    cols: number,
    rooms: Room[][],
    currentRoom: Room | null
}

interface State {

}

export default class GameMap extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {

        }
    }

    prefillRooms() {
        let possibleRooms: (Room | null)[][] = [];

        // Fill PossibleRooms
        for (let r = 0; r < this.props.rows; r++) {
            let row: (Room | null)[] = [];
            for (let c = 0; c < this.props.cols; c++) {
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
        this.props.exploredRooms.forEach(room => {
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

                let start = this.props.exploredRooms[0];
                rowElements2.push(<span key={`${rowIndex},${index}`}>
                    <span>{`${left}`}</span><span className={node.isGoal ? "text-success" : (this.props.currentRoom && this.props.currentRoom.row == node.row && this.props.currentRoom.col == node.col) ? "text-warning" : (node.row == start.row && node.col == start.col) ? "text-primary" : !node.isSafe ? "text-danger" : ""}>{`[${nodeType}]`}</span><span>{`${right}`}</span>
                </span>)
            });

            let rowElements3: JSX.Element[] = [];
            row.forEach((node, index) => {
                if (rowIndex == this.props.rooms.length - 1) {
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

        return <div style={{ whiteSpace: "pre", lineHeight: `${fontSize}px`, fontSize: `${fontSize}px` }} className="m-0" >{output}</div>;
    }

    // Returns a text representation of the map
    map(fontSize: number = 1) {

        if (this.props.role == Role.INNOCENT && !(this.props.endGame)) {
            return this.innocentMap(fontSize);
        }

        let rooms = this.bfs();
        let output: JSX.Element[] = [];
        this.props.rooms.forEach((row, rowIndex) => {
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

                let isExplored = false;
                this.props.exploredRooms.forEach(room => {
                    if(room.col == node.col && room.row == node.row) {
                        isExplored = true;
                        return;
                    }
                })

                let start = this.props.exploredRooms[0];
                rowElements2.push(<span key={`${rowIndex},${index}`}>
                    <span>{`${left}`}</span><span className={node.isGoal ? "text-success" : (this.props.currentRoom && this.props.currentRoom.row == node.row && this.props.currentRoom.col == node.col) ? "text-warning" : (node.row == start.row && node.col == start.col) ? "text-primary" : (isExplored) ? "text-info" : !node.isSafe ? "text-danger" : ""}>{`[${nodeType}]`}</span><span>{`${right}`}</span>
                </span>)
            });
            let rowElements3: JSX.Element[] = [];
            row.forEach((node, index) => {
                if (rowIndex == this.props.rooms.length - 1) {
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

        return <div style={{ whiteSpace: "pre", lineHeight: `${fontSize}px`, fontSize: `${fontSize}px` }} className="m-0" >{output}</div>;
    }

    bfs(): Set<Room> {
        if (this.props.rooms.length == 0) {
            return new Set();
        }
        let currRow = 0;
        let currCol = Math.floor(this.props.rooms[0].length / 2);
        let visitedRooms: Set<Room> = new Set();
        let roomsToVisit: Room[] = [];
        roomsToVisit.push(this.props.rooms[currRow][currCol]);

        while (roomsToVisit.length > 0) {
            currRow = roomsToVisit[0].row;
            currCol = roomsToVisit[0].col;
            if (!visitedRooms.has(this.props.rooms[currRow][currCol])) {
                visitedRooms.add(this.props.rooms[currRow][currCol]);

                if (this.props.rooms[currRow][currCol].up && !visitedRooms.has(this.props.rooms[currRow - 1][currCol])) {
                    roomsToVisit.push(this.props.rooms[currRow - 1][currCol]);
                }
                if (this.props.rooms[currRow][currCol].right && !visitedRooms.has(this.props.rooms[currRow][currCol + 1])) {
                    roomsToVisit.push(this.props.rooms[currRow][currCol + 1])
                }
                if (this.props.rooms[currRow][currCol].down && !visitedRooms.has(this.props.rooms[currRow + 1][currCol])) {
                    roomsToVisit.push(this.props.rooms[currRow + 1][currCol]);
                }
                if (this.props.rooms[currRow][currCol].left && !visitedRooms.has(this.props.rooms[currRow][currCol - 1])) {
                    roomsToVisit.push(this.props.rooms[currRow][currCol - 1]);
                }
            }
            roomsToVisit.shift();
        }
        return visitedRooms;
    }

    render() {
        return <div className={this.props.className}>
            {this.map(this.props.fontSize)}
        </div>
    }
}