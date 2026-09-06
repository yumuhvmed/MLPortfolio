// Cursor Glow Effect
const glow = document.getElementById('cursor-glow');
if (glow) {
    window.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

// 1. Language Toggle & Translation Logic
let currentLang = localStorage.getItem('site_lang') || 'en';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('site_lang', lang);

    const isRtl = lang === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isRtl);

    const langText = document.getElementById('lang-text');
    if (langText) {
        langText.textContent = isRtl ? 'English' : 'العربية';
    }

    if (typeof translations !== 'undefined') {
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
    }
}

function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    applyLanguage(newLang);
}

// 2. Scroll Reveal Animations Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

function initScrollReveal() {
    const animatedElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-bottom, .timeline-item, .info-card');
    animatedElements.forEach(el => revealObserver.observe(el));
}

// 3. Supabase Integration (Featured Projects)
const SUPABASE_URL = 'https://lvttdqpoxisaxmkemnxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9JpMpefCd_AtBmMWoWOt6Q_5Ze4INXT';

const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadFeaturedProjects() {
    const container = document.getElementById('featured-projects-grid');
    if (!container) return;

    try {
        const { data: projects, error } = await _supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(4);

        if (error) throw error;

        if (!projects || projects.length === 0) {
            container.innerHTML = `<p style="color:#a1a1aa;">No projects found.</p>`;
            return;
        }

        container.innerHTML = projects.map(project => {
            let tagsList = [];
            if (project.tech_stack && typeof project.tech_stack === 'string') {
                tagsList = project.tech_stack.split(',').map(t => t.trim());
            }

            return `
                <div class="project-card">
                    ${project.image_url ? `
                        <div class="project-image-wrapper">
                            <img src="${project.image_url}" alt="${project.title}" loading="lazy">
                        </div>
                    ` : ''}

                    <div class="project-content">
                        <div>
                            <h3 style="color:#fff; font-size:1.25rem; margin-bottom: 0.4rem; text-transform: capitalize;">${project.title}</h3>
                            <p style="color:#a1a1aa; font-size:0.875rem; line-height:1.5;">${project.description || ''}</p>
                            
                            <div class="project-tags">
                                ${tagsList.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div style="margin-top: 1.25rem;">
                            ${project.github_url ? `
                                <a href="${project.github_url}" target="_blank" class="view-code-btn">
                                    View Code
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Error fetching projects:', err);
    }
}

// 4. Contact Form Handler (Formspree)
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            submitBtn.disabled = true;
            submitBtn.innerText = currentLang === 'ar' ? 'جاري الإرسال... ⏳' : 'Sending... ⏳';
            
            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    formStatus.style.display = 'block';
                    formStatus.style.color = '#10b981';
                    formStatus.innerText = currentLang === 'ar' ? 'تم إرسال الرسالة بنجاح! ✅' : '✅ Message sent successfully!';
                    contactForm.reset();
                } else {
                    throw new Error('Response error');
                }
            } catch (error) {
                formStatus.style.display = 'block';
                formStatus.style.color = '#ef4444';
                formStatus.innerText = currentLang === 'ar' ? 'حدث خطأ، حاول مرة أخرى ❌' : '❌ Something went wrong.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = translations[currentLang]["form-btn"] || 'Send Message 🚀';
            }
        });
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
    initScrollReveal();
    loadFeaturedProjects();
    initContactForm();
});