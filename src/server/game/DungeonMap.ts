import MapNode from "./MapNode"

export default class Map {
    root: MapNode;

    constructor(root: MapNode = new MapNode()) {
        this.root = root;
    }
}