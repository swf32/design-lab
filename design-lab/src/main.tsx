import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@design-lab/system/tokens.css'
import { DesignLabI18nProvider } from '@design-lab/system/i18n'
import App from './App'
import { ComponentCaptureView } from './views/ComponentCaptureView/ComponentCaptureView'
import './styles/globals.scss'

const rootView =
  window.location.pathname === '/__capture/component' ? <ComponentCaptureView /> : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesignLabI18nProvider locale="en">{rootView}</DesignLabI18nProvider>
  </StrictMode>,
)
