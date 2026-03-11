/* ═══════════════════════════════════════════════
   PYROSAT — main.js
   TUA Hackathon 2025 · Uydu Yangın Tespiti
   ═══════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════
   1. STARFIELD (Canvas Background)
══════════════════════════════════════ */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let stars  = [];

  /** Canvas boyutunu pencereye eşitle */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /** Yıldız dizisini oluştur */
  function createStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 6000); // yoğunluk

    for (let i = 0; i < count; i++) {
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       Math.random() * 1.4 + 0.2,
        alpha:   Math.random(),
        twinkle: (Math.random() * 0.015) + 0.003,
        dir:     Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  /** Animasyon döngüsü */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      // Titreme efekti
      s.alpha += s.twinkle * s.dir;
      if (s.alpha >= 1)   { s.alpha = 1;   s.dir = -1; }
      if (s.alpha <= 0.1) { s.alpha = 0.1; s.dir =  1; }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 223, 240, ${s.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  // Başlat
  resize();
  createStars();
  draw();

  // Pencere boyutu değişince yeniden oluştur
  window.addEventListener('resize', () => {
    resize();
    createStars();
  });
})();


/* ══════════════════════════════════════
   2. SCROLL REVEAL
══════════════════════════════════════ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Sıralı gecikme ile görünür yap
          const delay = index * 80;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          // Bir kez tetiklenince observe etmeyi bırak
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════
   3. TELEMETRY LIVE DATA SİMÜLASYONU
══════════════════════════════════════ */
(function initTelemetry() {
  // Hedef elementler
  const elAlt = document.getElementById('t-alt');
  const elSpd = document.getElementById('t-spd');
  const elDet = document.getElementById('t-det');
  const elCon = document.getElementById('t-con');

  if (!elAlt || !elSpd) return;

  /**
   * Belirli bir taban değer etrafında rastgele dalgalanan değer döndür
   * @param {number} base    - Taban değer
   * @param {number} range   - ±Maksimum sapma
   * @param {number} decimals - Ondalık basamak
   */
  function fluctuate(base, range, decimals = 2) {
    return (base + (Math.random() * range * 2 - range)).toFixed(decimals);
  }

  // Tespit sayısı için rastgele değer (1-5 arasında)
  function randomDetectionCount() {
    return Math.floor(Math.random() * 5) + 1;
  }

  // Her 2 saniyede telemetri güncelle
  setInterval(() => {
    elAlt.textContent = fluctuate(550, 0.8) + ' km';
    elSpd.textContent = fluctuate(7.66, 0.03) + ' km/s';
  }, 2000);

  // Her 5 saniyede tespit sayısını güncelle
  setInterval(() => {
    const count = randomDetectionCount();
    elDet.textContent = count + ' NOKTA';
    // 4+ tespit varsa daha yüksek alarm rengi
    elDet.className = 'tele-val ' + (count >= 4 ? 'alert' : 'warn');
  }, 5000);

  // Bağlantı kalitesini simüle et
  const connectionStates = ['AKTİF', 'AKTİF', 'AKTİF', 'ZAYIF', 'AKTİF', 'AKTİF'];
  let connIdx = 0;

  setInterval(() => {
    connIdx = (connIdx + 1) % connectionStates.length;
    const state = connectionStates[connIdx];
    elCon.textContent = state;
    elCon.className   = 'tele-val ' + (state === 'ZAYIF' ? 'alert' : 'warn');
  }, 7000);
})();


/* ══════════════════════════════════════
   4. NAV ACTIVE LINK (Scroll Spy)
══════════════════════════════════════ */
(function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  if (!navLinks.length || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(sec => observer.observe(sec));
})();


/* ══════════════════════════════════════
   5. FEAT PROGRESS BAR ANİMASYONU
   (Görünür olduğunda dolma efekti)
══════════════════════════════════════ */
(function initProgressBars() {
  const bars = document.querySelectorAll('.feat-bar');
  if (!bars.length) return;

  // Başlangıçta sıfırla
  bars.forEach(bar => {
    bar._targetWidth = bar.style.width || '0%';
    bar.style.width  = '0%';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          // Kısa gecikme sonrası hedef genişliğe animate et
          setTimeout(() => {
            bar.style.width = bar._targetWidth;
          }, 200);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach(bar => observer.observe(bar));
})();


/* ══════════════════════════════════════
   6. NAV SMOOTH SCROLL (Offset fix)
   (Fixed nav çakışmasını önler)
══════════════════════════════════════ */
(function initSmoothScroll() {
  const NAV_HEIGHT = 64; // nav yüksekliği (px)

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════
   7. UNITY WEBGL ENTEGRASYON YARDIMCISI
   (iframe yüklendiğinde placeholder'ı gizle)
══════════════════════════════════════ */
(function initUnityLoader() {
  const iframe      = document.querySelector('.sim-frame iframe');
  const placeholder = document.querySelector('.sim-placeholder');

  if (!iframe || !placeholder) return;

  // iframe yüklendiğinde placeholder'ı gizle
  iframe.addEventListener('load', () => {
    placeholder.style.display = 'none';
    console.log('[PyroSat] Unity WebGL yüklendi ✓');
  });

  // Hata durumunda placeholder'ı göster
  iframe.addEventListener('error', () => {
    placeholder.style.display = 'flex';
    console.warn('[PyroSat] Unity WebGL yüklenemedi, placeholder gösteriliyor.');
  });
})();


/* ══════════════════════════════════════
   8. CONSOLE BRANDING
══════════════════════════════════════ */
console.log(
  '%c🛰️  PYROSAT',
  'color:#ff5c00;font-family:monospace;font-size:1.5rem;font-weight:bold;'
);
console.log(
  '%cTUA Hackathon 2025 · Uzaydan Yangın Tespiti\nhttps://github.com/takiminiz',
  'color:#00b4ff;font-family:monospace;font-size:0.8rem;'
);
