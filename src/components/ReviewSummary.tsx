import { MergeMapping, LEDConfiguration } from "../types";
import { LEDPreview } from "./LEDPreview";

interface ReviewSummaryProps {
	baseConfig: LEDConfiguration;
	mappings: MergeMapping[];
	onConfirm: () => void;
	onBack: () => void;
}

export function ReviewSummary({
	baseConfig,
	mappings,
	onConfirm,
	onBack,
}: ReviewSummaryProps) {
	return (
		<div className="review-summary">
			<h2>Review Configuration</h2>

			<div className="summary-content">
				<div className="base-info">
					<h3>Base Configuration</h3>
					<p>Total Pages: {baseConfig.page_data.length}</p>
					<p>Editable Custom Pages: {mappings.length}</p>
				</div>

				<div className="mappings-summary">
					<h3>Custom Page Mappings</h3>
					<table>
						<thead>
							<tr>
								<th>Page</th>
								<th>Action</th>
								<th>Source File</th>
							</tr>
						</thead>
						<tbody>
							{mappings.map((mapping) => (
								<tr key={mapping.slot}>
									<td>Page {mapping.slot}</td>
									<td className={`action-${mapping.action}`}>
										{mapping.action === "keep" && "✓ Keep Original"}
										{mapping.action === "replace" && "↻ Replace"}
										{mapping.action === "combine" && "⊕ Combine"}
									</td>
									<td>
										{mapping.sourceFile
											? mapping.sourceFile.split("/").pop()
											: "-"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="stats">
					<h3>Summary</h3>
					<p>Kept: {mappings.filter((m) => m.action === "keep").length}</p>
					<p>
						Replaced: {mappings.filter((m) => m.action === "replace").length}
					</p>
					<p>
						Combined: {mappings.filter((m) => m.action === "combine").length}
					</p>
				</div>

				<div className="final-preview">
					<h3>Final Configuration Preview</h3>
					<div className="preview-grid">
						{[5, 6, 7].map((pageIndex) => (
							<div key={pageIndex} className="page-preview">
								<h4>Page {pageIndex}</h4>
								<LEDPreview
									config={baseConfig}
									selectedPage={pageIndex}
									className="compact"
								/>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="actions">
				<button onClick={onBack} className="back-button">
					Back to Mapping
				</button>
				<button onClick={onConfirm} className="confirm-button">
					Save Configuration
				</button>
			</div>
		</div>
	);
}
