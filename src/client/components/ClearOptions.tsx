import React from "react";
import Room from "../../shared/Room";
import Direction from "../../shared/Direction";

interface Props {
    currentRoom: Room | null,
    viewRoom: (direction: Direction) => void;
}

interface State {
    direction: Direction | null
}

export default class ClearOptions extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            direction: null
        }
    }

    option(direction: Direction, text: string) {
        return <>
            {<div style={{ width: "200px" }} className={"btn " + (this.state.direction == direction ? "btn-warning" : "btn-dark") + " my-1 mx-1"} onClick={() => {
                this.setState({
                    direction: direction
                });
                this.props.viewRoom(direction);
            }}>{text}</div>}
        </>
    }

    render() {
        return <>
            <h2>Pick a room to clear</h2>
            <div className="d-flex flex-column mx-auto justify-content-center align-items-center">
                {this.props.currentRoom?.up && this.option(Direction.UP, "UP")}
                <div>
                    {this.props.currentRoom?.left && this.option(Direction.LEFT, "LEFT")}
                    {this.props.currentRoom?.right && this.option(Direction.RIGHT, "RIGHT")}
                </div>
                {this.props.currentRoom?.down && this.option(Direction.DOWN, "DOWN")}
            </div>
        </>
    }
}