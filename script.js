/* ========================================
   PORTFOLIO INTERACTIVE SCRIPT
   Author: Ardiansyah Namora H.
   Updated: OPTIMIZED PERFORMANCE & CONTENT 2026
   ======================================== */

// 1. IMPORT FIREBASE (Dynamic Import handled inside initFirebase)
// Removed static imports to prevent blocking UI on load error

// --- PERFORMANCE UTILITIES ---

// Throttle function to limit execution frequency
const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Debounce function for delayed execution
const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// --- LOGIC UTAMA WEBSITE ---

document.addEventListener('DOMContentLoaded', () => {

    // Cache frequently used DOM elements
    const cachedElements = {
        sections: document.querySelectorAll('section[id]'),
        navLinks: document.querySelectorAll('.nav__link'),
        header: document.querySelector('.header'),
        scrollProgressBar: document.getElementById('scroll-progress'),
        navMenu: document.getElementById('nav-menu'),
        navToggle: document.getElementById('nav-toggle'),
        navClose: document.getElementById('nav-close'),
        scrollUp: document.getElementById('scroll-up')
    };

    /* ========================================
       A. NAVIGATION ACTIVE LINK ON SCROLL (OPTIMIZED)
       ======================================== */
    const scrollActive = () => {
        const scrollY = window.scrollY;

        cachedElements.sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']');

            if (sectionsClass) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    cachedElements.navLinks.forEach(link => link.classList.remove('active-link'));
                    sectionsClass.classList.add('active-link');
                }
            }
        });
    };

    // Throttled scroll handler - runs max every 100ms
    const throttledScrollActive = throttle(scrollActive, 100);
    window.addEventListener('scroll', throttledScrollActive, { passive: true });


    /* ========================================
       B. VARIABLES & SCROLL PROGRESS (OPTIMIZED)
       ======================================== */
    const navMenu = cachedElements.navMenu;
    const navToggle = cachedElements.navToggle;
    const navClose = cachedElements.navClose;
    const navLinks = cachedElements.navLinks;
    const header = cachedElements.header;
    const scrollProgressBar = cachedElements.scrollProgressBar;

    // Optimized scroll progress with requestAnimationFrame
    let ticking = false;
    const updateScrollProgress = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        if (scrollProgressBar) scrollProgressBar.style.width = scrolled + "%";
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollProgress);
            ticking = true;
        }
    }, { passive: true });



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
    // Validate that elements exist before adding listeners
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show-menu');
        });
    }

    if (navClose && navMenu) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
        });
    }

    // Auto-close menu when a link is clicked
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) navMenu.classList.remove('show-menu');
            });
        });
    }

    // Consolidated scroll effects (header shadow + scroll-up button)
    const scrollUp = cachedElements.scrollUp;
    const handleScrollEffects = throttle(() => {
        const scrollY = window.scrollY;

        // Header shadow
        if (header) {
            header.style.boxShadow = scrollY >= 50 ? "0 2px 10px var(--color-shadow)" : "none";
        }

        // Scroll-up button visibility
        if (scrollUp) {
            scrollUp.classList.toggle('show-scroll', scrollY >= 350);
        }
    }, 100);

    window.addEventListener('scroll', handleScrollEffects, { passive: true });

    /* ========================================
       F. SCROLL REVEAL & COUNTERS (OPTIMIZED)
       ======================================== */
    const revealElements = document.querySelectorAll(".reveal, .skill__progress, .stat-number, .skill__number");

    // Use requestAnimationFrame for smoother counter animations
    const animateCounterRAF = (element, target, isPercentage) => {
        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuad = progress * (2 - progress);
            const currentValue = Math.ceil(startValue + (target - startValue) * easeOutQuad);

            element.innerText = currentValue + (isPercentage ? "%" : "+");

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add("active");
                if ((reveal.classList.contains('stat-number') || reveal.classList.contains('skill__number')) && !reveal.classList.contains('counted')) {
                    const target = +reveal.getAttribute('data-target');
                    const isPercentage = reveal.classList.contains('skill__number');
                    animateCounterRAF(reveal, target, isPercentage);
                    reveal.classList.add('counted');
                }
            }
        });
    };

    // Throttled scroll reveal
    const throttledReveal = throttle(revealOnScroll, 100);
    window.addEventListener("scroll", throttledReveal, { passive: true });
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
    /* Theme Toggle Removed - Dark Theme Enforced */

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

    /* 
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // e.preventDefault(); // DISABLED: Allow Formsubmit.co to handle it
            // const name = document.getElementById('name').value;
            // if (name) {
            //    showNotification(`Pesan terkirim! Silakan cek email untuk aktivasi (jika pertama kali).`, 'success');
            //    // contactForm.reset(); 
            // }
        });
    }
    */

    /* ========================================
       K. FIREBASE SYSTEM (ASYNC LOADER)
       ======================================== */
    const initFirebase = async () => {
        try {
            // Dynamic Imports
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getDatabase, ref, push, onChildAdded, remove, get, set, onValue } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

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

            const app = initializeApp(firebaseConfig);
            const db = getDatabase(app);
            const commentsRef = ref(db, 'comments');
            const visitorCountRef = ref(db, 'visitorCount');

            // --- COMMENT SYSTEM ---
            const commentForm = document.getElementById('comment-form');
            const commentsContainer = document.getElementById('comments-container');

            // Function to delete comment
            const deleteComment = (key, element) => {
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
                // Remove old listener to prevent duplicates if re-initialized (unlikely here but good practice)
                const newForm = commentForm.cloneNode(true);
                commentForm.parentNode.replaceChild(newForm, commentForm);

                newForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name = document.getElementById('comment-name').value;
                    const text = document.getElementById('comment-text').value;
                    if (name && text) {
                        const now = new Date();
                        const dateString = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID').slice(0, 5);
                        push(commentsRef, { name: name, text: text, date: dateString });
                        showNotification('Komentar berhasil diposting!', 'success');
                        newForm.reset();
                    }
                });
            }

            // --- VISITOR COUNTER ---
            const visitorCountDisplay = document.getElementById('visitor-count');
            const sessionKey = 'visitor_counted';
            const hasBeenCounted = sessionStorage.getItem(sessionKey);

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

            onValue(visitorCountRef, (snapshot) => {
                const count = snapshot.val() || 0;
                if (visitorCountDisplay) {
                    animateCounter(visitorCountDisplay, count);
                }
            });

            if (!hasBeenCounted) {
                get(visitorCountRef).then((snapshot) => {
                    const currentCount = snapshot.val() || 0;
                    set(visitorCountRef, currentCount + 1);
                    sessionStorage.setItem(sessionKey, 'true');
                }).catch((error) => {
                    console.log('Visitor count error:', error);
                });
            }

            console.log("✅ Firebase Connected Successfully");

        } catch (error) {
            console.warn("⚠️ Firebase failed to load (Offline Mode):", error);
            const visitorCountDisplay = document.getElementById('visitor-count');
            if (visitorCountDisplay) visitorCountDisplay.textContent = "-";
            showNotification("Mode Offline: Database tidak terhubung", "error");
        }
    };

    // Initialize Firebase independently
    initFirebase();

    /* ========================================
       L. IP & ISP DETECTOR - REMOVED FOR PERFORMANCE
       ======================================== */
    // Terminal effect removed to prevent main thread blocking

    /* ========================================
       M. PARTICLES.JS - REMOVED FOR PERFORMANCE
       ======================================== */
    // Particles configuration removed

    /* ========================================
       N. EASTER EGG - REMOVED FOR PERFORMANCE
       ======================================== */
    // Konami code listener removed

    /* ========================================
       O. COMMAND PALETTE (Ctrl+K)
       ======================================== */
    const commandPalette = document.getElementById('command-palette');
    const commandInput = document.getElementById('command-input');
    const commandResults = document.getElementById('command-results');
    const commandItems = document.querySelectorAll('.command-item');
    let selectedIndex = -1;

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        }

        if (e.key === 'Escape' && commandPalette.classList.contains('active')) {
            closeCommandPalette();
        }

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

    if (commandPalette) {
        commandPalette.addEventListener('click', (e) => {
            if (e.target === commandPalette) {
                closeCommandPalette();
            }
        });
    }

    commandItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');

            switch (action) {
                case 'navigate':
                    const target = item.getAttribute('data-target');
                    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
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
       P. VISITOR COUNTER (Moved to initFirebase)
       ======================================== */
    // Logic merged into initFirebase to share DB connection


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
    // Parallax Effect Removed for Performance

    const aboutInfoElements = document.querySelectorAll('.about__info');
    aboutInfoElements.forEach(el => el.classList.add('from-left'));
    const skillElements = document.querySelectorAll('.skills');
    skillElements.forEach(el => el.classList.add('from-right'));

});

