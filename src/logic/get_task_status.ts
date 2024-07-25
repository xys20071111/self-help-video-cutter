import { Context } from 'oak'
import { client } from '../db.ts'

export async function getTaskStatus(ctx: Context) {
	const { request, response } = ctx
	const query = request.url.searchParams
	const taskID = query.get('taskID')
	if (!taskID) {
		response.body = { code: -1, msg: '非法参数' }
		return
	}
	const result =
		await client`SELECT status FROM tasklist WHERE fileid=${taskID}`
	if (result.length === 0) {
		response.body = { code: -1, msg: '无此任务' }
		return
	}
	response.body = { code: 0, msg: result[0].status }
}
