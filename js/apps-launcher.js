/* ============================================================
   AURA NEXT GEN: QUICK APPS LAUNCHER & DEEP LINKING
   ============================================================ */
/* ============================================================
   AURA NEXT GEN: AUTO BUKA APLIKASI & QUICK APPS LAUNCHER
   ============================================================ */

function getAppSvgIcon(iconType, size = 20) {
  switch (iconType) {
    case 'netflix':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#E50914"><path d="M4 2h4.5l5.5 13.5V2H18v20h-4.5L8 8.5V22H4V2z"/></svg>`;
    case 'youtube':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case 'spotify':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`;
    case 'maps':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>`;
    case 'google':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#EA4335" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
    case 'whatsapp':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#25D366"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>`;
    case 'chatgpt':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#10A37F" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>`;
    case 'claude':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#D97706"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-5h2zm0-7h-2V7h2z"/></svg>`;
    case 'github':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;
    case 'wikipedia':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M7 8l3 8 2-5 2 5 3-8"/></svg>`;
    case 'instagram':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
    case 'canva':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#00C4CC" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0"/></svg>`;
    case 'shopee':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#EE4D2D" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
    case 'tokopedia':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#03AC0E" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/></svg>`;
    case 'acc':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`;
    case 'gallery':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
  }
}

function deteksiIntentAplikasi(rawTeks) {
  if (!rawTeks) return null;
  const teks = rawTeks.trim();
  const lower = teks.toLowerCase();

  function bersihkanQuery(str, stops = []) {
    let res = str.trim();
    for (const stop of stops) {
      const reg = new RegExp(`\\b${stop}\\b`, 'gi');
      res = res.replace(reg, ' ');
    }
    return res.replace(/\s+/g, ' ').trim();
  }

  // 1. NETFLIX
  if (lower.includes('netflix') || /^(?:cari(?:kan)?|nonton)\s+film\b/i.test(lower)) {
    let query = '';
    const m = lower.match(/(?:cari(?:kan)?|nonton|putar)\s+(?:film|movie)?\s*(.+?)(?:\s+di\s+netflix)?$/i)
           || lower.match(/netflix(?:\s+cari|\s+nonton)?\s+(.+)$/i);
    if (m && m[1]) {
      query = bersihkanQuery(m[1], ['di netflix', 'netflix', 'film', 'movie', 'carikan', 'cari', 'nonton']);
    }
    const targetUrl = query ? `https://www.netflix.com/search?q=${encodeURIComponent(query)}` : 'https://www.netflix.com';
    return {
      appName: 'Netflix',
      icon: 'netflix',
      badge: 'Streaming Film',
      color: '#E50914',
      bgGradient: 'linear-gradient(135deg, rgba(229, 9, 20, 0.22), rgba(20, 20, 20, 0.6))',
      query: query || 'Beranda',
      targetUrl,
      voiceMsg: query ? `Membuka Netflix untuk mencari film ${query}.` : 'Membuka aplikasi Netflix untukmu.'
    };
  }

  // 2. YOUTUBE
  if (lower.includes('youtube') || /^(?:putar|tonton)\s+(?:video|lagu|musik)\s+di\s+youtube/i.test(lower)) {
    let query = '';
    const m = lower.match(/(?:putar|tonton|cari(?:kan)?)\s+(?:video|lagu|musik)?\s*(.+?)(?:\s+di\s+youtube)?$/i)
           || lower.match(/youtube(?:\s+cari)?\s+(.+)$/i);
    if (m && m[1]) {
      query = bersihkanQuery(m[1], ['di youtube', 'youtube', 'video', 'lagu', 'musik', 'putar', 'tonton', 'cari', 'carikan']);
    }
    const targetUrl = query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` : 'https://www.youtube.com';
    return {
      appName: 'YouTube',
      icon: 'youtube',
      badge: 'Video & Musik',
      color: '#FF0000',
      bgGradient: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(20, 20, 20, 0.6))',
      query: query || 'Beranda',
      targetUrl,
      voiceMsg: query ? `Membuka YouTube untuk memutar ${query}.` : 'Membuka YouTube.'
    };
  }

  // 3. SPOTIFY
  if (lower.includes('spotify') || /^(?:putar|dengarkan)\s+(?:lagu|musik)\s+di\s+spotify/i.test(lower)) {
    let query = '';
    const m = lower.match(/(?:putar|dengarkan|cari(?:kan)?)\s+(?:lagu|musik)?\s*(.+?)(?:\s+di\s+spotify)?$/i)
           || lower.match(/spotify(?:\s+cari)?\s+(.+)$/i);
    if (m && m[1]) {
      query = bersihkanQuery(m[1], ['di spotify', 'spotify', 'lagu', 'musik', 'putar', 'dengarkan', 'cari']);
    }
    const targetUrl = query ? `https://open.spotify.com/search/${encodeURIComponent(query)}` : 'https://open.spotify.com';
    return {
      appName: 'Spotify',
      icon: 'spotify',
      badge: 'Music Streaming',
      color: '#1DB954',
      bgGradient: 'linear-gradient(135deg, rgba(29, 185, 84, 0.2), rgba(20, 20, 20, 0.6))',
      query: query || 'Beranda',
      targetUrl,
      voiceMsg: query ? `Membuka Spotify untuk mencari lagu ${query}.` : 'Membuka Spotify.'
    };
  }

  // 4. GOOGLE MAPS
  if (lower.includes('maps') || lower.includes('peta') || /rute\s+ke\s+/i.test(lower) || /lokasi\s+.+\s+di\s+maps/i.test(lower)) {
    let query = '';
    const m = lower.match(/(?:rute\s+ke|lokasi|peta|cari)\s+(.+?)(?:\s+di\s+maps)?$/i)
           || lower.match(/maps(?:\s+cari)?\s+(.+)$/i);
    if (m && m[1]) {
      query = bersihkanQuery(m[1], ['di maps', 'maps', 'google maps', 'peta', 'rute ke', 'rute', 'lokasi']);
    }
    const targetUrl = query ? `https://www.google.com/maps/search/${encodeURIComponent(query)}` : 'https://www.google.com/maps';
    return {
      appName: 'Google Maps',
      icon: 'maps',
      badge: 'Peta & Navigasi',
      color: '#4285F4',
      bgGradient: 'linear-gradient(135deg, rgba(66, 133, 244, 0.22), rgba(20, 20, 20, 0.6))',
      query: query || 'Peta Dunia',
      targetUrl,
      voiceMsg: query ? `Membuka Google Maps untuk mencari lokasi ${query}.` : 'Membuka Google Maps.'
    };
  }

  // 5. GOOGLE SEARCH
  if (lower.startsWith('googling ') || lower.includes('di google') || /^(?:buka\s+google|cari\s+.+\s+di\s+google)/i.test(lower)) {
    let query = '';
    const m = lower.match(/(?:googling|cari(?:kan)?)\s+(.+?)(?:\s+di\s+google)?$/i)
           || lower.match(/google(?:\s+cari)?\s+(.+)$/i);
    if (m && m[1]) {
      query = bersihkanQuery(m[1], ['di google', 'google', 'googling', 'carikan', 'cari']);
    }
    const targetUrl = query ? `https://www.google.com/search?q=${encodeURIComponent(query)}` : 'https://www.google.com';
    return {
      appName: 'Google Search',
      icon: 'google',
      badge: 'Mesin Pencari',
      color: '#EA4335',
      bgGradient: 'linear-gradient(135deg, rgba(66, 133, 244, 0.18), rgba(234, 67, 53, 0.18))',
      query: query || 'Google Search',
      targetUrl,
      voiceMsg: query ? `Mencari informasi tentang ${query} di Google.` : 'Membuka Google Search.'
    };
  }

  // 6. GITHUB
  if (lower.includes('github')) {
    let query = '';
    const m = lower.match(/(?:cari(?:kan)?\s+repo\s+|github\s+cari\s+|cari\s+)(.+?)(?:\s+di\s+github)?$/i);
    if (m && m[1]) {
      query = bersihkanQuery(m[1], ['di github', 'github', 'repo', 'repository', 'cari', 'carikan']);
    }
    const targetUrl = query ? `https://github.com/search?q=${encodeURIComponent(query)}` : 'https://github.com';
    return {
      appName: 'GitHub',
      icon: 'github',
      badge: 'Code Repository',
      color: '#f0f6fc',
      bgGradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(20, 20, 20, 0.6))',
      query: query || 'GitHub Explore',
      targetUrl,
      voiceMsg: query ? `Membuka GitHub untuk mencari repository ${query}.` : 'Membuka GitHub.'
    };
  }

  // 7. WIKIPEDIA
  if (lower.includes('wikipedia')) {
    let query = '';
    const m = lower.match(/(?:cari(?:kan)?\s+info\s+|wikipedia\s+cari\s+|cari\s+)(.+?)(?:\s+di\s+wikipedia)?$/i);
    if (m && m[1]) {
      query = bersihkanQuery(m[1], ['di wikipedia', 'wikipedia', 'info', 'tentang', 'cari']);
    }
    const targetUrl = query ? `https://id.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}` : 'https://id.wikipedia.org';
    return {
      appName: 'Wikipedia',
      icon: 'wikipedia',
      badge: 'Ensiklopedia Bebas',
      color: '#ffffff',
      bgGradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(30, 30, 30, 0.6))',
      query: query || 'Wikipedia ID',
      targetUrl,
      voiceMsg: query ? `Membuka Wikipedia untuk mencari topik ${query}.` : 'Membuka Wikipedia.'
    };
  }

  // 8. DIRECT APPS
  const directApps = [
    { keys: ['whatsapp', 'wa web', 'wa'], name: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon: 'whatsapp', color: '#25D366' },
    { keys: ['chatgpt', 'openai'], name: 'ChatGPT', url: 'https://chatgpt.com', icon: 'chatgpt', color: '#10A37F' },
    { keys: ['claude'], name: 'Claude AI', url: 'https://claude.ai', icon: 'claude', color: '#D97706' },
    { keys: ['instagram', 'ig'], name: 'Instagram', url: 'https://www.instagram.com', icon: 'instagram', color: '#E1306C' },
    { keys: ['tiktok'], name: 'TikTok', url: 'https://www.tiktok.com', icon: 'tiktok', color: '#FE2C55' },
    { keys: ['twitter', ' x '], name: 'X / Twitter', url: 'https://x.com', icon: 'twitter', color: '#1DA1F2' },
    { keys: ['gmail', 'email'], name: 'Gmail', url: 'https://mail.google.com', icon: 'gmail', color: '#EA4335' },
    { keys: ['canva'], name: 'Canva', url: 'https://www.canva.com', icon: 'canva', color: '#00C4CC' },
    { keys: ['shopee'], name: 'Shopee', url: 'https://shopee.co.id', icon: 'shopee', color: '#EE4D2D' },
    { keys: ['tokopedia'], name: 'Tokopedia', url: 'https://www.tokopedia.com', icon: 'tokopedia', color: '#03AC0E' }
  ];

  if (/^(?:buka|open|launch)\s+/i.test(lower)) {
    const afterBuka = lower.replace(/^(?:buka|open|launch)\s+/i, '').trim();
    for (const app of directApps) {
      if (app.keys.some(k => afterBuka === k || afterBuka.startsWith(k + ' '))) {
        return {
          appName: app.name,
          icon: app.icon,
          badge: 'Web App',
          color: app.color,
          bgGradient: `linear-gradient(135deg, ${app.color}33, rgba(20, 20, 20, 0.6))`,
          query: 'Direct Launch',
          targetUrl: app.url,
          voiceMsg: `Membuka ${app.name} untukmu.`
        };
      }
    }

    // Direct URL jika ada ekstensi domain (.com, .id, dll)
    if (afterBuka.includes('.') || afterBuka.startsWith('http')) {
      const fullUrl = afterBuka.startsWith('http') ? afterBuka : `https://${afterBuka}`;
      return {
        appName: afterBuka,
        icon: 'web',
        badge: 'External Website',
        color: '#5DCAA5',
        bgGradient: 'linear-gradient(135deg, rgba(93, 202, 165, 0.2), rgba(20, 20, 20, 0.6))',
        query: fullUrl,
        targetUrl: fullUrl,
        voiceMsg: `Membuka situs web ${afterBuka}.`
      };
    }
  }

  return null;
}

