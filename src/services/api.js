const BASE_URL = 'https://esn-activities-api.onrender.com'

function buildUrl(path, params = {}) {
  const url = new URL(path, BASE_URL)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

function normalizeError(errorPayload, fallback) {
  if (!errorPayload) {
    return fallback
  }

  if (typeof errorPayload === 'string') {
    return errorPayload
  }

  if (typeof errorPayload?.detail === 'string') {
    return errorPayload.detail
  }

  if (Array.isArray(errorPayload?.detail) && errorPayload.detail.length > 0) {
    return errorPayload.detail.map((item) => item.msg || JSON.stringify(item)).join(', ')
  }

  return fallback
}

async function request(path, params) {
  const response = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const fallback = `Request failed (${response.status})`
    throw new Error(normalizeError(payload, fallback))
  }

  return payload
}

export function getCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }
  if (Array.isArray(payload?.data)) {
    return payload.data
  }
  return []
}

export function getHealth() {
  return request('/api/v1/health')
}

export function getCountries() {
  return request('/api/v1/countries')
}

export function getSectionsByCountry(countryCode) {
  return request(`/api/v1/countries/${encodeURIComponent(countryCode)}/sections`)
}

export function searchSections(params) {
  return request('/api/v1/sections', params)
}

export function getEvents(params) {
  return request('/api/v1/events', params)
}
