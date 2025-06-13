import { useState } from 'react';
import HealthCheckDisplay from '../components/HealthCheckDisplay';
import FileUpload from '../components/FileUpload';
import CanvasDisplay from '../components/CanvasDisplay';

export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  return (
    <div>
      <h1>Welcome to Shiny Broccoli</h1>
      <HealthCheckDisplay />
      <div className="my-4">
        <FileUpload onUploaded={setImage} />
      </div>
      <CanvasDisplay image={image} />
    </div>
  );
}
