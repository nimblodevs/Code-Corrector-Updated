import { useEffect, useMemo, useRef, useState } from "react";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cormorant+Garamond:wght@600;700&display=swap";

const C = {
  bg: "#f0f4f8",
  card: "#ffffff",
  border: "#d1dce6",
  borderFocus: "#1a7fa8",
  accent: "#1a7fa8",
  accentDark: "#0e6a8f",
  accentLight: "#e8f4f9",
  accentMid: "#c2e0ed",
  text: "#1a2e3b",
  label: "#4a6070",
  muted: "#6b8494",
  placeholder: "#9ab0be",
  danger: "#dc2626",
  dangerDark: "#991b1b",
  dangerLight: "#fef2f2",
  success: "#16a34a",
  successLight: "#dcfce7",
  warning: "#d97706",
  warningLight: "#fffbeb",
  header: "#1a2e3b",
  rule: "#dde8ef",
  shadow: "0 1px 3px rgba(26,46,59,0.08)",
  shadowMd: "0 4px 16px rgba(26,46,59,0.10)",
  shadowLg: "0 16px 48px rgba(26,46,59,0.13)",
};

const COUNTIES = [
  "",
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Embu",
  "Garissa",
  "Kajiado",
  "Kiambu",
  "Kisumu",
  "Mombasa",
  "Nairobi",
  "Nakuru",
  "Nyeri",
  "Uasin Gishu",
];

const TITLES = ["", "Mr.", "Mrs.", "Ms.", "Miss", "Dr.", "Prof.", "Rev.", "Hon."];
const EDUCATION_LEVELS = ["", "None", "Primary", "Secondary", "Tertiary / College", "University Degree", "Postgraduate Degree", "Prefer not to say"];
const EMPLOYMENT_STATUSES = ["", "Employed", "Self-Employed", "Unemployed", "Student", "Retired", "Homemaker", "Other"];

const SUSPENSION_REASONS = [
  "",
  "Fraudulent identity documents",
  "Repeated no-show",
  "Aggressive / abusive behaviour",
  "Outstanding debt / billing dispute",
  "Duplicate registration detected",
  "Insurance fraud investigation",
  "Breach of hospital policy",
  "Other",
];

const MAIN_TABS = [
  "Patient Details",
  "Next of Kin",
  "Payer Details",
  "Previous Visits",
  "Available Visits",
  "Previous Invoices",
  "Uploads",
];

const MOCK_DB = [
  {
    patientNo: "P-001001",
    surname: "Ochieng",
    firstName: "Amara",
    otherNames: "Wanjiku",
    patientType: "outpatient",
    memberAc: "MA-2001",
    memberAcName: "Jubilee Insurance",
    memberNo: "JB-447821",
    relation: "Self",
    staffNo: "",
    policyNo: "POL-2024-001",
    lpoNo: "",
    gender: "female",
    religion: "christian",
    maritalStatus: "married",
    email: "amara.ochieng@email.com",
    dob: "1990-03-15",
    occupation: "Teacher",
    idCardNo: "28475619",
    houseNo: "14A",
    nationality: "Kenyan",
    telephone: "+254722100001",
    nhifNo: "00284756",
    nhifNotificationNo: "NHF-28475",
    county: "Nairobi",
    estate: "Lavington",
    streetRoad: "Gitanga Road",
    postalBox: "12345",
    postalCode: "00100",
    bloodGroup: "O+",
    category: "Normal",
    copayCategory: "Cat-A",
    ward: "",
    bed: "",
    admissionDate: "",
    medicalDischarge: "",
    release: "",
    lastVisitDate: "2024-11-20",
    acNotes: "Regular patient. Hypertensive.",
    suspended: false,
    suspendReason: "",
    materVisit: false,
    reserveOpInvoice: false,
    invNarration: "TMH KASARANI CLINIC",
    smartPool: "",
    visitNo: "V-10091",
    sladeVisitExpiry: "",
    biometric: false,
    biometricReason: "",
    biometricComment: "",
    nokName: "Grace Kamau",
    nokRelation: "Spouse",
    nokPhone: "+254722200001",
    nokAddress: "Lavington, Nairobi",
    kraPin: "A002847561B",
    nhifMemberNo: "00284756",
  },
  {
    patientNo: "P-001002",
    surname: "Mwangi",
    firstName: "James",
    otherNames: "",
    patientType: "inpatient",
    memberAc: "MA-2002",
    memberAcName: "AAR Healthcare",
    memberNo: "AAR-112233",
    relation: "Self",
    staffNo: "ST-0045",
    policyNo: "POL-2024-002",
    lpoNo: "LPO-0023",
    gender: "male",
    religion: "christian",
    maritalStatus: "single",
    email: "james.mwangi@gmail.com",
    dob: "1975-11-22",
    occupation: "Engineer",
    idCardNo: "12345678",
    houseNo: "",
    nationality: "Kenyan",
    telephone: "+254711200002",
    nhifNo: "00123456",
    nhifNotificationNo: "NHF-12345",
    county: "Kiambu",
    estate: "Thika Town",
    streetRoad: "Kenyatta Avenue",
    postalBox: "54321",
    postalCode: "01000",
    bloodGroup: "A+",
    category: "VIP",
    copayCategory: "Cat-B",
    ward: "Ward 3",
    bed: "Bed 12",
    admissionDate: "2024-12-01",
    medicalDischarge: "2024-12-05",
    release: "",
    lastVisitDate: "2024-12-01",
    acNotes: "Admitted for appendectomy.",
    suspended: false,
    suspendReason: "",
    materVisit: false,
    reserveOpInvoice: true,
    invNarration: "TMH KASARANI CLINIC",
    smartPool: "SP-A",
    visitNo: "V-10092",
    sladeVisitExpiry: "2025-06-30",
    biometric: true,
    biometricReason: "enrolled",
    biometricComment: "Enrolled",
    nokName: "Mary Mwangi",
    nokRelation: "Parent",
    nokPhone: "+254720200002",
    nokAddress: "Thika Town",
    kraPin: "A001234567B",
    nhifMemberNo: "00123456",
  },
  {
    patientNo: "P-001003",
    surname: "Hassan",
    firstName: "Fatuma",
    otherNames: "Aisha",
    patientType: "outpatient",
    memberAc: "",
    memberAcName: "",
    memberNo: "",
    relation: "",
    staffNo: "",
    policyNo: "",
    lpoNo: "",
    gender: "female",
    religion: "muslim",
    maritalStatus: "single",
    email: "",
    dob: "2005-07-04",
    occupation: "Student",
    idCardNo: "BC20050704001",
    houseNo: "22",
    nationality: "Kenyan",
    telephone: "+254700300003",
    nhifNo: "",
    nhifNotificationNo: "",
    county: "Mombasa",
    estate: "Old Town",
    streetRoad: "Mbarak Hinawy Road",
    postalBox: "80100",
    postalCode: "80100",
    bloodGroup: "B+",
    category: "Normal",
    copayCategory: "Cat-C",
    ward: "",
    bed: "",
    admissionDate: "",
    medicalDischarge: "",
    release: "",
    lastVisitDate: "2024-10-15",
    acNotes: "",
    suspended: true,
    suspendReason: "Outstanding debt / billing dispute",
    materVisit: false,
    reserveOpInvoice: false,
    invNarration: "TMH KASARANI CLINIC",
    smartPool: "",
    visitNo: "V-10093",
    sladeVisitExpiry: "",
    biometric: false,
    biometricReason: "",
    biometricComment: "",
    nokName: "Ahmed Hassan",
    nokRelation: "Parent",
    nokPhone: "+254722300003",
    nokAddress: "Old Town, Mombasa",
    kraPin: "",
    nhifMemberNo: "",
  },
  {
    patientNo: "P-001004",
    surname: "Odhiambo",
    firstName: "Peter",
    otherNames: "Otieno",
    patientType: "outpatient",
    memberAc: "MA-2004",
    memberAcName: "NHIF",
    memberNo: "NHIF-456789",
    relation: "Self",
    staffNo: "",
    policyNo: "POL-2024-004",
    lpoNo: "",
    gender: "male",
    religion: "christian",
    maritalStatus: "married",
    email: "",
    dob: "1958-01-30",
    occupation: "Farmer",
    idCardNo: "04567890",
    houseNo: "",
    nationality: "Kenyan",
    telephone: "+254700400004",
    nhifNo: "00456789",
    nhifNotificationNo: "NHF-45678",
    county: "Kisumu",
    estate: "Kolwa",
    streetRoad: "Kisumu-Busia Road",
    postalBox: "40100",
    postalCode: "40100",
    bloodGroup: "AB-",
    category: "Senior",
    copayCategory: "Cat-A",
    ward: "",
    bed: "",
    admissionDate: "",
    medicalDischarge: "",
    release: "",
    lastVisitDate: "2024-09-10",
    acNotes: "Diabetic. Refer to endocrinology.",
    suspended: false,
    suspendReason: "",
    materVisit: false,
    reserveOpInvoice: false,
    invNarration: "TMH KASARANI CLINIC",
    smartPool: "",
    visitNo: "V-10094",
    sladeVisitExpiry: "",
    biometric: false,
    biometricReason: "",
    biometricComment: "",
    nokName: "Rose Odhiambo",
    nokRelation: "Spouse",
    nokPhone: "+254720400004",
    nokAddress: "Kolwa, Kisumu",
    kraPin: "A000456789C",
    nhifMemberNo: "00456789",
  },
  {
    patientNo: "P-001005",
    surname: "Njoroge",
    firstName: "Esther",
    otherNames: "",
    patientType: "staff",
    memberAc: "MA-2005",
    memberAcName: "Sanlam",
    memberNo: "SL-998877",
    relation: "Self",
    staffNo: "ST-0091",
    policyNo: "POL-2024-005",
    lpoNo: "LPO-0031",
    gender: "female",
    religion: "christian",
    maritalStatus: "divorced",
    email: "esther.njoroge@hospital.go.ke",
    dob: "1993-09-18",
    occupation: "Nurse",
    idCardNo: "33445566",
    houseNo: "Block C",
    nationality: "Kenyan",
    telephone: "+254733500005",
    nhifNo: "00334455",
    nhifNotificationNo: "NHF-33445",
    county: "Nakuru",
    estate: "Section 58",
    streetRoad: "Nakuru-Nairobi Hwy",
    postalBox: "20100",
    postalCode: "20100",
    bloodGroup: "O-",
    category: "Staff",
    copayCategory: "Staff",
    ward: "",
    bed: "",
    admissionDate: "",
    medicalDischarge: "",
    release: "",
    lastVisitDate: "2024-11-30",
    acNotes: "Staff patient. Waiver applies.",
    suspended: false,
    suspendReason: "",
    materVisit: false,
    reserveOpInvoice: false,
    invNarration: "TMH KASARANI CLINIC",
    smartPool: "SP-B",
    visitNo: "V-10095",
    sladeVisitExpiry: "2025-12-31",
    biometric: true,
    biometricReason: "enrolled",
    biometricComment: "Active",
    nokName: "John Njoroge",
    nokRelation: "Sibling",
    nokPhone: "+254711500005",
    nokAddress: "Nakuru",
    kraPin: "A003344556B",
    nhifMemberNo: "00334455",
  },
];

