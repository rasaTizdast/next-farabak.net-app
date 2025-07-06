import { useRef } from "react";

export interface PrintOptions {
  hideElements?: string[];
  printTitle?: string;
  compactMode?: boolean;
  stickerMode?: boolean;
}

export const usePrint = () => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = (options: PrintOptions = {}) => {
    if (!componentRef.current) return;

    const {
      hideElements = [],
      printTitle,
      compactMode = false,
      stickerMode = false,
    } = options;

    // Store original title to restore later
    const originalTitle = document.title;

    // Set print-specific title if provided
    if (printTitle) {
      document.title = printTitle;
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("لطفاً اجازه باز شدن پنجره جدید را بدهید.");
      return;
    }

    // Get all stylesheets from the current document
    const stylesheets = Array.from(document.styleSheets);
    const styleLinks = stylesheets
      .map((stylesheet) => {
        if (stylesheet.href) {
          return `<link rel="stylesheet" href="${stylesheet.href}" />`;
        }
        return "";
      })
      .join("");

    // Include IRANYekanXVF font
    const customFontStyle = `
      <style>
        @font-face {
          font-family: 'IranYekan';
          src: url('https://farabaks3.storage.c2.liara.space/fonts/IRANYekanXVF.woff') format('woff');
          font-weight: 100 1000;
          font-style: normal;
          font-display: swap;
        }
      </style>
    `;

    // Create print-specific stylesheet
    const printStyles = `
      <style>
        /* Use IranYekan font */
        :root {
          --font-iran-yekan: 'IranYekan', Tahoma, Arial, sans-serif;
        }
        
        * {
          font-family: var(--font-iran-yekan) !important;
        }
        
        @media print {
          body {
            background-color: white;
            color: black;
            font-family: var(--font-iran-yekan) !important;
            ${compactMode ? "font-size: 90%;" : ""}
            ${stickerMode ? "margin: 0; padding: 0;" : ""}
          }
          
          /* Light mode conversion */
          .bg-slate-900, .bg-slate-800, .bg-slate-700, .bg-gray-800 {
            background-color: white !important;
            color: #333 !important;
          }
          
          /* Border colors in light mode */
          .border-slate-700, .border-gray-700 {
            border-color: #ddd !important;
          }
          
          /* Text colors in light mode */
          .text-white, .text-gray-100, .text-gray-300, .text-gray-400 {
            color: #333 !important;
          }
          
          /* Custom hide elements */
          ${hideElements
            .map((selector) => `${selector} { display: none !important; }`)
            .join("\n")}
          
          /* Default hide elements for all print templates */
          button, .no-print {
            display: none !important;
          }
          
          /* Table styling for print */
          table {
            width: 100%;
            border-collapse: collapse;
            ${compactMode ? "font-size: 90%;" : ""}
            font-family: var(--font-iran-yekan) !important;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: ${compactMode ? "4px" : "8px"};
            text-align: right;
            font-family: var(--font-iran-yekan) !important;
          }
          
          th {
            background-color: #f2f2f2;
          }
          
          /* Fix for invoice tables - remove height restrictions */
          .overflow-auto, .overflow-x-auto, .overflow-y-auto {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
          
          /* Prevent table rows from breaking across pages */
          tr {
            page-break-inside: avoid !important;
          }
          
          /* Badge styling */
          .bg-green-900, .bg-yellow-900, .bg-red-900, .bg-blue-900 {
            background-color: #f8f8f8 !important;
            border: 1px solid #ddd;
            padding: 2px 6px;
          }
          
          .text-green-300 {
            color: #22c55e !important;
          }
          
          .text-yellow-300 {
            color: #eab308 !important;
          }
          
          .text-red-300, .text-red-400 {
            color: #ef4444 !important;
          }
          
          .text-blue-300 {
            color: #3b82f6 !important;
          }

          /* Compact spacing for all elements */
          ${
            compactMode
              ? `
          p {
            margin: 5px 0;
          }
          
          .p-3, .p-4, .p-6 {
            padding: 8px !important;
          }
          
          .mb-4, .mb-8 {
            margin-bottom: 10px !important;
          }
          
          .space-y-3, .space-y-4, .space-y-6 {
            margin-top: 8px !important;
          }
          
          h1, h2, h3 {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
          }
          `
              : ""
          }

          /* Sticker mode for warranty card */
          ${
            stickerMode
              ? `
          @page {
            size: 3.5in 2in !important;
            margin: 0 !important;
          }
          
          html, body {
            width: 3.5in !important;
            height: 2in !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          
          .p-6 {
            padding: 0 !important;
          }
          
          .warranty-certificate {
            width: 3.5in !important;
            height: 2in !important;
            padding: 5px !important;
            border: 1px solid #000 !important;
            border-radius: 0 !important;
            font-size: 7pt !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            font-family: var(--font-iran-yekan) !important;
          }

          .warranty-certificate h1 {
            font-size: 9pt !important;
            margin: 2px 0 !important;
            padding: 0 !important;
            font-family: var(--font-iran-yekan) !important;
          }

          .warranty-certificate p {
            margin: 1px 0 !important;
            padding: 0 !important;
            font-size: 6pt !important;
            line-height: 1.2 !important;
            font-family: var(--font-iran-yekan) !important;
          }

          .warranty-certificate .flex {
            padding: 1px 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
          }

          .warranty-certificate .space-y-2 {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            flex: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .warranty-certificate .border-b {
            border-bottom: 1px dotted #999 !important;
            padding: 0 !important;
            margin-bottom: 1px !important;
          }

          .warranty-certificate .mt-3 {
            margin-top: 2px !important;
            border-top: 1px solid #ddd !important;
            padding-top: 2px !important;
          }
          
          .warranty-certificate .text-center {
            text-align: center !important;
          }
          `
              : ""
          }
        }
      </style>
    `;

    // Clone and prepare the content
    const content = componentRef.current.cloneNode(true) as HTMLElement;

    // Apply print-only modifications to the cloned content
    hideElements.forEach((selector) => {
      const elements = content.querySelectorAll(selector);
      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.display = "none";
        }
      });
    });

    // Populate the print window with special handling for sticker mode
    printWindow.document.open();

    // Improved script with better window handling and font loading
    const printScript = `
      <script>
        // Track if print dialog was opened
        let printDialogOpened = false;
        let closingTimeout;
        
        // Function to close the window with multiple attempts
        function attemptToClose() {
          try {
            window.close();
            // If window didn't close, try again in 100ms
            setTimeout(function() {
              if (!window.closed) {
                window.close();
              }
            }, 100);
          } catch (e) {
            console.error('Failed to close window:', e);
          }
        }
        
        // Ensure fonts are loaded before printing
        document.fonts.ready.then(function() {
          window.onload = function() {
            // Allow a moment for everything to render
            setTimeout(function() {
              // Open print dialog
              window.print();
              printDialogOpened = true;
              
              // Add event listener for afterprint - most reliable method
              window.addEventListener('afterprint', function() {
                clearTimeout(closingTimeout);
                attemptToClose();
              });
              
              // Set a fallback timeout to close the window if afterprint doesn't fire
              closingTimeout = setTimeout(attemptToClose, 1000);
            }, 300);
          };
        });
        
        // Backup for when print dialog is closed without printing
        window.addEventListener('focus', function() {
          if (printDialogOpened) {
            clearTimeout(closingTimeout);
            attemptToClose();
          }
        });
        
        // Close on any user interaction as last resort
        document.addEventListener('click', function() {
          attemptToClose();
        });
        
        // Force close after a maximum time as ultimate fallback
        setTimeout(attemptToClose, 10000);
      </script>
    `;

    if (stickerMode) {
      // For sticker, create a minimal, tightly controlled document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <title>${printTitle || document.title}</title>
            ${styleLinks}
            ${customFontStyle}
            ${printStyles}
            ${printScript}
          </head>
          <body style="margin:0;padding:0;overflow:hidden;width:3.5in;height:2in;font-family:var(--font-iran-yekan);">
            ${componentRef.current.innerHTML}
          </body>
        </html>
      `);
    } else {
      // For regular printing, use normal approach
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <title>${printTitle || document.title}</title>
            ${styleLinks}
            ${customFontStyle}
            ${printStyles}
            ${printScript}
          </head>
          <body style="font-family:var(--font-iran-yekan);">
            ${content.outerHTML}
          </body>
        </html>
      `);
    }

    printWindow.document.close();

    // Focus the print window to bring it to front
    printWindow.focus();

    // Restore original title
    document.title = originalTitle;
  };

  return { componentRef, handlePrint };
};
