import React from "react";
import { Info, X, Code2, Sparkles, HelpCircle, Check, Copy } from "lucide-react";

const TemplateGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const exampleKeys = [
    { key: "{{user_name}}", desc: "Recipient's full name or greeting name", example: "John Doe" },
    { key: "{{otp_code}}", desc: "6-Digit numeric verification code", example: "482917" },
    { key: "{{expiry_minutes}}", desc: "Expiration timer for OTP / Reset links", example: "10" },
    { key: "{{app_name}}", desc: "Name of the sending application", example: "Store App" },
    { key: "{{reset_link}}", desc: "Password reset URL link", example: "https://example.com/reset" },
    { key: "{{order_id}}", desc: "Unique order or invoice number", example: "ORD-9821" },
    { key: "{{order_total}}", desc: "Formatted price or order amount", example: "$149.99" },
    { key: "{{action_url}}", desc: "Primary call-to-action button link", example: "https://example.com/login" },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Template Generation Guide</h2>
              <p className="text-xs text-gray-500 font-medium">
                How to build dynamic HTML templates with <code className="text-blue-600 font-mono font-bold">{"{{key}}"}</code> placeholders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700 custom-scrollbar">
          {/* Section 1: How Placeholder Keys Work */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>1. How Key Placeholders Work</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Any word inside double curly braces, such as <code className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-mono font-semibold">{"{{user_name}}"}</code>, is automatically detected as a dynamic template variable. When sending an email, your app passes a JSON object with values for each key, and the server replaces them in realtime.
            </p>
          </div>

          {/* Section 2: Popular Standard Keys */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-purple-600" />
              <span>2. Recommended Standard Keys</span>
            </h3>
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-3.5 py-2.5">Key Placeholder</th>
                    <th className="px-3.5 py-2.5">Description</th>
                    <th className="px-3.5 py-2.5">Example Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/80">
                  {exampleKeys.map((item) => (
                    <tr key={item.key} className="hover:bg-white transition-colors">
                      <td className="px-3.5 py-2 font-mono text-blue-600 font-bold">{item.key}</td>
                      <td className="px-3.5 py-2 text-gray-600">{item.desc}</td>
                      <td className="px-3.5 py-2 text-gray-400 font-mono text-[11px]">{item.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: HTML Best Practices */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>3. HTML Email Design Rules</span>
            </h3>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl text-emerald-900">
              <li>Keep maximum container width around <strong>600px</strong> for optimal mobile rendering.</li>
              <li>Use <strong>inline CSS styles</strong> (e.g. <code className="bg-white px-1 py-0.5 rounded border text-[11px]">style="color: #2563eb;"</code>) as external stylesheets are stripped by Gmail and Outlook.</li>
              <li>Include plain fallback text in the editor for basic mail clients.</li>
            </ul>
          </div>

          {/* Section 4: JSON Payload Example */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">4. Sending API Data Payload Example</h3>
            <div className="bg-gray-900 p-3.5 rounded-2xl font-mono text-xs text-blue-300">
              <p className="text-gray-500">// POST http://localhost:5005/api/v1/send</p>
              <pre className="text-gray-200 mt-1">{`{
  "template_slug": "welcome-email",
  "to_email": "john@example.com",
  "to_name": "John Doe",
  "cc": "manager@example.com",
  "bcc": "audit@example.com",
  "variables": {
    "user_name": "John Doe",
    "app_name": "Store App",
    "login_url": "https://example.com/login"
  }
}`}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateGuideModal;
