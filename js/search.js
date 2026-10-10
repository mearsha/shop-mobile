document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("searchForm");
    const input = document.getElementById("searchInput");

    if (!form || !input) {
        console.error("فرم جست‌وجو یا کادر جست‌وجو پیدا نشد.");
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const searchText = input.value.trim();

        if (!searchText) {
            input.focus();
            return;
        }

        const isInsidePages =
            window.location.pathname.includes("/pages/");

        const productsPage = isInsidePages
            ? "products.html"
            : "pages/products.html";

        window.location.href =
            productsPage + "?search=" +
            encodeURIComponent(searchText);
    });
});