import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "../App";
import { useAuth } from "../context/AuthContext";

const advantages = [
  {
    value:"Instant Analysis",
    label:"Understand Faster",
    desc:"Break down complex legal documents into clear, practical summaries in seconds.",
  },
  {
    value:"Risk Detection",
    label:"Spot What Matters",
    desc:"Identify risky clauses, hidden obligations, deadlines, and terms that deserve a closer look.",
  },
  {
    value:"Compare & Generate",
    label:"Act With Confidence",
    desc:"Compare document versions and generate tailored legal drafts with JURIbrief's AI assistance.",
  },
];
const problemItems = [
  "Rent agreements written to protect landlords",
  "Internship offers with buried non-compete clauses",
  "T&Cs that sign away your IP by default",
];
const fixItems = [
  "Plain-English summaries of every clause",
  "Risk flags with severity levels",
  "Negotiation suggestions you can actually use",
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("sr-on"); });
    }, { threshold:0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function About() {
  const tk = useTokens();
  const navigate = useNavigate();
  const { user } = useAuth();
  useReveal();

  return (
    <>
      <style>{`
        .sr { opacity:0; transform:translateY(30px);
          transition:opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
        .sr.sr-on { opacity:1; transform:translateY(0); }
        .d1{transition-delay:.08s} .d2{transition-delay:.16s} .d3{transition-delay:.24s} .d4{transition-delay:.32s}
        @keyframes howToBlink {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        .juri-cta-button {
          cursor: pointer;
          position: relative;
          isolation: isolate;
          padding: 10px 24px;
          font-family: "'Roboto Serif', Georgia, serif";
          font-size: 18px;
          color: rgb(193, 163, 98);
          border: 2px solid rgb(193, 163, 98);
          border-radius: 34px;
          background-color: transparent;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
        }

        .juri-cta-button::before {
          content: "";
          position: absolute;
          inset: 0;
          margin: auto;
          width: 50px;
          height: 50px;
          border-radius: inherit;
          transform: scale(0);
          z-index: -1;
          background-color: rgb(193, 163, 98);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .juri-cta-button:hover::before {
          transform: scale(3);
        }

        .juri-cta-button:hover {
          color: #212121;
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(193, 163, 98, 0.4);
        }

        .juri-cta-button:active {
          transform: scale(1);
        }

        .juri-cta-button:focus-visible {
          outline: 2px solid rgb(193, 163, 98);
          outline-offset: 4px;
        }
        .rights-book::-webkit-scrollbar {
          height: 5px;
        }
        .rights-book::-webkit-scrollbar-thumb {
          background: rgba(128,128,128,.45);
          border-radius: 999px;
        }


        .feature-grid {
          transition: all .3s ease;
        }

        .feature-grid:hover > .feature-card-wrap:not(:hover) {
          filter: blur(5px);
          transform: scale(0.96);
        }

        .feature-card-wrap {
          box-sizing: border-box;
          width: 190px;
          height: 254px;
          background: #f4f0e6;
          border: 1px solid white;
          box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(6px);
          border-radius: 17px;
          text-align: center;
          cursor: pointer;
          transition: all 0.5s;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          color: black;
          padding: 1.25rem;
        }

        .feature-card-wrap:hover {
          border: 1px solid black;
          transform: scale(1.08);
        }

        .feature-card-wrap:active {
          transform: scale(0.95) rotateZ(1.7deg);
        }

        .feature-card {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 0;
          box-shadow: none;
          padding: 0;
          box-sizing: border-box;
        }

        .feature-card-title {
          display: none;
        }

        .feature-card-info {
          position: static;
          inset: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          padding: 0;
          box-sizing: border-box;
          text-align: center;
          opacity: 1;
          transform: none;
          transition: none;
          z-index: auto;
        }

        .feature-card-info h3 {
          margin: 0;
          font-family: "'DM Serif Display', Georgia, serif";
          font-size: 1.35rem;
          line-height: 1.15;
          font-weight: 700;
          color: #111111;
        }

        .feature-card-info p {
          margin: 0;
          font-family: "'Roboto Serif', Georgia, serif";
          font-size: 0.92rem;
          line-height: 1.5;
          color: #333333;
          font-weight: 500;
        }

        @media (max-width: 700px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
            justify-items: center;
            gap: 1rem !important;
          }

          .feature-grid:hover > .feature-card-wrap:not(:hover) {
            filter: none;
            transform: none;
          }

          .feature-card-wrap {
            width: min(190px, 78vw);
            height: 254px;
          }
        }
        @media (max-width: 700px) {
          .offer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <main style={{ position:"relative", minHeight:"100vh" }}>
        <section style={{
          position:"relative", zIndex:1,
          minHeight:"100vh",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"7rem 1.5rem 5rem",
        }}>
          <div style={{
            width:"100%", maxWidth:"660px",
            margin:"0 auto",
            display:"flex", flexDirection:"column",
            alignItems:"center", textAlign:"center",
            gap:"1.5rem",
          }}>

            {/* H1 */}
            <h1 className="sr d1" style={{
              fontFamily:"'DM Serif Display', Georgia, serif",
              fontWeight:700, color:tk.textPrimary,
              fontSize:"clamp(2.75rem, 6vw, 4.25rem)",
              lineHeight:1.05, letterSpacing:"-0.035em",
              margin:0,
            }}>About Us</h1>

            {/* Gold rule */}
            <div className="sr" style={{
              width:"48px", height:"1px",
              background:`linear-gradient(90deg, transparent, ${tk.gold}, transparent)`,
            }}/>

            {/* Feature cards */}
            <div className="sr d2 feature-grid" style={{
              width:"100%",
              display:"grid",
              gridTemplateColumns:"repeat(3, 190px)",
              justifyContent:"center",
              gap:"1.5rem",
            }}>
              {advantages.map((a)=>(
                <div key={a.label} className="feature-card-wrap">
                  <div className="feature-card-tracker" aria-label={`Reveal details about ${a.value}`} />

                  <div className="feature-card">
                    <div className="feature-card-title">
                      {a.value}
                    </div>

                    <div className="feature-card-info">
                      <h3>{a.label}</h3>
                      <p>{a.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* What We Offer */}
            <div className="sr d3" style={{
              width:"100%",
              background:tk.surface,
              backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
              border:`1px solid ${tk.surfaceBorder}`,
              borderRadius:"20px",
              overflow:"hidden",
              boxShadow: tk.isDark
                ? "0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,220,100,.06)"
                : "0 12px 48px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.9)",
              textAlign:"left",
            }}>
              <div style={{
                padding:"2.25rem 2rem",
                display:"flex",
                flexDirection:"column",
                gap:"1.25rem",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
                  <span style={{
                    width:"4px",
                    height:"26px",
                    borderRadius:"999px",
                    background:tk.gold,
                    display:"block",
                  }}/>
                  <h2 style={{
                    fontFamily:"'DM Serif Display', Georgia, serif",
                    fontSize:"1.45rem",
                    fontWeight:700,
                    color:tk.textPrimary,
                    margin:0,
                  }}>
                    What We Offer
                  </h2>
                </div>

                <p style={{
                  fontFamily:"'Roboto Serif', Georgia, serif",
                  fontSize:"1.05rem",
                  color:tk.textSecondary,
                  fontWeight:500,
                  lineHeight:1.75,
                  margin:0,
                }}>
                  Legal documents can be difficult to read, compare, and keep track of.
                  JURIbrief brings the important parts into one simple workspace so you
                  can understand a document before making a decision.
                </p>

                <div className="offer-grid" style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(2, 1fr)",
                  gap:"1rem 1.5rem",
                  marginTop:"0.25rem",
                }}>
                  {[
                    {
                      title:"Clear Document Summaries",
                      desc:"Turn lengthy agreements into structured, easy-to-follow overviews."
                    },
                    {
                      title:"Risk & Deadline Highlights",
                      desc:"Bring attention to clauses, obligations, dates, and terms that may need review."
                    },
                    {
                      title:"Document Comparison",
                      desc:"See what changed between two versions without manually checking every line."
                    },
                    {
                      title:"Document Generation",
                      desc:"Create structured legal drafts from your requirements and review them before use."
                    },
                    {
                      title:"Multiple Languages",
                      desc:"Access document explanations in the language that is most comfortable for you."
                    },
                    {
                      title:"One Place for Legal Work",
                      desc:"Analyze, compare, generate, and discuss documents from a single workspace."
                    },
                  ].map(item=>(
                    <div key={item.title} style={{
                      padding:"1rem",
                      border:`1px solid ${tk.surfaceBorder}`,
                      borderRadius:"12px",
                      background:tk.isDark ? "rgba(255,255,255,.025)" : "rgba(255,255,255,.45)",
                    }}>
                      <h3 style={{
                        fontFamily:"'Roboto Serif', Georgia, serif",
                        fontSize:"0.95rem",
                        fontWeight:700,
                        color:tk.textPrimary,
                        margin:"0 0 0.35rem",
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        fontFamily:"'Roboto Serif', Georgia, serif",
                        fontSize:"0.88rem",
                        lineHeight:1.55,
                        color:tk.textSecondary,
                        margin:0,
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* How to Use */}
            <div
              className="sr d4"
              onClick={(e)=>{
                const box=e.currentTarget;
                const body=box.querySelector(".how-to-use-body");
                if (!body || body.style.maxHeight === "0px" || !body.style.maxHeight) return;
                if (e.target.closest("button")) return;
                body.style.maxHeight="0px";
                body.style.paddingTop="0px";
                body.style.paddingBottom="0px";
                const button=box.querySelector("button");
                if (button) button.setAttribute("aria-expanded","false");
              }}
              style={{
                width:"100%",
                border:`1px solid ${tk.surfaceBorder}`,
              borderRadius:"18px",
              overflow:"hidden",
              background:tk.surface,
              boxShadow: tk.isDark
                ? "0 18px 48px rgba(0,0,0,.35)"
                : "0 10px 36px rgba(0,0,0,.06)",
              textAlign:"left",
            }}>
              <button
                type="button"
                onClick={(e)=>{
                  const box=e.currentTarget.parentElement;
                  const body=box.querySelector(".how-to-use-body");
                  const open=body.style.maxHeight && body.style.maxHeight !== "0px";
                  body.style.maxHeight=open ? "0px" : body.scrollHeight+"px";
                  body.style.paddingTop=open ? "0px" : "0.25rem";
                  body.style.paddingBottom=open ? "0px" : "1.75rem";
                  e.currentTarget.setAttribute("aria-expanded", String(!open));
                }}
                aria-expanded="false"
                style={{
                  width:"100%",
                  border:0,
                  background:"transparent",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"space-between",
                  gap:"1rem",
                  padding:"1.4rem 1.5rem",
                  cursor:"pointer",
                  textAlign:"left",
                }}
              >
                <div style={{display:"flex",alignItems:"center",gap:"0.7rem"}}>
                  <span style={{
                    width:"4px",
                    height:"25px",
                    borderRadius:"999px",
                    background:tk.gold,
                    display:"block",
                  }}/>
                  <span style={{
                    fontFamily:"'DM Serif Display', Georgia, serif",
                    fontSize:"1.4rem",
                    fontWeight:700,
                    color:tk.textPrimary,
                  }}>
                    How to Use
                  </span>
                </div>

                <span style={{
                  fontFamily:"'Roboto Serif', Georgia, serif",
                  fontSize:"0.7rem",
                  color:"#ffffff",
                  opacity:0.8,
                  letterSpacing:"0.08em",
                  textTransform:"uppercase",
                  animation:"howToBlink 1.4s ease-in-out infinite",
                  whiteSpace:"nowrap",
                }}>
                  Click to expand
                </span>
              </button>

              <div
                className="how-to-use-body"
                style={{
                  maxHeight:"0px",
                  overflow:"hidden",
                  transition:"max-height .45s ease, padding .35s ease",
                  padding:"0 1.5rem",
                }}
              >
                <div style={{
                  borderTop:`1px solid ${tk.divider}`,
                  paddingTop:"1.4rem",
                  display:"flex",
                  flexDirection:"column",
                  gap:"1.25rem",
                }}>
                  <p style={{
                    fontFamily:"'Roboto Serif', Georgia, serif",
                    fontSize:"1rem",
                    lineHeight:1.7,
                    color:tk.textSecondary,
                    margin:0,
                  }}>
                    Getting started with JURIbrief is simple. Follow these steps to
                    understand, review, and work with your legal documents.
                  </p>

                  {/* Juri's Rights Guide */}
                  <div style={{
                    marginTop:"0.5rem",
                    padding:"1.25rem 1.1rem 1.35rem",
                    borderRadius:"14px",
                    background:tk.isDark ? "rgba(244,240,230,.06)" : "#f4f0e6",
                    border:`1px solid ${tk.isDark ? "rgba(244,240,230,.15)" : "#ffffff"}`,
                    overflow:"hidden",
                  }}>
                    <div style={{
                      display:"flex",
                      alignItems:"center",
                      gap:"0.7rem",
                      marginBottom:"0.9rem",
                    }}>
                      <span style={{
                        width:"4px",
                        height:"24px",
                        borderRadius:"999px",
                        background:tk.gold,
                        flexShrink:0,
                      }}/>
                      <div>
                        <h3 style={{
                          fontFamily:"'DM Serif Display', Georgia, serif",
                          fontSize:"1.15rem",
                          color:tk.isDark ? "#f4f0e6" : "#171717",
                          margin:0,
                        }}>
                          Juri's Rights Guide
                        </h3>
                        <p style={{
                          fontFamily:"'Roboto Serif', Georgia, serif",
                          fontSize:"0.78rem",
                          color:tk.isDark ? "#cfcfcf" : "#55504a",
                          margin:"0.2rem 0 0",
                        }}>
                          Know the important rights to look for in your documents.
                        </p>
                      </div>
                    </div>

                    <div className="rights-book" style={{
                      display:"flex",
                      gap:"0.85rem",
                      overflowX:"auto",
                      scrollSnapType:"x mandatory",
                      WebkitOverflowScrolling:"touch",
                      padding:"0.15rem 0.15rem 0.65rem",
                      scrollbarWidth:"thin",
                    }}>
                      {[
                        {
                          n:"01",
                          title:"Understand Before You Sign",
                          desc:"You should be able to understand what a document asks you to agree to, including important duties, restrictions, costs, and consequences."
                        },
                        {
                          n:"02",
                          title:"Know What You Are Agreeing To",
                          desc:"Look for payment terms, renewal rules, notice periods, penalties, confidentiality duties, ownership terms, and other obligations that affect you."
                        },
                        {
                          n:"03",
                          title:"Watch for Restrictions",
                          desc:"Pay attention to clauses that limit your choices, such as non-compete, exclusivity, non-solicitation, or broad usage and access restrictions."
                        },
                        {
                          n:"04",
                          title:"Protect Your Work",
                          desc:"Check who owns documents, ideas, code, designs, inventions, or other work you create, and understand when those rights may be transferred."
                        },
                        {
                          n:"05",
                          title:"Keep Track of Time",
                          desc:"Important dates can affect your rights. Check deadlines, renewal dates, cancellation windows, notice requirements, and the duration of the agreement."
                        },
                        {
                          n:"06",
                          title:"Ask When Something Is Unclear",
                          desc:"If a clause is confusing or important to your situation, do not rely on assumptions. Ask questions, request clarification, or seek qualified legal advice."
                        },
                      ].map(right=>(
                        <div key={right.n} style={{
                          flex:"0 0 min(290px, 82%)",
                          minWidth:0,
                          scrollSnapAlign:"start",
                          boxSizing:"border-box",
                          padding:"1.1rem",
                          borderRadius:"12px",
                          background:tk.isDark ? "#252525" : "#ffffff",
                          border:`1px solid ${tk.isDark ? "#4a4a4a" : "#e2ddd3"}`,
                        }}>
                          <div style={{
                            fontFamily:"'DM Serif Display', Georgia, serif",
                            fontSize:"0.82rem",
                            fontWeight:700,
                            color:tk.gold,
                            marginBottom:"0.45rem",
                          }}>
                            {right.n}
                          </div>
                          <h4 style={{
                            fontFamily:"'Roboto Serif', Georgia, serif",
                            fontSize:"0.98rem",
                            lineHeight:1.35,
                            fontWeight:700,
                            color:tk.isDark ? "#f4f0e6" : "#171717",
                            margin:"0 0 0.5rem",
                          }}>
                            {right.title}
                          </h4>
                          <p style={{
                            fontFamily:"'Roboto Serif', Georgia, serif",
                            fontSize:"0.86rem",
                            lineHeight:1.6,
                            color:tk.isDark ? "#cfcfcf" : "#4a4742",
                            margin:0,
                          }}>
                            {right.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {[
                    {
                      n:"01",
                      title:"Choose your document",
                      desc:"Upload a supported legal document from your device, or use the available text option when you want to work with pasted content."
                    },
                    {
                      n:"02",
                      title:"Start the analysis",
                      desc:"Run the analysis and let JURIbrief organize the document into a clearer overview so you can quickly understand what it contains."
                    },
                    {
                      n:"03",
                      title:"Review the important parts",
                      desc:"Read the summary, clause explanations, risk flags, obligations, and important dates. Pay closer attention to anything marked as requiring review."
                    },
                    {
                      n:"04",
                      title:"Compare when a document changes",
                      desc:"Have two versions of an agreement? Use Compare to see what was added, removed, or changed between them."
                    },
                    {
                      n:"05",
                      title:"Generate when you need a draft",
                      desc:"Describe the document you need and provide the relevant requirements. JURIbrief can create a structured draft that you can review and edit."
                    },
                    {
                      n:"06",
                      title:"Ask Juri",
                      desc:"Use Juri to ask questions about your document and discuss clauses or details in context."
                    },
                    {
                      n:"07",
                      title:"Review before you act",
                      desc:"Use the information as a starting point for understanding your document. Always review important legal decisions and seek qualified legal advice when necessary."
                    },
                  ].map(step=>(
                    <div key={step.n} style={{
                      display:"grid",
                      gridTemplateColumns:"42px 1fr",
                      gap:"0.9rem",
                      alignItems:"start",
                    }}>
                      <span style={{
                        fontFamily:"'DM Serif Display', Georgia, serif",
                        fontSize:"1rem",
                        fontWeight:700,
                        color:tk.gold,
                        paddingTop:"0.1rem",
                      }}>
                        {step.n}
                      </span>

                      <div>
                        <h3 style={{
                          fontFamily:"'Roboto Serif', Georgia, serif",
                          fontSize:"0.98rem",
                          fontWeight:700,
                          color:tk.textPrimary,
                          margin:"0 0 0.3rem",
                        }}>
                          {step.title}
                        </h3>
                        <p style={{
                          fontFamily:"'Roboto Serif', Georgia, serif",
                          fontSize:"0.9rem",
                          lineHeight:1.6,
                          color:tk.textSecondary,
                          margin:0,
                        }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              className="juri-cta-button sr d4"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              Try Now
            </button>
          </div>
        </section>
      </main>
    </>
  );
}