import postgres from 'postgres'
import { config } from './config.ts'

export const client = postgres(
	`postgres://${config.username}:${config.password}@${config.dbhost}:${config.dbport}/${config.db}`,
	{
		user: config.username,
		password: config.password,
		database: config.db,
		hostname: config.dbhost,
		port: config.dbport,
	},
)
