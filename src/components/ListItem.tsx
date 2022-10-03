import React from 'react'
import Link from 'next/link'

import { Section } from '../interfaces'

type Props = {
	data: Section
}
const ListItem = ({ data }: Props) => (
	<Link href="/users/[id]" as={`/users/${data.course_id}`}>
		<a>
			{data.class_time}: {data.course_name}
		</a>
	</Link>
)

export default ListItem
