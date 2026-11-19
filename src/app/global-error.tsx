"use client";

import Link from "next/link";

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  void error;

  return (
    <html lang="en">
      <head>
        <title>Something went wrong | Agustin</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#0A0A0A",
          color: "#F2F2F2",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: "512px",
            border: "1px solid #4A4A4A",
            backgroundColor: "#0A0A0A",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: "12px",
              letterSpacing: "0.15em",
              color: "#7A7A7A",
              textTransform: "uppercase",
            }}
          >
            [ ERROR ]
          </p>
          <h1
            style={{
              margin: "0 0 16px 0",
              fontSize: "20px",
              letterSpacing: "0.14em",
              color: "#F2F2F2",
              textTransform: "uppercase",
            }}
          >
            SOMETHING WENT WRONG
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                minHeight: "44px",
                padding: "8px 16px",
                border: "1px solid #4A4A4A",
                backgroundColor: "#0A0A0A",
                color: "#F2F2F2",
                fontFamily: "inherit",
                fontSize: "13px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              TRY AGAIN
            </button>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "8px 16px",
                border: "1px solid #4A4A4A",
                backgroundColor: "#0A0A0A",
                color: "#F2F2F2",
                fontFamily: "inherit",
                fontSize: "13px",
                letterSpacing: "0.12em",
                textDecoration: "none",
                textTransform: "uppercase",
                boxSizing: "border-box",
              }}
            >
              BACK TO START
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
