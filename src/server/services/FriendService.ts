import { escape } from "mysql";
import Service from "../tools/Service";
import User from "../../shared/User";

/**
 * Performs queries on the friend table
 */
class FriendServiceClass extends Service {
    constructor() {
        super('friend');
    }

    public async addFriend(user: User, friend: User) {
        return await this.insert({ user_id: user.id, friend_id: friend.id });
    }

    public async removeFriend(user: User, friend: User) {
        return await this.delete(`user_id = ${escape(user.id)} AND friend_id = ${escape(friend.id)}`);
    }

    public async isFriend(user: User, friend: User) {
        return await this.findOne("*", `user_id = ${escape(user.id)} AND friend_id = ${escape(friend.id)}`).then(data => {
            if(!data) {
                return false;
            }
            return true;
        });
    }

    public async getFriendIds(user: User): Promise<{friend_id: number}[]> {
        return await this.find("friend_id", `user_id = ${escape(user.id)}`).then(data => {
            if(!data) {
                return [];
            }
            return data as {friend_id: number}[];
        });
    }
}

const FriendService = new FriendServiceClass();
export default FriendService;