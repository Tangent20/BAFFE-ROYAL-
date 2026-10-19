# Baffe Royale — PRD

## V1 - Bug fix Android Chrome (2026-01-06)
- ✅ touch-action: none + overscroll-behavior: none sur game-arena
- ✅ useEffect avec preventDefault sur touchmove (non-passive)
- ✅ GameErrorBoundary autour de <Game/> avec message rigolo
- ✅ Fix bonus : challengeFrom/challengeTarget non déclarés

## V2 - Pack "Fun & Addictif" (2026-01-06)
### Gameplay
- ✅ **Loot Machine 🎰** après chaque KO (sauf le dernier) : 8 bonus délirants à piocher
  (Mains de Feu, Trèfle Truqué, Poing de Fer, Beurre Perfect, Capsule de Rage, Tir Fusil,
   Mort Subite, Peau Traîtresse). Effets appliqués au round suivant via applyBoostToOpponent.
- ✅ **Voice-over arcade 📢** via SpeechSynthesis natif (gratuit, offline) :
  "ACHÈVE-LE !" à <15% HP, "FATALITY !" / "K.O." sur KO, "RAFALE INFERNALE !" sur finisher,
  "BOUCLIER BRISÉ !" sur shield break, "VICTOIRE TOTALE !" sur run win, "TU AS ÉCHOUÉ !" sur
  sudden death. Toggle 🔊/🔇 dans la nav Home.
- ✅ **Combo Finisher x10 💀** : cinématique 1.2s slow-mo + flash + bandeau "RAFALE INFERNALE 🔥",
  +5000 points bonus et vibration en montagne russe.
- ✅ **Bouclier du Boss Flamby 🛡️** : 60 HP de bouclier cyan qui absorbe 80% des dégâts normaux,
  seul un PERFECT passe à travers proprement. Barre HP dédiée affichée.
- ✅ Sudden Death : si bonus Mort Subite actif, 1 esquive ennemie = game over instantané.

### Home / Menu
- ✅ Bandeau "comeback" en haut quand profile.best_score > 0 (4 phrases random).
- ✅ Nouveau bouton "🎯 Entraînement" à côté du Daily (route /game?mode=practice).
- ✅ Section "🎰 LOOTS APRÈS CHAQUE KO" : preview animée des 8 boosts, highlight rotatif.
- ✅ Skin picker de gant (6 skins : Main nue, Gant de boxe, Poing serré, Mains métal,
  Poing-fusée, Poulet humiliant). Déblocage par achievements/seuils (5 KO, combo 5,
  10 perfects, 10 games, 3 jours daily streak). Persisté en localStorage.
- ✅ Bouton voice toggle 🔊/🔇 dans la nav.
- ✅ Easter egg : tap le titre BAFFE ROYALE → emojis du skin actif qui volent, sfx.slap()
  par tap, "TRICHEUR DÉTECTÉ !" à 25 taps.

### Skin appliqué dans le jeu
- ✅ Le bouton "BAFFE !" en bas affiche l'emoji du skin actif (👋 / 🧤 / ✊ / 🤘 / 🚀 / 🐔).

## Fichiers touchés
### Nouveaux
- /app/frontend/src/components/GameErrorBoundary.jsx
- /app/frontend/src/components/LootMachine.jsx
- /app/frontend/src/lib/loot.js (BOOSTS catalog + applyBoostToOpponent)
- /app/frontend/src/lib/skins.js (GLOVE_SKINS + getActiveSkin + isSkinUnlocked)

### Modifiés
- /app/frontend/src/App.js (wrap GameErrorBoundary)
- /app/frontend/src/lib/audio.js (voice.* SpeechSynthesis API)
- /app/frontend/src/lib/gameData.js (shieldHp: 60 sur Flamby Ultime)
- /app/frontend/src/pages/Game.jsx (loot flow, shield, finisher, boost, voice, skin)
- /app/frontend/src/pages/Home.jsx (rewrite : comeback, bonus preview, skins, voice, practice)

