import type { Evidence } from '../types';

// Fetches client IP from a public API — falls back to 'unavailable' for offline/test
async function fetchClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    const data = await res.json() as { ip: string };
    return data.ip;
  } catch {
    return '0.0.0.0';
  }
}

export async function collectEvidence(documentHash: string): Promise<Evidence> {
  const ip = await fetchClientIp();
  return {
    ip,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    documentHash,
  };
}
