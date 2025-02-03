// Last updated: whenever I felt like it 

export default function decorate(block) {
    const CARDS_PER_LOAD = 2;
    const CARDS_PER_CLICK = 2; // fr fr how many we sendin
    let visibleCards = 0;
    const allRows = [...block.children];
    
    // main character energy
    function showCards(startIndex, count) {
      const endIndex = Math.min(startIndex + count, allRows.length);
      const rowsToShow = allRows.slice(startIndex, endIndex);
      
      rowsToShow.forEach(row => {
        const [imageCol, contentCol] = row.children;
        const link = contentCol.querySelector('a');
        const href = link?.href;
        
        if (href) {
          const cardLink = document.createElement('a');
          cardLink.href = href;
          cardLink.className = 'article-card';

          const imgWrapper = document.createElement('div');
          imgWrapper.className = 'article-card-image';
          imgWrapper.append(...imageCol.children);
          
          const content = document.createElement('div');
          content.className = 'article-card-content';
          const heading = contentCol.querySelector('h1, h2, h3, h4, h5, h6');
          const description = contentCol.querySelector('p');
          
          if (heading) {
            const headingText = heading.textContent;
            heading.textContent = headingText;
          }
          
          content.append(heading, description);
          cardLink.append(imgWrapper, content);
          row.textContent = '';
          row.append(cardLink);
          row.style.display = 'block';
        }
      });
      
      return endIndex;
    }

    allRows.forEach(row => {
      row.style.display = 'none';
    });
    
    visibleCards = showCards(0, CARDS_PER_LOAD);
    
    // when the squad asks for more content
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'load-more-wrapper';
    
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-button';
    loadMoreBtn.textContent = 'Load More Articles 🗎';
    
    loadMoreBtn.addEventListener('click', () => {
      visibleCards = showCards(visibleCards, CARDS_PER_CLICK);

      if (visibleCards >= allRows.length) {
        buttonWrapper.style.display = 'none';
      }
    });
    
    // pop off only if we got that new new
    if (visibleCards < allRows.length) {
      buttonWrapper.append(loadMoreBtn);
      block.append(buttonWrapper);
    }
    
    block.className = 'article-cards';
  }