/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { client } from '../db.ts'

interface IMsg {
    title: string
    uuid: string
    start: string
    end: string
    input: string
    output: string
}

const decoder = new TextDecoder()
const taskQueue: Array<IMsg> = []

self.onmessage = (e) => {
    taskQueue.push(e.data)
}

console.log('启动剪辑worker')
setInterval(async () => {
    if (taskQueue.length === 0) {
        return
    }
    const msg: IMsg = taskQueue[0]
    taskQueue.splice(0, 1)
    await client.queryObject('INSERT INTO public.tasklist(fileid, src, starttime, endtime, dst, title, status) VALUES($1,$2,$3,$4,$5,$6,0)', [msg.uuid, msg.input, msg.start, msg.end, `${msg.uuid}.mp4`, msg.title])
    const task = new Deno.Command('/usr/bin/ffmpeg', {
        args: [
            '-ss', msg.start,
            '-to', msg.end,
            '-i', msg.input,
            '-c:v', 'copy', '-c:a', 'copy',
            msg.output
        ],
        stderr: 'piped',
        stdout: 'null'
    })
    const taskProgess = task.spawn()
    const taskStatus = await taskProgess.status
    if (taskStatus.code === 0) {
        await client.queryObject('UPDATE tasklist SET status=1 WHERE fileid=$1', [msg.uuid])
    } else {
        postMessage(decoder.decode((await taskProgess.stderr.getReader().read()).value))
        await client.queryObject('UPDATE tasklist SET status=2 WHERE fileid=$1', [msg.uuid])
    }
}, 200)