import React, { useMemo, useState } from "react";

const initialRequests = [
  {
    id: 1,
    employee: "Loveness Ngwenya",
    department: "Technology",
    type: "Annual Leave",
    startDate: "2026-08-28",
    endDate: "2026-09-02",
    days: 4,
    reason: "Family commitments",
    status: "Pending",
    submitted: "2026-08-20",
  },
  {
    id: 2,
    employee: "Malabela Excellent",
    department: "Technology",
    type: "Sick Leave",
    startDate: "2026-08-24",
    endDate: "2026-08-25",
    days: 2,
    reason: "Medical appointment and recovery",
    status: "Approved",
    submitted: "2026-08-23",
  },
  {
    id: 3,
    employee: "Kgahliso Matlala",
    department: "Communications",
    type: "Annual Leave",
    startDate: "2026-09-10",
    endDate: "2026-09-14",
    days: 3,
    reason: "Personal vacation",
    status: "Pending",
    submitted: "2026-08-22",
  },
  {
    id: 4,
    employee: "Thabo Mokoena",
    department: "Human Resources",
    type: "Family Responsibility",
    startDate: "2026-08-18",
    endDate: "2026-08-18",
    days: 1,
    reason: "Family responsibility",
    status: "Rejected",
    submitted: "2026-08-15",
  },
  {
    id: 5,
    employee: "Sarah Molefe",
    department: "Finance",
    type: "Annual Leave",
    startDate: "2026-09-21",
    endDate: "2026-09-25",
    days: 5,
    reason: "Rest and personal time",
    status: "Approved",
    submitted: "2026-08-12",
  },
];

const employees = [
  {
    name: "Loveness Ngwenya",
    department: "Technology",
    annual: 15,
    used: 6,
    remaining: 9,
  },
  {
    name: "Malabela Excellent",
    department: "Technology",
    annual: 15,
    used: 4,
    remaining: 11,
  },
  {
    name: "Kgahliso Matlala",
    department: "Communications",
    annual: 15,
    used: 5,
    remaining: 10,
  },
  {
    name: "Thabo Mokoena",
    department: "Human Resources",
    annual: 15,
    used: 8,
    remaining: 7,
  },
];