function buatAppCardHtml(appInfo) {
  if (!appInfo) return '';
  const safeName = escapeHtml(appInfo.appName);
  const safeQuery = escapeHtml(appInfo.query);
  const safeUrl = escapeHtml(appInfo.targetUrl);
  const safeBadge = escapeHtml(appInfo.badge || 'App Launch');
  const iconSvg = getAppSvgIcon(appInfo.icon, 22);

  return `
    <div class="app-launcher-card" style="background:${appInfo.bgGradient}; border-color:${appInfo.color}45;">
      <div class="app-launcher-head">
        <div class="app-launcher-icon" style="color:${appInfo.color}; background:${appInfo.color}15; border-color:${appInfo.color}35;">
          ${iconSvg}
        </div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="app-launcher-name">${safeName}</span>
            <span class="app-launcher-badge" style="color:${appInfo.color}; border-color:${appInfo.color}35;">${safeBadge}</span>
          </div>
          <div class="app-launcher-query">${safeQuery === 'Direct Launch' || safeQuery === 'Beranda' ? 'Akses Cepat' : 'Pencarian: "' + safeQuery + '"'}</div>
        </div>
      </div>
      <div class="app-launcher-footer">
        <span class="app-launcher-url" title="${safeUrl}">${safeUrl}</span>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="app-launcher-action-btn" style="background:${appInfo.color}; color:#fff;">
          Buka Sekarang ↗
        </a>
      </div>
    </div>`;
}

