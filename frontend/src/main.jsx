import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

import { Provider } from 'react-redux';
import { store, persistor } from './redux/store.js';
import { PersistGate } from 'redux-persist/es/integration/react.js';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
          <Toaster richColors position="top-right" />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
