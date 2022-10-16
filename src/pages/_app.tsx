import { Toaster } from 'react-hot-toast'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import GlobalStyle, { theme } from '../styles'

function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<GlobalStyle />
			<Toaster position="top-right" />
			<ThemeProvider theme={theme}>
				<Component {...pageProps} />
			</ThemeProvider>
		</>
	)
}

export default App
