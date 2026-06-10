import { Pool } from 'pg'

// Hardcode local credentials to bypass environment file bugs completely
const pool = new Pool({
    host: '127.0.0.1',       // Forces local address
    port: 5432,              // Standard Postgres port
    database: 'shoefinder',  // Your local database instance
    user: 'postgres',        // Database master user
    password: '091283',      // Your local password
})

export default pool