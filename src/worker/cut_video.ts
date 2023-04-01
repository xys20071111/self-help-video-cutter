/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { client } from '../db.ts'

interface IMsg {
    uuid: string
    start: string
    end: string
    input: string
    output: string
}

const taskQueue: Array<IMsg> = []

self.onmessage = (e) => {
    taskQueue.push(e.data)
}

console.log('启动剪辑worker')
setInterval(() => {
    if(taskQueue.length === 0) {
        return
    }
    const msg: IMsg = taskQueue[0]
    const task = Deno.run({
        cmd: ['ffmpeg',
            '-ss', msg.start,
            '-to', msg.end as string,
            '-i', `${msg.input}`,
            '-c:v', 'copy', '-c:a', 'copy',
            msg.output],
        stderr: 'null',
        stdout: 'null'
    })
    task.status().then((taskStatus) => {
        if (taskStatus.code === 0) {
            client.queryObject('UPDATE tasklist SET status=1 WHERE fileid=$1', [msg.uuid]);
        } else {
            client.queryObject('UPDATE tasklist SET status=2 WHERE fileid=$2', [msg.uuid]);
        }
        
    })
    taskQueue.splice(0, 1)
}, 200)