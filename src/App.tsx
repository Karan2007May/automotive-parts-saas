/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ClipboardList,
  Search,
  Plus,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Mail,
  Download,
  Edit3,
  Send,
  Paperclip,
  RefreshCw,
  FileDown,
  Printer,
  CheckCircle2,
  Trash2
} from 'lucide-react';

// Type definitions
type Screen = 'dashboard' | 'inventory' | 'customers' | 'quotes' | 'work-orders';

interface Part {
  id: string;
  name: string;
  number: string;
  stock: number;
  price: number;
  location: string;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
}

interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  itemsSummary: string;
  createdAt: string;
  items: QuoteLineItem[];
}

interface QuoteLineItem {
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface GeneratedQuoteData {
  quoteId: string;
  date: string;
  validUntil: string;
  customer: Customer;
  items: QuoteLineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

interface WorkOrder {
  id: string;
  customerId: string;
  customerName: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dispatchStatus: 'Awaiting Dispatch' | 'Ready for Pickup' | 'Dispatched';
  partsSummary: string;
  quoteId?: string;
}

// Initial Sample Data (Realistic sample rows)
const INITIAL_PARTS: Part[] = [
  {
    id: 'p1',
    name: 'Brake Pads Front Set',
    number: 'BP-4402',
    stock: 48,
    price: 65.0,
    location: 'Shelf A-12',
  },
  {
    id: 'p2',
    name: 'Oil Filter Cartridge',
    number: 'OF-1180',
    stock: 120,
    price: 12.5,
    location: 'Bin C-04',
  },
  {
    id: 'p3',
    name: 'Alternator 120A High Output',
    number: 'ALT-8921',
    stock: 6,
    price: 210.0,
    location: 'Rack D-01',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Marcus Vance',
    company: 'Metro Auto Repair',
    contact: 'marcus@metroauto.com | (555) 234-5678',
    email: 'marcus@metroauto.com',
    phone: '(555) 234-5678',
  },
  {
    id: 'c2',
    name: 'Elena Rostova',
    company: 'Apex Fleet Services',
    contact: 'e.rostova@apexfleet.io | (555) 876-1234',
    email: 'e.rostova@apexfleet.io',
    phone: '(555) 876-1234',
  },
  {
    id: 'c3',
    name: 'David Chen',
    company: 'Downtown Motors',
    contact: 'dchen@downtownmotors.com | (555) 432-8901',
    email: 'dchen@downtownmotors.com',
    phone: '(555) 432-8901',
  },
];

const INITIAL_QUOTES: Quote[] = [
  {
    id: 'Q-101',
    customerId: 'c1',
    customerName: 'Metro Auto Repair',
    customerEmail: 'marcus@metroauto.com',
    amount: 325.0,
    status: 'Approved',
    itemsSummary: '5x Brake Pads Front Set',
    createdAt: '2026-10-28',
    items: [
      {
        partId: 'p1',
        partName: 'Brake Pads Front Set',
        partNumber: 'BP-4402',
        quantity: 5,
        unitPrice: 65.0,
        total: 325.0,
      },
    ],
  },
  {
    id: 'Q-102',
    customerId: 'c2',
    customerName: 'Apex Fleet Services',
    customerEmail: 'e.rostova@apexfleet.io',
    amount: 1260.0,
    status: 'Pending',
    itemsSummary: '6x Alternator 120A High Output',
    createdAt: '2026-10-29',
    items: [
      {
        partId: 'p3',
        partName: 'Alternator 120A High Output',
        partNumber: 'ALT-8921',
        quantity: 6,
        unitPrice: 210.0,
        total: 1260.0,
      },
    ],
  },
  {
    id: 'Q-103',
    customerId: 'c3',
    customerName: 'Downtown Motors',
    customerEmail: 'dchen@downtownmotors.com',
    amount: 150.0,
    status: 'Draft',
    itemsSummary: '12x Oil Filter Cartridge',
    createdAt: '2026-10-29',
    items: [
      {
        partId: 'p2',
        partName: 'Oil Filter Cartridge',
        partNumber: 'OF-1180',
        quantity: 12,
        unitPrice: 12.5,
        total: 150.0,
      },
    ],
  },
];

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-501',
    customerId: 'c1',
    customerName: 'Metro Auto Repair',
    status: 'In Progress',
    dispatchStatus: 'Ready for Pickup',
    partsSummary: '5x Brake Pads Front Set (BP-4402)',
    quoteId: 'Q-101',
  },
  {
    id: 'WO-502',
    customerId: 'c2',
    customerName: 'Apex Fleet Services',
    status: 'Pending',
    dispatchStatus: 'Awaiting Dispatch',
    partsSummary: '6x Alternator 120A (ALT-8921)',
    quoteId: 'Q-102',
  },
  {
    id: 'WO-503',
    customerId: 'c3',
    customerName: 'Downtown Motors',
    status: 'Completed',
    dispatchStatus: 'Dispatched',
    partsSummary: '12x Oil Filter Cartridge (OF-1180)',
    quoteId: 'Q-100',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [parts, setParts] = useState<Part[]>(INITIAL_PARTS);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);

  // Filters & Base Modals
  const [inventorySearch, setInventorySearch] = useState('');
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [isCreateQuoteModalOpen, setIsCreateQuoteModalOpen] = useState(false);

  // New Part Form State
  const [newPartName, setNewPartName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartStock, setNewPartStock] = useState('10');
  const [newPartPrice, setNewPartPrice] = useState('45.00');
  const [newPartLocation, setNewPartLocation] = useState('Shelf B-02');

  // Multi-line Quote Form State
  const [quoteCustomerId, setQuoteCustomerId] = useState(customers[0].id);
  const [quoteItems, setQuoteItems] = useState<
    Array<{ partId: string; quantity: number; unitPrice: number }>
  >([
    { partId: parts[0].id, quantity: 4, unitPrice: parts[0].price },
  ]);

  // AI Feature 1: Quotation Preview State
  const [isQuotePreviewModalOpen, setIsQuotePreviewModalOpen] = useState(false);
  const [activeGeneratedQuote, setActiveGeneratedQuote] = useState<GeneratedQuoteData | null>(null);
  const [quoteGeneratingNotice, setQuoteGeneratingNotice] = useState(false);
  const [pdfDownloadedNotice, setPdfDownloadedNotice] = useState<string | null>(null);

