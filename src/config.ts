interface IConfig {
	port: number
	dbhost: string
	db: string
	username: string
	password: string
	recordDir: string
	outputDir: string
}

const decorder = new TextDecoder()

export const config: IConfig = JSON.parse(decorder.decode(Deno.readFileSync('./config.json')))