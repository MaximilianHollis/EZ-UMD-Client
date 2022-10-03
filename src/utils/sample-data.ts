import { Settings } from '../interfaces'

/** Dummy settings data. */
export const settings: Settings = {
	courses: ['CMSC110', 'CMSC120', 'CMSC230', 'CMSC210', 'CMSC220', 'CMSC220'],
	avoid_professors: ['Herman', 'Yoon', 'Kruskal'],
	best_times: ['10:00am-4:00pm'],
	gap_between_classes: 10,
	max_credits: 17,
	min_credits: 12,
	term: 'Fall',
	waitlist_slots: 0,
	free_day: false,
	latest_end_time: '10:00am',
	earliest_start_time: '4:00pm',
}

/** Dummy course data. */
export const courses = [
	{
		course_id: 'CMSC110',
		course_name: 'Introduction to Computer Science',
		class_times: ['10:00am-11:00am', '11:00am-12:00pm', '12:00pm-1:00pm'],
		credits: 4,
		professors: ['Herman', 'Yoon', 'Kruskal'],
	},
	{
		course_id: 'CMSC120',
		course_name: 'Introduction to Computer Science II',
		class_times: ['10:00am-11:00am', '11:00am-12:00pm', '12:00pm-1:00pm'],
		credits: 4,
		professors: ['Herman', 'Yoon', 'Kruskal'],
	},
	{
		course_id: 'CMSC230',
		course_name: 'Data Structures and Algorithms',
		class_times: ['10:00am-11:00am', '11:00am-12:00pm', '12:00pm-1:00pm'],
		credits: 4,
		professors: ['Herman', 'Yoon', 'Kruskal'],
	},
]

/** Dummy class data. */
export const classes = [
	{
		course_id: 'CMSC110',
		course_name: 'Introduction to Computer Science',
		class_time: '10:00am-11:00am',
		credits: 4,
		professor: 'Herman',
	},
	{
		course_id: 'CMSC120',
		course_name: 'Introduction to Computer Science II',
		class_time: '10:00am-11:00am',
		credits: 4,
		professor: 'Herman',
	},
]