// Preset Daftar Aplikasi untuk Quick Launcher Modal
const PRESET_APPS_LIST = [
  { name: 'Control Center', icon: 'acc', badge: 'Hardware', color: '#38bdf8', isInternal: true, action: 'acc' },
  { name: 'Cloud Gallery', icon: 'gallery', badge: 'Foto', color: '#f59e0b', isInternal: true, action: 'gallery' },
  { name: 'Netflix', icon: 'netflix', badge: 'Streaming', color: '#E50914', searchUrl: 'https://www.netflix.com/search?q=', homeUrl: 'https://www.netflix.com' },
  { name: 'YouTube', icon: 'youtube', badge: 'Video', color: '#FF0000', searchUrl: 'https://www.youtube.com/results?search_query=', homeUrl: 'https://www.youtube.com' },
  { name: 'Spotify', icon: 'spotify', badge: 'Musik', color: '#1DB954', searchUrl: 'https://open.spotify.com/search/', homeUrl: 'https://open.spotify.com' },
  { name: 'Google Maps', icon: 'maps', badge: 'Peta', color: '#4285F4', searchUrl: 'https://www.google.com/maps/search/', homeUrl: 'https://www.google.com/maps' },
  { name: 'Google', icon: 'google', badge: 'Cari', color: '#EA4335', searchUrl: 'https://www.google.com/search?q=', homeUrl: 'https://www.google.com' },
  { name: 'WhatsApp', icon: 'whatsapp', badge: 'Pesan', color: '#25D366', homeUrl: 'https://web.whatsapp.com' },
  { name: 'ChatGPT', icon: 'chatgpt', badge: 'AI', color: '#10A37F', homeUrl: 'https://chatgpt.com' },
  { name: 'Claude AI', icon: 'claude', badge: 'AI', color: '#D97706', homeUrl: 'https://claude.ai' },
  { name: 'GitHub', icon: 'github', badge: 'Repo', color: '#f0f6fc', searchUrl: 'https://github.com/search?q=', homeUrl: 'https://github.com' },
  { name: 'Wikipedia', icon: 'wikipedia', badge: 'Info', color: '#ffffff', searchUrl: 'https://id.wikipedia.org/wiki/Special:Search?search=', homeUrl: 'https://id.wikipedia.org' },
  { name: 'Instagram', icon: 'instagram', badge: 'Sosial', color: '#E1306C', homeUrl: 'https://www.instagram.com' },
  { name: 'Canva', icon: 'canva', badge: 'Desain', color: '#00C4CC', homeUrl: 'https://www.canva.com' },
  { name: 'Shopee', icon: 'shopee', badge: 'Belanja', color: '#EE4D2D', searchUrl: 'https://shopee.co.id/search?keyword=', homeUrl: 'https://shopee.co.id' },
  { name: 'Tokopedia', icon: 'tokopedia', badge: 'Belanja', color: '#03AC0E', searchUrl: 'https://www.tokopedia.com/search?q=', homeUrl: 'https://www.tokopedia.com' }
];

