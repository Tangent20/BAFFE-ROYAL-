import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Legal = () => {
    const [active, setActive] = useState('mentions');
    const [cookieChoice, setCookieChoice] = useState(null);

    useEffect(() => {
        try {
            const c = localStorage.getItem('baffe_cookie_consent');
            setCookieChoice(c);
        } catch (e) {}
    }, []);

    const tabs = [
        { id: 'mentions', label: 'Mentions légales' },
        { id: 'rgpd', label: 'Confidentialité' },
        { id: 'cookies', label: 'Cookies' },
        { id: 'a11y', label: 'Accessibilité' },
        { id: 'cgu', label: 'CGU' },
    ];

    const handleCookieChoice = (choice) => {
        try {
            localStorage.setItem('baffe_cookie_consent', choice);
            setCookieChoice(choice);
            // Opt-out PostHog if user refuses
            if (typeof window !== 'undefined' && window.posthog) {
                if (choice === 'refused') {
                    try { window.posthog.opt_out_capturing(); } catch (e) {}
                } else {
                    try { window.posthog.opt_in_capturing(); } catch (e) {}
                }
            }
        } catch (e) {}
    };

    return (
        <div className="bg-cream relative min-h-screen overflow-x-hidden" data-testid="legal-page">
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <Link
                        to="/"
                        data-testid="legal-back-btn"
                        className="bg-white border-[3px] border-ink font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-100"
                    >
                        ← Accueil
                    </Link>
                    <h1 className="font-heading text-xl sm:text-3xl uppercase tracking-tight">📜 Légal</h1>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-5 border-y-4 border-ink py-3">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActive(t.id)}
                            data-testid={`legal-tab-${t.id}`}
                            className={`border-[3px] border-ink font-heading uppercase text-xs sm:text-sm px-3 py-1.5 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-100 ${active === t.id ? 'bg-tomato text-white' : 'bg-white'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white border-4 border-ink p-4 sm:p-6 shadow-[6px_6px_0px_#0A0A0A] font-body text-sm leading-relaxed">

                    {/* ===== MENTIONS LÉGALES ===== */}
                    {active === 'mentions' && (
                        <section data-testid="section-mentions">
                            <h2 className="font-heading text-2xl sm:text-3xl uppercase mb-3 underline decoration-tomato decoration-4 underline-offset-4">Mentions légales</h2>
                            <p className="mb-3 text-xs italic opacity-70">Conformément à la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique (LCEN).</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Éditeur du site</h3>
                            <ul className="space-y-0.5 ml-1">
                                <li><b>Nom :</b> Charly Soudan</li>
                                <li><b>Statut :</b> Auto-entrepreneur (immatriculation en cours)</li>
                                <li><b>Adresse :</b> 93290 Tremblay-en-France, France</li>
                                <li><b>Contact :</b> <span className="italic opacity-70">email en cours de création (sera communiqué dès création)</span></li>
                                <li><b>Directeur de la publication :</b> Charly Soudan</li>
                            </ul>
                            <p className="mt-2 p-2 bg-acid/40 border-2 border-ink text-xs">
                                ℹ️ Conformément à l&apos;article 6-III-2° de la LCEN, en tant qu&apos;éditeur non professionnel,
                                l&apos;auteur a communiqué ses coordonnées complètes (téléphone, adresse postale détaillée)
                                à l&apos;hébergeur du site (Emergent Labs) pour préserver son anonymat vis-à-vis du public,
                                tout en restant pleinement identifiable en cas de procédure judiciaire.
                            </p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Hébergement</h3>
                            <ul className="space-y-0.5 ml-1">
                                <li><b>Hébergeur :</b> Emergent Labs / Kubernetes Cloud</li>
                                <li><b>Site :</b> <a href="https://emergent.sh" target="_blank" rel="noopener noreferrer" className="text-tomato underline">emergent.sh</a></li>
                            </ul>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Propriété intellectuelle</h3>
                            <p className="mb-2">
                                L&apos;ensemble du contenu de ce site (code source, design, graphismes, textes, personnages,
                                noms de personnages, dialogues, sons) est la propriété exclusive de Charly Soudan,
                                sauf mentions contraires. Toute reproduction, modification ou exploitation sans autorisation
                                écrite préalable est interdite.
                            </p>
                            <p>
                                Les emojis utilisés sont fournis par les systèmes d&apos;exploitation (Unicode/Apple/Google)
                                et ne sont pas la propriété de l&apos;éditeur.
                            </p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Responsabilité</h3>
                            <p>
                                L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusées
                                mais ne saurait être tenu responsable des erreurs ou omissions. L&apos;utilisation du site
                                se fait sous la seule responsabilité de l&apos;utilisateur.
                            </p>
                        </section>
                    )}

                    {/* ===== RGPD ===== */}
                    {active === 'rgpd' && (
                        <section data-testid="section-rgpd">
                            <h2 className="font-heading text-2xl sm:text-3xl uppercase mb-3 underline decoration-tomato decoration-4 underline-offset-4">Politique de confidentialité</h2>
                            <p className="mb-3 text-xs italic opacity-70">
                                Conformément au Règlement Général sur la Protection des Données (RGPD) UE 2016/679 et à la loi Informatique et Libertés modifiée.
                            </p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Responsable du traitement</h3>
                            <p>Charly Soudan — 93290 Tremblay-en-France. Pour toute demande RGPD, contact via le formulaire de classement du jeu en attendant la mise en ligne de l&apos;email officiel.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Données collectées</h3>
                            <ul className="list-disc ml-5 space-y-1">
                                <li><b>Pseudo de jeu</b> (choisi librement par l&apos;utilisateur, peut être anonyme)</li>
                                <li><b>Score, nombre de KO, combo max, durée de partie</b> — uniquement quand l&apos;utilisateur soumet son score au classement mondial</li>
                                <li><b>Données techniques anonymes</b> via PostHog : type d&apos;appareil, navigateur, pages visitées (uniquement si tu acceptes les cookies analytiques)</li>
                                <li><b>Profil local</b> : meilleur score, achievements, skin actif — stocké dans le <code>localStorage</code> de ton navigateur uniquement</li>
                            </ul>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Finalités</h3>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>Permettre le fonctionnement du jeu (profil, achievements, daily streak)</li>
                                <li>Afficher un classement mondial des joueurs</li>
                                <li>Améliorer l&apos;expérience via des statistiques d&apos;usage anonymes</li>
                            </ul>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Base légale</h3>
                            <p>Le traitement repose sur ton <b>consentement</b> (Art. 6.1.a RGPD) lorsque tu soumets un score
                            et sur l&apos;<b>intérêt légitime</b> (Art. 6.1.f) pour le fonctionnement technique du site.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Durée de conservation</h3>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>Scores et pseudos du classement : 12 mois après le dernier accès</li>
                                <li>Données techniques PostHog : 12 mois maximum</li>
                                <li>Profil <code>localStorage</code> : tant que tu ne vides pas ton navigateur</li>
                            </ul>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Tes droits</h3>
                            <p>Tu disposes des droits d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition, de limitation
                            et de portabilité sur tes données. Pour exercer ces droits, écris à l&apos;éditeur (email à venir, voir mentions légales).</p>
                            <p className="mt-2">Tu peux également introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-tomato underline">CNIL</a> si tu estimes que tes droits ne sont pas respectés.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Transfert hors UE</h3>
                            <p>PostHog (analytique) peut traiter certaines données techniques sur des serveurs aux États-Unis,
                            sous clauses contractuelles types validées par la Commission Européenne.</p>
                        </section>
                    )}

                    {/* ===== COOKIES ===== */}
                    {active === 'cookies' && (
                        <section data-testid="section-cookies">
                            <h2 className="font-heading text-2xl sm:text-3xl uppercase mb-3 underline decoration-tomato decoration-4 underline-offset-4">Politique de cookies</h2>
                            <p className="mb-3 text-xs italic opacity-70">Conformément aux recommandations de la CNIL et de la directive ePrivacy 2002/58/CE.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Qu&apos;est-ce qu&apos;un cookie ?</h3>
                            <p>Un cookie est un petit fichier déposé sur ton appareil lors de la visite d&apos;un site. Il sert à
                            mémoriser des informations (préférences, profil, statistiques).</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Cookies utilisés sur Baffe Royale</h3>
                            <div className="overflow-x-auto -mx-2 sm:mx-0">
                                <table className="w-full text-xs sm:text-sm mt-2 border-2 border-ink">
                                    <thead className="bg-acid">
                                        <tr><th className="border border-ink p-2 text-left">Nom</th><th className="border border-ink p-2 text-left">Type</th><th className="border border-ink p-2 text-left">Finalité</th><th className="border border-ink p-2 text-left">Durée</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border border-ink p-2"><code>baffe_royale_profile_v1</code></td><td className="border border-ink p-2">Essentiel</td><td className="border border-ink p-2">Profil joueur local</td><td className="border border-ink p-2">Permanent (localStorage)</td></tr>
                                        <tr><td className="border border-ink p-2"><code>baffe_voice_enabled</code></td><td className="border border-ink p-2">Essentiel</td><td className="border border-ink p-2">Préférence voix off</td><td className="border border-ink p-2">Permanent</td></tr>
                                        <tr><td className="border border-ink p-2"><code>baffe_active_skin</code></td><td className="border border-ink p-2">Essentiel</td><td className="border border-ink p-2">Skin de gant choisi</td><td className="border border-ink p-2">Permanent</td></tr>
                                        <tr><td className="border border-ink p-2"><code>baffe_versus_wins</code></td><td className="border border-ink p-2">Essentiel</td><td className="border border-ink p-2">Stats du mode Versus</td><td className="border border-ink p-2">Permanent</td></tr>
                                        <tr><td className="border border-ink p-2"><code>ph_*</code> (PostHog)</td><td className="border border-ink p-2">Analytique</td><td className="border border-ink p-2">Statistiques d&apos;usage</td><td className="border border-ink p-2">12 mois</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Cookies essentiels</h3>
                            <p>Nécessaires au fonctionnement du jeu (profil local, préférences). Ils ne nécessitent pas
                            ton consentement (CNIL).</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">Cookies analytiques (PostHog)</h3>
                            <p>Ces cookies sont déposés <b>uniquement</b> si tu acceptes ci-dessous. Ils servent à
                            comprendre comment les joueurs utilisent le site (pages les plus visitées, durée de session, etc.)
                            pour améliorer le jeu. Aucune donnée n&apos;est revendue.</p>

                            <div className="mt-4 p-3 sm:p-4 border-4 border-ink bg-acid">
                                <p className="font-heading text-sm uppercase mb-2">🍪 Ton consentement aujourd&apos;hui :</p>
                                <p className="text-xs mb-3">
                                    Statut actuel : <b>{cookieChoice === 'accepted' ? '✅ Acceptés' : cookieChoice === 'refused' ? '🚫 Refusés' : '❓ Pas encore choisi'}</b>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCookieChoice('accepted')}
                                        data-testid="cookie-accept-btn"
                                        className="bg-tomato text-white border-2 border-ink font-heading uppercase text-xs sm:text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all"
                                    >
                                        ✅ Accepter
                                    </button>
                                    <button
                                        onClick={() => handleCookieChoice('refused')}
                                        data-testid="cookie-refuse-btn"
                                        className="bg-white border-2 border-ink font-heading uppercase text-xs sm:text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all"
                                    >
                                        🚫 Refuser
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ===== ACCESSIBILITÉ ===== */}
                    {active === 'a11y' && (
                        <section data-testid="section-a11y">
                            <h2 className="font-heading text-2xl sm:text-3xl uppercase mb-3 underline decoration-tomato decoration-4 underline-offset-4">Accessibilité numérique</h2>
                            <p className="mb-3 text-xs italic opacity-70">
                                Conformément à la loi n°2005-102 du 11 février 2005 sur l&apos;égalité des droits et à l&apos;article 47 de la loi
                                n°2005-102, ainsi qu&apos;aux référentiels RGAA 4.1 et WCAG 2.1 niveau AA.
                            </p>

                            <div className="p-3 bg-acid/30 border-2 border-ink mb-4">
                                <p className="font-heading text-base uppercase">Déclaration d&apos;accessibilité</p>
                                <p className="text-xs mt-1">
                                    L&apos;éditeur s&apos;engage à rendre Baffe Royale accessible au plus grand nombre,
                                    incluant les personnes en situation de handicap (visuel, moteur, cognitif, auditif, vestibulaire).
                                </p>
                                <p className="text-xs mt-2"><b>Niveau visé :</b> WCAG 2.1 AA — <b>Conformité partielle</b> (en cours d&apos;amélioration).</p>
                            </div>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">✅ Mesures déjà mises en place</h3>
                            <ul className="list-disc ml-5 space-y-1">
                                <li><b>Navigation clavier</b> : tous les boutons et liens sont accessibles via Tab/Espace/Entrée</li>
                                <li><b>Focus visible</b> : contour rouge épais (3px) sur l&apos;élément ciblé au clavier</li>
                                <li><b>Lien d&apos;évitement</b> : "Aller au contenu principal" en haut de page (Tab depuis le début)</li>
                                <li><b>Langue déclarée</b> : <code>lang=&quot;fr&quot;</code> sur la page HTML</li>
                                <li><b>Sémantique HTML</b> : balises <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;footer&gt;</code> correctement utilisées</li>
                                <li><b>Labels accessibles</b> : <code>aria-label</code> sur les boutons icônes (voix, classement)</li>
                                <li><b>Contraste</b> : texte sombre sur fond clair, contraste &gt; 4.5:1 sur les éléments principaux</li>
                                <li><b>Tailles tactiles</b> : tous les boutons font ≥ 44×44 pixels (WCAG 2.5.5)</li>
                                <li><b>Mouvement réduit</b> : respect de <code>prefers-reduced-motion</code> — animations désactivées si l&apos;OS le demande</li>
                                <li><b>Pas d&apos;épilepsie</b> : aucun clignotement &gt; 3 fois/seconde</li>
                                <li><b>Sons</b> : voix off et SFX optionnels (bouton 🔊/🔇 dans le menu)</li>
                                <li><b>Vibrations</b> : utilisées comme bonus tactile, jamais comme seule information</li>
                                <li><b>Zoom</b> : viewport configuré pour permettre le pinch-to-zoom natif</li>
                                <li><b>Texte alternatif</b> : tous les emojis décoratifs ont <code>aria-hidden=&quot;true&quot;</code> pour éviter le bruit pour lecteurs d&apos;écran</li>
                            </ul>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">⚠️ Limitations connues</h3>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>Le jeu repose sur le <b>réflexe visuel et tactile</b> (charger/relâcher). Les personnes en situation de handicap moteur sévère peuvent être limitées.</li>
                                <li>La <b>charge sonore</b> apporte un plus mais n&apos;est pas indispensable — toutes les infos sont visuelles.</li>
                                <li>Les <b>animations rapides</b> (combos, particules) peuvent gêner certaines personnes — utilise les paramètres "mouvement réduit" de ton OS pour les neutraliser.</li>
                            </ul>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">📞 Contact pour problèmes d&apos;accès</h3>
                            <p>
                                Si tu rencontres un problème d&apos;accessibilité, contacte l&apos;éditeur via les coordonnées
                                fournies dans les mentions légales. Nous nous engageons à répondre sous 7 jours et à proposer
                                une solution adaptée.
                            </p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">🏛️ Voies de recours</h3>
                            <p>
                                Si malgré nos efforts une réponse satisfaisante n&apos;est pas apportée, tu peux :
                            </p>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>Écrire au <a href="https://www.defenseurdesdroits.fr/" target="_blank" rel="noopener noreferrer" className="text-tomato underline">Défenseur des droits</a></li>
                                <li>Contacter un délégué du Défenseur des droits de ta région</li>
                                <li>Envoyer un courrier postal au Défenseur des droits, 7 rue Saint-Florentin, 75409 Paris Cedex 08</li>
                            </ul>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">📋 Audit & date</h3>
                            <p className="text-xs">
                                Cette déclaration a été établie le <b>06 janvier 2026</b>. Dernière mise à jour : 06 janvier 2026.
                                Audit interne basé sur RGAA 4.1.2 et WCAG 2.1 AA. Aucun audit externe certifié n&apos;a encore été réalisé.
                            </p>
                        </section>
                    )}

                    {/* ===== CGU ===== */}
                    {active === 'cgu' && (
                        <section data-testid="section-cgu">
                            <h2 className="font-heading text-2xl sm:text-3xl uppercase mb-3 underline decoration-tomato decoration-4 underline-offset-4">Conditions générales d&apos;utilisation</h2>
                            <p className="mb-3 text-xs italic opacity-70">Dernière mise à jour : janvier 2026.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">1. Objet</h3>
                            <p>Baffe Royale est un jeu de réflexe gratuit accessible en ligne. Le présent document définit
                            les conditions d&apos;utilisation entre l&apos;éditeur (Charly Soudan) et l&apos;utilisateur.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">2. Accès au service</h3>
                            <p>Le service est gratuit, sans inscription obligatoire, et accessible 24h/24 sauf maintenance
                            ou cas de force majeure. L&apos;éditeur ne garantit pas une disponibilité absolue.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">3. Comportement de l&apos;utilisateur</h3>
                            <p>L&apos;utilisateur s&apos;engage à :</p>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>Ne pas utiliser de pseudo injurieux, raciste, violent ou contraire aux bonnes mœurs</li>
                                <li>Ne pas tenter de pirater ou détourner le système de scores</li>
                                <li>Ne pas utiliser de bots ou scripts automatisés</li>
                            </ul>
                            <p className="mt-2">L&apos;éditeur se réserve le droit de supprimer tout score ou pseudo non conforme.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">4. Caractère fictif du contenu</h3>
                            <p>Tous les personnages, dialogues et situations présentés (Mamie Ninja, Maman, Papa, Flamby Ultime, etc.)
                            sont <b>purement fictifs</b> et humoristiques. Aucun mamie, parent, pigeon, croûton, baguette ou flan
                            n&apos;a été blessé pendant la création de ce jeu.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">5. Limitation de responsabilité</h3>
                            <p>L&apos;éditeur ne pourra être tenu responsable de tout dommage direct ou indirect résultant
                            de l&apos;utilisation du service, notamment perte de données, fou rire incontrôlé, douleur au doigt
                            d&apos;avoir trop tapé sur l&apos;écran, ou conflit familial post-partie.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">6. Modification des CGU</h3>
                            <p>L&apos;éditeur peut modifier ces CGU à tout moment. Les modifications entrent en vigueur dès
                            leur publication sur cette page.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">7. Droit applicable</h3>
                            <p>Les présentes CGU sont soumises au <b>droit français</b>. Tout litige sera de la compétence
                            exclusive des <b>tribunaux français</b>, sous réserve des dispositions impératives applicables
                            aux consommateurs.</p>

                            <h3 className="font-heading text-base uppercase mt-4 mb-1">8. Contact</h3>
                            <p>Pour toute question : Charly Soudan — 93290 Tremblay-en-France. Email de contact en cours de création (sera publié sur les mentions légales).</p>
                        </section>
                    )}
                </div>

                <p className="text-center text-[10px] sm:text-xs font-body font-bold uppercase tracking-widest opacity-60 mt-6">
                    © 2026 Charly Soudan · Baffe Royale · Tous droits réservés
                </p>
            </div>
        </div>
    );
};

export default Legal;
