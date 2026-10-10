function checkoutGetCart() {
    try {
        const cart = JSON.parse(localStorage.getItem("mobileShopCart") || "[]");
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function checkoutGetCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("mobileShopCurrentUser") || "null");
    } catch {
        return null;
    }
}

function checkoutFormatPrice(price) {
    return Number(price).toLocaleString("fa-IR") + " تومان";
}

function checkoutEscapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

let checkoutProducts = [];
let checkoutTotal = 0;

async function checkoutInitialize() {
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    const currentUser = checkoutGetCurrentUser();

    if (!currentUser) {
        alert("برای ثبت سفارش ابتدا وارد حساب کاربری شو.");
        window.location.href = "login.html";
        return;
    }

    const message = document.getElementById("checkoutMessage");
    const itemsContainer = document.getElementById("checkoutItems");
    const submitButton = document.getElementById("placeOrderBtn");

    const nameInput = document.getElementById("receiverName");
    const phoneInput = document.getElementById("receiverPhone");

    nameInput.value = currentUser.fullName || "";
    phoneInput.value = currentUser.phone || "";

    try {
        const response = await fetch("../data/products.json");

        if (!response.ok) {
            throw new Error("بارگذاری محصولات ناموفق بود.");
        }

        checkoutProducts = await response.json();

        checkoutRenderSummary();

        if (checkoutGetCart().length === 0) {
            submitButton.disabled = true;
            message.textContent = "سبد خرید خالی است. ابتدا محصولی به سبد خرید اضافه کن.";
        }
    } catch (error) {
        console.error(error);
        itemsContainer.innerHTML = '<p class="checkout-empty">بارگذاری محصولات با مشکل مواجه شد.</p>';
        submitButton.disabled = true;
        message.textContent = "امکان بارگذاری محصولات وجود ندارد.";
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        message.textContent = "";

        const cart = checkoutGetCart();

        if (cart.length === 0) {
            message.textContent = "سبد خرید خالی است.";
            return;
        }

        const receiverName = nameInput.value.trim();
        const receiverPhone = phoneInput.value.trim();
        const receiverAddress = document.getElementById("receiverAddress").value.trim();

        if (receiverName.length < 3) {
            message.textContent = "نام و نام خانوادگی را درست وارد کن.";
            return;
        }

        if (!/^09\d{9}$/.test(receiverPhone)) {
            message.textContent = "شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد.";
            return;
        }

        if (receiverAddress.length < 10) {
            message.textContent = "لطفاً آدرس کامل‌تری وارد کن.";
            return;
        }

        const orderItems = [];

        for (const cartItem of cart) {
            const product = checkoutProducts.find(
                item => String(item.id) === String(cartItem.id)
            );

            const quantity = Number(cartItem.quantity);

            if (!product || !Number.isInteger(quantity) || quantity < 1) {
                message.textContent = "یکی از محصولات سبد خرید معتبر نیست.";
                return;
            }

            const price = Number(product.price);

            if (!Number.isFinite(price) || price <= 0) {
                message.textContent = "قیمت یکی از محصولات مشخص نیست.";
                return;
            }

            orderItems.push({
                productId: product.id,
                name: product.name,
                image: product.image,
                price,
                quantity
            });
        }

        const total = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const orderId = "MS-" + Date.now();
        const now = new Date().toISOString();

        const order = {
            id: orderId,
            userId: String(currentUser.id ?? currentUser.phone ?? ""),
            date: now,
            status: "processing",
            receiverName,
            receiverPhone,
            address: receiverAddress,
            paymentMethod: form.querySelector('input[name="paymentMethod"]:checked')?.value || "پرداخت هنگام تحویل",
            shippingMethod: "ارسال پستی",
            items: orderItems,
            total
        };

        let orders = [];

        try {
            orders = JSON.parse(localStorage.getItem("mobileShopOrders") || "[]");

            if (!Array.isArray(orders)) {
                orders = [];
            }
        } catch {
            orders = [];
        }

        orders.push(order);

        try {
            localStorage.setItem("mobileShopOrders", JSON.stringify(orders));
            localStorage.setItem("mobileShopCart", JSON.stringify([]));
        } catch (error) {
            console.error(error);
            message.textContent = "ذخیره سفارش انجام نشد. فضای ذخیره‌سازی مرورگر را بررسی کن.";
            return;
        }

        alert("سفارش با موفقیت ثبت شد! 🧡");
        window.location.href = "orders.html";
    });
}

function checkoutRenderSummary() {
    const container = document.getElementById("checkoutItems");
    const totalElement = document.getElementById("checkoutTotal");
    const cart = checkoutGetCart();

    if (!cart.length) {
        container.innerHTML = '<p class="checkout-empty">سبد خرید شما خالی است.</p>';
        totalElement.textContent = checkoutFormatPrice(0);
        checkoutTotal = 0;
        return;
    }

    let total = 0;

    const html = cart.map(cartItem => {
        const product = checkoutProducts.find(
            item => String(item.id) === String(cartItem.id)
        );

        if (!product) return "";

        const quantity = Number(cartItem.quantity) || 1;
        const price = Number(product.price) || 0;

        total += price * quantity;

        return `
            <div class="checkout-product">
                <img
                    src="../${checkoutEscapeHTML(product.image)}"
                    alt="${checkoutEscapeHTML(product.name)}"
                    onerror="this.style.display='none'"
                >

                <div class="checkout-product-info">
                    <h3>${checkoutEscapeHTML(product.name)}</h3>
                    <p>تعداد: ${quantity.toLocaleString("fa-IR")}</p>
                </div>

                <div class="checkout-product-price">
                    ${checkoutFormatPrice(price * quantity)}
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = html || '<p class="checkout-empty">محصول معتبری پیدا نشد.</p>';
    totalElement.textContent = checkoutFormatPrice(total);
    checkoutTotal = total;
}

document.addEventListener("DOMContentLoaded", checkoutInitialize);