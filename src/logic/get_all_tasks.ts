import { Context } from 'oak'
import { client } from '../db.ts'

export async function getAllTasks(ctx: Context) {
	const { response } = ctx
	const result: Array<{
		id: number
		fileid: string
		title: string
		start: string
		end: string
		src: string
	}> =
		await client`SELECT id, fileid, title, starttime, endtime, src FROM tasklist ORDER BY id DESC`
	if (result.length === 0) {
		response.body = { code: -1, msg: '没有任务' }
		return
	}
	response.body = { code: 0, msg: result }
}
