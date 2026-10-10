/* =========================================================
   JP EXPRESS - AUTH PAGES LOGIC (login.html + registration.html)
   Load AFTER js/data.js and js/main.js
   ========================================================= */
(function () {
    "use strict";

    /* ---------- Settings: connect your Laravel routes here ---------- */
    var AUTH = {
        loginEndpoint: "",        /* e.g. "/login"    ("" = demo mode) */
        registerEndpoint: "",     /* e.g. "/register" ("" = demo mode) */
        branchEndpoint: "",       /* e.g. "/api/branches" -> [{ "id": 1, "name": "Dhaka" }] */
        loginRedirect: "index.html",
        registerRedirect: "login.html",
        branches: [               /* demo list, used until branchEndpoint is set */
            { id: "1", name: "Dhaka Head Office" },
            { id: "2", name: "Chattogram Branch" },
            { id: "3", name: "Sylhet Branch" },
            { id: "4", name: "Rajshahi Branch" },
            { id: "5", name: "Khulna Branch" }
        ]
    };

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var RX = { email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, user: /^[A-Za-z0-9._-]{3,30}$/ };

    /* ---------- Helpers ---------- */
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
    function phoneOk(v) {
        var d = String(v).replace(/\D/g, "");
        return /^\+?[0-9\s().-]+$/.test(v) && d.length >= 7 && d.length <= 15;
    }
    function detect(v) {                       /* email | phone | username */
        v = String(v).trim();
        if (!v) return "";
        if (v.indexOf("@") > -1) return "email";
        if (/^\+?[0-9\s().-]+$/.test(v) && /\d/.test(v)) return "phone";
        return "username";
    }
    function setError(field, msg) {
        if (!field) return;
        var err = $(".auth-err", field);
        var ctl = $("input:not([type=hidden]):not([type=search]), textarea, .auth-select-btn", field);
        field.classList.toggle("has-error", !!msg);
        if (err) err.textContent = msg || "";
        if (ctl) { if (msg) ctl.setAttribute("aria-invalid", "true"); else ctl.removeAttribute("aria-invalid"); }
    }
    function showStatus(el, type, msg) {
        if (!el) return;
        el.className = "auth-status is-" + type;
        el.textContent = msg;
        el.hidden = false;
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }
    function hideStatus(el) { if (el) el.hidden = true; }
    function setLoading(btn, on, text) {
        if (!btn) return;
        if (on) {
            btn.dataset.html = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> ' + esc(text);
        } else if (btn.dataset.html) {
            btn.innerHTML = btn.dataset.html;
        }
        btn.disabled = on;
    }
    function send(url, fd) {
        var token = $('meta[name="csrf-token"]');
        var headers = { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" };
        if (token && token.getAttribute("content")) headers["X-CSRF-TOKEN"] = token.getAttribute("content");
        return fetch(url, { method: "POST", headers: headers, body: fd, credentials: "same-origin" })
            .then(function (res) {
                return res.json().catch(function () { return {}; })
                    .then(function (j) { return { ok: res.ok, status: res.status, json: j }; });
            });
    }
    function demo() {
        return new Promise(function (resolve) {
            setTimeout(function () { resolve({ ok: true, status: 200, json: { demo: true } }); }, 900);
        });
    }
    function firstError(json) {
        if (json && json.errors) {
            var k = Object.keys(json.errors)[0], v = json.errors[k];
            return Array.isArray(v) ? v[0] : String(v);
        }
        return (json && json.message) || "";
    }
    function sortByDom(list) {
        return list.sort(function (a, b) {
            return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
    }

    /* ---------- Password show / hide (both pages) ---------- */
    document.addEventListener("click", function (e) {
        var b = e.target.closest("[data-toggle-password]");
        if (!b) return;
        var input = document.getElementById(b.getAttribute("data-toggle-password"));
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        b.setAttribute("aria-pressed", String(show));
        b.setAttribute("aria-label", show ? "Hide password" : "Show password");
        b.querySelector("i").className = show ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
    });

    /* =========================================================
       LOGIN: Email OR Phone OR Username
       ========================================================= */
    (function initLogin() {
        var form = $("#loginForm");
        if (!form) return;

        var idInput = $("#loginId"), pwInput = $("#loginPassword"), ico = $("#loginIdIcon"),
            hint = $("#loginIdHint"), status = $("#loginStatus"), btn = $("#loginSubmit"),
            fId = $('[data-f="login"]', form), fPw = $('[data-f="password"]', form);

        var ICONS = { "": "fa-user", email: "fa-envelope", phone: "fa-phone", username: "fa-user" };
        var HINTS = {
            "": "Use your email, phone number or username.",
            email: "Signing in with your email address.",
            phone: "Signing in with your phone number.",
            username: "Signing in with your username."
        };

        idInput.addEventListener("input", function () {
            var t = detect(idInput.value);
            ico.className = "fa-solid " + ICONS[t] + " auth-input-ico";
            hint.textContent = HINTS[t];
            setError(fId, "");
        });
        pwInput.addEventListener("input", function () { setError(fPw, ""); });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            hideStatus(status);

            var id = idInput.value.trim(), pw = pwInput.value, type = detect(id), bad = [];

            var idMsg = !id ? "Enter your email, phone number or username."
                : type === "email" && !RX.email.test(id) ? "Enter a valid email address."
                    : type === "phone" && !phoneOk(id) ? "Enter a valid phone number, e.g. +880 1XXX XXXXXX."
                        : type === "username" && !RX.user.test(id) ? "Username: 3-30 letters, numbers, . _ or -"
                            : "";
            setError(fId, idMsg);
            if (idMsg) bad.push(idInput);

            var pwMsg = pw ? "" : "Enter your password.";
            setError(fPw, pwMsg);
            if (pwMsg) bad.push(pwInput);

            if (bad.length) { sortByDom(bad)[0].focus(); return; }

            var fd = new FormData(form);
            fd.set("login_type", type);

            setLoading(btn, true, "Signing in...");
            (AUTH.loginEndpoint ? send(AUTH.loginEndpoint, fd) : demo())
                .then(function (r) {
                    setLoading(btn, false);
                    if (r.ok && r.json && r.json.demo) {
                        showStatus(status, "info", "Demo mode: details look good (" + type + " login). Set loginEndpoint in js/auth.js to sign in for real.");
                    } else if (r.ok) {
                        showStatus(status, "success", "Signed in successfully. Redirecting...");
                        setTimeout(function () { window.location.href = (r.json && r.json.redirect) || AUTH.loginRedirect; }, reduced ? 0 : 700);
                    } else if (r.status === 401 || r.status === 422) {
                        showStatus(status, "error", firstError(r.json) || "Incorrect login or password. Please try again.");
                    } else {
                        showStatus(status, "error", "We could not sign you in right now. Please try again.");
                    }
                })
                .catch(function () {
                    setLoading(btn, false);
                    showStatus(status, "error", "Connection problem. Check your internet and try again.");
                });
        });
    })();

    /* =========================================================
       REGISTRATION: Merchant | Traveler | Branch
       ========================================================= */
    (function initRegister() {
        var form = $("#registerForm");
        if (!form) return;

        var TYPES = {
            merchant: {
                cta: "Create Merchant Account",
                note: "For businesses and online sellers who ship regularly with JP Express.",
                vTitle: "Grow your business with JP Express",
                vText: "Open a merchant account to book shipments, get business rates and track every parcel in one place.",
                points: ["Business shipping rates", "Fast booking & pickup", "Real-time tracking"],
                done: "Merchant account created."
            },
            traveler: {
                cta: "Create Traveler Account",
                note: "Register as a traveler and connect with your nearest JP Express branch.",
                vTitle: "Join as a Traveler",
                vText: "Create a traveler account linked to your branch and manage everything from your phone.",
                points: ["Linked to your local branch", "Simple account management", "Priority support"],
                done: "Traveler account created."
            },
            branch: {
                cta: "Submit Branch Registration",
                note: "For partners who want to open and manage a JP Express branch.",
                vTitle: "Open a JP Express Branch",
                vText: "Register your branch to manage your team, merchants and travelers under one account.",
                points: ["Manage merchants & travelers", "One dashboard for your branch", "Dedicated partner support"],
                done: "Branch registration submitted. Our team will review it and contact you."
            }
        };

        var status = $("#regStatus"), btn = $("#regSubmit"), branchValue = $("#branchId"), current = "merchant";

        /* ----- account type switch ----- */
        function applyType(key, fromUser) {
            if (!TYPES[key]) key = "merchant";
            current = key;
            var t = TYPES[key];

            var radio = $('input[name="account_type"][value="' + key + '"]', form);
            if (radio) radio.checked = true;

            $$("[data-for]", form).forEach(function (el) {
                var on = el.getAttribute("data-for").split(" ").indexOf(key) > -1;
                el.hidden = !on;
                $$("input,textarea,button.auth-select-btn", el).forEach(function (c) { c.disabled = !on; });
                if (!on) setError(el, "");
            });

            $("#regVisualTitle").textContent = t.vTitle;
            $("#regVisualText").textContent = t.vText;
            $("#regVisualList").innerHTML = t.points.map(function (p) {
                return '<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>' + esc(p) + "</span></li>";
            }).join("");
            $("#regTypeNote").textContent = t.note;
            $(".btn-label", btn).textContent = t.cta;
            hideStatus(status);

            if (fromUser && window.history && history.replaceState) {
                history.replaceState(null, "", location.pathname + "?type=" + key);
            }
        }

        $$('input[name="account_type"]', form).forEach(function (r) {
            r.addEventListener("change", function () { applyType(r.value, true); });
        });

        /* ----- searchable branch dropdown ----- */
        (function initBranchSelect() {
            var root = $("#branchSelect");
            if (!root) return;

            var btnSel = $("#branchBtn"), panel = $("#branchPanel"), search = $("#branchSearch"),
                list = $("#branchList"), text = $(".auth-select-text", root);
            var branches = AUTH.branches.slice(), opts = [], active = -1;

            function render(q) {
                var t = q.trim().toLowerCase();
                opts = branches.filter(function (b) { return !t || b.name.toLowerCase().indexOf(t) > -1; });
                list.innerHTML = opts.length
                    ? opts.map(function (b, i) {
                        var sel = String(b.id) === branchValue.value;
                        return '<li role="option" id="branchOpt' + i + '" data-i="' + i + '" aria-selected="' + sel + '"' +
                            (sel ? ' class="is-sel"' : "") + ">" + esc(b.name) + "</li>";
                    }).join("")
                    : '<li class="auth-select-empty" role="presentation">No branch found</li>';
                active = -1;
                search.removeAttribute("aria-activedescendant");
            }
            function isOpen() { return !panel.hidden; }
            function close() {
                panel.hidden = true;
                root.classList.remove("is-open");
                btnSel.setAttribute("aria-expanded", "false");
            }
            function open() {
                search.value = "";
                render("");
                panel.hidden = false;
                root.classList.add("is-open");
                btnSel.setAttribute("aria-expanded", "true");
                var sel = $(".is-sel", list);
                if (sel) list.scrollTop = Math.max(0, sel.offsetTop - 60);
                if (window.matchMedia("(pointer: coarse)").matches) {
                    panel.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
                } else {
                    search.focus();
                }
            }
            function setActive(i) {
                var nodes = $$("li[role=option]", list);
                if (!nodes.length) return;
                active = (i + nodes.length) % nodes.length;
                nodes.forEach(function (n, k) { n.classList.toggle("is-active", k === active); });
                search.setAttribute("aria-activedescendant", nodes[active].id);
                nodes[active].scrollIntoView({ block: "nearest" });
            }
            function choose(b) {
                if (!b) return;
                branchValue.value = b.id;
                text.textContent = b.name;
                text.classList.remove("is-placeholder");
                setError(root.closest(".auth-field"), "");
                close();
                btnSel.focus();
            }

            btnSel.addEventListener("click", function () { if (isOpen()) close(); else open(); });
            btnSel.addEventListener("keydown", function (e) {
                if (e.key === "ArrowDown" && !isOpen()) { e.preventDefault(); open(); }
            });
            search.addEventListener("input", function () { render(search.value); });
            search.addEventListener("keydown", function (e) {
                var k = e.key;
                if (k === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
                else if (k === "ArrowUp") { e.preventDefault(); setActive(active < 0 ? -1 : active - 1); }
                else if (k === "Enter") { e.preventDefault(); choose(opts[active > -1 ? active : (opts.length === 1 ? 0 : -1)]); }
                else if (k === "Escape") { e.preventDefault(); close(); btnSel.focus(); }
                else if (k === "Tab") { close(); }
            });
            list.addEventListener("click", function (e) {
                var li = e.target.closest("li[role=option]");
                if (li) choose(opts[parseInt(li.getAttribute("data-i"), 10)]);
            });
            document.addEventListener("click", function (e) { if (!root.contains(e.target)) close(); });

            if (AUTH.branchEndpoint) {
                fetch(AUTH.branchEndpoint, { headers: { Accept: "application/json" }, credentials: "same-origin" })
                    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
                    .then(function (j) {
                        var a = Array.isArray(j) ? j : (j && j.data);
                        if (a && a.length) {
                            branches = a.map(function (b) { return { id: String(b.id), name: String(b.name) }; });
                            if (isOpen()) render(search.value);
                        }
                    })
                    .catch(function () { /* keep demo list */ });
            }
        })();

        /* ----- password strength ----- */
        var pwInput = $("#regPassword"), meter = $("#pwMeter"), meterText = $("#pwMeterText");
        pwInput.addEventListener("input", function () {
            var v = pwInput.value, s = 0;
            if (v.length >= 8) s++;
            if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
            if (/\d/.test(v)) s++;
            if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) s++;
            meter.setAttribute("data-level", v ? s : 0);
            meterText.textContent = v ? ["Too short", "Weak", "Fair", "Good", "Strong"][s] : "";
        });

        /* clear an error as soon as the user fixes it */
        form.addEventListener("input", function (e) {
            var f = e.target.closest(".auth-field");
            if (f && f.classList.contains("has-error")) setError(f, "");
        });
        form.addEventListener("change", function (e) {
            var f = e.target.closest(".auth-field");
            if (f && f.classList.contains("has-error")) setError(f, "");
        });

        /* ----- validation ----- */
        function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }

        function validate() {
            var bad = [];
            function check(key, msg, ctl) {
                var f = $('[data-f="' + key + '"]', form);
                if (!f || f.closest("[hidden]")) return;
                setError(f, msg);
                if (msg) bad.push(ctl || $("input,textarea", f));
            }
            var pw = pwInput.value;

            check("name", val("regName").length < 2 ? "Please enter your full name." : "");
            check("phone", phoneOk(val("regPhone")) ? "" : "Enter a valid phone number, e.g. +880 1XXX XXXXXX.");
            check("email", RX.email.test(val("regEmail")) ? "" : "Enter a valid email address.");
            check("username", RX.user.test(val("regUsername")) ? "" : "Username: 3-30 letters, numbers, . _ or -");
            check("business", val("regBusiness").length < 2 ? "Please enter your business or shop name." : "");
            check("branch", branchValue.value ? "" : "Please select a branch.", $("#branchBtn"));
            check("city", val("regCity").length < 2 ? "Please enter your city or area." : "");
            check("branchName", val("regBranchName").length < 2 ? "Please enter the branch name." : "");
            check("branchCity", val("regBranchCity").length < 2 ? "Please enter the city or district." : "");
            check("branchAddress", val("regBranchAddress").length < 6 ? "Please enter the full branch address." : "");
            check("password", pw.length < 8 ? "Password must be at least 8 characters."
                : (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) ? "Use at least one letter and one number." : "");
            check("confirm", !$("#regConfirmPassword").value ? "Please confirm your password."
                : $("#regConfirmPassword").value !== pw ? "Passwords do not match." : "");
            check("terms", $("#agreeTerms").checked ? "" : "Please accept the Terms and Privacy Policy.");

            if (bad.length) sortByDom(bad)[0].focus();
            return !bad.length;
        }

        /* ----- submit ----- */
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            hideStatus(status);
            if (!validate()) return;

            var fd = new FormData(form);         /* hidden (other-type) fields are disabled, so they are not sent */
            setLoading(btn, true, "Creating account...");

            (AUTH.registerEndpoint ? send(AUTH.registerEndpoint, fd) : demo())
                .then(function (r) {
                    setLoading(btn, false);
                    if (r.ok && r.json && r.json.demo) {
                        showStatus(status, "info", "Demo mode: " + current + " form is valid. Set registerEndpoint in js/auth.js to save accounts.");
                    } else if (r.ok) {
                        showStatus(status, "success", TYPES[current].done + " Redirecting to sign in...");
                        setTimeout(function () { window.location.href = (r.json && r.json.redirect) || AUTH.registerRedirect; }, reduced ? 0 : 1400);
                    } else if (r.status === 422 && r.json && r.json.errors) {
                        Object.keys(r.json.errors).forEach(function (k) {
                            var el = form.elements[k], f = el && el.closest && el.closest(".auth-field");
                            var m = r.json.errors[k];
                            if (f) setError(f, Array.isArray(m) ? m[0] : String(m));
                        });
                        showStatus(status, "error", "Please check the highlighted fields.");
                    } else {
                        showStatus(status, "error", "We could not create your account right now. Please try again.");
                    }
                })
                .catch(function () {
                    setLoading(btn, false);
                    showStatus(status, "error", "Connection problem. Check your internet and try again.");
                });
        });

        /* ----- start (supports registration.html?type=traveler) ----- */
        applyType(new URLSearchParams(location.search).get("type") || "merchant", false);
    })();
})();