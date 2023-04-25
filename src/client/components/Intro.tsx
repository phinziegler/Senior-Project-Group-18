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
        return(<div className="container-sm border border-success my-3">
            <h1 className="text-center">Welcome to Tricks of the Trade!</h1>
            <div>
                {/* PUT SOME STUFF IN HERE I REALLY DESPERATELY DO NOT WANT TO DO IT, NOR DO I KNOW HOW TO INTRODUCE OUR GAME <3*/}
            </div>
        </div>);
    }
}