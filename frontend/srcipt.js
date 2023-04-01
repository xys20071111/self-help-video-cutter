'use strict'

const taskIDInput = document.getElementById('taskID')
const currentRecord = document.getElementById('currentRecord')
const taskStatus = document.getElementById('status')
const checkStatus = document.getElementById('checkStatus')
const download = document.getElementById('download')
const title = document.getElementById('title-input')
const startAt = document.getElementById('start')
const length = document.getElementById('length')
const currentTaskID = document.getElementById('currentTaskID')
const submitButton = document.getElementById('submit')
const fileList = document.getElementById('fileList')
const taskList = document.getElementById('recentlyTaskList')

let filename = ''
let dirIndex = 0
// 创建任务

function setRecord(f, d) {
	filename = f
	dirIndex = d
	currentRecord.innerText = f
}

function createTask() {
	if(!filename || !dirIndex ) {
		alert('没有设置录播')
		return
	}
	if(startAt.value.length === 0 && length.value.length === 0 && title.value.length === 0) {
		alert('有参数没填')
		return
	}
	fetch(`/api/addTask?src=${filename}&start=${startAt.value}&length=${length.value}&title=${title.value}&dirIndex=${dirIndex}`)
		.then(res => {
			if (res.ok) {
				return res.json()
			}
		})
		.then((data) => {
			if (data.code !== 0) {
				alert(data.msg)
			} else {
				currentTaskID.innerText = data.msg
				taskIDInput.value = data.msg
			}
		})
}

submitButton.onclick = createTask

// 查询任务状态

function checkTaskStatus() {
	const taskID = taskIDInput.value
	fetch(`/api/getTaskStatus?taskID=${taskID}`)
		.then(res => {
			if (res.ok) {
				return res.json()
			}
		})
		.then(data => {
			if (data.code === 0) {
				taskStatus.value = data.msg
				switch (data.msg) {
					case 0:
						taskStatus.innerText = "未完成"
						download.hidden = true
						break
					case 1:
						taskStatus.innerText = "完成"
						download.onclick = () => { open(`/api/downloadFile?taskID=${taskID}`) }
						download.hidden = false
						break
					case 2:
						taskStatus.innerText = "出错"
						download.hidden = true
						break
				}
			} else {
				taskStatus.innerText = "无此任务"
				download.hidden = true
			}
		})
}

checkStatus.onclick = checkTaskStatus

// 获取文件列表部分
fetch('/api/getFileList')
	.then(res => {
		if (res.ok) {
			return res.json()
		}
	})
	.then(data => {
		console.log(data)
		for (const f of data.files) {
			const row = document.createElement('tr')
			const duration = document.createElement('td')
			const size = document.createElement('td')
			const name = document.createElement('td')
			const operation = document.createElement('td')
			const apply = document.createElement('button')
			apply.addEventListener('click', () => {
				setRecord(f.name, f.dirIndex)
			})
			apply.innerText = "使用"
			operation.appendChild(apply)
			const duration_total = parseInt(f.duration)
			const duration_hours = (duration_total / 3600).toFixed(0)
			const duration_minutes = (duration_total / 60 % 60).toFixed(0)
			const duration_seconds = (duration_total % 60).toFixed(0)
			size.innerText = f.size.toFixed(2).toString()
			duration.innerText = `${duration_hours}:${duration_minutes}:${duration_seconds}`
			name.innerText = f.name
			row.appendChild(name)
			row.appendChild(size)
			row.appendChild(duration)
			row.appendChild(operation)
			fileList.appendChild(row)
		}
	})

// 获取最近任务
fetch('/api/getRecentlyTasks')
	.then(res => {
		if(res.ok) {
			return res.json()
		}
	})
	.then(data => {
		if(data.code != 0) {
			return
		}
		for(const item of data.msg) {
			const row = document.createElement('tr')
			const id = document.createElement('td')
			const src = document.createElement('td')
			const startTime = document.createElement('td')
			const endTime = document.createElement('td')
			const title = document.createElement('td')
			id.innerText = item.fileid
			src.innerText = item.src
			startTime.innerText = item.starttime
			endTime.innerText = item.endtime
			title.innerText = item.title
			row.appendChild(title)
			row.appendChild(src)
			row.appendChild(startTime)
			row.appendChild(endTime)
			row.appendChild(id)
			taskList.appendChild(row)
		}
	})