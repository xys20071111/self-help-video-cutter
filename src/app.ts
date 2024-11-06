import { Application, Router, send } from 'oak'
import { addTask } from './logic/add_task.ts'
import { getFileList } from './logic/get_file_list.ts'
import { getTaskStatus } from './logic/get_task_status.ts'
import { downloadFile } from './logic/download_file.ts'
import { getRecentlyTasks } from './logic/get_recently_tasks.ts'
import { getAllTasks } from './logic/get_all_tasks.ts'

export const app = new Application()

const router = new Router()

router.get('/api/addTask', addTask)
router.get('/api/getFileList', getFileList)
router.get('/api/getTaskStatus', getTaskStatus)
router.get('/api/downloadFile', downloadFile)
router.get('/api/getRecentlyTasks', getRecentlyTasks)
router.get('/api/getAllTasks', getAllTasks)

app.use(router.allowedMethods())
app.use(router.routes())
app.use(async (ctx, next) => {
	try {
		await send(ctx, ctx.request.url.pathname, {
			root: `${Deno.cwd()}/frontend`,
			index: 'index.html',
		})
	} catch {
		await next()
	}
})
