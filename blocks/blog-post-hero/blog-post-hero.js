import { getMetadata } from '../../scripts/aem.js';

export default function decorate(block) {
  // Get the background image from the first picture element in the section
  const section = block.closest('.section');
  const backgroundPicture = section.querySelector('.default-content-wrapper picture');
  
  // Get metadata
  const title = getMetadata('og:title') || document.querySelector('h1')?.textContent || '';
  const category = getMetadata('category') || '';
  const tags = getMetadata('article:tag') || getMetadata('tags') || '';
  const author = getMetadata('author') || '';
  const publishDate = getMetadata('date') || getMetadata('article:date');
  const metaImage = getMetadata('image') || getMetadata('og:image') || '';
  
  // Debug logging
  console.log('Blog Hero Metadata:', {
    title,
    category,
    tags,
    author,
    publishDate,
    metaImage
  });
  
  // Clear the block content
  block.innerHTML = '';
  
  // Set background image if available
  if (backgroundPicture) {
    const bgImg = backgroundPicture.querySelector('img');
    if (bgImg) {
      section.style.backgroundImage = `url(${bgImg.src})`;
      section.style.backgroundSize = 'cover';
      section.style.backgroundPosition = 'center bottom'; // Start from bottom for upward parallax
      section.style.backgroundRepeat = 'no-repeat';
      
      // Add parallax effect for desktop only
      const isDesktop = window.matchMedia('(min-width: 900px)');
      
      function updateParallax() {
        if (isDesktop.matches) {
          const scrolled = window.pageYOffset;
          const rect = section.getBoundingClientRect();
          const speed = 0.5; // Parallax speed (0.5 = half speed)
          
          // Only apply parallax when section is in viewport
          if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
            const yPos = scrolled * speed; // Positive value moves background up when scrolling down
            section.style.backgroundPosition = `center calc(100% + ${yPos}px)`;
          }
        } else {
          // Reset to normal position on mobile
          section.style.backgroundPosition = 'center bottom';
        }
      }
      
      // Initial setup
      updateParallax();
      
      // Add scroll listener for parallax effect
      window.addEventListener('scroll', updateParallax, { passive: true });
      
      // Update on resize
      isDesktop.addEventListener('change', updateParallax);
    }
    // Hide the original picture element
    backgroundPicture.style.display = 'none';
  }
  
  // Create the main container
  const container = document.createElement('div');
  container.className = 'blog-post-hero-content';
  container.style.maxWidth = '100%';
  container.style.width = '100%';
  container.style.boxSizing = 'border-box';
  
  // Create image column (80% width)
  const imageCol = document.createElement('div');
  imageCol.className = 'hero-image-col';
  imageCol.style.maxWidth = '100%';
  imageCol.style.boxSizing = 'border-box';
  
  if (metaImage) {
    const img = document.createElement('img');
    img.src = metaImage;
    img.alt = title;
    img.loading = 'eager';
    img.style.maxWidth = '100%';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.boxSizing = 'border-box';
    imageCol.appendChild(img);
  }
  
  // Create content column
  const contentCol = document.createElement('div');
  contentCol.className = 'hero-content-col';
  contentCol.style.maxWidth = '100%';
  contentCol.style.boxSizing = 'border-box';
  
  // Add title
  if (title) {
    const titleEl = document.createElement('h1');
    titleEl.textContent = title;
    contentCol.appendChild(titleEl);
  }
  
  // Add date in place of category
  if (publishDate) {
    const dateEl = document.createElement('div');
    dateEl.className = 'hero-category'; // Use category styling for the date
    
    // Try to parse the date, with fallback for different formats
    let formattedDate;
    try {
      const date = new Date(publishDate);
      if (isNaN(date.getTime())) {
        // If date is invalid, just show the raw value
        formattedDate = publishDate;
      } else {
        formattedDate = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      formattedDate = publishDate;
    }
    
    dateEl.textContent = formattedDate;
    contentCol.appendChild(dateEl);
  }
  

  
  // Add author and date
  const metaInfo = document.createElement('div');
  metaInfo.className = 'hero-meta-info';
  
  if (author) {
    const authorEl = document.createElement('span');
    authorEl.className = 'hero-author';
    authorEl.textContent = `By ${author}`;
    metaInfo.appendChild(authorEl);
  }
  

  
  if (metaInfo.children.length > 0) {
    contentCol.appendChild(metaInfo);
  }
  
  // Add tags
  if (tags) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'hero-tags';
    const tagList = document.createElement('ul');
    
    tags.split(',').forEach(tag => {
      const tagItem = document.createElement('li');
      tagItem.textContent = tag.trim();
      tagList.appendChild(tagItem);
    });
    
    tagsContainer.appendChild(tagList);
    contentCol.appendChild(tagsContainer);
  }
  
  // Append columns to container
  container.appendChild(imageCol);
  container.appendChild(contentCol);
  
  // Append container to block
  block.appendChild(container);
  
  block.classList.add('initialized');
}