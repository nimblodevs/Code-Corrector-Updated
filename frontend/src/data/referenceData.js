// Auto-extracted from HMS.jsx — ICD-10, lab/rad categories, drugs, services, item registry
const ICD10 = [
  { code:"I10",      desc:"Essential (primary) hypertension" },
  { code:"E11.9",    desc:"Type 2 diabetes mellitus without complications" },
  { code:"J18.9",    desc:"Pneumonia, unspecified organism" },
  { code:"K35.80",   desc:"Acute appendicitis without abscess" },
  { code:"I48.91",   desc:"Unspecified atrial fibrillation" },
  { code:"S72.001A", desc:"Fracture of unspecified part of femoral neck" },
  { code:"N18.3",    desc:"Chronic kidney disease, stage 3" },
  { code:"F32.1",    desc:"Major depressive disorder, single episode" },
  { code:"G43.909",  desc:"Migraine, unspecified, not intractable" },
  { code:"M54.5",    desc:"Low back pain" },
  { code:"J45.20",   desc:"Mild intermittent asthma, uncomplicated" },
  { code:"R50.9",    desc:"Fever, unspecified" },
  { code:"R07.9",    desc:"Chest pain, unspecified" },
  { code:"R10.9",    desc:"Unspecified abdominal pain" },
  { code:"A09",      desc:"Other gastroenteritis and colitis" },
  { code:"J06.9",    desc:"Acute upper respiratory infection, unspecified" },
  { code:"K92.1",    desc:"Melaena" },
  { code:"R55",      desc:"Syncope and collapse" },
];

// ============================================================================
// ITEM REGISTRY - Unified catalogue for all service points
// In production this is fetched from /api/catalogue. Here it is an in-memory
// seed. Every service point uses searchRegistry() - never iterates a raw array.
//
// Schema per item:
//   id       : unique string
//   name     : display name
//   cat      : top-level category  (lab|radiology|pharmacy|procedure|
//                                   consultation|accommodation|nursing|meals)
//   subcat   : sub-category label
//   price    : KES unit price (0 = price-on-request / scheme-negotiated)
//   unit     : dispensing/reporting unit  e.g. "per test" "per day" "per tab"
//   keywords : extra search tokens (space-separated lowercase)
//   meta     : arbitrary extra data (specimen, route, strength, etc.)
// ============================================================================

