const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => HTML_ESCAPES[character])
}

export function safeHttpUrl(value) {
  if (!value) return ''

  try {
    const url = new URL(String(value))
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''
  } catch {
    return ''
  }
}

export function safePhoneUrl(value) {
  const phone = String(value ?? '').trim()
  if (!phone || !/^[+().\-\s\d]+$/.test(phone)) return ''
  return `tel:${phone.replace(/[().\-\s]/g, '')}`
}
