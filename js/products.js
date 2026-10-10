let allProducts = [];

// نام‌های جایگزین برای برندها و مدل‌های گوشی
const searchAliases = {
    "poco-c85": [
        "پوکو سی ۸۵", "پوکو سی85", "poco c85", "poco c 85", "poco-c85"
    ],
    "poco-c65": [
        "پوکو سی ۶۵", "پوکو سی65", "poco c65", "poco c 65"
    ],
    "redmi-note-14-pro-plus": [
        "ردمی نوت ۱۴ پرو پلاس", "ردمی نوت 14 پرو پلاس",
        "redmi note 14 pro plus", "redmi note 14 pro+",
        "note 14 pro plus", "نوت ۱۴ پرو پلاس"
    ],
    "xiaomi-14": [
        "شیائومی ۱۴", "شیایومی ۱۴", "شیاومی ۱۴",
        "شیامی 14", "xiaomi 14", "شیائومی چهارده"
    ],
    "xiaomi-15": [
        "شیائومی ۱۵", "شیایومی ۱۵", "شیاومی ۱۵",
        "شیامی 15", "xiaomi 15", "شیائومی پانزده"
    ],
    "xiaomi-15-ultra": [
        "شیائومی ۱۵ اولترا", "شیایومی ۱۵ اولترا",
        "شیاومی 15 اولترا", "xiaomi 15 ultra",
        "شیائومی 15 ultra", "شیائومی اولترا ۱۵"
    ],
    "galaxy-a36": [
        "سامسونگ آ ۳۶", "سامسونگ a36", "samsung a36",
        "galaxy a36", "گلکسی a36", "گلکسی آ ۳۶"
    ],
    "galaxy-a56": [
        "سامسونگ آ ۵۶", "سامسونگ a56", "samsung a56",
        "galaxy a56", "گلکسی a56", "گلکسی آ ۵۶"
    ],
    "galaxy-s23-fe": [
        "سامسونگ اس ۲۳ اف ای", "سامسونگ s23 fe",
        "samsung s23 fe", "galaxy s23 fe", "گلکسی s23 fe"
    ],
    "galaxy-s24-ultra": [
        "سامسونگ اس ۲۴ اولترا", "سامسونگ s24 ultra",
        "samsung s24 ultra", "galaxy s24 ultra",
        "گلکسی s24 ultra", "s24u"
    ],
    "galaxy-s25": [
        "سامسونگ اس ۲۵", "سامسونگ s25",
        "samsung s25", "galaxy s25", "گلکسی s25"
    ],
    "galaxy-s25-ultra": [
        "سامسونگ اس ۲۵ اولترا", "سامسونگ s25 ultra",
        "samsung s25 ultra", "galaxy s25 ultra",
        "گلکسی s25 ultra", "s25u"
    ],
    "galaxy-s26-ultra": [
        "سامسونگ اس ۲۶ اولترا", "سامسونگ s26 ultra",
        "samsung s26 ultra", "galaxy s26 ultra",
        "گلکسی s26 ultra", "s26u"
    ],
    "iphone-13": [
        "آیفون ۱۳", "ایفون 13", "iphone 13",
        "apple iphone 13", "اپل ۱۳", "آیفون سیزده"
    ],
    "iphone-13-pro-max": [
        "آیفون ۱۳ پرو مکس", "ایفون 13 پرومکس",
        "iphone 13 pro max", "iphone 13 promax",
        "13 pro max", "۱۳ پرومکس"
    ],
    "iphone-14": [
        "آیفون ۱۴", "ایفون 14", "iphone 14",
        "apple iphone 14", "آیفون چهارده"
    ],
    "iphone-15": [
        "آیفون ۱۵", "ایفون 15", "iphone 15",
        "apple iphone 15", "آیفون پانزده"
    ],
    "iphone-15-pro-max": [
        "آیفون ۱۵ پرو مکس", "ایفون 15 پرومکس",
        "iphone 15 pro max", "iphone 15 promax",
        "15 pro max", "۱۵ پرومکس"
    ],
    "iphone-16": [
        "آیفون ۱۶", "ایفون 16", "iphone 16",
        "apple iphone 16", "آیفون شانزده"
    ],
    "iphone-17": [
        "آیفون ۱۷", "ایفون 17", "iphone 17",
        "apple iphone 17", "آیفون هفده"
    ]
};


