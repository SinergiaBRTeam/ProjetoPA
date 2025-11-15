"use client"

import Sidebar from "@/components/sidebar"
import { Upload, FileText, CheckCircle, Download } from "lucide-react"
import { useState, useEffect, ChangeEvent, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { apiGet, apiPostFormData } from "@/lib/api-client"
import { API_BASE_URL } from "@/lib/config"
import { ContractSimpleDto, AttachmentDto } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

export default function CadastrarDocsPage() {
  const [uploadedFiles, setUploadedFiles] = useState<AttachmentDto[]>([])
  const [contracts, setContracts] = useState<ContractSimpleDto[]>([])
  const [selectedContractId, setSelectedContractId] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [loadingContracts, setLoadingContracts] = useState(true)
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const loadContracts = useCallback(async () => {
    try {
      setLoadingContracts(true)
      const data = await apiGet<ContractSimpleDto[]>('/api/contracts')
      setContracts(data)
      if (data.length > 0) {
        setSelectedContractId((current) => current || data[0].id)
      }
    } catch (error) {
      console.error("Erro ao buscar contratos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contratos disponíveis.",
        variant: "destructive"
      })
    } finally {
      setLoadingContracts(false)
    }
  }, [toast])

  const loadAttachments = useCallback(async (contractId: string) => {
    if (!contractId) {
      setUploadedFiles([])
      return
    }

    try {
      setLoadingAttachments(true)
      const data = await apiGet<AttachmentDto[]>(`/api/contracts/${contractId}/attachments`)
      setUploadedFiles(data)
    } catch (error) {
      console.error("Erro ao buscar anexos:", error)
      setUploadedFiles([])
      toast({
        title: "Erro",
        description: "Não foi possível carregar os anexos do contrato selecionado.",
        variant: "destructive"
      })
    } finally {
      setLoadingAttachments(false)
    }
  }, [toast])

  useEffect(() => {
    loadContracts()
  }, [loadContracts])

  useEffect(() => {
    if (selectedContractId) {
      loadAttachments(selectedContractId)
    }
  }, [selectedContractId, loadAttachments])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedContractId) {
      toast({
        title: "Arquivo obrigatório",
        description: "Selecione um contrato e escolha um arquivo para enviar.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('File', selectedFile)

    try {
      await apiPostFormData(`/api/contracts/${selectedContractId}/attachments`, formData)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast({
        title: "Upload realizado",
        description: "Documento enviado com sucesso."
      })
      loadAttachments(selectedContractId)
    } catch (error) {
      console.error("Erro no upload:", error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o documento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Cadastrar Documentos</h1>
            <p className="text-muted-foreground">Faça upload de contratos e documentos relacionados</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-8 border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
                <div className="flex flex-col items-center justify-center py-12">
                  <Upload size={48} className="text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {selectedFile ? selectedFile.name : "Arraste arquivos aqui"}
                  </h3>
                  <p className="text-muted-foreground mb-4">ou clique para selecionar</p>
                  <label className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 cursor-pointer">
                    Selecionar Arquivo
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                  <p className="text-xs text-muted-foreground mt-4">Tamanho máx: 20MB (definido no backend)</p>
                </div>
              </div>

              {/* Document Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Informações do Documento</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Contrato Relacionado</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={selectedContractId}
                      onChange={(e) => setSelectedContractId(e.target.value)}
                      disabled={loadingContracts || contracts.length === 0}
                    >
                      {loadingContracts ? (
                        <option>Carregando contratos...</option>
                      ) : contracts.length === 0 ? (
                        <option>Nenhum contrato disponível</option>
                      ) : (
                        contracts.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.officialNumber} (Status: {c.status})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Estes campos não existem no DTO de Attachment, então são ignorados no submit */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tipo de Documento (Apenas UI)</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Anexo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Observações (Apenas UI)</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                      placeholder="Backend não armazena observações para Anexos..."
                      readOnly
                    />
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={handleUploadSubmit}
                    disabled={isUploading || !selectedFile || !selectedContractId}
                  >
                    {isUploading ? "Enviando..." : "Enviar Documento"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Uploads Recentes (Contrato Selecionado)</h3>
              <div className="space-y-3">
                {loadingAttachments ? (
                  <p className="text-sm text-muted-foreground">Carregando anexos...</p>
                ) : uploadedFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum anexo encontrado.</p>
                ) : (
                  uploadedFiles.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <FileText size={20} className="text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">{file.mimeType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`${API_BASE_URL}/api/attachments/${file.id}/download`, '_blank')}
                            title="Baixar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
