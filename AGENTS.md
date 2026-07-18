# AI Agent Instructions & Project Guidelines (AGENTS.md)

This file contains persistent development principles, technical architecture standards, and styling design rules for the **MediCore Hospital Management System (HMS)** workspace.

---

## 1. Core Principles & Philosophy

- **Absolute Scope Discipline**: Only build features, screens, and API endpoints that are explicitly requested by the user. Do not introduce speculative secondary menus, "rich diagnostics", or unsolicited AI integrations unless requested.
- **Architectural Honesty**: Keep user interfaces humble, clean, and authentic.
  - **No Tech-Larping**: Do NOT add mock terminals, telemetry logs, network ping metrics (`"STATUS: LIVE"`, `"● ONLINE"`), container port indicators, or artificial database sync status messages to the page headers/footers.
  - **Literal Labeling**: Use plain, human-friendly, standard labels (e.g. "Current Time", "Billing Invoice") instead of overly dramatic terms.

---

## 2. Visual Design & Theme Guidelines

- **Primary Slate Dark Theme**:
  - A clean, high-contrast, eye-safe slate visual layout.
  - Immersive card styling using charcoal/navy borders and precise shadow elevations.
  - Bold displays pairing "Space Grotesk" or elegant display titles with "JetBrains Mono" monospace outputs for status badges and technical codes (patient numbers, billing IDs).
- **Whitespace & Rhythm**:
  - Maintain generous padding and margins. Vary the density intentionally between interactive grids and structured dashboards to establish an elegant rhythm.
  - Avoid generic, uniform margins everywhere. Let the whitespace highlight the visual hierarchy.

---

## 3. Registration Form & Wizard Standards

Following the demographics expansion, the patient registration system has been expanded to support a robust WHO-aligned record structure. Any modification to the registration wizard MUST adhere to these schema parameters:

### Expanded Registration Fields
- **Personal Details**: Title (`TITLES` dropdown), First Name, Middle Name, Last Name, Gender, DOB, Blood Group, National ID/Passport, KRA PIN, Occupation.
- **Demographics**: Primary Language (`LANGUAGES`), Nationality (`NATIONALITIES`), Religion (`RELIGIONS`), Education Level (`EDUCATION_LEVELS`), Employment Status (`EMPLOYMENT_STATUSES`).
- **Contact Info**: Street Address, Estate/Sub-County, City/Town, County (`COUNTIES`), State/Region, Postal Box, Postal Code, Country, Primary Phone, Alt. Phone, Email.
- **Next of Kin (NOK) & Emergency**: Full Name, Relationship, Primary Phone, ID/Passport Number, Email, Residential Address, Emergency Contact details.
- **Payer & Corporate Org**: Category (Cash, Insurance, Corporate), Company/Org details (Staff ID, Work Email, Department, Staff Grade), Insurance details (Provider, Member No, Policy No, Expiry, Co-pay Category, NHIF number).
- **Consents**: Treatment Consent, Data Privacy (HIPAA/GDPR alignment), Emergency Release, SMS/Email Opt-In.

### Anti-Double-Submission Rule
- Every registration page, detail pane, and wizard save button MUST employ a loading state indicator (`isSaving` or `regSaving`) with a rotating visual CSS spinner.
- The action buttons (`Save`, `Save Details`, `Complete Registration`) MUST be disabled during pending asynchronous writes to prevent double-submissions or duplicate records in local states or backend stores.

---

## 4. Coding & Component Conventions

- **React Imports**: Always place imports at the very top. Use named imports (no object destructuring for shared component assets where possible). Do not use `import type` for enum values.
- **HTML IDs**: Ensure that interactive controls, primary cards, layout sections, and custom buttons are assigned a unique, meaningful `id` attribute to simplify targeted styling and functional diagnostics.
- **Responsive Fluidity**: Implement responsive Tailwind boundaries (`sm:`, `md:`, `lg:`) with desktop-first precision, keeping touch target sizes at a minimum of `44px` on mobile displays.
