"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "@/components/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api-client"
import { ContractSimpleDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function VerTodos() {
  const [contracts, setContracts] = useState<ContractSimpleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiGet<ContractSimpleDto[]>('/api/contracts');
        setContracts(data);
      } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        setError('Não foi possível carregar os contratos')
        toast({
          title: "Erro",
          description: "Falha ao carregar os contratos. Tente novamente em instantes.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    };

    fetchContracts();
  }, [toast]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Todos os Contratos</h1>
            <p className="text-muted-foreground">Lista completa de contratos cadastrados</p>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando contratos...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-foreground">Contratos ({contracts.length})</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Voltar ao Dashboard</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Link key={contract.id} href={`/contracts/${contract.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={contract.isDeleted ? "destructive" : "default"}>
                                {contract.status}
                              </Badge>
                              <span className="font-semibold">{contract.officialNumber}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">ID: {contract.id}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
