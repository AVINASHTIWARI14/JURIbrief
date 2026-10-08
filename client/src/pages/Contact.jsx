import { useState, useEffect } from "react";
import { useTokens } from "../App";


function FieldError({ message }) {
  if(!message) return null;
  return <p style={{ fontSize:"0.75rem", color:"#e05252", marginTop:"4px", fontFamily:"'Roboto Serif', Georgia, serif" }}>{message}</p>;
}


export default function Contact() {
  const [form, setForm] = useState({name:"",email:"",message:""});
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
    <main style={{ position:"relative", minHeight:"auto" }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: ${tk.textMuted}; }
        select option { background: ${tk.isDark?"#0e0e0f":"#f9f7f4"}; color: ${tk.textPrimary}; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes checkIn { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
        .sr-c { opacity:0; transform:translateY(28px); transition:opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
        .sr-c.sr-c-on { opacity:1; transform:translateY(0); }
        .dc1{transition-delay:.05s} .dc2{transition-delay:.12s} .dc3{transition-delay:.2s} .dc4{transition-delay:.28s}
      `}</style>

      <section style={{
        position:"relative", zIndex:1,
        minHeight:"100vh",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"1.5rem 1.5rem 0.75rem",
      }}>
        <div style={{ width:"100%", maxWidth:"660px", margin:"0 auto" }}>

          {/* Header */}
          <div className="sr-c" style={{ textAlign:"center", marginBottom:"0.65rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            <h1 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontWeight:700, color:tk.textPrimary, fontSize:"clamp(2.25rem, 5vw, 3.5rem)", letterSpacing:"-0.035em", lineHeight:1.05, margin:0 }}>Contact Us</h1>
          </div>

          {/* Contact form */}
          <div className="sr-c dc2" style={{
            background:tk.surface,
            backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
            border:`1px solid ${tk.surfaceBorder}`,
            borderRadius:"20px",
            padding:"1.1rem 1.25rem",
            boxShadow: tk.isDark ? "0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,220,100,.06)" : "0 12px 48px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.9)",
          }}>
            {sent ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.85rem", padding:"2rem", textAlign:"center", animation:"checkIn .5s cubic-bezier(.22,1,.36,1)" }}>
                <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:tk.goldLight, border:`1px solid ${tk.goldBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="24" height="24" fill="none" stroke={tk.gold} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontWeight:700, color:tk.textPrimary, fontSize:"1.5rem", letterSpacing:"-0.02em", margin:0 }}>Message sent!</h2>
                <p style={{ fontFamily:"'Roboto Serif', Georgia, serif", color:tk.textSecondary, fontSize:"1.0625rem", fontWeight:500, lineHeight:1.65, margin:0 }}>Thanks for reaching out. We will get back to you soon.</p>
                <button onClick={()=>{ setSent(false); setForm({name:"",email:"",message:""}); }}
                  style={{ fontFamily:"'Roboto Serif', Georgia, serif", fontSize:"0.9375rem", fontWeight:600, color:tk.gold, background:tk.goldLight, border:`1px solid ${tk.goldBorder}`, borderRadius:"999px", padding:"0.45rem 1.25rem", cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background=tk.isDark?"rgba(201,168,76,.22)":"rgba(160,120,40,.15)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=tk.goldLight;}}>
                  Send another
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.375rem" }}>
                    <label style={labelStyle}>Your Name</label>
                    <input type="text" placeholder="Your name" value={form.name}
                      onChange={e=>{ setForm({...form,name:e.target.value}); setErrors({...errors,name:""}); }}
                      style={iStyle(errors.name)}
                      onFocus={e=>e.target.style.borderColor=tk.gold}
                      onBlur={e=>e.target.style.borderColor=errors.name?"rgba(224,82,82,.5)":tk.inputBorder}/>
                    <FieldError message={errors.name}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.375rem" }}>
                    <label style={labelStyle}>Your Mail</label>
                    <input type="email" placeholder="Your mail" value={form.email}
                      onChange={e=>{ setForm({...form,email:e.target.value}); setErrors({...errors,email:""}); }}
                      style={iStyle(errors.email)}
                      onFocus={e=>e.target.style.borderColor=tk.gold}
                      onBlur={e=>e.target.style.borderColor=errors.email?"rgba(224,82,82,.5)":tk.inputBorder}/>
                    <FieldError message={errors.email}/>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.375rem" }}>
                  <label style={labelStyle}>Message</label>
                  <textarea rows={3} placeholder="Your message"
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

      {/* Creator links */}
      <section
        style={{
          position:"relative", zIndex:1, padding:"0 1.5rem 0.75rem", textAlign:"center",
        }}
      >
        <h2
          className="sr-c dc3"
          style={{
            fontFamily:"'DM Serif Display', Georgia, serif", fontWeight:700,
            color:tk.textPrimary, fontSize:"clamp(1.8rem, 4vw, 2.6rem)",
            letterSpacing:"-0.025em", margin:"0 0 0.5rem",
          }}
        >
          Connect with me
        </h2>

        <div
          className="sr-c dc4"
          style={{
            display:"flex", justifyContent:"center", alignItems:"flex-end",
            gap:"0.5rem", flexWrap:"wrap", padding:"0.5rem",
            width:"fit-content", maxWidth:"100%", margin:"0 auto",
            borderRadius:"1rem",
            background:tk.isDark ? "rgba(0,0,0,.2)" : "rgba(255,255,255,.35)",
            backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
            border:`1px solid ${tk.surfaceBorder}`,
            boxShadow:tk.isDark ? "0 20px 45px rgba(0,0,0,.35)" : "0 12px 30px rgba(0,0,0,.08)",
          }}
        >
          <a href="https://github.com/AVINASHTIWARI14" target="_blank" rel="noopener noreferrer"
             aria-label="GitHub" className="creator-social creator-github">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.792 24 17.293 24 12 24 5.373 18.627 0 12 0z"/>
            </svg>
          </a>

          <a href="https://www.linkedin.com/in/avinash-tiwari-95b5932a6" target="_blank" rel="noopener noreferrer"
             aria-label="LinkedIn" className="creator-social creator-linkedin">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>

          <a href="https://www.instagram.com/vesper.commw?igsi=OWR0cDlkNWx0NHhm" target="_blank" rel="noopener noreferrer"
             aria-label="Instagram" className="creator-social creator-instagram">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="17.3" cy="6.8" r="1.15" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </section>




      <style>{`
        .creator-social {
          width:76px; height:76px; border-radius:15px;
          display:flex; align-items:center; justify-content:center;
          text-decoration:none; cursor:pointer;
          transform:translateY(0);
          transition:transform .3s ease, box-shadow .3s ease, opacity .3s ease;
        }
        .creator-social svg { width:34px; height:34px; color:#fff; transition:transform .3s ease; }
        .creator-github { background:linear-gradient(135deg,#374151,#111827); border:1px solid rgba(156,163,175,.5); box-shadow:0 8px 18px rgba(0,0,0,.22); }
        .creator-linkedin { background:linear-gradient(135deg,#2563eb,#1e40af); border:1px solid rgba(59,130,246,.5); box-shadow:0 8px 18px rgba(0,0,0,.22); }
        .creator-instagram { background:linear-gradient(135deg,#ec4899,#7c3aed); border:1px solid rgba(236,72,153,.5); box-shadow:0 8px 18px rgba(0,0,0,.22); }
        .creator-social:hover { transform:scale(1.1) translateY(-8px); box-shadow:0 18px 30px rgba(0,0,0,.28); }
        .creator-social:hover svg { transform:scale(1.08); }
        @media(max-width:480px) {
          .creator-social { width:64px; height:64px; }
          .creator-social svg { width:30px; height:30px; }
        }
      `}</style>
    </main>
  );
}
