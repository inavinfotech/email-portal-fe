import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  CheckCircle2,
  XCircle,
  FileCode2,
  Server,
  AppWindow,
  Send,
  Plus,
  RefreshCw,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { logsAPI, templatesAPI, appsAPI, smtpAPI } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [templateCount, setTemplateCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [activeSMTP, setActiveSMTP] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        logsAPI.stats(),
        logsAPI.list({ limit: 6 }),
        templatesAPI.list(),
        appsAPI.list(),
        smtpAPI.list(),
      ]);

      const [statsRes, logsRes, templatesRes, appsRes, smtpRes] = results;

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (logsRes.status === "fulfilled") setRecentLogs(logsRes.value.data);
      if (templatesRes.status === "fulfilled") setTemplateCount(templatesRes.value.data.length);
      if (appsRes.status === "fulfilled") setAppCount(appsRes.value.data.length);
      if (smtpRes.status === "fulfilled") {
        const smtps = smtpRes.value.data || [];
        const defaultSmtp = smtps.find((s) => s.is_default && s.is_active) || smtps[0] || null;
        setActiveSMTP(defaultSmtp);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 gap-2 font-medium">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> Gathering Analytics...
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Dispatched",
      value: stats?.total_sent || 0,
      subtext: `${stats?.sent_today || 0} sent today`,
      icon: Mail,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Delivery Success Rate",
      value: `${stats?.success_rate ?? 100}%`,
      subtext: `${stats?.total_failed || 0} failed deliveries`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Active Templates",
      value: templateCount,
      subtext: "Includes 7 system templates",
      icon: FileCode2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      name: "Connected Apps",
      value: appCount,
      subtext: "Integrated via API Keys",
      icon: AppWindow,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Email System Overview
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Real-time mail dispatch metrics and gateway integration status
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/send"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send Email</span>
          </Link>
          <Link
            to="/templates/new"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>New Template</span>
          </Link>
        </div>
      </div>

      {/* Active Gateway Status Banner / Card */}
      {activeSMTP ? (
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-900 text-sm">{activeSMTP.name}</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeSMTP.test_status || "Active Gateway"}
                </span>
                {activeSMTP.is_default && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {activeSMTP.host}:{activeSMTP.port} • From: <span className="text-gray-800 font-semibold">{activeSMTP.from_name} &lt;{activeSMTP.from_email}&gt;</span>
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-semibold px-4 py-2 rounded-xl text-xs transition-all self-start md:self-auto"
          >
            Manage Gateway Settings →
          </Link>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-800">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">No Active SMTP Gateway Configured</p>
              <p className="text-xs text-amber-600">Configure Hostinger or custom mail credentials in Settings to start dispatching emails.</p>
            </div>
          </div>
          <Link
            to="/settings"
            className="bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-xs hover:bg-amber-700 transition-all shadow-sm"
          >
            Configure Gateway
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white border border-gray-100 p-6 rounded-2xl group hover:border-blue-500/40 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              {card.name}
            </p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              {card.value}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-2">
              {card.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Dispatches Table */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Recent Email Deliveries
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Latest dispatched messages across connected applications
            </p>
          </div>
          <Link to="/logs" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View Full Audit Logs →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
            No email dispatches recorded yet. Use the <strong className="text-gray-600">Send Email</strong> button to send your first test message!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Application</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
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
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-xs">
                      {log.app_name || "Dashboard Direct"}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {log.recipient_email}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 truncate max-w-xs">
                      {log.subject}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-medium">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
