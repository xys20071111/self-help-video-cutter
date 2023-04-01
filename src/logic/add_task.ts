import { Context } from '../deps.ts'
import { client } from '../db.ts'
import { config } from '../config.ts'

const taskWorker = new Worker(new URL('../worker/cut_video.ts', import.meta.url).href, {type: 'module'})
// deno-lint-ignore require-await
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
    taskWorker.postMessage({
        uuid: taskID,
        start,
        end: length,
        input: `${config.recordDir}/${src as string}`,
        output: `${config.outputDir}/${taskID}.mp4`
    })
}