import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@design-lab/system/tokens.css'
import '@design-lab/system/styles.css'
import { DesignLabI18nProvider } from '@design-lab/system/i18n'
import App from './App'
import './styles/main.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesignLabI18nProvider locale="en"><App /></DesignLabI18nProvider>
  </StrictMode>,
)