function renderAppsLauncherGrid() {
  const grid = document.getElementById('appsLauncherGrid');
  if (!grid) return;
  grid.innerHTML = PRESET_APPS_LIST.map((app, idx) => `
    <div class="apps-grid-item" data-idx="${idx}" title="Buka ${app.name}">
      <div class="apps-grid-item-icon" style="background:${app.color}15; border:1px solid ${app.color}35;">
        ${getAppSvgIcon(app.icon, 20)}
      </div>
      <span class="apps-grid-item-name">${app.name}</span>
    </div>
  `).join('');
}

function bukaQuickAppsModal() {
  const backdrop = document.getElementById('appsLauncherBackdrop');
  const panel = document.getElementById('appsLauncherPanel');
  if (!backdrop || !panel) return;
  renderAppsLauncherGrid();
  backdrop.classList.add('visible');
  panel.classList.add('visible');
  const inp = document.getElementById('inpAppSearchQuery');
  if (inp) {
    inp.value = '';
    setTimeout(() => inp.focus(), 150);
  }
}

function tutupQuickAppsModal() {
  const backdrop = document.getElementById('appsLauncherBackdrop');
  const panel = document.getElementById('appsLauncherPanel');
  if (backdrop) backdrop.classList.remove('visible');
  if (panel) panel.classList.remove('visible');
}

