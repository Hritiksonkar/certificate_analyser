# Specification

## Summary
**Goal:** Build an Internet Computer (Motoko) canister-backed academic certificate issuance and verification app with Internet Identity authentication, QR-based verification URLs, and a consistent themed UI.

**Planned changes:**
- Implement a single Motoko canister data model to store immutable certificate records (certificateId, studentId, studentName, degree, year, issuer Principal, issuedAt timestamp, SHA-256 certificateHash) and expose update/query APIs to issue, fetch, and verify by certificateId.
- Define and document deterministic input canonicalization rules so the same certificate payload always produces the same SHA-256 hash.
- Add role-aware access control: only admin principals can issue certificates; public verification queries remain unauthenticated; include admin management (initial admin = canister controller; admins can add/remove admins).
- Create a University Admin frontend dashboard (Internet Identity login) to issue certificates and display certificateId, computed hash, and a generated QR code linking to `/verify?certId=...`.
- Create a Student frontend dashboard (Internet Identity login) to search/view certificates by Student ID and open a certificate detail view showing all fields plus QR code and verification link.
- Create a public Employer/Verifier page (no login) to verify a certificate by Certificate ID; optionally recompute SHA-256 client-side from user-entered fields and compare to the stored hash; display Valid/Invalid/Not Found with clear accessible styling.
- Add an Admin issuance history view listing issued certificates with timestamps and issuer identity, with pagination or incremental “Load more”.
- Apply a coherent Tailwind + shadcn-based theme across all pages with consistent layout/nav, English-only UI text, and a primary palette that avoids blue/purple.

**User-visible outcome:** Admins can log in to issue certificates and get a QR verification link; students can log in to find and view their certificates (including QR/verification link); employers can open the public verify page (including via QR) to check authenticity and see Valid/Invalid/Not Found results plus the stored certificate record when found.
