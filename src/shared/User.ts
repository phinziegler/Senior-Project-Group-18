/**
 * A user object as defined by the database table 'user'
 */
export default interface User {
    id?: number,
    username: string,
    password?: string,
    salt?: string
}

// Returns only non-sensitive data of the user
export function safeUser(user: User): User {
    return {
        username: user.username
    }
}