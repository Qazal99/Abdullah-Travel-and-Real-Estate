/* ==========================================================================
   Abdullah Travel and Real Estate - Core Application Logic
   Features: Arabic Default, Persistent Cross-Page Language Switcher, WhatsApp
   ========================================================================== */

const WHATSAPP_NUMBER = "256740048986";

const BOOTSTRAP_LTR_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
const BOOTSTRAP_RTL_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Determine active language: URL param -> localStorage -> default to Arabic ('ar')
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang");
    let storedLang = null;
    try {
        storedLang = localStorage.getItem("abdullah_site_lang");
    } catch (e) {
        storedLang = null;
    }

    const activeLang = (urlLang === "en" || urlLang === "ar")
        ? urlLang
        : (storedLang === "en" || storedLang === "ar")
            ? storedLang
            : "ar";

    applyLanguage(activeLang);

    // 2. Language Toggle Button Listener
    const langToggleBtn = document.getElementById("langToggleBtn");
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            const currentLang = document.documentElement.getAttribute("lang") || "ar";
            const newLang = currentLang === "ar" ? "en" : "ar";
            applyLanguage(newLang);
        });
    }

    // 3. Property Filter Buttons (Real Estate Page)
    const filterButtons = document.querySelectorAll("[data-filter]");
    const propertyItems = document.querySelectorAll(".property-item");

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => b.classList.remove("active", "btn-emerald"));
            filterButtons.forEach((b) => b.classList.add("btn-outline-secondary"));
            btn.classList.remove("btn-outline-secondary");
            btn.classList.add("active", "btn-emerald");

            const filterValue = btn.getAttribute("data-filter");
            propertyItems.forEach((item) => {
                const category = item.getAttribute("data-category");
                if (filterValue === "all" || filterValue === category) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });

    // 4. Airport Pickup Form -> Direct WhatsApp Dispatch (Tours & Transfers Page)
    const pickupForm = document.getElementById("airportPickupForm");
    if (pickupForm) {
        pickupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const lang = document.documentElement.getAttribute("lang") || "ar";
            const name = document.getElementById("passengerName").value.trim();
            const routeSelect = document.getElementById("pickupRoute");
            const routeText = routeSelect.options[routeSelect.selectedIndex].text;
            const date = document.getElementById("arrivalDate").value;
            const passengers = document.getElementById("passengerCount").value;

            let message = "";
            if (lang === "ar") {
                message = `مرحباً عبدالله للسفريات والعقارات، أرغب في حجز استقبال من مطار عنتيبي:\n• الاسم: ${name}\n• المسار / السيارة: ${routeText}\n• التاريخ: ${date}\n• عدد الركاب: ${passengers}`;
            } else {
                message = `Hello Abdullah Travel & Real Estate, I would like to request an Airport Pickup:\n• Name: ${name}\n• Route / Vehicle: ${routeText}\n• Date: ${date}\n• Passengers: ${passengers}`;
            }
            openWhatsApp(message);
        });
    }

    // 5. Contact Brokerage Form -> Direct WhatsApp Inquiry (Contact Page)
    const contactForm = document.getElementById("brokerageContactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const lang = document.documentElement.getAttribute("lang") || "ar";
            const name = document.getElementById("clientName").value.trim();
            const serviceSelect = document.getElementById("serviceInterest");
            const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
            const details = document.getElementById("clientMessage").value.trim();

            let message = "";
            if (lang === "ar") {
                message = `مرحباً عبدالله للسفريات والعقارات، لدي استفسار جديد:\n• الاسم: ${name}\n• الخدمة: ${serviceText}\n• التفاصيل: ${details}`;
            } else {
                message = `Hello Abdullah Travel & Real Estate, I have a new inquiry:\n• Name: ${name}\n• Service: ${serviceText}\n• Details: ${details}`;
            }
            openWhatsApp(message);
        });
    }
});

/**
 * Applies language translations, switches LTR/RTL direction,
 * swaps Bootstrap LTR/RTL stylesheet, updates internal page links,
 * and updates WhatsApp inquiry links.
 */
function applyLanguage(lang) {
    if (!translations[lang]) return;

    try {
        localStorage.setItem("abdullah_site_lang", lang);
    } catch (e) {}

    // Keep URL parameter synced without reloading page
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("lang", lang);
    window.history.replaceState({}, "", currentUrl.toString());

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    // Swap Bootstrap CSS between RTL and LTR
    const bootstrapLink = document.getElementById("bootstrap-css");
    if (bootstrapLink) {
        bootstrapLink.href = lang === "ar" ? BOOTSTRAP_RTL_URL : BOOTSTRAP_LTR_URL;
    }

    // Translate all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Propagate ?lang=ar|en to all internal navigation links so language never resets across pages
    document.querySelectorAll("a[href]").forEach((link) => {
        const rawHref = link.getAttribute("href");
        if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("http") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
            return;
        }
        const cleanPath = rawHref.split("?")[0];
        if (cleanPath.endsWith(".html")) {
            link.setAttribute("href", `${cleanPath}?lang=${lang}`);
        }
    });

    // Update dynamic WhatsApp buttons on property, tour, and service cards
    updateCardWhatsAppLinks(lang);
}

/**
 * Updates href links on all cards with data-wa-item-key so clicking
 * sends a pre-filled WhatsApp inquiry in the active language.
 */
function updateCardWhatsAppLinks(lang) {
    document.querySelectorAll("[data-wa-item-key]").forEach((btn) => {
        const itemKey = btn.getAttribute("data-wa-item-key");
        const itemTitle = translations[lang][itemKey] || itemKey;

        const message =
            lang === "ar"
                ? `مرحباً عبدالله للسفريات والعقارات، أرغب في الاستفسار عن: ${itemTitle}`
                : `Hello Abdullah Travel & Real Estate, I would like to inquire about: ${itemTitle}`;

        btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    });

    // Update general WhatsApp CTAs
    document.querySelectorAll(".wa-general-link").forEach((link) => {
        const generalMsg =
            lang === "ar"
                ? "مرحباً عبدالله للسفريات والعقارات، أرغب في الاستفسار عن خدماتكم في أوغندا."
                : "Hello Abdullah Travel & Real Estate, I would like to inquire about your services in Uganda.";
        link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(generalMsg)}`;
    });
}

/**
 * Opens WhatsApp in a new tab with the encoded message.
 */
function openWhatsApp(message) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}