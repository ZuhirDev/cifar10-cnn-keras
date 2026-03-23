import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Brain } from "lucide-react"
import ImageClassifier from "@/components/ImageClassifier"
import { HealthIndicator } from "@/components/HealthIndicator"

export default function App() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("dark")
    else setTheme("dark")
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center bg-background">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          id="theme-toggle"
        >
          <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
        {/* Header */}
        <div className="space-y-4 text-center">
          <HealthIndicator />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            CIFAR-10 Classifier
          </h1>
          <p className="text-base text-muted-foreground">
            Sube una imagen y la red neuronal intentará clasificarla en una de las 10 categorías.
          </p>
        </div>

        {/* Classifier */}
        <ImageClassifier />

        {/* Footer classes */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground/60">
          {["✈️ Avión", "🚗 Auto", "🐦 Pájaro", "🐱 Gato", "🦌 Ciervo", "🐶 Perro", "🐸 Rana", "🐴 Caballo", "🚢 Barco", "🚛 Camión"].map(
            (label) => (
              <span
                key={label}
                className="rounded-full border border-border/40 bg-muted/30 px-2.5 py-1 text-xs transition-colors hover:bg-muted/60"
              >
                {label}
              </span>
            )
          )}
        </div>
      </main>
    </div>
  )
}