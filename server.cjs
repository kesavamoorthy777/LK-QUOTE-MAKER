const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check endpoint
app.get('/', (req, res) => {
    res.send('PDF Generation Server is running!');
});

// Helper function to convert image to base64
function getImageBase64(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            return null;
        }
        const image = fs.readFileSync(filePath);
        return Buffer.from(image).toString('base64');
    } catch (error) {
        console.error('Error reading image file:', error);
        return null;
    }
}

// PDF Generation endpoint
app.post('/generate-pdf', async (req, res) => {
    let browser = null;
    try {
        const quoteData = req.body;
        console.log('Received PDF generation request for Quote:', quoteData.quoteNo);

        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Generate HTML content
        const logoPath = path.join(__dirname, 'public', 'assets', 'logo.png');
        const logoBase64 = getImageBase64(logoPath);

        const htmlContent = generateQuotationHTML(quoteData, logoBase64);

        // Set content and wait for load
        // Changed to 'load' as we are using base64 images and no external resources
        await page.setContent(htmlContent, { waitUntil: 'load', timeout: 30000 });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                right: '15mm',
                bottom: '15mm',
                left: '15mm'
            }
        });

        console.log('PDF generated successfully');

        // Send PDF
        res.contentType('application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            error: 'Failed to generate PDF',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

// Function to generate HTML for the quotation
function generateQuotationHTML(data, logoBase64) {
    const {
        formType = 'quotation',
        quoteNo,
        quoteDate,
        reference,
        invoiceNo,
        invoiceDate,
        orderNo,
        orderDate,
        recipientName,
        recipientAddress1,
        recipientAddress2,
        recipientGST,
        items,
        basicValue,
        sgst,
        cgst,
        roundOff,
        grandTotal,
        amountInWords,
        priceTerms,
        paymentTerms,
        transitInsurance,
        freightTerms
    } = data;

    // Generate items rows
    const itemsHTML = items.map((item, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}.</td>
            <td style="text-align: left;">${item.description}</td>
            <td style="text-align: center;">${item.hsnCode}</td>
            <td style="text-align: center;">${item.quantity} NOS</td>
            <td style="text-align: right;">${item.unitRate.toLocaleString('en-IN')}</td>
            <td style="text-align: right;">${((item.quantity || 0) * (item.unitRate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
    `).join('');

    // Add empty rows if needed
    let emptyRows = '';
    const MIN_ROWS = 8; // Reduced from 10 to ensure it fits on one page consistently
    if (items.length < MIN_ROWS) {
        for (let i = 0; i < (MIN_ROWS - items.length); i++) {
            emptyRows += '<tr style="height: 30px;"><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        }
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
            color: #000;
        }
        .quotation-box {
            width: 180mm;
            margin: 0 auto;
            border: 1px solid #000;
            box-sizing: border-box;
            background: #fff;
        }
        .header-section {
            display: flex;
            border-bottom: 1px solid #000;
            height: 120px;
            border-right: 1px solid #000;
            border-left: 1px solid #000;
            margin: -1px; /* Overlap container border to avoid thickness issues */
        }
        .logo-box {
            width: 140px;
            border-right: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 5px;
        }
        .logo-box img {
            max-width: 130px;
            max-height: 110px;
            object-fit: contain;
        }
        .company-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 10px;
        }
        .company-details h1 {
            font-size: 20px;
            margin: 0 0 5px 0;
            color: #000;
        }
        .company-details p {
            margin: 2px 0;
            font-size: 12px;
            font-weight: bold;
        }
        .company-details a {
            color: inherit;
            text-decoration: none;
        }
        .gst-pan-bar {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #000;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: bold;
            border-right: 1px solid #000;
            border-left: 1px solid #000;
            margin: 0 -1px;
        }
        .quotation-title-bar {
            text-align: center;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding: 2px 0;
            font-size: 14px;
            border-right: 1px solid #000;
            border-left: 1px solid #000;
            margin: 0 -1px;
        }
        .info-grid {
            display: flex;
            border-bottom: 1px solid #000;
            border-right: 1px solid #000;
            border-left: 1px solid #000;
            margin: 0 -1px;
        }
        .info-col {
            flex: 1;
            padding: 10px;
        }
        .to-section {
            border-right: 1px solid #000;
        }
        .section-label {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
        }
        .address-block p {
            margin: 2px 0;
            font-size: 12px;
            font-weight: bold;
        }
        .quote-details {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .detail-row {
            display: flex;
            margin-bottom: 5px;
            font-size: 12px;
            font-weight: bold;
        }
        .detail-row .label {
            width: 100px;
        }
        .detail-row .separator {
            width: 20px;
            text-align: center;
        }
        table {
            width: 100.2%; /* Slightly wider to ensure it touches container edges */
            margin: 0 -1px;
            border-collapse: collapse;
            table-layout: fixed;
        }
        th, td {
            border: 1px solid #000;
            padding: 5px;
            font-size: 12px;
            word-wrap: break-word;
        }
        thead tr {
            border-bottom: 1px solid #000;
        }
        th {
            font-weight: bold;
            text-align: center;
        }
        td {
            height: 30px;
        }
        
        /* Totals Section */
        .totals-section {
            display: flex;
            border-top: 1px solid #000;
            page-break-inside: avoid;
        }
        .terms-box {
            flex: 1;
            padding: 10px;
            border-right: 1px solid #000;
            font-size: 11px;
        }
        .terms-header {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 5px;
            font-size: 12px;
        }
        .term-row {
            display: flex;
            margin-bottom: 4px;
            font-weight: bold;
        }
        .term-row .label {
            width: 130px;
        }
        .term-row .sep {
            width: 15px;
            text-align: center;
        }
        .totals-table {
            width: 35%;
            min-width: 250px;
        }
        .total-row {
            display: flex;
            border-bottom: 1px solid #000;
            font-size: 12px;
            font-weight: bold;
        }
        .total-row:last-child {
            border-bottom: none;
        }
        .t-label {
            flex: 1;
            padding: 5px;
            border-right: 1px solid #000;
        }
        .t-value {
            width: 40%;
            padding: 5px;
            text-align: right;
        }
        
        /* Footer */
        .footer-details {
            border-top: 1px solid #000;
            page-break-inside: avoid;
        }
        .amount-in-words {
            padding: 8px 10px;
            border-bottom: 1px solid #000;
            font-size: 12px;
            font-weight: bold;
        }
        .remarks-signatures {
            display: flex;
            min-height: 120px;
        }
        .remarks-col {
            flex: 1;
            border-right: 1px solid #000;
            padding: 8px 10px;
            font-size: 12px;
        }
        .signatures-col {
            width: 40%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 8px 10px;
            text-align: center;
            font-size: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="quotation-box">
        <div class="header-section">
            <div class="logo-box">
                ${logoBase64 ?
            `<img src="data:image/png;base64,${logoBase64}" alt="Logo" />` :
            `<div style="font-size: 24px; font-weight: bold;">LK</div>`
        }
            </div>
            <div class="company-details">
                <h1>LK TECHNICAL SERVICES</h1>
                <p>No.1A, PILLAR KOVIL STREET, KALPATTU. RANIPET. – 631 102.</p>
                <p>Mobile: 8110925990.</p>
                <p>Email Id: lktechnicalservices@gmail.com</p>
            </div>
        </div>

        <div class="gst-pan-bar">
            <div>GSTIN No: 33RXHPS6816R1Z6</div>
            <div>PAN No: RXHPS6816R</div>
        </div>

        <div class="quotation-title-bar">${formType === 'invoice' ? 'TAX INVOICE' : 'Quotation'}</div>

        <div class="info-grid">
            <div class="info-col to-section">
                <div class="section-label">TO</div>
                <div class="address-block">
                    <p>${recipientName || 'N/A'}</p>
                    <p>${recipientAddress1 || ''}</p>
                    <p>${recipientAddress2 || ''}</p>
                    <p>GST NO: ${recipientGST || 'N/A'}</p>
                </div>
            </div>
            <div class="info-col quote-details">
                <div class="detail-row">
                    <span class="label">${formType === 'invoice' ? 'Invoice NO' : 'Quote No'}</span>
                    <span class="separator">:</span>
                    <span>${formType === 'invoice' ? invoiceNo : (quoteNo || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <span class="label">${formType === 'invoice' ? 'Invoice DATE' : 'Quote DATE'}</span>
                    <span class="separator">:</span>
                    <span>${formType === 'invoice' ? invoiceDate : quoteDate}</span>
                </div>
                ${formType === 'quotation' ? `
                <div class="detail-row">
                    <span class="label">Reference</span>
                    <span class="separator">:</span>
                    <span>${reference}</span>
                </div>
                ` : `
                <div class="detail-row">
                    <span class="label">Order NO</span>
                    <span class="separator">:</span>
                    <span>${orderNo}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Order DATE</span>
                    <span class="separator">:</span>
                    <span>${orderDate}</span>
                </div>
                `}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">Sl. No</th>
                    <th style="width: 45%;">Description of Materials</th>
                    <th style="width: 10%;">HSN Code</th>
                    <th style="width: 10%;">Quantity</th>
                    <th style="width: 15%;">Unit Rate</th>
                    <th style="width: 15%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
                ${emptyRows}
            </tbody>
        </table>

        <div class="totals-section">
            <div class="terms-box">
                <div class="terms-header">TERMS & CONDITIONS:</div>
                <div class="term-row"><span class="label">Price Terms</span><span class="sep">:</span><span>${priceTerms}</span></div>
                <div class="term-row"><span class="label">Payment Terms</span><span class="sep">:</span><span>${paymentTerms}</span></div>
                <div class="term-row"><span class="label">Transit Insurance</span><span class="sep">:</span><span>${transitInsurance}</span></div>
                <div class="term-row"><span class="label">Freight Terms</span><span class="sep">:</span><span>${freightTerms}</span></div>
            </div>
            <div class="totals-table">
                <div class="total-row">
                    <div class="t-label">Basic Value</div>
                    <div class="t-value">${basicValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div class="total-row">
                    <div class="t-label">SGST TAX 9 %</div>
                    <div class="t-value">${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div class="total-row">
                    <div class="t-label">CGST TAX 9 %</div>
                    <div class="t-value">${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div class="total-row">
                    <div class="t-label">Round Off</div>
                    <div class="t-value">${roundOff.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div class="total-row">
                    <div class="t-label">Grand Total</div>
                    <div class="t-value">${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            </div>
        </div>

        <div class="footer-details">
            <div class="amount-in-words">
                <strong>Amount In Words:</strong> ${amountInWords}
            </div>
            <div class="remarks-signatures">
                <div class="remarks-col">
                    <strong>Remarks:</strong>
                </div>
                <div class="signatures-col">
                    <div>FOR LK TECHNICAL SERVICES</div>
                    <div style="flex: 1;"></div>
                    <div style="border-top: 1px solid #000; padding-top: 5px;">AUTHORIZED SIGNATORY</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

app.listen(PORT, () => {
    console.log(`PDF Generation Server running on http://localhost:${PORT}`);
});
