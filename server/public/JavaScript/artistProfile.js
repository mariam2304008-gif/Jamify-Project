function showTab(tabId, btn) {

    document.querySelectorAll('.tab-content')
        .forEach(c => c.classList.remove('active'));

    document.querySelectorAll('.tab')
        .forEach(t => t.classList.remove('active'));

    document.getElementById(tabId)
        .classList.add('active');

    if (btn) {
        btn.classList.add('active');
    }
}