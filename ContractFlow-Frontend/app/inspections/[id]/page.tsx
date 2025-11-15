"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import { apiGet, apiDelete, apiPostFormData } from "@/lib/api-client"
import { API_BASE_URL } from "@/lib/config"
import { InspectionDto, EvidenceDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function InspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [inspection, setInspection] = useState<InspectionDto | null>(null)
  const [evidences, setEvidences] = useState<EvidenceDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inspectionData, evidencesData] = await Promise.all([
          apiGet<InspectionDto>(`/api/inspections/${params.id}`),
          apiGet<EvidenceDto[]>(`/api/inspections/${params.id}/evidences`),
        ])
        setInspection(inspectionData)
        setEvidences(evidencesData)
      } catch (error) {
        console.error('Error fetching inspection:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta inspeção?')) return
    
    try {
      await apiDelete(`/api/inspections/${params.id}`)
      toast({
        title: "Sucesso",
        description: "Inspeção excluída com sucesso"
      })
      router.back()
    } catch (error) {
      console.error('Error deleting inspection:', error)
      toast({
        title: "Erro",
        description: "Falha ao excluir inspeção",
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
      formData.append('notes', 'Evidência da inspeção')

      await apiPostFormData(`/api/inspections/${params.id}/evidences`, formData)
      toast({
        title: "Sucesso",
        description: "Evidência enviada com sucesso"
      })
      // Reload evidences
      const data = await apiGet<EvidenceDto[]>(`/api/inspections/${params.id}/evidences`)
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
  if (!inspection) return <div>Inspeção não encontrada</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Detalhes da Inspeção</h1>
            <div className="flex gap-2">
              <Link href={`/inspections/${inspection.id}/edit`}>
                <Button>Editar</Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete}>
                Excluir
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Inspeção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Inspetor</p>
                  <p className="font-semibold">{inspection.inspector}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-semibold">
                    {new Date(inspection.date).toLocaleDateString()}
                  </p>
                </div>
                {inspection.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="font-semibold">{inspection.notes}</p>
                  </div>
                )}
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
