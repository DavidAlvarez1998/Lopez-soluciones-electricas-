'use client';

import dynamic from 'next/dynamic';
import type { ReactElement } from 'react';

// PDFDownloadLink must run only in the browser — dynamic import with ssr:false
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false }
);

interface DownloadPDFButtonProps {
  document: ReactElement;
  fileName: string;
  label?: string;
}

export default function DownloadPDFButton({ document, fileName, label = 'Descargar PDF' }: DownloadPDFButtonProps) {
  return (
    <PDFDownloadLink document={document} fileName={fileName}>
      {({ loading }) => (
        <span
          className="inline-flex items-center gap-1.5 bg-white/5 border border-blue-glow/40 text-blue-glow hover:bg-blue-glow/10 hover:border-blue-glow font-medium px-4 py-2 rounded-lg transition text-sm cursor-pointer select-none"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border border-blue-glow border-t-transparent rounded-full animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {label}
            </>
          )}
        </span>
      )}
    </PDFDownloadLink>
  );
}
