import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { requestStyleConsultation } from './services/api'

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
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>VibeFab - Style Consultant</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <div>
          <label htmlFor="photo" style={{ display: 'block', marginBottom: 8 }}>
            Upload a photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected preview"
            style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #ccc' }}
          />
        ) : null}

        <div>
          <label htmlFor="occasion" style={{ display: 'block', marginBottom: 8 }}>
            Select occasion
          </label>
          <select
            id="occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value as Occasion | '')}
            style={{ padding: 8 }}
          >
            <option value="">Choose...</option>
            <option value="business_meeting">Business meeting</option>
            <option value="interview">Interview</option>
            <option value="date">Date</option>
            <option value="concert">Rock concert</option>
            <option value="dinner_party">Dinner party</option>
            <option value="wedding">Wedding</option>
            <option value="casual_outing">Casual outing</option>
          </select>
        </div>

        <div>
          <button type="submit" disabled={!imageFile || !occasion || loading}>
            {loading ? 'Getting advice…' : 'Get style advice'}
          </button>
        </div>

        {error ? (
          <div style={{ color: 'crimson' }}>{error}</div>
        ) : null}

        {advice ? (
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 12,
              background: '#fafafa',
            }}
          >
            <h2 style={{ margin: '0 0 8px 0' }}>Advice</h2>
            <p style={{ margin: 0 }}>{advice}</p>
          </div>
        ) : null}
      </form>
    </div>
  )
}

export default App
