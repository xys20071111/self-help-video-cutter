import { app } from './app.ts'
import { config } from './config.ts'
import { client } from './db.ts'

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

app.listen({
    port: config.port,
    hostname: config.hostname
})
