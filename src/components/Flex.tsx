import styled from 'styled-components'

export const ComingSoon = styled.span<{
	comingSoon?: boolean
	comingSoonSmall?: boolean
}>`
	position: relative;
	${({ comingSoon, comingSoonSmall }) =>
		(comingSoon || comingSoonSmall) &&
		`
		opacity: 0.6;
		user-select: none;
		pointer-events: none;
		&:after{
			content: '🚧 Coming Soon™️';
			position: absolute;
			top: 50%;
			text-align: center;
			transform: translate(0%,-50%) rotate(-45deg);
			width: 100%;
			font-size: 2rem;
			font-weight: 600;
		}

	`}
	${({ comingSoonSmall }) =>
		comingSoonSmall &&
		`
			&:after{
				font-size: 1rem; 
				transform: translate(0%,-50%) rotate(-15deg);
			}
		`}
`

export const Flex = styled(ComingSoon)<{
	no_column?: boolean
	shadow?: boolean
}>`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	height: 100%;
	gap: 10px;
	box-shadow: ${({ shadow }) => shadow && '0 0 10px rgba(0, 0, 0, 0.1)'};
	position: relative;

	// mobile
	@media (max-width: 1400px) {
		flex-direction: ${({ no_column }) => !no_column && 'column'};
	}
	// small mobile
	@media (max-width: 300px) {
		box-shadow: none;
	}
	border-radius: 2px;
`
