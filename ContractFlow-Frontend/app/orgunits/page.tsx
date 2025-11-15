"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import { apiGet, apiDelete } from "@/lib/api-client"
import { OrgUnitDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function OrgUnitsPage() {
  const [orgUnits, setOrgUnits] = useState<OrgUnitDto[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchOrgUnits = async () => {
    try {
      const data = await apiGet<OrgUnitDto[]>('/api/orgunits')
      setOrgUnits(data)
    } catch (error) {
      console.error('Error fetching org units:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar unidades organizacionais",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrgUnits()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return
    
    try {
      await apiDelete(`/api/orgunits/${id}`)
      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso"
      })
      fetchOrgUnits()
    } catch (error) {
      console.error('Error deleting org unit:', error)
      toast({
        title: "Erro",
        description: "Falha ao excluir unidade",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card">
          <div className="p-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground tracking-tight">Unidades Organizacionais</h1>
              <p className="text-muted-foreground mt-1">Gerenciar unidades do sistema</p>
            </div>
            <Button asChild>
              <Link href="/orgunits/create">Nova Unidade</Link>
            </Button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : orgUnits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma unidade cadastrada</div>
          ) : (
            <div className="bg-card border border-border rounded-lg">
              <div className="divide-y divide-border">
                {orgUnits.map((unit) => (
                  <div key={unit.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">{unit.name}</h3>
                        <p className="text-sm text-muted-foreground">Código: {unit.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/orgunits/${unit.id}`}>Ver</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/orgunits/${unit.id}/edit`}>Editar</Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(unit.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
