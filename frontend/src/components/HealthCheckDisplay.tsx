import { useEffect, useState } from 'react';
import { fetchHealth } from '../services/apiClient';

export default function HealthCheckDisplay() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchHealth()
      .then((res) => setStatus(res.status))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Health: {status || 'loading...'}</div>;
}
