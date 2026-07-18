import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function PharmacyPage(props) {
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


    const rxPatients  = patients.filter(p => p.clerking?.orders?.rx?.drugs?.length > 0);
    const pendingRx   = rxPatients.filter(p => !p.clerking?.dispensed);
    const dispensedRx = rxPatients.filter(p =>  p.clerking?.dispensed);

    const openRx = (pat) => {
      setPharmActive(pat);
      setVerifyChecks(pat.clerking?.dispensedChecks || {});
      setPharmacist(pat.clerking?.pharmacist || "");
      setPharmNotes(pat.clerking?.pharmacyNotes || "");
      setPharmErr("");
    };

    const dispense = () => {
      if (!pharmacist.trim()) { setPharmErr("Pharmacist name is required."); return; }
      const drugs = pharmActive.clerking?.orders?.rx?.drugs || [];
      const unchecked = drugs.filter(d => !verifyChecks[d.id]);
      if (unchecked.length) { setPharmErr("Please verify all " + unchecked.length + " drug(s) before dispensing."); return; }
      const clearance = checkPharmCleared(pharmActive);
      if (!clearance.cleared) { setPharmErr("\u26D4 Billing clearance failed: " + clearance.reason); return; }
      const name = pharmActive.firstName ? pharmActive.firstName + " " + pharmActive.lastName : pharmActive.name;
      const idx = patients.findIndex(p=>p.queueNo===pharmActive.queueNo);
      const rxNo = genNo("RX", idx+1);
      setPatients(prev => prev.map(x => x.queueNo === pharmActive.queueNo ? {
        ...x,
        clerking: { ...x.clerking, dispensed:true, rxNo, dispensedAt:new Date().toISOString(),
          pharmacist, pharmacyNotes:pharmNotes, dispensedChecks:verifyChecks }
      } : x));
      apiCall(`/hms/patients/${pharmActive.queueNo}`, "PUT", {
        clerking:{ ...pharmActive.clerking, dispensed:true, rxNo, dispensedAt:new Date().toISOString(), pharmacist, pharmacyNotes:pharmNotes, dispensedChecks:verifyChecks },
      }).catch(console.error);
      // Push each drug to the global dispense log (for recall tracing)
      const logEntries = drugs.map((d,i) => ({
        id: rxNo+"-"+i,
        patientId: pharmActive.id||pharmActive.queueNo,
        patientName: name,
        mrn: pharmActive.mrn||pharmActive.id||"",
        queueNo: pharmActive.queueNo,
        drugName: d.name,
        dose: d.dose||"",
        route: d.route||"",
        rxNo,
        dispensedAt: new Date().toISOString(),
        dispensedBy: pharmacist,
        notes: d.instructions||"",
      }));
      setDispenseLog(prev=>[...prev,...logEntries]);
      showToast("Prescription Dispensed", `Rx ${rxNo} - All drugs for ${name} verified and dispensed by ${pharmacist}.`, "💊", () => {
        setPharmActive(null);
      });
    };

    const printRx = (pat) => {
      const drugs = pat.clerking?.orders?.rx?.drugs || [];
      const rows = drugs.map((d,i) => '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600">' + (i+1) + '. ' + d.name + '</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">' + d.dose + '</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">' + d.route + '</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">' + d.freq + '</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">' + d.duration + '</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:12px">' + d.instructions + '</td></tr>').join("");
      const html = '<!DOCTYPE html><html><head><title>Rx</title><style>body{font-family:Palatino Linotype,serif;margin:40px;color:#1e293b}table{width:100%;border-collapse:collapse}th{background:#f8fafc;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b}</style></head><body><h2>MediCore HMS - Prescription</h2><p><b>Patient:</b> ' + (pat.firstName||pat.name) + ' ' + (pat.lastName||"") + ' &nbsp; <b>ID:</b> ' + (pat.id||"-") + ' &nbsp; <b>Consultation No:</b> ' + (pat.clerking?.consNo||"-") + ' &nbsp; <b>Rx No:</b> ' + (pat.clerking?.rxNo||"Pending") + '</p><p><b>Doctor:</b> ' + (pat.clerking?.doctorName||"-") + ' &nbsp; <b>Date:</b> ' + new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"}) + '</p>' + (pat.clerking?.allergies ? '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:8px 14px;margin-bottom:16px;color:#dc2626;font-weight:700">(!) ALLERGY: ' + pat.clerking.allergies + '</div>' : "") + '<table><thead><tr><th>Drug</th><th>Dose</th><th>Route</th><th>Freq</th><th>Duration</th><th>Instructions</th></tr></thead><tbody>' + rows + '</tbody></table>' + (pat.clerking?.dispensed ? '<div style="margin-top:16px;padding:10px;background:#f0fdf4;border-radius:8px">[OK] Dispensed by: ' + (pat.clerking.pharmacist||"-") + ' . Rx No: ' + (pat.clerking.rxNo||"-") + ' . ' + (pat.clerking.dispensedAt ? new Date(pat.clerking.dispensedAt).toLocaleString() : "-") + '</div>' : "") + '</body></html>';
      const w = window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
    };

    const drugBg = (name) => {
      const n = name.toLowerCase();
      if (n.includes("morphine")||n.includes("tramadol")||n.includes("codeine")) return { bg:"#fef2f2",col:"#dc2626",tag:"Controlled" };
      if (n.includes("heparin")||n.includes("warfarin")||n.includes("aspirin")||n.includes("clopidogrel")) return { bg:"#fff7ed",col:"#c2410c",tag:"Anticoagulant" };
      if (n.includes("amoxicillin")||n.includes("nitrofurantoin")||n.includes("ciprofloxacin")||n.includes("metronidazole")||n.includes("azithromycin")) return { bg:"#eff6ff",col:"#1d4ed8",tag:"Antibiotic" };
      if (n.includes("artemether")||n.includes("artesunate")||n.includes("quinine")||n.includes("coartem")) return { bg:"#fefce8",col:"#a16207",tag:"Antimalarial" };
      if (n.includes("amlodipine")||n.includes("lisinopril")||n.includes("losartan")||n.includes("atenolol")||n.includes("furosemide")) return { bg:"#f0f9ff",col:"#0369a1",tag:"Antihypertensive" };
      if (n.includes("metoclopramide")||n.includes("ibuprofen")||n.includes("paracetamol")||n.includes("ors")||n.includes("rehydration")) return { bg:"#f8fafc",col:"#475569",tag:"Supportive" };
      if (n.includes("gtn")||n.includes("glyceryl")) return { bg:"#fff7ed",col:"#c2410c",tag:"Nitrate" };
      return { bg:"#f8fafc",col:"#475569",tag:"Drug" };
    };

    return (
      <Layout page={page} setPage={p=>{setPharmActive(null);setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar title="Pharmacy"
          subtitle={pharmActive
            ? pharmActive.queueNo + " . " + (pharmActive.firstName||pharmActive.name) + " " + (pharmActive.lastName||"")
            : pendingRx.length + " prescription(s) pending dispensing"}
          action={
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              {pharmActive && <button onClick={()=>setPharmActive(null)} style={BtnGhost}>Back Worklist</button>}
              <button onClick={()=>setPage("queue")} style={BtnGhost}>Back Queue</button>
            </div>
          } />

        <div style={{ padding:"20px 26px" }}>

          {!pharmActive && (
            <div style={{ maxWidth:920 }}>
              {/* Stats */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
                {[
                  ["Total Rx", rxPatients.length, "#059669","#f0fdf4","💊"],
                  ["Pending Dispensing", pendingRx.length, "#d97706","#fef3c7",""],
                  ["Dispensed Today", dispensedRx.length, "#0e7490","#cffafe","[OK]"],
                  ["With Controlled Drugs", rxPatients.filter(p=>(p.clerking?.orders?.rx?.drugs||[]).some(d=>["morphine","tramadol","codeine","heparin"].some(k=>d.name.toLowerCase().includes(k)))).length, "#dc2626","#fef2f2","🔒"],
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
                  <span style={{ fontSize:13,fontWeight:800,color:"#059669" }}>🔍 Manual Patient Search</span>
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
                            <div key={p.queueNo} onClick={()=>{ openRx(p); setManualSearch(""); }}
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
                                <button style={{ padding:"5px 12px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#059669" }}>Dispense →</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>;
                })()}
              </div>
              {pendingRx.length > 0 && (<>
                <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:10 }}> Pending Dispensing ({pendingRx.length})</div>
                {pendingRx.map(p => {
                  const drugs = p.clerking?.orders?.rx?.drugs || [];
                  const sm = STATUS_META[p.status]||STATUS_META.Queued;
                  const hasControlled = drugs.some(d=>["morphine","tramadol","codeine","heparin"].some(k=>d.name.toLowerCase().includes(k)));
                  const hasAllergy = !!p.clerking?.allergies;
                  return (
                    <div key={p.queueNo} style={{ background:"#fff",borderRadius:12,padding:"16px 18px",marginBottom:12,boxShadow:"0 1px 8px rgba(0,0,0,.07)",border:"1.5px solid #e2e8f0",transition:"all .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#059669"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                        <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                          <div style={{ width:42,height:42,borderRadius:"50%",flexShrink:0,background:"hsl(" + avatarHue(p.id||p.queueNo) + ",50%,82%)",color:"hsl(" + avatarHue(p.id||p.queueNo) + ",40%,28%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800 }}>
                            {(p.firstName||p.name||"?")[0]}{(p.lastName||"")[0]||""}
                          </div>
                          <div>
                            <div style={{ fontWeight:800,fontSize:14,color:"#0b1929",marginBottom:2 }}>{p.firstName||p.name} {p.lastName||""}</div>
                            <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace",marginBottom:5 }}>{p.id||"-"} . {p.queueNo} . {calcAge(p.dateOfBirth)||"-"} yrs . {p.gender||"-"}</div>
                            <div style={{ display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:4 }}>
                              {p.billing?.invoiceNo && <span style={{ background:"#eff6ff",color:"#1d4ed8",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"monospace" }}>{p.billing.invoiceNo}</span>}
                              {p.billing?.receiptNo && <span style={{ background:"#f0fdf4",color:"#15803d",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"monospace" }}>{p.billing.receiptNo}</span>}
                              {p.billing?.billedBy && <span style={{ background:"#f8fafc",color:C.slate,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600 }}>By: {p.billing.billedBy}</span>}
                              {p.clerking?.consNo && <span style={{ background:"#f5f3ff",color:"#7c3aed",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"monospace" }}>{p.clerking.consNo}</span>}
                              {p.clerking?.labNo && <span style={{ background:"#f0fdfa",color:"#0f766e",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"monospace" }}>{p.clerking.labNo}</span>}
                            </div>
                            <div style={{ display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
                              <Badge label={p.status} color={sm.color} bg={sm.bg} dot={sm.dot} sm />
                              <span style={{ fontSize:11,color:"#475569" }}>Dr: <strong>{p.clerking?.doctorName||"-"}</strong></span>
                              <span style={{ background:"#f0fdf4",color:"#15803d",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>💊 {drugs.length} drug{drugs.length>1?"s":""}</span>
                              {hasControlled && <span style={{ background:"#fef2f2",color:"#dc2626",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>🔒 Controlled</span>}
                              {hasAllergy && <span style={{ background:"#fff7ed",color:"#c2410c",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>🚫 Allergy</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end" }}>
                          {(()=>{
                            const cl = checkPharmCleared(p);
                            return (
                              <span style={{ fontSize:10,fontWeight:700,borderRadius:6,padding:"3px 10px",
                                background:cl.cleared?"#dcfce7":"#fef2f2",
                                color:cl.cleared?"#15803d":"#dc2626" }}>
                                {cl.cleared?"[OK] Billing Cleared":"\u26D4 Billing Pending"}
                              </span>
                            );
                          })()}
                          <button onClick={()=>openRx(p)} style={{ padding:"8px 18px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#059669" }}>💊 Dispense</button>
                          <button onClick={()=>printRx(p)} style={{ ...BtnGhost,padding:"6px 14px",fontSize:11 }}>🖨️ Print Rx</button>
                        </div>
                      </div>
                      <div style={{ marginTop:10,paddingTop:10,borderTop:"1px solid #f1f5f9",display:"flex",gap:6,flexWrap:"wrap" }}>
                        {drugs.map(d => { const dc=drugBg(d.name); return (
                          <span key={d.id} style={{ background:dc.bg,color:dc.col,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:600,border:"1px solid " + dc.col + "22" }}>{d.name} {d.dose}</span>
                        ); })}
                      </div>
                    </div>
                  );
                })}
              </>)}

              {dispensedRx.length > 0 && (<>
                <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:10,marginTop:20 }}>[OK] Dispensed Today ({dispensedRx.length})</div>
                {dispensedRx.map(p => {
                  const drugs = p.clerking?.orders?.rx?.drugs || [];
                  return (
                    <div key={p.queueNo} style={{ background:"#f0fdf4",borderRadius:12,padding:"14px 18px",marginBottom:10,border:"1.5px solid #86efac",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
                      <div>
                        <div style={{ fontWeight:700,fontSize:13,color:"#14532d" }}>{p.firstName||p.name} {p.lastName||""} <span style={{ fontWeight:400,color:"#16a34a",fontSize:12 }}>. {p.queueNo}</span></div>
                        <div style={{ fontSize:11,color:"#15803d",marginTop:3 }}>
                          {p.clerking?.rxNo && <span style={{ fontFamily:"monospace",fontWeight:800,marginRight:8 }}>{p.clerking.rxNo}</span>}
                          {drugs.length} drug{drugs.length>1?"s":""} . Dispensed by {p.clerking?.pharmacist||"-"} . {p.clerking?.dispensedAt?new Date(p.clerking.dispensedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"-"}
                        </div>
                      </div>
                      <button onClick={()=>printRx(p)} style={{ ...BtnGhost,padding:"7px 16px",fontSize:12 }}>🖨️ Print</button>
                    </div>
                  );
                })}
              </>)}

              {rxPatients.length === 0 && <EmptyState icon="💊" msg="No prescriptions yet. Prescriptions appear here once a doctor saves a clerking with drugs ordered." />}
            </div>
          )}

          {pharmActive && (()=>{
            const drugs = pharmActive.clerking?.orders?.rx?.drugs || [];
            const allVerified = drugs.length > 0 && drugs.every(d => verifyChecks[d.id]);
            const alreadyDispensed = pharmActive.clerking?.dispensed;
            return (
              <div style={{ maxWidth:880 }}>
                <PatientBanner p={pharmActive} />
                <RefNumStrip p={pharmActive} />

                {/* Billing clearance banner */}
                {(()=>{
                  const cl = checkPharmCleared(pharmActive);
                  const cat = pharmActive.category;
                  const method = pharmActive.billing?.paymentMethod || "";
                  const isCash = CASH_METHODS.includes(method) || cat==="Cash";
                  return cl.cleared ? (
                    <div style={{ background:"#f0fdf4",border:"2px solid #86efac",borderRadius:10,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12 }}>
                      <span style={{ fontSize:24 }}>[OK]</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:800,fontSize:13,color:"#14532d" }}>
                          Billing Cleared - Dispense Authorised
                        </div>
                        <div style={{ fontSize:11,color:"#15803d",marginTop:3,display:"flex",gap:14,flexWrap:"wrap" }}>
                          {isCash
                            ? <span>Cash receipt confirmed  {method}</span>
                            : <span>{method||cat} scheme  Invoice prepared</span>
                          }
                          {pharmActive.billing?.invoiceNo && <span style={{ fontFamily:"monospace",fontWeight:700 }}>{pharmActive.billing.invoiceNo}</span>}
                          {pharmActive.billing?.receiptNo && <span style={{ fontFamily:"monospace",fontWeight:700 }}>Receipt: {pharmActive.billing.receiptNo}</span>}
                          {pharmActive.billing?.billedBy && <span>Billed by: <b>{pharmActive.billing.billedBy}</b></span>}
                          {pharmActive.billing?.billedAt && <span style={{ opacity:.7 }}>{new Date(pharmActive.billing.billedAt).toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:10,padding:"14px 18px",marginBottom:16 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                        <span style={{ fontSize:24 }}>\u26D4</span>
                        <div style={{ fontWeight:800,fontSize:14,color:"#dc2626" }}>Dispense Blocked - Billing Not Cleared</div>
                      </div>
                      <div style={{ fontSize:13,color:"#b91c1c",marginBottom:10,lineHeight:1.6 }}>{cl.reason}</div>
                      <div style={{ display:"flex",gap:8 }}>
                        <span style={{ background:"#fee2e2",color:"#991b1b",borderRadius:7,padding:"4px 12px",fontSize:11,fontWeight:700 }}>
                          {!pharmActive.billing?.invoiceNo ? "No Invoice" : !pharmActive.billing?.items?.some(i=>i.cat==="pharmacy"||i.id==="s13") ? "No Pharmacy Line Item" : "Payment Not Receipted"}
                        </span>
                        <span style={{ background:"#fee2e2",color:"#991b1b",borderRadius:7,padding:"4px 12px",fontSize:11,fontWeight:600 }}>
                          Please resolve in Billing before dispensing
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {pharmActive.clerking?.allergies && (
                  <div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:10,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12 }}>
                    <span style={{ fontSize:24 }}>🚫</span>
                    <div>
                      <div style={{ fontWeight:800,fontSize:13,color:"#dc2626" }}>ALLERGY ON FILE - VERIFY BEFORE DISPENSING</div>
                      <div style={{ fontSize:12,color:"#b91c1c",marginTop:2 }}>{pharmActive.clerking.allergies}</div>
                    </div>
                  </div>
                )}

                <div style={{ background:"linear-gradient(135deg,#059669,#047857)",borderRadius:12,padding:"16px 22px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:16,fontWeight:800,color:"#fff" }}>&#8478; Prescription - {pharmActive.firstName||pharmActive.name} {pharmActive.lastName||""}</div>
                    <div style={{ fontSize:12,color:"rgba(255,255,255,.65)",marginTop:4 }}>Prescribed by: {pharmActive.clerking?.doctorName||"-"} . Dx: {pharmActive.clerking?.finalDx||pharmActive.clerking?.provisionalDx||"-"} . {drugs.length} drug{drugs.length>1?"s":""}</div>
                  </div>
                  <button onClick={()=>printRx(pharmActive)} style={{ padding:"9px 18px",border:"1.5px solid rgba(255,255,255,.4)",borderRadius:9,background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700 }}>🖨️ Print Rx</button>
                </div>

                <div style={{ background:"#fff",borderRadius:12,boxShadow:"0 1px 10px rgba(0,0,0,.07)",overflow:"hidden",marginBottom:16 }}>
                  <div style={{ background:"#f8fafc",padding:"11px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>Drug Verification Checklist</div>
                    <div style={{ fontSize:12,color:allVerified?"#059669":"#94a3b8",fontWeight:700 }}>{drugs.filter(d=>verifyChecks[d.id]).length} / {drugs.length} verified</div>
                  </div>
                  {drugs.map((d,i) => {
                    const checked = !!verifyChecks[d.id];
                    const dc = drugBg(d.name);
                    return (
                      <div key={d.id} style={{ padding:"14px 18px",borderBottom:i<drugs.length-1?"1px solid #f1f5f9":"none",background:checked?"#f0fdf4":"#fff",transition:"background .15s" }}>
                        <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
                          {!alreadyDispensed
                            ? <button onClick={()=>setVerifyChecks(p=>({...p,[d.id]:!p[d.id]}))}
                                style={{ width:26,height:26,borderRadius:6,border:"2px solid " + (checked?"#059669":"#d1d5db"),background:checked?"#059669":"#fff",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",transition:"all .15s",marginTop:1 }}>
                                {checked?"v":""}
                              </button>
                            : <div style={{ width:26,height:26,borderRadius:6,background:"#059669",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff" }}>v</div>
                          }
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                              <span style={{ fontSize:14,fontWeight:800,color:checked?"#15803d":"#0b1929" }}>{d.name}</span>
                              <span style={{ background:dc.bg,color:dc.col,borderRadius:5,padding:"1px 8px",fontSize:10,fontWeight:700,border:"1px solid " + dc.col + "22" }}>{dc.tag}</span>
                              {dc.tag==="Controlled" && <span style={{ background:"#fef2f2",color:"#dc2626",borderRadius:5,padding:"1px 8px",fontSize:10,fontWeight:800 }}>🔒 CONTROLLED</span>}
                            </div>
                            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:6 }}>
                              {[["Dose",d.dose],["Route",d.route],["Frequency",d.freq],["Duration",d.duration]].map(([l,v])=>(
                                <div key={l}>
                                  <div style={{ fontSize:9,color:C.slateL,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:2 }}>{l}</div>
                                  <div style={{ fontSize:12,fontWeight:700,color:"#1e293b" }}>{v}</div>
                                </div>
                              ))}
                            </div>
                            {d.instructions && <div style={{ fontSize:11,color:C.slate,background:"#f8fafc",borderRadius:6,padding:"5px 10px",fontStyle:"italic" }}>📋 {d.instructions}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!alreadyDispensed && (() => {
                  const cl = checkPharmCleared(pharmActive);
                  return (
                  <div style={{ background:"#fff",borderRadius:12,padding:"18px",boxShadow:"0 1px 10px rgba(0,0,0,.07)",marginBottom:16 }}>
                    <ErrBox msg={pharmErr} />
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <FL label="Pharmacist / Dispenser *" ch={<input value={pharmacist} onChange={e=>setPharmacist(e.target.value)} placeholder="Full name of dispensing pharmacist" style={IS(!pharmacist&&pharmErr)} disabled={!cl.cleared} />} />
                      <FL label="Date & Time" ch={<input value={new Date().toLocaleString()} readOnly style={{ ...IS(),background:"#f8fafc",color:C.slateL,cursor:"default" }} />} />
                    </div>
                    <FL label="Dispensing Notes / Patient Counselling" ch={<textarea value={pharmNotes} onChange={e=>setPharmNotes(e.target.value)} rows={3} placeholder="e.g. Patient counselled on completing antibiotic course. Side effects discussed. Storage instructions given." style={TA()} disabled={!cl.cleared} />} />
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,gap:10 }}>
                      <div style={{ fontSize:12,color:!cl.cleared?"#dc2626":allVerified?"#059669":"#94a3b8",fontWeight:600 }}>
                        {!cl.cleared ? "\u26D4 Resolve billing before dispensing" : allVerified ? "[OK] All drugs verified - ready to dispense" : drugs.filter(d=>!verifyChecks[d.id]).length + " drug(s) not yet verified"}
                      </div>
                      <button onClick={dispense}
                        disabled={!cl.cleared}
                        style={{ padding:"12px 32px",border:"none",borderRadius:10,cursor:cl.cleared?"pointer":"not-allowed",fontFamily:"inherit",fontSize:14,fontWeight:700,color:"#fff",
                          background:!cl.cleared?"#94a3b8":allVerified?"linear-gradient(135deg,#059669,#047857)":"#94a3b8",
                          boxShadow:cl.cleared&&allVerified?"0 4px 14px rgba(0,0,0,.2)":"none",transition:"all .2s",opacity:!cl.cleared?0.6:1 }}>
                        {!cl.cleared ? "\u26D4 Billing Not Cleared" : "💊 Confirm Dispense"}
                      </button>
                    </div>
                  </div>
                  );
                })()}

                {alreadyDispensed && (
                  <div style={{ background:"#f0fdf4",border:"2px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:16 }}>
                    <div style={{ fontSize:14,fontWeight:800,color:"#14532d",marginBottom:6 }}>[OK] Prescription Already Dispensed</div>
                    <div style={{ display:"flex",gap:20,fontSize:12,color:"#15803d" }}>
                      <span>Pharmacist: <strong>{pharmActive.clerking?.pharmacist||"-"}</strong></span>
                      <span>Time: <strong>{pharmActive.clerking?.dispensedAt?new Date(pharmActive.clerking.dispensedAt).toLocaleString():"-"}</strong></span>
                    </div>
                    {pharmActive.clerking?.pharmacyNotes && <div style={{ marginTop:8,fontSize:11,color:"#166534",fontStyle:"italic" }}>Notes: {pharmActive.clerking.pharmacyNotes}</div>}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </Layout>
    );



  // ==========================================================================
  // PAGE: WARD MANAGEMENT
  // ==========================================================================

}
