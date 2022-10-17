import styled, { ThemeContext } from 'styled-components'
import { LayoutGroup, motion } from 'framer-motion'
import { Br, Button, Buttons, Hint, Label, Option, Select } from 'ethereal2'
import { nanoid } from 'nanoid'
// @ts-expect-error shut up
import { useScreenshot } from 'use-react-screenshot'
import { memo, useContext, useEffect, useRef, useState } from 'react'
import { colors, days, toHumanTime } from '../utils'
import { Wrapper } from './Wrapper'
import { DanCourse, DanSchedule } from '../interfaces'

const Row = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	width: 100%;
`

const LayoutRow = styled(motion(Row))`
	max-width: 100%;
	flex-shrink: 1;
`

const Column = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`

const Day = styled(Column)`
	align-items: flex-start;
	width: 150px;
	font-size: 1rem;
	font-weight: 600;
	flex-shrink: 0;
	// mobile
	@media (max-width: 768px) {
		display: none;
	}
`

const Item = styled(motion.div)<{ width: number; f: boolean }>`
	color: white;
	height: 86px;
	padding: 5px;
	width: ${({ width }) => (width ? `${width}%` : '100%')};
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;

	${({ f }) =>
		f &&
		`
		opacity: 0 !important;
		user-select: none;
	`}

	& > div > * {
		height: 20px;
	}

	// mobile
	@media (max-width: 768px) {
		padding: 2px;
		font-size: 0.5rem;
		& > div {
			padding: 2px;
		}
	}
`

type Class = {
	name: string
	start: number
	end: number
	discussion?: boolean
	location: string
	width?: number
	id: string
	layoutId: string
	color: string
}

