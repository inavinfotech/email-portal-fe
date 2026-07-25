import React, { useEffect, useState } from "react";
import { Send, FileCode2, Code2, CheckCircle2, AlertCircle } from "lucide-react";
import { templatesAPI, sendAPI } from "../services/api";

const SendEmail = () => {
  const [mode, setMode] = useState("template");
  const [templates, setTemplates] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [toEmail, setToEmail] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [rawHtml, setRawHtml] = useState("<h1>Hello from SVARP Email Portal</h1>");
  const [variables, setVariables] = useState({});

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await templatesAPI.list();
      setTemplates(res.data);
      if (res.data.length > 0) {
        handleTemplateChange(res.data[0].slug, res.data);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  const handleTemplateChange = (slug, tplList = templates) => {
    setSelectedSlug(slug);
    const found = tplList.find((t) => t.slug === slug);
    setSelectedTemplate(found || null);

    if (found) {
      const initVars = {};
      (found.variables || []).forEach((v) => {
        if (v === "otp_code") initVars[v] = "482917";
        else if (v === "expiry_minutes") initVars[v] = "10";
        else if (v === "app_name") initVars[v] = "Example App";
        else initVars[v] = `Test ${v}`;
      });
      setVariables(initVars);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toEmail.trim()) {
      setError("Recipient email is required.");
      return;
    }

    setSending(true);
    setError("");
    setResult(null);

    try {
      let res;
      if (mode === "template") {
        res = await sendAPI.sendTemplated({
          template_slug: selectedSlug,
          to_email: toEmail.trim(),
          to_name: toName.trim() || undefined,
          variables,
        });
      } else {
        res = await sendAPI.sendRaw({
          to_email: toEmail.trim(),
          to_name: toName.trim() || undefined,
          subject: subject.trim() || "Test Email",
          html_body: rawHtml,
        });
      }
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to dispatch email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Send Email</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Dispatch test emails via template or raw HTML using Hostinger SMTP
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm w-fit">
        <button
          onClick={() => setMode("template")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            mode === "template"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Templated Email</span>
        </button>
        <button
          onClick={() => setMode("raw")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            mode === "raw"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Raw HTML Email</span>
        </button>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSend} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Recipient Email Address *
            </label>
            <input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Recipient Name (Optional)
            </label>
            <input
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>
        </div>

        {mode === "template" ? (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Select Template
              </label>
              <select
                value={selectedSlug}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && selectedTemplate.variables?.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                  Template Key Values:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTemplate.variables.map((v) => (
                    <div key={v}>
                      <label className="text-xs font-mono text-gray-600 font-bold block mb-1">{`{{${v}}}`}</label>
                      <input
                        type="text"
                        value={variables[v] || ""}
                        onChange={(e) => setVariables({ ...variables, [v]: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Important Notice"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                HTML Content
              </label>
              <textarea
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                rows={8}
                className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-xs font-mono text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            result.status === "sent"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <div className="flex items-center space-x-2 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{result.message}</span>
            </div>
            <p className="font-mono text-[11px] opacity-80">Log ID: {result.log_id}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {sending ? (
            <span>Dispatching Email...</span>
          ) : (
            <>
              <span>Dispatch Email Now</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SendEmail;
