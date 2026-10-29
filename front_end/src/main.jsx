import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
// Fonts are bundled and served from our own server (no request to Google).
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/inter/900.css'
import '@fontsource/playfair-display/600.css'
import '@fontsource/playfair-display/700.css'
import '@/index.css'

// The header defaults to Arabic while most pages defaulted to German, so a
// first-time visitor saw an Arabic menu with German content. Store the
// default once so every page starts in the same language.
try {
  if (!localStorage.getItem('einstein_lang')) localStorage.setItem('einstein_lang', 'ar')
} catch {
  // storage blocked: pages fall back to their own default
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
