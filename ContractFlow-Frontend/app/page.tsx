"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { apiGet } from "@/lib/api-client"
import { ContractSimpleDto, AlertDto, ContractDetailsDto } from "@/lib/api-types"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const { toast } = useToast()
  const [contracts, setContracts] = useState<ContractSimpleDto[]>([])
  const [alerts, setAlerts] = useState<AlertDto[]>([])
  const [stats, setStats] = useState({ active: 0, pending: 0, overdue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [contractsData, alertsData] = await Promise.all([
          apiGet<ContractSimpleDto[]>('/api/contracts'),
          apiGet<AlertDto[]>('/api/alerts')
        ])
        
        setContracts(contractsData.slice(0, 5))
        setAlerts(alertsData.slice(0, 5))
        
        const activeCount = contractsData.filter(c => c.status === 'Active').length
        setStats({
          active: activeCount,
          pending: contractsData.filter(c => c.status === 'Pending').length,
          overdue: contractsData.filter(c => c.status === 'Overdue').length
        })
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do dashboard",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card">
          <div className="p-8">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do sistema de contratos</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <Link href="/contratos" className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
              <p className="text-sm font-medium text-muted-foreground">Contratos Ativos</p>
              <p className="text-3xl font-semibold text-foreground mt-2">
                {loading ? '..' : stats.active}
              </p>
            </Link>
            <Link href="/pendentes" className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
              <p className="text-sm font-medium text-muted-foreground">Pendentes de Ação</p>
              <p className="text-3xl font-semibold text-foreground mt-2">
                {loading ? '..' : stats.pending}
              </p>
            </Link>
            <Link href="/atrasados" className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
              <p className="text-sm font-medium text-muted-foreground">Atrasados</p>
              <p className="text-3xl font-semibold text-destructive mt-2">
                {loading ? '..' : stats.overdue}
              </p>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Contratos Recentes</h2>
              <Button variant="ghost" asChild>
                <Link href="/contratos">Ver todos</Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Carregando...</div>
              ) : contracts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Nenhum contrato encontrado</div>
              ) : (
                contracts.map((contract) => (
                  <Link
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    className="block p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{contract.officialNumber}</p>
                        <p className="text-sm text-muted-foreground">Status: {contract.status}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                        {contract.status}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Alertas Recentes</h2>
              <Button variant="ghost" asChild>
                <Link href="/alertas">Ver todos</Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Carregando...</div>
              ) : alerts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Nenhum alerta encontrado</div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">Data: {formatDate(alert.date)}</p>
                      </div>
                      <Badge variant="destructive">{alert.type}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
