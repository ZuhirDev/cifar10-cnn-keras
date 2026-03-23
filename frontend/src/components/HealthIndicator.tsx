import { useEffect, useState } from "react"
import { apiService } from "@/services/api.service"
import { Badge } from "@/components/ui/badge"
import { Activity, ShieldCheck, ShieldAlert } from "lucide-react"

export function HealthIndicator() {
    const [isOnline, setIsOnline] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const ok = await apiService.checkHealth()
                setIsOnline(ok)
            } catch {
                setIsOnline(false)
            } finally {
                setLoading(false)
            }
        }

        // Initial check
        checkHealth()

        // Poll every 10 seconds
        const interval = setInterval(checkHealth, 10000)
        return () => clearInterval(interval)
    }, [])

    if (loading && isOnline === null) {
        return (
            <Badge variant="outline" className="animate-pulse gap-1.5 px-3 py-1">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Comprobando...</span>
            </Badge>
        )
    }

    return (
        <div className="animate-in fade-in duration-500">
            {isOnline ? (
                <Badge
                    variant="outline"
                    className="group border-green-500/30 bg-green-500/5 px-3 py-1 text-green-600 transition-colors hover:bg-green-500/10 dark:text-green-400"
                >
                    <div className="relative flex h-2 w-2 mr-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </div>
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">Modelo Online</span>
                </Badge>
            ) : (
                <Badge
                    variant="outline"
                    className="border-destructive/30 bg-destructive/5 px-3 py-1 text-destructive transition-colors hover:bg-destructive/10"
                >
                    <div className="mr-2 h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">Modelo Offline</span>
                </Badge>
            )}
        </div>
    )
}
