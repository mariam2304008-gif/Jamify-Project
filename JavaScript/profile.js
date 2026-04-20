// local storage as a placeholder for user data before starting expressnodejs lectures
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    if (currentUser) {
        document.getElementById('displayName').textContent = currentUser.name || 'User';
        document.getElementById('displayUsername').textContent = '@' + (currentUser.username || 'user');
        document.getElementById('displayBio').textContent = currentUser.bio || 'No bio yet';
    }
});

function showTab(tabId) {
    let contents = document.querySelectorAll(".tab-content");
    let tabs = document.querySelectorAll(".tab");

    contents.forEach(c => c.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    event.target.classList.add("active");
}


let originalName = '';
let originalBio = '';

document.getElementById("editBtn").addEventListener("click", () => {
    
    originalName = document.getElementById('displayName').textContent;
    originalBio = document.getElementById('displayBio').textContent;
    
    
    document.getElementById('displayName').contentEditable = "true";
    document.getElementById('displayBio').contentEditable = "true";
    
    
    document.getElementById('displayName').style.border = "1px dashed #e74c3c";
    document.getElementById('displayBio').style.border = "1px dashed #e74c3c";
    document.getElementById('displayName').style.padding = "4px";
    document.getElementById('displayBio').style.padding = "4px";
    
    
    document.getElementById('editButtons').style.display = "block";
    document.getElementById('editBtn').style.display = "none";
    
    
    document.getElementById('displayName').focus();
});

// save registration
document.getElementById("saveBtn").addEventListener("click", () => {
    const newName = document.getElementById('displayName').textContent.trim();
    const newBio = document.getElementById('displayBio').textContent.trim();
    
    if (!newName) {
        alert("Please enter a display name");
        return;
    }
    
    
    let currentUser = JSON.parse(localStorage.getItem('user')) || {};
    
    
    currentUser.name = newName;
    currentUser.bio = newBio;
    
    
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    
    document.getElementById('displayName').contentEditable = "false";
    document.getElementById('displayBio').contentEditable = "false";
    
    
    document.getElementById('displayName').style.border = "none";
    document.getElementById('displayBio').style.border = "none";
    document.getElementById('displayName').style.padding = "0";
    document.getElementById('displayBio').style.padding = "0";
    
    
    document.getElementById('editButtons').style.display = "none";
    document.getElementById('editBtn').style.display = "inline-block";
    
    alert("Profile updated successfully!");
});




document.getElementById("cancelBtn").addEventListener("click", () => {
    
    document.getElementById('displayName').textContent = originalName;
    document.getElementById('displayBio').textContent = originalBio;
    
    
    document.getElementById('displayName').contentEditable = "false";
    document.getElementById('displayBio').contentEditable = "false";
    

    document.getElementById('displayName').style.border = "none";
    document.getElementById('displayBio').style.border = "none";
    document.getElementById('displayName').style.padding = "0";
    document.getElementById('displayBio').style.padding = "0";
    
    
    document.getElementById('editButtons').style.display = "none";
    document.getElementById('editBtn').style.display = "inline-block";
});

function goToLogout() {
    window.location.href = "logout.html";
}

const followers = [
    {
        name: "reviewer",
        username: "@placeholder",
        bio: "lorem imsum dolor sit amet",
        img: "epic.png"
    }
];