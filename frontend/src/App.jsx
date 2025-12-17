import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [cardUrl, setCardUrl] = useState(null)
  const [promptText, setPromptText] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Haal nieuwe data op
    fetch('https://eternal-xmas.onrender.com/visit')
      .then(res => {
        if (!res.ok) throw new Error("Server reageert niet")
        return res.json()
      })
      .then(data => {
        console.log("Ontvangen:", data); // Kijk in je console (F12)
        setCardUrl(data.imageUrl)
        // We halen de prompt uit de URL om te laten zien wat het is
        const promptRaw = data.imageUrl.split('/prompt/')[1].split('?')[0];
        setPromptText(decodeURIComponent(promptRaw));
        setLoading(false)
      })
      .catch(err => {
        console.error("Fout:", err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#0f172a',
      color: 'white',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      {loading && <h2>🎄 De kerstmagie wordt gebrouwen...</h2>}
      
      {error && <h2 style={{color: 'red'}}>Oeps: {error}</h2>}

      {!loading && !error && cardUrl && (
        <>
          <h1 style={{ marginBottom: '20px', textShadow: '0 0 10px gold' }}>Jouw Eeuwige Kerstkaart</h1>
          
          <div style={{ 
            border: '15px solid #b91c1c', 
            padding: '10px', 
            backgroundColor: 'white',
            boxShadow: '0 0 50px rgba(255,215,0,0.5)'
          }}>
            <img 
              src={cardUrl} 
              alt="Kerstkaart" 
              width="500"
              height="500"
              style={{ display: 'block', maxWidth: '100%', height: 'auto' }} 
              onError={(e) => {
                e.target.style.display = 'none';
                setError("Plaatje kon niet laden (Check Console)");
              }}
            />
          </div>
          
          <p style={{ marginTop: '20px', opacity: 0.8, fontStyle: 'italic', maxWidth: '600px', textAlign: 'center' }}>
            "{promptText}"
          </p>
          <button onClick={() => window.location.reload()} style={{
            marginTop: '30px', padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer'
          }}>
            Nog een kaart! 🔄
          </button>
        </>
      )}
    </div>
  )
}

export default App