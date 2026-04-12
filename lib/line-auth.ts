import * as jose from 'jose'

const JWKS = jose.createRemoteJWKSet(new URL('https://api.line.me/oauth2/v2.1/certs'))

export async function verifyLineIdToken(idToken: string) {
  const channelId = process.env.LINE_CHANNEL_ID?.trim()
  if (!channelId) {
    throw new Error('LINE_CHANNEL_ID ไม่ได้ตั้งค่า')
  }
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: 'https://access.line.me',
    audience: channelId,
  })
  const sub = typeof payload.sub === 'string' ? payload.sub : null
  if (!sub) {
    throw new Error('ไม่พบ sub ใน ID token')
  }
  return {
    lineUserId: sub,
    displayName: typeof payload.name === 'string' ? payload.name : undefined,
  }
}

export function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null
  return auth.slice(7).trim() || null
}
