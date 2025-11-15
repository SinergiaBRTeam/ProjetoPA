"use client"

import { useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Sidebar from "@/components/sidebar"
import { apiPost } from "@/lib/api-client"
import { CreateDeliverableRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function CreateDeliverablePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<CreateDeliverableRequest>({
    expectedDate: '',
    quantity: 0,
    unit: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost(`/api/obligations/${params.id}/deliverables`, formData)
      toast({
        title: "Sucesso",
        description: "Entrega criada com sucesso"
      })
      router.push(`/obligations/${params.id}`)
    } catch (error) {
      console.error('Error creating deliverable:', error)
      toast({
        title: "Erro",
        description: "Falha ao criar entrega",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Nova Entrega</h1>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Informações da Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="expectedDate">Data Esperada</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ex: kg, unidades, horas"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Criar Entrega</Button>
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
