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
import { CreateInspectionRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function CreateInspectionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<CreateInspectionRequest>({
    date: '',
    inspector: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost(`/api/deliverables/${params.id}/inspections`, formData)
      toast({
        title: "Sucesso",
        description: "Inspeção criada com sucesso"
      })
      router.push(`/deliverables/${params.id}`)
    } catch (error) {
      console.error('Error creating inspection:', error)
      toast({
        title: "Erro",
        description: "Falha ao criar inspeção",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Nova Inspeção</h1>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Informações da Inspeção</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date">Data da Inspeção</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="inspector">Inspetor</Label>
                  <Input
                    id="inspector"
                    value={formData.inspector}
                    onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Criar Inspeção</Button>
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
