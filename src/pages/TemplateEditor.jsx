import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info
} from "lucide-react";
import { templatesAPI } from "../services/api";
import TemplateGuideModal from "../components/TemplateGuideModal";

const TemplateEditor = () => {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("transactional");
  const [htmlBody, setHtmlBody] = useState("");
  const [textBody, setTextBody] = useState("");
  const [variables, setVariables] = useState([]);
  const [newVar, setNewVar] = useState("");
  const [isBuiltin, setIsBuiltin] = useState(false);

  const [testVars, setTestVars] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      loadTemplate(id);
    } else {
      setName("New Template");
      setSlug("new-template");
      setSubject("Hello {{user_name}}!");
      setHtmlBody(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f9fafb; padding: 30px; }
    .card { background: white; border-radius: 12px; padding: 25px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .btn { display: inline-block; background: #2563eb; color: white !important; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Hello {{user_name}},</h2>
    <p>Welcome to our platform!</p>
    <a href="#" class="btn">Get Started</a>
  </div>
</body>
</html>`);
      setTextBody("Hello {{user_name}}, Welcome to our platform!");
      setVariables(["user_name"]);
      setTestVars({ user_name: "John Doe" });
    }
  }, [id]);

  const loadTemplate = async (templateId) => {
    setLoading(true);
    try {
      const res = await templatesAPI.get(templateId);
      const data = res.data;
      setName(data.name);
      setSlug(data.slug);
      setSubject(data.subject);
      setCategory(data.category);
      setHtmlBody(data.html_body);
      setTextBody(data.text_body || "");
      setVariables(data.variables || []);
      setIsBuiltin(data.is_builtin);

      const initialTest = {};
      (data.variables || []).forEach((v) => {
        initialTest[v] = `Sample ${v}`;
      });
      setTestVars(initialTest);
    } catch (err) {
      setError("Failed to load template details.");
    } finally {
      setLoading(false);
    }
  };

  const detectVariables = (subj, html) => {
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const found = new Set();
    let m;
    while ((m = regex.exec(subj)) !== null) found.add(m[1]);
    while ((m = regex.exec(html)) !== null) found.add(m[1]);

    const updatedVars = Array.from(found);
    setVariables(updatedVars);

    const updatedTest = { ...testVars };
    updatedVars.forEach((v) => {
      if (!(v in updatedTest)) updatedTest[v] = `Sample ${v}`;
    });
    setTestVars(updatedTest);
  };

  const handleHtmlChange = (e) => {
    const val = e.target.value;
    setHtmlBody(val);
    detectVariables(subject, val);
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    setSubject(val);
    detectVariables(val, htmlBody);
  };

  const addManualVariable = () => {
    if (!newVar.trim()) return;
    const clean = newVar.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (!variables.includes(clean)) {
      const updated = [...variables, clean];
      setVariables(updated);
      setTestVars({ ...testVars, [clean]: `Sample ${clean}` });
    }
    setNewVar("");
  };

  const removeVariable = (varName) => {
    setVariables(variables.filter((v) => v !== varName));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    const payload = {
      name,
      slug,
      subject,
      category,
      html_body: htmlBody,
      text_body: textBody,
      variables,
    };

    try {
      if (isNew) {
        const res = await templatesAPI.create(payload);
        setSuccessMsg("Template created successfully!");
        setTimeout(() => navigate(`/templates/${res.data.id}`), 1000);
      } else {
        await templatesAPI.update(id, payload);
        setSuccessMsg("Template saved successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const renderPreviewHtml = () => {
    let rendered = htmlBody;
    Object.keys(testVars).forEach((key) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      rendered = rendered.replace(regex, testVars[key] || "");
    });
    return rendered;
  };

  const renderPreviewSubject = () => {
    let rendered = subject;
    Object.keys(testVars).forEach((key) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      rendered = rendered.replace(regex, testVars[key] || "");
    });
    return rendered;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 gap-2 font-medium">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> Loading Editor...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/templates")}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
              <span>{isNew ? "Create Template" : `Edit: ${name}`}</span>
              {isBuiltin && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                  System Built-In
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Live code-based editor with real-time variables replacement
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowGuide(true)}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 transition-all shadow-sm flex items-center space-x-1.5 text-xs font-semibold"
            title="Template Generation Guide"
          >
            <Info className="w-4 h-4" />
            <span>Guide</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Template"}</span>
          </button>
        </div>
      </div>

      <TemplateGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: Code & Config */}
        <div className="space-y-5 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. OTP Verification"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Template Slug
              </label>
              <input
                type="text"
                value={slug}
                disabled={!isNew}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-blue-600 font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  !isNew ? "cursor-not-allowed" : ""
                }`}
                placeholder="otp-verification"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={handleSubjectChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Your OTP is {{otp_code}}"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="otp">OTP</option>
                <option value="transactional">Transactional</option>
                <option value="notification">Notification</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>

          {/* Keys Manager */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Detected Template Keys ({variables.length})
              </label>
              <span className="text-[11px] text-gray-400 font-medium">Auto-detected from subject & HTML</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[48px]">
              {variables.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold"
                >
                  <span>{`{{${v}}}`}</span>
                  <button
                    type="button"
                    onClick={() => removeVariable(v)}
                    className="text-blue-500 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center space-x-1 ml-auto">
                <input
                  type="text"
                  value={newVar}
                  onChange={(e) => setNewVar(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addManualVariable())}
                  placeholder="+ key_name"
                  className="w-24 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              HTML Template Source Code
            </label>
            <textarea
              value={htmlBody}
              onChange={handleHtmlChange}
              rows={14}
              className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-xs font-mono text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              placeholder="<html><body><h1>Hello {{user_name}}</h1></body></html>"
              required
            />
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="space-y-5 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm sticky top-20">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Live Rendered Preview</span>
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Realtime Sync
            </span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800">
            <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">
              Subject Preview:
            </span>
            <span className="font-semibold text-gray-900">{renderPreviewSubject()}</span>
          </div>

          {variables.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Simulate Key Values for Preview:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {variables.map((v) => (
                  <div key={v}>
                    <label className="text-[10px] font-mono text-blue-600 font-bold block mb-0.5">{`{{${v}}}`}</label>
                    <input
                      type="text"
                      value={testVars[v] || ""}
                      onChange={(e) => setTestVars({ ...testVars, [v]: e.target.value })}
                      className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm min-h-[350px]">
            <iframe
              title="HTML Email Live Preview"
              srcDoc={renderPreviewHtml()}
              className="w-full h-[400px] border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
