interface IConfig {
	port: number
	recordDir: Array<string>
	outputDir: string
	hostname?: string
	ffmpegPath?: string
}

const decorder = new TextDecoder()

export const config: IConfig = JSON.parse(decorder.decode(Deno.readFileSync('./config.json')))