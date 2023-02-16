import { Connection } from "mysql";
import util from 'util';

export default class Service {
    connection: Connection;
    query: (arg1: string, arg2?: any, ) => Promise<unknown>;

    constructor(connection: Connection) {
        this.connection = connection;
        this.query = util.promisify(this.connection.query).bind(this.connection);
    }

    // Return a single result
    async findOne(query: string, values?: any) {
        let data: any = await this.findQuantity(1, query, values);
        return data[0];
    }

    // Return a limited number of results
    async findQuantity(quantity: number, query: string, values?: any) {
        return await this.query(query + " LIMIT " + quantity, values);
    }
}