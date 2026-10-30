/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ClipboardList,
  Search,
  Plus,
  Minus,
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
  CheckCircle2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Clock,
  Building2,
  Phone,
  ShieldCheck,
  Layers,
  Truck,
  Sun,
  Moon
} from 'lucide-react';

// Type definitions
type Screen = 'dashboard' | 'inventory' | 'customers' | 'quotes' | 'work-orders';
type Theme = 'light' | 'dark';

interface Part {
  id: string;
  name: string;
  number: string;
  stock: number;
  price: number;
  location: string;
  category?: string;
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

// Initial Sample Data
const INITIAL_PARTS: Part[] = [
  {
    id: 'p1',
    name: 'Brake Pads Front Ceramic Set',
    number: 'BP-4402',
    stock: 48,
    price: 65.0,
    location: 'Shelf A-12',
    category: 'Braking Systems',
  },
  {
    id: 'p2',
    name: 'Oil Filter Cartridge High Flow',
    number: 'OF-1180',
    stock: 120,
    price: 12.5,
    location: 'Bin C-04',
    category: 'Engine Filtration',
  },
  {
    id: 'p3',
    name: 'Alternator 120A Heavy Duty',
    number: 'ALT-8921',
    stock: 6,
    price: 210.0,
    location: 'Rack D-01',
    category: 'Electrical & Charging',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Marcus Vance',
    company: 'Metro Auto Repair Center',
    contact: 'marcus@metroauto.com | (555) 234-5678',
    email: 'marcus@metroauto.com',
    phone: '(555) 234-5678',
  },
  {
    id: 'c2',
    name: 'Elena Rostova',
    company: 'Apex Fleet Logistics',
    contact: 'e.rostova@apexfleet.io | (555) 876-1234',
    email: 'e.rostova@apexfleet.io',
    phone: '(555) 876-1234',
  },
  {
    id: 'c3',
    name: 'David Chen',
    company: 'Downtown Motors & Garage',
    contact: 'dchen@downtownmotors.com | (555) 432-8901',
    email: 'dchen@downtownmotors.com',
    phone: '(555) 432-8901',
  },
];

const INITIAL_QUOTES: Quote[] = [
  {
    id: 'Q-101',
    customerId: 'c1',
    customerName: 'Metro Auto Repair Center',
    customerEmail: 'marcus@metroauto.com',
    amount: 325.0,
    status: 'Approved',
    itemsSummary: '5x Brake Pads Front Ceramic Set',
    createdAt: '2026-10-28',
    items: [
      {
        partId: 'p1',
        partName: 'Brake Pads Front Ceramic Set',
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
    customerName: 'Apex Fleet Logistics',
    customerEmail: 'e.rostova@apexfleet.io',
    amount: 1260.0,
    status: 'Pending',
    itemsSummary: '6x Alternator 120A Heavy Duty',
    createdAt: '2026-10-29',
    items: [
      {
        partId: 'p3',
        partName: 'Alternator 120A Heavy Duty',
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
    customerName: 'Downtown Motors & Garage',
    customerEmail: 'dchen@downtownmotors.com',
    amount: 150.0,
    status: 'Draft',
    itemsSummary: '12x Oil Filter Cartridge High Flow',
    createdAt: '2026-10-30',
    items: [
      {
        partId: 'p2',
        partName: 'Oil Filter Cartridge High Flow',
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
    customerName: 'Metro Auto Repair Center',
    status: 'In Progress',
    dispatchStatus: 'Ready for Pickup',
    partsSummary: '5x Brake Pads Front Ceramic Set (BP-4402)',
    quoteId: 'Q-101',
  },
  {
    id: 'WO-502',
    customerId: 'c2',
    customerName: 'Apex Fleet Logistics',
    status: 'Pending',
    dispatchStatus: 'Awaiting Dispatch',
    partsSummary: '6x Alternator 120A Heavy Duty (ALT-8921)',
    quoteId: 'Q-102',
  },
  {
    id: 'WO-503',
    customerId: 'c3',
    customerName: 'Downtown Motors & Garage',
    status: 'Completed',
    dispatchStatus: 'Dispatched',
    partsSummary: '12x Oil Filter Cartridge (OF-1180)',
    quoteId: 'Q-100',
  },
];

export default function App() {
  // Theme State: Light / Dark Mode
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('autoparts_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('autoparts_theme', next);
    } catch {
      // ignore
    }
  };

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

  const isDark = theme === 'dark';

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
      category: 'General Replacement',
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

    setTimeout(() => {
      setQuoteGeneratingNotice(false);
      setActiveGeneratedQuote(quoteData);
      setIsCreateQuoteModalOpen(false);
      setIsQuotePreviewModalOpen(true);
    }, 280);
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

  // AI Feature 1 Action: Download Real PDF via jsPDF
  const handleDownloadPDF = (quoteData: GeneratedQuoteData) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Header / Enterprise Branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('AUTOPARTS PRO B2B SAAS', 40, 50);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('100 Industrial Parkway, Logistics Hub • (555) 019-2830', 40, 65);
      doc.text('support@autopartspro.io • Tax Exempt B2B ID: US-8829-1092', 40, 77);

      // Quote Identifier Box (Top Right)
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(pageWidth - 210, 36, 170, 60, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(pageWidth - 210, 36, 170, 60, 4, 4, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('OFFICIAL QUOTATION', pageWidth - 198, 50);

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(quoteData.quoteId, pageWidth - 198, 66);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Issue Date: ${quoteData.date}`, pageWidth - 198, 78);
      doc.text(`Valid Until: ${quoteData.validUntil}`, pageWidth - 198, 88);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(40, 108, pageWidth - 40, 108);

      // Customer Details Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(40, 118, pageWidth - 80, 64, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(40, 118, pageWidth - 80, 64, 4, 4, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('PREPARED FOR (CLIENT):', 52, 132);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(quoteData.customer.company, 52, 147);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Attention: ${quoteData.customer.name}`, 52, 160);
      doc.text(`Email: ${quoteData.customer.email}  |  Phone: ${quoteData.customer.phone}`, 52, 172);

      // Terms column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('COMMERCIAL TERMS:', 330, 132);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('• Net 30 days upon shop receipt', 330, 145);
      doc.text('• 24-48h warehouse dispatch turnaround', 330, 157);
      doc.text('• 12-Month replacement OEM warranty', 330, 169);

      // Table Header
      const tableY = 196;
      doc.setFillColor(241, 245, 249);
      doc.rect(40, tableY, pageWidth - 80, 22, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(40, tableY + 22, pageWidth - 40, tableY + 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('#', 48, tableY + 14);
      doc.text('PARTS DESCRIPTION', 72, tableY + 14);
      doc.text('PART NUMBER', 265, tableY + 14);
      doc.text('QTY', 375, tableY + 14, { align: 'right' });
      doc.text('UNIT PRICE', 455, tableY + 14, { align: 'right' });
      doc.text('AMOUNT', pageWidth - 50, tableY + 14, { align: 'right' });

      // Table Line Items
      let curY = tableY + 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      quoteData.items.forEach((item, idx) => {
        const rowHeight = 22;
        doc.setDrawColor(241, 245, 249);
        doc.line(40, curY + rowHeight, pageWidth - 40, curY + rowHeight);

        doc.setTextColor(148, 163, 184);
        doc.text(String(idx + 1), 48, curY + 15);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(item.partName, 72, curY + 15);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(item.partNumber, 265, curY + 15);

        doc.setTextColor(15, 23, 42);
        doc.text(String(item.quantity), 375, curY + 15, { align: 'right' });
        doc.text(`$${item.unitPrice.toFixed(2)}`, 455, curY + 15, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.text(`$${item.total.toFixed(2)}`, pageWidth - 50, curY + 15, { align: 'right' });

        curY += rowHeight;
      });

      // Summary Totals Card
      const summaryBoxY = curY + 16;
      const summaryBoxWidth = 200;
      const summaryBoxX = pageWidth - 40 - summaryBoxWidth;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, 68, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, 68, 4, 4, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Subtotal:', summaryBoxX + 12, summaryBoxY + 18);
      doc.text(`$${quoteData.subtotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 12, summaryBoxY + 18, { align: 'right' });

      doc.text('Tax (0% B2B Wholesale):', summaryBoxX + 12, summaryBoxY + 34);
      doc.text(`$${quoteData.tax.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 12, summaryBoxY + 34, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.line(summaryBoxX + 8, summaryBoxY + 42, summaryBoxX + summaryBoxWidth - 8, summaryBoxY + 42);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Total Amount:', summaryBoxX + 12, summaryBoxY + 58);
      doc.text(`$${quoteData.total.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 12, summaryBoxY + 58, { align: 'right' });

      // Footer
      const footerY = 760;
      doc.setDrawColor(226, 232, 240);
      doc.line(40, footerY, pageWidth - 40, footerY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated by AutoParts Pro SaaS • Official Commercial B2B Quotation Document', 40, footerY + 16);
      doc.text('Page 1 of 1', pageWidth - 40, footerY + 16, { align: 'right' });

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
    const subject = `Quotation for Your Automotive Parts Requirement - ${quoteId}`;

    let customNote = '';
    if (instruction.trim()) {
      customNote = `\n\nSpecial Note: ${instruction.trim()}`;
    }

    const drafts = [
      // Draft 1 (Standard professional)
      `Subject: ${subject}

Hello ${firstName},

Thank you for your enquiry.

Please find attached the quotation (${quoteId}) for the requested automotive parts. The quotation includes the available parts, quantities, and pricing details (Total: $${total.toFixed(2)}).${customNote}

Please review it and let us know if you would like to proceed with the order.

Best regards,
Sales Operations Team
AutoParts Pro Logistics`,

      // Draft 2 (Volume discount / fast dispatch variation)
      `Subject: ${subject} • Ready for Workshop Review

Dear ${firstName},

Following up on your parts request for ${customer.company}. We have prepared quotation ${quoteId} with current warehouse stock availability and pricing.

The detailed quotation is attached as a PDF for your convenience.${customNote}

We can dispatch these parts immediately upon your confirmation. Please let us know if you have any questions or require adjustments.

Best regards,
Commercial Accounts Team
AutoParts Pro Logistics`,

      // Draft 3 (Short & direct commercial variation)
      `Subject: Automotive Parts Estimate Summary (${quoteId})

Hi ${firstName},

Please find attached quotation ${quoteId} totaling $${total.toFixed(2)} prepared for ${customer.company}.

All listed components have been verified in our inventory and are reserved for your confirmation.${customNote}

Feel free to reply directly to convert this estimate into an active shop work order.

Warm regards,
Client Relations
AutoParts Pro Logistics`,
    ];

    return {
      subject,
      body: drafts[variation % drafts.length],
    };
  };

  // Open "Draft Email with AI" from Preview or Table
  const handleOpenDraftEmail = (quoteData: GeneratedQuoteData) => {
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

    setQuotes((prev) =>
      prev.map((q) =>
        q.id === activeGeneratedQuote.quoteId ? { ...q, status: 'Approved' } : q
      )
    );

    const recipient = emailTo;
    const qId = activeGeneratedQuote.quoteId;

    setIsEmailModalOpen(false);
    setEmailSentNotice(
      `Email dispatched to ${recipient} with Quotation_${qId}.pdf attached.`
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
      p.location.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(inventorySearch.toLowerCase()))
  );

  // Workflow steps for the prototype helper banner
  const workflowSteps = [
    { id: 'dashboard', label: 'Dashboard', step: '01' },
    { id: 'inventory', label: 'Inventory', step: '02' },
    { id: 'quotes', label: 'Quotes & AI', step: '03' },
    { id: 'work-orders', label: 'Work Orders', step: '04' },
  ];

  return (
    <div className={`flex h-screen w-screen font-sans antialiased overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* SLEEK MODERN DARK NAVY SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between transition-colors ${
        isDark ? 'bg-[#090e17] text-slate-300 border-slate-800' : 'bg-slate-900 text-slate-300 border-slate-800'
      }`}>
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-wider">
                AP
              </div>
              <div>
                <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                  <span>AutoParts Pro</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    B2B
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Inventory & Quoting OS</div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Core Modules
            </div>

            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentScreen === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentScreen('inventory')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentScreen === 'inventory'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package size={16} />
                <span>Inventory</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                currentScreen === 'inventory' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {parts.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentScreen('customers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentScreen === 'customers'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>Customers</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                currentScreen === 'customers' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {customers.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentScreen('quotes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentScreen === 'quotes'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={16} />
                <span>Quotes</span>
              </div>
              <span className="flex items-center gap-1">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                  <Sparkles size={9} /> AI
                </span>
              </span>
            </button>

            <button
              onClick={() => setCurrentScreen('work-orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentScreen === 'work-orders'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={16} />
                <span>Work Orders</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                currentScreen === 'work-orders' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {workOrders.filter(w => w.status !== 'Completed').length} active
              </span>
            </button>
          </nav>

          {/* Connected Lifecycle Stepper Card */}
          <div className="mx-3 mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/50">
              <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles size={12} className="text-blue-400" />
                <span>Workflow Pipeline</span>
              </span>
              <span className="text-[10px] text-blue-400 font-medium">B2B</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[9px] font-bold">1</span>
                <span>Inventory Part Selection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center text-[9px] font-bold">2</span>
                <span>AI Quote & Real PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center text-[9px] font-bold">3</span>
                <span>AI Email Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[9px] font-bold">4</span>
                <span>Shop Order Fulfillment</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile & Theme Toggle */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isDark ? <Moon size={14} className="text-blue-400" /> : <Sun size={14} className="text-amber-400" />}
              <span>Theme: <strong className="text-white capitalize">{theme}</strong></span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              Switch to {isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Profile Card */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold flex items-center justify-center text-xs shadow-inner">
                MV
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-white">Marcus Vance</div>
                <div className="text-[10px] text-slate-400">Head of Operations</div>
              </div>
            </div>
            <button
              onClick={handleResetData}
              title="Reset sample data"
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/60 transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-colors ${
        isDark ? 'bg-slate-950' : 'bg-slate-50'
      }`}>
        {/* TOP ENTERPRISE HEADER */}
        <header className={`h-16 border-b px-8 flex items-center justify-between flex-shrink-0 transition-colors ${
          isDark 
            ? 'bg-slate-900/90 border-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.4)]' 
            : 'bg-white border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className={`font-semibold capitalize text-base tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {currentScreen.replace('-', ' ')}
              </span>
              <span>/</span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Commercial Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Header Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            >
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-600" />}
              <span className="hidden sm:inline text-[11px]">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Stepper Interactive Navigation */}
            <div className={`flex items-center gap-1 p-1 rounded-lg border transition-colors ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              {workflowSteps.map((step, idx) => {
                const isActive = currentScreen === step.id;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setCurrentScreen(step.id as Screen)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? isDark
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'bg-white text-slate-900 shadow-sm font-semibold'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <span className={`text-[10px] font-mono ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                        {step.step}
                      </span>
                      <span>{step.label}</span>
                    </button>
                    {idx < workflowSteps.length - 1 && (
                      <ChevronRight size={12} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </header>

        {/* FEEDBACK TOAST / NOTIFICATION BANNERS */}
        {emailSentNotice && (
          <div className="bg-slate-900 text-white px-8 py-3 border-b border-slate-800 text-xs flex items-center justify-between shadow-md animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="font-medium">{emailSentNotice}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentScreen('work-orders')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
              >
                Track in Work Orders →
              </button>
              <button
                onClick={() => setEmailSentNotice(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {pdfDownloadedNotice && (
          <div className={`px-8 py-2.5 border-b text-xs flex items-center justify-between shadow-sm transition-colors ${
            isDark ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800' : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <FileDown size={15} className="text-emerald-400" />
              <span className="font-medium">{pdfDownloadedNotice}</span>
            </div>
            <button
              onClick={() => setPdfDownloadedNotice(null)}
              className="text-emerald-400 hover:text-emerald-200 p-0.5"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* SCREEN 1: DASHBOARD */}
          {currentScreen === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header Title & Primary Action */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200/80'
              }`}>
                <div>
                  <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Operations Overview
                  </h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Live catalog telemetry, active quotation pipelines, and dispatch fulfillment status.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                      setIsCreateQuoteModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
                  >
                    <Sparkles size={14} className="text-blue-200" />
                    <span>Create Quote with AI</span>
                  </button>
                  <button
                    onClick={() => setCurrentScreen('inventory')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-lg text-xs font-medium shadow-sm transition-all ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>Browse Inventory</span>
                    <ArrowRight size={13} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Modern Summary Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Metric 1: Total Parts */}
                <div className={`rounded-xl border p-5 shadow-sm transition-all ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Total Cataloged Parts
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Package size={16} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {parts.length}
                    </span>
                    <span className="text-xs font-medium text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp size={12} /> +12% active
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {parts.reduce((acc, p) => acc + p.stock, 0)} total units across warehouse bays
                  </div>
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <span className="text-slate-400">All SKUs in stock</span>
                    <button
                      onClick={() => setCurrentScreen('inventory')}
                      className="text-blue-500 font-medium hover:text-blue-400 flex items-center gap-1"
                    >
                      Manage items <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Metric 2: Pending Quotes */}
                <div className={`rounded-xl border p-5 shadow-sm transition-all ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Pending Quotations
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <FileText size={16} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {quotes.filter((q) => q.status === 'Pending').length || 1}
                    </span>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      of {quotes.length} total
                    </span>
                  </div>
                  <div className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ${quotes
                      .reduce((acc, q) => acc + q.amount, 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                    total pipeline value
                  </div>
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <span className="text-slate-400">AI email drafting ready</span>
                    <button
                      onClick={() => setCurrentScreen('quotes')}
                      className="text-blue-500 font-medium hover:text-blue-400 flex items-center gap-1"
                    >
                      View quotes <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Metric 3: Open Orders */}
                <div className={`rounded-xl border p-5 shadow-sm transition-all ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Active Work Orders
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/40' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <ClipboardList size={16} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {workOrders.filter((w) => w.status !== 'Completed').length}
                    </span>
                    <span className="text-xs font-medium text-blue-500">
                      In Fulfillment
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ready for shop courier pickup or dispatch
                  </div>
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <span className="text-slate-400">100% on-time rate</span>
                    <button
                      onClick={() => setCurrentScreen('work-orders')}
                      className="text-blue-500 font-medium hover:text-blue-400 flex items-center gap-1"
                    >
                      Dispatch queue <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Automation Feature Cards */}
              <div className={`rounded-xl border p-6 shadow-sm transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/40' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <Sparkles size={15} />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Intelligent Quoting & Communication Suite
                      </h2>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Accelerate commercial sales workflows with automatic estimate calculation and B2B email drafting.
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                    isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    Commercial Tools
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border transition-colors ${
                    isDark
                      ? 'border-slate-800 bg-slate-950/50 hover:bg-slate-950/80'
                      : 'border-slate-200/70 bg-slate-50/50 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        1. Automated Quotation Preparation
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Real PDF Export</span>
                    </div>
                    <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Select inventory items to instantly compute lines, unit margins, and client details, then download a certified PDF estimate.
                    </p>
                    <button
                      onClick={() => {
                        setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                        setIsCreateQuoteModalOpen(true);
                      }}
                      className="mt-3 text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                      Launch Quote Generator <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className={`p-4 rounded-xl border transition-colors ${
                    isDark
                      ? 'border-slate-800 bg-slate-950/50 hover:bg-slate-950/80'
                      : 'border-slate-200/70 bg-slate-50/50 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        2. AI Communication Assistant
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">1-Click Dispatch</span>
                    </div>
                    <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Drafts tailored client messages with attached PDF quotes, incorporating custom discounts or urgency terms seamlessly.
                    </p>
                    <button
                      onClick={() => handleOpenEmailFromQuoteRow(quotes[0])}
                      className="mt-3 text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                      Open Email Assistant <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Polished Recent Activity Table */}
              <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${
                  isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-slate-400" />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Recent System Activity
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Live operational ledger</span>
                </div>
                <div className={`divide-y text-xs ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  <div className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Work Order WO-501</span>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}> marked Ready for Pickup for Metro Auto Repair Center</span>
                      </div>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">Today, 09:15 AM</span>
                  </div>

                  <div className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Quote Q-102</span>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}> ($1,260.00) sent to Apex Fleet Logistics via AI Assistant</span>
                      </div>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">Today, 08:30 AM</span>
                  </div>

                  <div className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventory Alert</span>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}> Alternator 120A reached low stock threshold (6 units remaining)</span>
                      </div>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">Yesterday, 04:45 PM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: INVENTORY */}
          {currentScreen === 'inventory' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Screen Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200/80'
              }`}>
                <div>
                  <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Parts Inventory Catalog
                  </h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Manage SKU inventory levels, warehouse bin coordinates, and wholesale trade pricing.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsAddPartModalOpen(true)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-lg text-xs font-semibold shadow-sm transition-all ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Plus size={14} className="text-slate-400" />
                    <span>Add Part</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                      setIsCreateQuoteModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    <Sparkles size={14} className="text-blue-200" />
                    <span>Create Quote with AI →</span>
                  </button>
                </div>
              </div>

              {/* Controls bar: Search & Count */}
              <div className={`rounded-xl border p-3.5 shadow-sm flex items-center justify-between gap-4 transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className="flex-1 max-w-md relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search by part name, SKU number, or shelf location..."
                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800'
                        : 'bg-slate-50/60 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                    }`}
                  />
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-2`}>
                  <span>Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{filteredParts.length}</strong> of {parts.length} cataloged SKUs</span>
                </div>
              </div>

              {/* Parts Table */}
              <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-semibold uppercase text-[11px] tracking-wider transition-colors ${
                      isDark ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50/75 border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-3 px-4">Part Name & Category</th>
                      <th className="py-3 px-4">SKU / Part Number</th>
                      <th className="py-3 px-4 text-right">Stock Level</th>
                      <th className="py-3 px-4 text-right">Wholesale Price</th>
                      <th className="py-3 px-4">Warehouse Location</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                    {filteredParts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No matching components found for "{inventorySearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredParts.map((part) => (
                        <tr key={part.id} className={`transition-colors ${
                          isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/70'
                        }`}>
                          <td className="py-3.5 px-4">
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{part.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{part.category || 'Automotive Component'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium">
                            <span className={`px-2 py-0.5 rounded border text-[11px] ${
                              isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {part.number}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                part.stock < 10
                                  ? isDark ? 'bg-amber-950/50 text-amber-300 border border-amber-800/50' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : isDark ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${part.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              {part.stock} in stock
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-semibold font-mono ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            ${part.price.toFixed(2)}
                          </td>
                          <td className={`py-3.5 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {part.location}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleOpenQuoteWithPart(part)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                                isDark
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
                                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-200'
                              }`}
                              title="Start quotation with this part"
                            >
                              <Sparkles size={12} className="text-blue-500" />
                              <span>Quote</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Workflow callout footer */}
              <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between text-xs transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  <strong>Workflow Next Step:</strong> Select a customer and inventory parts to trigger <strong>"Generate Quote with AI"</strong>.
                </span>
                <button
                  onClick={() => {
                    setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                    setIsCreateQuoteModalOpen(true);
                  }}
                  className="font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                >
                  Open Quote Generator <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: CUSTOMERS */}
          {currentScreen === 'customers' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Screen Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200/80'
              }`}>
                <div>
                  <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Workshop & Fleet Customers
                  </h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Commercial client accounts, service garages, and authorized workshop contacts.
                  </p>
                </div>
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border shadow-sm ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                }`}>
                  {customers.length} Accounts Enrolled
                </div>
              </div>

              {/* Customer Table */}
              <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-semibold uppercase text-[11px] tracking-wider transition-colors ${
                      isDark ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50/75 border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-3 px-4">Contact Representative</th>
                      <th className="py-3 px-4">Company / Garage</th>
                      <th className="py-3 px-4">Contact Details & Email</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                    {customers.map((c) => (
                      <tr key={c.id} className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/70'
                      }`}>
                        <td className="py-3.5 px-4">
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.name}</div>
                          <div className="text-[11px] text-slate-500">Account Owner</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className={`font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <Building2 size={13} className="text-slate-500" />
                            <span>{c.company}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{c.email}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setQuoteCustomerId(c.id);
                              setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                              setIsCreateQuoteModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                              isDark
                                ? 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border-blue-800/50'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                            }`}
                          >
                            <Sparkles size={12} />
                            <span>AI Quote</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`p-4 rounded-xl border text-xs shadow-sm flex items-center gap-3 transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-white border-slate-200/70 text-slate-500'
              }`}>
                <ShieldCheck size={18} className="text-blue-500 flex-shrink-0" />
                <span>
                  All client email addresses are pre-verified for direct B2B automated PDF transmission through the AI Email & Communication Assistant.
                </span>
              </div>
            </div>
          )}

          {/* SCREEN 4: QUOTES */}
          {currentScreen === 'quotes' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Screen Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200/80'
              }`}>
                <div>
                  <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Quotations & Commercial Pipeline
                  </h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Manage parts quotations, generate real PDF documents, and draft client communications.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                    setIsCreateQuoteModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus size={14} />
                  <span>Create Quote</span>
                </button>
              </div>

              {/* Quotations Table */}
              <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-semibold uppercase text-[11px] tracking-wider transition-colors ${
                      isDark ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50/75 border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-3 px-4">Quote ID</th>
                      <th className="py-3 px-4">Client Customer</th>
                      <th className="py-3 px-4">Parts Summary</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions & Flow</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                    {quotes.map((q) => (
                      <tr key={q.id} className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/70'
                      }`}>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded border text-[11px] ${
                            isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {q.id}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.customerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{q.customerEmail}</div>
                        </td>
                        <td className={`py-3.5 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {q.itemsSummary}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          ${q.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              q.status === 'Approved'
                                ? isDark ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : q.status === 'Pending'
                                ? isDark ? 'bg-amber-950/50 text-amber-300 border border-amber-800/50' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                q.status === 'Approved'
                                  ? 'bg-emerald-500'
                                  : q.status === 'Pending'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Download Real PDF */}
                            <button
                              onClick={() => handleDownloadPDFFromQuoteRow(q)}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border shadow-xs flex items-center gap-1 transition-colors ${
                                isDark
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                              title="Download official PDF quotation document"
                            >
                              <Download size={12} className="text-slate-400" />
                              <span>PDF</span>
                            </button>

                            {/* Draft Email with AI */}
                            <button
                              onClick={() => handleOpenEmailFromQuoteRow(q)}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1 transition-colors ${
                                isDark
                                  ? 'bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border-indigo-800/50'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}
                              title="Draft Email with AI for this quotation"
                            >
                              <Mail size={12} />
                              <span>Draft Email</span>
                            </button>

                            {/* Convert to Work Order or Approve */}
                            {q.status === 'Approved' ? (
                              <button
                                onClick={() => handleConvertToWorkOrder(q)}
                                className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1 transition-colors"
                                title="Convert approved quote into an active work order"
                              >
                                <span>Work Order</span>
                                <ArrowRight size={12} />
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
                                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                                  isDark
                                    ? 'bg-slate-800 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-300 border-slate-700 hover:border-emerald-700'
                                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200 hover:border-emerald-200'
                                }`}
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

              {/* Workflow callout footer */}
              <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between text-xs transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  <strong>Workflow Next Step:</strong> Approved quotes can be converted into active Work Orders for workshop warehouse fulfillment.
                </span>
                <button
                  onClick={() => setCurrentScreen('work-orders')}
                  className="font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                >
                  View Work Orders Screen <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: WORK ORDERS */}
          {currentScreen === 'work-orders' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Screen Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200/80'
              }`}>
                <div>
                  <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Workshop Orders & Dispatch Queue
                  </h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Fulfillment tracking, order dispatch status, and client workshop collection.
                  </p>
                </div>
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border shadow-sm ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                }`}>
                  {workOrders.length} Total Orders
                </div>
              </div>

              {/* Work Orders Table */}
              <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-semibold uppercase text-[11px] tracking-wider transition-colors ${
                      isDark ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50/75 border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Client Customer</th>
                      <th className="py-3 px-4">Parts Assigned</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Dispatch Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                    {workOrders.map((wo) => (
                      <tr key={wo.id} className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/70'
                      }`}>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded border text-[11px] ${
                            isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {wo.id}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {wo.customerName}
                        </td>
                        <td className={`py-3.5 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {wo.partsSummary}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              wo.status === 'Completed'
                                ? isDark ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : wo.status === 'In Progress'
                                ? isDark ? 'bg-blue-950/50 text-blue-300 border border-blue-800/50' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                wo.status === 'Completed'
                                  ? 'bg-emerald-500'
                                  : wo.status === 'In Progress'
                                  ? 'bg-blue-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {wo.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              wo.dispatchStatus === 'Dispatched'
                                ? isDark ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : wo.dispatchStatus === 'Ready for Pickup'
                                ? isDark ? 'bg-indigo-950/50 text-indigo-300 border border-indigo-800/50' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isDark ? 'bg-amber-950/50 text-amber-300 border border-amber-800/50' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <Truck size={11} />
                            {wo.dispatchStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
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
                              className={`px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors ${
                                isDark
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                            >
                              Dispatch Order
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">
                              Fulfilled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Flow Completion Card */}
              <div className={`rounded-xl border p-5 shadow-sm space-y-3 transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Complete B2B Workflow Cycle Demonstrated</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  The client has walked through the complete modern B2B SaaS workflow:
                  <strong> Dashboard overview</strong> → <strong>Inventory checking & selection</strong> → <strong>AI Quote Generation & real PDF download</strong> → <strong>AI Email assistant dispatch</strong> → <strong>Work order fulfillment</strong>.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setQuoteItems([{ partId: parts[0].id, quantity: 4, unitPrice: parts[0].price }]);
                      setIsCreateQuoteModalOpen(true);
                    }}
                    className={`px-3.5 py-2 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Sparkles size={13} className="text-blue-500" />
                    <span>Generate Another Quote</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODERN MODAL: ADD PART */}
      {isAddPartModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/50 border-slate-100'
            }`}>
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Inventory Part</h3>
                <p className="text-xs text-slate-400 mt-0.5">Register a new SKU into warehouse stock</p>
              </div>
              <button
                onClick={() => setIsAddPartModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddPart} className="p-6 space-y-4 text-xs">
              <div>
                <label className={`block font-semibold mb-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Part Name:
                </label>
                <input
                  type="text"
                  required
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="e.g. Radiator Assembly 2.0L Turbo"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Part Number / SKU:
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartNumber}
                    onChange={(e) => setNewPartNumber(e.target.value)}
                    placeholder="e.g. RAD-3310"
                    className={`w-full px-3 py-2 rounded-lg border text-xs uppercase font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Warehouse Location:
                  </label>
                  <input
                    type="text"
                    value={newPartLocation}
                    onChange={(e) => setNewPartLocation(e.target.value)}
                    placeholder="e.g. Shelf B-02"
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Initial Stock Count:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPartStock}
                    onChange={(e) => setNewPartStock(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Wholesale Price ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPartPrice}
                    onChange={(e) => setNewPartPrice(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`pt-3 border-t flex justify-end gap-2.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Part to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODERN MODAL: CREATE QUOTE (WITH "GENERATE QUOTE WITH AI" & VISIBLE QUANTITIES) */}
      {isCreateQuoteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/50 border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Quotation</h3>
                  <p className="text-xs text-slate-400">Configure client parts with AI assistance</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateQuoteModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStandardQuote} className="p-6 space-y-4 text-xs">
              {/* Customer Selector */}
              <div>
                <label className={`block font-semibold mb-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  1. Select Client Workshop:
                </label>
                <select
                  value={quoteCustomerId}
                  onChange={(e) => setQuoteCustomerId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}>
                      {c.company} — {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Inventory Parts Selector & Prominently Visible Quantities */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block font-semibold text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    2. Select Line Items & Quantities:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQuoteLineItem}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Item Line
                  </button>
                </div>

                <div className={`space-y-2 border rounded-xl p-3 ${
                  isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 rounded-xl p-3 bg-slate-50/50'
                }`}>
                  {quoteItems.map((qi, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 ${
                      isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'
                    }`}>
                      {/* Part Selector */}
                      <select
                        value={qi.partId}
                        onChange={(e) => handleUpdateQuoteLineItem(idx, 'partId', e.target.value)}
                        className={`flex-1 px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        {parts.map((p) => (
                          <option key={p.id} value={p.id} className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}>
                            {p.name} ({p.number}) — ${p.price.toFixed(2)} [Stock: {p.stock}]
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        {/* HIGHLY VISIBLE QUANTITY CONTROLLER (FIXED ISSUE) */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Qty:
                          </span>
                          <div className={`flex items-center border rounded-lg overflow-hidden shadow-xs ${
                            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuoteLineItem(idx, 'quantity', String(Math.max(1, qi.quantity - 1)))}
                              className={`px-2 py-1.5 transition-colors ${
                                isDark
                                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                              title="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              title="Adjust Quantity"
                              value={qi.quantity}
                              onChange={(e) => handleUpdateQuoteLineItem(idx, 'quantity', e.target.value)}
                              className={`w-12 text-center text-xs font-bold font-mono py-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                isDark ? 'text-white bg-slate-800' : 'text-slate-900 bg-white'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateQuoteLineItem(idx, 'quantity', String(qi.quantity + 1))}
                              className={`px-2 py-1.5 transition-colors ${
                                isDark
                                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                              title="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className={`w-20 text-right font-mono font-bold text-xs ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          ${(qi.quantity * qi.unitPrice).toFixed(2)}
                        </div>

                        {/* Remove item button */}
                        {quoteItems.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuoteLineItem(idx)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove line item"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <div className="w-7" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary Card */}
              <div className={`rounded-xl border p-4 space-y-1.5 text-xs ${
                isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200/90 bg-slate-50/80'
              }`}>
                <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Subtotal Amount:</span>
                  <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    $
                    {quoteItems
                      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>B2B Wholesale Trade Exemption:</span>
                  <span className="font-mono text-slate-500">$0.00</span>
                </div>
                <div className={`flex justify-between font-bold border-t pt-2 text-sm ${
                  isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'
                }`}>
                  <span>Total Estimate:</span>
                  <span className="font-mono text-blue-500 text-base">
                    $
                    {quoteItems
                      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className={`pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsCreateQuoteModalOpen(false)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors w-full sm:w-auto ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="submit"
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold shadow-xs transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Save Standard Quote
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateQuoteWithAI}
                    disabled={quoteGeneratingNotice}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} className="text-blue-200" />
                    <span>{quoteGeneratingNotice ? 'Generating Preview...' : 'Generate Quote with AI'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI FEATURE 1: GENERATED QUOTATION PREVIEW MODAL */}
      {isQuotePreviewModalOpen && activeGeneratedQuote && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-8 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Top Control Bar */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/60 border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Quotation Preview</h3>
                  <p className="text-xs text-slate-400">Official certified PDF format preview</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuotePreviewModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Document PDF Sheet Simulation */}
            <div className={`p-8 text-xs space-y-6 ${
              isDark ? 'bg-slate-950/50 text-slate-200' : 'bg-slate-50/40 text-slate-800'
            }`}>
              {/* Document Header */}
              <div className={`border-b pb-5 flex justify-between items-start ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div>
                  <div className={`font-bold text-base tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    AUTOPARTS PRO B2B SAAS
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    100 Industrial Parkway, Warehouse Bay 4 • (555) 019-2830
                  </div>
                  <div className="text-[11px] text-slate-400">
                    support@autopartspro.io • Tax ID: US-8829-1092
                  </div>
                </div>
                <div className={`text-right p-3 rounded-xl border shadow-xs ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Official Quotation
                  </div>
                  <div className={`text-sm font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeGeneratedQuote.quoteId}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Date: {activeGeneratedQuote.date}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Valid: {activeGeneratedQuote.validUntil}
                  </div>
                </div>
              </div>

              {/* Customer Details Box */}
              <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border shadow-xs ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Prepared For (Customer Details):
                  </div>
                  <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeGeneratedQuote.customer.company}
                  </div>
                  <div className={`mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Attn: {activeGeneratedQuote.customer.name}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {activeGeneratedQuote.customer.email}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    {activeGeneratedQuote.customer.phone}
                  </div>
                </div>
                <div className={`border-l pl-4 space-y-1 text-xs ${
                  isDark ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                }`}>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Commercial Terms:
                  </div>
                  <div>• Net 30 days upon shop delivery</div>
                  <div>• 12-Month OEM guarantee included</div>
                  <div>• Immediate warehouse dispatch</div>
                </div>
              </div>

              {/* Parts Description Table */}
              <div className={`rounded-xl border overflow-hidden shadow-xs ${
                isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'
              }`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-semibold uppercase text-[10px] tracking-wider ${
                      isDark ? 'bg-slate-800/60 border-slate-800 text-slate-400' : 'bg-slate-50/80 border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-2.5 px-3.5">#</th>
                      <th className="py-2.5 px-3.5">Parts Description</th>
                      <th className="py-2.5 px-3.5">Part Number</th>
                      <th className="py-2.5 px-3.5 text-right">Qty</th>
                      <th className="py-2.5 px-3.5 text-right">Unit Price</th>
                      <th className="py-2.5 px-3.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {activeGeneratedQuote.items.map((it, idx) => (
                      <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50'}>
                        <td className="py-2.5 px-3.5 text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className={`py-2.5 px-3.5 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {it.partName}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-400">
                          {it.partNumber}
                        </td>
                        <td className={`py-2.5 px-3.5 text-right font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {it.quantity}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono text-slate-400">
                          ${it.unitPrice.toFixed(2)}
                        </td>
                        <td className={`py-2.5 px-3.5 text-right font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          ${it.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex justify-end">
                <div className={`w-64 rounded-xl border p-4 space-y-1.5 shadow-xs ${
                  isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                }`}>
                  <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>Subtotal:</span>
                    <span className={`font-mono font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      ${activeGeneratedQuote.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>B2B Wholesale Exemption:</span>
                    <span className="font-mono text-slate-500">$0.00</span>
                  </div>
                  <div className={`flex justify-between font-bold border-t pt-2 text-sm ${
                    isDark ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-900'
                  }`}>
                    <span>Total Amount:</span>
                    <span className="font-mono text-blue-500 text-base">${activeGeneratedQuote.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Bar (Download PDF & Edit Quote + Draft Email with AI) */}
            <div className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEditQuote}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 size={13} className="text-slate-400" />
                  <span>Edit Quote</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF(activeGeneratedQuote)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Download size={13} className="text-slate-400" />
                  <span>Download PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    saveQuoteToState(activeGeneratedQuote, 'Approved');
                    setIsQuotePreviewModalOpen(false);
                    setCurrentScreen('quotes');
                  }}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  Save & Close
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDraftEmail(activeGeneratedQuote)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Sparkles size={13} className="text-blue-200" />
                  <span>Draft Email with AI →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI FEATURE 2: AI EMAIL & COMMUNICATION ASSISTANT MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden my-8 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/60 border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Mail size={15} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    AI Communication Assistant
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automated client email composition with attached PDF quotation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Email Composition Form */}
            <div className="p-6 space-y-4 text-xs">
              {/* To (customer email) */}
              <div>
                <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  To (Customer Email):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-md border whitespace-nowrap ${
                    isDark ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    Verified
                  </span>
                </div>
              </div>

              {/* Subject (automatically generated) */}
              <div>
                <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50/50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Quotation attachment card */}
              <div>
                <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Quotation Attachment:
                </label>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                      isDark ? 'bg-red-950/50 text-red-400 border border-red-800/50' : 'bg-red-50 text-red-600'
                    }`}>
                      PDF
                    </div>
                    <div>
                      <div className={`font-semibold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Quotation_{attachedQuoteId || 'Q-104'}.pdf
                      </div>
                      <div className="text-[11px] text-slate-400">42 KB • Official certified estimate</div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold border px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isDark ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <Check size={11} /> Attached
                  </span>
                </div>
              </div>

              {/* AI Instruction Input Field */}
              <div className={`p-3.5 rounded-xl border space-y-2 ${
                isDark ? 'border-indigo-900/50 bg-indigo-950/20' : 'border-indigo-100 bg-indigo-50/40'
              }`}>
                <label className={`block font-bold text-xs flex items-center justify-between ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span>What would you like to communicate?</span>
                  <span className="text-[10px] text-indigo-400 font-medium">Prompt Guidance</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailInstruction}
                    onChange={(e) => setEmailInstruction(e.target.value)}
                    placeholder="e.g. Include 5% volume discount, mention 24h express dispatch, or net terms"
                    className={`flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateEmailWithInstruction}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
                  >
                    <Sparkles size={13} />
                    <span>Generate Email</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5 flex-wrap">
                  <span className="font-medium">Quick chips:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInstruction('Offer 5% discount if approved by end of this week');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 underline"
                  >
                    "5% discount this week"
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInstruction('Mention free courier dispatch for shop replenishment');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 underline"
                  >
                    "Free courier delivery"
                  </button>
                </div>
              </div>

              {/* Email Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block font-semibold text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Email Body (Professionally Drafted by AI):
                  </label>
                  <span className="text-[10px] text-slate-400">Directly editable draft</span>
                </div>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className={`w-full p-3.5 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Modal Actions */}
              <div className={`pt-3 border-t flex items-center justify-between ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleRegenerateEmail}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                    title="Cycle through alternative AI drafted variations"
                  >
                    <RefreshCw size={13} className="text-slate-400" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Send size={13} />
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
