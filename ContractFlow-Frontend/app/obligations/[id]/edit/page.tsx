"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Sidebar from "@/components/sidebar"
import { apiGet, apiPut } from "@/lib/api-client"
import { ObligationDto, UpdateObligationRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function EditObligationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<UpdateObligationRequest>({
    clauseRef: '',
    description: '',
    dueDate: '',
    status: '',
  })

  useEffect(() => {
    const fetchObligation = async () => {
      try {
        const data = await apiGet<ObligationDto>(`/api/obligations/${params.id}`)
        setFormData({
          clauseRef: data.clauseRef,
          description: data.description,
          dueDate: data.dueDate || '',
          status: data.status,
        })
      } catch (error) {
        console.error('Error fetching obligation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchObligation()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPut(`/api/obligations/${params.id}`, formData)
      toast({
        title: "Sucesso",
        description: "Obrigação atualizada com sucesso"
      })
      router.push(`/obligations/${params.id}`)
    } catch (error) {
      console.error('Error updating obligation:', error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar obrigação",
        variant: "destructive"
      })
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Editar Obrigação</h1>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Informações da Obrigação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="clauseRef">Referência da Cláusula</Label>
                  <Input
                    id="clauseRef"
                    value={formData.clauseRef}
                    onChange={(e) => setFormData({ ...formData, clauseRef: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Salvar Alterações</Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
