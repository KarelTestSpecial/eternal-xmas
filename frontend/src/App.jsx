import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [cardUrl, setCardUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Roep de backend aan
    fetch('http://localhost:3000/visit')
      .then(res => res.json())
      .then(data => {
        setCardUrl(data.imageUrl)
        setLoading(false)
      })
      .catch(err => console.error("Fout bij laden:", err))
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#1a1a1a',
      color: 'white',
      flexDirection: 'column'
    }}>
      {loading ? (
        <p>De kerstmagie wordt geladen...</p>
      ) : (
        <>
          <h1>Jouw Eeuwige Kerstkaart</h1>
          <div style={{ border: '10px solid gold', padding: '10px', backgroundColor: 'white' }}>
            <img 
              src={cardUrl} 
              alt="Kerstkaart" 
              style={{ maxWidth: '90vw', maxHeight: '70vh', display: 'block' }} 
            />
          </div>
          <p style={{ marginTop: '20px', opacity: 0.7 }}>
            Kom later terug voor een nieuwe verrassing...
          </p>
        </>
      )}
    </div>
  )
}

export default App
