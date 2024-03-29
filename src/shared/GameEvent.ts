enum GameEvent {
    ROLE_ASSIGN = "roleAssign",
    BOARD_UPDATE = "boardUpdate",
    TORCH_ASSIGN = "torchAssign",
    SABOTAGE = "sabotage",
    UNSABOTAGE = "unsabotage",
    SABOTAGE_NUMBER = "sabotageNumber",
    VIEW_ROOM = "viewRoom",
    ROOM_SELECT = "roomSelect",
    PLAYER_VOTE = "playerVote",
    VOTE_RESULT = "voteResult",
    MOVE_RESULT = "moveResult",
    GAME_END = "gameEnd",
    UPDATE_PHASE = "updatePhase",
    UPDATE_TIMER = "updateTimer"
}

export default GameEvent;