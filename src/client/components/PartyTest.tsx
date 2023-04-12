import React from "react";
import { Link } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import { GET, POST } from "../tools/fetch";
import requestUrl from "../tools/requestUrl";
import Environments from "../../shared/Environments";
import { getAuthToken } from "../tools/auth";
import Player from "../../server/party/Player";
import Party from "../../server/party/Party";
import Game from "../../server/party/Game";

export default function PartyTest() {
    return <PartyTestElement/>;
}

class PartyTestElement extends React.Component {
    
    main() {
        let game = new Game;
        game.party.broadcastAll("hi");
        // let map:Room[][] = [[new Room()]];
        // let root = new MapNode();
        // this.generateMap(1, root);
        return "ho";
    }

    render() {
        return <div>{this.main()}</div>
    }
}