import styled from 'styled-components'

export const Wrapper = styled.section`
	width: clamp(280px, 90vw, 100%);
	margin: 0 auto;
	padding: 30px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	border-radius: 2px;
	background: #fff;

	// small mobile
	@media (max-width: 600px) {
		box-shadow: none;
		padding: 0;
		background: none;
	}
`
