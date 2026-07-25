import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileCode2,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit3,
  Tag,
  Loader2,
  Info
} from "lucide-react";
import { templatesAPI } from "../services/api";
import TemplateGuideModal from "../components/TemplateGuideModal";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await templatesAPI.list(category, search);
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTemplates();
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await templatesAPI.duplicate(id);
      navigate(`/templates/${res.data.id}`);
    } catch (err) {
      alert("Failed to duplicate template: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id, name, isBuiltin) => {
    if (isBuiltin) {
      alert("System built-in templates cannot be deleted.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete template "${name}"?`)) {
      try {
        await templatesAPI.delete(id);
        fetchTemplates();
      } catch (err) {
        alert(err.response?.data?.detail || "Failed to delete template");
      }
    }
  };

  const categories = [
    { label: "All Categories", value: "" },
    { label: "OTP", value: "otp" },
    { label: "Transactional", value: "transactional" },
    { label: "Notification", value: "notification" },
    { label: "Marketing", value: "marketing" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Email Templates</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage HTML email templates with dynamic <code className="text-blue-600 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{"{{key_name}}"}</code> placeholders
          </p>
        </div>
        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            onClick={() => setShowGuide(true)}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 transition-all shadow-sm flex items-center space-x-1.5 text-xs font-semibold"
            title="Template Generation Guide"
          >
            <Info className="w-4 h-4" />
            <span>Guide</span>
          </button>
          <Link
            to="/templates/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </Link>
        </div>
      </div>

      <TemplateGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                category === cat.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {/* Grid of Templates */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400 gap-2 font-medium">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> Loading Templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl text-gray-400">
          <FileCode2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-base text-gray-700">No templates found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or create a new template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center space-x-1 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    <Tag className="w-3 h-3 text-blue-600" />
                    <span>{tpl.category}</span>
                  </span>

                  {tpl.is_builtin && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      System Built-In
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs font-mono text-gray-400 mb-3 truncate">
                  slug: <span className="text-blue-600 font-semibold">{tpl.slug}</span>
                </p>

                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 line-clamp-2">
                  <span className="text-gray-400 font-bold">Subject: </span>
                  {tpl.subject}
                </p>

                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                    Dynamic Keys ({tpl.variables.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tpl.variables.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-blue-600 font-semibold"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                    {tpl.variables.length === 0 && (
                      <span className="text-[10px] text-gray-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/templates/${tpl.id}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleDuplicate(tpl.id)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-xs font-semibold flex items-center space-x-1"
                    title="Duplicate Template"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>
                </div>

                {!tpl.is_builtin && (
                  <button
                    onClick={() => handleDelete(tpl.id, tpl.name, tpl.is_builtin)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-all text-xs"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;
