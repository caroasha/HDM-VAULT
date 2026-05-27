import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

export const usePlans = () => {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/plans`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPlans(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { plans, loading };
};