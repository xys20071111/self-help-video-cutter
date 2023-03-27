import { Context } from '../deps.ts'
import { client } from '../db.ts'

export async function getRecentlyTasks(ctx: Context) {
    const { response } = ctx
    const result = await client.queryObject<{
        id: number;
        fileid: string;
        title: string;
        start: string;
        end: string;
        src: string
    }>('SELECT id, fileid, title, starttime, endtime, src FROM tasklist ORDER BY id DESC LIMIT 10')
    if(result.rows.length === 0) {
        response.body = { code: -1, msg: '没有任务' }
        return
    }
    response.body = { code: 0, msg: result.rows }
}