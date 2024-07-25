/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { config } from '../config.ts'
import { client } from '../db.ts'
import { BliveM3u8Parser } from '../utils/blive_m3u8_parser.ts'

const ENDLIST = new Uint8Array([
	35, 69, 88, 84, 45, 88, 45, 69, 78, 68, 76, 73, 83, 84, 10,
])
const M3U8_HEADER = new Uint8Array([
	35, 69, 88, 84, 77, 51, 85, 10, 35, 69, 88, 84, 45, 88, 45, 86, 69, 82, 83,
	73, 79, 78, 58, 55, 10, 35, 69, 88, 84, 45, 88, 45, 84, 65, 82, 71, 69, 84,
	68, 85, 82, 65, 84, 73, 79, 78, 58, 49, 10, 35, 69, 88, 84, 45, 88, 45, 83,
	84, 65, 82, 84, 58, 84, 73, 77, 69, 45, 79, 70, 70, 83, 69, 84, 61, 48, 10,
])

interface IMsg {
	title: string
	uuid: string
	start: string
	end: string
	input: string
	output: string
}

const decoder = new TextDecoder()
const encoder = new TextEncoder()
const taskQueue: Array<IMsg> = []

self.onmessage = (e) => {
	taskQueue.push(e.data)
}

function splitTime(time: string): number {
	if (time.includes(':')) {
		const times = time.split(':')
		if (times.length === 3) {
			return (
				60 * 60 * parseInt(times[0]) +
				60 * parseInt(times[1]) +
				parseInt(times[2])
			)
		} else {
			return 60 * parseInt(times[0]) + parseInt(times[1])
		}
	} else {
		return parseInt(time)
	}
}

console.log('启动剪辑worker')
setInterval(async () => {
	if (taskQueue.length === 0) {
		return
	}
	const msg: IMsg = taskQueue[0]
	taskQueue.splice(0, 1)
	await client`INSERT INTO public.tasklist(fileid, src, starttime, endtime, dst, title, status) VALUES(${msg.uuid},${msg.input},${msg.start},${msg.end},${msg.uuid},${msg.title},0)`
	// [msg.uuid, msg.input, msg.start, msg.end, `${msg.uuid}.mp4`, msg.title],
	if (msg.input.endsWith('m3u8')) {
		// TODO: 处理m3u8文件，生成子m3u8，根据子m3u8生成mp4
		const text = await Deno.readFile(msg.input)
		const playlist = BliveM3u8Parser.parse(decoder.decode(text))
		let startTime = splitTime(msg.start)
		let stopTime = splitTime(msg.end)
		let startClipIndex = 0
		let stopClipIndex = 0
		let clipTimeCount = 0
		for (let i = 0; i < playlist.clips.length; i++) {
			clipTimeCount += playlist.clips[i].info.length
			if (clipTimeCount >= startTime) {
				startClipIndex = i
				break
			}
		}
		for (let i = startClipIndex; i < playlist.clips.length; i++) {
			clipTimeCount += playlist.clips[i].info.length
			if (clipTimeCount >= stopTime) {
				stopClipIndex = i
				break
			}
		}
		const targetClips = playlist.clips.slice(
			startClipIndex,
			stopClipIndex + 1,
		)
		const tmpFile = await Deno.makeTempFile({
			suffix: '.m3u8',
		})
		await Deno.writeFile(tmpFile, M3U8_HEADER)
		await Deno.writeFile(
			tmpFile,
			encoder.encode(`#EXT-X-MAP:URI="${playlist.mapFile}"\n`),
			{ append: true },
		)
		for (const clip of targetClips) {
			await Deno.writeFile(
				tmpFile,
				encoder.encode(
					`#EXTINF:${clip.info.length},422ce|b020c7c5\n${clip.filename}\n`,
				),
				{ append: true },
			)
		}
		await Deno.writeFile(tmpFile, ENDLIST, { append: true })
		const task = new Deno.Command(config.ffmpegPath || '/usr/bin/ffmpeg', {
			args: ['-i', tmpFile, '-c:v', 'copy', '-c:a', 'copy', msg.output],
			stderr: 'piped',
			stdout: 'piped',
		})
		const taskStatus = await task.output()
		if (taskStatus.code === 0) {
			await client`UPDATE tasklist SET status=1 WHERE fileid=${msg.uuid}`
		} else {
			postMessage(decoder.decode(taskStatus.stderr))
			await client`UPDATE tasklist SET status=2 WHERE fileid=${msg.uuid}`
		}
	} else {
		const task = new Deno.Command('/usr/bin/ffmpeg', {
			args: [
				'-ss',
				msg.start,
				'-to',
				msg.end,
				'-i',
				msg.input,
				'-c:v',
				'copy',
				'-c:a',
				'copy',
				msg.output,
			],
			stderr: 'inherit',
			stdout: 'inherit',
			stdin: 'inherit',
		})
		const taskProgess = task.spawn()
		const taskStatus = await taskProgess.output()
		// const taskStatus = await taskProgess.status
		if (taskStatus.code === 0) {
			postMessage(decoder.decode(taskStatus.stderr))
			await client`UPDATE tasklist SET status=1 WHERE fileid=${msg.uuid}`
		} else {
			await client`UPDATE tasklist SET status=2 WHERE fileid=${msg.uuid}`
		}
	}
}, 200)
