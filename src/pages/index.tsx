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
import { useDebounce, useEffectOnce } from 'react-use'
import Layout from '../components/Layout'
import { Flex } from '../components/Flex'
import { ProfData, Settings } from '../interfaces'
import { Wrapper } from '../components/Wrapper'
import Schedule from '../components/Schedule'
import {
	fetch_courses,
	fetch_professors,
	term_options,
	getLocal,
	useStore,
} from '../utils'
import FetchBranding from '../components/FetchBranding'
import Professor, { Rating } from '../components/Professor'

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

export default () => {
	const [enableWaitlist, setEnableWaitlist] = useState(false)
	const [courseSearch, setCourseSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [availableProfessors, setAvailableProfessors] = useState<ProfData[]>([])
	const [loading, setLoading] = useState(false)
	const [, _cancel] = useDebounce(
		() => {
			setDebouncedSearch(courseSearch)
		},
		100,
		[courseSearch],
	)
	const settings = useStore((state) => state.settings)
	const setSettings = useStore((state) => state.setSettings)
	const schedules = useStore((state) => state.schedules)
	const fetchSchedules = useStore((state) => state.fetchSchedules)

	const availableCourses = useStore((state) => state.availableCourses)
	const setAvailableCourses = useStore((state) => state.setAvailableCourses)

	const { courses } = settings

	useEffectOnce(() => {
		const load_courses = async () => {
			setAvailableCourses(getLocal('course_cache') || [])
			let wait_toast
			try {
				if (availableCourses.length === 0) {
					wait_toast = toast.loading('Refreshing courses...')
				}

				await fetch_courses().then((res) => {
					setAvailableCourses(res as string[])
				})
				if (availableCourses.length === 0) {
					toast.success('Loaded courses!', { id: wait_toast })
				}
			} catch {
				if (availableCourses.length === 0) {
					toast.error('Failed to load courses.')
				}
			}
		}

		load_courses()
	})

	useEffect(() => {
		const fetch_all_the_stuff = async () => {
			if (courses.length) {
				const prof_toast = toast.loading('Loading professors...')
				const profs: ProfData[] = getLocal('prof_cache') || []
				for await (const course of courses) {
					try {
						await fetch_professors(course).then((res) => {
							if (res) {
								profs.push(
									...res.filter(
										(prof) =>
											!profs.map(({ name }) => name).includes(prof.name),
									),
								)
							}
						})
					} catch {
						toast.error(`Failed to load professors for: ${course}`, {
							id: prof_toast,
						})
					}
				}

				setAvailableProfessors((avail) => {
					if (profs.length > avail.length) {
						toast.success('Loaded professors!', { id: prof_toast })
					} else {
						toast('No additional professors to load.', { id: prof_toast })
					}

					return profs
				})
			}
		}

		fetch_all_the_stuff()
		// I only want this to run when courses changes len
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [courses.length])

	useEffect(() => {
		if (settings.term === 'Fall') {
			toast('Why?')
			setTimeout(() => {
				setSettings({ ...settings, term: 'Spring' })
			}, 1000)
		}
	}, [settings, settings.term])

	return (
		<Layout title="📅 EZ-UMD 🏗️">
			<Wrapper>
				<h1>📅 EZ-UMD Schedule | Under Construction 🏗️ </h1>
				<Flex
					as="form"
					style={{
						paddingTop: '20px',
					}}
					onSubmit={(e) => {
						e.preventDefault()
						let new_courses: string[] = []
						if (availableCourses.includes(debouncedSearch.toUpperCase())) {
							new_courses = [...settings.courses, debouncedSearch.toUpperCase()]
							setCourseSearch('')
						} else if (
							availableCourses.filter((course) =>
								course.includes(debouncedSearch.toUpperCase()),
							).length === 1
						) {
							new_courses = [
								...settings.courses,
								availableCourses.filter((course) =>
									course.includes(debouncedSearch.toUpperCase()),
								)[0],
							]
							setCourseSearch('')
						} else {
							toast.error('Course not found')
						}

						setSettings({
							...settings,
							// Filter out duplicates
							courses: [...new Set([...new_courses, ...settings.courses])],
						})
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
							.filter((course) =>
								course.includes(debouncedSearch.toUpperCase()),
							)
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
										setSettings({
											...settings,
											term: val.id as Settings['term'],
										})
									}
								/>
							</span>
						</Option>
					</Card>
					<Card shadow comingSoon>
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
					<Card shadow comingSoon>
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
							maxWidth: '100%',
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
								<Toggle
									value={false}
									onClick={() => toast.error('Not implemented')}
								/>
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
										label: prof.name,
										id: prof.name,
										custom: (
											<span
												style={{ display: 'flex', alignItems: 'center' }}
												title={prof.name}
											>
												<span
													style={{
														maxWidth: '120px',
														whiteSpace: 'nowrap',
														textOverflow: 'ellipsis',
													}}
												>
													<Professor prof={prof} />
												</span>
												<Rating rating={prof.average_rating} />
											</span>
										),
									}))}
									value={settings.avoid_professors}
									onChange={(e) =>
										setSettings({ ...settings, avoid_professors: e })
									}
								/>
								<Hint>Blocklist (Optional)</Hint>
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
					<Button
						loading={loading}
						disabled={settings.courses.length === 0}
						onClick={async () => {
							setLoading(true)
							await fetchSchedules(settings)
							setLoading(false)
						}}
					>
						🏗️ Build Schedules
					</Button>
				</Buttons>
			</Wrapper>
			<Wrapper
				style={{
					marginTop: '20px',
					marginBottom: '20px',
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'row',
					fontSize: '14px',
				}}
			>
				<FetchBranding />
				<p
					style={{
						marginRight: '4px',
					}}
				>
					Sponsored by
				</p>
				<a href="https://fetchmonitors.com">Fetch Monitors</a>
			</Wrapper>
			<Wrapper invis>
				<Schedule dan_schedules={schedules} professors={availableProfessors} />
			</Wrapper>
			<Wrapper
				invis
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'row',
					fontSize: '14px',
				}}
			>
				<p
					style={{
						marginRight: '4px',
					}}
				>
					Like this project?{' '}
				</p>
				<a href="https://github.com/MaximilianHollis/EZ-UMD-Client">
					Check out the source code!
				</a>
			</Wrapper>
		</Layout>
	)
}
