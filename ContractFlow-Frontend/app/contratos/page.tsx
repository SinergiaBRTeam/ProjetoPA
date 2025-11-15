"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Sidebar from "@/components/sidebar"
import { apiGet } from "@/lib/api-client"
import { ContractSimpleDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function ContratosPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const statusParam = searchParams.get('status')
  const [searchTerm, setSearchTerm] = useState("")
  const [allContracts, setAllContracts] = useState<ContractSimpleDto[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filteredContracts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase()
    return allContracts.filter(contract => {
      const matchesSearch = lowerSearch
        ? contract.officialNumber.toLowerCase().includes(lowerSearch) ||
          contract.id.toLowerCase().includes(lowerSearch)
        : true
      const matchesStatus = statusFilter === 'all'
        ? true
        : contract.status.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, allContracts])

  const statusOptions = useMemo(() => {
    const unique = new Set(allContracts.map(contract => contract.status))
    return Array.from(unique).sort((a, b) => a.localeCompare(b))
  }, [allContracts])

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status.toLowerCase()) {
      case "active": return "default"
      case "draft": return "secondary"
      case "terminated":
      case "cancelled":
        return "destructive"
      default: return "secondary"
    }
  }

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiGet<ContractSimpleDto[]>('/api/contracts')
        setAllContracts(data)
      } catch (error) {
        console.error("Erro ao buscar contratos:", error)
        setError("Falha ao carregar contratos")
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de contratos",
          variant: "destructive"
        })
      }
      finally {
        setLoading(false)
      }
    }
    fetchContracts()
  }, [toast])

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam)
    } else {
      setStatusFilter('all')
    }
  }, [statusParam])
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card">
          <div className="p-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground tracking-tight">Contratos</h1>
              <p className="text-muted-foreground mt-1">Pesquise e gerencie contratos cadastrados</p>
            </div>
            <Button asChild>
              <Link href="/contracts/create">Novo Contrato</Link>
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <Input
              type="text"
              placeholder="Buscar por número oficial ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'all' ? 'Exibindo todos os contratos' : `Filtrando por status: ${statusFilter}`}
              </p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Resultados ({filteredContracts.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Carregando contratos...</div>
              ) : error ? (
                <div className="p-8 text-center text-destructive">{error}</div>
              ) : filteredContracts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum contrato encontrado
                </div>
              ) : (
                filteredContracts.map((contract) => (
                  <Link
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    className="block p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{contract.officialNumber}</h3>
                          <Badge variant={getStatusVariant(contract.status)}>
                            {contract.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">ID: {contract.id}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
