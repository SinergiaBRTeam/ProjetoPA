"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { apiGet, apiDelete } from "@/lib/api-client"
import { SupplierDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSuppliers = async () => {
    try {
      const data = await apiGet<SupplierDto[]>('/api/suppliers')
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar fornecedores",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return
    
    try {
      await apiDelete(`/api/suppliers/${id}`)
      toast({
        title: "Sucesso",
        description: "Fornecedor excluído com sucesso"
      })
      fetchSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast({
        title: "Erro",
        description: "Falha ao excluir fornecedor",
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
              <h1 className="text-3xl font-semibold text-foreground tracking-tight">Fornecedores</h1>
              <p className="text-muted-foreground mt-1">Gerenciar fornecedores do sistema</p>
            </div>
            <Button asChild>
              <Link href="/suppliers/create">Novo Fornecedor</Link>
            </Button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum fornecedor cadastrado</div>
          ) : (
            <div className="bg-card border border-border rounded-lg">
              <div className="divide-y divide-border">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{supplier.corporateName}</h3>
                          <Badge variant={supplier.active ? "default" : "secondary"}>
                            {supplier.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">CNPJ: {supplier.cnpj}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/suppliers/${supplier.id}`}>Ver</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/suppliers/${supplier.id}/edit`}>Editar</Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(supplier.id)}
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
