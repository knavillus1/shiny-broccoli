import { useState } from 'react';
import HealthCheckDisplay from '../components/HealthCheckDisplay';
import FileUpload from '../components/FileUpload';
import CanvasDisplay from '../components/CanvasDisplay';
import PromptInput from '../components/PromptInput';

export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const handlePrompt = (p: string) => setPrompt(p);
  return (
    <div>
      <h1>Welcome to Shiny Broccoli</h1>
      <HealthCheckDisplay />
      <div className="my-4">
        <FileUpload onUploaded={setImage} />
      </div>
      <PromptInput onSubmit={handlePrompt} />
      <CanvasDisplay image={image} prompt={prompt} />
    </div>
  );
}