// ----- LABORATORY -----------------------------------------------------------
const LAB_ITEMS = [
  // Haematology
  {id:"l1",  name:"Full Blood Count (FBC)",              cat:"lab", subcat:"Haematology",        price:6500,  unit:"per test", keywords:"fbc cbc haemoglobin wbc platelets pcv mcv mchc"},
  {id:"l2",  name:"Erythrocyte Sedimentation Rate (ESR)",cat:"lab", subcat:"Haematology",        price:3500,  unit:"per test", keywords:"esr inflammatory"},
  {id:"l3",  name:"Haemoglobin Electrophoresis",         cat:"lab", subcat:"Haematology",        price:8000,  unit:"per test", keywords:"hb electrophoresis sickle cell as ss"},
  {id:"l20", name:"Troponin I",                          cat:"lab", subcat:"Haematology",        price:12000, unit:"per test", keywords:"troponin cardiac acs mi"},
  {id:"l21", name:"BNP / NT-proBNP",                    cat:"lab", subcat:"Haematology",        price:15000, unit:"per test", keywords:"bnp heart failure cardiac"},
  // Biochemistry
  {id:"l4",  name:"Fasting Blood Sugar (FBS)",           cat:"lab", subcat:"Biochemistry",       price:3500,  unit:"per test", keywords:"fbs glucose diabetes fasting"},
  {id:"l5",  name:"HbA1c",                               cat:"lab", subcat:"Biochemistry",       price:9000,  unit:"per test", keywords:"hba1c glycated haemoglobin diabetes"},
  {id:"l6",  name:"Lipid Profile",                       cat:"lab", subcat:"Biochemistry",       price:8500,  unit:"per test", keywords:"lipids cholesterol ldl hdl triglycerides"},
  {id:"l7",  name:"Liver Function Test (LFT)",           cat:"lab", subcat:"Biochemistry",       price:9500,  unit:"per test", keywords:"lft liver alt ast alp bilirubin albumin"},
  {id:"l8",  name:"Renal Function Test (RFT)",           cat:"lab", subcat:"Biochemistry",       price:8500,  unit:"per test", keywords:"rft renal kidney creatinine urea egfr"},
  {id:"l9",  name:"Electrolytes (U&E)",                  cat:"lab", subcat:"Biochemistry",       price:7500,  unit:"per test", keywords:"electrolytes sodium potassium chloride bicarbonate urea"},
  {id:"l22", name:"Thyroid Function Test (TFT)",         cat:"lab", subcat:"Biochemistry",       price:11000, unit:"per test", keywords:"tft thyroid tsh t4 t3"},
  {id:"l23", name:"Uric Acid",                           cat:"lab", subcat:"Biochemistry",       price:4500,  unit:"per test", keywords:"uric acid gout"},
  {id:"l31", name:"Random Blood Sugar (RBS)",            cat:"lab", subcat:"Biochemistry",       price:2500,  unit:"per test", keywords:"rbs glucose random blood sugar"},
  {id:"l32", name:"Serum Amylase",                       cat:"lab", subcat:"Biochemistry",       price:5500,  unit:"per test", keywords:"amylase pancreatitis"},
  {id:"l33", name:"Serum Lipase",                        cat:"lab", subcat:"Biochemistry",       price:6000,  unit:"per test", keywords:"lipase pancreatitis"},
  {id:"l34", name:"C-Reactive Protein (CRP)",            cat:"lab", subcat:"Biochemistry",       price:6500,  unit:"per test", keywords:"crp inflammation infection"},
  {id:"l35", name:"Procalcitonin (PCT)",                 cat:"lab", subcat:"Biochemistry",       price:14000, unit:"per test", keywords:"pct procalcitonin sepsis bacterial"},
  {id:"l36", name:"D-Dimer",                             cat:"lab", subcat:"Biochemistry",       price:12000, unit:"per test", keywords:"d-dimer dvt pe clot thrombosis"},
  {id:"l37", name:"Coagulation Profile (PT/APTT/INR)",   cat:"lab", subcat:"Biochemistry",       price:9000,  unit:"per test", keywords:"coagulation pt aptt inr clotting warfarin"},
  {id:"l38", name:"Serum Protein Electrophoresis",       cat:"lab", subcat:"Biochemistry",       price:15000, unit:"per test", keywords:"protein electrophoresis myeloma"},
  {id:"l39", name:"Lactate (Serum)",                     cat:"lab", subcat:"Biochemistry",       price:8000,  unit:"per test", keywords:"lactate lactic acid sepsis shock"},
  {id:"l40", name:"Arterial Blood Gas (ABG)",            cat:"lab", subcat:"Biochemistry",       price:10000, unit:"per test", keywords:"abg arterial blood gas ph pco2 po2"},
  {id:"l41", name:"Serum Ferritin",                      cat:"lab", subcat:"Biochemistry",       price:7500,  unit:"per test", keywords:"ferritin iron stores anaemia"},
  {id:"l42", name:"Serum Iron & TIBC",                   cat:"lab", subcat:"Biochemistry",       price:6500,  unit:"per test", keywords:"iron tibc transferrin anaemia"},
  {id:"l43", name:"Vitamin B12",                         cat:"lab", subcat:"Biochemistry",       price:8500,  unit:"per test", keywords:"b12 vitamin cobalamin anaemia"},
  {id:"l44", name:"Folate (Serum)",                      cat:"lab", subcat:"Biochemistry",       price:7000,  unit:"per test", keywords:"folate folic acid anaemia"},
  {id:"l45", name:"Vitamin D (25-OH)",                   cat:"lab", subcat:"Biochemistry",       price:12000, unit:"per test", keywords:"vitamin d 25-oh deficiency"},
  {id:"l46", name:"Calcium (Serum)",                     cat:"lab", subcat:"Biochemistry",       price:4500,  unit:"per test", keywords:"calcium hypercalcaemia hypocalcaemia"},
  {id:"l47", name:"Magnesium (Serum)",                   cat:"lab", subcat:"Biochemistry",       price:4500,  unit:"per test", keywords:"magnesium hypo"},
  {id:"l48", name:"Phosphate (Serum)",                   cat:"lab", subcat:"Biochemistry",       price:4000,  unit:"per test", keywords:"phosphate"},
  // Microbiology
  {id:"l10", name:"Blood Culture & Sensitivity",         cat:"lab", subcat:"Microbiology",       price:12000, unit:"per test", keywords:"blood culture sensitivity sepsis bacteraemia"},
  {id:"l11", name:"Urine Culture & Sensitivity",         cat:"lab", subcat:"Microbiology",       price:9000,  unit:"per test", keywords:"urine culture mcs uti"},
  {id:"l12", name:"Stool MCS",                           cat:"lab", subcat:"Microbiology",       price:7500,  unit:"per test", keywords:"stool mcs culture diarrhoea"},
  {id:"l24", name:"Throat Swab C&S",                     cat:"lab", subcat:"Microbiology",       price:8500,  unit:"per test", keywords:"throat swab strep tonsillitis"},
  {id:"l25", name:"Wound Swab C&S",                      cat:"lab", subcat:"Microbiology",       price:9000,  unit:"per test", keywords:"wound swab infection"},
  {id:"l49", name:"Sputum MCS",                          cat:"lab", subcat:"Microbiology",       price:8000,  unit:"per test", keywords:"sputum mcs chest respiratory"},
  {id:"l50", name:"Sputum AFB (TB Smear)",               cat:"lab", subcat:"Microbiology",       price:6000,  unit:"per test", keywords:"afb tb tuberculosis sputum smear"},
  {id:"l51", name:"GeneXpert MTB/RIF",                   cat:"lab", subcat:"Microbiology",       price:18000, unit:"per test", keywords:"genexpert tb tuberculosis rifampicin"},
  {id:"l52", name:"Nasal Swab C&S",                      cat:"lab", subcat:"Microbiology",       price:8000,  unit:"per test", keywords:"nasal swab mrsa colonisation"},
  {id:"l53", name:"Ear Swab C&S",                        cat:"lab", subcat:"Microbiology",       price:7500,  unit:"per test", keywords:"ear swab otitis"},
  {id:"l54", name:"Eye Swab C&S",                        cat:"lab", subcat:"Microbiology",       price:7500,  unit:"per test", keywords:"eye swab conjunctivitis"},
  {id:"l55", name:"HVS (High Vaginal Swab)",             cat:"lab", subcat:"Microbiology",       price:8500,  unit:"per test", keywords:"hvs vaginal swab sti discharge"},
  {id:"l56", name:"Urethral Discharge C&S",              cat:"lab", subcat:"Microbiology",       price:8500,  unit:"per test", keywords:"urethral discharge gonorrhoea sti"},
  // Serology / Immunology
  {id:"l13", name:"Hepatitis B Surface Antigen (HBsAg)", cat:"lab", subcat:"Serology",           price:4500,  unit:"per test", keywords:"hbsag hepatitis b"},
  {id:"l14", name:"HIV Screening (ELISA)",               cat:"lab", subcat:"Serology",           price:5500,  unit:"per test", keywords:"hiv aids elisa screening"},
  {id:"l15", name:"Widal Test",                          cat:"lab", subcat:"Serology",           price:4000,  unit:"per test", keywords:"widal typhoid salmonella"},
  {id:"l26", name:"Rheumatoid Factor (RF)",              cat:"lab", subcat:"Serology",           price:6500,  unit:"per test", keywords:"rf rheumatoid arthritis"},
  {id:"l27", name:"ANA / ANCA",                          cat:"lab", subcat:"Serology",           price:14000, unit:"per test", keywords:"ana anca autoimmune lupus vasculitis"},
  {id:"l28", name:"VDRL / RPR (Syphilis)",               cat:"lab", subcat:"Serology",           price:5000,  unit:"per test", keywords:"vdrl rpr syphilis sti"},
  {id:"l57", name:"Hepatitis C Antibody (HCV Ab)",       cat:"lab", subcat:"Serology",           price:6000,  unit:"per test", keywords:"hepatitis c hcv antibody"},
  {id:"l58", name:"Hepatitis B Core Antibody (HBcAb)",   cat:"lab", subcat:"Serology",           price:7500,  unit:"per test", keywords:"hbcab hepatitis b core"},
  {id:"l59", name:"Hepatitis B e-Antigen (HBeAg)",       cat:"lab", subcat:"Serology",           price:7500,  unit:"per test", keywords:"hbeag hepatitis b"},
  {id:"l60", name:"Anti-HBs (Hepatitis B Immunity)",     cat:"lab", subcat:"Serology",           price:6500,  unit:"per test", keywords:"anti-hbs hepatitis b immunity vaccine"},
  {id:"l61", name:"CMV IgM / IgG",                       cat:"lab", subcat:"Serology",           price:9000,  unit:"per test", keywords:"cmv cytomegalovirus"},
  {id:"l62", name:"EBV (Monospot / Paul-Bunnell)",       cat:"lab", subcat:"Serology",           price:7000,  unit:"per test", keywords:"ebv epstein barr glandular fever mono"},
  {id:"l63", name:"Toxoplasma IgM / IgG",                cat:"lab", subcat:"Serology",           price:8500,  unit:"per test", keywords:"toxoplasma"},
  {id:"l64", name:"Dengue NS1 / IgM / IgG",              cat:"lab", subcat:"Serology",           price:9000,  unit:"per test", keywords:"dengue fever"},
  {id:"l65", name:"Helicobacter pylori (H. pylori) Ag",  cat:"lab", subcat:"Serology",           price:6500,  unit:"per test", keywords:"h pylori helicobacter ulcer"},
  {id:"l66", name:"COVID-19 Antigen (Rapid)",            cat:"lab", subcat:"Serology",           price:3500,  unit:"per test", keywords:"covid antigen rapid test"},
  {id:"l67", name:"COVID-19 PCR",                        cat:"lab", subcat:"Serology",           price:12000, unit:"per test", keywords:"covid pcr molecular"},
  // Parasitology & POC
  {id:"l16", name:"Malaria RDT",                         cat:"lab", subcat:"Parasitology",       price:2500,  unit:"per test", keywords:"malaria rdt rapid test"},
  {id:"l17", name:"Thick & Thin Blood Film",             cat:"lab", subcat:"Parasitology",       price:3500,  unit:"per test", keywords:"blood film malaria parasites"},
  {id:"l29", name:"Stool for Ova & Parasites",           cat:"lab", subcat:"Parasitology",       price:5000,  unit:"per test", keywords:"ova parasites stool worms"},
  {id:"l68", name:"Filariasis (ICT)",                    cat:"lab", subcat:"Parasitology",       price:6000,  unit:"per test", keywords:"filariasis ict"},
  {id:"l69", name:"Kato-Katz (Helminth eggs)",           cat:"lab", subcat:"Parasitology",       price:4000,  unit:"per test", keywords:"kato katz helminth schistosomiasis"},
  // Urine
  {id:"l18", name:"Urinalysis (Dipstick & Microscopy)",  cat:"lab", subcat:"Urine",              price:3000,  unit:"per test", keywords:"urinalysis dipstick microscopy urine"},
  {id:"l19", name:"Urine Pregnancy Test (UPT)",          cat:"lab", subcat:"Urine",              price:2500,  unit:"per test", keywords:"upt pregnancy test urine"},
  {id:"l30", name:"24-Hour Urine Protein",               cat:"lab", subcat:"Urine",              price:6500,  unit:"per test", keywords:"24h urine protein proteinuria"},
  {id:"l70", name:"Urine Albumin:Creatinine Ratio (ACR)",cat:"lab", subcat:"Urine",              price:5500,  unit:"per test", keywords:"acr urine albumin creatinine microalbuminuria"},
  // Hormones / Endocrine
  {id:"l71", name:"Fasting Insulin",                     cat:"lab", subcat:"Endocrine",          price:9500,  unit:"per test", keywords:"insulin fasting diabetes resistance"},
  {id:"l72", name:"Cortisol (Morning)",                  cat:"lab", subcat:"Endocrine",          price:9000,  unit:"per test", keywords:"cortisol adrenal cushing"},
  {id:"l73", name:"ACTH",                                cat:"lab", subcat:"Endocrine",          price:14000, unit:"per test", keywords:"acth adrenocorticotrophin"},
  {id:"l74", name:"Prolactin",                           cat:"lab", subcat:"Endocrine",          price:8500,  unit:"per test", keywords:"prolactin pituitary"},
  {id:"l75", name:"FSH / LH",                            cat:"lab", subcat:"Endocrine",          price:9000,  unit:"per test", keywords:"fsh lh fertility menopause"},
  {id:"l76", name:"Oestrogen (E2)",                      cat:"lab", subcat:"Endocrine",          price:9000,  unit:"per test", keywords:"oestrogen estradiol fertility"},
  {id:"l77", name:"Testosterone (Total)",                cat:"lab", subcat:"Endocrine",          price:9000,  unit:"per test", keywords:"testosterone androgen hypogonadism"},
  {id:"l78", name:"Progesterone",                        cat:"lab", subcat:"Endocrine",          price:8500,  unit:"per test", keywords:"progesterone pregnancy luteal"},
  {id:"l79", name:"Beta-HCG (Quantitative)",             cat:"lab", subcat:"Endocrine",          price:8000,  unit:"per test", keywords:"bhcg beta hcg quantitative pregnancy"},
  // Oncology markers
  {id:"l80", name:"PSA (Prostate Specific Antigen)",     cat:"lab", subcat:"Tumour Markers",     price:8500,  unit:"per test", keywords:"psa prostate cancer"},
  {id:"l81", name:"AFP (Alpha-Fetoprotein)",             cat:"lab", subcat:"Tumour Markers",     price:9000,  unit:"per test", keywords:"afp hepatoma liver cancer"},
  {id:"l82", name:"CEA (Carcinoembryonic Antigen)",      cat:"lab", subcat:"Tumour Markers",     price:9000,  unit:"per test", keywords:"cea colon cancer"},
  {id:"l83", name:"CA-125",                              cat:"lab", subcat:"Tumour Markers",     price:10000, unit:"per test", keywords:"ca125 ovarian cancer"},
  {id:"l84", name:"CA 19-9",                             cat:"lab", subcat:"Tumour Markers",     price:10000, unit:"per test", keywords:"ca19-9 pancreatic cancer"},
  {id:"l85", name:"Beta-2 Microglobulin",                cat:"lab", subcat:"Tumour Markers",     price:11000, unit:"per test", keywords:"b2m myeloma lymphoma"},
];

