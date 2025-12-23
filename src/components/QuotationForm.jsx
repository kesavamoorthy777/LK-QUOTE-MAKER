import React, { useState, useEffect } from 'react';
import './QuotationForm.css';
import QuotePreview from './QuotePreview';

const QuotationForm = () => {
    // Form Type State (Quotation or Invoice)
    const [formType, setFormType] = useState('quotation'); // 'quotation' | 'invoice'

    // Help function to get today's date in YYYY-MM-DD format for input fields
    const getTodayDateYYYYMMDD = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Form Details (Shared & Specific)
    const [formNo, setFormNo] = useState(''); // Quote No or Invoice No
    const [formDate, setFormDate] = useState(getTodayDateYYYYMMDD()); // Quote Date or Invoice Date

    // Quotation Specific
    const [reference, setReference] = useState('Verbal');

    // Invoice Specific
    const [orderNo, setOrderNo] = useState('');
    const [orderDate, setOrderDate] = useState(getTodayDateYYYYMMDD());

    // Format date for display as DD.MM.YYYY
    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Common
    const [recipientName, setRecipientName] = useState('');
    const [recipientAddress1, setRecipientAddress1] = useState('');
    const [recipientAddress2, setRecipientAddress2] = useState('');
    const [recipientGST, setRecipientGST] = useState('');

    // Address Book
    const [showAddressDialog, setShowAddressDialog] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([
        {
            id: 1,
            name: 'M/S. ACCURATE PRODUCTS CORPORATION PVT LTD',
            address1: 'AC-22A, AC24 & AC 25A, SIDCO INDUSTRIAL ESTATE,',
            address2: 'THIRUMUDIVAKKAM, CHENNAI- 600132.',
            gst: '33AAACA5465A1ZA'
        },
        {
            id: 2,
            name: 'M/S:MAGHA ENGINEERS',
            address1: 'NO : 8, ELECTRICAL INDUSTRIAL ESTATE, KAKALUR,',
            address2: 'THIRUVALLUR, PIN CODE– 602003.',
            gst: ''
        },
        {
            id: 3,
            name: 'M/S, RICO AUTO INDUSTRIES LTD (CHE)',
            address1: 'ORAGADAM, MATHUR VILLAGE, SRIPERUMBUDUR TALUK,',
            address2: 'KANCHIPURAM, PIN – 602105.',
            gst: ''
        },
        {
            id: 4,
            name: 'M/S.ASWINCOLD FORGE PVT.LTD',
            address1: 'NO: 458 &465 SIDCO INDUSTRIAL ESTATE, AMBATTUR,',
            address2: 'CHENNAI -600098.',
            gst: '33AAGCA4099J1ZH'
        }
    ]);

    // New Address Form
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        address1: '',
        address2: '',
        gst: ''
    });

    // Select an address from the saved list
    const selectAddress = (address) => {
        setRecipientName(address.name);
        setRecipientAddress1(address.address1);
        setRecipientAddress2(address.address2);
        setRecipientGST(address.gst);
        setShowAddressDialog(false);
    };

    // Save new address
    const saveNewAddress = () => {
        if (newAddress.name && newAddress.address1) {
            const newAddr = {
                id: savedAddresses.length + 1,
                ...newAddress
            };
            setSavedAddresses([...savedAddresses, newAddr]);
            selectAddress(newAddr);
            setNewAddress({ name: '', address1: '', address2: '', gst: '' });
            setShowNewAddressForm(false);
        }
    };

    // Cancel new address form
    const cancelNewAddress = () => {
        setNewAddress({ name: '', address1: '', address2: '', gst: '' });
        setShowNewAddressForm(false);
    };

    // Preview functionality
    const [showPreview, setShowPreview] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Download PDF function
    const downloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const response = await fetch('http://localhost:3001/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formType,
                    quoteNo: formNo, // Sending as quoteNo for compatibility or invoiceNo
                    quoteDate: formatDateForDisplay(formDate),
                    reference,
                    // Invoice fields
                    invoiceNo: formNo,
                    invoiceDate: formatDateForDisplay(formDate),
                    orderNo,
                    orderDate: formatDateForDisplay(orderDate),

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
                    amountInWords: numberToWords(grandTotal),
                    priceTerms,
                    paymentTerms,
                    transitInsurance,
                    freightTerms
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const prefix = formType === 'invoice' ? 'Invoice' : 'Quotation';
            a.download = `${prefix}_${formNo || 'draft'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error generating PDF:', error);
            const isNetworkError = error.message === 'Failed to fetch' || error.message.includes('NetworkError');

            if (isNetworkError) {
                alert('Connection refused. Please ensure the backend server is running on port 3001.\n\nTip: Run "npm run server" in your terminal.');
            } else {
                alert(`Failed to generate PDF: ${error.message}`);
            }
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Terms and Conditions State
    const [priceTerms, setPriceTerms] = useState('Ex Godown, Ranipet');
    const [paymentTerms, setPaymentTerms] = useState('Immediate');
    const [transitInsurance, setTransitInsurance] = useState('Your Scope');
    const [freightTerms, setFreightTerms] = useState('Included');

    // Line Items
    const [items, setItems] = useState([]);

    // Calculations
    const [basicValue, setBasicValue] = useState(0);
    const [sgst, setSgst] = useState(0);
    const [cgst, setCgst] = useState(0);
    const [roundOff, setRoundOff] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    // Calculate totals whenever items change
    useEffect(() => {
        const basic = items.reduce((sum, item) => {
            const amount = (item.quantity || 0) * (item.unitRate || 0);
            return sum + amount;
        }, 0);

        const sgstAmount = basic * 0.09;
        const cgstAmount = basic * 0.09;
        const subtotal = basic + sgstAmount + cgstAmount;
        const rounded = Math.round(subtotal);
        const roundOffValue = rounded - subtotal;

        setBasicValue(basic);
        setSgst(sgstAmount);
        setCgst(cgstAmount);
        setRoundOff(roundOffValue);
        setGrandTotal(rounded);
    }, [items]);

    // Add new item
    const addItem = () => {
        const newItem = {
            id: items.length + 1,
            description: '',
            hsnCode: '-',
            quantity: 0,
            unitRate: 0,
        };
        setItems([...items, newItem]);
    };

    // Update item
    const updateItem = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Delete item
    const deleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    // Convert number to words (Indian numbering system)
    const numberToWords = (num) => {
        if (num === 0) return 'Zero Rupee Only';

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convertLessThanThousand = (n) => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        let crore = Math.floor(num / 10000000);
        num %= 10000000;
        let lakh = Math.floor(num / 100000);
        num %= 100000;
        let thousand = Math.floor(num / 1000);
        num %= 1000;
        let remainder = num;

        let result = '';
        if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
        if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
        if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
        if (remainder > 0) result += convertLessThanThousand(remainder);

        return result.trim() + ' Rupee Only .';
    };

    return (
        <div className="quotation-container">
            {/* Main Border Box */}
            <div className="quotation-box">

                {/* Header Section */}
                <div className="header-section">
                    <div className="logo-box">
                        <img src="/assets/logo.png" alt="LK Logo" className="logo-img" />
                    </div>
                    <div className="company-details">
                        <h1>LK TECHNICAL SERVICES</h1>
                        <p>No.1A, PILLAR KOVIL STREET, KALPATTU. RANIPET. – 631 102.</p>
                        <p>Mobile: 8110925990.</p>
                        <p className="email">Email Id: <a href="mailto:lktechnicalservices@gmail.com">lktechnicalservices@gmail.com</a></p>
                    </div>
                </div>

                {/* GST/PAN Bar */}
                <div className="gst-pan-bar">
                    <div className="gst">GSTIN No: 33RXHPS6816R1Z6</div>
                    <div className="pan">PAN No: RXHPS6816R</div>
                </div>

                {/* Quotation/Invoice Title Bar */}
                <div className="quotation-title-bar">
                    <select
                        className="form-type-select"
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                    >
                        <option value="quotation">Quotation</option>
                        <option value="invoice">TAX INVOICE</option>
                    </select>
                </div>



                {/* Info Grid (To / Quote Details) */}
                <div className="info-grid">
                    <div className="info-col to-section">
                        <div className="section-label">TO</div>
                        <div className="address-block">
                            {recipientName ? (
                                <>
                                    <p className="recipient-name">{recipientName}</p>
                                    <p>{recipientAddress1}</p>
                                    <p>{recipientAddress2}</p>
                                    <p className="gst-line">GST NO: {recipientGST}</p>
                                </>
                            ) : (
                                <p className="placeholder-text">Click "Select Address" to choose a recipient</p>
                            )}
                            <button
                                className="select-address-btn"
                                onClick={() => setShowAddressDialog(true)}
                            >
                                {recipientName ? 'Change Address' : 'Select Address'}
                            </button>
                        </div>
                    </div>
                    <div className="info-col quote-details">
                        <div className="detail-row">
                            <span className="label">{formType === 'invoice' ? 'Invoice NO' : 'Quote No'}</span>
                            <span className="separator">:</span>
                            <input
                                type="text"
                                className="input-field-inline"
                                value={formNo}
                                onChange={(e) => setFormNo(e.target.value)}
                            />
                        </div>
                        <div className="detail-row">
                            <span className="label">{formType === 'invoice' ? 'Invoice DATE' : 'Quote DATE'}</span>
                            <span className="separator">:</span>
                            <input
                                type="date"
                                className="input-field-inline"
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                                placeholder="DD.MM.YYYY"
                            />
                        </div>
                        {formType === 'quotation' ? (
                            <div className="detail-row">
                                <span className="label">Reference</span>
                                <span className="separator">:</span>
                                <input
                                    type="text"
                                    className="input-field-inline"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="detail-row">
                                    <span className="label">Order NO</span>
                                    <span className="separator">:</span>
                                    <input
                                        type="text"
                                        className="input-field-inline"
                                        value={orderNo}
                                        onChange={(e) => setOrderNo(e.target.value)}
                                    />
                                </div>
                                <div className="detail-row">
                                    <span className="label">Order DATE</span>
                                    <span className="separator">:</span>
                                    <input
                                        type="date"
                                        className="input-field-inline"
                                        value={orderDate}
                                        onChange={(e) => setOrderDate(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="items-table-container">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th className="col-sl">Sl. No</th>
                                <th className="col-desc">Description of Materials</th>
                                <th className="col-hsn">HSN Code</th>
                                <th className="col-qty">Quantity</th>
                                <th className="col-unit">Unit Rate</th>
                                <th className="col-amount">Amount</th>
                                <th className="col-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="text-center">{index + 1}.</td>
                                    <td className="text-left">
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                            placeholder="Enter description"
                                        />
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="text"
                                            className="table-input text-center"
                                            value={item.hsnCode}
                                            onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                                            placeholder="-"
                                        />
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="number"
                                            className="table-input text-center"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="text-right">
                                        <input
                                            type="number"
                                            className="table-input text-right"
                                            value={item.unitRate}
                                            onChange={(e) => updateItem(item.id, 'unitRate', parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="text-right">
                                        {((item.quantity || 0) * (item.unitRate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteItem(item.id)}
                                            title="Delete item"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="7" className="add-item-row">
                                    <button className="add-item-btn" onClick={addItem}>
                                        + Add Item
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="totals-section">
                    <div className="terms-conditions-box">
                        <div className="terms-header">TERMS & CONDITIONS:</div>
                        <div className="term-row">
                            <span className="term-label">Price Terms</span>
                            <span className="term-separator">:</span>
                            <input
                                className="term-input"
                                value={priceTerms}
                                onChange={(e) => setPriceTerms(e.target.value)}
                            />
                        </div>
                        <div className="term-row">
                            <span className="term-label">Payment Terms</span>
                            <span className="term-separator">:</span>
                            <input
                                className="term-input"
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                            />
                        </div>
                        <div className="term-row">
                            <span className="term-label">Transit Insurance</span>
                            <span className="term-separator">:</span>
                            <input
                                className="term-input"
                                value={transitInsurance}
                                onChange={(e) => setTransitInsurance(e.target.value)}
                            />
                        </div>
                        <div className="term-row">
                            <span className="term-label">Freight Terms</span>
                            <span className="term-separator">:</span>
                            <input
                                className="term-input"
                                value={freightTerms}
                                onChange={(e) => setFreightTerms(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="totals-table">
                        <div className="total-row">
                            <div className="t-label">Basic Value</div>
                            <div className="t-value">{basicValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="total-row">
                            <div className="t-label">SGST TAX 9 %</div>
                            <div className="t-value">{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="total-row">
                            <div className="t-label">CGST TAX 9 %</div>
                            <div className="t-value">{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="total-row">
                            <div className="t-label">Round Off</div>
                            <div className="t-value">{roundOff.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="total-row grand-total">
                            <div className="t-label">Grand Total</div>
                            <div className="t-value">{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                </div>

                {/* Amount in Words & Remarks */}
                <div className="footer-details">
                    <div className="amount-in-words">
                        <strong>Amount In Words:</strong> {numberToWords(grandTotal)}
                    </div>
                    <div className="remarks-signatures">
                        <div className="remarks-col">
                            <strong>Remarks:</strong>
                        </div>
                        <div className="signatures-col">
                            <div className="company-sign-label">For LK TECHNICAL SERVICES</div>
                            <div className="sign-space"></div>
                            <div className="auth-sign-label">Authorized Signatory</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Preview Button (Below Form) */}
            <div className="preview-button-container">
                <button
                    className="preview-quote-btn"
                    onClick={() => setShowPreview(true)}
                >
                    👁 Preview {formType === 'invoice' ? 'Invoice' : 'Quote'}
                </button>
            </div>

            {/* Floating Preview Button for Mobile */}
            <div className="mobile-preview-fab">
                <button onClick={() => setShowPreview(true)}>👁</button>
            </div>

            {/* Address Selection Dialog */}
            {showAddressDialog && (
                <div className="modal-overlay" onClick={() => setShowAddressDialog(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-text">
                                <h2>Select Recipient</h2>
                                <p>Choose a company from your address book</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowAddressDialog(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            {!showNewAddressForm ? (
                                <>
                                    <div className="address-list">
                                        {savedAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                className="address-card"
                                                onClick={() => selectAddress(addr)}
                                            >
                                                <div className="address-card-icon">🏢</div>
                                                <div className="address-card-info">
                                                    <div className="address-card-name">{addr.name}</div>
                                                    <div className="address-card-details">{addr.address1}</div>
                                                    <div className="address-card-details">{addr.address2}</div>
                                                    {addr.gst && <div className="address-card-gst">GST: {addr.gst}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="add-new-address-btn"
                                        onClick={() => setShowNewAddressForm(true)}
                                    >
                                        + Create New Entry
                                    </button>
                                </>
                            ) : (
                                <div className="new-address-form">
                                    <h3>New Address Entry</h3>
                                    <div className="form-grid">
                                        <div className="form-group full">
                                            <label>Company/Recipient Name *</label>
                                            <input
                                                type="text"
                                                value={newAddress.name}
                                                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                                placeholder="e.g. Acme Corp"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Address Line 1 *</label>
                                            <input
                                                type="text"
                                                value={newAddress.address1}
                                                onChange={(e) => setNewAddress({ ...newAddress, address1: e.target.value })}
                                                placeholder="Street, Area"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Address Line 2</label>
                                            <input
                                                type="text"
                                                value={newAddress.address2}
                                                onChange={(e) => setNewAddress({ ...newAddress, address2: e.target.value })}
                                                placeholder="City, Pincode"
                                            />
                                        </div>
                                        <div className="form-group full">
                                            <label>GST Number (Optional)</label>
                                            <input
                                                type="text"
                                                value={newAddress.gst}
                                                onChange={(e) => setNewAddress({ ...newAddress, gst: e.target.value })}
                                                placeholder="GSTIN"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button className="cancel-btn" onClick={cancelNewAddress}>Cancel</button>
                                        <button className="save-btn" onClick={saveNewAddress}>Save & Select</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Preview Modal */}
            {showPreview && (
                <QuotePreview
                    quoteData={{
                        formType,
                        quoteNo: formNo,
                        quoteDate: formatDateForDisplay(formDate),
                        reference,
                        invoiceNo: formNo,
                        invoiceDate: formatDateForDisplay(formDate),
                        orderNo,
                        orderDate: formatDateForDisplay(orderDate),

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
                        amountInWords: numberToWords(grandTotal),
                        priceTerms,
                        paymentTerms,
                        transitInsurance,
                        freightTerms
                    }}
                    onClose={() => setShowPreview(false)}
                    onDownloadPDF={downloadPDF}
                    isGeneratingPDF={isGeneratingPDF}
                />
            )}
        </div>
    );
};

export default QuotationForm;
