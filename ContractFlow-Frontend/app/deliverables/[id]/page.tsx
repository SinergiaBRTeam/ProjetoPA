"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Sidebar from "@/components/sidebar"
import { apiGet, apiPut, apiDelete, apiPostFormData } from "@/lib/api-client"
import { DeliverableDto, InspectionDto, EvidenceDto } from "@/lib/api-types"
import { API_BASE_URL } from "@/lib/config"
import { useToast } from "@/hooks/use-toast"

export default function DeliverableDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [deliverable, setDeliverable] = useState<DeliverableDto | null>(null)
  const [inspections, setInspections] = useState<InspectionDto[]>([])
  const [evidences, setEvidences] = useState<EvidenceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [markingDelivered, setMarkingDelivered] = useState(false)
  const [deliveredDate, setDeliveredDate] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deliverableData, inspectionsData, evidencesData] = await Promise.all([
          apiGet<DeliverableDto>(`/api/deliverables/${params.id}`),
          apiGet<InspectionDto[]>(`/api/deliverables/${params.id}/inspections`),
          apiGet<EvidenceDto[]>(`/api/deliverables/${params.id}/evidences`),
        ])
        setDeliverable(deliverableData)
        setInspections(inspectionsData)
        setEvidences(evidencesData)
      } catch (error) {
        console.error('Error fetching deliverable:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  useEffect(() => {
    if (deliverable) {
      const referenceDate = deliverable.deliveredAt || deliverable.expectedDate
      if (referenceDate) {
        setDeliveredDate(referenceDate.split('T')[0])
      }
    }
  }, [deliverable])

  const handleMarkDelivered = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliveredDate) {
      toast({
        title: "Data obrigatória",
        description: "Informe a data da entrega para continuar.",
        variant: "destructive"
      })
      return
    }
    try {
      const isoDate = new Date(`${deliveredDate}T00:00:00`).toISOString()
      await apiPut(`/api/deliverables/${params.id}/delivered`, {
        deliveredAt: isoDate
      })
      toast({
        title: "Sucesso",
        description: "Entrega marcada como concluída"
      })
      setMarkingDelivered(false)
      // Reload data
      const data = await apiGet<DeliverableDto>(`/api/deliverables/${params.id}`)
      setDeliverable(data)
    } catch (error) {
      console.error('Error marking delivered:', error)
      toast({
        title: "Erro",
        description: "Falha ao marcar entrega",
        variant: "destructive"
      })
    }
  }

  const handleUploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('File', file)
      formData.append('notes', 'Evidência da entrega')

      await apiPostFormData(`/api/deliverables/${params.id}/evidences`, formData)
      toast({
        title: "Sucesso",
        description: "Evidência enviada com sucesso"
      })
      // Reload evidences
      const data = await apiGet<EvidenceDto[]>(`/api/deliverables/${params.id}/evidences`)
      setEvidences(data)
    } catch (error) {
      console.error('Error uploading evidence:', error)
      toast({
        title: "Erro",
        description: "Falha ao enviar evidência",
        variant: "destructive"
      })
    }
  }

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta evidência?')) return
    
    try {
      await apiDelete(`/api/evidences/${evidenceId}`)
      toast({
        title: "Sucesso",
        description: "Evidência excluída com sucesso"
      })
      setEvidences(evidences.filter(e => e.id !== evidenceId))
    } catch (error) {
      console.error('Error deleting evidence:', error)
      toast({
        title: "Erro",
        description: "Falha ao excluir evidência",
        variant: "destructive"
      })
    }
  }

  if (loading) return <div>Carregando...</div>
  if (!deliverable) return <div>Entrega não encontrada</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Detalhes da Entrega</h1>
            <div className="flex gap-2">
              <Link href={`/deliverables/${deliverable.id}/inspections/create`}>
                <Button variant="outline">Nova Inspeção</Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Informações da Entrega
                  <Badge variant={deliverable.deliveredAt ? "default" : "secondary"}>
                    {deliverable.deliveredAt ? "Entregue" : "Pendente"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantidade</p>
                    <p className="font-semibold">{deliverable.quantity} {deliverable.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Esperada</p>
                    <p className="font-semibold">
                      {new Date(deliverable.expectedDate).toLocaleDateString()}
                    </p>
                  </div>
                  {deliverable.deliveredAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Entrega</p>
                      <p className="font-semibold text-green-600">
                        {new Date(deliverable.deliveredAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {!deliverable.deliveredAt && !markingDelivered && (
                  <Button onClick={() => setMarkingDelivered(true)}>
                    Marcar como Entregue
                  </Button>
                )}

                {markingDelivered && (
                  <form onSubmit={handleMarkDelivered} className="space-y-4 p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="deliveredDate">Data da Entrega</Label>
                      <Input
                        id="deliveredDate"
                        type="date"
                        value={deliveredDate}
                        onChange={(e) => setDeliveredDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Confirmar</Button>
                      <Button type="button" variant="outline" onClick={() => setMarkingDelivered(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspeções ({inspections.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inspections.map((inspection) => (
                    <div key={inspection.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Inspetor: {inspection.inspector}</p>
                          <p className="text-sm text-muted-foreground">
                            Data: {new Date(inspection.date).toLocaleDateString()}
                          </p>
                          {inspection.notes && (
                            <p className="text-sm mt-2">{inspection.notes}</p>
                          )}
                        </div>
                        <Link href={`/inspections/${inspection.id}`}>
                          <Button variant="outline" size="sm">Ver</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Evidências ({evidences.length})
                  <label htmlFor="evidence-upload">
                    <Button type="button" onClick={() => document.getElementById('evidence-upload')?.click()}>
                      Upload Evidência
                    </Button>
                    <input
                      id="evidence-upload"
                      type="file"
                      className="hidden"
                      onChange={handleUploadEvidence}
                    />
                  </label>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evidences.map((evidence) => (
                    <div key={evidence.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{evidence.fileName}</p>
                        <p className="text-sm text-muted-foreground">{evidence.mimeType}</p>
                        {evidence.notes && (
                          <p className="text-sm mt-1">{evidence.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Enviado em: {new Date(evidence.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${API_BASE_URL}/api/evidences/${evidence.id}/download`, '_blank')}
                        >
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvidence(evidence.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
