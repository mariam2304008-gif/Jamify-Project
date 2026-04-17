function showTab(tabId) {
    let contents = document.querySelectorAll(".tab-content");
    let tabs = document.querySelectorAll(".tab");

    contents.forEach(c => c.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    event.target.classList.add("active");
}

// Edit button demo
document.getElementById("editBtn").addEventListener("click", () => {
    alert("Edit profile clicked!");
});
function goToLogout() {
    window.location.href = "logout.html";
}
function showTab(tabId) {
    let contents = document.querySelectorAll(".tab-content");
    let tabs = document.querySelectorAll(".tab");

    contents.forEach(c => c.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");

    // highlight clicked tab
    event.target.classList.add("active");
}
const followers = [
    {
        name: "Mia Chen",
        username: "@popqueen",
        bio: "Living for pop perfection. Dua Lipa stan 💃",
        img: "mia.jpg"
    }
];