## Tests effectués
- Viewport mobile 390×844, jeu complet jusqu'au 1er KO sur Mamie Ninja.
- Loot Machine spin confirmé visuellement (3 reels, beurre/trèfle/tir-fusil).
- Skin picker s'ouvre, montre les locks avec conditions.
- Voice toggle persiste en localStorage.
- Pas de régression sur le swipe Android (touch-action + preventDefault toujours OK).

## Backlog / Next
- P1 : sons natifs supplémentaires sur finisher (montagne russe d'accords).
- P1 : leaderboard mode pratique séparé OU exclure le mode pratique du leaderboard côté backend.
- P2 : taunts dynamiques générés par LLM (Claude Haiku via Emergent LLM Key).
- P2 : rooms multi-joueurs WebSocket (4-8 joueurs avec code de salon).
- P2 : partage vidéo MP4 du SlapCam via MediaRecorder API.
- P2 : achievement automatique "Cheater" si tu déclenches Mort Subite + survies (mode badass).

## V3 - Refonte UX + Bordel organisé + Fix swipe blindé (2026-01-06)

### Bugs corrigés
- ✅ **Bouton "Made with Emergent"** caché via CSS `#emergent-badge { display: none !important; }`
  dans index.css (survivra si la plateforme le réinjecte).
- ✅ **Swipe bug Android Chrome (V2)** — Renforcement :
  - `html, body { overscroll-behavior: none; overflow-x: hidden; }` global
  - Classe `body.is-playing` ajoutée pendant `/game` : `position: fixed; inset: 0;
    overflow: hidden; touch-action: none; overscroll-behavior: none;`
  - `document.addEventListener('touchmove', preventDefault, { passive: false })`
    en plus de l'arène (au niveau document)
  - `wheel` listener qui bloque les pans horizontaux desktop aussi
  - Vérifié runtime : body.is-playing présent + touchmove defaultPrevented=true au niveau document.

### Gameplay
- ✅ **HP boostées** pour se défouler correctement :
  - Mamie 100→250, Pigeon 80→200, Patate 140→320, Croûton 60→180
  - Camembert 110→270, Baguette 130→300, Mouton 95→220
  - Boss Flamby 200→500 + shield 60→120
- ✅ **2 nouveaux personnages** :
  - **MAMAN** 👩 (orange) — 280 HP, 0.18 dodge. Taunts cultes : "TON LINGE EST PAR TERRE !",
    "Je vais le dire à ton père", "Je vois TOUT depuis la cuisine."
  - **PAPA** 👨 (noir/jaune) — 320 HP, 0.12 dodge. Taunts cultes : "Je ne suis pas en colère,
    je suis déçu", "À ton âge, je travaillais déjà", "Sors de ce canapé fainéant."
- ✅ Nouveaux taunts ajoutés pour TOUS les anciens persos (3-5 lignes par perso).
- ✅ Nouveaux SLAP_LABELS (25 mots absurdes) et PERFECT_LABELS (10).
- ✅ Nouveaux CHAOS_EVENTS : "PANTOUFLE PAPA !", "MAMAN PASSE L'ASPI !", "CUILLÈRE EN BOIS !",
  "WIFI EN PANNE !"
- ✅ **Bulle de pensée aléatoire** de l'adversaire pendant le combat (45% de chance toutes
  les 5.5s). 10 pensées débiles : "🥖 J'ai faim.", "📱 Mon forfait expire demain.", etc.
- ✅ Mini-stickers ambient en background de l'arène (VS · ROUND X).

### Home page - Refonte hiérarchisée
Structure claire par § (sections numérotées) :
1. **Hero** : nav (logo + voix + top) → headlines ticker → titre énorme → tagline
   ultra-courte "Tape. Charge. Relâche. Mamie tombe." → bouton JOUER géant qui tremble
   → Daily + Pratique côte-à-côte → indicateur scroll
2. **§01 COMMENT ÇA MARCHE** : 3 cartes "MAINTIENS / VISE VERT / RELÂCHE" avec
   rotations alternées et fond jaune fluo
3. **§02 LE ROSTER DÉTRAQUÉ** : 10 polaroids inclinés, sticker NEW sur Maman & Papa
4. **§03 BULLETIN** (si profile.games_played > 0) : carnet de notes avec ligne raycée
   + appréciation prof selon le score
