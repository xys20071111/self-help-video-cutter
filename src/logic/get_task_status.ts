import { Context } from 'oak'
import { client } from '../db.ts'
import { ITask } from "../task_interface.ts";

export async function getTaskStatus(ctx: Context) {
	const { request, response } = ctx
	const query = request.url.searchParams
	const taskID = query.get('taskID')
	if (!taskID) {
		response.body = { code: -1, msg: '非法参数' }
		return
	}
	const result =
		await client.get<ITask>(['clip', taskID])
	if (!result.value) {
		response.body = { code: -1, msg: '无此任务' }
		return
	}
	response.body = { code: 0, msg: result.value.status }
}
