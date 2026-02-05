import { Pool } from 'pg'; // Using pool over client so we don't have to manage indivudal db requests 

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('Define connection string in DATABASE_URL variable inside .env.local')
}

export const pool = new Pool({ 
    connectionString: connectionString, // Extracts user, password, host, and port
    ssl: {
        rejectUnauthorized: false, // Encrypt connection to prevent reading db queries, but don't verify for ease
    },
});

console.log("Database pool created.")