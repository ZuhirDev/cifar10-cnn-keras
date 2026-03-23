import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, Loader2, RotateCcw, Sparkles, AlertCircle } from "lucide-react"
import { ExamplesGallery } from "./ExamplesGallery"

const CLASS_EMOJIS: Record<string, string> = {
    avion: "✈️",
    automovil: "🚗",
    pajaro: "🐦",
    gato: "🐱",
    ciervo: "🦌",
    perro: "🐶",
    rana: "🐸",
    caballo: "🐴",
    barco: "🚢",
    camion: "🚛",
}

const CLASS_LABELS: Record<string, string> = {
    avion: "Avión",
    automovil: "Automóvil",
    pajaro: "Pájaro",
    gato: "Gato",
    ciervo: "Ciervo",
    perro: "Perro",
    rana: "Rana",
    caballo: "Caballo",
    barco: "Barco",
    camion: "Camión",
}

import { apiService, type PredictionResult } from "@/services/api.service"

type Status = "idle" | "preview" | "loading" | "result" | "error"

export default function ImageClassifier() {
    const [status, setStatus] = useState<Status>("idle")
    const [image, setImage] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<PredictionResult | null>(null)
    const [error, setError] = useState<string>("")
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((f: File) => {
        if (!f.type.startsWith("image/")) {
            setError("Por favor, sube un archivo de imagen válido.")
            setStatus("error")
            return
        }
        setFile(f)
        setError("")
        const reader = new FileReader()
        reader.onload = (e) => {
            setImage(e.target?.result as string)
            setStatus("preview")
        }
        reader.readAsDataURL(f)
    }, [])

    const onDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
        },
        [handleFile]
    )

    const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(true)
    }, [])

    const onDragLeave = useCallback(() => setDragOver(false), [])

    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
        },
        [handleFile]
    )

    const classify = useCallback(async (f?: File) => {
        const fileToUse = f || file
        if (!fileToUse) return
        setStatus("loading")
        setError("")

        try {
            const data = await apiService.predictImage(fileToUse)
            setResult(data)
            setStatus("result")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al conectar con el servidor.")
            setStatus("error")
        }
    }, [file])

    const handleExampleSelect = useCallback(async (url: string, name: string) => {
        setStatus("loading")
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const f = new File([blob], `${name}.jpg`, { type: "image/jpeg" })

            // Set for preview
            setImage(url)
            setFile(f)

            // Directly classify
            await classify(f)
        } catch (err) {
            setError("No se pudo cargar la imagen de ejemplo.")
            setStatus("error")
        }
    }, [classify])

    const reset = useCallback(() => {
        setStatus("idle")
        setImage(null)
        setFile(null)
        setResult(null)
        setError("")
        if (inputRef.current) inputRef.current.value = ""
    }, [])

    const confidenceValue = result ? parseFloat(result.confidence) : 0

    return (
        <div className="flex w-full max-w-lg flex-col items-center gap-6">
            {/* Upload / Preview Area */}
            <Card className="w-full overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-0">
                    {status === "idle" || status === "error" ? (
                        <div
                            id="drop-zone"
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onClick={() => inputRef.current?.click()}
                            className={`group flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed p-8 transition-all duration-300 ${dragOver
                                ? "border-primary bg-primary/5 scale-[1.02]"
                                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                                }`}
                        >
                            <div
                                className={`rounded-2xl p-4 transition-all duration-300 ${dragOver
                                    ? "bg-primary/10 text-primary scale-110"
                                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                    }`}
                            >
                                <Upload className="h-10 w-10" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-lg font-medium text-foreground">
                                    {dragOver ? "Suelta la imagen aquí" : "Arrastra una imagen"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    o haz clic para seleccionar un archivo
                                </p>
                            </div>
                            <Badge variant="secondary" className="gap-1.5 text-xs">
                                <ImageIcon className="h-3 w-3" />
                                JPG, PNG, WEBP
                            </Badge>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                onChange={onChange}
                                className="hidden"
                                id="file-input"
                            />
                        </div>
                    ) : (
                        <div className="animate-in fade-in relative">
                            {image && (
                                <div className="flex items-center justify-center bg-black/5 p-6 dark:bg-white/5">
                                    <img
                                        src={image}
                                        alt="Imagen subida"
                                        className="max-h-[300px] rounded-lg object-contain shadow-lg"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Error Message */}
            {status === "error" && error && (
                <div className="animate-in fade-in flex w-full items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Action Buttons */}
            {status === "preview" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full gap-3">
                    <Button variant="outline" onClick={reset} className="flex-1 gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Cambiar
                    </Button>
                    <Button onClick={() => classify()} className="flex-1 gap-2">
                        <Sparkles className="h-4 w-4" />
                        Clasificar
                    </Button>
                </div>
            )}

            {/* Loading State */}
            {status === "loading" && (
                <div className="animate-in fade-in flex w-full flex-col items-center gap-3 py-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Analizando la imagen…</p>
                </div>
            )}

            {/* Result */}
            {status === "result" && result && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 w-full border-primary/20 bg-card/80 backdrop-blur-sm">
                    <CardContent className="space-y-5 p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Predicción
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">
                                        {CLASS_EMOJIS[result.prediction] || "❓"}
                                    </span>
                                    <span className="text-2xl font-bold text-foreground">
                                        {CLASS_LABELS[result.prediction] || result.prediction}
                                    </span>
                                </div>
                            </div>
                            <Badge variant="secondary" className="h-fit text-xs">
                                #{result.class_index}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Confianza</span>
                                <span className="font-semibold text-foreground tabular-nums">
                                    {result.confidence}
                                </span>
                            </div>
                            <Progress value={confidenceValue} className="h-2.5" />
                        </div>

                        <Button
                            variant="outline"
                            onClick={reset}
                            className="w-full gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clasificar otra imagen
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Examples Gallery */}
            {status === "idle" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 w-full pt-2">
                    <ExamplesGallery
                        onSelect={handleExampleSelect}
                        disabled={false}
                    />
                </div>
            )}
        </div>
    )
}
