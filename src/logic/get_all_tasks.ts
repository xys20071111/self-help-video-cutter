import { Context } from 'oak'
import { client } from '../db.ts'
import { ITask } from "../task_interface.ts";

export async function getAllTasks(ctx: Context) {
	const { response } = ctx
	const result: Array<ITask> = []
	for await (const clip of client.list<ITask>({prefix: ['clip']})) {
		result.push(clip.value)
	}
	if (result.length === 0) {
		response.body = { code: -1, msg: '没有任务' }
		return
	}
	response.body = { code: 0, msg: result }
}
