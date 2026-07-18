import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function ForecastPage(props) {
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


    const DAYS_WINDOW = 90;
    const LEAD_TIME   = 14;
    const fcastCutoff = new Date(); fcastCutoff.setDate(fcastCutoff.getDate()-DAYS_WINDOW);
    const fcActiveBatches = (item) => (item.batches||[]).filter(b=>!b.recalled);
    const fcGetStock      = (item) => fcActiveBatches(item).reduce((s,b)=>s+b.qty,0);
    const FCAST_CATS = ["All","Drugs","Consumables","Lab Reagents","Equipment"];

    const forecastData = invItems.map(item => {
      const id = item.id||item.itemId;
      const usageTxns = invTxns.filter(t=>t.itemId===id&&t.type==="out"&&t.date&&new Date(t.date)>=fcastCutoff);
      const totalUsed  = usageTxns.reduce((s,t)=>s+Number(t.qty||0),0);
      const dailyUsage = totalUsed/DAYS_WINDOW;
      const currentStock = fcGetStock(item);
      const daysLeft = dailyUsage>0 ? Math.floor(currentStock/dailyUsage) : Infinity;
      const reorderPoint = Math.ceil(dailyUsage*LEAD_TIME*1.5);
      const recommendedOrder = Math.max(0,(item.reorderLevel||0)*3-currentStock);
      let status, statusColor, statusBg;
      if (currentStock===0)          { status="Out of Stock"; statusColor="#dc2626"; statusBg="#fee2e2"; }
      else if (daysLeft<LEAD_TIME)   { status="Order Now";    statusColor="#b45309"; statusBg="#fef3c7"; }
      else if (daysLeft<LEAD_TIME*3) { status="Order Soon";   statusColor="#0369a1"; statusBg="#dbeafe"; }
      else                           { status="Adequate";     statusColor="#166534"; statusBg="#dcfce7"; }
      return { item, id, currentStock, dailyUsage, daysLeft, reorderPoint, recommendedOrder, status, statusColor, statusBg };
    });

    const fcFiltered = forecastData.filter(d=>{
      const matchCat  = fcastCat==="All"||d.item.category===fcastCat;
      const matchSrch = !fcastSearch.trim()||d.item.name.toLowerCase().includes(fcastSearch.toLowerCase());
      return matchCat&&matchSrch;
    });
    const fcSorted = [...fcFiltered].sort((a,b)=>{
      const rank={"Out of Stock":0,"Order Now":1,"Order Soon":2,"Adequate":3};
      return (rank[a.status]??4)-(rank[b.status]??4);
    });
    return (
      <Layout page={page} setPage={setPage} patients={patients} overlay={ToastModal}>
        <TopBar title="Stock Forecasting" sub={`Demand analysis & reorder recommendations · ${DAYS_WINDOW}-day lookback · ${LEAD_TIME}-day lead time`} />
        <div style={{ padding:"0 24px 32px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
            {[
              { label:"Out of Stock", val:forecastData.filter(d=>d.status==="Out of Stock").length, color:"#dc2626", bg:"#fee2e2", icon:"🔴" },
              { label:"Order Now",    val:forecastData.filter(d=>d.status==="Order Now").length,    color:"#b45309", bg:"#fef3c7", icon:"⚠️" },
              { label:"Order Soon",   val:forecastData.filter(d=>d.status==="Order Soon").length,   color:"#0369a1", bg:"#dbeafe", icon:"📋" },
              { label:"Adequate",     val:forecastData.filter(d=>d.status==="Adequate").length,     color:"#166534", bg:"#dcfce7", icon:"✅" },
            ].map((s,i)=>(
              <div key={i} style={{ background:"#fff",border:`2px solid ${s.bg}`,borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:42,height:42,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:26,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap" }}>
            <input value={fcastSearch} onChange={e=>setFcastSearch(e.target.value)} placeholder="Search items…"
              style={{ flex:"1 1 200px",padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }} />
            <div style={{ display:"flex",gap:4 }}>
              {FCAST_CATS.map(c=>(
                <button key={c} onClick={()=>setFcastCat(c)}
                  style={{ padding:"7px 13px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:fcastCat===c?700:500,background:fcastCat===c?"#0b1929":"#f1f5f9",color:fcastCat===c?"#00e5ff":"#64748b" }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
            <div style={{ padding:"12px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>Forecast Report</span>
              <span style={{ fontSize:11,color:"#94a3b8",background:"#f1f5f9",padding:"2px 8px",borderRadius:20 }}>{fcSorted.length} items</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",minWidth:820 }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["Item","Category","Curr. Stock","Daily Usage","Days Until Stockout","Reorder Point","Rec. Order Qty","Status"].map(h=>(
                      <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fcSorted.length===0 ? (
                    <tr><td colSpan={8} style={{ textAlign:"center",padding:"40px",color:"#94a3b8" }}>No items match filter</td></tr>
                  ) : fcSorted.map((d,i)=>(
                    <tr key={d.id||i} style={{ borderBottom:"1px solid #f1f5f9" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ fontSize:13,fontWeight:600,color:"#0b1929" }}>{d.item.name}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",fontFamily:"monospace" }}>{d.item.unit}</div>
                      </td>
                      <td style={{ padding:"10px 14px",fontSize:12,color:"#475569" }}>{d.item.category}</td>
                      <td style={{ padding:"10px 14px",fontSize:13,fontWeight:700,color:d.currentStock===0?"#dc2626":d.currentStock<d.item.reorderLevel?"#d97706":"#166534" }}>{d.currentStock.toLocaleString()}</td>
                      <td style={{ padding:"10px 14px",fontSize:12,color:"#475569" }}>{d.dailyUsage>0?d.dailyUsage.toFixed(1)+"/day":<span style={{ color:"#cbd5e1" }}>No data</span>}</td>
                      <td style={{ padding:"10px 14px",fontSize:13,fontWeight:700,color:d.daysLeft===Infinity?"#94a3b8":d.daysLeft<LEAD_TIME?"#dc2626":d.daysLeft<LEAD_TIME*3?"#d97706":"#166534" }}>{d.daysLeft===Infinity?"∞":`${d.daysLeft}d`}</td>
                      <td style={{ padding:"10px 14px",fontSize:12,color:"#475569" }}>{d.reorderPoint>0?d.reorderPoint:d.item.reorderLevel||"—"}</td>
                      <td style={{ padding:"10px 14px",fontSize:13,fontWeight:700,color:"#0b1929" }}>{d.recommendedOrder>0?d.recommendedOrder.toLocaleString():<span style={{ color:"#94a3b8" }}>—</span>}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:d.statusBg,color:d.statusColor }}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    );


  // ============================================================
  // BATCH TRANSFERS PAGE
  // ============================================================

}
