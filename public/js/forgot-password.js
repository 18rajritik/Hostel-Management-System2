document.getElementById("forgot-password-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorNode = document.getElementById("forgot-password-error");
  errorNode.textContent = "";

  const payload = serializeForm(event.target);
  if (payload.newPassword !== payload.confirmPassword) {
    errorNode.textContent = "Passwords do not match.";
    return;
  }

  try {
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        newPassword: payload.newPassword
      })
    });

    localStorage.setItem("hms_signup_notice", "Password reset successful. You can now log in.");
    window.location.replace("./login.html");
  } catch (error) {
    errorNode.textContent = error.message || "Password reset failed. Please try again.";
  }
});
