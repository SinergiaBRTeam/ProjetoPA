export interface ContractSimpleDto {
    id: string;
    officialNumber: string;
    status: string;
    isDeleted: boolean;
}

export interface PenaltyDto {
    id: string;
    type: string;
    legalBasis?: string;
    amount?: number;
}

export interface NonComplianceDto {
    id: string;
    reason: string;
    severity: string;
    registeredAt: string; 
    penalty?: PenaltyDto;
}

export interface DeliverableDto {
    id: string;
    expectedDate: string; 
    quantity: number;
    unit: string;
    deliveredAt?: string;
}

export interface ObligationDto {
    id: string;
    clauseRef: string;
    description: string;
    dueDate?: string;
    status: string;
    deliverables: DeliverableDto[];
    nonCompliances: NonComplianceDto[];
}

export interface ContractDetailsDto {
    id: string;
    officialNumber: string;
    administrativeProcess?: string;
    type: string;
    modality: string;
    status: string;
    termStart: string; 
    termEnd: string; 
    totalAmount: number;
    currency: string;
    supplierId: string;
    supplierName: string;
    supplierCnpj: string;
    orgUnitId: string;
    orgUnitName: string;
    orgUnitCode?: string;
    obligations: ObligationDto[];
}

export interface AlertDto {
    id: string;
    message: string;
    contractId?: string;
    deliverableId?: string;
    targetDate: string;
    createdAt: string;
}

export interface AlertDtoEnriched extends AlertDto {
  deliverableName?: string;
  contractNumber?: string;
  obligationDescription?: string;
}

export interface PenaltyReportDto {
    penaltyId: string;
    nonComplianceId: string;
    contractId: string;
    reason: string;
    severity: string;
    registeredAt: string;
    type: string;
    legalBasis?: string;
    amount?: number;
}

export interface AttachmentDto {
    id: string;
    contractId: string;
    fileName: string;
    mimeType: string;
    storagePath: string;
}


export interface SupplierDto {
  id: string;
  corporateName: string;
  cnpj: string;
  active: boolean;
}

export interface CreateSupplierRequest {
  corporateName: string;
  cnpj: string;
  active: boolean;
}

export interface UpdateSupplierRequest {
  corporateName: string;
  cnpj: string;
  active: boolean;
}

export interface OrgUnitDto {
  id: string;
  name: string;
  code: string;
}

export interface CreateOrgUnitRequest {
  name: string;
  code: string;
}

export interface UpdateOrgUnitRequest {
  name: string;
  code: string;
}

export interface CreateContractRequest {
  officialNumber: string;
  supplierId: string;
  orgUnitId: string;
  type: 'Servico' | 'Obra' | 'Fornecimento' | 'Locacao' | 'Outro';
  modality: 'Pregao' | 'Concorrencia' | 'TomadaPreco' | 'Convite' | 'Dispensa' | 'Inexigibilidade' | 'RDC' | 'Credenciamento';
  termStart: string;
  termEnd: string;
  totalAmount: number;
  currency: string;
  administrativeProcess?: string;
}

export interface CreateObligationRequest {
  clauseRef: string;
  description: string;
  dueDate?: string;
  status: string;
}

export interface UpdateObligationRequest {
  clauseRef: string;
  description: string;
  dueDate?: string;
  status: string;
}

export interface CreateDeliverableRequest {
  expectedDate: string;
  quantity: number;
  unit: string;
}

export interface MarkDeliveredRequest {
  deliveredAt: string;
}

export interface CreateInspectionRequest {
  date: string;
  inspector: string;
  notes?: string;
}

export interface UpdateInspectionRequest {
  date: string;
  inspector: string;
  notes?: string;
}

export interface InspectionDto {
  id: string;
  date: string;
  inspector: string;
  notes?: string;
  deliverableId: string;
}

export interface RegisterNonComplianceRequest {
  reason: string;
  severity: string;
}

export interface ApplyPenaltyRequest {
  type: string;
  legalBasis?: string;
  amount?: number;
}

export interface EvidenceDto {
  id: string;
  fileName: string;
  mimeType: string;
  notes?: string;
  uploadedAt: string;
}

export interface DueDeliverableReportDto {
  deliverableId: string;
  contractId: string;
  obligationDescription: string;
  expectedDate: string;
  status: string;
}

export interface ContractStatusReportDto {
  contractId: string;
  officialNumber: string;
  status: string;
  totalObligations: number;
  completedObligations: number;
}

export interface DeliveryBySupplierReportDto {
  supplierId: string;
  supplierName: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
}

export interface DeliveryByOrgUnitReportDto {
  orgUnitId: string;
  orgUnitName: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
}

export interface ContractStatsDto {
  activeContracts: number;
  pendingAction: number;
  overdue: number;
}
