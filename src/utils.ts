import ky from 'ky'
import toast from 'react-hot-toast'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import {
	DanCourse,
	DanSchedule,
	GPA,
	GradeData,
	ProfData,
	Settings,
} from './interfaces'

export const getLocal = (key: string) => {
	if (typeof window !== 'undefined' && window) {
		return JSON.parse(window.localStorage.getItem(key) || '[]')
	}

	return null
}

export const setLocal = (
	key: string,
	value: string | string[] | Record<string, unknown>,
) => {
	if (window) {
		window.localStorage.setItem(key, JSON.stringify(value))
	}
}

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
	return hours * 60 + minutes + offset || 0
}

export const toAmPm = (time: number) => {
	const hours = Math.floor(time / 60)
	const minutes = time % 60
	const ampm = hours >= 12 ? 'pm' : 'am'
	return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}${ampm}`
}

export const term_options = [
	{ label: 'Fall', id: 'Fall', hint: '2022 Fall semester' },
	{ label: 'Spring', id: 'Spring', hint: '2023 Spring semester' },
]

export const fetch_courses = async () => {
	try {
		const majors: {
			[key: string]: string
		} = await ky
			.get('https://umdb.fetchmonitors.com/majors', {
				timeout: 4000,
			})
			.json()
		// Get courses for each major
		const courses = await Promise.all(
			Object.keys(majors).map(async (major: string) => {
				const course = await ky
					.get(`https://umdb.fetchmonitors.com/courses/${major}`)
					.json()
				return course as { [key: string]: string }
			}),
		)

		const formatted_courses = courses
			.map((course) => Object.keys(course).map((c) => c))
			.flat()

		// Cache courses
		setLocal('course_cache', formatted_courses)
		return formatted_courses
	} catch {
		const course_cache = getLocal('course_cache') || []
		return course_cache
	}
}

export const fetch_schedules = async (settings: Settings) => {
	const formatted_settings = {
		required_courses: settings.courses,
		avoid_instructors: settings.avoid_professors,
		seats_required: settings.waitlist_slots,
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
		.post('https://umdb.fetchmonitors.com/build_schedules', {
			json: formatted_settings,
			timeout: 4000,
		})
		.json()
	return json
}

export const get_prof_grades = async (prof: string) => {
	try {
		const json: GradeData[] = await ky
			.get(`https://planetterp.com/api/v1/grades?professor=${prof}`)
			.json()

		let grade_sum = 0
		let grade_count = 0
		// Add together the grades (A+, A, A-, etc.) and find the mean, median, and standard deviation
		Object.entries(GPA).forEach(([grade, value]: [string, number]) => {
			json.forEach((g) => {
				const count = (g[grade as keyof GradeData] as number) || 0
				grade_sum += count * value
				grade_count += count
			})
		})
		return {
			average_gpa: grade_sum / grade_count,
			grade_count,
			grades: json,
		} as {
			average_gpa: number
			grade_count: number
			grades: GradeData[]
		}
	} catch {
		return {
			average_gpa: 0,
			grade_count: 0,
			grades: [],
		}
	}
}

export const get_prof_data = async (prof: string): Promise<ProfData> => {
	try {
		const json: ProfData = await ky
			.get(
				`https://planetterp.com/api/v1/professor?name=${prof}&reviews=true`,
				{
					retry: 2,
				},
			)
			.json()
		return {
			...json,
			textbook_warning_percent: Math.round(
				(json.reviews.filter((r) => r.review.includes('buy')).length /
					json.reviews.length) *
					100,
			),
		}
	} catch {
		return {
			name: prof,
			reviews: [],
			average_rating: 2.5,
			courses: [],
		}
	}
}

const professor_cache: { [key: string]: ProfData[] } =
	getLocal('professor_cache') || {}
const prof_course_cache: string[] = getLocal('prof_course_cache') || []

export const fetch_professors = async (course_id: string) => {
	if (prof_course_cache.map((name) => name).includes(course_id)) {
		return professor_cache[course_id]
	}

	try {
		prof_course_cache.push(course_id)
		const json: { name: string }[] = await ky
			.get(`https://api.umd.io/v1/professors?course_id=${course_id}`, {
				retry: 5,
			})
			.json()

		// Get prof data

		const prof_data = await Promise.all(
			json.map(async (prof) => {
				const data = await get_prof_data(prof.name)
				return data
			}),
		)

		professor_cache[course_id] = prof_data

		setLocal('professor_cache', professor_cache)
	} catch {
		console.log('failed to fetch professors...')
	}

	return professor_cache[course_id]
}

interface AppState {
	settings: Settings
	setSettings: (settings: Settings) => void
	availableProfessors: ProfData[]
	setAvailableProfessors: (professors: ProfData[]) => void
	availableCourses: string[]
	setAvailableCourses: (courses: string[]) => void
	schedules: DanSchedule[]
	setSchedules: (schedules: DanSchedule[]) => void
	fetchSchedules: (s: Settings) => Promise<void>
}

export const useStore = create<AppState>()(
	devtools((set) => ({
		settings: {
			avoid_professors: [],
			best_times: [],
			courses: [],
			gap_between_classes: 10,
			max_credits: 18,
			min_credits: 12,
			term: 'Spring',
			free_day: false,
			waitlist_slots: 0,
			earliest_start_time: '9:00AM',
			latest_end_time: '4:00PM',
		},
		setSettings: (settings: Settings) => set({ settings }),
		availableProfessors: [],
		setAvailableProfessors: (profs: ProfData[]) =>
			set({ availableProfessors: profs }),
		availableCourses: [],
		setAvailableCourses: (courses: string[]) =>
			set({ availableCourses: courses }),
		schedules: [],
		setSchedules: (schedules: DanSchedule[]) => set({ schedules }),
		async fetchSchedules(settings: Settings) {
			const schedule_toast = toast.loading('Building your schedule...')

			try {
				const new_schedules = await fetch_schedules(settings)
				set({
					...settings,
					schedules: Object.entries(new_schedules as DanCourse).map(
						(course) => ({
							// @ts-expect-error - I don't even want to know why this is happening
							...course[1],
							course_name: course[0] as string,
						}),
					),
				})

				toast.success('Finished making your schedule!', {
					id: schedule_toast,
				})
				setTimeout(() => {
					window.scrollTo(0, 10000)
				}, 100)
			} catch {
				toast.error('Error while creating your schedule!', {
					id: schedule_toast,
				})
			}
		},
	})),
)
