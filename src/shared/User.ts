/**
 * A user object as defined by the database table 'user'
 */
export default interface User {
    id: number,
    username: string,
    password: string,
    salt: string
}