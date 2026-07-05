import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { TimerProvider } from './context/TimerContext';
import { BodyProvider } from './context/BodyContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/forge-gym">
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
