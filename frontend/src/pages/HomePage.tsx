import { useState } from 'react';
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
  const handlePrompt = (p: string) => setPrompt(p);
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <div>
        <h1>Welcome to Shiny Broccoli</h1>
        <HealthCheckDisplay />
        <div className="my-4">
          <FileUpload onUploaded={setImage} />
        </div>
        <PromptInput onSubmit={handlePrompt} />
        <CanvasDisplay
          image={image}
          prompt={prompt}
          onResult={setResult}
          onError={setError}
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