const MOCK_VISITS = {
  "P-001001": [
    {
      visitNo: "V-10091",
      date: "2024-11-20",
      type: "OPD",
      department: "General Medicine",
      clinic: "TMH Main Clinic",
      doctor: "Dr. Kamau",
      diagnosis: "Hypertension review",
      status: "Completed",
      vitals: { bp: "148/92 mmHg", pulse: "78 bpm", temp: "36.8 C", weight: "74 kg" },
      complaints: "Persistent headaches and dizziness for 3 days.",
      examination: "BP elevated. Heart sounds normal. No oedema.",
      treatment: "Amlodipine 10mg OD continued. Lifestyle counselling given.",
      notes: "Review in 4 weeks. Monitor BP daily.",
      prescriptions: ["Amlodipine 10mg OD x 30 days", "Aspirin 75mg OD x 30 days"],
    },
    {
      visitNo: "V-9981",
      date: "2024-08-05",
      type: "OPD",
      department: "General Medicine",
      clinic: "TMH Main Clinic",
      doctor: "Dr. Kamau",
      diagnosis: "Upper respiratory tract infection",
      status: "Completed",
      vitals: { bp: "130/80 mmHg", pulse: "88 bpm", temp: "37.9 C", weight: "73 kg" },
      complaints: "Sore throat, runny nose and mild fever for 2 days.",
      examination: "Throat mildly erythematous. Lungs clear.",
      treatment: "Symptomatic treatment. Adequate hydration advised.",
      notes: "Return if fever persists.",
      prescriptions: ["Paracetamol 500mg TDS x 5 days", "Amoxicillin 500mg TDS x 7 days"],
    },
  ],
  "P-001002": [
    {
      visitNo: "V-10092",
      date: "2024-12-01",
      type: "IPD",
      department: "Surgery",
      clinic: "TMH Surgical Ward",
      doctor: "Dr. Otieno",
      diagnosis: "Appendicitis - laparoscopic appendectomy",
      status: "Admitted",
      admissionDate: "2024-12-01",
      medicalDischarge: "2024-12-05",
      release: "2024-12-05",
      vitals: { bp: "122/78 mmHg", pulse: "96 bpm", temp: "38.4 C", weight: "80 kg" },
      complaints: "Severe right iliac fossa pain for 18 hours.",
      examination: "Guarding and rebound tenderness at McBurney's point. WBC 16.2.",
      treatment: "Laparoscopic appendectomy performed under GA.",
      notes: "Wound review in 7 days.",
      prescriptions: ["Ceftriaxone 1g IV BD x 3 days", "Metronidazole 500mg IV TDS x 3 days"],
    },
  ],
  "P-001003": [
    {
      visitNo: "V-10093",
      date: "2024-10-15",
      type: "OPD",
      department: "Paediatrics",
      clinic: "TMH Paediatric Clinic",
      doctor: "Dr. Wanjiru",
      diagnosis: "Malaria - Plasmodium falciparum",
      status: "Completed",
      vitals: { bp: "-", pulse: "102 bpm", temp: "39.2 C", weight: "42 kg" },
      complaints: "High grade fever, chills and headache for 3 days.",
      examination: "Pallor noted. Spleen mildly enlarged. Malaria RDT positive.",
      treatment: "Artemether-Lumefantrine prescribed. Oral rehydration advised.",
      notes: "Review in 3 days.",
      prescriptions: ["Coartem 4 tablets BD x 3 days", "Paracetamol 500mg TDS x 3 days"],
    },
  ],
  "P-001004": [
    {
      visitNo: "V-10094",
      date: "2024-09-10",
      type: "OPD",
      department: "Endocrinology",
      clinic: "TMH Diabetes Clinic",
      doctor: "Dr. Achieng",
      diagnosis: "Type 2 diabetes mellitus review",
      status: "Completed",
      vitals: { bp: "138/84 mmHg", pulse: "74 bpm", temp: "36.7 C", weight: "88 kg" },
      complaints: "Routine diabetes review. Increased thirst and nocturia.",
      examination: "BMI 30.5. Feet exam normal. HbA1c 8.4%.",
      treatment: "Metformin dose increased. Dietary counselling.",
      notes: "HbA1c target < 7%. Review in 3 months.",
      prescriptions: ["Metformin 1g BD x 90 days", "Atorvastatin 20mg OD x 90 days"],
    },
  ],
  "P-001005": [
    {
      visitNo: "V-10095",
      date: "2024-11-30",
      type: "OPD",
      department: "Occupational Health",
      clinic: "TMH Staff Clinic",
      doctor: "Dr. Oloo",
      diagnosis: "Annual staff health check",
      status: "Completed",
      vitals: { bp: "118/74 mmHg", pulse: "68 bpm", temp: "36.4 C", weight: "62 kg" },
      complaints: "Annual staff medical fitness assessment.",
      examination: "All systems clinically normal.",
      treatment: "Medically fit for duty.",
      notes: "Annual review due Nov 2025.",
      prescriptions: [],
    },
  ],
};

const MOCK_ACTIVE_VISITS = {
  "P-001001": {
    visitNo: "V-10112",
    date: "2026-04-04",
    type: "OPD",
    department: "General Medicine",
    clinic: "TMH Main Clinic",
    doctor: "Dr. Kamau",
    status: "In Progress",
    triageTime: "08:45",
    seenTime: "",
    estimatedWait: "~20 min",
    chiefComplaint: "Persistent headache and elevated BP reading at home.",
    triageVitals: {
      bp: "156/96 mmHg",
      pulse: "82 bpm",
      temp: "36.9 C",
      weight: "74 kg",
      spo2: "98%",
    },
    attendingNurse: "Nurse Wanjiku",
    attendingDoctor: "Dr. Kamau",
    notes: "Triage complete. Awaiting doctor review.",
    invoiceNo: "INV-2026-10112",
    invoiceStatus: "Open",
    invoiceAmount: 3500,
  },
  "P-001002": {
    visitNo: "V-10113",
    date: "2026-04-04",
    type: "IPD",
    department: "Surgery",
    clinic: "TMH Surgical Ward",
    doctor: "Dr. Otieno",
    status: "Admitted",
    triageTime: "06:30",
    seenTime: "07:15",
    chiefComplaint: "Post-operative day 2 monitoring.",
    triageVitals: {
      bp: "118/74 mmHg",
      pulse: "76 bpm",
      temp: "37.1 C",
      weight: "80 kg",
      spo2: "99%",
    },
    attendingNurse: "Nurse Omollo",
    attendingDoctor: "Dr. Otieno",
    notes: "Stable post-op. IV fluids running. Wound site clean.",
    invoiceNo: "INV-2026-10113",
    invoiceStatus: "Open",
    invoiceAmount: 145000,
  },
  "P-001004": {
    visitNo: "V-10114",
    date: "2026-04-04",
    type: "OPD",
    department: "Endocrinology",
    clinic: "TMH Diabetes Clinic",
    doctor: "Dr. Achieng",
    status: "In Progress",
    triageTime: "09:10",
    seenTime: "09:45",
    chiefComplaint: "Routine diabetes review. Reports fatigue.",
    triageVitals: {
      bp: "142/86 mmHg",
      pulse: "78 bpm",
      temp: "36.6 C",
      weight: "87 kg",
      spo2: "97%",
    },
    attendingNurse: "Nurse Achieng",
    attendingDoctor: "Dr. Achieng",
    notes: "HbA1c drawn. Awaiting results.",
    invoiceNo: "INV-2026-10114",
    invoiceStatus: "Open",
    invoiceAmount: 4100,
  },
};

