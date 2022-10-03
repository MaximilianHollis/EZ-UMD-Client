import {
	Button,
	Buttons,
	Chip,
	Input,
	Radio,
	Option,
	Label,
	Toggle,
	Hint,
	Title,
	Select,
} from 'ethereal2'
import { MdPeople, MdSchool } from 'react-icons/md'
import { toast } from 'react-hot-toast'
import {
	FaClock,
	FaGreaterThanEqual,
	FaLessThanEqual,
	FaStopwatch,
} from 'react-icons/fa'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import ky from 'ky'
import { useDebounce } from 'react-use'
import Layout from '../components/Layout'
import { Flex } from '../components/Flex'
import { Settings } from '../interfaces'

const Card = styled(Flex)`
	flex-direction: column;
	padding: 20px;
	gap: 20px;
	min-height: 280px;
	justify-content: flex-start;
	background: #fff;

	// small mobile
	@media (max-width: 600px) {
		min-height: 0;
	}
`

const term_options = [
	{ label: 'Fall', id: 'Fall', hint: '2022 Fall semester' },
	{ label: 'Spring', id: 'Spring', hint: '2023 Spring semester' },
]

const fetch_courses = async () => {
	const json: { course_id: string; name: string }[] = await ky
		.get('https://api.umd.io/v1/courses/list')
		.json()
	return json.map(({ course_id }) => course_id)
}

const course_cache: string[] = []
const professor_cache: { [key: string]: string[] } = {}

