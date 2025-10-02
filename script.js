// Eye animation
const canvas = document.getElementById('eye-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const irisRadius = 80;
  const pupilRadius = 30;

  let currentPupilX = centerX;
  let currentPupilY = centerY;
  let targetPupilX = centerX;
  let targetPupilY = centerY;
  let mouseX = centerX;
  let mouseY = centerY;
  let lastMouseMoveTime = Date.now();

  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    lastMouseMoveTime = Date.now();
  };

  window.addEventListener('mousemove', handleMouseMove);

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.stroke();

    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, irisRadius);
    grad.addColorStop(0, '#7948ff');
    grad.addColorStop(1, 'black');
    ctx.beginPath();
    ctx.arc(centerX, centerY, irisRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxOffset = irisRadius - pupilRadius;
    
    if (distance > 0) {
      const ratio = Math.min(1, distance / (irisRadius * 1.5)) * maxOffset / distance;
      targetPupilX = centerX + dx * ratio;
      targetPupilY = centerY + dy * ratio;
    } else {
      targetPupilX = centerX;
      targetPupilY = centerY;
    }
    
    const speed = 0.05;
    currentPupilX += (targetPupilX - currentPupilX) * speed;
    currentPupilY += (targetPupilY - currentPupilY) * speed;

    if (Date.now() - lastMouseMoveTime > 500) {
      targetPupilX = centerX;
      targetPupilY = centerY;
    }

    ctx.beginPath();
    ctx.arc(currentPupilX, currentPupilY, pupilRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(currentPupilX - 8, currentPupilY - 8, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    requestAnimationFrame(draw);
  };
  draw();
}

// --- ФОН ---
function createStars() {
  const starsContainer = document.getElementById('stars');
  if (!starsContainer) return;
  const starCount = 200;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.width = Math.random() * 2 + 1 + 'px';
    star.style.height = star.style.width;
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 2 + 1) + 's';
    starsContainer.appendChild(star);
  }
}

let mouseTimeout;
let currentTransform = 'translate(0px, 0px)';

document.addEventListener('mousemove', (e) => {
  const starsContainer = document.getElementById('stars');
  if (!starsContainer) return;
  const speed = 0.02;
  const x = (e.clientX - window.innerWidth / 2) * speed;
  const y = (e.clientY - window.innerHeight / 2) * speed;
  currentTransform = `translate(${x}px, ${y}px)`;

  clearTimeout(mouseTimeout);

  starsContainer.style.transform = currentTransform;

  mouseTimeout = setTimeout(() => {
    starsContainer.style.transform = 'translate(0px, 0px)';
    currentTransform = 'translate(0px, 0px)';
  }, 1000);
});

document.addEventListener('mousemove', (e) => {
  const nebula = document.querySelector('.nebula');
  if (!nebula) return;
  const speed = 0.005;
  const nx = (e.clientX - window.innerWidth / 2) * speed;
  const ny = (e.clientY - window.innerHeight / 2) * speed;
  nebula.style.transform = `translate(${nx}px, ${ny}px)`;
});

createStars();

// Search mode switch
const searchInput = document.getElementById('search-input');
const workRadio = document.getElementById('glass-work');
const performerRadio = document.getElementById('glass-performer');
const workerInfo = document.getElementById('worker-info');

if (workRadio) {
  workRadio.addEventListener('change', () => {
    if (workRadio.checked) {
      searchInput.placeholder = 'Поиск работы...';
    }
  });
}

if (performerRadio) {
  performerRadio.addEventListener('change', () => {
    if (performerRadio.checked) {
      searchInput.placeholder = 'Поиск исполнителя...';
    }
  });
}

// Redirect on Enter
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      const mode = workRadio.checked ? 'work' : 'performer';
      const query = encodeURIComponent(searchInput.value.trim());
      window.location.href = `search-results.html?query=${query}&mode=${mode}`;
    }
  });
}

// Top sections logic
function populateResults(items, listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'vacancy-card';
    card.textContent = item.title;
    card.dataset.worker = item.worker;
    card.title = `Исполнитель: ${item.worker}`; // Tooltip
    list.appendChild(card);
  });
  attachClickHandlers(listId);
}

function attachClickHandlers(listId) {
  const cards = document.querySelectorAll(`#${listId} .vacancy-card`);
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const worker = card.dataset.worker;
      if (workerInfo) {
        workerInfo.textContent = `Выбран исполнитель: ${worker}`;
        workerInfo.style.display = 'block';
      }
    });
  });
}

function populateTopOffers() {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const allOffers = users.flatMap(u => (u.pricelist || []).map(p => ({title: p.title, worker: u.nick || u.first_name})));
  if (allOffers.length === 0) return;

  const offerCounts = {};
  allOffers.forEach(offer => {
    offerCounts[offer.title] = (offerCounts[offer.title] || 0) + 1;
  });

  const topTitles = Object.entries(offerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([title, count]) => ({ title: `${title} (${count})`, worker: allOffers.find(o => o.title === title)?.worker }));

  populateResults(topTitles, 'vacancy-list');
}

function populateTopCompleted() {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const topUsers = users
    .sort((a, b) => (b.completed || 0) - (a.completed || 0))
    .slice(0, 3)
    .map(u => ({title: `✔ ${u.completed || 0}`, worker: u.nick || u.first_name}));

  populateResults(topUsers, 'completed-list');
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  populateTopOffers();
  populateTopCompleted();
});

// Language and Theme
const trans = {
  en: {
    "title": "work eye",
    "search-work": "Search work...",
    "search-performer": "Search performer...",
    "top-vacancies": "Top Offers",
    "top-completed": "Top by Completed"
  },
  ru: {
    "title": "work eye",
    "search-work": "Поиск работы...",
    "search-performer": "Поиск исполнителя...",
    "top-vacancies": "Топ предложений",
    "top-completed": "Топ по выполненным"
  }
};

function applyLang(lang) {
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    if (trans[lang]?.[key]) el.textContent = trans[lang][key];
  });
  document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
    const key = el.getAttribute('data-lang-placeholder');
    if (trans[lang]?.[key]) el.placeholder = trans[lang][key];
  });
}

let themeListener;
function applyTheme(theme) {
  localStorage.setItem('theme', theme);
  if (themeListener) themeListener.removeEventListener('change', () => applyTheme('system'));
  
  let effectiveTheme = theme;
  if (theme === 'system') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    themeListener = window.matchMedia('(prefers-color-scheme: dark)');
    themeListener.addEventListener('change', () => applyTheme('system'));
  }
  document.body.className = effectiveTheme;
}

// Apply on load
applyLang(localStorage.getItem('lang') || 'ru');
applyTheme(localStorage.getItem('theme') || 'system');