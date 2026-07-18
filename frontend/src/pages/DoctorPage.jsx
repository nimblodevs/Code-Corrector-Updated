import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function DoctorPage(props) {
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


    const waiting = patients.filter(p=>p.status==="Billed" || p.status==="With Doctor");
    return (
      <Layout page={page} setPage={p=>{setActive(null);setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar title="Doctor - Clerking & Orders"
          subtitle={active ? `${active.queueNo} . ${active.firstName||""} ${active.lastName||""}` : `${waiting.length} patient(s) awaiting doctor`}
          action={
            <div style={{ display:"flex",gap:10 }}>
              {docSaved && <span style={{ background:"#dcfce7",color:"#15803d",borderRadius:8,padding:"7px 14px",fontSize:13,fontWeight:700 }}>[OK] Saved</span>}
              <button onClick={()=>{setActive(null);setPage("queue");}} style={BtnGhost}>Back Queue</button>
            </div>
          } />
        <div style={{ padding:"20px 26px" }}>
          {!active ? (
            <div>
              {/* ── Manual Patient Search ───────────────────── */}
              <div style={{ marginBottom:18,background:"#fff",borderRadius:12,padding:"15px 18px",boxShadow:"0 2px 12px rgba(0,0,0,.07)",border:"1.5px solid #bae6fd" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <span style={{ fontSize:13,fontWeight:800,color:"#7e22ce" }}>🔍 Manual Patient Search</span>
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
                            <div key={p.queueNo} onClick={()=>{ goDoctor(p); setManualSearch(""); }}
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
                                <button style={{ padding:"5px 12px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#7e22ce" }}>Open Clerking →</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>;
                })()}
              </div>
              <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:12 }}>Patients Awaiting Doctor</div>
              {waiting.length===0
                ? <EmptyState icon="🩺" msg="No patients currently waiting to see a doctor." />
                : waiting.map(p=>{
                  const tl=TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                  return (
                    <div key={p.queueNo} onClick={()=>goDoctor(p)}
                      style={{ background:"#fff",borderRadius:11,padding:"14px 18px",marginBottom:10,
                        boxShadow:"0 1px 6px rgba(0,0,0,.07)",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                        border:"1.5px solid #e2e8f0",transition:"all .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#a855f7"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",
                          background:p.status==="With Doctor"&&p.clerking?.labResults?"#cffafe":"#f3e8ff",
                          color:p.status==="With Doctor"&&p.clerking?.labResults?"#0e7490":"#7e22ce",
                          display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:14,fontWeight:900 }}>{p.queueNo}</div>
                        <div>
                          <div style={{ fontWeight:700,fontSize:14,color:"#0b1929" }}>{p.firstName} {p.lastName}</div>
                          <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace" }}>{p.id} . {calcAge(p.dateOfBirth)} yrs . {p.gender}</div>
                          {p.triage && <div style={{ fontSize:11,color:"#c2410c",marginTop:2 }}>"{p.triage.chiefComplaint}"</div>}
                          {p.clerking?.labResults && (
                            <div style={{ marginTop:4,display:"flex",gap:6,flexWrap:"wrap" }}>
                              <span style={{ background:"#cffafe",color:"#0e7490",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>
                                🧪 Lab results available
                              </span>
                              {(() => {
                                let crit=0,abnorm=0;
                                Object.values(p.clerking.labResults).forEach(r=>{ if(r.flag==="critical")crit++; else if(r.flag?.startsWith("abnormal"))abnorm++; });
                                return (<>
                                  {crit>0 && <span style={{ background:"#fee2e2",color:"#991b1b",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>🔴 {crit} critical</span>}
                                  {abnorm>0 && <span style={{ background:"#fef3c7",color:"#92400e",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>(!) {abnorm} abnormal</span>}
                                </>);
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        {tl && <Badge label={`L${p.triage.level} ${tl.label}`} color={tl.tc} bg={tl.bg} sm />}
                        <button style={{ ...BtnPrimary,padding:"8px 18px",fontSize:12,
                          background:p.clerking?.labResults?"#0e7490":"#7e22ce" }}>
                          {p.clerking?.labResults ? "🧪 Review Results" : "🩺 See Patient"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <>
              <PatientBanner p={active} />
              <FlowBar status={active.status} />
              <RefNumStrip p={active} />
              {active.triage && (
                <div style={{ background:"linear-gradient(90deg,#071828,#0f3460)",borderRadius:10,padding:"12px 18px",marginBottom:16,display:"flex",gap:20,flexWrap:"wrap" }}>
                  <div style={{ fontSize:9,color:"rgba(255,255,255,.3)",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1,width:"100%",marginBottom:2 }}>Triage Vitals</div>
                  {[["BP",active.triage.bp+" mmHg"],["Pulse",active.triage.pulse+" bpm"],["Temp",active.triage.temp+" degC"],["RR",active.triage.rr+"/min"],["SpO2",active.triage.spo2+"%"],["GCS",active.triage.gcs+"/15"],["Ht",active.triage.height+" cm"],["BMI",(()=>{const w=parseFloat(active.triage.weight),h=parseFloat(active.triage.height);return (w&&h)?(w/((h/100)**2)).toFixed(1)+" kg/m²":"—";})()],["Wt",active.triage.weight+" kg"]].map(([l,v])=>(
                    <div key={l}><div style={{ fontSize:9,color:"rgba(255,255,255,.35)",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1 }}>{l}</div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#e0f7fa" }}>{v}</div></div>
                  ))}
                  <div style={{ flex:1 }}><div style={{ fontSize:9,color:"rgba(255,255,255,.35)",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1 }}>Chief Complaint</div>
                  <div style={{ fontSize:12,fontWeight:700,color:"#fffde7" }}>{active.triage.chiefComplaint}</div></div>
                </div>
              )}
              <ErrBox msg={docErr} />

              {/* Lab Results Panel - shown when patient returns from lab */}
              {active.clerking?.labResults && Object.keys(active.clerking.labResults).length > 0 && (
                <div style={{ background:"#fff",borderRadius:12,border:"2px solid #06b6d4",marginBottom:18,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,.07)" }}>
                  <div style={{ background:"linear-gradient(135deg,#0e7490,#0369a1)",padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13,fontWeight:800,color:"#fff" }}>🧪 Laboratory Results</div>
                      <div style={{ fontSize:11,color:"rgba(255,255,255,.65)",marginTop:2 }}>
                        {active.clerking.labNo && <span style={{ fontFamily:"monospace",fontWeight:700,marginRight:8 }}>{active.clerking.labNo} .</span>}
                        Entered by {active.clerking.labScientist} . {active.clerking.labCompletedAt ? new Date(active.clerking.labCompletedAt).toLocaleString() : ""}
                      </div>
                    </div>
                    {(() => {
                      let crit=0,abnorm=0;
                      Object.values(active.clerking.labResults).forEach(r=>{ if(r.flag==="critical")crit++; else if(r.flag?.startsWith("abnormal"))abnorm++; });
                      return (
                        <div style={{ display:"flex",gap:8 }}>
                          {crit>0 && <span style={{ background:"#fee2e2",color:"#991b1b",borderRadius:7,padding:"4px 12px",fontSize:12,fontWeight:800 }}>🔴 {crit} Critical</span>}
                          {abnorm>0 && <span style={{ background:"#fef3c7",color:"#92400e",borderRadius:7,padding:"4px 12px",fontSize:12,fontWeight:700 }}>(!) {abnorm} Abnormal</span>}
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ padding:"14px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8 }}>
                    {Object.entries(active.clerking.labResults).map(([sid,r])=>{
                      const flagColors = {
                        normal:         { bg:"#f0fdf4",border:"#86efac",text:"#15803d",tag:"Normal",   tagBg:"#dcfce7",tagTx:"#166534" },
                        "abnormal-low": { bg:"#fffbeb",border:"#fcd34d",text:"#b45309",tag:"v Low",    tagBg:"#fef3c7",tagTx:"#92400e" },
                        "abnormal-high":{ bg:"#fff7ed",border:"#fdba74",text:"#c2410c",tag:"^ High",   tagBg:"#ffedd5",tagTx:"#9a3412" },
                        critical:       { bg:"#fef2f2",border:"#fca5a5",text:"#dc2626",tag:"🔴 Critical",tagBg:"#fee2e2",tagTx:"#991b1b" },
                        empty:          { bg:"#f8fafc",border:"#e2e8f0",text:"#475569",tag:"",        tagBg:"#f1f5f9",tagTx:"#64748b" },
                      };
                      const fc = flagColors[r.flag||"empty"]||flagColors.empty;
                      // Get test name from LAB_REF if available
                      const refName = sid;
                      return (
                        <div key={sid} style={{ background:fc.bg,border:`1.5px solid ${fc.border}`,borderRadius:9,padding:"10px 12px" }}>
                          <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.6,marginBottom:4 }}>{sid.replace(/_/g," ")}</div>
                          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:6 }}>
                            <span style={{ fontSize:15,fontWeight:800,color:fc.text,fontFamily:"monospace" }}>{r.value} {r.unit||""}</span>
                            {r.flag&&r.flag!=="empty"&&r.flag!=="normal" && (
                              <span style={{ background:fc.tagBg,color:fc.tagTx,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,whiteSpace:"nowrap" }}>{fc.tag}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Doc Tab Nav */}
              <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,.07)",marginBottom:18 }}>
                <div style={{ display:"flex",overflowX:"auto" }}>
                  {DOC_TABS.map((t,i)=>(
                    <button key={t.label} onClick={()=>setDocTab(i)}
                      style={{ flex:"0 0 auto",padding:"12px 16px",border:"none",fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap",position:"relative",
                        background:docTab===i?"#f0f9ff":"#fff",fontSize:12,fontWeight:docTab===i?700:400,
                        color:docTab===i?"#0369a1":C.slateL,
                        borderBottom:docTab===i?"3px solid #0369a1":"3px solid transparent" }}>
                      {t.label}
                      {t.badge>0 && <span style={{ marginLeft:6,background:"#059669",color:"#fff",borderRadius:20,padding:"0px 6px",fontSize:10,fontWeight:700 }}>{t.badge}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB 0 - History */}
              {docTab===0 && (
                <Card>
                  <Sec accent="#0369a1">Clinical History</Sec>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                    <FL label="Presenting Complaint *" span={2} ch={<textarea value={clk.presentingComplaint} onChange={ck("presentingComplaint")} rows={2} placeholder="Main reason for visit, in patient's own words" style={TA(!clk.presentingComplaint)} />} />
                    <FL label="History of Presenting Complaint" span={2} ch={<textarea value={clk.historyPC} onChange={ck("historyPC")} rows={4} placeholder="Onset, duration, character, radiation, associated features, relieving & aggravating factors (SOCRATES)..." style={TA()} />} />
                    <FL label="Past Medical History"  ch={<textarea value={clk.pastMedHistory}  onChange={ck("pastMedHistory")}  rows={3} placeholder="Previous diagnoses, hospitalisations, chronic conditions..." style={TA()} />} />
                    <FL label="Surgical History"      ch={<textarea value={clk.surgicalHistory}  onChange={ck("surgicalHistory")} rows={3} placeholder="Previous operations and approximate dates..." style={TA()} />} />
                    <FL label="Family History"        ch={<textarea value={clk.familyHistory}    onChange={ck("familyHistory")}   rows={3} placeholder="Relevant hereditary / familial conditions..." style={TA()} />} />
                    <FL label="Social History"        ch={<textarea value={clk.socialHistory}    onChange={ck("socialHistory")}   rows={3} placeholder="Smoking, alcohol, substances, occupation, travel, sexual history..." style={TA()} />} />
                    <FL label="Current Medications"   ch={<textarea value={clk.currentMeds}      onChange={ck("currentMeds")}     rows={3} placeholder="Drug name . dose . frequency . duration..." style={TA()} />} />
                    <FL label="Known Allergies"       ch={<textarea value={clk.allergies}        onChange={ck("allergies")}       rows={3} placeholder="Drug, food, environmental - describe reaction type..." style={TA()} />} />
                    <FL label="Review of Systems" span={2} ch={<textarea value={clk.reviewSystems} onChange={ck("reviewSystems")} rows={3} placeholder="CVS . Respiratory . GIT . GUS . CNS . MSK . Skin . Endocrine..." style={TA()} />} />
                  </div>
                </Card>
              )}

              {/* TAB 1 - Examination */}
              {docTab===1 && (
                <Card>
                  <Sec accent="#7c3aed">Physical Examination</Sec>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                    <FL label="General Examination" span={2} ch={<textarea value={clk.generalExam} onChange={ck("generalExam")} rows={3} placeholder="Appearance, consciousness (GCS/AVPU), pallor, jaundice, cyanosis, oedema, clubbing, lymphadenopathy, dehydration..." style={TA()} />} />
                    <FL label="Cardiovascular (CVS)" ch={<textarea value={clk.cvExam}   onChange={ck("cvExam")}   rows={4} placeholder="Pulse rate/rhythm/character, JVP, apex beat, heart sounds S1 S2, added sounds, murmurs..." style={TA()} />} />
                    <FL label="Respiratory (RS)"     ch={<textarea value={clk.respExam} onChange={ck("respExam")} rows={4} placeholder="RR, SpO2, trachea position, chest expansion, percussion note, breath sounds, added sounds..." style={TA()} />} />
                    <FL label="Abdomen (GIT)"        ch={<textarea value={clk.abdExam}  onChange={ck("abdExam")}  rows={4} placeholder="Inspection, palpation, percussion, auscultation, organomegaly, tenderness, masses, bowel sounds..." style={TA()} />} />
                    <FL label="Neurological"         ch={<textarea value={clk.neuroExam} onChange={ck("neuroExam")} rows={4} placeholder="Consciousness, orientation, cranial nerves, motor power, tone, reflexes, coordination, sensation, gait..." style={TA()} />} />
                    <FL label="Musculoskeletal"      ch={<textarea value={clk.mskExam}  onChange={ck("mskExam")}  rows={3} placeholder="Joints - swelling, tenderness, warmth, ROM, deformity..." style={TA()} />} />
                    <FL label="Other / Special"      ch={<textarea value={clk.otherExam} onChange={ck("otherExam")} rows={3} placeholder="ENT, ophthalmology, skin, genitourinary, rectal if indicated..." style={TA()} />} />
                  </div>
                </Card>
              )}

              {/* TAB 2 - Diagnosis */}
              {docTab===2 && (
                <Card>
                  <Sec accent="#dc2626">Clinical Diagnosis</Sec>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18 }}>
                    <FL label="Provisional Diagnosis" ch={<input value={clk.provisionalDx} onChange={ck("provisionalDx")} placeholder="Working diagnosis" style={IS()} />} />
                    <FL label="Provisional ICD-10" ch={
                      <select value={clk.provisionalCode} onChange={e=>{const it=ICD10.find(c=>c.code===e.target.value);setClk(p=>({...p,provisionalCode:e.target.value,provisionalDx:it?it.desc:p.provisionalDx}));}} style={SS}>
                        <option value="">Select...</option>{ICD10.map(c=><option key={c.code} value={c.code}>{c.code} - {c.desc}</option>)}
                      </select>} />
                    <FL label="Final Diagnosis" ch={<input value={clk.finalDx} onChange={ck("finalDx")} placeholder="Confirmed diagnosis" style={IS()} />} />
                    <FL label="Final ICD-10" ch={
                      <select value={clk.finalCode} onChange={e=>{const it=ICD10.find(c=>c.code===e.target.value);setClk(p=>({...p,finalCode:e.target.value,finalDx:it?it.desc:p.finalDx}));}} style={SS}>
                        <option value="">Select...</option>{ICD10.map(c=><option key={c.code} value={c.code}>{c.code} - {c.desc}</option>)}
                      </select>} />
                    <FL label="Differential Diagnoses" span={2} ch={<textarea value={clk.differentials} onChange={ck("differentials")} rows={2} placeholder="1. ...   2. ...   3. ..." style={TA()} />} />
                  </div>
                  <Sec accent="#059669">Management Plan & Disposition</Sec>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                    <FL label="Management Plan" span={2} ch={<textarea value={clk.planNotes} onChange={ck("planNotes")} rows={4} placeholder="Investigations ordered, treatment started, patient education, follow-up plan..." style={TA()} />} />
                    <FL label="Disposition" ch={
                      <select value={clk.disposition} onChange={ck("disposition")} style={SS}>
                        {["OPD Follow-up","Admit to Ward","Admit to ICU","Refer to Specialist","Day Case Surgery","Discharge Home","Refer to Another Facility","Emergency Surgery"].map(d=><option key={d}>{d}</option>)}
                      </select>} />
                  </div>

                  {/* Admission Request Form - shown when disposition is Admit */}
                  {clk.disposition?.startsWith("Admit") && (
                    <div style={{ background:"#fdf4ff",border:"2px solid #d8b4fe",borderRadius:12,padding:"16px",marginBottom:16,marginTop:4 }}>
                      <div style={{ fontSize:13,fontWeight:800,color:"#7e22ce",marginBottom:12,display:"flex",alignItems:"center",gap:8 }}>
                        🏥 Admission Request - Clinical Criteria
                        <span style={{ fontSize:10,background:"#7e22ce",color:"#fff",borderRadius:5,padding:"2px 8px",fontWeight:700 }}>Required</span>
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                        <FL label="Preferred Ward *" ch={
                          <select value={admitReqForm.wardPref} onChange={e=>setAdmitReqForm(p=>({...p,wardPref:e.target.value}))} style={{ ...SS,border:!admitReqForm.wardPref?"1.5px solid #c084fc":"1.5px solid #e2e8f0" }}>
                            <option value="">Select ward...</option>
                            {WARDS.map(w=><option key={w.id} value={w.name}>{w.name}</option>)}
                          </select>} />
                        <FL label="Admission Urgency" ch={
                          <select value={admitReqForm.urgency} onChange={e=>setAdmitReqForm(p=>({...p,urgency:e.target.value}))} style={SS}>
                            {["Routine","Urgent","Emergency"].map(u=><option key={u}>{u}</option>)}
                          </select>} />
                        <FL label="Monitoring Level" ch={
                          <select value={admitReqForm.monitoring} onChange={e=>setAdmitReqForm(p=>({...p,monitoring:e.target.value}))} style={SS}>
                            {["Standard","Close Monitoring (2-hourly obs)","High Dependency (1-hourly obs)","Intensive (Continuous)"].map(m=><option key={m}>{m}</option>)}
                          </select>} />
                        <FL label="Diet Order" ch={
                          <select value={admitReqForm.diet} onChange={e=>setAdmitReqForm(p=>({...p,diet:e.target.value}))} style={SS}>
                            {DIET_OPTIONS.map(d=><option key={d}>{d}</option>)}
                          </select>} />
                        <FL label="Infection Control" ch={
                          <select value={admitReqForm.infectionControl} onChange={e=>setAdmitReqForm(p=>({...p,infectionControl:e.target.value}))} style={SS}>
                            {["None","Contact Precautions","Droplet Precautions","Airborne Precautions","Full Isolation (Barrier Nursing)"].map(m=><option key={m}>{m}</option>)}
                          </select>} />
                      </div>
                      {/* Checkboxes for immediate needs */}
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12 }}>
                        {[
                          ["isolation",     "Isolation Room Required"],
                          ["oxygenNeeded",  "Oxygen Therapy"],
                          ["ivAccess",      "IV Access Required"],
                        ].map(([key,label])=>(
                          <label key={key} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 11px",border:"1.5px solid "+( admitReqForm[key]?"#a855f7":"#e2e8f0"),borderRadius:8,cursor:"pointer",background:admitReqForm[key]?"#fdf4ff":"#fff",transition:"all .15s" }}>
                            <input type="checkbox" checked={admitReqForm[key]} onChange={e=>setAdmitReqForm(p=>({...p,[key]:e.target.checked}))} />
                            <span style={{ fontSize:12,fontWeight:admitReqForm[key]?700:500,color:admitReqForm[key]?"#7e22ce":"#1e293b" }}>{label}</span>
                          </label>
                        ))}
                      </div>
                      <FL label="Special Nursing Needs" ch={<textarea value={admitReqForm.nursingNeeds} onChange={e=>setAdmitReqForm(p=>({...p,nursingNeeds:e.target.value}))} rows={2} style={TA()} placeholder="e.g. Hourly neuro obs, pressure area care, fall risk..." />} />
                      <FL label="Additional Notes for Ward" ch={<textarea value={admitReqForm.specialNeeds} onChange={e=>setAdmitReqForm(p=>({...p,specialNeeds:e.target.value}))} rows={2} style={TA()} placeholder="e.g. Interpreter required, family counselling, specific equipment..." />} />
                      <div style={{ background:"#ede9fe",borderRadius:8,padding:"10px 12px",fontSize:11,color:"#5b21b6",marginTop:8 }}>
                        This admission request will be sent to Ward Management for processing. The ward officer will assign a bed and confirm the admission.
                      </div>
                    </div>
                  )}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,paddingTop:14,borderTop:"1px solid #f1f5f9" }}>
                    <FL label="Attending Doctor *" ch={<input value={clk.doctorName} onChange={ck("doctorName")} placeholder="Dr. Full Name" style={IS(!clk.doctorName)} />} />
                    <FL label="Medical Reg. No."   ch={<input value={clk.doctorReg}  onChange={ck("doctorReg")}  placeholder="e.g. MDCN-12345" style={IS()} />} />
                  </div>
                </Card>
              )}

              {/* TAB 3 - Lab */}
              {docTab===3 && (
                <Card>
                  <Sec accent="#0369a1">Laboratory Investigation Request</Sec>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
                    <FL label="Urgency" ch={
                      <select value={labUrgency} onChange={e=>setLabUrgency(e.target.value)} style={SS}>
                        {["Routine","Urgent","STAT (Immediate)"].map(u=><option key={u}>{u}</option>)}
                      </select>} />
                    <FL label="Clinical Notes for Lab" ch={<input value={labNotes} onChange={e=>setLabNotes(e.target.value)} placeholder="Clinical indication / context" style={IS()} />} />
                  </div>

                  <CatalogueSearch
                    cats={["lab"]}
                    selected={labSel}
                    onAdd={item=>{ if(!labSel.includes(item.id)) setLabSel(p=>[...p,item.id]); }}
                    onRemove={id=>setLabSel(p=>p.filter(x=>x!==id))}
                    placeholder="Search 1000+ lab tests - FBC, malaria, troponin, LFT, HbA1c..."
                    accentColor="#0369a1"
                    label="Search & Select Tests"
                  />

                  {labSel.length>0 ? (() => {
                    const resulted = !!(active.clerking?.labResults && Object.keys(active.clerking.labResults).length > 0);
                    return (
                      <div style={{ border:`1.5px solid ${resulted?"#6ee7b7":"#93c5fd"}`,borderRadius:10,overflow:"hidden" }}>
                        <div style={{ background:resulted?"#059669":"#1d4ed8",padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                          <span style={{ fontSize:12,fontWeight:700,color:"#fff" }}>
                            {resulted?"v":"🧪"} {labSel.length} test{labSel.length>1?"s":""} ordered  {labUrgency}
                            {resulted && <span style={{ fontWeight:400,opacity:.8,marginLeft:8 }}>  Results received</span>}
                          </span>
                          {!resulted && (
                            <button onClick={()=>setLabSel([])} style={{ background:"rgba(255,255,255,.15)",border:"none",borderRadius:5,padding:"3px 10px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit" }}>Clear all</button>
                          )}
                        </div>
                        {labSel.map((id,i)=>{
                          const t = ITEM_REGISTRY[id];
                          if(!t) return null;
                          return (
                            <div key={id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",
                              background:i%2===0?"#fff":resulted?"#f0fdf4":"#f0f9ff",borderBottom:i<labSel.length-1?"1px solid #e2e8f0":"none" }}>
                              <div style={{ flex:1 }}>
                                <span style={{ fontSize:11,color:resulted?"#059669":"#0369a1",fontFamily:"monospace",marginRight:8 }}>{String(i+1).padStart(2,"0")}</span>
                                <span style={{ fontSize:13,fontWeight:600,color:"#1e293b" }}>{t.name}</span>
                                {resulted && <span style={{ marginLeft:10,fontSize:11,color:"#059669",fontWeight:700 }}>v Resulted</span>}
                              </div>
                              <span style={{ fontSize:11,fontFamily:"monospace",color:"#0369a1",marginRight:10 }}>
                                {t.price>0?`KES ${t.price.toLocaleString()}`:""}
                              </span>
                              {!resulted && (
                                <button onClick={()=>setLabSel(p=>p.filter(x=>x!==id))}
                                  style={{ background:"#fee2e2",border:"none",borderRadius:5,width:24,height:24,cursor:"pointer",fontSize:13,color:"#dc2626",fontWeight:700 }}>x</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })() : (
                    <div style={{ padding:"18px",textAlign:"center",color:C.slateL,fontSize:13,border:"1.5px dashed #e2e8f0",borderRadius:10 }}>
                      Search and add tests above to build the lab request
                    </div>
                  )}
                </Card>
              )}

              {/* TAB 4 - Radiology */}
              {docTab===4 && (
                <Card>
                  <Sec accent="#7c3aed">Radiology / Imaging Request</Sec>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
                    <FL label="Urgency" ch={
                      <select value={radUrgency} onChange={e=>setRadUrgency(e.target.value)} style={SS}>
                        {["Routine","Urgent","Emergency"].map(u=><option key={u}>{u}</option>)}
                      </select>} />
                    <FL label="Clinical Question" ch={<input value={radNotes} onChange={e=>setRadNotes(e.target.value)} placeholder="Clinical indication for radiologist" style={IS()} />} />
                  </div>

                  <CatalogueSearch
                    cats={["radiology"]}
                    selected={radSel}
                    onAdd={item=>{ if(!radSel.includes(item.id)) setRadSel(p=>[...p,item.id]); }}
                    onRemove={id=>setRadSel(p=>p.filter(x=>x!==id))}
                    placeholder="Search imaging - chest xray, CT head, MRI knee, echo..."
                    accentColor="#7c3aed"
                    label="Search & Select Studies"
                  />

                  {radSel.length>0 ? (
                    <div style={{ background:"#f3e8ff",borderRadius:10,border:"1.5px solid #d8b4fe",overflow:"hidden" }}>
                      <div style={{ background:"#7c3aed",padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <span style={{ fontSize:12,fontWeight:700,color:"#fff" }}>🩻 {radSel.length} study selected  Urgency: {radUrgency}</span>
                        <button onClick={()=>setRadSel([])} style={{ background:"rgba(255,255,255,.15)",border:"none",borderRadius:5,padding:"3px 10px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit" }}>Clear all</button>
                      </div>
                      {radSel.map((id,i)=>{
                        const t = ITEM_REGISTRY[id];
                        if(!t) return null;
                        return (
                          <div key={id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",
                            background:i%2===0?"#fff":"#faf5ff",borderBottom:i<radSel.length-1?"1px solid #ede9fe":"none" }}>
                            <div style={{ flex:1 }}>
                              <span style={{ fontSize:11,color:"#7c3aed",fontFamily:"monospace",marginRight:8 }}>{String(i+1).padStart(2,"0")}</span>
                              <span style={{ fontSize:13,fontWeight:600,color:"#1e293b" }}>{t.name}</span>
                              <span style={{ marginLeft:10,fontSize:10,color:"#94a3b8" }}>{t.subcat}</span>
                            </div>
                            <span style={{ fontSize:11,fontFamily:"monospace",color:"#7c3aed",marginRight:10 }}>
                              {t.price>0?`KES ${t.price.toLocaleString()}`:""}
                            </span>
                            <button onClick={()=>setRadSel(p=>p.filter(x=>x!==id))}
                              style={{ background:"#fee2e2",border:"none",borderRadius:5,width:24,height:24,cursor:"pointer",fontSize:13,color:"#dc2626",fontWeight:700 }}>x</button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding:"18px",textAlign:"center",color:C.slateL,fontSize:13,border:"1.5px dashed #e2e8f0",borderRadius:10 }}>
                      Search and add imaging studies above
                    </div>
                  )}
                </Card>
              )}

              {/* TAB 5 - Prescription */}
              {docTab===5 && (
                <Card>
                  <Sec accent="#059669">Prescription</Sec>

                  {/* Drug search + add form */}
                  <div style={{ background:"#f8fafc",borderRadius:10,padding:"14px 16px",border:"1px solid #e2e8f0",marginBottom:18 }}>
                    <CatalogueSearch
                      cats={["pharmacy"]}
                      selected={rxList.map(r=>r.catalogueId).filter(Boolean)}
                      onAdd={item=>setRxForm(p=>({ ...p, name:item.name, dose:"", catalogueId:item.id, price:item.price }))}
                      placeholder="Search 10,000+ drugs - amoxicillin, metformin, salbutamol, IV fluids..."
                      accentColor="#059669"
                      multi={false}
                      label="Search Drug Catalogue"
                      showPrice
                    />
                    <Sec accent="#475569">Drug Details</Sec>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12 }}>
                      <FL label="Drug Name *"   ch={<input value={rxForm.name}     onChange={e=>setRxForm(p=>({...p,name:e.target.value}))}         placeholder="e.g. Amoxicillin" style={IS()} />} />
                      <FL label="Dose"          ch={<input value={rxForm.dose}     onChange={e=>setRxForm(p=>({...p,dose:e.target.value}))}         placeholder="e.g. 500mg" style={IS()} />} />
                      <FL label="Route"         ch={<select value={rxForm.route}   onChange={e=>setRxForm(p=>({...p,route:e.target.value}))}        style={SS}>{DRUG_ROUTES.map(r=><option key={r}>{r}</option>)}</select>} />
                      <FL label="Frequency"     ch={<select value={rxForm.freq}    onChange={e=>setRxForm(p=>({...p,freq:e.target.value}))}         style={SS}>{DRUG_FREQ.map(r=><option key={r}>{r}</option>)}</select>} />
                      <FL label="Duration"      ch={<select value={rxForm.duration} onChange={e=>setRxForm(p=>({...p,duration:e.target.value}))}   style={SS}>{DRUG_DURATION.map(r=><option key={r}>{r}</option>)}</select>} />
                      <FL label="Instructions"  ch={<input value={rxForm.instructions} onChange={e=>setRxForm(p=>({...p,instructions:e.target.value}))} placeholder="e.g. Take after meals" style={IS()} />} />
                    </div>
                    <button onClick={()=>{
                      if(!rxForm.name.trim()) return;
                      setRxList(p=>[...p,{...rxForm,id:Date.now()}]);
                      setRxForm({name:"",dose:"",route:"Oral",freq:"BD (Twice daily)",duration:"7 days",instructions:"",catalogueId:null,price:0});
                    }} style={{ ...BtnGreen, padding:"9px 20px",fontSize:13 }}>+ Add to Prescription</button>
                  </div>

                  {rxList.length>0 && (
                    <>
                      <Sec accent="#059669">Current Prescription ({rxList.length} item{rxList.length>1?"s":""})</Sec>
                      <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead><tr style={{ background:"#f8fafc" }}>
                          {["#","Drug","Dose","Route","Freq","Duration","Instructions",""].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:C.slateL,fontFamily:"monospace",letterSpacing:.8 }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {rxList.map((rx,i)=>(
                            <tr key={rx.id} style={{ borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#f8fafc" }}>
                              <td style={{ padding:"9px 10px",fontSize:12,color:C.slateL,fontFamily:"monospace" }}>{i+1}</td>
                              <td style={{ padding:"9px 10px",fontWeight:700,fontSize:13 }}>{rx.name}</td>
                              <td style={{ padding:"9px 10px",fontSize:12 }}>{rx.dose}</td>
                              <td style={{ padding:"9px 10px",fontSize:12 }}>{rx.route}</td>
                              <td style={{ padding:"9px 10px",fontSize:12 }}>{rx.freq}</td>
                              <td style={{ padding:"9px 10px",fontSize:12 }}>{rx.duration}</td>
                              <td style={{ padding:"9px 10px",fontSize:11,color:C.slate }}>{rx.instructions}</td>
                              <td style={{ padding:"9px 10px" }}><button onClick={()=>setRxList(p=>p.filter(x=>x.id!==rx.id))} style={{ background:"#fee2e2",border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",fontSize:12 }}>x</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </Card>
              )}

              {/* TAB 6 - Consult */}
              {docTab===6 && (
                <Card>
                  <Sec accent="#1d4ed8">Specialist Consultation Booking</Sec>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                    <FL label="Specialty Required" ch={
                      <select value={consSpec} onChange={e=>setConsSpec(e.target.value)} style={SS}>
                        {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
                      </select>} />
                    <FL label="Urgency" ch={
                      <select value={consUrgency} onChange={e=>setConsUrgency(e.target.value)} style={SS}>
                        {["Routine","Urgent","Emergency"].map(u=><option key={u}>{u}</option>)}
                      </select>} />
                    <FL label="Reason for Consultation" span={2} ch={
                      <textarea value={consReason} onChange={e=>setConsReason(e.target.value)} rows={5}
                        placeholder={`Dear ${consSpec} Colleague,\n\nPlease see this [age] [sex] patient with...\n\nClinical question: ...\nRelevant history: ...\nExamination findings: ...\nInvestigations done: ...\nThank you.`}
                        style={TA()} />} />
                  </div>
                  {consReason.trim() && (
                    <div style={{ background:"#dbeafe",borderRadius:9,padding:"11px 14px",border:"1px solid #93c5fd",display:"flex",gap:10,alignItems:"center" }}>
                      <span style={{ fontSize:18 }}>🩺</span>
                      <div><div style={{ fontSize:12,fontWeight:700,color:"#1d4ed8" }}>Consultation booked . {consSpec}</div>
                      <div style={{ fontSize:11,color:"#475569" }}>Urgency: {consUrgency}</div></div>
                    </div>
                  )}
                </Card>
              )}

              {/* Orders summary + Save */}
              <div style={{ background:"#fff",borderRadius:12,padding:"16px 20px",boxShadow:"0 2px 12px rgba(0,0,0,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4 }}>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,color:C.slateL,letterSpacing:.8,textTransform:"uppercase",fontFamily:"monospace",marginBottom:6 }}>Orders Summary</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {labSel.length>0 && <span style={{ background:"#dbeafe",color:"#1d4ed8",borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700 }}>🧪 {labSel.length} lab test(s)</span>}
                    {radSel.length>0 && <span style={{ background:"#f3e8ff",color:"#7e22ce",borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700 }}>🩻 {radSel.length} imaging study</span>}
                    {rxList.length>0 && <span style={{ background:"#f0fdf4",color:"#15803d",borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700 }}>💊 {rxList.length} drug(s)</span>}
                    {consReason.trim() && <span style={{ background:"#fef9c4",color:"#b45309",borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700 }}>🩺 {consSpec} consult</span>}
                    {!labSel.length&&!radSel.length&&!rxList.length&&!consReason.trim() && <span style={{ fontSize:12,color:C.slateL }}>No orders added yet</span>}
                  </div>
                </div>
                <button onClick={saveDoctor}
                  style={{ padding:"12px 30px",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,color:"#fff",
                    background:"linear-gradient(135deg,#0b1929,#0d2744)",boxShadow:"0 4px 14px rgba(0,0,0,.25)" }}>
                  💾 Save Clerking & Orders
                </button>
              </div>
            </>
          )}
        </div>
      </Layout>
    );


  // ==========================================================================
  // PAGE: LABORATORY
  // ==========================================================================

}
