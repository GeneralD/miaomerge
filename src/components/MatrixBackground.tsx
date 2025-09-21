// @ts-expect-error: No type definitions for 'react-mdr'
import { MatrixRainingLetters } from "react-mdr"

export function MatrixBackground() {
	return (
		<div className="fixed inset-0 -z-10 pointer-events-none">
			<MatrixRainingLetters color="#00FF00" custom_class="m-0 p-0" />
		</div>
	)
}
