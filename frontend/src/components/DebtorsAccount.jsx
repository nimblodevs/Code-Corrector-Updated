import { useState, useEffect } from "react";
function DebtorsAccount({ onNavigate }) {
  return (
    <div style={{ padding:"40px", fontFamily:"'Palatino Linotype',Palatino,serif" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ fontSize:28, fontWeight:800, color:"#0b1929", marginBottom:8 }}>Debtors Account</div>
        <div style={{ fontSize:14, color:"#64748b", marginBottom:32 }}>Track outstanding balances for Insurance and Corporate accounts</div>
        <div style={{ background:"#fff", borderRadius:16, padding:"32px", boxShadow:"0 4px 24px rgba(0,0,0,.08)", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🏦</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#0b1929", marginBottom:8 }}>Finance Module</div>
          <div style={{ fontSize:14, color:"#64748b", marginBottom:24 }}>
            The Debtors Account module tracks outstanding balances, credit limits, and payment history for Insurance providers and Corporate clients.
          </div>
          <button onClick={()=>onNavigate&&onNavigate("schemes")}
            style={{ padding:"12px 28px", background:"#0b1929", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700 }}>
            Go to Scheme Management
          </button>
        </div>
      </div>
    </div>
  );
}


export default DebtorsAccount;
