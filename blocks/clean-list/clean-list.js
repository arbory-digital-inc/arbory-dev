/* birthed from the void by ya boy frank */

export default function decorate(block) {
  // Add container class for font styling
  block.closest('.block').classList.add('clean-list-container');

  // Group items by their parent
  const rows = Array.from(block.children);
  let currentGroup = null;
  let currentLevel1 = null;

  rows.forEach((row, index) => {
    const levelDiv = row.querySelector('div:first-child');
    const level = parseInt(levelDiv.textContent.trim(), 10);

    if (level === 1) {
      // Create new group for level 1 items
      currentGroup = document.createElement('div');
      currentGroup.className = 'clean-list-group';
      currentLevel1 = row.cloneNode(true);
      currentLevel1.classList.add('main-item');
      
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
        }
        linkP.replaceWith(h4);
      }
      
      currentGroup.appendChild(currentLevel1);
      row.replaceWith(currentGroup);
    } else if (level > 1 && currentLevel1) {
      // Add level 2+ items to current group
      const subItem = row.cloneNode(true);
      subItem.classList.add('sub-item');
      
      // Convert title to h5 and link to h6
      const titleDiv = subItem.querySelector('div:nth-child(2)');
      const linkDiv = subItem.querySelector('div:last-child');
      
      const h5 = document.createElement('h5');
      h5.textContent = titleDiv.querySelector('p').textContent;
      titleDiv.innerHTML = '';
      titleDiv.appendChild(h5);

      const h6 = document.createElement('h6');
      h6.innerHTML = linkDiv.querySelector('p').innerHTML;
      // Remove any button classes from links
      const link = h6.querySelector('a');
      if (link) {
        link.className = '';
      }
      linkDiv.querySelector('p').replaceWith(h6);
      
      currentGroup.appendChild(subItem);
      row.remove();
    }
  });

  // Add the clean-list class to the block
  block.classList.add('clean-list');
}