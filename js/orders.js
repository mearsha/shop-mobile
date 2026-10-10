const ORDERS_STORAGE_KEY = "mobileShopOrders";
const PRODUCTS_DATA_URL = "../data/products.json";

const ordersList = document.getElementById("ordersList");
const ordersEmpty = document.getElementById("ordersEmpty");
const orderFilter = document.getElementById("orderFilter");

let allOrders = [];
let productCatalog = [];

function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(Number(price) || 0) + " تومان";
}

function formatDate(dateValue) {
    if (!dateValue) return "ثبت نشده";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "ثبت نشده";
    }

    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(date);
}

function getStatusInfo(status) {
    const statuses = {
        processing: {
            label: "در حال پردازش",
            className: "processing"
        },
        shipped: {
            label: "ارسال‌شده",
            className: "shipped"
        },
        delivered: {
            label: "تحویل‌شده",
            className: "delivered"
        },
        cancelled: {
            label: "لغوشده",
            className: "cancelled"
        }
    };

    return statuses[status] || statuses.processing;
}

function getProduct(productId) {
    return productCatalog.find(
        product => String(product.id) === String(productId)
    );
}

function getOrderProducts(order) {
    const items = Array.isArray(order.items) ? order.items : [];

    return items.map(item => {
        const productId = item.productId ?? item.id;
        const product = getProduct(productId);

        return {
            name: item.name || product?.name || "محصول",
            image: item.image || product?.image || "",
            price: Number(item.price ?? product?.price ?? 0),
            quantity: Math.max(1, Number(item.quantity) || 1)
        };
    });
}

function getOrderTotal(order) {
    if (
        order.total !== undefined &&
        order.total !== null &&
        order.total !== "" &&
        Number.isFinite(Number(order.total))
    ) {
        return Number(order.total);
    }

    return getOrderProducts(order).reduce((sum, product) => {
        return sum + product.price * product.quantity;
    }, 0);
}

function updateOrderSummary() {
    const totalOrders = document.getElementById("totalOrders");
    const pendingOrders = document.getElementById("pendingOrders");
    const deliveredOrders = document.getElementById("deliveredOrders");

    if (totalOrders) {
        totalOrders.textContent =
            new Intl.NumberFormat("fa-IR").format(allOrders.length);
    }

    if (pendingOrders) {
        pendingOrders.textContent = new Intl.NumberFormat("fa-IR").format(
            allOrders.filter(order => order.status === "processing").length
        );
    }

    if (deliveredOrders) {
        deliveredOrders.textContent = new Intl.NumberFormat("fa-IR").format(
            allOrders.filter(order => order.status === "delivered").length
        );
    }
}

