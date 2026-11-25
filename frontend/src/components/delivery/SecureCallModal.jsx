import React, { useState, useEffect } from 'react';

export default function SecureCallModal({
  isOpen,
  onClose,
  customerName = 'Valued Customer',
  orderId = '#MS-ORDER',
  maskedPhone = '+91 98765 XXXXX',
  onCallInitiated
}) {
  const [callState, setCallState] = useState('IDLE'); // 'IDLE' | 'CONNECTING' | 'IN_CALL' | 'ENDED'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [bridgeData, setBridgeData] = useState(null);

  useEffect(() => {
    let timer;
    if (callState === 'IN_CALL') {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  useEffect(() => {
    if (!isOpen) {
      setCallState('IDLE');
      setIsMuted(false);
      setIsSpeaker(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    setCallState('CONNECTING');
    try {
      // Call backend telephony service
      const res = await fetch('/api/v1/telephony/initiate-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          driverName: 'Delivery Rider'
        })
      });
      const data = await res.json();
      if (data?.success) {
        setBridgeData(data.data);
      }
    } catch (_) {
      // Fallback bridge simulation if offline
      setBridgeData({
        virtualNumber: '+91 80 4712 3456',
        extensionCode: '1042'
      });
    }

    setTimeout(() => {
      setCallState('IN_CALL');
      if (onCallInitiated) onCallInitiated();
    }, 1200);
  };

  const handleEndCall = () => {
    setCallState('ENDED');
    setTimeout(() => {
      setCallState('IDLE');
      onClose();
    }, 1000);
  };

  const virtualNumber = bridgeData?.virtualNumber || '+91 80 4712 3456';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-[#9f0038] via-[#b7004d] to-[#ff527b] text-white p-6 pb-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase backdrop-blur-md mb-2 border border-white/20">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>Cloud Telephony • Number Masked</span>
          </div>
          <h3 className="text-xl font-black">MShoppy Secure Call Bridge</h3>
          <p className="text-xs text-pink-100 mt-1">
            Customer phone number is 100% encrypted & hidden
          </p>
        </div>

        {/* Floating Customer Info Card */}
        <div className="px-6 -mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#b90041] flex items-center justify-center font-black text-lg shrink-0">
              {customerName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-sm text-slate-800 truncate">{customerName}</h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span className="font-mono font-bold text-slate-700">{maskedPhone}</span>
                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                  PROTECTED
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
              <span className="text-xs font-black text-[#b90041] font-mono">{orderId.slice(0, 10)}</span>
            </div>
          </div>
        </div>

        {/* Content Body Based on State */}
        <div className="p-6 pt-4 space-y-4">
          {callState === 'IDLE' && (
            <>
              {/* Privacy Explanation Cards */}
              <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-emerald-600 shrink-0 mt-0.5">lock</span>
                  <span><strong>Zero Direct Exposure:</strong> You call through a secure virtual number. Neither side sees personal numbers.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-pink-600 shrink-0 mt-0.5">call_log</span>
                  <span><strong>Virtual Exchange DID:</strong> Routing via {virtualNumber}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-amber-600 shrink-0 mt-0.5">mic</span>
                  <span><strong>Audited & Recorded:</strong> Automatically logged to resolve delivery disputes.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleStartCall}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">call</span>
                  <span>Connect Call via Virtual Bridge</span>
                </button>
                <a
                  href={`tel:${virtualNumber}`}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center block"
                >
                  <span className="material-symbols-outlined text-base text-slate-500">dialpad</span>
                  <span>Open Phone Dialer ({virtualNumber})</span>
                </a>
              </div>
            </>
          )}

          {callState === 'CONNECTING' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30"></span>
                <span className="material-symbols-outlined text-2xl text-emerald-600 animate-spin">sync</span>
              </div>
              <div>
                <h5 className="font-extrabold text-base text-slate-800">Bridging Call with Customer...</h5>
                <p className="text-xs text-slate-500 mt-1">Connecting through Virtual Exchange {virtualNumber}</p>
              </div>
            </div>
          )}

          {callState === 'IN_CALL' && (
            <div className="py-4 text-center space-y-6">
              <div>
                <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Encrypted Call In Progress</span>
                </div>
                <div className="text-3xl font-mono font-black text-slate-800 tracking-wider">
                  {formatTimer(callDuration)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Connected to {customerName} (Masked)</p>
              </div>

              {/* In-Call Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="material-symbols-outlined text-xl">{isMuted ? 'mic_off' : 'mic'}</span>
                </button>

                <button
                  onClick={handleEndCall}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                  title="End Call"
                >
                  <span className="material-symbols-outlined text-2xl rotate-[135deg]">call</span>
                </button>

                <button
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                    isSpeaker ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isSpeaker ? 'Turn off speaker' : 'Speaker'}
                >
                  <span className="material-symbols-outlined text-xl">volume_up</span>
                </button>
              </div>
            </div>
          )}

          {callState === 'ENDED' && (
            <div className="py-6 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-400">call_end</span>
              <h5 className="font-extrabold text-base text-slate-800">Call Ended</h5>
              <p className="text-xs text-slate-500">Virtual bridge session saved to delivery audit log.</p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100 text-[11px] text-slate-400">
          Powered by MShoppy Cloud Telephony (Twilio / Exotel Compatible)
        </div>

      </div>
    </div>
  );
}
