import styled from 'styled-components'

export const Flex = styled.div<{ no_column?: boolean; shadow?: boolean }>`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	height: 100%;
	gap: 10px;
	box-shadow: ${({ shadow }) => shadow && '0 0 10px rgba(0, 0, 0, 0.1)'};

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
