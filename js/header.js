document.addEventListener("DOMContentLoaded", async function () {
    const headerPlaceholder = document.getElementById("siteHeader");

    if (!headerPlaceholder) return;

    const isInsidePages = window.location.pathname.includes("/pages/");
    const headerPath = isInsidePages
        ? "../components/header.html"
        : "components/header.html";

    try {
        const response = await fetch(headerPath);

        if (!response.ok) {
            throw new Error("بارگذاری هدر ناموفق بود");
        }

        const html = await response.text();
        headerPlaceholder.innerHTML = html;

        // اصلاح مسیر لینک‌ها در صفحات داخلی
        if (isInsidePages) {
            headerPlaceholder.querySelectorAll("a").forEach(link => {
                const href = link.getAttribute("href");

                if (
                    href &&
                    !href.startsWith("http") &&
                    !href.startsWith("#") &&
                    !href.startsWith("../") &&
                    !href.startsWith("javascript:")
                ) {
                    link.setAttribute("href", "../" + href);
                }
            });
        }

        const searchForm = headerPlaceholder.querySelector("#searchForm");
        const searchInput = headerPlaceholder.querySelector("#searchInput");

        if (searchForm && searchInput) {
            let clearSearchButton =
                headerPlaceholder.querySelector("#clearSearchButton");

            if (!clearSearchButton) {
                clearSearchButton = document.createElement("button");
                clearSearchButton.type = "button";
                clearSearchButton.id = "clearSearchButton";
                clearSearchButton.textContent = "✕";
                clearSearchButton.setAttribute(
                    "aria-label",
                    "پاک کردن جست‌وجو"
                );
                clearSearchButton.title = "پاک کردن جست‌وجو";

                clearSearchButton.style.cssText = [
                    "display:none",
                    "border:none",
                    "background:transparent",
                    "color:var(--text-muted, #aaa)",
                    "font-size:20px",
                    "cursor:pointer",
                    "padding:6px 10px",
                    "flex-shrink:0"
                ].join(";");

                const submitButton =
                    searchForm.querySelector('button[type="submit"]');

                if (submitButton) {
                    submitButton.insertAdjacentElement(
                        "beforebegin",
                        clearSearchButton
                    );
                } else {
                    searchForm.appendChild(clearSearchButton);
                }
            }

            // ساخت کادر پیشنهادهای جست‌وجو
            const suggestions = document.createElement("div");
            suggestions.id = "searchSuggestions";
            suggestions.style.cssText = [
                "display:none",
                "position:absolute",
                "top:calc(100% + 8px)",
                "right:0",
                "left:0",
                "z-index:9999",
                "max-height:360px",
                "overflow-y:auto",
                "background:var(--surface-color, #1a1a1a)",
                "border:1px solid var(--border-color, #303030)",
                "border-radius:12px",
                "box-shadow:0 12px 30px rgba(0,0,0,.3)",
                "padding:6px"
            ].join(";");

            // کادر پیشنهادها باید نسبت به فرم جای‌گذاری شود
            if (getComputedStyle(searchForm).position === "static") {
                searchForm.style.position = "relative";
            }

            searchForm.appendChild(suggestions);

            function normalizeText(value) {
                return String(value ?? "")
                    .toLowerCase()
                    .replace(/[يى]/g, "ی")
                    .replace(/ك/g, "ک")
                    .replace(/[۰-۹]/g, digit =>
                        String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
                    )
                    .replace(/[٠-٩]/g, digit =>
                        String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
                    )
                    .replace(/[\u064B-\u065F\u0670]/g, "")
                    .replace(/[\u200c\u200d]/g, " ")
                    .replace(/\+/g, " plus ")
                    .replace(/\bpro[\s-]*max\b/g, " promax ")
                    .replace(/پرو\s*مکس|پرومکس/g, " promax ")
                    .replace(/اولترا/g, " ultra ")
                    .replace(/گلکسی/g, " galaxy ")
                    .replace(/سامسونگ/g, " samsung ")
                    .replace(
                        /شیائومی|شیایومی|شیاومی|شیامی|شیاؤمی/g,
                        " xiaomi "
                    )
                    .replace(/ردمی/g, " redmi ")
                    .replace(/پوکو/g, " poco ")
                    .replace(/آیفون|ایفون/g, " iphone ")
                    .replace(/اپل/g, " apple ")
                    .replace(/[^\p{L}\p{N}]+/gu, " ")
                    .trim()
                    .replace(/\s+/g, " ");
            }

            let productsCache = [];

            async function getProducts() {
                if (productsCache.length) return productsCache;

                const productsPath = isInsidePages
                    ? "../data/products.json"
                    : "data/products.json";

                const productsResponse = await fetch(productsPath);

                if (!productsResponse.ok) {
                    throw new Error("بارگذاری فهرست محصولات ناموفق بود");
                }

                productsCache = await productsResponse.json();
                return productsCache;
            }

            function getSearchNames(product) {
                const aliases = {
                    "xiaomi-14": [
                        "شیائومی 14", "شیایومی 14", "شیاومی 14", "xiaomi 14"
                    ],
                    "xiaomi-15": [
                        "شیائومی 15", "شیایومی 15", "شیاومی 15", "xiaomi 15"
                    ],
                    "xiaomi-15-ultra": [
                        "شیائومی 15 اولترا", "شیایومی 15 اولترا",
                        "شیاومی 15 اولترا", "xiaomi 15 ultra"
                    ]
                };

                return normalizeText([
                    product.name,
                    product.brand,
                    product.id,
                    product.category,
                    ...(aliases[product.id] || [])
                ].filter(Boolean).join(" "));
            }

            function matchesSuggestion(product, query) {
                const normalizedQuery = normalizeText(query);

                if (!normalizedQuery) return false;

                const words = getSearchNames(product).split(" ");
                const queryWords = normalizedQuery.split(" ");

                const compactQuery = normalizedQuery.replace(/\s/g, "");
                const compactText = words.join("");

                if (compactText.includes(compactQuery)) return true;

                return queryWords.every(queryWord =>
                    words.some(word => word.startsWith(queryWord))
                );
            }

            function hideSuggestions() {
                suggestions.style.display = "none";
                suggestions.innerHTML = "";
            }

            function goToProducts(query) {
                const productsPage = isInsidePages
                    ? "products.html"
                    : "pages/products.html";

                const params = new URLSearchParams();

                if (query.trim()) {
                    params.set("search", query.trim());
                }

                const queryString = params.toString();

                window.location.href = productsPage +
                    (queryString ? "?" + queryString : "");
            }

            function showSuggestions(products, query) {
                const matchingProducts = products
                    .filter(product => matchesSuggestion(product, query))
                    .slice(0, 7);

                suggestions.innerHTML = "";

                if (!matchingProducts.length) {
                    const emptyMessage = document.createElement("div");
                    emptyMessage.textContent = "محصولی پیدا نشد";
                    emptyMessage.style.cssText =
                        "padding:14px;color:var(--text-muted,#aaa);text-align:center";

                    suggestions.appendChild(emptyMessage);
                    suggestions.style.display = "block";
                    return;
                }

                matchingProducts.forEach(product => {
                    const item = document.createElement("button");
                    item.type = "button";
                    item.style.cssText = [
                        "display:flex",
                        "align-items:center",
                        "gap:12px",
                        "width:100%",
                        "padding:10px",
                        "border:0",
                        "border-radius:8px",
                        "background:transparent",
                        "color:var(--text-color,#f5f5f5)",
                        "text-align:right",
                        "cursor:pointer"
                    ].join(";");

                    const image = document.createElement("img");
                    image.alt = "";
                    image.loading = "lazy";
                    image.src = isInsidePages
                        ? "../" + String(product.image || "").replace(/^\.\.\/+/, "")
                        : String(product.image || "");

                    image.style.cssText =
                        "width:44px;height:44px;object-fit:contain;flex-shrink:0";

                    const details = document.createElement("span");
                    details.style.cssText =
                        "display:flex;flex-direction:column;gap:4px;min-width:0";

                    const name = document.createElement("span");
                    name.textContent = product.name || "گوشی موبایل";
                    name.style.cssText =
                        "font-size:14px;overflow-wrap:anywhere";

                    const price = document.createElement("span");
                    const numericPrice = Number(product.price);

                    price.textContent = numericPrice > 0
                        ? numericPrice.toLocaleString("fa-IR") + " تومان"
                        : "قیمت به‌زودی اعلام می‌شود";

                    price.style.cssText =
                        "font-size:12px;color:var(--primary-color,#ff7900)";

                    details.append(name, price);
                    item.append(image, details);

                    item.addEventListener("mouseenter", () => {
                        item.style.background = "rgba(255,121,0,.1)";
                    });

                    item.addEventListener("mouseleave", () => {
                        item.style.background = "transparent";
                    });

                    item.addEventListener("click", () => {
                        const detailPage = isInsidePages
                            ? "product-details.html"
                            : "pages/product-details.html";

                        window.location.href =
                            detailPage + "?id=" +
                            encodeURIComponent(product.id);
                    });

                    suggestions.appendChild(item);
                });

                const viewAll = document.createElement("button");
                viewAll.type = "button";
                viewAll.textContent = "مشاهده همه نتایج";
                viewAll.style.cssText = [
                    "width:100%",
                    "padding:12px",
                    "border:0",
                    "border-top:1px solid var(--border-color,#303030)",
                    "background:transparent",
                    "color:var(--primary-color,#ff7900)",
                    "cursor:pointer",
                    "font-family:inherit"
                ].join(";");

                viewAll.addEventListener("click", () => {
                    goToProducts(searchInput.value);
                });

                suggestions.appendChild(viewAll);
                suggestions.style.display = "block";
            }

            function updateClearButton() {
                clearSearchButton.style.display =
                    searchInput.value.length > 0 ? "inline-flex" : "none";
            }

            let searchRequest = 0;

            searchInput.addEventListener("input", async function () {
                updateClearButton();

                const query = searchInput.value.trim();
                const requestNumber = ++searchRequest;

                if (!query) {
                    hideSuggestions();
                    return;
                }

                try {
                    const products = await getProducts();

                    // از نمایش نتایج جست‌وجوی قبلی جلوگیری کن
                    if (requestNumber !== searchRequest) return;

                    showSuggestions(products, query);
                } catch (error) {
                    console.error("خطا در جست‌وجوی زنده:", error);
                    hideSuggestions();
                }
            });

            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();

                const searchText = searchInput.value.trim();

                if (!searchText) {
                    searchInput.focus();
                    return;
                }

                goToProducts(searchText);
            });

            clearSearchButton.addEventListener("click", function () {
                searchInput.value = "";
                updateClearButton();
                hideSuggestions();

                searchInput.focus();
            });

            document.addEventListener("click", function (event) {
                if (!searchForm.contains(event.target)) {
                    hideSuggestions();
                }
            });

            searchInput.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    hideSuggestions();
                }
            });

            const currentParams = new URLSearchParams(window.location.search);
            const currentSearch = currentParams.get("search");

            if (currentSearch) {
                searchInput.value = currentSearch;
                updateClearButton();
            }
        } else {
            console.error("فرم جست‌وجو یا کادر جست‌وجو در هدر پیدا نشد.");
        }

        updateHeaderUser();

        const logoutButton = document.getElementById("logoutButton");

        if (logoutButton) {
            logoutButton.addEventListener("click", function (event) {
                event.preventDefault();

                localStorage.removeItem("mobileShopCurrentUser");

                window.location.href = isInsidePages
                    ? "../index.html"
                    : "index.html";
            });
        }

    } catch (error) {
        console.error("خطا در بارگذاری هدر:", error);

        headerPlaceholder.innerHTML =
            '<p style="padding:15px;text-align:center">هدر بارگذاری نشد؛ سایت را با Live Server اجرا کنید.</p>';
    }
});


function updateHeaderUser() {
    const headerActions = document.getElementById("headerActions");

    if (!headerActions) return;

    let currentUser = null;

    try {
        currentUser = JSON.parse(
            localStorage.getItem("mobileShopCurrentUser") || "null"
        );
    } catch (error) {
        currentUser = null;
    }

    if (!currentUser) return;

    const isInsidePages = window.location.pathname.includes("/pages/");

    const profileUrl = isInsidePages
        ? "profile.html"
        : "pages/profile.html";

    const userName = document.createElement("span");
    userName.textContent = currentUser.fullName || "کاربر";
    userName.className = "header-user-name";

    const profileLink = document.createElement("a");
    profileLink.href = profileUrl;
    profileLink.className = "header-action";
    profileLink.textContent = "پروفایل";

    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.id = "logoutButton";
    logoutLink.className = "header-action";
    logoutLink.textContent = "خروج";

    const loginLink = document.getElementById("loginLink");

    if (loginLink) {
        loginLink.replaceWith(userName, profileLink, logoutLink);
    } else {
        headerActions.prepend(userName, profileLink, logoutLink);
    }
}