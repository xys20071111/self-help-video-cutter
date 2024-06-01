import { Client } from 'postgres'
import { config } from './config.ts'

export const client = new Client({
    user: config.username,
    password: config.password,
    database: config.db,
    hostname: config.dbhost,
    port: config.dbport,
    tls: {
        enabled: false
    }
})

await client.connect()