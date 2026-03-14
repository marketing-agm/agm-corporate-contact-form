import { useRef } from 'react'
import { UploadIcon } from './Icons'

// ─── File Upload ───
export function FileUpload({ field, file, onFileChange, idx }) {
  const inputRef = useRef(null)

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="fg" style={{ animationDelay: `${(idx || 0) * 50}ms` }}>
      <label className="fl">{field.label}</label>
      <div
        className={`file-zone ${file ? 'has-file' : ''}`}
        onClick={() => !file && inputRef.current?.click()}
      >
        {!file && (
          <>
            <input
              ref={inputRef}
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onFileChange(f)
              }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.heic,.txt,.csv"
            />
            <div className="file-zone-icon">
              <UploadIcon />
            </div>
            <div className="file-zone-text">
              <span>Choose a file</span> or drag it here
            </div>
            {field.hint && <div className="file-zone-hint">{field.hint}</div>}
          </>
        )}
        {file && (
          <>
            <div className="file-name">{file.name}</div>
            <div className="file-size">{formatSize(file.size)}</div>
            <button
              type="button"
              className="file-remove"
              onClick={(e) => {
                e.stopPropagation()
                onFileChange(null)
              }}
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Form Field ───
export function Field({ field, value, onChange, error, formData, idx }) {
  if (field.conditionalOn) {
    const dep = formData[field.conditionalOn.field]
    if (!field.conditionalOn.values.includes(dep)) return null
  }
  if (field.type === 'file') return null

  const delay = `${(idx || 0) * 50}ms`

  if (field.type === 'select') {
    return (
      <div className="fg" style={{ animationDelay: delay }}>
        <label className="fl">
          {field.label}
          {field.required && <span className="req">*</span>}
        </label>
        <select
          className={`fs ${error ? 'f-err' : ''}`}
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
        >
          <option value="">Select...</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {error && <div className="f-err-txt">{error}</div>}
      </div>
    )
  }

  if (field.type === 'multiselect') {
    const sel = value || []
    const toggle = (o) =>
      onChange(field.id, sel.includes(o) ? sel.filter((s) => s !== o) : [...sel, o])
    return (
      <div className="fg" style={{ animationDelay: delay }}>
        <label className="fl">
          {field.label}
          {field.required && <span className="req">*</span>}
        </label>
        <div className="chips">
          {field.options.map((o) => (
            <button
              key={o}
              type="button"
              className={`chip ${sel.includes(o) ? 'chip-on' : ''}`}
              onClick={() => toggle(o)}
            >
              {o}
            </button>
          ))}
        </div>
        {error && <div className="f-err-txt">{error}</div>}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className="fg" style={{ animationDelay: delay }}>
        <label className="fl">
          {field.label}
          {field.required && <span className="req">*</span>}
        </label>
        <textarea
          className={`ft ${error ? 'f-err' : ''}`}
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder || ''}
        />
        {error && <div className="f-err-txt">{error}</div>}
      </div>
    )
  }

  return (
    <div className="fg" style={{ animationDelay: delay }}>
      <label className="fl">
        {field.label}
        {field.required && <span className="req">*</span>}
      </label>
      <input
        type="text"
        className={`fi ${error ? 'f-err' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder || ''}
      />
      {error && <div className="f-err-txt">{error}</div>}
    </div>
  )
}
