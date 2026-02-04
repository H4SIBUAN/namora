/* ========================================
   PORTFOLIO INTERACTIVE SCRIPT
   Author: Ardiansyah Namora H.
   Updated: FIXED ACTIVE LINK ON SCROLL
   ======================================== */

// 1. IMPORT FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 2. KONFIGURASI FIREBASE KAMU
const firebaseConfig = {
    apiKey: "AIzaSyDV4ul5oSeOyO8HPn65yAMh-3jVo4XA5Bw",
    authDomain: "portofolio-namora.firebaseapp.com",
    databaseURL: "https://portofolio-namora-default-rtdb.firebaseio.com",
    projectId: "portofolio-namora",
    storageBucket: "portofolio-namora.firebasestorage.app",
    messagingSenderId: "840689511086",
    appId: "1:840689511086:web:0e19a936e99fe0fdc09b3f",
    measurementId: "G-QQCJSJ9SL0"
};

// 3. INISIALISASI DATABASE
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const commentsRef = ref(db, 'comments');

// --- LOGIC UTAMA WEBSITE ---

document.addEventListener('DOMContentLoaded', () => {

    /* ========================================
       A. NAVIGATION ACTIVE LINK ON SCROLL (BARU & PENTING!)
       ======================================== */
    const sections = document.querySelectorAll('section[id]'); // Ambil semua section yang punya ID (home, about, dll)

    function scrollActive() {
        const scrollY = window.scrollY;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            // Dikurang 100 agar highlight pindah sedikit sebelum section benar-benar sampai atas
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']');

            if (sectionsClass) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav__link').forEach(link => link.classList.remove('active-link'));
                    sectionsClass.classList.add('active-link');
                }
            }
        });
    }
    // Jalankan fungsi ini setiap kali user scroll
    window.addEventListener('scroll', scrollActive);


    /* ========================================
       B. VARIABLES & SCROLL PROGRESS
       ======================================== */
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');
    const header = document.querySelector('.header');
    const scrollProgressBar = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        if (scrollProgressBar) scrollProgressBar.style.width = scrolled + "%";
    });

    /* ========================================
       C. DIGITAL CLOCK (REAL-TIME)
       ======================================== */
    const updateClock = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) timeDisplay.innerText = `${hours}:${minutes}:${seconds} WIB`;
    };
    setInterval(updateClock, 1000);
    updateClock();

    /* ========================================
       D. CUSTOM CONTEXT MENU
       ======================================== */
    const contextMenu = document.getElementById("context-menu");
    const scope = document.querySelector("body");

    scope.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const { clientX: mouseX, clientY: mouseY } = event;
        if (contextMenu) {
            contextMenu.style.top = `${mouseY}px`;
            contextMenu.style.left = `${mouseX}px`;
            contextMenu.classList.remove("visible");
            setTimeout(() => { contextMenu.classList.add("visible"); });
        }
    });

    scope.addEventListener("click", (e) => {
        if (contextMenu && e.target.offsetParent != contextMenu) {
            contextMenu.classList.remove("visible");
        }
    });

    /* ========================================
       E. NAVIGATION & HEADER EFFECTS
       ======================================== */
    if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('active'));
    if (navClose) navClose.addEventListener('click', () => navMenu.classList.remove('active'));

    // Tutup menu mobile jika link diklik
    navLinks.forEach(link => link.addEventListener('click', () => navMenu.classList.remove('active')));

    // Header Shadow saat scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY >= 50) header.style.boxShadow = "0 2px 10px var(--color-shadow)";
        else header.style.boxShadow = "none";
    });

    // Show Scroll Up Button
    const scrollUp = document.getElementById('scroll-up');
    window.addEventListener('scroll', () => {
        if (window.scrollY >= 350) scrollUp.classList.add('show-scroll');
        else scrollUp.classList.remove('show-scroll');
    });

    /* ========================================
       F. SCROLL REVEAL & COUNTERS
       ======================================== */
    const revealElements = document.querySelectorAll(".reveal, .skill__progress, .stat-number, .skill__number");
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add("active");
                if ((reveal.classList.contains('stat-number') || reveal.classList.contains('skill__number')) && !reveal.classList.contains('counted')) {
                    const target = +reveal.getAttribute('data-target');
                    const increment = target / 50;
                    let current = 0;
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            reveal.innerText = Math.ceil(current) + (reveal.classList.contains('skill__number') ? "%" : "+");
                            setTimeout(updateCounter, 30);
                        } else {
                            reveal.innerText = target + (reveal.classList.contains('skill__number') ? "%" : "+");
                        }
                    };
                    updateCounter();
                    reveal.classList.add('counted');
                }
            }
        });
    };
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

    /* ========================================
       G. PROJECT FILTERS
       ======================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 100);
                } else {
                    card.style.opacity = '0'; card.style.transform = 'scale(0.8)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                }
            });
        });
    });

    /* ========================================
       H. TYPING EFFECT & THEME
       ======================================== */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('span') : null;
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }

    const typedTextSpan = document.querySelector(".typed-text");
    const textArray = ["Siswa TKJ", "Web Developer", "Network Engineer", "Tech Enthusiast"];
    let textArrayIndex = 0; let charIndex = 0;
    function type() {
        if (!typedTextSpan) return;
        if (charIndex < textArray[textArrayIndex].length) {
            typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        } else { setTimeout(erase, 2000); }
    }
    function erase() {
        if (!typedTextSpan) return;
        if (charIndex > 0) {
            typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 50);
        } else {
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, 1100);
        }
    }
    if (typedTextSpan && textArray.length) setTimeout(type, 250);

    /* ========================================
       I. NOTIFICATION SYSTEM
       ======================================== */
    const showNotification = (message, type) => {
        const oldNotif = document.querySelector('.custom-alert');
        if (oldNotif) oldNotif.remove();
        const alert = document.createElement('div');
        alert.className = 'custom-alert';
        alert.textContent = message;
        Object.assign(alert.style, {
            position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px', borderRadius: '12px',
            background: type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            color: 'white', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            zIndex: '9999', transform: 'translateY(100px)', transition: 'transform 0.5s ease',
            fontFamily: 'var(--font-family)', fontWeight: '500'
        });
        document.body.appendChild(alert);
        setTimeout(() => { alert.style.transform = 'translateY(0)'; }, 100);
        setTimeout(() => { alert.style.transform = 'translateY(100px)'; setTimeout(() => alert.remove(), 500); }, 4000);
    };

    /* ========================================
       J. TAB SWITCHER (KOMENTAR vs EMAIL)
       ======================================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formContents = document.querySelectorAll('.form-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            formContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) target.classList.add('active');
        });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            if (name) {
                showNotification(`Pesan terkirim, ${name}! (Mode Demo)`, 'success');
                contactForm.reset();
            }
        });
    }

    /* ========================================
       K. FIREBASE COMMENT SYSTEM (ONLINE)
       ======================================== */
    const commentForm = document.getElementById('comment-form');
    const commentsContainer = document.getElementById('comments-container');

    const renderComment = (key, name, text, date) => {
        const div = document.createElement('div');
        div.className = 'comment-item spotlight-card';
        div.id = key;
        div.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${name}</span>
                <span class="comment-date">${date}</span>
                <button class="delete-btn" data-key="${key}" aria-label="Hapus">❌</button>
            </div>
            <p class="comment-body">${text}</p>
        `;
        if (commentsContainer.children.length > 1) {
            commentsContainer.insertBefore(div, commentsContainer.children[1]);
        } else {
            commentsContainer.appendChild(div);
        }
        const delBtn = div.querySelector('.delete-btn');
        delBtn.addEventListener('click', () => deleteComment(key, div));
    };

    onChildAdded(commentsRef, (snapshot) => {
        const data = snapshot.val();
        renderComment(snapshot.key, data.name, data.text, data.date);
    });

    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('comment-name').value;
            const text = document.getElementById('comment-text').value;
            if (name && text) {
                const now = new Date();
                const dateString = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID').slice(0, 5);
                push(commentsRef, { name: name, text: text, date: dateString });
                showNotification('Komentar berhasil diposting!', 'success');
                commentForm.reset();
            }
        });
    }

    window.deleteComment = (key, element) => {
        const password = prompt("🔒 Masukkan Password Admin:");
        if (password === "admin123") {
            if (confirm("Yakin ingin menghapus komentar ini dari database?")) {
                const itemRef = ref(db, `comments/${key}`);
                remove(itemRef)
                    .then(() => {
                        element.remove();
                        showNotification("Komentar dihapus permanen.", "success");
                    })
                    .catch((error) => {
                        alert("Gagal menghapus: " + error.message);
                    });
            }
        } else if (password !== null) {
            alert("⛔ Akses Ditolak! Password salah.");
        }
    };

    /* ========================================
       L. IP & ISP DETECTOR (TERMINAL)
       ======================================== */
    setTimeout(() => {
        const resultContainer = document.getElementById('scan-result');
        if (resultContainer) {
            const messages = [
                "> Initializing network scan...",
                "> Resolving host address...",
                "> Connection established.",
                "> Fetching public data..."
            ];

            let i = 0;
            const printLog = setInterval(() => {
                if (i < messages.length) {
                    const p = document.createElement('p');
                    p.className = 'response';
                    p.innerText = messages[i];
                    resultContainer.appendChild(p);
                    i++;
                } else {
                    clearInterval(printLog);
                    fetch('https://ipapi.co/json/')
                        .then(response => response.json())
                        .then(data => {
                            const infoHTML = `
                                <p class="response text-green"> > [SUCCESS] Target Identified!</p>
                                <p class="response"> > <strong>IP Address:</strong> ${data.ip}</p>
                                <p class="response"> > <strong>Location:</strong> ${data.city}, ${data.country_name}</p>
                                <p class="response"> > <strong>ISP:</strong> ${data.org}</p>
                            `;
                            resultContainer.innerHTML += infoHTML;
                        })
                        .catch(err => {
                            resultContainer.innerHTML += `<p class="response" style="color:red;"> > [ERROR] Scan blocked by firewall.</p>`;
                        });
                }
            }, 800);
        }
    }, 2000);

    /* ========================================
       M. PARTICLES.JS (Classic Professional)
       ======================================== */
    if (document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#2563EB" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#06B6D4", "opacity": 0.4, "width": 1 },
                "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "window",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }

    /* ========================================
       N. EASTER EGG - KONAMI CODE
       ======================================== */
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiIndex = 0;
    const easterEggModal = document.getElementById('easter-egg-modal');
    const easterEggClose = document.getElementById('easter-egg-close');

    document.addEventListener('keydown', (e) => {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Konami Code completed!
                easterEggModal.classList.add('active');
                konamiIndex = 0;
                showNotification('🎮 Konami Code Activated!', 'success');

                // Create confetti effect
                createConfetti();
            }
        } else {
            konamiIndex = 0;
        }
    });

    if (easterEggClose) {
        easterEggClose.addEventListener('click', () => {
            easterEggModal.classList.remove('active');
        });
    }

    // Close on backdrop click
    if (easterEggModal) {
        easterEggModal.addEventListener('click', (e) => {
            if (e.target === easterEggModal) {
                easterEggModal.classList.remove('active');
            }
        });
    }

    // Confetti function
    function createConfetti() {
        const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d9de0', '#7b5cd6', '#ff00c8'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -20px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                z-index: 100000;
                pointer-events: none;
                animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }

        // Add confetti animation if not exists
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /* ========================================
       O. COMMAND PALETTE (Ctrl+K)
       ======================================== */
    const commandPalette = document.getElementById('command-palette');
    const commandInput = document.getElementById('command-input');
    const commandResults = document.getElementById('command-results');
    const commandItems = document.querySelectorAll('.command-item');
    let selectedIndex = -1;

    // Open Command Palette with Ctrl+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        }

        // Close with Escape
        if (e.key === 'Escape' && commandPalette.classList.contains('active')) {
            closeCommandPalette();
        }

        // Navigate with arrows
        if (commandPalette.classList.contains('active')) {
            const visibleItems = Array.from(commandItems).filter(item => !item.classList.contains('hidden'));

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, visibleItems.length - 1);
                updateSelection(visibleItems);
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateSelection(visibleItems);
            }

            if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                visibleItems[selectedIndex]?.click();
            }
        }
    });

    function toggleCommandPalette() {
        if (commandPalette.classList.contains('active')) {
            closeCommandPalette();
        } else {
            openCommandPalette();
        }
    }

    function openCommandPalette() {
        commandPalette.classList.add('active');
        commandInput.value = '';
        commandInput.focus();
        selectedIndex = -1;
        commandItems.forEach(item => item.classList.remove('hidden', 'selected'));
    }

    function closeCommandPalette() {
        commandPalette.classList.remove('active');
        commandInput.value = '';
        selectedIndex = -1;
    }

    function updateSelection(visibleItems) {
        commandItems.forEach(item => item.classList.remove('selected'));
        if (visibleItems[selectedIndex]) {
            visibleItems[selectedIndex].classList.add('selected');
            visibleItems[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    // Search/Filter functionality
    if (commandInput) {
        commandInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            selectedIndex = -1;

            commandItems.forEach(item => {
                const text = item.querySelector('.command-item-text').textContent.toLowerCase();
                if (text.includes(query) || query === '') {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
                item.classList.remove('selected');
            });
        });
    }

    // Close on backdrop click
    if (commandPalette) {
        commandPalette.addEventListener('click', (e) => {
            if (e.target === commandPalette) {
                closeCommandPalette();
            }
        });
    }

    // Handle command item clicks
    commandItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');

            switch (action) {
                case 'navigate':
                    const target = item.getAttribute('data-target');
                    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'theme':
                    themeToggle?.click();
                    break;
                case 'print':
                    window.print();
                    break;
                case 'refresh':
                    location.reload();
                    break;
                case 'link':
                    const url = item.getAttribute('data-url');
                    window.open(url, '_blank');
                    break;
            }

            closeCommandPalette();
            showNotification(`✅ Perintah "${item.querySelector('.command-item-text').textContent}" dijalankan!`, 'success');
        });
    });

    /* ========================================
       P. VISITOR COUNTER (Firebase Realtime)
       ======================================== */
    const visitorCountRef = ref(db, 'visitorCount');
    const visitorCountDisplay = document.getElementById('visitor-count');

    // Check if visitor already counted in this session
    const sessionKey = 'visitor_counted';
    const hasBeenCounted = sessionStorage.getItem(sessionKey);

    // Get current count and increment if new visitor

    // Listen for realtime updates
    onValue(visitorCountRef, (snapshot) => {
        const count = snapshot.val() || 0;
        if (visitorCountDisplay) {
            animateCounter(visitorCountDisplay, count);
        }
    });

    // Increment count for new visitors
    if (!hasBeenCounted) {
        get(visitorCountRef).then((snapshot) => {
            const currentCount = snapshot.val() || 0;
            set(visitorCountRef, currentCount + 1);
            sessionStorage.setItem(sessionKey, 'true');
        }).catch((error) => {
            console.log('Visitor count error:', error);
        });
    }

    // Animate counter function
    function animateCounter(element, target) {
        const current = parseInt(element.textContent) || 0;
        if (current === target) return;

        const increment = target > current ? 1 : -1;
        const step = Math.abs(target - current) > 50 ? Math.ceil(Math.abs(target - current) / 30) : 1;

        let value = current;
        const timer = setInterval(() => {
            value += step * increment;
            if ((increment > 0 && value >= target) || (increment < 0 && value <= target)) {
                value = target;
                clearInterval(timer);
            }
            element.textContent = value.toLocaleString();
        }, 30);
    }

    console.log("✅ Portfolio System Online (Professional Mode)");
    console.log("💡 Tip: Tekan Ctrl+K untuk Command Palette atau coba Konami Code ↑↑↓↓←→←→BA");

    // ====================
    // TYPING INDICATOR
    // ====================
    const terminalBody = document.getElementById('terminal-body');
    if (terminalBody) {
        const responses = terminalBody.querySelectorAll('.response');
        responses.forEach((response, index) => {
            response.style.opacity = '0';
            setTimeout(() => {
                // Show typing indicator
                const typingIndicator = document.createElement('div');
                typingIndicator.className = 'typing-indicator';
                typingIndicator.innerHTML = '<span></span><span></span><span></span>';
                response.parentElement.insertBefore(typingIndicator, response);

                setTimeout(() => {
                    typingIndicator.remove();
                    response.style.opacity = '1';
                    response.classList.add('typing');
                }, 1000);
            }, 500 + (index * 1500));
        });
    }

    // ====================
    // PARALLAX MOUSE EFFECT
    // ====================
    const parallaxSections = document.querySelectorAll('.section');
    parallaxSections.forEach(section => {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            section.style.setProperty('--mouse-x', `${x}%`);
            section.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    // Enhanced scroll reveal with different directions
    const aboutInfoElements = document.querySelectorAll('.about__info');
    aboutInfoElements.forEach(el => el.classList.add('from-left'));
    const skillElements = document.querySelectorAll('.skills');
    skillElements.forEach(el => el.classList.add('from-right'));
});

// ========================================
//    HOBBY GALLERY TOGGLE FUNCTION
// ========================================
function toggleHobiGallery(card) {
    const wrapper = card.closest('.hobi-card-wrapper');
    const gallery = wrapper.querySelector('.hobi-gallery');
    const isActive = card.classList.contains('active');

    // Close all other galleries first
    document.querySelectorAll('.hobi-card.active').forEach(otherCard => {
        if (otherCard !== card) {
            otherCard.classList.remove('active');
            otherCard.closest('.hobi-card-wrapper').querySelector('.hobi-gallery').classList.remove('active');
        }
    });

    // Toggle current gallery
    if (isActive) {
        card.classList.remove('active');
        gallery.classList.remove('active');
    } else {
        card.classList.add('active');
        gallery.classList.add('active');
    }
}