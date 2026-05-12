/* ============================================
   HeyClaude — Premium JS Engine
   Lenis + GSAP ScrollTrigger + Three.js + Custom Cursor
   ============================================ */

(function () {
  'use strict';

  const HC = {};

  // ---- Loading Screen ----
  HC.loader = {
    init() {
      const loader = document.querySelector('.loader');
      if (!loader) { document.body.classList.add('loaded'); return; }

      const logo = loader.querySelector('.loader__logo');
      const bar = loader.querySelector('.loader__bar');
      const tl = gsap.timeline({
        onComplete() {
          gsap.to(loader, {
            yPercent: -100,
            duration: 0.8,
            ease: 'expo.inOut',
            onComplete() {
              loader.remove();
              document.body.classList.add('loaded');
              HC.heroReveal();
            }
          });
        }
      });

      tl.to(logo, { opacity: 1, duration: 0.6, ease: 'power2.out' })
        .to(bar, { width: '100%', duration: 1.2, ease: 'power2.inOut' }, 0.2)
        .to(logo, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.2);
    }
  };

  // ---- Lenis Smooth Scroll ----
  HC.lenis = {
    instance: null,
    init() {
      if (typeof Lenis === 'undefined') return;
      this.instance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2
      });

      this.instance.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        this.instance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  };

  // ---- Custom Cursor ----
  HC.cursor = {
    init() {
      if (window.matchMedia('(hover: none)').matches) return;
      if (window.innerWidth <= 768) return;

      const cursor = document.createElement('div');
      cursor.className = 'cursor';
      const dot = document.createElement('div');
      dot.className = 'cursor-dot';
      document.body.appendChild(cursor);
      document.body.appendChild(dot);

      let mx = 0, my = 0;
      let cx = 0, cy = 0;
      let dx = 0, dy = 0;

      document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        gsap.to(dot, { x: mx, y: my, duration: 0.1, ease: 'power2.out' });
      });

      gsap.ticker.add(() => {
        cx += (mx - cx) * 0.15;
        cy += (my - cy) * 0.15;
        gsap.set(cursor, { x: cx, y: cy });
      });

      const hoverEls = 'a, button, .card, .btn, .blog-card, .case-card, input, textarea, select';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverEls)) cursor.classList.add('hovering');
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverEls)) cursor.classList.remove('hovering');
      });
    }
  };

  // ---- Magnetic Buttons ----
  HC.magnetic = {
    init() {
      if (window.matchMedia('(hover: none)').matches) return;

      document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
        });

        el.addEventListener('mouseleave', () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        });
      });
    }
  };

  // ---- Nav Show/Hide ----
  HC.nav = {
    init() {
      const nav = document.querySelector('.nav');
      if (!nav) return;

      let lastScroll = 0;
      const threshold = 100;

      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate(self) {
          const scroll = self.scroll();
          if (scroll > threshold) {
            nav.classList.add('nav--visible');
            if (self.direction === 1 && scroll > 300) {
              nav.classList.add('nav--hidden');
            } else {
              nav.classList.remove('nav--hidden');
            }
          } else {
            nav.classList.remove('nav--visible', 'nav--hidden');
          }
          lastScroll = scroll;
        }
      });

      // Mobile toggle
      const toggle = nav.querySelector('.nav__toggle');
      const links = nav.querySelector('.nav__links');
      if (toggle && links) {
        toggle.addEventListener('click', () => {
          toggle.classList.toggle('open');
          links.classList.toggle('open');
        });
        links.querySelectorAll('a:not(.nav__dropdown-trigger)').forEach(link => {
          link.addEventListener('click', () => {
            toggle.classList.remove('open');
            links.classList.remove('open');
          });
        });
      }

      // Mobile dropdown
      document.querySelectorAll('.nav__dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            trigger.closest('.nav__dropdown').classList.toggle('open');
          }
        });
      });

      // Active link
      const page = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav__links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
          link.classList.add('active');
        }
      });
    }
  };

  // ---- Split Text ----
  HC.splitText = {
    init() {
      document.querySelectorAll('.split-words').forEach(el => {
        const text = el.textContent;
        el.innerHTML = text.split(' ').map(word =>
          `<span class="split-line"><span>${word}</span></span>`
        ).join(' ');
      });
    }
  };

  // ---- Hero Reveal ----
  HC.heroReveal = function () {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    const tag = hero.querySelector('.hero__tag');
    const h1 = hero.querySelector('h1');
    const subtitle = hero.querySelector('.hero__subtitle') || hero.querySelector('p');
    const actions = hero.querySelector('.hero__actions');
    const shapes = hero.querySelectorAll('.hero__shape');

    if (h1) {
      const words = h1.querySelectorAll('.split-line span');
      if (words.length) {
        tl.to(words, { y: 0, duration: 1.2, stagger: 0.08 }, 0);
      } else {
        tl.from(h1, { y: 60, opacity: 0, duration: 1.2 }, 0);
      }
    }

    if (tag) tl.to(tag, { opacity: 1, y: 0, duration: 0.8 }, 0.2);
    if (subtitle) tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, 0.4);
    if (actions) tl.to(actions, { opacity: 1, y: 0, duration: 0.8 }, 0.6);

    shapes.forEach((shape, i) => {
      tl.from(shape, {
        scale: 0,
        opacity: 0,
        duration: 1.5,
        ease: 'elastic.out(1, 0.6)'
      }, 0.3 + i * 0.15);
    });
  };

  // ---- Scroll Reveals ----
  HC.reveals = {
    init() {
      // .reveal-up
      gsap.utils.toArray('.reveal-up').forEach(el => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // .reveal-left
      gsap.utils.toArray('.reveal-left').forEach(el => {
        gsap.to(el, {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // .reveal-right
      gsap.utils.toArray('.reveal-right').forEach(el => {
        gsap.to(el, {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // .reveal-scale
      gsap.utils.toArray('.reveal-scale').forEach(el => {
        gsap.to(el, {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // .fade-up (legacy)
      gsap.utils.toArray('.fade-up').forEach(el => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Stagger children in .stagger-group
      gsap.utils.toArray('.stagger-group').forEach(group => {
        const children = group.children;
        gsap.fromTo(children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }
  };

  // ---- Marquee ----
  HC.marquee = {
    init() {
      document.querySelectorAll('.marquee__inner').forEach(track => {
        const clone = track.innerHTML;
        track.innerHTML += clone;

        const totalWidth = track.scrollWidth / 2;
        gsap.to(track, {
          x: -totalWidth,
          duration: 30,
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
          }
        });
      });
    }
  };

  // ---- Horizontal Scroll ----
  HC.horizontalScroll = {
    init() {
      document.querySelectorAll('.horizontal-section').forEach(section => {
        const track = section.querySelector('.horizontal-track');
        if (!track) return;

        const distance = track.scrollWidth - section.offsetWidth;

        gsap.to(track, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      });
    }
  };

  // ---- Stat Counter ----
  HC.stats = {
    init() {
      document.querySelectorAll('.stat__number').forEach(el => {
        const raw = el.textContent;
        const numMatch = raw.match(/[\d.]+/);
        if (!numMatch) return;

        const target = parseFloat(numMatch[0]);
        const prefix = raw.slice(0, raw.indexOf(numMatch[0]));
        const suffix = raw.slice(raw.indexOf(numMatch[0]) + numMatch[0].length);
        const hasDecimal = numMatch[0].includes('.');

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          onUpdate() {
            el.textContent = prefix + (hasDecimal ? obj.val.toFixed(1) : Math.round(obj.val)) + suffix;
          }
        });
      });
    }
  };

  // ---- Parallax Elements ----
  HC.parallax = {
    init() {
      gsap.utils.toArray('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        gsap.to(el, {
          y: () => -ScrollTrigger.maxScroll(window) * speed * 0.1,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      });
    }
  };

  // ---- Three.js WebGL Background ----
  HC.webgl = {
    scene: null,
    camera: null,
    renderer: null,
    particles: null,
    mouse: { x: 0, y: 0 },
    rafId: null,

    init() {
      const canvas = document.getElementById('webgl-canvas');
      if (!canvas || typeof THREE === 'undefined') return;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 50;

      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.createParticles();
      this.createLines();
      this.bindEvents();
      this.animate();
    },

    createParticles() {
      const count = 120;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      const palette = [
        new THREE.Color('#D4715E'),
        new THREE.Color('#8BA88E'),
        new THREE.Color('#D97757'),
        new THREE.Color('#EDE4D8')
      ];

      this.particleData = [];

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = (Math.random() - 0.5) * 100;
        positions[i3 + 2] = (Math.random() - 0.5) * 30;

        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 3 + 1;

        this.particleData.push({
          vx: (Math.random() - 0.5) * 0.03,
          vy: (Math.random() - 0.5) * 0.03,
          vz: (Math.random() - 0.5) * 0.01,
          ox: positions[i3],
          oy: positions[i3 + 1]
        });
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const vertexShader = `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `;

      const fragmentShader = `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, d) * 0.6;
          gl_FragColor = vec4(vColor, alpha);
        }
      `;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);
    },

    createLines() {
      const lineGeom = new THREE.BufferGeometry();
      const lineCount = 60;
      const linePositions = new Float32Array(lineCount * 6);
      lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

      this.lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color('#D4715E'),
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending
      });

      this.lines = new THREE.LineSegments(lineGeom, this.lineMaterial);
      this.lineCount = lineCount;
      this.scene.add(this.lines);
    },

    updateLines() {
      const pos = this.particles.geometry.attributes.position.array;
      const linePos = this.lines.geometry.attributes.position.array;
      const count = pos.length / 3;
      let lineIdx = 0;
      const maxDist = 20;

      for (let i = 0; i < count && lineIdx < this.lineCount * 6; i++) {
        for (let j = i + 1; j < count && lineIdx < this.lineCount * 6; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDist) {
            linePos[lineIdx++] = pos[i * 3];
            linePos[lineIdx++] = pos[i * 3 + 1];
            linePos[lineIdx++] = pos[i * 3 + 2];
            linePos[lineIdx++] = pos[j * 3];
            linePos[lineIdx++] = pos[j * 3 + 1];
            linePos[lineIdx++] = pos[j * 3 + 2];
          }
        }
      }

      while (lineIdx < this.lineCount * 6) {
        linePos[lineIdx++] = 0;
      }

      this.lines.geometry.attributes.position.needsUpdate = true;
    },

    bindEvents() {
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      });

      window.addEventListener('resize', () => {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });
    },

    animate() {
      const tick = () => {
        this.rafId = requestAnimationFrame(tick);

        if (!this.particles) return;
        const pos = this.particles.geometry.attributes.position.array;
        const count = pos.length / 3;

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const pd = this.particleData[i];

          pos[i3] += pd.vx;
          pos[i3 + 1] += pd.vy;
          pos[i3 + 2] += pd.vz;

          if (Math.abs(pos[i3] - pd.ox) > 15) pd.vx *= -1;
          if (Math.abs(pos[i3 + 1] - pd.oy) > 15) pd.vy *= -1;

          pos[i3] += this.mouse.x * 0.02;
          pos[i3 + 1] += this.mouse.y * 0.02;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.rotation.y += 0.0003;
        this.particles.rotation.x += 0.0001;

        this.updateLines();

        this.camera.position.x += (this.mouse.x * 3 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 3 - this.camera.position.y) * 0.02;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
      };
      tick();
    }
  };

  // ---- CTA Band Glow ----
  HC.ctaGlow = {
    init() {
      document.querySelectorAll('.cta-band').forEach(band => {
        const glow = band.querySelector('.cta-band__glow');
        if (!glow) return;

        gsap.to(glow, {
          scale: 1.3,
          opacity: 0.5,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });
    }
  };

  // ---- Card 3D Tilt ----
  HC.cardTilt = {
    init() {
      if (window.matchMedia('(hover: none)').matches) return;

      document.querySelectorAll('.card, .case-card, .blog-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateY: x * 8,
            rotateX: -y * 8,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 800
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        });
      });
    }
  };

  // ---- Scroll Progress Bar ----
  HC.scrollProgress = {
    init() {
      const bar = document.createElement('div');
      bar.className = 'scroll-progress';
      document.body.appendChild(bar);

      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + '%';
      });
    }
  };

  // ---- Glow Image Reveal ----
  HC.glowImages = {
    init() {
      const images = document.querySelectorAll('.glow-image');
      if (!images.length) return;

      images.forEach(img => {
        ScrollTrigger.create({
          trigger: img,
          start: 'top 80%',
          onEnter: () => img.classList.add('is-visible'),
        });
      });
    }
  };

  // ---- Image Strip Scroll ----
  HC.imageStrip = {
    init() {
      document.querySelectorAll('.image-strip').forEach(strip => {
        const clone = strip.innerHTML;
        strip.innerHTML += clone;

        const totalWidth = strip.scrollWidth / 2;
        gsap.to(strip, {
          x: -totalWidth,
          duration: 40,
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
          }
        });
      });
    }
  };

  // ---- Parallax Background Images ----
  HC.parallaxBg = {
    init() {
      document.querySelectorAll('.img-section__bg').forEach(bg => {
        gsap.to(bg, {
          y: () => 150,
          ease: 'none',
          scrollTrigger: {
            trigger: bg.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      });
    }
  };

  // ---- Photo Card Parallax ----
  HC.photoCards = {
    init() {
      document.querySelectorAll('.photo-card__img').forEach(img => {
        gsap.fromTo(img,
          { y: -30 },
          {
            y: 30,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('.photo-card'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );
      });
    }
  };

  // ---- Gallery Mosaic Stagger ----
  HC.galleryMosaic = {
    init() {
      document.querySelectorAll('.gallery-mosaic').forEach(mosaic => {
        const items = mosaic.querySelectorAll('.gallery-mosaic__item');
        gsap.fromTo(items,
          { y: 60, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: mosaic,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }
  };

  // ---- Noise Overlay ----
  HC.noiseOverlay = {
    init() {
      document.body.classList.add('noise-overlay');
    }
  };

  // ---- Tilt on Photo Cards ----
  HC.photoCardTilt = {
    init() {
      if (window.matchMedia('(hover: none)').matches) return;

      document.querySelectorAll('.photo-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateY: x * 12,
            rotateX: -y * 12,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 1000
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
        });
      });
    }
  };

  // ---- Initialize ----
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP/ScrollTrigger not loaded — running fallback');
      fallback();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    HC.loader.init();
    HC.lenis.init();
    HC.cursor.init();
    HC.nav.init();
    HC.splitText.init();
    HC.magnetic.init();
    HC.reveals.init();
    HC.marquee.init();
    HC.horizontalScroll.init();
    HC.stats.init();
    HC.parallax.init();
    HC.webgl.init();
    HC.ctaGlow.init();
    HC.cardTilt.init();
    HC.scrollProgress.init();
    HC.glowImages.init();
    HC.imageStrip.init();
    HC.parallaxBg.init();
    HC.photoCards.init();
    HC.galleryMosaic.init();
    HC.noiseOverlay.init();
    HC.photoCardTilt.init();

    if (!document.querySelector('.loader')) {
      HC.heroReveal();
    }

    setTimeout(() => ScrollTrigger.refresh(), 1500);
  }

  function fallback() {
    document.body.classList.add('loaded');
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();

    document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .fade-up').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.hero__tag, .hero__subtitle, .hero__actions').forEach(el => {
      el.style.opacity = '1';
    });

    // Basic nav
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
