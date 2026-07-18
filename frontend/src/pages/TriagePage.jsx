import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function TriagePage(props) {
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


    const waiting = patients.filter(p=>p.status==="Queued");

    // -- Vital sign thresholds ----------------------------------------------
    const vitalStatus = (() => {
      const w = parseFloat(trForm.weight);
      const h = parseFloat(trForm.height);
      const bmi = (w && h) ? w / ((h/100)**2) : null;

      const systolic  = parseInt((trForm.bp||"").split("/")[0]);
      const diastolic = parseInt((trForm.bp||"").split("/")[1]);
      const pulse  = parseFloat(trForm.pulse);
      const temp   = parseFloat(trForm.temp);
      const rr     = parseFloat(trForm.rr);
      const spo2   = parseFloat(trForm.spo2);
      const gcs    = parseFloat(trForm.gcs);

      const flag = (val, low, highWarn, highCrit, lowWarn) => {
        if (!val && val!==0) return "empty";
        if (val >= highCrit)   return "critical";
        if (val >= highWarn)   return "warning";
        if (lowWarn !== undefined && val <= lowWarn) return "warning";
        if (val < low)         return "critical";
        return "normal";
      };

      const bpFlag = (() => {
        if (!systolic || !diastolic) return "empty";
        if (systolic >= 180 || diastolic >= 120) return "critical";
        if (systolic >= 140 || diastolic >= 90)  return "warning";
        if (systolic < 90  || diastolic < 60)    return "critical";
        if (systolic < 100)                      return "warning";
        return "normal";
      })();

      const bmiFlag = (() => {
        if (!bmi) return "empty";
        if (bmi >= 40)        return "critical";
        if (bmi >= 30)        return "warning";
        if (bmi < 16)         return "critical";
        if (bmi < 18.5)       return "warning";
        return "normal";
      })();

      const bmiLabel = (() => {
        if (!bmi) return null;
        if (bmi >= 40)   return "Morbidly Obese";
        if (bmi >= 35)   return "Obese Class II";
        if (bmi >= 30)   return "Obese Class I";
        if (bmi >= 25)   return "Overweight";
        if (bmi >= 18.5) return "Normal";
        if (bmi >= 16)   return "Underweight";
        return "Severely Underweight";
      })();

      return {
        bmi: bmi ? bmi.toFixed(1) : null,
        bmiLabel,
        bmiFlag,
        bp:   bpFlag,
        pulse: flag(pulse, 40, 100, 150, 50),
        temp:  flag(temp,  35, 37.5, 39, 35),
        rr:    flag(rr,    8,  20,   30, 10),
        spo2: (() => {
          if (!spo2) return "empty";
          if (spo2 < 90)  return "critical";
          if (spo2 < 94)  return "warning";
          return "normal";
        })(),
        gcs: (() => {
          if (!gcs) return "empty";
          if (gcs <= 8)  return "critical";
          if (gcs <= 12) return "warning";
          return "normal";
        })(),
      };
    })();

    const vColor = {
      normal:   { bg:"#f0fdf4", border:"#86efac", text:"#15803d", badge:"#dcfce7", badgeText:"#166534" },
      warning:  { bg:"#fffbeb", border:"#fcd34d", text:"#b45309", badge:"#fef3c7", badgeText:"#92400e" },
      critical: { bg:"#fef2f2", border:"#fca5a5", text:"#dc2626", badge:"#fee2e2", badgeText:"#991b1b" },
      empty:    { bg:"#fff",    border:"#e2e8f0", text:"#1e293b", badge:"#f1f5f9", badgeText:"#64748b" },
    };

    const VitalInput = ({ label, fieldKey, placeholder, unit, statusKey }) => {
      const s = vitalStatus[statusKey] || "empty";
      const col = vColor[s];
      const isEmpty = !trForm[fieldKey];
      return (
        <div>
          <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>
            {label} {unit && <span style={{ fontWeight:400,color:C.slateL }}>({unit})</span>} *
          </label>
          <div style={{ position:"relative" }}>
            <input
              value={trForm[fieldKey]}
              onChange={tf(fieldKey)}
              placeholder={placeholder}
              style={{ ...baseInput,
                border:`1.5px solid ${isEmpty ? "#fca5a5" : s==="empty" ? "#e2e8f0" : col.border}`,
                background: s==="empty" ? "#fff" : col.bg,
                color: s==="empty" ? "#1e293b" : col.text,
                fontWeight: s!=="empty" && s!=="normal" ? 700 : 400,
                paddingRight: s!=="empty" ? 70 : 11,
              }} />
            {s!=="empty" && (
              <span style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
                background:col.badge,color:col.badgeText,borderRadius:5,padding:"1px 6px",
                fontSize:10,fontWeight:800,letterSpacing:.5,textTransform:"uppercase",whiteSpace:"nowrap" }}>
                {s==="normal" ? "v OK" : s==="warning" ? "(!) HIGH" : "🔴 CRIT"}
              </span>
            )}
          </div>
        </div>
      );
    };

    // Summary card data
    const allFilled = ["bp","pulse","temp","rr","spo2","gcs","weight","height","chiefComplaint","triageNurse"]
      .every(k => trForm[k]?.toString().trim());
    const criticals = Object.entries(vitalStatus)
      .filter(([k,v])=>v==="critical" && k!=="bmi" && k!=="bmiLabel" && k!=="bmiFlag")
      .map(([k])=>k);
    const warnings  = Object.entries(vitalStatus)
      .filter(([k,v])=>v==="warning" && k!=="bmi" && k!=="bmiLabel" && k!=="bmiFlag")
      .map(([k])=>k);
    const vitalNames = { bp:"Blood Pressure",pulse:"Pulse",temp:"Temperature",rr:"Resp. Rate",spo2:"SpO2",gcs:"GCS" };
    const selTriage  = TRIAGE_LEVELS.find(t=>t.level===trForm.level);

    return (
      <Layout page={page} setPage={p=>{setActive(null);setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar title="Triage Assessment"
          subtitle={active ? `${active.queueNo} . ${active.name||"Patient"}` : `${waiting.length} patient(s) awaiting triage`}
          action={<button onClick={()=>{setActive(null);setPage("queue");}} style={BtnGhost}>Back Queue</button>} />
        <div style={{ padding:"20px 26px" }}>
          {!active ? (
            <div style={{ maxWidth:860 }}>
              <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:12 }}>Patients Awaiting Triage</div>
              {waiting.length===0
                ? <EmptyState icon="[OK]" msg="No patients currently awaiting triage." />
                : waiting.map(p=>(
                  <div key={p.queueNo} onClick={()=>goTriage(p)}
                    style={{ background:"#fff",borderRadius:11,padding:"14px 18px",marginBottom:10,
                      boxShadow:"0 1px 6px rgba(0,0,0,.07)",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                      border:"1.5px solid #e2e8f0",transition:"all .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#00bcd4"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:40,height:40,borderRadius:"50%",background:"#ffedd5",color:"#c2410c",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:14,fontWeight:900 }}>{p.queueNo}</div>
                      <div>
                        <div style={{ fontWeight:700,fontSize:14,color:"#0b1929" }}>{p.name}</div>
                        <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace" }}>Arrived {p.queueTime} . {p.phone}</div>
                      </div>
                    </div>
                    <button style={{ ...BtnRed,padding:"8px 18px",fontSize:12 }}>🩺 Triage Now</button>
                  </div>
                ))
              }
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:18, alignItems:"start" }}>
              {/* -- LEFT COLUMN: forms -- */}
              <div style={{ maxWidth:"100%", minWidth:0 }}>
                <PatientBanner p={active} />
                <FlowBar status={active.status} />
                <ErrBox msg={trErr} />

                {/* Vital Signs */}
                <Card>
                  <Sec accent="#dc2626">Vital Signs - All mandatory *</Sec>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16 }}>
                    {/* BP gets special treatment as a text field */}
                    <div>
                      <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>
                        Blood Pressure <span style={{ fontWeight:400,color:C.slateL }}>(mmHg)</span> *
                      </label>
                      <div style={{ position:"relative" }}>
                        <input value={trForm.bp} onChange={tf("bp")} placeholder="120/80"
                          style={{ ...baseInput,
                            border:`1.5px solid ${!trForm.bp ? "#fca5a5" : vitalStatus.bp==="empty" ? "#e2e8f0" : vColor[vitalStatus.bp].border}`,
                            background: vitalStatus.bp==="empty" ? "#fff" : vColor[vitalStatus.bp].bg,
                            color: vitalStatus.bp==="empty" ? "#1e293b" : vColor[vitalStatus.bp].text,
                            fontWeight: vitalStatus.bp!=="empty" && vitalStatus.bp!=="normal" ? 700 : 400,
                            paddingRight: vitalStatus.bp!=="empty" ? 70 : 11,
                          }} />
                        {vitalStatus.bp!=="empty" && (
                          <span style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
                            background:vColor[vitalStatus.bp].badge,color:vColor[vitalStatus.bp].badgeText,
                            borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:800,letterSpacing:.5,textTransform:"uppercase",whiteSpace:"nowrap" }}>
                            {vitalStatus.bp==="normal" ? "v OK" : vitalStatus.bp==="warning" ? "(!) HIGH" : "🔴 CRIT"}
                          </span>
                        )}
                      </div>
                    </div>
                    <VitalInput label="Pulse Rate"       fieldKey="pulse"  placeholder="72"   unit="bpm"  statusKey="pulse" />
                    <VitalInput label="Temperature"      fieldKey="temp"   placeholder="36.6" unit=" degC"   statusKey="temp"  />
                    <VitalInput label="Respiratory Rate" fieldKey="rr"     placeholder="16"   unit="/min" statusKey="rr"    />
                    <VitalInput label="SpO2"             fieldKey="spo2"   placeholder="98"   unit="%"    statusKey="spo2"  />
                    <VitalInput label="GCS Score"        fieldKey="gcs"    placeholder="15"   unit="/15"  statusKey="gcs"   />
                    <VitalInput label="Weight"           fieldKey="weight" placeholder="70"   unit="kg"   statusKey="empty" />
                    <VitalInput label="Height"           fieldKey="height" placeholder="170"  unit="cm"   statusKey="empty" />
                  </div>

                  {/* BMI auto-display */}
                  {vitalStatus.bmi && (
                    <div style={{ marginBottom:16,padding:"12px 16px",borderRadius:10,
                      background:vColor[vitalStatus.bmiFlag].bg,
                      border:`1.5px solid ${vColor[vitalStatus.bmiFlag].border}` }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                          <div>
                            <div style={{ fontSize:10,fontWeight:700,color:C.slateL,letterSpacing:.8,textTransform:"uppercase",fontFamily:"monospace" }}>BMI (Auto-calculated)</div>
                            <div style={{ fontSize:28,fontWeight:900,color:vColor[vitalStatus.bmiFlag].text,lineHeight:1.1 }}>{vitalStatus.bmi}</div>
                            <div style={{ fontSize:11,color:C.slate,marginTop:2 }}>kg/m2</div>
                          </div>
                          <div style={{ padding:"6px 14px",borderRadius:8,background:vColor[vitalStatus.bmiFlag].badge }}>
                            <div style={{ fontSize:13,fontWeight:800,color:vColor[vitalStatus.bmiFlag].badgeText }}>{vitalStatus.bmiLabel}</div>
                          </div>
                        </div>
                        {/* BMI scale */}
                        <div style={{ display:"flex",gap:4,fontSize:10,color:C.slate }}>
                          {[["<16","Sev. UW","#b71c1c"],["16-18.5","Underweight","#e65100"],["18.5-25","Normal","#2e7d32"],["25-30","Overweight","#f59e0b"],["30-40","Obese","#dc2626"],["40+","Morbid","#7f1d1d"]].map(([r,l,c])=>(
                            <div key={r} style={{ textAlign:"center",padding:"3px 6px",borderRadius:5,background:c+"22",border:`1px solid ${c}44` }}>
                              <div style={{ fontSize:9,fontWeight:700,color:c }}>{l}</div>
                              <div style={{ fontSize:8,color:C.slateL }}>{r}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <FL label="Chief Complaint / Presenting Symptoms *"
                    ch={<textarea value={trForm.chiefComplaint} onChange={tf("chiefComplaint")} rows={3}
                      placeholder="Main complaint, onset, duration, character..." style={TA(!trForm.chiefComplaint)} />} />
                </Card>

                {/* ESI Level */}
                <Card>
                  <Sec accent="#7c3aed">ESI Triage Level</Sec>
                  <div style={{ display:"flex",gap:10,marginBottom:16 }}>
                    {TRIAGE_LEVELS.map(t=>(
                      <button key={t.level} onClick={()=>setTrForm(p=>({...p,level:t.level}))}
                        style={{ flex:1,padding:"13px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .15s",
                          border:trForm.level===t.level?`3px solid ${t.bg}`:"2px solid #e2e8f0",
                          background:trForm.level===t.level?t.bg:"#fff",
                          color:trForm.level===t.level?t.tc:"#64748b" }}>
                        <div style={{ fontSize:17,fontWeight:900 }}>L{t.level}</div>
                        <div style={{ fontSize:11,fontWeight:700,marginTop:2 }}>{t.label}</div>
                        <div style={{ fontSize:10,opacity:.8,marginTop:1 }}>{t.sub}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    <FL label="Triage Nurse / Clinician *" ch={<input value={trForm.triageNurse} onChange={tf("triageNurse")} placeholder="Full name" style={IS(!trForm.triageNurse)} />} />
                    <FL label="Triage Time" ch={<input type="time" value={trForm.triageTime} onChange={tf("triageTime")} style={IS()} />} />
                  </div>
                </Card>

                <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
                  <button onClick={()=>setActive(null)} style={BtnGhost}>Back Back to list</button>
                  <button onClick={saveTriage} style={BtnRed}>Save Triage </button>
                </div>
              </div>

              {/* -- RIGHT COLUMN: live summary -- */}
              <div style={{ position:"sticky", top:70 }}>
                {/* Alerts */}
                {(criticals.length>0 || warnings.length>0) && (
                  <div style={{ marginBottom:12 }}>
                    {criticals.length>0 && (
                      <div style={{ background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:11,padding:"12px 14px",marginBottom:8 }}>
                        <div style={{ fontSize:12,fontWeight:800,color:"#dc2626",marginBottom:6,display:"flex",alignItems:"center",gap:6 }}>
                          🔴 CRITICAL VALUES ({criticals.length})
                        </div>
                        {criticals.map(k=>(
                          <div key={k} style={{ fontSize:12,color:"#991b1b",display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                            <span>{vitalNames[k]||k}</span>
                            <span style={{ fontFamily:"monospace",fontWeight:700 }}>
                              {k==="bp"?trForm.bp:trForm[k]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {warnings.length>0 && (
                      <div style={{ background:"#fffbeb",border:"1.5px solid #fcd34d",borderRadius:11,padding:"12px 14px",marginBottom:8 }}>
                        <div style={{ fontSize:12,fontWeight:800,color:"#b45309",marginBottom:6,display:"flex",alignItems:"center",gap:6 }}>
                          (!) ABNORMAL VALUES ({warnings.length})
                        </div>
                        {warnings.map(k=>(
                          <div key={k} style={{ fontSize:12,color:"#92400e",display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                            <span>{vitalNames[k]||k}</span>
                            <span style={{ fontFamily:"monospace",fontWeight:700 }}>
                              {k==="bp"?trForm.bp:trForm[k]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary card */}
                <div style={{ background:"#fff",borderRadius:13,boxShadow:"0 2px 16px rgba(0,0,0,.09)",overflow:"hidden" }}>
                  {/* Header with ESI */}
                  <div style={{ background:selTriage?selTriage.bg:"#0b1929",padding:"14px 16px" }}>
                    <div style={{ fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",
                      color:selTriage?(selTriage.tc==="#fff"?"rgba(255,255,255,.7)":"rgba(0,0,0,.5)"):"rgba(255,255,255,.5)",marginBottom:4 }}>Triage Summary</div>
                    {selTriage ? (
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ fontSize:28,fontWeight:900,color:selTriage.tc,lineHeight:1 }}>L{selTriage.level}</div>
                        <div>
                          <div style={{ fontSize:16,fontWeight:800,color:selTriage.tc }}>{selTriage.label}</div>
                          <div style={{ fontSize:11,color:selTriage.tc,opacity:.8 }}>{selTriage.sub}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color:"rgba(255,255,255,.6)",fontSize:13 }}>No ESI level selected</div>
                    )}
                  </div>

                  {/* Patient info */}
                  <div style={{ padding:"12px 16px",borderBottom:"1px solid #f1f5f9" }}>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0b1929" }}>{active.name}</div>
                    <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace" }}>{active.queueNo} . {active.phone}</div>
                  </div>

                  {/* Vitals grid */}
                  <div style={{ padding:"12px 16px",borderBottom:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:10,fontWeight:700,color:C.slateL,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10 }}>Vitals</div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                      {[
                        ["BP",          trForm.bp,        vitalStatus.bp,    "mmHg"],
                        ["Pulse",       trForm.pulse,     vitalStatus.pulse, "bpm"],
                        ["Temperature", trForm.temp,      vitalStatus.temp,  " degC"],
                        ["Resp. Rate",  trForm.rr,        vitalStatus.rr,    "/min"],
                        ["SpO2",        trForm.spo2,      vitalStatus.spo2,  "%"],
                        ["GCS",         trForm.gcs,       vitalStatus.gcs,   "/15"],
                        ["Weight",      trForm.weight,    "empty",           "kg"],
                        ["Height",      trForm.height,    "empty",           "cm"],
                      ].map(([lbl,val,flag,unit])=>{
                        const col = vColor[flag]||vColor.empty;
                        return (
                          <div key={lbl} style={{ background:flag==="empty"?"#f8fafc":col.bg,borderRadius:8,padding:"8px 10px",border:`1px solid ${flag==="empty"?"#f1f5f9":col.border}` }}>
                            <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,marginBottom:3 }}>{lbl}</div>
                            <div style={{ fontSize:15,fontWeight:800,color:val?col.text:"#cbd5e1",lineHeight:1 }}>
                              {val||"-"}
                            </div>
                            <div style={{ fontSize:9,color:C.slateL,marginTop:1 }}>{unit}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BMI summary */}
                  {vitalStatus.bmi && (
                    <div style={{ padding:"12px 16px",borderBottom:"1px solid #f1f5f9",
                      background:vColor[vitalStatus.bmiFlag].bg }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div>
                          <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,marginBottom:2 }}>BMI</div>
                          <div style={{ fontSize:20,fontWeight:900,color:vColor[vitalStatus.bmiFlag].text,lineHeight:1 }}>{vitalStatus.bmi}</div>
                          <div style={{ fontSize:9,color:C.slateL,marginTop:1 }}>kg/m2</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:12,fontWeight:700,color:vColor[vitalStatus.bmiFlag].text }}>{vitalStatus.bmiLabel}</div>
                          {vitalStatus.bmiFlag!=="normal" && (
                            <div style={{ fontSize:10,color:vColor[vitalStatus.bmiFlag].badgeText,marginTop:2,fontWeight:600 }}>
                              {vitalStatus.bmiFlag==="critical" ? "🔴 Critical" : "(!) Abnormal"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chief complaint */}
                  {trForm.chiefComplaint && (
                    <div style={{ padding:"12px 16px",borderBottom:"1px solid #f1f5f9" }}>
                      <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,marginBottom:4 }}>Chief Complaint</div>
                      <div style={{ fontSize:12,color:"#1e293b",lineHeight:1.5 }}>"{trForm.chiefComplaint}"</div>
                    </div>
                  )}

                  {/* Nurse + readiness */}
                  <div style={{ padding:"12px 16px" }}>
                    {trForm.triageNurse && (
                      <div style={{ fontSize:11,color:C.slate,marginBottom:8 }}>
                        <span style={{ fontWeight:700 }}>Nurse:</span> {trForm.triageNurse}
                        {trForm.triageTime && <span style={{ color:C.slateL }}> . {trForm.triageTime}</span>}
                      </div>
                    )}
                    <div style={{ borderRadius:9,padding:"10px 12px",textAlign:"center",
                      background:allFilled?"#f0fdf4":"#f8fafc",
                      border:`1.5px solid ${allFilled?"#86efac":"#e2e8f0"}` }}>
                      {allFilled
                        ? <span style={{ fontSize:12,fontWeight:700,color:"#15803d" }}>[OK] Ready to save triage</span>
                        : <span style={{ fontSize:11,color:C.slateL }}>Fill all required fields to proceed</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );


  // ==========================================================================
  // PAGE: REGISTRATION
  // ==========================================================================

}
