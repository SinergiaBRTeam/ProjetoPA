"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { apiGet } from "@/lib/api-client"
import { AlertDto } from "@/lib/api-types"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await apiGet<AlertDto[]>('/api/alerts')
        setAlerts(data)
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card">
          <div className="p-8">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Alertas</h1>
            <p className="text-muted-foreground mt-1">Notificações e alertas do sistema</p>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum alerta encontrado</div>
          ) : (
            <div className="bg-card border border-border rounded-lg">
              <div className="divide-y divide-border">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="destructive">Alerta</Badge>
                        </div>
                        <p className="text-foreground">{alert.message}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                          <span>Data alvo: {new Date(alert.targetDate).toLocaleDateString()}</span>
                          <span>Criado em: {new Date(alert.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