// Keep LAB_CATEGORIES derived from LAB_ITEMS for components that group by subcat
const LAB_CATEGORIES = Object.values(
  LAB_ITEMS.reduce((acc, t) => {
    if (!acc[t.subcat]) acc[t.subcat] = { cat: t.subcat, tests: [] };
    acc[t.subcat].tests.push(t);
    return acc;
  }, {})
);

// ----- RADIOLOGY ------------------------------------------------------------
const RAD_ITEMS = [
  // X-Ray
  {id:"r1",  name:"Chest X-Ray (PA View)",                cat:"radiology", subcat:"Plain X-Ray",    price:8000,  unit:"per study", keywords:"cxr chest xray pa"},
  {id:"r2",  name:"Chest X-Ray (AP View)",                cat:"radiology", subcat:"Plain X-Ray",    price:7000,  unit:"per study", keywords:"cxr chest xray ap"},
  {id:"r3",  name:"Abdominal X-Ray (Erect & Supine)",     cat:"radiology", subcat:"Plain X-Ray",    price:9000,  unit:"per study", keywords:"abdomen xray erect supine"},
  {id:"r4",  name:"Lumbar Spine X-Ray (AP & Lateral)",    cat:"radiology", subcat:"Plain X-Ray",    price:10000, unit:"per study", keywords:"lumbar spine lumbosacral"},
  {id:"r5",  name:"Cervical Spine X-Ray",                 cat:"radiology", subcat:"Plain X-Ray",    price:9500,  unit:"per study", keywords:"cervical spine neck xray"},
  {id:"r6",  name:"Knee X-Ray (AP & Lateral)",            cat:"radiology", subcat:"Plain X-Ray",    price:8500,  unit:"per study", keywords:"knee xray"},
  {id:"r7",  name:"Shoulder X-Ray",                       cat:"radiology", subcat:"Plain X-Ray",    price:8500,  unit:"per study", keywords:"shoulder xray"},
  {id:"r8",  name:"Pelvis X-Ray",                         cat:"radiology", subcat:"Plain X-Ray",    price:9000,  unit:"per study", keywords:"pelvis hip xray"},
  {id:"r9",  name:"Skull X-Ray",                          cat:"radiology", subcat:"Plain X-Ray",    price:8000,  unit:"per study", keywords:"skull head xray"},
  {id:"r28", name:"Wrist X-Ray (AP & Lateral)",           cat:"radiology", subcat:"Plain X-Ray",    price:8000,  unit:"per study", keywords:"wrist hand xray"},
  {id:"r29", name:"Ankle X-Ray",                          cat:"radiology", subcat:"Plain X-Ray",    price:8000,  unit:"per study", keywords:"ankle foot xray"},
  {id:"r30", name:"Elbow X-Ray",                          cat:"radiology", subcat:"Plain X-Ray",    price:8000,  unit:"per study", keywords:"elbow arm xray"},
  {id:"r31", name:"Thoracic Spine X-Ray",                 cat:"radiology", subcat:"Plain X-Ray",    price:9500,  unit:"per study", keywords:"thoracic dorsal spine xray"},
  {id:"r32", name:"Hip X-Ray",                            cat:"radiology", subcat:"Plain X-Ray",    price:9000,  unit:"per study", keywords:"hip femur xray"},
  {id:"r33", name:"Hand X-Ray",                           cat:"radiology", subcat:"Plain X-Ray",    price:7500,  unit:"per study", keywords:"hand finger xray"},
  {id:"r34", name:"Foot X-Ray",                           cat:"radiology", subcat:"Plain X-Ray",    price:7500,  unit:"per study", keywords:"foot toe xray"},
  // Ultrasound
  {id:"r10", name:"Abdominal Ultrasound",                 cat:"radiology", subcat:"Ultrasound",     price:18000, unit:"per study", keywords:"abdomen ultrasound uss liver kidney"},
  {id:"r11", name:"Pelvic Ultrasound (Transabdominal)",   cat:"radiology", subcat:"Ultrasound",     price:16000, unit:"per study", keywords:"pelvis ultrasound uterus ovary"},
  {id:"r12", name:"Obstetric Ultrasound",                 cat:"radiology", subcat:"Ultrasound",     price:20000, unit:"per study", keywords:"obstetric dating anomaly scan pregnancy"},
  {id:"r13", name:"Scrotal Ultrasound",                   cat:"radiology", subcat:"Ultrasound",     price:16000, unit:"per study", keywords:"scrotal testis ultrasound"},
  {id:"r14", name:"Neck / Thyroid Ultrasound",            cat:"radiology", subcat:"Ultrasound",     price:17000, unit:"per study", keywords:"neck thyroid ultrasound"},
  {id:"r15", name:"Breast Ultrasound",                    cat:"radiology", subcat:"Ultrasound",     price:17000, unit:"per study", keywords:"breast ultrasound"},
  {id:"r35", name:"Renal Ultrasound",                     cat:"radiology", subcat:"Ultrasound",     price:16000, unit:"per study", keywords:"renal kidney ultrasound"},
  {id:"r36", name:"Hepatobiliary Ultrasound",             cat:"radiology", subcat:"Ultrasound",     price:17000, unit:"per study", keywords:"liver gallbladder bile duct uss"},
  {id:"r37", name:"Doppler (Arterial / Venous)",          cat:"radiology", subcat:"Ultrasound",     price:22000, unit:"per study", keywords:"doppler dvt arterial venous flow"},
  {id:"r38", name:"Transvaginal Ultrasound (TVS)",        cat:"radiology", subcat:"Ultrasound",     price:18000, unit:"per study", keywords:"transvaginal tvs endometrium"},
  {id:"r39", name:"Soft Tissue Ultrasound",               cat:"radiology", subcat:"Ultrasound",     price:14000, unit:"per study", keywords:"soft tissue mass lump ultrasound"},
  {id:"r40", name:"Aortic Aneurysm Screen",               cat:"radiology", subcat:"Ultrasound",     price:18000, unit:"per study", keywords:"aorta aneurysm screen"},
  // CT Scan
  {id:"r16", name:"CT Head (Plain)",                      cat:"radiology", subcat:"CT Scan",        price:45000, unit:"per study", keywords:"ct head brain plain"},
  {id:"r17", name:"CT Head with Contrast",                cat:"radiology", subcat:"CT Scan",        price:55000, unit:"per study", keywords:"ct head brain contrast iv"},
  {id:"r18", name:"CT Chest",                             cat:"radiology", subcat:"CT Scan",        price:50000, unit:"per study", keywords:"ct chest lung thorax hrct"},
  {id:"r19", name:"CT Abdomen & Pelvis",                  cat:"radiology", subcat:"CT Scan",        price:60000, unit:"per study", keywords:"ct abdomen pelvis triple phase"},
  {id:"r20", name:"CT Angiography",                       cat:"radiology", subcat:"CT Scan",        price:75000, unit:"per study", keywords:"ct angiography cta coronary"},
  {id:"r41", name:"CT Spine",                             cat:"radiology", subcat:"CT Scan",        price:55000, unit:"per study", keywords:"ct spine cervical lumbar"},
  {id:"r42", name:"CT Pulmonary Angiography (CTPA)",      cat:"radiology", subcat:"CT Scan",        price:65000, unit:"per study", keywords:"ctpa pe pulmonary embolism"},
  {id:"r43", name:"CT KUB (Kidneys, Ureters, Bladder)",   cat:"radiology", subcat:"CT Scan",        price:50000, unit:"per study", keywords:"ct kub kidney ureter stones"},
  // MRI
  {id:"r21", name:"MRI Brain (Plain)",                    cat:"radiology", subcat:"MRI",            price:70000, unit:"per study", keywords:"mri brain plain"},
  {id:"r22", name:"MRI Brain with Contrast",              cat:"radiology", subcat:"MRI",            price:85000, unit:"per study", keywords:"mri brain contrast gadolinium"},
  {id:"r23", name:"MRI Lumbar Spine",                     cat:"radiology", subcat:"MRI",            price:75000, unit:"per study", keywords:"mri lumbar spine disc"},
  {id:"r24", name:"MRI Knee",                             cat:"radiology", subcat:"MRI",            price:65000, unit:"per study", keywords:"mri knee meniscus ligament"},
  {id:"r44", name:"MRI Whole Spine",                      cat:"radiology", subcat:"MRI",            price:95000, unit:"per study", keywords:"mri spine cervical thoracic lumbar"},
  {id:"r45", name:"MRI Shoulder",                         cat:"radiology", subcat:"MRI",            price:70000, unit:"per study", keywords:"mri shoulder rotator cuff"},
  {id:"r46", name:"MRI Pelvis",                           cat:"radiology", subcat:"MRI",            price:75000, unit:"per study", keywords:"mri pelvis prostate uterus"},
  {id:"r47", name:"MRI Abdomen",                          cat:"radiology", subcat:"MRI",            price:80000, unit:"per study", keywords:"mri abdomen liver mrcp"},
  // Cardiac
  {id:"r25", name:"Echocardiogram (TTE)",                 cat:"radiology", subcat:"Cardiac Imaging",price:35000, unit:"per study", keywords:"echo echocardiogram cardiac tte"},
  {id:"r26", name:"ECG (12-lead)",                        cat:"radiology", subcat:"Cardiac Imaging",price:5500,  unit:"per study", keywords:"ecg ekg 12-lead cardiac"},
  {id:"r27", name:"Stress ECG (ETT)",                     cat:"radiology", subcat:"Cardiac Imaging",price:25000, unit:"per study", keywords:"stress ecg exercise tolerance test ett"},
  {id:"r48", name:"Holter Monitor (24h)",                 cat:"radiology", subcat:"Cardiac Imaging",price:30000, unit:"per study", keywords:"holter 24 hour ecg arrhythmia"},
  {id:"r49", name:"Transesophageal Echo (TEE)",           cat:"radiology", subcat:"Cardiac Imaging",price:55000, unit:"per study", keywords:"tee transesophageal echo"},
  // Mammography / Special
  {id:"r50", name:"Mammography (Bilateral)",              cat:"radiology", subcat:"Special Studies", price:22000, unit:"per study", keywords:"mammogram breast cancer screening"},
  {id:"r51", name:"DEXA Bone Density Scan",               cat:"radiology", subcat:"Special Studies", price:18000, unit:"per study", keywords:"dexa bone density osteoporosis"},
  {id:"r52", name:"Fluoroscopy / Barium Swallow",         cat:"radiology", subcat:"Special Studies", price:25000, unit:"per study", keywords:"barium swallow fluoroscopy oesophagus"},
  {id:"r53", name:"IVU / Intravenous Urogram",            cat:"radiology", subcat:"Special Studies", price:28000, unit:"per study", keywords:"ivu intravenous urogram kidney"},
];

