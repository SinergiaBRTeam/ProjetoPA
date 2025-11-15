"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from "@/components/sidebar"
import { apiGet } from "@/lib/api-client"
import {
  DueDeliverableReportDto,
  ContractStatusReportDto,
  DeliveryBySupplierReportDto,
  DeliveryByOrgUnitReportDto,
  PenaltyReportDto
} from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { toast } = useToast()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dueDeliverables, setDueDeliverables] = useState<DueDeliverableReportDto[]>([])
  const [contractStatus, setContractStatus] = useState<ContractStatusReportDto[]>([])
  const [deliveriesBySupplier, setDeliveriesBySupplier] = useState<DeliveryBySupplierReportDto[]>([])
  const [deliveriesByOrgUnit, setDeliveriesByOrgUnit] = useState<DeliveryByOrgUnitReportDto[]>([])
  const [penalties, setPenalties] = useState<PenaltyReportDto[]>([])

  const fetchDueDeliverables = async () => {
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)
      const data = await apiGet<DueDeliverableReportDto[]>(`/api/reports/due-deliverables?${params}`)
      setDueDeliverables(data)
      toast({ title: "Sucesso", description: "Relatório carregado" })
    } catch (error) {
      console.error('Error fetching report:', error)
      toast({ title: "Erro", description: "Falha ao carregar relatório", variant: "destructive" })
    }
  }

  const fetchContractStatus = async () => {
    try {
      const data = await apiGet<ContractStatusReportDto[]>('/api/reports/contract-status')
      setContractStatus(data)
      toast({ title: "Sucesso", description: "Relatório carregado" })
    } catch (error) {
      console.error('Error fetching report:', error)
      toast({ title: "Erro", description: "Falha ao carregar relatório", variant: "destructive" })
    }
  }

  const fetchDeliveriesBySupplier = async () => {
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)
      const data = await apiGet<DeliveryBySupplierReportDto[]>(`/api/reports/deliveries-by-supplier?${params}`)
      setDeliveriesBySupplier(data)
      toast({ title: "Sucesso", description: "Relatório carregado" })
    } catch (error) {
      console.error('Error fetching report:', error)
      toast({ title: "Erro", description: "Falha ao carregar relatório", variant: "destructive" })
    }
  }

  const fetchDeliveriesByOrgUnit = async () => {
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)
      const data = await apiGet<DeliveryByOrgUnitReportDto[]>(`/api/reports/deliveries-by-orgunit?${params}`)
      setDeliveriesByOrgUnit(data)
      toast({ title: "Sucesso", description: "Relatório carregado" })
    } catch (error) {
      console.error('Error fetching report:', error)
      toast({ title: "Erro", description: "Falha ao carregar relatório", variant: "destructive" })
    }
  }

  const fetchPenalties = async () => {
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)
      const data = await apiGet<PenaltyReportDto[]>(`/api/reports/penalties?${params}`)
      setPenalties(data)
      toast({ title: "Sucesso", description: "Relatório carregado" })
    } catch (error) {
      console.error('Error fetching report:', error)
      toast({ title: "Erro", description: "Falha ao carregar relatório", variant: "destructive" })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card">
          <div className="p-8">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground mt-1">Gere e visualize relatórios do sistema</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Filtro de Datas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom">De</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Até</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="due-deliverables" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="due-deliverables">Entregas Vencendo</TabsTrigger>
              <TabsTrigger value="contract-status">Status Contratos</TabsTrigger>
              <TabsTrigger value="by-supplier">Por Fornecedor</TabsTrigger>
              <TabsTrigger value="by-orgunit">Por Unidade</TabsTrigger>
              <TabsTrigger value="penalties">Penalidades</TabsTrigger>
            </TabsList>

            <TabsContent value="due-deliverables">
              <div className="bg-card border border-border rounded-lg">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">Entregas Vencendo</h3>
                  <Button onClick={fetchDueDeliverables}>Gerar Relatório</Button>
                </div>
                <div className="divide-y divide-border">
                  {dueDeliverables.map((item) => (
                    <div key={item.deliverableId} className="p-6">
                      <p className="font-semibold text-foreground">{item.obligationDescription}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Data esperada: {new Date(item.expectedDate).toLocaleDateString()}</span>
                        <span>Status: {item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contract-status">
              <div className="bg-card border border-border rounded-lg">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">Status dos Contratos</h3>
                  <Button onClick={fetchContractStatus}>Gerar Relatório</Button>
                </div>
                <div className="divide-y divide-border">
                  {contractStatus.map((item) => (
                    <div key={item.contractId} className="p-6">
                      <p className="font-semibold text-foreground">{item.officialNumber}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Status: {item.status}</span>
                        <span>Obrigações: {item.completedObligations}/{item.totalObligations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="by-supplier">
              <div className="bg-card border border-border rounded-lg">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">Entregas por Fornecedor</h3>
                  <Button onClick={fetchDeliveriesBySupplier}>Gerar Relatório</Button>
                </div>
                <div className="divide-y divide-border">
                  {deliveriesBySupplier.map((item) => (
                    <div key={item.supplierId} className="p-6">
                      <p className="font-semibold text-foreground">{item.supplierName}</p>
                      <div className="flex gap-4 text-sm mt-1">
                        <span className="text-muted-foreground">Total: {item.totalDeliveries}</span>
                        <span className="text-green-600">No prazo: {item.onTimeDeliveries}</span>
                        <span className="text-destructive">Atrasadas: {item.lateDeliveries}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="by-orgunit">
              <div className="bg-card border border-border rounded-lg">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">Entregas por Unidade</h3>
                  <Button onClick={fetchDeliveriesByOrgUnit}>Gerar Relatório</Button>
                </div>
                <div className="divide-y divide-border">
                  {deliveriesByOrgUnit.map((item) => (
                    <div key={item.orgUnitId} className="p-6">
                      <p className="font-semibold text-foreground">{item.orgUnitName}</p>
                      <div className="flex gap-4 text-sm mt-1">
                        <span className="text-muted-foreground">Total: {item.totalDeliveries}</span>
                        <span className="text-green-600">No prazo: {item.onTimeDeliveries}</span>
                        <span className="text-destructive">Atrasadas: {item.lateDeliveries}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="penalties">
              <div className="bg-card border border-border rounded-lg">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">Penalidades</h3>
                  <Button onClick={fetchPenalties}>Gerar Relatório</Button>
                </div>
                <div className="divide-y divide-border">
                  {penalties.map((item) => (
                    <div key={item.penaltyId} className="p-6 space-y-2">
                      <p className="font-semibold text-foreground">{item.type}</p>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Severidade: {item.severity}</span>
                        {item.amount && <span className="font-semibold text-foreground">R$ {item.amount.toLocaleString()}</span>}
                      </div>
                      {item.legalBasis && <p className="text-sm text-muted-foreground">Base: {item.legalBasis}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
