import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function LabPage(props) {
  const {
    page, setPage, finCtx, setFinCtx, patients, setPatients, active, setActive,
    search, setSearch, fStatus, setFStatus, delId, setDelId,
    toast, setToast, showToast, closeToast, ToastModal,
    qFirstName, setQFirstName, qSurname, setQSurname, qPhone, setQPhone,
    qErr, setQErr, qModal, setQModal,
    kioskStep, setKioskStep, kioskService, setKioskService,
    kioskPayment, setKioskPayment, kioskExSearch, setKioskExSearch, kioskExPick, setKioskExPick,
    trForm, setTrForm, trErr, setTrErr,
    regTab, setRegTab, regForm, setRegForm, regErr, setRegErr,
    bItems, setBItems, bDisc, setBDisc, bMethod, setBMethod, bNote, setBNote,
    bErr, setBErr, bTab, setBTab, bOfficer, setBOfficer, bSub, bTotal, addBItem,
    docTab, setDocTab, clk, setClk, docErr, setDocErr, docSaved, setDocSaved,
    admitReqForm, setAdmitReqForm,
    labSel, setLabSel, labSearch, setLabSearch, labUrgency, setLabUrgency, labNotes, setLabNotes,
    radSel, setRadSel, radUrgency, setRadUrgency, radNotes, setRadNotes,
    rxList, setRxList, rxForm, setRxForm,
    consSpec, setConsSpec, consUrgency, setConsUrgency, consReason, setConsReason,
    labActive, setLabActive, labStep, setLabStep, labScientist, setLabScientist,
    labResults, setLabResults, labSaved, setLabSaved, labModErr, setLabModErr, labViewModal, setLabViewModal,
    pharmActive, setPharmActive, verifyChecks, setVerifyChecks,
    pharmNotes, setPharmNotes, pharmacist, setPharmacist, pharmErr, setPharmErr,
    dispenseLog, setDispenseLog,
    wardAdmitPat, setWardAdmitPat, wardForm, setWardForm, wardErr, setWardErr,
    wardActive, setWardActive, dischargeForm, setDischargeForm, wardView, setWardView,
    ipBillItems, setIpBillItems, ipBillErr, setIpBillErr, ipBillSnap, setIpBillSnap,
    ipBillDisc, setIpBillDisc, ipBilledBy, setIpBilledBy, ipPayMethod, setIpPayMethod,
    ipBillErr2, setIpBillErr2, ipOrders, setIpOrders, ipOrderForm, setIpOrderForm, ipOrderErr, setIpOrderErr,
    invItems, setInvItems, invTxns, setInvTxns, invTab, setInvTab,
    invSearch, setInvSearch, invCat, setInvCat, invModal, setInvModal,
    invForm, setInvForm, invErr, setInvErr, invMode, setInvMode,
    invRecalls, setInvRecalls, invRecallModal, setInvRecallModal,
    procSuppliers, setProcSuppliers, procPOs, setProcPOs, procTab, setProcTab,
    procModal, setProcModal, procForm, setProcForm, procErr, setProcErr,
    procSearch, setProcSearch, procStatusF, setProcStatusF,
    procGRN, setProcGRN, procGRNPO, setProcGRNPO,
    supSearch, setSupSearch, supEditId, setSupEditId,
    poDetailPO, setPoDetailPO, analyticsSupId, setAnalyticsSupId,
    histSearch, setHistSearch, histPatient, setHistPatient, histTab, setHistTab, histFilter, setHistFilter,
    tfSearch, setTfSearch, tfModal, setTfModal, tfForm, setTfForm, tfErr, setTfErr, tfDetail, setTfDetail,
    expiryTab, setExpiryTab, expirySearch, setExpirySearch, expiryCat, setExpiryCat,
    disposals, setDisposals, dispModal, setDispModal, dispForm, setDispForm, dispErr, setDispErr,
    dispDetail, setDispDetail, alertLog, setAlertLog,
    manualSearch, setManualSearch,
    BtnPrimary, BtnGhost, BtnGreen, BtnRed, BtnCyan,
    filtered, DOC_TABS, REG_TABS,
    rf, tf, ck,
    openQueue, saveQueuePatient, saveWalkinPatient, saveExistingCheckin,
    goTriage, saveTriage, goRegister, saveRegistration,
    goBilling, saveBilling, goDoctor, saveDoctor,
    openAdmit, saveAdmit, saveDischarge, openIpManage,
    saveIpBillItem, removeIpBillItem, updateIpQty, generateIpBill, finalizeIpBill,
    saveIpOrder, printIpBill, printTreatmentSheet,
    goLab, saveLabResults,
    servicePrefix, serviceLabel,
  } = props;


    const pendingPatients = patients.filter(p=>p.status==="Lab Pending");

    // Full reference ranges per test ID
    const LAB_REF = {
      // Haematology
      l1_hb:     { name:"Haemoglobin",      unit:"g/dL",   type:"numeric", mLow:13.0, mHigh:17.0, fLow:12.0, fHigh:16.0, critLow:7.0,  critHigh:20.0 },
      l1_wbc:    { name:"WBC",              unit:"x109/L", type:"numeric", low:4.0,   high:11.0,  critLow:2.0, critHigh:30.0 },
      l1_plt:    { name:"Platelets",        unit:"x109/L", type:"numeric", low:150,   high:400,   critLow:50, critHigh:1000 },
      l1_pcv:    { name:"PCV/Haematocrit",  unit:"%",      type:"numeric", mLow:40,   mHigh:52,   fLow:36, fHigh:48, critLow:20, critHigh:60 },
      l1_mcv:    { name:"MCV",              unit:"fL",     type:"numeric", low:80,    high:100 },
      l1_mchc:   { name:"MCHC",             unit:"g/dL",   type:"numeric", low:32,    high:36 },
      l2_esr:    { name:"ESR",              unit:"mm/hr",  type:"numeric", mLow:0,    mHigh:15,   fLow:0, fHigh:20 },
      l3_hbtype: { name:"Hb Type",          unit:"",       type:"qualitative", options:["AA","AS","SS","AC","SC","CC"] },
      l20_trop:  { name:"Troponin I",       unit:"ng/mL",  type:"numeric", low:0,     high:0.04,  critHigh:0.4 },
      l21_bnp:   { name:"BNP",              unit:"pg/mL",  type:"numeric", low:0,     high:100,   critHigh:900 },
      // Biochemistry
      l4_fbs:    { name:"Fasting Blood Sugar", unit:"mmol/L", type:"numeric", low:3.9, high:5.6, critLow:2.8, critHigh:22 },
      l5_hba1c:  { name:"HbA1c",            unit:"%",      type:"numeric", low:4.0,   high:5.7,  critHigh:15 },
      l6_tc:     { name:"Total Cholesterol", unit:"mmol/L", type:"numeric", low:0,    high:5.2,  critHigh:9 },
      l6_ldl:    { name:"LDL Cholesterol",  unit:"mmol/L", type:"numeric", low:0,    high:3.4,  critHigh:8 },
      l6_hdl:    { name:"HDL Cholesterol",  unit:"mmol/L", type:"numeric", mLow:1.0,  mHigh:99,  fLow:1.3, fHigh:99 },
      l6_trig:   { name:"Triglycerides",    unit:"mmol/L", type:"numeric", low:0,    high:1.7,  critHigh:6 },
      l7_alt:    { name:"ALT",              unit:"U/L",    type:"numeric", mLow:0,   mHigh:40,  fLow:0, fHigh:32, critHigh:1000 },
      l7_ast:    { name:"AST",              unit:"U/L",    type:"numeric", mLow:0,   mHigh:40,  fLow:0, fHigh:32, critHigh:1000 },
      l7_alp:    { name:"ALP",              unit:"U/L",    type:"numeric", low:44,   high:147 },
      l7_tbil:   { name:"Total Bilirubin",  unit:"umol/L", type:"numeric", low:0,    high:21,   critHigh:340 },
      l7_alb:    { name:"Albumin",          unit:"g/L",    type:"numeric", low:35,   high:50,   critLow:20 },
      l8_crea:   { name:"Creatinine",       unit:"umol/L", type:"numeric", mLow:62,  mHigh:115, fLow:44, fHigh:97, critHigh:1000 },
      l8_urea:   { name:"Urea (BUN)",       unit:"mmol/L", type:"numeric", low:2.5,  high:7.1,  critHigh:36 },
      l8_egfr:   { name:"eGFR",             unit:"mL/min/1.73m2", type:"numeric", low:60, high:999, critLow:15 },
      l9_na:     { name:"Sodium (Na+)",     unit:"mmol/L", type:"numeric", low:136,  high:145,  critLow:120, critHigh:160 },
      l9_k:      { name:"Potassium (K+)",   unit:"mmol/L", type:"numeric", low:3.5,  high:5.0,  critLow:2.8, critHigh:6.5 },
      l9_cl:     { name:"Chloride (Cl-)",   unit:"mmol/L", type:"numeric", low:98,   high:107 },
      l9_bicarb: { name:"Bicarbonate (HCO3-)", unit:"mmol/L", type:"numeric", low:22, high:29, critLow:10 },
      l22_tsh:   { name:"TSH",              unit:"mIU/L",  type:"numeric", low:0.4,  high:4.0,  critLow:0.01, critHigh:100 },
      l22_t4:    { name:"Free T4",          unit:"pmol/L", type:"numeric", low:9.0,  high:25.0 },
      l23_ua:    { name:"Uric Acid",        unit:"umol/L", type:"numeric", mLow:200, mHigh:420, fLow:140, fHigh:360 },
      // Microbiology
      l10_bc:    { name:"Blood Culture",    unit:"",       type:"qualitative", options:["No growth after 5 days","Organism isolated - see sensitivity"] },
      l11_uc:    { name:"Urine Culture",    unit:"",       type:"qualitative", options:["No significant growth (<104 CFU/mL)","Significant growth - see sensitivity","Mixed growth - repeat specimen"] },
      l12_st:    { name:"Stool MCS",        unit:"",       type:"descriptive" },
      l24_ts:    { name:"Throat Swab",      unit:"",       type:"qualitative", options:["No growth","Streptococcus pyogenes isolated","Normal flora"] },
      l25_ws:    { name:"Wound Swab",       unit:"",       type:"descriptive" },
      // Serology
      l13_hbs:   { name:"HBsAg",           unit:"",       type:"qualitative", options:["Non-reactive (Negative)","Reactive (Positive)"] },
      l14_hiv:   { name:"HIV Screening",   unit:"",       type:"qualitative", options:["Non-reactive (Negative)","Reactive - confirm with Western Blot"] },
      l15_wid:   { name:"Widal Test",      unit:"",       type:"descriptive" },
      l26_rf:    { name:"Rheumatoid Factor", unit:"IU/mL", type:"numeric", low:0, high:14 },
      l27_ana:   { name:"ANA",             unit:"",       type:"qualitative", options:["Negative","Weakly Positive (1:40)","Positive (1:160)","Strongly Positive (>=1:320)"] },
      l28_vdrl:  { name:"VDRL/RPR",        unit:"",       type:"qualitative", options:["Non-reactive","Reactive - titre 1:1","Reactive - titre 1:4","Reactive - titre 1:8","Reactive - titre >=1:16"] },
      // Parasitology
      l16_rdt:   { name:"Malaria RDT",     unit:"",       type:"qualitative", options:["Negative","Positive - P. falciparum","Positive - P. vivax","Positive - Mixed"] },
      l17_bf:    { name:"Blood Film",      unit:"",       type:"qualitative", options:["No malaria parasites seen","P. falciparum - + (low)","P. falciparum - ++ (moderate)","P. falciparum - +++ (high)","P. vivax seen"] },
      l29_ova:   { name:"Ova & Parasites", unit:"",       type:"descriptive" },
      // Urine
      l18_ua:    { name:"Urinalysis",      unit:"",       type:"descriptive" },
      l19_upt:   { name:"Urine Preg Test", unit:"",       type:"qualitative", options:["Negative","Positive"] },
      l30_24h:   { name:"24h Urine Protein", unit:"mg/24h", type:"numeric", low:0, high:150, critHigh:3500 },
    };

    // Map each lab test ID to its sub-tests
    const TEST_SUBTESTS = {
      l1:  ["l1_hb","l1_pcv","l1_wbc","l1_plt","l1_mcv","l1_mchc"],
      l2:  ["l2_esr"],
      l3:  ["l3_hbtype"],
      l4:  ["l4_fbs"],
      l5:  ["l5_hba1c"],
      l6:  ["l6_tc","l6_ldl","l6_hdl","l6_trig"],
      l7:  ["l7_alt","l7_ast","l7_alp","l7_tbil","l7_alb"],
      l8:  ["l8_crea","l8_urea","l8_egfr"],
      l9:  ["l9_na","l9_k","l9_cl","l9_bicarb"],
      l10: ["l10_bc"],
      l11: ["l11_uc"],
      l12: ["l12_st"],
      l13: ["l13_hbs"],
      l14: ["l14_hiv"],
      l15: ["l15_wid"],
      l16: ["l16_rdt"],
      l17: ["l17_bf"],
      l18: ["l18_ua"],
      l19: ["l19_upt"],
      l20: ["l20_trop"],
      l21: ["l21_bnp"],
      l22: ["l22_tsh","l22_t4"],
      l23: ["l23_ua"],
      l24: ["l24_ts"],
      l25: ["l25_ws"],
      l26: ["l26_rf"],
      l27: ["l27_ana"],
      l28: ["l28_vdrl"],
      l29: ["l29_ova"],
      l30: ["l30_24h"],
    };

    // Compute flag for a numeric result
    const getNumFlag = (subId, val, gender) => {
      if (!val && val!=="0") return "empty";
      const ref = LAB_REF[subId];
      if (!ref || ref.type!=="numeric") return "empty";
      const n = parseFloat(val);
      if (isNaN(n)) return "empty";
      const lo  = gender==="Female" && ref.fLow  !== undefined ? ref.fLow  : ref.low;
      const hi  = gender==="Female" && ref.fHigh !== undefined ? ref.fHigh : ref.high;
      const clo = ref.critLow;
      const chi = ref.critHigh;
      if (clo !== undefined && n <= clo) return "critical";
      if (chi !== undefined && n >= chi) return "critical";
      if (lo  !== undefined && n < lo)   return "abnormal-low";
      if (hi  !== undefined && n > hi)   return "abnormal-high";
      return "normal";
    };

    const flagColor = {
      normal:        { bg:"#f0fdf4", border:"#86efac", text:"#15803d", tag:"Normal",   tagBg:"#dcfce7", tagTx:"#166534" },
      "abnormal-low":{ bg:"#fffbeb", border:"#fcd34d", text:"#b45309", tag:"v Low",    tagBg:"#fef3c7", tagTx:"#92400e" },
      "abnormal-high":{ bg:"#fff7ed",border:"#fdba74", text:"#c2410c", tag:"^ High",   tagBg:"#ffedd5", tagTx:"#9a3412" },
      critical:      { bg:"#fef2f2", border:"#fca5a5", text:"#dc2626", tag:"🔴 Critical", tagBg:"#fee2e2", tagTx:"#991b1b" },
      empty:         { bg:"#fff",    border:"#e2e8f0", text:"#1e293b", tag:"",         tagBg:"#f1f5f9", tagTx:"#64748b" },
    };

    // Count abnormal results for a patient
    const countAbnormal = (pat) => {
      if (!pat.clerking?.labResults) return { crit:0, abnorm:0 };
      let crit=0, abnorm=0;
      Object.entries(pat.clerking.labResults).forEach(([sid,r])=>{
        if (r.flag==="critical") crit++;
        else if (r.flag==="abnormal-low"||r.flag==="abnormal-high") abnorm++;
      });
      return { crit, abnorm };
    };

    // Active patient's requested tests
    const requestedTestIds = labActive?.clerking?.orders?.lab?.tests || [];
    const requestedTestNames = (() => {
      const map = {};
      LAB_CATEGORIES.forEach(({tests})=>tests.forEach(t=>{ map[t.id]=t.name; }));
      return map;
    })();

    // Print report
    const printReport = (pat) => {
      const results = pat.clerking?.labResults || {};
      const rows = Object.entries(results).map(([sid,r])=>{
        const ref = LAB_REF[sid];
        return `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0">${ref?.name||sid}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${r.flag==="critical"?"#dc2626":r.flag?.startsWith("abnormal")?"#b45309":"#15803d"}">${r.value||"-"}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#64748b">${ref?.unit||""}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#475569">${ref?.low!==undefined?(ref.fLow!==undefined&&pat.gender==="Female"?`${ref.fLow}-${ref.fHigh}`:`${ref.low}-${ref.high}`):"-"}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${r.flag==="critical"?"#dc2626":r.flag?.startsWith("abnormal")?"#b45309":"#94a3b8"}">${r.flag==="critical"?"CRITICAL":r.flag==="abnormal-high"?"HIGH":r.flag==="abnormal-low"?"LOW":"Normal"}</td>
        </tr>`;
      }).join("");
      const html = `<!DOCTYPE html><html><head><title>Lab Report - ${pat.firstName||pat.name} ${pat.lastName||""}</title>
      <style>body{font-family:'Palatino Linotype',serif;margin:40px;color:#1e293b}h1{font-size:20px}table{width:100%;border-collapse:collapse}th{background:#f8fafc;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b}</style></head>
      <body>
      <div style="display:flex;justify-content:space-between;margin-bottom:24px">
        <div><h1 style="margin:0">🏥 MediCore HMS - Laboratory Report</h1><div style="color:#64748b;font-size:13px;margin-top:4px">Printed: ${new Date().toLocaleString()}</div></div>
      </div>
      <table style="margin-bottom:20px"><tr>
        <td style="padding:6px 16px 6px 0"><b>Patient:</b> ${pat.firstName||pat.name} ${pat.lastName||""}</td>
        <td style="padding:6px 16px"><b>ID:</b> ${pat.id||"-"}</td>
        <td style="padding:6px 16px"><b>Queue:</b> ${pat.queueNo}</td>
        <td style="padding:6px 16px"><b>Age/Sex:</b> ${calcAge(pat.dateOfBirth)} yrs / ${pat.gender||"-"}</td>
      </tr><tr>
        <td style="padding:4px 16px 4px 0"><b>Requesting Doctor:</b> ${pat.clerking?.doctorName||"-"}</td>
        <td style="padding:4px 16px"><b>Lab Scientist:</b> ${pat.clerking?.labScientist||"-"}</td>
        <td style="padding:4px 16px"><b>Completed:</b> ${pat.clerking?.labCompletedAt?new Date(pat.clerking.labCompletedAt).toLocaleString():"-"}</td>
        <td style="padding:4px 16px"><b>Urgency:</b> ${pat.clerking?.orders?.lab?.urgency||"Routine"}</td>
      </tr></table>
      <table><thead><tr><th>Test</th><th>Result</th><th>Unit</th><th>Ref. Range</th><th>Flag</th></tr></thead><tbody>${rows}</tbody></table>
      ${pat.clerking?.orders?.lab?.notes?`<div style="margin-top:20px;padding:12px;background:#f8fafc;border-radius:8px"><b>Clinical Notes:</b> ${pat.clerking.orders.lab.notes}</div>`:""}
      </body></html>`;
      const w = window.open("","_blank");
      w.document.write(html);
      w.document.close();
      w.print();
    };


    // -- Per-test print function
    const printTestResult = (pat, testId, res) => {
      const subIds = TEST_SUBTESTS[testId] || [];
      const testName = requestedTestNames[testId] || testId;
      const results = res || pat.clerking?.labResults || {};
      const rows = subIds.map(sid => {
        const ref = LAB_REF[sid]; if (!ref) return "";
        const r = results[sid];
        const lo = pat.gender==="Female"&&ref.fLow!==undefined?ref.fLow:ref.low;
        const hi = pat.gender==="Female"&&ref.fHigh!==undefined?ref.fHigh:ref.high;
        const refRange = ref.type==="numeric"&&lo!==undefined?`${lo} - ${hi}`:ref.options?"Qualitative":"Descriptive";
        const flagLabel = r?.flag==="critical"?"🔴 CRITICAL":r?.flag==="abnormal-high"?"▲ HIGH":r?.flag==="abnormal-low"?"▼ LOW":r?.value?"Normal":"-";
        const flagColor = r?.flag==="critical"?"#dc2626":r?.flag?.startsWith("abnormal")?"#b45309":r?.value?"#15803d":"#94a3b8";
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px">${ref.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:800;font-size:14px;font-family:monospace;color:${flagColor}">${r?.value||"-"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b">${ref.unit||""}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-family:monospace;color:#475569">${refRange}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${flagColor}">${flagLabel}</td>
        </tr>`;
      }).join("");
      const patName = `${pat.firstName||pat.name} ${pat.lastName||""}`;
      const html = `<!DOCTYPE html><html><head><title>Lab Report - ${testName}</title>
      <style>body{font-family:'Palatino Linotype',serif;margin:40px;color:#1e293b}h1{font-size:20px;margin:0}table{width:100%;border-collapse:collapse}th{background:#f8fafc;padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0}.flag-crit{color:#dc2626;font-weight:800}.flag-high,.flag-low{color:#b45309;font-weight:700}@media print{button{display:none}}</style>
      </head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;border-bottom:3px solid #0e7490;padding-bottom:16px">
        <div><h1>🏥 MediCore HMS</h1><div style="font-size:12px;color:#64748b;margin-top:4px">Laboratory Report — Individual Test</div></div>
        <div style="text-align:right"><div style="font-size:11px;color:#64748b">Printed: ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div></div>
      </div>
      <table style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden"><tbody>
        <tr style="background:#f8fafc"><td style="padding:8px 14px;font-size:12px"><b>Patient:</b> ${patName}</td><td style="padding:8px 14px;font-size:12px"><b>ID:</b> ${pat.id||"-"}</td><td style="padding:8px 14px;font-size:12px"><b>Queue No:</b> ${pat.queueNo}</td><td style="padding:8px 14px;font-size:12px"><b>Age / Sex:</b> ${calcAge(pat.dateOfBirth)||"-"} yrs / ${pat.gender||"-"}</td></tr>
        <tr><td style="padding:8px 14px;font-size:12px"><b>Requesting Doctor:</b> ${pat.clerking?.doctorName||"-"}</td><td style="padding:8px 14px;font-size:12px"><b>Lab Scientist:</b> ${pat.clerking?.labScientist||"-"}</td><td style="padding:8px 14px;font-size:12px"><b>Lab No:</b> ${pat.clerking?.labNo||"-"}</td><td style="padding:8px 14px;font-size:12px"><b>Date:</b> ${pat.clerking?.labCompletedAt?new Date(pat.clerking.labCompletedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</td></tr>
      </tbody></table>
      <div style="background:#0e7490;color:#fff;padding:10px 16px;border-radius:8px 8px 0 0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px">${testName}</div>
      <table style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;overflow:hidden"><thead><tr><th>Analyte</th><th>Result</th><th>Unit</th><th>Reference Range</th><th>Flag</th></tr></thead><tbody>${rows}</tbody></table>
      ${pat.clerking?.orders?.lab?.notes?`<div style="margin-top:20px;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;font-size:12px"><b>Clinical Notes:</b> ${pat.clerking.orders.lab.notes}</div>`:""}
      <div style="margin-top:32px;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px">
        <span>MediCore HMS — Confidential Medical Record</span><span>Lab No: ${pat.clerking?.labNo||"-"}</span>
      </div>
      </body></html>`;
      const w = window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
    };

    // -- Lab step navigator
    const LAB_STEPS = [
      { key:"specimen", label:"Specimen Collection", icon:"dna", num:1 },
      { key:"results",  label:"Results Entry",       icon:"note", num:2 },
      { key:"summary",  label:"Results Summary",     icon:"clip", num:3 },
    ];

    return (
      <Layout page={page} setPage={p=>{setLabActive(null);setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar title="Laboratory"
          subtitle={labActive ? `${labActive.queueNo} . ${labActive.firstName||labActive.name} ${labActive.lastName||""}` : `${pendingPatients.length} patient(s) with pending requests`}
          action={
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              {labActive && <button onClick={()=>{setLabActive(null);setLabSaved(false);}} style={BtnGhost}>Back Worklist</button>}
              <button onClick={()=>{setLabActive(null);setPage("queue");}} style={BtnGhost}>Back Queue</button>
            </div>
          } />

        <div style={{ padding:"20px 26px" }}>

          {/* WORKLIST */}
          {!labActive && (
            <div style={{ maxWidth:900 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
                {[
                  ["Total Requests", patients.filter(p=>p.clerking?.orders?.lab).length, "#0e7490","#cffafe","🧪"],
                  ["Pending",        patients.filter(p=>p.status==="Lab Pending").length,  "#d97706","#fef3c7",""],
                  ["Results Done",   patients.filter(p=>p.clerking?.labResults&&Object.keys(p.clerking.labResults).length>0).length, "#0e7490","#e0f2fe","📋"],
                  ["Critical Flags", patients.filter(p=>{ const c=countAbnormal(p); return c.crit>0; }).length, "#dc2626","#fef2f2",""],
                ].map(([l,n,col,bg,icon])=>(
                  <div key={l} style={{ background:"#fff",borderRadius:11,padding:"14px 16px",boxShadow:"0 1px 8px rgba(0,0,0,.07)",display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:40,height:40,background:bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:24,fontWeight:800,color:col,lineHeight:1 }}>{n}</div>
                      <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",marginTop:1 }}>{l}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* ── Manual Patient Search ───────────────────── */}
              <div style={{ marginBottom:18,background:"#fff",borderRadius:12,padding:"15px 18px",boxShadow:"0 2px 12px rgba(0,0,0,.07)",border:"1.5px solid #bae6fd" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <span style={{ fontSize:13,fontWeight:800,color:"#0e7490" }}>🔍 Manual Patient Search</span>
                  <span style={{ padding:"2px 8px",borderRadius:20,background:"#f0f9ff",color:"#0e7490",fontSize:9,fontWeight:700,border:"1px solid #bae6fd",fontFamily:"monospace",letterSpacing:.5,textTransform:"uppercase" }}>Bypass Queue Flow</span>
                </div>
                <div style={{ display:"flex",gap:8,marginBottom:6 }}>
                  <input value={manualSearch} onChange={e=>setManualSearch(e.target.value)}
                    placeholder="Search any patient — name, MRN, queue no., or phone…"
                    style={{ flex:1,padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontFamily:"inherit",fontSize:13,outline:"none",color:"#0b1929" }} autoFocus={false}/>
                  {manualSearch && <button onClick={()=>setManualSearch("")} style={{ padding:"9px 13px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,color:"#64748b",background:"#fff" }}>✕</button>}
                </div>
                {manualSearch.trim() && (()=>{
                  const q = manualSearch.toLowerCase();
                  const hits = patients.filter(p=>{
                    const nm=((p.firstName||p.name||"")+" "+(p.lastName||"")).toLowerCase();
                    return nm.includes(q)||p.id?.toLowerCase().includes(q)||p.queueNo?.toLowerCase().includes(q)||(p.phone||"").includes(q);
                  });
                  return hits.length===0
                    ? <div style={{ color:"#94a3b8",fontSize:12,padding:"4px 2px" }}>No patients found for "<b>{manualSearch}</b>".</div>
                    : <div style={{ maxHeight:260,overflowY:"auto",display:"flex",flexDirection:"column",gap:5 }}>
                        {hits.map(p=>{
                          const sm=STATUS_META[p.status]||STATUS_META.Queued;
                          const nm=((p.firstName||p.name||"")+" "+(p.lastName||"")).trim()||p.queueNo;
                          return (
                            <div key={p.queueNo} onClick={()=>{ goLab(p); setManualSearch(""); }}
                              style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:9,border:"1px solid #f1f5f9",cursor:"pointer",transition:"all .15s",background:"#fafafa" }}
                              onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                              onMouseLeave={e=>e.currentTarget.style.background="#fafafa"}>
                              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                                <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0,
                                  background:"hsl("+avatarHue(p.id||p.queueNo)+",50%,82%)",
                                  color:"hsl("+avatarHue(p.id||p.queueNo)+",40%,28%)",
                                  display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13 }}>
                                  {(p.firstName||p.name||"?")[0]}{(p.lastName||"")[0]||""}
                                </div>
                                <div>
                                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>{nm}</div>
                                  <div style={{ fontSize:10,color:"#94a3b8",fontFamily:"monospace" }}>{p.id||"Unreg."} · {p.queueNo} · {p.phone||"—"}</div>
                                </div>
                              </div>
                              <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                                <span style={{ padding:"2px 8px",borderRadius:20,background:sm.bg,color:sm.color,fontSize:10,fontWeight:700 }}>{p.status}</span>
                                <button style={{ padding:"5px 12px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#0e7490" }}>Enter Results →</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>;
                })()}
              </div>
              <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:12 }}>Lab Worklist</div>
              {pendingPatients.length===0
                ? <EmptyState icon="🧪" msg="No pending lab requests." />
                : pendingPatients.map(p=>{
                  const sm=STATUS_META[p.status]||STATUS_META.Queued;
                  const ab=countAbnormal(p);
                  const tl=TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                  const testIds=p.clerking?.orders?.lab?.tests||[];
                  return (
                    <div key={p.queueNo} style={{ background:"#fff",borderRadius:12,padding:"16px 18px",marginBottom:12,boxShadow:"0 1px 8px rgba(0,0,0,.07)",border:"1.5px solid #e2e8f0",transition:"all .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#00bcd4"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                        <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                          <div style={{ width:42,height:42,borderRadius:"50%",flexShrink:0,background:`hsl(${avatarHue(p.id||p.queueNo)},50%,82%)`,color:`hsl(${avatarHue(p.id||p.queueNo)},40%,28%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800 }}>
                            {(p.firstName||p.name||"?")[0]}{(p.lastName||"")[0]||""}
                          </div>
                          <div>
                            <div style={{ fontWeight:800,fontSize:14,color:"#0b1929" }}>{p.firstName||p.name} {p.lastName||""}</div>
                            <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace",marginBottom:6 }}>{p.id||"Unreg."} . {p.queueNo} . {calcAge(p.dateOfBirth)||"-"} yrs . {p.gender||"-"}</div>
                            <div style={{ display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
                              <Badge label={p.status} color={sm.color} bg={sm.bg} dot={sm.dot} sm />
                              {tl && <Badge label={`L${tl.level} ${tl.label}`} color={tl.tc} bg={tl.bg} sm />}
                              <span style={{ fontSize:11,color:"#475569" }}>Req. by: <strong>{p.clerking?.doctorName||"-"}</strong></span>
                              <span style={{ fontSize:11,color:"#475569" }}>Urgency: <strong style={{ color:p.clerking?.orders?.lab?.urgency==="STAT (Immediate)"?"#dc2626":p.clerking?.orders?.lab?.urgency==="Urgent"?"#b45309":"#15803d" }}>{p.clerking?.orders?.lab?.urgency||"Routine"}</strong></span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8 }}>
                          {ab.crit>0 && <span style={{ background:"#fee2e2",color:"#991b1b",borderRadius:7,padding:"3px 10px",fontSize:12,fontWeight:800 }}>🔴 {ab.crit} Critical</span>}
                          {ab.abnorm>0 && <span style={{ background:"#fef3c7",color:"#92400e",borderRadius:7,padding:"3px 10px",fontSize:12,fontWeight:700 }}>(!) {ab.abnorm} Abnormal</span>}
                          <button onClick={()=>goLab(p)} style={{ padding:"8px 16px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#d97706" }}>
                            🧬 Process Sample
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop:10,paddingTop:10,borderTop:"1px solid #f1f5f9",display:"flex",gap:6,flexWrap:"wrap" }}>
                        {testIds.map(id=>(
                          <span key={id} style={{ background:"#f0f9ff",color:"#0369a1",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:600 }}>{requestedTestNames[id]||id}</span>
                        ))}
                      </div>
                    </div>
                  );
                })
              }

              {/* RESULTED TESTS SECTION */}
              {(()=>{
                const resultedPats = patients.filter(p=>p.clerking?.labResults && Object.keys(p.clerking.labResults).length>0);
                if (!resultedPats.length) return null;
                return (<>
                  <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:12,marginTop:24,display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ background:"#cffafe",color:"#0e7490",borderRadius:7,padding:"2px 10px",fontSize:12,fontWeight:800 }}>📋 Resulted Tests</span>
                    <span style={{ fontSize:12,color:C.slateL,fontWeight:400 }}>{resultedPats.length} patient{resultedPats.length>1?"s":""} with completed results</span>
                  </div>
                  {resultedPats.map(p=>{
                    const ab=countAbnormal(p);
                    const testIds=p.clerking?.orders?.lab?.tests||[];
                    const sm=STATUS_META[p.status]||STATUS_META.Queued;
                    const tl=TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                    return (
                      <div key={p.queueNo} style={{ background:"#fff",borderRadius:12,padding:"16px 18px",marginBottom:12,boxShadow:"0 1px 8px rgba(0,0,0,.07)",border:"1.5px solid #6ee7b7" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                          <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                            <div style={{ width:42,height:42,borderRadius:"50%",flexShrink:0,background:`hsl(${avatarHue(p.id||p.queueNo)},50%,82%)`,color:`hsl(${avatarHue(p.id||p.queueNo)},40%,28%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800 }}>
                              {(p.firstName||p.name||"?")[0]}{(p.lastName||"")[0]||""}
                            </div>
                            <div>
                              <div style={{ fontWeight:800,fontSize:14,color:"#0b1929" }}>{p.firstName||p.name} {p.lastName||""}</div>
                              <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace",marginBottom:6 }}>{p.id||"Unreg."} · {p.queueNo} · {calcAge(p.dateOfBirth)||"-"} yrs · {p.gender||"-"}</div>
                              <div style={{ display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
                                <Badge label={p.status} color={sm.color} bg={sm.bg} dot={sm.dot} sm />
                                {tl && <Badge label={`L${tl.level} ${tl.label}`} color={tl.tc} bg={tl.bg} sm />}
                                {ab.crit>0  && <span style={{ background:"#fee2e2",color:"#991b1b",borderRadius:7,padding:"3px 9px",fontSize:11,fontWeight:800 }}>🔴 {ab.crit} Critical</span>}
                                {ab.abnorm>0 && <span style={{ background:"#fef3c7",color:"#92400e",borderRadius:7,padding:"3px 9px",fontSize:11,fontWeight:700 }}>⚠ {ab.abnorm} Abnormal</span>}
                                <span style={{ fontSize:11,color:"#475569" }}>By: <strong>{p.clerking?.labScientist||p.clerking?.doctorName||"-"}</strong></span>
                              </div>
                            </div>
                          </div>
                          <button onClick={()=>goLab(p)} style={{ padding:"8px 20px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#0e7490",whiteSpace:"nowrap",flexShrink:0 }}>
                            📋 View Results
                          </button>
                        </div>
                        <div style={{ marginTop:10,paddingTop:10,borderTop:"1px solid #f1f5f9",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
                          {testIds.map(id=>(
                            <div key={id} style={{ display:"flex",alignItems:"center",gap:4 }}>
                              <span style={{ background:"#f0fdf4",color:"#15803d",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:600 }}>✓ {requestedTestNames[id]||id}</span>
                              <button onClick={e=>{e.stopPropagation();setLabViewModal({pat:p,testId:id});}} style={{ padding:"2px 8px",border:"1.5px solid #0e7490",borderRadius:5,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,color:"#0e7490",background:"#f0fdff" }}>View</button>
                            </div>
                          ))}
                          {p.clerking?.labCompletedAt && <span style={{ fontSize:11,color:C.slateL,fontFamily:"monospace",marginLeft:"auto" }}>Completed: {new Date(p.clerking.labCompletedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span>}
                        </div>
                      </div>
                    );
                  })}
                </>);
              })()}
            </div>
          )}

          {/* ACTIVE PATIENT: 3-STEP PROCESS */}
          {labActive && (
            <div>
              <PatientBanner p={labActive} />
              <FlowBar status={labActive.status} />
              <RefNumStrip p={labActive} />

              {/* Step Navigator */}
              <div style={{ display:"flex",alignItems:"center",background:"#fff",borderRadius:13,padding:"6px",boxShadow:"0 1px 8px rgba(0,0,0,.07)",marginBottom:20,gap:4 }}>
                {LAB_STEPS.map((s,i)=>{
                  const isActive=labStep===s.key;
                  const isDone=(s.key==="specimen"&&(labStep==="results"||labStep==="summary"))||(s.key==="results"&&labStep==="summary");
                  return (
                    <button key={s.key} onClick={()=>setLabStep(s.key)}
                      style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 16px",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",
                        background:isActive?"#0e7490":isDone?"#f0fdf4":"transparent",color:isActive?"#fff":isDone?"#15803d":"#64748b" }}>
                      <div style={{ width:26,height:26,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,
                        background:isActive?"rgba(255,255,255,.25)":isDone?"#dcfce7":"#f1f5f9",
                        color:isActive?"#fff":isDone?"#15803d":"#94a3b8" }}>
                        {isDone?"v":s.num}
                      </div>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:13,fontWeight:isActive?700:500 }}>{s.icon} {s.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* STEP 1: SPECIMEN COLLECTION */}
              {labStep==="specimen" && (
                <div style={{ maxWidth:860 }}>
                  <div style={{ background:"linear-gradient(90deg,#071828,#0f3460)",borderRadius:10,padding:"12px 18px",marginBottom:16,display:"flex",gap:20,flexWrap:"wrap" }}>
                    {[["Requesting Doctor",labActive.clerking?.doctorName||"-"],["Urgency",labActive.clerking?.orders?.lab?.urgency||"Routine"],["Chief Complaint",labActive.triage?.chiefComplaint||"-"],["Clinical Notes",labActive.clerking?.orders?.lab?.notes||"-"]].map(([l,v])=>(
                      <div key={l} style={{ maxWidth:240 }}>
                        <div style={{ fontSize:9,color:"rgba(255,255,255,.35)",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:12,fontWeight:700,color:"#e0f7fa" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const specimenGroups={};
                    requestedTestIds.forEach(tid=>{
                      const sp=SPECIMEN_MAP[tid]; if(!sp) return;
                      const key=sp.container;
                      if(!specimenGroups[key]) specimenGroups[key]={...sp,tests:[]};
                      specimenGroups[key].tests.push(requestedTestNames[tid]||tid);
                    });
                    const groups=Object.values(specimenGroups);
                    if(!groups.length) return <EmptyState icon="🧬" msg="No specimen mapping found for the ordered tests." />;
                    const dateCode=new Date().toISOString().slice(2,10).replace(/-/g,"");
                    const qSeq=(labActive.queueNo||"Q000").replace(/\D/g,"").padStart(3,"0");
                    return (
                      <div>
                        <Card mb={14}>
                          <Sec accent="#7c3aed">🧬 Specimens Required - {groups.length} container{groups.length>1?"s":""}</Sec>
                          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
                            {groups.map((g,gi)=>{
                              const specId=`SPEC-${dateCode}-${qSeq}-${String(gi+1).padStart(2,"0")}`;
                              return (
                                <div key={g.container} style={{ background:"#fafafa",border:`2px solid ${g.colour}33`,borderRadius:13,overflow:"hidden" }}>
                                  <div style={{ background:g.colour,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                                    <div>
                                      <div style={{ fontSize:11,fontWeight:800,color:"#fff" }}>{g.container}</div>
                                      <div style={{ fontSize:10,color:"rgba(255,255,255,.7)",marginTop:2,fontFamily:"monospace" }}>Vol: {g.volume}</div>
                                    </div>
                                    <span style={{ fontSize:24 }}>{g.tubeIcon}</span>
                                  </div>
                                  <div style={{ padding:"12px 14px",display:"flex",gap:14,alignItems:"flex-start" }}>
                                    <div style={{ flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                                      <SpecimenSVG type={g.draw} colour={g.colour} />
                                      <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",textAlign:"center",maxWidth:56 }}>{g.specimen}</div>
                                    </div>
                                    <div style={{ flex:1,minWidth:0 }}>
                                      <div style={{ background:"#fff",border:`1.5px solid ${g.colour}55`,borderRadius:8,padding:"8px 10px",marginBottom:10 }}>
                                        <div style={{ fontSize:9,fontWeight:700,color:C.slateL,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:3 }}>Specimen ID</div>
                                        <div style={{ fontSize:14,fontWeight:900,color:"#0b1929",fontFamily:"monospace" }}>{specId}</div>
                                      </div>
                                      <div style={{ fontSize:10,fontWeight:700,color:C.slate,letterSpacing:.6,textTransform:"uppercase",marginBottom:6 }}>Tests on this specimen</div>
                                      {g.tests.map(t=>(
                                        <div key={t} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#1e293b",marginBottom:4 }}>
                                          <span style={{ width:6,height:6,borderRadius:"50%",background:g.colour,flexShrink:0,display:"inline-block" }}/>
                                          {t}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div style={{ background:`${g.colour}11`,borderTop:`1px solid ${g.colour}33`,padding:"7px 14px",display:"flex",justifyContent:"space-between" }}>
                                    <span style={{ fontSize:10,color:C.slate,fontFamily:"monospace" }}>{labActive.firstName||labActive.name} {labActive.lastName||""} . {labActive.queueNo}</span>
                                    <span style={{ fontSize:10,fontWeight:700,color:g.colour,fontFamily:"monospace" }}>{new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                        <div style={{ display:"flex",justifyContent:"flex-end",paddingBottom:24 }}>
                          <button onClick={()=>setLabStep("results")} style={{ padding:"12px 32px",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,color:"#fff",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",boxShadow:"0 4px 14px rgba(0,0,0,.2)" }}>
                            📝 Proceed to Results Entry 
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* STEP 2: RESULTS ENTRY */}
              {labStep==="results" && (
                <div style={{ display:"grid",gridTemplateColumns:"1fr 280px",gap:18,alignItems:"start" }}>
                  <div>
                    <ErrBox msg={labModErr} />
                    <Card mb={14}>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                        <FL label="Lab Scientist / Technician *" ch={<input value={labScientist} onChange={e=>setLabScientist(e.target.value)} placeholder="Full name" style={IS(!labScientist&&labModErr)} />} />
                        <FL label="Date & Time" ch={<input value={new Date().toLocaleString()} readOnly style={{ ...IS(),background:"#f8fafc",color:C.slateL,cursor:"default" }} />} />
                      </div>
                    </Card>
                    {requestedTestIds.map(testId=>{
                      const subIds=TEST_SUBTESTS[testId]||[];
                      const testName=requestedTestNames[testId]||testId;
                      return (
                        <Card key={testId} mb={14}>
                          <Sec accent="#0e7490">{testName}</Sec>
                          <div style={{ display:"grid",gridTemplateColumns:"1fr",gap:10 }}>
                            {subIds.map(sid=>{
                              const ref=LAB_REF[sid]; if(!ref) return null;
                              const cur=labResults[sid]||{};
                              const flag=ref.type==="numeric"?getNumFlag(sid,cur.value,labActive.gender):cur.value?(cur.value.toLowerCase().includes("positive")||cur.value.toLowerCase().includes("reactive")||cur.value.toLowerCase().includes("growth")?"abnormal-high":"normal"):"empty";
                              const fc=flagColor[flag]||flagColor.empty;
                              const lo=labActive.gender==="Female"&&ref.fLow!==undefined?ref.fLow:ref.low;
                              const hi=labActive.gender==="Female"&&ref.fHigh!==undefined?ref.fHigh:ref.high;
                              const refRange=ref.type==="numeric"&&lo!==undefined&&hi!==undefined?`${lo} - ${hi} ${ref.unit}`:null;
                              return (
                                <div key={sid} style={{ background:flag==="empty"?"#f8fafc":fc.bg,border:`1.5px solid ${flag==="empty"?"#e2e8f0":fc.border}`,borderRadius:10,padding:"12px 14px" }}>
                                  <div style={{ display:"grid",gridTemplateColumns:ref.unit?"1fr auto":"1fr",gap:10,alignItems:"end" }}>
                                    <div>
                                      <div style={{ fontSize:11,fontWeight:700,color:flag==="empty"?C.slate:fc.text,marginBottom:5,letterSpacing:.4 }}>
                                        {ref.name}{refRange&&<span style={{ fontWeight:400,color:C.slateL,fontSize:10,marginLeft:6 }}>(Ref: {refRange})</span>}
                                      </div>
                                      {ref.type==="numeric"&&(
                                        <div style={{ position:"relative" }}>
                                          <input value={cur.value||""} onChange={e=>{ const v=e.target.value; const f=getNumFlag(sid,v,labActive.gender); setLabResults(p=>({...p,[sid]:{...p[sid],value:v,unit:ref.unit,flag:f,type:ref.type}})); }} placeholder="Enter result"
                                            style={{ ...baseInput,border:`1.5px solid ${flag==="empty"?"#e2e8f0":fc.border}`,background:flag==="empty"?"#fff":fc.bg,color:fc.text,fontWeight:flag!=="empty"&&flag!=="normal"?700:400,paddingRight:flag!=="empty"?80:11 }}/>
                                          {flag!=="empty"&&<span style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:fc.tagBg,color:fc.tagTx,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,whiteSpace:"nowrap" }}>{fc.tag}</span>}
                                        </div>
                                      )}
                                      {ref.type==="qualitative"&&(
                                        <select value={cur.value||""} onChange={e=>{ const v=e.target.value; const f=v?(v.toLowerCase().includes("positive")||v.toLowerCase().includes("reactive")||v.toLowerCase().includes("growth")?"abnormal-high":"normal"):"empty"; setLabResults(p=>({...p,[sid]:{...p[sid],value:v,flag:f,type:ref.type}})); }}
                                          style={{ ...SS,fontWeight:cur.value?700:400,border:`1.5px solid ${flag==="empty"?"#e2e8f0":fc.border}`,background:flag==="empty"?"#fff":fc.bg,color:fc.text }}>
                                          <option value="">Select result...</option>
                                          {ref.options.map(o=><option key={o}>{o}</option>)}
                                        </select>
                                      )}
                                      {ref.type==="descriptive"&&(
                                        <textarea value={cur.value||""} onChange={e=>setLabResults(p=>({...p,[sid]:{...p[sid],value:e.target.value,flag:"normal",type:ref.type}}))} rows={3} placeholder="Enter descriptive result..." style={{ ...TA(),border:"1.5px solid #e2e8f0" }}/>
                                      )}
                                    </div>
                                    {ref.unit&&<div style={{ width:90 }}>
                                      <div style={{ fontSize:11,fontWeight:700,color:C.slate,marginBottom:5 }}>Unit</div>
                                      <div style={{ padding:"9px 11px",borderRadius:8,background:"#f8fafc",border:"1.5px solid #e2e8f0",fontSize:13,color:C.slateL,whiteSpace:"nowrap" }}>{ref.unit}</div>
                                    </div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      );
                    })}
                    <div style={{ display:"flex",justifyContent:"space-between",paddingBottom:24,gap:10 }}>
                      <button onClick={()=>setLabStep("specimen")} style={BtnGhost}>Back Back to Specimen</button>
                      <button onClick={saveLabResults} style={{ padding:"12px 30px",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,color:"#fff",background:"linear-gradient(135deg,#0e7490,#0369a1)",boxShadow:"0 4px 14px rgba(0,0,0,.2)" }}>
                        💾 Save & Notify Doctor 
                      </button>
                    </div>
                  </div>
                  {/* Right sticky live summary */}
                  <div style={{ position:"sticky",top:70 }}>
                    <div style={{ background:"#fff",borderRadius:13,boxShadow:"0 2px 16px rgba(0,0,0,.09)",overflow:"hidden" }}>
                      <div style={{ background:"linear-gradient(135deg,#0e7490,#0369a1)",padding:"14px 16px" }}>
                        <div style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4 }}>Live Summary</div>
                        <div style={{ fontSize:15,fontWeight:800,color:"#fff" }}>{labActive.firstName||labActive.name} {labActive.lastName||""}</div>
                        <div style={{ fontSize:11,color:"rgba(255,255,255,.6)",fontFamily:"monospace",marginTop:2 }}>{requestedTestIds.length} test(s)</div>
                      </div>
                      {(()=>{
                        const crits=[],abnorms=[];
                        Object.entries(labResults).forEach(([sid,r])=>{ const ref=LAB_REF[sid]; if(!ref) return; if(r.flag==="critical") crits.push({name:ref.name,value:r.value,unit:ref.unit}); else if(r.flag?.startsWith("abnormal")) abnorms.push({name:ref.name,value:r.value,unit:ref.unit,flag:r.flag}); });
                        return (<>
                          {crits.length>0&&<div style={{ background:"#fef2f2",borderBottom:"1px solid #fecaca",padding:"12px 16px" }}><div style={{ fontSize:11,fontWeight:800,color:"#dc2626",marginBottom:8 }}>🔴 CRITICAL ({crits.length})</div>{crits.map(c=><div key={c.name} style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}><span style={{ fontSize:11,color:"#7f1d1d" }}>{c.name}</span><span style={{ fontSize:11,fontWeight:800,color:"#dc2626",fontFamily:"monospace" }}>{c.value} {c.unit}</span></div>)}</div>}
                          {abnorms.length>0&&<div style={{ background:"#fffbeb",borderBottom:"1px solid #fcd34d",padding:"12px 16px" }}><div style={{ fontSize:11,fontWeight:800,color:"#b45309",marginBottom:8 }}>(!) ABNORMAL ({abnorms.length})</div>{abnorms.map(a=><div key={a.name} style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}><span style={{ fontSize:11,color:"#92400e" }}>{a.name}</span><span style={{ fontSize:11,fontWeight:700,color:"#b45309",fontFamily:"monospace" }}>{a.flag==="abnormal-low"?"v":"^"} {a.value} {a.unit}</span></div>)}</div>}
                        </>);
                      })()}
                      <div style={{ padding:"12px 16px",maxHeight:280,overflowY:"auto" }}>
                        <div style={{ fontSize:10,fontWeight:700,color:C.slateL,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:8 }}>All Results</div>
                        {requestedTestIds.flatMap(tid=>(TEST_SUBTESTS[tid]||[]).map(sid=>{ const ref=LAB_REF[sid]; const r=labResults[sid]; const fc=flagColor[r?.flag||"empty"]; return (
                          <div key={sid} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f1f5f9" }}>
                            <span style={{ fontSize:11,color:C.slate }}>{ref?.name||sid}</span>
                            {r?.value?<div style={{ display:"flex",alignItems:"center",gap:5 }}><span style={{ fontSize:12,fontWeight:700,color:fc.text,fontFamily:"monospace" }}>{r.value} {ref?.unit||""}</span>{r.flag&&r.flag!=="empty"&&r.flag!=="normal"&&<span style={{ background:fc.tagBg,color:fc.tagTx,borderRadius:4,padding:"0px 5px",fontSize:9,fontWeight:800 }}>{fc.tag}</span>}</div>:<span style={{ fontSize:11,color:"#cbd5e1" }}>-</span>}
                          </div>
                        ); }))}
                      </div>
                      <div style={{ padding:"12px 16px",borderTop:"1px solid #f1f5f9" }}>
                        {(()=>{ const allSubs=requestedTestIds.flatMap(tid=>TEST_SUBTESTS[tid]||[]); const filled=allSubs.filter(s=>labResults[s]?.value).length; const pct=allSubs.length?Math.round(filled/allSubs.length*100):0; return (<>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}><span style={{ fontSize:11,color:C.slate }}>Completed</span><span style={{ fontSize:11,fontWeight:700,color:"#0e7490" }}>{filled}/{allSubs.length}</span></div>
                          <div style={{ height:6,background:"#e2e8f0",borderRadius:3,overflow:"hidden" }}><div style={{ height:"100%",width:`${pct}%`,background:pct===100?"#0e7490":"#00bcd4",borderRadius:3,transition:"width .3s" }}/></div>
                          <div style={{ textAlign:"center",marginTop:8,fontSize:11,color:pct===100?"#0e7490":C.slateL,fontWeight:pct===100?700:400 }}>{pct===100?"[OK] All results entered":"Fill in results above"}</div>
                        </>); })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: RESULTS SUMMARY */}
              {labStep==="summary" && (
                <div style={{ maxWidth:860 }}>
                  <div style={{ background:"linear-gradient(135deg,#0e7490,#0369a1)",borderRadius:12,padding:"16px 22px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:16,fontWeight:800,color:"#fff" }}>{labActive.firstName||labActive.name} {labActive.lastName||""} - Lab Results</div>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,.65)",marginTop:4,fontFamily:"monospace" }}>
                        {labActive.clerking?.labNo && <span style={{ fontWeight:800,marginRight:10 }}>{labActive.clerking.labNo}</span>}
                        Scientist: {labActive.clerking?.labScientist||labScientist||"-"} .
                        Completed: {labActive.clerking?.labCompletedAt?new Date(labActive.clerking.labCompletedAt).toLocaleString():"In progress"} .
                        Urgency: {labActive.clerking?.orders?.lab?.urgency||"Routine"}
                      </div>
                    </div>
                    <button onClick={()=>printReport(labActive)} style={{ padding:"10px 20px",border:"1.5px solid rgba(255,255,255,.4)",borderRadius:9,background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700 }}>
                      🖨️ Print Report
                    </button>
                  </div>
                  {(()=>{
                    const res=Object.keys(labResults).length?labResults:(labActive.clerking?.labResults||{});
                    let crits=[],abnorms=[];
                    Object.entries(res).forEach(([sid,r])=>{ const ref=LAB_REF[sid]; if(!ref) return; if(r.flag==="critical") crits.push({name:ref.name,value:r.value,unit:ref.unit}); else if(r.flag?.startsWith("abnormal")) abnorms.push({name:ref.name,value:r.value,unit:ref.unit,flag:r.flag}); });
                    return (<>
                      {crits.length>0&&<div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:10,padding:"14px 18px",marginBottom:12 }}>
                        <div style={{ fontSize:13,fontWeight:800,color:"#dc2626",marginBottom:10 }}>🔴 Critical Values - Urgent Review Required ({crits.length})</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
                          {crits.map(c=><div key={c.name} style={{ background:"#fff",border:"1.5px solid #fca5a5",borderRadius:8,padding:"8px 14px",minWidth:160 }}><div style={{ fontSize:10,color:"#ef4444",fontFamily:"monospace",textTransform:"uppercase" }}>{c.name}</div><div style={{ fontSize:18,fontWeight:900,color:"#dc2626",fontFamily:"monospace" }}>{c.value} <span style={{ fontSize:11 }}>{c.unit}</span></div></div>)}
                        </div>
                      </div>}
                      {abnorms.length>0&&<div style={{ background:"#fffbeb",border:"2px solid #fcd34d",borderRadius:10,padding:"14px 18px",marginBottom:12 }}>
                        <div style={{ fontSize:13,fontWeight:800,color:"#b45309",marginBottom:10 }}>(!) Abnormal Values ({abnorms.length})</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
                          {abnorms.map(a=><div key={a.name} style={{ background:"#fff",border:"1.5px solid #fcd34d",borderRadius:8,padding:"8px 14px",minWidth:160 }}><div style={{ fontSize:10,color:"#b45309",fontFamily:"monospace",textTransform:"uppercase" }}>{a.name}</div><div style={{ fontSize:18,fontWeight:900,color:"#b45309",fontFamily:"monospace" }}>{a.flag==="abnormal-low"?"v":"^"} {a.value} <span style={{ fontSize:11 }}>{a.unit}</span></div></div>)}
                        </div>
                      </div>}
                    </>);
                  })()}
                  {requestedTestIds.map(testId=>{
                    const subIds=TEST_SUBTESTS[testId]||[];
                    const testName=requestedTestNames[testId]||testId;
                    const res=Object.keys(labResults).length?labResults:(labActive.clerking?.labResults||{});
                    return (
                      <Card key={testId} mb={14}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                          <div style={{ fontSize:11,fontWeight:700,color:"#0e7490",letterSpacing:1.3,textTransform:"uppercase",fontFamily:"monospace",paddingBottom:0,borderBottom:"none" }}>{testName}</div>
                          <button onClick={()=>printTestResult(labActive,testId,res)} style={{ padding:"5px 14px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#0e7490",display:"flex",alignItems:"center",gap:5 }}>🖨 Print</button>
                        </div>
                        <table style={{ width:"100%",borderCollapse:"collapse" }}>
                          <thead><tr style={{ background:"#f8fafc" }}>
                            {["Analyte","Result","Unit","Reference Range","Flag"].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:C.slateL,fontFamily:"monospace",letterSpacing:.8,borderBottom:"1px solid #e2e8f0" }}>{h}</th>)}
                          </tr></thead>
                          <tbody>
                            {subIds.map((sid,i)=>{
                              const ref=LAB_REF[sid]; if(!ref) return null;
                              const r=res[sid];
                              const fc=flagColor[r?.flag||"empty"];
                              const lo=labActive.gender==="Female"&&ref.fLow!==undefined?ref.fLow:ref.low;
                              const hi=labActive.gender==="Female"&&ref.fHigh!==undefined?ref.fHigh:ref.high;
                              const refRange=ref.type==="numeric"&&lo!==undefined?`${lo} - ${hi}`:ref.options?"Qualitative":"Descriptive";
                              return (
                                <tr key={sid} style={{ background:r?.flag&&r.flag!=="normal"&&r.flag!=="empty"?fc.bg:i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9" }}>
                                  <td style={{ padding:"10px 12px",fontSize:13,fontWeight:600,color:"#1e293b" }}>{ref.name}</td>
                                  <td style={{ padding:"10px 12px",fontSize:14,fontWeight:800,color:r?.value?fc.text:C.slateL,fontFamily:"monospace" }}>{r?.value||"-"}</td>
                                  <td style={{ padding:"10px 12px",fontSize:12,color:C.slateL }}>{ref.unit||""}</td>
                                  <td style={{ padding:"10px 12px",fontSize:12,color:C.slate,fontFamily:"monospace" }}>{refRange}</td>
                                  <td style={{ padding:"10px 12px" }}>{r?.flag&&r.flag!=="empty"?<span style={{ background:fc.tagBg,color:fc.tagTx,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:800 }}>{fc.tag}</span>:<span style={{ fontSize:11,color:"#cbd5e1" }}>{r?.value?"Normal":"-"}</span>}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </Card>
                    );
                  })}
                  <div style={{ display:"flex",justifyContent:"space-between",paddingBottom:24,gap:10 }}>
                    <button onClick={()=>setLabStep("results")} style={BtnGhost}>Back Back to Results Entry</button>
                    <button onClick={()=>printReport(labActive)} style={{ padding:"12px 28px",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,color:"#fff",background:"linear-gradient(135deg,#059669,#047857)",boxShadow:"0 4px 14px rgba(0,0,0,.2)" }}>
                      🖨️ Print Full Report
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── PER-TEST RESULT MODAL ────────────────────────────────── */}
        {labViewModal && (()=>{
          const { pat:mp, testId:mt } = labViewModal;
          const mRes = mp.clerking?.labResults || {};
          const mSubIds = TEST_SUBTESTS[mt] || [];
          const mTestName = (()=>{ const map={}; (mp.clerking?.orders?.lab?.tests||[]).forEach(tid=>{ (TEST_SUBTESTS[tid]||[]).forEach(sid=>{ const ref=LAB_REF[sid]; if(ref&&!map[tid]) map[tid]=ref.name.split(" ")[0]+" "+ref.name.split(" ").slice(1).join(" "); }); }); return LAB_REF[(TEST_SUBTESTS[mt]||[])[0]]?.name?.replace(/\(.*?\)/g,"").trim() || mt; })();
          const mName = (()=>{ const n={}; (mp.clerking?.orders?.lab?.tests||[]).forEach(tid=>{(TEST_SUBTESTS[tid]||[]).forEach(sid=>{const ref=LAB_REF[sid];if(ref)n[tid]=n[tid]||tid;});});  return requestedTestNames?.[mt] || mt; })();
          return (
            <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={()=>setLabViewModal(null)}>
              <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:760,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.3)",overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
                {/* Modal Header */}
                <div style={{ background:"linear-gradient(135deg,#0e7490,#0369a1)",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4 }}>Lab Result</div>
                    <div style={{ fontSize:17,fontWeight:800,color:"#fff" }}>{mName}</div>
                    <div style={{ fontSize:12,color:"rgba(255,255,255,.7)",marginTop:3 }}>{mp.firstName||mp.name} {mp.lastName||""} · {mp.id||"Unreg."} · {calcAge(mp.dateOfBirth)||"-"} yrs · {mp.gender||"-"}</div>
                  </div>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <button onClick={()=>{ const res=mp.clerking?.labResults||{}; printTestResult(mp,mt,res); }} style={{ padding:"7px 16px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"rgba(255,255,255,.2)" }}>🖨 Print</button>
                    <button onClick={()=>setLabViewModal(null)} style={{ padding:"7px 12px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:16,color:"rgba(255,255,255,.8)",background:"rgba(255,255,255,.1)" }}>✕</button>
                  </div>
                </div>
                {/* Patient strip */}
                <div style={{ background:"#f8fafc",borderBottom:"1px solid #e2e8f0",padding:"10px 22px",display:"flex",gap:24,flexWrap:"wrap" }}>
                  {[["Doctor",mp.clerking?.doctorName||"-"],["Lab Scientist",mp.clerking?.labScientist||"-"],["Lab No",mp.clerking?.labNo||"-"],["Completed",mp.clerking?.labCompletedAt?new Date(mp.clerking.labCompletedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"-"],["Urgency",mp.clerking?.orders?.lab?.urgency||"Routine"]].map(([l,v])=>(
                    <div key={l}><div style={{ fontSize:9,color:"#94a3b8",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8 }}>{l}</div><div style={{ fontSize:12,fontWeight:700,color:"#0b1929" }}>{v}</div></div>
                  ))}
                </div>
                {/* Results table */}
                <div style={{ overflowY:"auto",flex:1 }}>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead><tr style={{ background:"#f8fafc",position:"sticky",top:0 }}>
                      {["Analyte","Result","Unit","Reference Range","Flag"].map(h=>(
                        <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",fontFamily:"monospace",letterSpacing:.8,borderBottom:"2px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {mSubIds.map((sid,i)=>{
                        const ref=LAB_REF[sid]; if(!ref) return null;
                        const r=mRes[sid];
                        const fc=(()=>{ const m={normal:{bg:"#f0fdf4",text:"#15803d",tag:"Normal",tagBg:"#dcfce7",tagTx:"#166534"},"abnormal-low":{bg:"#fffbeb",text:"#b45309",tag:"▼ Low",tagBg:"#fef3c7",tagTx:"#92400e"},"abnormal-high":{bg:"#fff7ed",text:"#c2410c",tag:"▲ High",tagBg:"#ffedd5",tagTx:"#9a3412"},critical:{bg:"#fef2f2",text:"#dc2626",tag:"🔴 Critical",tagBg:"#fee2e2",tagTx:"#991b1b"},empty:{bg:"#fff",text:"#1e293b",tag:"",tagBg:"#f1f5f9",tagTx:"#64748b"}}; return m[r?.flag||"empty"]||m.empty; })();
                        const lo=mp.gender==="Female"&&ref.fLow!==undefined?ref.fLow:ref.low;
                        const hi=mp.gender==="Female"&&ref.fHigh!==undefined?ref.fHigh:ref.high;
                        const refRange=ref.type==="numeric"&&lo!==undefined?`${lo} - ${hi}`:ref.options?"Qualitative":"Descriptive";
                        return (
                          <tr key={sid} style={{ background:r?.flag&&r.flag!=="normal"&&r.flag!=="empty"?fc.bg:i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9" }}>
                            <td style={{ padding:"11px 14px",fontSize:13,fontWeight:600,color:"#1e293b" }}>{ref.name}</td>
                            <td style={{ padding:"11px 14px",fontSize:15,fontWeight:800,color:r?.value?fc.text:"#cbd5e1",fontFamily:"monospace" }}>{r?.value||"—"}</td>
                            <td style={{ padding:"11px 14px",fontSize:12,color:"#64748b" }}>{ref.unit||""}</td>
                            <td style={{ padding:"11px 14px",fontSize:12,color:"#475569",fontFamily:"monospace" }}>{refRange}</td>
                            <td style={{ padding:"11px 14px" }}>{r?.flag&&r.flag!=="empty"?<span style={{ background:fc.tagBg,color:fc.tagTx,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:800 }}>{fc.tag}</span>:<span style={{ fontSize:11,color:"#cbd5e1" }}>{r?.value?"Normal":"—"}</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Footer */}
                <div style={{ padding:"12px 22px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10 }}>
                  <button onClick={()=>setLabViewModal(null)} style={{ padding:"8px 20px",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,color:"#475569",background:"#fff" }}>Close</button>
                  <button onClick={()=>{ const res=mp.clerking?.labResults||{}; printTestResult(mp,mt,res); }} style={{ padding:"8px 20px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#0e7490" }}>🖨 Print Report</button>
                </div>
              </div>
            </div>
          );
        })()}
      </Layout>
    );



  // ==========================================================================
  // PAGE: PHARMACY
  // ==========================================================================

}
