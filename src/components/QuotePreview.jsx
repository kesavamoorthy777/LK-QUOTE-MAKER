import React from 'react';
import './QuotePreview.css';
import { COMPANY_CONFIG } from '../config';

const QuotePreview = ({
    quoteData,
    onClose,
    onDownloadPDF,
    isGeneratingPDF
}) => {
    const {
        quoteNo,
        quoteDate,
        reference,
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
        freightTerms,
        // Invoice specific
        formType = 'quotation',
        invoiceNo,
        invoiceDate,
        orderNo,
        orderDate
    } = quoteData;

    return (
        <div className="preview-overlay" onClick={onClose}>
            <div className="preview-container" onClick={(e) => e.stopPropagation()}>
                <div className="preview-header">
                    <h2>{formType === 'invoice' ? 'Invoice' : 'Quote'} Preview</h2>
                    <div className="preview-actions">
                        <button
                            className="download-pdf-btn"
                            onClick={onDownloadPDF}
                            disabled={isGeneratingPDF}
                        >
                            {isGeneratingPDF ? '⏳ Generating...' : '📥 Download PDF'}
                        </button>
                        <button className="close-preview-btn" onClick={onClose}>×</button>
                    </div>
                </div>

                <div className="preview-body">
                    <div className="quotation-preview-content" id="quotation-preview">
                        <div className="preview-quotation-box">

                            {/* Header Section */}
                            <div className="preview-header-section">
                                <div className="preview-logo-box">
                                    <img src="/assets/logo.png" alt="LK Logo" className="preview-logo-img" />
                                </div>
                                <div className="preview-company-details">
                                    <h1>{COMPANY_CONFIG.name}</h1>
                                    <p>{COMPANY_CONFIG.addressLine1}</p>
                                    <p>{COMPANY_CONFIG.addressLine2}</p>
                                    <p>Mobile: {COMPANY_CONFIG.mobile}</p>
                                    <p className="email">Email Id: <a href={`mailto:${COMPANY_CONFIG.email}`}>{COMPANY_CONFIG.email}</a></p>
                                </div>
                            </div>

                            {/* GST/PAN Bar */}
                            <div className="preview-gst-pan-bar">
                                <div className="gst">GSTIN No: {COMPANY_CONFIG.gstin}</div>
                                <div className="pan">PAN No: {COMPANY_CONFIG.pan}</div>
                            </div>

                            {/* Quotation/Invoice Title */}
                            <div className="preview-quotation-title-bar">
                                {formType === 'invoice' ? 'TAX INVOICE' : 'Quotation'}
                            </div>

                            {/* Info Grid */}
                            <div className="preview-info-grid">
                                <div className="preview-info-col preview-to-section">
                                    <div className="preview-section-label">TO</div>
                                    <div className="preview-address-block">
                                        <p className="preview-recipient-name">{recipientName || 'N/A'}</p>
                                        <p>{recipientAddress1 || ''}</p>
                                        <p>{recipientAddress2 || ''}</p>
                                        <p className="preview-gst-line">GST NO: {recipientGST || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="preview-info-col preview-quote-details">
                                    <div className="preview-detail-row">
                                        <span className="preview-label">{formType === 'invoice' ? 'Invoice NO' : 'Quote No'}</span>
                                        <span className="preview-separator">:</span>
                                        <span className="preview-value">{formType === 'invoice' ? invoiceNo : quoteNo || 'N/A'}</span>
                                    </div>
                                    <div className="preview-detail-row">
                                        <span className="preview-label">{formType === 'invoice' ? 'Invoice DATE' : 'Quote DATE'}</span>
                                        <span className="preview-separator">:</span>
                                        <span className="preview-value">{formType === 'invoice' ? invoiceDate : quoteDate}</span>
                                    </div>
                                    {formType === 'quotation' ? (
                                        <div className="preview-detail-row">
                                            <span className="preview-label">Reference</span>
                                            <span className="preview-separator">:</span>
                                            <span className="preview-value">{reference}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="preview-detail-row">
                                                <span className="preview-label">Order NO</span>
                                                <span className="preview-separator">:</span>
                                                <span className="preview-value">{orderNo}</span>
                                            </div>
                                            <div className="preview-detail-row">
                                                <span className="preview-label">Order DATE</span>
                                                <span className="preview-separator">:</span>
                                                <span className="preview-value">{orderDate}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="preview-items-table-container">
                                <table className="preview-items-table">
                                    <thead>
                                        <tr>
                                            <th className="preview-col-sl">Sl. No</th>
                                            <th className="preview-col-desc">Description of Materials</th>
                                            <th className="preview-col-hsn">HSN Code</th>
                                            <th className="preview-col-qty">Quantity</th>
                                            <th className="preview-col-unit">Unit Rate</th>
                                            <th className="preview-col-amount">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="preview-text-center">{index + 1}.</td>
                                                <td className="preview-text-left">{item.description}</td>
                                                <td className="preview-text-center">{item.hsnCode}</td>
                                                <td className="preview-text-center">{item.quantity} NOS</td>
                                                <td className="preview-text-right">{item.unitRate.toLocaleString('en-IN')}</td>
                                                <td className="preview-text-right">
                                                    {((item.quantity || 0) * (item.unitRate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="preview-text-center">No items added</td>
                                            </tr>
                                        )}
                                        {/* Empty rows to fill space */}
                                        {items.length > 0 && items.length < 6 && [...Array(6 - items.length)].map((_, i) => (
                                            <tr key={`empty-${i}`} className="preview-empty-row">
                                                <td></td><td></td><td></td><td></td><td></td><td></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals Section */}
                            <div className="preview-totals-section">
                                <div className="preview-terms-box">
                                    <div className="preview-terms-header">TERMS & CONDITIONS:</div>
                                    <div className="preview-term-row">
                                        <span className="preview-term-label">Price Terms</span>
                                        <span className="preview-term-separator">:</span>
                                        <span className="preview-term-value">{priceTerms}</span>
                                    </div>
                                    <div className="preview-term-row">
                                        <span className="preview-term-label">Payment Terms</span>
                                        <span className="preview-term-separator">:</span>
                                        <span className="preview-term-value">{paymentTerms}</span>
                                    </div>
                                    <div className="preview-term-row">
                                        <span className="preview-term-label">Transit Insurance</span>
                                        <span className="preview-term-separator">:</span>
                                        <span className="preview-term-value">{transitInsurance}</span>
                                    </div>
                                    <div className="preview-term-row">
                                        <span className="preview-term-label">Freight Terms</span>
                                        <span className="preview-term-separator">:</span>
                                        <span className="preview-term-value">{freightTerms}</span>
                                    </div>
                                </div>
                                <div className="preview-totals-table">
                                    <div className="preview-total-row">
                                        <div className="preview-t-label">Basic Value</div>
                                        <div className="preview-t-value">{basicValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="preview-total-row">
                                        <div className="preview-t-label">SGST TAX 9 %</div>
                                        <div className="preview-t-value">{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="preview-total-row">
                                        <div className="preview-t-label">CGST TAX 9 %</div>
                                        <div className="preview-t-value">{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="preview-total-row">
                                        <div className="preview-t-label">Round Off</div>
                                        <div className="preview-t-value">{roundOff.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="preview-total-row preview-grand-total">
                                        <div className="preview-t-label">Grand Total</div>
                                        <div className="preview-t-value">{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Amount in Words & Remarks */}
                            <div className="preview-footer-details">
                                <div className="preview-amount-in-words">
                                    <strong>Amount In Words:</strong> {amountInWords}
                                </div>
                                <div className="preview-remarks-signatures">
                                    <div className="preview-remarks-col">
                                        <strong>Remarks:</strong>
                                    </div>
                                    <div className="preview-signatures-col">
                                        <div className="preview-company-sign-label">For LK TECHNICAL SERVICES</div>
                                        <div className="preview-sign-space"></div>
                                        <div className="preview-auth-sign-label">Authorized Signatory</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotePreview;
