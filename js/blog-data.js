/* =========================================================
   JP EXPRESS — BLOG DATA (Self-Contained)
   Independent from resources.html. No shared data.
   ========================================================= */

const BLOG_CATS = {
    'courier-news': 'International Courier & Shipping',
    'export-tips': 'Export & Import',
    'logistics': 'Freight Forwarding & Cargo',
    'customs': 'Customs Clearance & Documentation',
    'packaging': 'Packaging & Shipment Preparation',
    'country-guide': 'Country & Destination Guides',
    'business-growth': 'Business Shipping & E-commerce',
    'news': 'JP Express News & Service Updates'
};
const BLOG_POSTS = [
    {
        slug: 'first-export-shipment',
        c: 'export-tips',
        t: 'How to prepare your first export shipment from Bangladesh',
        x: 'The essential steps before your goods leave Dhaka.',
        fx: 'A clear, practical checklist for documents, packaging, customs and the decisions that make an international shipment run smoothly.',
        d: '2026-08-18',
        r: 8,
        i: 'fa-box-open',
        k: 'red',
        f: 1,
        q: 'export shipment bangladesh documents checklist first export',
        image: 'assets/business-solution.jpg',
        alt: 'Preparing an export shipment from Bangladesh with documents and cargo',
        content: `
      <p>Starting your export journey from Bangladesh can feel overwhelming, but with the right preparation, it becomes a straightforward process. This guide walks you through everything you need to know before your first shipment leaves Dhaka.</p>

      <h2>1. Understand Your Product Classification</h2>
      <p>Every export product needs a Harmonized System (HS) code. This code determines:</p>
      <ul>
        <li>Customs duties in the destination country</li>
        <li>Any special permits or certifications required</li>
        <li>Restrictions that may apply</li>
      </ul>
      <p>Your HS code must be accurate on all documentation. If you are unsure, consult with your freight forwarder or the Bangladesh Customs authority.</p>

      <h2>2. Prepare Essential Documents</h2>
      <p>Every export shipment requires these core documents:</p>
      <ul>
        <li><strong>Commercial Invoice:</strong> Details the transaction between buyer and seller, including product descriptions, quantities, values, and Incoterms.</li>
        <li><strong>Packing List:</strong> Itemizes the contents of each package, showing weights, dimensions, and package counts.</li>
        <li><strong>Certificate of Origin:</strong> Proves where the goods were manufactured.</li>
        <li><strong>Bill of Lading or Airway Bill:</strong> The transport document issued by the carrier.</li>
      </ul>

      <h2>3. Choose the Right Incoterms</h2>
      <p>Incoterms define who is responsible for what in the shipping process. For first-time exporters, common choices include:</p>
      <ul>
        <li><strong>FOB (Free On Board):</strong> You are responsible until goods are loaded on the vessel.</li>
        <li><strong>CIF (Cost, Insurance, Freight):</strong> You cover cost, insurance, and freight to the destination port.</li>
        <li><strong>EXW (Ex Works):</strong> Buyer takes responsibility from your premises.</li>
      </ul>

      <h2>4. Package for International Transit</h2>
      <p>Your packaging must survive multiple handling points. Consider using export-grade boxes, protecting against moisture, labeling clearly with shipping marks, and testing for stacking strength.</p>

      <h2>5. Verify Restricted Items</h2>
      <p>Some products face restrictions or require special permits. Textiles may need GSP certificates, food products require health certificates, and electronics need compliance documentation.</p>

      <h2>6. Arrange Logistics and Insurance</h2>
      <p>Choose your shipping method based on urgency, volume, and value. Air freight suits time-sensitive goods, while sea freight saves cost for larger shipments.</p>

      <h2>7. Work with a Reliable Freight Forwarder</h2>
      <p>A good freight forwarder handles documentation, customs clearance, and logistics coordination. Look for experience with your product type and strong destination networks.</p>

      <h2>Next Steps</h2>
      <p>Once you have completed these preparations, you are ready to book your shipment. Start with a small trial shipment to test your processes before scaling up.</p>
    `
    },
    {
        slug: 'shipping-to-usa',
        c: 'country-guide',
        t: 'Shipping to the USA: documents, duties and delivery times',
        x: 'What Bangladeshi shippers should know before booking.',
        d: '2026-08-12',
        r: 6,
        i: 'fa-flag-usa',
        k: 'blue',
        q: 'shipping to usa united states country guide customs delivery',
        content: `
      <p>The United States remains one of the most important destinations for Bangladeshi exports. Understanding US customs requirements, documentation, and delivery expectations helps ensure smooth shipments.</p>

      <h2>US Import Requirements</h2>
      <p>All shipments to the US require accurate documentation including a commercial invoice with detailed product descriptions, a packing list matching the invoice, and a certificate of origin for tariff purposes.</p>

      <h2>Understanding US Customs and Duties</h2>
      <p>US customs duties depend on product classification (HTS code), country of origin, and declared value. Shipments valued under $800 may qualify for duty-free entry.</p>

      <h2>Delivery Time Expectations</h2>
      <ul>
        <li><strong>Express Courier:</strong> 3-5 business days to major cities</li>
        <li><strong>Air Freight:</strong> 5-7 days including customs</li>
        <li><strong>Sea Freight:</strong> 25-35 days depending on port</li>
      </ul>

      <h2>Common Delays and How to Avoid Them</h2>
      <p>Incomplete documentation, vague product descriptions, incorrect HS codes, and missing certifications are the leading causes of delays. Ensure all fields are filled accurately and be specific about materials and use.</p>

      <h2>Restricted and Prohibited Items</h2>
      <p>The US prohibits or restricts certain food products, plant materials without permits, medications without FDA approval, and counterfeit goods.</p>

      <h2>Tips for Successful US Shipping</h2>
      <p>Partner with an experienced freight forwarder, provide accurate values and descriptions, and consider using a customs broker for complex shipments.</p>
    `
    },
    {
        slug: 'packaging-mistakes',
        c: 'packaging',
        t: '7 packaging mistakes that cause shipping damage',
        x: 'Protect fragile products and reduce avoidable delivery issues.',
        d: '2026-08-08',
        r: 5,
        i: 'fa-box',
        k: 'amber',
        q: 'packaging fragile parcel box ecommerce shipping guide',
        content: `
      <p>Poor packaging is one of the leading causes of shipping damage. Whether you are sending a single parcel or managing e-commerce fulfillment, avoiding these common mistakes saves money and protects your reputation.</p>

      <h2>Mistake 1: Using Weak or Damaged Boxes</h2>
      <p>Reusing old boxes might seem economical, but crushed or weakened boxes fail under stacking pressure. Always use new, corrugated boxes rated for the weight you are shipping.</p>

      <h2>Mistake 2: Insufficient Internal Cushioning</h2>
      <p>Empty space allows items to shift during transit. Fill gaps with bubble wrap for fragile items, air pillows for lightweight protection, or packing peanuts for void fill.</p>

      <h2>Mistake 3: Not Protecting Fragile Items Individually</h2>
      <p>When shipping multiple fragile items, wrap each one separately. Items that touch can crack or break each other during handling.</p>

      <h2>Mistake 4: Poor Sealing</h2>
      <p>Use proper packing tape on all seams, including bottom flaps. Do not rely on masking tape or duct tape as they do not hold under stress.</p>

      <h2>Mistake 5: Incorrect Labeling</h2>
      <p>Labels must be clearly printed, placed on the largest surface, covered with clear tape to prevent smudging, and include FRAGILE markings when needed.</p>

      <h2>Mistake 6: Overlooking Weight Distribution</h2>
      <p>Heavy items should be centered, with lighter items around them. An unbalanced box is more likely to be dropped or crushed.</p>

      <h2>Mistake 7: Ignoring Moisture Protection</h2>
      <p>For electronics, textiles, or paper products, add moisture barriers using poly bags, silica gel packets, or waterproof outer wrapping.</p>

      <h2>Testing Your Packaging</h2>
      <p>Before shipping, do a simple drop test from waist height. If contents shift or the box shows damage, reinforce your packaging.</p>
    `
    },
    {
        slug: 'air-vs-sea-freight',
        c: 'logistics',
        t: 'Air freight vs sea freight: which route fits your cargo?',
        x: 'A practical comparison of speed, cost and shipment volume.',
        d: '2026-08-03',
        r: 7,
        i: 'fa-plane-departure',
        k: 'navy',
        q: 'air sea freight logistics compare cargo business',
        content: `
      <p>Choosing between air freight and sea freight significantly impacts your shipping costs and delivery timelines. This guide helps you make the right decision for your cargo.</p>

      <h2>Air Freight: Speed and Reliability</h2>
      <p>Air freight is best for time-sensitive shipments, high-value low-volume goods, perishable items, and emergency restocking. Transit time is typically 3-7 days door-to-door.</p>

      <h2>Sea Freight: Cost Efficiency at Scale</h2>
      <p>Sea freight is best for large volume shipments, non-urgent cargo, heavy or bulky items, and cost-sensitive products. Transit time is typically 20-40 days door-to-door.</p>

      <h2>Key Comparison Factors</h2>

      <h3>Cost per Kilogram</h3>
      <p>Air freight typically costs 4-6 times more than sea freight per kilogram. For shipments over 500 kg, sea freight often makes economic sense unless urgency dictates otherwise.</p>

      <h3>Transit Time</h3>
      <p>Air freight is 5-8 times faster. This matters for fashion items with seasonal demand, electronics with rapid depreciation, and products with short shelf life.</p>

      <h3>Volume Limitations</h3>
      <p>Air freight has stricter dimensional limits. Sea freight handles full container loads (FCL), oversized machinery, and bulk commodities.</p>

      <h3>Reliability and Risk</h3>
      <p>Air freight offers more predictable schedules. Sea freight faces port congestion, weather delays, and longer exposure to handling risks.</p>

      <h2>Making the Decision</h2>
      <p>Consider the value of your cargo, how urgent delivery is, your budget, and how much cargo you are shipping.</p>

      <h2>Hybrid Solutions</h2>
      <p>Sometimes the answer is a mix: air freight for initial launch and sea freight for replenishment, or express courier for samples and freight for production orders.</p>
    `
    },
    {
        slug: 'commercial-invoice-basics',
        c: 'customs',
        t: 'Commercial invoice basics for international shipments',
        x: 'The information customs teams need to clear your goods.',
        d: '2026-07-28',
        r: 6,
        i: 'fa-file-invoice',
        k: 'green',
        q: 'customs commercial invoice clearance export import documents',
        content: `
      <p>The commercial invoice is the most important document in international shipping. Errors here cause delays, extra costs, and even shipment rejection.</p>

      <h2>What is a Commercial Invoice?</h2>
      <p>Unlike a proforma invoice (which is a quote), a commercial invoice is a legal document that represents the actual sale between buyer and seller. It serves customs valuation, duty calculation, proof of transaction, and import clearance.</p>

      <h2>Required Elements</h2>
      <p>Every commercial invoice must include complete seller and buyer information, invoice details, product information with detailed descriptions, HS codes, country of origin, and shipping details including Incoterms.</p>

      <h2>Common Mistakes</h2>

      <h3>Vague Descriptions</h3>
      <p>Wrong: "Textiles." Right: "100% cotton woven men's shirts, style #12345, blue, size L."</p>

      <h3>Incorrect Values</h3>
      <p>Under-valuing to reduce duties is illegal and leads to penalties. Declare the actual transaction value.</p>

      <h3>Wrong HS Codes</h3>
      <p>HS codes determine duty rates. Wrong codes mean wrong duties, delays, or penalties.</p>

      <h3>Missing Information</h3>
      <p>Every field matters. Incomplete invoices are rejected.</p>

      <h2>Tips for Accuracy</h2>
      <p>Use a consistent format, double-check HS codes, match values with payment records, include all required certifications, and keep copies for your records.</p>

      <h2>Digital vs Paper</h2>
      <p>Many countries now accept digital invoices, but some still require paper originals. Check destination requirements before shipping.</p>
    `
    },
    {
        slug: 'ecommerce-delivery-experience',
        c: 'business-growth',
        t: 'How better delivery experiences help e-commerce brands grow',
        x: 'Turn shipping from a cost center into customer confidence.',
        d: '2026-07-21',
        r: 4,
        i: 'fa-chart-line',
        k: 'cyan',
        q: 'ecommerce business growth delivery customer experience shipping',
        content: `
      <p>For e-commerce businesses, shipping is not just logistics - it is a critical touchpoint that shapes customer perception.</p>

      <h2>Why Delivery Experience Matters</h2>
      <p>Research consistently shows that delivery experience is the top factor in customer satisfaction, poor delivery is the number one reason for negative reviews, and customers with great delivery experiences are three times more likely to order again.</p>

      <h2>1. Provide Accurate Tracking</h2>
      <p>Customers want to know where their order is. Real-time tracking reduces "where is my order" inquiries, builds trust, and gives you proactive customer service opportunities.</p>

      <h2>2. Offer Delivery Options</h2>
      <p>Different customers have different needs: express for urgent orders, standard for cost-conscious buyers, pickup points for those not home during delivery, and scheduled delivery for high-value items.</p>

      <h2>3. Communicate Proactively</h2>
      <p>Send order confirmation with expected delivery window, dispatch notification with tracking, delivery day reminder, and delivery confirmation.</p>

      <h2>4. Protect Shipments Properly</h2>
      <p>Damaged goods create unhappy customers. Invest in quality packaging materials, proper cushioning and void fill, and weather-resistant outer packaging.</p>

      <h2>5. Make Returns Easy</h2>
      <p>A smooth returns process increases customer confidence to purchase, reduces disputes and chargebacks, and turns returns into repeat purchases.</p>

      <h2>6. Leverage Delivery as Marketing</h2>
      <p>Your packaging and delivery experience can encourage social media sharing, include promotional inserts, build brand recognition, and generate referrals.</p>

      <h2>Measuring Success</h2>
      <p>Track on-time delivery rate, damage rate, delivery-related support tickets, customer satisfaction scores, and repeat purchase rate.</p>

      <h2>Partnering with the Right Courier</h2>
      <p>Your delivery partner is an extension of your brand. Choose couriers who provide reliable consistent service, offer tracking and communication tools, and handle issues professionally.</p>
    `
    },
    {
        slug: 'shipment-tracking-guide',
        c: 'courier-news',
        t: 'What real-time shipment tracking should tell you',
        x: 'From pickup to delivery, understand every useful status.',
        d: '2026-07-15',
        r: 3,
        i: 'fa-location-dot',
        k: 'red',
        q: 'courier news express delivery tracking shipment update',
        content: `
      <p>Real-time tracking has transformed how customers and businesses manage shipments. But what should you actually expect from tracking updates?</p>

      <h2>Standard Tracking Stages</h2>

      <h3>1. Booking Confirmed</h3>
      <p>Your shipment has been registered in the system. A tracking number is generated. This does not mean the package has been picked up yet.</p>

      <h3>2. Picked Up / Collected</h3>
      <p>The courier has physically collected your shipment. This is when the clock really starts on delivery timeframes.</p>

      <h3>3. In Transit</h3>
      <p>Your shipment is moving through the network. Multiple in transit scans may appear as the package moves between facilities.</p>

      <h3>4. Customs Clearance</h3>
      <p>For international shipments, customs processing occurs. This stage can show clearance in progress, customs hold, or clearance complete.</p>

      <h3>5. Out for Delivery</h3>
      <p>The package is with the delivery courier. Delivery should happen within hours.</p>

      <h3>6. Delivered</h3>
      <p>The shipment has reached its destination. Some carriers provide proof of delivery with signature or photo.</p>

      <h2>Understanding Exception Statuses</h2>
      <p>Customs hold means customs needs more information. Delivery attempted means the courier tried but could not deliver. Address issue means the address could not be verified.</p>

      <h2>What Tracking Cannot Tell You</h2>
      <p>Tracking cannot tell you the exact delivery time, why a customs hold occurred, or the condition of contents.</p>

      <h2>Best Practices for Shippers</h2>
      <p>Provide recipient phone numbers for delivery coordination, share tracking numbers with customers proactively, and monitor tracking for exceptions.</p>
    `
    },
    {
        slug: 'international-market-framework',
        c: 'export-tips',
        t: 'Finding your next international market: a starter framework',
        x: 'Use demand, route and compliance signals to plan expansion.',
        d: '2026-07-09',
        r: 9,
        i: 'fa-globe',
        k: 'blue',
        q: 'international trade bangladesh market export buyer trade growth',
        content: `
      <p>Expanding to new international markets is exciting but requires careful planning. This framework helps you evaluate and prioritize potential markets for your products.</p>

      <h2>Step 1: Assess Product-Market Fit</h2>
      <p>Evaluate demand indicators including import volumes for your product category, growth trends in the target market, existing competition and pricing, and consumer preferences. Also assess your competitive advantage: what makes your product unique and can you compete on price, quality, or both.</p>

      <h2>Step 2: Evaluate Trade Conditions</h2>
      <p>Understand tariffs and duties, regulatory requirements including product standards and certifications, labeling requirements, import licensing, and non-tariff barriers.</p>

      <h2>Step 3: Assess Logistics Feasibility</h2>
      <p>Evaluate available transport modes, transit times and reliability, cost per unit shipped, port and airport capabilities, and inland transportation networks.</p>

      <h2>Step 4: Understand Payment and Risk</h2>
      <p>Understand typical payment terms in the market, letter of credit requirements, currency and exchange rate risks, and country risk including political stability and economic conditions.</p>

      <h2>Step 5: Test Before Committing</h2>
      <p>Start with sample shipments, test with a small customer base, and gather feedback before scaling. Find local distributors or agents and attend trade shows.</p>

      <h2>Market Prioritization Matrix</h2>
      <p>Score potential markets on market size and growth, competitive intensity, regulatory complexity, logistics cost and reliability, and payment risk. Focus on markets with the highest total scores.</p>

      <h2>Common Mistakes to Avoid</h2>
      <p>Underestimating regulatory requirements, ignoring total landed cost, assuming other markets work like your home market, and not validating demand before scaling.</p>

      <h2>Getting Help</h2>
      <p>Resources for market research include the Export Promotion Bureau of Bangladesh, International Trade Centre, embassy trade offices, and industry associations.</p>
    `
    }
];


