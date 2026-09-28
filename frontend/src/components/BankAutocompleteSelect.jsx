import React, { useState, useEffect, useRef } from 'react';

export const INDIAN_BANKS = [
  { name: 'State Bank of India (SBI)', short: 'SBI', code: 'SBIN', popular: true },
  { name: 'HDFC Bank', short: 'HDFC', code: 'HDFC', popular: true },
  { name: 'ICICI Bank', short: 'ICICI', code: 'ICIC', popular: true },
  { name: 'Axis Bank', short: 'AXIS', code: 'UTIB', popular: true },
  { name: 'Kotak Mahindra Bank', short: 'KOTAK', code: 'KKBK', popular: true },
  { name: 'Punjab National Bank (PNB)', short: 'PNB', code: 'PUNB', popular: true },
  { name: 'Bank of Baroda (BOB)', short: 'BOB', code: 'BARB', popular: true },
  { name: 'Canara Bank', short: 'CANARA', code: 'CNRB', popular: true },
  { name: 'Union Bank of India', short: 'UBI', code: 'UBIN', popular: true },
  { name: 'Bank of India (BOI)', short: 'BOI', code: 'BKID', popular: false },
  { name: 'IndusInd Bank', short: 'INDUSIND', code: 'INDB', popular: false },
  { name: 'IDFC FIRST Bank', short: 'IDFC', code: 'IDFB', popular: false },
  { name: 'Yes Bank', short: 'YES', code: 'YESB', popular: false },
  { name: 'Federal Bank', short: 'FEDERAL', code: 'FDRL', popular: false },
  { name: 'Central Bank of India', short: 'CBI', code: 'CBIN', popular: false },
  { name: 'Indian Bank', short: 'INDIAN', code: 'IDIB', popular: false },
  { name: 'Indian Overseas Bank (IOB)', short: 'IOB', code: 'IOBA', popular: false },
  { name: 'UCO Bank', short: 'UCO', code: 'UCBA', popular: false },
  { name: 'Bank of Maharashtra', short: 'BOM', code: 'MAHB', popular: false },
  { name: 'Punjab & Sind Bank', short: 'PSB', code: 'PSIB', popular: false },
  { name: 'RBL Bank', short: 'RBL', code: 'RATN', popular: false },
  { name: 'Bandhan Bank', short: 'BANDHAN', code: 'BDBL', popular: false },
  { name: 'South Indian Bank', short: 'SIB', code: 'SIBL', popular: false },
  { name: 'AU Small Finance Bank', short: 'AU', code: 'AUBL', popular: false },
  { name: 'Equitas Small Finance Bank', short: 'EQUITAS', code: 'ESFB', popular: false },
  { name: 'Paytm Payments Bank', short: 'PAYTM', code: 'PYTM', popular: false },
  { name: 'Airtel Payments Bank', short: 'AIRTEL', code: 'AIRP', popular: false },
  { name: 'India Post Payments Bank (IPPB)', short: 'IPPB', code: 'IPOS', popular: false },
  { name: 'Standard Chartered Bank', short: 'SCB', code: 'SCBL', popular: false },
  { name: 'HSBC India', short: 'HSBC', code: 'HSBC', popular: false },
  { name: 'Citi Bank India', short: 'CITI', code: 'CITI', popular: false },
  { name: 'DBS Bank India', short: 'DBS', code: 'DBSS', popular: false },
  { name: 'Karur Vysya Bank', short: 'KVB', code: 'KVBL', popular: false },
  { name: 'City Union Bank', short: 'CUB', code: 'CIUB', popular: false },
  { name: 'Saraswat Cooperative Bank', short: 'SARASWAT', code: 'SRCB', popular: false },
  { name: 'Cosmos Cooperative Bank', short: 'COSMOS', code: 'COSB', popular: false },
  { name: 'Jammu & Kashmir Bank', short: 'JKB', code: 'JAKA', popular: false },
  { name: 'Karnataka Bank', short: 'KTK', code: 'KARB', popular: false },
];

export default function BankAutocompleteSelect({
  value = '',
  onChange,
  onSelectBank,
  error,
  placeholder = 'Type bank name (e.g. HDFC, SBI, ICICI)...',
  required = true,
  label = 'Bank Name',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter banks based on search input
  const query = (value || '').trim().toLowerCase();
  const filteredBanks = INDIAN_BANKS.filter((b) => {
    if (!query) return true;
    return (
      b.name.toLowerCase().includes(query) ||
      b.short.toLowerCase().includes(query) ||
      b.code.toLowerCase().includes(query)
    );
  });

  const popularBanks = INDIAN_BANKS.filter((b) => b.popular);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (bank) => {
    if (onChange) onChange(bank.name);
    if (onSelectBank) onSelectBank(bank);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredBanks.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredBanks.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredBanks.length) {
        handleSelect(filteredBanks[highlightedIndex]);
      } else if (filteredBanks.length === 1) {
        handleSelect(filteredBanks[0]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={`w-full pl-3.5 pr-9 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors font-medium text-slate-900 ${
            error
              ? 'border-red-500 ring-1 ring-red-500'
              : 'border-slate-300 focus:border-[#FF3F6C] focus:ring-1 focus:ring-[#FF3F6C]/20'
          }`}
        />

        <div className="absolute right-2 flex items-center">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Toggle bank list"
          >
            <span
              className={`material-symbols-outlined text-lg transition-transform duration-200 block ${
                isOpen ? 'rotate-180 text-[#FF3F6C]' : ''
              }`}
            >
              expand_more
            </span>
          </button>
        </div>
      </div>

      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-fadeIn">
          {/* Popular banks quick selection pills */}
          {!query && (
            <div className="p-2.5 bg-slate-50/80 border-b border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                ⭐ Frequently Used Banks
              </p>
              <div className="flex flex-wrap gap-1.5">
                {popularBanks.slice(0, 6).map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => handleSelect(bank)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-[#FF3F6C] hover:text-[#b90041] hover:bg-pink-50/50 transition-all cursor-pointer shadow-2xs"
                  >
                    {bank.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List of banks */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100/60 p-1">
            {filteredBanks.length > 0 ? (
              filteredBanks.map((bank, index) => {
                const isSelected = value.toLowerCase() === bank.name.toLowerCase();
                const isHighlighted = highlightedIndex === index;

                return (
                  <button
                    key={bank.code + index}
                    type="button"
                    onClick={() => handleSelect(bank)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-pink-50 text-[#b90041] font-bold'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`material-symbols-outlined text-base shrink-0 ${
                          isSelected
                            ? 'text-[#b90041]'
                            : 'text-slate-400 group-hover:text-[#FF3F6C] transition-colors'
                        }`}
                      >
                        account_balance
                      </span>
                      <span className="truncate">{bank.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-[#b90041] transition-colors">
                        IFSC: {bank.code}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#b90041] text-base">
                          check_circle
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center">
                <p className="text-xs text-slate-500 mb-2">No bank matching "{query}"</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-[#FF3F6C] hover:underline"
                >
                  Use "{query}" as Custom Bank Name
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Select to ensure 100% accurate bank naming</span>
            <span>{filteredBanks.length} banks</span>
          </div>
        </div>
      )}
    </div>
  );
}
