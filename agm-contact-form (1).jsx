import { useState, useRef, useCallback } from "react";

// ─── EmailJS Configuration ───
const EMAILJS_CONFIG = {
  serviceId: "YOUR_SERVICE_ID",
  publicKey: "YOUR_PUBLIC_KEY",
  templates: {
    owner: "template_owner",
    tenant: "template_tenant",
    investor: "template_investor",
    broker: "template_broker",
    vendor: "template_vendor",
    general: "template_general",
  },
  confirmationTemplate: "template_confirmation", // auto-reply to submitter
  routing: {
    owner: "brokerage@agmrealestategroup.com",
    tenant_residential: "propertymanagement@agmrealestategroup.com",
    tenant_commercial: "commercial@agmrealestategroup.com",
    investor: "investments@agmrealestategroup.com",
    broker: "brokerage@agmrealestategroup.com",
    vendor: "operations@agmrealestategroup.com",
    general: "info@agmrealestategroup.com",
  },
};

// ─── Consolidated Segments (6 — down from 8) ───
const SEGMENTS = [
  { id: "owner", label: "Property Owner", subtitle: "Management, advisory & investment services", num: "01" },
  { id: "tenant", label: "Current Tenant", subtitle: "Residential, commercial & HOA residents", num: "02" },
  { id: "investor", label: "Investor", subtitle: "Capital deployment & partnerships", num: "03" },
  { id: "broker", label: "Broker / Agent", subtitle: "Referrals & co-brokerage", num: "04" },
  { id: "vendor", label: "Vendor / Contractor", subtitle: "Service provider inquiries", num: "05" },
  { id: "general", label: "General Inquiry", subtitle: "All other questions", num: "06" },
];

// ─── Per-Segment Response Times ───
const RESPONSE_TIMES = {
  owner: "A member of our management team will reach out within 1 business day.",
  tenant: "Our property management team will respond within 4 hours during business hours.",
  tenant_emergency: "For the emergency you reported, our on-call team has been notified and will contact you as soon as possible.",
  investor: "A member of our investment team will reach out within 1–2 business days.",
  broker: "Our brokerage team will follow up within 1 business day.",
  vendor: "Our operations team will review your inquiry within 2–3 business days.",
  general: "We'll direct your message to the right team. Expect a response within 1–2 business days.",
};