const MOCK_INVOICES = {
  "P-001001": [
    {
      invoiceNo: "INV-2024-10091",
      date: "2024-11-20",
      amount: 3500,
      paid: 3500,
      balance: 0,
      status: "Paid",
      items: "Consultation, BP meds",
    },
    {
      invoiceNo: "INV-2024-09981",
      date: "2024-08-05",
      amount: 1800,
      paid: 1800,
      balance: 0,
      status: "Paid",
      items: "Consultation, Amoxicillin",
    },
  ],
  "P-001002": [
    {
      invoiceNo: "INV-2024-10092",
      date: "2024-12-01",
      amount: 145000,
      paid: 50000,
      balance: 95000,
      status: "Partial",
      items: "Surgery, Anaesthesia, Ward, Theatre",
    },
  ],
  "P-001003": [
    {
      invoiceNo: "INV-2024-10093",
      date: "2024-10-15",
      amount: 2800,
      paid: 0,
      balance: 2800,
      status: "Unpaid",
      items: "Consultation, Malaria test, Coartem",
    },
  ],
  "P-001004": [
    {
      invoiceNo: "INV-2024-10094",
      date: "2024-09-10",
      amount: 4100,
      paid: 4100,
      balance: 0,
      status: "Paid",
      items: "Consultation, HbA1c, Metformin",
    },
  ],
  "P-001005": [
    {
      invoiceNo: "INV-2024-10095",
      date: "2024-11-30",
      amount: 6000,
      paid: 6000,
      balance: 0,
      status: "Paid",
      items: "Health check panel - staff waiver",
    },
  ],
};

const MOCK_UPLOADS = {
  "P-001001": [
    {
      name: "Referral_Letter_Nov2024.pdf",
      type: "Referral",
      date: "2024-11-20",
      size: "142 KB",
      uploader: "System - 20 Nov 2024, 09:14",
    },
    {
      name: "BP_Chart_2024.pdf",
      type: "Clinical",
      date: "2024-08-05",
      size: "88 KB",
      uploader: "System - 5 Aug 2024, 11:32",
    },
  ],
  "P-001002": [
    {
      name: "Surgical_Consent_Form.pdf",
      type: "Consent",
      date: "2024-12-01",
      size: "210 KB",
      uploader: "System - 1 Dec 2024, 08:55",
    },
    {
      name: "Pre-Op_Labs.pdf",
      type: "Labs",
      date: "2024-11-30",
      size: "305 KB",
      uploader: "System - 30 Nov 2024, 16:20",
    },
  ],
  "P-001003": [
    {
      name: "NHIF_Exemption.pdf",
      type: "Insurance",
      date: "2024-10-15",
      size: "95 KB",
      uploader: "System - 15 Oct 2024, 09:14",
    },
  ],
  "P-001004": [],
  "P-001005": [
    {
      name: "Staff_Health_Clearance_2024.pdf",
      type: "Clearance",
      date: "2024-11-30",
      size: "260 KB",
      uploader: "System - 30 Nov 2024, 14:47",
    },
  ],
};

const BLANK = {
  counter: "",
  ticket: "",
  telephone: "",
  surname: "",
  firstName: "",
  otherNames: "",
  patientType: "outpatient",
  patientNo: "",
  memberAc: "",
  memberAcName: "",
  memberNo: "",
  relation: "",
  staffNo: "",
  policyNo: "",
  lpoNo: "",
  gender: "",
  religion: "",
  maritalStatus: "",
  email: "",
  dob: "",
  occupation: "",
  idCardNo: "",
  houseNo: "",
  nationality: "Kenyan",
  nhifNo: "",
  nhifNotificationNo: "",
  county: "",
  estate: "",
  streetRoad: "",
  postalBox: "",
  postalCode: "",
  bloodGroup: "",
  category: "",
  copayCategory: "",
  ward: "",
  bed: "",
  admissionDate: "",
  medicalDischarge: "",
  release: "",
  lastVisitDate: "",
  acNotes: "",
  suspended: false,
  suspendReason: "",
  suspendedBy: "",
  suspendedAt: "",
  materVisit: false,
  reserveOpInvoice: false,
  invNarration: "TMH KASARANI CLINIC",
  smartPool: "",
  visitNo: "",
  sladeVisitExpiry: "",
  biometric: false,
  biometricReason: "",
  biometricComment: "",
  nokName: "",
  nokRelation: "",
  nokPhone: "",
  nokAddress: "",
  payerName: "",
  payerType: "",
  payerPhone: "",
  payerEmail: "",
  payerAddress: "",
  kraPin: "",
  nhifMemberNo: "",
};

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-KE", { dateStyle: "medium" });
}

function fmtDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

function fmtKES(value) {
  return "KES " + Number(value || 0).toLocaleString("en-KE");
}

