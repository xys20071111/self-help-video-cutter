import { config } from '../config.ts'
import { Context } from '../deps.ts'

interface FileInfo {
    dirIndex: number
    name: string
    size: number
    duration: string
    birthtime: number
}
const decoder = new TextDecoder()
export async function getFileList(ctx: Context) {
    const { response } = ctx
    const fileInfo: Array<FileInfo> = []
    for (const dir of config.recordDir) {
        const files = await Deno.readDir(dir)
        for await (const file of files) {
            if (file.isFile && (file.name.endsWith('.flv') || file.name.endsWith('.mp4') || file.name.endsWith('.m3u8'))) {
                const filename = file.name
                const info = await Deno.stat(`${dir}/${filename}`)
                const ffprobe = new Deno.Command('ffprobe', {
                    args: ['-show_format', '-print_format', 'json', '-i', `${dir}/${filename}`],
                    stderr: 'null',
                    stdout: 'piped'
                })
                const ffprobeProgress = ffprobe.spawn()
                const status = await ffprobeProgress.status
                if (status.code === 0) {
                    const ffprobeOutputRaw = (await ffprobeProgress.stdout.getReader().read()).value
                    const ffprobeOutputRawJSON = decoder.decode(ffprobeOutputRaw)
                    const ffprobeOutput = JSON.parse(ffprobeOutputRawJSON)
                    fileInfo.push({
                        dirIndex: config.recordDir.indexOf(dir),
                        name: filename,
                        size: info.size / 1024 / 1024 / 1024,
                        duration: ffprobeOutput.format.duration,
                        birthtime: info.mtime?.valueOf() as number
                    })
                }
            }
        }
    }
    response.body = { code: 0, files: fileInfo.sort((a, b) => b.birthtime - a.birthtime) }
}