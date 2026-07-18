import { useState, useEffect, useMemo, useRef } from "react";
import { ClipboardList } from "lucide-react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS, TITLES, EDUCATION_LEVELS, EMPLOYMENT_STATUSES, COPAY_CATEGORIES, COUNTIES } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function RegisterPage(props) {
  const {
    page, setPage, finCtx, setFinCtx, patients, setPatients, active, setActive,
    search, setSearch, fStatus, setFStatus, delId, setDelId,
    toast, setToast, showToast, closeToast, ToastModal,
    qFirstName, setQFirstName, qSurname, setQSurname, qPhone, setQPhone,
    qErr, setQErr, qModal, setQModal,
    kioskStep, setKioskStep, kioskService, setKioskService,
    kioskPayment, setKioskPayment, kioskExSearch, setKioskExSearch, kioskExPick, setKioskExPick,
    trForm, setTrForm, trErr, setTrErr,
    regTab, setRegTab, regForm, setRegForm, regErr, setRegErr, regSaving,
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


    const waiting = patients.filter(p=>p.status==="Triaged");
    return (
      <Layout page={page} setPage={p=>{setActive(null);setPage(p);}} patients={patients} overlay={ToastModal}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <TopBar title="Patient Registration"
          subtitle={active ? `${active.queueNo} . ${active.name||""}` : `${waiting.length} patient(s) awaiting registration`}
          action={<button onClick={()=>{setActive(null);setPage("queue");}} style={BtnGhost}>Back Queue</button>} />
        <div style={{ padding:"20px 26px",maxWidth:840 }}>
          {!active ? (
            <div>
              {/* ── Manual Patient Search ───────────────────── */}
              <div style={{ marginBottom:18,background:"#fff",borderRadius:12,padding:"15px 18px",boxShadow:"0 2px 12px rgba(0,0,0,.07)",border:"1.5px solid #bae6fd" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <span style={{ fontSize:13,fontWeight:800,color:"#b45309" }}>🔍 Manual Patient Search</span>
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
                            <div key={p.queueNo} onClick={()=>{ goRegister(p); setManualSearch(""); }}
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
                                <button style={{ padding:"5px 12px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#b45309" }}>Register →</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>;
                })()}
              </div>
              <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:12 }}>Patients Awaiting Registration</div>
              {waiting.length===0
                ? <EmptyState icon={ClipboardList} msg="No patients currently awaiting registration." />
                : waiting.map(p=>{
                  const tl = TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                  return (
                    <div key={p.queueNo} onClick={()=>goRegister(p)}
                      style={{ background:"#fff",borderRadius:11,padding:"14px 18px",marginBottom:10,
                        boxShadow:"0 1px 6px rgba(0,0,0,.07)",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                        border:"1.5px solid #e2e8f0",transition:"all .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#f59e0b"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",background:"#fff9c4",color:"#b45309",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:14,fontWeight:900 }}>{p.queueNo}</div>
                        <div>
                          <div style={{ fontWeight:700,fontSize:14,color:"#0b1929" }}>{p.name}</div>
                          <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace" }}>{p.phone} . Triaged {p.triage?.triageTime}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        {tl && <Badge label={`L${p.triage.level} ${tl.label}`} color={tl.tc} bg={tl.bg} sm />}
                        <button style={{ ...BtnPrimary, padding:"8px 18px",fontSize:12,background:"#b45309" }}>📝 Register Now</button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <>
              <PatientBanner p={active} />
              <FlowBar status={active.status} />
              {/* Triage vitals strip */}
              {active.triage && (
                <div style={{ background:"linear-gradient(90deg,#0b1929,#0d2744)",borderRadius:10,padding:"11px 16px",marginBottom:16,display:"flex",gap:20,flexWrap:"wrap" }}>
                  {[["BP",active.triage.bp+" mmHg"],["Pulse",active.triage.pulse+" bpm"],["Temp",active.triage.temp+" degC"],["SpO2",active.triage.spo2+"%"],["Wt",active.triage.weight?(active.triage.weight+" kg"):"—"],["BMI",(()=>{const w=parseFloat(active.triage.weight),h=parseFloat(active.triage.height);return (w&&h)?(w/((h/100)**2)).toFixed(1):"—";})()],["Complaint",active.triage.chiefComplaint]].map(([l,v])=>(
                    <div key={l}><div style={{ fontSize:9,color:"rgba(255,255,255,.35)",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1 }}>{l}</div>
                    <div style={{ fontSize:12,fontWeight:700,color:"#e0f7fa",maxWidth:l==="Complaint"?280:100 }}>{v}</div></div>
                  ))}
                </div>
              )}
              <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,.07)",marginBottom:18 }}>
                <div style={{ display:"flex" }}>
                  {REG_TABS.map((t,i)=>(
                    <button key={t} onClick={()=>setRegTab(i)}
                      style={{ flex:1,padding:"12px 6px",border:"none",fontFamily:"inherit",cursor:"pointer",textAlign:"center",fontSize:11,
                        background:regTab===i?"#f0f9ff":"#fff",fontWeight:regTab===i?700:400,
                        color:regTab===i?"#0369a1":C.slateL,
                        borderBottom:regTab===i?"3px solid #0369a1":"3px solid transparent" }}>{t}
                    </button>
                  ))}
                </div>
              </div>
              <ErrBox msg={regErr} />
              <Card>
                {regTab===0 && (
                  <div>
                    <Sec accent="#0369a1">Personal Information</Sec>
                    <div style={{ display:"grid",gridTemplateColumns:"120px 1fr 1fr 1fr",gap:12,marginBottom:16 }}>
                      <FL label="Title"           ch={<select value={regForm.title||"Mr."} onChange={rf("title")} style={SS}>{TITLES.map(t=><option key={t}>{t}</option>)}</select>} />
                      <FL label="First Name *"    ch={<input value={regForm.firstName||""}  onChange={rf("firstName")}  style={IS(!regForm.firstName)} />} />
                      <FL label="Middle Name"     ch={<input value={regForm.middleName||""} onChange={rf("middleName")} style={IS()} />} />
                      <FL label="Last Name *"     ch={<input value={regForm.lastName||""}   onChange={rf("lastName")}   style={IS(!regForm.lastName)} />} />
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16 }}>
                      <FL label="Date of Birth *" ch={<input type="date" value={regForm.dateOfBirth||""} onChange={rf("dateOfBirth")} style={IS(!regForm.dateOfBirth)} />} />
                      <FL label="Gender"          ch={<select value={regForm.gender||"Male"} onChange={rf("gender")} style={SS}>{GENDERS.map(g=><option key={g}>{g}</option>)}</select>} />
                      <FL label="Blood Group"     ch={<select value={regForm.bloodGroup||"Unknown"} onChange={rf("bloodGroup")} style={SS}>{BLOOD_GROUPS.map(b=><option key={b}>{b}</option>)}</select>} />
                      <FL label="National ID / Passport" ch={<input value={regForm.idCardNo||""} onChange={rf("idCardNo")} placeholder="ID or Passport No." style={IS()} />} />
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
                      <FL label="KRA PIN (Tax ID)" ch={<input value={regForm.kraPin||""} onChange={rf("kraPin")} placeholder="Tax registration No." style={IS()} />} />
                      <FL label="Occupation"       ch={<input value={regForm.occupation||""} onChange={rf("occupation")} style={IS()} />} />
                    </div>
                    <Sec accent="#0369a1">Contact & Address Details</Sec>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16 }}>
                      <FL label="Primary Phone *"  ch={<input value={regForm.phone||""}    onChange={rf("phone")}    style={IS(!regForm.phone)} />} />
                      <FL label="Alt. Phone"       ch={<input value={regForm.altPhone||""} onChange={rf("altPhone")} style={IS()} />} />
                      <FL label="Email Address"    ch={<input type="email" value={regForm.email||""} onChange={rf("email")} style={IS()} />} />
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12 }}>
                      <FL label="Street Address"   ch={<input value={regForm.address||""} onChange={rf("address")} placeholder="Apt / House No / Street" style={IS()} />} />
                      <FL label="Estate / Sub-County" ch={<input value={regForm.estate||""} onChange={rf("estate")} placeholder="e.g. Lavington" style={IS()} />} />
                      <FL label="City / Town"      ch={<input value={regForm.city||""}  onChange={rf("city")} style={IS()} />} />
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:12 }}>
                      <FL label="County"           ch={<select value={regForm.county||"Nairobi"} onChange={rf("county")} style={SS}>{COUNTIES.map(c=><option key={c}>{c}</option>)}</select>} />
                      <FL label="State / Region"   ch={<input value={regForm.state||""} onChange={rf("state")} style={IS()} />} />
                      <FL label="Postal Box"       ch={<input value={regForm.postalBox||""} onChange={rf("postalBox")} placeholder="P.O. Box" style={IS()} />} />
                      <FL label="Postal Code"      ch={<input value={regForm.postalCode||""} onChange={rf("postalCode")} placeholder="Code" style={IS()} />} />
                    </div>
                    <FL label="Country" ch={<input value={regForm.country||"Kenya"} onChange={rf("country")} style={{ ...IS(),maxWidth:220 }} />} />
                  </div>
                )}
                {regTab===1 && (
                  <div>
                    <Sec accent="#7c3aed">Socio-demographic Data (WHO Standard)</Sec>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16 }}>
                      <FL label="Marital Status"   ch={<select value={regForm.maritalStatus||"Single"}   onChange={rf("maritalStatus")}   style={SS}>{MARITAL.map(m=><option key={m}>{m}</option>)}</select>} />
                      <FL label="Nationality"      ch={<select value={regForm.nationality||"Kenyan"}     onChange={rf("nationality")}     style={SS}>{NATIONALITIES.map(n=><option key={n}>{n}</option>)}</select>} />
                      <FL label="Primary Language" ch={<select value={regForm.primaryLanguage||"English"} onChange={rf("primaryLanguage")} style={SS}>{LANGUAGES.map(l=><option key={l}>{l}</option>)}</select>} />
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
                      <FL label="Religion"         ch={<select value={regForm.religion||"Christianity"}  onChange={rf("religion")}        style={SS}>{RELIGIONS.map(r=><option key={r}>{r}</option>)}</select>} />
                      <FL label="Education Level"  ch={<select value={regForm.educationalLevel||"None"} onChange={rf("educationalLevel")} style={SS}>{EDUCATION_LEVELS.map(e=><option key={e}>{e}</option>)}</select>} />
                      <FL label="Employment Status" ch={<select value={regForm.employmentStatus||"Employed"} onChange={rf("employmentStatus")} style={SS}>{EMPLOYMENT_STATUSES.map(em=><option key={em}>{em}</option>)}</select>} />
                    </div>
                  </div>
                )}
                {regTab===2 && (
                  <div>
                    <Sec accent="#dc2626">Next of Kin (NOK)</Sec>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <FL label="NOK Full Name *" ch={<input value={regForm.nokName||""}  onChange={rf("nokName")}  style={IS(!regForm.nokName)} />} />
                      <FL label="Relationship"    ch={<select value={regForm.nokRelationship||"Spouse"} onChange={rf("nokRelationship")} style={SS}>{RELATIONSHIPS.map(r=><option key={r}>{r}</option>)}</select>} />
                      <FL label="NOK Phone *"     ch={<input value={regForm.nokPhone||""} onChange={rf("nokPhone")} style={IS(!regForm.nokPhone)} />} />
                      <FL label="NOK ID / Passport" ch={<input value={regForm.nokIdCardNo||""} onChange={rf("nokIdCardNo")} placeholder="National ID" style={IS()} />} />
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
                      <FL label="NOK Email Address" ch={<input type="email" value={regForm.nokEmail||""} onChange={rf("nokEmail")} placeholder="Email Address" style={IS()} />} />
                      <FL label="NOK Residential Address" ch={<input value={regForm.nokAddress||""} onChange={rf("nokAddress")} placeholder="Residential Address" style={IS()} />} />
                    </div>
                    <label style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f0f9ff",borderRadius:9,border:"1px solid #bae6fd",marginBottom:16,cursor:"pointer" }}>
                      <input type="checkbox" checked={regForm.ecSameAsNok}
                        onChange={e=>setRegForm(p=>({...p,ecSameAsNok:e.target.checked,ecName:e.target.checked?p.nokName:p.ecName,ecRelationship:e.target.checked?p.nokRelationship:p.ecRelationship,ecPhone:e.target.checked?p.nokPhone:p.ecPhone}))}
                        style={{ width:16,height:16 }} />
                      <span style={{ fontSize:13,color:"#0369a1",fontWeight:600 }}>Emergency contact is same as Next of Kin</span>
                    </label>
                    {!regForm.ecSameAsNok && (
                      <>
                        <Sec accent="#e65100">Emergency Contact</Sec>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                          <FL label="EC Full Name *" ch={<input value={regForm.ecName||""}  onChange={rf("ecName")}  style={IS(!regForm.ecName)} />} />
                          <FL label="Relationship"   ch={<select value={regForm.ecRelationship||"Spouse"} onChange={rf("ecRelationship")} style={SS}>{RELATIONSHIPS.map(r=><option key={r}>{r}</option>)}</select>} />
                          <FL label="EC Phone *"     ch={<input value={regForm.ecPhone||""} onChange={rf("ecPhone")} style={IS(!regForm.ecPhone)} />} />
                        </div>
                      </>
                    )}
                  </div>
                )}
                {regTab===3 && (
                  <div>
                    <Sec accent="#059669">Patient Category</Sec>
                    <div style={{ display:"flex",gap:14,marginBottom:20 }}>
                      {["Cash","Corporate","Insurance"].map(cat=>(
                        <button key={cat} onClick={()=>setRegForm(p=>({...p,category:cat}))}
                          style={{ flex:1,padding:"15px 10px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",textAlign:"center",
                            border:regForm.category===cat?"2px solid #059669":"2px solid #e2e8f0",
                            background:regForm.category===cat?"#f0fdf4":"#fff" }}>
                          <div style={{ fontSize:26,marginBottom:5 }}>{cat==="Cash"?"💵":cat==="Corporate"?"🏢":"🛡️"}</div>
                          <div style={{ fontWeight:700,fontSize:13,color:regForm.category===cat?"#059669":"#475569" }}>{cat}</div>
                        </button>
                      ))}
                    </div>
                    {regForm.category==="Corporate" && (
                      <div style={{ background:"#f0fdf4",borderRadius:10,padding:"14px",border:"1px solid #bbf7d0" }}>
                        <Sec accent="#059669">Corporate Details</Sec>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
                          <FL label="Organisation *"  ch={<select value={regForm.corporateOrg||"Safaricom"} onChange={rf("corporateOrg")} style={SS}>{CORP_ORGS.map(o=><option key={o}>{o}</option>)}</select>} />
                          <FL label="Staff ID"         ch={<input value={regForm.corporateStaffId||""} onChange={rf("corporateStaffId")} style={IS()} />} />
                          <FL label="Work Email"       ch={<input type="email" value={regForm.corporateEmail||""} onChange={rf("corporateEmail")} style={IS()} />} />
                        </div>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12 }}>
                          <FL label="Department"      ch={<input value={regForm.corporateDept||""} onChange={rf("corporateDept")} placeholder="e.g. Finance" style={IS()} />} />
                          <FL label="Staff Grade"     ch={<input value={regForm.corporateGrade||""} onChange={rf("corporateGrade")} placeholder="e.g. Job Group M" style={IS()} />} />
                        </div>
                      </div>
                    )}
                    {regForm.category==="Insurance" && (
                      <div style={{ background:"#dbeafe",borderRadius:10,padding:"14px",border:"1px solid #93c5fd" }}>
                        <Sec accent="#1d4ed8">Insurance / HMO Details</Sec>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                          <FL label="Provider *"    ch={<select value={regForm.insuranceProvider||"NHIF"} onChange={rf("insuranceProvider")} style={SS}>{INS_PROVIDERS.map(i=><option key={i}>{i}</option>)}</select>} />
                          <FL label="Member No. *"  ch={<input value={regForm.insuranceMemberNo||""} onChange={rf("insuranceMemberNo")} style={IS(!regForm.insuranceMemberNo&&regForm.category==="Insurance")} />} />
                          <FL label="Policy No."    ch={<input value={regForm.insurancePolicyNo||""} onChange={rf("insurancePolicyNo")} style={IS()} />} />
                          <FL label="Expiry Date"   ch={<input type="date" value={regForm.insuranceExpiry||""} onChange={rf("insuranceExpiry")} style={IS()} />} />
                        </div>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12 }}>
                          <FL label="Co-pay Category" ch={<select value={regForm.copayCategory||"None"} onChange={rf("copayCategory")} style={SS}>{COPAY_CATEGORIES.map(cc=><option key={cc}>{cc}</option>)}</select>} />
                          <FL label="NHIF Card Number" ch={<input value={regForm.nhifMemberNo||""} onChange={rf("nhifMemberNo")} placeholder="NHIF Number" style={IS()} />} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {regTab===4 && (
                  <div>
                    <Sec accent="#854d0e">Consent & Compliance (HIPAA . GDPR . NDPR)</Sec>
                    <div style={{ background:"#fef9c3",borderRadius:10,padding:"18px",border:"1px solid #fde047",marginBottom:14 }}>
                      <p style={{ fontSize:13,color:"#78350f",marginBottom:14,lineHeight:1.7 }}>
                        The patient or legal guardian must provide informed consent before registration can be completed.
                      </p>
                      <label style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:12,cursor:"pointer" }}>
                        <input type="checkbox" checked={regForm.consentTreatment} onChange={rf("consentTreatment")} style={{ width:16,height:16,marginTop:2,flexShrink:0 }} />
                        <span style={{ fontSize:13,lineHeight:1.6 }}><strong>Consent to Treatment *:</strong> Patient consents to examination, diagnostic procedures, and treatment.</span>
                      </label>
                      <label style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:12,cursor:"pointer" }}>
                        <input type="checkbox" checked={regForm.consentData} onChange={rf("consentData")} style={{ width:16,height:16,marginTop:2,flexShrink:0 }} />
                        <span style={{ fontSize:13,lineHeight:1.6 }}><strong>Data Privacy *:</strong> Patient has been informed of their rights under HIPAA / GDPR / NDPR and consents to health records processing.</span>
                      </label>
                      <label style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:12,cursor:"pointer" }}>
                        <input type="checkbox" checked={regForm.consentEmergency} onChange={rf("consentEmergency")} style={{ width:16,height:16,marginTop:2,flexShrink:0 }} />
                        <span style={{ fontSize:13,lineHeight:1.6 }}><strong>Emergency Release Consent (Optional):</strong> Patient consents to life-saving emergency medical procedures if they or NOK are unresponsive.</span>
                      </label>
                      <label style={{ display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer" }}>
                        <input type="checkbox" checked={regForm.consentMarketing} onChange={rf("consentMarketing")} style={{ width:16,height:16,marginTop:2,flexShrink:0 }} />
                        <span style={{ fontSize:13,lineHeight:1.6 }}><strong>SMS & Email Communication Opt-In (Optional):</strong> Patient agrees to receive appointment reminders, billing notifications, and follow-ups.</span>
                      </label>
                    </div>
                    {regForm.consentTreatment && regForm.consentData && (
                      <SuccessBox msg="Consent recorded. Ready to complete registration." />
                    )}
                  </div>
                )}
              </Card>
              {/* Wizard nav */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",gap:5 }}>
                  {REG_TABS.map((_,i)=><div key={i} style={{ width:i===regTab?22:8,height:8,borderRadius:4,background:i===regTab?"#0b1929":"#e2e8f0",transition:"width .2s" }}/>)}
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  {regTab>0 && <button onClick={()=>setRegTab(t=>t-1)} style={BtnGhost}>Back Back</button>}
                  {regTab<REG_TABS.length-1
                    ? <button onClick={()=>setRegTab(t=>t+1)} style={BtnPrimary} disabled={regSaving}>Next </button>
                    : <button onClick={saveRegistration} disabled={regSaving} style={{ ...BtnGreen, display: "inline-flex", alignItems: "center", gap: 8, opacity: regSaving ? 0.75 : 1, cursor: regSaving ? "not-allowed" : "pointer" }}>
                        {regSaving ? (
                          <>
                            <span style={{
                              width: 14,
                              height: 14,
                              border: "2px solid rgba(255,255,255,.35)",
                              borderTopColor: "white",
                              borderRadius: "50%",
                              animation: "spin .8s linear infinite",
                              display: "inline-block"
                            }} />
                            Saving...
                          </>
                        ) : "[OK] Complete Registration"}
                      </button>
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    );


  // ==========================================================================
  // PAGE: BILLING
  // ==========================================================================

}
