import { days } from '../utils'

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
