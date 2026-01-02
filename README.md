# Generate Plans

Automatically generate pharmacist care plans from structured patient intake data and clinical records.
This project focuses on data integrity, deterministic validation, and safe LLM usage in a healthcare workflow.

# Overview

Specialty pharmacies spend significant time manually assembling care plans from patient records for compliance and reimbursement.
This tool provides a structured intake workflow that validates inputs, detects duplicates, and generates a standardized pharmacist care plan using an LLM (with safe fallbacks).

The emphasis is on correctness and reliability over UI polish.

# Tech Stack & Rationale
Backend

Node.js + TypeScript (Express)

Chosen to focus on data integrity, validation, and deterministic behavior without framework ramp-up.

In production, this design could be implemented equivalently in Django or another backend framework.

MongoDB

Well-suited for document-like clinical data and rapid iteration.

Strong uniqueness constraints and indexes enforce deterministic duplicate detection.

Core logic would translate directly to Postgres with unique constraints and indexes.

Frontend

React + Vite

Simple internal-tool UI focused on clarity and workflow, not branding.

LLM

OpenAI (configurable via env)

Used to generate care plans in a fixed, compliance-friendly template.

Safe fallback to a deterministic template if the LLM is unavailable.

# Feature Prioritization

P0 (Core)

Strict input validation (MRN, NPI, DOB, ICD-10)

Deterministic duplicate detection

Structured care plan generation

End-to-end workflow (intake → generate → download)

P1

File upload for patient records

Duplicate patient warnings (non-blocking)

UX improvements for validation feedback

# Input Handling
Patient Identity

MRN: exactly 6 digits

DOB: required; cannot be in the future

Duplicate warning:

If first name + last name + DOB match an existing patient but MRN differs, a dismissible warning is shown.

The user may proceed after review.

Patient Records

Records can be provided in one of two ways:

Paste preprocessed text

Upload a file

.txt (recommended)

.pdf (supported only if text-based)

Scanned/image-only PDFs require OCR and are intentionally not supported in this prototype.

Uploaded files override pasted text.

# Output

A standardized pharmacist care plan with fixed sections:

Drug therapy problems

SMART goals

Interventions

Monitoring plan

Patient education

Follow-up & documentation

Output is generated as a downloadable .txt file (confirmed acceptable by Lamar Health).

# Sample Input

(excerpt)

Name: A.B. (Fictional)
MRN: 00012345
DOB: 1979-06-08
Medication: IVIG
Primary diagnosis: Generalized myasthenia gravis (AChR antibody positive)
Secondary diagnoses: Hypertension, GERD
...

# Sample Output
1. Problem list / Drug therapy problems (DTPs)
- Need for rapid symptomatic control of generalized myasthenia gravis
- Monitoring for infusion-related reactions

2. Goals (SMART)
- Maintain or improve respiratory function within 2 weeks post-IVIG
...

6. Follow-up & documentation
- Neurology follow-up in 4 weeks
- Document response and adverse effects

# Setup & Running Locally
Backend
cd backend
cp .env.example .env
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev


MongoDB runs via Docker:

docker compose up -d

# Environment Variables
MONGODB_URI=...
PORT=3001

LLM_PROVIDER=mock | openai
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini


Tests always run with LLM_PROVIDER=mock.

# Notes & Limitations

PDF support is limited to text-based PDFs (no OCR).

Authentication and audit logging are out of scope for this prototype.

The UI is intentionally minimal and reflects an internal clinical tool.

# Why This Approach

The project prioritizes:

Deterministic behavior

Safe failure modes

Clear validation and warnings

Production-oriented tradeoffs

This mirrors real-world healthcare systems where correctness and auditability matter more than UI polish.

# Next Steps (If Extended)

OCR for scanned PDFs

Role-based access

Audit logs

Structured reporting exports