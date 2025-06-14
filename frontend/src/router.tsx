import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

// Define props for Router if it needs to pass them to HomePage
interface RouterProps {
  image: File | null;
  prompt: string;
  onSubmitReady?: (submitHandler: () => Promise<void>) => void;
}

export default function Router({ image, prompt, onSubmitReady }: RouterProps) {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pass image and prompt to HomePage */}
        <Route path="/" element={<HomePage image={image} prompt={prompt} onSubmitReady={onSubmitReady} />} />
      </Routes>
    </BrowserRouter>
  );
}
