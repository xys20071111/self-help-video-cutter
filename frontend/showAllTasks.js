const taskList = document.getElementById('allTaskList')

fetch('/api/getAllTasks')
    .then(res => {
        if (res.ok) {
            return res.json()
        }
    })
    .then(data => {
        if (data.code != 0) {
            return
        }
        for (const item of data.msg) {
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