// یکسان‌سازی عبارت جست‌وجو
function normalizeSearch(value) {
    return String(value ?? "")
        .toLowerCase()

        // یکسان‌سازی حروف فارسی و عربی
        .replace(/[يى]/g, "ی")
        .replace(/ك/g, "ک")

        // تبدیل اعداد فارسی و عربی به انگلیسی
        .replace(/[۰-۹]/g, digit =>
            String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
        )
        .replace(/[٠-٩]/g, digit =>
            String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
        )

        // حذف اعراب و یکسان‌سازی فاصله‌ها
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .replace(/[\u200c\u200d]/g, " ")
        .replace(/[‐‑‒–—−]/g, "-")

        // یکسان‌سازی عبارت‌های رایج
        .replace(/\+/g, " plus ")
        .replace(/\bpro[\s-]*max\b/g, " promax ")
        .replace(/پرو\s*مکس/g, " promax ")
        .replace(/پرومکس/g, " promax ")
        .replace(/اولترا/g, " ultra ")
        .replace(/گلکسی/g, " galaxy ")
        .replace(/سامسونگ/g, " samsung ")

        // شکل‌های مختلف نوشتن شیائومی
        .replace(/شیائومی|شیایومی|شیاومی|شیامی|شیاؤمی/g, " xiaomi ")

        .replace(/ردمی/g, " redmi ")
        .replace(/پوکو/g, " poco ")
        .replace(/آیفون|ایفون/g, " iphone ")
        .replace(/اپل/g, " apple ")

        // حذف علائم اضافی و مرتب‌کردن فاصله‌ها
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim()
        .replace(/\s+/g, " ");
}


// ساخت متن قابل جست‌وجو برای هر محصول
function getProductSearchText(product) {
    const aliases = searchAliases[product.id] || [];

    return normalizeSearch([
        product.name,
        product.brand,
        product.id,
        product.category,
        product.description,
        ...aliases
    ].filter(Boolean).join(" "));
}


// جست‌وجوی هوشمند با حروف ناقص
function matchesSearch(product, query) {
    const normalizedQuery = normalizeSearch(query);

    if (!normalizedQuery) return true;

    const searchText = getProductSearchText(product);

    // تطبیق عبارت کامل
    if (searchText.includes(normalizedQuery)) {
        return true;
    }

    // تطبیق عبارت بدون فاصله
    const compactQuery = normalizedQuery.replace(/\s+/g, "");
    const compactText = searchText.replace(/\s+/g, "");

    if (compactText.includes(compactQuery)) {
        return true;
    }

    // تطبیق ابتدای کلمات، حتی با چند حرف ناقص
    const queryWords = normalizedQuery.split(" ").filter(Boolean);
    const productWords = searchText.split(" ").filter(Boolean);

    return queryWords.every(queryWord =>
        productWords.some(productWord =>
            productWord.startsWith(queryWord)
        )
    );
}


// تشخیص مسیر صفحه
function isInsidePages() {
    return /\/pages\//i.test(window.location.pathname);
}


// بارگذاری محصولات
async function loadProducts() {
    const productsGrid = document.getElementById("productsGrid");

    if (!productsGrid) return;

    try {
        const productsPath = isInsidePages()
            ? "../data/products.json"
            : "data/products.json";

        const response = await fetch(productsPath);

        if (!response.ok) {
            throw new Error("فایل محصولات پیدا نشد!");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("ساختار فایل محصولات معتبر نیست!");
        }

        allProducts = data;

        setupProductFilters();
        applyProductFilters();

    } catch (error) {
        console.error("خطا در بارگذاری محصولات:", error);

        productsGrid.innerHTML = `
            <div class="cart-empty">
                <h3>بارگذاری محصولات ناموفق بود!</h3>
                <p>مسیر فایل data/products.json را بررسی کن.</p>
            </div>
        `;
    }
}


