import React, { ReactNode } from 'react'
import Head from 'next/head'

type Props = {
	children?: ReactNode
	title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => (
	<div>
		<Head>
			<title>{title}</title>
		</Head>
		<header
			style={{
				margin: 0,
				width: '100%',
				textAlign: 'center',
				padding: '10px',
				fontSize: '12px',
			}}
		>
			Made with ❤️ By <a href="https://maxjs.dev">Max Hollis</a> and{' '}
			<a href="https://danielh.cc">Daniel Huang</a> | Sponsored by:{' '}
			<a href="https://github.com/Fetch-Monitors">Fetch Monitors</a> | Powered
			by: <a href="https://github.com/danielhuang/cotton">Cotton</a> and{' '}
			<a href="https://github.com/Fetch-Monitors/Ethereal2">Ethereal2</a>
		</header>
		<div>{children}</div>
	</div>
)

export default Layout
