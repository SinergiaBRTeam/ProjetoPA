"use client"

import { useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Sidebar from "@/components/sidebar"
import { apiPost } from "@/lib/api-client"
import { CreateObligationRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function CreateObligationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<CreateObligationRequest>({
    clauseRef: '',
    description: '',
    dueDate: '',
    status: 'Pendente',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost(`/api/contracts/${params.id}/obligations`, formData)
      toast({
        title: "Sucesso",
        description: "Obrigação criada com sucesso"
      })
      router.push(`/contracts/${params.id}`)
    } catch (error) {
      console.error('Error creating obligation:', error)
      toast({
        title: "Erro",
        description: "Falha ao criar obrigação",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Nova Obrigação</h1>
          
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
                  <Button type="submit">Criar Obrigação</Button>
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
