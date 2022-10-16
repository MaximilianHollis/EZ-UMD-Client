import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Br, Hint, Option, Select, Title } from 'ethereal2'
import { nanoid } from 'nanoid'
import { memo } from 'react'
import toast from 'react-hot-toast'
import { colors, days, toHumanTime } from '../utils'
import { Wrapper } from './Wrapper'
import { DanSchedule } from '../interfaces'

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

const Schedule = ({ dan_schedule }: { dan_schedule?: DanSchedule }) => {
	const schedule: Class[][] = []

	console.log(dan_schedule)

	dan_schedule?.forEach((course, ci) => {
		course.timeslots.forEach((timeslot) => {
			timeslot.days.forEach((d) => {
				console.log(d)
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
					layoutId: day + course.course_name,
					id: nanoid(),
					color: colors[ci % colors.length],
				})

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
			style={{
				marginBottom: '20px',
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
					}}
				>
					<Title>Schedule 1/-- | Aggregated Average GPA: -.--</Title>
					<Option>
						<span
							style={{
								opacity: 0.5,
								pointerEvents: 'none',
							}}
						>
							<Select
								options={[
									{ id: '1', label: '1' },
									{ id: '2', label: '2' },
									{ id: '3', label: '3' },
									{ id: '4', label: '4' },
									{ id: '5', label: '5' },
								]}
								value={{ id: '1', label: '1' }}
								multi={false}
								onChange={() => toast('Not implemented')}
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
			<motion.div
				layout
				style={{
					width: '100%',
				}}
			>
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
								{classes.map((c, j) => (
									<Item
										key={c.id}
										f={!c.name}
										width={c.width || 0}
										title={c.name}
										layoutId={c.layoutId}
									>
										<div
											style={{
												background: `${c.color}33`,
												borderRadius: '10px',
												border: `3px solid ${c.color}`,
												color: '#111',
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
													color: c.color,
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
												{`- ${c.location}`}
											</span>
										</div>
									</Item>
								))}
							</LayoutRow>
						</Row>
					</div>
				))}
			</motion.div>
			<div
				style={{
					marginTop: '10px',
				}}
			/>
			{/* 	<Buttons>
				<Button outlined>Save Schedule</Button>
				<Button>Next Schedule</Button>
			</Buttons> */}
		</Wrapper>
	)
}

export default memo(Schedule)
