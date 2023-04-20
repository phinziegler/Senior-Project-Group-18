import React from "react"
import User from "../../shared/User";
import Role from "../../shared/Role";
import Direction from "../../shared/Direction";


interface Props {
    playerDirection: Direction | undefined,
    sabotagedList: Set<string>,
    role: Role,
    username: string,
    user: User | null,
    isTraitor: boolean,
    torchBearer: boolean,
    key?: number | string,
    canSabotage: boolean,
    doSabotage: (victim: string) => void;
    doUnsabotage: (victim: string) => void;
    changeSabotages: (_:number) => void;
}

interface State {
    sabotaged: boolean
}

export default class GamePlayer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            sabotaged: false
        }
    }


    sabotage() {
        if (this.state.sabotaged) {
            this.setState({
                sabotaged: false
            });
            this.props.doUnsabotage(this.props.username);
            this.props.changeSabotages(1);
            return;
        }
        this.props.changeSabotages(-1);
        this.props.doSabotage(this.props.username);
        this.setState({
            sabotaged: true
        });
    }

    directionEmoji(direction: Direction): string {
        switch (direction) {
            case Direction.UP:
                return "🡱";
            case Direction.RIGHT:
                return "🡲";
            case Direction.DOWN:
                return "🡳";
            case Direction.LEFT:
                return "🡰";
        }
    }

    render(): React.ReactNode {
        let isMe = this.props.username == this.props.user?.username;
        let myColor = this.props.role == Role.INNOCENT ? "success" : "danger";
        let color = this.props.isTraitor ? "danger" : ""
        return <>
            <div
                style={{userSelect: "none", width: "200px", overflow: "none"}}
                onClick={() => {
                    if(!this.props.canSabotage || !this.props.torchBearer || this.props.role == Role.INNOCENT || this.props.username == this.props.user?.username || this.props.isTraitor) {
                        return;
                    }
                    this.sabotage();
                }}
                className={"py-3 text-center text-" + (isMe ? myColor : color)}>
                {this.props.username}
                {this.props.torchBearer && <span>️‍🔥</span>}
                {this.props.playerDirection && <span className="text-white">{this.directionEmoji(this.props.playerDirection)}</span>}
                {this.state.sabotaged && <span>❌</span>}
                {this.props.sabotagedList.has(this.props.username) && <span>❗</span>}
            </div>
        </>
    }
}