import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

// Define props for Router if it needs to pass them to HomePage
interface RouterProps {
  image: File | null;
  prompt: string;
  onSubmitReady?: (submitHandler: () => Promise<void>) => void;
  onResult?: (file: File) => void;
  onError?: (errorMsg: string) => void;
}

export default function Router({ image, prompt, onSubmitReady, onResult, onError }: RouterProps) {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pass image and prompt to HomePage */}
        <Route path="/" element={<HomePage image={image} prompt={prompt} onSubmitReady={onSubmitReady} onResult={onResult} onError={onError} />} />
      </Routes>
    </BrowserRouter>
  );
}
