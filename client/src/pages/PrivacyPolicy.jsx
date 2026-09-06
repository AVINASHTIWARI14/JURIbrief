import { useEffect } from "react";
import { useTokens } from "../App";

export default function PrivacyPolicy() {
  const tk = useTokens();

  // Open page at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Information We Collect",
      content: (
        <>
          <p>Account information such as your name and email address.</p>
          <p>Documents or files you upload for analysis.</p>
          <p>Information you provide when contacting us.</p>
          <p>
            Basic technical information such as browser type, device
            information, and usage data.
          </p>
        </>
      ),
    },
    {
      title: "2. How We Use Your Information",
      content: (
        <>
          <p>We use your information to:</p>
          <ul>
            <li>Provide document summarization and analysis.</li>
            <li>
              Identify potential risks or important clauses in documents.
            </li>
            <li>Maintain and improve JURIbrief.</li>
            <li>Authenticate users and maintain account security.</li>
            <li>Respond to support requests.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. Your Documents",
      content: (
        <p>
          Documents uploaded to JURIbrief may contain sensitive or
          confidential information. We use uploaded documents only to provide
          the requested service and do not sell your documents or personal
          information to third parties.
        </p>
      ),
    },
    {
      title: "4. AI Processing",
      content: (
        <p>
          JURIbrief uses artificial intelligence to analyze uploaded
          documents. AI-generated results may contain errors and should not be
          treated as legal advice.
        </p>
      ),
    },
    {
      title: "5. Data Storage & Security",
      content: (
        <p>
          We take reasonable measures to protect your information from
          unauthorized access, alteration, or disclosure. However, no online
          service can guarantee complete security.
        </p>
      ),
    },
    {
      title: "6. Third-Party Services",
      content: (
        <p>
          JURIbrief may use third-party services for authentication, database
          storage, hosting, analytics, or AI processing. These services may
          process information as necessary to provide JURIbrief's
          functionality.
        </p>
      ),
    },
    {
      title: "7. Data Retention & Deletion",
      content: (
        <p>
          We retain information only for as long as reasonably necessary to
          provide our services or meet legal requirements. Users may request
          deletion of their account and associated data, subject to applicable
          legal or technical requirements.
        </p>
      ),
    },
    {
      title: "8. Your Rights",
      content: (
        <p>
          Depending on your location, you may have rights to access, correct,
          export, or delete your personal information.
        </p>
      ),
    },
    {
      title: "9. Children's Privacy",
      content: (
        <p>
          JURIbrief is not intended for children under the applicable minimum
          age for using online services.
        </p>
      ),
    },
    {
      title: "10. Changes to This Policy",
      content: (
        <p>
          We may update this Privacy Policy from time to time. Any changes
          will be posted on this page with an updated effective date.
        </p>
      ),
    },
    {
      title: "11. Contact",
      content: (
        <p>
          For privacy-related questions or requests, contact us at{" "}
          <span style={{ color: tk.gold }}>[your email]</span>.
        </p>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tk.background,
        color: tk.textPrimary,
        padding: "7rem 1.5rem 5rem",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 500,
            margin: "0 0 0.75rem",
            color: tk.textPrimary,
          }}
        >
          Privacy Policy —{" "}
          <span
            style={{
              fontFamily: "'IM Fell French Canon', serif",
              color: "#c9a84c",
              letterSpacing: "0.01em",
            }}
          >
            JURI
          </span>
          <span
            style={{
              fontFamily: "'Great Vibes', cursive",
              color: tk.isDark ? "#ffffff" : "#000000",
              marginLeft: "0.08em",
            }}
          >
            brief
          </span>
        </h1>

        <p
          style={{
            fontFamily: "'Roboto Serif', Georgia, serif",
            color: tk.textSecondary,
            fontSize: "0.9rem",
            marginBottom: "2.5rem",
          }}
        >
          Effective Date: September 6, 2026
        </p>

        {/* Policy */}
        <div
          style={{
            borderTop: `1px solid ${tk.surfaceBorder}`,
          }}
        >
          {sections.map((section) => (
            <section
              key={section.title}
              style={{
                padding: "1.5rem 0",
                borderBottom: `1px solid ${tk.surfaceBorder}`,
              }}
            >
              <h2
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  margin: "0 0 0.75rem",
                  color: tk.textPrimary,
                }}
              >
                {section.title}
              </h2>

              <div
                style={{
                  fontFamily: "'Roboto Serif', Georgia, serif",
                  fontSize: "0.92rem",
                  lineHeight: 1.75,
                  color: tk.textSecondary,
                }}
              >
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Additional important note */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem 1.25rem",
            border: `1px solid ${tk.goldBorder}`,
            borderRadius: "10px",
            background: tk.goldLight,
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            color: tk.textSecondary,
          }}
        >
          <strong style={{ color: tk.textPrimary }}>
            Important:
          </strong>{" "}
          JURIbrief is a document-analysis and information tool. It does not
          replace a qualified lawyer, and users should seek professional legal
          advice when dealing with important legal matters.
        </div>
      </div>
    </div>
  );
}