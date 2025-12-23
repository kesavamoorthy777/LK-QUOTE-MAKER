# Quotation Form Application

A professional quotation management system with PDF generation capability.

## Features

✅ Interactive quotation form with:
- Address book with predefined companies
- Add new addresses on the fly
- Dynamic line items management
- Automatic GST calculations (SGST 9% + CGST 9%)
- Date picker for easy date selection
- Real-time total calculations
- Amount in words converter

✅ **Preview & PDF Download**:
- Preview your quotation before generating PDF
- Download professional PDF using Puppeteer
- Print-ready A4 format

## Getting Started

### Installation

```bash
# Navigate to the project directory
cd quotation-form

# Install dependencies
npm install
```

### Running the Application

You have two options:

#### Option 1: Run both frontend and backend together

```bash
npm start
```

This will start:
- Frontend (React + Vite) on `http://localhost:5173`
- Backend (Express + Puppeteer) on `http://localhost:3001`

#### Option 2: Run separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

## How to Use

1. **Fill Quote Details:**
   - Enter Quote Number
   - Select date using the date picker
   - Add reference

2. **Select Recipient:**
   - Click "Select Address" button
   - Choose from saved addresses OR
   - Click "+ Add New Address" to add a new company

3. **Add Items:**
   - Click "+ Add Item" to add rows
   - Enter description, HSN code, quantity, and unit rate
   - Amount calculates automatically

4. **Preview & Download:**
   - Click "👁 Preview Quote" to see the final quotation
   - In the preview modal, click "📥 Download PDF" to generate and download the PDF

## Project Structure

```
quotation-form/
├── public/
│   └── assets/
│       ├── logo.png          # Company logo
│       └── reference.jpg     # Reference image
├── src/
│   ├── components/
│   │   ├── QuotationForm.jsx      # Main form component
│   │   ├── QuotationForm.css      # Form styles
│   │   ├── QuotePreview.jsx       # Preview modal component
│   │   └── QuotePreview.css       # Preview styles
│   ├── App.jsx
│   └── index.css
├── server.js                  # Express + Puppeteer backend
└── package.json

```

## Backend API

### POST /generate-pdf

Generates a PDF from quotation data.

**Request Body:**
```json
{
  "quoteNo": "1",
  "quoteDate": "16.12.2025",
  "reference": "Verbal",
  "recipientName": "Company Name",
  "recipientAddress1": "Address Line 1",
  "recipientAddress2": "Address Line 2",
  "recipientGST": "GST Number",
  "items": [...],
  "basicValue": 11000,
  "sgst": 990,
  "cgst": 990,
  "roundOff": 0,
  "grandTotal": 12980,
  "amountInWords": "..."
}
```

**Response:**
- Content-Type: `application/pdf`
- Binary PDF data

## Technologies Used

- **Frontend:**
  - React 19
  - Vite
  - Vanilla CSS

- **Backend:**
  - Node.js
  - Express.js
  - Puppeteer (for PDF generation)
  - CORS

## Customization

### Company Details

Edit `src/components/QuotationForm.jsx` to change:
- Company name
- Address
- GSTIN and PAN numbers
- Logo

### Saved Addresses

Modify the `savedAddresses` state in `QuotationForm.jsx` to add/remove predefined companies.

### Tax Rates

Change SGST/CGST rates in the calculations section:
```javascript
const sgstAmount = basic * 0.09;  // 9% SGST
const cgstAmount = basic * 0.09;  // 9% CGST
```

## Notes

- Make sure both frontend and backend are running to use PDF download feature
- The backend server must be accessible at `http://localhost:3001`
- Puppeteer will download Chromium on first install (~150MB)

## Support

For issues or questions, please check the implementation or modify as needed.
