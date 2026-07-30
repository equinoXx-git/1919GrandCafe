/* ==========================================================================
   1919 GRAND CAFE — LUXURY INTERACTIVE JAVASCRIPT
   Location: 117 Juan Luna St., Binondo, Manila
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeaderScroll();
  initMobileMenu();
  initAudioToggle();
  initMenuFilters();
  initReservationForm();
  initGalleryLightbox();
  initScrollAnimations();
  setDefaultReservationDate();
});

/* Dark / Light Theme Toggle System */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const mobileToggleBtn = document.getElementById('mobileThemeToggleBtn');

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');

  setTheme(initialTheme, false);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme, true);
    });
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme, true);
    });
  }

  // System preference change listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light', false);
    }
  });
}

function setTheme(theme, showNotification = true) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  localStorage.setItem('theme', theme);

  const toggleBtn = document.getElementById('themeToggleBtn');
  const mobileToggleBtn = document.getElementById('mobileThemeToggleBtn');

  const desktopIcon = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  const mobileContent = theme === 'dark' ? '<i class="fa-solid fa-sun"></i> <span>Light Mode</span>' : '<i class="fa-solid fa-moon"></i> <span>Dark Mode</span>';

  if (toggleBtn) {
    toggleBtn.innerHTML = desktopIcon;
    toggleBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.innerHTML = mobileContent;
  }

  if (showNotification) {
    showToast(theme === 'dark' ? 'Switched to Noir Dark Mode 🌙' : 'Switched to Heritage Light Mode ☀️');
  }
}

/* Header Scroll Effect */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* Mobile Navigation Toggle */
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('navLinks');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-xmark');
    }
  });

  // Close menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
      }
    });
  });
}

/* Audio Ambient Toggle (Supports Real Audio Files + Web Audio Fallback) */
let audioCtx = null;
let isAudioPlaying = false;
let ambientSoundInstance = null;

function initAudioToggle() {
  const audioBtn = document.getElementById('audioToggleBtn');
  if (!audioBtn) return;

  audioBtn.addEventListener('click', async () => {
    if (!isAudioPlaying) {
      const success = await startAmbientAudio();
      if (success) {
        audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        audioBtn.style.background = 'var(--color-gold)';
        audioBtn.style.color = '#fff';
      }
    } else {
      stopAmbientAudio();
      audioBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      audioBtn.style.background = 'transparent';
      audioBtn.style.color = 'var(--color-gold-dark)';
      showToast('Ambient Music Muted');
    }
  });
}

async function startAmbientAudio() {
  const bgMusic = document.getElementById('bgMusic');

  // 1. Try playing Real Audio file (MP3 / WAV) if available
  if (bgMusic) {
    try {
      bgMusic.volume = 0;
      await bgMusic.play();

      // Smooth fade-in over 2 seconds to 25% volume (subtle background level)
      const targetVolume = 0.25;
      const fadeDuration = 2000;
      const fadeSteps = 40;
      const fadeInterval = fadeDuration / fadeSteps;
      const volumeStep = targetVolume / fadeSteps;
      let currentStep = 0;

      const fadeIn = setInterval(() => {
        currentStep++;
        bgMusic.volume = Math.min(volumeStep * currentStep, targetVolume);
        if (currentStep >= fadeSteps) clearInterval(fadeIn);
      }, fadeInterval);

      isAudioPlaying = true;
      showToast('Playing Heritage Cafe Music 🎵');
      return true;
    } catch (e) {
      console.log('Real audio file not found or failed, using lounge synthesizer fallback...', e);
    }
  }

  // 2. Fallback to Web Audio Synthesizer
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    if (ambientSoundInstance) {
      ambientSoundInstance.stop();
    }

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime);

    // Warm Jazz Lounge Ambient Harmony
    const frequencies = [130.81, 164.81, 196.00, 246.94, 329.63];
    const oscNodes = frequencies.map((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      g.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      return osc;
    });

    // Vintage Noise
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.2, audioCtx.currentTime);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.06, audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();

    masterGain.connect(audioCtx.destination);

    ambientSoundInstance = {
      stop: () => {
        oscNodes.forEach(o => { try { o.stop(); } catch(e){} });
        try { noiseSource.stop(); } catch(e){}
        try { masterGain.disconnect(); } catch(e){}
      }
    };

    isAudioPlaying = true;
    showToast('Ambient Cafe Sound On ☕');
    return true;
  } catch (e) {
    console.error('Audio play error:', e);
    showToast('Click anywhere on the page first to enable sound!');
    return false;
  }
}

