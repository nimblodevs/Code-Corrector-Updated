import { useState, useEffect, useRef } from "react";
function SchemesPage({ initialProviderId, onNavigateBack }) {
  return (
    <div style={{ padding:"40px", fontFamily:"'Palatino Linotype',Palatino,serif" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <button onClick={onNavigateBack}
          style={{ padding:"8px 18px", background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:9, cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"#475569", marginBottom:24 }}>
          ← Back to Finance
        </button>
        <div style={{ fontSize:28, fontWeight:800, color:"#0b1929", marginBottom:8 }}>Scheme Management</div>
        <div style={{ fontSize:14, color:"#64748b", marginBottom:32 }}>
          Manage benefit plans, co-payments, and coverage rules for Insurance and Corporate schemes
          {initialProviderId ? ' (Provider: '+initialProviderId+')' : ''}
        </div>
        <div style={{ background:"#fff", borderRadius:16, padding:"32px", boxShadow:"0 4px 24px rgba(0,0,0,.08)", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🛡</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#0b1929", marginBottom:8 }}>Scheme Configuration</div>
          <div style={{ fontSize:14, color:"#64748b" }}>
            The Scheme Management module provides benefit plan configuration, co-pay rules, pre-authorisation workflows, and claims processing.
          </div>
        </div>
      </div>
    </div>
  );
}




export default SchemesPage;
