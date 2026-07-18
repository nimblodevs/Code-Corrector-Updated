// Auto-extracted from HMS.jsx — EMPTY_REG, SPECIALTIES, WARDS, domain constants
const EMPTY_REG = {
  title:"Mr.", firstName:"", middleName:"", lastName:"", dateOfBirth:"", gender:"Male", bloodGroup:"Unknown",
  idCardNo:"", kraPin:"",
  maritalStatus:"Single", nationality:"Kenyan", primaryLanguage:"English",
  religion:"Christianity", occupation:"", educationalLevel:"None", employmentStatus:"Employed",
  altPhone:"", email:"",
  address:"", city:"", state:"", country:"Kenya",
  county:"Nairobi", estate:"", streetRoad:"", postalBox:"", postalCode:"",
  nokName:"", nokRelationship:"Spouse", nokPhone:"", nokAddress:"", nokEmail:"", nokIdCardNo:"",
  ecSameAsNok:true, ecName:"", ecRelationship:"Spouse", ecPhone:"",
  category:"Cash", corporateOrg:"Safaricom", corporateStaffId:"", corporateEmail:"", corporateDept:"", corporateGrade:"",
  insuranceProvider:"NHIF", insuranceMemberNo:"", insurancePolicyNo:"", insuranceExpiry:"", copayCategory:"None", nhifMemberNo:"",
  consentTreatment:false, consentData:false, consentEmergency:false, consentMarketing:false,
};

// ==============================================================================
// MAIN APP
// ==============================================================================

// ============================================================================
// FINANCE MODULE - Debtors Account & Scheme Management
// Components: DebtorsAccount, SchemesPage, SchemeManager, SchemeModal,
//             DebtorForm, DebtorDetail, SchemeDrawer, SearchableSelect
// Uses localStorage key: "medicore_debtors_registry"
// ============================================================================


// ===============================================================================
// HMS FINANCE MODULE - SELF-CONTAINED ROUTER
// Pages: DebtorsAccount  Back  SchemesPage
// Navigation is handled by HMSRouter (at the bottom of this file)
// ===============================================================================

// --- Shared storage key (used by OutpatientBilling too) ----------------------


// ==============================================================================
// MISSING CONSTANTS - Added to fix ReferenceErrors
// ==============================================================================

const SPECIALTIES = [
  "Internal Medicine","Cardiology","Neurology","Pulmonology","Gastroenterology",
  "Nephrology","Endocrinology & Diabetes","Rheumatology","Haematology","Oncology",
  "Obstetrics & Gynaecology","Paediatrics","Neonatology","General Surgery",
  "Orthopaedic Surgery","Cardiothoracic Surgery","Neurosurgery",
  "Plastic & Reconstructive Surgery","Urology","ENT (Ear, Nose & Throat)",
  "Ophthalmology","Dermatology","Psychiatry & Mental Health","Anaesthesiology",
  "Radiology & Imaging","Pathology & Lab Medicine","Emergency Medicine",
  "Palliative Care","Infectious Disease","Geriatrics","Sports Medicine",
  "Rehabilitation Medicine","Dentistry & Oral Surgery",
];

const WARDS = [
  { id:"w1", name:"Medical Ward A",        beds:24, colour:"#0369a1", bg:"#e0f2fe" },
  { id:"w2", name:"Medical Ward B",        beds:20, colour:"#0e7490", bg:"#cffafe" },
  { id:"w3", name:"Surgical Ward",         beds:18, colour:"#7c3aed", bg:"#ede9fe" },
  { id:"w4", name:"Maternity Ward",        beds:16, colour:"#be185d", bg:"#fce7f3" },
  { id:"w5", name:"Paediatric Ward",       beds:14, colour:"#d97706", bg:"#fef3c7" },
  { id:"w6", name:"ICU / Critical Care",   beds:8,  colour:"#dc2626", bg:"#fee2e2" },
  { id:"w7", name:"HDU (High Dependency)", beds:6,  colour:"#c2410c", bg:"#ffedd5" },
  { id:"w8", name:"Private Wing",          beds:12, colour:"#059669", bg:"#d1fae5" },
];

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const RELIGIONS = [
  "Christianity", "Islam", "Hinduism", "Buddhism", "Judaism",
  "Sikhism", "Traditional / African Religion", "Atheist / Agnostic", "Other", "Prefer not to say",
];

