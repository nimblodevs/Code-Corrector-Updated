import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch, CopyButton } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function CataloguePage(props) {
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


    const fmtMoney = (n) => "KES "+Number(n||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2});
    const catActiveBatches = (item) => (item.batches||[]).filter(b=>!b.recalled);
    const catGetStock      = (item) => catActiveBatches(item).reduce((s,b)=>s+b.qty,0);
    const catGetUnitCost   = (item) => { const bs=catActiveBatches(item); return bs.length?bs[bs.length-1].unitCost:0; };
    const LAB_CATS = ["Lab Reagents"];
    const pharmItems = invItems.filter(it=>!LAB_CATS.includes(it.category));
    const labItems   = invItems.filter(it=>LAB_CATS.includes(it.category));
    const activeList = catTab==="pharmacy" ? pharmItems : labItems;
    const catFiltered = activeList.filter(it=>{
      if (!catSearch.trim()) return true;
      const q = catSearch.toLowerCase();
      return it.name.toLowerCase().includes(q) ||
        (it.id||it.itemId||"").toLowerCase().includes(q) ||
        (it.supplier||"").toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q);
    });
    const savePrice = () => {
      if (!catEditItem) return;
      const price = parseFloat(catEditPrice);
      if (isNaN(price)||price<0) return;
      setInvItems(prev=>prev.map(it=>{
        if ((it.id||it.itemId)!==(catEditItem.id||catEditItem.itemId)) return it;
        return { ...it, listPrice:price, batches:(it.batches||[]).map(b=>({...b,unitCost:price})) };
      }));
      apiCall(`/hms/inventory/${catEditItem.id||catEditItem.itemId}`,"PATCH",{ listPrice:price }).catch(()=>{});
      if (window.showToastNotification) {
        window.showToastNotification(`Price for ${catEditItem.name} corrected to KES ${price.toLocaleString()}`, "success");
      }
      setCatEditItem(null); setCatEditPrice("");
    };
    return (
      <Layout page={page} setPage={setPage} patients={patients} overlay={ToastModal}>
        <TopBar title="Master Price Catalogue" sub="Unified drug, consumable and reagent price list with edit capability" />
        <div style={{ padding:"0 24px 32px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
            {[
              { label:"Total Items",    val:invItems.length, color:"#0ea5e9", bg:"#f0f9ff", icon:"📦" },
              { label:"Pharmacy Items", val:pharmItems.length, color:"#7c3aed", bg:"#f5f3ff", icon:"💊" },
              { label:"Lab Reagents",   val:labItems.length, color:"#0d9488", bg:"#f0fdfa", icon:"🧪" },
              { label:"Avg Unit Cost",  val:invItems.length ? fmtMoney(invItems.reduce((s,it)=>s+catGetUnitCost(it),0)/invItems.length) : "—", color:"#f59e0b", bg:"#fffbeb", icon:"💰" },
            ].map((s,i)=>(
              <div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:42,height:42,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:20,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
            <div style={{ padding:"14px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
              <div style={{ display:"flex",gap:4 }}>
                {[{key:"pharmacy",label:"💊 Pharmacy"},{key:"lab",label:"🧪 Laboratory"}].map(t=>(
                  <button key={t.key} onClick={()=>{ setCatTab(t.key); setCatSearch(""); }}
                    style={{ padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:catTab===t.key?700:500,background:catTab===t.key?"#0b1929":"#f1f5f9",color:catTab===t.key?"#00e5ff":"#64748b" }}>{t.label}</button>
                ))}
              </div>
              <input value={catSearch} onChange={e=>setCatSearch(e.target.value)}
                placeholder={`Search ${catTab==="pharmacy"?"pharmacy":"lab"} items…`}
                style={{ flex:1,minWidth:180,padding:"7px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none" }} />
              <span style={{ fontSize:11,color:"#94a3b8" }}>{catFiltered.length} items</span>
            </div>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["#","Item Name","Category","Unit","Supplier","Curr. Stock","Unit Cost (KES)","Status",""].map(h=>(
                    <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0",textTransform:"uppercase",letterSpacing:.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catFiltered.length===0 ? (
                  <tr><td colSpan={9} style={{ textAlign:"center",padding:"36px",color:"#94a3b8" }}>No items found</td></tr>
                ) : catFiltered.map((it,i)=>{
                  const stock = catGetStock(it);
                  const cost  = it.listPrice || catGetUnitCost(it);
                  const low   = stock>0&&stock<it.reorderLevel;
                  const out   = stock===0;
                  return (
                    <tr key={it.id||it.itemId||i} style={{ borderBottom:"1px solid #f1f5f9" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"10px 14px",fontSize:11,color:"#94a3b8" }}>{i+1}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ fontSize:13,fontWeight:600,color:"hsl(var(--foreground))" }}>{it.name}</div>
                        <div style={{ fontSize:10,color:"hsl(var(--muted-foreground))",fontFamily:"monospace",display:"flex",alignItems:"center" }}>
                          <span>{it.id||it.itemId}</span>
                          <CopyButton text={it.id||it.itemId} label="Item Code" style={{ marginLeft: "6px", padding: "1px 4px" }} />
                        </div>
                      </td>
                      <td style={{ padding:"10px 14px",fontSize:12,color:"#475569" }}>{it.category}</td>
                      <td style={{ padding:"10px 14px",fontSize:12,color:"#475569" }}>{it.unit||"—"}</td>
                      <td style={{ padding:"10px 14px",fontSize:12,color:"#475569" }}>{it.supplier||"—"}</td>
                      <td style={{ padding:"10px 14px",fontSize:13,fontWeight:700,color:out?"#dc2626":low?"#d97706":"#166534" }}>{stock.toLocaleString()}</td>
                      <td style={{ padding:"10px 14px",fontSize:13,fontWeight:700,color:"#0b1929" }}>{cost>0?fmtMoney(cost):"—"}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:out?"#fee2e2":low?"#fef3c7":"#dcfce7",color:out?"#dc2626":low?"#92400e":"#166534" }}>
                          {out?"Out of Stock":low?"Low Stock":"In Stock"}
                        </span>
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <button onClick={()=>{ setCatEditItem(it); setCatEditPrice(String(cost)); }}
                          style={{ padding:"4px 12px",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,background:"#e0f2fe",color:"#0369a1" }}>Edit Price</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {catEditItem && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
            <div style={{ background:"#fff",borderRadius:16,padding:"28px 32px",width:380,boxShadow:"0 20px 60px rgba(0,0,0,.25)" }}>
              <div style={{ fontSize:16,fontWeight:800,color:"#0b1929",marginBottom:4 }}>Edit Unit Price</div>
              <div style={{ fontSize:12,color:"#64748b",marginBottom:20 }}>{catEditItem.name}</div>
              <label style={{ fontSize:12,fontWeight:600,color:"#475569",display:"block",marginBottom:6 }}>Unit Cost / Selling Price (KES)</label>
              <input value={catEditPrice} onChange={e=>setCatEditPrice(e.target.value)} type="number" min="0" step="0.01" autoFocus
                onKeyDown={e=>e.key==="Enter"&&savePrice()}
                style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
              <div style={{ display:"flex",gap:10,marginTop:20 }}>
                <button onClick={savePrice} style={{ flex:1,padding:"10px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,background:"#0b1929",color:"#00e5ff" }}>Save Price</button>
                <button onClick={()=>{ setCatEditItem(null); setCatEditPrice(""); }} style={{ padding:"10px 18px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,background:"#fff",color:"#475569" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    );


  // ============================================================
  // STOCK FORECASTING PAGE
  // ============================================================

}
