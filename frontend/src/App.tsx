import Router from './router';
import FileUpload from './components/FileUpload'; // Import FileUpload
import { useState, useRef } from 'react'; // Import useState and useRef

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textPrompt, setTextPrompt] = useState('');
  const submitHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'result'>('editor');
  const [result, setResult] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = (file: File | null) => {
    setImageFile(file);
    console.log("File selected in App:", file?.name);
  };

  const handlePromptSubmit = (prompt: string) => {
    setTextPrompt(prompt);
    console.log("Prompt submitted in App:", prompt);
  };

  const handleSubmitReady = (handler: () => Promise<void>) => {
    submitHandlerRef.current = handler;
  };

  const handleResult = (file: File) => {
    setResult(file);
    setIsProcessing(false); // Stop processing when result is received
    setActiveTab('result'); // Switch to results tab when result is available
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setIsProcessing(false); // Stop processing on error
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setError(''); // Clear any previous errors
    setActiveTab('result'); // Switch to results tab to show progress
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitHandlerRef.current && imageFile && textPrompt) {
      try {
        handleProcessingStart(); // Start processing indicator
        await submitHandlerRef.current();
      } catch (error) {
        console.error('Generation failed:', error);
        setIsProcessing(false); // Stop processing on error
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
          <div className="control-group">
            <label htmlFor="image-upload">1. Upload Image</label>
            {/* Render FileUpload here, passing an id and onUploaded handler */}
            <FileUpload id="image-upload" onUploaded={handleFileSelected} />
          </div>

          <div className="control-group">
            <label>2. Create a Mask</label>
            <p className="description">Use the tools in the editor to mark the area you want to change.</p>
          </div>

          {/* Render PromptInput here, passing an onSubmit handler */}
          <div className="control-group">
            <label htmlFor="text-prompt">3. Describe Your Change</label>
            {/* Assuming PromptInput renders a textarea with id="text-prompt" */}
            <textarea id="text-prompt" className="text-input" rows={4} placeholder="e.g., 'make the hedgehog wear sunglasses'" onChange={e => setTextPrompt(e.target.value)} value={textPrompt}></textarea>
          </div>
          {/* NOTE: The submit button is part of the form, but outside the last control-group for layout purposes. */}
        </form>
        <button type="submit" form="editor-form" id="submit-button" className="submit-button" disabled={!imageFile || !textPrompt || !submitHandlerRef.current}>
          Generate
        </button>
      </aside>
      <main className="editor-panel">
        <div className="tabs-container">
          <button 
            id="tab-editor" 
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            Editor
          </button>
          <button 
            id="tab-result" 
            className={`tab-button ${activeTab === 'result' ? 'active' : ''}`}
            onClick={() => setActiveTab('result')}
          >
            Result
            {isProcessing && <span className="tab-processing-pie"></span>}
          </button>
        </div>
        <div className="content-container">
          <div id="editor-content" className={`tab-content ${activeTab === 'editor' ? 'active' : ''}`}>
            {/* Router renders HomePage. HomePage needs to receive imageFile and textPrompt as props, or access them via context */}
            <Router image={imageFile} prompt={textPrompt} onSubmitReady={handleSubmitReady} onResult={handleResult} onError={handleError} onProcessingStart={handleProcessingStart} />
          </div>
          <div id="result-content" className={`tab-content ${activeTab === 'result' ? 'active' : ''}`}>
            {/* The result image will be displayed here */}
            {result ? (
              <div className="result-only-display">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Generated Result</h3>
                  <a
                    href={URL.createObjectURL(result)}
                    download="result.png"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline focus:outline-blue-500"
                  >
                    Download Result
                  </a>
                </div>
                <div className="flex justify-center">
                  <img 
                    src={URL.createObjectURL(result)} 
                    alt="Generated result" 
                    style={{ 
                      width: '320px', 
                      height: '320px',
                      objectFit: 'contain'
                    }}
                    className="border rounded shadow-lg" 
                    loading="lazy" 
                  />
                </div>
              </div>
            ) : isProcessing ? (
              <div className="processing-status">
                <div className="spinner mb-4"></div>
                <h3>Generating Image...</h3>
                <p>This usually takes about 20 seconds</p>
              </div>
            ) : (
              <p>No results yet. Generate an image in the Editor tab to see results here.</p>
            )}
            {error && <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
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
