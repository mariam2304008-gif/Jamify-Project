  const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isvalidpassword(password){
        return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    }

    function validateSignup() {
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-pass").value;
        const confirmPassword = document.getElementById("reg-confirm").value;
        
        if (!isValidEmail(email)) {
            alert("Please enter a valid email address");
            return;
        }
        
        if (password === "" || password !== confirmPassword) {
            alert("Passwords do not match or are empty");
            return;
        }

        if (!isvalidpassword(password)) {
            alert("Password must contain at least one uppercase letter, one digit, and be at least 8 characters long.");
            return;
        }

        alert("Account created successfully!");
        window.location.href = "index.html";
    }
    
    function loginAction() {
        const username = document.getElementById("login-user").value;
        const password = document.getElementById("login-pass").value;
        
        if (username === "" || password === "") {
            alert("Please enter both username and password");
            return;
        }
        
        // For now, assume successful login if fields are filled
        alert("Login successful!");
        window.location.href = "index.html";
    }