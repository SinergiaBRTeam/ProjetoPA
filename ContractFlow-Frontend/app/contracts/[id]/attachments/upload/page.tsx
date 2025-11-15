"use client"

import { useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Sidebar from "@/components/sidebar"
import { apiPostFormData } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export default function UploadAttachmentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo",
        variant: "destructive"
      })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('File', file)

      await apiPostFormData(`/api/contracts/${params.id}/attachments`, formData)
      toast({
        title: "Sucesso",
        description: "Anexo enviado com sucesso"
      })
      router.push(`/contracts/${params.id}`)
    } catch (error) {
      console.error('Error uploading attachment:', error)
      toast({
        title: "Erro",
        description: "Falha ao enviar anexo",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Upload de Anexo</h1>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Enviar Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Enviando...' : 'Enviar Anexo'}
                  </Button>
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
