import { Connection, escape } from "mysql";
import util from 'util';

/**
 * Service classes connect to a particular table and perform SQL queries on them
 */
export default class Service {
    db: Connection;
    table: string;

    constructor(db: Connection, table: string) {
        this.db = db;
        this.table = table;
    }

    /**
     * Find a single record
     * @param query the SQL query 
     * @param values the values replacing ? in the query
     * @returns a single record
     */
    async findOne(fields: string | string[], where?: string) {
        let data: any = await this.findQuantity(1, fields, where);
        return data[0];
    }

    /**
     * Find a limited number of records
     * @param quantity the quantity of records to return (at the most)
     * @param query the SQL query
     * @param values the values replacing ? in the query
     * @returns A number of records given by the quantity parameter
     */
    async findQuantity(quantity: number, fields: string | string[], where?: string) {
        let query= `${this.select(fields, where)} LIMIT ${quantity}`;
        try {
            return await util.promisify(this.db.query).bind(this.db)(query);
        } catch(e: any) {
            throw new Error(e.message);
        }
    }

    /**
     * Performs a SELECT query
     * @param fields the fields to return
     * @param where the optional where clause
     * @param values the values replacing '?' in the where clause
     * @returns an array of row data
     */
    async find(fields: string | string[], where?: string) {
        const query = this.select(fields, where)
        try {
            return await util.promisify(this.db.query).bind(this.db)(query);
        } catch(e: any) {
            throw new Error(e.message);
        }
    }

    /**
     * Generate a SELECT SQL query
     * @param fields the fields to return from the query
     * @param where the where clause, if exists
     * @returns a SELECT SQL query as a string
     */
    private select(fields: string | string[], where?: string) {
        let f = this.commaList(fields);
        if (where)
            return `SELECT ${f} FROM ${this.table} WHERE ${where}`;
        return `SELECT ${f} FROM ${this.table}`;
    }

    /**
     * Takes input such as ['a','b','c'] and formats it like 'a, b, c'.
     * If the input is not a list, it simply returns the input again.
     * @param fields either a single string, or a list of strings
     * @returns 
     */
    private commaList(fields: string | string[]) {
        let f = "";
        if (typeof fields == typeof [""]) {
            for (let i = 0; i < fields.length; i++) {
                if (i != fields.length - 1) {
                    f += fields[i] + ", "
                } else {
                    f += fields[i]
                }
            }
        } else {
            f = String(fields);
        }
        return f;
    }

    /**
     * Takes input like ['a','b','c'] and gives 'a','b','c'
     * There is an easier way to do this using String.slice(), but 
     *      the reason for doing it this way is that I eventually
     *      want to use mysql.escape to prevent sql injection
     * @param values 
     * @returns 
     */
    private valuesToSQL(values: string[]) {
        let output = "";
        for (let i = 0; i < values.length; i++) {
            output += `'${values[i]}'`;
            if(i != values.length - 1) {
                output += `,`;
            }
        }
        return output;
    }

    /**
     * Insert an object
     * @param object 
     * @returns 
     */
    async insert(object: any) {     // TODO: prevent SQL injection
        let fields = [];
        let values = [];

        let property: keyof typeof object;
        for (property in object) {
            fields.push(property);
            values.push(object[property]);
        }

        let insertString = `(${this.commaList(fields)})`;
        let valueString = `(${this.valuesToSQL(values)})`;

        let query = `INSERT INTO ${this.table} ${insertString} VALUES ${valueString}`;
        try {
            return await util.promisify(this.db.query).bind(this.db)(query);
        } catch(e: any) {
            throw new Error(e.message);
        }
    }

    /**
     * Update a table row
     * @param fieldValuePairs 
     * @param where 
     * @returns 
     */
    async update(fieldValuePairs: [key: string, value: string][], where: string) {
        let queryItems: string[] = [];
        fieldValuePairs.forEach(pair => {
            queryItems.push(`${pair[0]} = ${pair[1]}`);
        });

        let query = `UPDATE ${this.table} SET ${this.commaList(queryItems)} WHERE ${where}`;

        try {
            return await util.promisify(this.db.query).bind(this.db)(query);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}