// Helper Notification
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

// ========================================
//    HOBBY GALLERY TOGGLE FUNCTION
// ========================================
window.toggleHobiGallery = function (card) {
    const wrapper = card.closest('.hobi-card-wrapper');
    const gallery = wrapper.querySelector('.hobi-gallery');
    const isActive = card.classList.contains('active');

    // Close all other galleries first
    document.querySelectorAll('.hobi-card.active').forEach(otherCard => {
        if (otherCard !== card) {
            otherCard.classList.remove('active');
            const otherWrapper = otherCard.closest('.hobi-card-wrapper');
            otherWrapper.classList.remove('expanded');
            otherWrapper.querySelector('.hobi-gallery').classList.remove('active');
        }
    });

    // Toggle current gallery
    if (isActive) {
        card.classList.remove('active');
        wrapper.classList.remove('expanded');
        gallery.classList.remove('active');
    } else {
        card.classList.add('active');
        wrapper.classList.add('expanded');
        gallery.classList.add('active');
    }
}

// ========================================
//    PHOTO LIGHTBOX FUNCTIONS
// ========================================
window.openLightbox = function (imageSrc) {
    event.stopPropagation(); // Prevent gallery from closing
    const lightbox = document.getElementById('photo-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

window.closeLightbox = function () {
    const lightbox = document.getElementById('photo-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Close lightbox with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});