5. **§04 LOOTS APRÈS KO** : grille 8 bonus avec descriptions
6. **§05 SKIN DE GANT** : 6 skins avec verrouillage
7. **§06 COMMUNAUTÉ DÉBILE** : tweet rotatif + rumeur + world counter + prophétie
8. **§07 TROPHÉES** : achievements
9. **CTA final + disclaimer dramatique + footer**

### Bordel maîtrisé
- Falling emojis en arrière-plan permanent (10 emojis, 30% opacity, lent)
- Fake popup "alerte_baffe.exe" qui apparaît au bout de 8-13s
- Bouton JOUER MAINTENANT qui change de texte toutes les 2.4s (5 variantes)
- Titre BAFFE ROYALE cliquable → emojis du skin qui volent
- Headlines ticker en haut qui change toutes les 3.5s
- Compteur mondial fake (+1 à +6 par 0.9s)
- Stickers Sticker() composant pour décorer (NEW, 10 tarés, etc.)

### Responsive complet
- Mobile (390px) : tout en colonne, hero CTA pleine largeur
- Tablette (768px) : grids 2 cols, hero tient sur 1 écran
- Desktop (1280px+) : max-w-5xl mx-auto, polaroids 5 cols, layout aéré
- iOS : safe-area-inset déjà gérée, viewport meta `viewport-fit=cover`

## V4 - Mode VERSUS (2026-01-06)
- ✅ Nouvelle page `/versus` avec :
  - Sélection des 2 combattants (10 persos dispo, deux ne peuvent être identiques)
  - 4 presets "matchs cultes" : Mamie vs Papa, Maman vs Papa, Flamby vs Maman, Pigeon vs Croûton
  - Bouton "🎲 Tirage random" qui pioche dans une liste de duels prédéfinis
  - Sticker VS animé entre les 2 cartes
- ✅ **Combat auto-piloté** :
  - Tour par tour toutes les 0.9-1.2s (alternance left/right)
  - Esquive selon `dodgeChance`, 18% perfect (dmg x2.5), 12% crit (dmg x1.7)
  - HP bars colorées (vert/jaune/rouge selon %), animations de hit (shake + rotate)
- ✅ **Commentary en direct** style commentateur sportif débile :
  - Pool de 6 catégories : start, hit, perfect, dodge, crit, ko (~30 lignes total)
  - "OH LA BAFFE !", "Saignement de nez confirmé", "Le karma vient d'envoyer une recommandée", etc.
- ✅ **Écran de victoire** : emoji vainqueur géant + nom + "Vaincu : X (paix à son emoji 🌹)"
  + boutons Revanche / Autres
- ✅ Voice-over arcade qui annonce "FIGHT !" au début et "X GAGNE !" à la fin
- ✅ Stats victoires persistées en localStorage (`baffe_versus_wins`)
- ✅ Bouton **🥊 Versus** ajouté dans le hero Home, marqué NEW, à côté de Daily/Pratique


## V12 - Fix Responsive Multi-Device (2026-02-06)
**Contexte** : User a signalé que les dimensions étaient cassées sur ordinateur, tablette et iOS (titres sur 2 lignes inutilement, débordements, éléments mal cadrés).

**Corrections** :
- ✅ Titres hero : suppression des `<br/>` forcés, remplacés par `Mot <span className="inline-block">Mot2</span>` qui s'adapte au viewport
  - Vitrine.jsx : "BAFFE ROYALE"
  - Home.jsx : "BAFFE ROYALE"
  - Roster.jsx : "GALERIE DES TARÉS"
  - Collection.jsx : "TA COLLECTION"
  - Versus.jsx : "CHOISIS TES DEUX ABRUTIS"
  - ZoneDebile.jsx : "100% ABSURDITÉ"
- ✅ Sticker hero Vitrine "🔥 LE JEU LE PLUS STUPIDE DU MONDE 🔥" : taille réduite sur mobile (`text-[11px]`), `max-w-[95%]` et `whitespace-nowrap`
- ✅ Highlight "mamie ninja" : ajout `whitespace-nowrap inline-block` pour empêcher la coupure mid-word
- ✅ Clamp font-size titres : réduction de `clamp(3.5rem, 14vw, 9rem)` → `clamp(3rem, 13vw, 8rem)` pour meilleur scaling
- ✅ Test validé sur iPhone (390px), iPad (768px) et Desktop (1920px) — tous les écrans : titres sur 1 ligne en desktop, ne débordent plus en mobile

