import { app } from './app.ts'
import { config } from './config.ts'

app.listen({
    port: config.port,
    hostname: '[::]'
})
