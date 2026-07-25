import React, { useEffect, useState } from "react";
import {
  Server,
  Plus,
  Trash2,
  Key,
  Copy,
  RefreshCw,
  Edit3
} from "lucide-react";
import { smtpAPI, appsAPI } from "../services/api";

const Settings = () => {
  // SMTP State
  const [smtpConfigs, setSmtpConfigs] = useState([]);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    name: "Hostinger Mail",
    host: "smtp.hostinger.com",
    port: 465,
    username: "",
    password: "",
    from_email: "",
    from_name: "Email Portal",
    use_tls: false,
    use_ssl: true,
    is_default: true,
  });

  // Edit SMTP State
  const [editingSmtp, setEditingSmtp] = useState(null);
  const [editSmtpForm, setEditSmtpForm] = useState({
    name: "",
    host: "",
    port: 587,
    username: "",
    password: "",
    from_email: "",
    from_name: "",
    use_tls: true,
    use_ssl: false,
    is_default: false,
  });

  const [testEmail, setTestEmail] = useState("");
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // App State
  const [apps, setApps] = useState([]);
  const [showAppModal, setShowAppModal] = useState(false);
  const [appName, setAppName] = useState("");
  const [appRateLimit, setAppRateLimit] = useState(50);
  const [appSmtpId, setAppSmtpId] = useState("");
  const [createdSecret, setCreatedSecret] = useState(null);

  // Edit App State
  const [editingApp, setEditingApp] = useState(null);
  const [editAppName, setEditAppName] = useState("");
  const [editAppRateLimit, setEditAppRateLimit] = useState(50);
  const [editAppSmtpId, setEditAppSmtpId] = useState("");
  const [editAppStatus, setEditAppStatus] = useState("active");

  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [smtpRes, appsRes] = await Promise.all([
        smtpAPI.list(),
        appsAPI.list(),
      ]);
      setSmtpConfigs(smtpRes.data);
      setApps(appsRes.data);
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSmtp = async (e) => {
    e.preventDefault();
    try {
      await smtpAPI.create(smtpForm);
      setShowSmtpModal(false);
      setSmtpForm({
        name: "Hostinger Mail",
        host: "smtp.hostinger.com",
        port: 465,
        username: "",
        password: "",
        from_email: "",
        from_name: "Email Portal",
        use_tls: false,
        use_ssl: true,
        is_default: true,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create SMTP config");
    }
  };

  const openEditSmtpModal = (smtp) => {
    setEditingSmtp(smtp);
    setEditSmtpForm({
      name: smtp.name,
      host: smtp.host,
      port: smtp.port,
      username: smtp.username,
      password: "",
      from_email: smtp.from_email,
      from_name: smtp.from_name,
      use_tls: smtp.use_tls,
      use_ssl: smtp.use_ssl,
      is_default: smtp.is_default,
    });
  };

  const handleUpdateSmtp = async (e) => {
    e.preventDefault();
    if (!editingSmtp) return;

    try {
      const payload = { ...editSmtpForm };
      if (!payload.password.trim()) {
        delete payload.password;
      }
      await smtpAPI.update(editingSmtp.id, payload);
      setEditingSmtp(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update SMTP configuration");
    }
  };

  const handleTestSmtp = async (id) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await smtpAPI.test(id, testEmail.trim() || undefined);
      setTestResult({ id, success: true, message: res.data.message });
      fetchData();
    } catch (err) {
      setTestResult({ id, success: false, message: err.response?.data?.detail || "SMTP test failed" });
    } finally {
      setTestingId(null);
    }
  };

  const handleSetDefaultSmtp = async (id) => {
    try {
      await smtpAPI.setDefault(id);
      fetchData();
    } catch (err) {
      alert("Failed to set default SMTP");
    }
  };

  const handleDeleteSmtp = async (id, name) => {
    if (window.confirm(`Delete SMTP configuration "${name}"?`)) {
      try {
        await smtpAPI.delete(id);
        fetchData();
      } catch (err) {
        alert("Failed to delete SMTP configuration");
      }
    }
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!appName.trim()) return;

    try {
      const res = await appsAPI.create({
        name: appName.trim(),
        rate_limit: parseInt(appRateLimit, 10) || 50,
        smtp_config_id: appSmtpId || null,
      });
      setCreatedSecret(res.data);
      setShowAppModal(false);
      setAppName("");
      setAppSmtpId("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to register application");
    }
  };

  const openEditAppModal = (app) => {
    setEditingApp(app);
    setEditAppName(app.name);
    setEditAppRateLimit(app.rate_limit || 50);
    setEditAppSmtpId(app.smtp_config_id || "");
    setEditAppStatus(app.status || "active");
  };

  const handleUpdateApp = async (e) => {
    e.preventDefault();
    if (!editingApp || !editAppName.trim()) return;

    try {
      await appsAPI.update(editingApp.id, {
        name: editAppName.trim(),
        rate_limit: parseInt(editAppRateLimit, 10) || 50,
        smtp_config_id: editAppSmtpId || null,
        status: editAppStatus,
      });
      setEditingApp(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update application");
    }
  };

  const handleDeleteApp = async (id, name) => {
    if (window.confirm(`Delete app "${name}"? Inter-app API requests using its key will fail.`)) {
      try {
        await appsAPI.delete(id);
        fetchData();
      } catch (err) {
        alert("Failed to delete application");
      }
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const getSmtpName = (smtpId) => {
    if (!smtpId) return "System Default Gateway";
    const found = smtpConfigs.find((s) => s.id === smtpId);
    return found ? `${found.name} (${found.from_email})` : "Custom Gateway";
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Configure Hostinger mail server credentials, connected apps, assigned mail gateways, and API keys
        </p>
      </div>

      {/* 1. SMTP GATEWAY CONFIGURATION */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Hostinger & SMTP Gateways</h2>
              <p className="text-xs text-gray-500 font-medium">
                Credentials are AES-256 encrypted in database and decrypted in-memory during send
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSmtpModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add SMTP Credentials</span>
          </button>
        </div>

        {/* Test Email Input */}
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
          <span className="text-xs text-gray-700 font-semibold whitespace-nowrap">Test Recipient:</span>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@domain.com (optional)"
            className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-900 placeholder-gray-400 w-full md:w-72 focus:outline-none"
          />
          <span className="text-[11px] text-gray-500 hidden md:inline font-medium">Enter email to send live test message during connection check</span>
        </div>

        {/* SMTP Cards List */}
        {smtpConfigs.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
            No SMTP gateways configured. Add your Hostinger mail credentials to enable email dispatching!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {smtpConfigs.map((smtp) => (
              <div
                key={smtp.id}
                className={`p-5 rounded-2xl border transition-all ${
                  smtp.is_default
                    ? "bg-white border-blue-200 ring-2 ring-blue-500/10 shadow-sm"
                    : "bg-gray-50/60 border-gray-200"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-1">
                      <h3 className="font-bold text-gray-900 text-base">{smtp.name}</h3>
                      {smtp.is_default && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          Active Default
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        smtp.test_status === "success"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : smtp.test_status === "failed"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>
                        {smtp.test_status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-mono">
                      {smtp.host}:{smtp.port} • User: <span className="text-gray-900 font-semibold">{smtp.username}</span> • From: <span className="text-gray-900 font-semibold">{smtp.from_name} &lt;{smtp.from_email}&gt;</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTestSmtp(smtp.id)}
                      disabled={testingId === smtp.id}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingId === smtp.id ? "animate-spin text-blue-600" : ""}`} />
                      <span>{testingId === smtp.id ? "Testing..." : "Test Connection"}</span>
                    </button>

                    {!smtp.is_default && (
                      <button
                        onClick={() => handleSetDefaultSmtp(smtp.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all"
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      onClick={() => openEditSmtpModal(smtp)}
                      className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-all"
                      title="Edit SMTP Credentials"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteSmtp(smtp.id, smtp.name)}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all"
                      title="Delete SMTP Gateway"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {testResult && testResult.id === smtp.id && (
                  <div className={`mt-3 p-3 rounded-xl border text-xs font-semibold ${
                    testResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. CONNECTED APPLICATIONS */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Registered Applications & Assigned Email Gateways</h2>
              <p className="text-xs text-gray-500 font-medium">
                Grant other external applications API keys and assign specific email sender gateways
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAppModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md shadow-purple-500/20 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register Application</span>
          </button>
        </div>

        {createdSecret && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 text-sm">🔑 Copy API Credentials for "{createdSecret.name}"</span>
              <button onClick={() => setCreatedSecret(null)} className="text-amber-700 hover:text-amber-900 font-bold">✕</button>
            </div>
            <p className="text-amber-800">This API Secret is displayed ONCE. Store it securely in your app's <code className="font-bold">.env</code>!</p>
            
            <div className="space-y-1 font-mono text-gray-800 pt-1">
              <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200">
                <span>X-API-Key: {createdSecret.api_key}</span>
                <button onClick={() => copyToClipboard(createdSecret.api_key, "key")} className="text-blue-600 hover:text-blue-800 font-bold">
                  {copiedKey === "key" ? "Copied!" : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200">
                <span>X-API-Secret: {createdSecret.api_secret}</span>
                <button onClick={() => copyToClipboard(createdSecret.api_secret, "sec")} className="text-blue-600 hover:text-blue-800 font-bold">
                  {copiedKey === "sec" ? "Copied!" : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {apps.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
            No external apps registered yet. Click "Register Application" to generate API keys for inter-app communication.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map((a) => (
              <div key={a.id} className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900 text-sm">{a.name}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      a.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditAppModal(a)}
                      className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all"
                      title="Edit Application & Gateway"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteApp(a.id, a.name)}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                      title="Delete Application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-gray-700 bg-white p-2 rounded-lg border border-gray-200">
                    <span className="truncate">Key: {a.api_key}</span>
                    <button onClick={() => copyToClipboard(a.api_key, a.id)} className="text-blue-600 font-semibold">
                      {copiedKey === a.id ? "Copied" : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-100 p-2 rounded-xl text-xs flex items-center justify-between text-blue-900">
                  <span className="font-semibold text-[11px]">Mail Gateway:</span>
                  <span className="font-mono text-[11px] font-bold text-blue-700 truncate max-w-[200px]">
                    {getSmtpName(a.smtp_config_id)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium pt-1 border-t border-gray-200/60">
                  <span>Rate Limit: {a.rate_limit} req/min</span>
                  <span>ID: {a.id.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD SMTP CONFIG */}
      {showSmtpModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-base">Add Hostinger / SMTP Server</h3>

            <form onSubmit={handleCreateSmtp} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Config Name</label>
                <input
                  type="text"
                  value={smtpForm.name}
                  onChange={(e) => setSmtpForm({ ...smtpForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Hostinger/SMTP Host</label>
                  <input
                    type="text"
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    placeholder="smtp.hostinger.com"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SMTP Username</label>
                  <input
                    type="text"
                    value={smtpForm.username}
                    onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value, from_email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    placeholder="noreply@domain.com"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SMTP Password</label>
                  <input
                    type="password"
                    value={smtpForm.password}
                    onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">From Sender Email</label>
                  <input
                    type="email"
                    value={smtpForm.from_email}
                    onChange={(e) => setSmtpForm({ ...smtpForm, from_email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">From Sender Name</label>
                  <input
                    type="text"
                    value={smtpForm.from_name}
                    onChange={(e) => setSmtpForm({ ...smtpForm, from_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-gray-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smtpForm.use_ssl}
                    onChange={(e) => setSmtpForm({ ...smtpForm, use_ssl: e.target.checked, use_tls: !e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>SSL (Port 465)</span>
                </label>
                <label className="flex items-center space-x-2 text-gray-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smtpForm.is_default}
                    onChange={(e) => setSmtpForm({ ...smtpForm, is_default: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>Set Active Default</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSmtpModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SMTP CONFIG */}
      {editingSmtp && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Edit SMTP Gateway ({editingSmtp.name})</h3>
              <button onClick={() => setEditingSmtp(null)} className="text-gray-400 hover:text-gray-600 text-xs font-semibold">✕</button>
            </div>

            <form onSubmit={handleUpdateSmtp} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Config Name</label>
                <input
                  type="text"
                  value={editSmtpForm.name}
                  onChange={(e) => setEditSmtpForm({ ...editSmtpForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Hostinger/SMTP Host</label>
                  <input
                    type="text"
                    value={editSmtpForm.host}
                    onChange={(e) => setEditSmtpForm({ ...editSmtpForm, host: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    placeholder="smtp.hostinger.com"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={editSmtpForm.port}
                    onChange={(e) => setEditSmtpForm({ ...editSmtpForm, port: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SMTP Username</label>
                  <input
                    type="text"
                    value={editSmtpForm.username}
                    onChange={(e) => setEditSmtpForm({ ...editSmtpForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    value={editSmtpForm.password}
                    onChange={(e) => setEditSmtpForm({ ...editSmtpForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">From Sender Email</label>
                  <input
                    type="email"
                    value={editSmtpForm.from_email}
                    onChange={(e) => setEditSmtpForm({ ...editSmtpForm, from_email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">From Sender Name</label>
                  <input
                    type="text"
                    value={editSmtpForm.from_name}
                    onChange={(e) => setEditSmtpForm({ ...editSmtpForm, from_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-gray-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSmtpForm.use_ssl}
                    onChange={(e) => setEditSmtpForm({ ...editSmtpForm, use_ssl: e.target.checked, use_tls: !e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>SSL (Port 465)</span>
                </label>
                <label className="flex items-center space-x-2 text-gray-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSmtpForm.is_default}
                    onChange={(e) => setEditSmtpForm({ ...editSmtpForm, is_default: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>Set Active Default</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingSmtp(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER APP */}
      {showAppModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-base">Register External Application</h3>

            <form onSubmit={handleCreateApp} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Application Name *</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                  placeholder="e.g. store-app"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Email Gateway</label>
                <select
                  value={appSmtpId}
                  onChange={(e) => setAppSmtpId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none font-medium"
                >
                  <option value="">System Default Gateway</option>
                  {smtpConfigs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.from_email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rate Limit (req/min)</label>
                <input
                  type="number"
                  value={appRateLimit}
                  onChange={(e) => setAppRateLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAppModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold shadow-md shadow-purple-500/20"
                >
                  Generate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT APP */}
      {editingApp && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Edit Application & Gateway</h3>
              <button onClick={() => setEditingApp(null)} className="text-gray-400 hover:text-gray-600 text-xs font-semibold">✕</button>
            </div>

            <form onSubmit={handleUpdateApp} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Application Name *</label>
                <input
                  type="text"
                  value={editAppName}
                  onChange={(e) => setEditAppName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Email Gateway</label>
                <select
                  value={editAppSmtpId}
                  onChange={(e) => setEditAppSmtpId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  <option value="">System Default Gateway</option>
                  {smtpConfigs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.from_email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Select which email address/Hostinger SMTP account this app uses for emails & OTPs.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editAppStatus}
                    onChange={(e) => setEditAppStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Rate Limit (req/min)</label>
                  <input
                    type="number"
                    value={editAppRateLimit}
                    onChange={(e) => setEditAppRateLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
