'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './LocationInput.module.css';

interface LocationResult {
    city: string;
    country: string;
    lat: number;
    lng: number;
}

interface LocationInputProps {
    value: string;
    onSelect: (result: LocationResult) => void;
    onClear?: () => void;
    placeholder?: string;
}

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        state?: string;
        country?: string;
    };
}

export default function LocationInput({ value, onSelect, onClear, placeholder = 'Type a city...' }: LocationInputProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const lastRequestTime = useRef<number>(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value changes
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }
        // Rate limit: max 1 request per second (Nominatim fair-use policy)
        const now = Date.now();
        if (now - lastRequestTime.current < 1000) return;
        lastRequestTime.current = now;

        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&featuretype=city`,
                {
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'ROPA-marketplace/1.0 (contact@ropa.trade)',
                    },
                }
            );
            const data: NominatimResult[] = await res.json();
            setSuggestions(data);
            setIsOpen(data.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(val), 300);
    };

    const handleSelect = (result: NominatimResult) => {
        const city = result.address.city || result.address.town || result.address.village || result.address.municipality || result.address.state || '';
        const country = result.address.country || '';
        const displayText = city ? `${city}, ${country}` : country;

        setQuery(displayText);
        setSuggestions([]);
        setIsOpen(false);
        onSelect({
            city,
            country,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
        });
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
        onClear?.();
    };

    const formatSuggestion = (result: NominatimResult) => {
        const city = result.address.city || result.address.town || result.address.village || result.address.municipality || result.address.state || '';
        const country = result.address.country || '';
        return { city, country };
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <div className={styles.inputWrap}>
                <input
                    type="text"
                    className={styles.input}
                    value={query}
                    onChange={handleChange}
                    onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                {loading && <span className={styles.spinner}>...</span>}
                {query && !loading && (
                    <button className={styles.clearBtn} onClick={handleClear} aria-label="Clear location">✕</button>
                )}
            </div>
            {isOpen && suggestions.length > 0 && (
                <ul className={styles.dropdown}>
                    {suggestions.map((s, i) => {
                        const { city, country } = formatSuggestion(s);
                        return (
                            <li key={i}>
                                <button className={styles.suggestion} onClick={() => handleSelect(s)}>
                                    <span className={styles.suggestionIcon}>📍</span>
                                    <span className={styles.suggestionText}>
                                        <span className={styles.suggestionCity}>{city || s.display_name.split(',')[0]}</span>
                                        {country && <span className={styles.suggestionCountry}>{country}</span>}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
