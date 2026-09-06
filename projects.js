const SUPABASE_URL = 'https://lvttdqpoxisaxmkemnxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9JpMpefCd_AtBmMWoWOt6Q_5Ze4INXT';

const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchAllProjects() {
    const container = document.getElementById('all-projects-grid');
    if (!container) return;

    container.innerHTML = `<p style="color:#a1a1aa; font-size:1rem;">Loading projects... ⏳</p>`;

    try {
        const { data: projects, error } = await _supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!projects || projects.length === 0) {
            container.innerHTML = `<p style="color:#a1a1aa;">No projects found at the moment.</p>`;
            return;
        }

        container.innerHTML = projects.map(project => {
            let tagsList = [];
            if (project.tech_stack && typeof project.tech_stack === 'string') {
                tagsList = project.tech_stack.split(',').map(t => t.trim());
            }

            // الزر الرئيسي يوجه لرابط GitHub مباشرة
            const githubLink = project.github_url;

            return `
                <div class="project-card">
                    ${project.image_url ? `
                        <div class="project-image-wrapper">
                            <img src="${project.image_url}" alt="${project.title}" loading="lazy">
                        </div>
                    ` : ''}
                    <div class="project-content" style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
                        <div>
                            <h3 style="color:#fff; font-size:1.2rem; margin-bottom: 0.5rem; text-transform: capitalize;">${project.title}</h3>
                            <p style="color:#a1a1aa; font-size:0.875rem; line-height:1.5;">${project.description || ''}</p>
                            <div class="project-tags" style="margin-top: 0.8rem;">
                                ${tagsList.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:1.5rem; gap:0.5rem;">
                            ${githubLink ? `
                                <a href="${githubLink}" target="_blank" class="view-project-btn" style="padding:0.5rem 1rem; background-color:#8b5cf6; color:#fff; border-radius:6px; font-size:0.85rem; font-weight:500; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
                                    View Project ↗
                                </a>
                            ` : ''}
                            
                            ${project.demo_url ? `
                                <a href="${project.demo_url}" target="_blank" style="color:#a1a1aa; font-size:0.85rem; text-decoration:none;">Live Demo 🌐</a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Supabase Error:', err);
        container.innerHTML = `<p style="color:#ef4444;">Failed to load projects: ${err.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchAllProjects);