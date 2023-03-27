import { Context } from '../deps.ts'
import { client } from '../db.ts'
import { config } from '../config.ts'

export async function addTask(ctx: Context) {
    const { request, response } = ctx
    const query = request.url.searchParams
    const src = query.get('src')
    const start = query.get('start')
    const length = query.get('length')
    const title = query.get('title')
    if (!src || !start || !length || !title) {
		response.body = { code: -1, msg: '非法参数' };
		return;
	}
    const taskID = crypto.randomUUID()
    client.queryObject('INSERT INTO public.tasklist(fileid, src, starttime, endtime, dst, title, status) VALUES($1,$2,$3,$4,$5,$6,0)', [taskID, src as string, start, length, `${taskID}.mp4`, title])
    response.body = { code: 0, msg: taskID }
    const task = Deno.run({
        cmd: ['ffmpeg',
            '-ss', start as string,
            '-to', length as string,
            '-i', `${config.recordDir}/${src as string}`,
            '-c:v', 'copy', '-c:a', 'copy',
            `${config.outputDir}/${taskID}.mp4`],
        stderr: 'null',
        stdout: 'null'
    })
    const taskStatus = await task.status()
    if (taskStatus.code === 0) {
        client.queryObject('UPDATE tasklist SET status=1 WHERE fileid=$1', [taskID]);
    } else {
        client.queryObject('UPDATE tasklist SET status=2 WHERE fileid=$2', [taskID]);
    }
}