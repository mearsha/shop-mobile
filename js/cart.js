function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem("mobileShopCart"));
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("mobileShopCart", JSON.stringify(cart));
}

function addToCart(productId) {
    const cart = getCart();
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();

    alert("محصول با موفقیت به سبد خرید اضافه شد! 🛒");
}

function updateCartCount() {
    const cart = getCart();

    const totalItems = cart.reduce((total, item) => {
        const quantity = Number(item.quantity);
        return total + (Number.isInteger(quantity) && quantity > 0 ? quantity : 0);
    }, 0);

    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = totalItems.toLocaleString("fa-IR");
        cartCount.style.display = totalItems > 0 ? "inline-flex" : "none";
    }
}

async function loadCartPage() {
    const cartItems = document.getElementById("cartItems");

    if (!cartItems) return;

    try {
        const response = await fetch("../data/products.json");

        if (!response.ok) {
            throw new Error("فایل محصولات پیدا نشد.");
        }

        const products = await response.json();

        renderCart(products);

        cartItems.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const productId = button.dataset.id;
            const action = button.dataset.action;
            let cart = getCart();

            const item = cart.find(item => item.id === productId);

            if (!item) return;

            if (action === "increase") {
                item.quantity = Number(item.quantity) + 1;
            } else if (action === "decrease") {
                item.quantity = Number(item.quantity) - 1;

                if (item.quantity <= 0) {
                    cart = cart.filter(item => item.id !== productId);
                }
            } else if (action === "remove") {
                cart = cart.filter(item => item.id !== productId);
            }

            saveCart(cart);
            renderCart(products);
            updateCartCount();
        });

        const checkoutBtn = document.getElementById("checkoutBtn");

        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", function () {
                if (getCart().length === 0) {
                    alert("سبد خرید شما خالی است!");
                    return;
                }

                const cart = getCart();
                const hasUnknownPrice = cart.some(item => {
                    const product = products.find(product => product.id === item.id);
                    return !product || Number(product.price) <= 0;
                });

                if (hasUnknownPrice) {
                    alert("قیمت بعضی از محصولات هنوز مشخص نشده است.");
                    return;
                }

                window.location.href = "checkout.html";
            });
        }

    } catch (error) {
        console.error("خطا در بارگذاری سبد خرید:", error);
        cartItems.innerHTML = "<p>بارگذاری سبد خرید با مشکل مواجه شد.</p>";
    }
}

function renderCart(products) {
    const cartItems = document.getElementById("cartItems");

    if (!cartItems) return;

    const cart = getCart();

    let totalItems = 0;
    let totalPrice = 0;
    let hasUnknownPrice = false;

    const validItems = cart.filter(item =>
        products.some(product => product.id === item.id) &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
    );

    if (validItems.length !== cart.length) {
        saveCart(validItems);
    }

    if (validItems.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <h3>سبد خرید شما خالی است 🛒</h3>
                <p>هنوز محصولی به سبد خرید اضافه نکرده‌اید.</p>
                <a href="products.html">مشاهده محصولات</a>
            </div>
        `;

        const totalItemsElement = document.getElementById("cartTotalItems");
        const totalPriceElement = document.getElementById("cartTotalPrice");

        if (totalItemsElement) totalItemsElement.textContent = "۰";
        if (totalPriceElement) totalPriceElement.textContent = "۰ تومان";

        return;
    }

    cartItems.innerHTML = validItems.map(item => {
        const product = products.find(product => product.id === item.id);
        const quantity = Number(item.quantity);
        const price = Number(product.price);

        totalItems += quantity;

        if (price > 0) {
            totalPrice += price * quantity;
        } else {
            hasUnknownPrice = true;
        }

        const priceText = price > 0
            ? `${price.toLocaleString("fa-IR")} تومان`
            : "قیمت به‌زودی اعلام می‌شود";

        return `
            <article class="cart-item">
                <img src="../${product.image}" alt="${product.name}">

                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <p class="cart-item-price">${priceText}</p>

                    <div class="cart-item-actions">
                        <button class="quantity-btn"
                            data-action="decrease"
                            data-id="${item.id}"
                            aria-label="کاهش تعداد ${product.name}">−</button>

                        <span>${quantity.toLocaleString("fa-IR")}</span>

                        <button class="quantity-btn"
                            data-action="increase"
                            data-id="${item.id}"
                            aria-label="افزایش تعداد ${product.name}">+</button>

                        <button class="remove-item-btn"
                            data-action="remove"
                            data-id="${item.id}">حذف</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    const totalItemsElement = document.getElementById("cartTotalItems");
    const totalPriceElement = document.getElementById("cartTotalPrice");

    if (totalItemsElement) {
        totalItemsElement.textContent = totalItems.toLocaleString("fa-IR");
    }

    if (totalPriceElement) {
        totalPriceElement.textContent = hasUnknownPrice
            ? `${totalPrice.toLocaleString("fa-IR")} تومان + قیمت نامشخص`
            : `${totalPrice.toLocaleString("fa-IR")} تومان`;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    loadCartPage();
});