**Fichiers touchés** : Vitrine.jsx, Home.jsx, Roster.jsx, Collection.jsx, Versus.jsx, ZoneDebile.jsx


## V13 - Fix Game UI + Countdown rigolo + Game Over refait (2026-02-07)
**Contexte** : User a signalé 3 problèmes critiques sur le jeu :
1. 🚨 BUG MAJEUR : Bouton BAFFE caché derrière la barre 3-touches Android (impossible de jouer)
2. ⏰ Countdown 3-2-1 trop rapide et pas assez rigolo
3. 🖥️ Interface du jeu et Game Over pas adaptés pour desktop/tablette/iOS

**Corrections** :
- ✅ **Bouton BAFFE caché (CRITIQUE)** : Remplacement de `paddingBottom: 'env(safe-area-inset-bottom)'` (qui retourne 0 sur Android sans notch) par `paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)'` sur le footer du jeu. Au moins 20px de marge garantie, même sur Android avec barre physique 3-touches.
- ✅ **Countdown rigolo** :
  - Délai : 800ms → 1200ms par chiffre (plus de suspense)
  - Bulle de message au-dessus du chiffre : "👀 PRÊT ?!" → "😤 CONCENTRE-TOI..." → "🔥 ALLEZ ALLEZ !" → "💥 VAS-Y !"
  - Animation rotation + scale améliorée (spring stiffness 220, damping 12)
  - Explosion 💥 emoji superposée au moment du "0" (BAFFE !)
  - Text-shadow double color rouge + jaune
  - Backdrop-blur plus fort (60% au lieu de 40%)
- ✅ **Interface jeu (Game.jsx) - desktop responsive** :
  - HUD (Score/Combo/Quitter) : ajout `max-w-3xl mx-auto w-full` → ne s'étale plus aux bords de l'écran 1920px
  - Main (opponent area) : idem `max-w-3xl mx-auto w-full`
  - Emoji opponent : `clamp(6rem, 28vh, 14rem)` → `clamp(7rem, 32vh, 20rem)` plus dramatique sur grand écran
- ✅ **Game Over (ResultScreen) refait** :
  - Container : `max-w-2xl` → `max-w-3xl` (plus large sur desktop)
  - Titre "DING DING DING !" : ajout emoji 🔔 animé (rotation), text-shadow double color, taille adaptative clamp(2.5rem, 10vw, 6rem)
  - Carte grade : ajout gradeEmoji 🏆🥇🥈🥉💩 dans les coins, sub-verdict drôle ("Mamie a appelé un avocat..."), animation rotate 180→0 du grade
  - Confettis 🎉🎊⭐✨💫👋 (30 particules) qui tombent du haut pour les grades S et A
  - Padding-bottom avec safe-area-inset pour pas de bouton caché
  - New achievements : `grid-cols-1 sm:grid-cols-2` pour 2 colonnes sur desktop
  - Boutons : ajout des states actifs (translate + shadow) pour meilleur feedback tactile

**Fichiers touchés** : /app/frontend/src/pages/Game.jsx (countdown, HUD, main, footer, ResultScreen)

**Testé** : iPhone 390px + Desktop 1920px — countdown affiche bien les nouvelles bulles, bouton BAFFE bien dégagé du bas, layout cohérent sur les 2 viewports.