// Keep RAD_CATEGORIES for components that group by subcat
const RAD_CATEGORIES = Object.values(
  RAD_ITEMS.reduce((acc, t) => {
    if (!acc[t.subcat]) acc[t.subcat] = { cat: t.subcat, tests: [] };
    acc[t.subcat].tests.push(t);
    return acc;
  }, {})
);

// ----- PHARMACY (Drugs) -----------------------------------------------------
const DRUG_ITEMS = [
  // Analgesics
  {id:"d1",  name:"Paracetamol",                 cat:"pharmacy", subcat:"Analgesics",        price:500,   unit:"per dose", keywords:"paracetamol acetaminophen pain fever"},
  {id:"d2",  name:"Ibuprofen",                   cat:"pharmacy", subcat:"Analgesics",        price:700,   unit:"per dose", keywords:"ibuprofen nsaid pain anti-inflammatory"},
  {id:"d3",  name:"Diclofenac",                  cat:"pharmacy", subcat:"Analgesics",        price:800,   unit:"per dose", keywords:"diclofenac nsaid pain"},
  {id:"d4",  name:"Tramadol",                    cat:"pharmacy", subcat:"Analgesics",        price:1800,  unit:"per dose", keywords:"tramadol opioid pain controlled"},
  {id:"d5",  name:"Morphine Sulphate",           cat:"pharmacy", subcat:"Analgesics",        price:3500,  unit:"per dose", keywords:"morphine opioid pain controlled"},
  {id:"d6",  name:"Codeine Phosphate",           cat:"pharmacy", subcat:"Analgesics",        price:1500,  unit:"per dose", keywords:"codeine opioid cough pain controlled"},
  {id:"d7",  name:"Pethidine (Meperidine)",      cat:"pharmacy", subcat:"Analgesics",        price:2500,  unit:"per dose", keywords:"pethidine meperidine opioid"},
  // Antibiotics
  {id:"d10", name:"Amoxicillin",                 cat:"pharmacy", subcat:"Antibiotics",       price:900,   unit:"per dose", keywords:"amoxicillin penicillin antibiotic"},
  {id:"d11", name:"Augmentin (Co-amoxiclav)",    cat:"pharmacy", subcat:"Antibiotics",       price:2200,  unit:"per dose", keywords:"augmentin co-amoxiclav clavulanate"},
  {id:"d12", name:"Azithromycin",                cat:"pharmacy", subcat:"Antibiotics",       price:1800,  unit:"per dose", keywords:"azithromycin macrolide antibiotic"},
  {id:"d13", name:"Ciprofloxacin",               cat:"pharmacy", subcat:"Antibiotics",       price:1400,  unit:"per dose", keywords:"ciprofloxacin quinolone antibiotic"},
  {id:"d14", name:"Metronidazole",               cat:"pharmacy", subcat:"Antibiotics",       price:700,   unit:"per dose", keywords:"metronidazole flagyl anaerobic antibiotic"},
  {id:"d15", name:"Nitrofurantoin",              cat:"pharmacy", subcat:"Antibiotics",       price:1600,  unit:"per dose", keywords:"nitrofurantoin uti antibiotic"},
  {id:"d16", name:"Doxycycline",                 cat:"pharmacy", subcat:"Antibiotics",       price:900,   unit:"per dose", keywords:"doxycycline tetracycline antibiotic"},
  {id:"d17", name:"Clindamycin",                 cat:"pharmacy", subcat:"Antibiotics",       price:2000,  unit:"per dose", keywords:"clindamycin lincosamide anaerobic"},
  {id:"d18", name:"Ceftriaxone",                 cat:"pharmacy", subcat:"Antibiotics",       price:3500,  unit:"per dose", keywords:"ceftriaxone cephalosporin iv antibiotic"},
  {id:"d19", name:"Cefuroxime",                  cat:"pharmacy", subcat:"Antibiotics",       price:2800,  unit:"per dose", keywords:"cefuroxime cephalosporin"},
  {id:"d20", name:"Piperacillin/Tazobactam",    cat:"pharmacy", subcat:"Antibiotics",       price:5500,  unit:"per dose", keywords:"pip-tazo tazocin broad spectrum iv"},
  {id:"d21", name:"Meropenem",                   cat:"pharmacy", subcat:"Antibiotics",       price:8000,  unit:"per dose", keywords:"meropenem carbapenem sepsis"},
  {id:"d22", name:"Vancomycin",                  cat:"pharmacy", subcat:"Antibiotics",       price:7000,  unit:"per dose", keywords:"vancomycin mrsa iv glycopeptide"},
  {id:"d23", name:"Gentamicin",                  cat:"pharmacy", subcat:"Antibiotics",       price:2000,  unit:"per dose", keywords:"gentamicin aminoglycoside iv"},
  {id:"d24", name:"Trimethoprim",                cat:"pharmacy", subcat:"Antibiotics",       price:800,   unit:"per dose", keywords:"trimethoprim uti prophylaxis"},
  {id:"d25", name:"Erythromycin",                cat:"pharmacy", subcat:"Antibiotics",       price:1200,  unit:"per dose", keywords:"erythromycin macrolide"},
  {id:"d26", name:"Flucloxacillin",              cat:"pharmacy", subcat:"Antibiotics",       price:1500,  unit:"per dose", keywords:"flucloxacillin staphylococcus skin"},
  // Antimalarials
  {id:"d30", name:"Artemether/Lumefantrine (Coartem)",cat:"pharmacy",subcat:"Antimalarials",price:3500,  unit:"per dose", keywords:"coartem artemether lumefantrine malaria"},
  {id:"d31", name:"Artesunate IV",               cat:"pharmacy", subcat:"Antimalarials",     price:4500,  unit:"per dose", keywords:"artesunate iv severe malaria"},
  {id:"d32", name:"Quinine IV",                  cat:"pharmacy", subcat:"Antimalarials",     price:2500,  unit:"per dose", keywords:"quinine iv malaria severe"},
  {id:"d33", name:"Chloroquine",                 cat:"pharmacy", subcat:"Antimalarials",     price:800,   unit:"per dose", keywords:"chloroquine malaria prophylaxis"},
  {id:"d34", name:"Primaquine",                  cat:"pharmacy", subcat:"Antimalarials",     price:1200,  unit:"per dose", keywords:"primaquine radical cure vivax"},
  // Antihypertensives
  {id:"d40", name:"Amlodipine",                  cat:"pharmacy", subcat:"Antihypertensives", price:800,   unit:"per dose", keywords:"amlodipine calcium channel blocker hypertension"},
  {id:"d41", name:"Losartan",                    cat:"pharmacy", subcat:"Antihypertensives", price:1200,  unit:"per dose", keywords:"losartan arb hypertension"},
  {id:"d42", name:"Lisinopril",                  cat:"pharmacy", subcat:"Antihypertensives", price:950,   unit:"per dose", keywords:"lisinopril ace inhibitor hypertension"},
  {id:"d43", name:"Enalapril",                   cat:"pharmacy", subcat:"Antihypertensives", price:900,   unit:"per dose", keywords:"enalapril ace inhibitor"},
  {id:"d44", name:"Hydrochlorothiazide",         cat:"pharmacy", subcat:"Antihypertensives", price:600,   unit:"per dose", keywords:"hctz thiazide diuretic hypertension"},
  {id:"d45", name:"Furosemide",                  cat:"pharmacy", subcat:"Antihypertensives", price:600,   unit:"per dose", keywords:"furosemide frusemide loop diuretic oedema"},
  {id:"d46", name:"Spironolactone",              cat:"pharmacy", subcat:"Antihypertensives", price:800,   unit:"per dose", keywords:"spironolactone aldosterone heart failure"},
  {id:"d47", name:"Carvedilol",                  cat:"pharmacy", subcat:"Antihypertensives", price:1200,  unit:"per dose", keywords:"carvedilol beta blocker heart failure"},
  {id:"d48", name:"Metoprolol",                  cat:"pharmacy", subcat:"Antihypertensives", price:1000,  unit:"per dose", keywords:"metoprolol beta blocker"},
  {id:"d49", name:"Atenolol",                    cat:"pharmacy", subcat:"Antihypertensives", price:700,   unit:"per dose", keywords:"atenolol beta blocker"},
  {id:"d50", name:"Nifedipine",                  cat:"pharmacy", subcat:"Antihypertensives", price:700,   unit:"per dose", keywords:"nifedipine calcium channel"},
  // Cardiac
  {id:"d60", name:"Aspirin (Low Dose 75mg)",     cat:"pharmacy", subcat:"Cardiac",           price:400,   unit:"per dose", keywords:"aspirin antiplatelet low dose 75mg"},
  {id:"d61", name:"Aspirin (Loading 300mg)",     cat:"pharmacy", subcat:"Cardiac",           price:600,   unit:"per dose", keywords:"aspirin loading dose acs"},
  {id:"d62", name:"Clopidogrel",                 cat:"pharmacy", subcat:"Cardiac",           price:2500,  unit:"per dose", keywords:"clopidogrel antiplatelet acs stent"},
  {id:"d63", name:"Ticagrelor",                  cat:"pharmacy", subcat:"Cardiac",           price:4500,  unit:"per dose", keywords:"ticagrelor antiplatelet acs"},
  {id:"d64", name:"Heparin (Unfractionated)",    cat:"pharmacy", subcat:"Cardiac",           price:4500,  unit:"per dose", keywords:"heparin anticoagulant iv dvt pe"},
  {id:"d65", name:"Enoxaparin (LMWH)",          cat:"pharmacy", subcat:"Cardiac",           price:3500,  unit:"per dose", keywords:"enoxaparin clexane lmwh sc dvt"},
  {id:"d66", name:"Warfarin",                    cat:"pharmacy", subcat:"Cardiac",           price:1200,  unit:"per dose", keywords:"warfarin anticoagulant af dvt"},
  {id:"d67", name:"Atorvastatin",                cat:"pharmacy", subcat:"Cardiac",           price:1100,  unit:"per dose", keywords:"atorvastatin statin cholesterol"},
  {id:"d68", name:"Simvastatin",                 cat:"pharmacy", subcat:"Cardiac",           price:900,   unit:"per dose", keywords:"simvastatin statin cholesterol"},
  {id:"d69", name:"Digoxin",                     cat:"pharmacy", subcat:"Cardiac",           price:800,   unit:"per dose", keywords:"digoxin af heart failure"},
  {id:"d70", name:"Amiodarone",                  cat:"pharmacy", subcat:"Cardiac",           price:2500,  unit:"per dose", keywords:"amiodarone arrhythmia af"},
  {id:"d71", name:"GTN (Glyceryl Trinitrate) Spray",cat:"pharmacy",subcat:"Cardiac",        price:1200,  unit:"per dose", keywords:"gtn nitrate angina spray"},
  {id:"d72", name:"Isosorbide Mononitrate",      cat:"pharmacy", subcat:"Cardiac",           price:900,   unit:"per dose", keywords:"isosorbide mononitrate nitrate angina"},
  // Diabetes
  {id:"d80", name:"Metformin",                   cat:"pharmacy", subcat:"Diabetes",          price:900,   unit:"per dose", keywords:"metformin biguanide diabetes t2dm"},
  {id:"d81", name:"Glibenclamide",               cat:"pharmacy", subcat:"Diabetes",          price:700,   unit:"per dose", keywords:"glibenclamide sulphonylurea diabetes"},
  {id:"d82", name:"Glimepiride",                 cat:"pharmacy", subcat:"Diabetes",          price:1000,  unit:"per dose", keywords:"glimepiride sulphonylurea diabetes"},
  {id:"d83", name:"Sitagliptin",                 cat:"pharmacy", subcat:"Diabetes",          price:3500,  unit:"per dose", keywords:"sitagliptin dpp4 diabetes"},
  {id:"d84", name:"Empagliflozin",               cat:"pharmacy", subcat:"Diabetes",          price:4500,  unit:"per dose", keywords:"empagliflozin sglt2 diabetes"},
  {id:"d85", name:"Insulin Glargine (Lantus)",   cat:"pharmacy", subcat:"Diabetes",          price:4500,  unit:"per dose", keywords:"insulin glargine lantus basal t1dm"},
  {id:"d86", name:"Insulin Regular (Actrapid)",  cat:"pharmacy", subcat:"Diabetes",          price:3500,  unit:"per dose", keywords:"insulin regular actrapid sliding scale"},
  // GI / Gastro
  {id:"d90", name:"Omeprazole",                  cat:"pharmacy", subcat:"Gastroenterology",  price:900,   unit:"per dose", keywords:"omeprazole ppi ulcer gerd"},
  {id:"d91", name:"Pantoprazole",                cat:"pharmacy", subcat:"Gastroenterology",  price:1100,  unit:"per dose", keywords:"pantoprazole ppi ulcer"},
  {id:"d92", name:"Ranitidine",                  cat:"pharmacy", subcat:"Gastroenterology",  price:550,   unit:"per dose", keywords:"ranitidine h2 blocker ulcer"},
  {id:"d93", name:"Metoclopramide",              cat:"pharmacy", subcat:"Gastroenterology",  price:600,   unit:"per dose", keywords:"metoclopramide antiemetic nausea"},
  {id:"d94", name:"Ondansetron",                 cat:"pharmacy", subcat:"Gastroenterology",  price:1500,  unit:"per dose", keywords:"ondansetron zofran antiemetic serotonin"},
  {id:"d95", name:"Oral Rehydration Salts (ORS)",cat:"pharmacy", subcat:"Gastroenterology",  price:400,   unit:"per dose", keywords:"ors oral rehydration diarrhoea"},
  {id:"d96", name:"Loperamide",                  cat:"pharmacy", subcat:"Gastroenterology",  price:700,   unit:"per dose", keywords:"loperamide diarrhoea antidiarrhoeal"},
  {id:"d97", name:"Lactulose",                   cat:"pharmacy", subcat:"Gastroenterology",  price:1200,  unit:"per dose", keywords:"lactulose constipation encephalopathy"},
  {id:"d98", name:"Senna",                       cat:"pharmacy", subcat:"Gastroenterology",  price:500,   unit:"per dose", keywords:"senna laxative constipation"},
  {id:"d99", name:"Hyoscine Butylbromide (Buscopan)",cat:"pharmacy",subcat:"Gastroenterology",price:900, unit:"per dose", keywords:"buscopan hyoscine spasm colic"},
  // Steroids / Immunosuppressants
  {id:"d100",name:"Prednisolone",                cat:"pharmacy", subcat:"Steroids",          price:700,   unit:"per dose", keywords:"prednisolone steroid asthma rheumatoid"},
  {id:"d101",name:"Dexamethasone",               cat:"pharmacy", subcat:"Steroids",          price:900,   unit:"per dose", keywords:"dexamethasone steroid iv cerebral oedema"},
  {id:"d102",name:"Hydrocortisone IV",           cat:"pharmacy", subcat:"Steroids",          price:1200,  unit:"per dose", keywords:"hydrocortisone steroid iv addisonian"},
  {id:"d103",name:"Methylprednisolone",          cat:"pharmacy", subcat:"Steroids",          price:3500,  unit:"per dose", keywords:"methylprednisolone steroid pulse iv"},
  // Respiratory
  {id:"d110",name:"Salbutamol Inhaler (MDI)",   cat:"pharmacy", subcat:"Respiratory",        price:1800,  unit:"per dose", keywords:"salbutamol ventolin reliever asthma"},
  {id:"d111",name:"Beclometasone Inhaler",       cat:"pharmacy", subcat:"Respiratory",        price:2500,  unit:"per dose", keywords:"beclometasone steroid inhaler asthma preventer"},
  {id:"d112",name:"Salbutamol Nebuliser",        cat:"pharmacy", subcat:"Respiratory",        price:1200,  unit:"per dose", keywords:"salbutamol nebuliser bronchospasm"},
  {id:"d113",name:"Ipratropium Nebuliser",       cat:"pharmacy", subcat:"Respiratory",        price:1500,  unit:"per dose", keywords:"ipratropium atrovent copd nebuliser"},
  {id:"d114",name:"Theophylline",               cat:"pharmacy", subcat:"Respiratory",        price:800,   unit:"per dose", keywords:"theophylline bronchodilator copd asthma"},
  {id:"d115",name:"Montelukast",                cat:"pharmacy", subcat:"Respiratory",        price:2000,  unit:"per dose", keywords:"montelukast leukotriene asthma allergy"},
  // Neuro / Psych
  {id:"d120",name:"Diazepam",                   cat:"pharmacy", subcat:"Neurology/Psych",    price:1000,  unit:"per dose", keywords:"diazepam benzodiazepine anxiety seizure"},
  {id:"d121",name:"Lorazepam",                  cat:"pharmacy", subcat:"Neurology/Psych",    price:1500,  unit:"per dose", keywords:"lorazepam benzodiazepine status epilepticus"},
  {id:"d122",name:"Phenytoin",                  cat:"pharmacy", subcat:"Neurology/Psych",    price:900,   unit:"per dose", keywords:"phenytoin anticonvulsant epilepsy"},
  {id:"d123",name:"Carbamazepine",              cat:"pharmacy", subcat:"Neurology/Psych",    price:1100,  unit:"per dose", keywords:"carbamazepine tegretol epilepsy"},
  {id:"d124",name:"Sodium Valproate",           cat:"pharmacy", subcat:"Neurology/Psych",    price:1200,  unit:"per dose", keywords:"sodium valproate epilepsy bipolar"},
  {id:"d125",name:"Levetiracetam (Keppra)",     cat:"pharmacy", subcat:"Neurology/Psych",    price:3500,  unit:"per dose", keywords:"levetiracetam keppra epilepsy"},
  {id:"d126",name:"Haloperidol",                cat:"pharmacy", subcat:"Neurology/Psych",    price:900,   unit:"per dose", keywords:"haloperidol antipsychotic delirium"},
  {id:"d127",name:"Chlorpromazine",             cat:"pharmacy", subcat:"Neurology/Psych",    price:800,   unit:"per dose", keywords:"chlorpromazine antipsychotic"},
  {id:"d128",name:"Amitriptyline",              cat:"pharmacy", subcat:"Neurology/Psych",    price:700,   unit:"per dose", keywords:"amitriptyline tricyclic depression neuropathic pain"},
  {id:"d129",name:"Fluoxetine",                 cat:"pharmacy", subcat:"Neurology/Psych",    price:1200,  unit:"per dose", keywords:"fluoxetine ssri depression"},
  {id:"d130",name:"Sertraline",                 cat:"pharmacy", subcat:"Neurology/Psych",    price:1300,  unit:"per dose", keywords:"sertraline ssri depression anxiety"},
  // IV Fluids
  {id:"d140",name:"Normal Saline 0.9% (500mL)",cat:"pharmacy", subcat:"IV Fluids",           price:800,   unit:"per bag",  keywords:"normal saline ns iv fluid"},
  {id:"d141",name:"Normal Saline 0.9% (1L)",   cat:"pharmacy", subcat:"IV Fluids",           price:1200,  unit:"per bag",  keywords:"normal saline ns 1 litre iv fluid"},
  {id:"d142",name:"Dextrose 5% (500mL)",        cat:"pharmacy", subcat:"IV Fluids",           price:800,   unit:"per bag",  keywords:"dextrose 5% d5w iv fluid"},
  {id:"d143",name:"Dextrose 5% (1L)",           cat:"pharmacy", subcat:"IV Fluids",           price:1200,  unit:"per bag",  keywords:"dextrose 5% d5w 1 litre iv fluid"},
  {id:"d144",name:"Ringer's Lactate (1L)",      cat:"pharmacy", subcat:"IV Fluids",           price:1300,  unit:"per bag",  keywords:"ringers lactate hartmanns iv fluid"},
  {id:"d145",name:"Dextrose/Saline (500mL)",    cat:"pharmacy", subcat:"IV Fluids",           price:900,   unit:"per bag",  keywords:"dextrose saline iv fluid maintenance"},
  {id:"d146",name:"Gelofusine 500mL",           cat:"pharmacy", subcat:"IV Fluids",           price:4500,  unit:"per bag",  keywords:"gelofusine colloid iv fluid resuscitation"},
  // Nutritional / Supplements
  {id:"d150",name:"Folic Acid 5mg",             cat:"pharmacy", subcat:"Nutritional",         price:400,   unit:"per dose", keywords:"folic acid folate anaemia pregnancy"},
  {id:"d151",name:"Ferrous Sulphate",           cat:"pharmacy", subcat:"Nutritional",         price:500,   unit:"per dose", keywords:"ferrous sulphate iron anaemia deficiency"},
  {id:"d152",name:"Vitamin C (Ascorbic Acid)",  cat:"pharmacy", subcat:"Nutritional",         price:350,   unit:"per dose", keywords:"vitamin c ascorbic acid"},
  {id:"d153",name:"Zinc Sulphate",              cat:"pharmacy", subcat:"Nutritional",         price:600,   unit:"per dose", keywords:"zinc diarrhoea children"},
  {id:"d154",name:"Vitamin A",                  cat:"pharmacy", subcat:"Nutritional",         price:500,   unit:"per dose", keywords:"vitamin a retinol deficiency"},
  {id:"d155",name:"Calcium Carbonate",          cat:"pharmacy", subcat:"Nutritional",         price:700,   unit:"per dose", keywords:"calcium carbonate supplement"},
  // Other
  {id:"d160",name:"Benzydamine Spray",          cat:"pharmacy", subcat:"ENT/Topical",         price:2200,  unit:"per dose", keywords:"benzydamine throat spray sore throat"},
  {id:"d161",name:"Chlorhexidine Mouthwash",    cat:"pharmacy", subcat:"ENT/Topical",         price:1500,  unit:"per dose", keywords:"chlorhexidine mouthwash antiseptic"},
  {id:"d162",name:"Methenamine Hippurate",      cat:"pharmacy", subcat:"ENT/Topical",         price:2000,  unit:"per dose", keywords:"methenamine hippurate urinary antiseptic"},
  {id:"d163",name:"Hydrocortisone Cream 1%",   cat:"pharmacy", subcat:"ENT/Topical",         price:900,   unit:"per dose", keywords:"hydrocortisone cream topical itch"},
  {id:"d164",name:"Clotrimazole Cream",         cat:"pharmacy", subcat:"ENT/Topical",         price:1100,  unit:"per dose", keywords:"clotrimazole antifungal cream"},
  {id:"d165",name:"Chloramphenicol Eye Drops",  cat:"pharmacy", subcat:"ENT/Topical",         price:1000,  unit:"per dose", keywords:"chloramphenicol eye drops conjunctivitis"},
];

