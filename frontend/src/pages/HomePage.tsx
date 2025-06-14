import { useState, useEffect } from 'react';
import { fetchEditStatus } from '../services/apiClient';
import HealthCheckDisplay from '../components/HealthCheckDisplay';
import FileUpload from '../components/FileUpload';
import CanvasDisplay from '../components/CanvasDisplay';
import PromptInput from '../components/PromptInput';
import ResultsDisplay from '../components/ResultsDisplay';
import ErrorBoundary from '../components/ErrorBoundary';

export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const handleUpload = (f: File) => {
    setImage(f);
    setResult(null);
    setRequestId(null);
  };
  const handlePrompt = (p: string) => {
    setPrompt(p);
    setResult(null);
    setRequestId(null);
  };
  const handleCanvasResult = (file: File) => {
    void file; // preview ignored until processing completes
  };

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const status = await fetchEditStatus(requestId);
        if (status.status === 'completed' && status.result?.data?.[0]?.url) {
          const res = await fetch(status.result.data[0].url);
          const blob = await res.blob();
          const file = new File([blob], 'result.png', { type: 'image/png' });
          if (!cancelled) {
            setResult(file);
            setError('');
            clearInterval(interval);
          }
        } else if (status.status === 'error') {
          if (!cancelled) {
            setError(status.error || 'Processing failed');
            clearInterval(interval);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          clearInterval(interval);
        }
      }
    };
    const interval = setInterval(poll, 3000);
    poll();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [requestId]);
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <div>
        <h1>Welcome to Shiny Broccoli</h1>
        <HealthCheckDisplay />
        <div className="my-4">
          <FileUpload onUploaded={handleUpload} />
        </div>
        <PromptInput onSubmit={handlePrompt} />
        <CanvasDisplay
          image={image}
          prompt={prompt}
          onResult={handleCanvasResult}
          onError={setError}
          onRequestId={setRequestId}
        />
        {image && (
          <ResultsDisplay
            original={image}
            result={result}
            error={error || undefined}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
