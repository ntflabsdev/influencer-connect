"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';
import { useToast } from '../components/ToastProvider.js';

export const usePaginatedFetch = (path, deps = []) => {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { push } = useToast();

  const load = useCallback(
    async (nextPage = page) => {
      setLoading(true);
      setError('');
      try {
        const query = `?page=${nextPage}&limit=10`;
        const res = await apiFetch(`${path}${query}`);
        setData(res.offers || res.documents || []);
        setPage(res.page || 1);
        setPages(res.pages || 1);
        setTotal(res.total || 0);
      } catch (err) {
        setError(err.message);
        push(err.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [path, page],
  );

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, page, pages, total, loading, error, load, setPage };
};

