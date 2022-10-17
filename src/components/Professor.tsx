import { Button, Buttons, Chip, Dialog, Hint, Label, Option } from 'ethereal2'
import { useEffect, useState } from 'react'
import { BsDot } from 'react-icons/bs'
import { ProfData } from '../interfaces'
import { get_prof_grades, useStore } from '../utils'

export const Rating = ({
	rating,
	offset,
}: {
	rating: number
	offset?: number
}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: '0px',
			color: rating
				? rating > 4.4 - (offset || 0)
					? '#5555FF'
					: rating > 3.3 - (offset || 0) * 0.4
					? '#00AA00'
					: rating > 2.5 - (offset || 0) * 0.8
					? '#FFAA00'
					: '#FF5555'
				: '#AAAAAA',
		}}
	>
		<BsDot size={20} />
		<small>{rating?.toPrecision(3) || 'n/a'} </small>
	</div>
)

export default ({ prof }: { prof: ProfData }) => {
	const [open, setOpen] = useState(false)
	const [averageGpa, setAverageGpa] = useState('-.--')
	const settings = useStore((state) => state.settings)
	const setSettings = useStore((state) => state.setSettings)
	const fetchSchedules = useStore((state) => state.fetchSchedules)
	const { avoid_professors } = settings
	const isAvoiding = avoid_professors.includes(prof.name)
	useEffect(() => {
		if (prof.name) {
			get_prof_grades(prof.name).then((grades) => {
				setAverageGpa(grades?.average_gpa.toFixed(2) || '-.--')
			})
		}
	}, [open, prof.name])
	return (
		<>
			<Chip onClick={() => setOpen(true)}>
				{(prof?.textbook_warning_percent || 0) > 10
					? `🚩 ${prof.name.substring(0, 15)}`
					: prof.name.substring(0, 15)}
			</Chip>
			<Dialog
				isOpen={open}
				title="Professor Information"
				customButtons={
					<Buttons>
						<Button
							text
							onClick={() => {
								const newSettings = {
									...settings,
									avoid_professors: isAvoiding
										? settings.avoid_professors.filter((p) => p !== prof.name)
										: [...settings.avoid_professors, prof.name],
								}
								setSettings(newSettings)
								fetchSchedules(newSettings)
								setOpen(false)
							}}
						>
							{isAvoiding ? 'Unavoid' : 'Avoid'}
						</Button>
						<Button outlined onClick={() => setOpen(false)}>
							Close
						</Button>
					</Buttons>
				}
				onClose={() => setOpen(false)}
			>
				<Option>
					<Label>Name: </Label>
					<Hint>{prof.name}</Hint>
				</Option>
				<Option>
					<Label>Average GPA: </Label>
					<Hint>
						{isNaN(parseFloat(averageGpa)) ? (
							'Loading...'
						) : (
							<Rating rating={parseFloat(averageGpa)} offset={0.6} />
						)}
					</Hint>
				</Option>
				<Option>
					<Label>Rating: </Label>
					<Hint>
						<Rating rating={prof.average_rating} />
					</Hint>
				</Option>
				<Option>
					<Label>Number of reviews: </Label>
					<Hint>{prof.reviews.length || 'None'}</Hint>
				</Option>
				{(prof?.textbook_warning_percent || 0) > 10 && (
					<Option>
						<Label>Textbook self-publisher: </Label>
						<Hint>{prof?.textbook_warning_percent}% 🚩</Hint>
					</Option>
				)}
				<Option>
					<span>
						<Label>Top Review: </Label>
						<Hint
							style={{
								fontSize: '0.8rem',
								lineHeight: '1rem',
							}}
						>
							{prof?.reviews?.length
								? prof?.reviews[0].review.substring(0, 1000)
								: 'n/a'}
						</Hint>
					</span>
				</Option>
			</Dialog>
		</>
	)
}
