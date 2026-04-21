// If not admin, go back to home
var currentUser = JSON.parse(localStorage.getItem('user') || '{}');
if (currentUser.role !== 'admin') {
  window.location.href = 'index.html';
}

var currentFilter = 'all';

function getSuggestions() {
  return JSON.parse(localStorage.getItem('jamify_suggestions') || '[]');
}

function filter(status, btn) {
  currentFilter = status;
  document.querySelectorAll('.filters button').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  render();
}

function render() {
  var all   = getSuggestions();
  var items = currentFilter === 'all' ? all : all.filter(function(s) { return s.status === currentFilter; });
  var list  = document.getElementById('list');

  if (items.length === 0) {
    list.innerHTML = '<p class="empty">No suggestions here yet.</p>';
    return;
  }

  list.innerHTML = items.map(function(s) {
    return '<div class="card">' +
      '<div class="card-info">' +
        '<div class="title">' + s.title + ' — ' + s.artist +
          '<span class="badge badge-' + s.status + '">' + s.status + '</span>' +
        '</div>' +
        '<div class="meta">' + s.type +
          (s.year  ? ' · ' + s.year  : '') +
          (s.genre ? ' · ' + s.genre : '') +
        '</div>' +
      '</div>' +
      '<div class="card-actions">' +
        (s.status !== 'accepted' ? '<button class="btn-accept" onclick="setStatus(\'' + s.id + '\', \'accepted\')">✓ Accept</button>' : '') +
        (s.status !== 'rejected' ? '<button class="btn-reject" onclick="setStatus(\'' + s.id + '\', \'rejected\')">✗ Reject</button>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function setStatus(id, status) {
  var all = getSuggestions();
  var s   = all.find(function(x) { return x.id === id; });
  if (s) s.status = status;
  localStorage.setItem('jamify_suggestions', JSON.stringify(all));
  render();
}

render();
