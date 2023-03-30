import { config } from '../config.ts'
import { Context } from '../deps.ts'

interface FileInfo {
	name: string
	size: number
	duration: string
    birthtime: number
}
const decoder = new TextDecoder()
export async function getFileList (ctx: Context) {
    const { response } = ctx
    const files = await Deno.readDir(config.recordDir)
    const fileInfo: Array<FileInfo> = []
    for await (const file of files) {
        if(file.isFile && (file.name.endsWith('.flv') || file.name.endsWith('.mp4') || file.name.endsWith('.m3u8'))) {
            const filename = file.name
            const info = await Deno.stat(`${config.recordDir}/${filename}`)
            const ffprobe = Deno.run({
                cmd: ['ffprobe', '-show_format' ,'-print_format', 'json', '-i', `${config.recordDir}/${filename}`],
                stderr: 'null',
                stdout: 'piped'
            })
            const status = await ffprobe.status()
            if(status.code === 0) {
                const ffprobeOutputRaw = new Uint8Array(2048);
                const charCount = await ffprobe.stdout?.read(ffprobeOutputRaw)
                const ffprobeOutputRawJSON = decoder.decode(ffprobeOutputRaw.slice(0, charCount as number))
                const ffprobeOutput = JSON.parse(ffprobeOutputRawJSON)
                fileInfo.push({
                    name: filename,
                    size: info.size / 1024 / 1024 / 1024,
                    duration: ffprobeOutput.format.duration,
                    birthtime: info.mtime?.valueOf() as number
                })
            }
        }
    }
    
    response.body = { code: 0, files: fileInfo.sort((a, b) => a.birthtime - b.birthtime) }
}