const statusStyles = {
  Pending: {
    background: "#fff7ed",
    color: "#c2410c",
  },
  Approved: {
    background: "#ecfdf5",
    color: "#047857",
  },
  Rejected: {
    background: "#fef2f2",
    color: "#b91c1c",
  },
};

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 4px 15px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "#eef2ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 23,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            marginBottom: 5,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 25,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            marginTop: 3,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export function HRLeave() {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");

  const statistics = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      approved: requests.filter((r) => r.status === "Approved").length,
      rejected: requests.filter((r) => r.status === "Rejected").length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.employee.toLowerCase().includes(search.toLowerCase()) ||
        request.department.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      const matchesType =
        typeFilter === "All" || request.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, search, statusFilter, typeFilter]);

  const updateRequestStatus = (id, status) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );

    setSelectedRequest(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px",
        color: "#0f172a",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6366f1",
              marginBottom: 6,
            }}
          >
            HUMAN RESOURCES
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 750,
            }}
          >
            Leave Management
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Manage employee leave requests, approvals and leave balances.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("balances")}
          style={{
            border: "none",
            background: "#4f46e5",
            color: "#ffffff",
            padding: "12px 18px",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          View Leave Balances
        </button>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          title="Total Requests"
          value={statistics.total}
          subtitle="All leave requests"
          icon="📋"
        />

        <StatCard
          title="Pending"
          value={statistics.pending}
          subtitle="Awaiting HR action"
          icon="⏳"
        />

        <StatCard
          title="Approved"
          value={statistics.approved}
          subtitle="Approved requests"
          icon="✓"
        />

        <StatCard
          title="Rejected"
          value={statistics.rejected}
          subtitle="Rejected requests"
          icon="✕"
        />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <button
          onClick={() => setActiveTab("requests")}
          style={{
            border: "none",
            background:
              activeTab === "requests" ? "#4f46e5" : "#e2e8f0",
            color: activeTab === "requests" ? "#fff" : "#334155",
            padding: "10px 16px",
            borderRadius: 9,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Leave Requests
        </button>

        <button
          onClick={() => setActiveTab("balances")}
          style={{
            border: "none",
            background:
              activeTab === "balances" ? "#4f46e5" : "#e2e8f0",
            color: activeTab === "balances" ? "#fff" : "#334155",
            padding: "10px 16px",
            borderRadius: 9,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Employee Balances
        </button>
      </div>

      {/* Requests */}
      {activeTab === "requests" && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(15, 23, 42, 0.04)",
          }}
        >
          {/* Filters */}
          <div
            style={{
              padding: 18,
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee or department..."
              style={{
                flex: 1,
                minWidth: 220,
                padding: "11px 13px",
                border: "1px solid #cbd5e1",
                borderRadius: 9,
                outline: "none",
              }}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                padding: "11px 13px",
                border: "1px solid #cbd5e1",
                borderRadius: 9,
                background: "#fff",
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              style={{
                padding: "11px 13px",
                border: "1px solid #cbd5e1",
                borderRadius: 9,
                background: "#fff",
              }}
            >
              <option value="All">All Leave Types</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Family Responsibility">
                Family Responsibility
              </option>
            </select>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    textAlign: "left",
                  }}
                >
                  {[
                    "Employee",
                    "Leave Type",
                    "Dates",
                    "Days",
                    "Submitted",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "14px 18px",
                        fontSize: 12,
                        color: "#64748b",
                        fontWeight: 700,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td
                      style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ fontWeight: 650 }}>
                        {request.employee}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          marginTop: 3,
                        }}
                      >
                        {request.department}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      {request.type}
                    </td>

                    <td
                      style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 13,
                      }}
                    >
                      {formatDate(request.startDate)}
                      <br />
                      <span style={{ color: "#94a3b8" }}>to</span>
                      <br />
                      {formatDate(request.endDate)}
                    </td>

                    <td
                      style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid #f1f5f9",
                        fontWeight: 650,
                      }}
                    >
                      {request.days}
                    </td>

                    <td
                      style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 13,
                      }}
                    >
                      {formatDate(request.submitted)}
                    </td>

                    <td
                      style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          ...statusStyles[request.status],
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <button
                        onClick={() => setSelectedRequest(request)}
                        style={{
                          border: "1px solid #cbd5e1",
                          background: "#fff",
                          color: "#334155",
                          padding: "8px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      No leave requests match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Balances */}
      {activeTab === "balances" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {employees.map((employee) => {
            const percentage =
              employee.annual > 0
                ? (employee.remaining / employee.annual) * 100
                : 0;

            return (
              <div
                key={employee.name}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {employee.name}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {employee.department}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 22,
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  <span>Leave remaining</span>
                  <strong>
                    {employee.remaining} / {employee.annual} days
                  </strong>
                </div>

                <div
                  style={{
                    height: 8,
                    background: "#e2e8f0",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: "#4f46e5",
                      borderRadius: 99,
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  {employee.used} days used this year
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div
          onClick={() => setSelectedRequest(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#fff",
              borderRadius: 18,
              padding: 26,
              boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                }}
              >
                Leave Request
              </h2>

              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  width: 34,
                  height: 34,
                  borderRadius: 50,
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: 24 }}>
              <DetailRow label="Employee" value={selectedRequest.employee} />
              <DetailRow
                label="Department"
                value={selectedRequest.department}
              />
              <DetailRow label="Leave Type" value={selectedRequest.type} />
              <DetailRow
                label="Start Date"
                value={formatDate(selectedRequest.startDate)}
              />
              <DetailRow
                label="End Date"
                value={formatDate(selectedRequest.endDate)}
              />
              <DetailRow
                label="Number of Days"
                value={`${selectedRequest.days} day(s)`}
              />
              <DetailRow label="Reason" value={selectedRequest.reason} />
              <DetailRow label="Status" value={selectedRequest.status} />
            </div>

            {selectedRequest.status === "Pending" && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Approved")
                  }
                  style={{
                    flex: 1,
                    border: "none",
                    background: "#059669",
                    color: "#fff",
                    padding: 12,
                    borderRadius: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Rejected")
                  }
                  style={{
                    flex: 1,
                    border: "none",
                    background: "#dc2626",
                    color: "#fff",
                    padding: 12,
                    borderRadius: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: 13,
        }}
      >
        {label}
      </span>

      <strong
        style={{
          fontSize: 14,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

export default HRLeave;