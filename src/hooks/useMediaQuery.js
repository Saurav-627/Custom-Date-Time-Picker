import { useState, useEffect } from 'react';

/**
 * Custom hook to detect screen size
 * @param {string} query The media query to match
 * @returns {boolean} Whether the query matches
 */
export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};

export const useMobile = () => useMediaQuery('(max-width: 768px)');
