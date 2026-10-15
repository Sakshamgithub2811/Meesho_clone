import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { 
  Store, 
  Share2, 
  CreditCard, 
  Building, 
  ExternalLink, 
  Eye, 
  X, 
  Check, 
  Ban, 
  Clock 
} from 'lucide-react';
import KycStatusBadge from './KycStatusBadge';

export default function KycReviewModal({
  reviewApp,
  onClose,
  adminNote,
  onAdminNoteChange,
  actionLoading,
  onStatusUpdate,
  formatDate
}) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!reviewApp) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Modal Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Verify KYC Application
                </h3>
                <span className="text-xs uppercase px-2 py-0.5 rounded font-bold bg-pink-100 text-[#b7004d]">
                  {reviewApp.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Application ID: <span className="font-mono text-gray-700">#{reviewApp.id}</span> • Submitted {formatDate(reviewApp.createdAt)}
              </p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Applicant Profile Card */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 bg-pink-100 text-[#b7004d] text-base font-bold">
                {reviewApp.user?.avatarUrl ? (
                  <AvatarImage src={reviewApp.user.avatarUrl} alt={reviewApp.user.fullName} />
                ) : (
                  <AvatarFallback>{(reviewApp.user?.fullName || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{reviewApp.user?.fullName || 'Applicant'}</h4>
                <p className="text-xs text-gray-500">{reviewApp.user?.email}</p>
                <p className="text-xs text-gray-400">{reviewApp.user?.phone || 'No phone'}</p>
              </div>
            </div>
            <div>
              <KycStatusBadge status={reviewApp.status} />
            </div>
          </div>

          {/* Store / Business / Platform Details */}
          {reviewApp.documents && (
            <div className="space-y-4">
              
              {/* 1. Store or Social info */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-2 bg-white">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  {reviewApp.type === 'dropshipper' ? <Store className="w-3.5 h-3.5 text-purple-600" /> : <Share2 className="w-3.5 h-3.5 text-indigo-600" />}
                  {reviewApp.type === 'dropshipper' ? 'Business & Store Details' : 'Social Platform & Reach'}
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {reviewApp.documents.businessName && (
                    <div>
                      <span className="text-gray-400 block">Business Name</span>
                      <span className="font-semibold text-gray-800">{reviewApp.documents.businessName}</span>
                    </div>
                  )}
                  {reviewApp.documents.storeType && (
                    <div>
                      <span className="text-gray-400 block">Store Type</span>
                      <span className="font-semibold text-gray-800">{reviewApp.documents.storeType}</span>
                    </div>
                  )}
                  {reviewApp.documents.storeUrl && (
                    <div className="col-span-2">
                      <span className="text-gray-400 block">Website URL</span>
                      <a 
                        href={reviewApp.documents.storeUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="font-semibold text-[#b7004d] hover:underline flex items-center gap-1"
                      >
                        {reviewApp.documents.storeUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {reviewApp.documents.platform && (
                    <div>
                      <span className="text-gray-400 block">Platform</span>
                      <span className="font-semibold text-gray-800">{reviewApp.documents.platform} ({reviewApp.documents.handle})</span>
                    </div>
                  )}
                  {reviewApp.documents.followers && (
                    <div>
                      <span className="text-gray-400 block">Audience / Followers</span>
                      <span className="font-semibold text-gray-800">{reviewApp.documents.followers}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Identity Verification (PAN & Aadhaar) */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Identity Documents
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* PAN Card */}
                  {reviewApp.documents.pan && (
                    <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700">PAN Card</span>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          {reviewApp.documents.pan.status || 'Submitted'}
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-gray-900 tracking-wider">
                        {reviewApp.documents.pan.number || '—'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Name on Card: <span className="font-medium text-gray-700">{reviewApp.documents.pan.nameOnDoc || '—'}</span>
                      </p>
                      {reviewApp.documents.pan.image && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(reviewApp.documents.pan.image)}
                          className="text-[11px] text-[#b7004d] hover:underline flex items-center gap-1 font-semibold pt-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> View PAN Photo
                        </button>
                      )}
                    </div>
                  )}

                  {/* Aadhaar Card */}
                  {reviewApp.documents.aadhaar && (
                    <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700">Aadhaar Card</span>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          {reviewApp.documents.aadhaar.status || 'Submitted'}
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-gray-900 tracking-wider">
                        {reviewApp.documents.aadhaar.number || '—'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Name on Card: <span className="font-medium text-gray-700">{reviewApp.documents.aadhaar.nameOnDoc || '—'}</span>
                      </p>
                      {reviewApp.documents.aadhaar.image && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(reviewApp.documents.aadhaar.image)}
                          className="text-[11px] text-[#b7004d] hover:underline flex items-center gap-1 font-semibold pt-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> View Aadhaar Photo
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* 3. Bank Account & Settlement Details */}
              {reviewApp.documents.bank && (
                <div className="border border-gray-100 rounded-xl p-4 space-y-2 bg-white">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    Payout Bank Account
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block">Bank Name</span>
                      <span className="font-semibold text-gray-800">{reviewApp.documents.bank.bankName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Account Number</span>
                      <span className="font-mono font-semibold text-gray-800">{reviewApp.documents.bank.accountNumber || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">IFSC Code</span>
                      <span className="font-mono font-semibold text-gray-800">{reviewApp.documents.bank.ifsc || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Beneficiary Name</span>
                      <span className="font-semibold text-gray-800">{reviewApp.documents.bank.holderName || '—'}</span>
                    </div>
                    {reviewApp.documents.bank.upiId && (
                      <div className="col-span-2">
                        <span className="text-gray-400 block">UPI ID</span>
                        <span className="font-mono font-semibold text-indigo-700">{reviewApp.documents.bank.upiId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Admin Decision & Notes */}
          <div className="space-y-2 border-t pt-4">
            <label className="text-xs font-bold text-gray-700 block">
              Admin Verification Notes (Optional on Approve, Required on Reject):
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Documents verified successfully / Rejection reason: PAN photo is blurred"
              value={adminNote}
              onChange={(e) => onAdminNoteChange(e.target.value)}
              className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#b7004d]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 border-t pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="w-full sm:w-auto cursor-pointer"
            >
              Close
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                onClick={() => onStatusUpdate('UNDER_REVIEW')}
                className="text-blue-700 border-blue-200 hover:bg-blue-50 text-xs flex-1 sm:flex-initial cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 mr-1" /> Mark Under Review
              </Button>

              <Button
                size="sm"
                disabled={actionLoading}
                onClick={() => onStatusUpdate('REJECTED')}
                className="bg-red-600 hover:bg-red-700 text-white text-xs flex-1 sm:flex-initial cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>

              <Button
                size="sm"
                disabled={actionLoading}
                onClick={() => onStatusUpdate('APPROVED')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1 sm:flex-initial cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Approve KYC
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Image Preview */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-lg w-full bg-white rounded-xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white p-1 rounded-full hover:bg-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={previewImage} alt="Document Proof" className="w-full h-auto rounded-lg object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </>
  );
}