// ─── Segment-Specific Fields ───
// Flow: Step 1 (pick segment) → Step 2 (details + optional file) → Step 3 (contact info) → Success
const SEGMENT_FIELDS = {
  owner: {
    heading: "Tell Us About Your Property",
    sub: "We'll match you with the right services and team.",
    fields: [
      { id: "propertyType", label: "Property Type", type: "select", required: true, options: ["Multifamily", "Commercial / Office", "Retail", "Mixed-Use", "HOA / Condominium", "Single Family", "Industrial / Flex", "Other"] },
      { id: "services", label: "Services of Interest", type: "multiselect", required: true, options: ["Property Management", "Accounting & Financial Reporting", "Construction & Facilities", "Advisory & Planning", "Acquisition / Disposition", "Capital Partnerships", "Ground-Up Development", "Not Sure Yet — Let's Discuss"] },
      { id: "unitCount", label: "Approximate Unit / SF Count", type: "text", placeholder: "e.g. 48 units, 12,000 SF" },
      { id: "location", label: "Property Location", type: "text", placeholder: "City, State or Neighborhood", required: true },
      { id: "timeline", label: "Timeline", type: "select", options: ["Immediate Need", "Within 30 Days", "Within 90 Days", "Exploring Options"] },
      { id: "message", label: "Additional Details", type: "textarea", placeholder: "Goals, current challenges, or anything else we should know." },
      { id: "attachment", label: "Attach a File (optional)", type: "file", hint: "Property details, financials, or other relevant documents" },
    ],
  },

  tenant: {
    heading: "How Can We Help?",
    sub: "Tell us about your request and we'll get it to the right person.",
    showEmergency: true,
    fields: [
      { id: "tenantType", label: "I am a...", type: "select", required: true, options: ["Residential Tenant (Apartment / Multifamily)", "Commercial Tenant (Office / Retail / Flex)", "HOA Resident / Homeowner"] },
      { id: "reason", label: "Reason for Contact", type: "select", required: true, options: ["Maintenance Request", "Lease Question", "Rent / Payment Inquiry", "Noise or Neighbor Concern", "Move-In / Move-Out", "General Question", "Complaint", "Compliment or Feedback"] },
      { id: "urgency", label: "Urgency Level", type: "select", required: true, options: ["Emergency (flooding, fire, no heat/AC, gas leak)", "Urgent (needs attention within 24 hours)", "Standard (within a few days is fine)", "Low Priority / Informational"], conditionalOn: { field: "reason", values: ["Maintenance Request"] } },
      { id: "propertyName", label: "Property Name or Address", type: "text", placeholder: "e.g. Fremont Village, 123 Main St", required: true },
      { id: "unitSuite", label: "Unit / Suite Number", type: "text", placeholder: "e.g. Apt 301 or Suite 400", required: true },
      { id: "message", label: "Describe Your Request", type: "textarea", placeholder: "Please provide as much detail as possible.", required: true },
      { id: "attachment", label: "Attach a Photo or File (optional)", type: "file", hint: "Photos of the issue, lease documents, etc." },
    ],
  },

  investor: {
    heading: "Investment Inquiry",
    sub: "Share your interests and our team will reach out to discuss opportunities.",
    fields: [
      { id: "interest", label: "Area of Interest", type: "multiselect", required: true, options: ["Co-Investment / Capital Partnership", "Advisory & Planning", "Acquisition Opportunities", "Disposition Support", "Ground-Up Development", "1031 Exchange", "General Investment Discussion"] },
      { id: "investorType", label: "Investor Profile", type: "select", required: true, options: ["Individual / Family Office", "Private Equity / Fund", "Institutional", "REIT", "International Investor", "Other / Prefer Not to Say"] },
      { id: "assetFocus", label: "Preferred Asset Types", type: "multiselect", options: ["Multifamily", "Commercial / Office", "Retail", "Mixed-Use", "Development Land", "Industrial", "Flexible / Open"] },
      { id: "geography", label: "Geographic Focus", type: "text", placeholder: "e.g. Seattle Metro, Pacific Northwest, National" },
      { id: "message", label: "Tell Us About Your Objectives", type: "textarea", placeholder: "Investment goals, timeline, target return profile, or any other context." },
      { id: "attachment", label: "Attach a File (optional)", type: "file", hint: "Investment brief, LOI, or other materials" },
    ],
  },

  broker: {
    heading: "Broker & Agent Inquiries",
    sub: "Whether you have a referral or want to explore partnership, we'd like to hear from you.",
    fields: [
      { id: "reason", label: "Reason for Contact", type: "select", required: true, options: ["Listing Referral", "Partnership / Co-Brokerage", "Market Information Request", "Client Introduction", "Lee & Associates Network", "Other"] },
      { id: "brokerage", label: "Brokerage / Firm", type: "text", placeholder: "Your firm name", required: true },
      { id: "licenseState", label: "Licensed In", type: "text", placeholder: "e.g. Washington, Oregon" },
      { id: "message", label: "Details", type: "textarea", placeholder: "Property details, client needs, or how we can work together.", required: true },
      { id: "attachment", label: "Attach a File (optional)", type: "file", hint: "Listing sheets, property details, etc." },
    ],
  },

  vendor: {
    heading: "Vendor & Contractor Inquiries",
    sub: "Interested in working with AGM? Let us know about your services.",
    fields: [
      { id: "reason", label: "Inquiry Type", type: "select", required: true, options: ["New Vendor Application", "Existing Vendor — Invoice or Payment", "Existing Vendor — Scope Question", "Insurance / Compliance Update", "General Inquiry"] },
      { id: "companyName", label: "Company Name", type: "text", placeholder: "Your company name", required: true },
      { id: "serviceType", label: "Service Category", type: "select", required: true, options: ["Plumbing", "Electrical", "HVAC", "Landscaping", "Janitorial / Cleaning", "Roofing", "Painting", "General Contracting", "Security", "Pest Control", "Other"], conditionalOn: { field: "reason", values: ["New Vendor Application"] } },
      { id: "message", label: "Additional Information", type: "textarea", placeholder: "Service details, coverage area, or other relevant info." },
      { id: "attachment", label: "Attach a File (optional)", type: "file", hint: "Insurance certificates, W-9, or company info" },
    ],
  },

  general: {
    heading: "Get in Touch",
    sub: "Send us a message and we'll direct it to the right team.",
    fields: [
      { id: "subject", label: "Subject", type: "text", placeholder: "What is this regarding?", required: true },
      { id: "message", label: "Message", type: "textarea", placeholder: "How can we help?", required: true },
      { id: "attachment", label: "Attach a File (optional)", type: "file" },
    ],
  },
};