  // AI Feature 2: Email & Communication Assistant State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailInstruction, setEmailInstruction] = useState('');
  const [emailVariation, setEmailVariation] = useState(0);
  const [attachedQuoteId, setAttachedQuoteId] = useState('');
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);

  // Helper: Add part to inventory
  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim() || !newPartNumber.trim()) return;

    const newPart: Part = {
      id: `p${Date.now()}`,
      name: newPartName.trim(),
      number: newPartNumber.trim().toUpperCase(),
      stock: parseInt(newPartStock, 10) || 0,
      price: parseFloat(newPartPrice) || 0,
      location: newPartLocation.trim() || 'Unassigned',
    };

    setParts((prev) => [newPart, ...prev]);
    setNewPartName('');
    setNewPartNumber('');
    setIsAddPartModalOpen(false);
  };

  // Helper: Open Quote Creator for a specific part
  const handleOpenQuoteWithPart = (part: Part) => {
    setQuoteItems([{ partId: part.id, quantity: 2, unitPrice: part.price }]);
    setIsCreateQuoteModalOpen(true);
  };

  // Helper: Add line item to quote form
  const handleAddQuoteLineItem = () => {
    const unselected = parts.find((p) => !quoteItems.some((qi) => qi.partId === p.id)) || parts[0];
    setQuoteItems((prev) => [
      ...prev,
      { partId: unselected.id, quantity: 1, unitPrice: unselected.price },
    ]);
  };

  // Helper: Remove line item from quote form
  const handleRemoveQuoteLineItem = (index: number) => {
    if (quoteItems.length <= 1) return;
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper: Update line item
  const handleUpdateQuoteLineItem = (
    index: number,
    field: 'partId' | 'quantity' | 'unitPrice',
    value: string
  ) => {
    setQuoteItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'partId') {
          const selectedPart = parts.find((p) => p.id === value);
          return {
            ...item,
            partId: value,
            unitPrice: selectedPart ? selectedPart.price : item.unitPrice,
          };
        } else if (field === 'quantity') {
          return { ...item, quantity: Math.max(1, parseInt(value, 10) || 1) };
        } else if (field === 'unitPrice') {
          return { ...item, unitPrice: Math.max(0, parseFloat(value) || 0) };
        }
        return item;
      })
    );
  };

  // Build the compiled quote data object
  const constructQuoteData = (existingId?: string): GeneratedQuoteData => {
    const customer = customers.find((c) => c.id === quoteCustomerId) || customers[0];
    const compiledItems: QuoteLineItem[] = quoteItems.map((qi) => {
      const part = parts.find((p) => p.id === qi.partId) || parts[0];
      return {
        partId: part.id,
        partName: part.name,
        partNumber: part.number,
        quantity: qi.quantity,
        unitPrice: qi.unitPrice,
        total: qi.quantity * qi.unitPrice,
      };
    });

    const subtotal = compiledItems.reduce((acc, it) => acc + it.total, 0);
    const tax = 0.0; // B2B wholesale trade exemption
    const total = subtotal + tax;

    return {
      quoteId: existingId || `Q-${100 + quotes.length + 1}`,
      date: 'October 30, 2026',
      validUntil: 'November 29, 2026',
      customer,
      items: compiledItems,
      subtotal,
      tax,
      total,
    };
  };

  // AI Feature 1: Trigger "Generate Quote with AI"
  const handleGenerateQuoteWithAI = () => {
    const quoteData = constructQuoteData();
    setQuoteGeneratingNotice(true);

    // Provide immediate responsive feel with a fast wireframe generation tick
    setTimeout(() => {
      setQuoteGeneratingNotice(false);
      setActiveGeneratedQuote(quoteData);
      setIsCreateQuoteModalOpen(false);
      setIsQuotePreviewModalOpen(true);
    }, 250);
  };

  // Save standard quote manually
  const handleSaveStandardQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const quoteData = constructQuoteData();
    saveQuoteToState(quoteData, 'Draft');
    setIsCreateQuoteModalOpen(false);
    setCurrentScreen('quotes');
  };

  // Save generated quote into state
  const saveQuoteToState = (data: GeneratedQuoteData, status: 'Draft' | 'Pending' | 'Approved' = 'Approved') => {
    const itemsSummary = data.items
      .map((it) => `${it.quantity}x ${it.partName}`)
      .join(', ');

    const newQuote: Quote = {
      id: data.quoteId,
      customerId: data.customer.id,
      customerName: data.customer.company,
      customerEmail: data.customer.email,
      amount: data.total,
      status: status,
      itemsSummary,
      createdAt: '2026-10-30',
      items: data.items,
    };

    setQuotes((prev) => {
      const exists = prev.some((q) => q.id === newQuote.id);
      if (exists) {
        return prev.map((q) => (q.id === newQuote.id ? newQuote : q));
      }
      return [newQuote, ...prev];
    });
  };

  // AI Feature 1 Action: Download Real PDF
  const handleDownloadPDF = (quoteData: GeneratedQuoteData) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Header / Company Wireframe Branding
      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text('AUTO-PARTS DISTRIBUTION CO.', 40, 52);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 90);
      doc.text('100 Industrial Parkway, Warehouse Bay 4', 40, 67);
      doc.text('Phone: (555) 019-2830 | quotes@autopartssaas.demo', 40, 79);
      doc.text('Commercial Sales Division • Tax ID: US-8829-1092', 40, 91);

      // Quote Identifier Box (Top Right)
      doc.setDrawColor(40, 40, 40);
      doc.setLineWidth(1);
      doc.rect(pageWidth - 210, 38, 170, 64);

      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('OFFICIAL QUOTATION', pageWidth - 200, 53);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(quoteData.quoteId, pageWidth - 200, 70);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`Date  : ${quoteData.date}`, pageWidth - 200, 84);
      doc.text(`Valid : ${quoteData.validUntil}`, pageWidth - 200, 94);

      // Horizontal Divider
      doc.setDrawColor(40, 40, 40);
      doc.setLineWidth(1.5);
      doc.line(40, 118, pageWidth - 40, 118);

      // Customer Details Box
      doc.setFillColor(245, 245, 245);
      doc.rect(40, 128, pageWidth - 80, 68, 'F');
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.8);
      doc.rect(40, 128, pageWidth - 80, 68);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text('PREPARED FOR (CUSTOMER DETAILS):', 52, 143);

      doc.setFontSize(11);
      doc.setTextColor(15, 15, 15);
      doc.text(quoteData.customer.company, 52, 159);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`Attention : ${quoteData.customer.name}`, 52, 172);
      doc.text(`Email     : ${quoteData.customer.email}`, 52, 184);

      // Commercial Terms (Right column in customer block)
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text('QUOTATION TERMS:', 320, 143);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text('• Payment: Net 30 days upon receipt', 320, 157);
      doc.text('• Dispatch: 24-48 business hours', 320, 170);
      doc.text('• Warranty: 12-Month OEM guarantee', 320, 183);

      // Table Header
      const tableY = 212;
      doc.setFillColor(225, 225, 225);
      doc.rect(40, tableY, pageWidth - 80, 22, 'F');
      doc.setDrawColor(50, 50, 50);
      doc.rect(40, tableY, pageWidth - 80, 22);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0);
      doc.text('#', 48, tableY + 15);
      doc.text('PARTS DESCRIPTION', 72, tableY + 15);
      doc.text('PART NUMBER', 270, tableY + 15);
      doc.text('QTY', 375, tableY + 15, { align: 'right' });
      doc.text('UNIT PRICE', 455, tableY + 15, { align: 'right' });
      doc.text('TOTAL', pageWidth - 50, tableY + 15, { align: 'right' });

      // Table Line Items
      let curY = tableY + 22;
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);

      quoteData.items.forEach((item, idx) => {
        const rowHeight = 22;
        doc.setDrawColor(210, 210, 210);
        doc.rect(40, curY, pageWidth - 80, rowHeight);

        doc.setTextColor(110, 110, 110);
        doc.text(String(idx + 1), 48, curY + 15);

        doc.setFont('courier', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(item.partName, 72, curY + 15);

        doc.setFont('courier', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(item.partNumber, 270, curY + 15);

        doc.text(String(item.quantity), 375, curY + 15, { align: 'right' });
        doc.text(`$${item.unitPrice.toFixed(2)}`, 455, curY + 15, { align: 'right' });

        doc.setFont('courier', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`$${item.total.toFixed(2)}`, pageWidth - 50, curY + 15, { align: 'right' });

        curY += rowHeight;
      });

      // Summary Totals Box
      const summaryBoxY = curY + 18;
      const summaryBoxWidth = 205;
      const summaryBoxX = pageWidth - 40 - summaryBoxWidth;

      doc.setFillColor(248, 248, 248);
      doc.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, 68, 'F');
      doc.setDrawColor(60, 60, 60);
      doc.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, 68);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text('Subtotal:', summaryBoxX + 12, summaryBoxY + 18);
      doc.text(`$${quoteData.subtotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 12, summaryBoxY + 18, { align: 'right' });

      doc.text('Tax (0% B2B Trade):', summaryBoxX + 12, summaryBoxY + 34);
      doc.text(`$${quoteData.tax.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 12, summaryBoxY + 34, { align: 'right' });

      doc.setDrawColor(180, 180, 180);
      doc.line(summaryBoxX + 8, summaryBoxY + 42, summaryBoxX + summaryBoxWidth - 8, summaryBoxY + 42);

      doc.setFont('courier', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(0, 0, 0);
      doc.text('TOTAL AMOUNT:', summaryBoxX + 12, summaryBoxY + 58);
      doc.text(`$${quoteData.total.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 12, summaryBoxY + 58, { align: 'right' });

      // Footer
      const footerY = 760;
      doc.setDrawColor(180, 180, 180);
      doc.line(40, footerY, pageWidth - 40, footerY);

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text('Generated via AutoParts SaaS AI Quotation Engine • Official Commercial Estimate', 40, footerY + 16);
      doc.text('Page 1 of 1', pageWidth - 40, footerY + 16, { align: 'right' });

      // Save real PDF file to client's browser
      doc.save(`Quotation_${quoteData.quoteId}.pdf`);

      setPdfDownloadedNotice(`Quotation_${quoteData.quoteId}.pdf downloaded successfully.`);
      setTimeout(() => setPdfDownloadedNotice(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  // AI Feature 1 Action: Edit Quote (Return from Preview to Edit Modal)
  const handleEditQuote = () => {
    setIsQuotePreviewModalOpen(false);
    setIsCreateQuoteModalOpen(true);
  };

  // AI Feature 2: Email Generator Engine
  const generateEmailContent = (
    customer: Customer,
    quoteId: string,
    total: number,
    instruction: string,
    variation: number
  ) => {
    const firstName = customer.name.split(' ')[0] || customer.name;
    const subject = `Quotation for Your Automotive Parts Requirement`;

    let customNote = '';
    if (instruction.trim()) {
      customNote = `\n\nNote: ${instruction.trim()}`;
    }

    const drafts = [
      // Draft 1 (Exact style from user specification)
      `Subject: ${subject}

Hello ${firstName},

Thank you for your enquiry.

Please find attached the quotation for the requested automotive parts. The quotation includes the available parts, quantities, and pricing details.${customNote}

Please review it and let us know if you would like to proceed with the order.

Best regards,
Sales Team`,

      // Draft 2 (Volume discount / fast dispatch variation)
      `Subject: Quotation ${quoteId}: Automotive Parts Estimate for ${customer.company}

Dear ${firstName},

Thank you for contacting us regarding parts fulfillment for ${customer.company}.

Attached is our official quotation (${quoteId}) totaling $${total.toFixed(2)}. All requested components have been verified against current warehouse stock and are reserved for your confirmation.${customNote}

Please review the attached PDF breakdown and reply to this email to convert this into a work order.

Best regards,
Sales & Operations Team`,

      // Draft 3 (Short & direct commercial variation)
      `Subject: Automotive Parts Quotation (${quoteId})

Hi ${firstName},

Following up on your parts request. Please find attached quotation ${quoteId} prepared for ${customer.company}.

All items are in stock and ready for immediate shop dispatch upon your approval.${customNote}

Feel free to reach out if you have any questions or require revisions.

Best regards,
Commercial Accounts Team`,
    ];

    return {
      subject,
      body: drafts[variation % drafts.length],
    };
  };

  // Open "Draft Email with AI" from Preview or Table
  const handleOpenDraftEmail = (quoteData: GeneratedQuoteData) => {
    // Ensure quote is persisted
    saveQuoteToState(quoteData, 'Pending');

    setActiveGeneratedQuote(quoteData);
    setAttachedQuoteId(quoteData.quoteId);
    setEmailTo(quoteData.customer.email);

    const draft = generateEmailContent(
      quoteData.customer,
      quoteData.quoteId,
      quoteData.total,
      emailInstruction,
      emailVariation
    );

    setEmailSubject(draft.subject);
    setEmailBody(draft.body);
    setIsQuotePreviewModalOpen(false);
    setIsEmailModalOpen(true);
  };

  // Open "Draft Email with AI" from Quotes screen row
  const handleOpenEmailFromQuoteRow = (q: Quote) => {
    const customer = customers.find((c) => c.id === q.customerId) || {
      id: q.customerId,
      name: q.customerName,
      company: q.customerName,
      contact: q.customerEmail,
      email: q.customerEmail,
      phone: '(555) 000-0000',
    };

    const quoteData: GeneratedQuoteData = {
      quoteId: q.id,
      date: q.createdAt,
      validUntil: '30 Days',
      customer,
      items: q.items || [
        {
          partId: 'p1',
          partName: q.itemsSummary,
          partNumber: 'SKU-GEN',
          quantity: 1,
          unitPrice: q.amount,
          total: q.amount,
        },
      ],
      subtotal: q.amount,
      tax: 0,
      total: q.amount,
    };

    handleOpenDraftEmail(quoteData);
  };

  // Helper: Download PDF from Quotes table row
  const handleDownloadPDFFromQuoteRow = (q: Quote) => {
    const customer = customers.find((c) => c.id === q.customerId) || {
      id: q.customerId,
      name: q.customerName,
      company: q.customerName,
      contact: q.customerEmail,
      email: q.customerEmail,
      phone: '(555) 000-0000',
    };

    const quoteData: GeneratedQuoteData = {
      quoteId: q.id,
      date: q.createdAt,
      validUntil: 'November 29, 2026',
      customer,
      items: q.items && q.items.length > 0 ? q.items : [
        {
          partId: 'p1',
          partName: q.itemsSummary,
          partNumber: 'SKU-GEN',
          quantity: 1,
          unitPrice: q.amount,
          total: q.amount,
        },
      ],
      subtotal: q.amount,
      tax: 0,
      total: q.amount,
    };

    handleDownloadPDF(quoteData);
  };

  // Button: "Generate Email" (incorporate user custom instruction into email)
  const handleGenerateEmailWithInstruction = () => {
    if (!activeGeneratedQuote) return;
    const draft = generateEmailContent(
      activeGeneratedQuote.customer,
      activeGeneratedQuote.quoteId,
      activeGeneratedQuote.total,
      emailInstruction,
      emailVariation
    );
    setEmailSubject(draft.subject);
    setEmailBody(draft.body);
  };

  // Action: "Regenerate" email
  const handleRegenerateEmail = () => {
    if (!activeGeneratedQuote) return;
    const nextVar = emailVariation + 1;
    setEmailVariation(nextVar);
    const draft = generateEmailContent(
      activeGeneratedQuote.customer,
      activeGeneratedQuote.quoteId,
      activeGeneratedQuote.total,
      emailInstruction,
      nextVar
    );
    setEmailSubject(draft.subject);
    setEmailBody(draft.body);
  };

  // Action: "Send Email"
  const handleSendEmail = () => {
    if (!activeGeneratedQuote) return;

    // Update quote status to Pending or Approved
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === activeGeneratedQuote.quoteId ? { ...q, status: 'Approved' } : q
      )
    );

    const recipient = emailTo;
    const qId = activeGeneratedQuote.quoteId;

    setIsEmailModalOpen(false);
    setEmailSentNotice(
      `Email successfully dispatched to ${recipient} with Quotation_${qId}.pdf attached!`
    );
    setCurrentScreen('quotes');

    setTimeout(() => {
      setEmailSentNotice(null);
    }, 6000);
  };

  // Quick Action: Convert Quote to Work Order
  const handleConvertToWorkOrder = (quote: Quote) => {
    const newWO: WorkOrder = {
      id: `WO-${500 + workOrders.length + 1}`,
      customerId: quote.customerId,
      customerName: quote.customerName,
      status: 'In Progress',
      dispatchStatus: 'Awaiting Dispatch',
      partsSummary: quote.itemsSummary,
      quoteId: quote.id,
    };
    setWorkOrders((prev) => [newWO, ...prev]);
    setCurrentScreen('work-orders');
  };

  // Reset sample data helper for demo purposes
  const handleResetData = () => {
    setParts(INITIAL_PARTS);
    setQuotes(INITIAL_QUOTES);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setInventorySearch('');
    setEmailSentNotice(null);
    setPdfDownloadedNotice(null);
  };

  // Filtered Parts
  const filteredParts = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.number.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.location.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  // Workflow steps for the prototype helper banner
  const workflowSteps = [
    { id: 'dashboard', label: '1. Dashboard' },
    { id: 'inventory', label: '2. Inventory' },
    { id: 'quotes', label: '3. Quotes & AI' },
    { id: 'work-orders', label: '4. Work Orders' },
  ];

  return (
    <div className="flex h-screen w-screen bg-zinc-100 text-zinc-900 font-mono select-none overflow-hidden">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 flex-shrink-0 bg-zinc-200 border-r border-zinc-400 flex flex-col justify-between">
        <div>
          {/* Logo / Brand Header Wireframe */}
          <div className="p-4 border-b border-zinc-400 bg-zinc-300">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-zinc-800 bg-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight text-zinc-900 leading-none">
                  AUTO-PARTS SAAS
                </div>
                <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">
                  Concept Wireframe
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="text-[10px] uppercase font-bold text-zinc-500 px-3 py-1 tracking-wider">
              Navigation
            </div>

            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-semibold border ${
                currentScreen === 'dashboard'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>1. Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentScreen('inventory')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-semibold border ${
                currentScreen === 'inventory'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <Package size={14} />
              <span>2. Inventory</span>
            </button>

            <button
              onClick={() => setCurrentScreen('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-semibold border ${
                currentScreen === 'customers'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <Users size={14} />
              <span>3. Customers</span>
            </button>

            <button
              onClick={() => setCurrentScreen('quotes')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-semibold border ${
                currentScreen === 'quotes'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <FileText size={14} />
              <div className="flex items-center justify-between flex-1">
                <span>4. Quotes</span>
                <span className="text-[9px] bg-zinc-300 px-1 border border-zinc-500 font-bold">
                  AI
                </span>
              </div>
            </button>

            <button
              onClick={() => setCurrentScreen('work-orders')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-semibold border ${
                currentScreen === 'work-orders'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <ClipboardList size={14} />
              <span>5. Work Orders</span>
            </button>
          </nav>

          {/* Prototype Flow Shortcut Box */}
          <div className="mx-3 mt-3 p-3 bg-zinc-100 border border-zinc-400 text-xs">
            <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-700 mb-1 border-b border-zinc-300 pb-1 flex items-center justify-between">
              <span>AI Prototype Flow</span>
              <Sparkles size={11} className="text-zinc-600" />
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed mb-2">
              Demonstration walkthrough:
            </p>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1 text-zinc-700">
                <span className="font-bold">1.</span> Select Parts in Inventory
              </div>
              <div className="flex items-center gap-1 text-zinc-700 font-bold">
                <span className="font-bold">2.</span> Generate Quote with AI
              </div>
              <div className="flex items-center gap-1 text-zinc-700">
                <span className="font-bold">3.</span> Preview & Download PDF
              </div>
              <div className="flex items-center gap-1 text-zinc-700 font-bold">
                <span className="font-bold">4.</span> Draft Email with AI
              </div>
              <div className="flex items-center gap-1 text-zinc-700">
                <span className="font-bold">5.</span> Send & Create Work Order
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-400 bg-zinc-300 text-[10px] text-zinc-600 flex items-center justify-between">
          <span>Client Demo v0.2 [AI]</span>
          <button
            onClick={handleResetData}
            title="Reset to default prototype sample data"
            className="flex items-center gap-1 hover:text-zinc-900 text-zinc-700 underline"
          >
            <RotateCcw size={10} /> Reset
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP PROTOTYPE BAR */}
        <header className="h-12 bg-white border-b border-zinc-400 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 flex items-center gap-1">
              <Sparkles size={11} /> AI-Powered Prototype
            </span>
            <span className="text-xs text-zinc-500">|</span>
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <span className="font-semibold text-zinc-900 uppercase">Screen:</span>
              <span className="capitalize">{currentScreen.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Prototype Flow Stepper Controls */}
          <div className="flex items-center gap-1 text-xs bg-zinc-100 border border-zinc-300 px-2 py-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">Demo Flow:</span>
            {workflowSteps.map((step, idx) => {
              const isActive = currentScreen === step.id;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentScreen(step.id as Screen)}
                    className={`px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white font-bold'
                        : 'text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {step.label}
                  </button>
                  {idx < workflowSteps.length - 1 && (
                    <span className="text-zinc-400 text-[10px]">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </header>

        {/* NOTIFICATION BANNERS */}
        {emailSentNotice && (
          <div className="bg-zinc-900 text-white px-6 py-2 border-b border-black text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-zinc-300" />
              <span>{emailSentNotice}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('work-orders')}
                className="underline text-[11px] font-bold hover:text-zinc-300"
              >
                Proceed to Work Orders →
              </button>
              <button
                onClick={() => setEmailSentNotice(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {pdfDownloadedNotice && (
          <div className="bg-zinc-200 text-zinc-900 px-6 py-2 border-b border-zinc-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileDown size={14} className="text-zinc-700" />
              <span>{pdfDownloadedNotice}</span>
            </div>
            <button
              onClick={() => setPdfDownloadedNotice(null)}
              className="text-zinc-500 hover:text-zinc-900"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* WORKSPACE VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-100">
          {/* SCREEN 1: DASHBOARD */}
          {currentScreen === 'dashboard' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Screen Header */}
              <div className="border-b border-zinc-300 pb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold uppercase tracking-wider text-zinc-900">
                    Dashboard
                  </h1>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Platform overview: Parts inventory, active quotations, and open shop orders.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                      setIsCreateQuoteModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-semibold hover:bg-zinc-800"
                  >
                    <Sparkles size={13} />
                    <span>Create Quote with AI</span>
                  </button>
                  <button
                    onClick={() => setCurrentScreen('inventory')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white text-zinc-800 border border-zinc-400 text-xs font-semibold hover:bg-zinc-50"
                  >
                    <span>Go to Inventory</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* 3 SUMMARY CARDS (Total Parts, Pending Quotes, Open Orders) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Summary Card 1: Total Parts */}
                <div className="p-4 bg-white border border-zinc-400">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Total Parts
                    </span>
                    <Package size={16} className="text-zinc-500" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-zinc-900">
                    {parts.length}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {parts.reduce((acc, p) => acc + p.stock, 0)} total units in inventory
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-200 flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Active SKUs cataloged</span>
                    <button
                      onClick={() => setCurrentScreen('inventory')}
                      className="underline text-zinc-800 font-bold hover:text-black"
                    >
                      View Table →
                    </button>
                  </div>
                </div>

                {/* Summary Card 2: Pending Quotes */}
                <div className="p-4 bg-white border border-zinc-400">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Pending Quotes
                    </span>
                    <FileText size={16} className="text-zinc-500" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-zinc-900">
                    {quotes.filter((q) => q.status === 'Pending').length || 1}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    ${quotes
                      .reduce((acc, q) => acc + q.amount, 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                    total pipeline value
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-200 flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">{quotes.length} quotations active</span>
                    <button
                      onClick={() => setCurrentScreen('quotes')}
                      className="underline text-zinc-800 font-bold hover:text-black"
                    >
                      Manage Quotes →
                    </button>
                  </div>
                </div>

                {/* Summary Card 3: Open Orders */}
                <div className="p-4 bg-white border border-zinc-400">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Open Orders
                    </span>
                    <ClipboardList size={16} className="text-zinc-500" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-zinc-900">
                    {workOrders.filter((w) => w.status !== 'Completed').length}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Work orders queued or in fulfillment
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-200 flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Dispatch queue active</span>
                    <button
                      onClick={() => setCurrentScreen('work-orders')}
                      className="underline text-zinc-800 font-bold hover:text-black"
                    >
                      View Dispatch →
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Features Demonstration Banner */}
              <div className="p-4 bg-white border border-zinc-400 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-zinc-800" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      AI Automation Workflow (New Features)
                    </span>
                  </div>
                  <span className="text-[10px] bg-zinc-200 px-2 py-0.5 border border-zinc-400 font-bold">
                    Fast Demo Flow
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="border border-zinc-300 p-3 bg-zinc-50">
                    <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>1. AI Quote Generation</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Automatically compiles inventory quantities, unit prices, customer contact, and calculates subtotal & PDF layout instantly.
                    </p>
                    <button
                      onClick={() => {
                        setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                        setIsCreateQuoteModalOpen(true);
                      }}
                      className="mt-2 text-[10px] uppercase font-bold underline text-zinc-800 hover:text-black"
                    >
                      Try Quote Generator →
                    </button>
                  </div>

                  <div className="border border-zinc-300 p-3 bg-zinc-50">
                    <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>2. AI Email & Communication Assistant</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Drafts professional B2B client emails with the quote PDF attached, customizable instructions (discounts, terms), and 1-click dispatch.
                    </p>
                    <button
                      onClick={() => handleOpenEmailFromQuoteRow(quotes[0])}
                      className="mt-2 text-[10px] uppercase font-bold underline text-zinc-800 hover:text-black"
                    >
                      Try Email Assistant →
                    </button>
                  </div>
                </div>
              </div>

              {/* Wireframe Activity Preview (2 rows) */}
              <div className="border border-zinc-400 bg-white">
                <div className="p-3 border-b border-zinc-300 bg-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                    Recent System Records
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Sample feed</span>
                </div>
                <div className="divide-y divide-zinc-200 text-xs">
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900">Work Order WO-501</span>
                      <span className="text-zinc-600"> marked Ready for Pickup for Metro Auto Repair</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Today, 09:15</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900">Quote Q-102</span>
                      <span className="text-zinc-600"> ($1,260.00) sent to Apex Fleet Services via AI Email Assistant</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Today, 08:30</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: INVENTORY */}
          {currentScreen === 'inventory' && (
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Screen Header */}
              <div className="border-b border-zinc-300 pb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold uppercase tracking-wider text-zinc-900">
                    Inventory
                  </h1>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Parts catalog with stock levels, shelf locations, and unit pricing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddPartModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-400 text-xs font-semibold hover:bg-zinc-200"
                  >
                    <Plus size={14} />
                    <span>Add Part</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                      setIsCreateQuoteModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-semibold hover:bg-zinc-800"
                  >
                    <Sparkles size={13} />
                    <span>Create Quote with AI →</span>
                  </button>
                </div>
              </div>

              {/* Controls bar: Search Field */}
              <div className="flex items-center justify-between gap-4 bg-white p-3 border border-zinc-400">
                <div className="flex-1 max-w-md relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search Part Name, Part Number, or Location..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-400 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div className="text-[11px] text-zinc-500">
                  Showing {filteredParts.length} of {parts.length} parts
                </div>
              </div>

              {/* Simple Parts Table */}
              <div className="bg-white border border-zinc-400 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-200 border-b border-zinc-400 text-zinc-800 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 border-r border-zinc-300">Part Name</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300">Part Number</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300 text-right">Stock</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300 text-right">Price</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300">Location</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {filteredParts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400">
                          [ No matching parts found ]
                        </td>
                      </tr>
                    ) : (
                      filteredParts.map((part) => (
                        <tr key={part.id} className="hover:bg-zinc-50">
                          <td className="py-2.5 px-3 font-semibold text-zinc-900 border-r border-zinc-200">
                            {part.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-700 border-r border-zinc-200">
                            {part.number}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono border-r border-zinc-200">
                            <span
                              className={`px-1.5 py-0.5 border ${
                                part.stock < 10
                                  ? 'border-zinc-700 bg-zinc-200 font-bold'
                                  : 'border-zinc-300 bg-zinc-50'
                              }`}
                            >
                              {part.stock}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono border-r border-zinc-200">
                            ${part.price.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-700 border-r border-zinc-200">
                            {part.location}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleOpenQuoteWithPart(part)}
                              className="px-2 py-0.5 border border-zinc-600 text-[10px] uppercase font-bold hover:bg-zinc-900 hover:text-white flex items-center gap-1 mx-auto"
                              title="Start quotation with this part"
                            >
                              <Sparkles size={10} />
                              <span>Quote</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Wireframe Flow Prompt */}
              <div className="p-3 bg-zinc-200 border border-zinc-400 flex items-center justify-between text-xs">
                <span className="text-zinc-700">
                  <strong>Workflow Next Step:</strong> Select a customer and inventory parts to trigger <strong>"Generate Quote with AI"</strong>.
                </span>
                <button
                  onClick={() => {
                    setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                    setIsCreateQuoteModalOpen(true);
                  }}
                  className="flex items-center gap-1 font-bold underline text-zinc-900 hover:text-black"
                >
                  Open Quote Generator →
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: CUSTOMERS */}
          {currentScreen === 'customers' && (
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Screen Header */}
              <div className="border-b border-zinc-300 pb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold uppercase tracking-wider text-zinc-900">
                    Customers
                  </h1>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Basic directory of repair shops, fleet managers, and dealerships.
                  </p>
                </div>
                <div className="text-xs border border-zinc-400 bg-white px-2.5 py-1 text-zinc-600">
                  {customers.length} Accounts Active
                </div>
              </div>

              {/* Basic Customer Table (Name, Company, Contact) */}
              <div className="bg-white border border-zinc-400 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-200 border-b border-zinc-400 text-zinc-800 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 border-r border-zinc-300">Name</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300">Company</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300">Contact & Email</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50">
                        <td className="py-2.5 px-3 font-semibold text-zinc-900 border-r border-zinc-200">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-800 border-r border-zinc-200">
                          {c.company}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-600 border-r border-zinc-200">
                          {c.contact}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setQuoteCustomerId(c.id);
                              setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                              setIsCreateQuoteModalOpen(true);
                            }}
                            className="px-2 py-0.5 border border-zinc-600 text-[10px] uppercase font-bold hover:bg-zinc-900 hover:text-white flex items-center gap-1 mx-auto"
                          >
                            <Sparkles size={10} />
                            <span>AI Quote</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border border-dashed border-zinc-400 text-[11px] text-zinc-600 bg-zinc-50">
                [ Wireframe Note: Customer email addresses are used automatically by the AI Email & Communication Assistant for direct quotation transmission. ]
              </div>
            </div>
          )}

          {/* SCREEN 4: QUOTES */}
          {currentScreen === 'quotes' && (
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Screen Header */}
              <div className="border-b border-zinc-300 pb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold uppercase tracking-wider text-zinc-900">
                    Quotes
                  </h1>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Customer pricing estimates, AI quote generation, and automated email communication.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                    setIsCreateQuoteModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-semibold hover:bg-zinc-800"
                >
                  <Plus size={14} />
                  <span>Create Quote</span>
                </button>
              </div>

              {/* Simple Quotation Table (Quote ID, Customer, Amount, Status) */}
              <div className="bg-white border border-zinc-400 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-200 border-b border-zinc-400 text-zinc-800 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 border-r border-zinc-300">Quote ID</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300">Customer</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300">Items / Scope</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300 text-right">Amount</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">AI Actions & Flow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {quotes.map((q) => (
                      <tr key={q.id} className="hover:bg-zinc-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 border-r border-zinc-200">
                          {q.id}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-800 border-r border-zinc-200">
                          <div>{q.customerName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{q.customerEmail}</div>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600 border-r border-zinc-200">
                          {q.itemsSummary}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-zinc-900 border-r border-zinc-200">
                          ${q.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-zinc-200">
                          <span
                            className={`px-2 py-0.5 border text-[10px] uppercase font-bold ${
                              q.status === 'Approved'
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : q.status === 'Pending'
                                ? 'bg-zinc-200 text-zinc-800 border-zinc-400'
                                : 'bg-white text-zinc-600 border-zinc-300'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Download PDF button */}
                            <button
                              onClick={() => handleDownloadPDFFromQuoteRow(q)}
                              className="px-2 py-1 bg-white text-zinc-800 border border-zinc-400 text-[10px] uppercase font-bold hover:bg-zinc-100 flex items-center gap-1"
                              title="Download official PDF quotation document"
                            >
                              <Download size={11} />
                              <span>PDF</span>
                            </button>

                            {/* AI Email Assistant shortcut */}
                            <button
                              onClick={() => handleOpenEmailFromQuoteRow(q)}
                              className="px-2 py-1 bg-zinc-100 text-zinc-800 border border-zinc-400 text-[10px] uppercase font-bold hover:bg-zinc-200 flex items-center gap-1"
                              title="Draft Email with AI for this quotation"
                            >
                              <Mail size={11} />
                              <span>Draft Email</span>
                            </button>

                            {/* Convert to Work Order or Approve */}
                            {q.status === 'Approved' ? (
                              <button
                                onClick={() => handleConvertToWorkOrder(q)}
                                className="px-2 py-1 bg-zinc-900 text-white border border-zinc-900 text-[10px] uppercase font-bold hover:bg-zinc-800"
                                title="Convert approved quote into an active work order"
                              >
                                Work Order →
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setQuotes((prev) =>
                                    prev.map((item) =>
                                      item.id === q.id ? { ...item, status: 'Approved' } : item
                                    )
                                  );
                                }}
                                className="px-2 py-1 border border-zinc-400 text-zinc-700 text-[10px] uppercase font-bold hover:bg-zinc-100"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Workflow callout */}
              <div className="p-3 bg-zinc-200 border border-zinc-400 flex items-center justify-between text-xs">
                <span className="text-zinc-700">
                  <strong>Workflow Next Step:</strong> Review quotes, draft emails with the AI assistant, or convert approved quotes to Work Orders.
                </span>
                <button
                  onClick={() => setCurrentScreen('work-orders')}
                  className="flex items-center gap-1 font-bold underline text-zinc-900 hover:text-black"
                >
                  View Work Orders Screen →
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: WORK ORDERS */}
          {currentScreen === 'work-orders' && (
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Screen Header */}
              <div className="border-b border-zinc-300 pb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold uppercase tracking-wider text-zinc-900">
                    Work Orders
                  </h1>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Fulfillment tracking, order dispatch status, and customer collection.
                  </p>
                </div>
                <div className="text-xs border border-zinc-400 bg-white px-2.5 py-1 text-zinc-600">
                  {workOrders.length} Total Orders
                </div>
              </div>

              {/* Basic Table (Order ID, Customer, Status, Dispatch Status) */}
              <div className="bg-white border border-zinc-400 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-200 border-b border-zinc-400 text-zinc-800 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 border-r border-zinc-300">Order ID</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300">Customer</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300">Parts Assigned</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300 text-center">Status</th>
                      <th className="py-2.5 px-3 border-r border-zinc-300 text-center">Dispatch Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {workOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-zinc-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 border-r border-zinc-200">
                          {wo.id}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-800 font-medium border-r border-zinc-200">
                          {wo.customerName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-600 border-r border-zinc-200">
                          {wo.partsSummary}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-zinc-200">
                          <span
                            className={`px-2 py-0.5 border text-[10px] uppercase font-bold ${
                              wo.status === 'Completed'
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : wo.status === 'In Progress'
                                ? 'bg-zinc-200 text-zinc-900 border-zinc-400'
                                : 'bg-white text-zinc-600 border-zinc-300'
                            }`}
                          >
                            {wo.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-zinc-200">
                          <span
                            className={`px-2 py-0.5 border text-[10px] uppercase font-mono ${
                              wo.dispatchStatus === 'Dispatched'
                                ? 'bg-zinc-100 text-zinc-900 border-zinc-400 font-bold'
                                : wo.dispatchStatus === 'Ready for Pickup'
                                ? 'bg-zinc-200 text-zinc-900 border-zinc-600 font-bold'
                                : 'bg-white text-zinc-600 border-zinc-300'
                            }`}
                          >
                            {wo.dispatchStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {wo.dispatchStatus !== 'Dispatched' ? (
                            <button
                              onClick={() => {
                                setWorkOrders((prev) =>
                                  prev.map((item) =>
                                    item.id === wo.id
                                      ? {
                                          ...item,
                                          status: 'Completed',
                                          dispatchStatus: 'Dispatched',
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="px-2 py-1 border border-zinc-600 text-[10px] uppercase font-bold hover:bg-zinc-900 hover:text-white"
                            >
                              Dispatch Order
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              [ Closed ]
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Flow Completion Box */}
              <div className="p-4 bg-white border border-zinc-400 text-xs space-y-2">
                <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
                  End of Prototype Demonstration Flow
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  The client has walked through the complete AI-enabled workflow:
                  <strong> Dashboard</strong> → <strong>Inventory selection</strong> → <strong>Generate Quote with AI</strong> → <strong>PDF Preview & Download</strong> → <strong>Draft Email with AI</strong> → <strong>Customer Dispatch</strong>.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="px-3 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-semibold hover:bg-zinc-800"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                      setIsCreateQuoteModalOpen(true);
                    }}
                    className="px-3 py-1.5 border border-zinc-400 text-zinc-800 text-xs font-semibold hover:bg-zinc-100 flex items-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>Test Another AI Quote</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* WIREFRAME MODAL: ADD PART */}
      {isAddPartModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white border-2 border-zinc-900 shadow-none">
            {/* Modal Header */}
            <div className="p-3 bg-zinc-200 border-b border-zinc-400 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-900">
                [ Form: Add Part ]
              </span>
              <button
                onClick={() => setIsAddPartModalOpen(false)}
                className="p-1 hover:bg-zinc-300 text-zinc-700"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddPart} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                  Part Name:
                </label>
                <input
                  type="text"
                  required
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="e.g. Radiator Assembly 2.0L"
                  className="w-full px-2.5 py-1.5 border border-zinc-400 bg-zinc-50 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                    Part Number:
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartNumber}
                    onChange={(e) => setNewPartNumber(e.target.value)}
                    placeholder="e.g. RAD-3310"
                    className="w-full px-2.5 py-1.5 border border-zinc-400 bg-zinc-50 focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                    Shelf Location:
                  </label>
                  <input
                    type="text"
                    value={newPartLocation}
                    onChange={(e) => setNewPartLocation(e.target.value)}
                    placeholder="e.g. Shelf B-02"
                    className="w-full px-2.5 py-1.5 border border-zinc-400 bg-zinc-50 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                    Initial Stock:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPartStock}
                    onChange={(e) => setNewPartStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-zinc-400 bg-zinc-50 focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                    Unit Price ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPartPrice}
                    onChange={(e) => setNewPartPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-zinc-400 bg-zinc-50 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-300 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-400 text-zinc-700 text-xs hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-semibold hover:bg-zinc-800"
                >
                  Save Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WIREFRAME MODAL: CREATE QUOTE (WITH "GENERATE QUOTE WITH AI") */}
      {isCreateQuoteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white border-2 border-zinc-900 shadow-none">
            {/* Modal Header */}
            <div className="p-3 bg-zinc-200 border-b border-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-900">
                  [ Screen: Create Quote ]
                </span>
                <span className="text-[10px] bg-zinc-900 text-white px-1.5 py-0.2 font-bold">
                  AI ENABLED
                </span>
              </div>
              <button
                onClick={() => setIsCreateQuoteModalOpen(false)}
                className="p-1 hover:bg-zinc-300 text-zinc-700"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStandardQuote} className="p-4 space-y-4 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                  1. Select Customer:
                </label>
                <select
                  value={quoteCustomerId}
                  onChange={(e) => setQuoteCustomerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-zinc-400 bg-zinc-50 focus:outline-none focus:border-zinc-900"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} — {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Inventory Parts Selector & Quantities */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-zinc-700 font-bold uppercase text-[10px]">
                    2. Select Parts & Quantities:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQuoteLineItem}
                    className="text-[10px] underline font-bold text-zinc-700 hover:text-black flex items-center gap-1"
                  >
                    <Plus size={10} /> Add Part Line
                  </button>
                </div>

                <div className="space-y-2 border border-zinc-300 p-2.5 bg-zinc-50">
                  {quoteItems.map((qi, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={qi.partId}
                        onChange={(e) => handleUpdateQuoteLineItem(idx, 'partId', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-zinc-400 bg-white focus:outline-none focus:border-zinc-900"
                      >
                        {parts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.number}) — ${p.price.toFixed(2)} [Stock: {p.stock}]
                          </option>
                        ))}
                      </select>

                      <div className="w-16">
                        <input
                          type="number"
                          min="1"
                          title="Quantity"
                          value={qi.quantity}
                          onChange={(e) => handleUpdateQuoteLineItem(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-zinc-400 bg-white text-center font-mono focus:outline-none"
                        />
                      </div>

                      <div className="w-20 text-right font-mono text-zinc-800 text-xs">
                        ${(qi.quantity * qi.unitPrice).toFixed(2)}
                      </div>

                      {quoteItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuoteLineItem(idx)}
                          className="p-1 hover:bg-zinc-200 text-zinc-600"
                          title="Remove line item"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="border border-zinc-300 bg-zinc-100 p-3 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-medium">
                    $
                    {quoteItems
                      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Tax (Wholesale Exemption 0%):</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="flex justify-between text-zinc-900 font-bold border-t border-zinc-300 pt-1 text-sm">
                  <span>Estimated Total:</span>
                  <span className="font-mono">
                    $
                    {quoteItems
                      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS (INCLUDES "GENERATE QUOTE WITH AI") */}
              <div className="pt-3 border-t border-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateQuoteModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-400 text-zinc-700 text-xs hover:bg-zinc-100 w-full sm:w-auto"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1.5 border border-zinc-400 bg-zinc-100 text-zinc-800 text-xs hover:bg-zinc-200"
                  >
                    Save Standard Quote
                  </button>

                  {/* Primary Feature 1 Button */}
                  <button
                    type="button"
                    onClick={handleGenerateQuoteWithAI}
                    disabled={quoteGeneratingNotice}
                    className="px-3 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-bold hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>{quoteGeneratingNotice ? 'Generating...' : 'Generate Quote with AI'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI FEATURE 1: GENERATED QUOTATION PREVIEW MODAL (PDF-STYLE) */}
      {isQuotePreviewModalOpen && activeGeneratedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border-2 border-zinc-900 shadow-none my-8">
            {/* Modal Top Control Bar */}
            <div className="p-3 bg-zinc-200 border-b border-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-900">
                  [ Generated Quotation Preview ]
                </span>
                <span className="text-[10px] bg-zinc-800 text-white px-2 py-0.5 font-bold uppercase">
                  PDF Preview
                </span>
              </div>
              <button
                onClick={() => setIsQuotePreviewModalOpen(false)}
                className="p-1 hover:bg-zinc-300 text-zinc-700"
              >
                <X size={14} />
              </button>
            </div>

            {/* Document PDF Sheet Simulation */}
            <div className="p-6 bg-zinc-50 border-b border-zinc-300 font-mono text-xs text-zinc-800 space-y-5">
              {/* PDF Document Header */}
              <div className="border-b-2 border-zinc-800 pb-4 flex justify-between items-start">
                <div>
                  <div className="font-bold text-base tracking-tight text-zinc-900 uppercase">
                    AUTO-PARTS DISTRIBUTION CO.
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    100 Industrial Parkway, Warehouse Bay 4 • (555) 019-2830
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    quotes@autopartssaas.demo • Tax ID: US-8829-1092
                  </div>
                </div>
                <div className="text-right border border-zinc-400 p-2 bg-white">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">
                    Official Quotation
                  </div>
                  <div className="text-sm font-bold text-zinc-900">
                    {activeGeneratedQuote.quoteId}
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-1">
                    Date: {activeGeneratedQuote.date}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Valid: {activeGeneratedQuote.validUntil}
                  </div>
                </div>
              </div>

              {/* Customer Details Box */}
              <div className="grid grid-cols-2 gap-4 border border-zinc-300 p-3 bg-white">
                <div>
                  <div className="text-[10px] font-bold uppercase text-zinc-500 mb-1">
                    Prepared For (Customer Details):
                  </div>
                  <div className="font-bold text-zinc-900 text-sm">
                    {activeGeneratedQuote.customer.company}
                  </div>
                  <div className="text-zinc-700 mt-0.5">
                    Attn: {activeGeneratedQuote.customer.name}
                  </div>
                  <div className="text-[11px] text-zinc-600">
                    Email: {activeGeneratedQuote.customer.email}
                  </div>
                  <div className="text-[11px] text-zinc-600">
                    Phone: {activeGeneratedQuote.customer.phone}
                  </div>
                </div>
                <div className="border-l border-zinc-200 pl-4 text-[11px] space-y-1 text-zinc-600">
                  <div className="text-[10px] font-bold uppercase text-zinc-500">
                    Quotation Terms:
                  </div>
                  <div>• Payment Terms: Net 30 upon dispatch</div>
                  <div>• Warranty: 12-Month OEM Guarantee</div>
                  <div>• Estimated Dispatch: 24 - 48 business hours</div>
                </div>
              </div>

              {/* Parts Description Table */}
              <div className="border border-zinc-400 bg-white overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-200 border-b border-zinc-400 text-zinc-800 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3 border-r border-zinc-300">#</th>
                      <th className="py-2 px-3 border-r border-zinc-300">Parts Description</th>
                      <th className="py-2 px-3 border-r border-zinc-300">Part Number</th>
                      <th className="py-2 px-3 border-r border-zinc-300 text-right">Qty</th>
                      <th className="py-2 px-3 border-r border-zinc-300 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {activeGeneratedQuote.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-zinc-500 border-r border-zinc-200">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-zinc-900 border-r border-zinc-200">
                          {it.partName}
                        </td>
                        <td className="py-2 px-3 font-mono text-zinc-600 border-r border-zinc-200">
                          {it.partNumber}
                        </td>
                        <td className="py-2 px-3 text-right font-mono border-r border-zinc-200">
                          {it.quantity}
                        </td>
                        <td className="py-2 px-3 text-right font-mono border-r border-zinc-200">
                          ${it.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-zinc-900">
                          ${it.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtotal and Total Amount Display */}
              <div className="flex justify-end">
                <div className="w-64 border border-zinc-400 bg-white p-3 space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">${activeGeneratedQuote.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Tax (0% Trade Exemption):</span>
                    <span className="font-mono">${activeGeneratedQuote.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-900 font-bold border-t border-zinc-300 pt-1 text-sm">
                    <span>Total Amount:</span>
                    <span className="font-mono">${activeGeneratedQuote.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Simple Document Footer Note */}
              <div className="border-t border-dashed border-zinc-400 pt-2 text-[10px] text-zinc-500 flex justify-between">
                <span>Auto-generated by AutoParts SaaS AI Quotation Engine</span>
                <span>Page 1 of 1</span>
              </div>
            </div>

            {/* Modal Actions Bar (Download PDF & Edit Quote + Draft Email with AI) */}
            <div className="p-3 bg-zinc-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Action 1: Edit Quote */}
                <button
                  type="button"
                  onClick={handleEditQuote}
                  className="px-3 py-1.5 border border-zinc-400 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-200 flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>Edit Quote</span>
                </button>

                {/* Action 2: Download PDF */}
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(activeGeneratedQuote)}
                  className="px-3 py-1.5 border border-zinc-400 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-200 flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
              </div>

              {/* Primary Workflow Link: Draft Email with AI */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    saveQuoteToState(activeGeneratedQuote, 'Approved');
                    setIsQuotePreviewModalOpen(false);
                    setCurrentScreen('quotes');
                  }}
                  className="px-3 py-1.5 border border-zinc-400 text-zinc-700 text-xs hover:bg-zinc-200"
                >
                  Save & Close
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDraftEmail(activeGeneratedQuote)}
                  className="px-3 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-bold hover:bg-zinc-800 flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Draft Email with AI →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI FEATURE 2: AI EMAIL & COMMUNICATION ASSISTANT MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border-2 border-zinc-900 shadow-none my-8">
            {/* Modal Header */}
            <div className="p-3 bg-zinc-200 border-b border-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-zinc-800" />
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-900">
                  [ AI Email & Communication Assistant ]
                </span>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 hover:bg-zinc-300 text-zinc-700"
              >
                <X size={14} />
              </button>
            </div>

            {/* Email Composition Form */}
            <div className="p-4 space-y-3 text-xs">
              {/* To (customer email) */}
              <div>
                <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                  To (Customer Email):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-zinc-400 bg-zinc-50 font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap bg-zinc-200 px-2 py-1 border border-zinc-300">
                    Verified Contact
                  </span>
                </div>
              </div>

              {/* Subject (automatically generated) */}
              <div>
                <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                  Subject (Automatically Generated):
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-zinc-400 bg-zinc-50 font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              {/* Quotation attachment card */}
              <div>
                <label className="block text-zinc-700 font-bold mb-1 uppercase text-[10px]">
                  Quotation Attachment:
                </label>
                <div className="p-2 border border-zinc-400 bg-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip size={13} className="text-zinc-600" />
                    <span className="font-mono font-bold text-zinc-900">
                      Quotation_{attachedQuoteId || 'Q-104'}.pdf
                    </span>
                    <span className="text-[10px] text-zinc-500">(42 KB • Generated Estimate)</span>
                  </div>
                  <span className="text-[10px] bg-white border border-zinc-300 px-1.5 py-0.5 text-zinc-700 uppercase font-bold">
                    Attached
                  </span>
                </div>
              </div>

              {/* AI Instruction Input Field: "What would you like to communicate?" */}
              <div className="p-3 border border-zinc-300 bg-zinc-50 space-y-2">
                <label className="block text-zinc-800 font-bold uppercase text-[10px] flex items-center justify-between">
                  <span>What would you like to communicate?</span>
                  <span className="text-[9px] text-zinc-500 font-normal">Optional prompt guidance</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailInstruction}
                    onChange={(e) => setEmailInstruction(e.target.value)}
                    placeholder="e.g. Include 5% volume discount, mention 24h dispatch, or ask for purchase order"
                    className="flex-1 px-2.5 py-1.5 border border-zinc-400 bg-white placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-900"
                  />
                  {/* Button named "Generate Email" */}
                  <button
                    type="button"
                    onClick={handleGenerateEmailWithInstruction}
                    className="px-3 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-bold hover:bg-zinc-800 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Sparkles size={12} />
                    <span>Generate Email</span>
                  </button>
                </div>

                {/* Quick chip suggestions */}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-0.5 flex-wrap">
                  <span className="font-bold">Try prompt:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInstruction('Offer 5% discount if approved by end of this week');
                    }}
                    className="underline hover:text-zinc-900"
                  >
                    "5% discount this week"
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInstruction('Mention free courier dispatch for shop replenishment');
                    }}
                    className="underline hover:text-zinc-900"
                  >
                    "Free courier delivery"
                  </button>
                </div>
              </div>

              {/* Email Body (Professionally written by AI) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-zinc-700 font-bold uppercase text-[10px]">
                    Email Body (Professionally Written by AI):
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Editable Draft</span>
                </div>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-2.5 border border-zinc-400 bg-white font-mono text-xs leading-relaxed text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              {/* Modal Actions: Regenerate and Send Email */}
              <div className="pt-3 border-t border-zinc-300 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-400 text-zinc-700 text-xs hover:bg-zinc-100"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {/* Action 1: Regenerate */}
                  <button
                    type="button"
                    onClick={handleRegenerateEmail}
                    className="px-3 py-1.5 border border-zinc-400 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-100 flex items-center gap-1.5"
                    title="Cycle through alternative AI drafted variations"
                  >
                    <RefreshCw size={12} />
                    <span>Regenerate</span>
                  </button>

                  {/* Action 2: Send Email */}
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="px-4 py-1.5 bg-zinc-900 text-white border border-zinc-900 text-xs font-bold hover:bg-zinc-800 flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
