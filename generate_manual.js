const fs = require('fs');
const { marked } = require('marked');

const mdContent = fs.readFileSync('manual.md', 'utf-8');
const htmlContent = marked.parse(mdContent);

const finalHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>الدليل الإجرائي - إدارة الموارد البشرية</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['"IBM Plex Sans Arabic"', 'sans-serif'],
            },
            colors: {
              primary: {
                50: '#ecfdf5',
                100: '#d1fae5',
                500: '#10b981',
                600: '#059669',
                700: '#047857',
              }
            }
          }
        }
      }
    </script>
    <style>
        body {
            font-family: 'IBM Plex Sans Arabic', sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            line-height: 1.8;
        }
        .page-wrapper {
            max-width: 900px;
            margin: 40px auto;
            background: white;
            padding: 60px;
            border-radius: 24px;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
        }
        
        /* Typography Styling */
        h1 {
            font-size: 2.25rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 1.5rem;
            text-align: center;
            background: linear-gradient(to left, #10b981, #0d9488);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            padding-bottom: 20px;
            border-bottom: 2px dashed #e2e8f0;
        }
        h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        h2::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 24px;
            background: linear-gradient(to bottom, #10b981, #0d9488);
            border-radius: 4px;
        }
        h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #334155;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        p {
            margin-bottom: 1rem;
            color: #475569;
        }
        ul, ol {
            margin-bottom: 1.5rem;
            padding-right: 1.5rem;
            color: #475569;
        }
        li {
            margin-bottom: 0.5rem;
        }
        li::marker {
            color: #10b981;
            font-weight: bold;
        }
        strong {
            color: #0f172a;
            font-weight: 600;
        }
        hr {
            margin: 3rem 0;
            border-color: transparent;
            page-break-after: always;
            break-after: page;
        }
        
        /* PDF Print Styles */
        @media print {
            body {
                background: white;
            }
            .page-wrapper {
                box-shadow: none;
                margin: 0;
                padding: 0;
                max-width: 100%;
            }
            .no-print {
                display: none !important;
            }
            h2 {
                margin-top: 0;
                padding-top: 20px;
                page-break-after: avoid;
            }
            h3 {
                page-break-after: avoid;
            }
            p, ul, li {
                page-break-inside: avoid;
            }
        }
        
        /* Custom Header for Print */
        .cover-page {
            text-align: center;
            padding: 100px 20px;
            margin-bottom: 50px;
        }
        .cover-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(to bottom right, #10b981, #0d9488);
            border-radius: 20px;
            margin: 0 auto 30px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
        }
    </style>
</head>
<body>
    
    <div class="fixed top-6 left-6 no-print">
        <button onclick="window.print()" class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            تصدير كملف PDF
        </button>
    </div>

    <div class="page-wrapper">
        <div class="cover-page">
            <div class="cover-logo">
                <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            </div>
            <h1 style="border:none; padding:0;">الدليل الإجرائي والتحليل التقني</h1>
            <p class="text-xl text-gray-500 mt-4">نظام إدارة الموارد البشرية</p>
            <p class="text-sm text-gray-400 mt-8">تاريخ الإصدار: 2026/05/14</p>
        </div>
        
        <div class="content">
            ${htmlContent.replace(/<h1>(.*?)<\/h1>/, '')}
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('manual_styled.html', finalHtml, 'utf-8');
console.log('manual_styled.html generated successfully.');
