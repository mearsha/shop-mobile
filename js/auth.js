document.addEventListener("DOMContentLoaded", function () {

    // نمایش و مخفی کردن رمز عبور
    document.querySelectorAll(".toggle-password").forEach(function (button) {
        button.addEventListener("click", function () {
            const input = document.getElementById(button.dataset.target);

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                button.textContent = "مخفی";
            } else {
                input.type = "password";
                button.textContent = "نمایش";
            }
        });
    });

    // دریافت کاربران ذخیره‌شده
    function getUsers() {
        try {
            const users = JSON.parse(
                localStorage.getItem("mobileShopUsers") || "[]"
            );

            return Array.isArray(users) ? users : [];
        } catch (error) {
            return [];
        }
    }

    // نمایش پیام
    function showMessage(element, type, text) {
        if (!element) return;

        element.className = "auth-message";

        if (type) {
            element.classList.add(type);
        }

        element.textContent = text;
    }

    // =========================
    // ثبت نام
    // =========================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        const registerMessage = document.getElementById("registerMessage");

        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const fullName = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword =
                document.getElementById("confirmPassword").value;
            const acceptTerms =
                document.getElementById("acceptTerms").checked;

            showMessage(registerMessage, "", "");

            if (fullName.length < 3) {
                showMessage(
                    registerMessage,
                    "error",
                    "نام و نام خانوادگی رو درست وارد کن."
                );
                return;
            }

            if (!/^09[0-9]{9}$/.test(phone)) {
                showMessage(
                    registerMessage,
                    "error",
                    "شماره موبایل باید ۱۱ رقم و با 09 شروع بشه."
                );
                return;
            }

            if (
                email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {
                showMessage(
                    registerMessage,
                    "error",
                    "ایمیل واردشده معتبر نیست."
                );
                return;
            }

            if (password.length < 8) {
                showMessage(
                    registerMessage,
                    "error",
                    "رمز عبور باید حداقل ۸ کاراکتر باشه."
                );
                return;
            }

            if (password !== confirmPassword) {
                showMessage(
                    registerMessage,
                    "error",
                    "رمز عبور و تکرار اون یکسان نیستن."
                );
                return;
            }

            if (!acceptTerms) {
                showMessage(
                    registerMessage,
                    "error",
                    "لطفاً قوانین سایت رو بپذیر."
                );
                return;
            }

            const users = getUsers();

            const existingUser = users.find(function (user) {
                return user.phone === phone ||
                    (email && user.email === email);
            });

            if (existingUser) {
                showMessage(
                    registerMessage,
                    "error",
                    "این شماره موبایل یا ایمیل قبلاً ثبت شده. وارد حسابت شو."
                );
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                fullName: fullName,
                phone: phone,
                email: email,
                password: password
            };

            try {
                users.push(newUser);

                localStorage.setItem(
                    "mobileShopUsers",
                    JSON.stringify(users)
                );

                localStorage.setItem(
                    "mobileShopCurrentUser",
                    JSON.stringify({
                        id: newUser.id,
                        fullName: newUser.fullName,
                        phone: newUser.phone,
                        email: newUser.email
                    })
                );

                // انتقال به صفحه اصلی پس از ثبت نام
                window.location.href = "../index.html";

            } catch (error) {
                showMessage(
                    registerMessage,
                    "error",
                    "ذخیره اطلاعات انجام نشد. دوباره تلاش کن."
                );
            }
        });
    }

    // =========================
    // ورود
    // =========================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        const loginMessage = document.getElementById("loginMessage");

        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const phone =
                document.getElementById("loginPhone").value.trim();

            const password =
                document.getElementById("loginPassword").value;

            showMessage(loginMessage, "", "");

            if (!/^09[0-9]{9}$/.test(phone)) {
                showMessage(
                    loginMessage,
                    "error",
                    "شماره موبایل باید ۱۱ رقم و با 09 شروع بشه."
                );
                return;
            }

            const users = getUsers();

            const user = users.find(function (item) {
                return item.phone === phone &&
                    item.password === password;
            });

            if (!user) {
                showMessage(
                    loginMessage,
                    "error",
                    "شماره موبایل یا رمز عبور اشتباهه."
                );
                return;
            }

            try {
                localStorage.setItem(
                    "mobileShopCurrentUser",
                    JSON.stringify({
                        id: user.id,
                        fullName: user.fullName,
                        phone: user.phone,
                        email: user.email
                    })
                );

                // انتقال به صفحه اصلی پس از ورود
                window.location.href = "../index.html";

            } catch (error) {
                showMessage(
                    loginMessage,
                    "error",
                    "ورود انجام نشد. دوباره تلاش کن."
                );
            }
        });
    }

});