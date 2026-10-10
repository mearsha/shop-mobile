function getFavorites() {
    try {
        const favorites = JSON.parse(
            localStorage.getItem("mobileShopFavorites")
        );

        return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem(
        "mobileShopFavorites",
        JSON.stringify(favorites)
    );
}

function toggleFavorite(productId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(productId);

    if (index === -1) {
        favorites.push(productId);
    } else {
        favorites.splice(index, 1);
    }

    saveFavorites(favorites);
    updateFavoritesCount();

    if (typeof loadProducts === "function") {
        loadProducts();
    }

    if (typeof loadFavoritesPage === "function") {
        loadFavoritesPage();
    }
}

function isFavorite(productId) {
    return getFavorites().includes(productId);
}

function updateFavoritesCount() {
    const countElement = document.getElementById("favoritesCount");

    if (!countElement) return;

    const count = getFavorites().length;

    countElement.textContent =
        `${count.toLocaleString("fa-IR")} محصول در علاقه‌مندی‌ها`;
}

async function loadFavoritesPage() {
    const favoritesGrid = document.getElementById("favoritesGrid");

    if (!favoritesGrid) return;

    try {
        const isInsidePages =
            window.location.pathname.includes("/pages/");

        const productsPath = isInsidePages
            ? "../data/products.json"
            : "data/products.json";

        const response = await fetch(productsPath);

        if (!response.ok) {
            throw new Error("فایل محصولات پیدا نشد.");
        }

        const products = await response.json();

        renderFavorites(products);
    } catch (error) {
        console.error("خطا در بارگذاری علاقه‌مندی‌ها:", error);

        favoritesGrid.innerHTML =
            "<p>بارگذاری علاقه‌مندی‌ها با مشکل مواجه شد.</p>";
    }
}

function renderFavorites(products) {
    const favoritesGrid = document.getElementById("favoritesGrid");

    if (!favoritesGrid) return;

    const favorites = getFavorites();

    const favoriteProducts = products.filter(product =>
        favorites.includes(product.id)
    );

    updateFavoritesCount();

    if (favoriteProducts.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="cart-empty">
                <h3>هنوز محصولی به علاقه‌مندی‌ها اضافه نکردی ❤️</h3>
                <p>محصولات مورد علاقه‌ات رو پیدا کن و با زدن قلب ذخیره‌شون کن.</p>
                <a href="products.html">مشاهده محصولات</a>
            </div>
        `;

        return;
    }

    const isInsidePages =
        window.location.pathname.includes("/pages/");

    favoritesGrid.innerHTML = favoriteProducts.map(product => {
        const imagePath = isInsidePages
            ? `../${product.image}`
            : product.image;

        const productUrl = isInsidePages
            ? product.url.replace(/^pages\//, "")
            : product.url;

        const priceText = product.price > 0
            ? `${product.price.toLocaleString("fa-IR")} تومان`
            : "قیمت به‌زودی اعلام می‌شود";

        return `
            <article class="product-card">
                <div class="product-image">
                    <button
                        type="button"
                        class="favorite-toggle is-favorite"
                        data-favorite-id="${product.id}"
                        aria-label="حذف ${product.name} از علاقه‌مندی‌ها"
                        aria-pressed="true"
                        title="حذف از علاقه‌مندی‌ها">
                        ♥
                    </button>

                    ${product.badge
                        ? `<span class="product-badge">${product.badge}</span>`
                        : ""}

                    <img
                        src="${imagePath}"
                        alt="${product.name}"
                        loading="lazy">
                </div>

                <div class="product-info">
                    <p class="product-brand">${product.brand}</p>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${priceText}</p>

                    <a href="${productUrl}" class="product-details-link">
                        مشاهده جزئیات
                    </a>
                </div>
            </article>
        `;
    }).join("");
}

document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-favorite-id]");

    if (!button) return;

    event.preventDefault();

    toggleFavorite(button.dataset.favoriteId);
});

document.addEventListener("DOMContentLoaded", function () {
    updateFavoritesCount();
    loadFavoritesPage();
});