// Platform detection utility
declare global {
	interface Window {
		__TAURI__?: {
			invoke: (
				cmd: string,
				args?: Record<string, unknown>
			) => Promise<unknown>
		}
		isTauri?: boolean
	}
}

// Primary detection method using __TAURI__ presence
export const isTauriApp = (): boolean => {
	return typeof window !== "undefined" && "__TAURI__" in window
}

// Alternative detection method for newer Tauri versions (2.0.0-beta.9+)
export const isTauriAppNew = (): boolean => {
	return (
		typeof window !== "undefined" && "isTauri" in window && !!window.isTauri
	)
}

// Combined detection with fallback
export const isTauri = (): boolean => {
	return isTauriApp() || isTauriAppNew()
}

export const isWebApp = (): boolean => {
	return !isTauri()
}

// Device type detection
export const isMobile = (): boolean => {
	return typeof navigator !== "undefined" && navigator.maxTouchPoints > 0
}

export const isDesktop = (): boolean => {
	return !isMobile()
}

// Combined platform and device detection
export const isTauriMobile = (): boolean => {
	return isTauri() && isMobile()
}

export const isTauriDesktop = (): boolean => {
	return isTauri() && isDesktop()
}
