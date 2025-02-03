// Last updated: 3-15-44BC

export default function decorate(block) {
    if (!block || !block.children || !block.children.length) {
      console.warn('No content found in arbory-news block');
      return;
    }
  
    // Hark! We shall create a wrapper for our noble contents
    const wrapper = document.createElement('div');
    wrapper.className = 'news-grid';
    
    // Verily, we must transform yon HTMLCollection into an Array most traversable
    Array.from(block.children).forEach((row) => {
      // Forsooth! We must verify the presence of both columns
      if (!row.children || row.children.length < 2) return;
  
      const card = document.createElement('a');
      const imgCol = row.children[0];
      const contentCol = row.children[1];
      
      // Pray tell, let us acquire the details of yonder link
      const link = contentCol.querySelector('a');
      if (!link) return;
      card.href = link.href;
      
      // Lo! We shall forge a vessel for thine image
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'card-image';
      const img = imgCol.querySelector('img');
      if (img) {
        imgWrapper.appendChild(img.cloneNode(true));
      }
      
      // Henceforth, we shall create a wrapper for thy content 
      const content = document.createElement('div');
      content.className = 'card-content';
      
      const title = document.createElement('h3');
      title.textContent = link.textContent;
      
      const desc = document.createElement('p');
      const paragraph = contentCol.querySelector('p');
      if (paragraph) {
        desc.textContent = paragraph.textContent;
      }
      
      content.appendChild(title);
      content.appendChild(desc);
      
      // By the gods! Let us assemble this noble card
      card.className = 'news-card';
      card.appendChild(imgWrapper);
      card.appendChild(content);
      
      wrapper.appendChild(card);
    });
  
    // Behold! We shall replace the contents of yonder block
    block.textContent = '';
    block.appendChild(wrapper);
  }