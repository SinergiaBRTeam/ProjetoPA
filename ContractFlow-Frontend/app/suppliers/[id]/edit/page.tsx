"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Sidebar from "@/components/sidebar"
import { apiGet, apiPut } from "@/lib/api-client"
import { SupplierDto, UpdateSupplierRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function EditSupplierPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<UpdateSupplierRequest>({
    corporateName: '',
    cnpj: '',
    active: true,
  })

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await apiGet<SupplierDto>(`/api/suppliers/${params.id}`)
        setFormData({
          corporateName: data.corporateName,
          cnpj: data.cnpj,
          active: data.active,
        })
      } catch (error) {
        console.error('Error fetching supplier:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSupplier()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPut(`/api/suppliers/${params.id}`, formData)
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso"
      })
      router.push('/suppliers')
    } catch (error) {
      console.error('Error updating supplier:', error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar fornecedor",
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
          <h1 className="text-4xl font-bold text-primary mb-8">Editar Fornecedor</h1>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Informações do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="corporateName">Razão Social</Label>
                  <Input
                    id="corporateName"
                    value={formData.corporateName}
                    onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">Ativo</Label>
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
