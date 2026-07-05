import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { TimerProvider } from './context/TimerContext';
import { BodyProvider } from './context/BodyContext';
import App from './App';
import './index.css';

// Restore original URL after GitHub Pages 404 redirect
const redirect = sessionStorage.getItem("redirect");
if (redirect) {
  sessionStorage.removeItem("redirect");
  const url = new URL(redirect);
  if (url.pathname !== "/forge-gymAK/" && url.pathname !== "/forge-gymAK") {
    window.history.replaceState(null, "", url.pathname + url.search);
  }
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/forge-gymAK">
      <UserProvider>
        <WorkoutProvider>
          <TimerProvider>
            <BodyProvider>
              <App />
            </BodyProvider>
          </TimerProvider>
        </WorkoutProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
);
