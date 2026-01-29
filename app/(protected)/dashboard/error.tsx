
// app/global-error.tsx
"use client";

import { useRouter } from "next/navigation";

export default function GlobalError({}: {}) {
  const router = useRouter();

  return (
    <html>
      <body>
        <h2>A critical error occurred.</h2>
        <button
          onClick={() => {
            router.push("/");
          }}
        >
          Restart Application
        </button>
      </body>
    </html>
  );
}
