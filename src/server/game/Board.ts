import Room from '../../shared/Room'

export default class Board {
    rooms: Room[][] = [];
    goal: Room = this.newRoom(0, 0);
    rows: number;
    cols: number;

    constructor(rows: number, cols: number, isGuaranteedSafe: boolean) {
        this.rows = rows;
        this.cols = cols;
        this.generateBoard(rows, cols, isGuaranteedSafe);
        this.print();
    }

    generateBoard(rows: number, cols: number, isGuaranteedSafe: boolean) {
        let boardIsCorrect = false;
        while (!boardIsCorrect) {
            this.rooms = [];
            this.generateRooms(rows, cols);
            let k = 0;
            while (!boardIsCorrect && k < 3) {
                let goalRow = Math.floor(Math.random() * (this.rows / 2)) + Math.floor(this.rows / 2);
                let goalCol = Math.floor(Math.random() * this.cols);
                if (this.goalIsReachable(goalRow, goalCol, isGuaranteedSafe)) {
                    this.rooms[goalRow][goalCol].isSafe = true;
                    this.rooms[goalRow][goalCol].isGoal = true;
                    this.goal = this.rooms[goalRow][goalCol];
                    boardIsCorrect = true;
                }
                k++;
            }
        }
    }

    generateRooms(rows: number, cols: number) {
        const directionProb: number = 0.5;
        const safetyProb: number = 0.7;
        for (let i = 0; i < rows; i++) {
            let row: Room[] = [];
            for (let j = 0; j < cols; j++) {
                if (i == 0 && j == Math.floor(cols / 2)) {
                    row.push(this.newRoom(i, j, false, true, true, true, true, false));
                } else {
                    let up = i > 0 && this.rooms[i - 1][j].down;
                    let right = (j == Math.floor(cols / 2) - 1) || j < (cols - 1) && Math.random() <= directionProb;
                    let down = i < (rows - 1) && Math.random() <= directionProb;
                    let left = j > 0 && row[j - 1].right;
                    let isSafe = Math.random() <= safetyProb;
                    row.push(this.newRoom(i, j, up, right, down, left, isSafe, false));
                }
            }
            this.rooms.push(row);
        }
    }

    goalIsReachable(goalRow: number, goalCol: number, isGuaranteedSafe: boolean): boolean {
        let currRow = 0;
        let currCol = Math.floor(this.cols / 2);
        let visitedRooms: Set<Room> = new Set();
        let roomsToVisit: Room[] = [];
        roomsToVisit.push(this.rooms[currRow][currCol]);

        while (roomsToVisit.length > 0) {
            currRow = roomsToVisit[0].row;
            currCol = roomsToVisit[0].col;
            if (!visitedRooms.has(this.rooms[currRow][currCol])) {
                visitedRooms.add(this.rooms[currRow][currCol]);

                if (currRow == goalRow && currCol == goalCol) {
                    return true;
                }
                if (this.rooms[currRow][currCol].up && !visitedRooms.has(this.rooms[currRow - 1][currCol])
                    && (this.rooms[currRow - 1][currCol].isSafe || !isGuaranteedSafe)) {
                    roomsToVisit.push(this.rooms[currRow - 1][currCol]);
                }
                if (this.rooms[currRow][currCol].right && !visitedRooms.has(this.rooms[currRow][currCol + 1])
                    && (this.rooms[currRow][currCol + 1].isSafe || !isGuaranteedSafe)) {
                    roomsToVisit.push(this.rooms[currRow][currCol + 1])
                }
                if (this.rooms[currRow][currCol].down && !visitedRooms.has(this.rooms[currRow + 1][currCol])
                    && (this.rooms[currRow + 1][currCol].isSafe || !isGuaranteedSafe)) {
                    roomsToVisit.push(this.rooms[currRow + 1][currCol]);
                }
                if (this.rooms[currRow][currCol].left && !visitedRooms.has(this.rooms[currRow][currCol - 1])
                    && (this.rooms[currRow][currCol - 1].isSafe || !isGuaranteedSafe)) {
                    roomsToVisit.push(this.rooms[currRow][currCol - 1]);
                }
            }
            roomsToVisit.shift();
        }
        return false;
    }

    print() {
        let output = "";

        this.rooms.forEach(row => {
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

        console.log(output);
    }

    toJson() {
        return JSON.stringify(this.rooms);
    }

    private newRoom(row: number, col: number, forward: boolean = false, right: boolean = false, back: boolean = false, left: boolean = false, isSafe: boolean = true, isGoal: boolean = false) {
        return {
            row: row,
            col: col,
            up: forward,
            right: right,
            down: back,
            left: left,
            isSafe: isSafe,
            isGoal: isGoal,
            isVisited: false
        }
    }
}