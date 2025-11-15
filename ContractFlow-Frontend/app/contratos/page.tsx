"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { API_BASE_URL } from "@/lib/config"
import { ContractSimpleDto } from "@/lib/api-types"

export default function ContratosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [allContracts, setAllContracts] = useState<ContractSimpleDto[]>([])
  const [filteredContracts, setFilteredContracts] = useState<ContractSimpleDto[]>([])

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
        const response = await fetch(`${API_BASE_URL}/api/contracts`)
        const data: ContractSimpleDto[] = await response.json()
        setAllContracts(data)
        setFilteredContracts(data)
      } catch (error) {
        console.error("Erro ao buscar contratos:", error)
      }
    }
    fetchContracts()
  }, [])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredContracts(allContracts)
      return
    }
    const lowerSearch = searchTerm.toLowerCase()
    setFilteredContracts(
      allContracts.filter(c => 
        c.officialNumber.toLowerCase().includes(lowerSearch) ||
        c.id.toLowerCase().includes(lowerSearch)
      )
    )
  }, [searchTerm, allContracts])

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
          <div className="bg-card border border-border rounded-lg p-4">
            <Input
              type="text"
              placeholder="Buscar por número oficial ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-card border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Resultados ({filteredContracts.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {filteredContracts.length === 0 ? (
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
