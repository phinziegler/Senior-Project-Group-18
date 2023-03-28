import React from "react";
import { Link } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import { GET, POST } from "../tools/fetch";
import requestUrl from "../tools/requestUrl";
import Environments from "../../shared/Environments";
import { getAuthToken } from "../tools/auth";
import MapNode from "../../server/game/MapNode";
import Room from "../../server/game/Room";
import Direction from "../../server/game/Direction";

export default function GameTest() {
    return <GameTestElement/>;
}

class GameTestElement extends React.Component {
    // 70% for 3
    // 20% for 2
    // 7% for 1
    // 3% for dead end
    // generateMap(map:Room[][], depth:number, currRoom:Room) {
    //     if (depth <= 0) {
    //         return true;
    //     }

    //     let chance = Math.random();
    //     if (chance > 0.3) {
    //         console.log("3 " + depth);
    //         this.generateRooms(map, depth, currRoom, 3);
    //     } else if (chance > 0.1) {
    //         console.log("2 " + depth);
    //         this.generateRooms(map, depth, currRoom, 2);
    //     } else {
    //         console.log("1 " + depth);
    //         this.generateRooms(map, depth, currRoom, 1);
    //     }
    // }

    // generateRooms(map:Room[][], depth:number, currRoom:Room, roomCount:Number) {
    //     for (let i = 0; i < roomCount; i++) {
    //         for (let j = 0; j < )

    //     }
    // }

    // generateRooms(depth:number, currNode:MapNode, roomCount:Number) {
    //     for (let i = 0; i < roomCount; i++) {
    //         let direction = Math.floor(Math.random() * 4);

    //         while (this.getNodeByDirection(direction, currNode) != null) {
    //             direction = Math.floor(Math.random() * 4);
    //         }

    //         switch (direction) {
    //             case Direction.LEFT:
    //                 currNode.left = new MapNode();
    //                 this.generateMap((depth - 1), currNode.left);
    //                 break;
    //             case Direction.RIGHT:
    //                 currNode.right = new MapNode();
    //                 this.generateMap((depth - 1), currNode.right);
    //                 break;
    //             case Direction.FORWARD:
    //                 currNode.forward = new MapNode();
    //                 this.generateMap((depth - 1), currNode.forward);
    //                 break;
    //             case Direction.BACK:
    //                 currNode.back = new MapNode();
    //                 this.generateMap((depth - 1), currNode.back);
    //                 break;
    //             default:
    //                 currNode.left = new MapNode();
    //                 this.generateMap((depth - 1), currNode.left);
    //                 break;
    //         }
    //     }
    // }

    // getNodeByDirection(direction:number, currNode:MapNode):(MapNode | null) {
    //     switch (direction) {
    //         case Direction.LEFT:
    //             return currNode.left;
    //         case Direction.RIGHT:
    //             return currNode.right;
    //         case Direction.FORWARD:
    //             return currNode.forward;
    //         case Direction.BACK:
    //             return currNode.back;
    //         default:
    //             return null;
    //     }
    // }

    main() {
        // let map:Room[][] = [[new Room()]];
        // let root = new MapNode();
        // this.generateMap(1, root);
        this.generate2DMap(3, 3);
        return JSON.stringify(this.generate2DMap(3, 3));
    }

    generate2DMap(rows:number, cols:number): (Room | null)[][]  {
        let leftProb = 0.5;
        let rightProb = 0.5;
        let forwardProb = 0.5;
        let backProb = 0.5;


        let map:(Room | null)[][] = new Array<Array<(Room | null)>>;

        for (let i = 0; i < rows; i++) {
            map.push(new Array<(Room | null)>);
            for (let j = 0; j < cols; j++) {
                map.at(i)?.push(null);
            }
        }

        
        let i:number = 0;
        let j:number = Math.floor(cols/2);

        map[i][j] = new Room();

        while (i < rows && j < cols) {
            console.log(i + ", " + j)
                if (map[i][j] != null) {

                    // Left
                    let chance = Math.random();
                    if (chance > leftProb && j > 0) {
                        map[i][j]!.left = true;

                        if (map[i][j - 1] == null) {
                            map[i][j - 1] = new Room();
                        }

                        map[i][j - 1]!.right = true;
                    }

                    // Right
                    chance = Math.random();
                    if (chance > rightProb && j < cols - 1) {
                        map[i][j]!.right = true;

                        if (map[i][j + 1] == null) {
                            map[i][j + 1] = new Room();
                        }
                        
                        map[i][j + 1]!.left = true;
                    } 

                    // Forward
                    chance = Math.random();
                    if (chance > forwardProb && i < rows - 1) {
                        map[i][j]!.forward = true;

                        if (map[i + 1][j] == null) {
                            map[i + 1][j] = new Room();
                        }
                        
                        map[i + 1][j]!.back = true;
                    } 

                    // Back
                    chance = Math.random();
                    if (chance > backProb && i > 0) {
                        map[i][j]!.back = true;

                        if (map[i - 1][j] == null) {
                            map[i - 1][j] = new Room();
                        }
                        
                        map[i - 1][j]!.forward = true;
                    }
            }

            if (j == cols - 1) {
                i++;
                j = 0;
            } else {
                j++;
            }
        }

        console.log(map);
        return map;
    }

    render() {
        return <div>{this.main()}</div>
    }
}