// ─── CSS ───
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');

  :root {
    --black: #111;
    --gray-900: #222;
    --gray-800: #333;
    --gray-700: #444;
    --gray-600: #666;
    --gray-500: #888;
    --gray-400: #aaa;
    --gray-300: #ccc;
    --gray-200: #e2e2e2;
    --gray-100: #f0f0f0;
    --gray-50: #f7f7f7;
    --white: #fff;
    --red: #c44;
    --red-bg: #fef6f6;
    --red-border: #f0d0d0;
    --ease: cubic-bezier(0.4, 0, 0.2, 1);
    --bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .root {
    font-family: 'DM Sans', sans-serif;
    background: var(--white);
    min-height: 100vh;
    color: var(--black);
    -webkit-font-smoothing: antialiased;
  }

  .hdr {
    padding: 28px 32px 0;
    display: flex; justify-content: space-between; align-items: flex-start;
    opacity: 0; animation: fadeIn 0.5s var(--ease) 0.05s forwards;
  }
  .hdr-brand { font-weight: 600; font-size: 14px; letter-spacing: 0.3px; color: var(--black); }
  .hdr-right { font-size: 12px; color: var(--gray-500); text-align: right; line-height: 1.7; }
  .hdr-right a { color: var(--black); text-decoration: none; border-bottom: 1px solid var(--gray-200); transition: border-color 0.2s; }
  .hdr-right a:hover { border-color: var(--black); }

  .prog { margin: 20px 32px 0; height: 1px; background: var(--gray-100); position: relative; }
  .prog-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--black); transition: width 0.6s var(--ease); }

  .content { max-width: 680px; margin: 0 auto; padding: 44px 32px 64px; }

  .step { opacity: 0; transform: translateY(14px); animation: stepIn 0.4s var(--ease) forwards; }
  .step-out { animation: stepOut 0.2s var(--ease) forwards; }
  @keyframes stepIn { to { opacity: 1; transform: translateY(0); } }
  @keyframes stepOut { to { opacity: 0; transform: translateY(-8px); } }
  @keyframes fadeIn { to { opacity: 1; } }

  /* ─── Step 1 ─── */
  .s1-kicker { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gray-400); margin-bottom: 12px; }
  .s1-title { font-family: 'Instrument Serif', serif; font-weight: 400; font-size: 40px; line-height: 1.1; color: var(--black); margin-bottom: 8px; letter-spacing: -0.5px; }
  .s1-sub { font-size: 15px; color: var(--gray-500); margin-bottom: 40px; line-height: 1.55; max-width: 460px; }

  .seg-list { display: flex; flex-direction: column; border-top: 1px solid var(--gray-200); }
  .seg-row {
    display: grid; grid-template-columns: 32px 1fr 24px; align-items: center;
    padding: 20px 12px; margin: 0 -12px;
    border-bottom: 1px solid var(--gray-200);
    cursor: pointer; border-radius: 6px;
    transition: background 0.18s var(--ease);
    opacity: 0; transform: translateY(6px); animation: rowIn 0.35s var(--ease) forwards;
  }
  .seg-row:hover { background: var(--gray-50); }
  .seg-row:active { background: var(--gray-100); }
  @keyframes rowIn { to { opacity: 1; transform: translateY(0); } }

  .seg-num { font-size: 11px; font-weight: 500; color: var(--gray-300); font-variant-numeric: tabular-nums; transition: color 0.18s; }
  .seg-row:hover .seg-num { color: var(--black); }
  .seg-name { font-size: 16px; font-weight: 500; color: var(--black); }
  .seg-desc { font-size: 13px; color: var(--gray-400); margin-top: 2px; transition: color 0.18s; }
  .seg-row:hover .seg-desc { color: var(--gray-600); }
  .seg-arrow { width: 18px; height: 18px; color: var(--gray-300); justify-self: end; transition: color 0.18s, transform 0.22s var(--ease); }
  .seg-row:hover .seg-arrow { color: var(--black); transform: translateX(3px); }

  .seg-careers { 
    margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--gray-100);
    font-size: 13px; color: var(--gray-400);
  }
  .seg-careers a { color: var(--gray-600); text-decoration: none; border-bottom: 1px solid var(--gray-200); font-weight: 500; transition: all 0.15s; }
  .seg-careers a:hover { color: var(--black); border-color: var(--black); }

  /* ─── Emergency Banner ─── */
  .emergency-banner {
    background: var(--red-bg);
    border: 1px solid var(--red-border);
    border-radius: 6px;
    padding: 16px 20px;
    margin-bottom: 28px;
    display: flex; align-items: flex-start; gap: 12px;
    opacity: 0; animation: fadeIn 0.35s var(--ease) 0.1s forwards;
  }
  .emergency-icon {
    flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px;
    color: var(--red);
  }
  .emergency-text { font-size: 13px; line-height: 1.55; color: var(--gray-800); }
  .emergency-text strong { font-weight: 600; }
  .emergency-text a { color: var(--black); font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--black); }

  /* ─── Back nav ─── */
  .back-row { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    color: var(--gray-500); background: none; border: none; cursor: pointer;
    padding: 4px 0; transition: color 0.15s;
  }
  .back-btn:hover { color: var(--black); }
  .back-btn svg { width: 15px; height: 15px; transition: transform 0.2s var(--ease); }
  .back-btn:hover svg { transform: translateX(-2px); }
  .back-sep { color: var(--gray-200); font-size: 13px; }
  .back-label { font-size: 13px; font-weight: 500; color: var(--black); }

  .sec-title { font-family: 'Instrument Serif', serif; font-weight: 400; font-size: 28px; color: var(--black); margin-bottom: 6px; letter-spacing: -0.3px; line-height: 1.2; }
  .sec-sub { font-size: 14px; color: var(--gray-500); margin-bottom: 32px; line-height: 1.55; }

  /* ─── Fields ─── */
  .fg { margin-bottom: 22px; opacity: 0; transform: translateY(6px); animation: fieldIn 0.3s var(--ease) forwards; }
  @keyframes fieldIn { to { opacity: 1; transform: translateY(0); } }

  .fl { display: block; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--gray-600); margin-bottom: 8px; }
  .fl .req { color: var(--gray-400); margin-left: 2px; }

  .fi, .fs, .ft {
    width: 100%; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 400;
    color: var(--black); background: var(--white);
    border: 1px solid var(--gray-200); border-radius: 3px;
    padding: 12px 14px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .fi:focus, .fs:focus, .ft:focus { border-color: var(--black); box-shadow: 0 0 0 2px rgba(0,0,0,0.04); }
  .fi::placeholder, .ft::placeholder { color: var(--gray-300); }
  .fs {
    appearance: none; cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
  }
  .ft { min-height: 100px; resize: vertical; line-height: 1.6; }
  .f-err { border-color: var(--red) !important; }
  .f-err-txt { font-size: 11px; color: var(--red); margin-top: 5px; font-weight: 500; }

  /* ─── File Upload ─── */
  .file-zone {
    border: 1.5px dashed var(--gray-200);
    border-radius: 6px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
  }
  .file-zone:hover { border-color: var(--gray-400); background: var(--gray-50); }
  .file-zone.has-file { border-color: var(--black); border-style: solid; background: var(--gray-50); }
  .file-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .file-zone-icon { color: var(--gray-300); margin-bottom: 8px; }
  .file-zone:hover .file-zone-icon { color: var(--gray-500); }
  .file-zone-text { font-size: 13px; color: var(--gray-500); }
  .file-zone-text span { color: var(--black); font-weight: 500; border-bottom: 1px solid var(--gray-300); }
  .file-zone-hint { font-size: 11px; color: var(--gray-400); margin-top: 4px; }
  .file-name { font-size: 13px; font-weight: 500; color: var(--black); }
  .file-size { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
  .file-remove {
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    color: var(--red); background: none; border: none; cursor: pointer;
    margin-top: 6px; padding: 2px 0; border-bottom: 1px solid transparent;
    transition: border-color 0.15s;
  }
  .file-remove:hover { border-color: var(--red); }

  /* ─── Chips ─── */
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    padding: 8px 16px; border: 1px solid var(--gray-200); border-radius: 100px;
    background: var(--white); color: var(--gray-600); cursor: pointer;
    transition: all 0.15s var(--ease); user-select: none;
  }
  .chip:hover { border-color: var(--gray-500); color: var(--black); }
  .chip-on { background: var(--black); border-color: var(--black); color: var(--white); }
  .chip-on:hover { background: var(--gray-800); border-color: var(--gray-800); color: var(--white); }
  .chip:active { transform: scale(0.96); }

  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 520px) { .row2 { grid-template-columns: 1fr; } }

  .btn-row { display: flex; justify-content: space-between; align-items: center; margin-top: 36px; }
  .btn-p {
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
    background: var(--black); color: var(--white); border: none; border-radius: 3px;
    padding: 14px 36px; cursor: pointer; position: relative; overflow: hidden;
    transition: background 0.15s, transform 0.12s, box-shadow 0.2s;
  }
  .btn-p:hover { background: var(--gray-800); box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-1px); }
  .btn-p:active { transform: translateY(0); }
  .btn-p:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-s {
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    background: none; border: 1px solid var(--gray-200); border-radius: 3px;
    padding: 12px 20px; color: var(--gray-500); cursor: pointer; transition: all 0.15s;
  }
  .btn-s:hover { border-color: var(--gray-400); color: var(--black); }

  .btn-ld { pointer-events: none; }
  .btn-ld .btn-txt { opacity: 0; }
  .btn-ld .spin { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); margin: 0 3px; animation: pulse 1.2s infinite ease-in-out; }
  .dot:nth-child(2) { animation-delay: 0.15s; }
  .dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes pulse { 0%, 80%, 100% { opacity: 0.2; transform: scale(0.7); } 40% { opacity: 1; transform: scale(1); } }

  /* ─── Success ─── */
  .ok { text-align: center; padding: 56px 0 32px; }
  .ok-circle {
    width: 52px; height: 52px; border-radius: 50%; background: var(--black);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px; opacity: 0; transform: scale(0.5);
    animation: pop 0.45s var(--bounce) 0.1s forwards;
  }
  @keyframes pop { to { opacity: 1; transform: scale(1); } }
  .ok-circle svg { width: 22px; height: 22px; stroke: var(--white); stroke-dasharray: 30; stroke-dashoffset: 30; animation: draw 0.35s ease 0.4s forwards; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  .ok-h { font-family: 'Instrument Serif', serif; font-size: 26px; color: var(--black); margin-bottom: 10px; opacity: 0; animation: up 0.35s var(--ease) 0.45s forwards; }
  .ok-p { font-size: 15px; color: var(--gray-500); line-height: 1.6; max-width: 440px; margin: 0 auto 12px; opacity: 0; animation: up 0.35s var(--ease) 0.55s forwards; }
  .ok-timeline { font-size: 14px; font-weight: 500; color: var(--black); margin-bottom: 32px; opacity: 0; animation: up 0.35s var(--ease) 0.6s forwards; }
  .ok-confirm { font-size: 13px; color: var(--gray-400); background: var(--gray-50); border-radius: 6px; padding: 14px 20px; max-width: 400px; margin: 0 auto 28px; opacity: 0; animation: up 0.35s var(--ease) 0.65s forwards; }
  .ok-d { font-size: 13px; color: var(--gray-400); border-top: 1px solid var(--gray-100); padding-top: 24px; opacity: 0; animation: up 0.35s var(--ease) 0.7s forwards; }
  .ok-d strong { color: var(--black); font-weight: 600; }
  .ok-d a { color: var(--gray-600); text-decoration: none; font-weight: 500; border-bottom: 1px solid var(--gray-200); }
  .ok-d a:hover { color: var(--black); border-color: var(--black); }
  .ok-btn { margin-top: 24px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; background: none; border: 1px solid var(--gray-200); border-radius: 3px; padding: 10px 20px; color: var(--gray-500); cursor: pointer; transition: all 0.15s; opacity: 0; animation: up 0.35s var(--ease) 0.8s forwards; }
  .ok-btn:hover { border-color: var(--black); color: var(--black); }
  @keyframes up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .ftr { text-align: center; padding: 0 32px 36px; font-size: 12px; color: var(--gray-400); line-height: 1.8; }
  .ftr a { color: var(--gray-600); text-decoration: none; border-bottom: 1px solid transparent; transition: all 0.15s; }
  .ftr a:hover { color: var(--black); border-color: var(--gray-300); }
  .ftr-sep { margin: 0 8px; color: var(--gray-200); }
`;

// ─── Icons ───
const ArrowL = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ArrowR = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckSvg = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 12 10 16 18 8"/></svg>;
const PhoneIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const UploadIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

// ─── File Upload Component ───
function FileUpload({ field, file, onFileChange, idx }) {
  const inputRef = useRef(null);
  const delay = `${(idx || 0) * 50}ms`;

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFileChange(f);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="fg" style={{ animationDelay: delay }}>
      <label className="fl">{field.label}</label>
      <div className={`file-zone ${file ? "has-file" : ""}`} onClick={() => !file && inputRef.current?.click()}>
        {!file && (
          <>
            <input ref={inputRef} type="file" onChange={handleChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.heic,.txt,.csv" />
            <div className="file-zone-icon"><UploadIcon /></div>
            <div className="file-zone-text"><span>Choose a file</span> or drag it here</div>
            {field.hint && <div className="file-zone-hint">{field.hint}</div>}
          </>
        )}
        {file && (
          <>
            <div className="file-name">{file.name}</div>
            <div className="file-size">{formatSize(file.size)}</div>
            <button type="button" className="file-remove" onClick={(e) => { e.stopPropagation(); onFileChange(null); }}>Remove</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Field Renderer ───
function Field({ field, value, onChange, error, formData, idx }) {
  if (field.conditionalOn) {
    const dep = formData[field.conditionalOn.field];
    if (!field.conditionalOn.values.includes(dep)) return null;
  }
  const delay = `${(idx || 0) * 50}ms`;

  if (field.type === "file") return null; // handled separately

  if (field.type === "select") {
    return (
      <div className="fg" style={{ animationDelay: delay }}>
        <label className="fl">{field.label}{field.required && <span className="req">*</span>}</label>
        <select className={`fs ${error ? "f-err" : ""}`} value={value || ""} onChange={e => onChange(field.id, e.target.value)}>
          <option value="">Select...</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <div className="f-err-txt">{error}</div>}
      </div>
    );
  }
  if (field.type === "multiselect") {
    const sel = value || [];
    const toggle = o => onChange(field.id, sel.includes(o) ? sel.filter(s => s !== o) : [...sel, o]);
    return (
      <div className="fg" style={{ animationDelay: delay }}>
        <label className="fl">{field.label}{field.required && <span className="req">*</span>}</label>
        <div className="chips">
          {field.options.map(o => (
            <button key={o} type="button" className={`chip ${sel.includes(o) ? "chip-on" : ""}`} onClick={() => toggle(o)}>{o}</button>
          ))}
        </div>
        {error && <div className="f-err-txt">{error}</div>}
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="fg" style={{ animationDelay: delay }}>
        <label className="fl">{field.label}{field.required && <span className="req">*</span>}</label>
        <textarea className={`ft ${error ? "f-err" : ""}`} value={value || ""} onChange={e => onChange(field.id, e.target.value)} placeholder={field.placeholder || ""}/>
        {error && <div className="f-err-txt">{error}</div>}
      </div>
    );
  }
  return (
    <div className="fg" style={{ animationDelay: delay }}>
      <label className="fl">{field.label}{field.required && <span className="req">*</span>}</label>
      <input type="text" className={`fi ${error ? "f-err" : ""}`} value={value || ""} onChange={e => onChange(field.id, e.target.value)} placeholder={field.placeholder || ""}/>
      {error && <div className="f-err-txt">{error}</div>}
    </div>
  );
}

// ─── Main ───
export default function AGMContactForm() {
  // Flow: 1 = segment, 2 = details, 3 = contact info, 5 = success
  const [step, setStep] = useState(1);
  const [seg, setSeg] = useState(null);
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [data, setData] = useState({});
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);

  const cfg = seg ? SEGMENT_FIELDS[seg] : null;
  const pct = step >= 5 ? 100 : (Math.min(step, 3) / 3) * 100;

  const go = useCallback((n) => {
    setExiting(true);
    setTimeout(() => { setStep(n); setExiting(false); setErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); }, 200);
  }, []);

  const pickSeg = (s) => { setSeg(s); setData({}); setFile(null); go(2); };
  const dChange = (f, v) => { setData(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(p => ({ ...p, [f]: null })); };
  const cChange = (f, v) => { setContact(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(p => ({ ...p, [f]: null })); };

  const isEmergency = seg === "tenant" && data.reason === "Maintenance Request" && data.urgency?.startsWith("Emergency");

  const valDetails = () => {
    const e = {};
    if (!cfg) return true;
    cfg.fields.forEach(f => {
      if (f.type === "file") return;
      if (f.conditionalOn) { const d = data[f.conditionalOn.field]; if (!f.conditionalOn.values.includes(d)) return; }
      if (f.required) {
        const v = data[f.id];
        if (f.type === "multiselect") { if (!v || !v.length) e[f.id] = "Select at least one"; }
        else if (!v || !String(v).trim()) e[f.id] = "Required";
      }
    });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const valContact = () => {
    const e = {};
    if (!contact.firstName.trim()) e.firstName = "Required";
    if (!contact.lastName.trim()) e.lastName = "Required";
    if (!contact.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email = "Invalid email";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!valContact()) return;
    setLoading(true);

    const routingKey = seg === "tenant"
      ? (data.tenantType?.includes("Commercial") ? "tenant_commercial" : "tenant_residential")
      : seg;

    const params = {
      to_email: EMAILJS_CONFIG.routing[routingKey],
      from_name: `${contact.firstName} ${contact.lastName}`,
      from_email: contact.email,
      from_phone: contact.phone || "Not provided",
      segment: SEGMENTS.find(s => s.id === seg)?.label || seg,
      ...data,
      services: Array.isArray(data.services) ? data.services.join(", ") : data.services,
      interest: Array.isArray(data.interest) ? data.interest.join(", ") : data.interest,
      assetFocus: Array.isArray(data.assetFocus) ? data.assetFocus.join(", ") : data.assetFocus,
      has_attachment: file ? `Yes (${file.name})` : "No",
    };

    try {
      // ── Internal routing email ──
      // await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates[seg], params, EMAILJS_CONFIG.publicKey);

      // ── Confirmation auto-reply to submitter ──
      // await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.confirmationTemplate, {
      //   to_email: contact.email,
      //   to_name: contact.firstName,
      //   segment: params.segment,
      //   summary: Object.entries(data).filter(([k]) => k !== 'attachment').map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n'),
      // }, EMAILJS_CONFIG.publicKey);

      await new Promise(r => setTimeout(r, 1500));
      go(5);
    } catch {
      setErrors({ _s: "Something went wrong. Please try again or call 206-622-8600." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSeg(null); setContact({ firstName: "", lastName: "", email: "", phone: "" });
    setData({}); setFile(null); setErrors({}); setLoading(false); go(1);
  };

  const segLabel = SEGMENTS.find(s => s.id === seg)?.label;

  const getResponseTime = () => {
    if (isEmergency) return RESPONSE_TIMES.tenant_emergency;
    return RESPONSE_TIMES[seg] || RESPONSE_TIMES.general;
  };

  const fileField = cfg?.fields.find(f => f.type === "file");

  return (
    <div className="root">
      <style>{css}</style>

      <div className="hdr">
        <div className="hdr-brand">AGM Real Estate Group</div>
        <div className="hdr-right">
          <a href="tel:2066228600">206-622-8600</a><br />
          <a href="mailto:info@agmrealestategroup.com">info@agmrealestategroup.com</a>
        </div>
      </div>

      <div className="prog"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>

      <div className="content">
        <div className={`step ${exiting ? "step-out" : ""}`} key={step}>

          {/* ─── STEP 1: Segment ─── */}
          {step === 1 && (<>
            <div className="s1-kicker">Contact</div>
            <h1 className="s1-title">How can we help?</h1>
            <p className="s1-sub">Select the option that best describes you and we'll connect you with the right team.</p>
            <div className="seg-list">
              {SEGMENTS.map((s, i) => (
                <div key={s.id} className="seg-row" style={{ animationDelay: `${i * 40}ms` }} onClick={() => pickSeg(s.id)} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && pickSeg(s.id)}>
                  <span className="seg-num">{s.num}</span>
                  <div className="seg-info">
                    <div className="seg-name">{s.label}</div>
                    <div className="seg-desc">{s.subtitle}</div>
                  </div>
                  <div className="seg-arrow"><ArrowR /></div>
                </div>
              ))}
            </div>
            <div className="seg-careers">
              Looking for career opportunities? <a href="/careers">Visit our Careers page</a>
            </div>
          </>)}

          {/* ─── STEP 2: Details (now first after segment) ─── */}
          {step === 2 && cfg && (<>
            <div className="back-row">
              <button className="back-btn" onClick={() => go(1)}><ArrowL /> Back</button>
              <span className="back-sep">/</span>
              <span className="back-label">{segLabel}</span>
            </div>

            {/* Emergency banner for tenant path */}
            {cfg.showEmergency && (
              <div className="emergency-banner">
                <div className="emergency-icon"><PhoneIcon /></div>
                <div className="emergency-text">
                  <strong>For emergencies</strong> — flooding, fire, gas leak, or no heat — call us directly at <a href="tel:2066228600">206-622-8600</a> for immediate assistance. Our on-call team is available 24/7.
                </div>
              </div>
            )}

            <h2 className="sec-title">{cfg.heading}</h2>
            <p className="sec-sub">{cfg.sub}</p>

            {cfg.fields.map((f, i) => f.type !== "file" && (
              <Field key={f.id} field={f} value={data[f.id]} onChange={dChange} error={errors[f.id]} formData={data} idx={i} />
            ))}

            {fileField && (
              <FileUpload field={fileField} file={file} onFileChange={setFile} idx={cfg.fields.length} />
            )}

            <div className="btn-row">
              <button className="btn-s" onClick={() => go(1)}>Back</button>
              <button className="btn-p" onClick={() => valDetails() && go(3)}>
                <span className="btn-txt">Continue</span>
              </button>
            </div>
          </>)}

          {/* ─── STEP 3: Contact Info (now last before submit) ─── */}
          {step === 3 && (<>
            <div className="back-row">
              <button className="back-btn" onClick={() => go(2)}><ArrowL /> Back</button>
              <span className="back-sep">/</span>
              <span className="back-label">{segLabel}</span>
              <span className="back-sep">/</span>
              <span className="back-label">Your Info</span>
            </div>

            <h2 className="sec-title">Almost done — who should we reach out to?</h2>
            <p className="sec-sub">We'll send a confirmation to the email address you provide.</p>

            <div className="row2">
              <Field field={{ id: "firstName", label: "First Name", type: "text", required: true, placeholder: "First name" }} value={contact.firstName} onChange={(_, v) => cChange("firstName", v)} error={errors.firstName} formData={{}} idx={0} />
              <Field field={{ id: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Last name" }} value={contact.lastName} onChange={(_, v) => cChange("lastName", v)} error={errors.lastName} formData={{}} idx={1} />
            </div>
            <div className="row2">
              <Field field={{ id: "email", label: "Email", type: "text", required: true, placeholder: "you@company.com" }} value={contact.email} onChange={(_, v) => cChange("email", v)} error={errors.email} formData={{}} idx={2} />
              <Field field={{ id: "phone", label: "Phone (optional)", type: "text", placeholder: "(206) 555-0000" }} value={contact.phone} onChange={(_, v) => cChange("phone", v)} error={errors.phone} formData={{}} idx={3} />
            </div>

            {errors._s && <div className="f-err-txt" style={{ textAlign: "center", marginBottom: 12 }}>{errors._s}</div>}

            <div className="btn-row">
              <button className="btn-s" onClick={() => go(2)}>Back</button>
              <button className={`btn-p ${loading ? "btn-ld" : ""}`} onClick={submit} disabled={loading}>
                <span className="btn-txt">Submit Inquiry</span>
                {loading && <span className="spin"><span className="dot" /><span className="dot" /><span className="dot" /></span>}
              </button>
            </div>
          </>)}

          {/* ─── SUCCESS ─── */}
          {step === 5 && (
            <div className="ok">
              <div className="ok-circle"><CheckSvg /></div>
              <h2 className="ok-h">Inquiry Received</h2>
              <p className="ok-p">
                Thank you, {contact.firstName}. Your message has been routed to the right team.
              </p>
              <div className="ok-timeline">{getResponseTime()}</div>
              <div className="ok-confirm">
                A confirmation has been sent to <strong>{contact.email}</strong> with a summary of your inquiry.
              </div>
              <div className="ok-d">
                Need immediate assistance?<br />
                <strong>206-622-8600</strong>
                <span style={{ margin: "0 8px", color: "var(--gray-200)" }}>|</span>
                <a href="mailto:info@agmrealestategroup.com">info@agmrealestategroup.com</a>
              </div>
              <button className="ok-btn" onClick={reset}>Submit Another Inquiry</button>
            </div>
          )}
        </div>
      </div>

      <div className="ftr">
        <a href="tel:2066228600">206-622-8600</a>
        <span className="ftr-sep">|</span>
        <a href="mailto:info@agmrealestategroup.com">info@agmrealestategroup.com</a>
        <br />
        AGM Real Estate Group, LLC &middot; Seattle, WA &middot; Est. 1977
      </div>
    </div>
  );
}
