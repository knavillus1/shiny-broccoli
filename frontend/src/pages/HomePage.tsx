import HealthCheckDisplay from '../components/HealthCheckDisplay';
import FileUpload from '../components/FileUpload';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Shiny Broccoli</h1>
      <HealthCheckDisplay />
      <div className="my-4">
        <FileUpload />
      </div>
    </div>
  );
}
