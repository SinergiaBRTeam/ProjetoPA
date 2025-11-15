"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from "@/components/sidebar"
import { apiGet, apiDelete } from "@/lib/api-client"
import { ContractDetailsDto, AttachmentDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [contract, setContract] = useState<ContractDetailsDto | null>(null)
  const [attachments, setAttachments] = useState<AttachmentDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contractData, attachmentsData] = await Promise.all([
          apiGet<ContractDetailsDto>(`/api/contracts/${params.id}`),
          apiGet<AttachmentDto[]>(`/api/contracts/${params.id}/attachments`),
        ])
        setContract(contractData)
        setAttachments(attachmentsData)
      } catch (error) {
        console.error('Error fetching contract:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este anexo?')) return
    
    try {
      await apiDelete(`/api/attachments/${attachmentId}`)
      toast({
        title: "Sucesso",
        description: "Anexo excluído com sucesso"
      })
      setAttachments(attachments.filter(a => a.id !== attachmentId))
    } catch (error) {
      console.error('Error deleting attachment:', error)
      toast({
        title: "Erro",
        description: "Falha ao excluir anexo",
        variant: "destructive"
      })
    }
  }

  if (loading) return <div>Carregando...</div>
  if (!contract) return <div>Contrato não encontrado</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Contrato {contract.officialNumber}</h1>
            <div className="flex gap-2">
              <Link href={`/contracts/${contract.id}/obligations/create`}>
                <Button>Nova Obrigação</Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="obligations">Obrigações</TabsTrigger>
              <TabsTrigger value="attachments">Anexos</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Informações do Contrato
                    <Badge>{contract.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número Oficial</p>
                    <p className="font-semibold">{contract.officialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processo Administrativo</p>
                    <p className="font-semibold">{contract.administrativeProcess || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-semibold">{contract.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modalidade</p>
                    <p className="font-semibold">{contract.modality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fornecedor</p>
                    <p className="font-semibold">{contract.supplierName}</p>
                    <p className="text-xs text-muted-foreground">{contract.supplierCnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unidade Organizacional</p>
                    <p className="font-semibold">{contract.orgUnitName}</p>
                    <p className="text-xs text-muted-foreground">{contract.orgUnitCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Início</p>
                    <p className="font-semibold">{new Date(contract.termStart).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Término</p>
                    <p className="font-semibold">{new Date(contract.termEnd).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="font-semibold">{contract.currency} {contract.totalAmount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="obligations">
              <div className="space-y-4">
                {contract.obligations.map((obligation) => (
                  <Card key={obligation.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span className="text-lg">{obligation.clauseRef}</span>
                        <Badge>{obligation.status}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{obligation.description}</p>
                      <div className="flex gap-2">
                        <Link href={`/obligations/${obligation.id}`}>
                          <Button variant="outline">Ver Detalhes</Button>
                        </Link>
                        <Link href={`/obligations/${obligation.id}/deliverables/create`}>
                          <Button variant="outline">Adicionar Entrega</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attachments">
              <div className="space-y-4">
                {attachments.map((attachment) => (
                  <Card key={attachment.id}>
                    <CardContent className="flex justify-between items-center p-4">
                      <div>
                        <p className="font-semibold">{attachment.fileName}</p>
                        <p className="text-sm text-muted-foreground">{attachment.mimeType}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => window.open(`${API_BASE_URL}/api/attachments/${attachment.id}/download`, '_blank')}
                        >
                          Download
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleDeleteAttachment(attachment.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
