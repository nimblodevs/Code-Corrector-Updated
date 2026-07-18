import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function WardPage(props) {
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


    const admitted   = patients.filter(p=>p.admitted && !p.admission?.discharged);
    const dischToday = patients.filter(p=>p.admission?.discharged);
    const eligible   = patients.filter(p=>!p.admitted && (p.status==="Pending Admission"||p.status==="Billed"||p.status==="With Doctor"||p.status==="Completed"||p.status==="Lab Pending"));
    const occupancy  = {};
    WARDS.forEach(w=>{ occupancy[w.name]=admitted.filter(p=>p.admission?.ward===w.name).length; });

    // IP bill totals
    const ipTotal = ipBillItems.reduce((s,i)=>s+i.price*i.qty, 0);
    const ipCatColor = cat => cat==="lab"?"#0e7490":cat==="radiology"?"#7c3aed":cat==="pharmacy"?"#059669":cat==="nursing"?"#be185d":cat==="meals"?"#d97706":cat==="accommodation"?"#1d4ed8":"#475569";
    const ipCatBg    = cat => cat==="lab"?"#cffafe":cat==="radiology"?"#ede9fe":cat==="pharmacy"?"#d1fae5":cat==="nursing"?"#fce7f3":cat==="meals"?"#fef3c7":cat==="accommodation"?"#dbeafe":"#f1f5f9";

    const SUB_TABS = [
      { key:"manage",  label:"Ward Info",      icon:"hosp" },
      { key:"orders",  label:"Ward Round",      icon:"clip" },
      { key:"billing", label:"Add Charges",     icon:"card" },
      { key:"view",    label:"Bill",             icon:"rcpt" },
      { key:"sheet",   label:"Treatment Sheet", icon:"doc" },
    ];

    return (
      <Layout page={page} setPage={p=>{setWardAdmitPat(null);setWardActive(null);setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar title="Ward Management"
          subtitle={wardActive
            ? `${(wardActive.admission&&wardActive.admission.admitNo)||""} - ${wardActive.firstName||wardActive.name} ${wardActive.lastName||""} - ${(wardActive.admission&&wardActive.admission.ward)||""}, Bed ${(wardActive.admission&&wardActive.admission.bed)||""}`
            : admitted.length + " inpatient(s)  " + dischToday.length + " discharged today"}
          action={
            <div style={{ display:"flex",gap:8 }}>
              {wardActive && <button onClick={()=>setWardActive(null)} style={BtnGhost}>Back All Patients</button>}
              <button onClick={()=>setPage("queue")} style={BtnGhost}>Back Queue</button>
            </div>
          } />

        <div style={{ padding:"20px 26px" }}>

        {/* -- PATIENT LIST VIEW -- */}
        {!wardActive && !wardAdmitPat && (
          <div>
            {/* Occupancy strip */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20 }}>
              {WARDS.map(w=>{
                const occ=occupancy[w.name]||0, pct=Math.round(occ/w.beds*100);
                return (
                  <div key={w.id} style={{ background:"#fff",borderRadius:12,padding:"12px 14px",boxShadow:"0 1px 8px rgba(0,0,0,.07)",borderTop:"4px solid "+w.colour }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#0b1929",marginBottom:4 }}>{w.name}</div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6 }}>
                      <span style={{ fontSize:22,fontWeight:900,color:w.colour }}>{occ}</span>
                      <span style={{ fontSize:10,color:C.slateL,fontFamily:"monospace" }}>/ {w.beds}</span>
                    </div>
                    <div style={{ height:4,background:"#e2e8f0",borderRadius:2,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:pct+"%",background:pct>=90?"#dc2626":pct>=70?"#d97706":w.colour,borderRadius:2 }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* -- PENDING ADMISSION QUEUE -- */}
            {(() => {
              const pendingAdm = patients.filter(p=>p.status==="Pending Admission");
              if (!pendingAdm.length) return null;
              return (
                <div style={{ background:"linear-gradient(135deg,#fdf4ff,#ede9fe)",border:"2px solid #c084fc",borderRadius:14,padding:"16px 18px",marginBottom:20 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🏥</div>
                    <div>
                      <div style={{ fontSize:14,fontWeight:800,color:"#5b21b6" }}>Admission Queue - {pendingAdm.length} patient{pendingAdm.length>1?"s":""} awaiting bed assignment</div>
                      <div style={{ fontSize:11,color:"#7e22ce",opacity:.7 }}>Doctors have requested admission - assign a ward and bed to process</div>
                    </div>
                  </div>
                  {pendingAdm.map(p=>{
                    const req = p.clerking?.orders?.admit;
                    const tl  = TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                    const urgColor = req?.urgency==="Emergency"?"#dc2626":req?.urgency==="Urgent"?"#d97706":"#059669";
                    const urgBg    = req?.urgency==="Emergency"?"#fee2e2":req?.urgency==="Urgent"?"#fef3c7":"#dcfce7";
                    return (
                      <div key={p.queueNo} style={{ background:"#fff",borderRadius:12,padding:"16px 18px",marginBottom:10,border:"1.5px solid #ddd6fe",boxShadow:"0 2px 8px rgba(124,58,237,.08)" }}>
                        {/* Patient header row */}
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12 }}>
                          <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
                            <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,background:`hsl(${avatarHue(p.id||p.queueNo)},50%,82%)`,color:`hsl(${avatarHue(p.id||p.queueNo)},40%,28%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800 }}>
                              {(p.firstName||p.name||"?")[0]}{(p.lastName||"")[0]||""}
                            </div>
                            <div>
                              <div style={{ fontWeight:800,fontSize:14,color:"#0b1929" }}>{p.firstName||p.name} {p.lastName||""}</div>
                              <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace",marginBottom:5 }}>{p.id||"-"}  {calcAge(p.dateOfBirth)||"-"} yrs  {p.gender||"-"}  {p.queueNo}</div>
                              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                                {tl && <Badge label={"ESI L"+tl.level+" "+tl.label} color={tl.tc} bg={tl.bg} sm />}
                                {req?.urgency && <span style={{ background:urgBg,color:urgColor,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800 }}>{req.urgency} Admission</span>}
                                {req?.wardPref && <span style={{ background:"#ede9fe",color:"#7c3aed",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>Pref: {req.wardPref}</span>}
                                {p.clerking?.allergies && <span style={{ background:"#fef2f2",color:"#dc2626",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>ALLERGY: {p.clerking.allergies}</span>}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={()=>{
                              setWardAdmitPat(p);
                              setWardErr("");
                              // Pre-populate form from doctor's admission request
                              setWardForm({
                                ward:     req?.wardPref||"",
                                bed:      "",
                                admitReason: (p.clerking?.finalDx||p.clerking?.provisionalDx||p.triage?.chiefComplaint||""),
                                admitDoctor: req?.requestedBy||p.clerking?.doctorName||"",
                                admitNurse:  "",
                                diet:        req?.diet||"Regular",
                                isolation:   req?.isolation||false,
                                notes:       [req?.nursingNeeds,req?.specialNeeds].filter(Boolean).join("\n")||"",
                              });
                            }}
                            style={{ padding:"10px 20px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",boxShadow:"0 4px 12px rgba(124,58,237,.35)",flexShrink:0 }}>
                            Process Admission
                          </button>
                        </div>

                        {/* Admission criteria grid from doctor */}
                        {req && (
                          <div style={{ background:"#faf5ff",borderRadius:10,padding:"12px 14px",border:"1px solid #ddd6fe" }}>
                            <div style={{ fontSize:10,fontWeight:700,color:"#7c3aed",letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10 }}>Doctor's Admission Request Criteria</div>
                            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10 }}>
                              {[
                                ["Requested By", req.requestedBy||"-"],
                                ["Requested At", req.requestedAt?new Date(req.requestedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"-"],
                                ["Preferred Ward", req.wardPref||"-"],
                                ["Urgency", req.urgency||"-"],
                                ["Monitoring", req.monitoring||"-"],
                                ["Diet", req.diet||"-"],
                                ["Infection Control", req.infectionControl||"-"],
                                ["Diagnosis", p.clerking?.finalDx||p.clerking?.provisionalDx||"-"],
                                ["Disposition", p.clerking?.disposition||"-"],
                              ].map(([l,v])=>(
                                <div key={l}>
                                  <div style={{ fontSize:9,color:"#9333ea",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,marginBottom:2 }}>{l}</div>
                                  <div style={{ fontSize:12,fontWeight:700,color:"#1e293b" }}>{v}</div>
                                </div>
                              ))}
                            </div>
                            {/* Special flags */}
                            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom: (req.nursingNeeds||req.specialNeeds) ? 8 : 0 }}>
                              {req.isolation      && <span style={{ background:"#fef2f2",color:"#dc2626",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700 }}>Isolation Room</span>}
                              {req.oxygenNeeded   && <span style={{ background:"#eff6ff",color:"#1d4ed8",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700 }}>Oxygen Required</span>}
                              {req.ivAccess       && <span style={{ background:"#f0fdf4",color:"#15803d",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700 }}>IV Access Needed</span>}
                            </div>
                            {req.nursingNeeds && <div style={{ fontSize:11,color:"#be185d",marginBottom:4 }}><b>Nursing:</b> {req.nursingNeeds}</div>}
                            {req.specialNeeds && <div style={{ fontSize:11,color:"#475569" }}><b>Notes:</b> {req.specialNeeds}</div>}
                          </div>
                        )}

                        {/* Triage vitals strip */}
                        {p.triage && (
                          <div style={{ marginTop:10,paddingTop:10,borderTop:"1px solid #f1f5f9",display:"flex",gap:16,flexWrap:"wrap" }}>
                            {[["BP",p.triage.bp],["Pulse",p.triage.pulse],["Temp",p.triage.temp],["SpO2",p.triage.spo2],["GCS",p.triage.gcs]].map(([l,v])=>v?(
                              <div key={l}>
                                <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase" }}>{l}</div>
                                <div style={{ fontSize:12,fontWeight:700 }}>{v}</div>
                              </div>
                            ):null)}
                            {p.triage.chiefComplaint && <div style={{ flex:1 }}><div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase" }}>Chief Complaint</div><div style={{ fontSize:12,fontWeight:700,color:"#c2410c" }}>{p.triage.chiefComplaint}</div></div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,alignItems:"start" }}>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:10 }}>Current Inpatients ({admitted.length})</div>
                {admitted.length===0
                  ? <EmptyState icon="🏥" msg="No patients currently admitted." />
                  : admitted.map(p=>{
                    const tl=TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                    const w=WARDS.find(x=>x.name===p.admission?.ward);
                    const hrs=p.admission?.admittedAt?Math.round((Date.now()-new Date(p.admission.admittedAt))/3600000):0;
                    const ipBill = p.admission?.ipBill||[];
                    const ipBillTotal = ipBill.reduce((s,i)=>s+i.price*i.qty,0);
                    const ordersCount = (p.admission?.ipOrders||[]).length;
                    return (
                      <div key={p.queueNo} style={{ background:"#fff",borderRadius:11,padding:"14px 16px",marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,.07)",border:"1.5px solid #e2e8f0",cursor:"pointer",transition:"border-color .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="#00bcd4"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}
                        onClick={()=>openIpManage(p)}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
                          <div style={{ display:"flex",gap:10,flex:1 }}>
                            <div style={{ width:40,height:40,borderRadius:"50%",flexShrink:0,background:"hsl("+avatarHue(p.id||p.queueNo)+",50%,82%)",color:"hsl("+avatarHue(p.id||p.queueNo)+",40%,28%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800 }}>
                              {(p.firstName||p.name||"?")[0]}{(p.lastName||"")[0]||""}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:800,fontSize:13,color:"#0b1929" }}>{p.firstName||p.name} {p.lastName||""}</div>
                              <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",marginBottom:4 }}>{p.id||"-"}  {calcAge(p.dateOfBirth)||"-"} yrs  {p.gender||"-"}</div>
                              <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                                <span style={{ background:w?.bg||"#f1f5f9",color:w?.colour||"#475569",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>{p.admission?.ward}</span>
                                <span style={{ background:"#f0fdf4",color:"#15803d",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>Bed {p.admission?.bed}</span>
                                {tl && <Badge label={"L"+tl.level} color={tl.tc} bg={tl.bg} sm />}
                                <span style={{ background:"#f8fafc",color:C.slateL,borderRadius:6,padding:"2px 8px",fontSize:9,fontFamily:"monospace" }}>{hrs}h</span>
                                {p.admission?.isolation && <span style={{ background:"#fef2f2",color:"#dc2626",borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:700 }}>Isolation</span>}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign:"right",flexShrink:0 }}>
                            <div style={{ fontSize:9,fontFamily:"monospace",color:"#7c3aed",marginBottom:4 }}>{p.admission?.admitNo}</div>
                            {p.admission?.ipBillSnap?.finalized
                              ? <div style={{ fontSize:10,fontWeight:700,color:"#059669",background:"#dcfce7",borderRadius:4,padding:"1px 7px",marginBottom:2 }}>Final Bill</div>
                              : p.admission?.ipBillSnap
                              ? <div style={{ fontSize:10,fontWeight:700,color:"#b45309",background:"#fef3c7",borderRadius:4,padding:"1px 7px",marginBottom:2 }}>Interim Bill</div>
                              : null}
                            {ipBillTotal>0 && <div style={{ fontSize:11,fontWeight:700,color:"#059669" }}>KES {ipBillTotal.toLocaleString()}</div>}
                            {ordersCount>0 && <div style={{ fontSize:10,color:"#0e7490" }}>{ordersCount} round(s)</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
                {dischToday.length>0 && (
                  <>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginTop:18,marginBottom:8 }}>Discharged Today ({dischToday.length})</div>
                    {dischToday.map(p=>(
                      <div key={p.queueNo} style={{ background:"#f0fdf4",borderRadius:10,padding:"11px 14px",marginBottom:8,border:"1.5px solid #86efac",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div>
                          <div style={{ fontWeight:700,fontSize:12,color:"#14532d" }}>{p.firstName||p.name} {p.lastName||""} <span style={{ fontWeight:400,fontSize:11 }}> {p.admission?.admitNo}</span></div>
                          <div style={{ fontSize:11,color:"#15803d",marginTop:2 }}>{p.admission?.ward}  Bed {p.admission?.bed}  {p.admission?.conditionAtDischarge}  {p.admission?.dischargeType}</div>
                        </div>
                        <button onClick={()=>openIpManage(p)} style={{ ...BtnGhost,fontSize:11,padding:"5px 12px" }}>View</button>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Pending Admissions (from doctor) + Walk-in Eligible */}
              <div>
                {/* Doctor-requested admissions queue */}
                {(()=>{
                  const pending = patients.filter(p=>p.status==="Pending Admission");
                  return (
                    <Card mb={14}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                        <Sec accent="#9333ea">Admission Requests from Doctor ({pending.length})</Sec>
                        {pending.length>0 && <span style={{ background:"#fdf4ff",color:"#9333ea",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:800 }}>Action Required</span>}
                      </div>
                      {pending.length===0
                        ? <div style={{ fontSize:12,color:C.slateL,textAlign:"center",padding:"14px 0" }}>No pending admission requests</div>
                        : pending.map(p=>{
                          const tl=TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                          const req = p.clerking?.orders?.admit;
                          return (
                            <div key={p.queueNo} style={{ background:"#fdf4ff",borderRadius:10,padding:"12px 14px",marginBottom:10,border:"2px solid #d8b4fe" }}>
                              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
                                <div style={{ flex:1 }}>
                                  <div style={{ fontWeight:800,fontSize:13,color:"#5b21b6",marginBottom:2 }}>{p.firstName||p.name} {p.lastName||""}</div>
                                  <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",marginBottom:6 }}>{p.id||"-"}  {p.queueNo}  {calcAge(p.dateOfBirth)||"-"} yrs  {p.gender||"-"}</div>
                                  {/* Doctor's diagnosis */}
                                  <div style={{ fontSize:12,fontWeight:700,color:"#1e293b",marginBottom:4 }}>
                                    Dx: {p.clerking?.finalDx||p.clerking?.provisionalDx||"-"}
                                  </div>
                                  {/* Admission criteria tags */}
                                  {req && (
                                    <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:6 }}>
                                      <span style={{ background:"#ede9fe",color:"#7c3aed",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>
                                        Pref: {req.wardPref||"-"}
                                      </span>
                                      <span style={{ background:req.urgency==="Emergency"?"#fee2e2":req.urgency==="Urgent"?"#fef3c7":"#f0fdf4",color:req.urgency==="Emergency"?"#dc2626":req.urgency==="Urgent"?"#b45309":"#15803d",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>
                                        {req.urgency}
                                      </span>
                                      {tl && <Badge label={"L"+tl.level} color={tl.tc} bg={tl.bg} sm />}
                                      {req.isolation && <span style={{ background:"#fee2e2",color:"#dc2626",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>Isolation</span>}
                                      {req.oxygenNeeded && <span style={{ background:"#e0f2fe",color:"#0369a1",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>O2 Needed</span>}
                                      {req.ivAccess && <span style={{ background:"#fef3c7",color:"#b45309",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>IV Access</span>}
                                      {req.infectionControl!=="None" && <span style={{ background:"#fef2f2",color:"#dc2626",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>{req.infectionControl}</span>}
                                    </div>
                                  )}
                                  {req?.monitoring && req.monitoring!=="Standard" && (
                                    <div style={{ fontSize:11,color:"#475569",marginBottom:3 }}>Monitoring: <strong>{req.monitoring}</strong></div>
                                  )}
                                  {req?.nursingNeeds && <div style={{ fontSize:11,color:"#475569",marginBottom:2 }}>Nursing: {req.nursingNeeds}</div>}
                                  {req?.specialNeeds && <div style={{ fontSize:11,color:"#475569",marginBottom:2 }}>Notes: {req.specialNeeds}</div>}
                                  <div style={{ fontSize:10,color:C.slateL,marginTop:4 }}>
                                    Requested by: <strong>{p.clerking?.doctorName||"-"}</strong>
                                    {req?.requestedAt && ` at ${new Date(req.requestedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`}
                                  </div>
                                </div>
                                <button
                                  onClick={()=>{
                                    setWardAdmitPat(p);
                                    setWardErr("");
                                    setWardForm({
                                      ward: req?.wardPref||"",
                                      bed: "",
                                      admitReason: p.clerking?.finalDx||p.clerking?.provisionalDx||p.triage?.chiefComplaint||"",
                                      admitDoctor: p.clerking?.doctorName||"",
                                      admitNurse: "",
                                      diet: req?.diet||"Regular",
                                      isolation: req?.isolation||false,
                                      notes: [req?.nursingNeeds, req?.specialNeeds].filter(Boolean).join(". "),
                                    });
                                  }}
                                  style={{ padding:"8px 14px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#7c3aed",flexShrink:0 }}>
                                  Process Admission
                                </button>
                              </div>
                            </div>
                          );
                        })
                      }
                    </Card>
                  );
                })()}

                {/* Walk-in eligible (manual admission without doctor request) */}
                <Card>
                  <Sec accent="#475569">Walk-in Eligible ({eligible.filter(p=>p.status!=="Pending Admission").length})</Sec>
                  {eligible.filter(p=>p.status!=="Pending Admission").length===0
                    ? <div style={{ fontSize:12,color:C.slateL,textAlign:"center",padding:"14px 0" }}>No walk-in admissions pending</div>
                    : eligible.filter(p=>p.status!=="Pending Admission").map(p=>{
                      const sm=STATUS_META[p.status]||STATUS_META.Queued;
                      const tl=TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                      return (
                        <div key={p.queueNo} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f1f5f9" }}>
                          <div>
                            <div style={{ fontWeight:700,fontSize:13,color:"#0b1929" }}>{p.firstName||p.name} {p.lastName||""}</div>
                            <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",marginBottom:3 }}>{p.queueNo}  {p.triage?.chiefComplaint?.slice(0,40)||"-"}</div>
                            <div style={{ display:"flex",gap:5 }}>
                              <Badge label={p.status} color={sm.color} bg={sm.bg} dot={sm.dot} sm />
                              {tl && <Badge label={"L"+tl.level} color={tl.tc} bg={tl.bg} sm />}
                            </div>
                          </div>
                          <button onClick={()=>{ setWardAdmitPat(p); setWardErr(""); setWardForm({ ward:"",bed:"",admitReason:p.triage?.chiefComplaint||"",admitDoctor:p.clerking?.doctorName||"",admitNurse:"",diet:"Regular",isolation:false,notes:"" }); }}
                            style={{ padding:"7px 14px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#475569",flexShrink:0 }}>+ Admit</button>
                        </div>
                      );
                    })
                  }
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* -- ADMIT FORM -- */}
        {wardAdmitPat && !wardActive && (
          <div style={{ maxWidth:780 }}>
            <div style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)",borderRadius:12,padding:"14px 18px",marginBottom:16,color:"#fff" }}>
              <div style={{ fontSize:15,fontWeight:800 }}>Process Admission: {wardAdmitPat.firstName||wardAdmitPat.name} {wardAdmitPat.lastName||""}</div>
              <div style={{ fontSize:11,opacity:.7,marginTop:2,fontFamily:"monospace" }}>{wardAdmitPat.id||wardAdmitPat.queueNo}  {wardAdmitPat.triage?.chiefComplaint||"-"}</div>
            </div>

            {/* Doctor's admission request summary */}
            {wardAdmitPat.clerking?.orders?.admit && (
              <div style={{ background:"#fdf4ff",border:"2px solid #d8b4fe",borderRadius:12,padding:"14px 16px",marginBottom:14 }}>
                <div style={{ fontSize:12,fontWeight:700,color:"#7e22ce",marginBottom:8 }}>Doctor's Admission Request</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8 }}>
                  {[
                    ["Requested By", wardAdmitPat.clerking.doctorName||"-"],
                    ["Preferred Ward", wardAdmitPat.clerking.orders.admit.wardPref||"-"],
                    ["Urgency", wardAdmitPat.clerking.orders.admit.urgency||"-"],
                    ["Diagnosis", wardAdmitPat.clerking?.finalDx||wardAdmitPat.clerking?.provisionalDx||"-"],
                    ["Monitoring", wardAdmitPat.clerking.orders.admit.monitoring||"-"],
                    ["Diet", wardAdmitPat.clerking.orders.admit.diet||"-"],
                  ].map(([l,v])=>(
                    <div key={l}>
                      <div style={{ fontSize:9,color:"#9333ea",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:12,fontWeight:700,color:"#5b21b6" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {wardAdmitPat.clerking.orders.admit.isolation && <span style={{ background:"#fee2e2",color:"#dc2626",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>Isolation Required</span>}
                  {wardAdmitPat.clerking.orders.admit.oxygenNeeded && <span style={{ background:"#e0f2fe",color:"#0369a1",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>Oxygen Needed</span>}
                  {wardAdmitPat.clerking.orders.admit.ivAccess && <span style={{ background:"#fef3c7",color:"#b45309",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>IV Access Required</span>}
                  {wardAdmitPat.clerking.orders.admit.infectionControl!=="None" && <span style={{ background:"#fef2f2",color:"#dc2626",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>{wardAdmitPat.clerking.orders.admit.infectionControl}</span>}
                </div>
                {wardAdmitPat.clerking.orders.admit.nursingNeeds && <div style={{ fontSize:11,color:"#475569",marginTop:8 }}>Nursing: {wardAdmitPat.clerking.orders.admit.nursingNeeds}</div>}
                {wardAdmitPat.clerking.orders.admit.specialNeeds && <div style={{ fontSize:11,color:"#475569",marginTop:4 }}>Notes: {wardAdmitPat.clerking.orders.admit.specialNeeds}</div>}
              </div>
            )}
            <ErrBox msg={wardErr} />
            <Card>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <FL label="Ward *" ch={<select value={wardForm.ward} onChange={e=>setWardForm(p=>({...p,ward:e.target.value}))} style={SS}><option value="">Select ward...</option>{WARDS.map(w=><option key={w.id}>{w.name} ({w.beds-(occupancy[w.name]||0)} free)</option>)}</select>} />
                <FL label="Bed No. *" ch={<input value={wardForm.bed} onChange={e=>setWardForm(p=>({...p,bed:e.target.value}))} placeholder="e.g. 4A" style={IS()} />} />
                <FL label="Admitting Doctor *" ch={<input value={wardForm.admitDoctor} onChange={e=>setWardForm(p=>({...p,admitDoctor:e.target.value}))} style={IS()} />} />
                <FL label="Admitting Nurse" ch={<input value={wardForm.admitNurse} onChange={e=>setWardForm(p=>({...p,admitNurse:e.target.value}))} style={IS()} />} />
                <FL label="Diet Order" ch={<select value={wardForm.diet} onChange={e=>setWardForm(p=>({...p,diet:e.target.value}))} style={SS}>{DIET_OPTIONS.map(d=><option key={d}>{d}</option>)}</select>} />
                <FL label="Isolation" ch={<label style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 11px",border:"1.5px solid #e2e8f0",borderRadius:8,cursor:"pointer" }}><input type="checkbox" checked={wardForm.isolation} onChange={e=>setWardForm(p=>({...p,isolation:e.target.checked}))} /><span style={{ fontSize:13 }}>{wardForm.isolation?"Yes - Isolation":"No"}</span></label>} />
              </div>
              <FL label="Admission Reason / Diagnosis" ch={<textarea value={wardForm.admitReason} onChange={e=>setWardForm(p=>({...p,admitReason:e.target.value}))} rows={2} style={TA()} />} />
              <div style={{ display:"flex",gap:8,marginTop:10 }}>
                <button onClick={saveAdmit} style={{ ...BtnGreen,flex:1,padding:"11px" }}>Confirm Admission</button>
                <button onClick={()=>setWardAdmitPat(null)} style={{ ...BtnGhost,padding:"11px 16px" }}>Cancel</button>
              </div>
            </Card>
          </div>
        )}

        {/* -- ACTIVE PATIENT MANAGEMENT -- */}
        {wardActive && (
          <div>
            {/* Patient header */}
            <div style={{ background:"linear-gradient(90deg,#071828,#0f3460)",borderRadius:12,padding:"14px 20px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ display:"flex",gap:14,alignItems:"center" }}>
                <div style={{ width:46,height:46,borderRadius:"50%",flexShrink:0,background:`hsl(${avatarHue(wardActive.id||wardActive.queueNo)},50%,72%)`,color:`hsl(${avatarHue(wardActive.id||wardActive.queueNo)},40%,22%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800 }}>
                  {(wardActive.firstName||wardActive.name||"?")[0]}{(wardActive.lastName||"")[0]||""}
                </div>
                <div>
                  <div style={{ fontSize:16,fontWeight:800,color:"#fff" }}>{wardActive.firstName||wardActive.name} {wardActive.lastName||""}</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.55)",fontFamily:"monospace",marginTop:2 }}>
                    {wardActive.id||"-"}  {calcAge(wardActive.dateOfBirth)||"-"} yrs  {wardActive.gender||"-"}  {wardActive.clerking?.allergies ? `ALLERGY: ${wardActive.clerking.allergies}` : "NKDA"}
                  </div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.7)",marginTop:3 }}>
                    <span style={{ fontWeight:700 }}>{wardActive.admission?.ward}</span>  Bed {wardActive.admission?.bed}
                    {wardActive.admission?.isolation && <span style={{ marginLeft:8,background:"#dc2626",color:"#fff",borderRadius:4,padding:"1px 7px",fontSize:9,fontWeight:700 }}>ISOLATION</span>}
                    <span style={{ marginLeft:10,fontFamily:"monospace",color:"rgba(255,255,255,.45)" }}>{wardActive.admission?.admitNo}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12,color:"rgba(255,255,255,.55)" }}>Dx: {wardActive.clerking?.finalDx||wardActive.clerking?.provisionalDx||"-"}</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2 }}>Diet: {wardActive.admission?.diet||"-"}  Dr: {wardActive.admission?.admitDoctor||"-"}</div>
              </div>
            </div>

            {/* Sub-tab navigator */}
            <div style={{ display:"flex",gap:4,background:"#fff",borderRadius:12,padding:"5px",boxShadow:"0 1px 6px rgba(0,0,0,.07)",marginBottom:18 }}>
              {SUB_TABS.map(t=>{
                const isActive = wardView===t.key;
                const badge = t.key==="billing" ? ipBillItems.length
                            : t.key==="orders"  ? ipOrders.length
                            : t.key==="view"    ? (ipBillSnap ? (ipBillSnap.finalized ? "FINAL" : "INTERIM") : null)
                            : 0;
                const badgeBg = t.key==="view" && ipBillSnap
                  ? (ipBillSnap.finalized ? (isActive?"rgba(255,255,255,.25)":"#dcfce7") : (isActive?"rgba(255,255,255,.25)":"#fef3c7"))
                  : isActive?"rgba(255,255,255,.25)":"#dbeafe";
                const badgeCol = t.key==="view" && ipBillSnap
                  ? (ipBillSnap.finalized ? (isActive?"#fff":"#15803d") : (isActive?"#fff":"#b45309"))
                  : isActive?"#fff":"#1d4ed8";
                return (
                  <button key={t.key} onClick={()=>setWardView(t.key)}
                    style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:isActive?700:500,transition:"all .15s",background:isActive?"#0b1929":"transparent",color:isActive?"#fff":"#64748b" }}>
                    {emojiOf(t.icon)} {t.label}
                    {badge ? <span style={{ background:badgeBg,color:badgeCol,borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:800 }}>{badge}</span> : null}
                  </button>
                );
              })}
            </div>

            {/* -- SUB-VIEW: WARD INFO / DISCHARGE -- */}
            {wardView==="manage" && (
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                {/* Admission details */}
                <Card>
                  <Sec accent="#0e7490">Admission Details</Sec>
                  {[["Admission No.",wardActive.admission?.admitNo||"-"],["Ward",wardActive.admission?.ward||"-"],["Bed",wardActive.admission?.bed||"-"],["Admitted",wardActive.admission?.admittedAt?new Date(wardActive.admission.admittedAt).toLocaleString():"-"],["Admitting Doctor",wardActive.admission?.admitDoctor||"-"],["Admitting Nurse",wardActive.admission?.admitNurse||"-"],["Diet",wardActive.admission?.diet||"-"],["Admission Reason",wardActive.admission?.admitReason||"-"]].map(([l,v])=>(
                    <div key={l} style={{ display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f1f5f9",fontSize:12 }}>
                      <span style={{ color:C.slateL,fontWeight:600 }}>{l}</span>
                      <span style={{ fontWeight:700,maxWidth:"60%",textAlign:"right" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex",gap:8,marginTop:14 }}>
                    <button onClick={()=>printTreatmentSheet(wardActive)} style={{ ...BtnGhost,flex:1,padding:"9px",fontSize:12 }}>Print Treatment Sheet</button>
                    <button onClick={()=>printIpBill(wardActive, ipBillSnap||null)} style={{ ...BtnGhost,flex:1,padding:"9px",fontSize:12 }}>Print Bill</button>
                  </div>
                </Card>
                {/* Discharge form */}
                {!wardActive.admission?.discharged ? (
                  <Card>
                    <Sec accent="#dc2626">Discharge Patient</Sec>
                    <ErrBox msg={wardErr} />
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
                      <FL label="Discharging Doctor *" ch={<input value={dischargeForm.dischargeDoctor} onChange={e=>setDischargeForm(p=>({...p,dischargeDoctor:e.target.value}))} placeholder="Doctor name" style={IS()} />} />
                      <FL label="Discharge Type" ch={<select value={dischargeForm.dischargeType} onChange={e=>setDischargeForm(p=>({...p,dischargeType:e.target.value}))} style={SS}>{DISCHARGE_TYPES.map(d=><option key={d}>{d}</option>)}</select>} />
                      <FL label="Condition at DC" ch={<select value={dischargeForm.condition} onChange={e=>setDischargeForm(p=>({...p,condition:e.target.value}))} style={SS}>{CONDITION_AT_DC.map(d=><option key={d}>{d}</option>)}</select>} />
                      <FL label="Follow-up Date" ch={<input type="date" value={dischargeForm.followUp} onChange={e=>setDischargeForm(p=>({...p,followUp:e.target.value}))} style={IS()} />} />
                    </div>
                    <FL label="Discharge Notes" ch={<textarea value={dischargeForm.notes} onChange={e=>setDischargeForm(p=>({...p,notes:e.target.value}))} rows={3} style={TA()} placeholder="Discharge summary, follow-up instructions, medications to continue..." />} />
                    <button onClick={saveDischarge} style={{ ...BtnGreen,width:"100%",padding:"11px",marginTop:10 }}>Confirm Discharge</button>
                  </Card>
                ) : (
                  <Card>
                    <Sec accent="#059669">Discharge Summary</Sec>
                    {[["Discharged",wardActive.admission?.dischargedAt?new Date(wardActive.admission.dischargedAt).toLocaleString():"-"],["Discharging Doctor",wardActive.admission?.dischargeDoctor||"-"],["Discharge Type",wardActive.admission?.dischargeType||"-"],["Condition",wardActive.admission?.conditionAtDischarge||"-"],["Follow-up",wardActive.admission?.followUp||"-"],["Notes",wardActive.admission?.dischargeNotes||"-"]].map(([l,v])=>(
                      <div key={l} style={{ display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f1f5f9",fontSize:12 }}>
                        <span style={{ color:C.slateL,fontWeight:600 }}>{l}</span>
                        <span style={{ fontWeight:700,maxWidth:"60%",textAlign:"right" }}>{v}</span>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* -- SUB-VIEW: WARD ROUND ORDERS -- */}
            {wardView==="orders" && (
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start" }}>
                {/* New order form */}
                <Card>
                  <Sec accent="#7c3aed">New Ward Round Entry</Sec>
                  <ErrBox msg={ipOrderErr} />
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8 }}>
                    <FL label="Date" ch={<input type="date" value={ipOrderForm.date} onChange={e=>setIpOrderForm(p=>({...p,date:e.target.value}))} style={IS()} />} />
                    <FL label="Doctor *" ch={<input value={ipOrderForm.doctor} onChange={e=>setIpOrderForm(p=>({...p,doctor:e.target.value}))} placeholder="Doctor name" style={IS()} />} />
                  </div>
                  <FL label="Vitals (BP, Pulse, Temp, SpO2, RR)" ch={<input value={ipOrderForm.vitals} onChange={e=>setIpOrderForm(p=>({...p,vitals:e.target.value}))} placeholder="e.g. BP 130/80, P 82, T 37.2, SpO2 98%" style={IS()} />} />
                  <FL label="Fluid Balance (I/O)" ch={<input value={ipOrderForm.fluidBalance} onChange={e=>setIpOrderForm(p=>({...p,fluidBalance:e.target.value}))} placeholder="e.g. Intake 1200mL, Output 900mL" style={IS()} />} />

                  <div style={{ marginTop:12,marginBottom:4,fontSize:11,fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:.8 }}>Doctor's Orders</div>

                  <FL label="Medications (Drug / Dose / Route / Freq)" ch={<textarea value={ipOrderForm.medications} onChange={e=>setIpOrderForm(p=>({...p,medications:e.target.value}))} rows={3} style={TA()} placeholder="e.g. Amoxicillin 500mg PO TDS..." />} />
                  <FL label="IV Fluids" ch={<input value={ipOrderForm.ivFluids} onChange={e=>setIpOrderForm(p=>({...p,ivFluids:e.target.value}))} placeholder="e.g. 1L Normal Saline over 8h" style={IS()} />} />

                  <div style={{ marginTop:12,marginBottom:4,fontSize:11,fontWeight:700,color:"#0e7490",textTransform:"uppercase",letterSpacing:.8 }}>Request Forms</div>

                  <FL label="Lab Requests" ch={<textarea value={ipOrderForm.labs} onChange={e=>setIpOrderForm(p=>({...p,labs:e.target.value}))} rows={2} style={TA()} placeholder="e.g. FBC, RFT, Blood culture..." />} />
                  <FL label="Radiology Requests" ch={<textarea value={ipOrderForm.radiology} onChange={e=>setIpOrderForm(p=>({...p,radiology:e.target.value}))} rows={2} style={TA()} placeholder="e.g. Chest X-Ray PA, Abdominal USS..." />} />
                  <FL label="Pharmacy Requests" ch={<textarea value={ipOrderForm.pharmacy} onChange={e=>setIpOrderForm(p=>({...p,pharmacy:e.target.value}))} rows={2} style={TA()} placeholder="e.g. Ciprofloxacin 500mg tabs x14..." />} />

                  <div style={{ marginTop:12,marginBottom:4,fontSize:11,fontWeight:700,color:"#be185d",textTransform:"uppercase",letterSpacing:.8 }}>Nursing Instructions</div>

                  <FL label="Nursing Orders" ch={<textarea value={ipOrderForm.nursing} onChange={e=>setIpOrderForm(p=>({...p,nursing:e.target.value}))} rows={2} style={TA()} placeholder="e.g. 4-hourly obs, strict I&O, nil by mouth..." />} />
                  <FL label="Diet" ch={<select value={ipOrderForm.diet} onChange={e=>setIpOrderForm(p=>({...p,diet:e.target.value}))} style={SS}>{DIET_OPTIONS.map(d=><option key={d}>{d}</option>)}</select>} />
                  <FL label="Notes / Plan" ch={<textarea value={ipOrderForm.notes} onChange={e=>setIpOrderForm(p=>({...p,notes:e.target.value}))} rows={2} style={TA()} />} />

                  <button onClick={saveIpOrder} style={{ ...BtnGreen,width:"100%",padding:"11px",marginTop:10 }}>Save Ward Round Entry</button>
                </Card>

                {/* Previous orders */}
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:10 }}>Ward Round History ({ipOrders.length})</div>
                  {ipOrders.length===0
                    ? <EmptyState icon="📋" msg="No ward round entries yet." />
                    : [...ipOrders].reverse().map((o,i)=>(
                      <div key={o.id} style={{ background:"#fff",borderRadius:10,padding:"14px 16px",marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,.06)",border:"1.5px solid #e2e8f0" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                          <div style={{ fontWeight:700,fontSize:13,color:"#0b1929" }}>{o.date}</div>
                          <div style={{ fontSize:11,color:"#7c3aed",fontWeight:600 }}>Dr. {o.doctor}</div>
                        </div>
                        {o.vitals && <div style={{ fontSize:11,background:"#f8fafc",borderRadius:6,padding:"6px 10px",marginBottom:6,color:C.slate }}><b>Vitals:</b> {o.vitals}</div>}
                        {o.fluidBalance && <div style={{ fontSize:11,background:"#eff6ff",borderRadius:6,padding:"6px 10px",marginBottom:6,color:"#1d4ed8" }}><b>I/O:</b> {o.fluidBalance}</div>}
                        {o.medications && <div style={{ fontSize:11,marginBottom:4 }}><span style={{ fontWeight:700,color:"#7c3aed" }}>Medications:</span> {o.medications}</div>}
                        {o.ivFluids && <div style={{ fontSize:11,marginBottom:4 }}><span style={{ fontWeight:700,color:"#0369a1" }}>IV Fluids:</span> {o.ivFluids}</div>}
                        {o.labs && <div style={{ fontSize:11,marginBottom:4 }}><span style={{ fontWeight:700,color:"#0e7490" }}>Lab:</span> {o.labs}</div>}
                        {o.radiology && <div style={{ fontSize:11,marginBottom:4 }}><span style={{ fontWeight:700,color:"#7c3aed" }}>Radiology:</span> {o.radiology}</div>}
                        {o.pharmacy && <div style={{ fontSize:11,marginBottom:4 }}><span style={{ fontWeight:700,color:"#059669" }}>Pharmacy:</span> {o.pharmacy}</div>}
                        {o.nursing && <div style={{ fontSize:11,marginBottom:4 }}><span style={{ fontWeight:700,color:"#be185d" }}>Nursing:</span> {o.nursing}</div>}
                        {o.notes && <div style={{ fontSize:11,color:C.slate,fontStyle:"italic",marginTop:4 }}>{o.notes}</div>}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* -- SUB-VIEW: INPATIENT BILLING -- */}
            {wardView==="billing" && (
              <div style={{ display:"grid",gridTemplateColumns:"1fr 320px",gap:16,alignItems:"start" }}>
                <div>
                  {ipBillSnap?.finalized && (
                    <div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:10,padding:"12px 16px",marginBottom:14 }}>
                      <div style={{ fontWeight:700,color:"#dc2626",fontSize:13 }}>Bill Finalized - Charges Locked</div>
                      <div style={{ fontSize:12,color:"#b91c1c",marginTop:2 }}>This patient's bill has been finalized ({ipBillSnap.billNo}). To make amendments, contact the billing supervisor.</div>
                    </div>
                  )}
                  {/* Charge catalogue */}
                  {["accommodation","nursing","meals","procedure","consultation","lab","radiology","pharmacy"].map(cat=>{
                    const catItems = IP_CHARGES.filter(i=>i.cat===cat);
                    const labItems = cat==="lab" ? LAB_CATEGORIES.flatMap(c=>c.tests) : [];
                    const radItems = cat==="radiology" ? RAD_CATEGORIES.flatMap(c=>c.tests) : [];
                    const allItems = cat==="lab" ? labItems.map(t=>({id:"l_"+t.id,cat:"lab",name:t.name,price:t.price||0}))
                                   : cat==="radiology" ? radItems.map(t=>({id:"r_"+t.id,cat:"radiology",name:t.name,price:t.price||0}))
                                   : catItems;
                    if (cat==="pharmacy") return null;
                    return (
                      <Card key={cat} mb={10}>
                        <Sec accent={ipCatColor(cat)}>{cat.charAt(0).toUpperCase()+cat.slice(1)}</Sec>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                          {allItems.map(item=>{
                            const inBill = ipBillItems.find(i=>i.id===item.id);
                            const locked = !!ipBillSnap?.finalized;
                            return (
                              <button key={item.id} onClick={()=>!inBill&&!locked&&saveIpBillItem(item)}
                                style={{ padding:"8px 10px",borderRadius:8,cursor:inBill||locked?"default":"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,transition:"all .1s",
                                  border:inBill?"1.5px solid #22c55e":"1.5px solid #e2e8f0",background:inBill?"#f0fdf4":locked?"#fafafa":"#fff",opacity:locked&&!inBill?.id?0.6:1 }}>
                                <div style={{ minWidth:0 }}>
                                  <div style={{ fontSize:11,fontWeight:600,color:locked&&!inBill?"#94a3b8":"#0b1929",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.name}</div>
                                  {inBill && <div style={{ fontSize:9,color:"#059669",fontFamily:"monospace" }}>x{inBill.qty} added</div>}
                                </div>
                                <span style={{ fontSize:11,fontWeight:700,color:ipCatColor(cat),whiteSpace:"nowrap",flexShrink:0 }}>KES {item.price.toLocaleString()}</span>
                              </button>
                            );
                          })}
                        </div>
                      </Card>
                    );
                  })}
                  {/* Pharmacy */}
                  <Card mb={10}>
                    <Sec accent="#059669">Pharmacy / Medications</Sec>
                    {(wardActive.clerking?.orders?.rx?.drugs||[]).map(d=>{
                      const itemId="ph_"+d.id, inBill=ipBillItems.find(i=>i.id===itemId);
                      const price=getDrugPrice(d.name), locked=!!ipBillSnap?.finalized;
                      return (
                        <div key={d.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #f1f5f9" }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12,fontWeight:700,color:"#0b1929" }}>{d.name} <span style={{ fontWeight:400,fontSize:11,color:C.slateL }}>{d.dose} {d.route}</span></div>
                            <div style={{ fontSize:10,color:C.slateL }}>{d.freq} x {d.duration}</div>
                          </div>
                          {inBill ? <span style={{ fontSize:11,color:"#059669",fontWeight:700 }}>Added</span>
                            : locked ? null
                            : <button onClick={()=>saveIpBillItem({id:itemId,cat:"pharmacy",name:d.name+" "+d.dose,price})} style={{ padding:"5px 12px",border:"none",borderRadius:7,background:"#059669",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit" }}>+ Add</button>}
                          <span style={{ fontSize:11,fontWeight:700,color:"#059669",fontFamily:"monospace",minWidth:80,textAlign:"right" }}>KES {price.toLocaleString()}</span>
                        </div>
                      );
                    })}
                    {!ipBillSnap?.finalized && <button onClick={()=>saveIpBillItem({id:"ph_misc_"+Date.now(),cat:"pharmacy",name:"Pharmacy / Medications",price:0})} style={{ marginTop:10,padding:"9px",border:"1.5px dashed #86efac",borderRadius:8,background:"#f0fdf4",color:"#15803d",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,width:"100%" }}>+ Add Misc Pharmacy Item</button>}
                  </Card>
                </div>

                {/* Right: running bill + generate */}
                <div style={{ position:"sticky",top:70 }}>
                  <Card>
                    <div style={{ background:"linear-gradient(135deg,#059669,#047857)",borderRadius:10,padding:"12px 14px",marginBottom:14,color:"#fff" }}>
                      <div style={{ fontSize:10,fontFamily:"monospace",letterSpacing:1.5,textTransform:"uppercase",opacity:.7,marginBottom:4 }}>Running Charges</div>
                      <div style={{ fontSize:22,fontWeight:900,fontFamily:"monospace" }}>KES {ipTotal.toLocaleString()}</div>
                      <div style={{ fontSize:11,opacity:.6,marginTop:2 }}>{ipBillItems.length} item(s)  {wardActive.admission?.admitNo}</div>
                    </div>
                    <ErrBox msg={ipBillErr} />
                    {ipBillItems.length===0
                      ? <div style={{ fontSize:12,color:C.slateL,textAlign:"center",padding:"20px 0" }}>No charges added yet</div>
                      : ipBillItems.map(item=>(
                        <div key={item.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #f1f5f9" }}>
                          <span style={{ background:ipCatBg(item.cat),color:ipCatColor(item.cat),borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:700,flexShrink:0 }}>{item.cat}</span>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.name}</div>
                            {(()=>{ const d=item.addedAt||new Date().toISOString(); return <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",marginTop:1 }}>{new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>; })()}
                            {!ipBillSnap?.finalized && <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
                              <button onClick={()=>updateIpQty(item.id,-1)} style={{ width:18,height:18,borderRadius:3,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:11,lineHeight:1 }}>-</button>
                              <span style={{ fontSize:11,fontWeight:700,minWidth:14,textAlign:"center" }}>{item.qty}</span>
                              <button onClick={()=>updateIpQty(item.id,1)} style={{ width:18,height:18,borderRadius:3,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:11,lineHeight:1 }}>+</button>
                            </div>}
                          </div>
                          <div style={{ textAlign:"right",flexShrink:0 }}>
                            <div style={{ fontSize:11,fontWeight:700,color:"#059669",fontFamily:"monospace" }}>KES {(item.price*item.qty).toLocaleString()}</div>
                            {!ipBillSnap?.finalized && <button onClick={()=>removeIpBillItem(item.id)} style={{ fontSize:10,color:"#dc2626",background:"none",border:"none",cursor:"pointer",padding:0 }}>Remove</button>}
                          </div>
                        </div>
                      ))
                    }

                    {ipBillItems.length>0 && !ipBillSnap?.finalized && (
                      <div style={{ marginTop:14,borderTop:"1px solid #f1f5f9",paddingTop:12 }}>
                        {ipBillErr && <div style={{ background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:7,padding:"8px 12px",fontSize:12,color:"#dc2626",marginBottom:10 }}>{ipBillErr}</div>}
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                          <span style={{ fontSize:12,color:C.slate }}>Discount (KES)</span>
                          <input type="number" value={ipBillDisc} min="0" onChange={e=>setIpBillDisc(e.target.value)}
                            style={{ width:90,padding:"5px 8px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:12,fontFamily:"monospace",textAlign:"right" }} />
                        </div>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800,marginBottom:10 }}>
                          <span>Net Total</span>
                          <span style={{ color:"#059669",fontFamily:"monospace" }}>KES {Math.max(0,ipTotal-(Number(ipBillDisc)||0)).toLocaleString()}</span>
                        </div>
                        {/* Payment method */}
                        <div style={{ marginBottom:8 }}>
                          <label style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:4 }}>Payment Method</label>
                          <select value={ipPayMethod} onChange={e=>setIpPayMethod(e.target.value)} style={SS}>
                            {["Cash","M-Pesa","POS / Card","Bank Transfer","NHIF","SHA / Insurance","Corporate Account","Cheque"].map(m=><option key={m}>{m}</option>)}
                          </select>
                        </div>
                        {/* Billing officer */}
                        <div style={{ marginBottom:10,background:"#f8fafc",borderRadius:8,padding:"8px 10px",border:"1.5px solid #e2e8f0" }}>
                          <label style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:4 }}>Billing Officer / Cashier *</label>
                          <input value={ipBilledBy} onChange={e=>setIpBilledBy(e.target.value)} placeholder="Full name of officer raising this bill"
                            style={{ ...IS(),width:"100%",boxSizing:"border-box" }} />
                        </div>
                        <button onClick={generateIpBill} style={{ ...BtnGreen,width:"100%",padding:"11px",fontSize:13,marginBottom:8 }}>Generate Interim Bill</button>
                      </div>
                    )}
                    {ipBillSnap && !ipBillSnap.finalized && (
                      <button onClick={()=>setWardView("view")} style={{ ...BtnGhost,width:"100%",padding:"9px",fontSize:12,marginTop:8 }}>View Interim Bill ({ipBillSnap.billNo})</button>
                    )}
                    {ipBillSnap?.finalized && (
                      <button onClick={()=>setWardView("view")} style={{ ...BtnGhost,width:"100%",padding:"9px",fontSize:12,marginTop:8,color:"#059669",borderColor:"#059669" }}>View Final Bill ({ipBillSnap.billNo})</button>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* -- SUB-VIEW: BILL VIEW (Interim / Final) -- */}
            {wardView==="view" && (
              <div style={{ maxWidth:860 }}>
                {!ipBillSnap ? (
                  <div style={{ background:"#fff",borderRadius:12,padding:"40px",textAlign:"center",boxShadow:"0 1px 8px rgba(0,0,0,.07)" }}>
                    <div style={{ fontSize:40,marginBottom:12 }}>🧾</div>
                    <div style={{ fontSize:15,fontWeight:700,color:"#0b1929",marginBottom:8 }}>No Bill Generated Yet</div>
                    <div style={{ fontSize:13,color:C.slateL,marginBottom:20 }}>Add charges in the "Add Charges" tab, then click "Generate Interim Bill" to create a bill snapshot.</div>
                    <button onClick={()=>setWardView("billing")} style={{ ...BtnGreen,padding:"10px 24px" }}>Go to Add Charges</button>
                  </div>
                ) : (
                  <div>
                    {/* Bill header */}
                    <div style={{ background:ipBillSnap.finalized?"linear-gradient(135deg,#059669,#047857)":"linear-gradient(135deg,#d97706,#b45309)",borderRadius:14,padding:"20px 24px",marginBottom:20,color:"#fff" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                        <div>
                          <div style={{ fontSize:10,fontFamily:"monospace",letterSpacing:2,textTransform:"uppercase",opacity:.7,marginBottom:6 }}>
                            {ipBillSnap.finalized ? (CASH_METHODS.includes(ipBillSnap.payMethod||"") ? "Receipt" : "Final Invoice") : "Interim Bill"}
                          </div>
                          <div style={{ fontSize:28,fontWeight:900,fontFamily:"monospace",letterSpacing:1 }}>{ipBillSnap.billNo}</div>
                          {ipBillSnap.receiptNo && (
                            <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:4 }}>
                              <span style={{ fontSize:10,opacity:.6,fontFamily:"monospace",textTransform:"uppercase" }}>Receipt</span>
                              <span style={{ fontSize:16,fontWeight:800,fontFamily:"monospace" }}>{ipBillSnap.receiptNo}</span>
                            </div>
                          )}
                          {ipBillSnap.invoiceNo && !CASH_METHODS.includes(ipBillSnap.payMethod||"") && (
                            <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:2 }}>
                              <span style={{ fontSize:10,opacity:.6,fontFamily:"monospace",textTransform:"uppercase" }}>Invoice</span>
                              <span style={{ fontSize:14,fontWeight:700,fontFamily:"monospace" }}>{ipBillSnap.invoiceNo}</span>
                            </div>
                          )}
                          <div style={{ fontSize:12,opacity:.7,marginTop:6 }}>
                            {wardActive.firstName||wardActive.name} {wardActive.lastName||""}  |  {wardActive.admission?.ward}  |  Bed {wardActive.admission?.bed}
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:30,fontWeight:900,fontFamily:"monospace",marginBottom:6 }}>KES {ipBillSnap.total.toLocaleString()}</div>
                          {ipBillSnap.discount>0 && <div style={{ fontSize:11,opacity:.7 }}>incl. KES {ipBillSnap.discount.toLocaleString()} discount</div>}
                          <div style={{ fontSize:11,opacity:.65,marginTop:6 }}>
                            Raised by: <strong>{ipBillSnap.billedBy||"-"}</strong>
                          </div>
                          {ipBillSnap.finalized && <div style={{ fontSize:11,opacity:.8,fontWeight:700,marginTop:2 }}>
                            Finalized by: {ipBillSnap.finalizedBy||ipBillSnap.billedBy||"-"}
                          </div>}
                          <div style={{ fontSize:11,opacity:.65,marginTop:2 }}>
                            <span style={{ opacity:.7,marginRight:4 }}>Bill Date:</span>
                            <strong>{new Date(ipBillSnap.generatedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</strong>
                          </div>
                          {ipBillSnap.finalized && <div style={{ fontSize:11,opacity:.75,marginTop:2 }}>
                            <span style={{ opacity:.7,marginRight:4 }}>Finalized:</span>
                            <strong>{new Date(ipBillSnap.finalizedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</strong>
                          </div>}
                          {ipBillSnap.payMethod && (
                            <div style={{ marginTop:6,background:"rgba(255,255,255,.2)",borderRadius:6,padding:"3px 10px",display:"inline-block",fontSize:11,fontWeight:700 }}>
                              {ipBillSnap.payMethod}
                            </div>
                          )}
                        </div>
                      </div>
                      {!ipBillSnap.finalized && (
                        <div style={{ marginTop:14,background:"rgba(255,255,255,.15)",borderRadius:8,padding:"8px 12px",fontSize:12 }}>
                          This is an <strong>interim bill</strong>. Charges may still be amended. Finalize to issue receipt or invoice.
                        </div>
                      )}
                    </div>

                    {/* Patient info strip */}
                    <div style={{ background:"#fff",borderRadius:12,padding:"14px 18px",marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,.06)",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
                      {[
                        ["Patient",`${wardActive.firstName||wardActive.name} ${wardActive.lastName||""}`],
                        ["Patient ID", wardActive.id||"-"],
                        ["Admission No.", wardActive.admission?.admitNo||"-"],
                        ["Category", wardActive.category||"-"],
                        ["Admitted", wardActive.admission?.admittedAt?new Date(wardActive.admission.admittedAt).toLocaleDateString("en-GB"):"-"],
                        ["Doctor", wardActive.admission?.admitDoctor||"-"],
                        ["Diagnosis", wardActive.clerking?.finalDx||wardActive.clerking?.provisionalDx||"-"],
                        ["Insurance/Scheme", wardActive.insuranceProvider||wardActive.billing?.paymentMethod||"-"],
                      ].map(([l,v])=>(
                        <div key={l}>
                          <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,marginBottom:2 }}>{l}</div>
                          <div style={{ fontSize:12,fontWeight:700,color:"#1e293b" }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Charges breakdown by category */}
                    <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,.07)",marginBottom:16 }}>
                      <div style={{ background:"#0b1929",padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,.8)",letterSpacing:.5 }}>Charges Breakdown</div>
                        <div style={{ fontSize:11,color:"rgba(255,255,255,.5)",fontFamily:"monospace" }}>{ipBillSnap.items.length} line item(s)</div>
                      </div>
                      {(()=>{
                        const cats = {};
                        ipBillSnap.items.forEach(i=>{ const c=i.cat||"other"; if(!cats[c]) cats[c]=[]; cats[c].push(i); });
                        return Object.entries(cats).map(([cat,catItems])=>{
                          const catTotal = catItems.reduce((s,i)=>s+i.price*i.qty,0);
                          return (
                            <div key={cat}>
                              <div style={{ background:ipCatBg(cat),padding:"8px 18px",display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e2e8f0" }}>
                                <span style={{ fontSize:10,fontWeight:800,color:ipCatColor(cat),textTransform:"uppercase",letterSpacing:.8 }}>{cat}</span>
                                <span style={{ fontSize:11,fontWeight:700,color:ipCatColor(cat),fontFamily:"monospace" }}>KES {catTotal.toLocaleString()}</span>
                              </div>
                              {catItems.map((item,i)=>(
                                <div key={item.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid #f8fafc",background:i%2===0?"#fff":"#fafafa" }}>
                                  <div style={{ flex:1 }}>
                                    <div style={{ fontSize:13,fontWeight:600,color:"#1e293b" }}>{item.name}</div>
                                    <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace" }}>Qty: {item.qty}  x  KES {item.price.toLocaleString()}</div>
                                    {(()=>{ const d=item.addedAt||ipBillSnap?.generatedAt||new Date().toISOString(); return <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",marginTop:1 }}>Billed: {new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>; })()}
                                  </div>
                                  <div style={{ fontSize:14,fontWeight:800,color:"#1e293b",fontFamily:"monospace" }}>KES {(item.price*item.qty).toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          );
                        });
                      })()}

                      {/* Totals footer */}
                      <div style={{ background:"#f8fafc",padding:"12px 18px",borderTop:"2px solid #e2e8f0" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:C.slate,marginBottom:4 }}>
                          <span>Subtotal</span><span style={{ fontFamily:"monospace",fontWeight:600 }}>KES {ipBillSnap.subtotal.toLocaleString()}</span>
                        </div>
                        {ipBillSnap.discount>0 && <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"#dc2626",marginBottom:4 }}>
                          <span>Discount</span><span style={{ fontFamily:"monospace",fontWeight:600 }}>- KES {ipBillSnap.discount.toLocaleString()}</span>
                        </div>}
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900,paddingTop:8,borderTop:"2px solid #e2e8f0" }}>
                          <span>Total Due</span>
                          <span style={{ color:ipBillSnap.finalized?"#059669":"#d97706",fontFamily:"monospace" }}>KES {ipBillSnap.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ background:"#fff",borderRadius:12,padding:"18px",boxShadow:"0 1px 8px rgba(0,0,0,.07)",marginTop:4 }}>
                      {ipBillErr2 && <div style={{ background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:7,padding:"8px 12px",fontSize:12,color:"#dc2626",marginBottom:10 }}>{ipBillErr2}</div>}
                      <div style={{ display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap",alignItems:"flex-end" }}>
                        <div style={{ display:"flex",gap:10 }}>
                          <button onClick={()=>printIpBill(wardActive, ipBillSnap)} style={{ ...BtnGhost,padding:"10px 20px" }}>
                            Print {ipBillSnap.finalized?(CASH_METHODS.includes(ipBillSnap.payMethod||"")?"Receipt":"Invoice"):"Interim Bill"}
                          </button>
                          {!ipBillSnap.finalized && <button onClick={()=>setWardView("billing")} style={{ ...BtnGhost,padding:"10px 20px" }}>Amend Charges</button>}
                        </div>
                        {!ipBillSnap.finalized ? (
                          <div style={{ display:"flex",gap:10,alignItems:"flex-end",flex:1,minWidth:300,flexWrap:"wrap" }}>
                            <div style={{ minWidth:150,flex:1 }}>
                              <label style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:4 }}>Payment Method</label>
                              <select value={ipPayMethod} onChange={e=>setIpPayMethod(e.target.value)} style={SS}>
                                {["Cash","M-Pesa","POS / Card","Bank Transfer","NHIF","SHA / Insurance","Corporate Account","Cheque"].map(m=><option key={m}>{m}</option>)}
                              </select>
                            </div>
                            <div style={{ minWidth:150,flex:1 }}>
                              <label style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:4 }}>Billing Officer *</label>
                              <input value={ipBilledBy} onChange={e=>setIpBilledBy(e.target.value)} placeholder="Officer / cashier name" style={IS()} />
                            </div>
                            <button onClick={finalizeIpBill}
                              style={{ padding:"10px 22px",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:"#fff",background:"linear-gradient(135deg,#059669,#047857)",boxShadow:"0 4px 14px rgba(0,0,0,.2)",whiteSpace:"nowrap",alignSelf:"flex-end" }}>
                              {CASH_METHODS.includes(ipPayMethod)?"Collect Payment & Receipt":"Raise Final Invoice"}
                            </button>
                          </div>
                        ) : (
                          <div style={{ background:"#f0fdf4",border:"2px solid #86efac",borderRadius:10,padding:"10px 16px",fontSize:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center" }}>
                            <span style={{ fontWeight:800,color:"#15803d",fontSize:13 }}>{CASH_METHODS.includes(ipBillSnap.payMethod||"")?"Payment Received":"Invoice Raised"}</span>
                            <span style={{ color:"#475569" }}>{ipBillSnap.payMethod}</span>
                            {ipBillSnap.receiptNo && <span style={{ fontFamily:"monospace",fontWeight:700,color:"#15803d" }}>Receipt: {ipBillSnap.receiptNo}</span>}
                            {ipBillSnap.invoiceNo && !CASH_METHODS.includes(ipBillSnap.payMethod||"") && <span style={{ fontFamily:"monospace",fontWeight:700,color:"#1d4ed8" }}>Invoice: {ipBillSnap.invoiceNo}</span>}
                            <span style={{ color:C.slateL,fontSize:11 }}>by {ipBillSnap.finalizedBy||ipBillSnap.billedBy||"-"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -- SUB-VIEW: TREATMENT SHEET -- */}
            {wardView==="sheet" && (
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>Treatment Sheet ({ipOrders.length} entries)</div>
                  <button onClick={()=>printTreatmentSheet(wardActive)} style={{ ...BtnGhost,padding:"8px 16px",fontSize:12 }}>Print Treatment Sheet</button>
                </div>
                {ipOrders.length===0
                  ? <EmptyState icon="📄" msg="No ward round entries. Add them from the Ward Round tab." />
                  : (
                    <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,.07)" }}>
                      <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ background:"#0b1929" }}>
                            {["Date","Vitals / I/O","Medications","IV Fluids","Lab Requests","Radiology","Pharmacy","Nursing Orders","Doctor"].map(h=>(
                              <th key={h} style={{ padding:"10px 10px",textAlign:"left",fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",fontFamily:"monospace",letterSpacing:.8,borderRight:"1px solid rgba(255,255,255,.1)",whiteSpace:"nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ipOrders.map((o,i)=>(
                            <tr key={o.id} style={{ background:i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #e2e8f0",verticalAlign:"top" }}>
                              <td style={{ padding:"10px",fontSize:12,fontWeight:700,color:"#0b1929",whiteSpace:"nowrap",borderRight:"1px solid #e2e8f0" }}>{o.date}</td>
                              <td style={{ padding:"10px",fontSize:11,color:C.slate,borderRight:"1px solid #e2e8f0",minWidth:120 }}>
                                {o.vitals && <div style={{ marginBottom:4 }}>{o.vitals}</div>}
                                {o.fluidBalance && <div style={{ color:"#1d4ed8",fontSize:10 }}>{o.fluidBalance}</div>}
                              </td>
                              <td style={{ padding:"10px",fontSize:11,color:"#7c3aed",borderRight:"1px solid #e2e8f0",minWidth:140 }}>{o.medications||"-"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:"#0369a1",borderRight:"1px solid #e2e8f0",minWidth:120 }}>{o.ivFluids||"-"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:"#0e7490",borderRight:"1px solid #e2e8f0",minWidth:120 }}>{o.labs||"-"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:"#7c3aed",borderRight:"1px solid #e2e8f0",minWidth:110 }}>{o.radiology||"-"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:"#059669",borderRight:"1px solid #e2e8f0",minWidth:110 }}>{o.pharmacy||"-"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:"#be185d",borderRight:"1px solid #e2e8f0",minWidth:120 }}>{o.nursing||"-"}</td>
                              <td style={{ padding:"10px",fontSize:11,fontWeight:700,color:"#475569",minWidth:100 }}>Dr. {o.doctor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            )}

          </div>
        )}

        </div>
      </Layout>
    );


  // ==========================================================================
  // PAGE: REPORTS & ANALYTICS
  // ==========================================================================

}
