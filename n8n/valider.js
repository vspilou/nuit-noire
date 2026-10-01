// Adresse du compte SMTP : elle envoie les deux mails et reçoit les demandes.
// À changer ici seulement si tu utilises une autre boîte.
const NUIT_NOIRE = 'votre-adresse@gmail.com';

const corps = $input.first().json.body ?? {};
const texte = (v, max) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
const html = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Champ invisible : seul un robot le remplit
if (texte(corps.site, 200)) throw new Error('Champ piège rempli : envoi ignoré');

const FORMULES = { veillee: ['une veillée', 'Veillée', '010000'], nuit: ['une nuit entière', 'Nuit entière', '070000'], privee: ['une nuit privée', 'Nuit privée', '010000'] };
const prenom = texte(corps.prenom, 60);
const email = texte(corps.email, 120).toLowerCase();
const date = texte(corps.date, 10);
const formule = FORMULES[corps.formule];
const personnes = parseInt(corps.personnes, 10);
const message = String(corps.message ?? '').trim().slice(0, 600);

if (!prenom || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !formule || !(personnes >= 1 && personnes <= 6)) {
  throw new Error('Demande incomplète ou invalide');
}

// Éclairement de la Lune le soir demandé (Meeus, termes principaux), même calcul que la page
const rad = Math.PI / 180, SYN = 29.530588861;
function nouvelleLune(k) {
  const T = k / 1236.85, E = 1 - 0.002516 * T;
  const M = (2.5534 + 29.1053567 * k) * rad, Mp = (201.5643 + 385.81693528 * k) * rad, F = (160.7108 + 390.67050284 * k) * rad;
  const jde = 2451550.09766 + SYN * k + 0.00015437 * T * T
    - 0.4072 * Math.sin(Mp) + 0.17241 * E * Math.sin(M) + 0.01608 * Math.sin(2 * Mp) + 0.01039 * Math.sin(2 * F)
    + 0.00739 * E * Math.sin(Mp - M) - 0.00514 * E * Math.sin(Mp + M) + 0.00208 * E * E * Math.sin(2 * M);
  return (jde - 2440587.5) * 864e5;
}
const soir = Date.parse(date + 'T20:00:00Z');
let k = Math.floor((soir / 864e5 + 2440587.5 - 2451550.09766) / SYN) + 1;
while (nouvelleLune(k) > soir) k--;
const lune = Math.round((1 - Math.cos(2 * Math.PI * ((soir - nouvelleLune(k)) / 864e5) / SYN)) / 2 * 100);
const verdictLune = lune < 25 ? 'Nuit idéale pour le ciel profond' : lune < 60 ? 'Belle nuit pour la Lune et les planètes' : 'Lune très présente&nbsp;: on vous proposera peut-être une autre date';

