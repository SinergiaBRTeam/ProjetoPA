"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from "@/components/sidebar"
import { apiGet } from "@/lib/api-client"
import { ObligationDto } from "@/lib/api-types"

export default function ObligationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [obligation, setObligation] = useState<ObligationDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchObligation = async () => {
      try {
        const data = await apiGet<ObligationDto>(`/api/obligations/${params.id}`)
        setObligation(data)
      } catch (error) {
        console.error('Error fetching obligation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchObligation()
  }, [params.id])

  if (loading) return <div>Carregando...</div>
  if (!obligation) return <div>Obrigação não encontrada</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary">{obligation.clauseRef}</h1>
            <div className="flex gap-2">
              <Link href={`/obligations/${obligation.id}/edit`}>
                <Button>Editar</Button>
              </Link>
              <Link href={`/obligations/${obligation.id}/deliverables/create`}>
                <Button variant="outline">Nova Entrega</Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="deliverables">Entregas</TabsTrigger>
              <TabsTrigger value="noncompliances">Não Conformidades</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Informações da Obrigação
                    <Badge>{obligation.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p className="font-semibold">{obligation.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                    <p className="font-semibold">
                      {obligation.dueDate ? new Date(obligation.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliverables">
              <div className="space-y-4">
                {obligation.deliverables.map((deliverable) => (
                  <Card key={deliverable.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Quantidade: {deliverable.quantity} {deliverable.unit}</p>
                          <p className="text-sm text-muted-foreground">
                            Esperado: {new Date(deliverable.expectedDate).toLocaleDateString()}
                          </p>
                          {deliverable.deliveredAt && (
                            <p className="text-sm text-green-600">
                              Entregue: {new Date(deliverable.deliveredAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Link href={`/deliverables/${deliverable.id}`}>
                          <Button variant="outline">Ver Detalhes</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="noncompliances">
              <div className="space-y-4">
                {obligation.nonCompliances.map((nc) => (
                  <Card key={nc.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span className="text-lg">Não Conformidade</span>
                        <Badge variant="destructive">{nc.severity}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{nc.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        Registrado em: {new Date(nc.registeredAt).toLocaleDateString()}
                      </p>
                      {nc.penalty && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="font-semibold">Penalidade</p>
                          <p>Tipo: {nc.penalty.type}</p>
                          {nc.penalty.amount && <p>Valor: R$ {nc.penalty.amount.toLocaleString()}</p>}
                          {nc.penalty.legalBasis && <p>Base Legal: {nc.penalty.legalBasis}</p>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                <Link href={`/obligations/${obligation.id}/noncompliances/create`}>
                  <Button>Registrar Não Conformidade</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
