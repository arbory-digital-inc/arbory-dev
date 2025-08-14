export default async function decorate(block) {
  const fragmentName = block.textContent.trim();
  
  if (!fragmentName.startsWith('author-fragment-')) {
    console.warn(`Author block: Invalid fragment name "${fragmentName}"`);
    return;
  }

  // Build the relative path to /authors/<fragmentName>
  const fragmentPath = `/authors/${fragmentName}`;

  try {
    // Fetch published HTML of the fragment
    const resp = await fetch(fragmentPath);
    if (!resp.ok) {
      console.error(`Failed to fetch fragment at ${fragmentPath}`);
      return;
    }

    const html = await resp.text();

    // Create a container to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Grab the main content (or a specific element like author-rows)
    const mainContent = temp.querySelector('main') || temp;

    // Replace the block's content with the fragment's content
    block.innerHTML = mainContent.innerHTML;

  } catch (err) {
    console.error('Error loading author fragment:', err);
  }
}
