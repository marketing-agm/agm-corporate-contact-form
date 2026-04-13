import { useState, useCallback } from 'react'
import { EMAILJS_CONFIG, SEGMENTS, RESPONSE_TIMES, SEGMENT_FIELDS } from './config'
import { ArrowLeft, ArrowRight, CheckIcon, PhoneIcon } from './Icons'
import { Field, FileUpload } from './FormFields'
import emailjs from '@emailjs/browser'

export default function App() {
  // Flow: 1 = segment, 2 = details, 3 = contact info, 5 = success
  const [step, setStep] = useState(1)
  const [seg, setSeg] = useState(null)
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [data, setData] = useState({})
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [exiting, setExiting] = useState(false)

  const cfg = seg ? SEGMENT_FIELDS[seg] : null
  const pct = step >= 5 ? 100 : (Math.min(step, 3) / 3) * 100

  const go = useCallback((n) => {
    setExiting(true)
    setTimeout(() => {
      setStep(n)
      setExiting(false)
      setErrors({})
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  }, [])

  const pickSeg = (s) => {
    setSeg(s)
    setData({})
    setFile(null)
    go(2)
  }

  const dChange = (f, v) => {
    setData((p) => ({ ...p, [f]: v }))
    if (errors[f]) setErrors((p) => ({ ...p, [f]: null }))
  }

  const cChange = (f, v) => {
    setContact((p) => ({ ...p, [f]: v }))
    if (errors[f]) setErrors((p) => ({ ...p, [f]: null }))
  }

  const isEmergency =
    seg === 'tenant' &&
    data.reason === 'Maintenance Request' &&
    data.urgency?.startsWith('Emergency')

  const valDetails = () => {
    const e = {}
    if (!cfg) return true
    cfg.fields.forEach((f) => {
      if (f.type === 'file') return
      if (f.conditionalOn) {
        const d = data[f.conditionalOn.field]
        if (!f.conditionalOn.values.includes(d)) return
      }
      if (f.required) {
        const v = data[f.id]
        if (f.type === 'multiselect') {
          if (!v || !v.length) e[f.id] = 'Select at least one'
        } else if (!v || !String(v).trim()) {
          e[f.id] = 'Required'
        }
      }
    })
    setErrors(e)
    return !Object.keys(e).length
  }

  const valContact = () => {
    const e = {}
    if (!contact.firstName.trim()) e.firstName = 'Required'
    if (!contact.lastName.trim()) e.lastName = 'Required'
    if (!contact.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email = 'Invalid email'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async () => {
    if (!valContact()) return
    setLoading(true)

    const routingKey =
      seg === 'tenant'
        ? data.tenantType?.includes('Commercial')
          ? 'tenant_commercial'
          : 'tenant_residential'
        : seg

    const params = {
      to_email: EMAILJS_CONFIG.routing[routingKey],
      from_name: `${contact.firstName} ${contact.lastName}`,
      from_email: contact.email,
      from_phone: contact.phone || 'Not provided',
      segment: SEGMENTS.find((s) => s.id === seg)?.label || seg,
      ...data,
      services: Array.isArray(data.services) ? data.services.join(', ') : data.services,
      interest: Array.isArray(data.interest) ? data.interest.join(', ') : data.interest,
      assetFocus: Array.isArray(data.assetFocus) ? data.assetFocus.join(', ') : data.assetFocus,
      has_attachment: file ? `Yes (${file.name})` : 'No',
    }

    try {
      const details = Object.entries(data)
        .filter(([k]) => k !== 'attachment')
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\n')

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates[seg],
        { ...params, details },
        EMAILJS_CONFIG.publicKey
      )

      go(5)
    } catch (err) {
      console.error('EmailJS error:', err)
      setErrors({ _s: 'Something went wrong. Please try again or call 206-622-8600.' })
    } finally {
      setLoading(false)
    }

  const reset = () => {
    setSeg(null)
    setContact({ firstName: '', lastName: '', email: '', phone: '' })
    setData({})
    setFile(null)
    setErrors({})
    setLoading(false)
    go(1)
  }

  const segLabel = SEGMENTS.find((s) => s.id === seg)?.label
  const getRespTime = () =>
    isEmergency ? RESPONSE_TIMES.tenant_emergency : RESPONSE_TIMES[seg] || RESPONSE_TIMES.general
  const fileField = cfg?.fields.find((f) => f.type === 'file')

  return (
    <div className="root">
      {/* Header */}
      <div className="hdr">
        <div className="hdr-brand">AGM Real Estate Group</div>
        <div className="hdr-right">
          <a href="tel:2066228600">206-622-8600</a>
          <br />
          <a href="mailto:info@agmrealestategroup.com">info@agmrealestategroup.com</a>
        </div>
      </div>

      {/* Progress */}
      <div className="prog">
        <div className="prog-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Content */}
      <div className="content">
        <div className={`step ${exiting ? 'step-out' : ''}`} key={step}>
          {/* ─── STEP 1: Segment Selection ─── */}
          {step === 1 && (
            <>
              <div className="s1-kicker">Contact</div>
              <h1 className="s1-title">How can we help?</h1>
              <p className="s1-sub">
                Select the option that best describes you and we'll connect you with the right team.
              </p>
              <div className="seg-list">
                {SEGMENTS.map((s, i) => (
                  <div
                    key={s.id}
                    className="seg-row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => pickSeg(s.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && pickSeg(s.id)}
                  >
                    <span className="seg-num">{s.num}</span>
                    <div className="seg-info">
                      <div className="seg-name">{s.label}</div>
                      <div className="seg-desc">{s.subtitle}</div>
                    </div>
                    <div className="seg-arrow">
                      <ArrowRight />
                    </div>
                  </div>
                ))}
              </div>
              <div className="seg-careers">
                Looking for career opportunities?{' '}
                <a href="/careers">Visit our Careers page</a>
              </div>
            </>
          )}

          {/* ─── STEP 2: Segment Details ─── */}
          {step === 2 && cfg && (
            <>
              <div className="back-row">
                <button className="back-btn" onClick={() => go(1)}>
                  <ArrowLeft /> Back
                </button>
                <span className="back-sep">/</span>
                <span className="back-label">{segLabel}</span>
              </div>

              {cfg.showEmergency && (
                <div className="emergency-banner">
                  <div className="emergency-icon">
                    <PhoneIcon />
                  </div>
                  <div className="emergency-text">
                    <strong>For emergencies</strong> — flooding, fire, gas leak, or no heat — call us
                    directly at <a href="tel:2066228600">206-622-8600</a> for immediate assistance.
                    Our on-call team is available 24/7.
                  </div>
                </div>
              )}

              <h2 className="sec-title">{cfg.heading}</h2>
              <p className="sec-sub">{cfg.sub}</p>

              {cfg.fields.map(
                (f, i) =>
                  f.type !== 'file' && (
                    <Field
                      key={f.id}
                      field={f}
                      value={data[f.id]}
                      onChange={dChange}
                      error={errors[f.id]}
                      formData={data}
                      idx={i}
                    />
                  )
              )}

              {fileField && (
                <FileUpload
                  field={fileField}
                  file={file}
                  onFileChange={setFile}
                  idx={cfg.fields.length}
                />
              )}

              <div className="btn-row">
                <button className="btn-s" onClick={() => go(1)}>
                  Back
                </button>
                <button className="btn-p" onClick={() => valDetails() && go(3)}>
                  <span className="btn-txt">Continue</span>
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 3: Contact Info ─── */}
          {step === 3 && (
            <>
              <div className="back-row">
                <button className="back-btn" onClick={() => go(2)}>
                  <ArrowLeft /> Back
                </button>
                <span className="back-sep">/</span>
                <span className="back-label">{segLabel}</span>
                <span className="back-sep">/</span>
                <span className="back-label">Your Info</span>
              </div>

              <h2 className="sec-title">Almost done — who should we reach out to?</h2>
              <p className="sec-sub">We'll send a confirmation to the email address you provide.</p>

              <div className="row2">
                <Field
                  field={{ id: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'First name' }}
                  value={contact.firstName}
                  onChange={(_, v) => cChange('firstName', v)}
                  error={errors.firstName}
                  formData={{}}
                  idx={0}
                />
                <Field
                  field={{ id: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Last name' }}
                  value={contact.lastName}
                  onChange={(_, v) => cChange('lastName', v)}
                  error={errors.lastName}
                  formData={{}}
                  idx={1}
                />
              </div>
              <div className="row2">
                <Field
                  field={{ id: 'email', label: 'Email', type: 'text', required: true, placeholder: 'you@company.com' }}
                  value={contact.email}
                  onChange={(_, v) => cChange('email', v)}
                  error={errors.email}
                  formData={{}}
                  idx={2}
                />
                <Field
                  field={{ id: 'phone', label: 'Phone (optional)', type: 'text', placeholder: '(206) 555-0000' }}
                  value={contact.phone}
                  onChange={(_, v) => cChange('phone', v)}
                  error={errors.phone}
                  formData={{}}
                  idx={3}
                />
              </div>

              {errors._s && (
                <div className="f-err-txt" style={{ textAlign: 'center', marginBottom: 12 }}>
                  {errors._s}
                </div>
              )}

              <div className="btn-row">
                <button className="btn-s" onClick={() => go(2)}>
                  Back
                </button>
                <button
                  className={`btn-p ${loading ? 'btn-ld' : ''}`}
                  onClick={submit}
                  disabled={loading}
                >
                  <span className="btn-txt">Submit Inquiry</span>
                  {loading && (
                    <span className="spin">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ─── SUCCESS ─── */}
          {step === 5 && (
            <div className="ok">
              <div className="ok-circle">
                <CheckIcon />
              </div>
              <h2 className="ok-h">Inquiry Received</h2>
              <p className="ok-p">
                Thank you, {contact.firstName}. Your message has been routed to the right team.
              </p>
              <div className="ok-timeline">{getRespTime()}</div>
              <div className="ok-confirm">
                A confirmation has been sent to <strong>{contact.email}</strong> with a summary of
                your inquiry.
              </div>
              <div className="ok-d">
                Need immediate assistance?
                <br />
                <strong>206-622-8600</strong>
                <span style={{ margin: '0 8px', color: 'var(--gray-200)' }}>|</span>
                <a href="mailto:info@agmrealestategroup.com">info@agmrealestategroup.com</a>
              </div>
              <button className="ok-btn" onClick={reset}>
                Submit Another Inquiry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="ftr">
        <a href="tel:2066228600">206-622-8600</a>
        <span className="ftr-sep">|</span>
        <a href="mailto:info@agmrealestategroup.com">info@agmrealestategroup.com</a>
        <br />
        AGM Real Estate Group, LLC &middot; Seattle, WA &middot; Est. 1977
      </div>
    </div>
  )
}
