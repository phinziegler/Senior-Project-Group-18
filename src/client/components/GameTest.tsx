import React from "react";
import { Link } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import { GET, POST } from "../tools/fetch";
import requestUrl from "../tools/requestUrl";
import Environments from "../../shared/Environments";
import { getAuthToken } from "../tools/auth";
import MapNode from "../../server/game/MapNode";
import DungeonMap from "../../server/game/DungeonMap";
import Direction from "../../server/game/Direction";

export default function GameTest() {
    return <GameTestElement/>;
}

class GameTestElement extends React.Component {
    // 70% for 3
    // 20% for 2
    // 7% for 1
    // 3% for dead end
    generateMap(depth:number, currNode:MapNode) {
        if (depth <= 0) {
            return true;
        }

        let chance = Math.random();
        if (chance > 0.3) {
            console.log("3 " + depth);
            this.generateRooms(depth, currNode, 3);
        } else if (chance > 0.1) {
            console.log("2 " + depth);
            this.generateRooms(depth, currNode, 2);
        } else {
            console.log("1 " + depth);
            this.generateRooms(depth, currNode, 1);
        }
    }

    generateRooms(depth:number, currNode:MapNode, roomCount:Number) {
        for (let i = 0; i < roomCount; i++) {
            let direction = Math.floor(Math.random() * 4);

            while (this.getNodeByDirection(direction, currNode) != null) {
                direction = Math.floor(Math.random() * 4);
            }

            switch (direction) {
                case Direction.LEFT:
                    currNode.left = new MapNode();
                    this.generateMap((depth - 1), currNode.left);
                    break;
                case Direction.RIGHT:
                    currNode.right = new MapNode();
                    this.generateMap((depth - 1), currNode.right);
                    break;
                case Direction.FORWARD:
                    currNode.forward = new MapNode();
                    this.generateMap((depth - 1), currNode.forward);
                    break;
                case Direction.BACK:
                    currNode.back = new MapNode();
                    this.generateMap((depth - 1), currNode.back);
                    break;
                default:
                    currNode.left = new MapNode();
                    this.generateMap((depth - 1), currNode.left);
                    break;
            }
        }
    }

    getNodeByDirection(direction:number, currNode:MapNode):(MapNode | null) {
        switch (direction) {
            case Direction.LEFT:
                return currNode.left;
            case Direction.RIGHT:
                return currNode.right;
            case Direction.FORWARD:
                return currNode.forward;
            case Direction.BACK:
                return currNode.back;
            default:
                return null;
        }
    }

    main() {
        let map:DungeonMap = new DungeonMap(new MapNode());
        this.generateMap(1, map.root);
        return JSON.stringify(map.root);
    }

    render() {
        return <div>{this.main()}</div>
    }
}