// ----- CONSULTATION / PROCEDURE SERVICES -----------------------------------
const SERVICES = [
  {id:"s1",  name:"Consultation - General",    cat:"consultation", subcat:"Consultation",     price:5000,  unit:"per visit",  keywords:"consultation general opd"},
  {id:"s2",  name:"Consultation - Specialist", cat:"consultation", subcat:"Consultation",     price:12000, unit:"per visit",  keywords:"consultation specialist"},
  {id:"s9",  name:"IV Drip Administration",    cat:"procedure",    subcat:"Procedures",       price:1800,  unit:"per bag",    keywords:"iv drip administration infusion"},
  {id:"s10", name:"Wound Dressing",            cat:"procedure",    subcat:"Procedures",       price:3500,  unit:"per session",keywords:"wound dressing change"},
  {id:"s13", name:"Pharmacy / Medications",    cat:"pharmacy",     subcat:"Pharmacy",         price:0,     unit:"per course", keywords:"pharmacy medications drugs dispensing"},
  {id:"s14", name:"Laboratory Tests",          cat:"lab",          subcat:"Lab Bundle",       price:0,     unit:"per order",  keywords:"lab tests investigations"},
];

// ----- INPATIENT DAILY CHARGES ----------------------------------------------
const IP_CHARGES = [
  {id:"ip1",  name:"General Ward Bed",          cat:"accommodation", subcat:"Accommodation",  price:3500,  unit:"per day"},
  {id:"ip2",  name:"Private Room",              cat:"accommodation", subcat:"Accommodation",  price:12000, unit:"per day"},
  {id:"ip3",  name:"CCU / ICU Bed",             cat:"accommodation", subcat:"Accommodation",  price:25000, unit:"per day"},
  {id:"ip4",  name:"Nursing Care",              cat:"nursing",       subcat:"Nursing",        price:2000,  unit:"per shift"},
  {id:"ip5",  name:"Specialised Nursing",       cat:"nursing",       subcat:"Nursing",        price:4000,  unit:"per shift"},
  {id:"ip6",  name:"Hospital Meals",            cat:"meals",         subcat:"Meals",          price:1500,  unit:"per day"},
  {id:"ip7",  name:"IV Cannulation",            cat:"procedure",     subcat:"Procedures",     price:1200,  unit:"per procedure"},
  {id:"ip8",  name:"IV Fluid Administration",   cat:"procedure",     subcat:"Procedures",     price:1800,  unit:"per bag"},
  {id:"ip9",  name:"Oxygen Therapy",            cat:"procedure",     subcat:"Procedures",     price:3000,  unit:"per day"},
  {id:"ip10", name:"Nasogastric Tube Insertion",cat:"procedure",     subcat:"Procedures",     price:2500,  unit:"per procedure"},
  {id:"ip11", name:"Urinary Catheterisation",   cat:"procedure",     subcat:"Procedures",     price:2500,  unit:"per procedure"},
  {id:"ip12", name:"Wound Dressing",            cat:"procedure",     subcat:"Procedures",     price:1500,  unit:"per session"},
  {id:"ip13", name:"ECG (Repeat)",              cat:"procedure",     subcat:"Procedures",     price:4000,  unit:"per test"},
  {id:"ip14", name:"Blood Transfusion",         cat:"procedure",     subcat:"Procedures",     price:8000,  unit:"per unit"},
  {id:"ip15", name:"Specialist Review",         cat:"consultation",  subcat:"Consultation",   price:5000,  unit:"per visit"},
  {id:"ip16", name:"Ward Round",                cat:"consultation",  subcat:"Consultation",   price:2000,  unit:"per day"},
];

