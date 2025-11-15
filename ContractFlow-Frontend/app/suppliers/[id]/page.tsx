"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { apiGet } from "@/lib/api-client"
import { SupplierDto } from "@/lib/api-types"

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<SupplierDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await apiGet<SupplierDto>(`/api/suppliers/${params.id}`)
        setSupplier(data)
      } catch (error) {
        console.error('Error fetching supplier:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSupplier()
  }, [params.id])

  if (loading) return <div>Carregando...</div>
  if (!supplier) return <div>Fornecedor não encontrado</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Detalhes do Fornecedor</h1>
            <div className="flex gap-2">
              <Link href={`/suppliers/${supplier.id}/edit`}>
                <Button>Editar</Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {supplier.corporateName}
                <Badge variant={supplier.active ? "default" : "secondary"}>
                  {supplier.active ? "Ativo" : "Inativo"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="text-lg font-semibold">{supplier.cnpj}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="text-sm font-mono">{supplier.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
