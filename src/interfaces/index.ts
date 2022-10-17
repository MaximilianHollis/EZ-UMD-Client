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

export type TimeRange = {
	start_time: number
	end_time: number
}

export type Timeslot = {
	location: string
	days: string[]
	time_range: TimeRange
	discussion: boolean
}

export type DanCourse = {
	course_name: string
	id: string
	prof: string
	total_seats: number
	open_seats: number
	waitlist_seats: number
	timeslots: Timeslot[]
	gpa_score: number
}

export type DanSchedule = DanCourse[]

export type Reviews = {
	professor: string
	course: string
	review: string
	rating: number
}

export type ProfData = {
	courses: string[]
	average_rating: number
	name: string
	reviews: Reviews[]
	textbook_warning_percent?: number
}

export type GradeData = {
	course: string
	professor?: string
	semester?: string
	section?: string
	'A+': number
	A: number
	'A-': number
	'B+': number
	B: number
	'B-': number
	'C+': number
	C: number
	'C-': number
	'D+': number
	D: number
	'D-': number
	F: number
	W: number
	Other: number
}[]

export const GPA = {
	'A+': 4.0,
	A: 4.0,
	'A-': 3.7,
	'B+': 3.3,
	B: 3.0,
	'B-': 2.7,
	'C+': 2.3,
	C: 2.0,
	'C-': 1.7,
	'D+': 1.3,
	D: 1.0,
	'D-': 0.7,
	F: 0.0,
}