const DIET_OPTIONS = [
  "Regular", "Soft Diet", "Liquid Diet", "High Protein", "Low Sodium",
  "Diabetic Diet", "Low Fat", "Renal Diet", "Nil by Mouth (NBM)",
  "Nasogastric Tube (NGT) Feeds", "Total Parenteral Nutrition (TPN)", "Halal", "Vegetarian",
];


const MARITAL = ['Single','Married','Divorced','Widowed','Separated','Domestic Partnership','Other'];

const LANGUAGES = ['English','Swahili','French','Arabic','Hausa','Yoruba','Igbo','Amharic','Somali','Zulu','Afrikaans','Twi','Ga','Ewe','Other'];

const CORP_ORGS = [
  'Safaricom','Equity Bank','KCB Group','EABL','Nation Media Group','Kenya Power',
  'KENGEN','Kenya Airways','BAT Kenya','Total Kenya','Stanbic Bank','NMB Bank',
  'CRDB Bank','Airtel Africa','MTN Group','Other',
];

const INS_PROVIDERS = [
  'NHIF','AAR Insurance','Jubilee Insurance','CIC Insurance','UAP Insurance',
  'Madison Insurance','Old Mutual','Resolution Insurance','GA Insurance',
  'Britam Insurance','Pioneer Insurance','ICEA Lion','Liberty Insurance',
  'Sanlam Kenya','First Assurance','Self-Pay (Insurance Card)','Other',
];

const DISCHARGE_TYPES = [
  'Routine Discharge','Discharge Against Medical Advice (DAMA)',
  'Transfer to Another Facility','Death in Facility',
  'Absconded','Referral Discharge','Day Case Discharge',
];

const CONDITION_AT_DC = [
  'Stable / Recovered','Improved','Unchanged','Deteriorated',
  'Critical but Stable','Deceased',
];

