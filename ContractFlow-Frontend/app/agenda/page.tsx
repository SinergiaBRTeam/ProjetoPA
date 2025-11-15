"use client"

import Sidebar from "@/components/sidebar"
import { Calendar, Clock, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api-client"
import { AlertDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
  daysLeft: number;
  contract: string;
}

export default function AgendaPrazosPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [stats, setStats] = useState({ next7: 0, next30: 0, overdue: 0, done: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const buildEventsFromAlerts = (alerts: AlertDto[]): EventItem[] => {
    const now = new Date()
    const nowTime = now.getTime()

    let next7 = 0
    let next30 = 0
    let overdue = 0

    const mappedEvents: EventItem[] = alerts.map((alert) => {
      const targetDate = new Date(alert.targetDate)
      const diffTime = targetDate.getTime() - nowTime
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let status = "Planejado"
      let statusColor = "bg-blue-100 text-blue-800"

      if (diffDays <= 0) {
        status = "Crítico"
        statusColor = "bg-red-100 text-red-800"
        overdue++
      } else if (diffDays <= 7) {
        status = "Atenção"
        statusColor = "bg-yellow-100 text-yellow-800"
        next7++
        next30++
      } else if (diffDays <= 30) {
        next30++
      }

      const contractLabel = alert.contractId
        ? `Contrato: ${alert.contractId.substring(0, 8)}...`
        : alert.deliverableId
          ? `Entrega: ${alert.deliverableId.substring(0, 8)}...`
          : "Alerta geral"

      return {
        id: alert.id,
        title: alert.message.length > 70 ? `${alert.message.substring(0, 67)}...` : alert.message,
        date: targetDate.toISOString().split('T')[0],
        time: targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status,
        statusColor,
        daysLeft: diffDays > 0 ? diffDays : 0,
        contract: contractLabel,
      }
    })

    const done = Math.max(alerts.length - next30 - overdue, 0)
    setStats({ next7, next30, overdue, done })

    return mappedEvents.sort((a, b) => a.date.localeCompare(b.date))
  }

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const alerts = await apiGet<AlertDto[]>('/api/alerts')
      const mappedEvents = buildEventsFromAlerts(alerts)
      setEvents(mappedEvents)
    } catch (error) {
      console.error("Erro ao buscar alertas:", error)
      setError("Não foi possível carregar a agenda de prazos")
      toast({
        title: "Erro",
        description: "Falha ao carregar os alertas. Tente novamente mais tarde.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Agenda de Prazos</h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground">Acompanhe datas importantes e prazos dos contratos</p>
              <Button variant="outline" size="sm" onClick={loadAlerts} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Próximos 7 dias</p>
                  <p className="text-3xl font-bold text-primary">{stats.next7}</p>
                </div>
                <AlertCircle size={32} className="text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Próximos 30 dias</p>
                  <p className="text-3xl font-bold text-primary">{stats.next30}</p>
                </div>
                <Calendar size={32} className="text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Atrasados</p>
                  <p className="text-3xl font-bold text-red-500">{stats.overdue}</p>
                </div>
                <AlertCircle size={32} className="text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Concluídos</p>
                  <p className="text-3xl font-bold text-green-500">{stats.done}</p>
                </div>
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Cronograma de Eventos</h2>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">Carregando agenda...</div>
            ) : error ? (
              <div className="py-10 text-center text-destructive">{error}</div>
            ) : events.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">Nenhum alerta cadastrado no momento.</div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={event.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar size={20} className="text-primary" />
                      </div>
                      {index < events.length - 1 && <div className="w-1 h-12 bg-gray-200 mt-2" />}
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.statusColor}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {event.time}
                        </div>
                        <div className="font-medium">{event.daysLeft > 0 ? `${event.daysLeft} dias` : "Vencido"}</div>
                        <span className="text-primary font-medium">{event.contract}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
