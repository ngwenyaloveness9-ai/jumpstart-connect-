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
  Pending: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  Approved: "bg-green-500/10 text-green-300 border-green-500/20",
  Rejected: "bg-red-500/10 text-red-300 border-red-500/20",
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
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
        {icon}
      </div>

      <div>
        <div className="text-sm text-muted-foreground mb-1">
          {title}
        </div>

        <div className="text-3xl font-bold text-foreground">
          {value}
        </div>

        <div className="text-xs text-muted-foreground mt-1">
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
    <div className="min-h-screen bg-background text-foreground p-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <div className="text-sm font-semibold text-primary mb-1.5">
            HUMAN RESOURCES
          </div>

          <h1 className="text-4xl font-bold m-0">
            Leave Management
          </h1>

          <p className="mt-2 mb-0 text-sm text-muted-foreground">
            Manage employee leave requests, approvals and leave balances.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("balances")}
          className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/80 transition-all border-none cursor-pointer"
        >
          View Leave Balances
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 mb-7" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
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
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2.5 rounded-lg font-semibold border-none cursor-pointer transition-all ${activeTab === "requests" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
        >
          Leave Requests
        </button>

        <button
          onClick={() => setActiveTab("balances")}
          className={`px-4 py-2.5 rounded-lg font-semibold border-none cursor-pointer transition-all ${activeTab === "balances" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
        >
          Employee Balances
        </button>
      </div>

      {/* Requests */}
      {activeTab === "requests" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Filters */}
          <div className="p-[18px] border-b border-border flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee or department..."
              className="flex-1 min-w-[220px] px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-background text-foreground"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground"
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-muted text-left">
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
                      className="px-4 py-3 text-xs font-medium text-muted-foreground border-b border-border"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {request.employee}
                      </div>

                      <div
                        className="text-xs text-muted-foreground mt-1"
                      >
                        {request.department}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {request.type}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {formatDate(request.startDate)}
                      <br />
                      <span className="text-muted-foreground text-xs">to</span>
                      <br />
                      {formatDate(request.endDate)}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold">
                      {request.days}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {formatDate(request.submitted)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[request.status]}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="px-3 py-2 rounded-lg border border-border bg-card text-foreground font-semibold hover:bg-muted transition-all cursor-pointer"
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
                      className="px-4 py-12 text-center text-muted-foreground"
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
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
        >
          {employees.map((employee) => {
            const percentage =
              employee.annual > 0
                ? (employee.remaining / employee.annual) * 100
                : 0;

            return (
              <div
                key={employee.name}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <div className="text-lg font-bold mb-1">
                  {employee.name}
                </div>

                <div
                  className="text-sm text-muted-foreground mt-1"
                >
                  {employee.department}
                </div>

                <div className="flex justify-between mt-5 mb-2 text-sm">
                  <span>Leave remaining</span>
                  <strong>
                    {employee.remaining} / {employee.annual} days
                  </strong>
                </div>

                <div
                  className="h-2 bg-muted rounded-full overflow-hidden"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div
                  className="mt-3 text-xs text-muted-foreground"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
          style={{ zIndex: 1000 }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[520px] bg-card border border-border rounded-2xl p-7 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="m-0 text-2xl">
                Leave Request
              </h2>

              <button
                onClick={() => setSelectedRequest(null)}
                className="border-none bg-muted w-8 h-8 rounded-full cursor-pointer text-lg flex items-center justify-center hover:bg-muted/80"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
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
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Approved")
                  }
                  className="flex-1 border-none bg-green-500 text-white py-3 rounded-lg font-bold cursor-pointer hover:bg-green-600 transition-all"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Rejected")
                  }
                  className="flex-1 border-none bg-red-500 text-white py-3 rounded-lg font-bold cursor-pointer hover:bg-red-600 transition-all"
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
      className="grid gap-3 py-2.5 border-b border-border"
      style={{ gridTemplateColumns: "140px 1fr" }}
    >
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <strong className="text-base">
        {value}
      </strong>
    </div>
  );
}

export default HRLeave;
