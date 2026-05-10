const existingUser = getUser();
if (getToken() && existingUser?.role) redirectForRole(existingUser.role);

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorNode = document.getElementById("login-error");
  errorNode.textContent = "";

  try {
    const payload = serializeForm(event.target);
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setSession(response.token, response.user);
    redirectForRole(response.user.role);
  } catch (error) {
    errorNode.textContent = error.message;
  }
});