function stopAmbientAudio() {
  const bgMusic = document.getElementById('bgMusic');
  if (bgMusic && !bgMusic.paused) {
    bgMusic.pause();
  }

  if (ambientSoundInstance) {
    ambientSoundInstance.stop();
    ambientSoundInstance = null;
  }
  isAudioPlaying = false;
}

/* Interactive Menu Category Filter & Modal */
const menuData = [
  // Coffee & Drinks
  {
    id: 1,
    name: '1919 Signature Heritage Latte',
    category: 'coffee',
    price: 240,
    image: 'assets/images/coffee_latte.jpg',
    desc: 'Double espresso blended with sweetened condensed milk, infused with Pandan leaves and topped with gold leaf flakes.',
    tags: ['Signature', 'Hot / Iced'],
    details: 'Espresso roasted specifically for 1919 Grand Cafe by local master roasters. Notes of dark cacao, roasted hazelnut, and natural caramelized sugarcane.'
  },
  {
    id: 2,
    name: 'Binondo Spanish Latte',
    category: 'coffee',
    price: 230,
    image: 'assets/images/coffee_spanish.jpg',
    desc: 'Creamy espresso crafted with fresh steamed dairy and velvety dulce de leche caramel finish.',
    tags: ['Bestseller'],
    details: 'Rich, smooth texture designed to complement our artisanal croissants and breakfast platters.'
  },
  {
    id: 3,
    name: 'Classic Cold Brew Tonic',
    category: 'coffee',
    price: 210,
    image: 'assets/images/cold_brew.jpg',
    desc: '18-hour single origin cold brew poured over artisanal tonic water and fresh orange slice.',
    tags: ['Refreshing'],
    details: 'Bright citrus aromas paired with crisp effervescence. Perfect for Manila mid-day refresh.'
  },

  // Pastries & Cakes
  {
    id: 4,
    name: 'Grand HSBC Chocolate Vault Cake',
    category: 'pastries',
    price: 360,
    image: 'assets/images/pastry_chocolate_cake.jpg',
    desc: 'Decadent 70% dark Belgian chocolate layer cake dusted with edible 24k gold leaf powder.',
    tags: ['Chef Special', 'Signature'],
    details: 'Inspired by the historic HSBC bank vault in which 1919 Grand Cafe sits. Features hazelnut praline crunch and sea salt caramel ganache.'
  },
  {
    id: 5,
    name: 'Artisanal Ube Leche Flan Tart',
    category: 'pastries',
    price: 290,
    image: 'assets/images/ube_tart.jpg',
    desc: 'Flaky buttery shell filled with rich Pampanga purple yam halaya and silky caramel flan crown.',
    tags: ['Filipino Fusion'],
    details: 'A nostalgic Filipino classic elevated into a high-end French patisserie tartlet.'
  },
  {
    id: 6,
    name: 'Butter Croissant & Mango Cream',
    category: 'pastries',
    price: 220,
    image: 'assets/images/pastry_croissant.jpg',
    desc: 'French Normandy butter croissant stuffed with ripe Guimaras mango reduction and chantilly.',
    tags: ['Freshly Baked'],
    details: 'Baked fresh every morning at 7:00 AM using imported French butter and local Guimaras mangoes.'
  },

  // Pasta & Pizza
  {
    id: 7,
    name: 'Truffle & Wild Mushroom Linguine',
    category: 'pasta',
    price: 580,
    image: 'assets/images/pasta_truffle.jpg',
    desc: 'Handmade linguine tossed in black truffle cream, cremini mushrooms, and 24-month aged Parmigiano.',
    tags: ['Bestseller'],
    details: 'Prepared with white truffle oil, roasted garlic cloves, and freshly shaved black truffles.'
  },
  {
    id: 8,
    name: 'Seafood Marinara & Squid Ink Fettuccine',
    category: 'pasta',
    price: 640,
    image: 'assets/images/seafood_pasta.jpg',
    desc: 'House-made squid ink pasta with tiger prawns, scallops, mussels in roasted cherry tomato passata.',
    tags: ['Premium Seafood'],
    details: 'Catch of the day fresh seafood simmered with garlic, white wine, and fresh basil.'
  },

  // Steaks & Mains
  {
    id: 9,
    name: 'US Angus Ribeye Steak (300g)',
    category: 'mains',
    price: 1850,
    image: 'assets/images/steak_ribeye.jpg',
    desc: 'USDA Choice prime ribeye seared in rosemary butter, served with roasted garlic mesh & bone marrow jus.',
    tags: ['Premium Steak'],
    details: 'Aged 28 days for exceptional tenderness and marbling. Served with your choice of truffle fries or garlic rice.'
  },
  {
    id: 10,
    name: 'Heritage Crispy Pata confit',
    category: 'filipino',
    price: 980,
    image: 'assets/images/filipino_crispy_pata.jpg',
    desc: 'Slow-braised pork leg crisp-fried to golden perfection, served with spicy cane vinegar & liver dip.',
    tags: ['Filipino Classic', 'Shareable'],
    details: 'Serves 2-3 guests. Traditional 1920s Binondo banquet recipe passed down through generations.'
  },
  {
    id: 11,
    name: '1919 Wagyu Beef Tapa & Garlic Rice',
    category: 'filipino',
    price: 490,
    image: 'assets/images/steak_ribeye.jpg',
    desc: 'Thinly sliced wagyu beef marinated in soy-calamansi, paired with fried egg, garlic sinangag & pickles.',
    tags: ['Breakfast & Brunch'],
    details: 'The ultimate elevated Filipino breakfast served all day inside our historic cafe.'
  }
];