const fetch_professors = async (course_id: string) => {
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

export default () => {
	const [enableWaitlist, setEnableWaitlist] = useState(false)
	const [courseSearch, setCourseSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [availableProfessors, setAvailableProfessors] = useState<string[]>([])
	const [, _cancel] = useDebounce(
		() => {
			setDebouncedSearch(courseSearch)
		},
		100,
		[courseSearch],
	)
	const [settings, setSettings] = useState<Settings>({
		avoid_professors: [],
		best_times: [],
		courses: [],
		gap_between_classes: 10,
		max_credits: 18,
		min_credits: 12,
		term: 'Spring',
		free_day: false,
		waitlist_slots: 5,
		earliest_start_time: '9:00AM',
		latest_end_time: '4:00PM',
	})
	const [availableCourses, setAvailableCourses] = useState<string[]>([])

	const { courses } = settings

	useEffect(() => {
		fetch_courses().then((res) => setAvailableCourses(res as string[]))
	}, [])

	useEffect(() => {
		if (courses.length) {
			const prof_toast = toast.loading('Loading professors...')
			const profs: string[] = []
			courses.forEach((course) => {
				fetch_professors(course).then((res) =>
					profs.push(...res.filter((prof) => !profs.includes(prof))),
				)
			})
			setAvailableProfessors(profs)
			toast.success('Loaded professors!', { id: prof_toast })
		}
	}, [courses])

	return (
		<Layout title="EZ-UMD">
			<h1>📅 EZ-UMD Schedule</h1>
			<Flex
				as="form"
				style={{
					paddingTop: '20px',
				}}
				onSubmit={(e) => {
					e.preventDefault()
					if (availableCourses.includes(debouncedSearch.toUpperCase())) {
						setSettings({
							...settings,
							courses: [...settings.courses, debouncedSearch.toUpperCase()],
						})
						setCourseSearch('')
					} else {
						toast.error('Course not found')
					}
				}}
			>
				<Input
					icon={<MdSchool />}
					placeholder="Enter course code"
					value={courseSearch}
					onChange={setCourseSearch}
				/>
				<Button>Add Course</Button>
			</Flex>
			<Flex
				no_column
				style={{
					justifyContent: 'flex-start',
					alignItems: 'center',
					padding: '10px 0',
					overflowX: 'scroll',
					height: '50px',
					userSelect: 'none',
				}}
			>
				<AnimatePresence>
					{availableCourses
						.filter((course) => course.includes(debouncedSearch.toUpperCase()))
						.sort((a, b) => {
							if (courses.includes(a) && !courses.includes(b)) {
								return -1
							}

							if (!courses.includes(a) && courses.includes(b)) {
								return 1
							}

							return 0
						})
						.filter((_c, i) => i < 64)
						.map((course) => (
							<motion.div
								key={course}
								style={{
									width: 'fit-content',
									flexShrink: 0,
								}}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								layoutId={course}
							>
								<Chip
									secondary={!courses.find((c) => c === course)}
									onClick={() =>
										courses.find((c) => c === course)
											? setSettings({
													...settings,
													courses: courses.filter((c) => c !== course),
											  })
											: setSettings({
													...settings,
													courses: [...courses, course],
											  })
									}
								>
									{course}
								</Chip>
							</motion.div>
						)) || 'loading...'}
				</AnimatePresence>
			</Flex>
			<Flex
				style={{
					justifyContent: 'space-around',
					alignItems: 'flex-start',
					gap: '30px',
					padding: '15px 0px',
				}}
			>
				<Card shadow>
					<Title>Term Options</Title>
					<Option>
						<span>
							<Label
								style={{
									paddingBottom: '5px',
								}}
							>
								Term season
							</Label>
							<Radio
								value={term_options.find((o) => o.id === settings.term)}
								options={term_options}
								onChange={(val) =>
									setSettings({ ...settings, term: val.id as Settings['term'] })
								}
							/>
						</span>
					</Option>
				</Card>
				<Card shadow>
					<Title>Credit Options</Title>
					<Option>
						<span>
							<Input
								minimal
								icon={<FaLessThanEqual />}
								placeholder="Enter minimum"
								value={(settings.min_credits || '').toString()}
								onChange={(val) =>
									setSettings({
										...settings,
										min_credits: parseInt(val, 10) || 0,
									})
								}
							/>
							<Hint>Minimum desired credits</Hint>
						</span>
					</Option>
					<Option>
						<span>
							<Input
								minimal
								icon={<FaGreaterThanEqual />}
								placeholder="Enter maximum"
								value={(settings.max_credits || '').toString()}
								onChange={(val) =>
									setSettings({
										...settings,
										max_credits: parseInt(val, 10) || 0,
									})
								}
							/>
							<Hint>Maximum desired credits</Hint>
						</span>
					</Option>
				</Card>
				<Card shadow>
					<Title>Waitlist Options</Title>

					<Option>
						<span>
							<Label>Allow waitlists?</Label>

							<Hint>Allow classes with waitlists</Hint>
						</span>
						<Toggle value={enableWaitlist} onClick={setEnableWaitlist} />
					</Option>
					<Option>
						<motion.div
							transition={{ duration: 0.3 }}
							animate={{ opacity: enableWaitlist ? 1 : 0.4 }}
							style={{
								pointerEvents: enableWaitlist ? 'all' : 'none',
							}}
						>
							<Input
								minimal
								icon={<MdPeople />}
								placeholder="Enter max size"
								value={(settings.waitlist_slots || '').toString()}
								onChange={(val) =>
									setSettings({
										...settings,
										waitlist_slots: parseInt(val, 10) || 0,
									})
								}
							/>
							<Hint>Maximum desired waitlist size</Hint>
						</motion.div>
					</Option>
				</Card>
			</Flex>
			<Flex
				style={{
					justifyContent: 'space-around',
					alignItems: 'flex-start',
					gap: '30px',
					padding: '15px 0px',
					marginBottom: '15px',
				}}
			>
				<Card
					shadow
					style={{
						width: '150%',
					}}
				>
					<Title>Time Options</Title>
					<Flex
						style={{
							justifyContent: 'space-around',
						}}
					>
						<Option>
							<span>
								<Input
									minimal
									icon={<FaClock />}
									placeholder="Enter earlier"
									value={settings.earliest_start_time || ''}
									onChange={(val) =>
										setSettings({
											...settings,
											earliest_start_time: val,
										})
									}
								/>
								<Hint>Prioritize classes after</Hint>
							</span>
						</Option>
						<Option>
							<span>
								<Input
									minimal
									icon={<FaClock />}
									placeholder="Enter latest"
									value={settings.latest_end_time || ''}
									onChange={(val) =>
										setSettings({
											...settings,
											latest_end_time: val,
										})
									}
								/>
								<Hint>Prioritize classes before</Hint>
							</span>
						</Option>
					</Flex>
					<Flex
						style={{
							justifyContent: 'space-around',
						}}
					>
						<Option>
							<span>
								<Label>Free day?</Label>

								<Hint>Attempt to have a full day off</Hint>
							</span>
							<Toggle value={false} onClick={console.log} />
						</Option>
						<Option>
							<span>
								<Input
									minimal
									icon={<FaStopwatch />}
									placeholder="Enter gap in minutes"
									value={`${settings.gap_between_classes.toString()}`}
									onChange={(val) =>
										setSettings({
											...settings,
											gap_between_classes: parseInt(val, 10) || 0,
										})
									}
								/>
								<Hint>Desired gap in minutes (ignored if same location)</Hint>
							</span>
						</Option>
					</Flex>
				</Card>
				<Card shadow>
					<Title>Professor Options</Title>
					<Option>
						<span>
							<Select
								multi
								options={availableProfessors.map((prof) => ({
									label: prof,
									id: prof,
								}))}
								value={[]}
								onChange={(e) => console.log(e)}
							/>
							<Hint>Blacklist (Optional)</Hint>
						</span>
					</Option>
					<Option>
						<span>
							<Label>Prefer same?</Label>

							<Hint>Prefer multiple classes with one prof</Hint>
						</span>
						<Toggle
							value={false}
							onClick={() => toast.error('Not implemented')}
						/>
					</Option>
				</Card>
			</Flex>
			<Buttons>
				<Button onClick={() => toast.error('Not yet implemented.')}>
					🏗️ Build Schedule
				</Button>
			</Buttons>
		</Layout>
	)
}
