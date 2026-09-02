import React, { useState } from "react";
import { ShieldCheck, KeyRound, CheckCircle2, AlertCircle, Plus, X } from "lucide-react";
import { otpAPI } from "../services/api";

const OTPPortal = () => {
  const [identifier, setIdentifier] = useState("");
  const [purpose, setPurpose] = useState("login");
  const [appName, setAppName] = useState("Example App");
  const [otpCode, setOtpCode] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [generatedResult, setGeneratedResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const [loadingGen, setLoadingGen] = useState(false);
  const [loadingVer, setLoadingVer] = useState(false);

  const [genError, setGenError] = useState("");
  const [verError, setVerError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoadingGen(true);
    setGenError("");
    setGeneratedResult(null);

    try {
      const res = await otpAPI.generate({
        identifier: identifier.trim(),
        purpose,
        app_name: appName,
        template_slug: "otp-verification",
        cc: ccEmail.trim() || undefined,
        bcc: bccEmail.trim() || undefined,
      });
      setGeneratedResult(res.data);
    } catch (err) {
      setGenError(err.response?.data?.detail || "Failed to generate OTP.");
    } finally {
      setLoadingGen(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !otpCode.trim()) return;

    setLoadingVer(true);
    setVerError("");
    setVerifyResult(null);

    try {
      const res = await otpAPI.verify({
        identifier: identifier.trim(),
        otp_code: otpCode.trim(),
        purpose,
      });
      setVerifyResult(res.data);
    } catch (err) {
      setVerError(err.response?.data?.detail || "Failed to verify OTP.");
    } finally {
      setLoadingVer(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">OTP Verification Gateway</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          6-Digit Numeric OTP generation & verification engine for SVARP app authentication
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Generate & Dispatch OTP */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">1. Generate & Send OTP</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Recipient Email *
                </label>
                <div className="flex items-center space-x-2">
                  {!showCc && (
                    <button
                      type="button"
                      onClick={() => setShowCc(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors flex items-center space-x-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>CC</span>
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      type="button"
                      onClick={() => setShowBcc(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors flex items-center space-x-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>BCC</span>
                    </button>
                  )}
                </div>
              </div>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="user@example.com"
                required
              />
            </div>

            {/* Optional CC / BCC */}
            {(showCc || showBcc) && (
              <div className="space-y-3 pt-1">
                {showCc && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                        CC (Carbon Copy)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCc(false);
                          setCcEmail("");
                        }}
                        className="text-[10px] text-gray-400 hover:text-rose-600 transition-colors flex items-center space-x-0.5"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ccEmail}
                      onChange={(e) => setCcEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="cc@example.com"
                    />
                  </div>
                )}
                {showBcc && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                        BCC (Blind Carbon Copy)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBcc(false);
                          setBccEmail("");
                        }}
                        className="text-[10px] text-gray-400 hover:text-rose-600 transition-colors flex items-center space-x-0.5"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={bccEmail}
                      onChange={(e) => setBccEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="bcc@example.com"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                >
                  <option value="login">Login</option>
                  <option value="signup">Signup</option>
                  <option value="reset_password">Reset Password</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  App Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            {genError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                {genError}
              </div>
            )}

            {generatedResult && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-800 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OTP Sent to {generatedResult.masked_identifier}</span>
                </div>
                <p className="font-mono text-[11px]">OTP Request ID: {generatedResult.otp_id}</p>
                <p className="text-[11px] opacity-80">Expires at: {new Date(generatedResult.expires_at).toLocaleTimeString()}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingGen}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              {loadingGen ? "Dispatching OTP..." : "Generate & Send OTP Code"}
            </button>
          </form>
        </div>

        {/* Step 2: Validate OTP Code */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">2. Validate Received OTP</h2>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Recipient Email *
              </label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Enter 6-Digit Code *
              </label>
              <input
                type="text"
                value={otpCode}
                maxLength={6}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-lg font-mono text-center tracking-[8px] text-emerald-600 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="482917"
                required
              />
            </div>

            {verError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                {verError}
              </div>
            )}

            {verifyResult && (
              <div className={`p-3.5 rounded-xl border text-xs ${
                verifyResult.verified
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                <p className="font-bold flex items-center space-x-1.5 text-sm">
                  {verifyResult.verified ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{verifyResult.message}</span>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingVer}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              {loadingVer ? "Verifying..." : "Verify Code Now"}
            </button>
          </form>
        </div>
      </div>

      {/* Integration Code Snippet */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Inter-App Integration Guide</h3>
        <p className="text-xs text-gray-500 font-medium">
          To integrate OTP validation into your app (e.g. <code className="text-blue-600 font-mono">store-app</code>), send an HTTP request using your app's API credentials:
        </p>

        <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs text-blue-300 overflow-x-auto space-y-1">
          <p className="text-gray-400">// 1. Generate & Send OTP</p>
          <p>POST http://localhost:5005/api/v1/otp/generate</p>
          <p className="text-gray-400">Headers: X-API-Key: app_xxx, X-API-Secret: yyy</p>
          <p className="text-gray-400">Body: &#123; "identifier": "user@example.com", "purpose": "login" &#125;</p>

          <p className="text-gray-400 pt-3">// 2. Verify Code</p>
          <p>POST http://localhost:5005/api/v1/otp/verify</p>
          <p className="text-gray-400">Headers: X-API-Key: app_xxx, X-API-Secret: yyy</p>
          <p className="text-gray-400">Body: &#123; "identifier": "user@example.com", "otp_code": "482917", "purpose": "login" &#125;</p>
        </div>
      </div>
    </div>
  );
};

export default OTPPortal;