function initMenuFilters() {
  const container = document.getElementById('menuGrid');
  const tabs = document.querySelectorAll('.menu-tab-btn');
  if (!container) return;

  renderMenuItems(menuData);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      if (filter === 'all') {
        renderMenuItems(menuData);
      } else {
        const filtered = menuData.filter(item => item.category === filter);
        renderMenuItems(filtered);
      }
    });
  });
}

function renderMenuItems(items) {
  const container = document.getElementById('menuGrid');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<p style="grid-column: span 2; text-align: center; color: var(--color-text-muted); padding: 3rem;">No dishes found in this category.</p>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="menu-item-card" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="menu-item-thumb" loading="lazy">
      <div class="menu-item-info">
        <div class="menu-item-header">
          <h4 class="menu-item-title">${item.name}</h4>
          <span class="menu-item-dots"></span>
          <span class="menu-item-price">₱${item.price.toLocaleString()}</span>
        </div>
        <p class="menu-item-desc">${item.desc}</p>
        <div class="menu-item-meta">
          <div class="menu-item-tags">
            ${item.tags.map(t => `<span class="badge-tag ${t === 'Signature' ? 'signature' : ''}">${t}</span>`).join('')}
          </div>
          <button class="btn-item-detail" onclick="openItemModal(${item.id})">
            Details <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/* Item Detail Modal */
window.openItemModal = function(id) {
  const item = menuData.find(m => m.id === id);
  if (!item) return;

  const backdrop = document.getElementById('modalBackdrop');
  const modalBody = document.getElementById('modalBody');

  modalBody.innerHTML = `
    <div class="modal-item-grid">
      <img src="${item.image}" alt="${item.name}" class="modal-item-img">
      <div class="modal-item-info">
        <span class="subheading-gold">${item.category.toUpperCase()} • ₱${item.price.toLocaleString()}</span>
        <h3 class="modal-item-title">${item.name}</h3>
        <p class="modal-item-desc">${item.desc}</p>
        <div class="modal-item-notes">
          <strong class="modal-item-notes-title">Culinary Notes:</strong>
          <p class="modal-item-notes-text">${item.details}</p>
        </div>
        <button class="btn btn-gold" onclick="closeModal(); scrollToReservation();">Reserve Table to Taste</button>
      </div>
    </div>
  `;

  backdrop.classList.add('active');
};

window.closeModal = function() {
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.classList.remove('active');
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

window.scrollToReservation = function() {
  const section = document.getElementById('reservations');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
};

/* Table Reservation Logic */
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('resName').value;
    const phone = document.getElementById('resPhone').value;
    const date = document.getElementById('resDate').value;
    const time = document.getElementById('resTime').value;
    const guests = document.getElementById('resGuests').value;
    const area = document.getElementById('resArea').value;

    const refCode = '1919-' + Math.floor(100000 + Math.random() * 900000);

    const backdrop = document.getElementById('modalBackdrop');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
      <div style="text-align: center; padding: 1rem 0;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--color-gold); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem; box-shadow: var(--shadow-gold);">
          <i class="fa-solid fa-check"></i>
        </div>
        <span class="subheading-gold">RESERVATION CONFIRMED</span>
        <h3 style="font-size: 2rem; margin-bottom: 0.5rem;">We Look Forward to Welcoming You</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 2rem; max-width: 480px; margin-left: auto; margin-right: auto;">
          Dear <strong>${name}</strong>, your table reservation at 1919 Grand Cafe Binondo has been successfully logged.
        </p>

        <div style="background: var(--color-cream); border: 1px solid var(--color-gold); border-radius: var(--radius-md); padding: 1.5rem; max-width: 450px; margin: 0 auto 2rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 0.5rem; margin-bottom: 0.8rem;">
            <span style="font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted);">Ref Code:</span>
            <strong style="color: var(--color-gold-dark); letter-spacing: 0.1em;">${refCode}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <span>Date & Time:</span>
            <strong>${date} @ ${time}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <span>Party Size:</span>
            <strong>${guests} Guest(s)</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Seating Preference:</span>
            <strong>${area}</strong>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">
          A confirmation SMS has been dispatched to <strong>${phone}</strong>. Location: 117 Juan Luna St., Binondo, Manila.
        </p>

        <button class="btn btn-dark" onclick="closeModal()">Close & Return</button>
      </div>
    `;

    backdrop.classList.add('active');
    form.reset();
    setDefaultReservationDate();
  });
}

function setDefaultReservationDate() {
  const dateInput = document.getElementById('resDate');
  if (dateInput) {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Default to tomorrow
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }
}

/* Gallery Lightbox */
function initGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.dataset.caption || '1919 Grand Cafe Binondo';
      if (!img) return;

      const backdrop = document.getElementById('modalBackdrop');
      const modalBody = document.getElementById('modalBody');

      modalBody.innerHTML = `
        <div style="text-align: center;">
          <img src="${img.src}" alt="${caption}" style="max-height: 70vh; width: 100%; object-fit: contain; border-radius: var(--radius-sm); border: 1px solid var(--color-gold);">
          <p style="margin-top: 1rem; font-family: var(--font-serif-alt); font-size: 1.2rem; font-style: italic; color: var(--color-charcoal);">${caption}</p>
        </div>
      `;

      backdrop.classList.add('active');
    });
  });
}

/* Scroll Reveal Observer */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.story-grid, .highlight-card, .exp-card, .menu-item-card, .location-info-box');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}

/* Simple Toast Alert Helper */
function showToast(msg) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerText = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 3000);
}
