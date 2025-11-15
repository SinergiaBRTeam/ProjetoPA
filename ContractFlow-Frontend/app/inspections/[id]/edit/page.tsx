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
import { InspectionDto, UpdateInspectionRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function EditInspectionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<UpdateInspectionRequest>({
    date: '',
    inspector: '',
    notes: '',
  })

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const data = await apiGet<InspectionDto>(`/api/inspections/${params.id}`)
        setFormData({
          date: data.date,
          inspector: data.inspector,
          notes: data.notes || '',
        })
      } catch (error) {
        console.error('Error fetching inspection:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInspection()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPut(`/api/inspections/${params.id}`, formData)
      toast({
        title: "Sucesso",
        description: "Inspeção atualizada com sucesso"
      })
      router.push(`/inspections/${params.id}`)
    } catch (error) {
      console.error('Error updating inspection:', error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar inspeção",
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
          <h1 className="text-4xl font-bold text-primary mb-8">Editar Inspeção</h1>
          
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
