import React, { createContext, useState, useEffect } from 'react';

export const CategoriesContext = createContext({
  categories: [],
  setCategories: () => {}
});
export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      })
      .then(data => {
        // Data is already in the correct format
        setCategories(data);
      })
      .catch(err => {
        console.error('Fetch categories error:', err);
        setError(err.message);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, setCategories, loading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
}