import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const EXAMPLES = [
    { id: "avion", name: "Avión", path: "/examples/avion.jpg", emoji: "✈️" },
    { id: "perro", name: "Perro", path: "/examples/perro.jpg", emoji: "🐶" },
    { id: "rana", name: "Rana", path: "/examples/rana.jpg", emoji: "🐸" },
]

interface ExamplesGalleryProps {
    onSelect: (imageUrl: string, name: string) => void
    disabled?: boolean
}

export function ExamplesGallery({ onSelect, disabled }: ExamplesGalleryProps) {
    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-tight">
                    Prueba con un ejemplo
                </h3>
                <Badge variant="secondary" className="text-[10px] font-bold">3 IMÁGENES</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {EXAMPLES.map((ex) => (
                    <Card
                        key={ex.id}
                        className={`group relative cursor-pointer overflow-hidden border-border/40 transition-all hover:border-primary/50 hover:shadow-md ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                        onClick={() => onSelect(ex.path, ex.name)}
                    >
                        <CardContent className="p-0">
                            <div className="relative aspect-square">
                                <img
                                    src={ex.path}
                                    alt={ex.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] backdrop-blur-sm">
                                    {ex.emoji}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
