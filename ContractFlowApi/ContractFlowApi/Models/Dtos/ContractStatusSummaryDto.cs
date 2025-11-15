using System;

namespace ContractsMvc.Models.Dtos;

/// <summary>
/// Detailed contract status report used by the reports endpoint. Each
/// contract is returned with the number of obligations and how many of them
/// are already completed. This mirrors the information consumed by the
/// frontend dashboards.
/// </summary>
public class ContractStatusReportDto
{
    public Guid ContractId { get; set; }
    public string OfficialNumber { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int TotalObligations { get; set; }
    public int CompletedObligations { get; set; }
}
