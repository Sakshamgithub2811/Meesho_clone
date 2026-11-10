import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  LayoutDashboard, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function KycGateLockScreen({ featureName = "This Feature" }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-pink-50/40 via-white to-amber-50/30">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-xl rounded-3xl border border-pink-100/80 shadow-xl shadow-pink-900/5 p-8 sm:p-10 text-center relative overflow-hidden">
        
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-[#b7004d] to-pink-500" />
        
        {/* Glow Sphere in background */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon Badge */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 text-amber-700 flex items-center justify-center shadow-inner border border-amber-300/60 mx-auto">
            <ShieldAlert className="w-12 h-12 text-amber-600 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-100/80 text-amber-800 border border-amber-300/80 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          4-Step KYC Verification Required
        </div>

        {/* Headings */}
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {featureName} is Currently Locked
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
          To comply with trade compliance and prevent fraudulent order dispatches, Meesho requires all B2B Dropshippers to complete a simple 4-step business and bank verification.
        </p>

        {/* Benefits Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-xs font-bold text-gray-900">Direct Supplier Push</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Push single & bulk orders to verified warehouses.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-xs font-bold text-gray-900">Store Integrations</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Live Shopify, WooCommerce & Custom API Webhooks.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-xs font-bold text-gray-900">Direct Payouts</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Automated margin transfers into your bank account.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate('/dropshipper-register')}
            className="w-full sm:w-auto bg-gradient-to-r from-[#b7004d] to-[#92003d] hover:from-[#92003d] hover:to-[#730030] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-[#b7004d]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Complete 4-Step KYC Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/dropshipper-dashboard')}
            className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-3 rounded-2xl cursor-pointer flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-500" />
            <span>Return to Dashboard</span>
          </Button>
        </div>

        {/* Helpdesk link */}
        <p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
          Have questions regarding documents?{' '}
          <button
            onClick={() => navigate('/dropshipper-support')}
            className="text-[#b7004d] font-bold hover:underline cursor-pointer"
          >
            Contact Dropshipper Support Desk
          </button>
        </p>

      </div>
    </div>
  );
}