// ============================================================================
// MASTER ITEM REGISTRY - single flat map, O(1) lookup by id
// ============================================================================
const ITEM_REGISTRY = {};
[...LAB_ITEMS, ...RAD_ITEMS, ...DRUG_ITEMS, ...SERVICES, ...IP_CHARGES].forEach(i => {
  ITEM_REGISTRY[i.id] = i;
});

// ============================================================================
// SEARCH ENGINE
// Handles 100,000+ items efficiently:
//  - Pre-built token index (runs once at startup)
//  - Returns top-N results sorted by relevance score
//  - Filters by category array if provided
// ============================================================================
const _buildIndex = (items) => {
  const idx = {};
  items.forEach(item => {
    const tokens = [
      item.id,
      ...(item.name||"").toLowerCase().split(/\W+/),
      ...(item.subcat||"").toLowerCase().split(/\W+/),
      ...(item.keywords||"").toLowerCase().split(/\s+/),
    ].filter(Boolean);
    tokens.forEach(tok => {
      if (!idx[tok]) idx[tok] = new Set();
      idx[tok].add(item.id);
    });
  });
  return idx;
};

const ALL_ITEMS = [...LAB_ITEMS, ...RAD_ITEMS, ...DRUG_ITEMS, ...SERVICES, ...IP_CHARGES];
const _TOKEN_IDX = _buildIndex(ALL_ITEMS);