## V15 - Fix critique UX : Routing `/` → Menu réel (Home) au lieu de Vitrine (2026-02-07)
**Contexte** : User signale (vidéo à l'appui via analyze_file_tool) qu'il est bien sur la BONNE URL preview mais ne voit PAS le micro/voix, le Versus, les 10 personnages, le countdown rigolo. Diagnostic : il restait sur la page Vitrine (`/`) qui est la landing marketing, mais TOUTES les nouvelles fonctionnalités V2-V14 sont sur Home.jsx (route `/app`).

**Cause racine** : En V12 j'avais séparé `/` = Vitrine (marketing) et `/app` = Home (menu). Mais c'est contre-intuitif — l'utilisateur s'attend à voir le menu directement sur `/`.

**Correction** :
- ✅ Swap des routes dans App.js :
  - `/` → Home.jsx (menu complet avec voice toggle, Versus, portails) - AVANT c'était Vitrine
  - `/app` → Home.jsx (gardé pour backwards compat)
  - `/vitrine` → Vitrine.jsx (landing marketing accessible sur demande)
- ✅ Aucun autre code modifié — tous les `navigate('/')` existants pointent maintenant naturellement vers le menu

**Fichiers touchés** : /app/frontend/src/App.js (3 lignes : routes ordering)

**Testé** : Screenshot iPhone 390px sur `/` → voit immédiatement micro/voix, 3 modes (Daily/Pratique/Versus NEW), 3 portails (Roster/Collection/Zone Débile).


## V14 - HOTFIX Bouton BAFFE encore caché par barre 3-touches Android (2026-02-07)
**Contexte** : Le fix V13 (20px de marge minimum) était insuffisant. User a confirmé que le bouton BAFFE était toujours caché par la barre système Android (carré, rond, triangle).

**Cause racine** : `env(safe-area-inset-bottom)` retourne **0** sur Android Chrome (uniquement supporté par iOS Safari avec encoche/home indicator). Sur Android avec barre 3-touches physique, la barre système empiète sur les ~48-60px du bas de la viewport.

**Correction V14** :
- ✅ Augmentation drastique du padding-bottom : `max(env(safe-area-inset-bottom, 0px) + 1rem, 5rem)` = **80px minimum garanti**
- ✅ Sur Android : 80px de marge → la barre système (48-60px) + 20-30px de respiration
- ✅ Sur iPhone avec home indicator : encore 80px (le max prend toujours le dessus si safe-area < 80px)
- ✅ Sur Desktop : 80px en bas, légèrement excessif mais visuellement OK

**Fichiers touchés** : /app/frontend/src/pages/Game.jsx (footer style)

**Testé** : Viewport simulant Android avec barre système (390×780) → bouton BAFFE clairement visible avec gros espace en dessous.


## V16 - Fix lisibilité des titres et cartes Loot (2026-02-07)
**Contexte** : User signale que sur plusieurs pages, des phrases ne sont pas visibles. Analyse screenshots révèle 2 problèmes :
1. Titres de page (`Galerie`, `Ta`, `100%`, `Choisis tes`) sans couleur explicite → texte presque invisible sur fond cream
2. Cartes Loot avec couleurs trop proches : "MAINS DE FEU" rouge sur jaune (faible contraste), "TIR FUSIL" blanc sur orange (faible contraste)

**Corrections** :
- ✅ Ajout `text-ink` (couleur noire explicite) sur tous les titres hero des 4 pages : Roster, Collection, ZoneDebile, Versus + nom du vainqueur sur écran victoire Versus
- ✅ Double text-shadow stylée `0.04em 0.04em 0 #FFFF00, 0.08em 0.08em 0 #FF3B30` (jaune puis rouge) → effet BD/cartoon plus contrasté
- ✅ Loot.js : "MAINS DE FEU" color `#FF3B30` → `#0A0A0A` (noir sur jaune ultra lisible)
- ✅ Loot.js : "TIR FUSIL" color `#FFFFFF` → `#0A0A0A` (noir sur orange ultra lisible)

**Fichiers touchés** : Roster.jsx, Collection.jsx, ZoneDebile.jsx, Versus.jsx (2 titres), loot.js (2 bonus)

**Testé** : Screenshots iPhone 390px sur les 4 pages → tous les titres sont désormais clairement lisibles avec un effet cartoon stylé jaune+rouge.


## V17 - Pack "TOP 1 EN STUPIDITÉ" (2026-02-07)
**Contexte** : User veut passer du TOP 20 au TOP 1 en stupidité. Carte blanche pour créer.

**Implémenté** :
- 5 nouveaux personnages : Boomer Anti-Wifi, Caissier Auto-Scan, Plante Vengeresse, Yaourt Voleur, IA Traumatisée (gameData.js)
- 5 achievements WTF : pacifist, shouter, midnight, konami, humiliated (achievements.js)
- Roue de la Fortune quotidienne 8 prix débiles (`/lib/lottery.js` + `/components/LotteryWheel.jsx`)
- Notifications iOS-style fake 12 messages random aléatoires (`/components/FakeNotifications.jsx`)
- Easter eggs : Konami code → MODE TARPIN 8s hue violet + voice ; détection minuit 0h00-0h05 → message "L'heure de Mamie" (`/components/EasterEggs.jsx`)
- Narrateur documentaire David Attenborough au countdown via voice.say (Game.jsx)
- Bouton "🎬 PARTAGER MON HUMILIATION (X · TIKTOK · IG)" sur Game Over avec tweet pré-rempli (Game.jsx ResultScreen)
- App.js mount global FakeNotifications + EasterEggs
- Home.jsx mount LotteryWheel

**Fichiers touchés** :
- Nouveaux : lottery.js, LotteryWheel.jsx, FakeNotifications.jsx, EasterEggs.jsx
- Modifiés : gameData.js, achievements.js, Game.jsx, Home.jsx, App.js

**Testé** : Screenshot iPhone confirme roue visible + narrateur + bouton TikTok. Lint clean.


## V18 - Pack "DOMINATION" — Recherche concurrentielle implémentée (2026-02-07)
**Contexte** : User veut TOP 1, demande recherche concurrentielle. Identifié 5 concurrents (Slap Kings, Crazy Slap, Kick the Buddy, Cookie Clicker, Universal Paperclips). Implémenté 3 features stratégiques pour les battre tous.

**Implémenté** :

### Mode IDLE (inspiré Cookie Clicker — retention)
- ✅ `/lib/idle.js` : Gant Auto IA frappe en arrière-plan, 1 baffe/30s (scaling -2s tous les 10 games, plancher 5s). Points = 5 + (games/5)*2 par baffe. Cap 5000 baffes/session, ≥30s elapsed requis.
- ✅ `/components/IdleReward.jsx` : Popup welcome-back stylé avec Gant Auto 🤖, baffes cumulées, points gagnés, citation "Pendant que tu dormais, je l'ai baffée. Encore. Et encore."
- ✅ Points créditées directement dans profile.total_score
- ✅ Mount dans Home.jsx pour s'afficher au retour

### Mode ARSENAL (inspiré Kick the Buddy — fun)
- ✅ 5 nouvelles armes ajoutées à /lib/skins.js :
  - 🥖 Baguette tradition (games_3)
  - 🛒 Chariot Carrefour (kos_10)
  - 🎺 Trompette à air (combo_10)
  - 🌭 Hot-dog explosif (perfect_20)
  - 🪶 Mjölnir en plumes (score_50k)
- ✅ Ajout du parsing `score_NN` dans isSkinUnlocked (NN*1000)
- ✅ Total : 11 skins/armes disponibles

### Mode ESCALADE (inspiré Universal Paperclips — viralité)
- ✅ `/lib/escalade.js` : 5 paliers de stupidité débloquables au best_score
  - 0 pts → Mode Normal 👋
  - 1k pts → Mode Marteau-Pillon 🔨
  - 10k pts → Mamie Mecha 🤖
  - 100k pts → Mode Apocalyptique ☄️
  - 1M pts → Guerre contre la France 🇫🇷
- ✅ `/components/EscaladeWidget.jsx` : UI palier actuel + barre de progression vers le prochain + 5 chips avec emojis (🔒 si verrouillé)
- ✅ Mount dans Home.jsx entre Roue du Jour et Profile

**Fichiers touchés** :
- Nouveaux : `/lib/idle.js`, `/lib/escalade.js`, `/components/IdleReward.jsx`, `/components/EscaladeWidget.jsx`
- Modifiés : `/lib/skins.js` (5 armes + score parsing), `/pages/Home.jsx` (3 mounts)

**Testé** : Screenshot iPhone 390px confirme Roue + Escalade widget visibles avec palier "Mode Normal" affiché + barre de progression. Lint clean sur lib/idle.js, lib/escalade.js, EscaladeWidget.jsx.
