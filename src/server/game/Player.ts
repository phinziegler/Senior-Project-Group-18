export default class Player {
    username: string;
    hasTorch: boolean = false;

    constructor(username: string) {
        this.username = username;
    }
}