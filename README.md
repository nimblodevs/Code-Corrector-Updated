# MediCore Hospital Management System (HMS)

A fully-featured, visual-first clinical and operational workstation powered by React + Vite + Tailwind CSS on the frontend, and Node.js + Express on the backend.

---

## 🎨 Visual Philosophy & Aesthetic Style

MediCore HMS is built with an elegant, highly-polished **Slate Dark Theme**:
- **Typography Pairings**: Bold Space Grotesk-inspired displays paired with JetBrains Mono monospace readouts for codes, patient numbers, and billing states.
- **Rhythm & negative space**: Generous padding, intentional margin variations, and distinctive subtle elevations that make patient records highly legible.
- **Zero Tech-Larping**: Authentically clean, business-grade interface devoid of artificial server coordinates, mock telemetry lines, or unsolicited console-style noise.

---

## ✨ Features & Capabilities

### 📇 Expanded Patient Registration Form & Wizard
We have expanded the patient intake schema to align with modern international/WHO standards:
- **Comprehensive Demographics**: Supports Titles (Mr, Mrs, Dr, Prof, etc.), National ID/Passport, KRA PIN (Tax ID), Occupation, primary language, religion, educational level, and employment status.
- **Advanced Contact & Address Tracking**: Structured details including street address, estate, sub-county, city, county, postal boxes, and national regions.
- **Next of Kin (NOK) & Emergency Consent**: Integrated NOK tracking (including contact ID/passport, email, residence) and customizable emergency release authorizations.
- **Multi-channel Payer Configuration**: Dynamic forms handling Cash, Corporates (Staff IDs, departments, grades), and Insurance providers (policy number, NHIF validation, co-pay tiers).
- **Compliance & Consent Suite**: Interactive checkboxes for Treatment Consent, Data Privacy (GDPR/HIPAA/NDPR compliance), Emergency treatment waivers, and SMS/Email notification options.
- **Anti-Double-Submission Guard**: Elegant rotating CSS loader integrated into all submission actions (`Save`, `Save Details`, `Complete Registration`) with complete button disablement to prevent duplicate entry submissions.

### 🏥 Centralized Ward & Triage Controls
- Multi-tier emergency priority classification with responsive telemetry visualizers.
- Dynamic queue routing that seamlessly integrates patient registration directly with clinical triage and billing.

---

## 🚀 Running the App

### 📦 Installation
Ensure you have Node.js 20+ installed. Install workspace dependencies:
```bash
npm install
```

### 💻 Running Development Servers
Run both the frontend and backend concurrently:
```bash
npm run dev
```

### 🛠️ Code Validation
Check for styling issues, type safety, and verify production compilation:
```bash
npm run lint
npm run build
```

---

## 📁 Technical Architecture

- `/frontend/src/HMS.jsx`: Core container state, page routers, and global navigation.
- `/frontend/src/pages/RegistrationForm.jsx`: The comprehensive patient intake, historic records, and files manager.
- `/frontend/src/pages/RegisterPage.jsx`: Active queue registration wizard.
- `/frontend/src/components/SharedComponents.jsx`: Modular, styled layout blocks, custom sidebars, and input overlays.
- `/frontend/src/data/constants.js`: Reference dropdown options, schemas, and WHO-standard constant lists.
