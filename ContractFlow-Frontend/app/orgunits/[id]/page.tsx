"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import { apiGet } from "@/lib/api-client"
import { OrgUnitDto } from "@/lib/api-types"

export default function OrgUnitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [orgUnit, setOrgUnit] = useState<OrgUnitDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrgUnit = async () => {
      try {
        const data = await apiGet<OrgUnitDto>(`/api/orgunits/${params.id}`)
        setOrgUnit(data)
      } catch (error) {
        console.error('Error fetching org unit:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrgUnit()
  }, [params.id])

  if (loading) return <div>Carregando...</div>
  if (!orgUnit) return <div>Unidade não encontrada</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Detalhes da Unidade</h1>
            <div className="flex gap-2">
              <Link href={`/orgunits/${orgUnit.id}/edit`}>
                <Button>Editar</Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{orgUnit.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="text-lg font-semibold">{orgUnit.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="text-sm font-mono">{orgUnit.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
