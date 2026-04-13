// ─── EmailJS Configuration ───
// Replace these values with your actual EmailJS credentials
eexport const EMAILJS_CONFIG = {
  serviceId: 'service_z8ih5ca',
  publicKey: 'oVeCEKCpUsDe3_ba2',
  templates: {
    owner: 'template_z08r5pq',
    tenant: 'template_z08r5pq',
    investor: 'template_z08r5pq',
    broker: 'template_z08r5pq',
    vendor: 'template_z08r5pq',
    general: 'template_z08r5pq',
  },
  confirmationTemplate: 'template_z08r5pq',
  routing: {
    owner: 'sclements@agmrealestategroup.com',
    tenant_residential: 'sclements@agmrealestategroup.com',
    tenant_commercial: 'sclements@agmrealestategroup.com',
    investor: 'sclements@agmrealestategroup.com',
    broker: 'sclements@agmrealestategroup.com',
    vendor: 'sclements@agmrealestategroup.com',
    general: 'sclements@agmrealestategroup.com',
  },
}
// ─── Segments ───
export const SEGMENTS = [
  { id: 'owner', label: 'Property Owner', subtitle: 'Management, advisory & investment services', num: '01' },
  { id: 'tenant', label: 'Current Tenant', subtitle: 'Residential, commercial & HOA residents', num: '02' },
  { id: 'investor', label: 'Investor', subtitle: 'Capital deployment & partnerships', num: '03' },
  { id: 'broker', label: 'Broker / Agent', subtitle: 'Referrals & co-brokerage', num: '04' },
  { id: 'vendor', label: 'Vendor / Contractor', subtitle: 'Service provider inquiries', num: '05' },
  { id: 'general', label: 'General Inquiry', subtitle: 'All other questions', num: '06' },
]

// ─── Per-Segment Response Times ───
export const RESPONSE_TIMES = {
  owner: 'A member of our management team will reach out within 1 business day.',
  tenant: 'Our property management team will respond within 4 hours during business hours.',
  tenant_emergency: 'For the emergency you reported, our on-call team has been notified and will contact you as soon as possible.',
  investor: 'A member of our investment team will reach out within 1–2 business days.',
  broker: 'Our brokerage team will follow up within 1 business day.',
  vendor: 'Our operations team will review your inquiry within 2–3 business days.',
  general: "We'll direct your message to the right team. Expect a response within 1–2 business days.",
}

