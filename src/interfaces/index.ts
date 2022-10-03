export type Settings = {
	courses: string[]
	avoid_professors: string[]
	best_times: string[]
	gap_between_classes: number
	max_credits: number
	min_credits: number
	waitlist_slots: number
	free_day: boolean
	term: 'Fall' | 'Spring' | 'Summer' | 'Winter'
	latest_end_time: string
	earliest_start_time: string
}

export type Course = {
	course_id: string
	course_name?: string
	class_times: string[]
	credits: number
	professors: string[]
}

export type Section = {
	course_id: string
	course_name?: string
	class_time: string
	credits: number
	professor: string
}
