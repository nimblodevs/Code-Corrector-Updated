import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function BillingPage(props) {
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


    const waiting = patients.filter(p=>p.status==="Registered");
    const isCashPat   = !active || active.category==="Cash" || CASH_METHODS.includes(active?.billing?.paymentMethod||bMethod);
    const isSchemePat = active && (active.category==="Insurance" || active.category==="Corporate");

    // Per-tab item counts for badges
    const tabCounts = {
      consult:   bItems.filter(i=>i.cat==="consultation"||i.cat==="procedure"||!["lab","radiology","pharmacy"].includes(i.cat)).length,
      lab:       bItems.filter(i=>i.cat==="lab").length,
      radiology: bItems.filter(i=>i.cat==="radiology").length,
      pharmacy:  bItems.filter(i=>i.cat==="pharmacy").length,
    };

    const addBillItem = (item) => setBItems(p=>{
      const e = p.find(i=>i.id===item.id);
      return e ? p.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i) : [...p,{...item,qty:1,addedAt:new Date().toISOString()}];
    });
    const removeBillItem = (id) => setBItems(p=>p.filter(i=>i.id!==id));
    const updateQty = (id,delta) => setBItems(p=>p.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+delta)}:i));
    const updatePrice = (id,val) => setBItems(p=>p.map(i=>i.id===id?{...i,price:Number(val)||0}:i));

    const orderedLabIds = active?.clerking?.orders?.lab?.tests || [];
    const orderedRadIds = active?.clerking?.orders?.rad?.tests || [];
    const orderedDrugs  = active?.clerking?.orders?.rx?.drugs  || [];

    const allLabTests = LAB_CATEGORIES.flatMap(c=>c.tests);
    const allRadTests = RAD_CATEGORIES.flatMap(c=>c.tests);

    // Receipt vs invoice header color
    const billingMode = isSchemePat ? "invoice" : "cash";
    const modeColor   = billingMode==="invoice" ? "#1d4ed8" : "#059669";
    const modeBg      = billingMode==="invoice" ? "#eff6ff" : "#f0fdf4";
    const modeBorder  = billingMode==="invoice" ? "#bfdbfe" : "#bbf7d0";
    const modeLabel   = billingMode==="invoice"
      ? `Invoice Billing - ${(active&&active.category)==="Corporate"?"Corporate Account":"Insurance / NHIF"}`
      : "Cash Receipt Billing";

    const BILL_TABS = [
      { key:"consult",   label:"Consultation",  icon:"steth" },
      { key:"lab",       label:"Laboratory",    icon:"lab" },
      { key:"radiology", label:"Radiology",     icon:"xray" },
      { key:"pharmacy",  label:"Pharmacy",      icon:"pill" },
    ];

    return (
      <Layout page={page} setPage={p=>{setActive(null);setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar title="Billing"
          subtitle={active ? `${active.queueNo} . ${active.firstName||active.name||""} ${active.lastName||""}` : `${waiting.length} patient(s) awaiting billing`}
          action={
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              {active && <button onClick={()=>setActive(null)} style={BtnGhost}>Back List</button>}
              <button onClick={()=>{setActive(null);setPage("queue");}} style={BtnGhost}>Back Queue</button>
            </div>
          } />

        <div style={{ padding:"20px 26px" }}>
          {!active ? (
            <div>
              {/* ── Manual Patient Search ───────────────────── */}
              <div style={{ marginBottom:18,background:"#fff",borderRadius:12,padding:"15px 18px",boxShadow:"0 2px 12px rgba(0,0,0,.07)",border:"1.5px solid #bae6fd" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <span style={{ fontSize:13,fontWeight:800,color:"#1d4ed8" }}>🔍 Manual Patient Search</span>
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
                            <div key={p.queueNo} onClick={()=>{ goBilling(p); setManualSearch(""); }}
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
                                <button style={{ padding:"5px 12px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#1d4ed8" }}>Bill →</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>;
                })()}
              </div>
              <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:12 }}>Patients Awaiting Billing</div>
              {waiting.length===0
                ? <EmptyState icon="💳" msg="No patients currently awaiting billing." />
                : waiting.map(p=>{
                  const cc = p.category==="Insurance"?{bg:"#dbeafe",c:"#1d4ed8"}:p.category==="Corporate"?{bg:"#dcfce7",c:"#15803d"}:{bg:"#fef9c4",c:"#b45309"};
                  const hasOrders = p.clerking?.orders;
                  return (
                    <div key={p.queueNo} onClick={()=>goBilling(p)}
                      style={{ background:"#fff",borderRadius:11,padding:"14px 18px",marginBottom:10,
                        boxShadow:"0 1px 6px rgba(0,0,0,.07)",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                        border:"1.5px solid #e2e8f0",transition:"all .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#3b82f6"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",background:"#dbeafe",color:"#1d4ed8",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:14,fontWeight:900 }}>{p.queueNo}</div>
                        <div>
                          <div style={{ fontWeight:700,fontSize:14,color:"#0b1929" }}>{p.firstName} {p.lastName}</div>
                          <div style={{ fontSize:11,color:C.slateL,fontFamily:"monospace" }}>{p.id} . {p.phone}</div>
                          {hasOrders && <div style={{ fontSize:11,color:"#7c3aed",marginTop:3 }}>
                            {[p.clerking.orders.lab&&`${p.clerking.orders.lab.tests.length} lab`,p.clerking.orders.rad&&`${p.clerking.orders.rad.tests.length} radiology`,p.clerking.orders.rx&&`${p.clerking.orders.rx.drugs.length} drugs`].filter(Boolean).join(" . ")}
                          </div>}
                        </div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <span style={{ background:cc.bg,color:cc.c,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700 }}>{p.category}</span>
                        <button style={{ ...BtnPrimary,padding:"8px 18px",fontSize:12,background:"#1d4ed8" }}>💳 Bill Now</button>
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
              {/* Billing mode banner */}
              <div style={{ background:modeBg,border:`1.5px solid ${modeBorder}`,borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:20 }}>{billingMode==="invoice"?"📋":"🧾"}</span>
                  <div>
                    <div style={{ fontSize:13,fontWeight:800,color:modeColor }}>{modeLabel}</div>
                    <div style={{ fontSize:11,color:modeColor,opacity:.7 }}>
                      {billingMode==="invoice" ? "Invoice prepared for scheme - no cash receipt required at this stage." : "Patient pays directly - receipt issued on payment."}
                    </div>
                  </div>
                </div>
                <select value={bMethod} onChange={e=>setBMethod(e.target.value)}
                  style={{ ...SS,width:"auto",fontWeight:700,color:modeColor,border:`1.5px solid ${modeBorder}`,background:modeBg }}>
                  {["Cash","M-Pesa","POS / Card","Bank Transfer","NHIF","SHA / Insurance","Corporate Account","Cheque"].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>

              <ErrBox msg={bErr} />

              <div style={{ display:"grid",gridTemplateColumns:"1fr 320px",gap:18,alignItems:"start" }}>
                {/* LEFT - Tabbed service selector */}
                <div>
                  {/* Tab bar */}
                  <div style={{ display:"flex",gap:4,background:"#fff",borderRadius:12,padding:"5px",boxShadow:"0 1px 6px rgba(0,0,0,.07)",marginBottom:16 }}>
                    {BILL_TABS.map(t=>{
                      const active_ = bTab===t.key;
                      const cnt = tabCounts[t.key];
                      return (
                        <button key={t.key} onClick={()=>setBTab(t.key)}
                          style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 10px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:active_?700:500,transition:"all .15s",
                            background:active_?"#0b1929":"transparent",color:active_?"#fff":"#64748b" }}>
                          {emojiOf(t.icon)} {t.label}
                          {cnt>0 && <span style={{ background:active_?"rgba(255,255,255,.25)":"#e0f2fe",color:active_?"#fff":"#0369a1",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:800 }}>{cnt}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* CONSULT & PROCEDURES tab */}
                  {bTab==="consult" && (
                    <Card>
                      <Sec accent="#1d4ed8">Consultation & Procedures</Sec>
                      <CatalogueSearch
                        cats={["consultation","procedure"]}
                        selected={bItems.map(i=>i.id)}
                        onAdd={item=>addBillItem({...item,qty:1})}
                        onRemove={id=>removeBillItem(id)}
                        placeholder="Search consultations and procedures..."
                        accentColor="#1d4ed8"
                        showPrice
                      />
                    </Card>
                  )}

                  {/* LAB tab */}
                  {bTab==="lab" && (
                    <div>
                      {orderedLabIds.length>0 && (
                        <div style={{ background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"12px 14px",marginBottom:12 }}>
                          <div style={{ fontSize:12,fontWeight:700,color:"#14532d",marginBottom:8 }}>🧪 From Doctor's Lab Order</div>
                          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                            {orderedLabIds.map(id=>{
                              const t = ITEM_REGISTRY[id];
                              if (!t) return null;
                              const inBill = bItems.find(i=>i.id===id);
                              return (
                                <button key={id} onClick={()=>!inBill&&addBillItem({...t,qty:1,cat:"lab",fromOrder:true})}
                                  style={{ padding:"5px 10px",borderRadius:7,border:inBill?"1.5px solid #22c55e":"1.5px solid #86efac",background:inBill?"#dcfce7":"#fff",cursor:inBill?"default":"pointer",fontSize:11,fontWeight:600,color:inBill?"#15803d":"#166534",display:"flex",alignItems:"center",gap:5 }}>
                                  {inBill?"v":"+"}  {t.name} <span style={{ color:"#059669",fontWeight:700 }}>{fmtN(t.price||0)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <Card>
                        <CatalogueSearch
                          cats={["lab"]}
                          selected={bItems.map(i=>i.id)}
                          onAdd={item=>addBillItem({...item,qty:1,cat:"lab"})}
                          onRemove={id=>removeBillItem(id)}
                          placeholder="Search 1000+ lab tests - FBC, LFT, troponin, cultures..."
                          accentColor="#0e7490"
                          showPrice
                        />
                      </Card>
                    </div>
                  )}

                  {/* RADIOLOGY tab */}
                  {bTab==="radiology" && (
                    <div>
                      {orderedRadIds.length>0 && (
                        <div style={{ background:"#f5f3ff",border:"1.5px solid #c4b5fd",borderRadius:10,padding:"12px 14px",marginBottom:12 }}>
                          <div style={{ fontSize:12,fontWeight:700,color:"#4c1d95",marginBottom:8 }}>🩻 From Doctor's Radiology Order</div>
                          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                            {orderedRadIds.map(id=>{
                              const t = ITEM_REGISTRY[id];
                              if (!t) return null;
                              const inBill = bItems.find(i=>i.id===id);
                              return (
                                <button key={id} onClick={()=>!inBill&&addBillItem({...t,qty:1,cat:"radiology",fromOrder:true})}
                                  style={{ padding:"5px 10px",borderRadius:7,border:inBill?"1.5px solid #22c55e":"1.5px solid #c4b5fd",background:inBill?"#dcfce7":"#fff",cursor:inBill?"default":"pointer",fontSize:11,fontWeight:600,color:inBill?"#15803d":"#4c1d95",display:"flex",alignItems:"center",gap:5 }}>
                                  {inBill?"v":"+"}  {t.name} <span style={{ color:"#7c3aed",fontWeight:700 }}>{fmtN(t.price||0)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <Card>
                        <CatalogueSearch
                          cats={["radiology"]}
                          selected={bItems.map(i=>i.id)}
                          onAdd={item=>addBillItem({...item,qty:1,cat:"radiology"})}
                          onRemove={id=>removeBillItem(id)}
                          placeholder="Search imaging - X-Ray, Ultrasound, CT, MRI, Echo..."
                          accentColor="#7c3aed"
                          showPrice
                        />
                      </Card>
                    </div>
                  )}

                  {/* PHARMACY tab */}
                  {bTab==="pharmacy" && (
                    <div>
                      {orderedDrugs.length>0 && (
                        <Card mb={12}>
                          <Sec accent="#059669">💊 Prescribed Drugs - From Doctor's Order</Sec>
                          <div style={{ display:"grid",gridTemplateColumns:"1fr",gap:6 }}>
                            {orderedDrugs.map(d=>{
                              const itemId = `drug_${d.id}`;
                              const inBill  = bItems.find(i=>i.id===itemId);
                              const price   = d.price || getDrugPrice(d.name);
                              return (
                                <div key={d.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:inBill?"1.5px solid #22c55e":"1.5px solid #e2e8f0",background:inBill?"#f0fdf4":"#fff" }}>
                                  <div style={{ flex:1,minWidth:0 }}>
                                    <div style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>{d.name} <span style={{ fontSize:11,fontWeight:500,color:C.slateL }}>{d.dose}  {d.route}  {d.freq}</span></div>
                                    <div style={{ fontSize:10,color:C.slateL,marginTop:2 }}>Duration: {d.duration}</div>
                                  </div>
                                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                    {inBill ? (
                                      <>
                                        <input type="number" value={inBill.price} min="0"
                                          onChange={e=>updatePrice(itemId,e.target.value)}
                                          style={{ ...IS(),width:90,fontSize:12,fontWeight:700,color:"#059669",textAlign:"right" }}
                                          onClick={e=>e.stopPropagation()} />
                                        <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                                          <button onClick={()=>updateQty(itemId,-1)} style={{ width:22,height:22,borderRadius:5,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:13 }}>-</button>
                                          <span style={{ fontSize:13,fontWeight:700,minWidth:20,textAlign:"center" }}>{inBill.qty}</span>
                                          <button onClick={()=>updateQty(itemId,1)} style={{ width:22,height:22,borderRadius:5,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:13 }}>+</button>
                                        </div>
                                        <span style={{ fontSize:12,fontWeight:800,color:"#059669",minWidth:70,textAlign:"right" }}>{fmtN(inBill.price*inBill.qty)}</span>
                                        <button onClick={()=>removeBillItem(itemId)} style={{ background:"#fee2e2",border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",fontSize:12,color:"#dc2626",fontWeight:700 }}>x</button>
                                      </>
                                    ) : (
                                      <>
                                        <span style={{ fontSize:12,color:"#059669",fontWeight:700 }}>{fmtN(price)}</span>
                                        <button onClick={()=>addBillItem({id:itemId,name:`${d.name} ${d.dose}`,price,qty:1,cat:"pharmacy",fromOrder:true})}
                                          style={{ padding:"5px 14px",border:"none",borderRadius:7,background:"#059669",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit" }}>+ Add</button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      )}
                      <Card>
                        <CatalogueSearch
                          cats={["pharmacy"]}
                          selected={bItems.map(i=>i.id)}
                          onAdd={item=>addBillItem({...item,qty:1,cat:"pharmacy"})}
                          onRemove={id=>removeBillItem(id)}
                          placeholder="Search 10,000+ drugs - amoxicillin, IV fluids, insulin..."
                          accentColor="#059669"
                          showPrice
                        />
                      </Card>
                    </div>
                  )}

                  {/* All bill items summary table */}
                  {bItems.length>0 && (
                    <Card mb={0}>
                      <Sec accent="#059669">All Bill Items ({bItems.length})</Sec>
                      <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead><tr style={{ background:"#f8fafc" }}>
                          {["#","Service / Item","Cat","Date Added","Qty","Unit Price","Total",""].map(h=><th key={h} style={{ padding:"7px 8px",textAlign:"left",fontSize:9,fontWeight:700,color:C.slateL,fontFamily:"monospace",letterSpacing:.8 }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {bItems.map((it,i)=>{
                            const catColor = it.cat==="lab"?"#0e7490":it.cat==="radiology"?"#7c3aed":it.cat==="pharmacy"?"#059669":"#1d4ed8";
                            const catBg    = it.cat==="lab"?"#cffafe":it.cat==="radiology"?"#ede9fe":it.cat==="pharmacy"?"#dcfce7":"#dbeafe";
                            return (
                              <tr key={it.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                                <td style={{ padding:"8px",fontSize:11,color:C.slateL,fontFamily:"monospace" }}>{i+1}</td>
                                <td style={{ padding:"8px",fontSize:12,fontWeight:600 }}>
                                  {it.name}
                                  {it.fromOrder && <span style={{ marginLeft:6,fontSize:9,background:"#fef9c3",color:"#b45309",borderRadius:4,padding:"1px 5px",fontWeight:700 }}>AUTO</span>}
                                </td>
                                <td style={{ padding:"8px" }}><span style={{ background:catBg,color:catColor,borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700,textTransform:"uppercase" }}>{it.cat||"-"}</span></td>
                                <td style={{ padding:"8px",fontSize:10,color:C.slateL,fontFamily:"monospace",whiteSpace:"nowrap" }}>
                                  {(()=>{ const d=it.addedAt||active.billing?.billedAt||new Date().toISOString(); return <div style={{ fontWeight:600,color:"#1e293b",fontSize:10 }}>{new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>; })()}
                                </td>
                                <td style={{ padding:"8px" }}>
                                  <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                                    <button onClick={()=>updateQty(it.id,-1)} style={{ width:20,height:20,borderRadius:4,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:12 }}>-</button>
                                    <span style={{ fontSize:12,fontWeight:700,minWidth:16,textAlign:"center" }}>{it.qty}</span>
                                    <button onClick={()=>updateQty(it.id,1)} style={{ width:20,height:20,borderRadius:4,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:12 }}>+</button>
                                  </div>
                                </td>
                                <td style={{ padding:"8px" }}>
                                  <input type="number" value={it.price} min="0" onChange={e=>updatePrice(it.id,e.target.value)}
                                    style={{ width:80,padding:"4px 6px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:12,fontFamily:"monospace",fontWeight:600,color:"#059669" }} />
                                </td>
                                <td style={{ padding:"8px",fontSize:13,fontWeight:700,color:"#059669",fontFamily:"monospace" }}>{fmtN(it.price*it.qty)}</td>
                                <td style={{ padding:"8px" }}><button onClick={()=>removeBillItem(it.id)} style={{ background:"#fee2e2",border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",fontSize:12,color:"#dc2626",fontWeight:700 }}>x</button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Card>
                  )}
                </div>

                {/* RIGHT - Invoice / Receipt panel */}
                <div style={{ position:"sticky",top:70 }}>
                  <Card mb={14}>
                    {/* Billing ID Header */}
                    <div style={{ background:modeColor,borderRadius:10,padding:"14px 16px",marginBottom:14,color:"#fff" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8 }}>
                        <div>
                          <div style={{ fontSize:9,fontFamily:"monospace",letterSpacing:1.5,textTransform:"uppercase",opacity:.65,marginBottom:3 }}>
                            Invoice No.
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <div style={{ fontSize:18,fontWeight:900,fontFamily:"monospace",letterSpacing:.5 }}>
                              {active.billing?.invoiceNo || genNo("INV", patients.findIndex(p=>p.queueNo===active.queueNo)+1)}
                            </div>
                            {active.billing?.invoiceNo && (
                              <span style={{ fontSize:9,background:"rgba(255,255,255,.25)",borderRadius:4,padding:"2px 7px",fontWeight:800,letterSpacing:.5 }}>
                                SAVED
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          {(billingMode==="cash" || active.billing?.receiptNo) && (
                            <>
                              <div style={{ fontSize:9,fontFamily:"monospace",letterSpacing:1.5,textTransform:"uppercase",opacity:.65,marginBottom:3 }}>
                                Receipt No.
                              </div>
                              <div style={{ fontSize:14,fontWeight:800,fontFamily:"monospace",opacity:.9 }}>
                                {active.billing?.receiptNo || genNo("REC", patients.findIndex(p=>p.queueNo===active.queueNo)+1)}
                              </div>
                            </>
                          )}
                          {active.billing?.paid && (
                            <div style={{ marginTop:6,fontSize:10,background:"rgba(255,255,255,.2)",borderRadius:5,padding:"2px 8px",fontWeight:800,letterSpacing:.5,display:"inline-block" }}>
                              ✅ PAID | {active.billing.paymentMethod}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize:10,opacity:.6,borderTop:"1px solid rgba(255,255,255,.2)",paddingTop:6,marginTop:4,display:"flex",justifyContent:"space-between" }}>
                        <span>{active.firstName||active.name} {active.lastName||""}  |  {active.id||active.queueNo}</span>
                        <span style={{ textAlign:"right" }}>
                          <span style={{ opacity:.7,marginRight:4 }}>Bill Date:</span>
                          <strong>
                            {active.billing?.billedAt
                              ? new Date(active.billing.billedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
                              : new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
                            }
                            {" "}
                            {active.billing?.billedAt
                              ? new Date(active.billing.billedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
                              : new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
                            }
                          </strong>
                        </span>
                      </div>
                      {active.billing?.billedBy && (
                        <div style={{ fontSize:10,opacity:.55,marginTop:4 }}>
                          Billed by: {active.billing.billedBy}
                        </div>
                      )}
                    </div>

                    {/* Breakdown by category */}
                    {["consultation","lab","radiology","pharmacy"].map(cat=>{
                      const catItems = bItems.filter(i=>i.cat===cat||(cat==="consultation"&&!["lab","radiology","pharmacy"].includes(i.cat)));
                      if (!catItems.length) return null;
                      const catTotal = catItems.reduce((s,i)=>s+i.price*i.qty,0);
                      const catLabel = cat==="consultation"?"Consultation":cat==="lab"?"Laboratory":cat==="radiology"?"Radiology":"Pharmacy";
                      const catColor2 = cat==="lab"?"#0e7490":cat==="radiology"?"#7c3aed":cat==="pharmacy"?"#059669":"#1d4ed8";
                      return (
                        <div key={cat} style={{ marginBottom:10 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                            <span style={{ fontSize:10,fontWeight:700,color:catColor2,textTransform:"uppercase",letterSpacing:.8,fontFamily:"monospace" }}>{catLabel} ({catItems.length})</span>
                            <span style={{ fontSize:12,fontWeight:700,color:catColor2,fontFamily:"monospace" }}>{fmtN(catTotal)}</span>
                          </div>
                          {catItems.map(i=>(
                            <div key={i.id} style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:C.slate,marginBottom:2,paddingLeft:8 }}>
                              <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"65%" }}>{i.name}{i.qty>1?` x${i.qty}`:""}</span>
                              <span style={{ fontFamily:"monospace",fontWeight:600 }}>{fmtN(i.price*i.qty)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}

                    <div style={{ borderTop:"2px solid #f1f5f9",paddingTop:10,marginBottom:10 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:C.slate,marginBottom:6 }}>
                        <span>Subtotal</span><span style={{ fontWeight:700,fontFamily:"monospace" }}>{fmtN(bSub)}</span>
                      </div>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                        <span style={{ fontSize:12,color:C.slate }}>Discount (KES)</span>
                        <input type="number" value={bDisc} onChange={e=>setBDisc(e.target.value)} min="0"
                          style={{ width:90,padding:"4px 8px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:12,fontFamily:"monospace",textAlign:"right" }} />
                      </div>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:19,fontWeight:900,paddingTop:8,borderTop:"2px solid #f1f5f9",marginBottom:14 }}>
                        <span>Total</span><span style={{ color:"#059669",fontFamily:"monospace" }}>{fmtN(bTotal)}</span>
                      </div>
                    </div>

                    {/* Billing Officer field */}
                    <div style={{ background:"#f8fafc",borderRadius:8,padding:"10px 12px",marginBottom:12,border:"1.5px solid "+(!bOfficer&&bErr?"#fca5a5":"#e2e8f0") }}>
                      <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>
                        Billing Officer / Cashier *
                      </div>
                      <input
                        value={bOfficer}
                        onChange={e=>setBOfficer(e.target.value)}
                        placeholder="Full name of officer processing this bill"
                        style={{ ...IS(!bOfficer&&bErr),width:"100%",boxSizing:"border-box" }}
                      />
                    </div>

                    <div style={{ marginBottom:14 }}>
                      <label style={{ fontSize:10,color:C.slateL,fontFamily:"monospace",letterSpacing:.8,textTransform:"uppercase",display:"block",marginBottom:4 }}>Note</label>
                      <textarea value={bNote} onChange={e=>setBNote(e.target.value)} rows={2} style={TA()} />
                    </div>

                    {billingMode==="cash" ? (<>
                      <button onClick={()=>saveBilling(true)}
                        style={{ ...BtnGreen,width:"100%",padding:"12px",fontSize:14,marginBottom:8 }}>
                        🧾 Confirm Receipt - Mark Paid
                      </button>
                      <button onClick={()=>saveBilling(false)}
                        style={{ ...BtnGhost,width:"100%",padding:"11px",fontSize:13 }}>
                        📋 Save Invoice (Unpaid)
                      </button>
                    </>) : (<>
                      <button onClick={()=>saveBilling(false)}
                        style={{ ...BtnPrimary,width:"100%",padding:"12px",fontSize:14,marginBottom:8,background:"#1d4ed8" }}>
                        📋 Raise Invoice - Send to Scheme
                      </button>
                      <button onClick={()=>saveBilling(true)}
                        style={{ ...BtnGreen,width:"100%",padding:"11px",fontSize:13 }}>
                        [OK] Mark as Paid by Scheme
                      </button>
                    </>)}
                  </Card>

                  {active.triage && (
                    <div style={{ background:"#f0fdf4",borderRadius:10,padding:"12px",border:"1px solid #bbf7d0",fontSize:12 }}>
                      <div style={{ fontWeight:700,color:"#166534",marginBottom:6 }}>🩺 Triage Summary</div>
                      {[["BP",active.triage.bp+" mmHg"],["Pulse",active.triage.pulse+" bpm"],["Temp",active.triage.temp+" degC"],["SpO2",active.triage.spo2+"%"],["Weight",active.triage.weight?(active.triage.weight+" kg"):"—"],["BMI",(()=>{const w=parseFloat(active.triage.weight),h=parseFloat(active.triage.height);return (w&&h)?(w/((h/100)**2)).toFixed(1)+" kg/m²":"—";})()]].map(([l,v])=>(
                        <div key={l} style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}><span style={{ color:"#64748b" }}>{l}</span><span style={{ fontWeight:700 }}>{v}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    );


  // ==========================================================================
  // PAGE: DOCTOR
  // ==========================================================================

}