/* =========================================================
   v2 — AUTHOR, SERVICE LINKS, PUBLISHING RULES
   ========================================================= */
const BLOG_AUTHOR = 'JP Express Editorial Team';

const BLOG_SERVICES = {
    courier: { t: 'International Courier', d: 'Documents & parcels worldwide', u: 'services/international-courier.html', i: 'fa-plane' },
    air: { t: 'Air Freight', d: 'Fast cargo for commercial shipments', u: 'services/air-freight.html', i: 'fa-plane-departure' },
    sea: { t: 'Sea Freight', d: 'FCL & LCL for bulk cargo', u: 'services/sea-freight.html', i: 'fa-ship' },
    export: { t: 'Export Logistics', d: 'Documentation & export support', u: 'services/export-logistics.html', i: 'fa-boxes-packing' },
    import: { t: 'Import Solutions', d: 'Sourcing, customs & delivery', u: 'services/import-solutions.html', i: 'fa-truck-ramp-box' },
    ecom: { t: 'E-commerce Shipping', d: 'Cross-border orders & seller shipping', u: 'industries/e-commerce.html', i: 'fa-cart-shopping' },
    countries: { t: 'Destinations', d: 'Country shipping guides', u: 'countries.html', i: 'fa-globe' }
};

/* Which services are shown beside each category (used on the article page) */
const BLOG_CAT_SERVICES = {
    'courier-news': ['courier', 'air'],
    'export-tips': ['export', 'courier'],
    'logistics': ['air', 'sea'],
    'customs': ['export', 'import'],
    'packaging': ['courier', 'export'],
    'country-guide': ['countries', 'courier'],
    'business-growth': ['ecom', 'courier'],
    'news': ['courier', 'export']
};

/* Hide drafts, archived and future-scheduled posts.
   Optional post fields: s:'draft'|'archived', d:'YYYY-MM-DD' (future = scheduled),
   u:'YYYY-MM-DD' (updated date), a:'Author name', image:'assets/x.jpg', alt:'Image description' */
(function () {
    var today = new Date().toISOString().slice(0, 10);
    for (var i = BLOG_POSTS.length - 1; i >= 0; i--) {
        var p = BLOG_POSTS[i];
        if (p.s === 'draft' || p.s === 'archived' || (p.d && p.d > today)) BLOG_POSTS.splice(i, 1);
    }
})();