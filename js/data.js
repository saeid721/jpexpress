/* =========================================================
   JP EXPRESS - SHARED SITE DATA
   Data/configuration only. No functions or business logic.
   ========================================================= */
const JP_SITE_CONFIG = Object.freeze({
  whatsapp: '8801681637836',
  email: 'jpexpress09@gmail.com'
});


/* ---------- BLOG: used by blog.html and resources.html ---------- */
const BLOG_CATS = {
  'export-tips': 'Export Tips', 'country-guide': 'Country Shipping Guides', 'packaging': 'Packaging',
  'logistics': 'Logistics', 'customs': 'Customs', 'business-growth': 'Business Growth',
  'courier-news': 'Courier News', 'international-trade': 'International Trade'
};
const BLOG_POSTS = [
  {
    c: 'export-tips', t: 'How to prepare your first export shipment from Bangladesh', x: 'The essential steps before your goods leave Dhaka.',
    fx: 'A clear, practical checklist for documents, packaging, customs and the decisions that make an international shipment run smoothly.',
    d: '2026-08-18', r: 8, i: 'fa-box-open', k: 'red', h: 'services.html#export', a: 'Read the guide', f: 1, q: 'export shipment bangladesh documents checklist first export'
  },
  {
    c: 'country-guide', t: 'Shipping to the USA: documents, duties and delivery times', x: 'What Bangladeshi shippers should know before booking.',
    d: '2026-08-12', r: 6, i: 'fa-flag-usa', k: 'blue', h: 'country.html?c=usa', a: 'View country guide', q: 'shipping to usa united states country guide customs delivery'
  },
  {
    c: 'packaging', t: '7 packaging mistakes that cause shipping damage', x: 'Protect fragile products and reduce avoidable delivery issues.',
    d: '2026-08-08', r: 5, i: 'fa-box', k: 'amber', h: 'resources.html#packaging-guide', a: 'Read packaging guide', q: 'packaging fragile parcel box ecommerce shipping guide'
  },
  {
    c: 'logistics', t: 'Air freight vs sea freight: which route fits your cargo?', x: 'A practical comparison of speed, cost and shipment volume.',
    d: '2026-08-03', r: 7, i: 'fa-plane-departure', k: 'navy', h: 'services.html#freight', a: 'Compare services', q: 'air sea freight logistics compare cargo business'
  },
  {
    c: 'customs', t: 'Commercial invoice basics for international shipments', x: 'The information customs teams need to clear your goods.',
    d: '2026-07-28', r: 6, i: 'fa-file-invoice', k: 'green', h: 'resources.html#customs-info', a: 'Explore resources', q: 'customs commercial invoice clearance export import documents'
  },
  {
    c: 'business-growth', t: 'How better delivery experiences help e-commerce brands grow', x: 'Turn shipping from a cost center into customer confidence.',
    d: '2026-07-21', r: 4, i: 'fa-chart-line', k: 'cyan', h: 'services.html', a: 'Explore solutions', q: 'ecommerce business growth delivery customer experience shipping'
  },
  {
    c: 'courier-news', t: 'What real-time shipment tracking should tell you', x: 'From pickup to delivery, understand every useful status.',
    d: '2026-07-15', r: 3, i: 'fa-location-dot', k: 'red', h: 'track-shipment.html', a: 'Track a shipment', q: 'courier news express delivery tracking shipment update'
  },
  {
    c: 'international-trade', t: 'Finding your next international market: a starter framework', x: 'Use demand, route and compliance signals to plan expansion.',
    d: '2026-07-09', r: 9, i: 'fa-globe', k: 'blue', h: 'contact.html', a: 'Talk to an expert', q: 'international trade bangladesh market export buyer trade growth'
  }
];


/* ---------- COUNTRIES: used by countries.html, country.html and resources.html ---------- */
const SERVICES = {
  e: { n: 'Express Courier', i: 'fa-bolt', u: 'services/international-courier.html', f: 'Time-sensitive documents and parcels', c: 'Speed vs. cost' },
  o: { n: 'Economy Courier', i: 'fa-box', u: 'services/international-courier.html', f: 'Less urgent parcels', c: 'Longer transit, lower cost' },
  d: { n: 'Door-to-Door Delivery', i: 'fa-door-open', u: 'services/international-courier.html', f: 'Pickup in Bangladesh to recipient address', c: 'Address accuracy' },
  a: { n: 'Air Freight', i: 'fa-plane', u: 'services/air-freight.html', f: 'Commercial cargo', c: 'Weight / volume' },
  s: { n: 'Sea Freight', i: 'fa-ship', u: 'services/sea-freight.html', f: 'Large, non-urgent cargo', c: 'Transit time / volume' },
  x: { n: 'Commercial Export', i: 'fa-file-export', u: 'services/export-logistics.html', f: 'Samples, B2B and export shipments', c: 'Export documents' },
  c: { n: 'Customs Clearance', i: 'fa-stamp', u: 'services/import-solutions.html', f: 'Declarations and clearance support', c: 'Duties and taxes' }
};
const ALL = 'eodasxc';

