document.addEventListener('DOMContentLoaded', function() {

    // --- Password & Page Check ---
    const ADMIN_PASSWORD = "TierSecretPW2004";
    const pageUrl = window.location.pathname;
    let pageName = pageUrl.substring(pageUrl.lastIndexOf('/') + 1);
    if (pageName === '' || pageName === 'index.html') { pageName = 'index.html'; }
    else if (pageName === 'about.html') { pageName = 'about.html'; }
    else if (pageName === 'admin-login.html') { pageName = 'admin-login.html'; }
    else if (pageName === 'admin-upload.html') { pageName = 'admin-upload.html'; }
    else if (pageName === 'gallery.html') { pageName = 'gallery.html'; }
    else if (pageName === 'story.html') { pageName = 'story.html'; }
    console.log("Current page:", pageName);
  
    // --- Navigation Highlighting ---
    try {
        const navLinks = document.querySelectorAll('header nav ul li a');
        navLinks.forEach(link => { const linkHref = link.getAttribute('href'); link.classList.remove('active'); if (linkHref === pageName) { link.classList.add('active'); } });
        if (pageName === 'story.html') { const galleryLink = document.querySelector('header nav ul li a[href="gallery.html"]'); if (galleryLink) { galleryLink.classList.add('active'); } }
    } catch (error) { console.error("Error processing navigation links:", error); }
  
    // --- Function to Load Stories from JSON ---
    async function loadStories() {
        try { const response = await fetch('stories.json'); if (!response.ok) { throw new Error(`HTTP error! status: ${response.status} (${response.statusText}) loading stories.json`); } const stories = await response.json(); if (!Array.isArray(stories)) { throw new Error("Data loaded from stories.json is not an array."); } return stories; }
        catch (error) { console.error("[loadStories] Could not load or parse stories:", error); const displayArea = document.getElementById('gallery-container') || document.getElementById('story-details') || document.querySelector('main'); if(displayArea) displayArea.innerHTML = `<p style="text-align: center; color: #f88;">Error: Could not load stories.<br>(${error.message})</p>`; return []; }
    }
  
    // --- Admin Login / Upload Logic ---
    if (pageName === 'admin-login.html') { /* ... */ }
    else if (pageName === 'admin-upload.html') { console.log("On admin upload page."); }
  
    // --- Gallery Logic (Restored Link and Item Name) ---
    else if (pageName === 'gallery.html') {
      const galleryContainer = document.getElementById('gallery-container');
      async function displayGallery() {
          if (!galleryContainer) { console.error("Gallery container not found"); return; }
          const stories = await loadStories();
          if (!Array.isArray(stories)) { console.error("loadStories did not return an array for gallery."); return; }
          const imageStories = stories.filter(story => story.imagePath && story.id);
          if (imageStories.length === 0) { galleryContainer.innerHTML = '<p style="text-align: center; color: #ccc;">The archive is empty.</p>'; }
          else {
              galleryContainer.innerHTML = ''; const fragment = document.createDocumentFragment();
              imageStories.forEach(story => {
                  // *** Create a link (<a>) ***
                  const link = document.createElement('a');
                  link.className = 'gallery-item';
                  link.href = `story.html?id=${story.id}`; // Set link destination
  
                  const img = document.createElement('img');
                  img.src = story.imagePath;
                  img.alt = story.itemName || `Story by ${story.author || 'Unknown'}`;
                  img.loading = 'lazy';
                  img.onerror = () => { console.error(`Failed to load image: ${story.imagePath} for story ID ${story.id}`); link.innerHTML = '<p class="gallery-item-title" style="color:#f88;">Image not found</p>'; link.style.aspectRatio = '1 / 1'; link.style.display = 'flex'; link.style.alignItems = 'center'; link.style.justifyContent = 'center'; };
                  link.appendChild(img); // Append img to link
  
                  // Create and append item name paragraph
                  const titleP = document.createElement('p');
                  titleP.className = 'gallery-item-title';
                  titleP.textContent = story.itemName || "Untitled Object"; // Use itemName field
                  link.appendChild(titleP); // Append title to link
  
                  fragment.appendChild(link); // Append link to fragment
              });
              galleryContainer.appendChild(fragment); console.log("Rendered gallery items as links.");
          }
      }
      displayGallery();
    }
  
    // --- Story Page Logic ---
    else if (pageName === 'story.html') {
      // ...(Corrected story logic)...
          console.log("[Story Page] Starting logic...");
          async function displayStory() {
              console.log("[Story Page] Inside displayStory function");
              const mainContentArea = document.querySelector('main');
              const img = document.getElementById('story-image'); const contentP = document.getElementById('story-content'); const authorSmall = document.getElementById('story-author'); const memoryDateContainer = document.getElementById('story-memory-date-container'); const memoryDateSpan = document.getElementById('memory-date-value'); const prevLink = document.getElementById('prev-story-link'); const nextLink = document.getElementById('next-story-link');
              if (!img || !contentP || !authorSmall || !memoryDateContainer || !memoryDateSpan || !prevLink || !nextLink || !mainContentArea) { console.error("[Story Page] Could not find one or more essential HTML elements!"); if (mainContentArea) mainContentArea.innerHTML = '<p style="color: #f88; text-align: center;">Error: Page display elements missing.</p>'; return; }
              console.log("[Story Page] Essential elements found.");
              const urlParams = new URLSearchParams(window.location.search); const storyId = urlParams.get('id');
              if (!storyId) { contentP.textContent = 'No story ID provided.'; return; }
              const stories = await loadStories();
              if (!Array.isArray(stories)) { contentP.textContent = 'Error loading stories data.'; return; }
              if (stories.length === 0 && contentP) { if (!contentP.textContent.startsWith('Error')) { contentP.textContent = 'No stories found in archive.'; } return; }
              const imageStories = stories.filter(s => s.imagePath && s.id); const currentIndex = imageStories.findIndex(s => s.id === storyId);
              if (currentIndex !== -1) {
                  const story = imageStories[currentIndex];
                  console.log("[Story Page] Found story data:", story);
                  try {
                      console.log("[Story Page] Attempting to populate elements...");
                      if (story.imagePath) { img.src = story.imagePath; img.alt = `Story by ${story.author}`; img.style.display='block'; } else { img.style.display = 'none'; }
                      contentP.textContent = story.content;
                      authorSmall.textContent = `- ${story.author || 'Anonymous'}`;
                      if (story.memoryDate) { memoryDateContainer.style.display = 'block'; try { const dateParts = story.memoryDate.split('-'); const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2])); memoryDateSpan.textContent = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); } catch (e) { memoryDateSpan.textContent = story.memoryDate; } } else { memoryDateContainer.style.display = 'none'; }
                      console.log("[Story Page] Elements populated.");
                  } catch(populateError) { console.error("[Story Page] Error during element population:", populateError); contentP.textContent = 'Error displaying story content.'; return; }
                  try {
                      console.log("[Story Page] Setting up next/prev links...");
                      if (currentIndex > 0) { const prevStory = imageStories[currentIndex - 1]; prevLink.href = `story.html?id=${prevStory.id}`; prevLink.style.visibility = 'visible'; } else { prevLink.style.visibility = 'hidden'; }
                      if (currentIndex < imageStories.length - 1) { const nextStory = imageStories[currentIndex + 1]; nextLink.href = `story.html?id=${nextStory.id}`; nextLink.style.visibility = 'visible'; } else { nextLink.style.visibility = 'hidden'; }
                       console.log("[Story Page] Next/prev links updated.");
                  } catch(navError) { console.error("[Story Page] Error updating nav links:", navError); }
              } else { console.log("[Story Page] Story with ID not found in filtered list."); contentP.textContent = 'Story not found.'; if(prevLink) prevLink.style.visibility = 'hidden'; if(nextLink) nextLink.style.visibility = 'hidden'; }
          }
          displayStory();
    } // End of story.html logic
  
  
    // --- Loader Logic ---
    const loaderWrapper = document.getElementById('loader-wrapper');
    const loaderBar = document.querySelector('.loader-bar');
    const loaderShown = sessionStorage.getItem('loaderShownThisSession');
    if (!loaderShown && loaderWrapper && loaderBar) { loaderBar.addEventListener('animationend', () => { loaderWrapper.classList.add('loaded'); sessionStorage.setItem('loaderShownThisSession', 'true'); setTimeout(() => { if (loaderWrapper.parentNode) { loaderWrapper.parentNode.removeChild(loaderWrapper); } }, 700); }, { once: true }); } else if (loaderWrapper) { loaderWrapper.style.transition = 'none'; loaderWrapper.style.opacity = '0'; loaderWrapper.style.display = 'none'; setTimeout(() => { if(loaderWrapper.parentNode) { loaderWrapper.parentNode.removeChild(loaderWrapper); } }, 50); }
  
    }

  ); // End DOMContentLoaded
