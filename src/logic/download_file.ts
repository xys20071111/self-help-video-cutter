import { Context } from 'oak'
import { client } from '../db.ts'
import { config } from '../config.ts'
import { ITask } from "../task_interface.ts";

export async function downloadFile(ctx: Context) {
	const { request, response } = ctx
	const query = request.url.searchParams
	const taskID = query.get('taskID')
	if (!taskID) {
		response.body = { code: -1, msg: '非法参数' }
		return
	}
	const result = await client.get<ITask>(["clip", taskID])
	if (!result.value) {
		response.body = { code: -1, msg: '无此任务' }
		return
	}
	if (result.value.status == 0) {
		response.body = { code: -1, msg: '任务未完成' }
		return
	}
	if (result.value.status == 2) {
		response.body = { code: -1, msg: '任务失败' }
		return
	}
	try {
		const file = await Deno.open(`${config.outputDir}/${taskID}.mp4`)
		response.headers.append('Content-Type', 'application/download')
		response.headers.append(
			'Content-Disposition',
			`attachment;filename=${encodeURI(result.value.title)}.mp4`,
		)
		response.body = file
	} catch {
		response.body = { code: -1, msg: '文件已从硬盘清除' }
		return
	}
}
