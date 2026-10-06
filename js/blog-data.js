/* JP Express blog – content data. Add an article = add one object.
   c category | t title | x excerpt | fx long excerpt (featured) | d date (YYYY-MM-DD) | r read minutes
   i FontAwesome icon | k tone (red|blue|amber|navy|green|cyan) | h link | a link label | f featured | q search keywords
   When full article pages exist, set h to "blog/your-slug.html" (or /blog/your-slug/ on Laravel). */
const BLOG_CATS = {
  'export-tips': 'Export Tips', 'country-guide': 'Country Shipping Guides', 'packaging': 'Packaging',
  'logistics': 'Logistics', 'customs': 'Customs', 'business-growth': 'Business Growth',
  'courier-news': 'Courier News', 'international-trade': 'International Trade'
};
const BLOG_POSTS = [
  { c: 'export-tips', t: 'How to prepare your first export shipment from Bangladesh', x: 'The essential steps before your goods leave Dhaka.',
    fx: 'A clear, practical checklist for documents, packaging, customs and the decisions that make an international shipment run smoothly.',
    d: '2026-08-18', r: 8, i: 'fa-box-open', k: 'red', h: 'services.html#export', a: 'Read the guide', f: 1, q: 'export shipment bangladesh documents checklist first export' },
  { c: 'country-guide', t: 'Shipping to the USA: documents, duties and delivery times', x: 'What Bangladeshi shippers should know before booking.',
    d: '2026-08-12', r: 6, i: 'fa-flag-usa', k: 'blue', h: 'country.html?c=usa', a: 'View country guide', q: 'shipping to usa united states country guide customs delivery' },
  { c: 'packaging', t: '7 packaging mistakes that cause shipping damage', x: 'Protect fragile products and reduce avoidable delivery issues.',
    d: '2026-08-08', r: 5, i: 'fa-box', k: 'amber', h: 'resources.html#packaging-guide', a: 'Read packaging guide', q: 'packaging fragile parcel box ecommerce shipping guide' },
  { c: 'logistics', t: 'Air freight vs sea freight: which route fits your cargo?', x: 'A practical comparison of speed, cost and shipment volume.',
    d: '2026-08-03', r: 7, i: 'fa-plane-departure', k: 'navy', h: 'services.html#freight', a: 'Compare services', q: 'air sea freight logistics compare cargo business' },
  { c: 'customs', t: 'Commercial invoice basics for international shipments', x: 'The information customs teams need to clear your goods.',
    d: '2026-07-28', r: 6, i: 'fa-file-invoice', k: 'green', h: 'resources.html#customs-info', a: 'Explore resources', q: 'customs commercial invoice clearance export import documents' },
  { c: 'business-growth', t: 'How better delivery experiences help e-commerce brands grow', x: 'Turn shipping from a cost center into customer confidence.',
    d: '2026-07-21', r: 4, i: 'fa-chart-line', k: 'cyan', h: 'services.html', a: 'Explore solutions', q: 'ecommerce business growth delivery customer experience shipping' },
  { c: 'courier-news', t: 'What real-time shipment tracking should tell you', x: 'From pickup to delivery, understand every useful status.',
    d: '2026-07-15', r: 3, i: 'fa-location-dot', k: 'red', h: 'track-shipment.html', a: 'Track a shipment', q: 'courier news express delivery tracking shipment update' },
  { c: 'international-trade', t: 'Finding your next international market: a starter framework', x: 'Use demand, route and compliance signals to plan expansion.',
    d: '2026-07-09', r: 9, i: 'fa-globe', k: 'blue', h: 'contact.html', a: 'Talk to an expert', q: 'international trade bangladesh market export buyer trade growth' }
];