function ageFromDob(dob) {
  if (!dob) return null;
  const n = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function initials(form) {
  return ((form.surname || "?").slice(0, 1) + (form.firstName || "").slice(0, 1)).toUpperCase();
}

function titleCase(value) {
  if (!value) return "";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function styles() {
  return `
    *{box-sizing:border-box}
    body,input,select,textarea,button{font-family:'DM Sans',sans-serif}
    button{cursor:pointer}
    .rf-page{min-height:100vh;background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif}
    .rf-wrap{max-width:1280px;margin:0 auto;padding:18px 24px 32px}
    .rf-header{background:${C.header};color:white;box-shadow:${C.shadowMd};padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
    .rf-title{font-family:'Cormorant Garamond',serif;font-size:25px;font-weight:700;line-height:1;margin:0}
    .rf-subtitle{font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#7ecbea;margin:0 0 3px}
    .rf-card{background:${C.card};border:1px solid ${C.border};border-radius:16px;box-shadow:${C.shadowMd};overflow:hidden}
    .rf-card-body{padding:18px 20px}
    .rf-section-head{display:flex;align-items:center;gap:10px;padding:11px 18px;background:${C.accentLight};border-bottom:1px solid ${C.accentMid};color:${C.accent};font-size:11px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase}
    .rf-grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px}
    .rf-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 18px}
    .rf-grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px 18px}
    .rf-grid-12{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}
    .rf-field{min-width:0}
    .rf-label{display:block;margin-bottom:5px;color:${C.label};font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase}
    .rf-input,.rf-select,.rf-textarea{width:100%;border:1px solid ${C.border};border-radius:9px;background:white;color:${C.text};font-size:13px;outline:none;box-shadow:${C.shadow};transition:border-color .15s,box-shadow .15s,background .15s}
    .rf-input,.rf-select{height:36px;padding:8px 10px}
    .rf-textarea{min-height:86px;padding:10px 12px;resize:vertical;line-height:1.6}
    .rf-input:focus,.rf-select:focus,.rf-textarea:focus{border-color:${C.borderFocus};box-shadow:0 0 0 2px ${C.accentMid}}
    .rf-input[readonly]{background:#f8fafc;color:${C.muted}}
    .rf-error{margin-top:4px;color:${C.danger};font-size:11px;font-weight:600}
    .rf-btn{border:none;border-radius:11px;padding:9px 14px;font-size:13px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:7px}
    .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.35);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite;display:inline-block;vertical-align:middle}
    .spinner-dark{border:2px solid rgba(11,25,41,.25);border-top-color:#0b1929}
    @keyframes spin{to{transform:rotate(360deg)}}
    .rf-btn-primary{background:linear-gradient(135deg,${C.accent},${C.accentDark});color:white;box-shadow:0 3px 10px rgba(26,127,168,.3)}
    .rf-btn-ghost{background:#f1f5f9;border:1px solid ${C.border};color:${C.muted}}
    .rf-btn-danger{background:linear-gradient(135deg,${C.danger},${C.dangerDark});color:white}
    .rf-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:800}
    .rf-tabs{display:flex;overflow-x:auto;border-bottom:1px solid ${C.border};background:#f8fafc}
    .rf-tab{border:0;border-bottom:3px solid transparent;background:transparent;color:${C.muted};padding:13px 16px;font-size:12px;font-weight:800;white-space:nowrap}
    .rf-tab.active{background:${C.accentLight};color:${C.accent};border-bottom-color:${C.accent}}
    .rf-table{width:100%;border-collapse:collapse;font-size:12px}
    .rf-table th{background:#f8fafc;color:${C.muted};text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;padding:9px 10px;border-bottom:1px solid ${C.border}}
    .rf-table td{padding:10px;border-bottom:1px solid ${C.rule};vertical-align:top}
    .rf-summary{background:white;border:1px solid ${C.accentMid};border-radius:16px;box-shadow:${C.shadowMd};padding:14px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
    .rf-avatar{width:48px;height:48px;border-radius:14px;background:${C.accentLight};border:2px solid ${C.accentMid};display:flex;align-items:center;justify-content:center;color:${C.accent};font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;flex:0 0 auto}
    .rf-modal-backdrop{position:fixed;inset:0;background:rgba(10,20,30,.58);backdrop-filter:blur(4px);z-index:50;display:flex;align-items:center;justify-content:center;padding:18px}
    .rf-modal{width:min(760px,100%);max-height:90vh;overflow:hidden;background:white;border-radius:18px;box-shadow:0 32px 80px rgba(0,0,0,.35);display:flex;flex-direction:column}
    .rf-modal-head{background:${C.header};color:white;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .rf-modal-body{padding:20px;overflow:auto}
    .rf-search-box{position:relative}
    .rf-search-results{position:absolute;left:0;right:0;top:calc(100% + 6px);background:white;border:1px solid ${C.accentMid};border-radius:16px;box-shadow:0 20px 60px rgba(26,46,59,.20);z-index:20;overflow:hidden}
    .rf-result{width:100%;background:white;border:0;border-bottom:1px solid ${C.rule};padding:12px 14px;text-align:left;display:flex;align-items:center;gap:12px}
    .rf-result:hover{background:${C.accentLight}}
    @media(max-width:900px){.rf-grid-2,.rf-grid-3,.rf-grid-4{grid-template-columns:1fr}.rf-grid-12{grid-template-columns:1fr}.rf-header{align-items:flex-start;flex-direction:column}.rf-wrap{padding:14px}.rf-card-body{padding:14px}.rf-summary{align-items:flex-start}.rf-table{min-width:760px}.rf-scroll{overflow:auto}}
  `;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required,
  error,
  readOnly,
}) {
  return (
    <div className="rf-field">
      <label className="rf-label">
        {label}
        {required ? <span style={{ color: C.danger }}> *</span> : null}
      </label>
      <input
        className="rf-input"
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {error ? <div className="rf-error">{error}</div> : null}
    </div>
  );
}

function SelectField({ label, value, onChange, options, required, error }) {
  return (
    <div className="rf-field">
      <label className="rf-label">
        {label}
        {required ? <span style={{ color: C.danger }}> *</span> : null}
      </label>
      <select className="rf-select" value={value || ""} onChange={onChange}>
        {options.map(function (option) {
          const opt =
            typeof option === "string" ? { value: option, label: option || "Select..." } : option;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
      {error ? <div className="rf-error">{error}</div> : null}
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder = "" }) {
  return (
    <div className="rf-field">
      <label className="rf-label">{label}</label>
      <textarea
        className="rf-textarea"
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: C.label,
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <input
        type="checkbox"
        checked={!!checked}
        onChange={onChange}
        style={{ accentColor: C.accent, width: 15, height: 15 }}
      />
      {label}
    </label>
  );
}

function Badge({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: "#f1f5f9", color: C.muted },
    blue: { bg: C.accentLight, color: C.accent },
    green: { bg: C.successLight, color: C.success },
    red: { bg: C.dangerLight, color: C.danger },
    amber: { bg: C.warningLight, color: C.warning },
    purple: { bg: "#f3e8ff", color: "#7c3aed" },
  };
  const s = map[tone] || map.neutral;
  return (
    <span className="rf-pill" style={{ background: s.bg, color: s.color }}>
      {children}
    </span>
  );
}

function Card({ title, accent = C.accent, children }) {
  return (
    <section className="rf-card">
      {title ? (
        <div className="rf-section-head" style={{ color: accent }}>
          {title}
        </div>
      ) : null}
      <div className="rf-card-body">{children}</div>
    </section>
  );
}

function PatientSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const results = useMemo(
    function () {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];
      return MOCK_DB.filter(function (p) {
        const haystack = [
          p.patientNo,
          p.surname,
          p.firstName,
          p.otherNames,
          p.telephone,
          p.idCardNo,
          p.nhifNo,
          p.memberNo,
          p.memberAcName,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    },
    [query],
  );

  useEffect(function () {
    function close(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return function () {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  function choose(patient) {
    setQuery(patient.surname + ", " + patient.firstName + " - " + patient.patientNo);
    setOpen(false);
    onSelect(patient);
  }

  function clear() {
    setQuery("");
    setOpen(false);
    onSelect(null);
  }

  return (
    <div className="rf-search-box" ref={boxRef}>
      <input
        className="rf-input"
        value={query}
        onChange={function (event) {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={function () {
          if (results.length) setOpen(true);
        }}
        placeholder="Search by surname, first name, patient no., ID, phone, NHIF, member no..."
        style={{ height: 44, paddingLeft: 14, paddingRight: 92, borderRadius: 13 }}
      />
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 8,
          display: "flex",
          gap: 7,
          alignItems: "center",
        }}
      >
        {query ? (
          <button
            className="rf-btn rf-btn-ghost"
            onClick={clear}
            style={{ padding: "5px 9px", borderRadius: 8 }}
          >
            Clear
          </button>
        ) : null}
        <Badge tone="blue">{MOCK_DB.length} records</Badge>
      </div>
      {open && query.trim().length > 1 ? (
        <div className="rf-search-results">
          {results.length ? (
            results.map(function (patient) {
              return (
                <button
                  className="rf-result"
                  key={patient.patientNo}
                  onClick={function () {
                    choose(patient);
                  }}
                >
                  <div
                    className="rf-avatar"
                    style={{ width: 38, height: 38, borderRadius: 11, fontSize: 17 }}
                  >
                    {patient.surname.slice(0, 1)}
                    {patient.firstName.slice(0, 1)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
                    >
                      <strong>
                        {patient.surname}, {patient.firstName} {patient.otherNames}
                      </strong>
                      <Badge tone="blue">{patient.patientNo}</Badge>
                      {patient.suspended ? <Badge tone="red">Suspended</Badge> : null}
                    </div>
                    <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>
                      {patient.idCardNo || "No ID"} - {patient.telephone || "No phone"} -{" "}
                      {patient.county || "No county"} - {titleCase(patient.patientType)}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: C.muted }}>
              No patients found.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Modal({ title, subtitle, children, onClose, footer }) {
  return (
    <div className="rf-modal-backdrop">
      <div className="rf-modal">
        <div className="rf-modal-head">
          <div>
            <div
              style={{
                color: "#7ecbea",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              {subtitle}
            </div>
            <div
              style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700 }}
            >
              {title}
            </div>
          </div>
          <button
            className="rf-btn rf-btn-ghost"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.10)",
              color: "white",
              borderColor: "rgba(255,255,255,.18)",
            }}
          >
            Close
          </button>
        </div>
        <div className="rf-modal-body">{children}</div>
        {footer ? (
          <div style={{ borderTop: "1px solid " + C.border, background: "#f8fafc", padding: 16 }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SuspendModal({ patientName, onCancel, onConfirm }) {
  const [officer, setOfficer] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  function submit() {
    const nextErrors = {};
    if (!officer.trim()) nextErrors.officer = "Required";
    if (!reason) nextErrors.reason = "Required";
    if (!notes.trim()) nextErrors.notes = "Required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onConfirm({
      officer: officer.trim(),
      reason,
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <Modal
      title={patientName}
      subtitle="Suspend patient account"
      onClose={onCancel}
      footer={
        <div style={{ display: "flex", gap: 10 }}>
          <button className="rf-btn rf-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button className="rf-btn rf-btn-danger" style={{ flex: 1 }} onClick={submit}>
            Confirm Suspension
          </button>
        </div>
      }
    >
      <div className="rf-grid-2">
        <Field
          label="Officer Name"
          value={officer}
          onChange={function (e) {
            setOfficer(e.target.value);
          }}
          required
          error={errors.officer}
        />
        <SelectField
          label="Reason"
          value={reason}
          onChange={function (e) {
            setReason(e.target.value);
          }}
          options={SUSPENSION_REASONS.map(function (r) {
            return { value: r, label: r || "Select reason..." };
          })}
          required
          error={errors.reason}
        />
      </div>
      <div style={{ marginTop: 14 }}>
        <TextAreaField
          label="Suspension Notes"
          value={notes}
          onChange={function (e) {
            setNotes(e.target.value);
          }}
          placeholder="Detailed suspension notes..."
        />
        {errors.notes ? <div className="rf-error">{errors.notes}</div> : null}
      </div>
    </Modal>
  );
}

function PatientSummary({ form, loaded, patientAge, activeVisit, isDirty, onSave, onPrint, isSaving }) {
  if (!loaded) return null;
  return (
    <div className="rf-summary">
      <div
        className="rf-avatar"
        style={
          form.suspended
            ? { background: C.dangerLight, color: C.danger, borderColor: "#fca5a5" }
            : null
        }
      >
        {form.suspended ? "!" : initials(form)}
      </div>
      <div>
        <div style={{ fontWeight: 800 }}>
          {form.surname}
          {form.firstName ? ", " + form.firstName : ""} {form.otherNames}
        </div>
        <div style={{ color: C.muted, fontSize: 12 }}>{loaded}</div>
      </div>
      {patientAge !== null ? (
        <Badge tone={patientAge < 18 ? "amber" : patientAge >= 60 ? "purple" : "blue"}>
          {patientAge} yrs
        </Badge>
      ) : null}
      {form.gender ? (
        <Badge tone={form.gender === "female" ? "purple" : "blue"}>{titleCase(form.gender)}</Badge>
      ) : null}
      {form.bloodGroup ? <Badge tone="red">{form.bloodGroup}</Badge> : null}
      {form.patientType ? <Badge>{titleCase(form.patientType)}</Badge> : null}
      {form.category ? <Badge tone="blue">{form.category}</Badge> : null}
      {form.memberAcName ? <Badge tone="green">{form.memberAcName}</Badge> : null}
      {activeVisit ? <Badge tone="green">Active OPD - {activeVisit.visitNo}</Badge> : null}
      <div style={{ flex: 1 }} />
      <button className="rf-btn rf-btn-ghost" onClick={onPrint} disabled={isSaving}>
        Patient Card
      </button>
      {isDirty ? (
        <button className="rf-btn rf-btn-primary" onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="spinner" /> Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
      ) : null}
    </div>
  );
}

export default function RegistrationForm() {
  const [form, setForm] = useState(BLANK);
  const [loaded, setLoaded] = useState(null);
  const [activeTab, setActiveTab] = useState("Patient Details");
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showPrintCard, setShowPrintCard] = useState(false);
  const [viewingVisit, setViewingVisit] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [showActiveVisit, setShowActiveVisit] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ fileName: "", fileType: "", file: null });
  const [uploadErrors, setUploadErrors] = useState({});
  const [auditLog, setAuditLog] = useState([]);
  const fileInputRef = useRef(null);

  const patientAge = ageFromDob(form.dob);
  const patientName =
    [form.surname, form.firstName, form.otherNames].filter(Boolean).join(" ") || "Patient";
  const visits = loaded ? MOCK_VISITS[loaded] || [] : [];
  const invoices = loaded ? MOCK_INVOICES[loaded] || [] : [];
  const activeVisit = loaded ? MOCK_ACTIVE_VISITS[loaded] || null : null;

  function update(field) {
    return function (event) {
      const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
      setForm(function (prev) {
        return { ...prev, [field]: value };
      });
      setIsDirty(true);
      setSaved(false);
    };
  }

  function handleSelect(patient) {
    if (!patient) {
      clearForm();
      return;
    }
    setForm({ ...BLANK, ...patient });
    setLoaded(patient.patientNo);
    setErrors({});
    setIsDirty(false);
    setSaved(false);
    setLastSaved(null);
    setActiveTab("Patient Details");
    setUploadFiles(MOCK_UPLOADS[patient.patientNo] || []);
    setAuditLog(
      patient.suspended
        ? [
            {
              type: "suspend",
              officer: "System",
              reason: patient.suspendReason,
              notes: "Pre-existing suspension loaded from record.",
              timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
            },
          ]
        : [],
    );
  }

  function validate() {
    setErrors({});
    return true;
  }

  function handleSave() {
    if (isSaving) return;
    if (!validate()) return;
    setIsSaving(true);
    setTimeout(function () {
      setSaved(true);
      setLastSaved(new Date());
      setIsDirty(false);
      setIsSaving(false);
      setTimeout(function () {
        setSaved(false);
      }, 3500);
    }, 1200);
  }

  function clearForm() {
    setForm(BLANK);
    setLoaded(null);
    setErrors({});
    setSaved(false);
    setLastSaved(null);
    setIsDirty(false);
    setUploadFiles([]);
    setAuditLog([]);
    setViewingInvoice(null);
    setViewingVisit(null);
    setShowActiveVisit(false);
    setShowPrintCard(false);
    setShowUploadModal(false);
    setActiveTab("Patient Details");
  }

  function handleSuspend(data) {
    setForm(function (prev) {
      return {
        ...prev,
        suspended: true,
        suspendReason: data.reason,
        suspendedBy: data.officer,
        suspendedAt: data.timestamp,
      };
    });
    setAuditLog(function (prev) {
      return [{ type: "suspend", ...data }, ...prev];
    });
    setShowSuspendModal(false);
    setIsDirty(true);
  }

  function handleReinstate() {
    setForm(function (prev) {
      return { ...prev, suspended: false, suspendReason: "", suspendedBy: "", suspendedAt: "" };
    });
    setAuditLog(function (prev) {
      return [
        {
          type: "reinstate",
          officer: "Current User",
          notes: "Reinstated via registration form.",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ];
    });
    setIsDirty(true);
  }

  function addUpload() {
    const next = {};
    if (!uploadForm.fileName.trim()) next.fileName = "Required";
    if (!uploadForm.fileType) next.fileType = "Required";
    if (!uploadForm.file) next.file = "Required";
    setUploadErrors(next);
    if (Object.keys(next).length) return;

    const ext = uploadForm.file.name.match(/\.[^.]+$/)?.[0] || "";
    setUploadFiles(function (prev) {
      return [
        {
          name: uploadForm.fileName.trim() + ext,
          originalName: uploadForm.file.name,
          type: uploadForm.fileType,
          date: new Date().toLocaleDateString("en-KE"),
          size: Math.round(uploadForm.file.size / 1024) + " KB",
          uploader:
            "System - " +
            new Date().toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }),
        },
        ...prev,
      ];
    });
    setUploadForm({ fileName: "", fileType: "", file: null });
    setUploadErrors({});
    setShowUploadModal(false);
    setIsDirty(true);
  }

  useEffect(
    function () {
      function saveShortcut(event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          handleSave();
        }
      }
      document.addEventListener("keydown", saveShortcut);
      return function () {
        document.removeEventListener("keydown", saveShortcut);
      };
    },
    [form],
  );

  return (
    <div className="rf-page">
      <link href={FONT_URL} rel="stylesheet" />
      <style>{styles()}</style>

      {showSuspendModal ? (
        <SuspendModal
          patientName={patientName}
          onCancel={function () {
            setShowSuspendModal(false);
          }}
          onConfirm={handleSuspend}
        />
      ) : null}

      <header className="rf-header">
        <div>
          <p className="rf-subtitle">Mater Hospital Nairobi - Registration Desk</p>
          <h1 className="rf-title">Patient Registration</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {isDirty && !saved ? <Badge tone="amber">Unsaved changes</Badge> : null}
          {saved ? <Badge tone="green">Saved</Badge> : null}
          {lastSaved && !saved && !isDirty ? (
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12 }}>
              Last saved {lastSaved.toLocaleTimeString("en-KE", { timeStyle: "short" })}
            </span>
          ) : null}
          {form.suspended ? <Badge tone="red">Suspended</Badge> : null}
          {loaded ? (
            <button
              className="rf-btn rf-btn-ghost"
              onClick={function () {
                setShowPrintCard(true);
              }}
              style={{
                background: "rgba(255,255,255,.1)",
                borderColor: "rgba(255,255,255,.18)",
                color: "white",
              }}
            >
              Patient Card
            </button>
          ) : null}
          <button className="rf-btn rf-btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="spinner" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
          <button className="rf-btn rf-btn-ghost" onClick={clearForm} disabled={isSaving}>
            Clear
          </button>
        </div>
      </header>

      <main className="rf-wrap">
        <div style={{ marginBottom: 16 }}>
          <PatientSearch onSelect={handleSelect} />
        </div>

        <PatientSummary
          form={form}
          loaded={loaded}
          patientAge={patientAge}
          activeVisit={activeVisit}
          isDirty={isDirty}
          onSave={handleSave}
          onPrint={function () {
            setShowPrintCard(true);
          }}
          isSaving={isSaving}
        />

        <div style={{ height: 16 }} />

        <Card title="Patient Intake">
          <div className="rf-grid-12">
            <div style={{ gridColumn: "span 2" }}>
              <Field
                label="Counter"
                value={form.counter}
                onChange={update("counter")}
                placeholder="Counter no."
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <Field
                label="Ticket"
                value={form.ticket}
                onChange={update("ticket")}
                placeholder="Ticket no."
              />
            </div>
            <div style={{ gridColumn: "span 3" }}>
              <Field
                label="Telephone"
                value={form.telephone}
                onChange={update("telephone")}
                placeholder="+254..."
                error={errors.telephone}
                required
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <SelectField
                label="Patient Type"
                value={form.patientType}
                onChange={update("patientType")}
                options={[
                  { value: "outpatient", label: "Outpatient" },
                  { value: "inpatient", label: "Inpatient" },
                  { value: "staff", label: "Staff" },
                  { value: "emergency", label: "Emergency" },
                  { value: "maternity", label: "Maternity" },
                ]}
              />
            </div>
            <div style={{ gridColumn: "span 3" }}>
              <Field
                label="Patient No."
                value={form.patientNo}
                onChange={update("patientNo")}
                readOnly
                placeholder="Auto-generated"
              />
            </div>
          </div>
          <div className="rf-grid-4" style={{ marginTop: 14 }}>
            <SelectField
              label="Title"
              value={form.title}
              onChange={update("title")}
              options={TITLES}
            />
            <Field
              label="Surname"
              value={form.surname}
              onChange={update("surname")}
              required
              error={errors.surname}
            />
            <Field
              label="First Name"
              value={form.firstName}
              onChange={update("firstName")}
              required
              error={errors.firstName}
            />
            <Field label="Other Names" value={form.otherNames} onChange={update("otherNames")} />
          </div>
          <div className="rf-grid-4" style={{ marginTop: 14 }}>
            <Field label="Member A/c" value={form.memberAc} onChange={update("memberAc")} />
            <Field
              label="Insurer / Scheme"
              value={form.memberAcName}
              onChange={update("memberAcName")}
            />
            <Field label="Member No." value={form.memberNo} onChange={update("memberNo")} />
            <Field label="Policy No." value={form.policyNo} onChange={update("policyNo")} />
          </div>
        </Card>

        <div style={{ height: 16 }} />

        <div className="rf-card">
          <div className="rf-tabs">
            {MAIN_TABS.map(function (tab) {
              return (
                <button
                  key={tab}
                  className={"rf-tab" + (activeTab === tab ? " active" : "")}
                  onClick={function () {
                    setActiveTab(tab);
                  }}
                >
                  {tab}
                  {tab === "Previous Visits" && visits.length ? " (" + visits.length + ")" : ""}
                  {tab === "Previous Invoices" && invoices.length
                    ? " (" + invoices.length + ")"
                    : ""}
                  {tab === "Uploads" && uploadFiles.length ? " (" + uploadFiles.length + ")" : ""}
                  {tab === "Available Visits" && activeVisit ? " (Live)" : ""}
                </button>
              );
            })}
          </div>
          <div className="rf-card-body">
            {activeTab === "Patient Details" ? (
              <div style={{ display: "grid", gap: 16 }}>
                {form.suspended ? (
                  <div
                    style={{
                      background: C.dangerLight,
                      border: "2px solid #fca5a5",
                      borderRadius: 14,
                      padding: 14,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: C.danger }}>Account Suspended</div>
                    <div style={{ color: C.danger, fontSize: 12, flex: 1 }}>
                      {form.suspendReason || "No reason recorded"}{" "}
                      {form.suspendedBy ? "- by " + form.suspendedBy : ""}{" "}
                      {form.suspendedAt ? "- " + fmtDateTime(form.suspendedAt) : ""}
                    </div>
                    <button className="rf-btn rf-btn-primary" onClick={handleReinstate}>
                      Reinstate
                    </button>
                  </div>
                ) : null}

                <Card title="Bio Data">
                  <div className="rf-grid-4">
                    <SelectField
                      label="Gender"
                      value={form.gender}
                      onChange={update("gender")}
                      required
                      error={errors.gender}
                      options={[
                        { value: "", label: "Select" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                    <SelectField
                      label="Marital Status"
                      value={form.maritalStatus}
                      onChange={update("maritalStatus")}
                      options={[
                        { value: "", label: "Select" },
                        "single",
                        "married",
                        "divorced",
                        "widowed",
                        "separated",
                      ]}
                    />
                    <SelectField
                      label="Religion"
                      value={form.religion}
                      onChange={update("religion")}
                      options={[
                        { value: "", label: "Select" },
                        "christian",
                        "muslim",
                        "hindu",
                        "traditionalist",
                        "other",
                      ]}
                    />
                    <Field
                      label="Nationality"
                      value={form.nationality}
                      onChange={update("nationality")}
                      required
                    />
                    <Field
                      label="Date of Birth"
                      value={form.dob}
                      onChange={update("dob")}
                      type="date"
                      required
                      error={errors.dob}
                    />
                    <Field
                      label="Age"
                      value={patientAge !== null ? patientAge + " years" : ""}
                      readOnly
                    />
                    <SelectField
                      label="Category"
                      value={form.category}
                      onChange={update("category")}
                      options={[
                        { value: "", label: "Select" },
                        "Normal",
                        "VIP",
                        "Staff",
                        "Senior",
                        "Child",
                      ]}
                    />
                    <SelectField
                      label="Blood Group"
                      value={form.bloodGroup}
                      onChange={update("bloodGroup")}
                      options={[
                        { value: "", label: "Select" },
                        "A+",
                        "A-",
                        "B+",
                        "B-",
                        "AB+",
                        "AB-",
                        "O+",
                        "O-",
                      ]}
                    />
                    <SelectField
                      label="Education Level"
                      value={form.educationalLevel}
                      onChange={update("educationalLevel")}
                      options={EDUCATION_LEVELS}
                    />
                    <SelectField
                      label="Employment Status"
                      value={form.employmentStatus}
                      onChange={update("employmentStatus")}
                      options={EMPLOYMENT_STATUSES}
                    />
                  </div>
                </Card>

                <div className="rf-grid-2">
                  <Card title="Contact Details" accent={C.label}>
                    <div className="rf-grid-2">
                      <Field
                        label="Telephone"
                        value={form.telephone}
                        onChange={update("telephone")}
                        required
                        error={errors.telephone}
                      />
                      <Field
                        label="Email"
                        value={form.email}
                        onChange={update("email")}
                        type="email"
                      />
                      <SelectField
                        label="County"
                        value={form.county}
                        onChange={update("county")}
                        options={COUNTIES.map(function (x) {
                          return { value: x, label: x || "Select" };
                        })}
                      />
                      <Field
                        label="Estate / Village"
                        value={form.estate}
                        onChange={update("estate")}
                      />
                      <Field
                        label="Street / Road"
                        value={form.streetRoad}
                        onChange={update("streetRoad")}
                      />
                      <Field label="House No." value={form.houseNo} onChange={update("houseNo")} />
                    </div>
                  </Card>
                  <Card title="Identification" accent={C.label}>
                    <div className="rf-grid-2">
                      <Field
                        label="ID Card No."
                        value={form.idCardNo}
                        onChange={update("idCardNo")}
                        required
                        error={errors.idCardNo}
                      />
                      <Field label="KRA PIN" value={form.kraPin} onChange={update("kraPin")} />
                      <Field label="NHIF No." value={form.nhifNo} onChange={update("nhifNo")} />
                      <Field
                        label="NHIF Notification No."
                        value={form.nhifNotificationNo}
                        onChange={update("nhifNotificationNo")}
                      />
                      <Field
                        label="Postal Box"
                        value={form.postalBox}
                        onChange={update("postalBox")}
                      />
                      <Field
                        label="Postal Code"
                        value={form.postalCode}
                        onChange={update("postalCode")}
                      />
                    </div>
                  </Card>
                </div>

                <Card title="Account, Visit and Biometric Controls" accent={C.warning}>
                  <div className="rf-grid-3">
                    <div>
                      <div className="rf-label">Suspension</div>
                      <div
                        style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
                      >
                        <CheckField
                          label="Suspended"
                          checked={form.suspended}
                          onChange={update("suspended")}
                        />
                        {form.suspended ? (
                          <button className="rf-btn rf-btn-primary" onClick={handleReinstate}>
                            Reinstate
                          </button>
                        ) : (
                          <button
                            className="rf-btn rf-btn-danger"
                            onClick={function () {
                              setShowSuspendModal(true);
                            }}
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <SelectField
                          label="Reason"
                          value={form.suspendReason}
                          onChange={update("suspendReason")}
                          options={SUSPENSION_REASONS.map(function (r) {
                            return { value: r, label: r || "Select reason..." };
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="rf-label">Visit & Billing</div>
                      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                        <CheckField
                          label="Mater Visit"
                          checked={form.materVisit}
                          onChange={update("materVisit")}
                        />
                        <CheckField
                          label="Reserve OP Invoice"
                          checked={form.reserveOpInvoice}
                          onChange={update("reserveOpInvoice")}
                        />
                      </div>
                      <Field label="Visit No." value={form.visitNo} onChange={update("visitNo")} />
                    </div>
                    <div>
                      <div className="rf-label">Biometric</div>
                      <div style={{ marginBottom: 12 }}>
                        <CheckField
                          label="Biometric Enrolled"
                          checked={form.biometric}
                          onChange={update("biometric")}
                        />
                      </div>
                      <SelectField
                        label="Reason"
                        value={form.biometricReason}
                        onChange={update("biometricReason")}
                        options={[
                          { value: "", label: "Select" },
                          { value: "enrolled", label: "Enrolled" },
                          { value: "waiver", label: "Waiver" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                      <Field
                        label="Comment"
                        value={form.biometricComment}
                        onChange={update("biometricComment")}
                      />
                    </div>
                  </div>
                </Card>

                <Card title="Account Notes" accent={C.label}>
                  <TextAreaField
                    label="Notes"
                    value={form.acNotes}
                    onChange={update("acNotes")}
                    placeholder="Clinical observations, billing instructions, or registration notes..."
                  />
                </Card>

                {auditLog.length ? (
                  <Card title="Suspension Audit Log" accent={C.danger}>
                    {auditLog.map(function (entry, index) {
                      return (
                        <div
                          key={index}
                          style={{
                            background: entry.type === "suspend" ? C.dangerLight : C.successLight,
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                          >
                            <strong
                              style={{ color: entry.type === "suspend" ? C.danger : C.success }}
                            >
                              {titleCase(entry.type)}
                            </strong>
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {fmtDateTime(entry.timestamp)}
                            </span>
                          </div>
                          <div style={{ color: C.muted, fontSize: 12 }}>
                            By {entry.officer}
                            {entry.reason ? " - " + entry.reason : ""}
                          </div>
                          {entry.notes ? (
                            <div style={{ marginTop: 6, fontSize: 13 }}>{entry.notes}</div>
                          ) : null}
                        </div>
                      );
                    })}
                  </Card>
                ) : null}
              </div>
            ) : null}

            {activeTab === "Next of Kin" ? (
              <div className="rf-grid-2">
                <Card title="Next of Kin Details">
                  <div className="rf-grid-2">
                    <Field label="Full Name" value={form.nokName} onChange={update("nokName")} />
                    <SelectField
                      label="Relationship"
                      value={form.nokRelation}
                      onChange={update("nokRelation")}
                      options={[
                        { value: "", label: "Select" },
                        "Spouse",
                        "Parent",
                        "Child",
                        "Sibling",
                        "Guardian",
                        "Friend",
                        "Other",
                      ]}
                    />
                    <Field label="Phone" value={form.nokPhone} onChange={update("nokPhone")} />
                    <Field label="NOK ID / Passport" value={form.nokIdCardNo} onChange={update("nokIdCardNo")} />
                    <Field label="NOK Email" value={form.nokEmail} onChange={update("nokEmail")} />
                    <Field
                      label="Address"
                      value={form.nokAddress}
                      onChange={update("nokAddress")}
                    />
                  </div>
                </Card>
                <Card title="Emergency Contact" accent={C.warning}>
                  <div
                    style={{
                      background: C.accentLight,
                      border: "1px solid " + C.accentMid,
                      borderRadius: 12,
                      padding: 13,
                      color: C.muted,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    By default, the next of kin is used as the emergency contact.
                  </div>
                  <div style={{ height: 14 }} />
                  <div className="rf-grid-2">
                    <Field
                      label="Emergency Name"
                      value={form.nokName || "Same as NOK"}
                      readOnly
                    />
                    <Field
                      label="Relationship"
                      value={form.nokRelation || "Same as NOK"}
                      readOnly
                    />
                    <Field
                      label="Emergency Phone"
                      value={form.nokPhone || "Same as NOK"}
                      readOnly
                    />
                  </div>
                </Card>
              </div>
            ) : null}

            {activeTab === "Payer Details" ? (
              <Card title="Payer / Guarantor Information">
                <div className="rf-grid-2">
                  <Field
                    label="Payer Name"
                    value={form.payerName}
                    onChange={update("payerName")}
                    placeholder="Insurance, employer, guardian, or self"
                  />
                  <SelectField
                    label="Payer Type"
                    value={form.payerType}
                    onChange={update("payerType")}
                    options={[
                      { value: "", label: "Select" },
                      { value: "nhif", label: "NHIF / SHA" },
                      { value: "insurance", label: "Private Insurance" },
                      { value: "corporate", label: "Corporate / Employer" },
                      { value: "self", label: "Self Pay" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                  <Field label="Phone" value={form.payerPhone} onChange={update("payerPhone")} />
                  <Field label="Email" value={form.payerEmail} onChange={update("payerEmail")} />
                  <Field label="Policy No." value={form.policyNo} onChange={update("policyNo")} />
                  <Field label="LPO No." value={form.lpoNo} onChange={update("lpoNo")} />
                  <Field label="Member No." value={form.memberNo} onChange={update("memberNo")} />
                  <Field label="Member A/c" value={form.memberAc} onChange={update("memberAc")} />
                </div>
                <div style={{ marginTop: 14 }}>
                  <TextAreaField
                    label="Payer Address"
                    value={form.payerAddress}
                    onChange={update("payerAddress")}
                  />
                </div>
              </Card>
            ) : null}

            {activeTab === "Previous Visits" ? (
              visits.length ? (
                <div className="rf-scroll">
                  <table className="rf-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Visit No.</th>
                        <th>Type</th>
                        <th>Department</th>
                        <th>Doctor</th>
                        <th>Diagnosis</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map(function (visit) {
                        return (
                          <tr key={visit.visitNo}>
                            <td>{fmtDate(visit.date)}</td>
                            <td>
                              <strong style={{ color: C.accent }}>{visit.visitNo}</strong>
                            </td>
                            <td>
                              <Badge tone={visit.type === "IPD" ? "amber" : "blue"}>
                                {visit.type}
                              </Badge>
                            </td>
                            <td>{visit.department}</td>
                            <td>{visit.doctor}</td>
                            <td>{visit.diagnosis}</td>
                            <td>
                              <Badge tone={visit.status === "Completed" ? "green" : "amber"}>
                                {visit.status}
                              </Badge>
                            </td>
                            <td>
                              <button
                                className="rf-btn rf-btn-primary"
                                onClick={function () {
                                  setViewingVisit(visit);
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No visit history"
                  body="No previous visits are available for this record."
                />
              )
            ) : null}

            {activeTab === "Available Visits" ? (
              activeVisit ? (
                <Card title="Current Active Visit" accent={C.success}>
                  <div
                    style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Badge tone="green">{activeVisit.status}</Badge>
                    <Info label="Visit No." value={activeVisit.visitNo} />
                    <Info label="Date" value={fmtDate(activeVisit.date)} />
                    <Info label="Department" value={activeVisit.department} />
                    <Info label="Doctor" value={activeVisit.doctor} />
                    <Info label="Clinic" value={activeVisit.clinic} />
                    <Info label="Triage" value={activeVisit.triageTime || "-"} />
                    <div style={{ flex: 1 }} />
                    <button
                      className="rf-btn rf-btn-primary"
                      onClick={function () {
                        setShowActiveVisit(true);
                      }}
                    >
                      View
                    </button>
                  </div>
                </Card>
              ) : (
                <EmptyState
                  title="No active visit"
                  body={patientName + " does not have an active OPD visit."}
                />
              )
            ) : null}

            {activeTab === "Previous Invoices" ? (
              invoices.length ? (
                <div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <Badge tone="green">
                      Paid:{" "}
                      {fmtKES(
                        invoices.reduce(function (sum, inv) {
                          return sum + inv.paid;
                        }, 0),
                      )}
                    </Badge>
                    <Badge tone="red">
                      Balance:{" "}
                      {fmtKES(
                        invoices.reduce(function (sum, inv) {
                          return sum + inv.balance;
                        }, 0),
                      )}
                    </Badge>
                  </div>
                  <div className="rf-scroll">
                    <table className="rf-table">
                      <thead>
                        <tr>
                          <th>Invoice No.</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Paid</th>
                          <th>Balance</th>
                          <th>Status</th>
                          <th>Items</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map(function (invoice) {
                          return (
                            <tr key={invoice.invoiceNo}>
                              <td>
                                <strong style={{ color: C.accent }}>{invoice.invoiceNo}</strong>
                              </td>
                              <td>{fmtDate(invoice.date)}</td>
                              <td>{fmtKES(invoice.amount)}</td>
                              <td>{fmtKES(invoice.paid)}</td>
                              <td
                                style={{
                                  color: invoice.balance > 0 ? C.danger : C.success,
                                  fontWeight: 800,
                                }}
                              >
                                {fmtKES(invoice.balance)}
                              </td>
                              <td>
                                <Badge
                                  tone={
                                    invoice.status === "Paid"
                                      ? "green"
                                      : invoice.status === "Partial"
                                        ? "amber"
                                        : "red"
                                  }
                                >
                                  {invoice.status}
                                </Badge>
                              </td>
                              <td>{invoice.items}</td>
                              <td>
                                <button
                                  className="rf-btn rf-btn-primary"
                                  onClick={function () {
                                    setViewingInvoice(invoice);
                                  }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No invoices found"
                  body="No previous invoices are available for this record."
                />
              )
            ) : null}

            {activeTab === "Uploads" ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <strong>Documents & Uploads</strong>
                    <div style={{ color: C.muted, fontSize: 12 }}>
                      Attach referral letters, lab results, consent forms and pre-authorisations.
                    </div>
                  </div>
                  <button
                    className="rf-btn rf-btn-primary"
                    onClick={function () {
                      setShowUploadModal(true);
                    }}
                  >
                    Upload File
                  </button>
                </div>
                {uploadFiles.length ? (
                  <div className="rf-scroll">
                    <table className="rf-table">
                      <thead>
                        <tr>
                          <th>File Name</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Size</th>
                          <th>Uploader</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {uploadFiles.map(function (file, index) {
                          return (
                            <tr key={file.name + index}>
                              <td>
                                <strong>{file.name}</strong>
                                <div style={{ color: C.muted, fontSize: 11 }}>
                                  {file.originalName || file.name}
                                </div>
                              </td>
                              <td>
                                <Badge tone="blue">{file.type}</Badge>
                              </td>
                              <td>{file.date}</td>
                              <td>{file.size}</td>
                              <td>{file.uploader}</td>
                              <td>
                                <button
                                  className="rf-btn rf-btn-danger"
                                  onClick={function () {
                                    setUploadFiles(function (prev) {
                                      return prev.filter(function (_, i) {
                                        return i !== index;
                                      });
                                    });
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    title="No documents attached"
                    body="Upload documents for the selected or new patient record."
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ height: 16 }} />

        <footer
          className="rf-card-body"
          style={{
            background: C.card,
            border: "1px solid " + C.border,
            borderRadius: 16,
            boxShadow: C.shadowMd,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ color: C.muted, fontSize: 12 }}>
            Secured - Kenya Data Protection Act 2019
            {loaded
              ? " - " +
                visits.length +
                " visit(s), " +
                invoices.length +
                " invoice(s), " +
                uploadFiles.length +
                " upload(s)"
              : ""}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {loaded ? (
              <button
                className="rf-btn rf-btn-ghost"
                onClick={function () {
                  setShowPrintCard(true);
                }}
              >
                Patient Card
              </button>
            ) : null}
             <button className="rf-btn rf-btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="spinner" /> Saving...
                </>
              ) : (
                "Save Details"
              )}
            </button>
            <button className="rf-btn rf-btn-ghost" onClick={clearForm} disabled={isSaving}>
              Clear
            </button>
          </div>
        </footer>
      </main>

      {showPrintCard && loaded ? (
        <Modal
          title="Patient ID Card"
          subtitle={patientName}
          onClose={function () {
            setShowPrintCard(false);
          }}
          footer={
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="rf-btn rf-btn-ghost"
                style={{ flex: 1 }}
                onClick={function () {
                  setShowPrintCard(false);
                }}
              >
                Close
              </button>
              <button
                className="rf-btn rf-btn-primary"
                style={{ flex: 1 }}
                onClick={function () {
                  window.print();
                }}
              >
                Print Card
              </button>
            </div>
          }
        >
          <div
            style={{
              background: "linear-gradient(135deg,#1a2e3b,#0e4a6e)",
              color: "white",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: C.shadowLg,
            }}
          >
            <div
              style={{
                padding: 16,
                borderBottom: "1px solid rgba(255,255,255,.14)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <strong>Mater Hospital Nairobi</strong>
              {form.suspended ? <Badge tone="red">Suspended</Badge> : null}
            </div>
            <div style={{ padding: 20, display: "flex", gap: 18 }}>
              <div
                className="rf-avatar"
                style={{
                  background: "rgba(255,255,255,.12)",
                  color: "white",
                  borderColor: "rgba(255,255,255,.22)",
                  width: 72,
                  height: 72,
                  fontSize: 30,
                }}
              >
                {initials(form)}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 30,
                    fontWeight: 700,
                  }}
                >
                  {form.surname}
                  {form.firstName ? ", " + form.firstName : ""}
                </div>
                <div style={{ color: "#7ecbea", fontWeight: 900, fontSize: 24, letterSpacing: 2 }}>
                  {loaded}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                    gap: "6px 24px",
                    marginTop: 10,
                    fontSize: 12,
                  }}
                >
                  <span>
                    DOB: {fmtDate(form.dob)} {patientAge !== null ? "(" + patientAge + "y)" : ""}
                  </span>
                  <span>Gender: {titleCase(form.gender) || "-"}</span>
                  <span>ID No.: {form.idCardNo || "-"}</span>
                  <span>NHIF: {form.nhifNo || "-"}</span>
                  <span>Phone: {form.telephone || "-"}</span>
                  <span>Blood: {form.bloodGroup || "-"}</span>
                </div>
              </div>
            </div>
            <div
              style={{
                padding: 16,
                background: "rgba(0,0,0,.18)",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 12,
              }}
            >
              <span>
                NOK: {form.nokName || "-"} - {form.nokPhone || "-"}
              </span>
              <span>Issued {fmtDate(new Date().toISOString())}</span>
            </div>
          </div>
        </Modal>
      ) : null}

      {viewingVisit ? (
        <Modal
          title={viewingVisit.visitNo + " - " + viewingVisit.diagnosis}
          subtitle={viewingVisit.type + " visit"}
          onClose={function () {
            setViewingVisit(null);
          }}
          footer={
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="rf-btn rf-btn-ghost"
                style={{ flex: 1 }}
                onClick={function () {
                  setViewingVisit(null);
                }}
              >
                Back
              </button>
              <button
                className="rf-btn rf-btn-primary"
                style={{ flex: 1 }}
                onClick={function () {
                  window.print();
                }}
              >
                Print Visit Summary
              </button>
            </div>
          }
        >
          <VisitDetails visit={viewingVisit} />
        </Modal>
      ) : null}

      {showActiveVisit && activeVisit ? (
        <Modal
          title={activeVisit.visitNo + " - " + activeVisit.department}
          subtitle="Active visit"
          onClose={function () {
            setShowActiveVisit(false);
          }}
          footer={
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="rf-btn rf-btn-ghost"
                style={{ flex: 1 }}
                onClick={function () {
                  setShowActiveVisit(false);
                }}
              >
                Close
              </button>
              <button
                className="rf-btn rf-btn-primary"
                style={{ flex: 1 }}
                onClick={function () {
                  window.print();
                }}
              >
                Print Visit Card
              </button>
            </div>
          }
        >
          <ActiveVisitDetails visit={activeVisit} />
        </Modal>
      ) : null}

      {viewingInvoice ? (
        <Modal
          title={viewingInvoice.invoiceNo}
          subtitle="Invoice"
          onClose={function () {
            setViewingInvoice(null);
          }}
          footer={
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="rf-btn rf-btn-ghost"
                style={{ flex: 1 }}
                onClick={function () {
                  setViewingInvoice(null);
                }}
              >
                Back
              </button>
              <button
                className="rf-btn rf-btn-primary"
                style={{ flex: 1 }}
                onClick={function () {
                  window.print();
                }}
              >
                Print Invoice
              </button>
            </div>
          }
        >
          <InvoiceDetails invoice={viewingInvoice} patientName={patientName} patientNo={loaded} />
        </Modal>
      ) : null}

      {showUploadModal ? (
        <Modal
          title="Upload Document"
          subtitle="Attach file"
          onClose={function () {
            setShowUploadModal(false);
          }}
          footer={
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="rf-btn rf-btn-ghost"
                style={{ flex: 1 }}
                onClick={function () {
                  setShowUploadModal(false);
                }}
              >
                Cancel
              </button>
              <button className="rf-btn rf-btn-primary" style={{ flex: 1 }} onClick={addUpload}>
                Attach File
              </button>
            </div>
          }
        >
          <div className="rf-grid-2">
            <Field
              label="File Name / Label"
              value={uploadForm.fileName}
              onChange={function (e) {
                setUploadForm(function (prev) {
                  return { ...prev, fileName: e.target.value };
                });
              }}
              required
              error={uploadErrors.fileName}
            />
            <SelectField
              label="Document Type"
              value={uploadForm.fileType}
              onChange={function (e) {
                setUploadForm(function (prev) {
                  return { ...prev, fileType: e.target.value };
                });
              }}
              required
              error={uploadErrors.fileType}
              options={[
                { value: "", label: "Select type..." },
                "Referral",
                "Clinical",
                "Labs",
                "Radiology",
                "Consent",
                "Insurance",
                "Pre-Auth",
                "Discharge Summary",
                "Prescription",
                "Clearance",
                "Legal",
                "Other",
              ]}
            />
          </div>
          <div style={{ marginTop: 14 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ display: "none" }}
              onChange={function (event) {
                const file = event.target.files?.[0];
                if (!file) return;
                setUploadForm(function (prev) {
                  return {
                    ...prev,
                    file,
                    fileName:
                      prev.fileName || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
                  };
                });
              }}
            />
            <button
              className="rf-btn rf-btn-ghost"
              style={{
                width: "100%",
                minHeight: 90,
                borderStyle: "dashed",
                flexDirection: "column",
              }}
              onClick={function () {
                fileInputRef.current?.click();
              }}
            >
              <span>{uploadForm.file ? uploadForm.file.name : "Click to browse file"}</span>
              <small style={{ color: C.muted }}>
                {uploadForm.file
                  ? Math.round(uploadForm.file.size / 1024) + " KB"
                  : "PDF, JPG, PNG, DOC, DOCX"}
              </small>
            </button>
            {uploadErrors.file ? <div className="rf-error">{uploadErrors.file}</div> : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div
        style={{
          color: C.muted,
          fontSize: 10,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800 }}>{value || "-"}</div>
    </div>
  );
}

function EmptyState({ title, body }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 18px", color: C.muted }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 13 }}>{body}</div>
    </div>
  );
}

function VisitDetails({ visit }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="rf-grid-4">
        <Info label="Date" value={fmtDate(visit.date)} />
        <Info label="Department" value={visit.department} />
        <Info label="Clinic" value={visit.clinic} />
        <Info label="Doctor" value={visit.doctor} />
      </div>
      {visit.type === "IPD" ? (
        <div className="rf-grid-3">
          <Info label="Admission" value={fmtDate(visit.admissionDate)} />
          <Info label="Medical Discharge" value={fmtDate(visit.medicalDischarge)} />
          <Info label="Release" value={fmtDate(visit.release)} />
        </div>
      ) : null}
      <Card title="Vitals" accent={C.label}>
        <div className="rf-grid-4">
          {Object.entries(visit.vitals || {}).map(function ([key, value]) {
            return <Info key={key} label={key} value={value} />;
          })}
        </div>
      </Card>
      <ClinicalBlock title="Chief Complaints" value={visit.complaints} />
      <ClinicalBlock title="Examination Findings" value={visit.examination} />
      <ClinicalBlock title="Treatment Given" value={visit.treatment} />
      <ClinicalBlock title="Clinical Notes" value={visit.notes} />
      {visit.prescriptions?.length ? (
        <Card title="Prescriptions" accent={C.success}>
          {visit.prescriptions.map(function (rx) {
            return (
              <div key={rx} style={{ padding: "8px 0", borderBottom: "1px solid " + C.rule }}>
                {rx}
              </div>
            );
          })}
        </Card>
      ) : null}
    </div>
  );
}

function ActiveVisitDetails({ visit }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="rf-grid-4">
        <Info label="Visit No." value={visit.visitNo} />
        <Info label="Date" value={fmtDate(visit.date)} />
        <Info label="Triage Time" value={visit.triageTime || "-"} />
        <Info label="Seen At" value={visit.seenTime || "Pending"} />
        <Info label="Doctor" value={visit.attendingDoctor} />
        <Info label="Nurse" value={visit.attendingNurse} />
        <Info label="Department" value={visit.department} />
        <Info label="Clinic" value={visit.clinic} />
      </div>
      <Card title="Triage Vitals" accent={C.success}>
        <div className="rf-grid-4">
          {Object.entries(visit.triageVitals || {}).map(function ([key, value]) {
            return <Info key={key} label={key} value={value} />;
          })}
        </div>
      </Card>
      <ClinicalBlock title="Chief Complaint" value={visit.chiefComplaint} />
      <ClinicalBlock title="Progress Notes" value={visit.notes} />
      <Card title="Invoice" accent={C.warning}>
        <div className="rf-grid-3">
          <Info label="Invoice No." value={visit.invoiceNo} />
          <Info label="Status" value={visit.invoiceStatus} />
          <Info label="Amount" value={fmtKES(visit.invoiceAmount)} />
        </div>
      </Card>
    </div>
  );
}

function ClinicalBlock({ title, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid " + C.border,
        borderRadius: 12,
        padding: 13,
      }}
    >
      <div className="rf-label">{title}</div>
      <div style={{ lineHeight: 1.65 }}>{value || "-"}</div>
    </div>
  );
}

function InvoiceDetails({ invoice, patientName, patientNo }) {
  const itemNames = invoice.items.split(",").map(function (x) {
    return x.trim();
  });
  const unit = itemNames.length ? Math.round(invoice.amount / itemNames.length) : invoice.amount;
  return (
    <div>
      <div className="rf-grid-3" style={{ marginBottom: 16 }}>
        <Info label="Patient" value={patientName} />
        <Info label="Patient No." value={patientNo} />
        <Info label="Invoice Date" value={fmtDate(invoice.date)} />
      </div>
      <div className="rf-scroll">
        <table className="rf-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {itemNames.map(function (item) {
              return (
                <tr key={item}>
                  <td>{item}</td>
                  <td>1</td>
                  <td>{fmtKES(unit)}</td>
                  <td>
                    <strong>{fmtKES(unit)}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid " + C.border,
            borderRadius: 12,
            padding: 14,
            textAlign: "center",
          }}
        >
          <Info label="Total Billed" value={fmtKES(invoice.amount)} />
        </div>
        <div
          style={{
            background: C.successLight,
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: 14,
            textAlign: "center",
          }}
        >
          <Info label="Amount Paid" value={fmtKES(invoice.paid)} />
        </div>
        <div
          style={{
            background: invoice.balance > 0 ? C.dangerLight : C.successLight,
            border: "1px solid " + (invoice.balance > 0 ? "#fca5a5" : "#bbf7d0"),
            borderRadius: 12,
            padding: 14,
            textAlign: "center",
          }}
        >
          <Info label="Balance" value={fmtKES(invoice.balance)} />
        </div>
      </div>
    </div>
  );
}
