// ============================================================
// TrLaucher — Real Server Status API
// Uses mcsrvstat.us and mcstatus.io as fallbacks for Bedrock & Geyser
// ============================================================

const cache = new Map();
const CACHE_TTL = 10_000; // 30 seconds

/**
 * Fetch real Minecraft server status using Bedrock and Java query API endpoints.
 * Perfect for GeyserMC servers and offline/crack servers.
 */
export async function fetchServerStatus(host, port = 19132) {
  const key = `${host}:${port}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  // 1. LAN / Localhost Bypass Detection
  const isLan = host === 'localhost' || host === '127.0.0.1' || 
                host.startsWith('192.168.') || host.startsWith('10.') ||
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
  if (isLan) {
    const localStatus = {
      online: true,
      host,
      port,
      version: 'Local / Geyser',
      software: 'GeyserMC/BDS',
      motd: 'Local Network Server (LAN Bypass)',
      players: { online: 1, max: 20, list: [] },
      fetchedAt: Date.now()
    };
    cache.set(key, { ts: Date.now(), data: localStatus });
    return localStatus;
  }

  // 2. Format standard ports to avoid query parser bugs on raw IPs
  const queryHost = (port === 19132 || port === 25565) ? host : `${host}:${port}`;

  const endpoints = [
    `https://api.mcsrvstat.us/bedrock/3/${queryHost}`,
    `https://api.mcsrvstat.us/3/${queryHost}`,
    `https://api.mcstatus.io/v2/status/bedrock/${queryHost}`,
    `https://api.mcstatus.io/v2/status/java/${queryHost}`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const raw = await res.json();
        const isOnline = raw.online === true || raw.online === 'true';
        if (isOnline) {
          const playersOnline = raw.players?.online ?? 0;
          const playersMax = raw.players?.max ?? 0;
          const motd = raw.motd?.clean?.[0] || raw.motd?.clean || raw.hostname || host;

          const status = {
            online: true,
            host,
            port,
            version: raw.version?.name || raw.version || 'Bedrock / Geyser',
            software: raw.software || 'GeyserMC',
            motd: Array.isArray(motd) ? motd.join(' ') : motd,
            players: {
              online: playersOnline,
              max: playersMax,
              list: raw.players?.list || [],
            },
            fetchedAt: Date.now(),
          };
          cache.set(key, { ts: Date.now(), data: status });
          return status;
        }
      }
    } catch (e) {
      // Continue to next
    }
  }

  // If all endpoints fail, return offline status
  const offline = {
    online: false,
    host,
    port,
    players: { online: 0, max: 0, list: [] },
    fetchedAt: Date.now(),
  };
  cache.set(key, { ts: Date.now(), data: offline });
  return offline;
}

export function formatPlayers(status) {
  if (!status.online) return 'Offline';
  return `${status.players.online}/${status.players.max}`;
}

export function getPingClass(status) {
  return status.online ? 'online' : 'offline';
}
