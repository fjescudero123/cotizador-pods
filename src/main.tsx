import React from 'react'
import ReactDOM from 'react-dom/client'
import { initMayuHooks } from '@mayu/hooks'
import { db } from './firebase'
import App from './App'
import './index.css'

initMayuHooks({ db })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
