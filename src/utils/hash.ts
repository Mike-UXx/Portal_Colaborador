// Simulates SHA-256 document hashing for audit trail integrity
export async function computeDocumentHash(content: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof content === 'string') {
    buffer = new TextEncoder().encode(content).buffer as ArrayBuffer;
  } else {
    buffer = content;
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256:${hashHex}`;
}

export function generateRecordId(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return `acc-${Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12)}`;
}

// Simulates WORM/append-only log entry — record is frozen on creation
export function freezeRecord<T extends object>(record: T): Readonly<T> {
  return Object.freeze({ ...record });
}