// نمایش کارت محصولات
function renderProducts(products) {
    const productsGrid = document.getElementById("productsGrid");

    if (!productsGrid) return;

    // فقط صفحه اصلی به چهار محصول محدود می‌شود
    const isHomePage =
        !isInsidePages() &&
        !window.location.pathname.endsWith("/products.html");

    const visibleProducts = isHomePage
        ? products.slice(0, 4)
        : products;

    if (visibleProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="cart-empty">
                <h3>محصولی پیدا نشد!</h3>
                <p>نام گوشی، برند یا چند حرف از مدل را امتحان کن.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = visibleProducts.map(product => {
        const price = Number(product.price);

        const priceText = Number.isFinite(price) && price > 0
            ? `${price.toLocaleString("fa-IR")} تومان`
            : "قیمت به‌زودی اعلام می‌شود";

        const badge = product.badge
            ? `<span class="product-badge">${product.badge}</span>`
            : "";

        // اصلاح مسیر تصویر
        let imagePath = String(product.image || "");

        if (isInsidePages()) {
            imagePath = imagePath.replace(/^(\.\.\/)+/, "");
            imagePath = `../${imagePath}`;
        } else {
            imagePath = imagePath.replace(/^(\.\/)+/, "");
        }

        // مسیر صفحه جزئیات
        let productUrl = product.url ||
            `pages/product-details.html?id=${encodeURIComponent(product.id)}`;

        if (isInsidePages()) {
            productUrl = productUrl.replace(/^pages\//, "");
        }

        const favorite = typeof isFavorite === "function"
            ? isFavorite(product.id)
            : false;

        return `
            <article class="product-card">
                <div class="product-image">
                    <button
                        type="button"
                        class="favorite-toggle ${favorite ? "is-favorite" : ""}"
                        data-favorite-id="${product.id}"
                        aria-label="${favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}"
                        aria-pressed="${favorite}"
                        title="${favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}">
                        ${favorite ? "♥" : "♡"}
                    </button>

                    ${badge}

                    <img
                        src="${imagePath}"
                        alt="${product.name || "گوشی موبایل"}"
                        loading="lazy"
                        onerror="this.onerror=null;this.alt='تصویر محصول موجود نیست';">
                </div>

                <div class="product-info">
                    <p class="product-brand">${product.brand || ""}</p>

                    <h3 class="product-name">${product.name || ""}</h3>

                    <p class="product-price">${priceText}</p>

                    <a href="${productUrl}" class="product-details-link">
                        مشاهده جزئیات
                    </a>
                </div>
            </article>
        `;
    }).join("");
}


// تنظیم فیلترها
function setupProductFilters() {
    const brandSelect = document.getElementById("filterBrand");
    const sortSelect = document.getElementById("sortProducts");
    const applyButton = document.getElementById("applyFilters");
    const clearButton = document.getElementById("clearFilters");

    const params = new URLSearchParams(window.location.search);
    const requestedBrand = params.get("brand");

    if (brandSelect && requestedBrand) {
        const matchingOption = [...brandSelect.options].find(option =>
            normalizeSearch(option.value) === normalizeSearch(requestedBrand)
        );

        if (matchingOption) {
            brandSelect.value = matchingOption.value;
        }
    }

    // جلوگیری از ثبت چندباره رویدادها
    if (brandSelect && brandSelect.dataset.filterReady !== "true") {
        brandSelect.addEventListener("change", applyProductFilters);
        brandSelect.dataset.filterReady = "true";
    }

    if (sortSelect && sortSelect.dataset.filterReady !== "true") {
        sortSelect.addEventListener("change", applyProductFilters);
        sortSelect.dataset.filterReady = "true";
    }

    if (applyButton && applyButton.dataset.filterReady !== "true") {
        applyButton.addEventListener("click", applyProductFilters);
        applyButton.dataset.filterReady = "true";
    }

    if (clearButton && clearButton.dataset.filterReady !== "true") {
        clearButton.addEventListener("click", function () {
            const minPriceInput = document.getElementById("minPrice");
            const maxPriceInput = document.getElementById("maxPrice");
            const searchInput = document.getElementById("searchInput");

            if (brandSelect) brandSelect.value = "";
            if (minPriceInput) minPriceInput.value = "";
            if (maxPriceInput) maxPriceInput.value = "";
            if (sortSelect) sortSelect.value = "default";
            if (searchInput) searchInput.value = "";

            // پاک‌کردن پارامترهای جست‌وجو و فیلتر از آدرس
            window.history.replaceState(
                {},
                "",
                window.location.pathname
            );

            applyProductFilters();
        });

        clearButton.dataset.filterReady = "true";
    }
}


// اعمال فیلترها و جست‌وجو
function applyProductFilters() {
    const brandSelect = document.getElementById("filterBrand");
    const minPriceInput = document.getElementById("minPrice");
    const maxPriceInput = document.getElementById("maxPrice");
    const sortSelect = document.getElementById("sortProducts");

    const params = new URLSearchParams(window.location.search);
    const requestedSearch = params.get("search") || "";

    const selectedBrand = brandSelect
        ? normalizeSearch(brandSelect.value)
        : "";

    const minPrice = minPriceInput && minPriceInput.value.trim() !== ""
        ? Number(minPriceInput.value)
        : null;

    const maxPrice = maxPriceInput && maxPriceInput.value.trim() !== ""
        ? Number(maxPriceInput.value)
        : null;

    if (
        (minPrice !== null &&
            (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice !== null &&
            (!Number.isFinite(maxPrice) || maxPrice < 0))
    ) {
        alert("لطفاً قیمت معتبر و غیرمنفی وارد کن.");
        return;
    }

    if (
        minPrice !== null &&
        maxPrice !== null &&
        minPrice > maxPrice
    ) {
        alert("حداقل قیمت نمی‌تواند بیشتر از حداکثر قیمت باشد.");
        return;
    }

    let filteredProducts = allProducts.filter(product => {
        const brand = normalizeSearch(product.brand || "");

        const brandMatches =
            !selectedBrand || brand === selectedBrand;

        const searchMatches =
            matchesSearch(product, requestedSearch);

        const price = Number(product.price);
        const hasPrice = Number.isFinite(price) && price > 0;

        const priceMatches =
            minPrice === null && maxPrice === null
                ? true
                : hasPrice &&
                  (minPrice === null || price >= minPrice) &&
                  (maxPrice === null || price <= maxPrice);

        return brandMatches && searchMatches && priceMatches;
    });

    // مرتب‌سازی محصولات
    const sortValue = sortSelect
        ? sortSelect.value
        : "default";

    if (sortValue === "price-low") {
        filteredProducts.sort((a, b) => {
            const priceA = Number(a.price);
            const priceB = Number(b.price);

            if (priceA <= 0 && priceB <= 0) return 0;
            if (priceA <= 0) return 1;
            if (priceB <= 0) return -1;

            return priceA - priceB;
        });

    } else if (sortValue === "price-high") {
        filteredProducts.sort((a, b) => {
            const priceA = Number(a.price);
            const priceB = Number(b.price);

            if (priceA <= 0 && priceB <= 0) return 0;
            if (priceA <= 0) return 1;
            if (priceB <= 0) return -1;

            return priceB - priceA;
        });

    } else if (sortValue === "name") {
        filteredProducts.sort((a, b) =>
            String(a.name || "").localeCompare(
                String(b.name || ""),
                "fa"
            )
        );
    }

    renderProducts(filteredProducts);
}


// شروع برنامه بعد از بارگذاری صفحه
document.addEventListener("DOMContentLoaded", loadProducts);