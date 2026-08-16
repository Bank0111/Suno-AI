import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { verifyApiKey } from '../../services/songwriting';
import { setStoredApiKey, removeStoredApiKey, getStoredApiKey } from '../../utils/storage';

interface Step01ApiKeyProps {
  onConnected: () => void;
  hasApiKey: boolean;
  onKeyStatusChange: () => void;
}

export const Step01ApiKey: React.FC<Step01ApiKeyProps> = ({
  onConnected,
  hasApiKey,
  onKeyStatusChange,
}) => {
  const [keyInput, setKeyInput] = useState(getStoredApiKey() || '');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyInput.trim()) {
      setErrorMsg('กรุณากรอก Gemini API Key');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Save temporarily to test endpoint
    setStoredApiKey(keyInput.trim(), true);

    try {
      const isValid = await verifyApiKey();
      if (isValid) {
        setStoredApiKey(keyInput.trim(), remember);
        onKeyStatusChange();
        onConnected();
      } else {
        setErrorMsg('Invalid API key — ตรวจสอบ API Key แล้วลองอีกครั้ง');
      }
    } catch (err: any) {
      console.error('API Key verification failed:', err);
      setErrorMsg(
        err.message || 'API request failed — กรุณาตรวจสอบ API Key และการเชื่อมต่อ'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = () => {
    removeStoredApiKey();
    setKeyInput('');
    setErrorMsg(null);
    onKeyStatusChange();
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-hero-fade">
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
              STEP 01
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Connect your Gemini API
            </h2>
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          ใช้ Gemini API Key ของคุณเองเพื่อขับเคลื่อน AI Songwriting Engine
          ระบบจะไม่ส่ง API Key ของคุณไปเก็บในเซิร์ฟเวอร์หรือฐานข้อมูลใดๆ
        </p>

        {/* Success Banner if Key already present */}
        {hasApiKey && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between gap-3 text-emerald-300 text-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold">✓ Gemini API Connected</span>
                <p className="text-xs text-emerald-400/80">พร้อมใช้งานแต่งเนื้อเพลงแล้ว</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveKey}
              className="px-3 py-1 text-xs text-zinc-400 hover:text-rose-300 underline transition-colors"
            >
              Remove Key
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="AIzaSy..."
                className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember option */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded bg-[#12101A] border-white/20 text-purple-600 focus:ring-purple-500/40"
              />
              <span>Remember on this device (เก็บใน browser localStorage)</span>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-cyan-400 inline-flex items-center gap-1.5 transition-colors"
            >
              How to get a Gemini API Key
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              disabled={loading || !keyInput.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying API Key...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Continue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
