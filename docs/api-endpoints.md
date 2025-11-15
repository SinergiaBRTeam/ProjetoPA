# ContractFlow API Endpoints

A visão abaixo consolida todas as rotas expostas pelos controllers MVC no projeto. Todas as rotas retornam JSON por padrão, exceto quando indicado. Datas são serializadas em ISO 8601.

## Contratos

| Método | Rota | Descrição | Parâmetros | Resposta |
| --- | --- | --- | --- | --- |
| POST | `/api/contracts` | Cria um contrato. | Body: `CreateContractRequest`. | 201 Created com `{ id }`. |
| GET | `/api/contracts` | Lista até 20 contratos recentes. | — | 200 OK com lista de objetos `{ id, officialNumber, status, isDeleted }`. |
| GET | `/api/contracts/{id}` | Busca contrato com obrigações, entregas e não-conformidades. | Path: `id` (GUID). | 200 OK com `ContractDetailsDto` ou 404. |

## Obrigações e Entregáveis

| Método | Rota | Descrição | Parâmetros | Resposta |
| --- | --- | --- | --- | --- |
| GET | `/api/contracts/{contractId}/obligations` | Lista obrigações de um contrato. | Path: `contractId` (GUID). | 200 OK com `ObligationSummaryDto[]`. |
| GET | `/api/obligations/{id}` | Busca detalhes completos da obrigação. | Path: `id` (GUID). | 200 OK com `ObligationDto` (inclui entregas e não-conformidades) ou 404. |
| POST | `/api/contracts/{contractId}/obligations` | Cria obrigação em um contrato. | Path: `contractId`; Body: `CreateObligationRequest`. | 201 Created com `{ id }` ou 404. |
| PUT | `/api/obligations/{id}` | Atualiza obrigação. | Path: `id`; Body: `UpdateObligationRequest`. | 204 No Content ou 404. |
| DELETE | `/api/obligations/{id}` | Remove (soft delete) obrigação. | Path: `id`. | 204 No Content ou 404. |
| POST | `/api/obligations/{obligationId}/deliverables` | Cria entrega para obrigação. | Path: `obligationId`; Body: `{ expectedDate, quantity, unit }`. | 201 Created com `{ id }` ou 404. |
| GET | `/api/contracts/{contractId}/deliverables` | Lista entregas de um contrato. | Path: `contractId`. | 200 OK com `DeliverableDto[]`. |
| GET | `/api/deliverables/{deliverableId}` | Busca uma entrega. | Path: `deliverableId`. | 200 OK com `DeliverableDto` ou 404. |
| PUT | `/api/deliverables/{deliverableId}/delivered` | Marca entrega como concluída. | Path: `deliverableId`; Body: `{ deliveredAt }`. | 204 No Content ou 404. |

## Inspeções

| Método | Rota | Descrição | Parâmetros | Resposta |
| --- | --- | --- | --- | --- |
| POST | `/api/deliverables/{deliverableId}/inspections` | Cria inspeção. | Path: `deliverableId`; Body: `CreateInspectionRequest`. | 201 Created com `{ id }` ou 404. |
| GET | `/api/deliverables/{deliverableId}/inspections` | Lista inspeções da entrega. | Path: `deliverableId`. | 200 OK com `InspectionDto[]`. |
| GET | `/api/inspections/{id}` | Busca inspeção. | Path: `id`. | 200 OK com `InspectionDto` ou 404. |
| PUT | `/api/inspections/{id}` | Atualiza inspeção. | Path: `id`; Body: `UpdateInspectionRequest`. | 204 No Content ou 404. |
| DELETE | `/api/inspections/{id}` | Remove (soft delete) inspeção. | Path: `id`. | 204 No Content ou 404. |

## Evidências e Anexos

| Método | Rota | Descrição | Parâmetros | Resposta |
| --- | --- | --- | --- | --- |
| POST | `/api/deliverables/{deliverableId}/evidences` | Faz upload de evidência (form-data). | Path: `deliverableId`; Form: `File`, `notes?`. | 201 Created com `EvidenceDto` ou 404. |
| POST | `/api/inspections/{inspectionId}/evidences` | Upload de evidência para inspeção. | Path: `inspectionId`; Form: `File`, `notes?`. | 201 Created com `EvidenceDto` ou 404. |
| GET | `/api/deliverables/{deliverableId}/evidences` | Lista evidências de uma entrega. | Path: `deliverableId`. | 200 OK com `EvidenceDto[]`. |
| GET | `/api/inspections/{inspectionId}/evidences` | Lista evidências da inspeção. | Path: `inspectionId`. | 200 OK com `EvidenceDto[]`. |
| GET | `/api/evidences/{id}` | Busca metadados de evidência. | Path: `id`. | 200 OK com `EvidenceDto` ou 404. |
| GET | `/api/evidences/{id}/download` | Download do arquivo. | Path: `id`. | 200 OK (arquivo binário) ou 404. |
| DELETE | `/api/evidences/{id}` | Remove evidência. | Path: `id`. | 204 No Content ou 404. |
| POST | `/api/contracts/{contractId}/attachments` | Upload de anexo (form-data). | Path: `contractId`; Form: `File`. | 200 OK com `AttachmentDto` ou 404. |
| GET | `/api/contracts/{contractId}/attachments` | Lista anexos do contrato. | Path: `contractId`. | 200 OK com `AttachmentDto[]`. |
| GET | `/api/attachments/{id}` | Busca metadados de anexo. | Path: `id`. | 200 OK com `AttachmentDto` ou 404. |
| GET | `/api/attachments/{id}/download` | Download de anexo. | Path: `id`. | 200 OK (arquivo binário) ou 404. |
| DELETE | `/api/attachments/{id}` | Remove anexo. | Path: `id`. | 204 No Content ou 404. |

