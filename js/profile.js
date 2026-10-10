document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.getElementById("profileForm");
    if (!profileForm) return;

    const profileName = document.getElementById("profileName");
    const profilePhone = document.getElementById("profilePhone");
    const profileAvatar = document.getElementById("profileAvatar");
    const fullNameInput = document.getElementById("profileFullName");
    const emailInput = document.getElementById("profileEmail");
    const phoneInput = document.getElementById("profilePhoneInput");
    const message = document.getElementById("profileMessage");
    const logoutButton = document.getElementById("profileLogout");

    const passwordForm = document.getElementById("changePasswordForm");
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
    const passwordMessage = document.getElementById("passwordMessage");

    function getCurrentUser() {
        try {
            return JSON.parse(
                localStorage.getItem("mobileShopCurrentUser") || "null"
            );
        } catch (error) {
            return null;
        }
    }

    function showMessage(element, text, type) {
        if (!element) return;
        element.textContent = text;
        element.className = "profile-message " + type;
    }

    let currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    function displayUser(user) {
        profileName.textContent = user.fullName || "کاربر";
        profilePhone.textContent = user.phone || "";
        profileAvatar.textContent =
            (user.fullName || "م").trim().charAt(0);

        fullNameInput.value = user.fullName || "";
        emailInput.value = user.email || "";
        phoneInput.value = user.phone || "";
    }

    displayUser(currentUser);

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

    // ویرایش اطلاعات حساب
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newName = fullNameInput.value.trim();
        const newEmail = emailInput.value.trim();

        if (newName.length < 3) {
            showMessage(message, "نام باید حداقل ۳ حرف داشته باشد.", "error");
            return;
        }

        if (
            newEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
        ) {
            showMessage(message, "ایمیل معتبر وارد کن.", "error");
            return;
        }

        const users = getUsers();
        const userIndex = users.findIndex(function (user) {
            return user.id === currentUser.id;
        });

        if (userIndex === -1) {
            showMessage(message, "حساب کاربری پیدا نشد.", "error");
            return;
        }

        const duplicateEmail = users.some(function (user) {
            return (
                user.id !== currentUser.id &&
                newEmail &&
                user.email &&
                user.email.toLowerCase() === newEmail.toLowerCase()
            );
        });

        if (duplicateEmail) {
            showMessage(message, "این ایمیل قبلاً ثبت شده است.", "error");
            return;
        }

        users[userIndex].fullName = newName;
        users[userIndex].email = newEmail;

        const updatedUser = {
            id: users[userIndex].id,
            fullName: newName,
            phone: users[userIndex].phone,
            email: newEmail
        };

        try {
            localStorage.setItem("mobileShopUsers", JSON.stringify(users));
            localStorage.setItem(
                "mobileShopCurrentUser",
                JSON.stringify(updatedUser)
            );

            currentUser = updatedUser;
            displayUser(currentUser);

            showMessage(message, "اطلاعات با موفقیت ذخیره شد 🧡", "success");
        } catch (error) {
            showMessage(message, "ذخیره اطلاعات ناموفق بود.", "error");
        }
    });

    // تغییر رمز عبور
    if (passwordForm) {
        passwordForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const oldPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmNewPasswordInput.value;

            showMessage(passwordMessage, "", "");

            if (newPassword.length < 8) {
                showMessage(
                    passwordMessage,
                    "رمز جدید باید حداقل ۸ کاراکتر باشد.",
                    "error"
                );
                return;
            }

            if (newPassword !== confirmPassword) {
                showMessage(
                    passwordMessage,
                    "رمز جدید با تکرار آن مطابقت ندارد.",
                    "error"
                );
                return;
            }

            if (oldPassword === newPassword) {
                showMessage(
                    passwordMessage,
                    "رمز جدید باید با رمز فعلی متفاوت باشد.",
                    "error"
                );
                return;
            }

            const users = getUsers();
            const userIndex = users.findIndex(function (user) {
                return user.id === currentUser.id;
            });

            if (userIndex === -1) {
                showMessage(
                    passwordMessage,
                    "حساب کاربری پیدا نشد.",
                    "error"
                );
                return;
            }

            if (users[userIndex].password !== oldPassword) {
                showMessage(
                    passwordMessage,
                    "رمز عبور فعلی اشتباه است.",
                    "error"
                );
                return;
            }

            try {
                users[userIndex].password = newPassword;

                localStorage.setItem(
                    "mobileShopUsers",
                    JSON.stringify(users)
                );

                passwordForm.reset();

                showMessage(
                    passwordMessage,
                    "رمز عبور با موفقیت تغییر کرد 🧡",
                    "success"
                );
            } catch (error) {
                showMessage(
                    passwordMessage,
                    "تغییر رمز عبور انجام نشد.",
                    "error"
                );
            }
        });
    }

    // خروج از حساب
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("mobileShopCurrentUser");
            window.location.href = "login.html";
        });
    }
});