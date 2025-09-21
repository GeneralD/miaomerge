// @ts-expect-error: No type definitions for 'react-mdr'
import { MatrixRainingLetters } from "react-mdr"

export function MatrixBackground() {
	return (
		<div className="fixed inset-0 z-0 pointer-events-none bg-black">
			<MatrixRainingLetters
				color="#00FF00"
				custom_class="w-full h-full m-0 p-0"
			/>
		</div>
	)
}
