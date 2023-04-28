import React from "react";
import User from "../../shared/User";


interface Props {
    user: User | null
}

interface State {

}

export default class Intro extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <>
                <div className="container-sm border border-success my-3 p-3 rounded">
                    <h1 className="text-center">Welcome to Tricks of the Trade!</h1>
                </div>
                <div className="container-sm border border-success my-3 p-3 rounded">
                    <div>
                        This is a multiplayer social deduction game in the style of a text adventure that takes place on a randomly generated grid-style map.  You will take on the role of adventurers hunting for riches—but one (or more) of your friends will be traitors more interested in seeing the rest of you fail. You will need to work together to reach the treasure as the traitors try to stop them. You will explore rooms one-by-one, avoiding traps and hazards along the way while the traitors sabotage you in an attempt to get you to step in a trap. You will begin with torches to help you explore the rooms. Each round, torch bearers will be randomly assigned across the adventurers and the traitors. Torch bearers have the ability to check the room ahead for traps, but the traitors have the opportunity to sabotage the torch bearers to give them false information. Each time you enter a dangerous room, a torch will go out. If you run out of torches your game will be over and the traitors win. If you make it to the treasure, the adventurers win. Good luck and happy adventuring!
                    </div>
                </div>
            </>
        );
    }
}