using System;
using System.Linq;
using ContractsMvc.Data;
using ContractsMvc.Models;
using ContractsMvc.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ContractsMvc.Services;

/// <summary>
/// Provides business operations for contracts, obligations, deliverables,
/// non-compliances and reports. By isolating these operations in a
/// service class we keep the controllers thin and encapsulate the domain
/// logic in one place. The service uses the EF Core DbContext directly
/// without relying on repository abstractions to reduce complexity.
/// </summary>
public class ContractService
{
    private readonly ContractsDbContext _db;

    public ContractService(ContractsDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> CreateContractAsync(CreateContractRequest request, CancellationToken ct)
    {
        var supplier = await _db.Suppliers.FirstOrDefaultAsync(s => s.Id == request.SupplierId, ct);
        if (supplier is null) throw new ArgumentException("Supplier not found");

        var orgUnit = await _db.OrgUnits.FirstOrDefaultAsync(o => o.Id == request.OrgUnitId, ct);
        if (orgUnit is null) throw new ArgumentException("OrgUnit not found");

        var contract = new Contract
        {
            OfficialNumber = request.OfficialNumber,
            AdministrativeProcess = request.AdministrativeProcess,
            SupplierId = request.SupplierId,
            Supplier = supplier,
            OrgUnitId = request.OrgUnitId,
            OrgUnit = orgUnit,
            Type = request.Type,
            Modality = request.Modality,
            Status = ContractStatus.Active,
            Term = new Period(request.TermStart, request.TermEnd),
            TotalValue = new Money(request.TotalAmount, request.Currency)
        };

        _db.Contracts.Add(contract);
        await _db.SaveChangesAsync(ct);
        return contract.Id;
    }

    public async Task<ContractDetailsDto?> GetContractByIdAsync(Guid id, CancellationToken ct)
    {
        var contract = await _db.Contracts
            .AsNoTracking()
            .Include(c => c.Supplier)
            .Include(c => c.OrgUnit)
            .Include(c => c.Obligations)
                .ThenInclude(o => o.Deliverables)
            .Include(c => c.Obligations)
                .ThenInclude(o => o.NonCompliances)
                    .ThenInclude(nc => nc.Penalty)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (contract is null) return null;

        var dto = new ContractDetailsDto
        {
            Id = contract.Id,
            OfficialNumber = contract.OfficialNumber,
            AdministrativeProcess = contract.AdministrativeProcess,
            Type = contract.Type.ToString(),
            Modality = contract.Modality.ToString(),
            Status = contract.Status.ToString(),
            TermStart = contract.Term.Start,
            TermEnd = contract.Term.End,
            TotalAmount = contract.TotalValue.Amount,
            Currency = contract.TotalValue.Currency,
            SupplierId = contract.SupplierId,
            SupplierName = contract.Supplier.CorporateName,
            SupplierCnpj = contract.Supplier.Cnpj,
            OrgUnitId = contract.OrgUnitId,
            OrgUnitName = contract.OrgUnit.Name,
            OrgUnitCode = contract.OrgUnit.Code
        };

        foreach (var o in contract.Obligations)
        {
            var oDto = new ObligationDto
            {
                Id = o.Id,
                ClauseRef = o.ClauseRef,
                Description = o.Description,
                DueDate = o.DueDate,
                Status = o.Status
            };

            foreach (var d in o.Deliverables)
            {
                oDto.Deliverables.Add(new DeliverableDto
                {
                    Id = d.Id,
                    ExpectedDate = d.ExpectedDate,
                    Quantity = d.Quantity,
                    Unit = d.Unit,
                    DeliveredAt = d.DeliveredAt
                });
            }

            foreach (var nc in o.NonCompliances)
            {
                var ncDto = new NonComplianceDto
                {
                    Id = nc.Id,
                    Reason = nc.Reason,
                    Severity = nc.Severity,
                    RegisteredAt = nc.RegisteredAt
                };

                if (nc.Penalty != null)
                {
                    ncDto.Penalty = new PenaltyDto
                    {
                        Id = nc.Penalty.Id,
                        Type = nc.Penalty.Type,
                        LegalBasis = nc.Penalty.LegalBasis,
                        Amount = nc.Penalty.Amount
                    };
                }

                oDto.NonCompliances.Add(ncDto);
            }

            dto.Obligations.Add(oDto);
        }

        return dto;
    }

    public async Task<Deliverable?> AddDeliverableAsync(Guid obligationId, DateTime expectedDate, decimal quantity, string unit, CancellationToken ct)
    {
        var obligation = await _db.Obligations
            .Include(o => o.Deliverables)
            .FirstOrDefaultAsync(o => o.Id == obligationId, ct);

        if (obligation is null) return null;

        var deliverable = new Deliverable
        {
            ObligationId = obligation.Id,
            Obligation = obligation,
            ExpectedDate = expectedDate,
            Quantity = quantity,
            Unit = unit
        };

        obligation.Deliverables.Add(deliverable);
        await _db.SaveChangesAsync(ct);
        return deliverable;
    }

    public async Task<Deliverable?> MarkDeliverableDeliveredAsync(Guid deliverableId, DateTime deliveredAt, CancellationToken ct)
    {
        var deliverable = await _db.Deliverables.FirstOrDefaultAsync(d => d.Id == deliverableId, ct);
        if (deliverable is null) return null;
        deliverable.DeliveredAt = deliveredAt;
        await _db.SaveChangesAsync(ct);
        return deliverable;
    }

    public async Task<NonCompliance?> RegisterNonComplianceAsync(Guid obligationId, string reason, string severity, CancellationToken ct)
    {
        var obligation = await _db.Obligations
            .Include(o => o.NonCompliances)
            .FirstOrDefaultAsync(o => o.Id == obligationId, ct);

        if (obligation is null) return null;

        var nc = new NonCompliance
        {
            ObligationId = obligation.Id,
            Obligation = obligation,
            Reason = reason,
            Severity = severity,
            RegisteredAt = DateTime.UtcNow
        };

        obligation.NonCompliances.Add(nc);
        await _db.SaveChangesAsync(ct);
        return nc;
    }

    private static NonComplianceDto MapNonComplianceDto(NonCompliance nc)
    {
        var dto = new NonComplianceDto
        {
            Id = nc.Id,
            Reason = nc.Reason,
            Severity = nc.Severity,
            RegisteredAt = nc.RegisteredAt
        };

        if (nc.Penalty != null)
        {
            dto.Penalty = new PenaltyDto
            {
                Id = nc.Penalty.Id,
                Type = nc.Penalty.Type,
                LegalBasis = nc.Penalty.LegalBasis,
                Amount = nc.Penalty.Amount
            };
        }

        return dto;
    }

    public async Task<Penalty?> ApplyPenaltyAsync(Guid nonComplianceId, string type, string? legalBasis, decimal? amount, CancellationToken ct)
    {
        var nc = await _db.NonCompliances
            .Include(x => x.Penalty)
            .FirstOrDefaultAsync(x => x.Id == nonComplianceId, ct);

        if (nc is null) return null;
        if (nc.Penalty != null) throw new InvalidOperationException("Penalty already applied.");

        var penalty = new Penalty
        {
            NonComplianceId = nc.Id,
            NonCompliance = nc,
            Type = type,
            LegalBasis = legalBasis,
            Amount = amount
        };

        nc.Penalty = penalty;
        _db.Penalties.Add(penalty);
        await _db.SaveChangesAsync(ct);
        return penalty;
    }

    public async Task<List<NonComplianceDto>> GetNonCompliancesForObligationAsync(Guid obligationId, CancellationToken ct)
    {
        var list = await _db.NonCompliances
            .AsNoTracking()
            .Where(nc => nc.ObligationId == obligationId)
            .Include(nc => nc.Penalty)
            .OrderByDescending(nc => nc.RegisteredAt)
            .ToListAsync(ct);

        return list.Select(MapNonComplianceDto).ToList();
    }

    public async Task<NonComplianceDto?> GetNonComplianceByIdAsync(Guid id, CancellationToken ct)
    {
        var nc = await _db.NonCompliances
            .AsNoTracking()
            .Include(x => x.Penalty)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return nc == null ? null : MapNonComplianceDto(nc);
    }

    public async Task<bool> UpdateNonComplianceAsync(Guid id, string reason, string severity, CancellationToken ct)
    {
        var nc = await _db.NonCompliances.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (nc == null) return false;

        nc.Reason = reason;
        nc.Severity = severity;
        nc.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteNonComplianceAsync(Guid id, CancellationToken ct)
    {
        var nc = await _db.NonCompliances.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (nc == null) return false;

        nc.IsDeleted = true;
        nc.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<List<DueDeliverableDto>> GetDueDeliverablesAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        return await _db.Deliverables
            .AsNoTracking()
            .Where(d => d.DeliveredAt == null && d.ExpectedDate <= now)
            .Select(d => new DueDeliverableDto
            {
                DeliverableId = d.Id,
                ExpectedDate = d.ExpectedDate,
                Quantity = d.Quantity,
                Unit = d.Unit,
                ObligationId = d.ObligationId,
                ContractId = d.Obligation.ContractId,
                ContractNumber = d.Obligation.Contract.OfficialNumber,
                ObligationDescription = d.Obligation.Description,
                Status = d.ExpectedDate < now ? "Atrasado" : "Pendente"
            })
            .OrderBy(r => r.ExpectedDate)
            .ToListAsync(ct);
    }

    public async Task<List<ContractStatusReportDto>> GetContractStatusSummaryAsync(CancellationToken ct)
    {
        var contracts = await _db.Contracts
            .AsNoTracking()
            .Include(c => c.Obligations)
                .ThenInclude(o => o.Deliverables)
            .ToListAsync(ct);

        return contracts
            .Select(c =>
            {
                var obligations = c.Obligations.Where(o => !o.IsDeleted).ToList();
                var completed = obligations.Count(o =>
                    string.Equals(o.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
                    (o.Deliverables.Any() && o.Deliverables.All(d => d.DeliveredAt != null)));

                return new ContractStatusReportDto
                {
                    ContractId = c.Id,
                    OfficialNumber = c.OfficialNumber,
                    Status = c.Status.ToString(),
                    TotalObligations = obligations.Count,
                    CompletedObligations = completed
                };
            })
            .OrderBy(c => c.OfficialNumber)
            .ToList();
    }

    public async Task<List<DueDeliverableDto>> GetDueDeliverablesAsync(DateTime? from, DateTime? to, CancellationToken ct)
    {
        var query = _db.Deliverables.AsNoTracking().Where(d => d.DeliveredAt == null);

        if (from.HasValue)
            query = query.Where(d => d.ExpectedDate >= from.Value);
        if (to.HasValue)
            query = query.Where(d => d.ExpectedDate <= to.Value);

        var now = DateTime.UtcNow;

        return await query
            .Select(d => new DueDeliverableDto
            {
                DeliverableId = d.Id,
                ExpectedDate = d.ExpectedDate,
                Quantity = d.Quantity,
                Unit = d.Unit,
                ObligationId = d.ObligationId,
                ContractId = d.Obligation.ContractId,
                ContractNumber = d.Obligation.Contract.OfficialNumber,
                ObligationDescription = d.Obligation.Description,
                Status = d.ExpectedDate < now ? "Atrasado" : "Pendente"
            })
            .OrderBy(d => d.ExpectedDate)
            .ToListAsync(ct);
    }

    public async Task<List<DeliveryBySupplierReportDto>> GetDeliveriesBySupplierAsync(DateTime? from, DateTime? to, CancellationToken ct)
    {
        var deliverables = _db.Deliverables
            .AsNoTracking()
            .Include(d => d.Obligation)
                .ThenInclude(o => o.Contract)
                    .ThenInclude(c => c.Supplier)
            .AsQueryable();

        if (from.HasValue)
            deliverables = deliverables.Where(d => d.ExpectedDate >= from.Value);
        if (to.HasValue)
            deliverables = deliverables.Where(d => d.ExpectedDate <= to.Value);

        var now = DateTime.UtcNow;

        return await deliverables
            .GroupBy(d => d.Obligation.Contract.Supplier)
            .Select(g => new DeliveryBySupplierReportDto
            {
                SupplierId = g.Key.Id,
                SupplierName = g.Key.CorporateName,
                TotalDeliveries = g.Count(),
                OnTimeDeliveries = g.Count(x => x.DeliveredAt != null && x.DeliveredAt <= x.ExpectedDate),
                LateDeliveries = g.Count(x =>
                    (x.DeliveredAt != null && x.DeliveredAt > x.ExpectedDate) ||
                    (x.DeliveredAt == null && x.ExpectedDate < now))
            })
            .OrderBy(r => r.SupplierName)
            .ToListAsync(ct);
    }

    public async Task<List<DeliveryByOrgUnitReportDto>> GetDeliveriesByOrgUnitAsync(DateTime? from, DateTime? to, CancellationToken ct)
    {
        var deliverables = _db.Deliverables
            .AsNoTracking()
            .Include(d => d.Obligation)
                .ThenInclude(o => o.Contract)
                    .ThenInclude(c => c.OrgUnit)
            .AsQueryable();

        if (from.HasValue)
            deliverables = deliverables.Where(d => d.ExpectedDate >= from.Value);
        if (to.HasValue)
            deliverables = deliverables.Where(d => d.ExpectedDate <= to.Value);

        var now = DateTime.UtcNow;

        return await deliverables
            .GroupBy(d => d.Obligation.Contract.OrgUnit)
            .Select(g => new DeliveryByOrgUnitReportDto
            {
                OrgUnitId = g.Key.Id,
                OrgUnitName = g.Key.Name,
                TotalDeliveries = g.Count(),
                OnTimeDeliveries = g.Count(x => x.DeliveredAt != null && x.DeliveredAt <= x.ExpectedDate),
                LateDeliveries = g.Count(x =>
                    (x.DeliveredAt != null && x.DeliveredAt > x.ExpectedDate) ||
                    (x.DeliveredAt == null && x.ExpectedDate < now))
            })
            .OrderBy(r => r.OrgUnitName)
            .ToListAsync(ct);
    }

    public async Task<List<PenaltyReportDto>> GetPenaltiesAsync(DateTime? from, DateTime? to, CancellationToken ct)
    {
        var query = _db.Penalties.AsNoTracking()
            .Include(p => p.NonCompliance)
                .ThenInclude(nc => nc.Obligation)
                    .ThenInclude(o => o.Contract)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(p => p.NonCompliance.RegisteredAt >= from.Value);
        if (to.HasValue)
            query = query.Where(p => p.NonCompliance.RegisteredAt <= to.Value);

        return await query
            .Select(p => new PenaltyReportDto
            {
                PenaltyId = p.Id,
                NonComplianceId = p.NonComplianceId,
                ContractId = p.NonCompliance.Obligation.ContractId,
                Reason = p.NonCompliance.Reason,
                Severity = p.NonCompliance.Severity,
                RegisteredAt = p.NonCompliance.RegisteredAt,
                Type = p.Type,
                LegalBasis = p.LegalBasis,
                Amount = p.Amount
            })
            .OrderByDescending(r => r.RegisteredAt)
            .ToListAsync(ct);
    }

    public async Task<DeliverableDto?> GetDeliverableByIdAsync(Guid deliverableId, CancellationToken ct)
    {
        var d = await _db.Deliverables.AsNoTracking().FirstOrDefaultAsync(x => x.Id == deliverableId, ct);
        if (d is null) return null;

        return new DeliverableDto
        {
            Id = d.Id,
            ExpectedDate = d.ExpectedDate,
            Quantity = d.Quantity,
            Unit = d.Unit,
            DeliveredAt = d.DeliveredAt
        };
    }

    public async Task<List<DeliverableDto>> GetDeliverablesForContractAsync(Guid contractId, CancellationToken ct)
    {
        return await _db.Deliverables
            .AsNoTracking()
            .Where(d => d.Obligation.ContractId == contractId)
            .Select(d => new DeliverableDto
            {
                Id = d.Id,
                ExpectedDate = d.ExpectedDate,
                Quantity = d.Quantity,
                Unit = d.Unit,
                DeliveredAt = d.DeliveredAt
            })
            .ToListAsync(ct);
    }
}