const jour = new Date(date + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const jourCourt = new Date(date + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const gens = personnes > 1 ? `${personnes} personnes` : '1 personne';
// Le numéro de demande est l'exécution n8n : on la retrouve dans l'onglet Executions
const ref = `NN-${date.slice(5).replace('-', '')}-${$execution.id}`;

// Lien « ajouter à l'agenda » (Google Agenda, heure de Paris)
const lendemain = new Date(date + 'T12:00:00Z'); lendemain.setUTCDate(lendemain.getUTCDate() + 1);
// (pas de URLSearchParams : le bac à sable du nœud Code de n8n ne le fournit pas)
const agenda = 'https://calendar.google.com/calendar/render?' + Object.entries({
  action: 'TEMPLATE',
  text: `Nuit Noire · ${formule[1]} (en attente de confirmation)`,
  dates: `${date.replace(/-/g, '')}T214000/${lendemain.toISOString().slice(0, 10).replace(/-/g, '')}T${formule[2]}`,
  ctz: 'Europe/Paris',
  location: 'Causse Méjean, Lozère',
  details: `Demande ${ref}. Confirmation par mail sous 48 heures.`,
}).map(([cle, val]) => `${cle}=${encodeURIComponent(val)}`).join('&');

/* ---------------- mise en page (tables + styles en ligne : lisible partout, Gmail compris) ---------------- */
const SERIF = "'Bodoni Moda',Didot,'Bodoni 72',Georgia,'Times New Roman',serif";
const SANS = "Geist,'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'Geist Mono','SFMono-Regular',Menlo,Consolas,'Courier New',monospace";
const etiquette = t => `<div style="font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:1.6px;text-transform:uppercase;color:#8E95A8">${t}</div>`;
const valeur = t => `<div style="font-family:${SERIF};font-size:21px;line-height:28px;color:#ECE8DF;padding-top:4px">${t}</div>`;
const cellule = (lab, val, attrs = 'width="50%" class="demi"') => `<td ${attrs} valign="top" style="padding:16px 24px">${etiquette(lab)}${val}</td>`;

// Un ciel de glyphes, propre à chaque date (même date, même ciel). Décoratif : ce n'est pas une carte du ciel.
let graine = [...date].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
const alea = () => { graine = graine + 0x6D2B79F5 | 0; let t = Math.imul(graine ^ graine >>> 15, 1 | graine); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ciel = Array.from({ length: 7 }, () => '<tr>' + Array.from({ length: 26 }, () => {
  const r = alea();
  const g = r < 0.7 ? '' : r < 0.86 ? '<span style="color:#3E475C">·</span>' : r < 0.95 ? '<span style="color:#A6ADBF">·</span>' : r < 0.988 ? '<span style="color:#ECE8DF">+</span>' : '<span style="color:#FFF6E8">&#10022;</span>';
  return `<td width="3.8%" align="center" style="font-family:${MONO};font-size:13px;line-height:16px;height:16px">${g}</td>`;
}).join('') + '</tr>').join('');

const jauge = `<table role="presentation" width="140" cellpadding="0" cellspacing="0" style="margin-top:10px"><tr>
<td width="${Math.max(lune, 2)}%" height="4" bgcolor="#ECE8DF" style="font-size:0;line-height:0;border-radius:2px">&nbsp;</td>
<td height="4" bgcolor="#222A3D" style="font-size:0;line-height:0">&nbsp;</td></tr></table>`;

const billet = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B101B" style="background:#0B101B;border:1px solid #222A3D;border-radius:16px;border-collapse:separate">
  <tr><td colspan="2" style="padding:20px 24px 4px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>${etiquette('Votre demande')}</td>
      <td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:1px;color:#ECE8DF">N° ${html(ref)}</td>
    </tr></table>
  </td></tr>
  <tr>${cellule('Formule', valeur(formule[1]))}${cellule('Personnes', valeur(personnes))}</tr>
  <tr>${cellule('La nuit du', valeur(jour))}${cellule('Lune', valeur(`${lune}&nbsp;% <span style="font-size:15px;color:#A6ADBF">éclairée</span>`) + jauge + `<div style="font-family:${SANS};font-size:12px;line-height:17px;color:#8E95A8;padding-top:8px">${verdictLune}</div>`)}</tr>
  <tr>${cellule('Réponse à', `<div style="font-family:${SANS};font-size:16px;line-height:24px;color:#ECE8DF;padding-top:4px">${html(email)}</div>`, 'colspan="2"')}</tr>
  <tr><td colspan="2" style="padding:6px 24px"><div style="border-top:1px dashed #2A3348;font-size:0;line-height:0">&nbsp;</div></td></tr>
  <tr><td colspan="2" style="padding:16px 24px 24px">${etiquette('Votre message')}
    <div style="font-family:${SERIF};font-style:italic;font-size:19px;line-height:29px;color:${message ? '#ECE8DF' : '#8E95A8'};padding-top:8px">${message ? '« ' + html(message).replace(/\n/g, '<br>') + ' »' : 'Pas de message. Le ciel parlera pour vous.'}</div>
  </td></tr>
</table>`;

const etape = (quand, quoi) => `<tr>
  <td width="104" valign="top" style="padding:14px 0;border-top:1px solid #1C2335;font-family:${MONO};font-size:11px;line-height:20px;letter-spacing:1.4px;text-transform:uppercase;color:#FF5B4A">${quand}</td>
  <td valign="top" style="padding:14px 0;border-top:1px solid #1C2335;font-family:${SANS};font-size:15px;line-height:22px;color:#C9CEDA">${quoi}</td></tr>`;

const cadre = (apercu, contenu) => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light">
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;1,6..96,500&family=Geist:wght@400;500&family=Geist+Mono&display=swap" rel="stylesheet">
<title>Nuit Noire</title>
<style>@media (max-width:520px){.marge{padding-left:20px!important;padding-right:20px!important}.titre{font-size:32px!important;line-height:36px!important}.demi{display:block!important;width:auto!important;padding-bottom:4px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#05070C" bgcolor="#05070C">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#05070C">${apercu}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#05070C" style="background:#05070C"><tr><td align="center" style="padding:28px 12px 40px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
  <tr><td class="marge" style="padding:0 32px 22px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${SERIF};font-style:italic;font-size:21px;color:#ECE8DF"><span style="color:#ECE8DF;font-style:normal">&#9679;</span>&nbsp; Nuit Noire</td>
      <td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#8E95A8">Récapitulatif</td>
    </tr></table>
  </td></tr>
  <tr><td bgcolor="#070A12" style="background:#070A12;border:1px solid #161C2B;border-radius:22px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td class="marge" style="padding:30px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${ciel}</table></td></tr>
      <tr><td class="marge" style="padding:6px 32px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="64%" style="border-top:1px solid #2A3348;font-size:0;line-height:0">&nbsp;</td>
          <td width="14" align="center" style="font-family:${SANS};font-size:13px;line-height:13px;color:#FF5B4A">&#9650;</td>
          <td style="border-top:1px solid #2A3348;font-size:0;line-height:0">&nbsp;</td>
        </tr></table>
        <div style="font-family:${MONO};font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#5A6378;text-align:right;padding-top:8px">Causse Méjean · 1 000 m</div>
      </td></tr>
      ${contenu}
    </table>
  </td></tr>
  <tr><td class="marge" style="padding:28px 32px 0;font-family:${SANS};font-size:12px;line-height:19px;color:#6B7389">
    <span style="font-family:${SERIF};font-style:italic;font-size:15px;color:#A6ADBF">Nuit Noire</span>&nbsp; veillées d'astronomie sur le Causse Méjean, Lozère.<br>
    Vous recevez ce mail car cette adresse a été saisie sur notre page. Si ce n'est pas vous, ignorez-le&nbsp;: rien n'est réservé sans confirmation.<br>
    Marque fictive&nbsp;: ce message vient d'une page de démonstration.
  </td></tr>
</table></td></tr></table></body></html>`;

const pourVisiteur = cadre(`Récapitulatif de votre demande ${ref} : ${formule[0]}, nuit du ${jourCourt}. Réponse sous 48 heures.`, `
      <tr><td class="marge" style="padding:34px 32px 8px">
        <div class="titre" style="font-family:${SERIF};font-size:38px;line-height:42px;color:#ECE8DF;letter-spacing:-0.5px">Bonjour ${html(prenom)},<br><em>votre nuit est demandée.</em></div>
        <div style="font-family:${SANS};font-size:16px;line-height:25px;color:#C9CEDA;padding-top:18px">Voici le récapitulatif de ce que vous nous avez écrit. Nous vous répondons sous 48&nbsp;heures avec la confirmation et le tarif.</div>
      </td></tr>
      <tr><td class="marge" style="padding:22px 32px 6px">${billet}</td></tr>
      <tr><td class="marge" style="padding:26px 32px 4px">
        ${etiquette('La suite')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px">
          ${etape('Sous 48 h', 'On vous confirme la date et le tarif, par retour de mail.')}
          ${etape('La veille', 'On vérifie la météo. Si le ciel se couvre, on choisit une autre nuit ensemble.')}
          ${etape('21:40', 'Rendez-vous sur le plateau. Une veste chaude, et aucune lampe blanche&nbsp;: on vous prête les rouges.')}
        </table>
      </td></tr>
      <tr><td class="marge" style="padding:24px 32px 36px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#FF5B4A" style="border-radius:999px">
          <a href="${html(agenda)}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:15px;font-weight:600;color:#16080A;text-decoration:none;border-radius:999px">Bloquer la date dans mon agenda</a>
        </td></tr></table>
        <div style="font-family:${SANS};font-size:13px;line-height:20px;color:#8E95A8;padding-top:16px">Une erreur dans la demande&nbsp;? Répondez simplement à ce mail.</div>
      </td></tr>`);

const pourNuitNoire = cadre(`Nouvelle demande ${ref} : ${prenom}, ${formule[0]}, ${gens}, nuit du ${jourCourt}.`, `
      <tr><td class="marge" style="padding:34px 32px 8px">
        <div class="titre" style="font-family:${SERIF};font-size:34px;line-height:40px;color:#ECE8DF">Nouvelle demande<br><em>de ${html(prenom)}.</em></div>
        <div style="font-family:${SANS};font-size:15px;line-height:23px;color:#C9CEDA;padding-top:16px">Répondez directement à ce mail&nbsp;: la réponse part chez ${html(prenom)} (${html(email)}). Le visiteur a reçu le même récapitulatif.</div>
      </td></tr>
      <tr><td class="marge" style="padding:22px 32px 36px">${billet}</td></tr>`);

return [{ json: {
  ref, prenom, email, nuitNoire: NUIT_NOIRE,
  sujetVisiteur: `Votre nuit du ${jourCourt} : demande bien reçue`,
  sujetNuitNoire: `Nouvelle demande ${ref} : ${prenom}, nuit du ${jourCourt}`,
  pourVisiteur, pourNuitNoire,
} }];