function searchRegistry(query, { cats = null, limit = 20 } = {}) {
  if (!query || query.trim().length < 1) {
    // No query: return top items from requested categories
    const pool = cats ? ALL_ITEMS.filter(i => cats.includes(i.cat)) : ALL_ITEMS;
    return pool.slice(0, limit);
  }
  const terms = query.toLowerCase().split(/\W+/).filter(t => t.length >= 1);
  const scores = {};

  terms.forEach(term => {
    // Exact token match
    if (_TOKEN_IDX[term]) {
      _TOKEN_IDX[term].forEach(id => { scores[id] = (scores[id]||0) + 10; });
    }
    // Prefix match (partial typing)
    Object.keys(_TOKEN_IDX).forEach(tok => {
      if (tok !== term && tok.startsWith(term)) {
        _TOKEN_IDX[tok].forEach(id => { scores[id] = (scores[id]||0) + 5; });
      }
    });
    // Substring match
    Object.keys(_TOKEN_IDX).forEach(tok => {
      if (!tok.startsWith(term) && tok.includes(term)) {
        _TOKEN_IDX[tok].forEach(id => { scores[id] = (scores[id]||0) + 2; });
      }
    });
  });

  return Object.entries(scores)
    .filter(([id]) => {
      const item = ITEM_REGISTRY[id];
      return item && (!cats || cats.includes(item.cat));
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => ITEM_REGISTRY[id]);
}

// Backward compat: getDrugPrice still works
function getDrugPrice(name) {
  if (!name) return 1500;
  const n = name.toLowerCase();
  const match = DRUG_ITEMS.find(d => n.includes(d.name.toLowerCase().split(" ")[0].substring(0, 6)));
  return match ? match.price : 1500;
}

// Drug-specific helpers
const DRUG_ROUTES   = ["Oral","IV Bolus","IV Infusion","IM","SC","Topical","Inhaled","Sublingual","PR (Rectal)","Nasal","Ophthalmic","Otic"];
const DRUG_FREQ     = ["OD (Once daily)","BD (Twice daily)","TDS (Three times daily)","QDS (Four times daily)","PRN (As needed)","Stat (Single dose)","Nocte (At night)","Weekly","Biweekly","Monthly"];
const DRUG_DURATION = ["1 day","2 days","3 days","5 days","7 days","10 days","14 days","30 days","3 months","6 months","Ongoing / TCA"];


const TRIAGE_LEVELS = [
  { level:"1", label:"Resuscitation", sub:"Immediate",     tc:"#fff", bg:"#b71c1c" },
  { level:"2", label:"Emergent",      sub:"< 15 min",      tc:"#fff", bg:"#e65100" },
  { level:"3", label:"Urgent",        sub:"< 30 min",      tc:"#111", bg:"#fdd835" },
  { level:"4", label:"Less Urgent",   sub:"< 60 min",      tc:"#fff", bg:"#2e7d32" },
  { level:"5", label:"Non-Urgent",    sub:"< 120 min",     tc:"#fff", bg:"#1565c0" },
];

// Flow: Queue(1) -> Triage(2) -> Registration(3) -> Billing(4) -> Doctor(5) -> Lab(6) -> Completed
const FLOW_STEPS = [
  { key:"Queued",            label:"Queued",       icon:"ticket" },
  { key:"Triaged",           label:"Triaged",      icon:"steth" },
  { key:"Registered",        label:"Registered",   icon:"note" },
  { key:"Billed",            label:"Billed",       icon:"card" },
  { key:"With Doctor",       label:"Doctor",       icon:"steth" },
  { key:"Lab Pending",       label:"Lab",          icon:"lab" },
  { key:"Results Ready",     label:"Results",      icon:"clip" },
  { key:"Pending Admission", label:"Admission",    icon:"hosp" },
  { key:"Admitted",          label:"Admitted",     icon:"bed" },
  { key:"Completed",         label:"Completed",    icon:"check" },
];


export { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice, TRIAGE_LEVELS, FLOW_STEPS };