## Não Conformidades e Penalidades

| Método | Rota | Descrição | Parâmetros | Resposta |
| --- | --- | --- | --- | --- |
| POST | `/api/obligations/{obligationId}/noncompliances` | Registra não conformidade. | Path: `obligationId`; Body: `RegisterNonComplianceRequest`. | 201 Created com `{ id }` ou 404. |
| GET | `/api/obligations/{obligationId}/noncompliances` | Lista não conformidades da obrigação. | Path: `obligationId`. | 200 OK com `NonComplianceDto[]`. |
| GET | `/api/noncompliances/{nonComplianceId}` | Busca não conformidade. | Path: `nonComplianceId`. | 200 OK com `NonComplianceDto` ou 404. |
| PUT | `/api/noncompliances/{nonComplianceId}` | Atualiza motivo/severidade. | Path: `nonComplianceId`; Body: `{ reason, severity }`. | 204 No Content ou 404. |
| DELETE | `/api/noncompliances/{nonComplianceId}` | Remove (soft delete) não conformidade. | Path: `nonComplianceId`. | 204 No Content ou 404. |
| POST | `/api/noncompliances/{nonComplianceId}/penalties` | Aplica penalidade. | Path: `nonComplianceId`; Body: `ApplyPenaltyRequest`. | 200 OK com `{ id }`, 400 se já aplicada, 404 se não encontrada. |

## Fornecedores e Unidades Organizacionais

| Método | Rota | Descrição | Parâmetros | Resposta |
| --- | --- | --- | --- | --- |
| GET | `/api/suppliers` | Lista fornecedores. | — | 200 OK com `SupplierDto[]`. |
| GET | `/api/suppliers/{id}` | Busca fornecedor. | Path: `id`. | 200 OK com `SupplierDto` ou 404. |
| POST | `/api/suppliers` | Cria fornecedor. | Body: `CreateSupplierRequest`. | 201 Created com `{ id }`. |
| PUT | `/api/suppliers/{id}` | Atualiza fornecedor. | Path: `id`; Body: `UpdateSupplierRequest`. | 204 No Content ou 404. |
| DELETE | `/api/suppliers/{id}` | Remove (soft delete) fornecedor. | Path: `id`. | 204 No Content ou 404. |
| GET | `/api/orgunits` | Lista unidades. | — | 200 OK com `OrgUnitDto[]`. |
| GET | `/api/orgunits/{id}` | Busca unidade. | Path: `id`. | 200 OK com `OrgUnitDto` ou 404. |
| POST | `/api/orgunits` | Cria unidade. | Body: `CreateOrgUnitRequest`. | 201 Created com `{ id }`. |
| PUT | `/api/orgunits/{id}` | Atualiza unidade. | Path: `id`; Body: `UpdateOrgUnitRequest`. | 204 No Content ou 404. |
| DELETE | `/api/orgunits/{id}` | Remove (soft delete) unidade. | Path: `id`. | 204 No Content ou 404. |

## Relatórios

| Método | Rota | Descrição | Parâmetros | Resposta |
| --- | --- | --- | --- | --- |
| GET | `/api/reports/due-deliverables` | Entregas pendentes/dentro do período. | Query: `from?`, `to?` (datas). | 200 OK com `DueDeliverableDto[]`. |
| GET | `/api/reports/contract-status` | Status detalhado dos contratos. | — | 200 OK com `ContractStatusReportDto[]`. |
| GET | `/api/reports/deliveries-by-supplier` | Entregas agrupadas por fornecedor. | Query: `from?`, `to?`. | 200 OK com `DeliveryBySupplierReportDto[]`. |
| GET | `/api/reports/deliveries-by-orgunit` | Entregas agrupadas por unidade. | Query: `from?`, `to?`. | 200 OK com `DeliveryByOrgUnitReportDto[]`. |
| GET | `/api/reports/penalties` | Penalidades aplicadas. | Query: `from?`, `to?`. | 200 OK com `PenaltyReportDto[]`. |

## Alertas

| Método | Rota | Descrição | Parâmetros | Resposta |
| --- | --- | --- | --- | --- |
| GET | `/api/alerts` | Lista alertas gerados. | Query: `contractId?`, `deliverableId?`. | 200 OK com `Alert[]`. |
| GET | `/api/alerts/test` | Força a geração de alertas. | — | 200 OK com os 50 alertas mais recentes. |
