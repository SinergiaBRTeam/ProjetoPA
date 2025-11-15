"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Sidebar from "@/components/sidebar"
import { apiPost } from "@/lib/api-client"
import { CreateOrgUnitRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function CreateOrgUnitPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<CreateOrgUnitRequest>({
    name: '',
    code: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost('/api/orgunits', formData)
      toast({
        title: "Sucesso",
        description: "Unidade criada com sucesso"
      })
      router.push('/orgunits')
    } catch (error) {
      console.error('Error creating org unit:', error)
      toast({
        title: "Erro",
        description: "Falha ao criar unidade",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Nova Unidade Organizacional</h1>
          
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
                  <Button type="submit">Criar Unidade</Button>
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
