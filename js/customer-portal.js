/* =====================================================================
   JP EXPRESS — CUSTOMER & PERSONAL ACCOUNT PORTAL
   ---------------------------------------------------------------------
   DEMO MODE: all data below is sample data kept in this browser only
   (localStorage). Nothing is sent anywhere until you set the endpoints
   in PORTAL_CONFIG. Connect every action to authenticated Laravel APIs
   and enforce permissions on the SERVER — UI checks here are for
   experience only, never for security.
   ===================================================================== */
(function () {
    'use strict';

    /* TEMPORARY demo guard: replace with real server-side auth when the Laravel API is ready */
    var SESSION_KEY = 'jpx_session';
    function hasSession() {
        try { return !!(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)); }
        catch (e) { return true; }
    }
    if (!hasSession()) { location.replace('login.html'); return; }

    var PORTAL_CONFIG = {
        apiBase: '',                 /* e.g. '/api/portal'  ('' = demo mode, local sample data) */
        trackingEndpoint: '',        /* e.g. '/api/tracking/{id}' */
        storageKey: 'jpx_portal_demo_v2',
        hotline: '+8801681637836',
        whatsapp: '8801681637836'
    };

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var viewEl = $('#view'), modalRoot = $('#modalRoot'), toastEl = $('#toast');

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function uid(p) { return p + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }
    function money(n) { return '৳ ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
    function initials(n) { return String(n || '?').trim().split(/\s+/).slice(0, 2).map(function (x) { return x[0]; }).join('').toUpperCase(); }
    function nowStamp() {
        var d = new Date(), m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
        var h = d.getHours(), ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
        return m + ' ' + (d.getDate() < 10 ? '0' : '') + d.getDate() + ', ' + d.getFullYear() + ' · ' + h + ':' + ('0' + d.getMinutes()).slice(-2) + ' ' + ap;
    }
    function dateOnly() { return nowStamp().split(' · ')[0]; }

    /* ---------- Permissions & roles (UX only; server must enforce) ---------- */
    var PERMS = {
        'ship.view': 'View shipments', 'ship.create': 'Create shipments', 'track': 'Track shipments',
        'quote': 'Quotes & bookings', 'contacts': 'Manage saved contacts', 'docs.view': 'View documents',
        'docs.upload': 'Upload documents', 'billing.view': 'View invoices & payments', 'billing.pay': 'Make payments',
        'support': 'Contact support', 'members': 'Manage members', 'security': 'Security & ownership'
    };
    var ALL = Object.keys(PERMS);
    var ROLES = {
        'Owner': ALL,
        'Admin': ALL.filter(function (p) { return p !== 'security'; }),
        'Manager': ['ship.view', 'ship.create', 'track', 'quote', 'contacts', 'docs.view', 'docs.upload', 'billing.view', 'support'],
        'Operations': ['ship.view', 'ship.create', 'track', 'quote', 'contacts', 'docs.view', 'docs.upload', 'support'],
        'Finance': ['ship.view', 'track', 'docs.view', 'billing.view', 'billing.pay', 'support'],
        'Family member': ['ship.view', 'ship.create', 'track', 'quote', 'contacts', 'docs.view', 'docs.upload', 'support'],
        'Viewer': ['ship.view', 'track', 'support']
    };
    var GRANTABLE = ALL.filter(function (p) { return p !== 'members' && p !== 'security'; });
    var ROLE_NOTES = {
        'Owner': 'Full control, including members and security.',
        'Admin': 'Everything except ownership and security.',
        'Manager': 'Manage shipments and view billing.',
        'Operations': 'Create, manage and track shipments.',
        'Finance': 'Invoices and payments, view shipments.',
        'Family member': 'Create, view and track shipments for the account.',
        'Viewer': 'View and track shipments only.'
    };

    /* ---------- Status model ---------- */
    var STATUS = {
        booked: { label: 'Booked', cls: 'info', step: 0 },
        pickup: { label: 'Picked up', cls: 'info', step: 1 },
        transit: { label: 'In transit', cls: 'warn', step: 2 },
        customs: { label: 'Customs clearance', cls: 'violet', step: 3 },
        delivered: { label: 'Delivered', cls: 'ok', step: 4 },
        exception: { label: 'Action needed', cls: 'bad', step: 2 }
    };
    var STEPS = ['Booked', 'Picked up', 'In transit', 'Customs', 'Delivered'];
    var COUNTRIES = {
        'United States': 1, 'United Kingdom': .95, 'Canada': 1, 'Australia': 1.05, 'United Arab Emirates': .8,
        'Saudi Arabia': .8, 'Italy': .95, 'Germany': .95, 'Malaysia': .85, 'Singapore': .85, 'Other country': 1.1
    };
    var SERVICES = {
        express: { name: 'International Express', eta: '3–5 business days', base: 1800, perKg: 1450, icon: 'fa-plane-up', docOnly: false },
        economy: { name: 'International Economy', eta: '7–10 business days', base: 1200, perKg: 980, icon: 'fa-boxes-stacked', docOnly: false },
        document: { name: 'Document Express', eta: '2–4 business days', base: 1500, perKg: 1100, icon: 'fa-file-lines', docOnly: true }
    };

    /* ---------- Seed (sample) data ---------- */
    function ev(list) { return list.map(function (a) { return { t: a[0], title: a[1], loc: a[2] }; }); }
    function seed() {
        var personal = {
            id: 'personal', kind: 'personal', name: 'Personal account', owner: 'Rahim Khan', role: 'Owner',
            user: { name: 'Rahim Khan', email: 'rahim@example.com', phone: '+880 1712-345678', country: 'Bangladesh', lang: 'English', since: 'Mar 2026' },
            senders: [
                { id: 's1', label: 'Home', name: 'Rahim Khan', phone: '+880 1712-345678', email: 'rahim@example.com', addr: 'House 12, Road 4, Banani', city: 'Dhaka', postal: '1213', country: 'Bangladesh', def: true },
                { id: 's2', label: 'Mother – Dhaka', name: 'Momina Khan', phone: '+880 1811-223344', email: 'momina@example.com', addr: 'Flat 5B, Green Road', city: 'Dhaka', postal: '1205', country: 'Bangladesh' },
                { id: 's3', label: 'Father – Chattogram', name: 'Karim Khan', phone: '+880 1911-556677', email: '', addr: '22 Agrabad C/A', city: 'Chattogram', postal: '4100', country: 'Bangladesh' }
            ],
            receivers: [
                { id: 'r1', label: 'Arif – New York', name: 'Arif Khan', phone: '+1 212-555-0134', email: 'arif@example.com', addr: '25 Broadway, Manhattan', city: 'New York', postal: '10004', country: 'United States', def: true },
                { id: 'r2', label: 'Asma – Chicago', name: 'Asma Khan', phone: '+1 312-555-0188', email: '', addr: '410 N Michigan Ave', city: 'Chicago', postal: '60611', country: 'United States' },
                { id: 'r3', label: 'Office – London', name: 'Nadia Rahman', phone: '+44 20 7946 0958', email: 'nadia@example.com', addr: '14 Brick Lane', city: 'London', postal: 'E1 6RF', country: 'United Kingdom' },
                { id: 'r4', label: 'Cousin – Toronto', name: 'Imran Hossain', phone: '+1 416-555-0112', email: '', addr: '88 King St W', city: 'Toronto', postal: 'M5H 1A1', country: 'Canada' }
            ],
            shipments: [
                { id: 'JPX-2049-7740', from: 'Dhaka', to: 'Chicago', toCountry: 'United States', weight: 6, kind: 'Parcel', service: 'express', status: 'booked', date: 'Oct 10, 2026', eta: 'Pickup pending', desc: 'Gift items (clothes, spices)', sender: 's2', receiver: 'r2', by: 'Momina Khan', events: ev([['Oct 10, 2026 · 6:20 PM', 'Booking confirmed', 'Dhaka, BD'], ['Oct 10, 2026 · 6:20 PM', 'Pickup request received', 'Dhaka, BD']]) },
                { id: 'JPX-2048-6192', from: 'Dhaka', to: 'New York', toCountry: 'United States', weight: 2.5, kind: 'Parcel', service: 'express', status: 'transit', date: 'Oct 06, 2026', eta: 'Est. Oct 14', desc: 'Clothing and gifts', sender: 's1', receiver: 'r1', by: 'Rahim Khan', events: ev([['Oct 10, 2026 · 8:35 AM', 'Departed international hub', 'Dhaka, BD'], ['Oct 08, 2026 · 2:10 PM', 'Arrived at export facility', 'Dhaka, BD'], ['Oct 06, 2026 · 5:45 PM', 'Picked up from sender', 'Banani, Dhaka'], ['Oct 06, 2026 · 11:00 AM', 'Booking confirmed', 'Dhaka, BD']]) },
                { id: 'JPX-2047-5108', from: 'Dhaka', to: 'London', toCountry: 'United Kingdom', weight: .4, kind: 'Documents', service: 'document', status: 'delivered', date: 'Oct 02, 2026', eta: 'Delivered Oct 08', desc: 'Academic documents', sender: 's1', receiver: 'r3', by: 'Rahim Khan', events: ev([['Oct 08, 2026 · 11:42 AM', 'Delivered to recipient', 'London, UK'], ['Oct 07, 2026 · 9:05 AM', 'Out for delivery', 'London, UK'], ['Oct 05, 2026 · 4:30 PM', 'Customs cleared', 'London, UK'], ['Oct 03, 2026 · 7:15 AM', 'Departed international hub', 'Dhaka, BD'], ['Oct 02, 2026 · 3:00 PM', 'Picked up from sender', 'Banani, Dhaka']]) },
                { id: 'JPX-2046-3821', from: 'Chattogram', to: 'Toronto', toCountry: 'Canada', weight: 4, kind: 'Parcel', service: 'economy', status: 'customs', date: 'Sep 29, 2026', eta: 'Awaiting customs', desc: 'Handicrafts', sender: 's3', receiver: 'r4', by: 'Rahim Khan', events: ev([['Oct 11, 2026 · 9:15 AM', 'Customs documents under review', 'Toronto, CA'], ['Oct 09, 2026 · 6:00 AM', 'Arrived at destination country', 'Toronto, CA'], ['Oct 02, 2026 · 1:20 PM', 'Departed origin country', 'Dhaka, BD'], ['Sep 29, 2026 · 12:10 PM', 'Picked up from sender', 'Chattogram, BD']]) },
                { id: 'JPX-2044-9034', from: 'Dhaka', to: 'New York', toCountry: 'United States', weight: 1.2, kind: 'Parcel', service: 'express', status: 'delivered', date: 'Sep 12, 2026', eta: 'Delivered Sep 18', desc: 'Medicine & books', sender: 's1', receiver: 'r1', by: 'Sadia Khan', events: ev([['Sep 18, 2026 · 2:25 PM', 'Delivered to recipient', 'New York, US'], ['Sep 12, 2026 · 10:00 AM', 'Picked up from sender', 'Banani, Dhaka']]) },
                { id: 'JPX-2043-1182', from: 'Dhaka', to: 'Rome', toCountry: 'Italy', weight: 3.1, kind: 'Parcel', service: 'economy', status: 'exception', date: 'Oct 04, 2026', eta: 'On hold', desc: 'Dry food items', sender: 's1', receiver: 'r3', by: 'Rahim Khan', note: 'The delivery address is incomplete. Please confirm the apartment number and postal code so we can release your parcel.', events: ev([['Oct 10, 2026 · 4:05 PM', 'Delivery on hold: address incomplete', 'Rome, IT'], ['Oct 09, 2026 · 10:30 AM', 'Arrived at destination country', 'Rome, IT'], ['Oct 04, 2026 · 2:00 PM', 'Picked up from sender', 'Banani, Dhaka']]) }
            ],
            quotes: [
                { id: 'QT-2026-0184', to: 'New York', toCountry: 'United States', from: 'Dhaka', weight: 3, kind: 'Parcel', service: 'express', price: 6150, valid: 'Oct 16, 2026', status: 'open', requested: 'Oct 09, 2026', sender: 's1', receiver: 'r1', desc: 'Personal parcel' },
                { id: 'QT-2026-0179', to: 'London', toCountry: 'United Kingdom', from: 'Dhaka', weight: .4, kind: 'Documents', service: 'document', price: 1940, valid: 'Oct 05, 2026', status: 'booked', requested: 'Sep 30, 2026', sender: 's1', receiver: 'r3', desc: 'Academic documents', shipmentId: 'JPX-2047-5108' },
                { id: 'QT-2026-0171', to: 'Toronto', toCountry: 'Canada', from: 'Chattogram', weight: 8, kind: 'Parcel', service: 'economy', price: 9040, valid: 'Sep 25, 2026', status: 'expired', requested: 'Sep 18, 2026', sender: 's3', receiver: 'r4', desc: 'Handicrafts' }
            ],
            members: [
                { id: 'm1', name: 'Momina Khan', email: 'momina@example.com', rel: 'Mother', role: 'Family member', status: 'active', perms: ['ship.view', 'ship.create', 'track', 'quote'] },
                { id: 'm2', name: 'Sadia Khan', email: 'sadia@example.com', rel: 'Wife', role: 'Family member', status: 'active', perms: ['ship.view', 'ship.create', 'track', 'docs.view', 'docs.upload'] },
                { id: 'm3', name: 'Asma Khan', email: 'asma@example.com', rel: 'Sister', role: 'Viewer', status: 'invited', perms: ROLES['Viewer'].slice() }
            ],
            documents: [
                { id: 'd1', name: 'Commercial-invoice.pdf', type: 'Invoice', ship: 'JPX-2048-6192', added: 'Oct 07, 2026', size: '184 KB', by: 'Rahim Khan' },
                { id: 'd2', name: 'AWB-JPX-2048-6192.pdf', type: 'AWB', ship: 'JPX-2048-6192', added: 'Oct 06, 2026', size: '92 KB', by: 'JP Express' },
                { id: 'd3', name: 'Proof-of-delivery-JPX-2047-5108.pdf', type: 'POD', ship: 'JPX-2047-5108', added: 'Oct 08, 2026', size: '146 KB', by: 'JP Express' },
                { id: 'd4', name: 'Packing-list.pdf', type: 'Packing list', ship: 'JPX-2046-3821', added: 'Sep 29, 2026', size: '71 KB', by: 'Rahim Khan' },
                { id: 'd5', name: 'Customs-declaration.pdf', type: 'Customs', ship: 'JPX-2046-3821', added: 'Oct 09, 2026', size: '120 KB', by: 'JP Express' }
            ],
            invoices: [
                { id: 'INV-2026-0420', ship: 'JPX-2049-7740', amount: 11250, status: 'unpaid', date: 'Oct 10, 2026', due: 'Oct 20, 2026' },
                { id: 'INV-2026-0412', ship: 'JPX-2048-6192', amount: 5430, status: 'unpaid', date: 'Oct 06, 2026', due: 'Oct 18, 2026' },
                { id: 'INV-2026-0398', ship: 'JPX-2047-5108', amount: 1940, status: 'paid', date: 'Oct 02, 2026', due: 'Oct 12, 2026', paidOn: 'Oct 03, 2026', method: 'bKash' },
                { id: 'INV-2026-0377', ship: 'JPX-2046-3821', amount: 4980, status: 'paid', date: 'Sep 29, 2026', due: 'Oct 09, 2026', paidOn: 'Sep 29, 2026', method: 'Card' },
                { id: 'INV-2026-0361', ship: 'JPX-2044-9034', amount: 3120, status: 'paid', date: 'Sep 12, 2026', due: 'Sep 22, 2026', paidOn: 'Sep 13, 2026', method: 'Nagad' }
            ],
            notifications: [
                { id: 'n1', icon: 'fa-triangle-exclamation', tone: 'bad', title: 'Action needed on JPX-2043-1182', text: 'Delivery is on hold because the address is incomplete.', time: 'Oct 10 · 4:05 PM', ship: 'JPX-2043-1182', unread: true },
                { id: 'n2', icon: 'fa-box', tone: 'info', title: 'Booking confirmed', text: 'JPX-2049-7740 was booked by Momina Khan. Pickup is pending.', time: 'Oct 10 · 6:20 PM', ship: 'JPX-2049-7740', unread: true },
                { id: 'n3', icon: 'fa-plane-departure', tone: 'warn', title: 'Your shipment is in transit', text: 'JPX-2048-6192 departed the international hub.', time: 'Oct 10 · 8:35 AM', ship: 'JPX-2048-6192', unread: true },
                { id: 'n4', icon: 'fa-file-invoice', tone: 'violet', title: 'Invoice issued', text: 'INV-2026-0412 is due on Oct 18, 2026.', time: 'Oct 06 · 11:05 AM', unread: false },
                { id: 'n5', icon: 'fa-circle-check', tone: 'ok', title: 'Delivery completed', text: 'JPX-2047-5108 was delivered successfully.', time: 'Oct 08 · 11:42 AM', ship: 'JPX-2047-5108', unread: false }
            ],
            tickets: [
                { id: 'TKT-1042', subject: 'Tracking has not updated for 2 days', cat: 'Tracking', ship: 'JPX-2046-3821', status: 'open', created: 'Oct 10, 2026', msgs: [{ who: 'You', t: 'Oct 10, 2026 · 9:02 AM', text: 'My shipment has not been updated for 2 days. Could you check the customs status?' }, { who: 'JP Express Support', t: 'Oct 10, 2026 · 11:40 AM', text: 'Thanks for contacting us. Our customs desk is checking the documents and will update you today.' }] }
            ]
        };

        var business = {
            id: 'business', kind: 'business', name: 'ABC Garments Ltd.', owner: 'Md Rahman', role: 'Operations',
            user: personal.user,
            senders: [{ id: 'bs1', label: 'Head office', name: 'ABC Garments Ltd.', phone: '+880 2-5566-7788', email: 'export@abcgarments.example', addr: 'Plot 14, Tejgaon I/A', city: 'Dhaka', postal: '1208', country: 'Bangladesh', def: true }],
            receivers: [
                { id: 'br1', label: 'USA Buyer A', name: 'Northwind Apparel', phone: '+1 646-555-0101', email: '', addr: '350 5th Ave', city: 'New York', postal: '10118', country: 'United States', def: true },
                { id: 'br2', label: 'UK Buyer', name: 'Harlow & Co', phone: '+44 20 7946 0001', email: '', addr: '9 Carnaby St', city: 'London', postal: 'W1F 9PS', country: 'United Kingdom' }
            ],
            shipments: [
                { id: 'JPX-3012-4471', from: 'Dhaka', to: 'New York', toCountry: 'United States', weight: 18.5, kind: 'Commercial', service: 'express', status: 'transit', date: 'Oct 08, 2026', eta: 'Est. Oct 13', desc: 'Garment samples', sender: 'bs1', receiver: 'br1', by: 'Karim (Operations)', events: ev([['Oct 10, 2026 · 7:10 AM', 'Departed international hub', 'Dhaka, BD'], ['Oct 08, 2026 · 3:00 PM', 'Picked up from sender', 'Tejgaon, Dhaka']]) },
                { id: 'JPX-3011-0968', from: 'Dhaka', to: 'London', toCountry: 'United Kingdom', weight: 12, kind: 'Commercial', service: 'economy', status: 'delivered', date: 'Sep 28, 2026', eta: 'Delivered Oct 07', desc: 'Fabric swatches', sender: 'bs1', receiver: 'br2', by: 'Karim (Operations)', events: ev([['Oct 07, 2026 · 10:20 AM', 'Delivered to recipient', 'London, UK'], ['Sep 28, 2026 · 2:00 PM', 'Picked up from sender', 'Tejgaon, Dhaka']]) },
                { id: 'JPX-3010-7720', from: 'Dhaka', to: 'New York', toCountry: 'United States', weight: 7.2, kind: 'Commercial', service: 'express', status: 'booked', date: 'Oct 11, 2026', eta: 'Pickup pending', desc: 'Buyer samples', sender: 'bs1', receiver: 'br1', by: 'Karim (Operations)', events: ev([['Oct 11, 2026 · 9:00 AM', 'Booking confirmed', 'Dhaka, BD']]) }
            ],
            quotes: [{ id: 'QT-2026-0190', to: 'London', toCountry: 'United Kingdom', from: 'Dhaka', weight: 25, kind: 'Commercial', service: 'economy', price: 25150, valid: 'Oct 18, 2026', status: 'open', requested: 'Oct 10, 2026', sender: 'bs1', receiver: 'br2', desc: 'Garment cartons' }],
            members: [
                { id: 'bm1', name: 'Md Rahman', email: 'owner@abcgarments.example', rel: 'Owner', role: 'Owner', status: 'active', perms: ALL.slice() },
                { id: 'bm2', name: 'Jannat Akter', email: 'finance@abcgarments.example', rel: 'Finance', role: 'Finance', status: 'active', perms: ROLES['Finance'].slice() }
            ],
            documents: [
                { id: 'bd1', name: 'Packing-list-JPX-3012.pdf', type: 'Packing list', ship: 'JPX-3012-4471', added: 'Oct 08, 2026', size: '96 KB', by: 'Karim' },
                { id: 'bd2', name: 'Export-invoice-JPX-3011.pdf', type: 'Invoice', ship: 'JPX-3011-0968', added: 'Sep 28, 2026', size: '210 KB', by: 'Karim' }
            ],
            invoices: [],
            notifications: [
                { id: 'bn1', icon: 'fa-plane-departure', tone: 'warn', title: 'Your shipment is in transit', text: 'JPX-3012-4471 departed the international hub.', time: 'Oct 10 · 7:10 AM', ship: 'JPX-3012-4471', unread: true },
                { id: 'bn2', icon: 'fa-circle-check', tone: 'ok', title: 'Delivery completed', text: 'JPX-3011-0968 was delivered successfully.', time: 'Oct 07 · 10:20 AM', ship: 'JPX-3011-0968', unread: false }
            ],
            tickets: []
        };
        return { active: 'personal', accounts: { personal: personal, business: business } };
    }

    /* ---------- State + persistence ---------- */
    var DB;
    function load() {
        try { var raw = localStorage.getItem(PORTAL_CONFIG.storageKey); if (raw) { var d = JSON.parse(raw); if (d && d.accounts) return d; } } catch (e) { }
        return seed();
    }
    function save() { try { localStorage.setItem(PORTAL_CONFIG.storageKey, JSON.stringify(DB)); } catch (e) { } }
    DB = load();
    function A() { return DB.accounts[DB.active]; }
    function can(p) { var a = A(); return ROLES[a.role] ? ROLES[a.role].indexOf(p) > -1 : false; }
    function isBiz() { return A().kind === 'business'; }
    function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
    function findShip(id) { return A().shipments.filter(function (s) { return s.id.toUpperCase() === String(id).trim().toUpperCase(); })[0]; }
    function unreadCount() { return A().notifications.filter(function (n) { return n.unread; }).length; }
    function outstanding() { return A().invoices.filter(function (i) { return i.status === 'unpaid'; }).reduce(function (s, i) { return s + i.amount; }, 0); }

    /* Hook for your Laravel API. Demo mode just resolves. */
    function sync(action, payload) {
        if (!PORTAL_CONFIG.apiBase) return Promise.resolve({ demo: true });
        var token = $('meta[name="csrf-token"]');
        return fetch(PORTAL_CONFIG.apiBase + '/' + action, {
            method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': token ? token.content : '' },
            body: JSON.stringify({ account: DB.active, data: payload })
        }).then(function (r) { return r.json().catch(function () { return {}; }); });
    }

    /* ---------- UI primitives ---------- */
    function toast(msg, tone) {
        toastEl.className = 'toast show' + (tone ? ' ' + tone : '');
        toastEl.textContent = msg;
        clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 3400);
    }
    function badge(status) { var s = STATUS[status] || STATUS.booked; return '<span class="badge ' + s.cls + '"><i class="dot"></i>' + esc(s.label) + '</span>'; }

    var lastFocus = null, modalCount = 0;
    function openModal(o) {
        lastFocus = document.activeElement;
        var el = document.createElement('div');
        el.className = 'modal' + (o.wide ? ' wide' : '');
        el.setAttribute('role', 'presentation');
        el.innerHTML = '<div class="modal-back" data-action="closeModal"></div>' +
            '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mTitle">' +
            '<div class="sheet-grab" aria-hidden="true"></div>' +
            '<header class="sheet-head"><div><h2 id="mTitle">' + esc(o.title) + '</h2>' + (o.sub ? '<p>' + esc(o.sub) + '</p>' : '') + '</div>' +
            '<button class="icon-btn" data-action="closeModal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></header>' +
            '<div class="sheet-body">' + o.body + '</div>' + (o.footer ? '<footer class="sheet-foot">' + o.footer + '</footer>' : '') + '</div>';
        modalRoot.appendChild(el);
        modalCount++; document.body.classList.add('lock');
        requestAnimationFrame(function () { el.classList.add('in'); });
        var f = $('input:not([type=hidden]),select,textarea,button.btn', $('.sheet-body', el)) || $('.sheet-head .icon-btn', el);
        if (f && !window.matchMedia('(pointer: coarse)').matches) f.focus(); else $('.sheet', el).setAttribute('tabindex', '-1');
        if (o.onMount) o.onMount(el);
        return el;
    }
    function closeModal() {
        var all = $$('.modal', modalRoot), el = all[all.length - 1];
        if (!el) return;
        el.classList.remove('in');
        setTimeout(function () { el.remove(); }, reduced ? 0 : 220);
        modalCount = Math.max(0, modalCount - 1);
        if (!modalCount) document.body.classList.remove('lock');
        if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { }
    }
    function confirmBox(o) {
        var el = openModal({
            title: o.title, body: '<p class="muted-p">' + esc(o.text) + '</p>',
            footer: '<button class="btn btn-ghost" data-action="closeModal">Cancel</button><button class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" id="cfmOk">' + esc(o.ok || 'Confirm') + '</button>'
        });
        $('#cfmOk', el).addEventListener('click', function () { closeModal(); o.onOk(); });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { if (modalCount) closeModal(); else closeNav(); }
        if (e.key === 'Tab' && modalCount) {
            var all = $$('.modal', modalRoot), sheet = $('.sheet', all[all.length - 1]);
            var f = $$('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', sheet).filter(function (x) { return x.offsetParent !== null; });
            if (!f.length) return;
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    function openNav() { $('#sidebar').classList.add('open'); $('#scrim').classList.add('show'); document.body.classList.add('lock'); }
    function closeNav() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); if (!modalCount) document.body.classList.remove('lock'); }

    /* ---------- Field helpers ---------- */
    function field(label, name, o) {
        o = o || {};
        var id = 'f_' + name + (o.suffix || '');
        var ctl;
        if (o.type === 'select') {
            ctl = '<select id="' + id + '" name="' + name + '"' + (o.req ? ' required' : '') + '>' + o.options.map(function (op) {
                var v = typeof op === 'object' ? op.v : op, l = typeof op === 'object' ? op.l : op;
                return '<option value="' + esc(v) + '"' + (String(o.value) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
            }).join('') + '</select>';
        } else if (o.type === 'textarea') {
            ctl = '<textarea id="' + id + '" name="' + name + '" rows="' + (o.rows || 4) + '" placeholder="' + esc(o.ph || '') + '"' + (o.max ? ' maxlength="' + o.max + '"' : '') + '>' + esc(o.value || '') + '</textarea>';
        } else {
            ctl = '<input id="' + id + '" name="' + name + '" type="' + (o.type || 'text') + '" value="' + esc(o.value == null ? '' : o.value) + '" placeholder="' + esc(o.ph || '') + '"' +
                (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') + (o.step ? ' step="' + o.step + '"' : '') + (o.min != null ? ' min="' + o.min + '"' : '') +
                (o.max ? ' maxlength="' + o.max + '"' : '') + (o.ac ? ' autocomplete="' + o.ac + '"' : '') + '>';
        }
        return '<div class="fld' + (o.span ? ' span2' : '') + '" data-f="' + name + '"><label for="' + id + '">' + esc(label) + (o.req ? ' <i class="req">*</i>' : '') + '</label>' + ctl +
            (o.hint ? '<small class="hint">' + esc(o.hint) + '</small>' : '') + '<small class="err" role="alert"></small></div>';
    }
    function setErr(form, name, msg) {
        var f = $('[data-f="' + name + '"]', form); if (!f) return;
        f.classList.toggle('has-error', !!msg);
        var er = $('.err', f); if (er) er.textContent = msg || '';
        var c = $('input,select,textarea', f); if (c) { if (msg) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid'); }
    }
    function formData(form) { var o = {}; $$('input,select,textarea', form).forEach(function (c) { if (!c.name) return; o[c.name] = c.type === 'checkbox' ? c.checked : c.value.trim(); }); return o; }
    function firstBad(form) { return $('.has-error input,.has-error select,.has-error textarea', form); }
    function phoneOk(v) { var d = String(v).replace(/\D/g, ''); return /^\+?[0-9\s().-]+$/.test(v) && d.length >= 7 && d.length <= 15; }
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    document.addEventListener('input', function (e) { var f = e.target.closest && e.target.closest('.fld.has-error'); if (f) { f.classList.remove('has-error'); var er = $('.err', f); if (er) er.textContent = ''; } });

    /* =====================================================================
       VIEWS
       ===================================================================== */
    var NAV = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-table-cells-large' },
        { id: 'shipments', label: 'My shipments', icon: 'fa-box', perm: 'ship.view', count: true },
        { id: 'create', label: 'Create shipment', icon: 'fa-circle-plus', perm: 'ship.create' },
        { id: 'tracking', label: 'Track shipment', icon: 'fa-location-crosshairs', perm: 'track' },
        { id: 'quotes', label: 'Quotes & bookings', icon: 'fa-file-invoice-dollar', perm: 'quote' },
        { id: 'contacts', label: 'Address book', icon: 'fa-address-book', perm: 'contacts' },
        { id: 'family', label: 'Family & access', alt: 'Team & access', icon: 'fa-people-roof', perm: 'members' },
        { id: 'documents', label: 'Documents', icon: 'fa-folder-open', perm: 'docs.view' },
        { id: 'billing', label: 'Invoices & payments', icon: 'fa-wallet', perm: 'billing.view' },
        { id: 'notifications', label: 'Notifications', icon: 'fa-bell', badge: true },
        { id: 'support', label: 'Help & support', icon: 'fa-headset', perm: 'support' },
        { id: 'profile', label: 'Profile & security', icon: 'fa-user-shield' }
    ];
    var TITLES = {}; NAV.forEach(function (n) { TITLES[n.id] = n.label; });
    var route = 'dashboard', filterState = { status: 'all', q: '' }, docFilter = 'all', contactTab = 'receivers', wiz = null;

    function pageHead(eyebrow, title, sub, actionHtml) {
        return '<div class="page-head"><div><div class="eyebrow">' + esc(eyebrow) + '</div><h1>' + esc(title) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' + (actionHtml ? '<div class="ph-actions">' + actionHtml + '</div>' : '') + '</div>';
    }
    function locked(id) {
        var n = NAV.filter(function (x) { return x.id === id; })[0];
        return '<div class="panel empty"><span class="empty-ico lock"><i class="fa-solid fa-lock"></i></span><h3>Not available for your role</h3>' +
            '<p>Your role in <b>' + esc(A().name) + '</b> (' + esc(A().role) + ') does not include “' + esc(n ? (isBiz() && n.alt ? n.alt : n.label) : id) + '”. Ask the account owner if you need access.</p>' +
            '<button class="btn btn-primary" data-nav="dashboard">Back to dashboard</button></div>';
    }
    function emptyState(icon, title, text, cta) {
        return '<div class="empty"><span class="empty-ico"><i class="fa-solid ' + icon + '"></i></span><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (cta || '') + '</div>';
    }
    function ctaBtn(label, attrs, icon) { return '<button class="btn btn-primary" ' + attrs + '>' + (icon ? '<i class="fa-solid ' + icon + '"></i> ' : '') + esc(label) + '</button>'; }
    function shipLabel(s) { return esc(s.from) + ' <i class="fa-solid fa-arrow-right-long arrow"></i> ' + esc(s.to); }

    /* ---------- Dashboard ---------- */
    function vDashboard() {
        var a = A(), sh = a.shipments, h = new Date().getHours();
        var greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        var first = a.user.name.split(' ')[0];
        var cnt = function (f) { return sh.filter(f).length; };
        var active = cnt(function (s) { return s.status !== 'delivered'; });
        var stats = [
            { k: 'Total shipments', v: sh.length, ic: 'fa-boxes-stacked', t: 'blue', go: 'shipments', f: 'all' },
            { k: 'Active', v: active, ic: 'fa-bolt', t: 'orange', go: 'shipments', f: 'active' },
            { k: 'In transit', v: cnt(function (s) { return s.status === 'transit' || s.status === 'customs'; }), ic: 'fa-truck-fast', t: 'violet', go: 'shipments', f: 'transit' },
            { k: 'Delivered', v: cnt(function (s) { return s.status === 'delivered'; }), ic: 'fa-circle-check', t: 'green', go: 'shipments', f: 'delivered' },
            { k: 'Pending', v: cnt(function (s) { return s.status === 'booked' || s.status === 'pickup' || s.status === 'exception'; }), ic: 'fa-hourglass-half', t: 'amber', go: 'shipments', f: 'pending' },
            can('billing.view') ? { k: 'Outstanding payment', v: money(outstanding()), ic: 'fa-wallet', t: outstanding() ? 'red' : 'green', go: 'billing', small: true }
                : { k: 'Open quotes', v: a.quotes.filter(function (q) { return q.status === 'open'; }).length, ic: 'fa-file-invoice-dollar', t: 'red', go: 'quotes' }
        ];
        var todo = [];
        sh.filter(function (s) { return s.status === 'exception'; }).forEach(function (s) { todo.push({ ic: 'fa-triangle-exclamation', t: 'bad', title: s.id + ' needs your attention', text: s.note || 'Open the shipment to see what is needed.', cta: 'View', attr: 'data-open-ship="' + esc(s.id) + '"' }); });
        if (can('billing.pay')) a.invoices.filter(function (i) { return i.status === 'unpaid'; }).slice(0, 2).forEach(function (i) { todo.push({ ic: 'fa-file-invoice', t: 'warn', title: 'Invoice ' + i.id + ' is unpaid', text: money(i.amount) + ' · due ' + i.due, cta: 'Pay now', attr: 'data-action="pay" data-id="' + esc(i.id) + '"' }); });
        a.quotes.filter(function (q) { return q.status === 'open'; }).slice(0, 1).forEach(function (q) { todo.push({ ic: 'fa-file-signature', t: 'info', title: 'Quote ' + q.id + ' is ready', text: q.from + ' → ' + q.to + ' · ' + money(q.price) + ' · valid until ' + q.valid, cta: 'Review', attr: 'data-nav="quotes"' }); });

        var quick = [
            { l: 'Create shipment', s: 'Book a pickup', ic: 'fa-circle-plus', t: 'orange', nav: 'create', p: 'ship.create' },
            { l: 'Track shipment', s: 'Live status', ic: 'fa-location-crosshairs', t: 'blue', nav: 'tracking', p: 'track' },
            { l: 'Get a quote', s: 'Estimate the cost', ic: 'fa-calculator', t: 'violet', link: 'quote.html', p: 'quote' },
            { l: 'Add sender', s: 'Save pickup details', ic: 'fa-house-user', t: 'green', act: 'addContact', type: 'sender', p: 'contacts' },
            { l: 'Add receiver', s: 'Save delivery details', ic: 'fa-location-dot', t: 'green', act: 'addContact', type: 'receiver', p: 'contacts' },
            { l: 'Make payment', s: 'Pay open invoices', ic: 'fa-credit-card', t: 'amber', nav: 'billing', p: 'billing.pay' },
            { l: 'Contact support', s: 'We reply fast', ic: 'fa-headset', t: 'blue', nav: 'support', p: 'support' }
        ].filter(function (q) { return can(q.p); });

        var recent = sh.slice().sort(function (x, y) { return new Date(y.date) - new Date(x.date); }).slice(0, 4);

        return '<section class="welcome"><div><div class="eyebrow"><span class="pulse"></span>' + (isBiz() ? 'BUSINESS ACCOUNT · ' + esc(a.role).toUpperCase() : 'PERSONAL ACCOUNT') + '</div>' +
            '<h1>' + greet + ', ' + esc(first) + ' <span class="spark">✦</span></h1><p>Create your account once. Manage your shipments anytime.</p></div>' +
            (can('ship.create') ? '<a class="btn btn-primary btn-lg" href="#create" data-nav="create"><i class="fa-solid fa-plus"></i> Create a shipment</a>' : '') + '</section>' +

            '<section class="hero"><div class="hero-copy"><span class="hero-tag"><i class="fa-solid fa-earth-asia"></i> GLOBAL SHIPPING, MADE SIMPLE</span>' +
            '<h2>Your next shipment<br>starts right here.</h2><p>Pick a saved sender and receiver, enter the weight, and book in under a minute.</p>' +
            '<div class="hero-actions">' + (can('ship.create') ? '<a class="btn btn-white" href="#create" data-nav="create">Book a shipment <i class="fa-solid fa-arrow-right"></i></a>' : '') +
            (can('track') ? '<a class="btn btn-outline-w" href="#tracking" data-nav="tracking"><i class="fa-solid fa-location-dot"></i> Track parcel</a>' : '') + '</div></div>' +
            '<div class="hero-art" aria-hidden="true"><div class="orbit o1"></div><div class="orbit o2"></div><div class="globe"><i class="fa-solid fa-earth-asia"></i></div><div class="fbox b1"><i class="fa-solid fa-box"></i></div><div class="fbox b2"><i class="fa-solid fa-plane"></i></div></div></section>' +

            '<section class="stats">' + stats.map(function (s) {
                return '<button class="stat" data-action="statGo" data-go="' + s.go + '" data-f="' + (s.f || '') + '"><span class="stat-ico ' + s.t + '"><i class="fa-solid ' + s.ic + '"></i></span><span class="stat-k">' + esc(s.k) + '</span><strong class="' + (s.small ? 'sm' : '') + '">' + esc(s.v) + '</strong></button>';
            }).join('') + '</section>' +

            (todo.length ? '<section class="panel attention"><div class="panel-head"><div><h3>Needs your attention</h3><p>Things to review or complete.</p></div><span class="count-pill">' + todo.length + '</span></div>' +
                todo.map(function (t) { return '<div class="todo"><span class="todo-ico ' + t.t + '"><i class="fa-solid ' + t.ic + '"></i></span><div><b>' + esc(t.title) + '</b><p>' + esc(t.text) + '</p></div><button class="btn btn-soft btn-sm" ' + t.attr + '>' + esc(t.cta) + '</button></div>'; }).join('') + '</section>' : '') +

            '<div class="grid-2">' +
            '<section class="panel"><div class="panel-head"><div><h3>Recent shipments</h3><p>Stay up to date with your parcels.</p></div><button class="link-btn" data-nav="shipments">View all <i class="fa-solid fa-arrow-right"></i></button></div>' +
            (recent.length ? recent.map(shipRowCompact).join('') : emptyState('fa-box-open', 'No shipments yet', 'Create your first shipment to see it here.', can('ship.create') ? ctaBtn('Create shipment', 'data-nav="create"', 'fa-plus') : '')) + '</section>' +

            '<section class="panel"><div class="panel-head"><div><h3>Quick actions</h3><p>What would you like to do?</p></div></div><div class="quick">' +
            quick.map(function (q) {
                var inner = '<span class="q-ico ' + q.t + '"><i class="fa-solid ' + q.ic + '"></i></span><b>' + esc(q.l) + '</b><small>' + esc(q.s) + '</small>';
                if (q.link) return '<a class="q" href="' + q.link + '">' + inner + '</a>';
                if (q.nav) return '<button class="q" data-nav="' + q.nav + '">' + inner + '</button>';
                return '<button class="q" data-action="' + q.act + '" data-type="' + q.type + '">' + inner + '</button>';
            }).join('') + '</div></section></div>' +

            '<div class="grid-2">' + dashFamily() +
            '<section class="panel"><div class="panel-head"><div><h3>Latest activity</h3><p>Recent updates to your account.</p></div><button class="link-btn" data-nav="notifications">All <i class="fa-solid fa-arrow-right"></i></button></div>' +
            a.notifications.slice(0, 4).map(notifRow).join('') + '</section></div>';
    }
    function dashFamily() {
        var a = A();
        if (!can('members')) return '<section class="panel"><div class="panel-head"><div><h3>Your access</h3><p>Permissions in ' + esc(a.name) + '.</p></div></div><div class="perm-chips">' +
            ALL.filter(function (p) { return can(p); }).map(function (p) { return '<span class="chip ok"><i class="fa-solid fa-check"></i>' + esc(PERMS[p]) + '</span>'; }).join('') + '</div>' +
            '<div class="privacy-tip"><i class="fa-solid fa-lock"></i><span><b>Controlled by the account owner.</b> Billing, members and security stay private unless the owner grants access.</span></div></section>';
        return '<section class="panel"><div class="panel-head"><div><h3>' + (isBiz() ? 'Team & access' : 'Family & trusted access') + '</h3><p>People you have authorised to help.</p></div><button class="link-btn" data-nav="family">Manage <i class="fa-solid fa-arrow-right"></i></button></div>' +
            a.members.filter(function (m) { return m.role !== 'Owner'; }).slice(0, 3).map(function (m) {
                return '<div class="mini"><span class="m-av ' + avTone(m.name) + '">' + esc(initials(m.name)) + '</span><div><b>' + esc(m.name) + '</b><small>' + esc(m.rel) + ' · ' + esc(m.role) + '</small></div>' + memberStatus(m.status) + '</div>';
            }).join('') + '<div class="privacy-tip"><i class="fa-solid fa-lock"></i><span><b>Your account stays yours.</b> Members only see what you authorise. They cannot change ownership or security.</span></div></section>';
    }
    function avTone(n) { return ['peach', 'lilac', 'mint', 'sky'][String(n).length % 4]; }
    function memberStatus(s) { var m = { active: ['ok', 'Active'], invited: ['warn', 'Invited'], suspended: ['bad', 'Suspended'] }[s] || ['info', s]; return '<span class="badge ' + m[0] + '">' + m[1] + '</span>'; }
    function shipRowCompact(s) {
        var sv = SERVICES[s.service] || {};
        return '<button class="srow" data-open-ship="' + esc(s.id) + '"><span class="s-ico"><i class="fa-solid ' + (s.kind === 'Documents' ? 'fa-envelope' : s.kind === 'Commercial' ? 'fa-boxes-stacked' : 'fa-box') + '"></i></span>' +
            '<span class="s-main"><b>' + esc(s.id) + '</b><small>' + shipLabel(s) + '</small></span><span class="s-state">' + badge(s.status) + '<small>' + esc(s.eta) + '</small></span><i class="fa-solid fa-chevron-right chev"></i></button>';
    }
    function notifRow(n) {
        return '<button class="act ' + (n.unread ? 'unread' : '') + '" ' + (n.ship ? 'data-open-ship="' + esc(n.ship) + '"' : 'data-action="readNotif" data-id="' + esc(n.id) + '"') + '><span class="a-ico ' + n.tone + '"><i class="fa-solid ' + n.icon + '"></i></span><span><b>' + esc(n.title) + '</b><p>' + esc(n.text) + '</p><small>' + esc(n.time) + '</small></span>' + (n.unread ? '<i class="udot" aria-label="Unread"></i>' : '') + '</button>';
    }

    /* ---------- Shipments ---------- */
    function matchFilter(s) {
        var f = filterState.status, q = filterState.q.toLowerCase();
        var okS = f === 'all' || (f === 'active' && s.status !== 'delivered') || (f === 'transit' && (s.status === 'transit' || s.status === 'customs')) || (f === 'delivered' && s.status === 'delivered') || (f === 'pending' && (s.status === 'booked' || s.status === 'pickup' || s.status === 'exception'));
        var rec = byId(A().receivers, s.receiver);
        var hay = (s.id + ' ' + s.from + ' ' + s.to + ' ' + s.desc + ' ' + (rec ? rec.name : '') + ' ' + (STATUS[s.status] || {}).label).toLowerCase();
        return okS && (!q || hay.indexOf(q) > -1);
    }
    function shipListHtml() {
        var list = A().shipments.filter(matchFilter);
        if (!list.length) return emptyState('fa-magnifying-glass', 'No shipments found', 'Try a different search or filter.', '<button class="btn btn-soft" data-action="clearFilters">Clear filters</button>');
        return '<div class="tbl-head"><span>Shipment</span><span>Route</span><span>Date</span><span>Service</span><span>Status</span><span></span></div>' + list.map(function (s) {
            var sv = SERVICES[s.service] || { name: '' }, rec = byId(A().receivers, s.receiver);
            return '<div class="trow" role="row"><button class="t-main" data-open-ship="' + esc(s.id) + '"><b>' + esc(s.id) + '</b><small>' + esc(s.kind) + ' · ' + esc(s.weight) + ' kg</small></button>' +
                '<div class="t-route" data-l="Route">' + shipLabel(s) + '<small>' + (rec ? 'To ' + esc(rec.name) : '') + '</small></div>' +
                '<div class="t-date" data-l="Ship date">' + esc(s.date) + '</div><div class="t-svc" data-l="Service">' + esc(sv.name) + '</div>' +
                '<div class="t-st" data-l="Status">' + badge(s.status) + '</div>' +
                '<div class="t-act"><button class="btn btn-soft btn-sm" data-action="trackShip" data-id="' + esc(s.id) + '"><i class="fa-solid fa-location-dot"></i> Track</button></div></div>';
        }).join('');
    }
    function vShipments() {
        if (!can('ship.view')) return locked('shipments');
        var sh = A().shipments, c = function (f) { var o = filterState.status; filterState.status = f; var n = sh.filter(matchFilter).length; filterState.status = o; return n; };
        var oldQ = filterState.q; filterState.q = ''; var counts = { all: c('all'), active: c('active'), transit: c('transit'), pending: c('pending'), delivered: c('delivered') }; filterState.q = oldQ;
        var chips = [['all', 'All'], ['active', 'Active'], ['transit', 'In transit'], ['pending', 'Pending'], ['delivered', 'Delivered']];
        return pageHead('SHIPMENT MANAGEMENT', 'My shipments', 'Every shipment in ' + A().name + ', in one place.', can('ship.create') ? '<a class="btn btn-primary" href="#create" data-nav="create"><i class="fa-solid fa-plus"></i> Create shipment</a>' : '') +
            '<div class="toolbar"><label class="search"><i class="fa-solid fa-magnifying-glass"></i><input id="shipSearch" type="search" placeholder="Search ID, city, receiver or item" value="' + esc(filterState.q) + '" aria-label="Search shipments"></label></div>' +
            '<div class="chips scroll-x" role="tablist" aria-label="Filter by status">' + chips.map(function (c2) { return '<button class="fchip' + (filterState.status === c2[0] ? ' on' : '') + '" data-action="filter" data-f="' + c2[0] + '">' + c2[1] + '<b>' + counts[c2[0]] + '</b></button>'; }).join('') + '</div>' +
            '<section class="panel flush" id="shipList">' + shipListHtml() + '</section>';
    }

    /* ---------- Shipment detail ---------- */
    function openShipment(id) {
        var s = findShip(id); if (!s) { toast('Shipment not found in this account.', 'bad'); return; }
        if (!can('ship.view')) { toast('Your role cannot view shipment details.', 'bad'); return; }
        var sv = SERVICES[s.service] || { name: '', eta: '' }, snd = byId(A().senders, s.sender), rcv = byId(A().receivers, s.receiver);
        var step = STATUS[s.status].step, bad = s.status === 'exception';
        var docs = A().documents.filter(function (d) { return d.ship === s.id; });
        var body = '<div class="d-top"><div><span class="lbl">Shipment number</span><div class="d-id"><strong>' + esc(s.id) + '</strong><button class="copy" data-action="copy" data-text="' + esc(s.id) + '"><i class="fa-regular fa-copy"></i> Copy</button></div></div>' + badge(s.status) + '</div>' +
            (bad ? '<div class="alert bad"><i class="fa-solid fa-triangle-exclamation"></i><span>' + esc(s.note || 'This shipment needs your attention.') + '</span></div>' : '') +
            '<ol class="stepper' + (bad ? ' is-bad' : '') + '" aria-label="Shipment progress">' + STEPS.map(function (l, i) { return '<li class="' + (i < step ? 'done' : i === step ? 'cur' : '') + '"><span><i class="fa-solid fa-check"></i></span><b>' + l + '</b></li>'; }).join('') + '</ol>' +
            '<div class="facts"><div><small>Route</small><b>' + shipLabel(s) + '</b></div><div><small>Weight</small><b>' + esc(s.weight) + ' kg</b></div><div><small>Service</small><b>' + esc(sv.name) + '</b></div><div><small>Estimate</small><b>' + esc(s.eta) + '</b></div><div><small>Contents</small><b>' + esc(s.desc) + '</b></div><div><small>Created by</small><b>' + esc(s.by) + '</b></div></div>' +
            '<div class="parties"><div><span class="lbl">Sender</span><b>' + esc(snd ? snd.name : '—') + '</b><small>' + esc(snd ? snd.addr + ', ' + snd.city : '') + '</small></div><div><span class="lbl">Receiver</span><b>' + esc(rcv ? rcv.name : '—') + '</b><small>' + esc(rcv ? rcv.addr + ', ' + rcv.city + ', ' + rcv.country : '') + '</small></div></div>' +
            '<h3 class="sub-h">Tracking history</h3><ol class="tl">' + s.events.map(function (e, i) { return '<li class="' + (i === 0 ? 'cur' : '') + '"><b>' + esc(e.title) + '</b><small>' + esc(e.t) + ' · ' + esc(e.loc) + '</small></li>'; }).join('') + '</ol>' +
            (can('docs.view') && docs.length ? '<h3 class="sub-h">Documents</h3>' + docs.map(function (d) { return '<div class="doc-line"><i class="fa-regular fa-file-pdf"></i><span>' + esc(d.name) + '</span><button class="btn btn-soft btn-sm" data-action="download" data-name="' + esc(d.name) + '">Download</button></div>'; }).join('') : '');
        openModal({
            title: 'Shipment details', sub: 'Private account tracking — richer than public tracking.', wide: true, body: body,
            footer: '<button class="btn btn-ghost" data-action="supportFor" data-id="' + esc(s.id) + '"><i class="fa-regular fa-comments"></i> Get help</button>' + (can('ship.create') ? '<button class="btn btn-primary" data-action="repeat" data-id="' + esc(s.id) + '"><i class="fa-solid fa-rotate-right"></i> Repeat shipment</button>' : '')
        });
    }

    /* ---------- Tracking ---------- */
    function vTracking() {
        if (!can('track')) return locked('tracking');
        return pageHead('SHIPMENT VISIBILITY', 'Track your shipment', 'Account shipments show full details. For any other parcel use public tracking.') +
            '<section class="panel track-card"><span class="track-ico"><i class="fa-solid fa-location-crosshairs"></i></span><h2>Where is your parcel?</h2><p>Enter a JP Express shipment or AWB number.</p>' +
            '<form id="trackForm" class="track-form" novalidate><input id="trackInput" placeholder="e.g. JPX-2048-6192" aria-label="Shipment or AWB number" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="btn btn-primary" type="submit">Track <i class="fa-solid fa-arrow-right"></i></button></form>' +
            '<div class="sample">Your shipments: ' + A().shipments.slice(0, 4).map(function (s) { return '<button class="mini-chip" data-action="trackShip" data-id="' + esc(s.id) + '">' + esc(s.id) + '</button>'; }).join('') + '</div></section>' +
            '<div id="trackResult" aria-live="polite"></div>';
    }
    function showTrack(id) {
        id = String(id || '').trim(); var out = $('#trackResult'); if (!out) return;
        if (!id) { out.innerHTML = '<div class="alert warn"><i class="fa-solid fa-circle-info"></i><span>Enter a shipment number to track.</span></div>'; return; }
        var s = findShip(id);
        if (!s) { out.innerHTML = '<section class="panel"><div class="alert warn"><i class="fa-solid fa-circle-info"></i><span><b>' + esc(id.toUpperCase()) + '</b> is not in ' + esc(A().name) + '. Check the number, or use <a href="track-shipment.html">public tracking</a> for any JP Express parcel.</span></div></section>'; return; }
        var step = STATUS[s.status].step;
        out.innerHTML = '<section class="panel"><div class="d-top"><div><span class="lbl">Shipment</span><div class="d-id"><strong>' + esc(s.id) + '</strong></div><p class="muted-p">' + shipLabel(s) + ' · ' + esc(s.eta) + '</p></div>' + badge(s.status) + '</div>' +
            '<ol class="stepper' + (s.status === 'exception' ? ' is-bad' : '') + '">' + STEPS.map(function (l, i) { return '<li class="' + (i < step ? 'done' : i === step ? 'cur' : '') + '"><span><i class="fa-solid fa-check"></i></span><b>' + l + '</b></li>'; }).join('') + '</ol>' +
            '<ol class="tl">' + s.events.map(function (e, i) { return '<li class="' + (i === 0 ? 'cur' : '') + '"><b>' + esc(e.title) + '</b><small>' + esc(e.t) + ' · ' + esc(e.loc) + '</small></li>'; }).join('') + '</ol>' +
            '<div class="row-actions"><button class="btn btn-soft" data-open-ship="' + esc(s.id) + '">Full details</button></div></section>';
        out.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }

    /* ---------- Create shipment wizard ---------- */
    function defContact(list) { var d = list.filter(function (c) { return c.def; })[0] || list[0]; return d ? d.id : ''; }
    function newWiz(base) {
        var a = A();
        return Object.assign({ step: 1, sender: defContact(a.senders), receiver: defContact(a.receivers), type: 'Parcel', weight: '', unit: 'kg', l: '', w: '', h: '', pcs: 1, desc: '', value: '', service: 'express', agree: false }, base || {});
    }
    function chargeable(w) {
        var kg = Number(w.weight) * (w.unit === 'lb' ? .4536 : w.unit === 'g' ? .001 : 1);
        var vol = (Number(w.l) * Number(w.w) * Number(w.h) / 5000) * (Number(w.pcs) || 1);
        return { actual: kg, vol: isFinite(vol) ? vol : 0, charge: Math.max(kg, isFinite(vol) ? vol : 0) };
    }
    function priceFor(svc, w, country) {
        var s = SERVICES[svc], c = chargeable(w).charge, z = COUNTRIES[country] || 1.1;
        var chunk = Math.ceil(c * 2) / 2;
        return Math.round((s.base + s.perKg * chunk) * z / 10) * 10;
    }
    var WSTEPS = ['Contacts', 'Package', 'Service', 'Review'];
    function stepsBar() {
        return '<ol class="wsteps" aria-label="Create shipment steps">' + WSTEPS.map(function (l, i) { var n = i + 1; return '<li class="' + (n < wiz.step ? 'done' : n === wiz.step ? 'cur' : '') + '"><span>' + (n < wiz.step ? '<i class="fa-solid fa-check"></i>' : n) + '</span><b>' + l + '</b></li>'; }).join('') + '</ol>';
    }
    function contactCards(list, kind, sel) {
        if (!list.length) return '<div class="alert warn"><i class="fa-solid fa-circle-info"></i><span>No saved ' + kind + 's yet. Add one to continue.</span></div>';
        return '<div class="pick">' + list.map(function (c) {
            return '<label class="pickc"><input type="radio" name="' + kind + '" value="' + esc(c.id) + '"' + (sel === c.id ? ' checked' : '') + '><span><b>' + esc(c.label) + (c.def ? ' <em>Default</em>' : '') + '</b><small>' + esc(c.name) + '</small><small>' + esc(c.city) + ', ' + esc(c.country) + '</small></span><i class="fa-solid fa-circle-check"></i></label>';
        }).join('') + '</div>';
    }
    function vCreate() {
        if (!can('ship.create')) return locked('create');
        if (!wiz) wiz = newWiz();
        var a = A(), body = '';
        if (wiz.step === 1) {
            body = '<h3 class="sub-h first">Who is sending?</h3>' + contactCards(a.senders, 'sender', wiz.sender) +
                (can('contacts') ? '<button class="link-btn add" data-action="addContact" data-type="sender" data-wiz="1"><i class="fa-solid fa-plus"></i> Add new sender</button>' : '') +
                '<h3 class="sub-h">Who is receiving?</h3>' + contactCards(a.receivers, 'receiver', wiz.receiver) +
                (can('contacts') ? '<button class="link-btn add" data-action="addContact" data-type="receiver" data-wiz="1"><i class="fa-solid fa-plus"></i> Add new receiver</button>' : '');
        } else if (wiz.step === 2) {
            body = '<div class="seg" role="radiogroup" aria-label="Shipment type">' + [['Documents', 'fa-file-lines'], ['Parcel', 'fa-box-open'], ['Commercial', 'fa-boxes-stacked']].map(function (t) { return '<label><input type="radio" name="type" value="' + t[0] + '"' + (wiz.type === t[0] ? ' checked' : '') + '><span><i class="fa-solid ' + t[1] + '"></i>' + t[0] + '</span></label>'; }).join('') + '</div>' +
                '<div class="form-grid">' + field('Total weight', 'weight', { value: wiz.weight, type: 'number', inputmode: 'decimal', step: 'any', min: 0, ph: 'e.g. 2.5', req: 1 }) +
                field('Unit', 'unit', { type: 'select', options: ['kg', 'g', 'lb'], value: wiz.unit }) +
                field('Length (cm)', 'l', { value: wiz.l, type: 'number', inputmode: 'decimal', step: 'any', min: 0, ph: 'L' }) + field('Width (cm)', 'w', { value: wiz.w, type: 'number', inputmode: 'decimal', step: 'any', min: 0, ph: 'W' }) +
                field('Height (cm)', 'h', { value: wiz.h, type: 'number', inputmode: 'decimal', step: 'any', min: 0, ph: 'H' }) + field('Number of pieces', 'pcs', { value: wiz.pcs, type: 'number', inputmode: 'numeric', min: 1 }) +
                field('What is inside?', 'desc', { value: wiz.desc, ph: 'e.g. clothes and gifts', max: 120, span: 1, req: 1 }) + field('Approx. value (৳)', 'value', { value: wiz.value, type: 'number', inputmode: 'decimal', min: 0, ph: 'Optional' }) + '</div>' +
                '<p class="note"><i class="fa-solid fa-circle-info"></i> Bulky parcels are priced on the space they take. Add size so we can work out the chargeable weight (length × width × height ÷ 5,000).</p>';
        } else if (wiz.step === 3) {
            var rcv = byId(a.receivers, wiz.receiver), ch = chargeable(wiz);
            body = '<div class="chg"><div><small>Actual</small><b>' + ch.actual.toFixed(2) + ' kg</b></div><div><small>Volumetric</small><b>' + ch.vol.toFixed(2) + ' kg</b></div><div class="hl"><small>Chargeable</small><b>' + ch.charge.toFixed(2) + ' kg</b></div></div><div class="pick svc">' +
                Object.keys(SERVICES).map(function (k) {
                    var s = SERVICES[k], off = s.docOnly && wiz.type !== 'Documents';
                    return '<label class="pickc' + (off ? ' off' : '') + '"><input type="radio" name="service" value="' + k + '"' + (wiz.service === k ? ' checked' : '') + (off ? ' disabled' : '') + '><span><b><i class="fa-solid ' + s.icon + '"></i> ' + esc(s.name) + '</b><small>' + esc(s.eta) + (off ? ' · documents only' : '') + '</small></span><strong class="price">' + (off ? '—' : money(priceFor(k, wiz, rcv ? rcv.country : ''))) + '</strong><i class="fa-solid fa-circle-check"></i></label>';
                }).join('') + '</div><p class="note"><i class="fa-solid fa-circle-info"></i> Indicative estimate from the details you entered. Duties, taxes and surcharges at the destination are usually separate. Your confirmed quote is the final price.</p>';
        } else {
            var sn = byId(a.senders, wiz.sender), rc = byId(a.receivers, wiz.receiver), sv = SERVICES[wiz.service], c2 = chargeable(wiz), pr = priceFor(wiz.service, wiz, rc.country);
            body = '<div class="review"><div class="rv"><span class="lbl">Sender</span><b>' + esc(sn.name) + '</b><small>' + esc(sn.addr) + ', ' + esc(sn.city) + '</small></div><div class="rv"><span class="lbl">Receiver</span><b>' + esc(rc.name) + '</b><small>' + esc(rc.addr) + ', ' + esc(rc.city) + ', ' + esc(rc.country) + '</small></div>' +
                '<div class="rv"><span class="lbl">Package</span><b>' + esc(wiz.type) + ' · ' + esc(c2.charge.toFixed(2)) + ' kg chargeable</b><small>' + esc(wiz.desc) + (wiz.pcs > 1 ? ' · ' + esc(wiz.pcs) + ' pieces' : '') + '</small></div>' +
                '<div class="rv"><span class="lbl">Service</span><b>' + esc(sv.name) + '</b><small>' + esc(sv.eta) + '</small></div></div>' +
                '<div class="total"><span>Estimated shipping cost</span><strong>' + money(pr) + '</strong></div>' +
                '<label class="check"><input type="checkbox" id="wAgree"' + (wiz.agree ? ' checked' : '') + '><span>I confirm these details are correct and the shipment has no restricted or prohibited items. <a href="shipping-guides.html" target="_blank" rel="noopener">See restricted items</a></span></label><small class="err block" id="agreeErr" role="alert"></small>';
        }
        var last = wiz.step === 4;
        return pageHead('NEW SHIPMENT', 'Create a shipment', 'Account: ' + A().name) + '<section class="panel wiz">' + stepsBar() + '<form id="wizForm" novalidate>' + body + '</form>' +
            '<div class="wiz-actions">' + (wiz.step > 1 ? '<button class="btn btn-ghost" data-action="wizBack"><i class="fa-solid fa-arrow-left"></i> Back</button>' : '<button class="btn btn-ghost" data-action="wizCancel">Cancel</button>') +
            (last ? (can('quote') ? '<button class="btn btn-soft" data-action="wizQuote">Save as quote</button>' : '') + '<button class="btn btn-primary" data-action="wizConfirm"><i class="fa-solid fa-check"></i> Confirm booking</button>' : '<button class="btn btn-primary" data-action="wizNext">Continue <i class="fa-solid fa-arrow-right"></i></button>') + '</div></section>';
    }
    function readWiz() {
        var f = $('#wizForm'); if (!f) return;
        if (wiz.step === 1) { var s = $('input[name=sender]:checked', f), r = $('input[name=receiver]:checked', f); if (s) wiz.sender = s.value; if (r) wiz.receiver = r.value; }
        if (wiz.step === 2) { var d = formData(f); var t = $('input[name=type]:checked', f); if (t) wiz.type = t.value;['weight', 'unit', 'l', 'w', 'h', 'pcs', 'desc', 'value'].forEach(function (k) { if (d[k] != null) wiz[k] = d[k]; }); }
        if (wiz.step === 3) { var sv = $('input[name=service]:checked', f); if (sv) wiz.service = sv.value; }
    }
    function wizValidate() {
        var f = $('#wizForm'); readWiz();
        if (wiz.step === 1) { if (!wiz.sender || !wiz.receiver) { toast('Choose a sender and a receiver to continue.', 'bad'); return false; } }
        if (wiz.step === 2) {
            var bad = false, w = Number(wiz.weight);
            setErr(f, 'weight', !wiz.weight || !(w > 0) ? 'Enter the total weight.' : (w > 500 && wiz.unit === 'kg') ? 'Over 500 kg? Please request a freight quote.' : ''); if (!wiz.weight || !(w > 0) || (w > 500 && wiz.unit === 'kg')) bad = true;
            ['l', 'w', 'h'].forEach(function (k) { var v = wiz[k]; var any = wiz.l || wiz.w || wiz.h; var m = any && !(Number(v) > 0) ? 'Required' : ''; setErr(f, k, m); if (m) bad = true; });
            var pcs = Number(wiz.pcs); setErr(f, 'pcs', pcs >= 1 && pcs <= 999 && pcs % 1 === 0 ? '' : '1–999'); if (!(pcs >= 1 && pcs <= 999 && pcs % 1 === 0)) bad = true;
            setErr(f, 'desc', wiz.desc.length < 2 ? 'Tell us what is inside.' : ''); if (wiz.desc.length < 2) bad = true;
            if (bad) { var fb = firstBad(f); if (fb) fb.focus(); return false; }
            if (SERVICES[wiz.service].docOnly && wiz.type !== 'Documents') wiz.service = 'express';
        }
        if (wiz.step === 3) { var sv = SERVICES[wiz.service]; if (!sv || (sv.docOnly && wiz.type !== 'Documents')) { toast('Choose a service.', 'bad'); return false; } }
        return true;
    }
    function makeShipment(status) {
        var a = A(), rc = byId(a.receivers, wiz.receiver), sn = byId(a.senders, wiz.sender);
        var n = a.shipments.length, id = 'JPX-' + (a.kind === 'business' ? 3013 + n : 2050 + n) + '-' + Math.floor(1000 + Math.random() * 9000);
        var ch = chargeable(wiz).charge;
        var s = { id: id, from: sn.city, to: rc.city, toCountry: rc.country, weight: Math.round(ch * 100) / 100, kind: wiz.type, service: wiz.service, status: 'booked', date: dateOnly(), eta: 'Pickup pending', desc: wiz.desc, sender: sn.id, receiver: rc.id, by: A().user.name, events: ev([[nowStamp(), 'Booking confirmed', sn.city + ', BD'], [nowStamp(), 'Pickup request received', sn.city + ', BD']]) };
        a.shipments.unshift(s);
        if (can('billing.view') || a.kind === 'personal') a.invoices.unshift({ id: 'INV-2026-' + (430 + a.invoices.length), ship: id, amount: priceFor(wiz.service, wiz, rc.country), status: 'unpaid', date: dateOnly(), due: 'In 10 days' });
        a.notifications.unshift({ id: uid('n'), icon: 'fa-box', tone: 'info', title: 'Booking confirmed', text: id + ' is booked. We will contact you to arrange pickup.', time: 'Just now', ship: id, unread: true });
        return s;
    }
    function wizNext() { if (!wizValidate()) return; wiz.step++; render(); }
    function wizConfirm() {
        readWiz(); var ag = $('#wAgree'); wiz.agree = ag && ag.checked;
        if (!wiz.agree) { $('#agreeErr').textContent = 'Please confirm to continue.'; $('#wAgree').focus(); return; }
        var s = makeShipment(); save(); sync('shipments', s); wiz = null; updateChrome();
        openModal({
            title: 'Booking confirmed', body: '<div class="done-box"><span class="done-ico"><i class="fa-solid fa-check"></i></span><h3>' + esc(s.id) + '</h3><p>Your shipment is booked. Our team will contact you to arrange pickup, and your invoice is ready in Invoices &amp; payments.</p></div>',
            footer: '<button class="btn btn-ghost" data-action="closeModal" data-nav="shipments">View shipments</button><button class="btn btn-primary" data-action="trackShip" data-id="' + esc(s.id) + '">Track it</button>'
        });
        go('shipments');
    }
    function wizQuote() {
        readWiz(); var a = A(), rc = byId(a.receivers, wiz.receiver), sn = byId(a.senders, wiz.sender);
        var q = { id: 'QT-2026-' + (200 + a.quotes.length), to: rc.city, toCountry: rc.country, from: sn.city, weight: Math.round(chargeable(wiz).charge * 100) / 100, kind: wiz.type, service: wiz.service, price: priceFor(wiz.service, wiz, rc.country), valid: 'In 7 days', status: 'open', requested: dateOnly(), sender: sn.id, receiver: rc.id, desc: wiz.desc };
        a.quotes.unshift(q); save(); sync('quotes', q); wiz = null; toast('Quote ' + q.id + ' saved. Find it under Quotes & bookings.', 'ok'); go('quotes');
    }

    /* ---------- Quotes ---------- */
    function vQuotes() {
        if (!can('quote')) return locked('quotes');
        var a = A(), qs = a.quotes;
        return pageHead('PRICING & BOOKINGS', 'Quotes & bookings', 'Compare, accept and turn quotes into bookings.', (can('ship.create') ? '<a class="btn btn-primary" href="#create" data-nav="create"><i class="fa-solid fa-plus"></i> New quote</a>' : '')) +
            '<div class="alert info"><i class="fa-solid fa-circle-info"></i><span>Quotes are indicative until confirmed by JP Express. Business contract rates appear here once approved for your account.</span></div>' +
            (qs.length ? '<div class="cards">' + qs.map(function (q) {
                var sv = SERVICES[q.service] || { name: '' }, st = { open: ['warn', 'Open'], booked: ['ok', 'Booked'], expired: ['bad', 'Expired'] }[q.status];
                return '<article class="panel qcard"><div class="qc-top"><span class="stat-ico violet"><i class="fa-solid fa-file-invoice-dollar"></i></span><div><b>' + esc(q.id) + '</b><small>Requested ' + esc(q.requested) + '</small></div><span class="badge ' + st[0] + '">' + st[1] + '</span></div>' +
                    '<div class="qc-route">' + esc(q.from) + ' <i class="fa-solid fa-arrow-right-long arrow"></i> ' + esc(q.to) + '</div><div class="qc-meta"><span>' + esc(q.kind) + ' · ' + esc(q.weight) + ' kg</span><span>' + esc(sv.name) + '</span></div>' +
                    '<div class="qc-price"><div><small>Estimated price</small><strong>' + money(q.price) + '</strong></div><small>' + (q.status === 'open' ? 'Valid until ' + esc(q.valid) : q.status === 'booked' ? 'Booked as ' + esc(q.shipmentId || '') : 'Expired ' + esc(q.valid)) + '</small></div>' +
                    '<div class="qc-actions">' + (q.status === 'open' && can('ship.create') ? '<button class="btn btn-primary btn-sm" data-action="acceptQuote" data-id="' + esc(q.id) + '">Accept &amp; book</button>' : '') +
                    (q.status === 'booked' && q.shipmentId ? '<button class="btn btn-soft btn-sm" data-open-ship="' + esc(q.shipmentId) + '">View shipment</button>' : '') + (q.status === 'expired' && can('ship.create') ? '<button class="btn btn-soft btn-sm" data-action="requote" data-id="' + esc(q.id) + '">Request again</button>' : '') + '</div></article>';
            }).join('') + '</div>' : '<section class="panel">' + emptyState('fa-file-invoice-dollar', 'No quotes yet', 'Start a shipment and choose “Save as quote”.', ctaBtn('Create shipment', 'data-nav="create"', 'fa-plus')) + '</section>');
    }
    function acceptQuote(id) {
        var a = A(), q = byId(a.quotes, id); if (!q || q.status !== 'open') return;
        confirmBox({
            title: 'Accept quote ' + q.id + '?', text: 'This books a shipment from ' + q.from + ' to ' + q.to + ' for about ' + money(q.price) + '. You can track it right after.', ok: 'Accept & book', onOk: function () {
                wiz = newWiz({ sender: q.sender, receiver: q.receiver, type: q.kind, weight: q.weight, desc: q.desc, service: q.service });
                var s = makeShipment(); q.status = 'booked'; q.shipmentId = s.id; wiz = null; save(); sync('quotes/accept', { id: q.id }); updateChrome(); toast('Booked ' + s.id, 'ok'); render();
            }
        });
    }
    function requote(id) { var q = byId(A().quotes, id); if (!q) return; wiz = newWiz({ sender: q.sender, receiver: q.receiver, type: q.kind, weight: q.weight, desc: q.desc, service: q.service, step: 2 }); go('create'); }
    function repeatShip(id) {
        var s = findShip(id); if (!s) return; closeModal();
        wiz = newWiz({ sender: s.sender, receiver: s.receiver, type: s.kind, weight: s.weight, desc: s.desc, service: s.service, step: 2 });
        toast('Details copied. Review and adjust before booking.'); go('create');
    }

    /* ---------- Address book ---------- */
    function vContacts() {
        if (!can('contacts')) return locked('contacts');
        var a = A(), tab = contactTab, list = tab === 'senders' ? a.senders : a.receivers;
        return pageHead('SAVED CONTACTS', 'Address book', 'Save senders and receivers once. Reuse them on every shipment.', '<button class="btn btn-primary" data-action="addContact" data-type="' + (tab === 'senders' ? 'sender' : 'receiver') + '"><i class="fa-solid fa-plus"></i> Add ' + (tab === 'senders' ? 'sender' : 'receiver') + '</button>') +
            '<div class="tabs" role="tablist"><button role="tab" class="' + (tab === 'receivers' ? 'on' : '') + '" data-action="ctab" data-t="receivers" aria-selected="' + (tab === 'receivers') + '"><i class="fa-solid fa-location-dot"></i> Receivers <b>' + a.receivers.length + '</b></button><button role="tab" class="' + (tab === 'senders' ? 'on' : '') + '" data-action="ctab" data-t="senders" aria-selected="' + (tab === 'senders') + '"><i class="fa-solid fa-house-user"></i> Senders <b>' + a.senders.length + '</b></button></div>' +
            (list.length ? '<div class="cards">' + list.map(function (c) {
                return '<article class="panel ccard"><div class="cc-top"><span class="m-av ' + avTone(c.name) + '">' + esc(initials(c.name)) + '</span><div><b>' + esc(c.label) + '</b><small>' + esc(c.name) + '</small></div>' + (c.def ? '<span class="badge info">Default</span>' : '') + '</div>' +
                    '<p class="addr">' + esc(c.addr) + '<br>' + esc(c.city) + (c.postal ? ' ' + esc(c.postal) : '') + ', ' + esc(c.country) + '</p><div class="cc-meta"><span><i class="fa-solid fa-phone"></i> ' + esc(c.phone) + '</span>' + (c.email ? '<span><i class="fa-regular fa-envelope"></i> ' + esc(c.email) + '</span>' : '') + '</div>' +
                    '<div class="cc-actions">' + (can('ship.create') ? '<button class="btn btn-soft btn-sm" data-action="shipWith" data-id="' + esc(c.id) + '" data-type="' + (tab === 'senders' ? 'sender' : 'receiver') + '"><i class="fa-solid fa-paper-plane"></i> Ship ' + (tab === 'senders' ? 'from' : 'to') + '</button>' : '') +
                    '<button class="btn btn-ghost btn-sm" data-action="editContact" data-id="' + esc(c.id) + '" data-type="' + (tab === 'senders' ? 'sender' : 'receiver') + '">Edit</button>' +
                    (!c.def ? '<button class="btn btn-ghost btn-sm" data-action="defContact" data-id="' + esc(c.id) + '" data-type="' + (tab === 'senders' ? 'sender' : 'receiver') + '">Make default</button>' : '') +
                    '<button class="btn btn-ghost btn-sm danger" data-action="delContact" data-id="' + esc(c.id) + '" data-type="' + (tab === 'senders' ? 'sender' : 'receiver') + '" aria-label="Delete ' + esc(c.label) + '"><i class="fa-regular fa-trash-can"></i></button></div></article>';
            }).join('') + '</div>' : '<section class="panel">' + emptyState('fa-address-book', 'No saved ' + tab, 'Add one to skip typing the same details again.', ctaBtn('Add ' + (tab === 'senders' ? 'sender' : 'receiver'), 'data-action="addContact" data-type="' + (tab === 'senders' ? 'sender' : 'receiver') + '"', 'fa-plus')) + '</section>') +
            '<div class="privacy-tip"><i class="fa-solid fa-lock"></i><span><b>Contacts belong to this account.</b> Only members you authorise can see them, and they never appear in another account.</span></div>';
    }
    function contactModal(type, id, wizFlag) {
        var a = A(), list = type === 'sender' ? a.senders : a.receivers, c = id ? byId(list, id) : null;
        var countries = ['Bangladesh'].concat(Object.keys(COUNTRIES));
        var el = openModal({
            title: (c ? 'Edit ' : 'Add ') + type, sub: 'Saved to ' + a.name,
            body: '<form id="cForm" novalidate><div class="form-grid">' + field('Nickname', 'label', { value: c ? c.label : '', ph: type === 'sender' ? 'e.g. Home, Mother – Dhaka' : 'e.g. Arif – New York', max: 40, req: 1, span: 1 }) + field('Full name', 'name', { value: c ? c.name : '', ac: 'name', req: 1 }) +
                field('Phone', 'phone', { value: c ? c.phone : '', type: 'tel', inputmode: 'tel', ph: '+880 1XXX XXXXXX', req: 1 }) + field('Email (optional)', 'email', { value: c ? c.email : '', type: 'email', inputmode: 'email' }) +
                field('Street address', 'addr', { value: c ? c.addr : '', ph: 'House, road, area', req: 1, span: 1 }) + field('City', 'city', { value: c ? c.city : '', req: 1 }) + field('Postal code', 'postal', { value: c ? c.postal : '' }) +
                field('Country', 'country', { type: 'select', options: countries, value: c ? c.country : (type === 'sender' ? 'Bangladesh' : 'United States'), req: 1 }) + '</div>' +
                '<label class="check"><input type="checkbox" name="def"' + (c && c.def ? ' checked' : '') + '><span>Use as my default ' + type + '</span></label></form>',
            footer: '<button class="btn btn-ghost" data-action="closeModal">Cancel</button><button class="btn btn-primary" id="cSave"><i class="fa-solid fa-check"></i> Save ' + type + '</button>'
        });
        function submit() {
            var f = $('#cForm', el), d = formData(f), bad = false;
            function chk(n, m) { setErr(f, n, m); if (m) bad = true; }
            chk('label', d.label.length < 2 ? 'Give this contact a short nickname.' : ''); chk('name', d.name.length < 2 ? 'Enter the full name.' : '');
            chk('phone', phoneOk(d.phone) ? '' : 'Enter a valid phone number.'); chk('email', d.email && !EMAIL.test(d.email) ? 'Enter a valid email address.' : '');
            chk('addr', d.addr.length < 5 ? 'Enter the street address.' : ''); chk('city', d.city.length < 2 ? 'Enter the city.' : '');
            if (bad) { var fb = firstBad(f); if (fb) fb.focus(); return; }
            var rec = { id: c ? c.id : uid(type[0]), label: d.label, name: d.name, phone: d.phone, email: d.email, addr: d.addr, city: d.city, postal: d.postal, country: d.country, def: !!d.def };
            if (rec.def) list.forEach(function (x) { x.def = false; });
            if (c) Object.assign(c, rec); else { if (!list.length) rec.def = true; list.push(rec); }
            save(); sync('contacts', rec); closeModal();
            if (wizFlag && wiz) { if (type === 'sender') wiz.sender = rec.id; else wiz.receiver = rec.id; }
            toast(c ? 'Contact updated.' : 'Contact saved.', 'ok'); render();
        }
        $('#cSave', el).addEventListener('click', submit);
        $('#cForm', el).addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    }
    function deleteContact(type, id) {
        var a = A(), list = type === 'sender' ? a.senders : a.receivers, c = byId(list, id);
        var used = a.shipments.filter(function (s) { return s[type] === id; }).length;
        if (used) { toast('This contact is on ' + used + ' shipment' + (used > 1 ? 's' : '') + '. Edit it instead so your history stays complete.', 'bad'); return; }
        confirmBox({ title: 'Delete “' + c.label + '”?', text: 'This removes the saved contact. It cannot be undone.', ok: 'Delete', danger: true, onOk: function () { var i = list.indexOf(c); list.splice(i, 1); if (c.def && list[0]) list[0].def = true; save(); toast('Contact deleted.'); render(); } });
    }

    /* ---------- Family / team ---------- */
    function vFamily() {
        if (!can('members')) return locked('family');
        var a = A(), biz = isBiz();
        return pageHead('SHARED, CONTROLLED ACCESS', biz ? 'Team & access' : 'Family & trusted access', biz ? 'Invite employees and assign the right role.' : 'Invite people to help with shipments while keeping your account secure.', '<button class="btn btn-primary" data-action="inviteMember"><i class="fa-solid fa-user-plus"></i> Invite a member</button>') +
            '<div class="alert info"><i class="fa-solid fa-shield-halved"></i><span><b>You remain the account owner.</b> Members only get the permissions you select. They can never change ownership, manage other members or open your security settings.</span></div>' +
            '<section class="panel flush"><div class="mem-head"><span>Member</span><span>Role</span><span>Access</span><span>Status</span><span></span></div>' + a.members.map(function (m) {
                var own = m.role === 'Owner';
                return '<div class="mem"><div class="mem-p"><span class="m-av ' + avTone(m.name) + '">' + esc(initials(m.name)) + '</span><span><b>' + esc(m.name) + (own ? ' <em class="you">You</em>' : '') + '</b><small>' + esc(m.rel) + ' · ' + esc(m.email) + '</small></span></div>' +
                    '<div data-l="Role"><span class="role-chip">' + esc(m.role) + '</span></div><div data-l="Access" class="mem-acc">' + (own ? 'Full control' : m.perms.filter(function (p) { return GRANTABLE.indexOf(p) > -1; }).length + ' of ' + GRANTABLE.length + ' permissions') + '</div><div data-l="Status">' + memberStatus(m.status) + '</div>' +
                    '<div class="mem-act">' + (own ? '' : '<button class="btn btn-soft btn-sm" data-action="editMember" data-id="' + esc(m.id) + '">Edit access</button><button class="icon-btn sm" data-action="toggleMember" data-id="' + esc(m.id) + '" aria-label="' + (m.status === 'suspended' ? 'Reactivate' : 'Suspend') + ' ' + esc(m.name) + '" title="' + (m.status === 'suspended' ? 'Reactivate' : 'Suspend') + '"><i class="fa-solid ' + (m.status === 'suspended' ? 'fa-user-check' : 'fa-user-lock') + '"></i></button><button class="icon-btn sm danger" data-action="removeMember" data-id="' + esc(m.id) + '" aria-label="Remove ' + esc(m.name) + '" title="Remove"><i class="fa-regular fa-trash-can"></i></button>') + '</div></div>';
            }).join('') + '</section>' +
            '<h3 class="sub-h">What each role can do</h3><div class="role-grid">' + (biz ? ['Admin', 'Manager', 'Operations', 'Finance', 'Viewer'] : ['Family member', 'Viewer']).map(function (r) {
                return '<div class="panel role-card"><b>' + r + '</b><p>' + esc(ROLE_NOTES[r]) + '</p><div class="perm-chips">' + ROLES[r].filter(function (p) { return GRANTABLE.indexOf(p) > -1; }).map(function (p) { return '<span class="chip">' + esc(PERMS[p]) + '</span>'; }).join('') + '</div></div>';
            }).join('') + '</div>' +
            '<div class="privacy-tip"><i class="fa-solid fa-lock"></i><span><b>Owner-only controls.</b> Security, ownership, member administration and restricted payments stay private to the account owner.</span></div>';
    }
    function memberModal(id) {
        var a = A(), biz = isBiz(), m = id ? byId(a.members, id) : null, roles = biz ? ['Admin', 'Manager', 'Operations', 'Finance', 'Viewer'] : ['Family member', 'Viewer'];
        var rel = biz ? [] : ['Mother', 'Father', 'Spouse', 'Brother / Sister', 'Other'];
        var cur = m ? m.perms : ROLES[roles[0]];
        var el = openModal({
            title: m ? 'Edit access' : (biz ? 'Invite a team member' : 'Invite a family member'), sub: m ? m.name : 'They will get an email invitation to join ' + a.name + '.',
            body: '<form id="mForm" novalidate><div class="form-grid">' + (m ? '' : field('Full name', 'name', { req: 1, ph: 'Member’s full name', ac: 'off' }) + field('Email address', 'email', { req: 1, type: 'email', inputmode: 'email', ph: 'name@example.com' })) +
                (m ? '' : (biz ? field('Job title', 'rel', { ph: 'e.g. Operations' }) : field('Relationship', 'rel', { type: 'select', options: rel }))) +
                field('Role', 'role', { type: 'select', options: roles, value: m ? m.role : roles[0], span: m ? 1 : 0 }) + '</div>' +
                '<div class="perm-box"><div class="perm-h"><b>Permissions</b><small id="roleNote">' + esc(ROLE_NOTES[m ? m.role : roles[0]] || '') + '</small></div>' + GRANTABLE.map(function (p) { return '<label class="switch"><input type="checkbox" name="perm" value="' + p + '"' + (cur.indexOf(p) > -1 ? ' checked' : '') + '><span class="sw"></span><span class="sw-l">' + esc(PERMS[p]) + '</span></label>'; }).join('') + '</div></form>',
            footer: '<button class="btn btn-ghost" data-action="closeModal">Cancel</button><button class="btn btn-primary" id="mSave">' + (m ? 'Save changes' : 'Send invitation') + '</button>'
        });
        var f = $('#mForm', el);
        $('[name=role]', f).addEventListener('change', function (e) {
            var p = ROLES[e.target.value] || []; $$('[name=perm]', f).forEach(function (c) { c.checked = p.indexOf(c.value) > -1; }); $('#roleNote', el).textContent = ROLE_NOTES[e.target.value] || '';
        });
        function submit() {
            var d = formData(f), perms = $$('[name=perm]:checked', f).map(function (c) { return c.value; }), bad = false;
            if (!m) {
                setErr(f, 'name', d.name.length < 2 ? 'Enter the member’s full name.' : ''); setErr(f, 'email', EMAIL.test(d.email) ? '' : 'Enter a valid email address.');
                if (d.name.length < 2 || !EMAIL.test(d.email)) bad = true;
                if (a.members.some(function (x) { return x.email.toLowerCase() === d.email.toLowerCase(); })) { setErr(f, 'email', 'This person is already a member.'); bad = true; }
            }
            if (bad) { var fb = firstBad(f); if (fb) fb.focus(); return; }
            if (!perms.length) { toast('Select at least one permission.', 'bad'); return; }
            if (m) { m.role = d.role; m.perms = perms; sync('members/' + m.id, m); toast('Access updated for ' + m.name + '.', 'ok'); }
            else { var nm = { id: uid('m'), name: d.name, email: d.email, rel: d.rel || (biz ? 'Team' : 'Family'), role: d.role, status: 'invited', perms: perms }; a.members.push(nm); sync('members', nm); toast('Invitation sent to ' + d.email + '.', 'ok'); }
            save(); closeModal(); render();
        }
        $('#mSave', el).addEventListener('click', submit);
    }

    /* ---------- Documents ---------- */
    var DOC_TYPES = ['AWB', 'Invoice', 'Packing list', 'Customs', 'POD', 'Other'];
    function docIcon(n) { var e = n.split('.').pop().toLowerCase(); return e === 'pdf' ? 'fa-file-pdf' : (e === 'jpg' || e === 'jpeg' || e === 'png') ? 'fa-file-image' : (e === 'xlsx' || e === 'xls' || e === 'csv') ? 'fa-file-excel' : 'fa-file-lines'; }
    function docListHtml() {
        var list = A().documents.filter(function (d) { return docFilter === 'all' || d.type === docFilter; });
        if (!list.length) return emptyState('fa-folder-open', 'No documents here', 'Documents linked to your shipments will appear in this list.');
        return list.map(function (d) {
            return '<div class="docrow"><span class="d-ico"><i class="fa-regular ' + docIcon(d.name) + '"></i></span><div class="d-main"><b>' + esc(d.name) + '</b><small>' + esc(d.type) + ' · ' + esc(d.size) + ' · ' + esc(d.added) + ' · by ' + esc(d.by) + '</small></div>' +
                '<button class="linkchip" data-open-ship="' + esc(d.ship) + '">' + esc(d.ship) + '</button><span class="role-chip">Private</span><button class="btn btn-soft btn-sm" data-action="download" data-name="' + esc(d.name) + '"><i class="fa-solid fa-download"></i> <span>Download</span></button></div>';
        }).join('');
    }
    function vDocuments() {
        if (!can('docs.view')) return locked('documents');
        var types = ['all'].concat(DOC_TYPES.filter(function (t) { return A().documents.some(function (d) { return d.type === t; }); }));
        return pageHead('SHIPPING PAPERWORK', 'Documents', 'AWB, invoices, packing lists, customs papers and proof of delivery.', can('docs.upload') ? '<button class="btn btn-primary" data-action="uploadDoc"><i class="fa-solid fa-upload"></i> Upload document</button>' : '') +
            '<div class="chips scroll-x">' + types.map(function (t) { return '<button class="fchip' + (docFilter === t ? ' on' : '') + '" data-action="docFilter" data-t="' + esc(t) + '">' + (t === 'all' ? 'All' : esc(t)) + '</button>'; }).join('') + '</div>' +
            '<section class="panel flush" id="docList">' + docListHtml() + '</section><div class="privacy-tip"><i class="fa-solid fa-lock"></i><span><b>Private by default.</b> Documents are only visible to members with document access. Public tracking never shows them.</span></div>';
    }
    function uploadModal() {
        var a = A(), el = openModal({
            title: 'Upload document', sub: 'PDF, JPG, PNG, DOCX or XLSX · up to 10 MB',
            body: '<form id="uForm" novalidate><div class="form-grid">' + '<div class="fld span2" data-f="file"><label for="f_file">File <i class="req">*</i></label><input id="f_file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.csv"><small class="err" role="alert"></small></div>' +
                field('Document type', 'type', { type: 'select', options: DOC_TYPES, value: 'Invoice' }) + field('Related shipment', 'ship', { type: 'select', options: [{ v: '', l: 'Not linked' }].concat(a.shipments.map(function (s) { return { v: s.id, l: s.id + ' · ' + s.to }; })) }) + '</div></form>',
            footer: '<button class="btn btn-ghost" data-action="closeModal">Cancel</button><button class="btn btn-primary" id="uSave"><i class="fa-solid fa-upload"></i> Upload</button>'
        });
        $('#uSave', el).addEventListener('click', function () {
            var f = $('#uForm', el), file = $('#f_file', el).files[0], d = formData(f);
            if (!file) { setErr(f, 'file', 'Choose a file to upload.'); return; }
            if (!/\.(pdf|jpe?g|png|docx|xlsx|csv)$/i.test(file.name)) { setErr(f, 'file', 'This file type is not allowed.'); return; }
            if (file.size > 10 * 1024 * 1024) { setErr(f, 'file', 'File is larger than 10 MB.'); return; }
            var size = file.size > 1048576 ? (file.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(file.size / 1024)) + ' KB';
            a.documents.unshift({ id: uid('d'), name: file.name, type: d.type, ship: d.ship || '—', added: dateOnly(), size: size, by: A().user.name });
            save(); sync('documents', { name: file.name }); closeModal(); toast('Document added. Demo mode keeps the file list in this browser only.', 'ok'); render();
        });
    }

    /* ---------- Billing ---------- */
    function vBilling() {
        if (!can('billing.view')) return locked('billing');
        var a = A(), inv = a.invoices, paid = inv.filter(function (i) { return i.status === 'paid'; }), unpaid = inv.filter(function (i) { return i.status === 'unpaid'; });
        return pageHead('PAYMENTS & RECORDS', 'Invoices & payments', 'Review invoices, pay securely and see your payment history.') +
            '<section class="stats three"><div class="stat static"><span class="stat-k">Outstanding balance</span><strong class="sm">' + money(outstanding()) + '</strong>' + (outstanding() ? '<span class="badge warn">Payment due</span>' : '<span class="badge ok">All clear</span>') + '</div><div class="stat static"><span class="stat-k">Paid invoices</span><strong>' + paid.length + '</strong></div><div class="stat static"><span class="stat-k">Pending invoices</span><strong>' + unpaid.length + '</strong></div></section>' +
            '<section class="panel flush"><div class="panel-head pad"><div><h3>Invoices</h3><p>Newest first.</p></div></div>' + (inv.length ? inv.map(function (i) {
                return '<div class="invrow"><span class="s-ico"><i class="fa-solid fa-file-invoice"></i></span><div class="i-main"><b>' + esc(i.id) + '</b><small>' + esc(i.ship) + ' · issued ' + esc(i.date) + '</small></div><div class="i-amt"><b>' + money(i.amount) + '</b><small>' + (i.status === 'paid' ? 'Paid ' + esc(i.paidOn) : 'Due ' + esc(i.due)) + '</small></div><span class="badge ' + (i.status === 'paid' ? 'ok' : 'warn') + '">' + (i.status === 'paid' ? 'Paid' : 'Unpaid') + '</span>' +
                    '<div class="i-act"><button class="btn btn-ghost btn-sm" data-action="download" data-name="' + esc(i.id) + '.pdf"><i class="fa-solid fa-download"></i></button>' + (i.status === 'unpaid' && can('billing.pay') ? '<button class="btn btn-primary btn-sm" data-action="pay" data-id="' + esc(i.id) + '">Pay now</button>' : '') + '</div></div>';
            }).join('') : emptyState('fa-file-invoice', 'No invoices yet', 'Invoices appear here after you book a shipment.')) + '</section>' +
            (paid.length ? '<h3 class="sub-h">Payment history</h3><section class="panel flush">' + paid.map(function (i) { return '<div class="invrow slim"><span class="a-ico ok"><i class="fa-solid fa-check"></i></span><div class="i-main"><b>' + money(i.amount) + ' · ' + esc(i.method || 'Online') + '</b><small>' + esc(i.id) + ' · ' + esc(i.paidOn) + '</small></div><span class="badge ok">Received</span></div>'; }).join('') + '</section>' : '');
    }
    function payModal(id) {
        var a = A(), i = byId(a.invoices, id); if (!i || i.status !== 'unpaid') return;
        if (!can('billing.pay')) { toast('Your role cannot make payments.', 'bad'); return; }
        var el = openModal({
            title: 'Pay invoice', sub: i.id + ' · ' + i.ship,
            body: '<div class="total"><span>Amount due</span><strong>' + money(i.amount) + '</strong></div><div class="pick pay">' + [['bKash', 'fa-mobile-screen'], ['Nagad', 'fa-mobile-screen-button'], ['Card', 'fa-credit-card'], ['Bank transfer', 'fa-building-columns']].map(function (m, k) { return '<label class="pickc"><input type="radio" name="method" value="' + m[0] + '"' + (k === 0 ? ' checked' : '') + '><span><b><i class="fa-solid ' + m[1] + '"></i> ' + m[0] + '</b></span><i class="fa-solid fa-circle-check"></i></label>'; }).join('') + '</div>' +
                '<div class="alert info"><i class="fa-solid fa-flask"></i><span>Demo mode: no real payment is taken. Connect your payment gateway to enable live payments.</span></div>',
            footer: '<button class="btn btn-ghost" data-action="closeModal">Cancel</button><button class="btn btn-primary" id="payGo"><i class="fa-solid fa-lock"></i> Pay ' + money(i.amount) + '</button>'
        });
        $('#payGo', el).addEventListener('click', function () {
            var m = $('input[name=method]:checked', el).value; i.status = 'paid'; i.paidOn = dateOnly(); i.method = m;
            a.notifications.unshift({ id: uid('n'), icon: 'fa-circle-check', tone: 'ok', title: 'Payment received', text: money(i.amount) + ' paid for ' + i.id + ' via ' + m + '.', time: 'Just now', unread: true });
            save(); sync('payments', { invoice: i.id, method: m }); closeModal(); updateChrome(); toast('Payment recorded. Thank you!', 'ok'); render();
        });
    }

    /* ---------- Notifications ---------- */
    function vNotifications() {
        var a = A(), n = a.notifications;
        return pageHead('STAY INFORMED', 'Notifications', 'Shipment, billing and account updates.', n.some(function (x) { return x.unread; }) ? '<button class="btn btn-soft" data-action="readAll"><i class="fa-solid fa-check-double"></i> Mark all read</button>' : '') +
            '<section class="panel flush">' + (n.length ? n.map(notifRow).join('') : emptyState('fa-bell-slash', 'You’re all caught up', 'New updates will appear here.')) + '</section>';
    }

    /* ---------- Support ---------- */
    function vSupport() {
        if (!can('support')) return locked('support');
        var a = A();
        return pageHead('WE’RE HERE TO HELP', 'Help & support', 'Reach JP Express about a shipment or your account.', '<button class="btn btn-primary" data-action="newTicket"><i class="fa-solid fa-plus"></i> New request</button>') +
            '<div class="help-grid"><a class="panel help" href="https://wa.me/' + PORTAL_CONFIG.whatsapp + '" target="_blank" rel="noopener"><span class="q-ico green"><i class="fa-brands fa-whatsapp"></i></span><b>WhatsApp</b><small>Chat with our team</small></a><a class="panel help" href="tel:' + PORTAL_CONFIG.hotline + '"><span class="q-ico blue"><i class="fa-solid fa-phone"></i></span><b>Call hotline</b><small>9am to 11pm</small></a><a class="panel help" href="faq.html"><span class="q-ico orange"><i class="fa-regular fa-circle-question"></i></span><b>FAQs</b><small>Quick answers</small></a><a class="panel help" href="track-shipment.html"><span class="q-ico violet"><i class="fa-solid fa-location-dot"></i></span><b>Public tracking</b><small>Any JP Express parcel</small></a></div>' +
            '<h3 class="sub-h">Your requests</h3><section class="panel flush">' + (a.tickets.length ? a.tickets.map(function (t) {
                return '<button class="srow" data-action="openTicket" data-id="' + esc(t.id) + '"><span class="s-ico"><i class="fa-regular fa-comments"></i></span><span class="s-main"><b>' + esc(t.subject) + '</b><small>' + esc(t.id) + ' · ' + esc(t.cat) + (t.ship && t.ship !== '—' ? ' · ' + esc(t.ship) : '') + ' · ' + esc(t.created) + '</small></span><span class="s-state"><span class="badge ' + (t.status === 'open' ? 'warn' : 'ok') + '">' + (t.status === 'open' ? 'Open' : 'Resolved') + '</span></span><i class="fa-solid fa-chevron-right chev"></i></button>';
            }).join('') : emptyState('fa-comments', 'No requests yet', 'Need help? Send us a message and attach a shipment number.', ctaBtn('New request', 'data-action="newTicket"', 'fa-plus'))) + '</section>';
    }
    function ticketModal(shipId) {
        var a = A(), el = openModal({
            title: 'New support request', sub: 'We usually reply the same day.',
            body: '<form id="tForm" novalidate><div class="form-grid">' + field('Topic', 'cat', { type: 'select', options: ['Tracking', 'Pickup', 'Customs', 'Billing', 'Account', 'Other'] }) +
                field('Related shipment', 'ship', { type: 'select', value: shipId || '', options: [{ v: '', l: 'None' }].concat(a.shipments.map(function (s) { return { v: s.id, l: s.id + ' · ' + s.to }; })) }) +
                field('Subject', 'subject', { span: 1, req: 1, max: 90, ph: 'e.g. My shipment has not updated for 2 days' }) + field('Message', 'text', { type: 'textarea', span: 1, req: 1, max: 1000, ph: 'Tell us what happened…' }) + '</div></form>',
            footer: '<button class="btn btn-ghost" data-action="closeModal">Cancel</button><button class="btn btn-primary" id="tSend"><i class="fa-solid fa-paper-plane"></i> Send request</button>'
        });
        $('#tSend', el).addEventListener('click', function () {
            var f = $('#tForm', el), d = formData(f), bad = false;
            setErr(f, 'subject', d.subject.length < 4 ? 'Add a short subject.' : ''); setErr(f, 'text', d.text.length < 10 ? 'Please describe the issue (at least 10 characters).' : '');
            if (d.subject.length < 4 || d.text.length < 10) { var fb = firstBad(f); if (fb) fb.focus(); return; }
            var t = { id: 'TKT-' + (1043 + a.tickets.length), subject: d.subject, cat: d.cat, ship: d.ship || '—', status: 'open', created: dateOnly(), msgs: [{ who: 'You', t: nowStamp(), text: d.text }] };
            a.tickets.unshift(t); save(); sync('support', t); closeModal(); toast('Request ' + t.id + ' sent.', 'ok'); go('support'); render();
        });
    }
    function viewTicket(id) {
        var t = byId(A().tickets, id); if (!t) return;
        var el = openModal({
            title: t.subject, sub: t.id + ' · ' + t.cat + (t.ship && t.ship !== '—' ? ' · ' + t.ship : ''),
            body: '<div class="thread">' + t.msgs.map(function (m) { return '<div class="msg ' + (m.who === 'You' ? 'me' : '') + '"><b>' + esc(m.who) + '</b><p>' + esc(m.text) + '</p><small>' + esc(m.t) + '</small></div>'; }).join('') + '</div>' +
                '<form id="rForm" class="reply" novalidate><textarea id="rText" rows="2" maxlength="1000" placeholder="Write a reply…" aria-label="Reply"></textarea><button class="btn btn-primary" type="submit" aria-label="Send reply"><i class="fa-solid fa-paper-plane"></i></button></form>'
        });
        $('#rForm', el).addEventListener('submit', function (e) {
            e.preventDefault(); var v = $('#rText', el).value.trim(); if (v.length < 2) return;
            t.msgs.push({ who: 'You', t: nowStamp(), text: v }); t.status = 'open'; save(); sync('support/reply', { id: t.id }); closeModal(); viewTicket(id);
        });
    }

    /* ---------- Profile & security ---------- */
    function toggleRow(name, label, sub, on) { return '<label class="switch row"><input type="checkbox" name="' + name + '"' + (on ? ' checked' : '') + '><span class="sw"></span><span class="sw-l"><b>' + esc(label) + '</b><small>' + esc(sub) + '</small></span></label>'; }
    function vProfile() {
        var a = A(), u = a.user; u.prefs = u.prefs || { email: true, sms: true, whatsapp: false, portal: true };
        return pageHead('YOUR ACCOUNT', 'Profile & security', 'Manage your details, sign-in security and notifications.') +
            '<div class="grid-2 top"><section class="panel"><div class="who"><span class="avatar xl">' + esc(initials(u.name)) + '</span><div><h3>' + esc(u.name) + '</h3><p>' + esc(a.role) + ' · ' + esc(a.name) + '</p><small>Member since ' + esc(u.since) + '</small></div></div>' +
            '<form id="pForm" novalidate><div class="form-grid">' + field('Full name', 'name', { value: u.name, req: 1, ac: 'name' }) + field('Email', 'email', { value: u.email, type: 'email', req: 1, ac: 'email' }) + field('Phone', 'phone', { value: u.phone, type: 'tel', req: 1, ac: 'tel' }) +
            field('Country', 'country', { type: 'select', options: ['Bangladesh'].concat(Object.keys(COUNTRIES)), value: u.country }) + field('Language', 'lang', { type: 'select', options: ['English', 'বাংলা'], value: u.lang }) + '</div><div class="form-actions"><button class="btn btn-primary" type="submit"><i class="fa-solid fa-check"></i> Save profile</button></div></form></section>' +
            '<section class="panel"><div class="panel-head"><div><h3>Notifications</h3><p>Choose how we reach you.</p></div></div><form id="nForm">' + toggleRow('portal', 'In the portal', 'Always on for shipment updates', u.prefs.portal) + toggleRow('email', 'Email', 'Booking, invoices and delivery', u.prefs.email) + toggleRow('sms', 'SMS', 'Pickup and delivery alerts', u.prefs.sms) + toggleRow('whatsapp', 'WhatsApp', 'Status updates on WhatsApp', u.prefs.whatsapp) + '</form></section></div>' +
            (can('security') ? '<section class="panel"><div class="panel-head"><div><h3>Sign-in security</h3><p>Only the account owner can change these.</p></div></div><div class="grid-2 inner"><form id="pwForm" novalidate><div class="form-grid one">' + field('Current password', 'cur', { type: 'password', ac: 'current-password' }) + field('New password', 'pw', { type: 'password', ac: 'new-password', hint: 'At least 8 characters, with letters and numbers.' }) + field('Confirm new password', 'pw2', { type: 'password', ac: 'new-password' }) + '</div><div class="form-actions"><button class="btn btn-soft" type="submit">Update password</button></div></form>' +
                '<div><form id="secForm">' + toggleRow('twofa', 'Two-step verification', 'Ask for a code when signing in on a new device', u.twofa) + '</form><h4 class="mini-h">Active sessions</h4><div class="sess"><i class="fa-solid fa-laptop"></i><span><b>This device</b><small>Dhaka, BD · Active now</small></span><span class="badge ok">Current</span></div><div class="sess"><i class="fa-solid fa-mobile-screen"></i><span><b>Phone · Chrome</b><small>Dhaka, BD · Yesterday</small></span><button class="btn btn-ghost btn-sm" data-action="signoutOthers">Sign out</button></div></div></div></section>'
                : '<section class="panel"><div class="alert info"><i class="fa-solid fa-lock"></i><span>Security and ownership settings are managed by the account owner (' + esc(a.owner) + ').</span></div></section>') +
            '<section class="panel row-panel"><div><h3>Session</h3><p class="muted-p">Sign out on shared devices when you finish.</p></div><div class="row-actions"><button class="btn btn-ghost" data-action="resetDemo"><i class="fa-solid fa-rotate-left"></i> Reset demo data</button><button class="btn btn-danger-soft" data-action="signOut"><i class="fa-solid fa-right-from-bracket"></i> Sign out</button></div></section>';
    }

    /* ---------- Account switcher ---------- */
    function openSwitcher() {
        var el = openModal({
            title: 'Switch account', sub: 'Data and permissions change with the active account.',
            body: '<div class="pick acct">' + Object.keys(DB.accounts).map(function (k) {
                var a = DB.accounts[k];
                return '<button class="pickc as" data-action="switchTo" data-id="' + k + '"' + (DB.active === k ? ' aria-current="true"' : '') + '><span class="acct-ico ' + a.kind + '"><i class="fa-solid ' + (a.kind === 'business' ? 'fa-building' : 'fa-user') + '"></i></span><span><b>' + esc(a.name) + '</b><small>' + (a.kind === 'business' ? 'Business' : 'Personal') + ' · your role: ' + esc(a.role) + '</small></span>' + (DB.active === k ? '<i class="fa-solid fa-circle-check on"></i>' : '') + '</button>';
            }).join('') + '</div><div class="privacy-tip"><i class="fa-solid fa-shield-halved"></i><span>Switching is not just a visual change. Everything you see — shipments, contacts, billing — is limited to the selected account and your role in it.</span></div>'
        });
    }
    function switchTo(k) {
        if (!DB.accounts[k] || k === DB.active) { closeModal(); return; }
        DB.active = k; wiz = null; filterState = { status: 'all', q: '' }; docFilter = 'all'; save(); closeModal(); updateChrome(); toast('Now using ' + A().name + ' (' + A().role + ')', 'ok'); go('dashboard', true);
    }

    /* =====================================================================
       RENDER, ROUTER, EVENTS
       ===================================================================== */
    var VIEWS = { dashboard: vDashboard, shipments: vShipments, tracking: vTracking, create: vCreate, quotes: vQuotes, contacts: vContacts, family: vFamily, documents: vDocuments, billing: vBilling, notifications: vNotifications, support: vSupport, profile: vProfile };

    function updateChrome() {
        var a = A(), u = a.user, nav = '';
        NAV.forEach(function (n) {
            var ok = !n.perm || can(n.perm), lbl = isBiz() && n.alt ? n.alt : n.label, extra = '';
            if (n.count) extra = '<span class="nav-count">' + a.shipments.filter(function (s) { return s.status !== 'delivered'; }).length + '</span>';
            if (n.badge && unreadCount()) extra = '<span class="nav-count hot">' + unreadCount() + '</span>';
            if (!ok) extra = '<i class="fa-solid fa-lock nav-lock" aria-label="Not available for your role"></i>';
            nav += '<a href="#' + n.id + '" data-nav="' + n.id + '" class="' + (route === n.id ? 'active' : '') + (ok ? '' : ' dim') + '"' + (route === n.id ? ' aria-current="page"' : '') + '><i class="fa-solid ' + n.icon + '"></i><span>' + esc(lbl) + '</span>' + extra + '</a>';
        });
        $('#sideNav').innerHTML = nav;
        $('#acctName').textContent = a.name; $('#acctRole').textContent = (a.kind === 'business' ? 'Business' : 'Personal') + ' · ' + a.role;
        $('#acctIco').className = 'acct-ico ' + a.kind; $('#acctIco').innerHTML = '<i class="fa-solid ' + (a.kind === 'business' ? 'fa-building' : 'fa-user') + '"></i>';
        $('#meName').textContent = u.name; $('#meAvatar').textContent = initials(u.name); $('#meSub').textContent = a.kind === 'business' ? a.name : 'Personal customer';
        var b = $('#bellDot'), c = unreadCount(); b.textContent = c > 9 ? '9+' : c; b.hidden = !c;
        $$('.tabbar [data-nav]').forEach(function (t) { t.classList.toggle('on', t.dataset.nav === route); });
        $('#crumbTitle').textContent = (isBiz() && (NAV.filter(function (n) { return n.id === route; })[0] || {}).alt) || TITLES[route] || 'Dashboard';
        document.title = (TITLES[route] || 'Dashboard') + ' | JP Express Customer Portal';
    }
    function render() {
        updateChrome();
        viewEl.innerHTML = (VIEWS[route] || vDashboard)();
        var se = $('#shipSearch'); if (se) se.addEventListener('input', function () { filterState.q = se.value; var l = $('#shipList'); if (l) l.innerHTML = shipListHtml(); });
    }
    function go(r, force) {
        if (!VIEWS[r]) r = 'dashboard';
        var changed = r !== route; route = r; closeNav();
        if (r !== 'create' && changed) { /* keep wizard draft while browsing */ }
        if (('#' + r) !== location.hash) { try { history.pushState(null, '', '#' + r); } catch (e) { location.hash = r; } }
        render();
        if (changed || force) { window.scrollTo({ top: 0, behavior: 'auto' }); viewEl.focus({ preventScroll: true }); }
    }
    window.addEventListener('hashchange', function () { var r = location.hash.replace('#', ''); if (VIEWS[r] && r !== route) { route = r; closeNav(); render(); window.scrollTo(0, 0); } });
    window.addEventListener('popstate', function () { var r = location.hash.replace('#', ''); if (VIEWS[r] && r !== route) { route = r; render(); } });

    var ACTIONS = {
        openNav: openNav, closeNav: closeNav, closeModal: closeModal, openSwitcher: openSwitcher,
        switchTo: function (el) { switchTo(el.dataset.id); },
        statGo: function (el) { filterState.status = el.dataset.f || 'all'; filterState.q = ''; go(el.dataset.go); },
        filter: function (el) { filterState.status = el.dataset.f; render(); },
        clearFilters: function () { filterState = { status: 'all', q: '' }; render(); },
        trackShip: function (el) { closeModal(); go('tracking', true); var i = $('#trackInput'); if (i) i.value = el.dataset.id; showTrack(el.dataset.id); },
        copy: function (el) { try { navigator.clipboard.writeText(el.dataset.text); toast('Copied ' + el.dataset.text, 'ok'); } catch (e) { toast('Copy is not available on this device.'); } },
        download: function (el) { toast('Demo: “' + el.dataset.name + '” will download once secure document storage is connected.'); },
        repeat: function (el) { repeatShip(el.dataset.id); },
        supportFor: function (el) { closeModal(); if (!can('support')) { toast('Your role cannot contact support.', 'bad'); return; } ticketModal(el.dataset.id); },
        wizNext: wizNext, wizConfirm: wizConfirm, wizQuote: wizQuote,
        wizBack: function () { readWiz(); wiz.step = Math.max(1, wiz.step - 1); render(); window.scrollTo(0, 0); },
        wizCancel: function () { wiz = null; go('dashboard'); },
        acceptQuote: function (el) { acceptQuote(el.dataset.id); }, requote: function (el) { requote(el.dataset.id); },
        ctab: function (el) { contactTab = el.dataset.t; render(); },
        addContact: function (el) { if (!can('contacts')) { toast('Your role cannot manage contacts.', 'bad'); return; } if (el.dataset.wiz) readWiz(); contactModal(el.dataset.type, null, !!el.dataset.wiz); },
        editContact: function (el) { contactModal(el.dataset.type, el.dataset.id); },
        defContact: function (el) { var l = el.dataset.type === 'sender' ? A().senders : A().receivers; l.forEach(function (c) { c.def = c.id === el.dataset.id; }); save(); toast('Default updated.', 'ok'); render(); },
        delContact: function (el) { deleteContact(el.dataset.type, el.dataset.id); },
        shipWith: function (el) { wiz = newWiz(); if (el.dataset.type === 'sender') wiz.sender = el.dataset.id; else wiz.receiver = el.dataset.id; go('create'); },
        inviteMember: function () { memberModal(); }, editMember: function (el) { memberModal(el.dataset.id); },
        toggleMember: function (el) { var m = byId(A().members, el.dataset.id); m.status = m.status === 'suspended' ? 'active' : 'suspended'; save(); sync('members/' + m.id, m); toast(m.name + (m.status === 'suspended' ? ' is suspended. History is kept.' : ' is active again.')); render(); },
        removeMember: function (el) { var a = A(), m = byId(a.members, el.dataset.id); confirmBox({ title: 'Remove ' + m.name + '?', text: 'They lose access immediately. Shipments and records they created stay in the account.', ok: 'Remove member', danger: true, onOk: function () { a.members.splice(a.members.indexOf(m), 1); save(); sync('members/remove', { id: m.id }); toast('Member removed.'); render(); } }); },
        docFilter: function (el) { docFilter = el.dataset.t; render(); }, uploadDoc: uploadModal,
        pay: function (el) { payModal(el.dataset.id); },
        readNotif: function (el) { var n = byId(A().notifications, el.dataset.id); if (n) { n.unread = false; save(); render(); } },
        readAll: function () { A().notifications.forEach(function (n) { n.unread = false; }); save(); toast('All caught up.', 'ok'); render(); },
        newTicket: function () { ticketModal(); }, openTicket: function (el) { viewTicket(el.dataset.id); },
        signoutOthers: function () { toast('Other sessions signed out.', 'ok'); },
        signOut: function () {
            try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch (e) { }
            location.href = 'login.html';
        },
        resetDemo: function () { confirmBox({ title: 'Reset demo data?', text: 'This restores the original sample data in this browser.', ok: 'Reset', onOk: function () { DB = seed(); normalize(); wiz = null; save(); toast('Demo data restored.', 'ok'); go('dashboard', true); } }); }
    };

    document.addEventListener('click', function (e) {
        var ship = e.target.closest('[data-open-ship]');
        if (ship) { e.preventDefault(); openShipment(ship.dataset.openShip); return; }
        var act = e.target.closest('[data-action]');
        if (act && ACTIONS[act.dataset.action]) { e.preventDefault(); ACTIONS[act.dataset.action](act, e); }
        var nav = e.target.closest('[data-nav]');
        if (nav) { e.preventDefault(); go(nav.dataset.nav); }
    });
    document.addEventListener('submit', function (e) {
        var f = e.target;
        if (f.id === 'trackForm') { e.preventDefault(); showTrack($('#trackInput').value); }
        else if (f.id === 'topSearch') { e.preventDefault(); var v = $('#topSearchInput').value.trim(); if (!v) return; if (findShip(v)) { openShipment(v); $('#topSearchInput').value = ''; } else toast('No shipment “' + v + '” in this account.', 'bad'); }
        else if (f.id === 'pForm') {
            e.preventDefault(); var d = formData(f), bad = false;
            setErr(f, 'name', d.name.length < 2 ? 'Enter your full name.' : ''); setErr(f, 'email', EMAIL.test(d.email) ? '' : 'Enter a valid email.'); setErr(f, 'phone', phoneOk(d.phone) ? '' : 'Enter a valid phone number.');
            if (d.name.length < 2 || !EMAIL.test(d.email) || !phoneOk(d.phone)) { var fb = firstBad(f); if (fb) fb.focus(); return; }
            Object.assign(DB.accounts.personal.user, { name: d.name, email: d.email, phone: d.phone, country: d.country, lang: d.lang }); normalize(); save(); sync('profile', d); toast('Profile saved.', 'ok'); render();
        } else if (f.id === 'pwForm') {
            e.preventDefault(); var p = formData(f), b2 = false;
            setErr(f, 'cur', p.cur ? '' : 'Enter your current password.'); var pm = p.pw.length < 8 ? 'Use at least 8 characters.' : (!/[A-Za-z]/.test(p.pw) || !/\d/.test(p.pw)) ? 'Use letters and numbers.' : ''; setErr(f, 'pw', pm);
            setErr(f, 'pw2', p.pw2 !== p.pw ? 'Passwords do not match.' : '');
            if (!p.cur || pm || p.pw2 !== p.pw) { var fb2 = firstBad(f); if (fb2) fb2.focus(); return; }
            sync('password', {}); f.reset(); toast('Password updated (demo).', 'ok');
        }
    });
    document.addEventListener('change', function (e) {
        var t = e.target;
        if (t.closest('#nForm')) { var u = A().user; u.prefs = u.prefs || {}; u.prefs[t.name] = t.checked; save(); sync('prefs', u.prefs); toast('Preferences saved.', 'ok'); }
        if (t.closest('#secForm')) { A().user.twofa = t.checked; save(); toast('Two-step verification ' + (t.checked ? 'on' : 'off') + ' (demo).'); }
        if (t.closest('#wizForm') && wiz && wiz.step === 3 && t.name === 'service') { /* selection is read on continue */ }
        if (t.closest('#wizForm') && wiz && wiz.step === 2 && t.name === 'type') { wiz.type = t.value; }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.closest && e.target.closest('#wizForm') && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); if (wiz && wiz.step < 4) wizNext(); }
    });

    function normalize() { var p = DB.accounts.personal; if (DB.accounts.business) DB.accounts.business.user = p.user; }
    normalize();
    var start = location.hash.replace('#', '');
    route = VIEWS[start] ? start : 'dashboard';
    render();
})();
