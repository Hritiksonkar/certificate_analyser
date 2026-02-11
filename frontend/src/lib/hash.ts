export async function computeCertificateHash(
  studentName: string,
  studentId: string,
  degree: string,
  year: number
): Promise<string> {
  // Canonicalize the input data
  const canonical = JSON.stringify({
    studentName: studentName.trim(),
    studentId: studentId.trim(),
    degree: degree.trim(),
    year,
  });

  // Compute SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export function getCanonicalRules(): string[] {
  return [
    'All text fields are trimmed of leading/trailing whitespace',
    'Fields are ordered: studentName, studentId, degree, year',
    'Data is JSON-stringified before hashing',
    'Hash algorithm: SHA-256',
  ];
}