// ─── Segment-Specific Form Fields ───
export const SEGMENT_FIELDS = {
  owner: {
    heading: 'Tell Us About Your Property',
    sub: "We'll match you with the right services and team.",
    fields: [
      { id: 'propertyType', label: 'Property Type', type: 'select', required: true, options: ['Multifamily', 'Commercial / Office', 'Retail', 'Mixed-Use', 'HOA / Condominium', 'Single Family', 'Industrial / Flex', 'Other'] },
      { id: 'services', label: 'Services of Interest', type: 'multiselect', required: true, options: ['Property Management', 'Accounting & Financial Reporting', 'Construction & Facilities', 'Advisory & Planning', 'Acquisition / Disposition', 'Capital Partnerships', 'Ground-Up Development', "Not Sure Yet — Let's Discuss"] },
      { id: 'unitCount', label: 'Approximate Unit / SF Count', type: 'text', placeholder: 'e.g. 48 units, 12,000 SF' },
      { id: 'location', label: 'Property Location', type: 'text', placeholder: 'City, State or Neighborhood', required: true },
      { id: 'timeline', label: 'Timeline', type: 'select', options: ['Immediate Need', 'Within 30 Days', 'Within 90 Days', 'Exploring Options'] },
      { id: 'message', label: 'Additional Details', type: 'textarea', placeholder: 'Goals, current challenges, or anything else we should know.' },
      { id: 'attachment', label: 'Attach a File (optional)', type: 'file', hint: 'Property details, financials, or other relevant documents' },
    ],
  },

  tenant: {
    heading: 'How Can We Help?',
    sub: "Tell us about your request and we'll get it to the right person.",
    showEmergency: true,
    fields: [
      { id: 'tenantType', label: 'I am a...', type: 'select', required: true, options: ['Residential Tenant (Apartment / Multifamily)', 'Commercial Tenant (Office / Retail / Flex)', 'HOA Resident / Homeowner'] },
      { id: 'reason', label: 'Reason for Contact', type: 'select', required: true, options: ['Maintenance Request', 'Lease Question', 'Rent / Payment Inquiry', 'Noise or Neighbor Concern', 'Move-In / Move-Out', 'General Question', 'Complaint', 'Compliment or Feedback'] },
      { id: 'urgency', label: 'Urgency Level', type: 'select', required: true, options: ['Emergency (flooding, fire, no heat/AC, gas leak)', 'Urgent (needs attention within 24 hours)', 'Standard (within a few days is fine)', 'Low Priority / Informational'], conditionalOn: { field: 'reason', values: ['Maintenance Request'] } },
      { id: 'propertyName', label: 'Property Name or Address', type: 'text', placeholder: 'e.g. Fremont Village, 123 Main St', required: true },
      { id: 'unitSuite', label: 'Unit / Suite Number', type: 'text', placeholder: 'e.g. Apt 301 or Suite 400', required: true },
      { id: 'message', label: 'Describe Your Request', type: 'textarea', placeholder: 'Please provide as much detail as possible.', required: true },
      { id: 'attachment', label: 'Attach a Photo or File (optional)', type: 'file', hint: 'Photos of the issue, lease documents, etc.' },
    ],
  },

  investor: {
    heading: 'Investment Inquiry',
    sub: 'Share your interests and our team will reach out to discuss opportunities.',
    fields: [
      { id: 'interest', label: 'Area of Interest', type: 'multiselect', required: true, options: ['Co-Investment / Capital Partnership', 'Advisory & Planning', 'Acquisition Opportunities', 'Disposition Support', 'Ground-Up Development', '1031 Exchange', 'General Investment Discussion'] },
      { id: 'investorType', label: 'Investor Profile', type: 'select', required: true, options: ['Individual / Family Office', 'Private Equity / Fund', 'Institutional', 'REIT', 'International Investor', 'Other / Prefer Not to Say'] },
      { id: 'assetFocus', label: 'Preferred Asset Types', type: 'multiselect', options: ['Multifamily', 'Commercial / Office', 'Retail', 'Mixed-Use', 'Development Land', 'Industrial', 'Flexible / Open'] },
      { id: 'geography', label: 'Geographic Focus', type: 'text', placeholder: 'e.g. Seattle Metro, Pacific Northwest, National' },
      { id: 'message', label: 'Tell Us About Your Objectives', type: 'textarea', placeholder: 'Investment goals, timeline, target return profile, or any other context.' },
      { id: 'attachment', label: 'Attach a File (optional)', type: 'file', hint: 'Investment brief, LOI, or other materials' },
    ],
  },

  broker: {
    heading: 'Broker & Agent Inquiries',
    sub: "Whether you have a referral or want to explore partnership, we'd like to hear from you.",
    fields: [
      { id: 'reason', label: 'Reason for Contact', type: 'select', required: true, options: ['Listing Referral', 'Partnership / Co-Brokerage', 'Market Information Request', 'Client Introduction', 'Lee & Associates Network', 'Other'] },
      { id: 'brokerage', label: 'Brokerage / Firm', type: 'text', placeholder: 'Your firm name', required: true },
      { id: 'licenseState', label: 'Licensed In', type: 'text', placeholder: 'e.g. Washington, Oregon' },
      { id: 'message', label: 'Details', type: 'textarea', placeholder: 'Property details, client needs, or how we can work together.', required: true },
      { id: 'attachment', label: 'Attach a File (optional)', type: 'file', hint: 'Listing sheets, property details, etc.' },
    ],
  },

  vendor: {
    heading: 'Vendor & Contractor Inquiries',
    sub: 'Interested in working with AGM? Let us know about your services.',
    fields: [
      { id: 'reason', label: 'Inquiry Type', type: 'select', required: true, options: ['New Vendor Application', 'Existing Vendor — Invoice or Payment', 'Existing Vendor — Scope Question', 'Insurance / Compliance Update', 'General Inquiry'] },
      { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Your company name', required: true },
      { id: 'serviceType', label: 'Service Category', type: 'select', required: true, options: ['Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Janitorial / Cleaning', 'Roofing', 'Painting', 'General Contracting', 'Security', 'Pest Control', 'Other'], conditionalOn: { field: 'reason', values: ['New Vendor Application'] } },
      { id: 'message', label: 'Additional Information', type: 'textarea', placeholder: 'Service details, coverage area, or other relevant info.' },
      { id: 'attachment', label: 'Attach a File (optional)', type: 'file', hint: 'Insurance certificates, W-9, or company info' },
    ],
  },

  general: {
    heading: 'Get in Touch',
    sub: "Send us a message and we'll direct it to the right team.",
    fields: [
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this regarding?', required: true },
      { id: 'message', label: 'Message', type: 'textarea', placeholder: 'How can we help?', required: true },
      { id: 'attachment', label: 'Attach a File (optional)', type: 'file' },
    ],
  },
}
