import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function ReportsPage(props) {
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


    const total      = patients.length;
    const completed  = patients.filter(p=>p.status==="Completed").length;
    const admitted   = patients.filter(p=>p.admitted && !p.admission?.discharged).length;
    const discharged = patients.filter(p=>p.admission?.discharged).length;
    const labDone    = patients.filter(p=>p.clerking?.labResults && Object.keys(p.clerking.labResults).length>0).length;
    const dispensed  = patients.filter(p=>p.clerking?.dispensed).length;
    const allBilled  = patients.filter(p=>p.billing?.invoiceNo);
    const totalRev   = allBilled.reduce((s,p)=>s+(p.billing.paid?(p.billing.items||[]).reduce((a,i)=>a+i.price*i.qty,0)-(p.billing.discount||0):0),0);
    const invRaised  = allBilled.reduce((s,p)=>s+(!p.billing.paid?(p.billing.items||[]).reduce((a,i)=>a+i.price*i.qty,0)-(p.billing.discount||0):0),0);
    const critFlags  = patients.reduce((n,p)=>n+Object.values(p.clerking?.labResults||{}).filter(r=>r.flag==="critical").length,0);

    const revByCat={}, payMethods={}, catBreak={}, triageLevels={}, docWork={}, labOrdered={};
    allBilled.forEach(p=>(p.billing.items||[]).forEach(i=>{ const c=i.cat||"other"; if(!revByCat[c]) revByCat[c]={total:0,count:0}; revByCat[c].total+=i.price*i.qty; revByCat[c].count++; }));
    allBilled.filter(p=>p.billing.paid).forEach(p=>{ const m=p.billing.paymentMethod||"Unknown"; payMethods[m]=(payMethods[m]||0)+1; });
    patients.forEach(p=>{ const c=p.category||"Unknown"; catBreak[c]=(catBreak[c]||0)+1; });
    patients.filter(p=>p.triage?.level).forEach(p=>{ triageLevels[p.triage.level]=(triageLevels[p.triage.level]||0)+1; });
    patients.filter(p=>p.clerking?.doctorName).forEach(p=>{ const d=p.clerking.doctorName; if(!docWork[d]) docWork[d]={name:d,patients:0,lab:0,rx:0}; docWork[d].patients++; if(p.clerking.orders?.lab) docWork[d].lab++; if(p.clerking.orders?.rx) docWork[d].rx++; });
    const allLabTests2=LAB_CATEGORIES.flatMap(c=>c.tests);
    patients.forEach(p=>(p.clerking?.orders?.lab?.tests||[]).forEach(id=>{ const t=allLabTests2.find(x=>x.id===id); const nm=t?.name||id; labOrdered[nm]=(labOrdered[nm]||0)+1; }));

    const StatCard = ({icon,label,value,sub,color,bg}) => (
      <div style={{ background:"#fff",borderRadius:12,padding:"16px",boxShadow:"0 1px 8px rgba(0,0,0,.07)",display:"flex",alignItems:"center",gap:14 }}>
        <div style={{ width:46,height:46,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:26,fontWeight:900,color,lineHeight:1 }}>{value}</div>
          <div style={{ fontSize:11,fontWeight:700,color:"#0b1929",marginTop:2 }}>{label}</div>
          {sub && <div style={{ fontSize:10,color:C.slateL,marginTop:1 }}>{sub}</div>}
        </div>
      </div>
    );
    const BarRow = ({label,value,max,color,fmt}) => {
      const pct=max>0?Math.round(value/max*100):0;
      return (
        <div style={{ marginBottom:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
            <span style={{ fontSize:12,color:"#1e293b",fontWeight:600 }}>{label}</span>
            <span style={{ fontSize:12,fontFamily:"monospace",fontWeight:700,color }}>{fmt?fmt(value):value}</span>
          </div>
          <div style={{ height:6,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
            <div style={{ height:"100%",width:pct+"%",background:color,borderRadius:4 }}/>
          </div>
        </div>
      );
    };

    return (
      <Layout page={page} setPage={setPage} patients={patients} overlay={ToastModal}>
        <TopBar title="Reports & Analytics"
          subtitle={"Today - "+new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          action={<button onClick={()=>setPage("queue")} style={BtnGhost}>Back Queue</button>} />
        <div style={{ padding:"20px 26px" }}>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16 }}>
            <StatCard icon="👥" label="Total Patients" value={total} color="#0b1929" bg="#e2e8f0" />
            <StatCard icon="[OK]" label="Completed Encounters" value={completed} sub={(total?Math.round(completed/total*100):0)+"% completion rate"} color="#059669" bg="#dcfce7" />
            <StatCard icon="🏥" label="Current Inpatients" value={admitted} sub={discharged+" discharged today"} color="#7c3aed" bg="#ede9fe" />
            <StatCard icon="💰" label="Revenue Collected" value={fmtN(totalRev)} sub={fmtN(invRaised)+" pending"} color="#1d4ed8" bg="#dbeafe" />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24 }}>
            <StatCard icon="🧪" label="Lab Reports Issued" value={labDone} color="#0e7490" bg="#cffafe" />
            <StatCard icon="🔴" label="Critical Lab Flags" value={critFlags} color="#dc2626" bg="#fee2e2" />
            <StatCard icon="💊" label="Prescriptions Dispensed" value={dispensed} color="#059669" bg="#d1fae5" />
            <StatCard icon="💳" label="Invoices Raised" value={allBilled.length} sub={allBilled.filter(p=>p.billing.paid).length+" paid"} color="#b45309" bg="#fef3c7" />
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18,marginBottom:18 }}>
            <Card>
              <Sec accent="#059669">Revenue by Service Category</Sec>
              {Object.keys(revByCat).length===0
                ? <div style={{ fontSize:12,color:C.slateL,textAlign:"center",padding:"20px 0" }}>No billing data yet</div>
                : Object.entries(revByCat).sort((a,b)=>b[1].total-a[1].total).map(([cat,data])=>{
                  const maxRev=Math.max(...Object.values(revByCat).map(x=>x.total));
                  const catColor=cat==="lab"?"#0e7490":cat==="radiology"?"#7c3aed":cat==="pharmacy"?"#059669":"#1d4ed8";
                  return <BarRow key={cat} label={cat.charAt(0).toUpperCase()+cat.slice(1)} value={data.total} max={maxRev} color={catColor} fmt={fmtN} />;
                })
              }
              <div style={{ borderTop:"1px solid #f1f5f9",paddingTop:10,marginTop:6,display:"flex",justifyContent:"space-between" }}>
                <span style={{ fontSize:12,fontWeight:700 }}>Total Billed</span>
                <span style={{ fontSize:13,fontWeight:900,color:"#059669",fontFamily:"monospace" }}>{fmtN(Object.values(revByCat).reduce((s,x)=>s+x.total,0))}</span>
              </div>
            </Card>

            <Card>
              <Sec accent="#7c3aed">Patient Flow by Status</Sec>
              {Object.entries(STATUS_META).map(([status,meta])=>{
                const cnt=patients.filter(p=>p.status===status).length;
                return cnt>0 ? (
                  <div key={status} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:meta.dot }}/>
                      <span style={{ fontSize:12 }}>{status}</span>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ width:70,height:5,background:"#f1f5f9",borderRadius:3,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:(total?cnt/total*100:0)+"%",background:meta.dot,borderRadius:3 }}/>
                      </div>
                      <span style={{ fontSize:12,fontWeight:700,fontFamily:"monospace",minWidth:18,textAlign:"right" }}>{cnt}</span>
                    </div>
                  </div>
                ) : null;
              })}
              {admitted>0 && (
                <div style={{ borderTop:"1px solid #f1f5f9",paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:"#7c3aed" }}/>
                    <span style={{ fontSize:12 }}>Admitted (Ward)</span>
                  </div>
                  <span style={{ fontSize:12,fontWeight:700,fontFamily:"monospace" }}>{admitted}</span>
                </div>
              )}
            </Card>

            <div>
              <Card mb={12}>
                <Sec accent="#d97706">Triage Level Distribution</Sec>
                {TRIAGE_LEVELS.map(tl=>{
                  const cnt=triageLevels[tl.level]||0;
                  return (
                    <div key={tl.level} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
                      <div style={{ width:28,height:18,borderRadius:4,background:tl.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ fontSize:9,fontWeight:800,color:tl.tc }}>L{tl.level}</span>
                      </div>
                      <span style={{ fontSize:11,color:C.slate,flex:1 }}>{tl.label}</span>
                      <div style={{ width:50,height:5,background:"#f1f5f9",borderRadius:3,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:(total?cnt/total*100:0)+"%",background:tl.bg,borderRadius:3 }}/>
                      </div>
                      <span style={{ fontSize:12,fontWeight:700,fontFamily:"monospace",minWidth:16,textAlign:"right" }}>{cnt}</span>
                    </div>
                  );
                })}
              </Card>
              <Card>
                <Sec accent="#0369a1">Patient Category</Sec>
                {Object.entries(catBreak).map(([cat,cnt])=>{
                  const color=cat==="Insurance"?"#1d4ed8":cat==="Corporate"?"#059669":"#b45309";
                  const bg=cat==="Insurance"?"#dbeafe":cat==="Corporate"?"#dcfce7":"#fef9c4";
                  return (
                    <div key={cat} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7 }}>
                      <span style={{ background:bg,color,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700 }}>{cat}</span>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:70,height:5,background:"#f1f5f9",borderRadius:3,overflow:"hidden" }}>
                          <div style={{ height:"100%",width:(total?cnt/total*100:0)+"%",background:color,borderRadius:3 }}/>
                        </div>
                        <span style={{ fontSize:12,fontWeight:700,fontFamily:"monospace",minWidth:16,textAlign:"right" }}>{cnt}</span>
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18 }}>
            <Card>
              <Sec accent="#7c3aed">Doctor Workload</Sec>
              {Object.keys(docWork).length===0
                ? <div style={{ fontSize:12,color:C.slateL,textAlign:"center",padding:"20px 0" }}>No consultations yet</div>
                : <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Doctor","Patients","Lab","Rx"].map(h=><th key={h} style={{ padding:"7px 10px",textAlign:"left",fontSize:9,fontWeight:700,color:C.slateL,fontFamily:"monospace",letterSpacing:.8,borderBottom:"1px solid #e2e8f0" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {Object.values(docWork).sort((a,b)=>b.patients-a.patients).map((d,i)=>(
                      <tr key={d.name} style={{ background:i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"9px 10px",fontSize:12,fontWeight:700 }}>{d.name}</td>
                        <td style={{ padding:"9px 10px" }}><span style={{ background:"#ede9fe",color:"#7c3aed",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>{d.patients}</span></td>
                        <td style={{ padding:"9px 10px" }}><span style={{ background:"#cffafe",color:"#0e7490",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>{d.lab}</span></td>
                        <td style={{ padding:"9px 10px" }}><span style={{ background:"#d1fae5",color:"#059669",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700 }}>{d.rx}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </Card>
            <Card>
              <Sec accent="#0e7490">Top Lab Tests Ordered</Sec>
              {Object.keys(labOrdered).length===0
                ? <div style={{ fontSize:12,color:C.slateL,textAlign:"center",padding:"20px 0" }}>No lab orders yet</div>
                : Object.entries(labOrdered).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,cnt])=>(
                  <BarRow key={name} label={name} value={cnt} max={Math.max(...Object.values(labOrdered))} color="#0e7490" />
                ))
              }
            </Card>
          </div>

          <Card>
            <Sec accent="#1d4ed8">Payment Method Breakdown</Sec>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10 }}>
              {Object.keys(payMethods).length===0
                ? <div style={{ fontSize:12,color:C.slateL,gridColumn:"1/-1",textAlign:"center",padding:"20px 0" }}>No payments recorded yet</div>
                : Object.entries(payMethods).sort((a,b)=>b[1]-a[1]).map(([method,cnt])=>{
                  const isCash=CASH_METHODS.includes(method);
                  const color=isCash?"#059669":"#1d4ed8";
                  const bg=isCash?"#dcfce7":"#dbeafe";
                  return (
                    <div key={method} style={{ background:bg,borderRadius:10,padding:"12px 14px",textAlign:"center" }}>
                      <div style={{ fontSize:22,fontWeight:900,color,fontFamily:"monospace" }}>{cnt}</div>
                      <div style={{ fontSize:11,fontWeight:700,color,marginTop:2 }}>{method}</div>
                      <div style={{ fontSize:9,color,opacity:.6,marginTop:1 }}>{total?Math.round(cnt/total*100):0}% of patients</div>
                    </div>
                  );
                })
              }
            </div>
          </Card>

        </div>
      </Layout>
    );


  // -- FINANCE: Debtors Account ----------------------------------------------

}
