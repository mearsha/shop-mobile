document.addEventListener("DOMContentLoaded", async function () {
    const footerPlaceholder = document.getElementById("siteFooter");

    if (!footerPlaceholder) return;

    try {
        const isInsidePages = window.location.pathname.includes("/pages/");
        const footerPath = isInsidePages
            ? "../components/footer.html"
            : "components/footer.html";

        const response = await fetch(footerPath);

        if (!response.ok) {
            throw new Error("بارگذاری فوتر ناموفق بود");
        }

        footerPlaceholder.innerHTML = await response.text();

        const footerLinks = footerPlaceholder.querySelectorAll(".footer-links a");

        footerLinks.forEach(function (link) {
            const href = link.getAttribute("href");

            if (!href || href.startsWith("http") || href.startsWith("#")) {
                return;
            }

            if (isInsidePages && !href.startsWith("../")) {
                link.setAttribute("href", "../" + href);
            }
        });

    } catch (error) {
        console.error("خطا در بارگذاری فوتر:", error);
    }
});