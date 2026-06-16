import { useState, useEffect } from "react";
import { useTokens } from "../App";

const ENQUIRY_TYPES = ["General Question","Partnership","Bug Report","Feedback"];

function FieldError({ message }) {
  if(!message) return null;
  return <p style={{ fontSize:"0.75rem", color:"#e05252", marginTop:"4px", fontFamily:"'Roboto Serif', Georgia, serif" }}>{message}</p>;
}

// Contact info cards
const INFO_CARDS = [
  { icon:"✉️", label:"Email", value:"hello@legalease.ai", sub:"Usually reply within 24h" },
  { icon:"🕐", label:"Hours", value:"Mon – Fri", sub:"9 AM – 6 PM IST" },
  { icon:"⚡", label:"Response", value:"< 24 hours", sub:"Avg. reply time" },
];

export default function Contact() {
  const [form, setForm] = useState({name:"",email:"",enquiry:"",message:""});
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const tk = useTokens();

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll(".sr-c");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("sr-c-on"); });
    }, { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const iStyle = (err) => ({
    width:"100%",
    background:tk.inputBg,
    border:`1px solid ${err?"rgba(224,82,82,0.5)":tk.inputBorder}`,
    borderRadius:"12px",
    padding:"0.75rem 1rem",
    fontSize:"0.9375rem",
    fontFamily:"'Roboto Serif', Georgia, serif",
    color:tk.textPrimary,
    outline:"none",
    boxSizing:"border-box",
    transition:"border-color .25s",
  });

  const validate = () => {
    const e={};
    if(!form.name.trim()) e.name="Name is required";
    if(!form.email.trim()) e.email="Email is required";
    else if(!/\S+@\S+\.\S+/.test(form.email)) e.email="Enter a valid email";
    if(!form.message.trim()) e.message="Message is required";
    return e;
  };

  const handleSubmit = async () => {
    const e=validate();
    if(Object.keys(e).length){ setErrors(e); return; }
    setErrors({}); setSubmitError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send message");
      setSent(true);
    } catch (err) {
      setSubmitError(err.message || "Could not send message right now");
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = {
    fontFamily:"'Roboto Serif', Georgia, serif",
    fontSize:"0.7rem", color:tk.textMuted,
    textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600,
  };

  return (
    <main style={{ position:"relative", minHeight:"100vh" }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: ${tk.textMuted}; }
        select option { background: ${tk.isDark?"#0e0e0f":"#f9f7f4"}; color: ${tk.textPrimary}; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes checkIn { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
        .sr-c { opacity:0; transform:translateY(28px); transition:opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
        .sr-c.sr-c-on { opacity:1; transform:translateY(0); }
        .dc1{transition-delay:.05s} .dc2{transition-delay:.12s} .dc3{transition-delay:.2s} .dc4{transition-delay:.28s}
        .info-card { transition: transform 0.3s ease, box-shadow 0.3s ease !important; }
        .info-card:hover { transform: translateY(-4px) !important; }
      `}</style>

      <section style={{
        position:"relative", zIndex:1,
        minHeight:"100vh",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"7rem 1.5rem 5rem",
      }}>
        <div style={{ width:"100%", maxWidth:"660px", margin:"0 auto" }}>

          {/* Header */}
          <div className="sr-c" style={{ textAlign:"center", marginBottom:"2rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:"0.5rem",
              background:tk.goldLight, border:`1px solid ${tk.goldBorder}`,
              borderRadius:"999px", padding:"0.3rem 1rem",
              margin:"0 auto",
            }}>
              <span style={{width:"5px",height:"5px",borderRadius:"50%",background:tk.gold,display:"block"}}/>
              <span style={{ fontFamily:"'Roboto Serif', Georgia, serif", fontSize:"0.7rem", letterSpacing:"0.15em", textTransform:"uppercase", color:tk.gold, fontWeight:600 }}>Get in touch</span>
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontWeight:700, color:tk.textPrimary, fontSize:"clamp(2.25rem, 5vw, 3.5rem)", letterSpacing:"-0.035em", lineHeight:1.05, margin:0 }}>Contact Us</h1>
            <p style={{ fontFamily:"'Roboto Serif', Georgia, serif", color:tk.textSecondary, fontSize:"1.125rem", fontWeight:300, maxWidth:"340px", lineHeight:1.65, margin:"0 auto" }}>
              We would love to hear from you. Usually reply within 24 hours.
            </p>
          </div>

          {/* Info cards */}
          <div className="sr-c dc1" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem", marginBottom:"1.75rem" }}>
            {INFO_CARDS.map(card => (
              <div key={card.label} className="info-card" style={{
                background:tk.surface,
                backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
                border:`1px solid ${tk.goldBorder}`,
                borderRadius:"14px",
                padding:"1rem 0.75rem",
                textAlign:"center",
                boxShadow: tk.isDark ? "0 4px 20px rgba(0,0,0,0.35)" : "0 2px 16px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize:"1.25rem", marginBottom:"0.375rem" }}>{card.icon}</div>
                <p style={{ fontFamily:"'Roboto Serif', Georgia, serif", fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.1em", color:tk.textSecondary, fontWeight:700, margin:"0 0 0.25rem" }}>{card.label}</p>
                <p style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:"0.875rem", fontWeight:700, color:tk.gold, margin:"0 0 0.125rem" }}>{card.value}</p>
                <p style={{ fontFamily:"'Roboto Serif', Georgia, serif", fontSize:"0.8rem", color:tk.textSecondary, fontWeight:500, margin:0 }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Ghost card */}
          <div className="sr-c dc2" style={{
            background:tk.surface,
            backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
            border:`1px solid ${tk.surfaceBorder}`,
            borderRadius:"20px",
            padding:"2rem",
            boxShadow: tk.isDark ? "0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,220,100,.06)" : "0 12px 48px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.9)",
          }}>
            {sent ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.25rem", padding:"2rem", textAlign:"center", animation:"checkIn .5s cubic-bezier(.22,1,.36,1)" }}>
                <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:tk.goldLight, border:`1px solid ${tk.goldBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="24" height="24" fill="none" stroke={tk.gold} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontWeight:700, color:tk.textPrimary, fontSize:"1.5rem", letterSpacing:"-0.02em", margin:0 }}>Message sent!</h2>
                <p style={{ fontFamily:"'Roboto Serif', Georgia, serif", color:tk.textSecondary, fontSize:"1.0625rem", fontWeight:500, lineHeight:1.65, margin:0 }}>Thanks for reaching out. We will get back to you soon.</p>
                <button onClick={()=>{ setSent(false); setForm({name:"",email:"",enquiry:"",message:""}); }}
                  style={{ fontFamily:"'Roboto Serif', Georgia, serif", fontSize:"0.9375rem", fontWeight:600, color:tk.gold, background:tk.goldLight, border:`1px solid ${tk.goldBorder}`, borderRadius:"999px", padding:"0.45rem 1.25rem", cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background=tk.isDark?"rgba(201,168,76,.22)":"rgba(160,120,40,.15)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=tk.goldLight;}}>
                  Send another
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }} className="contact-grid">
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.375rem" }}>
                    <label style={labelStyle}>Name</label>
                    <input type="text" placeholder="Your name" value={form.name}
                      onChange={e=>{ setForm({...form,name:e.target.value}); setErrors({...errors,name:""}); }}
                      style={iStyle(errors.name)}
                      onFocus={e=>e.target.style.borderColor=tk.gold}
                      onBlur={e=>e.target.style.borderColor=errors.name?"rgba(224,82,82,.5)":tk.inputBorder}/>
                    <FieldError message={errors.name}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.375rem" }}>
                    <label style={labelStyle}>Email</label>
                    <input type="email" placeholder="you@example.com" value={form.email}
                      onChange={e=>{ setForm({...form,email:e.target.value}); setErrors({...errors,email:""}); }}
                      style={iStyle(errors.email)}
                      onFocus={e=>e.target.style.borderColor=tk.gold}
                      onBlur={e=>e.target.style.borderColor=errors.email?"rgba(224,82,82,.5)":tk.inputBorder}/>
                    <FieldError message={errors.email}/>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.375rem" }}>
                  <label style={labelStyle}>Enquiry type <span style={{textTransform:"none",letterSpacing:0,color:tk.textMuted}}>(optional)</span></label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                    {ENQUIRY_TYPES.map(type=>(
                      <button key={type}
                        onClick={()=>setForm({...form,enquiry:form.enquiry===type?"":type})}
                        style={{
                          fontFamily:"'Roboto Serif', Georgia, serif", fontSize:"0.875rem",
                          padding:"0.35rem 0.875rem", borderRadius:"999px",
                          border:`1px solid ${form.enquiry===type?tk.goldBorder:tk.inputBorder}`,
                          background: form.enquiry===type ? tk.goldLight : "transparent",
                          color: form.enquiry===type ? tk.gold : tk.textSecondary,
                          cursor:"pointer", transition:"all .2s",
                          fontWeight: form.enquiry===type ? 600 : 400,
                        }}
                        onMouseEnter={e=>{if(form.enquiry!==type){e.currentTarget.style.borderColor=tk.goldBorder; e.currentTarget.style.color=tk.gold;}}}
                        onMouseLeave={e=>{if(form.enquiry!==type){e.currentTarget.style.borderColor=tk.inputBorder; e.currentTarget.style.color=tk.textSecondary;}}}
                      >{type}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.375rem" }}>
                  <label style={labelStyle}>Message</label>
                  <textarea rows={5} placeholder="How can we help?"
                    value={form.message}
                    onChange={e=>{ setForm({...form,message:e.target.value}); setErrors({...errors,message:""}); }}
                    style={{...iStyle(errors.message), resize:"none", lineHeight:1.65}}
                    onFocus={e=>e.target.style.borderColor=tk.gold}
                    onBlur={e=>e.target.style.borderColor=errors.message?"rgba(224,82,82,.5)":tk.inputBorder}/>
                  <FieldError message={errors.message}/>
                </div>
                {submitError && (
                  <p style={{ fontSize:"0.85rem", color:"#e05252", margin:0, fontFamily:"'Roboto Serif', Georgia, serif" }}>
                    {submitError}
                  </p>
                )}
                <button onClick={handleSubmit} disabled={submitting} style={{
                  width:"100%", padding:"0.875rem", borderRadius:"12px",
                  fontFamily:"'Roboto Serif', Georgia, serif", fontWeight:600, fontSize:"1rem",
                  letterSpacing:"0.04em", border:"none", cursor:submitting?"not-allowed":"pointer",
                  opacity:submitting?0.5:1, background:tk.btnBg, color:tk.btnText,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem",
                  transition:"opacity .25s",
                }}
                  onMouseEnter={e=>!submitting&&(e.currentTarget.style.opacity="0.8")}
                  onMouseLeave={e=>e.currentTarget.style.opacity=submitting?"0.5":"1"}>
                  {submitting ? (
                    <>
                      <svg style={{animation:"spin 1s linear infinite",width:"15px",height:"15px"}} fill="none" viewBox="0 0 24 24">
                        <circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Sending…
                    </>
                  ) : "Send Message"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <style>{`.contact-grid { grid-template-columns:1fr 1fr } @media(max-width:480px){.contact-grid{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