// Inisialisasi Event Listener App Launcher
(() => {
  const btnClose = document.getElementById('btnTutupAppsLauncher');
  if (btnClose) btnClose.addEventListener('click', tutupQuickAppsModal);

  const backdrop = document.getElementById('appsLauncherBackdrop');
  if (backdrop) backdrop.addEventListener('click', tutupQuickAppsModal);

  const grid = document.getElementById('appsLauncherGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const item = e.target.closest('.apps-grid-item');
      if (!item) return;
      const idx = parseInt(item.getAttribute('data-idx'), 10);
      const app = PRESET_APPS_LIST[idx];
      if (!app) return;

      if (app.isInternal && app.action === 'acc') {
        tutupQuickAppsModal();
        if (typeof bukaAccModal === 'function') bukaAccModal();
        return;
      }
      if (app.isInternal && app.action === 'gallery') {
        tutupQuickAppsModal();
        if (typeof bukaGalleryModal === 'function') bukaGalleryModal();
        return;
      }

      const inp = document.getElementById('inpAppSearchQuery');
      const q = inp ? inp.value.trim() : '';
      let targetUrl = app.homeUrl;
      if (q && app.searchUrl) {
        targetUrl = app.searchUrl + encodeURIComponent(q);
      }

      window.open(targetUrl, '_blank');
      if (typeof ucapkanDiBrowser === 'function') {
        ucapkanDiBrowser(q ? `Membuka ${app.name} untuk mencari ${q}.` : `Membuka ${app.name}.`);
      }
      tutupQuickAppsModal();
    });
  }

  // Esc key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('appsLauncherPanel');
      if (panel && panel.classList.contains('visible')) {
        tutupQuickAppsModal();
      }
    }
  });
})();
