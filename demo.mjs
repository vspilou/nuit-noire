// Ouvre le formulaire de la page au reste d'Internet, le temps d'une démo.
// Une porte locale ne laisse passer QUE l'adresse du formulaire : l'éditeur n8n reste fermé.
// Puis un tunnel Cloudflare gratuit (sans compte) relie cette porte à une adresse https publique,
// la page est mise à jour avec cette adresse et poussée sur GitHub.
//
// Usage : node demo.mjs        (Ctrl+C pour tout fermer ; n8n doit tourner dans Docker)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

process.chdir(path.dirname(fileURLToPath(import.meta.url)));

const N8N = 'http://localhost:5678';
const CHEMIN = '/webhook/nuit-noire';
const PORT = 5680;
const CLOUDFLARED = process.env.CLOUDFLARED ?? 'C:/Users/B5402/tools/cloudflared.exe';
const PAR_MINUTE = 5;          // demandes par adresse IP et par minute
const TAILLE_MAX = 16 * 1024;  // un formulaire rempli pèse moins d'un ko

const vus = new Map(); // ponytail: mémoire jamais vidée, suffit pour une démo de quelques heures
const porte = http.createServer(async (req, res) => {
  try {
    if (req.url !== CHEMIN || !['POST', 'OPTIONS'].includes(req.method)) return res.writeHead(404).end();
    if (req.method === 'POST') {
      const ip = req.headers['cf-connecting-ip'] ?? req.socket.remoteAddress, t = Date.now();
      const recents = (vus.get(ip) ?? []).filter(x => t - x < 60_000);
      if (recents.length >= PAR_MINUTE) return res.writeHead(429).end();
      vus.set(ip, [...recents, t]);
    }
    const morceaux = []; let taille = 0;
    for await (const m of req) { taille += m.length; if (taille > TAILLE_MAX) return res.writeHead(413).end(); morceaux.push(m); }
    const garder = ['content-type', 'origin', 'access-control-request-method', 'access-control-request-headers'];
    const r = await fetch(N8N + CHEMIN, {
      method: req.method,
      headers: Object.fromEntries(garder.filter(h => req.headers[h]).map(h => [h, req.headers[h]])),
      body: req.method === 'POST' ? Buffer.concat(morceaux) : undefined,
    });
    const entetes = Object.fromEntries([...r.headers].filter(([h]) => !['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(h)));
    res.writeHead(r.status, entetes).end(Buffer.from(await r.arrayBuffer()));
    console.log(new Date().toLocaleTimeString('fr-FR'), req.method, '→ n8n', r.status);
  } catch (e) {
    console.error('Porte :', e.message);
    if (!res.headersSent) res.writeHead(502).end();
  }
});

function publier(url) {
  const action = url + CHEMIN;
  const html = fs.readFileSync('index.html', 'utf8');
  fs.writeFileSync('index.html', html.replace(/action="[^"]*\/webhook\/nuit-noire"/, `action="${action}"`));
  console.log(`\nFormulaire relié à ${action}`);
  try {
    execSync(`git commit -qam "Démo : formulaire relié au tunnel ${url}"`, { stdio: 'inherit' });
    execSync('git push -q', { stdio: 'inherit' });
    console.log('Page poussée sur GitHub : en ligne d\'ici une minute.');
  } catch {
    console.log('Envoi sur GitHub impossible : faites « git push » à la main.');
  }
  console.log('Laissez cette fenêtre ouverte pendant le test. Ctrl+C pour fermer.\n');
}

porte.listen(PORT, '127.0.0.1', () => {
  console.log(`Porte prête sur http://127.0.0.1:${PORT}${CHEMIN}, ouverture du tunnel…`);
  const cf = spawn(CLOUDFLARED, ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${PORT}`]);
  let url;
  const lire = d => { const m = String(d).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/); if (m && !url) publier(url = m[0]); };
  cf.stdout.on('data', lire);
  cf.stderr.on('data', lire); // cloudflared écrit son journal sur stderr
  cf.on('exit', code => { console.log('Tunnel fermé', code ?? ''); process.exit(code ?? 0); });
  process.on('SIGINT', () => cf.kill());
});
