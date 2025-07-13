import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const CategoriesContext = createContext({
  categories: [],
  setCategories: () => {},
  refreshCategories: () => {},
  loading: false,
  error: null,
  clearError: () => {},
});

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[FETCH] GET ${API_URL}/categories`);
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[FETCH] Categories response:', response.data);
      // Validate data structure
      const data = Array.isArray(response.data) ? response.data : [];
      setCategories(data);
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to fetch categories: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to fetch categories: Network error (${err.message})`;
      console.error(errorMessage, err);
      setError(errorMessage);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Expose refresh function
  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    console.log('[INIT] CategoriesProvider mounted, fetching categories...');
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        setCategories,
        refreshCategories,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}