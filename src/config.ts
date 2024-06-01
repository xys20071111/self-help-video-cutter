interface IConfig {
	port: number
	dbhost: string
	db: string
	username: string
	password: string
	recordDir: Array<string>
	outputDir: string
	hostname?: string
	dbport: number
}

const decorder = new TextDecoder()

export const config: IConfig = JSON.parse(decorder.decode(Deno.readFileSync('./config.json')))