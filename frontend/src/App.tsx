import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { requestStyleConsultation } from './services/api'

function formatAdviceText(text: string): React.ReactNode {
  // Split into lines for processing
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let currentList: string[] = []
  let key = 0

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key++} style={{ marginLeft: 16, marginBottom: 12 }}>
          {currentList.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      )
      currentList = []
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    if (!trimmed) {
      flushList()
      elements.push(<br key={key++} />)
      return
    }

    // Headers (## or ###)
    if (trimmed.startsWith('##')) {
      flushList()
      const headerText = trimmed.replace(/^#+\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      elements.push(
        <h3 key={key++} style={{ 
          color: '#333', 
          marginTop: index === 0 ? 0 : 20, 
          marginBottom: 10,
          fontSize: '1.2em',
          fontWeight: 'bold'
        }}>
          <span dangerouslySetInnerHTML={{ __html: headerText }} />
        </h3>
      )
      return
    }

    // List items
    if (trimmed.match(/^[*-]\s/)) {
      const listText = trimmed.replace(/^[*-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      currentList.push(listText)
      return
    }

    // Regular paragraphs
    flushList()
    const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    elements.push(
      <p key={key++} style={{ marginBottom: 12, lineHeight: 1.5 }}>
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
      </p>
    )
  })

  flushList()
  return elements
}

type Occasion =
  | 'business_meeting'
  | 'interview'
  | 'date'
  | 'concert'
  | 'dinner_party'
  | 'wedding'
  | 'casual_outing'

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [occasion, setOccasion] = useState<Occasion | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string | null>(null)

  const previewUrl = useMemo(() => {
    if (!imageFile) return ''
    return URL.createObjectURL(imageFile)
  }, [imageFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      setImageFile(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }
    setImageFile(file)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!imageFile || !occasion) {
      alert('Please select an image and an occasion.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setAdvice(null)
      const res = await requestStyleConsultation({ imageFile, occasion })
      setAdvice(res.advice)
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ 
          marginBottom: 8,
          color: '#2c3e50',
          fontSize: '2.2em',
          fontWeight: 'bold'
        }}>
          VibeFab
        </h1>
        <p style={{ 
          color: '#7f8c8d',
          fontSize: '1.1em',
          margin: 0 
        }}>
          Your AI-Powered Personal Style Consultant
        </p>
      </header>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
        <div>
          <label htmlFor="photo" style={{ 
            display: 'block', 
            marginBottom: 8,
            fontWeight: '600',
            color: '#34495e'
          }}>
            Upload Your Photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              padding: 8,
              border: '2px solid #bdc3c7',
              borderRadius: 6,
              fontSize: '14px'
            }}
          />
        </div>

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected preview"
            style={{ 
              maxWidth: '100%', 
              borderRadius: 12, 
              border: '1px solid #bdc3c7',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}
          />
        ) : null}

        <div>
          <label htmlFor="occasion" style={{ 
            display: 'block', 
            marginBottom: 8,
            fontWeight: '600',
            color: '#34495e'
          }}>
            Select Occasion
          </label>
          <select
            id="occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value as Occasion | '')}
            style={{ 
              padding: 12,
              fontSize: '15px',
              border: '2px solid #bdc3c7',
              borderRadius: 6,
              width: '100%',
              backgroundColor: 'white'
            }}
          >
            <option value="">Choose an occasion...</option>
            <option value="business_meeting">Business Meeting</option>
            <option value="interview">Job Interview</option>
            <option value="date">Date Night</option>
            <option value="concert">Concert</option>
            <option value="dinner_party">Dinner Party</option>
            <option value="wedding">Wedding</option>
            <option value="casual_outing">Casual Outing</option>
          </select>
        </div>

        <div>
          <button 
            type="submit" 
            disabled={!imageFile || !occasion || loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: !imageFile || !occasion || loading ? '#bdc3c7' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: !imageFile || !occasion || loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Analyzing Your Style...' : 'Get My Style Recommendations'}
          </button>
        </div>

        {error ? (
          <div style={{ color: 'crimson' }}>{error}</div>
        ) : null}

        {advice ? (
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 20,
              background: '#fafafa',
              maxWidth: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ 
              margin: '0 0 16px 0',
              color: '#2c3e50',
              borderBottom: '2px solid #3498db',
              paddingBottom: 8,
              fontSize: '1.4em'
            }}>
              Your Style Recommendations
            </h2>
            <div style={{ 
              fontSize: '15px',
              color: '#444',
              lineHeight: 1.6 
            }}>
              {formatAdviceText(advice)}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  )
}

export default App
