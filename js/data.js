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
  e: { n: 'Express Courier', i: 'fa-bolt', u: 'services.html#intl-courier', f: 'Time-sensitive documents and parcels', c: 'Speed vs. cost' },
  o: { n: 'Economy Courier', i: 'fa-box', u: 'services.html#intl-courier', f: 'Less urgent parcels', c: 'Longer transit, lower cost' },
  d: { n: 'Door-to-Door Delivery', i: 'fa-door-open', u: 'services.html#intl-courier', f: 'Pickup in Bangladesh to recipient address', c: 'Address accuracy' },
  a: { n: 'Air Freight', i: 'fa-plane', u: 'services.html#freight', f: 'Commercial cargo', c: 'Weight / volume' },
  s: { n: 'Sea Freight', i: 'fa-ship', u: 'services.html#freight', f: 'Large, non-urgent cargo', c: 'Transit time / volume' },
  x: { n: 'Commercial Export', i: 'fa-file-export', u: 'services.html#export', f: 'Samples, B2B and export shipments', c: 'Export documents' },
  c: { n: 'Customs Clearance', i: 'fa-stamp', u: 'services.html#import', f: 'Declarations and clearance support', c: 'Duties and taxes' }
};
const ALL = 'eodasxc';
const COUNTRY_DATA = {
  usa: {
    n: 'United States', c: 'us', r: 'North America', cap: 'Washington, D.C.', cur: 'USD', t: '3–5 days', pop: 1, v: ALL,
    ov: 'One of our busiest routes, used by families sending gifts and documents as well as exporters sending samples and commercial cargo.',
    cu: 'Personal and commercial shipments are handled differently, so declare contents and value accurately. Duties, taxes and importer details depend on the goods and current US import rules.',
    rs: ['Food, plant and animal products', 'Medicines and supplements', 'Lithium batteries and liquids'],
    ch: 'A complete street address, ZIP code and reachable phone number prevent most delays. Remote areas may need extra time.',
    ind: ['Garments & Textile', 'E-commerce', 'Leather & Handicrafts'], ci: 'New York, Los Angeles, Chicago, Houston, Dallas'
  },
  uk: {
    n: 'United Kingdom', c: 'gb', r: 'Europe', cap: 'London', cur: 'GBP', t: '3–5 days', pop: 1, v: ALL,
    ov: 'A key destination for Bangladeshi families, students and online sellers, with regular document, parcel and commercial shipments.',
    cu: 'Shipments need an accurate customs declaration. Import VAT and duty depend on value and goods; commercial importers may need an EORI number.',
    rs: ['Meat, dairy and plant products', 'Medicines and cosmetics', 'Batteries and aerosols'],
    ch: 'Recipients may be asked to pay import charges before delivery, so share their contact details early.',
    ind: ['Garments & Textile', 'E-commerce', 'Buying Houses'], ci: 'London, Birmingham, Manchester, Leeds'
  },
  canada: {
    n: 'Canada', c: 'ca', r: 'North America', cap: 'Ottawa', cur: 'CAD', t: '4–6 days', pop: 1, v: ALL,
    ov: 'Popular with families and students sending personal parcels, plus small businesses shipping samples and stock.',
    cu: 'Duties and taxes depend on declared value, goods and current Canadian import rules. A correct description and value avoid clearance delays.',
    rs: ['Food and agricultural items', 'Medicines and health products', 'Firearms, weapons and replicas'],
    ch: 'Winter weather and long rural distances can add time outside major cities.',
    ind: ['E-commerce', 'Garments & Textile', 'SMEs'], ci: 'Toronto, Vancouver, Montreal, Calgary'
  },
  australia: {
    n: 'Australia', c: 'au', r: 'Asia-Pacific', cap: 'Canberra', cur: 'AUD', t: '5–7 days', pop: 1, v: ALL,
    ov: 'A strong route for personal parcels and gifts, with a growing number of business and sample shipments.',
    cu: 'Biosecurity is strict: food, plant, seed and wooden items must be declared. Import GST and duty depend on value and goods.',
    rs: ['Food, seeds and plant material', 'Wooden and bamboo items', 'Medicines and supplements'],
    ch: 'Remote and regional addresses can take longer than capital cities.',
    ind: ['Garments & Textile', 'Handicrafts', 'E-commerce'], ci: 'Sydney, Melbourne, Brisbane, Perth'
  },
  uae: {
    n: 'United Arab Emirates', c: 'ae', r: 'Middle East', cap: 'Abu Dhabi', cur: 'AED', t: '2–3 days', pop: 1, v: ALL,
    ov: 'Our fastest-moving Gulf route, widely used by expatriate families, freelancers and traders.',
    cu: 'Customs may ask for recipient ID or company details, and a clear invoice for goods. Charges depend on goods and value.',
    rs: ['Alcohol, pork and tobacco products', 'Medicines and supplements', 'Religious or restricted media'],
    ch: 'Use a precise delivery location and a phone number the courier can reach; many addresses are landmark-based.',
    ind: ['Garments & Textile', 'E-commerce', 'Food & Agro (subject to rules)'], ci: 'Dubai, Abu Dhabi, Sharjah'
  },
  saudi: {
    n: 'Saudi Arabia', c: 'sa', r: 'Middle East', cap: 'Riyadh', cur: 'SAR', t: '3–4 days', pop: 1, v: ALL,
    ov: 'A major destination for expatriate families and importers of apparel, household and consumer goods.',
    cu: 'Some goods need conformity certification (such as SASO/SABER) and commercial invoices must be precise. Confirm before booking.',
    rs: ['Alcohol, pork and religious items', 'Medicines and supplements', 'Electronics needing certification'],
    ch: 'Recipient identification and a detailed national address make final delivery smoother.',
    ind: ['Garments & Textile', 'Handicrafts', 'SMEs'], ci: 'Riyadh, Jeddah, Dammam'
  },
  germany: {
    n: 'Germany', c: 'de', r: 'Europe', cap: 'Berlin', cur: 'EUR', t: '3–5 days', v: ALL,
    ov: 'An important EU gateway for garment buyers, e-commerce sellers and families.',
    cu: 'Imports into the EU involve customs declarations and import VAT. Commercial shipments may need an EORI number.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
    ch: 'Clear recipient name and street details reduce redelivery attempts.',
    ind: ['Garments & Textile', 'Leather', 'E-commerce'], ci: 'Berlin, Hamburg, Munich, Frankfurt'
  },
  france: {
    n: 'France', c: 'fr', r: 'Europe', cap: 'Paris', cur: 'EUR', t: '3–5 days', v: ALL,
    ov: 'A steady route for personal parcels, fashion samples and small commercial shipments.',
    cu: 'EU customs declarations and import VAT apply. Commercial shipments may need an EORI number and a detailed invoice.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
    ch: 'Share an apartment/door code where relevant so the courier can deliver first time.',
    ind: ['Garments & Textile', 'Handicrafts', 'E-commerce'], ci: 'Paris, Lyon, Marseille'
  },
  italy: {
    n: 'Italy', c: 'it', r: 'Europe', cap: 'Rome', cur: 'EUR', t: '4–6 days', v: ALL,
    ov: 'A well-used European route with a large Bangladeshi community and active apparel trade.',
    cu: 'EU customs declarations and import VAT apply; invoices should describe fabric and goods clearly.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Counterfeit-brand goods'],
    ch: 'Southern regions and islands can add transit time.',
    ind: ['Garments & Textile', 'Leather', 'Buying Houses'], ci: 'Rome, Milan, Naples'
  },
  japan: {
    n: 'Japan', c: 'jp', r: 'Asia-Pacific', cap: 'Tokyo', cur: 'JPY', t: '3–5 days', v: ALL,
    ov: 'Used for documents, student parcels and business samples to a quality-focused market.',
    cu: 'Plant and food quarantine is strict, and customs expects accurate descriptions and values.',
    rs: ['Food, plants and seeds', 'Medicines and supplements', 'Counterfeit or imitation goods'],
    ch: 'Japanese-format addresses and a recipient phone number help delivery.',
    ind: ['Garments & Textile', 'Jute Products', 'Handicrafts'], ci: 'Tokyo, Osaka, Nagoya'
  },
  southkorea: {
    n: 'South Korea', c: 'kr', r: 'Asia-Pacific', cap: 'Seoul', cur: 'KRW', t: '3–5 days', v: ALL,
    ov: 'A fast-growing route for students, workers and business samples.',
    cu: 'Individual recipients may need a personal customs clearance code. Duties depend on goods and value.',
    rs: ['Food and agricultural items', 'Medicines and supplements', 'Cosmetics in volume'],
    ch: 'Keep the recipient’s Korean contact details ready for customs.',
    ind: ['Garments & Textile', 'E-commerce', 'SMEs'], ci: 'Seoul, Busan, Incheon'
  },
  china: {
    n: 'China', c: 'cn', r: 'Asia-Pacific', cap: 'Beijing', cur: 'CNY', t: '3–5 days', v: 'eodaxc',
    ov: 'A major sourcing and trade route, mostly business samples, documents and parcels.',
    cu: 'Some commercial goods need import licences or certificates; confirm requirements before dispatch.',
    rs: ['Restricted publications and media', 'Food and medicines', 'Goods needing import licences'],
    ch: 'Provide recipient details in a format customs can verify; address language matters.',
    ind: ['Buying Houses', 'Manufacturing', 'E-commerce'], ci: 'Guangzhou, Shanghai, Beijing'
  },
  singapore: {
    n: 'Singapore', c: 'sg', r: 'Asia-Pacific', cap: 'Singapore', cur: 'SGD', t: '2–4 days', v: ALL,
    ov: 'A fast regional hub for documents, parcels and business shipments.',
    cu: 'GST and duty depend on goods and value; controlled items need permits.',
    rs: ['Chewing gum and e-cigarettes', 'Medicines and supplements', 'Controlled or regulated goods'],
    ch: 'Include unit/postcode details for apartments and offices.',
    ind: ['E-commerce', 'SMEs', 'Garments & Textile'], ci: 'Singapore'
  },
  malaysia: {
    n: 'Malaysia', c: 'my', r: 'Asia-Pacific', cap: 'Kuala Lumpur', cur: 'MYR', t: '3–5 days', v: ALL,
    ov: 'A popular route for workers, students and traders with strong two-way links.',
    cu: 'Duties and taxes depend on goods and value; certain goods need permits.',
    rs: ['Pork and alcohol products', 'Medicines and supplements', 'Controlled or regulated goods'],
    ch: 'Add postcode and a reachable mobile number for last-mile delivery.',
    ind: ['Garments & Textile', 'E-commerce', 'SMEs'], ci: 'Kuala Lumpur, Penang, Johor Bahru'
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
