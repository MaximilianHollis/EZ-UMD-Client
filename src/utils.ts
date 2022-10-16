import ky from 'ky'
import { Settings } from './interfaces'

export const days = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
]

export const colors = ['#198afa', '#fd38a5', '#7255ff', '#ff5e5e', '#ff9f1a']

export const toHumanTime = (time: number) =>
	`${Math.floor(time / 60)
		.toString()
		.padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`

export const toMinutes = (time: string) => {
	let offset = 0
	if (time.includes('pm') || time.includes('Pm') || time.includes('PM')) {
		offset = 12 * 60
	}

	time = time.replace(/(am|pm|AM|PM|Am|Pm)/i, '')
	const [hours, minutes] = time.split(':').map(Number)
	console.log(hours, minutes)
	return hours * 60 + minutes + offset || 0
}

export const term_options = [
	{ label: 'Fall', id: 'Fall', hint: '2022 Fall semester' },
	{ label: 'Spring', id: 'Spring', hint: '2023 Spring semester' },
]

export const fetch_courses = async () => {
	const majors: {
		[key: string]: string
	} = await ky.get('https://umdb.fetchmonitors.com/majors').json()
	// Get courses for each major
	const courses = await Promise.all(
		Object.keys(majors).map(async (major: string) => {
			const course = await ky
				.get(`https://umdb.fetchmonitors.com/courses/${major}`)
				.json()
			return course as { [key: string]: string }
		}),
	)

	return courses.map((course) => Object.keys(course).map((c) => c)).flat()
}

const course_cache: string[] = []
const professor_cache: { [key: string]: string[] } = {}

export const fetch_professors = async (course_id: string) => {
	if (course_cache.includes(course_id)) {
		return professor_cache[course_id]
	}

	course_cache.push(course_id)
	const json: { name: string }[] = await ky
		.get(`https://api.umd.io/v1/professors?course_id=${course_id}`)
		.json()
	professor_cache[course_id] = json.map(({ name }) => name)
	return json.map(({ name }) => name)
}

export const fetch_schedules = async (settings: Settings) => {
	const formatted_settings = {
		required_courses: settings.courses,
		avoid_instructors: settings.avoid_professors,
		avoid_time_ranges: [
			{
				start_time: 0,
				end_time: toMinutes(settings.earliest_start_time),
			},
			{
				start_time: toMinutes(settings.latest_end_time),
				end_time: 1440,
			},
		],
	}
	const json = await ky
		.post('https://umdb.fetchmonitors.com/build_schedule', {
			json: formatted_settings,
			timeout: 4000,
		})
		.json()
	return json
}
