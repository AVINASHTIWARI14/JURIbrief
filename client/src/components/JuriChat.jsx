import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useTokens } from "../App";
import { useLanguage } from "../context/LanguageContext";

export default function JuriChat({ onClose }) {
  const tk = useTokens();
  const { language } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm Juri 👋 Ask me anything about the platform, your analyzed document, or general legal concepts.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasContext, setHasContext] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("juri-context");
    setHasContext(!!raw);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      let context = null;
      try {
        const raw = sessionStorage.getItem("juri-context");
        if (raw) context = JSON.parse(raw);
      } catch {}

      const res = await axios.post("/api/chat", {
        message: text,
        history: messages.filter(m => m.role === "user" || m.role === "assistant"),
        context,
        language: language.code,
      });

      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: err.response?.data?.error || "Something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: "1.5rem",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: tk.isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)",
          animation: "fadeOverlay 0.25s ease",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          height: "min(620px, 88vh)",
          background: tk.isDark ? "rgba(18,16,14,0.98)" : "rgba(253,251,248,0.98)",
          border: `1px solid ${tk.goldBorder}`,
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: tk.isDark
            ? "0 30px 80px rgba(0,0,0,0.7)"
            : "0 20px 60px rgba(0,0,0,0.18)",
          animation: "chatIn 0.3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <style>{`
          @keyframes fadeOverlay { from { opacity: 0 } to { opacity: 1 } }
          @keyframes chatIn { from { opacity: 0; transform: translateY(20px) scale(.97) } to { opacity: 1; transform: none } }
          @keyframes dotBlink { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: `1px solid ${tk.surfaceBorder}`,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${tk.gold}, #a07830)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            J
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontWeight: 700,
                fontSize: "0.975rem",
                color: tk.textPrimary,
              }}
            >
              Juri
            </div>
            <div
              style={{
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontSize: "0.72rem",
                color: hasContext ? tk.success : tk.textMuted,
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: hasContext ? tk.success : tk.textMuted,
                }}
              />
              {hasContext ? "Document context loaded" : "No document analyzed yet"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: `1px solid ${tk.surfaceBorder}`,
              background: "transparent",
              color: tk.textMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontFamily: "'Roboto Serif', Georgia, serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = tk.textPrimary; e.currentTarget.style.borderColor = tk.goldBorder; }}
            onMouseLeave={e => { e.currentTarget.style.color = tk.textMuted; e.currentTarget.style.borderColor = tk.surfaceBorder; }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                padding: "0.7rem 0.95rem",
                borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background:
                  m.role === "user"
                    ? tk.gold
                    : m.error
                    ? (tk.isDark ? "rgba(224,82,82,0.12)" : "rgba(224,82,82,0.08)")
                    : (tk.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                color:
                  m.role === "user"
                    ? "#fff"
                    : m.error
                    ? tk.danger
                    : tk.textPrimary,
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                border:
                  m.role === "user"
                    ? "none"
                    : m.error
                    ? `1px solid ${tk.danger}33`
                    : `1px solid ${tk.surfaceBorder}`,
              }}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "0.7rem 0.95rem",
                borderRadius: "14px 14px 14px 4px",
                background: tk.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${tk.surfaceBorder}`,
                display: "flex",
                gap: "4px",
              }}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: tk.textMuted,
                    animation: `dotBlink 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "0.85rem 1rem",
            borderTop: `1px solid ${tk.surfaceBorder}`,
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-end",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Juri anything…"
            rows={1}
            disabled={sending}
            style={{
              flex: 1,
              resize: "none",
              background: tk.inputBg,
              border: `1px solid ${tk.inputBorder}`,
              borderRadius: "10px",
              padding: "0.6rem 0.85rem",
              fontFamily: "'Roboto Serif', Georgia, serif",
              fontSize: "0.9rem",
              color: tk.textPrimary,
              outline: "none",
              maxHeight: "100px",
              transition: "border-color .2s",
            }}
            onFocus={e => (e.target.style.borderColor = tk.gold)}
            onBlur={e => (e.target.style.borderColor = tk.inputBorder)}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: "none",
              background: !input.trim() || sending ? tk.goldBorder : tk.gold,
              color: "#fff",
              cursor: !input.trim() || sending ? "not-allowed" : "pointer",
              fontSize: "1.05rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s",
              flexShrink: 0,
            }}
            title="Send (Enter)"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}