
document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       Mobile Menu Toggle
    ========================================== */
    const mobileBtn = document.querySelector('.mobile-menu-icon');
    const nav = document.querySelector('.nav');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'block' ? 'none' : 'block';

            // Add animation class if needed, for now just simple toggle
            if (nav.style.display === 'block') {
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.backgroundColor = '#fff';
                nav.style.padding = '20px';
                nav.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }
        });
    }

    /* ==========================================
       Sticky Header Background on Scroll
    ========================================== */
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = 'var(--shadow)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        }
    });

    /* ==========================================
       Custom Lead Modal Logic
    ========================================== */
    const leadModal = document.getElementById('leadModal');
    const modalNameInput = document.getElementById('modalNameInput');
    const modalSubmitBtn = document.getElementById('modalSubmitBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalSubtext = document.getElementById('modalSubtext');

    let modalPromiseResolve = null;

    function openLeadModal(subtext) {
        if (subtext) modalSubtext.innerText = subtext;
        leadModal.classList.add('active');
        modalNameInput.focus();

        return new Promise((resolve) => {
            modalPromiseResolve = resolve;
        });
    }

    function closeLeadModal(name = null) {
        leadModal.classList.remove('active');
        modalNameInput.value = '';
        if (modalPromiseResolve) {
            modalPromiseResolve(name);
            modalPromiseResolve = null;
        }
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => closeLeadModal(null));
    }

    if (modalSubmitBtn) {
        modalSubmitBtn.addEventListener('click', () => {
            const name = modalNameInput.value.trim();
            if (name) {
                closeLeadModal(name);
            } else {
                alert('Por favor, digite seu nome para continuar.');
            }
        });
    }

    // Close modal on click outside
    window.addEventListener('click', (e) => {
        if (e.target === leadModal) closeLeadModal(null);
    });

    /* ==========================================
       Service Card / WhatsApp Redirection
    ========================================== */
    const serviceCards = document.querySelectorAll('.service-card');
    const waNumber = '5516993151386'; // WhatsApp Number

    // Service Card Clicks - Auto Capture
    serviceCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', async () => {
            const serviceTitle = card.querySelector('h3').innerText;

            const name = await openLeadModal(`Para te atender melhor sobre "${serviceTitle}", qual o seu nome?`);
            if (!name) return;

            const finalName = name;
            const message = `Interessado em: ${serviceTitle}`;

            // Wait for Supabase to save before redirecting (vital for mobile)
            await saveLead(finalName, "(Site - Clique)", message);

            const waMsg = encodeURIComponent(`Olá, meu nome é ${finalName}. Gostaria de saber mais sobre ${serviceTitle}.`);
            window.location.href = `https://wa.me/${waNumber}?text=${waMsg}`;
        });
    });

    // Floating WhatsApp Button - Auto Capture
    const waFloat = document.querySelector('.whatsapp-float');
    if (waFloat) {
        waFloat.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = await openLeadModal("Olá! Para iniciarmos o atendimento, qual o seu nome?");
            if (!name) return;

            const finalName = name;
            await saveLead(finalName, "(Site - Flutuante)", "Contato via botão flutuante");

            const waMsg = encodeURIComponent(`Olá, meu nome é ${finalName}. Vim pelo site e gostaria de saber mais sobre benefícios previdenciários.`);
            window.location.href = `https://wa.me/${waNumber}?text=${waMsg}`;
        });
    }

    // Hero WhatsApp Button - Auto Capture
    const heroWA = document.querySelector('.hero-buttons .btn-outline');
    if (heroWA) {
        heroWA.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = await openLeadModal("Olá! Para iniciarmos o atendimento, qual o seu nome?");
            if (!name) return;

            const finalName = name;
            await saveLead(finalName, "(Site - Hero)", "Contato via botão principal");

            const waMsg = encodeURIComponent(`Olá, meu nome é ${finalName}. Vim pelo site e gostaria de saber mais sobre benefícios previdenciários.`);
            window.location.href = `https://wa.me/${waNumber}?text=${waMsg}`;
        });
    }

    /* --- REUSABLE LEAD SAVING FUNCTION --- */
    async function saveLead(name, phone, message) {
        try {
            const { data, error } = await supabase
                .from('leads')
                .insert([
                    { name, phone, message, status: 'new' }
                ]);

            if (error) throw error;
            console.log('Lead salvo no Supabase:', name);
        } catch (err) {
            console.error('Erro ao salvar no Supabase:', err);
            // Fallback to localStorage if Supabase fails?
            // For now, let's just log and rely on Supabase.
        }
    }


    /* ==========================================
       Form Submission - Send to WhatsApp
    ========================================== */
    const form = document.getElementById('leadForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !phone) {
                alert('Por favor, preencha pelo menos seu nome e telefone.');
                return;
            }

            /* --- CRM INTEGRATION --- */
            // 1. Save to LocalStorage for Kanban (Admin)
            saveLead(name, phone, message);

            // 2. Submit to Netlify Forms (Background)
            // ensuring data is saved in the cloud
            const formData = new FormData(form);
            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString(),
            }).catch(error => console.log('Netlify form submission error', error));
            /* ----------------------- */

            // Create WhatsApp Message
            const text = `*Novo Contato do Site*%0A%0A*Nome:* ${name}%0A*Telefone:* ${phone}%0A*Mensagem:* ${message}`;

            const url = `https://wa.me/${waNumber}?text=${text}`;

            // Redirect
            window.open(url, '_blank');

            // Reset form
            form.reset();
        });
    }

    /* ==========================================
       Smooth Scroll for Anchor Links
    ========================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                nav.style.display = 'none';
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });


    /* ==========================================
       Results Counter Animation
    ========================================== */
    const counters = document.querySelectorAll('.result-number');
    let hasAnimated = false; // Ensure it only runs once

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // Animation duration in ms
            const increment = target / (duration / 20); // Update every 20ms

            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    setTimeout(updateCounter, 20);
                } else {
                    counter.innerText = target;
                    // Add "+" sign for specific counters if needed, or keeping it strictly numeric
                    if (target === 98) counter.innerText += "%";
                    else counter.innerText += "+";
                }
            };
            updateCounter();
        });
    };

    // Use Intersection Observer to trigger animation when section is in view
    const resultsSection = document.querySelector('.results');
    if (resultsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                animateCounters();
                hasAnimated = true;
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        observer.observe(resultsSection);
    }

    /* ==========================================
       Structure Carousel Logic
    ========================================== */
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-next');
    const prevButton = document.querySelector('.carousel-prev');
    const dotsNav = document.querySelector('.carousel-dots');

    let currentIndex = 0;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
        dotsNav.appendChild(dot);
    });

    const dots = Array.from(dotsNav.children);

    const updateCarousel = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = 20; // Matches CSS gap
        
        // Calculate how many slides are visible
        let visibleSlides = 1;
        if (window.innerWidth > 992) visibleSlides = 3;
        else if (window.innerWidth > 768) visibleSlides = 2;

        // Max index should prevent empty space at the end
        const maxIndex = slides.length - visibleSlides;
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        if (currentIndex < 0) currentIndex = 0;

        const amountToMove = currentIndex * (slideWidth + gap);
        track.style.transform = `translateX(-${amountToMove}px)`;

        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        // Hide/Show buttons
        prevButton.style.display = currentIndex === 0 ? 'none' : 'flex';
        nextButton.style.display = currentIndex >= maxIndex ? 'none' : 'flex';
    };

    nextButton.addEventListener('click', () => {
        currentIndex++;
        updateCarousel();
    });

    prevButton.addEventListener('click', () => {
        currentIndex--;
        updateCarousel();
    });

    // Initialize/Resize
    window.addEventListener('resize', updateCarousel);
    updateCarousel();

});
