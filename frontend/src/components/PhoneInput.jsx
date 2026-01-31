import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const COUNTRIES = [
    { code: 'DZ', name: 'Algérie', dial_code: '+213', flag: '🇩🇿', validation: { length: 9, startsWith: ['5', '6', '7'] } },
    { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷', validation: { length: 9, startsWith: ['6', '7'] } },
    { code: 'GB', name: 'UK', dial_code: '+44', flag: '🇬🇧', validation: { length: 10, startsWith: ['7'] } },
    { code: 'TN', name: 'Tunisie', dial_code: '+216', flag: '🇹🇳', validation: { length: 8 } },
    { code: 'MA', name: 'Maroc', dial_code: '+212', flag: '🇲🇦', validation: { length: 9 } },
    { code: 'CA', name: 'Canada', dial_code: '+1', flag: '🇨🇦', validation: { minLength: 10 } },
    { code: 'US', name: 'USA', dial_code: '+1', flag: '🇺🇸', validation: { minLength: 10 } },
    { code: 'AE', name: 'UAE', dial_code: '+971', flag: '🇦🇪', validation: { minLength: 9 } },
    { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦', validation: { minLength: 9 } },
    { code: 'QA', name: 'Qatar', dial_code: '+974', flag: '🇶🇦', validation: { minLength: 8 } },
    { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪', validation: { minLength: 10 } },
    { code: 'ES', name: 'Spain', dial_code: '+34', flag: '🇪🇸', validation: { length: 9 } },
];

const PhoneInput = ({ value, onChange, placeholder, required, name = 'whatsappNumber' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default Algeria
    const [phoneNumber, setPhoneNumber] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Initialisation à partir de la valeur existante
    useEffect(() => {
        if (value) {
            // Tenter de détecter le pays si le numéro a déjà un indicatif
            const foundCountry = COUNTRIES.find(c => value.startsWith(c.dial_code));
            if (foundCountry) {
                setSelectedCountry(foundCountry);
                setPhoneNumber(value.replace(foundCountry.dial_code, ''));
            } else {
                setPhoneNumber(value);
            }
        }
    }, [value]); // Ajout de value comme dépendance pour mise à jour externe

    // Fermer le dropdown au clic dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePhoneChange = (e) => {
        // Ne garder que les chiffres
        let rawValue = e.target.value.replace(/[^0-9]/g, '');

        // CORRECTION : Supprimer le 0 au début s'il est saisi (ex: 0555 -> 555)
        if (rawValue.startsWith('0')) {
            rawValue = rawValue.substring(1);
        }

        setPhoneNumber(rawValue);

        // Remonter la valeur complète au parent avec métadonnées
        onChange({
            target: {
                name: name,
                value: selectedCountry.dial_code + rawValue,
                country: selectedCountry // Ajout des infos pays
            }
        });
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearchQuery('');

        // Mettre à jour avec le nouveau code pays et métadonnées
        onChange({
            target: {
                name: name,
                value: country.dial_code + phoneNumber,
                country: country
            }
        });
    };

    const filteredCountries = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.dial_code.includes(searchQuery)
    );

    return (
        <div className="relative" ref={dropdownRef} dir="ltr">
            <div className="flex">
                {/* Sélecteur de Pays */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-3 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
                >
                    <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                    <span className="mr-1">{selectedCountry.dial_code}</span>
                    <ChevronDown size={14} />
                </button>

                {/* Input Numéro */}
                <div className="relative w-full">
                    <input
                        type="tel"
                        className="block w-full p-2.5 z-20 text-sm text-gray-900 bg-white rounded-e-lg border-s-0 border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:border-s-gray-700  dark:focus:border-primary-500 dark:text-white"
                        placeholder={placeholder || "123 456 789"}
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        required={required}
                    />
                </div>
            </div>

            {/* Dropdown Liste */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-hidden flex flex-col">
                    {/* Recherche */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-2 top-2 text-gray-400" size={14} />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2 py-1 text-sm rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Liste Scrollable */}
                    <div className="overflow-y-auto flex-1">
                        {filteredCountries.map((country) => (
                            <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${selectedCountry.code === country.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                <span className="text-xl">{country.flag}</span>
                                <span className="flex-1 text-gray-700 dark:text-gray-200">{country.name}</span>
                                <span className="text-gray-400 font-mono text-xs">{country.dial_code}</span>
                            </button>
                        ))}
                        {filteredCountries.length === 0 && (
                            <div className="text-center py-2 text-sm text-gray-500">Aucun résultat</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhoneInput;
