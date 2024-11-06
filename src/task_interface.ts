export interface ITask {
	title: string
	uuid: string
	start: string
	end: string
	input: string
	output: string
	status?: number
}