import { createGlobalStyle } from 'styled-components'

export const theme = {
	primary: '#4D8BF7',
	secondary: '#999999',
	borderRadius: '5px',
}

const GlobalStyle = createGlobalStyle`
	* {
		box-sizing: border-box;
		scroll-behavior: smooth;
	}

	:root {
		font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
		font-size: 16px;
		line-height: 24px;
		font-weight: 400;

		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		-webkit-text-size-adjust: 100%;
	}

	body {
		margin: 0;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background: #fafafa;
	}

`
export default GlobalStyle
