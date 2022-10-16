import { Toaster } from 'react-hot-toast'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import { useEffect, useState } from 'react'
import GlobalStyle from '../styles'
import Preferences from '../components/Preferences'

export const default_theme = {
	primary: '#4D8BF7',
	secondary: '#999999',
	borderRadius: '5px',
	solid: false,
	darkMode: false,
}

function App({ Component, pageProps }: AppProps) {
	const [theme, setTheme] = useState(default_theme)

	useEffect(() => {
		if (theme.darkMode) {
			document.body.classList.add('dark')
		} else {
			document.body.classList.remove('dark')
		}
	}, [theme.darkMode])

	return (
		<>
			<GlobalStyle />
			<Toaster
				position="top-right"
				toastOptions={{
					loading: {
						duration: 10000,
					},
					success: {
						duration: 2500,
					},
					error: {
						duration: 1500,
					},
				}}
			/>
			<ThemeProvider theme={theme || default_theme}>
				<Component {...pageProps} />
				<Preferences
					resetFn={() => setTheme(default_theme)}
					theme={theme}
					setTheme={setTheme}
				/>
			</ThemeProvider>
		</>
	)
}

export default App
