"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Sidebar from "@/components/sidebar"
import { apiGet, apiPut } from "@/lib/api-client"
import { OrgUnitDto, UpdateOrgUnitRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function EditOrgUnitPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<UpdateOrgUnitRequest>({
    name: '',
    code: '',
  })

  useEffect(() => {
    const fetchOrgUnit = async () => {
      try {
        const data = await apiGet<OrgUnitDto>(`/api/orgunits/${params.id}`)
        setFormData({
          name: data.name,
          code: data.code,
        })
      } catch (error) {
        console.error('Error fetching org unit:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrgUnit()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPut(`/api/orgunits/${params.id}`, formData)
      toast({
        title: "Sucesso",
        description: "Unidade atualizada com sucesso"
      })
      router.push('/orgunits')
    } catch (error) {
      console.error('Error updating org unit:', error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar unidade",
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
          <h1 className="text-4xl font-bold text-primary mb-8">Editar Unidade</h1>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Informações da Unidade</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
