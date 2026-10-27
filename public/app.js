async function fetchConfig() {
  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    const json = await res.json();
    const detailsSection = document.getElementById('detailsSection');
    if (detailsSection) {
      if (json.showDetails) {
        detailsSection.style.display = 'flex';
      } else {
        detailsSection.style.display = 'none';
      }
    }
  } catch (e) {
    const detailsSection = document.getElementById('detailsSection');
    if (detailsSection) {
      detailsSection.style.display = 'none';
    }
  }
}

async function fetchStatus() {
  const statusBadge = document.getElementById('statusBadge');
  const serverNameEl = document.getElementById('serverName');
  const serverAddressEl = document.getElementById('serverAddress');
  const playersOnlineEl = document.getElementById('playersOnline');
  const playersMaxEl = document.getElementById('playersMax');
  const mapNameEl = document.getElementById('mapName');
  const passwordProtectedEl = document.getElementById('passwordProtected');
  const lastUpdateEl = document.getElementById('lastUpdate');
  const playersTableBody = document.getElementById('playersTableBody');
  const playerCountEl = document.getElementById('playerCount');
  const detailsGrid = document.getElementById('detailsGrid');
  const errorSection = document.getElementById('errorSection');
  const errorMessageEl = document.getElementById('errorMessage');

  try {
    const res = await fetch('/api/status', { cache: 'no-store' });
    const json = await res.json();

    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Unbekannter Fehler');
    }

    const data = json.data;

    errorSection.style.display = 'none';

    serverNameEl.textContent = data.name || 'Unbekannter Server';
    serverAddressEl.textContent = data.connect || (data.host ? `${data.host}:${data.port}` : '');

    statusBadge.textContent = 'Online';
    statusBadge.classList.remove('offline');
    statusBadge.classList.add('online');

    playersOnlineEl.textContent = data.players?.length ?? data.raw?.numplayers ?? 0;
    playersMaxEl.textContent = data.maxplayers ?? data.raw?.maxplayers ?? 0;

    mapNameEl.textContent = data.map || data.raw?.map || '-';

    if (typeof data.password !== 'undefined') {
      passwordProtectedEl.textContent = data.password ? 'Ja' : 'Nein';
    } else if (typeof data.raw?.password !== 'undefined') {
      passwordProtectedEl.textContent = data.raw.password ? 'Ja' : 'Nein';
    } else {
      passwordProtectedEl.textContent = '-';
    }

    const now = new Date();
    lastUpdateEl.textContent = now.toLocaleTimeString('de-DE');

    const players = Array.isArray(data.players) ? data.players : [];
    playerCountEl.textContent = `${players.length} ${players.length === 1 ? 'Spieler' : 'Spieler'}`;

    playersTableBody.innerHTML = '';
    if (players.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3;
      td.className = 'empty';
      td.textContent = 'Keine Spieler online';
      tr.appendChild(td);
      playersTableBody.appendChild(tr);
    } else {
      for (const p of players) {
        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        nameTd.textContent = p.name || '-';
        const timeTd = document.createElement('td');
        if (typeof p.time === 'number') {
          const mins = Math.floor(p.time / 60);
          const secs = Math.floor(p.time % 60);
          timeTd.textContent = `${mins}m ${secs}s`;
        } else {
          timeTd.textContent = '-';
        }
        const scoreTd = document.createElement('td');
        scoreTd.textContent = typeof p.score === 'number' ? p.score : '-';
        tr.appendChild(nameTd);
        tr.appendChild(timeTd);
        tr.appendChild(scoreTd);
        playersTableBody.appendChild(tr);
      }
    }

    detailsGrid.innerHTML = '';
    const entries = [];

    function addEntry(label, value) {
      if (value === undefined || value === null || value === '') return;
      if (typeof value === 'object') {
        try {
          entries.push({ label, value: JSON.stringify(value) });
        } catch (e) {
          entries.push({ label, value: String(value) });
        }
        return;
      }
      entries.push({ label, value: String(value) });
    }

    addEntry('Name', data.name);
    addEntry('Connect', data.connect);
    addEntry('Host', data.host);
    addEntry('Port', data.port);
    addEntry('Game', data.game);
    addEntry('Map', data.map);
    addEntry('Max Spieler', data.maxplayers);
    addEntry('Spieler online', data.players?.length);
    addEntry('Passwortgeschützt', typeof data.password === 'boolean' ? (data.password ? 'Ja' : 'Nein') : undefined);
    addEntry('Ping', data.ping);

    if (data.raw && typeof data.raw === 'object') {
      for (const [k, v] of Object.entries(data.raw)) {
        if (['numplayers', 'maxplayers', 'map', 'password'].includes(k)) continue;
        addEntry(k, v);
      }
    }

    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'detail-item';
      const label = document.createElement('span');
      label.className = 'detail-label';
      label.textContent = 'Keine Details';
      const value = document.createElement('span');
      value.className = 'detail-value';
      value.textContent = '-';
      empty.appendChild(label);
      empty.appendChild(value);
      detailsGrid.appendChild(empty);
    } else {
      for (const e of entries) {
        const item = document.createElement('div');
        item.className = 'detail-item';
        const label = document.createElement('span');
        label.className = 'detail-label';
        label.textContent = e.label;
        const value = document.createElement('span');
        value.className = 'detail-value';
        value.textContent = e.value;
        item.appendChild(label);
        item.appendChild(value);
        detailsGrid.appendChild(item);
      }
    }
  } catch (err) {
    errorSection.style.display = 'block';
    errorMessageEl.textContent = err.message || 'Server konnte nicht abgefragt werden';
    serverNameEl.textContent = 'Nicht erreichbar';
    serverAddressEl.textContent = '';
    statusBadge.textContent = 'Offline';
    statusBadge.classList.remove('online');
    statusBadge.classList.add('offline');
    playersOnlineEl.textContent = '0';
    playersMaxEl.textContent = '0';
    mapNameEl.textContent = '-';
    passwordProtectedEl.textContent = '-';
    lastUpdateEl.textContent = new Date().toLocaleTimeString('de-DE');
    playersTableBody.innerHTML = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.className = 'empty';
    td.textContent = 'Keine Daten verfügbar';
    tr.appendChild(td);
    playersTableBody.appendChild(tr);
    playerCountEl.textContent = '0 Spieler';
    detailsGrid.innerHTML = '';
  }
}

fetchConfig();
fetchStatus();
setInterval(fetchConfig, 60000);
setInterval(fetchStatus, 60000);
