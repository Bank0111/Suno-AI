import React, { useState } from 'react';
import { Check, Copy, AlertCircle } from 'lucide-react';

interface SupportQRCodeProps {
  qrImage: string;
  recipientName: string;
  paymentMethod: string;
  promptPayId?: string;
}

export const SupportQRCode: React.FC<SupportQRCodeProps> = ({
  qrImage,
  recipientName,
  paymentMethod,
  promptPayId = '140000955357936',
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopyPaymentInfo = () => {
    const textToCopy = `PAYMENT METHOD: ${paymentMethod}\nPROMPTPAY NUMBER: ${promptPayId}\nRECIPIENT: ${recipientName}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Full Banner Image (No white box, full actual graphic card) */}
      <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-950/40 bg-[#0D0B14]">
        {!imageError && qrImage ? (
          <img
            src={qrImage}
            alt="Support PromptPay QR Code"
            className="w-full h-auto object-cover block"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full py-16 flex flex-col items-center justify-center p-6 text-center bg-[#0D0B14] text-zinc-300">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-200">
              QR CODE PLACEHOLDER
            </span>
            <span className="text-xs text-zinc-500 mt-1">
              กรุณาวางรูปภาพที่ public/support/qr-promptpay.png
            </span>
          </div>
        )}
      </div>

      {/* Info Card & Action Section (Matching Image 2) */}
      <div className="w-full flex flex-col gap-3.5 mt-5">
        {/* Payment Metadata Card */}
        <div className="w-full bg-[#0E0C17] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl">
          {/* Row 1: Payment Method */}
          <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs sm:text-sm">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-zinc-400">
              PAYMENT METHOD
            </span>
            <span className="font-semibold text-white tracking-wide">
              {paymentMethod}
            </span>
          </div>

          {/* Row 2: PromptPay Number */}
          <div className="flex items-center justify-between py-3 border-b border-white/5 text-xs sm:text-sm">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-zinc-400">
              PROMPTPAY NUMBER
            </span>
            <span className="font-mono font-bold text-[#38BDF8] tracking-wider text-sm sm:text-base">
              {promptPayId}
            </span>
          </div>

          {/* Row 3: Recipient */}
          <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-zinc-400">
              RECIPIENT
            </span>
            <span className="font-semibold text-[#D8B4FE] tracking-wide text-sm sm:text-base">
              {recipientName}
            </span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopyPaymentInfo}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#13101F] hover:bg-[#1A162B] text-zinc-100 hover:text-white border border-white/10 hover:border-purple-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-purple-950/20 active:scale-[0.99]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">คัดลอกข้อมูลเรียบร้อยแล้ว</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-purple-400" />
              <span>Copy Payment Information</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
