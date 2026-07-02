import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Menu from './menu.jsx'
import SongSearch from './song_search.jsx'
import About from './about.jsx'

function App() {
  const [page, setPage] = useState('menu')

  switch (page) {
    case 'search':
      return <SongSearch onNavigate={setPage} />
    case 'about':
      return <About onNavigate={setPage} />
    case 'menu':
    default:
      return <Menu onNavigate={setPage} />
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
