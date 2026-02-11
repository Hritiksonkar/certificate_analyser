export function buildVerificationUrl(certificateId: string | bigint): string {
  const id = typeof certificateId === 'bigint' ? certificateId.toString() : certificateId;
  const baseUrl = window.location.origin;
  return `${baseUrl}/verify?certId=${id}`;
}

export function getCertIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('certId');
}
