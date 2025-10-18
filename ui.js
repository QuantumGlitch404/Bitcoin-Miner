// UI Animations and Interactions
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mining data from localStorage
    initializeMiningData();
    
    // Initialize mining particles
    initializeMiningParticles();

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            mainNav.classList.toggle('active');
            mobileMenuToggle.innerHTML = mainNav.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
            
            // Prevent body scrolling when menu is open
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                mainNav.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mainNav.classList.contains('active') && 
            !mainNav.contains(e.target) && 
            e.target !== mobileMenuToggle && 
            !mobileMenuToggle.contains(e.target)) {
            mainNav.classList.remove('active');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = '';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effects to stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = 'var(--box-shadow-hover)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'var(--box-shadow)';
        });
    });

    // Animate activity items
    const activityList = document.getElementById('activityList');
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('activity-item')) {
                        setTimeout(() => {
                            node.style.opacity = '1';
                            node.style.transform = 'translateY(0)';
                        }, 50);
                    }
                });
            }
        });
    });

    observer.observe(activityList, { childList: true });

    // Responsive navigation
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Add mining animation styles
    const style = document.createElement('style');
    style.textContent = `
        .mining-particles {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .particle {
            position: absolute;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            opacity: 0.6;
            animation: float 3s infinite ease-in-out;
        }

        .activity-item {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        }

        .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: var(--warning-color);
            transition: background-color 0.3s ease;
        }

        .status-dot.mining {
            background-color: var(--success-color);
            animation: pulse 1.5s infinite;
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0) scale(1);
            }
            50% {
                transform: translateY(-20px) scale(1.1);
            }
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.2);
                opacity: 0.8;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});

// Initialize mining particles
function initializeMiningParticles() {
    const container = document.querySelector('.mining-particles');
    if (!container) return;

    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position and size
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 3}s`;
        
        container.appendChild(particle);
    }
}

// Update mining visualization
function updateMiningVisualization(hashRate) {
    const container = document.querySelector('.mining-particles');
    if (!container) return;

    // Update particle colors based on hash rate
    const particles = container.querySelectorAll('.particle');
    particles.forEach(particle => {
        const intensity = Math.min(hashRate / 10, 1);
        particle.style.opacity = 0.3 + (intensity * 0.4);
        particle.style.animationDuration = `${3 - (intensity * 1.5)}s`;
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    const miningVisualization = document.querySelector('.mining-visualization');
    if (miningVisualization) {
        const height = Math.min(window.innerHeight * 0.3, 200);
        miningVisualization.style.height = `${height}px`;
    }
});