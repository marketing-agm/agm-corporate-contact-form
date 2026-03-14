# AGM Real Estate Group — Corporate Contact Form

Segment-based contact form with dynamic routing, built with React + Vite. Deployed on Cloudflare Pages.

## Project Structure

```
├── index.html              ← Vite entry point (fonts, meta tags, OG data)
├── package.json            ← Dependencies and build scripts
├── vite.config.js          ← Vite build configuration
├── .gitignore
└── src/
    ├── main.jsx            ← React mount point
    ├── styles.css          ← All styles
    ├── config.js           ← Segments, fields, EmailJS routing, response times
    ├── App.jsx             ← Main form component (steps, validation, submission)
    ├── FormFields.jsx      ← Field and FileUpload components
    └── Icons.jsx           ← SVG icon components
```

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Cloudflare Pages Deployment

1. Push this repo to GitHub
2. In Cloudflare Pages dashboard, connect the repo
3. Set these build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 18 (or higher)
4. Deploy

Cloudflare will run the build on every push to `main`.

## Connecting EmailJS

1. Create an account at [emailjs.com](https://www.emailjs.com)
2. Set up an email service (Gmail, Outlook, etc.)
3. Create templates for each segment and a confirmation template
4. Update `src/config.js` with your credentials:
   - `serviceId` — your EmailJS service ID
   - `publicKey` — your EmailJS public key
   - Template IDs for each segment
   - `confirmationTemplate` — auto-reply template ID
5. Install the EmailJS SDK:
   ```bash
   npm install @emailjs/browser
   ```
6. In `src/App.jsx`, add the import and uncomment the send calls:
   ```js
   import emailjs from '@emailjs/browser'
   ```

## Routing

Each segment routes submissions to a different AGM team email:

| Segment              | Routes To                                   |
|----------------------|---------------------------------------------|
| Property Owner       | brokerage@agmrealestategroup.com            |
| Tenant (Residential) | propertymanagement@agmrealestategroup.com   |
| Tenant (Commercial)  | commercial@agmrealestategroup.com           |
| Investor             | investments@agmrealestategroup.com          |
| Broker / Agent       | brokerage@agmrealestategroup.com            |
| Vendor / Contractor  | operations@agmrealestategroup.com           |
| General Inquiry      | info@agmrealestategroup.com                 |
