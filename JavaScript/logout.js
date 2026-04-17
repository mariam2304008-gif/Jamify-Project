// Simulate clearing user session
document.getElementById("confirmLogout").addEventListener("click", () => {
    // Remove stored user data
    localStorage.removeItem("user");

    // Redirect to login page
    window.location.href = "../../index.html";
});

// Cancel logout → go back to profile
document.getElementById("cancelLogout").addEventListener("click", () => {
    window.location.href = "profile.html";
});