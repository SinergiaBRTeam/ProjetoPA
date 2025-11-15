"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { apiGet } from "@/lib/api-client"
import { AlertDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const contractId = searchParams.get('contractId')
  const deliverableId = searchParams.get('deliverableId')
  const criticalOnly = searchParams.get('critical') === 'true'

  const filteredAlerts = useMemo(() => {
    if (!criticalOnly) {
      return alerts
    }
    const now = new Date()
    return alerts.filter(alert => new Date(alert.targetDate) < now)
  }, [alerts, criticalOnly])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        if (contractId) params.append('contractId', contractId)
        if (deliverableId) params.append('deliverableId', deliverableId)
        const query = params.toString()
        const endpoint = query ? `/api/alerts?${query}` : '/api/alerts'
        const data = await apiGet<AlertDto[]>(endpoint)
        setAlerts(data)
      } catch (error) {
        console.error('Error fetching alerts:', error)
        setError('Não foi possível carregar os alertas')
        toast({
          title: "Erro",
          description: "Falha ao carregar os alertas. Tente novamente mais tarde.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [contractId, deliverableId, toast])

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
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum alerta encontrado</div>
          ) : (
            <div className="bg-card border border-border rounded-lg">
              {criticalOnly && (
                <div className="px-6 py-3 text-sm text-destructive border-b border-border bg-destructive/10">
                  Exibindo apenas alertas críticos
                </div>
              )}
              <div className="divide-y divide-border">
                {filteredAlerts.map((alert) => (
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
