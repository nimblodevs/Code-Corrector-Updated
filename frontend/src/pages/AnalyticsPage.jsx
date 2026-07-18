import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function AnalyticsPage(props) {
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


    const ANAL_TABS = [
      { key:"demographics", label:"Demographics",      icon:"👥" },
      { key:"patterns",     label:"Visit Patterns",    icon:"📅" },
      { key:"diagnoses",    label:"Diagnosis Trends",  icon:"🩺" },
      { key:"outcomes",     label:"Outcomes",          icon:"✅" },
      { key:"journey",      label:"Patient Journey",   icon:"🗺" },
    ];

    // ── Compute all analytics from patients array ──────────────────
    const total = patients.length;
    const today0 = new Date(); today0.setHours(0,0,0,0);

    // Age groups
    const ageGroups = {"0–17":0,"18–35":0,"36–50":0,"51–65":0,"65+":0};
    for (const p of patients) {
      if (!p.dateOfBirth) continue;
      const age = Math.floor((Date.now()-new Date(p.dateOfBirth))/(365.25*86400000));
      if (age<18) ageGroups["0–17"]++;
      else if (age<=35) ageGroups["18–35"]++;
      else if (age<=50) ageGroups["36–50"]++;
      else if (age<=65) ageGroups["51–65"]++;
      else ageGroups["65+"]++;
    }
    const maxAge = Math.max(...Object.values(ageGroups),1);

    // Gender
    const genderMap = {};
    for (const p of patients) { const g=p.gender||"Unknown"; genderMap[g]=(genderMap[g]||0)+1; }
    const genderColors = { Male:"#2563eb", Female:"#ec4899", Unknown:"#94a3b8" };

    // Category (payment)
    const catMap = {};
    for (const p of patients) { const c=p.category||"Unknown"; catMap[c]=(catMap[c]||0)+1; }
    const catColors = { Cash:"#16a34a", Insurance:"#7c3aed", Corporate:"#0e7490", Unknown:"#94a3b8" };

    // Monthly volume (last 6 months)
    const monthlyMap = {};
    for (const p of patients) {
      if (!p.queuedAt) continue;
      const mk = (p.queuedAt||"").slice(0,7);
      monthlyMap[mk]=(monthlyMap[mk]||0)+1;
    }
    const monthKeys = Object.keys(monthlyMap).sort().slice(-6);
    const maxMonth  = Math.max(...monthKeys.map(k=>monthlyMap[k]),1);

    // Day of week
    const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const dowCounts = [0,0,0,0,0,0,0];
    for (const p of patients) { if (p.queuedAt) dowCounts[new Date(p.queuedAt).getDay()]++; }
    const maxDow = Math.max(...dowCounts,1);

    // Hourly distribution
    const hourCounts = Array(24).fill(0);
    for (const p of patients) { if (p.queuedAt) { const h=new Date(p.queuedAt).getHours(); hourCounts[h]++; } }
    const maxHour = Math.max(...hourCounts,1);
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Diagnoses
    const dxMap = {};
    for (const p of patients) {
      const dx = (p.clerking?.finalDx||p.clerking?.provDx||"").trim();
      if (dx) dxMap[dx]=(dxMap[dx]||0)+1;
    }
    const topDx = Object.entries(dxMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const maxDx = topDx[0]?.[1]||1;

    // Chief complaints
    const ccMap = {};
    for (const p of patients) { const cc=(p.triage?.complaint||"").trim(); if (cc) ccMap[cc]=(ccMap[cc]||0)+1; }
    const topCC = Object.entries(ccMap).sort((a,b)=>b[1]-a[1]).slice(0,8);

    // Outcomes
    const statusMap = {};
    for (const p of patients) { const s=p.status||"Unknown"; statusMap[s]=(statusMap[s]||0)+1; }
    const statusColors = { Completed:"#16a34a", Admitted:"#2563eb", Queued:"#d97706", Triaged:"#0e7490", Registered:"#7c3aed", "With Doctor":"#0284c7", Unknown:"#94a3b8" };
    const completedPct = total>0?Math.round((statusMap.Completed||0)/total*100):0;
    const billedPct    = total>0?Math.round(patients.filter(p=>p.billing?.invoiceNo).length/total*100):0;
    const labPct       = total>0?Math.round(patients.filter(p=>(p.labResults||[]).length>0).length/total*100):0;
    const pharmPct     = total>0?Math.round(patients.filter(p=>p.clerking?.dispensed||(p.clerking?.prescriptions||[]).length>0).length/total*100):0;
    const insuredPct   = total>0?Math.round(patients.filter(p=>p.category&&p.category!=="Cash").length/total*100):0;

    // Referral sources
    const refMap = {};
    for (const p of patients) { const r=p.referredBy||"Walk-in"; refMap[r]=(refMap[r]||0)+1; }
    const topRef = Object.entries(refMap).sort((a,b)=>b[1]-a[1]).slice(0,7);
    const maxRef = topRef[0]?.[1]||1;

    // Patient journey — step completion rates & avg time
    const journeySteps = [
      { name:"Queued",      icon:"⏱", color:"#475569", pct: total>0?100:0 },
      { name:"Triaged",     icon:"🩺", color:"#0e7490", pct: total>0?Math.round(patients.filter(p=>p.triage?.triageLevel).length/total*100):0 },
      { name:"Registered",  icon:"📝", color:"#16a34a", pct: total>0?Math.round(patients.filter(p=>p.mrn).length/total*100):0 },
      { name:"Billed",      icon:"💳", color:"#7c3aed", pct: total>0?Math.round(patients.filter(p=>p.billing?.invoiceNo).length/total*100):0 },
      { name:"Doctor",      icon:"📋", color:"#2563eb", pct: total>0?Math.round(patients.filter(p=>p.clerking?.finalDx||p.clerking?.provDx).length/total*100):0 },
      { name:"Lab",         icon:"🧪", color:"#d97706", pct: total>0?Math.round(patients.filter(p=>(p.labResults||[]).length>0).length/total*100):0 },
      { name:"Pharmacy",    icon:"💊", color:"#ea580c", pct: total>0?Math.round(patients.filter(p=>p.clerking?.dispensed).length/total*100):0 },
      { name:"Completed",   icon:"✅", color:"#16a34a", pct: total>0?Math.round(patients.filter(p=>p.status==="Completed").length/total*100):0 },
    ];

    // Helper bar chart
    const BarRow = ({ label, val, max, color="#0e7490", suffix="" }) => {
      const pct = max>0?Math.round(val/max*100):0;
      return (
        <div style={{ marginBottom:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
            <span style={{ fontSize:12,color:"#475569",fontWeight:500 }}>{label}</span>
            <span style={{ fontSize:12,fontWeight:700,color,fontFamily:"monospace" }}>{val}{suffix}</span>
          </div>
          <div style={{ height:8,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:4,transition:"width .4s" }} />
          </div>
        </div>
      );
    };

    return (
      <Layout page={page} setPage={p=>{setAnalTab("demographics");setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar
          title="Patient Analytics"
          sub={`${total} total patients · Live analytics computed from visit records`}
        />
        <div style={{ padding:"0 24px 8px" }}>
          <div style={{ display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid #e2e8f0" }}>
            {ANAL_TABS.map(t=>(
              <button key={t.key} onClick={()=>setAnalTab(t.key)}
                style={{ padding:"9px 18px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:analTab===t.key?700:500,
                  color:analTab===t.key?"#0e7490":"#64748b",background:"transparent",
                  borderBottom:analTab===t.key?"2px solid #0e7490":"2px solid transparent",marginBottom:-1 }}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding:"0 24px 40px" }}>

          {/* ── DEMOGRAPHICS ──────────────────────────────────────────── */}
          {analTab==="demographics" && (
            <div>
              {/* KPI row */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
                {[
                  { label:"Total Patients",   val:total,                                                                 color:"#0e7490", bg:"#f0fdff", icon:"👥" },
                  { label:"Female Patients",  val:genderMap.Female||0,                                                   color:"#ec4899", bg:"#fdf2f8", icon:"👩" },
                  { label:"Male Patients",    val:genderMap.Male||0,                                                     color:"#2563eb", bg:"#eff6ff", icon:"👨" },
                  { label:"Insured / Corp.",  val:patients.filter(p=>p.category&&p.category!=="Cash").length,             color:"#7c3aed", bg:"#f5f3ff", icon:"🛡" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#fff",border:`2px solid ${s.bg}`,borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}>
                    <div style={{ width:42,height:42,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:24,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16 }}>
                {/* Age groups */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:16 }}>Age Group Distribution</div>
                  {Object.entries(ageGroups).map(([grp,cnt])=>(
                    <BarRow key={grp} label={grp} val={cnt} max={maxAge} color="#0e7490" suffix=" pts" />
                  ))}
                  <div style={{ marginTop:14,paddingTop:12,borderTop:"1px solid #f1f5f9" }}>
                    {(() => {
                      const topGrp = Object.entries(ageGroups).sort((a,b)=>b[1]-a[1])[0];
                      return topGrp ? <div style={{ fontSize:11,color:"#64748b" }}>Largest group: <b style={{ color:"#0e7490" }}>{topGrp[0]}</b> ({topGrp[1]} patients)</div> : null;
                    })()}
                  </div>
                </div>
                {/* Gender */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:16 }}>Gender Breakdown</div>
                  {Object.entries(genderMap).map(([g,cnt])=>(
                    <div key={g} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:12,color:"#475569" }}>{g}</span>
                        <span style={{ fontSize:12,fontWeight:700,color:genderColors[g]||"#94a3b8",fontFamily:"monospace" }}>{cnt} <span style={{ color:"#94a3b8",fontWeight:400 }}>({total>0?Math.round(cnt/total*100):0}%)</span></span>
                      </div>
                      <div style={{ height:8,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${total>0?cnt/total*100:0}%`,background:genderColors[g]||"#94a3b8",borderRadius:4 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:16,display:"flex",gap:8,flexWrap:"wrap" }}>
                    {Object.entries(genderMap).map(([g,cnt])=>(
                      <div key={g} style={{ padding:"6px 12px",borderRadius:20,background:(genderColors[g]||"#94a3b8")+"20",fontSize:11,fontWeight:700,color:genderColors[g]||"#94a3b8" }}>{g}: {total>0?Math.round(cnt/total*100):0}%</div>
                    ))}
                  </div>
                </div>
                {/* Payment category */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:16 }}>Payment Category</div>
                  {Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([cat,cnt])=>(
                    <div key={cat} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:12,color:"#475569" }}>{cat}</span>
                        <span style={{ fontSize:12,fontWeight:700,color:catColors[cat]||"#94a3b8",fontFamily:"monospace" }}>{cnt} <span style={{ color:"#94a3b8",fontWeight:400 }}>({total>0?Math.round(cnt/total*100):0}%)</span></span>
                      </div>
                      <div style={{ height:8,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${total>0?cnt/total*100:0}%`,background:catColors[cat]||"#94a3b8",borderRadius:4 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:14,paddingTop:12,borderTop:"1px solid #f1f5f9",fontSize:11,color:"#64748b" }}>
                    Insurance coverage: <b style={{ color:"#7c3aed" }}>{insuredPct}%</b> of patients
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── VISIT PATTERNS ────────────────────────────────────────── */}
          {analTab==="patterns" && (
            <div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
                {[
                  { label:"Visits This Month", val:monthlyMap[new Date().toISOString().slice(0,7)]||0, color:"#0e7490", icon:"📅" },
                  { label:"Peak Day",           val:DOW[dowCounts.indexOf(Math.max(...dowCounts))],     color:"#7c3aed", icon:"📈" },
                  { label:"Peak Hour",          val:`${peakHour}:00–${peakHour+1}:00`,                 color:"#ea580c", icon:"⏰" },
                  { label:"Avg/Month",          val:monthKeys.length>0?Math.round(monthKeys.reduce((s,k)=>s+monthlyMap[k],0)/monthKeys.length):0, color:"#16a34a", icon:"📊" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}>
                    <div style={{ width:38,height:38,borderRadius:9,background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:20,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                {/* Monthly volume chart */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:16 }}>Monthly Patient Volume</div>
                  {monthKeys.length===0 ? (
                    <div style={{ textAlign:"center",padding:"32px",color:"#94a3b8" }}>No monthly data yet</div>
                  ) : (
                    <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:140 }}>
                      {monthKeys.map(mk=>{
                        const v = monthlyMap[mk];
                        const h = Math.max(8,(v/maxMonth)*120);
                        const [yr,mo] = mk.split("-");
                        const label = new Date(Number(yr),Number(mo)-1).toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
                        return (
                          <div key={mk} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                            <div style={{ fontSize:10,fontWeight:700,color:"#0e7490" }}>{v}</div>
                            <div style={{ width:"100%",height:h,background:"linear-gradient(180deg,#0e7490,#0284c7)",borderRadius:"4px 4px 0 0",minHeight:8 }} />
                            <div style={{ fontSize:9,color:"#94a3b8" }}>{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Day of week */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:16 }}>Visits by Day of Week</div>
                  {DOW.map((day,i)=>(
                    <BarRow key={day} label={day} val={dowCounts[i]} max={maxDow} color={dowCounts[i]===Math.max(...dowCounts)?"#7c3aed":"#0e7490"} />
                  ))}
                </div>
              </div>
              {/* Hourly distribution */}
              <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:4 }}>Hourly Arrival Distribution</div>
                <div style={{ fontSize:11,color:"#94a3b8",marginBottom:16 }}>Peak hour: <b style={{ color:"#ea580c" }}>{peakHour}:00 – {peakHour+1}:00</b> ({hourCounts[peakHour]} patients)</div>
                <div style={{ display:"flex",alignItems:"flex-end",gap:3,height:80 }}>
                  {hourCounts.map((cnt,h)=>{
                    const ht = Math.max(2,(cnt/maxHour)*72);
                    const isPeak = h===peakHour;
                    return (
                      <div key={h} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
                        <div style={{ width:"100%",height:ht,background:isPeak?"#ea580c":"#bae6fd",borderRadius:"2px 2px 0 0",minHeight:2 }} />
                        {h%4===0 && <div style={{ fontSize:8,color:"#94a3b8" }}>{h}h</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:10,padding:"10px 14px",background:"#fff7ed",borderRadius:9,fontSize:11,color:"#92400e" }}>
                  💡 Capacity planning: Allocate additional triage staff between {peakHour}:00–{Math.min(peakHour+3,23)}:00 to manage peak arrival volumes.
                </div>
              </div>
            </div>
          )}

          {/* ── DIAGNOSIS TRENDS ──────────────────────────────────────── */}
          {analTab==="diagnoses" && (
            <div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20 }}>
                {[
                  { label:"Unique Diagnoses",    val:Object.keys(dxMap).length,                                                  color:"#0e7490", icon:"🩺" },
                  { label:"Patients Diagnosed",  val:patients.filter(p=>p.clerking?.finalDx||p.clerking?.provDx).length,         color:"#7c3aed", icon:"📋" },
                  { label:"Chief Complaints",    val:Object.keys(ccMap).length,                                                  color:"#ea580c", icon:"🗣" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"center",gap:14 }}>
                    <div style={{ width:40,height:40,borderRadius:10,background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:22,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:4 }}>Top Diagnoses</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginBottom:16 }}>Final / provisional diagnoses from doctor records</div>
                  {topDx.length===0 ? (
                    <div style={{ textAlign:"center",padding:"32px",color:"#94a3b8" }}>No diagnosis data yet</div>
                  ) : topDx.map(([dx,cnt],i)=>(
                    <div key={dx} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:4 }}>
                        <span style={{ fontSize:11,fontWeight:800,color:"#94a3b8",width:18,flexShrink:0,fontFamily:"monospace" }}>#{i+1}</span>
                        <span style={{ fontSize:12,fontWeight:600,color:"#0b1929",flex:1 }}>{dx}</span>
                        <span style={{ fontSize:12,fontWeight:700,color:"#0e7490",fontFamily:"monospace" }}>{cnt}</span>
                      </div>
                      <div style={{ height:6,background:"#f1f5f9",borderRadius:3,overflow:"hidden",marginLeft:26 }}>
                        <div style={{ height:"100%",width:`${Math.round(cnt/maxDx*100)}%`,background:`hsl(${190-i*12},70%,${45+i*3}%)`,borderRadius:3 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:4 }}>Chief Complaints</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginBottom:16 }}>Most common presenting complaints at triage</div>
                  {topCC.length===0 ? (
                    <div style={{ textAlign:"center",padding:"32px",color:"#94a3b8" }}>No triage complaint data yet</div>
                  ) : topCC.map(([cc,cnt],i)=>(
                    <div key={cc} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",marginBottom:6,background:"#f8fafc",borderRadius:8 }}>
                      <div style={{ width:22,height:22,borderRadius:"50%",background:"#0e7490",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0 }}>{i+1}</div>
                      <span style={{ flex:1,fontSize:12,color:"#0b1929" }}>{cc}</span>
                      <span style={{ fontSize:11,fontWeight:700,color:"#0e7490",fontFamily:"monospace" }}>{cnt} cases</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── OUTCOMES ──────────────────────────────────────────────── */}
          {analTab==="outcomes" && (
            <div>
              {/* Completion funnel */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20 }}>
                {[
                  { label:"Visit Completion",   val:`${completedPct}%`, sub:`${statusMap.Completed||0} of ${total}`, color:"#16a34a", icon:"✅" },
                  { label:"Billing Rate",        val:`${billedPct}%`,    sub:`${patients.filter(p=>p.billing?.invoiceNo).length} billed`,   color:"#7c3aed", icon:"💳" },
                  { label:"Lab Utilization",     val:`${labPct}%`,       sub:`${patients.filter(p=>(p.labResults||[]).length>0).length} pts`, color:"#2563eb", icon:"🧪" },
                  { label:"Pharmacy Rate",       val:`${pharmPct}%`,     sub:`${patients.filter(p=>p.clerking?.dispensed).length} dispensed`, color:"#ea580c", icon:"💊" },
                  { label:"Insurance Coverage",  val:`${insuredPct}%`,   sub:`${patients.filter(p=>p.category&&p.category!=="Cash").length} insured`, color:"#0e7490", icon:"🛡" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"14px 16px",textAlign:"center" }}>
                    <div style={{ fontSize:24,marginBottom:6 }}>{s.icon}</div>
                    <div style={{ fontSize:22,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:10,color:"#94a3b8",marginTop:4 }}>{s.label}</div>
                    <div style={{ fontSize:10,color:"#64748b",marginTop:2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                {/* Status distribution */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:16 }}>Patient Status Distribution</div>
                  {Object.entries(statusMap).sort((a,b)=>b[1]-a[1]).map(([st,cnt])=>(
                    <div key={st} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:12,color:"#475569" }}>{st}</span>
                        <span style={{ fontSize:12,fontWeight:700,color:statusColors[st]||"#94a3b8",fontFamily:"monospace" }}>{cnt} ({total>0?Math.round(cnt/total*100):0}%)</span>
                      </div>
                      <div style={{ height:8,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${total>0?cnt/total*100:0}%`,background:statusColors[st]||"#94a3b8",borderRadius:4 }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Satisfaction placeholder + readmission insight */}
                <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                  <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px",flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:12 }}>Readmission & Follow-up</div>
                    {[
                      { label:"Same-day Completions", val:`${patients.filter(p=>{ try { return p.queuedAt&&p.status==="Completed"&&new Date(p.queuedAt).toDateString()===new Date(p.completedAt||p.queuedAt).toDateString(); } catch{return false;} }).length} patients`, color:"#16a34a" },
                      { label:"Currently Admitted",   val:`${statusMap.Admitted||0} patients`, color:"#2563eb" },
                      { label:"Referred Patients",    val:`${patients.filter(p=>p.referredBy&&p.referredBy!=="Walk-in").length} patients`, color:"#7c3aed" },
                      { label:"Patients w/ Labs Req.", val:`${patients.filter(p=>(p.labResults||[]).length>0).length} patients`, color:"#d97706" },
                    ].map((f,i)=>(
                      <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"9px 10px",background:"#f8fafc",borderRadius:8,marginBottom:6 }}>
                        <span style={{ fontSize:12,color:"#64748b" }}>{f.label}</span>
                        <span style={{ fontSize:12,fontWeight:700,color:f.color }}>{f.val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:"linear-gradient(135deg,#0b1929,#0d2137)",borderRadius:14,padding:"18px 20px",color:"#fff" }}>
                    <div style={{ fontSize:13,fontWeight:700,marginBottom:8 }}>💡 Key Insight</div>
                    <div style={{ fontSize:11,color:"rgba(255,255,255,.7)",lineHeight:1.6 }}>
                      {completedPct}% visit completion rate with {pharmPct}% pharmacy utilization.
                      {labPct<50?" Lab test ordering is below 50% — consider if triage protocols need revision.":" Lab utilization is healthy."}
                      {" "}Consider implementing a follow-up call system for admitted patients to reduce readmission risk.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PATIENT JOURNEY ───────────────────────────────────────── */}
          {analTab==="journey" && (
            <div>
              {/* Funnel visualization */}
              <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"24px",marginBottom:16 }}>
                <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:4 }}>Patient Journey Funnel</div>
                <div style={{ fontSize:11,color:"#94a3b8",marginBottom:20 }}>Percentage of patients completing each step — bottlenecks appear where the bar narrows sharply</div>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {journeySteps.map((s,i)=>{
                    const prevPct = i===0?100:journeySteps[i-1].pct;
                    const dropoff = prevPct-s.pct;
                    const isBottleneck = dropoff>20;
                    return (
                      <div key={s.name} style={{ display:"flex",alignItems:"center",gap:14 }}>
                        <div style={{ width:28,height:28,borderRadius:"50%",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,color:"#fff" }}>{s.icon}</div>
                        <div style={{ width:88,fontSize:12,fontWeight:600,color:"#0b1929",flexShrink:0 }}>{s.name}</div>
                        <div style={{ flex:1,height:24,background:"#f1f5f9",borderRadius:6,overflow:"hidden",position:"relative" }}>
                          <div style={{ height:"100%",width:`${s.pct}%`,background:`linear-gradient(90deg,${s.color},${s.color}cc)`,borderRadius:6,transition:"width .5s",display:"flex",alignItems:"center",paddingLeft:8 }}>
                            {s.pct>15&&<span style={{ fontSize:10,fontWeight:700,color:"#fff" }}>{s.pct}%</span>}
                          </div>
                          {s.pct<=15&&<span style={{ position:"absolute",left:s.pct+2+"%",top:"50%",transform:"translateY(-50%)",fontSize:10,fontWeight:700,color:s.color }}>{s.pct}%</span>}
                        </div>
                        {isBottleneck && (
                          <span style={{ fontSize:10,fontWeight:700,color:"#dc2626",background:"#fee2e2",padding:"3px 8px",borderRadius:20,flexShrink:0 }}>⚠ -{dropoff}%</span>
                        )}
                        {!isBottleneck&&dropoff>0&&<span style={{ fontSize:10,color:"#94a3b8",flexShrink:0 }}>-{dropoff}%</span>}
                        {dropoff===0&&i>0&&<span style={{ fontSize:10,color:"#16a34a",flexShrink:0 }}>→</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:16,padding:"12px 14px",background:"#fef2f2",borderRadius:9,border:"1px solid #fca5a5" }}>
                  {(() => {
                    const bottlenecks = journeySteps.filter((s,i)=>i>0&&(journeySteps[i-1].pct-s.pct)>20);
                    return bottlenecks.length>0 ? (
                      <div style={{ fontSize:11,color:"#991b1b" }}>🔍 Bottlenecks detected at: <b>{bottlenecks.map(b=>b.name).join(", ")}</b>. Focus process improvement efforts here.</div>
                    ) : (
                      <div style={{ fontSize:11,color:"#166534" }}>✅ No major bottlenecks detected. Patient flow is consistent across all journey steps.</div>
                    );
                  })()}
                </div>
              </div>
              {/* Referral sources */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:4 }}>Referral Sources</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginBottom:16 }}>How patients arrived at the facility</div>
                  {topRef.length===0 ? (
                    <div style={{ textAlign:"center",padding:"24px",color:"#94a3b8" }}>No referral data</div>
                  ) : topRef.map(([src,cnt],i)=>(
                    <BarRow key={src} label={src} val={cnt} max={maxRef} color={i===0?"#0e7490":i===1?"#7c3aed":"#64748b"} suffix=" pts" />
                  ))}
                </div>
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:4 }}>Seasonal Peaks</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginBottom:16 }}>Monthly volume with capacity planning notes</div>
                  {monthKeys.length===0 ? (
                    <div style={{ textAlign:"center",padding:"24px",color:"#94a3b8" }}>No monthly data yet</div>
                  ) : monthKeys.map(mk=>{
                    const v = monthlyMap[mk];
                    const avg = Math.round(monthKeys.reduce((s,k)=>s+monthlyMap[k],0)/monthKeys.length);
                    const [yr,mo] = mk.split("-");
                    const label = new Date(Number(yr),Number(mo)-1).toLocaleDateString("en-GB",{month:"long",year:"2-digit"});
                    const isPeak = v===Math.max(...monthKeys.map(k=>monthlyMap[k]));
                    return (
                      <div key={mk} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                        <span style={{ fontSize:11,color:"#64748b",width:80,flexShrink:0 }}>{label}</span>
                        <div style={{ flex:1,height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                          <div style={{ height:"100%",width:`${maxMonth>0?v/maxMonth*100:0}%`,background:isPeak?"#ea580c":"#0e7490",borderRadius:4 }} />
                        </div>
                        <span style={{ fontSize:11,fontWeight:700,color:isPeak?"#ea580c":"#0e7490",width:28,textAlign:"right",fontFamily:"monospace" }}>{v}</span>
                        {isPeak && <span style={{ fontSize:9,background:"#fee2e2",color:"#dc2626",padding:"2px 6px",borderRadius:20,fontWeight:700 }}>PEAK</span>}
                      </div>
                    );
                  })}
                  <div style={{ marginTop:14,padding:"10px 12px",background:"#f0f9ff",borderRadius:9,fontSize:11,color:"#0369a1" }}>
                    💡 Prepare additional bed capacity and pharmacy stock in peak months.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );


}
