import { Context } from '../deps.ts'
import { config } from '../config.ts'
import { filterInt } from '../utils/filter_int.ts'

const taskWorker = new Worker(new URL('../worker/cut_video.ts', import.meta.url).href, { type: 'module' })
// deno-lint-ignore require-await
export async function addTask(ctx: Context) {
    const { request, response } = ctx
    const query = request.url.searchParams
    const src = query.get('src')
    const start = query.get('start')
    const length = query.get('length')
    const title = query.get('title')
    const dirIndexString = query.get('dirIndex')
    const dirIndex = filterInt(dirIndexString)
    if (!src || !start || !length || !title || !dirIndexString || isNaN(dirIndex) || src.length === 0 || start.length === 0 || length.length === 0 || dirIndexString.length === 0) {
        response.body = { code: -1, msg: '非法参数' };
        return;
    }
    const taskID = crypto.randomUUID()
    response.body = { code: 0, msg: taskID }
    taskWorker.postMessage({
        title,
        uuid: taskID,
        start,
        end: length,
        input: `${config.recordDir[dirIndex]}/${src as string}`,
        output: `${config.outputDir}/${taskID}.mp4`
    })
    taskWorker.addEventListener('message', (e) => {
        console.error('警告：任务出错')
        console.error(e.data)
    })
}