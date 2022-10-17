import {
	Dialog,
	Hint,
	Input,
	SegmentedControl,
	Option,
	Label,
	Toggle,
} from 'ethereal2'
import { useState } from 'react'
import { MdBrush, MdRoundedCorner } from 'react-icons/md'
import styled from 'styled-components'
import { HexColorPicker } from 'react-colorful'
import { useDebounce } from 'react-use'
import toast from 'react-hot-toast'
import { default_theme } from '../pages/_app'
import { Flex } from './Flex'

const Circle = styled.div`
	// bottom right of viewport
	position: fixed;
	bottom: 20px;
	right: 20px;
	background: ${({ theme }) => theme.primary};
	border-radius: 50%;
	width: 50px;
	height: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
	transition: all 0.1s ease-in-out;
	&:hover {
		box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
	}
	&:active {
		box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
	}
	color: white;
	font-size: 30px;
`

export default ({
	resetFn,
	theme,
	setTheme,
}: {
	resetFn: VoidFunction
	theme: typeof default_theme
	setTheme: (t: typeof default_theme) => void
}) => {
	const [open, setOpen] = useState(false)
	const [reset, setReset] = useState(false)
	const [localTheme, setLocalTheme] = useState(theme)
	const [notYet, setNotYet] = useState(false)

	const setThemeProperly = (prop: string, val: string | boolean) => {
		if (localTheme) {
			setLocalTheme({
				...localTheme,
				[prop]: val,
			})
		}
	}

	const [, _cancel] = useDebounce(
		() => {
			if (JSON.stringify(localTheme) !== JSON.stringify(default_theme)) {
				setTheme(localTheme)
			}
		},
		100,
		[localTheme],
	)
	return (
		<>
			<Circle
				onClick={() => {
					setOpen(!open)
				}}
			>
				<MdBrush />
			</Circle>
			<Dialog
				isOpen={open}
				title="User Preferences"
				onClose={() => {
					setOpen(false)
					setReset(true)
				}}
			>
				<Flex comingSoonSmall={notYet}>
					<Option>
						<span>
							<Label>Dark mode</Label>
							<Hint>Shift the ui to a dark color scheme</Hint>
						</span>
						<Toggle
							value={theme.darkMode}
							onClick={() => {
								if (notYet) {
									toast('Waiiit')
								} else {
									setThemeProperly('darkMode', !theme.darkMode)
									setTimeout(() => {
										setThemeProperly('darkMode', false)
										toast('Nah, not yet.')
										setNotYet(true)
									}, 1000)
								}
							}}
						/>
					</Option>
				</Flex>

				<Option>
					<span>
						<Label>Schedule style</Label>
					</span>
				</Option>
				<Option>
					<SegmentedControl
						options={[
							{
								label: 'Outlined',
								id: 'outlined',
							},
							{
								label: 'Solid',
								id: 'solid',
							},
						]}
						value={localTheme?.solid ? 'solid' : 'outlined'}
						onChange={(val) => setThemeProperly('solid', val.id === 'solid')}
					/>
				</Option>
				<Option>
					<span>
						<Input
							minimal
							icon={<MdRoundedCorner />}
							placeholder="Enter number"
							value={
								parseInt(localTheme?.borderRadius || '', 10).toString() || ''
							}
							type="number"
							onChange={(val) => {
								if (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 24) {
									setThemeProperly('borderRadius', `${val}px`)
								}
							}}
						/>
						<Hint>Set theme border radius</Hint>
					</span>
				</Option>
				<Label>Set primary color</Label>
				<HexColorPicker
					style={{
						width: '100%',
					}}
					color={localTheme?.primary}
					onChange={(color) => {
						setThemeProperly('primary', color)
					}}
				/>
			</Dialog>
		</>
	)
}
