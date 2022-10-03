import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html>
			<Head />
			<body>
				<Main />
				<NextScript />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="true"
				/>
				<link
					// @ts-expect-error This is valid
					defer
					href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;500;700;900&family=Montserrat:wght@500;600;700&display=swap"
					rel="stylesheet"
				/>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta
					name="description"
					content="Easily configure your schedule for UMD"
				/>
				<meta name="keywords" content="UMD, Schedule, Fetch Monitors" />
				<meta
					name="author"
					content="Fetch Monitors, Maximilian Hollis, Daniel Huang"
				/>

				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@fetchmonitors" />
				<meta name="twitter:title" content="EZ-UMD" />
				<meta
					name="twitter:description"
					content="Easily make your schedule for UMD * Sponsored by Fetch Monitors"
				/>
				<meta name="twitter:image" content="/resume_share.png" />
				<link rel="icon" type="image/svg+xml" href="/icon.svg" />
			</body>
		</Html>
	)
}
