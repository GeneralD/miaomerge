import { useTranslation } from "react-i18next"
import "./App.scss"
import "./i18n"
import { AppHeader } from "./components/AppHeader"
import { LanguageSelector } from "./components/LanguageSelector"
import { MatrixBackground } from "./components/MatrixBackground"
import { MergeWorkflow } from "./components/MergeWorkflow"
import { StepIndicator } from "./components/StepIndicator"
import {
	MergeWorkflowProvider,
	useMergeWorkflow,
} from "./contexts/MergeWorkflowContext"

function AppContent() {
	const { t } = useTranslation()
	const { isLoading, error, setError, currentStep } = useMergeWorkflow()

	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-8 relative">
			<MatrixBackground />
			<div className="fixed top-4 right-4 z-50">
				<LanguageSelector />
			</div>
			<main className="w-full max-w-4xl mx-auto relative z-10">
				<AppHeader />

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex justify-between items-center">
						<p className="text-red-700 m-0">{error}</p>
						<input
							type="button"
							onClick={() => setError(null)}
							value={t("buttons.dismiss")}
							className="bg-red-700 text-white border-none px-3 py-1 rounded cursor-pointer"
						/>
					</div>
				)}

				{isLoading && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
						<div className="w-12 h-12 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin" />
						<p className="text-white mt-4 text-lg">
							{t("loading.processing")}
						</p>
					</div>
				)}

				<StepIndicator currentStep={currentStep} />
				<MergeWorkflow />
			</main>
		</div>
	)
}

function App() {
	return (
		<MergeWorkflowProvider>
			<AppContent />
		</MergeWorkflowProvider>
	)
}

export default App
