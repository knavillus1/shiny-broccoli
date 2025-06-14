import Router from './router';
import FileUpload from './components/FileUpload'; // Import FileUpload
import { useState } from 'react'; // Import useState

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [submitHandler, setSubmitHandler] = useState<(() => Promise<void>) | null>(null);

  const handleFileSelected = (file: File | null) => {
    setImageFile(file);
    console.log("File selected in App:", file?.name);
  };

  const handlePromptSubmit = (prompt: string) => {
    setTextPrompt(prompt);
    console.log("Prompt submitted in App:", prompt);
  };

  const handleSubmitReady = (handler: () => Promise<void>) => {
    setSubmitHandler(() => handler);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitHandler && imageFile && textPrompt) {
      try {
        await submitHandler();
      } catch (error) {
        console.error('Generation failed:', error);
      }
    }
  };

  return (
    <div className="app-wrapper">
      <aside className="controls-panel">
        <header>
          <h1>Image<span>Mod</span></h1>
          <p>AI-powered image editor</p>
        </header>
        <form id="editor-form" noValidate onSubmit={handleGenerate}>
          {/* Render FileUpload here, passing an id and onUploaded handler */}
          <FileUpload id="image-upload" onUploaded={handleFileSelected} />

          <div className="control-group">
            <label htmlFor="mask-instruction">2. Select an Area</label>
            <p className="description">Click and drag on the image in the editor to create a mask for modification.</p>
          </div>

          {/* Render PromptInput here, passing an onSubmit handler */}
          <div className="control-group">
            <label htmlFor="text-prompt">3. Describe Your Change</label>
            {/* Assuming PromptInput renders a textarea with id="text-prompt" */}
            <textarea id="text-prompt" className="text-input" rows={4} placeholder="e.g., 'make the cat wear a wizard hat'" onChange={e => setTextPrompt(e.target.value)} value={textPrompt}></textarea>
          </div>
          <button type="submit" id="submit-button" className="submit-button" disabled={!imageFile || !textPrompt || !submitHandler}>
            Generate
          </button>
        </form>
      </aside>
      <main className="editor-panel">
        <div className="tabs-container">
          <button id="tab-editor" className="tab-button active">Editor</button>
          <button id="tab-result" className="tab-button">Result</button>
        </div>
        <div className="content-container">
          <div id="editor-content" className="tab-content active">
            {/* Router renders HomePage. HomePage needs to receive imageFile and textPrompt as props, or access them via context */}
            <Router image={imageFile} prompt={textPrompt} onSubmitReady={handleSubmitReady} />
          </div>
          <div id="result-content" className="tab-content">
            {/* The result image will be dynamically inserted here by component logic */}
          </div>
          <div id="loader-overlay" className="loader-overlay">
            <div className="spinner"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
