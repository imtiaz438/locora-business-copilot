import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, X } from 'lucide-react';

export const POPULAR_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'United Arab Emirates',
  'Saudi Arabia',
  'Pakistan',
  'India',
  'Singapore',
  'Spain',
  'Italy',
  'Netherlands',
  'Switzerland',
  'Sweden',
  'Norway',
  'Denmark',
  'Ireland',
  'New Zealand',
  'South Africa',
  'Brazil',
  'Mexico',
  'Japan',
  'South Korea',
  'Turkey',
  'Egypt',
  'Indonesia',
  'Malaysia',
  'Philippines',
  'Thailand',
  'Vietnam',
  'Argentina',
  'Colombia',
  'Chile',
  'Poland',
  'Belgium',
  'Austria',
  'Portugal',
  'Greece',
  'Czech Republic',
  'Israel',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
];

interface CountryAutocompleteProps {
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export const CountryAutocomplete: React.FC<CountryAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Select or search target country...',
  required = false,
  id = 'country_autocomplete_input',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = query.trim()
    ? POPULAR_COUNTRIES.filter((c) =>
        c.toLowerCase().includes(query.toLowerCase().trim())
      )
    : POPULAR_COUNTRIES;

  const handleSelect = (country: string) => {
    setQuery(country);
    onChange(country);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Globe className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          id={id}
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-14 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:outline-none transition-all font-sans"
        />
        <div className="absolute right-2.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
              title="Clear"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-lg py-1 divide-y divide-slate-50 font-sans">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => {
              const isSelected = value.toLowerCase() === country.toLowerCase();
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-emerald-50/80 font-bold text-[#059669]' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>{country}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#059669]" />}
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-500">
              <span>Use custom target market: </span>
              <button
                type="button"
                onClick={() => handleSelect(query)}
                className="font-bold text-[#059669] underline cursor-pointer ml-1"
              >
                "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