const Schedule = ({ dan_schedules }: { dan_schedules?: DanSchedule[] }) => {
	const ref = useRef<HTMLDivElement>(null)
	const theme = useContext(ThemeContext)
	const [image, takeScreenshot] = useScreenshot()
	const [vertical, setVertical] = useState(false)
	const [num, setNum] = useState(0)

	useEffect(() => {
		if (image) {
			const a = document.createElement('a')
			a.href = image
			a.download = 'schedule.png'
			a.click()
		}
	}, [image])

	const schedule: Class[][] = []

	let course_index = 0

	const dan_schedule: DanSchedule =
		(dan_schedules?.length &&
			Object.entries(dan_schedules[num]).map(([name, data]) => ({
				...(data as DanCourse),
				course_name: name as string,
			}))) ||
		[]

	dan_schedule?.forEach((course, ci) => {
		course.timeslots?.forEach((timeslot) => {
			timeslot.days.forEach((d) => {
				const day = days.indexOf(d)
				const { start_time: start, end_time: end } = timeslot.time_range
				if (!schedule[day]) {
					schedule[day] = []
				}

				schedule[day].push({
					name: course.course_name,
					start,
					end,
					discussion: timeslot.discussion,
					location: timeslot.location,
					layoutId: course_index.toString(),
					id: nanoid(),
					color: colors[ci % colors.length],
				})
				course_index += 1
				schedule[day].sort((a, b) => a.start - b.start)
				// Remove overlapping classes
				for (let i = 0; i < schedule[day].length - 1; i += 1) {
					const a = schedule[day][i]
					const b = schedule[day][i + 1]
					if (a.end > b.start) {
						schedule[day].splice(i, 1)
						console.log(`Overlapping class removed: ${a.name}`)
						i -= 1
					}
				}
			})
		})
	})

	course_index = 0

	const earliest_class = Math.min(
		...schedule.map((day) => Math.min(...day.map((c) => c.start))),
	)

	const latest_class = Math.max(
		...schedule.map((day) => Math.max(...day.map((c) => c.end))),
	)

	const formattedSchedule = Object.values(schedule).map((day) => {
		const formattedDay = []
		let lastClassEnd = earliest_class
		const sortedDay = day.sort((a, b) => a.start - b.start)

		for (const classItem of sortedDay) {
			if (classItem.start > lastClassEnd) {
				formattedDay.push({
					name: '',
					start: lastClassEnd,
					end: classItem.start,
					color: '#ff00d9',
				})
			}

			formattedDay.push(classItem)
			lastClassEnd = classItem.end
		}

		if (lastClassEnd < latest_class) {
			formattedDay.push({
				name: '',
				start: lastClassEnd,
				end: latest_class,
				color: '#ff00d9',
			})
		}

		// Add proportion of the day to each class
		return formattedDay
			.map((classItem) => ({
				...classItem,
				// Normalize between 0 and 100
				width:
					((classItem.end - classItem.start) /
						(latest_class - earliest_class)) *
					100,
				id: nanoid(),
			}))
			.sort((a, b) => a.start - b.start) as Class[]
	})

	return (
		<Wrapper
			ref={ref}
			style={{
				marginBottom: '20px',
				transform: vertical ? 'translateX(50%) rotate(90deg)' : 'none',
				transition: 'transform 0.5s',
				transformOrigin: 'top left',
			}}
		>
			<div
				style={{
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<div
					style={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
						overflow: 'hidden',
					}}
				>
					<Option>
						<span>
							<Label>
								Schedule {num + 1} of {dan_schedules?.length || '-'}
							</Label>

							<Hint>Average aggregate GPA: -.--</Hint>
						</span>
						{/* <Toggle value={vertical} onClick={() => console.log('')} /> */}
					</Option>

					<Option>
						<span>
							<Select
								options={[
									{ id: '0', label: '1' },
									{ id: '1', label: '2' },
									{ id: '2', label: '3' },
									{ id: '3', label: '4' },
									{ id: '4', label: '5' },
									{ id: '5', label: '6' },
									{ id: '6', label: '7' },
									{ id: '7', label: '8' },
									{ id: '8', label: '9' },
									{ id: '9', label: '10' },
								]}
								value={{ id: num.toString(), label: (num + 1).toString() }}
								multi={false}
								onChange={(val) => setNum(parseInt(val.id, 10))}
							/>
							<Hint>Choose schedule</Hint>
						</span>
					</Option>
				</div>
			</div>
			<div
				style={{
					marginTop: '4px',
					marginBottom: '10px',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Br />
			</div>
			<LayoutGroup id="schedule">
				{formattedSchedule.map((classes, i) => (
					<div
						key={days[i]}
						style={{
							width: '100%',
						}}
					>
						<Row>
							<Day>
								{days[i].split('')[0].toUpperCase() +
									days[i].split('').slice(1).join('')}
								<p
									style={{
										fontSize: '10px',
										fontWeight: 500,
										margin: '0',
									}}
								>
									Class time:{' '}
									{classes.reduce(
										(acc, curr) =>
											acc + (curr.name ? curr.end - curr.start : 0),
										0,
									)}
									m
								</p>
							</Day>
							<LayoutRow>
								{classes.map((c) => (
									<Item
										key={c.id}
										f={!c.name}
										width={c.width || 0}
										title={c.name}
										layoutId={c.layoutId}
									>
										<motion.div
											style={{
												background: theme?.solid ? c.color : `${c.color}33`,
												borderRadius: `${
													parseInt(theme?.borderRadius, 10) + 5
												}px`,
												border: `3px solid ${c.color}`,
												color: theme?.solid ? '#fff' : '#111',
												padding: '5px',
												width: '100%',
												height: '100%',
												overflow: 'hidden',
												display: 'flex',
												flexDirection: 'column',
												justifyContent: 'space-between',
												fontSize: '14px',
											}}
										>
											<p
												style={{
													margin: 0,
													color: theme?.solid ? '#fff' : c.color,
													textOverflow: 'clip',
													whiteSpace: 'nowrap',
													fontSize: '12px',
												}}
											>
												{toHumanTime(c.start)} - {toHumanTime(c.end)}
											</p>
											<span
												style={{
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{c.name}
											</span>
											<span
												style={{
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{` ${c.discussion ? 'Dis' : 'Lec'} `}
												{`- ${c.location}\n`}
											</span>
										</motion.div>
									</Item>
								))}
							</LayoutRow>
						</Row>
					</div>
				))}
			</LayoutGroup>
			<div
				style={{
					marginTop: '10px',
				}}
			/>
			<Buttons>
				<Button
					outlined
					disabled={!dan_schedule?.length}
					onClick={() => {
						takeScreenshot(ref.current)
					}}
				>
					Save
				</Button>
				<Button
					disabled={!dan_schedule?.length}
					onClick={() => {
						if (num < (dan_schedules?.length || 0) - 1) {
							setNum(num + 1)
						} else {
							setNum(0)
						}
					}}
				>
					Next
				</Button>
			</Buttons>
		</Wrapper>
	)
}

export default memo(Schedule)
