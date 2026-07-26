const form = document.getElementById('release-form');
const refreshButton = document.getElementById('refresh');
const list = document.getElementById('episode-list');
const statusEl = document.getElementById('release-status');
const apiBaseInput = document.getElementById('api-base');

function getApiBase() {
  return apiBaseInput.value.replace(/\/$/, '');
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.dataset.error = String(isError);
}

function renderEpisodes(episodes) {
  if (!episodes.length) {
    list.innerHTML = '<li class="episode-empty">No episodes found yet.</li>';
    return;
  }

  list.innerHTML = episodes
    .slice()
    .sort((a, b) => b.id - a.id)
    .map(
      (episode) => `
        <li class="episode-item">
          <div>
            <p class="episode-title">${escapeHtml(episode.title)}</p>
            <p class="episode-meta">#${episode.id} • ${episode.isPremium ? 'Premium' : 'Public'} • ${new Date(
        episode.publishedAt,
      ).toLocaleString()}</p>
            <p class="episode-description">${escapeHtml(episode.description)}</p>
          </div>
        </li>
      `,
    )
    .join('');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadEpisodes() {
  const response = await fetch(`${getApiBase()}/api/podcast/episodes`);
  if (!response.ok) {
    throw new Error('Failed to fetch episodes');
  }

  const payload = await response.json();
  renderEpisodes(payload.data || []);
}

async function publishEpisode(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const body = {
    title: String(formData.get('title') || '').trim(),
    description: String(formData.get('description') || '').trim(),
    isPremium: formData.get('isPremium') === 'on',
  };

  setStatus('Releasing episode...');

  try {
    const response = await fetch(`${getApiBase()}/api/podcast/episodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Release failed');
    }

    form.reset();
    setStatus(`Released: ${payload.data.title}`);
    await loadEpisodes();
  } catch (error) {
    setStatus(error.message, true);
  }
}

form.addEventListener('submit', publishEpisode);
refreshButton.addEventListener('click', async () => {
  setStatus('Refreshing episodes...');
  try {
    await loadEpisodes();
    setStatus('Episode list refreshed.');
  } catch (error) {
    setStatus(error.message, true);
  }
});

loadEpisodes().catch((error) => {
  setStatus(error.message, true);
  renderEpisodes([]);
});
