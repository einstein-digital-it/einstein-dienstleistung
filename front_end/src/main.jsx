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

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
