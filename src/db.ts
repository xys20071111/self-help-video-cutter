import { PostgresClient } from './deps.ts'
import { config } from './config.ts'

export const client = new PostgresClient({
    user: config.username,
    password: config.password,
    database: config.db,
    hostname: config.dbhost,
    port: 5432,
    tls: {
        enabled: false
    }
})

await client.connect()