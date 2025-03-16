/* Wrote this while questioning my own existence - ur boy frank*/

export default function decorate(block) {
  
    // Add container class for font styling
  block.closest('.block').classList.add('clean-list-container');

  // Group items by their parent
  const rows = Array.from(block.children);
  let currentGroup = null;
  let currentLevel1 = null;
  let currentLevel2 = null;

  // Check for modifier row and apply grid column size
  const lastRow = rows[rows.length - 1];
  if (lastRow) {
    const cells = Array.from(lastRow.children);
    if (cells.length === 3) {
      const modifierType = cells[0].textContent.trim();
      const modifierName = cells[1].textContent.trim();
      const modifierValue = cells[2].textContent.trim();
      
      if (modifierType === 'modifier-row' && modifierName === 'grid-col-size') {
        block.style.setProperty('--clean-list-grid-cols', modifierValue);
        lastRow.remove();
      }
    }
  }

  rows.forEach((row, index) => {
    const levelDiv = row.querySelector('div:first-child');
    const level = parseInt(levelDiv.textContent.trim(), 10);

    if (level === 1) {
      // Create new group for level 1 items
      currentGroup = document.createElement('div');
      currentGroup.className = 'clean-list-group';
      currentLevel1 = row.cloneNode(true);
      currentLevel1.classList.add('main-item');
      currentLevel2 = null;
      
      // Convert links in level 1 items
      const linkDiv = currentLevel1.querySelector('div:last-child');
      const linkP = linkDiv.querySelector('p');
      if (linkP) {
        const h4 = document.createElement('h4');
        h4.innerHTML = linkP.innerHTML;
        // Remove any button classes from links
        const link = h4.querySelector('a');
        if (link) {
          link.className = '';
          currentLevel1.classList.add('has-link');
        }
        linkP.replaceWith(h4);
      }
      
      currentGroup.appendChild(currentLevel1);
      block.appendChild(currentGroup);
      row.remove();
    } else if (level === 2) {
      // Create new group if there's no current group
      if (!currentGroup) {
        currentGroup = document.createElement('div');
        currentGroup.className = 'clean-list-group';
        block.appendChild(currentGroup);
      }
      
      // Add level 2 items to current group
      currentLevel2 = row.cloneNode(true);
      currentLevel2.classList.add('sub-item');
      
      // Convert title to h5 and link to h6
      const titleDiv = currentLevel2.querySelector('div:nth-child(2)');
      const linkDiv = currentLevel2.querySelector('div:last-child');
      
      const h5 = document.createElement('h5');
      const titleP = titleDiv.querySelector('p');
      h5.textContent = titleP ? titleP.textContent : '';
      titleDiv.innerHTML = '';
      titleDiv.appendChild(h5);

      if (linkDiv) {
        const linkP = linkDiv.querySelector('p');
        if (linkP) {
          const h6 = document.createElement('h6');
          h6.innerHTML = linkP.innerHTML;
          // Remove any button classes from links
          const link = h6.querySelector('a');
          if (link) {
            link.className = '';
            currentLevel2.classList.add('has-link');
          }
          linkP.replaceWith(h6);
        }
      }
      
      currentGroup.appendChild(currentLevel2);
      row.remove();
    } else if (level === 3) {
      // Create new group if there's no current group
      if (!currentGroup) {
        currentGroup = document.createElement('div');
        currentGroup.className = 'clean-list-group';
        block.appendChild(currentGroup);
      }

      // Add level 3 items as sub-items
      const subItem = row.cloneNode(true);
      subItem.classList.add('sub-sub-item');
      
      // Convert title to h5 if exists
      const titleDiv = subItem.querySelector('div:nth-child(2)');
      if (titleDiv) {
        const titleP = titleDiv.querySelector('p');
        if (titleP) {
          const h5 = document.createElement('h5');
          h5.textContent = titleP.textContent;
          titleDiv.innerHTML = '';
          titleDiv.appendChild(h5);
        }
      }

      // Handle link in the last div
      const linkDiv = subItem.querySelector('div:last-child');
      if (linkDiv) {
        const linkP = linkDiv.querySelector('p');
        if (linkP) {
          const link = linkP.querySelector('a');
          if (link) {
            link.className = '';
            subItem.classList.add('has-link');
            const h6 = document.createElement('h6');
            h6.appendChild(link);
            linkDiv.innerHTML = '';
            linkDiv.appendChild(h6);
          }
        }
      }
      
      currentGroup.appendChild(subItem);
      row.remove();
    }
  });

  // Clean up empty groups
  block.querySelectorAll('.clean-list-group').forEach(group => {
    if (!group.children.length) {
      group.remove();
    }
  });

  // Add the clean-list class to the block
  block.classList.add('clean-list');
}