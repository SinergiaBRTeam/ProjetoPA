"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Sidebar from "@/components/sidebar"
import { apiGet, apiPost } from "@/lib/api-client"
import { CreateContractRequest, SupplierDto, OrgUnitDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function CreateContractPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [orgUnits, setOrgUnits] = useState<OrgUnitDto[]>([])
  const [formData, setFormData] = useState<CreateContractRequest>({
    officialNumber: '',
    supplierId: '',
    orgUnitId: '',
    type: 'Servico',
    modality: 'Pregao',
    termStart: '',
    termEnd: '',
    totalAmount: 0,
    currency: 'BRL',
    administrativeProcess: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, orgUnitsData] = await Promise.all([
          apiGet<SupplierDto[]>('/api/suppliers'),
          apiGet<OrgUnitDto[]>('/api/orgunits'),
        ])
        setSuppliers(suppliersData)
        setOrgUnits(orgUnitsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost('/api/contracts', formData)
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso"
      })
      router.push('/contratos')
    } catch (error) {
      console.error('Error creating contract:', error)
      toast({
        title: "Erro",
        description: "Falha ao criar contrato",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Novo Contrato</h1>
          
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Informações do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officialNumber">Número Oficial</Label>
                    <Input
                      id="officialNumber"
                      value={formData.officialNumber}
                      onChange={(e) => setFormData({ ...formData, officialNumber: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="administrativeProcess">Processo Administrativo</Label>
                    <Input
                      id="administrativeProcess"
                      value={formData.administrativeProcess}
                      onChange={(e) => setFormData({ ...formData, administrativeProcess: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierId">Fornecedor</Label>
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.corporateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="orgUnitId">Unidade Organizacional</Label>
                    <Select
                      value={formData.orgUnitId}
                      onValueChange={(value) => setFormData({ ...formData, orgUnitId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {orgUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: CreateContractRequest['type']) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Servico">Serviço</SelectItem>
                        <SelectItem value="Obra">Obra</SelectItem>
                        <SelectItem value="Fornecimento">Fornecimento</SelectItem>
                        <SelectItem value="Locacao">Locação</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="modality">Modalidade</Label>
                    <Select
                      value={formData.modality}
                      onValueChange={(value: CreateContractRequest['modality']) =>
                        setFormData({ ...formData, modality: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pregao">Pregão</SelectItem>
                        <SelectItem value="Concorrencia">Concorrência</SelectItem>
                        <SelectItem value="TomadaPreco">Tomada de Preço</SelectItem>
                        <SelectItem value="Convite">Convite</SelectItem>
                        <SelectItem value="Dispensa">Dispensa</SelectItem>
                        <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                        <SelectItem value="RDC">RDC</SelectItem>
                        <SelectItem value="Credenciamento">Credenciamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="termStart">Data de Início</Label>
                    <Input
                      id="termStart"
                      type="date"
                      value={formData.termStart}
                      onChange={(e) => setFormData({ ...formData, termStart: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="termEnd">Data de Término</Label>
                    <Input
                      id="termEnd"
                      type="date"
                      value={formData.termEnd}
                      onChange={(e) => setFormData({ ...formData, termEnd: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalAmount">Valor Total</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Criar Contrato</Button>
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