function saveOrders() {
    try {
        localStorage.setItem(
            ORDERS_STORAGE_KEY,
            JSON.stringify(allOrders)
        );
    } catch (error) {
        console.error("ذخیره سفارش‌ها انجام نشد.", error);
        alert("ذخیره تغییرات انجام نشد. دوباره تلاش کن.");
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function getOrderKey(order) {
    return String(order.id ?? order.orderNumber ?? "");
}

function renderOrders() {
    if (!ordersList || !ordersEmpty || !orderFilter) return;

    const filter = orderFilter.value;

    const filteredOrders = allOrders.filter(order => {
        return filter === "all" || order.status === filter;
    });

    updateOrderSummary();

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = "";
        ordersEmpty.hidden = false;

        const title = ordersEmpty.querySelector("h2");
        const description = ordersEmpty.querySelector("p");
        const loginLink = ordersEmpty.querySelector("a");

        if (allOrders.length === 0) {
            if (title) title.textContent = "هنوز سفارشی ثبت نکردی!";
            if (description) {
                description.textContent =
                    "بعد از ثبت خرید، سفارش‌هات اینجا نمایش داده می‌شن.";
            }
            if (loginLink) loginLink.hidden = true;
        } else {
            if (title) title.textContent = "سفارشی پیدا نشد";
            if (description) {
                description.textContent =
                    "برای این وضعیت، سفارشی وجود نداره.";
            }
            if (loginLink) loginLink.hidden = true;
        }

        return;
    }

    ordersEmpty.hidden = true;

    ordersList.innerHTML = filteredOrders.map(order => {
        const status = getStatusInfo(order.status);
        const products = getOrderProducts(order);
        const total = getOrderTotal(order);
        const orderNumber = getOrderKey(order) || "—";
        const canCancel = order.status === "processing";
        const canDelete = order.status === "cancelled";
        const expanded = order.expanded === true;

        const productsHTML = products.length
            ? products.map(product => `
                <div class="order-product">
                    ${
                        product.image
                            ? `<img
                                src="${escapeHTML(product.image)}"
                                alt="${escapeHTML(product.name)}"
                                onerror="this.style.display='none'"
                            >`
                            : ""
                    }

                    <div class="order-product-info">
                        <h3>${escapeHTML(product.name)}</h3>
                        <p>
                            تعداد:
                            ${product.quantity.toLocaleString("fa-IR")}
                            عدد
                        </p>
                    </div>

                    <div class="order-product-price">
                        ${formatPrice(product.price * product.quantity)}
                    </div>
                </div>
            `).join("")
            : `<p class="order-date">جزئیات محصولات این سفارش ثبت نشده است.</p>`;

        return `
            <article class="order-card">
                <div class="order-card-header">
                    <div>
                        <div class="order-number">
                            سفارش شماره ${escapeHTML(orderNumber)}
                        </div>

                        <div class="order-date">
                            تاریخ ثبت:
                            ${formatDate(order.date || order.createdAt)}
                        </div>
                    </div>

                    <span class="order-status ${status.className}">
                        ● ${status.label}
                    </span>
                </div>

                <div class="order-products">
                    ${productsHTML}
                </div>

                <div class="order-details">
                    <div class="order-detail">
                        <span>روش پرداخت</span>
                        <strong>
                            ${escapeHTML(order.paymentMethod || "ثبت نشده")}
                        </strong>
                    </div>

                    <div class="order-detail">
                        <span>روش ارسال</span>
                        <strong>
                            ${escapeHTML(order.shippingMethod || "ثبت نشده")}
                        </strong>
                    </div>

                    <div class="order-detail">
                        <span>تعداد کالاها</span>
                        <strong>
                            ${products.reduce(
                                (sum, product) => sum + product.quantity,
                                0
                            ).toLocaleString("fa-IR")}
                            عدد
                        </strong>
                    </div>
                </div>

                <div class="order-card-footer">
                    <div class="order-total">
                        <span>مبلغ کل سفارش</span>
                        <strong>${formatPrice(total)}</strong>
                    </div>

                    <div class="order-actions">
                        <button
                            type="button"
                            class="order-details-btn"
                            data-action="details"
                            data-id="${escapeHTML(orderNumber)}"
                        >
                            ${expanded ? "بستن جزئیات" : "جزئیات سفارش"}
                        </button>

                        ${canCancel ? `
                            <button
                                type="button"
                                class="order-cancel-btn"
                                data-action="cancel"
                                data-id="${escapeHTML(orderNumber)}"
                            >
                                لغو سفارش
                            </button>
                        ` : ""}

                        ${canDelete ? `
                            <button
                                type="button"
                                class="order-delete-btn"
                                data-action="delete"
                                data-id="${escapeHTML(orderNumber)}"
                            >
                                حذف سفارش
                            </button>
                        ` : ""}
                    </div>
                </div>

                ${expanded ? `
                    <div class="order-expanded-details">
                        <p>
                            <strong>شماره سفارش:</strong>
                            ${escapeHTML(orderNumber)}
                        </p>

                        <p>
                            <strong>تاریخ ثبت:</strong>
                            ${formatDate(order.date || order.createdAt)}
                        </p>

                        <p>
                            <strong>وضعیت:</strong>
                            ${status.label}
                        </p>

                        <p>
                            <strong>آدرس ارسال:</strong>
                            ${escapeHTML(order.address || "ثبت نشده")}
                        </p>

                        ${order.trackingCode ? `
                            <p>
                                <strong>کد رهگیری:</strong>
                                ${escapeHTML(order.trackingCode)}
                            </p>
                        ` : ""}
                    </div>
                ` : ""}
            </article>
        `;
    }).join("");
}

ordersList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const orderId = button.dataset.id;

    const order = allOrders.find(
        item => getOrderKey(item) === orderId
    );

    if (!order) return;

    if (action === "details") {
        order.expanded = !order.expanded;
        saveOrders();
        renderOrders();
        return;
    }

    if (action === "cancel") {
        if (order.status !== "processing") {
            alert("این سفارش دیگر قابل لغو نیست.");
            return;
        }

        if (!confirm("از لغو این سفارش مطمئنی؟")) return;

        order.status = "cancelled";
        order.expanded = false;

        saveOrders();
        renderOrders();
        return;
    }

    if (action === "delete") {
        if (order.status !== "cancelled") {
            alert("فقط سفارش‌های لغوشده قابل حذف هستند.");
            return;
        }

        if (
            !confirm(
                "این سفارش لغوشده برای همیشه از تاریخچه حذف شود؟"
            )
        ) {
            return;
        }

        allOrders = allOrders.filter(
            item => getOrderKey(item) !== orderId
        );

        saveOrders();
        renderOrders();
    }
});

orderFilter.addEventListener("change", renderOrders);

async function initializeOrders() {
    const currentUser = JSON.parse(
        localStorage.getItem("mobileShopCurrentUser") || "null"
    );

    if (!currentUser) {
        ordersList.innerHTML = "";
        ordersEmpty.hidden = false;

        const title = ordersEmpty.querySelector("h2");
        const description = ordersEmpty.querySelector("p");
        const loginLink = ordersEmpty.querySelector("a");

        if (title) {
            title.textContent = "برای دیدن سفارش‌ها وارد حساب شو";
        }

        if (description) {
            description.textContent = "ابتدا وارد حساب کاربری‌ات شو.";
        }

        if (loginLink) {
            loginLink.href = "login.html";
            loginLink.textContent = "ورود به حساب";
            loginLink.hidden = false;
        }

        updateOrderSummary();
        return;
    }

    try {
        const response = await fetch(PRODUCTS_DATA_URL);

        if (response.ok) {
            productCatalog = await response.json();
        }
    } catch (error) {
        console.warn("فهرست محصولات بارگذاری نشد.", error);
    }

    try {
        const savedOrders = JSON.parse(
            localStorage.getItem(ORDERS_STORAGE_KEY) || "[]"
        );

        const currentUserId = String(
            currentUser.id ?? currentUser.phone ?? ""
        );

        allOrders = Array.isArray(savedOrders)
            ? savedOrders.filter(order => {
                return String(order.userId ?? "") === currentUserId;
            })
            : [];
    } catch (error) {
        console.error("خواندن سفارش‌ها انجام نشد.", error);
        allOrders = [];
    }

    renderOrders();
}

initializeOrders();