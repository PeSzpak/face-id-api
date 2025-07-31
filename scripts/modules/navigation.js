// Navigation and theme management
export class NavigationManager {
    constructor() {
        this.setupNavigation();
        this.setupTheme();
    }

    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu li');
        const sections = document.querySelectorAll('.content-section');

        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetSection = item.getAttribute('data-section');
                
                // Remove active class from all items and sections
                menuItems.forEach(mi => mi.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked item and target section
                item.classList.add('active');
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.classList.add('active');
                    
                    // Trigger section load event
                    window.dispatchEvent(new CustomEvent('sectionChanged', {
                        detail: { section: targetSection }
                    }));
                }
            });
        });
    }

    setupTheme() {
        const themeSwitcher = document.querySelector('.theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                document.body.classList.toggle('light-mode');
            });
        }
    }

    showSection(sectionName) {
        const targetItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetItem) {
            targetItem.click();
        }
    }
}