const SPECIMEN_MAP = {
  // EDTA (Purple Top) — whole blood
  l1:  { container:'EDTA (Purple Top)',          volume:'3 mL',  tubeIcon:'🟣', specimen:'Whole Blood',      draw:'venous', colour:'#7c3aed' },
  l2:  { container:'EDTA (Purple Top)',          volume:'2 mL',  tubeIcon:'🟣', specimen:'Whole Blood',      draw:'venous', colour:'#7c3aed' },
  l3:  { container:'EDTA (Purple Top)',          volume:'2 mL',  tubeIcon:'🟣', specimen:'Whole Blood',      draw:'venous', colour:'#7c3aed' },
  l5:  { container:'EDTA (Purple Top)',          volume:'2 mL',  tubeIcon:'🟣', specimen:'Whole Blood',      draw:'venous', colour:'#7c3aed' },
  l16: { container:'EDTA (Purple Top)',          volume:'2 mL',  tubeIcon:'🟣', specimen:'Whole Blood',      draw:'finger-prick/venous', colour:'#7c3aed' },
  l17: { container:'EDTA (Purple Top)',          volume:'2 mL',  tubeIcon:'🟣', specimen:'Whole Blood',      draw:'venous', colour:'#7c3aed' },
  // Fluoride Oxalate (Grey Top) — glucose
  l4:  { container:'Fluoride Oxalate (Grey Top)', volume:'2 mL', tubeIcon:'⬛', specimen:'Whole Blood',     draw:'venous', colour:'#6b7280' },
  // SST / Plain (Yellow/Red Top) — serum
  l6:  { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l7:  { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l8:  { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l9:  { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l13: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l14: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l15: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l20: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l21: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l22: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l23: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l26: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l27: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  l28: { container:'Plain / SST (Yellow Top)',   volume:'5 mL',  tubeIcon:'🟡', specimen:'Serum',            draw:'venous', colour:'#ca8a04' },
  // Blood Culture
  l10: { container:'Blood Culture Bottle (Aerobic + Anaerobic)', volume:'10 mL each', tubeIcon:'🔴', specimen:'Whole Blood', draw:'venous', colour:'#dc2626' },
  // Urine
  l11: { container:'Urine Universal Container', volume:'10 mL', tubeIcon:'🟤', specimen:'Mid-stream Urine',  draw:'urine', colour:'#92400e' },
  l18: { container:'Urine Universal Container', volume:'10 mL', tubeIcon:'🟤', specimen:'Mid-stream Urine',  draw:'urine', colour:'#92400e' },
  l19: { container:'Urine Universal Container', volume:'5 mL',  tubeIcon:'🟤', specimen:'First-morning Urine',draw:'urine', colour:'#92400e' },
  l30: { container:'24-Hour Urine Container',   volume:'Total 24h collection', tubeIcon:'🟤', specimen:'24-Hour Urine', draw:'urine', colour:'#92400e' },
  // Stool
  l12: { container:'Stool Container',           volume:'5 g',   tubeIcon:'🟫', specimen:'Fresh Stool',       draw:'stool', colour:'#78350f' },
  l29: { container:'Stool Container',           volume:'5 g',   tubeIcon:'🟫', specimen:'Fresh Stool',       draw:'stool', colour:'#78350f' },
  // Swabs
  l24: { container:'Swab in Transport Medium',  volume:'1 swab',tubeIcon:'🧪', specimen:'Throat Swab',       draw:'swab',  colour:'#0891b2' },
  l25: { container:'Swab in Transport Medium',  volume:'1 swab',tubeIcon:'🧪', specimen:'Wound Swab',        draw:'swab',  colour:'#0891b2' },
};

const NATIONALITIES = [
  'Kenyan','Nigerian','Ghanaian','South African','Ethiopian','Tanzanian','Ugandan',
  'Cameroonian','Ivorian','Senegalese','Rwandan','Zambian','Zimbabwean','Malawian',
  'Mozambican','Botswanan','Namibian','Egyptian','Moroccan','Tunisian','Sudanese',
  'British','American','French','German','Indian','Chinese','Other',
];

const RELATIONSHIPS = [
  'Spouse','Parent','Child','Sibling','Grandparent','Grandchild',
  'Aunt / Uncle','Niece / Nephew','Cousin','Friend','Guardian','Employer','Other',
];

// ==============================================================================
// ==============================================================================
// INVENTORY MODULE SEED DATA
// ==============================================================================

const TITLES = ["Mr.", "Mrs.", "Ms.", "Miss", "Dr.", "Prof.", "Rev.", "Hon."];
const EDUCATION_LEVELS = ["None", "Primary", "Secondary", "Tertiary / College", "University Degree", "Postgraduate Degree", "Prefer not to say"];
const EMPLOYMENT_STATUSES = ["Employed", "Self-Employed", "Unemployed", "Student", "Retired", "Homemaker", "Other"];
const COPAY_CATEGORIES = ["None", "Cat-A", "Cat-B", "Cat-C", "Cat-D"];
const COUNTIES = [
  "Nairobi", "Mombasa", "Kiambu", "Nakuru", "Kisumu", "Uasin Gishu", "Nyeri", "Baringo",
  "Bomet", "Bungoma", "Busia", "Embu", "Garissa", "Kajiado", "Machakos", "Meru", "Other"
];

export { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TITLES, EDUCATION_LEVELS, EMPLOYMENT_STATUSES, COPAY_CATEGORIES, COUNTIES };
export { TRIAGE_LEVELS } from "./referenceData.js";
