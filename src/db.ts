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
await client.queryObject(`CREATE TABLE IF NOT EXISTS tasklist(
    ID SERIAL PRIMARY KEY,
    fileID VARCHAR(40) NOT NULL,
    src VARCHAR(255) NOT NULL,
    startTime VARCHAR(128) NOT NULL,
    endTime VARCHAR(128) NOT NULL,
    dst VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status INT NOT NULL
)`)