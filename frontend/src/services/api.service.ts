export type PredictionResult = {
    prediction: string
    confidence: string
    class_index: number
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

/**
 * Servicio para comunicarse con el API Gateway (Node.js)
 */
export const apiService = {
    /**
     * Envía una imagen al modelo para su clasificación
     * @param file Archivo de imagen (File object)
     * @returns Resultado de la predicción
     */
    async predictImage(file: File): Promise<PredictionResult> {
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
                throw new Error(errorData.error || `Error del servidor (${response.status})`)
            }

            return await response.json()
        } catch (error) {
            console.error("API Service Error:", error)
            throw error
        }
    },

    /**
     * Comprueba el estado del API Gateway
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/health/ai-service`)
            return response.ok
        } catch {
            return false
        }
    }
}
