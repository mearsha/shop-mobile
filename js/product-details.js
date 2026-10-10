
async function loadProductDetails() {
    const productDetails = document.getElementById("productDetails");

    if (!productDetails) return;

    try {
        const response = await fetch("../data/products.json");

        if (!response.ok) {
            throw new Error("فایل محصولات پیدا نشد.");
        }

        const products = await response.json();

        const params = new URLSearchParams(window.location.search);
        const productId = params.get("id");

        const product = products.find(item => item.id === productId);

        if (!product) {
            productDetails.innerHTML = `
                <p>محصول موردنظر پیدا نشد!</p>
                <a href="products.html">بازگشت به محصولات</a>
            `;
            return;
        }

        document.title = `${product.name} | موبایل‌شاپ`;

        document.getElementById("breadcrumbName").textContent = product.name;

        const priceText = product.price > 0
            ? `${product.price.toLocaleString("fa-IR")} تومان`
            : "قیمت به‌زودی اعلام می‌شود";

        const badge = product.badge
            ? `<span class="details-badge">${product.badge}</span>`
            : "";

        productDetails.innerHTML = `
            <div class="details-image">
                <img src="../${product.image}" alt="${product.name}">
            </div>

            <div class="details-info">
                ${badge}

                <p class="details-brand">${product.brand}</p>

                <h1 class="details-title">${product.name}</h1>

                <p class="details-price">${priceText}</p>

                <p class="details-description">
                    ${product.description}
                </p>

                <button class="add-to-cart-btn" id="addToCartBtn">
                    افزودن به سبد خرید
                </button>
            </div>
        `;

        document.getElementById("addToCartBtn").addEventListener("click", function () {
           addToCart(product.id);
        });

    } catch (error) {
        console.error("خطا در بارگذاری جزئیات محصول:", error);

        productDetails.innerHTML = `
            <p>بارگذاری اطلاعات محصول با مشکل مواجه شد.</p>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadProductDetails);