const COUNTRY_DATA = {
  usa: {
    n: 'United States', c: 'us', r: 'North America', cap: 'Washington, D.C.', cur: 'USD', t: '3–5 days', pop: 1, v: ALL,
    ov: 'One of our busiest routes, used by families sending gifts and documents as well as exporters sending samples and commercial cargo.',
    cu: 'Personal and commercial shipments are handled differently, so declare contents and value accurately. Duties, taxes and importer details depend on the goods and current US import rules.',
    rs: ['Food, plant and animal products', 'Medicines and supplements', 'Lithium batteries and liquids'],
    ch: 'A complete street address, ZIP code and reachable phone number prevent most delays. Remote areas may need extra time.',
    ind: ['Garments & Textile', 'E-commerce', 'Leather & Handicrafts'],
    ci: 'New York, Los Angeles, Chicago, Houston, Dallas',
    // NEW destination-page fields
    who: ['Families, students and gift senders', 'Exporters, SMEs and e-commerce sellers', 'Buying houses and corporate customers'],
    canShip: ['Documents and paperwork', 'Personal parcels and gifts', 'Samples and commercial cargo'],
    transitNotes: 'Express courier to major US cities is typically 3–5 days. Add 1–2 days for rural or remote ZIP codes, weekends, holidays and customs inspection.',
    costFactors: ['Actual vs. volumetric weight', 'Dimensions and number of pieces', 'Shipment type and service level', 'Pickup and packaging needs', 'US customs, duties and taxes', 'Fuel or applicable surcharges'],
    docs: {
      personal: ['Sender and recipient name, address, phone', 'Description of contents', 'Declared value', 'ID where required'],
      commercial: ['Commercial invoice', 'Packing list', 'Export documentation', 'Product details / HS code where applicable', 'Other US-specific documents (e.g., FDA for certain goods)']
    },
    dutiesNote: 'US duties and taxes are separate from shipping charges. Personal exemptions may apply below a threshold; commercial importers need a Tax ID/EIN. Rules change — confirm before booking.',
    restricted: {
      prohibited: ['Cash and negotiable instruments', 'Weapons and explosives', 'Illegal drugs and counterfeit goods', 'Hazardous or flammable materials'],
      restricted: ['Batteries and electronics', 'Liquids, cosmetics and aerosols', 'Food and medicines', 'Valuables'],
      specific: ['Food, plant and animal products', 'Medicines and supplements', 'Lithium batteries and liquids']
    },
    packaging: ['Use a strong outer box', 'Cushion fragile items internally', 'Seal liquids in leak-proof bags', 'Label clearly with full recipient details'],
    pickup: ['Home, office or business pickup in Dhaka and surrounding areas', 'Scheduled pickups available for regular shippers', 'Packaging guidance on request'],
    tracking: ['Tracking number provided at booking', 'Track via the JP Express tracking page', 'Updates through origin, transit, US customs and final delivery'],
    delivery: ['Delivered to residential and business addresses', 'Recipient contact number helps avoid failed attempts', 'Proof of delivery where applicable'],
    challenges: ['US customs may request additional documents', 'Address accuracy matters — ZIP code and street number must be correct', 'Commercial vs. personal shipments are processed differently', 'Some product categories are restricted at entry'],
    business: 'US is a major market for Bangladeshi garments, leather, handicrafts and e-commerce sellers. We support exporters with samples, commercial cargo and documentation.',
    industries: ['Garments & Textile', 'Leather Products', 'E-commerce', 'Handicrafts'],
    faq: [
      ['How can I send a parcel from Bangladesh to the USA?', 'Request a quote with your package details, destination ZIP and contents. We confirm service, price and pickup, then ship and provide tracking.'],
      ['How long does shipping to the USA take?', 'Express courier to major US cities is typically 3–5 days. Remote areas may take longer depending on customs and last-mile delivery.'],
      ['How is shipping cost calculated?', 'Cost depends on actual or volumetric weight (whichever is higher), dimensions, service level, and any applicable surcharges. Request a quote for an exact price.'],
      ['Can I send food or medicine to the USA?', 'Food, plant, animal and medicine shipments are subject to strict US import rules. Many items are restricted or need FDA/USDA clearance. Always confirm with us before booking.'],
      ['What documents are required?', 'Personal shipments need sender/recipient details and a contents description. Commercial shipments need a commercial invoice, packing list and any product-specific documents.'],
      ['Are customs duties applicable?', 'Yes, US duties and taxes may apply. They are separate from shipping charges and depend on goods, value and current US rules.'],
      ['Can businesses send commercial samples?', 'Yes — we handle commercial samples with proper export documentation. Contact our business desk for bulk pricing.'],
      ['Is home pickup available?', 'Pickup is available in many Dhaka areas. Share your location when you request a quote and we will confirm.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the JP Express tracking page for real-time updates.']
    ]
  },

  uk: {
    n: 'United Kingdom', c: 'gb', r: 'Europe', cap: 'London', cur: 'GBP', t: '3–5 days', pop: 1, v: ALL,
    ov: 'A key destination for Bangladeshi families, students and online sellers, with regular document, parcel and commercial shipments.',
    cu: 'Shipments need an accurate customs declaration. Import VAT and duty depend on value and goods; commercial importers may need an EORI number.',
    rs: ['Meat, dairy and plant products', 'Medicines and cosmetics', 'Batteries and aerosols'],
    ch: 'Recipients may be asked to pay import charges before delivery, so share their contact details early.',
    ind: ['Garments & Textile', 'E-commerce', 'Buying Houses'],
    ci: 'London, Birmingham, Manchester, Leeds',
    who: ['Families and students in the UK', 'Bangladeshi exporters and online sellers', 'UK-based Bangladeshi businesses'],
    canShip: ['Documents and personal paperwork', 'Personal parcels, gifts and clothing', 'Commercial samples and small cargo'],
    transitNotes: 'Express courier is typically 3–5 days to major UK cities. Allow extra time for customs and remote UK postcodes.',
    costFactors: ['Actual and volumetric weight', 'Dimensions and quantity', 'Service level', 'UK import VAT and duty (separate)', 'Pickup and packaging requirements', 'Fuel surcharges'],
    docs: {
      personal: ['Sender and recipient full name, UK address and phone', 'Description of contents', 'Declared value', 'ID where required'],
      commercial: ['Commercial invoice', 'Packing list', 'Export documentation', 'EORI number (for commercial importers)', 'Product-specific certificates if applicable']
    },
    dutiesNote: 'UK import VAT and duties apply on most goods. Recipients may need to pay before delivery. Commercial importers generally need an EORI number.',
    restricted: {
      prohibited: ['Cash and negotiable instruments', 'Weapons and explosives', 'Illegal drugs and counterfeit goods', 'Hazardous materials'],
      restricted: ['Batteries and aerosols', 'Liquids and cosmetics', 'Food and medicines', 'Valuables'],
      specific: ['Meat, dairy and plant products', 'Medicines and cosmetics', 'Batteries and aerosols']
    },
    packaging: ['Strong outer box, cushioned inside', 'Seal liquids in leak-proof bags', 'Clear labelling with UK postcode'],
    pickup: ['Home, office and business pickup in Dhaka', 'Scheduled pickups for regular exporters', 'Drop-off available at our Dhaka office'],
    tracking: ['Tracking number issued at booking', 'Track on the JP Express tracking page', 'Status updates through UK customs and delivery'],
    delivery: ['Residential and business delivery across the UK', 'Recipient phone number helps avoid delays', 'Proof of delivery where available'],
    challenges: ['UK customs and VAT processing', 'EORI requirements for commercial importers', 'Restricted product categories (food, plants, medicines)'],
    business: 'The UK is a strong market for Bangladeshi garments, textiles and e-commerce sellers. We support exporters with samples, documentation and regular shipping.',
    industries: ['Garments & Textile', 'E-commerce', 'Buying Houses'],
    faq: [
      ['How long does shipping to the UK take?', 'Express courier to major UK cities is typically 3–5 days. Add time for customs and remote postcodes.'],
      ['Will the recipient pay customs charges?', 'Possibly. UK import VAT and duty are separate from shipping and are often collected from the recipient before delivery.'],
      ['Do I need an EORI number?', 'Commercial importers generally need an EORI number. Contact us if you are unsure.'],
      ['Can I send food or medicine to the UK?', 'Many food and medicine items are restricted. Confirm with us before booking.'],
      ['What documents are needed?', 'Personal: sender/recipient details, contents, value. Commercial: commercial invoice, packing list, EORI (if applicable).'],
      ['Can I ship commercial samples?', 'Yes — we handle samples with proper export documentation. Ask our business desk for pricing.']
    ]
  },

  canada: {
    n: 'Canada', c: 'ca', r: 'North America', cap: 'Ottawa', cur: 'CAD', t: '4–6 days', pop: 1, v: ALL,
    ov: 'Popular with families and students sending personal parcels, plus small businesses shipping samples and stock.',
    cu: 'Duties and taxes depend on declared value, goods and current Canadian import rules. A correct description and value avoid clearance delays.',
    rs: ['Food and agricultural items', 'Medicines and health products', 'Firearms, weapons and replicas'],
    ch: 'Winter weather and long rural distances can add time outside major cities.',
    ind: ['E-commerce', 'Garments & Textile', 'SMEs'],
    ci: 'Toronto, Vancouver, Montreal, Calgary',
    who: ['Families and students in Canada', 'Small and mid-sized businesses', 'E-commerce sellers'],
    canShip: ['Documents', 'Personal parcels and gifts', 'Samples and small commercial shipments'],
    transitNotes: 'Express courier to major Canadian cities is typically 4–6 days. Winter weather and remote areas may add time.',
    costFactors: ['Actual and volumetric weight', 'Dimensions', 'Service level', 'Canadian duties and taxes (separate)', 'Pickup and packaging', 'Fuel surcharges'],
    docs: {
      personal: ['Sender and recipient details', 'Contents description', 'Declared value'],
      commercial: ['Commercial invoice', 'Packing list', 'Export documentation', 'Canada-specific product certificates if applicable']
    },
    dutiesNote: 'Canadian duties and taxes are separate from shipping and depend on goods and value. Accurate values and descriptions prevent delays.',
    restricted: {
      prohibited: ['Cash', 'Weapons and replicas', 'Illegal drugs', 'Hazardous materials'],
      restricted: ['Food and agricultural items', 'Medicines and health products', 'Batteries and electronics'],
      specific: ['Food and agricultural items', 'Medicines and health products', 'Firearms, weapons and replicas']
    },
    packaging: ['Strong outer box', 'Cushion fragile contents', 'Label clearly with Canadian postal code'],
    pickup: ['Dhaka and surrounding pickup', 'Scheduled pickup for regular shippers', 'Drop-off at our Dhaka office'],
    tracking: ['Tracking number issued at booking', 'Track via JP Express tracking', 'Status through Canadian customs and delivery'],
    delivery: ['Residential and business addresses', 'Rural areas may need extra time', 'Recipient contact helps delivery'],
    challenges: ['Winter weather delays', 'Long rural distances', 'Customs documentation accuracy'],
    business: 'Canada is a growing market for Bangladeshi garments, handicrafts and e-commerce. We support sample and commercial shipments with documentation.',
    industries: ['E-commerce', 'Garments & Textile', 'SMEs'],
    faq: [
      ['How long does shipping to Canada take?', 'Typically 4–6 days to major cities, longer in winter or remote areas.'],
      ['Are duties and taxes applicable?', 'Yes, they may apply and are separate from shipping. Accurate values prevent delays.'],
      ['Can I send food or medicine?', 'Many items are restricted. Confirm with us before booking.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the JP Express tracking page.']
    ]
  },

  australia: {
    n: 'Australia', c: 'au', r: 'Asia-Pacific', cap: 'Canberra', cur: 'AUD', t: '5–7 days', pop: 1, v: ALL,
    ov: 'A strong route for personal parcels and gifts, with a growing number of business and sample shipments.',
    cu: 'Biosecurity is strict: food, plant, seed and wooden items must be declared. Import GST and duty depend on value and goods.',
    rs: ['Food, seeds and plant material', 'Wooden and bamboo items', 'Medicines and supplements'],
    ch: 'Remote and regional addresses can take longer than capital cities.',
    ind: ['Garments & Textile', 'Handicrafts', 'E-commerce'],
    ci: 'Sydney, Melbourne, Brisbane, Perth',
    who: ['Families and students in Australia', 'Handicraft and garment exporters', 'E-commerce sellers'],
    canShip: ['Documents', 'Personal parcels and gifts', 'Samples and small cargo'],
    transitNotes: 'Express courier is typically 5–7 days. Regional areas may add time.',
    costFactors: ['Weight and dimensions', 'Service level', 'Australian GST and duty (separate)', 'Biosecurity inspection', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents and value', 'Declarations for restricted categories'],
      commercial: ['Commercial invoice', 'Packing list', 'Export documents', 'Australian biosecurity declarations']
    },
    dutiesNote: 'Australian GST and duty may apply. Biosecurity inspection is strict — food, plant and wooden items must be declared.',
    restricted: {
      prohibited: ['Cash', 'Weapons', 'Illegal drugs', 'Hazardous materials'],
      restricted: ['Food and medicines', 'Wooden items', 'Seeds and plant material'],
      specific: ['Food, seeds and plant material', 'Wooden and bamboo items', 'Medicines and supplements']
    },
    packaging: ['Strong outer box', 'Declare restricted contents clearly', 'Cushion fragile items'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups for regular shippers', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through Australian customs'],
    delivery: ['Capital cities and regional areas', 'Remote areas may take longer', 'Recipient contact recommended'],
    challenges: ['Strict biosecurity rules', 'Food/plant restrictions', 'Remote area transit times'],
    business: 'Australia is a strong market for Bangladeshi garments, handicrafts and e-commerce. We support sample and commercial shipments.',
    industries: ['Garments & Textile', 'Handicrafts', 'E-commerce'],
    faq: [
      ['How long does shipping to Australia take?', 'Typically 5–7 days to major cities; longer for regional areas.'],
      ['Can I send food or wooden items?', 'Biosecurity rules are strict. Food, seeds, plants and wooden items must be declared and may be restricted.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, biosecurity declarations.'],
      ['Are customs duties applicable?', 'Yes, GST and duty may apply and are separate from shipping.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  uae: {
    n: 'United Arab Emirates', c: 'ae', r: 'Middle East', cap: 'Abu Dhabi', cur: 'AED', t: '2–3 days', pop: 1, v: ALL,
    ov: 'Our fastest-moving Gulf route, widely used by expatriate families, freelancers and traders.',
    cu: 'Customs may ask for recipient ID or company details, and a clear invoice for goods. Charges depend on goods and value.',
    rs: ['Alcohol, pork and tobacco products', 'Medicines and supplements', 'Religious or restricted media'],
    ch: 'Use a precise delivery location and a phone number the courier can reach; many addresses are landmark-based.',
    ind: ['Garments & Textile', 'E-commerce', 'Food & Agro (subject to rules)'],
    ci: 'Dubai, Abu Dhabi, Sharjah',
    who: ['Expatriate families and individuals', 'Freelancers and traders', 'E-commerce sellers'],
    canShip: ['Documents', 'Personal parcels and gifts', 'Samples and small commercial cargo'],
    transitNotes: 'Express courier to UAE is typically 2–3 days, one of our fastest routes.',
    costFactors: ['Weight and dimensions', 'Service level', 'UAE customs charges (separate)', 'Pickup and packaging', 'Fuel surcharges'],
    docs: {
      personal: ['Sender and recipient details', 'Contents description', 'Value declaration'],
      commercial: ['Commercial invoice', 'Packing list', 'Recipient ID/company details where required']
    },
    dutiesNote: 'UAE customs charges depend on goods and value. Recipient ID or company details may be required.',
    restricted: {
      prohibited: ['Alcohol, pork and tobacco products', 'Religious or restricted media', 'Illegal drugs'],
      restricted: ['Medicines and supplements', 'Cosmetics', 'Batteries and electronics'],
      specific: ['Alcohol, pork and tobacco products', 'Medicines and supplements', 'Religious or restricted media']
    },
    packaging: ['Strong outer box', 'Cushion fragile items', 'Label with full recipient details and phone'],
    pickup: ['Dhaka pickup', 'Scheduled pickups for regular shippers', 'Drop-off at our Dhaka office'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through UAE customs and delivery'],
    delivery: ['Dubai, Abu Dhabi, Sharjah and other emirates', 'Landmark-based addresses common — provide accurate location', 'Recipient phone essential'],
    challenges: ['Address format may be landmark-based', 'Recipient ID may be requested by customs', 'Certain product categories restricted'],
    business: 'UAE is a major market for Bangladeshi garments, food (subject to rules) and consumer goods. We support sample and commercial shipments.',
    industries: ['Garments & Textile', 'E-commerce', 'Food & Agro (subject to rules)'],
    faq: [
      ['How long does shipping to UAE take?', 'Typically 2–3 days — one of our fastest routes.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, recipient ID/company details.'],
      ['Can I send food or medicine?', 'Many items are restricted. Confirm with us before booking.'],
      ['Are customs charges applicable?', 'Yes, they depend on goods and value and are separate from shipping.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  saudi: {
    n: 'Saudi Arabia', c: 'sa', r: 'Middle East', cap: 'Riyadh', cur: 'SAR', t: '3–4 days', pop: 1, v: ALL,
    ov: 'A major destination for expatriate families and importers of apparel, household and consumer goods.',
    cu: 'Some goods need conformity certification (such as SASO/SABER) and commercial invoices must be precise. Confirm before booking.',
    rs: ['Alcohol, pork and religious items', 'Medicines and supplements', 'Electronics needing certification'],
    ch: 'Recipient identification and a detailed national address make final delivery smoother.',
    ind: ['Garments & Textile', 'Handicrafts', 'SMEs'],
    ci: 'Riyadh, Jeddah, Dammam',
    who: ['Expatriate families', 'Garment and consumer goods importers', 'SMEs'],
    canShip: ['Documents', 'Personal parcels', 'Samples and commercial cargo'],
    transitNotes: 'Express courier to Saudi Arabia is typically 3–4 days.',
    costFactors: ['Weight and dimensions', 'Service level', 'Saudi customs and conformity certification', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents and value'],
      commercial: ['Commercial invoice', 'Packing list', 'SASO/SABER certificate where applicable']
    },
    dutiesNote: 'Some goods require conformity certification (SASO/SABER). Commercial invoices must be precise.',
    restricted: {
      prohibited: ['Alcohol, pork and religious items', 'Illegal drugs', 'Weapons'],
      restricted: ['Medicines and supplements', 'Electronics needing certification', 'Cosmetics'],
      specific: ['Alcohol, pork and religious items', 'Medicines and supplements', 'Electronics needing certification']
    },
    packaging: ['Strong outer box', 'Cushion fragile items', 'Clear labelling with recipient details'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups for regular shippers', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through Saudi customs and delivery'],
    delivery: ['Riyadh, Jeddah, Dammam and other cities', 'Recipient ID may be required', 'Detailed national address helps delivery'],
    challenges: ['Conformity certification required for some goods', 'Recipient identification', 'Detailed national address'],
    business: 'Saudi Arabia is a growing market for Bangladeshi garments, handicrafts and consumer goods. We support sample and commercial shipments.',
    industries: ['Garments & Textile', 'Handicrafts', 'SMEs'],
    faq: [
      ['How long does shipping to Saudi Arabia take?', 'Typically 3–4 days to major cities.'],
      ['Do I need conformity certification?', 'Some goods require SASO/SABER certification. Confirm with us before booking.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, SASO/SABER where applicable.'],
      ['Are customs charges applicable?', 'Yes, they depend on goods and value and are separate from shipping.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  germany: {
    n: 'Germany', c: 'de', r: 'Europe', cap: 'Berlin', cur: 'EUR', t: '3–5 days', pop: 1, v: ALL,
    ov: 'An important EU gateway for garment buyers, e-commerce sellers and families.',
    cu: 'Imports into the EU involve customs declarations and import VAT. Commercial shipments may need an EORI number.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
    ch: 'Clear recipient name and street details reduce redelivery attempts.',
    ind: ['Garments & Textile', 'Leather', 'E-commerce'],
    ci: 'Berlin, Hamburg, Munich, Frankfurt',
    who: ['Bangladeshi families in Germany', 'Garment and leather exporters', 'E-commerce sellers'],
    canShip: ['Documents', 'Personal parcels', 'Samples and commercial cargo'],
    transitNotes: 'Express courier to Germany is typically 3–5 days to major cities.',
    costFactors: ['Weight and dimensions', 'Service level', 'EU import VAT and duties (separate)', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents description', 'Value declaration'],
      commercial: ['Commercial invoice', 'Packing list', 'EORI number (for commercial importers)']
    },
    dutiesNote: 'EU import VAT and duties may apply. Commercial importers generally need an EORI number.',
    restricted: {
      prohibited: ['Cash', 'Weapons', 'Illegal drugs'],
      restricted: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
      specific: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids']
    },
    packaging: ['Strong outer box', 'Cushion fragile contents', 'Label with full recipient address and postcode'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups for regular shippers', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through EU customs and delivery'],
    delivery: ['Berlin, Hamburg, Munich, Frankfurt and other cities', 'Residential and business addresses', 'Recipient phone helps'],
    challenges: ['EU customs declaration requirements', 'EORI requirement for commercial importers', 'Restricted product categories'],
    business: 'Germany is a key EU market for Bangladeshi garments, leather and e-commerce. We support samples, commercial cargo and documentation.',
    industries: ['Garments & Textile', 'Leather', 'E-commerce'],
    faq: [
      ['How long does shipping to Germany take?', 'Typically 3–5 days to major cities.'],
      ['Do I need an EORI number?', 'Commercial importers generally need one. Contact us if you are unsure.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, EORI where applicable.'],
      ['Are customs duties applicable?', 'Yes, EU import VAT and duties may apply and are separate from shipping.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  france: {
    n: 'France', c: 'fr', r: 'Europe', cap: 'Paris', cur: 'EUR', t: '3–5 days', pop: 1, v: ALL,
    ov: 'A steady route for personal parcels, fashion samples and small commercial shipments.',
    cu: 'EU customs declarations and import VAT apply. Commercial shipments may need an EORI number and a detailed invoice.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
    ch: 'Share an apartment/door code where relevant so the courier can deliver first time.',
    ind: ['Garments & Textile', 'Handicrafts', 'E-commerce'],
    ci: 'Paris, Lyon, Marseille',
    who: ['Bangladeshi families in France', 'Fashion and garment exporters', 'E-commerce sellers'],
    canShip: ['Documents', 'Personal parcels', 'Samples and small commercial shipments'],
    transitNotes: 'Express courier to France is typically 3–5 days.',
    costFactors: ['Weight and dimensions', 'Service level', 'EU import VAT and duties (separate)', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents and value', 'Door/access code if applicable'],
      commercial: ['Commercial invoice', 'Packing list', 'EORI number (commercial importers)']
    },
    dutiesNote: 'EU import VAT and duties apply and are separate from shipping. Commercial importers may need an EORI number.',
    restricted: {
      prohibited: ['Cash', 'Weapons', 'Illegal drugs'],
      restricted: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
      specific: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids']
    },
    packaging: ['Strong outer box', 'Cushion fragile contents', 'Label clearly with full recipient details'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through EU customs and delivery'],
    delivery: ['Paris, Lyon, Marseille and other cities', 'Residential and business addresses', 'Door codes help delivery'],
    challenges: ['EU customs declarations', 'EORI requirements', 'Apartment/door code accuracy'],
    business: 'France is a growing market for Bangladeshi garments, handicrafts and e-commerce. We support sample and commercial shipments.',
    industries: ['Garments & Textile', 'Handicrafts', 'E-commerce'],
    faq: [
      ['How long does shipping to France take?', 'Typically 3–5 days to major cities.'],
      ['Do I need an EORI number?', 'Commercial importers generally need one. Contact us if unsure.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, EORI where applicable.'],
      ['Are customs duties applicable?', 'Yes, EU import VAT and duties may apply and are separate from shipping.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  italy: {
    n: 'Italy', c: 'it', r: 'Europe', cap: 'Rome', cur: 'EUR', t: '4–6 days', v: ALL,
    ov: 'A well-used European route with a large Bangladeshi community and active apparel trade.',
    cu: 'EU customs declarations and import VAT apply; invoices should describe fabric and goods clearly.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Counterfeit-brand goods'],
    ch: 'Southern regions and islands can add transit time.',
    ind: ['Garments & Textile', 'Leather', 'Buying Houses'],
    ci: 'Rome, Milan, Naples',
    who: ['Bangladeshi community in Italy', 'Garment, leather and textile exporters', 'Buying houses'],
    canShip: ['Documents', 'Personal parcels', 'Samples and commercial cargo'],
    transitNotes: 'Express courier to Italy is typically 4–6 days; southern regions and islands may add time.',
    costFactors: ['Weight and dimensions', 'Service level', 'EU import VAT and duties (separate)', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents and value'],
      commercial: ['Commercial invoice', 'Packing list', 'EORI number (commercial importers)']
    },
    dutiesNote: 'EU import VAT and duties apply. Commercial importers may need an EORI number.',
    restricted: {
      prohibited: ['Cash', 'Weapons', 'Counterfeit-brand goods'],
      restricted: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
      specific: ['Food and animal products', 'Medicines and cosmetics', 'Counterfeit-brand goods']
    },
    packaging: ['Strong outer box', 'Cushion fragile contents', 'Label clearly with full recipient details'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through EU customs and delivery'],
    delivery: ['Rome, Milan, Naples and other cities', 'Southern regions and islands may take longer'],
    challenges: ['EU customs declarations', 'Southern region and island transit times', 'Counterfeit-brand restrictions'],
    business: 'Italy is an important market for Bangladeshi garments, leather and buying houses. We support sample and commercial shipments.',
    industries: ['Garments & Textile', 'Leather', 'Buying Houses'],
    faq: [
      ['How long does shipping to Italy take?', 'Typically 4–6 days to major cities; longer for southern regions and islands.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, EORI where applicable.'],
      ['Are customs duties applicable?', 'Yes, EU import VAT and duties may apply and are separate from shipping.'],
      ['Can I ship branded goods?', 'Counterfeit-brand goods are prohibited. Genuine branded goods must have proper documentation.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  japan: {
    n: 'Japan', c: 'jp', r: 'Asia-Pacific', cap: 'Tokyo', cur: 'JPY', t: '3–5 days', v: ALL,
    ov: 'Used for documents, student parcels and business samples to a quality-focused market.',
    cu: 'Plant and food quarantine is strict, and customs expects accurate descriptions and values.',
    rs: ['Food, plants and seeds', 'Medicines and supplements', 'Counterfeit or imitation goods'],
    ch: 'Japanese-format addresses and a recipient phone number help delivery.',
    ind: ['Garments & Textile', 'Jute Products', 'Handicrafts'],
    ci: 'Tokyo, Osaka, Nagoya',
    who: ['Bangladeshi students and workers in Japan', 'Handicraft and jute exporters', 'Business sample senders'],
    canShip: ['Documents', 'Personal parcels', 'Samples and small commercial shipments'],
    transitNotes: 'Express courier to Japan is typically 3–5 days.',
    costFactors: ['Weight and dimensions', 'Service level', 'Japanese customs and quarantine (separate)', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details in Japanese format', 'Contents and value', 'Recipient phone'],
      commercial: ['Commercial invoice', 'Packing list', 'Export documentation']
    },
    dutiesNote: 'Japanese customs and quarantine are strict, especially for food, plants and seeds. Accurate descriptions and values prevent delays.',
    restricted: {
      prohibited: ['Counterfeit or imitation goods', 'Weapons', 'Illegal drugs'],
      restricted: ['Food, plants and seeds', 'Medicines and supplements', 'Cosmetics in volume'],
      specific: ['Food, plants and seeds', 'Medicines and supplements', 'Counterfeit or imitation goods']
    },
    packaging: ['Strong outer box', 'Cushion fragile contents', 'Label with Japanese-format address and recipient phone'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through Japanese customs and delivery'],
    delivery: ['Tokyo, Osaka, Nagoya and other cities', 'Japanese-format address important', 'Recipient phone essential'],
    challenges: ['Japanese-format addresses', 'Strict food and plant quarantine', 'Accurate descriptions and values'],
    business: 'Japan is a quality-focused market for Bangladeshi garments, jute and handicrafts. We support samples, commercial shipments and documentation.',
    industries: ['Garments & Textile', 'Jute Products', 'Handicrafts'],
    faq: [
      ['How long does shipping to Japan take?', 'Typically 3–5 days to major cities.'],
      ['Can I send food or plants to Japan?', 'Plant and food quarantine is strict. Many items are restricted or need documentation.'],
      ['What documents are required?', 'Personal: sender/recipient in Japanese format, contents, value. Commercial: commercial invoice, packing list.'],
      ['Are customs duties applicable?', 'Yes, Japanese customs and quarantine rules apply and may add time.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  southkorea: {
    n: 'South Korea', c: 'kr', r: 'Asia-Pacific', cap: 'Seoul', cur: 'KRW', t: '3–5 days', v: ALL,
    ov: 'A fast-growing route for students, workers and business samples.',
    cu: 'Individual recipients may need a personal customs clearance code. Duties depend on goods and value.',
    rs: ['Food and agricultural items', 'Medicines and supplements', 'Cosmetics in volume'],
    ch: 'Keep the recipient\'s Korean contact details ready for customs.',
    ind: ['Garments & Textile', 'E-commerce', 'SMEs'],
    ci: 'Seoul, Busan, Incheon',
    who: ['Bangladeshi students and workers in South Korea', 'SMEs and e-commerce sellers', 'Business sample senders'],
    canShip: ['Documents', 'Personal parcels', 'Samples and small commercial shipments'],
    transitNotes: 'Express courier to South Korea is typically 3–5 days.',
    costFactors: ['Weight and dimensions', 'Service level', 'South Korean customs (separate)', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents and value', 'Korean contact details'],
      commercial: ['Commercial invoice', 'Packing list', 'Export documentation']
    },
    dutiesNote: 'South Korean duties depend on goods and value. Individual recipients may need a personal customs clearance code.',
    restricted: {
      prohibited: ['Weapons', 'Illegal drugs', 'Counterfeit goods'],
      restricted: ['Food and agricultural items', 'Medicines and supplements', 'Cosmetics in volume'],
      specific: ['Food and agricultural items', 'Medicines and supplements', 'Cosmetics in volume']
    },
    packaging: ['Strong outer box', 'Cushion fragile items', 'Label with Korean contact details'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through Korean customs and delivery'],
    delivery: ['Seoul, Busan, Incheon and other cities', 'Korean contact details help customs and delivery'],
    challenges: ['Personal customs clearance code for individuals', 'Food and agricultural restrictions', 'Cosmetics volume limits'],
    business: 'South Korea is a growing market for Bangladeshi garments and e-commerce. We support samples and commercial shipments.',
    industries: ['Garments & Textile', 'E-commerce', 'SMEs'],
    faq: [
      ['How long does shipping to South Korea take?', 'Typically 3–5 days to major cities.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value, Korean contact. Commercial: commercial invoice, packing list.'],
      ['Do individual recipients need a customs clearance code?', 'Yes, individual recipients may need a personal customs clearance code.'],
      ['Are customs duties applicable?', 'Yes, they depend on goods and value and are separate from shipping.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  china: {
    n: 'China', c: 'cn', r: 'Asia-Pacific', cap: 'Beijing', cur: 'CNY', t: '3–5 days', v: 'eodaxc',
    ov: 'A major sourcing and trade route, mostly business samples, documents and parcels.',
    cu: 'Some commercial goods need import licences or certificates; confirm requirements before dispatch.',
    rs: ['Restricted publications and media', 'Food and medicines', 'Goods needing import licences'],
    ch: 'Provide recipient details in a format customs can verify; address language matters.',
    ind: ['Buying Houses', 'Manufacturing', 'E-commerce'],
    ci: 'Guangzhou, Shanghai, Beijing',
    who: ['Buying houses and manufacturers', 'E-commerce sellers', 'Business sample senders'],
    canShip: ['Documents', 'Samples and small commercial shipments', 'Personal parcels'],
    transitNotes: 'Express courier to China is typically 3–5 days.',
    costFactors: ['Weight and dimensions', 'Service level', 'Chinese customs and import licences', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents and value'],
      commercial: ['Commercial invoice', 'Packing list', 'Import licences or certificates where required']
    },
    dutiesNote: 'Some commercial goods need import licences or certificates. Confirm requirements before dispatch.',
    restricted: {
      prohibited: ['Restricted publications and media', 'Illegal drugs', 'Weapons'],
      restricted: ['Food and medicines', 'Goods needing import licences', 'Batteries and electronics'],
      specific: ['Restricted publications and media', 'Food and medicines', 'Goods needing import licences']
    },
    packaging: ['Strong outer box', 'Cushion fragile items', 'Address in a format Chinese customs can verify'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through Chinese customs and delivery'],
    delivery: ['Guangzhou, Shanghai, Beijing and other cities', 'Address format matters for last-mile'],
    challenges: ['Import licences for some goods', 'Address format for customs', 'Restricted media'],
    business: 'China is a major sourcing and trade route. We support buying houses, manufacturers and e-commerce sellers with samples and commercial shipments.',
    industries: ['Buying Houses', 'Manufacturing', 'E-commerce'],
    faq: [
      ['How long does shipping to China take?', 'Typically 3–5 days to major cities.'],
      ['Do I need import licences?', 'Some commercial goods need import licences or certificates. Confirm with us before dispatch.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, import licences where applicable.'],
      ['Are customs duties applicable?', 'Yes, Chinese customs rules apply and may add time.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  singapore: {
    n: 'Singapore', c: 'sg', r: 'Asia-Pacific', cap: 'Singapore', cur: 'SGD', t: '2–4 days', pop: 1, v: ALL,
    ov: 'A fast regional hub for documents, parcels and business shipments.',
    cu: 'GST and duty depend on goods and value; controlled items need permits.',
    rs: ['Chewing gum and e-cigarettes', 'Medicines and supplements', 'Controlled or regulated goods'],
    ch: 'Include unit/postcode details for apartments and offices.',
    ind: ['E-commerce', 'SMEs', 'Garments & Textile'],
    ci: 'Singapore',
    who: ['Bangladeshi families and workers in Singapore', 'SMEs and e-commerce sellers', 'Business sample senders'],
    canShip: ['Documents', 'Personal parcels', 'Samples and small commercial shipments'],
    transitNotes: 'Express courier to Singapore is typically 2–4 days.',
    costFactors: ['Weight and dimensions', 'Service level', 'Singapore GST and duty (separate)', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents and value'],
      commercial: ['Commercial invoice', 'Packing list', 'Permits for controlled goods']
    },
    dutiesNote: 'Singapore GST and duty depend on goods and value. Controlled items need permits.',
    restricted: {
      prohibited: ['Chewing gum and e-cigarettes', 'Illegal drugs', 'Weapons'],
      restricted: ['Medicines and supplements', 'Controlled or regulated goods', 'Cosmetics'],
      specific: ['Chewing gum and e-cigarettes', 'Medicines and supplements', 'Controlled or regulated goods']
    },
    packaging: ['Strong outer box', 'Cushion fragile items', 'Include unit/postcode in address'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through Singapore customs and delivery'],
    delivery: ['Singapore-wide delivery', 'Unit/postcode important for apartments and offices'],
    challenges: ['Controlled item permits', 'Unit/postcode accuracy', 'Restricted categories'],
    business: 'Singapore is a fast regional hub for Bangladeshi garments, e-commerce and SME shipments. We support samples, commercial cargo and documentation.',
    industries: ['E-commerce', 'SMEs', 'Garments & Textile'],
    faq: [
      ['How long does shipping to Singapore take?', 'Typically 2–4 days to most addresses.'],
      ['What items are restricted?', 'Chewing gum, e-cigarettes, medicines and controlled goods are restricted. Confirm with us.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, permits for controlled goods.'],
      ['Are customs duties applicable?', 'Yes, Singapore GST and duty may apply and are separate from shipping.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  },

  malaysia: {
    n: 'Malaysia', c: 'my', r: 'Asia-Pacific', cap: 'Kuala Lumpur', cur: 'MYR', t: '3–5 days', pop: 1, v: ALL,
    ov: 'A popular route for workers, students and traders with strong two-way links.',
    cu: 'Duties and taxes depend on goods and value; certain goods need permits.',
    rs: ['Pork and alcohol products', 'Medicines and supplements', 'Controlled or regulated goods'],
    ch: 'Add postcode and a reachable mobile number for last-mile delivery.',
    ind: ['Garments & Textile', 'E-commerce', 'SMEs'],
    ci: 'Kuala Lumpur, Penang, Johor Bahru',
    who: ['Bangladeshi workers and students in Malaysia', 'SMEs and traders', 'E-commerce sellers'],
    canShip: ['Documents', 'Personal parcels', 'Samples and small commercial shipments'],
    transitNotes: 'Express courier to Malaysia is typically 3–5 days.',
    costFactors: ['Weight and dimensions', 'Service level', 'Malaysian duties and taxes (separate)', 'Pickup and packaging'],
    docs: {
      personal: ['Sender and recipient details', 'Contents and value'],
      commercial: ['Commercial invoice', 'Packing list', 'Permits for restricted goods']
    },
    dutiesNote: 'Malaysian duties and taxes depend on goods and value. Certain goods need permits.',
    restricted: {
      prohibited: ['Pork and alcohol products', 'Illegal drugs', 'Weapons'],
      restricted: ['Medicines and supplements', 'Controlled or regulated goods', 'Cosmetics'],
      specific: ['Pork and alcohol products', 'Medicines and supplements', 'Controlled or regulated goods']
    },
    packaging: ['Strong outer box', 'Cushion fragile items', 'Add postcode and reachable mobile number'],
    pickup: ['Dhaka area pickup', 'Scheduled pickups', 'Drop-off available'],
    tracking: ['Tracking number issued', 'Track via JP Express tracking', 'Updates through Malaysian customs and delivery'],
    delivery: ['Kuala Lumpur, Penang, Johor Bahru and other cities', 'Postcode and mobile number important'],
    challenges: ['Permits for restricted goods', 'Address accuracy', 'Restricted categories'],
    business: 'Malaysia is a growing market for Bangladeshi garments, e-commerce and SME shipments. We support samples, commercial cargo and documentation.',
    industries: ['Garments & Textile', 'E-commerce', 'SMEs'],
    faq: [
      ['How long does shipping to Malaysia take?', 'Typically 3–5 days to major cities.'],
      ['What items are restricted?', 'Pork, alcohol, medicines and controlled goods are restricted. Confirm with us.'],
      ['What documents are required?', 'Personal: sender/recipient, contents, value. Commercial: commercial invoice, packing list, permits where applicable.'],
      ['Are customs duties applicable?', 'Yes, Malaysian duties and taxes may apply and are separate from shipping.'],
      ['Can I track my shipment?', 'Yes — use your tracking number on the tracking page.']
    ]
  }
};
const REGIONS = ['North America', 'Europe', 'Middle East', 'Asia-Pacific'];


/* ---------- HOME PAGE: used by index.html ---------- */
const JP_HOME_TITLES = [
  'Ship Worldwide with Confidence.',
  'Fast International Delivery.',
  'Reliable Courier, Every Time.'
];

const JP_HOME_SHIPMENTS = [
  { id: 'JPE123456789', origin: 'DAC', dest: 'JFK', status: 'IN TRANSIT', eta: 'ETA 2 DAYS', progress: 62 },
  { id: 'JPE998877665', origin: 'DAC', dest: 'LHR', status: 'CUSTOMS', eta: 'ETA 1 DAY', progress: 78 },
  { id: 'JPE554433221', origin: 'DAC', dest: 'DXB', status: 'OUT FOR DELIVERY', eta: 'ETA TODAY', progress: 92 }
];

const JP_HOME_TESTIMONIALSDATA = [
  {
    name: 'Tanvir Ahmed',
    role: 'Managing Director, Dhaka, Bangladesh',
    quote: '“Reliable service and excellent support. JP Express made our export process smooth and easy. Highly recommended.”',
    stars: '★★★★★',
    avatar: 'assets/teams/founder02.jpg'
  },
  {
    name: 'Sarah Mitchell',
    role: 'E-commerce Owner, London, UK',
    quote: '“Fast, secure and transparent. My parcels always reach on time and the tracking updates are spot-on.”',
    stars: '★★★★★',
    avatar: 'assets/teams/02.jpg'
  },
  {
    name: 'Mohammad Rahman',
    role: 'Export Manager, Chittagong',
    quote: '“Best logistics partner for our garment exports. Customs handling is seamless and pricing is fair.”',
    stars: '★★★★★',
    avatar: 'assets/teams/03.jpg'
  },
  {
    name: 'Emily Carter',
    role: 'Small Business, Toronto, Canada',
    quote: '“JP Express handles our international shipments professionally. Customer support is always responsive.”',
    stars: '★★★★☆',
    avatar: 'assets/teams/08.jpg'
  },
  {
    name: 'Fatima Noor',
    role: 'Freelancer, Dubai, UAE',
    quote: '“Affordable rates and reliable delivery. I trust JP Express for all my document and parcel shipments.”',
    stars: '★★★★★',
    avatar: 'assets/teams/07.jpg'
  }
];

/* ---------- PRICING: used by quote.html ---------- */
const JP_PRICING_CONFIG = {
  currency: "৳",
  ratesNote: "",          // e.g. "Rates effective 1 Nov 2026, valid for 30 days"
  roundStep: 0,           // chargeable-weight rounding in kg (0 = none, 0.5 = round UP to next 0.5 kg)
  maxCourierKg: 70,       // above this, courier services need a manual quote
  maxSideCm: 120,         // any side above this (cm), manual quote

  /* CONFIRM these divisors with JP Express / each carrier. Common industry values shown. */
  divisors: { express: 5000, economy: 5000, door: 5000, air: 6000 },
  /* Optional per-courier override, e.g. { gpo: 6000 }. Leave {} to use the service divisor. */
  courierDivisors: {},

  /* Words typed in "Item" that must trigger the "additional review" message (edit freely). */
  restricted: ["battery", "lithium", "power bank", "liquid", "perfume", "aerosol", "spray", "flammable",
    "gas", "medicine", "tablet", "drug", "supplement", "food", "meat", "seed", "alcohol", "cigarette",
    "tobacco", "weapon", "knife", "explosive", "cash", "gold", "firework"],

  /* Short names people type -> the name used in the destination list below (all lowercase). */
  aliases: {
    usa: "united states", us: "united states", america: "united states",
    uk: "united kingdom", england: "united kingdom", britain: "united kingdom",
    emirates: "uae", "united arab emirates": "uae", ksa: "saudi arabia",
    korea: "south korea", hk: "hong kong"
  },

  destinations: ["Australia", "Austria", "Bahrain", "Belgium", "Canada", "China", "Denmark", "France", "Germany",
    "Hong Kong", "India", "Indonesia", "Ireland", "Italy", "Japan", "Kuwait", "Malaysia", "Maldives", "Nepal",
    "Netherlands", "New Zealand", "Norway", "Oman", "Pakistan", "Qatar", "Saudi Arabia", "Singapore",
    "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Thailand", "Turkey", "UAE",
    "United Kingdom", "United States"],

  /* ADD REAL RATES to switch estimates on. Until then the calculator shows chargeable weight
     and "Quote Required" (it never invents a price).
     Structure: rates[serviceKey][courierKey][lowercase destination name]
     serviceKey : express | economy | door | air
     courierKey : dhl | fedex | ups | aramex | jpex | gpo
     Example:
     rates: {
       express: {
         dhl:  { "united states": { base: 0, perKg: 0, minCharge: 0, fuelPct: 0, transit: "3–5 business days" } },
         jpex: { "united states": { base: 0, perKg: 0, minCharge: 0, fuelPct: 0, transit: "4–6 business days" } }
       }
     }
  */
  rates: null
};

const JP_PRICING_SERVICES = {
  express: { label: "Express Courier", icon: "fa-bolt", note: "Fastest, for urgent items" },
  economy: { label: "Standard / Economy", icon: "fa-box", note: "Lower cost, longer transit" },
  door: { label: "Door-to-Door", icon: "fa-door-open", note: "Pickup to recipient's door" },
  air: { label: "Air Freight", icon: "fa-plane-departure", note: "Commercial cargo by air" },
  sea: { label: "Sea Freight", icon: "fa-ship", note: "Large cargo, priced by volume" }
};

const JP_PRICING_COURIERS = {
  all: "All Couriers", dhl: "DHL", fedex: "FedEx", ups: "UPS", aramex: "Aramex", jpex: "JPEX", gpo: "GPO"
};

/* Country flags for the calculator dropdowns (flagcdn.com ISO codes) */
const JP_PRICING_FLAGS = {
  "Bangladesh": "bd", "Australia": "au", "Austria": "at", "Bahrain": "bh", "Belgium": "be", "Canada": "ca",
  "China": "cn", "Denmark": "dk", "France": "fr", "Germany": "de", "Hong Kong": "hk", "India": "in",
  "Indonesia": "id", "Ireland": "ie", "Italy": "it", "Japan": "jp", "Kuwait": "kw", "Malaysia": "my",
  "Maldives": "mv", "Nepal": "np", "Netherlands": "nl", "New Zealand": "nz", "Norway": "no", "Oman": "om",
  "Pakistan": "pk", "Qatar": "qa", "Saudi Arabia": "sa", "Singapore": "sg", "South Africa": "za",
  "South Korea": "kr", "Spain": "es", "Sri Lanka": "lk", "Sweden": "se", "Switzerland": "ch",
  "Thailand": "th", "Turkey": "tr", "UAE": "ae", "United Kingdom": "gb", "United States": "us"
};

const JP_PRICING_MODES = {
  document: { label: "Document", services: ["express", "economy"], dims: false, quote: false, hint: "Letters and paperwork. Size is not needed." },
  parcel: { label: "Parcel", services: ["express", "economy", "door"], dims: true, quote: false, hint: "Personal parcels, gifts and small online orders." },
  commercial: { label: "Commercial", services: ["express", "economy", "air", "sea"], dims: true, quote: true, hint: "Samples and business shipments are priced by quote." },
  freight: { label: "Freight", services: ["air", "sea"], dims: true, quote: true, hint: "Larger cargo is priced by quote." }
};


/* ---------- TRACKING: used by track-shipment.html ---------- */
const JP_TRACKING_CONFIG = { apiUrl: "", timeoutMs: 15000, maxBatch: 10, phone: "+8801681637836", whatsapp: "8801681637836" };

const JP_TRACKING_DEMO_DATA = {
  JPEDEMO001: {
    status: "In Transit", service: "International Courier", shipmentType: "Parcel", origin: "Dhaka, Bangladesh", destination: "New York, USA",
    bookedOn: "14 Aug 2026", pickedUpOn: "15 Aug 2026", weight: "2.4 kg", pieces: 1, estimatedDelivery: "24 Aug 2026", lastUpdated: "16 Aug 2026, 6:15 PM",
    events: [
      { status: "In Transit", date: "16 Aug 2026", time: "6:15 PM", location: "Dhaka", description: "Departed origin facility." },
      { status: "Picked Up", date: "15 Aug 2026", time: "9:40 AM", location: "Dhaka", description: "Shipment collected from sender." },
      { status: "Booking Confirmed", date: "14 Aug 2026", time: "11:20 AM", location: "Dhaka", description: "Booking confirmed." }]
  },
  JPEDEMO002: {
    status: "Customs Hold", service: "International Courier", shipmentType: "Parcel", origin: "Dhaka, Bangladesh", destination: "London, UK",
    bookedOn: "12 Aug 2026", pickedUpOn: "13 Aug 2026", weight: "1.1 kg", pieces: 1, estimatedDelivery: null, lastUpdated: "19 Aug 2026, 2:05 PM",
    events: [
      { status: "Customs Hold", date: "19 Aug 2026", time: "2:05 PM", location: "London", description: "Shipment held for customs review." },
      { status: "In Transit", date: "17 Aug 2026", time: "8:30 AM", location: "Dhaka", description: "Departed origin facility." },
      { status: "Picked Up", date: "13 Aug 2026", time: "10:15 AM", location: "Dhaka", description: "Shipment collected from sender." }],
    exception: { title: "Customs documentation required", meaning: "Customs needs more information before this shipment can be released.", action: "Contact JP Express support so we can help with the required documents." }
  },
  JPEDEMO003: {
    status: "Delivered", service: "Air Freight", shipmentType: "Commercial", origin: "Dhaka, Bangladesh", destination: "Dubai, UAE",
    bookedOn: "9 Aug 2026", pickedUpOn: "9 Aug 2026", weight: "5.8 kg", pieces: 2, estimatedDelivery: "17 Aug 2026", lastUpdated: "17 Aug 2026, 1:40 PM",
    events: [
      { status: "Delivered", date: "17 Aug 2026", time: "1:40 PM", location: "Dubai", description: "Delivered to the recipient." },
      { status: "Out for Delivery", date: "17 Aug 2026", time: "9:00 AM", location: "Dubai", description: "With the courier for final delivery." },
      { status: "Customs Clearance", date: "15 Aug 2026", time: "3:20 PM", location: "Dubai", description: "Cleared customs." },
      { status: "In Transit", date: "11 Aug 2026", time: "7:00 AM", location: "Dhaka", description: "Departed Bangladesh." },
      { status: "Picked Up", date: "9 Aug 2026", time: "2:30 PM", location: "Dhaka", description: "Shipment collected." }],
    pod: { deliveredOn: "17 Aug 2026, 1:40 PM", location: "Dubai", receivedBy: "Recipient" }
  },
  JPEDEMO004: {
    status: "Booking Confirmed", service: "International Courier", shipmentType: "Document", origin: "Dhaka, Bangladesh", destination: "Toronto, Canada",
    bookedOn: "20 Aug 2026", weight: "0.5 kg", pieces: 1, estimatedDelivery: null, lastUpdated: "", events: []
  }
};

const JP_TRACKING_STAGES = ["Booked", "Picked Up", "In Transit", "Customs", "Out for Delivery", "Delivered"];
const JP_TRACKING_EXPLAIN = [
  "Your booking has been recorded by JP Express.",
  "Your shipment has been collected.",
  "Your shipment is moving through the international delivery network.",
  "Your shipment is going through customs processing.",
  "Your shipment has been assigned for delivery to the recipient.",
  "The shipment has been recorded as delivered."
];


/* ---------- BUSINESS: used by business.html ---------- */
const JP_BUSINESS_CONFIG = {
  /* Laravel route that stores the quote request, e.g. '/business-quote'.
     Leave '' until the backend exists: the form then sends the
     request to WhatsApp so no lead is lost. */
  endpoint: '',
  waPhone: '8801681637836'
};
const JP_BUSINESS_SOLUTIONS = {
  general: 'Business shipping (general)', export: 'Exporter solutions', ecommerce: 'E-commerce shipping',
  corporate: 'Corporate shipping', buying: 'Buying house solutions', bulk: 'Bulk shipping', account: 'Business account enquiry'
};


/* ---------- RESOURCES: used by resources.html ---------- */
const JP_RESOURCE_DOWNLOADS = [
  { icon: "fa-file-signature", title: "Export Documentation Checklist", text: "A printable list of documents commonly needed for export shipments.", file: "" },
  { icon: "fa-triangle-exclamation", title: "Restricted & Prohibited Items", text: "A quick reference of item types that need care or cannot be shipped.", file: "" },
  { icon: "fa-box", title: "Packaging Guide", text: "Simple packing steps for parcels and fragile items.", file: "" },
  { icon: "fa-earth-asia", title: "Country Shipping Guide", text: "Destination requirements and customs considerations.", file: "" }
];


/* ---------- CONTACT: used by contact.html ---------- */
const JP_CONTACT_CONFIG = {
  /* Laravel route that stores the lead, e.g. '/contact'.
     Leave '' until the backend exists: the form then sends the
     inquiry to WhatsApp so no lead is lost. */
  endpoint: '',
  waPhone: '8801681637836',
  openHour: 9,        /* Asia/Dhaka, from the footer: "9am to 11pm" */
  closeHour: 23,
  closedDays: []      /* 0=Sun ... 6=Sat, e.g. [5] if Friday is closed */
};
const JP_CONTACT_INTENTS = {
  general: { label: 'General Inquiry', hint: 'Ask us anything about JP Express services.', ph: 'Tell us how we can help', show: [] },
  quote: { label: 'Get a Quote', hint: 'Tell us what you are shipping and where, and we will prepare a quote.', ph: 'What are you shipping? Add size or quantity if you know', show: ['company', 'ship', 'dest', 'weight'] },
  pickup: { label: 'Book Pickup', hint: 'Add your pickup address and shipment details so we can confirm the pickup.', ph: 'Preferred pickup date or time, and anything we should know', show: ['ship', 'dest', 'weight', 'pickup'], need: ['pickup'] },
  business: { label: 'Business Inquiry', hint: 'For regular shippers, sellers and companies needing ongoing logistics support.', ph: 'Tell us about your business and shipping needs', show: ['company', 'ship', 'dest'] },
  export: { label: 'Export Inquiry', hint: 'Tell us what you export and where it is going.', ph: 'Product, destination and any documents you already have', show: ['company', 'ship', 'dest', 'weight'] },
  import: { label: 'Import Inquiry', hint: 'Tell us what you want to import and where it ships from.', ph: 'Product, supplier country and quantity', show: ['company', 'ship', 'dest', 'weight'], destLabel: 'Origin Country' },
  support: { label: 'Shipment Support', hint: 'Already shipping with us? Add your tracking number so we can find your shipment.', ph: 'What do you need help with?', show: ['track'] }
};
const JP_CONTACT_FIELD_ORDER = ['company', 'ship', 'dest', 'weight', 'pickup', 'track'];



/* =========================================================
   DATA — replace these arrays with your Laravel API payload.
   ========================================================= */
var MEDIA_NEWS = [
  {
    id: "service-updates",
    title: "JP Express service updates",
    slug: "service-updates",
    summary: "New routes, faster processing and improved shipment visibility for our customers.",
    image: "assets/hero-banner2.jpg",
    imageAlt: "JP Express service updates announcement",
    date: "2026-08-20",
    category: "services",
    categoryLabel: "Services",
    url: "news-detail.html?slug=service-updates"
  },
  {
    id: "new-destination",
    title: "New destination added: South Korea",
    slug: "new-destination",
    summary: "We have expanded our international courier network to South Korea with reliable transit times.",
    image: "assets/hero-banner3.jpg",
    imageAlt: "New destination South Korea shipping route",
    date: "2026-08-15",
    category: "announcements",
    categoryLabel: "Announcements",
    url: "news-detail.html?slug=new-destination"
  },
  {
    id: "office-event",
    title: "JP Express team training event",
    slug: "office-event",
    summary: "Our operations team completed a training program on international documentation and compliance.",
    image: "assets/stroy.jpg",
    imageAlt: "JP Express team training event",
    date: "2026-08-10",
    category: "events",
    categoryLabel: "Events",
    url: "news-detail.html?slug=office-event"
  },
  {
    id: "customs-update",
    title: "Updated customs documentation guidelines",
    slug: "customs-update",
    summary: "Important changes to export documentation requirements for selected destinations.",
    image: "assets/business-solution.jpg",
    imageAlt: "Updated customs documentation guidelines",
    date: "2026-08-05",
    category: "operations",
    categoryLabel: "Operations",
    url: "news-detail.html?slug=customs-update"
  },
  {
    id: "partnership",
    title: "New logistics partnership announced",
    slug: "partnership",
    summary: "We have partnered with a leading global carrier to improve transit times and service coverage.",
    image: "assets/container-ship.png",
    imageAlt: "New logistics partnership announcement",
    date: "2026-07-28",
    category: "announcements",
    categoryLabel: "Announcements",
    url: "news-detail.html?slug=partnership"
  },
  {
    id: "eid-schedule",
    title: "Eid holiday shipment schedule",
    slug: "eid-schedule",
    summary: "Adjusted pickup and delivery schedules during the Eid holiday period. Plan your shipments accordingly.",
    image: "assets/domestic-02.jpg",
    imageAlt: "Eid holiday shipment schedule announcement",
    date: "2026-07-20",
    category: "operations",
    categoryLabel: "Operations",
    url: "news-detail.html?slug=eid-schedule"
  }
];

var MEDIA_GALLERY = [
  { id: "g1", image: "assets/hero-banner2.jpg", alt: "JP Express office team meeting", caption: "Office & Team", category: "office", date: "2026-08-01" },
  { id: "g2", image: "assets/hero-banner3.jpg", alt: "International courier shipment preparation", caption: "Shipment Operations", category: "operations", date: "2026-07-28" },
  { id: "g3", image: "assets/stroy.jpg", alt: "JP Express warehouse and packaging area", caption: "Packaging & Warehouse", category: "warehouse", date: "2026-07-22" },
  { id: "g4", image: "assets/business-solution.jpg", alt: "Company event and team gathering", caption: "Company Events", category: "events", date: "2026-07-15" },
  { id: "g5", image: "assets/container-ship.png", alt: "Sea freight container loading operations", caption: "Shipment Operations", category: "operations", date: "2026-07-10" },
  { id: "g6", image: "assets/domestic-02.jpg", alt: "JP Express office workspace", caption: "Office & Team", category: "office", date: "2026-07-02" },
  { id: "g7", image: "assets/Airliner-Orbiting-a-Glowing-Earth.png", alt: "Air freight aircraft loading", caption: "Shipment Operations", category: "operations", date: "2026-06-25" },
  { id: "g8", image: "assets/hero-banner.png", alt: "Packaging and labelling station", caption: "Packaging & Warehouse", category: "warehouse", date: "2026-06-18" }
];

var MEDIA_VIDEOS = [
  {
    id: "v1",
    title: "বাংলাদেশ থেকে সহজেই Amazon-এ পণ্য পাঠাবেন কীভাবে?",
    description: "বাংলাদেশ থেকে Amazon Shipment নিয়ে তাঁর অভিজ্ঞতা, গুরুত্বপূর্ণ পরামর্শ এবং shipment পাঠানোর সময় কী কী বিষয় মাথায় রাখা উচিত—শুনুন সরাসরি তাঁর কাছ থেকেই।",
    youtubeUrl: "https://www.youtube.com/watch?v=5JqSUrbbleQ",
    category: "company",
    categoryLabel: "Company",
    duration: "2:30",
    featured: true,
    order: 1
  },
  {
    id: "v2",
    title: "200 KG Business Shipment যাচ্ছে Italy-তে!",
    description: "আপনার Business Products নিরাপদে গন্তব্যে পৌঁছে দেওয়াই আমাদের দায়িত্ব। সাশ্রয়ী খরচে নির্ভরযোগ্য International Shipping সেবা নিতে প্রতিনিয়ত JP Express-এর সঙ্গে যুক্ত হচ্ছেন আমাদের সম্মানিত ক্লায়েন্টরা।",
    youtubeUrl: "https://www.youtube.com/watch?v=lAi2xRlZ78Q&pp=0gcJCT8MAYcqIYzv",
    category: "guides",
    categoryLabel: "Shipping Guide",
    duration: "4:10",
    featured: false,
    order: 2
  },
  {
    id: "v3",
    title: "Bangladesh to Italy Courier Service",
    description: "A successful shipment is more than a delivery — it’s about trust and a great experience.",
    youtubeUrl: "https://www.youtube.com/watch?v=JKIuJegoVg8",
    category: "operations",
    categoryLabel: "Operations",
    duration: "3:15",
    featured: false,
    order: 3
  },
  {
    id: "v4",
    title: "বাংলাদেশ থেকে USA-তে 50 KG, 100 KG, 200 KG, 500 KG বা তারও বেশি পণ্য পাঠাতে চান?",
    description: "আপনার ব্যবসার shipment-এর জন্য JP Express দিচ্ছে নিরাপদ ও সাশ্রয়ী International Business Shipping Solution। অসংখ্য ব্যবসায়ী ও গ্রাহকের ইতিবাচক feedback আমাদের সেবার প্রতি তাদের আস্থার প্রতিফলন।",
    youtubeUrl: "https://www.youtube.com/watch?v=l3Sx3K_paRk",
    category: "operations",
    categoryLabel: "Operations",
    duration: "3:15",
    featured: false,
    order: 3
  },
  {
    id: "v5",
    title: "Bangladesh to Germany Parcel Delivery – Fast, Safe & Affordable",
    description: "Looking for a reliable courier service from Bangladesh to Germany? JP Express helps you send documents, gifts, clothing, personal parcels, and other legal products with care and confidence.",
    youtubeUrl: "https://www.youtube.com/watch?v=9FoK5AM5g78",
    category: "operations",
    categoryLabel: "Operations",
    duration: "3:15",
    featured: false,
    order: 3
  }
];
