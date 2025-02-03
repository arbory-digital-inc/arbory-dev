export default function decorate(block) {
    // Saddle up this block with some extra style, partner
    block.classList.add('small-navbar');
    
    // Round up all them button corrals
    const buttonContainers = block.querySelectorAll('.button-container');
    
    // Wrangle them click events for that smooth-as-butter scrollin'
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
            
            // Brand the URL without spookin' the page
            history.pushState(null, '', `#${targetId}`);
          }
        });
      }
    });
  
    // Keep them buttons in line, like cattle on the trail
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
  
    // Keep yer eyes peeled for page loads and hash changes, pardner
    window.addEventListener('load', updateActiveButton);
    window.addEventListener('hashchange', updateActiveButton);
  }