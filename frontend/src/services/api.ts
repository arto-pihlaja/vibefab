export type StyleConsultRequest = {
  imageFile: File
  occasion:
    | 'business_meeting'
    | 'interview'
    | 'date'
    | 'concert'
    | 'dinner_party'
    | 'wedding'
    | 'casual_outing'
}

export type StyleConsultResponse = {
  advice: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export async function requestStyleConsultation(
  payload: StyleConsultRequest
): Promise<StyleConsultResponse> {
  const form = new FormData()
  form.append('image', payload.imageFile)
  form.append('occasion', payload.occasion)

  const res = await fetch(`${API_BASE_URL}/api/style/consult`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Backend error (${res.status}): ${text || res.statusText}`)
  }
  return (await res.json()) as StyleConsultResponse
}


