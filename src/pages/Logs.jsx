import React, { useEffect, useState } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  Loader2,
  Key
} from "lucide-react";
import { logsAPI } from "../services/api";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logsAPI.list({
        status: statusFilter || undefined,
        search: search || undefined,
        limit: 100,
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch email logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Email Audit Logs</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Complete audit trail of all email dispatches, originating API keys, connected apps, and SMTP delivery status
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {["", "sent", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {st === "" ? "All Logs" : st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient, API key, or app..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-400 gap-2 font-medium">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> Loading Delivery Logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-base text-gray-700">No logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Application</th>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      {log.status === "sent" ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    {/* Application Name Column */}
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-gray-900 text-xs block">{log.app_name || "Dashboard Direct"}</span>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      {log.recipient_email}
                      {log.recipient_name && (
                        <span className="block text-xs text-gray-400 font-normal">
                          {log.recipient_name}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">
                      {log.subject}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-gray-500 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all"
                        title="View Metadata & Key Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Email Log & API Key Detail</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div>
                <span className="text-gray-400 font-bold uppercase block">Log ID:</span>
                <span className="font-mono text-blue-600 font-semibold">{selectedLog.id}</span>
              </div>

              {/* Application & API Key Section */}
              <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl space-y-1">
                <div className="flex items-center space-x-1.5 text-purple-900 font-bold text-xs">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sender Application: {selectedLog.app_name || "Dashboard Direct"}</span>
                </div>
                <div className="font-mono text-[11px] text-purple-800">
                  <span className="font-semibold">X-API-Key: </span>
                  {selectedLog.api_key ? (
                    <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-purple-200">{selectedLog.api_key}</span>
                  ) : (
                    <span className="text-gray-500 font-normal">N/A (Sent via Dashboard UI)</span>
                  )}
                </div>
              </div>

              {/* SMTP Gateway Section */}
              <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl space-y-1">
                <div className="font-bold text-blue-900 text-xs">
                  SMTP Gateway: {selectedLog.smtp_name || "Default Gateway"}
                </div>
                <div className="font-mono text-[11px] text-blue-800">
                  From: {selectedLog.smtp_from_email || "System Default"}
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-bold uppercase block">Recipient:</span>
                <span className="font-semibold text-gray-900">{selectedLog.recipient_email} ({selectedLog.recipient_name || "N/A"})</span>
              </div>

              <div>
                <span className="text-gray-400 font-bold uppercase block">Subject:</span>
                <span className="text-gray-900">{selectedLog.subject}</span>
              </div>

              <div>
                <span className="text-gray-400 font-bold uppercase block">Status:</span>
                <span className={selectedLog.status === "sent" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                  {selectedLog.status.toUpperCase()}
                </span>
              </div>

              {selectedLog.error_message && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-700 font-mono">
                  <span className="font-bold block mb-1">Error Message:</span>
                  {selectedLog.error_message}
                </div>
              )}

              <div>
                <span className="text-gray-400 font-bold uppercase block">Metadata:</span>
                <pre className="bg-gray-900 p-3 rounded-xl font-mono text-blue-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
