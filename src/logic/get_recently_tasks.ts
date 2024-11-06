import { Context } from 'oak'
import { client } from '../db.ts'
import { ITask } from "../task_interface.ts";

export async function getRecentlyTasks(ctx: Context) {
	const { response } = ctx
	const result: Array<ITask> = []
	const iter = client.list<ITask>({
		prefix: ['clip']
	})
	for (let i = 0; i < 10; i++) {
		const clip = await iter.next()
		if (!clip || !clip.value || !clip.value.value) {
			break
		}
		result.push(clip.value.value)
	}
	if (result.length === 0) {
		response.body = { code: -1, msg: '没有任务' }
		return
	}
	response.body = { code: 0, msg: result }
}
