export default function decorate(block) {
    // Add any additional classes to the block
    block.classList.add('small-navbar');
    
    // Get all button containers
    const buttonContainers = block.querySelectorAll('.button-container');
    
    // Add click event listeners for smooth scrolling
    buttonContainers.forEach(container => {
      const button = container.querySelector('a.button');
      if (button && button.getAttribute('href').startsWith('#')) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = button.getAttribute('href').slice(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            
            // Update URL without scrolling
            history.pushState(null, '', `#${targetId}`);
          }
        });
      }
    });
  
    // Handle active states
    function updateActiveButton() {
      const hash = window.location.hash;
      buttonContainers.forEach(container => {
        const button = container.querySelector('a.button');
        if (button) {
          if (button.getAttribute('href') === hash) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        }
      });
    }
  
    // Update active state on page load and hash change
    window.addEventListener('load', updateActiveButton);
    window.addEventListener('hashchange', updateActiveButton);
  }