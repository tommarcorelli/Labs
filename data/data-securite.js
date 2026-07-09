// TP & Labs IT — Catégorie : securite
// 15 TP(s)

const LABS_SECURITE = [
  {
    id: 12,
    titre: "ACL standard et étendue sur routeur Cisco IOS",
    categorie: "securite",
    niveau: "intermédiaire",
    duree: 80,
    description: "Configurer des listes de contrôle d'accès (ACL) pour filtrer le trafic réseau sur un routeur Cisco. On commence par les ACL standard (filtrage sur IP source uniquement), puis les ACL étendues (filtrage sur source, destination, protocole et port). On applique les règles d'or de placement des ACL et on vérifie avec des tests de ping.",
    objectifs: [
      "Distinguer ACL standard (numérotées 1-99) et étendues (100-199)",
      "Créer des ACL numérotées et nommées avec les bonnes règles",
      "Comprendre le implicit deny en fin d'ACL et ses conséquences",
      "Appliquer les ACL sur les bonnes interfaces dans le bon sens (in/out)",
      "Vérifier le filtrage avec show ip access-lists et des tests de connectivité"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+" },
      { type: "vm",       nom: "2x Cisco IOSv (routeurs)" },
      { type: "vm",       nom: "3-4x VPCS (clients)" },
      { type: "reseau",   nom: "Routage statique ou OSPF maîtrisé" }
    ],
    schema_reseau: `<svg viewBox="0 0 620 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
    <marker id="arrR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#EF4444"/>
    </marker>
  </defs>
  <!-- LAN Interne -->
  <rect x="20" y="30" width="150" height="190" rx="8" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="95" y="48" text-anchor="middle" fill="#3B82F6" font-size="8">LAN — 10.0.1.0/24</text>
  <rect x="35" y="60" width="70" height="35" rx="5" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="70" y="78" text-anchor="middle" fill="#A8A29E" font-size="9">PC-ADMIN</text>
  <text x="70" y="90" text-anchor="middle" fill="#78716C" font-size="7">10.0.1.10</text>
  <rect x="35" y="115" width="70" height="35" rx="5" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="70" y="133" text-anchor="middle" fill="#A8A29E" font-size="9">PC-USER</text>
  <text x="70" y="145" text-anchor="middle" fill="#78716C" font-size="7">10.0.1.20</text>
  <rect x="35" y="170" width="70" height="35" rx="5" fill="#1C1917" stroke="#EF4444" stroke-width="1.5"/>
  <text x="70" y="188" text-anchor="middle" fill="#A8A29E" font-size="9">PC-GUEST</text>
  <text x="70" y="200" text-anchor="middle" fill="#78716C" font-size="7">10.0.1.30</text>
  <!-- Routeur -->
  <ellipse cx="300" cy="130" rx="50" ry="35" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="300" y="125" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">R1</text>
  <text x="300" y="140" text-anchor="middle" fill="#A8A29E" font-size="8">ACL appliquées</text>
  <line x1="170" y1="130" x2="250" y2="130" stroke="#F59E0B" stroke-width="2" marker-end="url(#arr7)"/>
  <text x="210" y="122" text-anchor="middle" fill="#78716C" font-size="7">Gi0/0 (in)</text>
  <!-- Zone DMZ -->
  <rect x="430" y="30" width="170" height="190" rx="8" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="515" y="48" text-anchor="middle" fill="#EF4444" font-size="8">DMZ — 10.0.2.0/24</text>
  <rect x="450" y="60" width="80" height="35" rx="5" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="490" y="78" text-anchor="middle" fill="#A8A29E" font-size="9">Serveur Web</text>
  <text x="490" y="90" text-anchor="middle" fill="#78716C" font-size="7">10.0.2.10 :80</text>
  <rect x="450" y="115" width="80" height="35" rx="5" fill="#1C1917" stroke="#EF4444" stroke-width="1.5"/>
  <text x="490" y="133" text-anchor="middle" fill="#A8A29E" font-size="9">Serveur SSH</text>
  <text x="490" y="145" text-anchor="middle" fill="#78716C" font-size="7">10.0.2.20 :22</text>
  <line x1="350" y1="130" x2="430" y2="130" stroke="#F59E0B" stroke-width="2" marker-end="url(#arr7)"/>
  <text x="390" y="122" text-anchor="middle" fill="#78716C" font-size="7">Gi0/1 (out)</text>
  <!-- ACL label -->
  <rect x="230" y="175" width="140" height="40" rx="5" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" stroke-width="1"/>
  <text x="300" y="191" text-anchor="middle" fill="#F59E0B" font-size="8" font-weight="bold">ACL étendue 110</text>
  <text x="300" y="205" text-anchor="middle" fill="#78716C" font-size="7">permit/deny par src+dst+port</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Comprendre les règles d'or des ACL",
        contexte: "Avant de configurer, deux règles fondamentales à mémoriser : (1) Toute ACL se termine par un 'deny any' implicite invisible — si le trafic ne matche aucune règle, il est bloqué. (2) Placement : ACL standard le plus PRÈS de la destination, ACL étendue le plus PRÈS de la SOURCE (pour bloquer tôt et ne pas surcharger le réseau).",
        commandes: [
          { os: "both", cmd: "# Règle d'or placement :\n# ACL STANDARD (filtre IP source) → placer PRÈS de la DESTINATION\n# ACL ÉTENDUE (filtre src+dst+port) → placer PRÈS de la SOURCE\n#\n# Sens d'application :\n# 'in'  = trafic entrant sur l'interface (avant le routage)\n# 'out' = trafic sortant de l'interface (après le routage)", commentaire: "Mémoriser ces règles avant toute configuration" }
        ],
        erreurs_courantes: [
          {
            symptome: "L'ACL bloque tout le trafic y compris le trafic autorisé",
            cause: "Oubli du 'permit' final — le deny implicite bloque tout ce qui ne matche pas",
            solution: "Toujours terminer une ACL restrictive par 'permit ip any any' si on veut autoriser le reste, ou vérifier que chaque flux légitime a bien sa règle permit."
          }
        ]
      },
      {
        titre: "Étape 2 — ACL standard : bloquer un hôte spécifique",
        contexte: "Les ACL standard (1-99 ou 1300-1999) filtrent uniquement sur l'adresse IP source. Cas d'usage : bloquer PC-GUEST (10.0.1.30) d'accéder à toute la DMZ. On la place sur Gi0/1 en direction 'out' (sortie vers la DMZ) — près de la destination.",
        commandes: [
          { os: "linux", cmd: "! ACL standard numérotée :\nR1(config)# access-list 10 deny host 10.0.1.30\nR1(config)# access-list 10 permit any", commentaire: "ACL 10 : bloquer 10.0.1.30, autoriser tout le reste" },
          { os: "linux", cmd: "! Appliquer sur Gi0/1 en sortie (vers DMZ) :\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip access-group 10 out", commentaire: "Placement : près de la destination (DMZ) en sortie" },
          { os: "linux", cmd: "R1# show ip access-lists 10", commentaire: "Vérifier l'ACL et les compteurs de matches après tests" },
          { os: "linux", cmd: "! ACL standard NOMMÉE (plus lisible) :\nR1(config)# ip access-list standard BLOQUER-GUEST\nR1(config-std-nacl)# deny host 10.0.1.30\nR1(config-std-nacl)# permit any", commentaire: "Même résultat mais avec un nom explicite" }
        ],
        erreurs_courantes: [
          {
            symptome: "L'ACL standard bloque aussi le trafic de retour",
            cause: "Les ACL sont stateless — elles ne suivent pas les sessions",
            solution: "Pour le trafic de retour, utiliser une ACL sur l'interface opposée, ou passer aux ACL étendues avec 'established' pour TCP, ou utiliser des access-lists réflexives."
          }
        ]
      },
      {
        titre: "Étape 3 — ACL étendue : filtrage précis par protocole et port",
        contexte: "Les ACL étendues (100-199 ou 2000-2699) filtrent sur source, destination, protocole (TCP/UDP/ICMP) et numéro de port. Cas d'usage : autoriser seulement PC-ADMIN à faire du SSH (port 22) vers les serveurs, autoriser HTTP (port 80) pour tous, bloquer tout le reste.",
        commandes: [
          { os: "linux", cmd: "R1(config)# ip access-list extended FILTRAGE-DMZ\nR1(config-ext-nacl)# permit tcp host 10.0.1.10 host 10.0.2.20 eq 22\nR1(config-ext-nacl)# permit tcp 10.0.1.0 0.0.0.255 host 10.0.2.10 eq 80\nR1(config-ext-nacl)# permit icmp 10.0.1.0 0.0.0.255 10.0.2.0 0.0.0.255\nR1(config-ext-nacl)# deny ip any any log", commentaire: "ACL étendue nommée : SSH admin seul, HTTP tout le monde, ICMP, deny final avec log" },
          { os: "linux", cmd: "! Appliquer sur Gi0/0 en entrée (depuis LAN) — près de la source :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip access-group FILTRAGE-DMZ in", commentaire: "Placement : près de la source (LAN) en entrée" },
          { os: "linux", cmd: "R1# show ip access-lists FILTRAGE-DMZ", commentaire: "Voir les règles et les compteurs — les matches s'incrémentent à chaque paquet filtré" }
        ],
        erreurs_courantes: [
          {
            symptome: "Ping fonctionne mais SSH bloqué alors que la règle permit existe",
            cause: "L'ordre des règles dans l'ACL est incorrect — une règle deny plus haute matche avant le permit SSH",
            solution: "Les ACL sont lues séquentiellement — la première règle qui matche s'applique. Vérifier l'ordre avec 'show ip access-lists'. Supprimer et recréer l'ACL si nécessaire (pas d'insertion dans une ACL numérotée — utiliser les ACL nommées)."
          },
          {
            symptome: "Impossible de modifier une règle dans une ACL numérotée existante",
            cause: "Les ACL numérotées ne permettent pas l'édition — on ne peut qu'ajouter ou tout supprimer",
            solution: "Utiliser des ACL nommées (ip access-list extended NOM) qui supportent la numérotation de séquence et l'édition ligne par ligne : 'no 30' supprime la ligne 30."
          }
        ]
      },
      {
        titre: "Étape 4 — Vérifier, modifier et déboguer les ACL",
        contexte: "On vérifie le comportement de l'ACL avec des tests de ping/telnet depuis les différents PCs, puis on analyse les compteurs. On apprend aussi à modifier une ACL nommée sans la supprimer entièrement.",
        commandes: [
          { os: "linux", cmd: "R1# show ip access-lists", commentaire: "Afficher toutes les ACL avec leurs compteurs de matches" },
          { os: "linux", cmd: "R1# show ip interface GigabitEthernet0/0 | include access list", commentaire: "Vérifier quelle ACL est appliquée sur l'interface et dans quel sens" },
          { os: "linux", cmd: "! Modifier une ACL nommée — ajouter une règle en position 25 :\nR1(config)# ip access-list extended FILTRAGE-DMZ\nR1(config-ext-nacl)# 25 permit tcp host 10.0.1.20 host 10.0.2.20 eq 22", commentaire: "Insérer une règle entre les séquences 20 et 30 sans tout recréer" },
          { os: "linux", cmd: "! Supprimer une règle spécifique :\nR1(config)# ip access-list extended FILTRAGE-DMZ\nR1(config-ext-nacl)# no 25", commentaire: "Supprimer la règle de séquence 25" },
          { os: "linux", cmd: "R1# clear ip access-list counters FILTRAGE-DMZ", commentaire: "Remettre les compteurs à zéro pour des tests propres" },
          { os: "linux", cmd: "R1# debug ip packet detail\n# Tester le trafic depuis les PCs\nR1# undebug all", commentaire: "Observer en temps réel quels paquets sont permis/bloqués" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "ACL standard 10 ou BLOQUER-GUEST : PC-GUEST (10.0.1.30) ne peut pas pinguer la DMZ",
      "PC-ADMIN et PC-USER peuvent toujours pinguer la DMZ",
      "ACL étendue FILTRAGE-DMZ appliquée sur Gi0/0 en 'in'",
      "PC-ADMIN peut SSH vers 10.0.2.20 (port 22) — règle permit vérifiée",
      "PC-USER peut HTTP vers 10.0.2.10 (port 80) — règle permit vérifiée",
      "show ip access-lists : compteurs de matches cohérents avec les tests effectués",
      "deny ip any any log en fin d'ACL étendue — trafic bloqué visible dans les logs"
    ],
    tags: ["acl", "access-list", "filtrage", "securite", "cisco", "gns3", "tcp", "udp", "extended"],
    date_ajout: "2026-03-10",
    source: "École"
  },

  {
    id: 13,
    titre: "AAA et authentification RADIUS sur Cisco IOS",
    categorie: "securite",
    niveau: "avancé",
    duree: 90,
    description: "Configurer l'authentification centralisée AAA (Authentication, Authorization, Accounting) sur un routeur Cisco IOS avec un serveur RADIUS. Les identifiants des administrateurs réseau sont vérifiés sur le serveur RADIUS plutôt que stockés localement sur chaque équipement — indispensable en environnement multi-équipements.",
    objectifs: [
      "Comprendre le modèle AAA et la différence entre RADIUS et TACACS+",
      "Installer et configurer un serveur RADIUS (FreeRADIUS sur Linux ou GNS3)",
      "Configurer l'authentification AAA sur IOS pour les accès VTY (SSH/Telnet) et console",
      "Définir un fallback local en cas d'indisponibilité du serveur RADIUS",
      "Tester la connexion avec des comptes RADIUS et vérifier l'accounting"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+" },
      { type: "vm",       nom: "1x Cisco IOSv (routeur à sécuriser)" },
      { type: "vm",       nom: "1x VM Linux Debian/Ubuntu (serveur RADIUS)" },
      { type: "reseau",   nom: "SSH configuré sur le routeur Cisco" },
      { type: "reseau",   nom: "Connectivité IP entre le routeur et la VM Linux" }
    ],
    schema_reseau: `<svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
  </defs>
  <!-- Admin -->
  <rect x="20" y="100" width="80" height="50" rx="6" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="60" y="122" text-anchor="middle" fill="#A8A29E" font-size="9">Admin</text>
  <text x="60" y="136" text-anchor="middle" fill="#78716C" font-size="7">SSH client</text>
  <!-- Routeur -->
  <ellipse cx="260" cy="125" rx="55" ry="38" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="260" y="118" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">R1</text>
  <text x="260" y="133" text-anchor="middle" fill="#A8A29E" font-size="8">AAA Client</text>
  <text x="260" y="145" text-anchor="middle" fill="#78716C" font-size="7">192.168.1.1</text>
  <line x1="100" y1="125" x2="205" y2="125" stroke="#3B82F6" stroke-width="2" marker-end="url(#arr8)"/>
  <text x="152" y="117" text-anchor="middle" fill="#3B82F6" font-size="7">SSH :22</text>
  <!-- Serveur RADIUS -->
  <rect x="420" y="75" width="170" height="100" rx="8" fill="#1C1917" stroke="#10B981" stroke-width="2"/>
  <text x="505" y="100" text-anchor="middle" fill="#10B981" font-size="11" font-weight="bold">FreeRADIUS</text>
  <text x="505" y="115" text-anchor="middle" fill="#A8A29E" font-size="8">192.168.1.100</text>
  <text x="505" y="130" text-anchor="middle" fill="#78716C" font-size="7">Port UDP 1812 (auth)</text>
  <text x="505" y="143" text-anchor="middle" fill="#78716C" font-size="7">Port UDP 1813 (accounting)</text>
  <text x="505" y="158" text-anchor="middle" fill="#78716C" font-size="7">Secret: cisco-radius-secret</text>
  <!-- Lien RADIUS -->
  <line x1="315" y1="110" x2="420" y2="110" stroke="#10B981" stroke-width="2" marker-end="url(#arr8)"/>
  <line x1="420" y1="135" x2="315" y2="135" stroke="#10B981" stroke-width="2" marker-end="url(#arr8)"/>
  <text x="367" y="103" text-anchor="middle" fill="#10B981" font-size="7">Access-Request</text>
  <text x="367" y="148" text-anchor="middle" fill="#10B981" font-size="7">Access-Accept/Reject</text>
  <!-- Flux AAA -->
  <rect x="150" y="185" width="320" height="50" rx="6" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.2)" stroke-width="1"/>
  <text x="310" y="205" text-anchor="middle" fill="#F59E0B" font-size="8" font-weight="bold">Flux AAA</text>
  <text x="310" y="220" text-anchor="middle" fill="#78716C" font-size="7">1.Admin SSH → R1  2.R1 envoie Access-Request RADIUS  3.RADIUS répond Accept/Reject</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Installer et configurer FreeRADIUS sur Debian/Ubuntu",
        contexte: "FreeRADIUS est le serveur RADIUS open-source le plus utilisé. On l'installe sur la VM Linux, on configure le secret partagé avec le routeur Cisco (NAS client), et on crée les comptes utilisateurs qui pourront s'authentifier.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install freeradius -y", commentaire: "Installer FreeRADIUS" },
          { os: "linux", cmd: "sudo nano /etc/freeradius/3.0/clients.conf", commentaire: "Déclarer le routeur Cisco comme client RADIUS autorisé" },
          { os: "linux", cmd: "# Ajouter dans clients.conf :\nclient cisco-r1 {\n    ipaddr          = 192.168.1.1\n    secret          = cisco-radius-secret\n    shortname       = R1\n    nas_type        = cisco\n}", commentaire: "Déclarer R1 avec son IP et le secret partagé" },
          { os: "linux", cmd: "sudo nano /etc/freeradius/3.0/users", commentaire: "Ajouter les comptes utilisateurs réseau" },
          { os: "linux", cmd: "# Ajouter dans users :\nadmin-net   Cleartext-Password := \"AdminPass123\"\n            Service-Type = NAS-Prompt-User,\n            Cisco-AVPair = \"shell:priv-lvl=15\"\n\nop-reseau   Cleartext-Password := \"OpPass456\"\n            Service-Type = NAS-Prompt-User,\n            Cisco-AVPair = \"shell:priv-lvl=7\"", commentaire: "admin-net : accès niveau 15 (enable) / op-reseau : niveau 7 (limité)" },
          { os: "linux", cmd: "sudo freeradius -X", commentaire: "Démarrer FreeRADIUS en mode debug pour voir les erreurs en temps réel" },
          { os: "linux", cmd: "# Dans un autre terminal — tester RADIUS localement :\nradtest admin-net AdminPass123 127.0.0.1 0 cisco-radius-secret", commentaire: "Test local : doit retourner 'Access-Accept'" }
        ],
        erreurs_courantes: [
          {
            symptome: "radtest retourne 'Access-Reject'",
            cause: "Mot de passe incorrect dans users, ou le compte n'existe pas",
            solution: "Vérifier l'orthographe exacte dans /etc/freeradius/3.0/users. FreeRADIUS est sensible à la casse et aux espaces. Relancer avec 'sudo freeradius -X' pour voir les logs détaillés."
          },
          {
            symptome: "radtest timeout — pas de réponse",
            cause: "FreeRADIUS n'écoute pas sur l'interface, ou firewall bloque UDP 1812",
            solution: "sudo ufw allow 1812/udp && sudo ufw allow 1813/udp. Vérifier que FreeRADIUS écoute : ss -ulnp | grep 1812"
          }
        ]
      },
      {
        titre: "Étape 2 — Configurer SSH sur le routeur Cisco",
        contexte: "Avant d'activer AAA, on s'assure que SSH est correctement configuré sur R1. Un compte local admin doit exister comme fallback en cas d'indisponibilité RADIUS — sans ce fallback, une panne RADIUS vous locke hors de l'équipement.",
        commandes: [
          { os: "linux", cmd: "R1(config)# hostname R1\nR1(config)# ip domain-name lab.local\nR1(config)# crypto key generate rsa modulus 2048", commentaire: "Prérequis SSH : hostname, domaine, clé RSA 2048 bits" },
          { os: "linux", cmd: "R1(config)# ip ssh version 2\nR1(config)# ip ssh time-out 60\nR1(config)# ip ssh authentication-retries 3", commentaire: "Forcer SSHv2 uniquement" },
          { os: "linux", cmd: "! Compte local de fallback OBLIGATOIRE :\nR1(config)# username admin privilege 15 secret FallbackPass789", commentaire: "Compte local utilisé si RADIUS est injoignable" },
          { os: "linux", cmd: "R1# show ip ssh", commentaire: "Vérifier SSH version 2 activé et opérationnel" }
        ],
        erreurs_courantes: [
          {
            symptome: "Crypto key generate rsa échoue ou demande confirmation bizarre",
            cause: "hostname ou ip domain-name non configuré",
            solution: "Ces deux commandes sont obligatoires avant la génération de clé RSA. Sans elles, IOS ne peut pas nommer la clé."
          }
        ]
      },
      {
        titre: "Étape 3 — Configurer AAA sur le routeur Cisco",
        contexte: "On configure le serveur RADIUS, puis on active AAA et on définit les méthodes d'authentification. L'ordre des méthodes définit le fallback : 'group radius local' signifie essayer RADIUS d'abord, puis le compte local si RADIUS est injoignable.",
        commandes: [
          { os: "linux", cmd: "! Déclarer le serveur RADIUS :\nR1(config)# radius server FREERADIUS\nR1(config-radius-server)# address ipv4 192.168.1.100 auth-port 1812 acct-port 1813\nR1(config-radius-server)# key cisco-radius-secret\nR1(config-radius-server)# exit", commentaire: "Déclarer FreeRADIUS avec son IP, ports et secret partagé" },
          { os: "linux", cmd: "! Créer un groupe de serveurs RADIUS :\nR1(config)# aaa group server radius GROUPE-RADIUS\nR1(config-sg-radius)# server name FREERADIUS\nR1(config-sg-radius)# exit", commentaire: "Grouper les serveurs RADIUS pour les référencer dans les policies AAA" },
          { os: "linux", cmd: "! Activer AAA :\nR1(config)# aaa new-model", commentaire: "ATTENTION : active immédiatement AAA — avoir le fallback local configuré AVANT" },
          { os: "linux", cmd: "! Définir les méthodes d'authentification :\nR1(config)# aaa authentication login METHODE-SSH group GROUPE-RADIUS local\nR1(config)# aaa authentication login METHODE-CONSOLE local", commentaire: "SSH : RADIUS puis local en fallback / Console : local uniquement" },
          { os: "linux", cmd: "! Appliquer sur les lignes VTY et console :\nR1(config)# line vty 0 4\nR1(config-line)# login authentication METHODE-SSH\nR1(config-line)# transport input ssh\nR1(config)# line console 0\nR1(config-line)# login authentication METHODE-CONSOLE", commentaire: "Lier les méthodes AAA aux lignes d'accès" }
        ],
        erreurs_courantes: [
          {
            symptome: "Après 'aaa new-model', plus aucun accès possible",
            cause: "aaa new-model a été activé SANS définir les méthodes d'authentification ni avoir de compte local",
            solution: "Accéder par la console physique (ou GNS3 console). Sur la console : username admin privilege 15 secret X, puis aaa authentication login default local. Ne jamais activer aaa new-model sans fallback local prêt."
          },
          {
            symptome: "SSH accepte la connexion mais RADIUS n'est jamais consulté",
            cause: "La méthode AAA n'est pas appliquée sur les lignes VTY",
            solution: "Vérifier 'show running-config | section line vty' — la ligne 'login authentication METHODE-SSH' doit apparaître."
          }
        ]
      },
      {
        titre: "Étape 4 — Configurer l'Authorization et l'Accounting",
        contexte: "L'Authorization détermine ce que l'utilisateur peut faire après authentification (commandes disponibles, niveau de privilège). L'Accounting enregistre toutes les actions pour audit. Ces deux composantes complètent le A et le A de AAA.",
        commandes: [
          { os: "linux", cmd: "! Authorization — niveau exec automatique depuis RADIUS :\nR1(config)# aaa authorization exec AUTHZ-EXEC group GROUPE-RADIUS local\nR1(config)# line vty 0 4\nR1(config-line)# authorization exec AUTHZ-EXEC", commentaire: "Le niveau privilege (1-15) est attribué par RADIUS via Cisco-AVPair" },
          { os: "linux", cmd: "! Accounting — enregistrer les sessions exec :\nR1(config)# aaa accounting exec ACCOUNT-EXEC start-stop group GROUPE-RADIUS\nR1(config)# line vty 0 4\nR1(config-line)# accounting exec ACCOUNT-EXEC", commentaire: "Log start (connexion) et stop (déconnexion) envoyés au serveur RADIUS" },
          { os: "linux", cmd: "R1# show aaa servers", commentaire: "Vérifier le statut des serveurs RADIUS : requêtes envoyées, réponses reçues" },
          { os: "linux", cmd: "R1# show aaa sessions", commentaire: "Sessions AAA actives en ce moment" },
          { os: "linux", cmd: "R1# debug aaa authentication\nR1# debug radius\n# Se connecter en SSH avec un compte RADIUS\nR1# undebug all", commentaire: "Observer les échanges AAA/RADIUS en temps réel" }
        ],
        erreurs_courantes: [
          {
            symptome: "Utilisateur RADIUS authentifié mais niveau privilege 1 (pas d'accès admin)",
            cause: "L'attribut Cisco-AVPair 'shell:priv-lvl=15' n'est pas envoyé par FreeRADIUS",
            solution: "Vérifier dans /etc/freeradius/3.0/users que la ligne 'Cisco-AVPair = \"shell:priv-lvl=15\"' est bien présente pour le compte. Relancer FreeRADIUS. Sur le routeur : 'aaa authorization exec' doit aussi être configuré."
          }
        ]
      },
      {
        titre: "Étape 5 — Tester et valider",
        contexte: "On teste les différents scénarios : connexion avec compte RADIUS valide, connexion avec mauvais mot de passe, connexion avec compte local (fallback), et comportement si le serveur RADIUS est coupé.",
        commandes: [
          { os: "linux", cmd: "# Depuis la machine admin :\nssh admin-net@192.168.1.1", commentaire: "Test 1 : compte RADIUS valide — doit se connecter en priv 15" },
          { os: "linux", cmd: "ssh op-reseau@192.168.1.1", commentaire: "Test 2 : compte RADIUS niveau 7 — accès limité" },
          { os: "linux", cmd: "ssh mauvais-user@192.168.1.1", commentaire: "Test 3 : compte inexistant — doit refuser (Access-Reject)" },
          { os: "linux", cmd: "# Sur la VM FreeRADIUS : couper le service\nsudo systemctl stop freeradius\n# Puis retenter depuis admin :\nssh admin@192.168.1.1", commentaire: "Test 4 : RADIUS down → fallback sur compte local 'admin'" },
          { os: "linux", cmd: "R1# show aaa servers\nR1# show radius statistics", commentaire: "Vérifier les compteurs : Access-Requests, Access-Accepts, Access-Rejects" },
          { os: "linux", cmd: "# Redémarrer FreeRADIUS :\nsudo systemctl start freeradius\nsudo systemctl status freeradius", commentaire: "Rétablir le serveur RADIUS après les tests" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le fallback local ne fonctionne pas quand RADIUS est down",
            cause: "La méthode AAA ne contient pas 'local' en fallback, ou le compte local n'existe pas",
            solution: "Vérifier 'show running-config | include aaa authentication' — 'local' doit apparaître après 'group GROUPE-RADIUS'. Vérifier aussi que le compte local existe avec 'show running-config | include username'."
          }
        ]
      }
    ],
    checklist: [
      "FreeRADIUS installé et 'radtest admin-net AdminPass123 127.0.0.1 0 cisco-radius-secret' retourne Access-Accept",
      "SSH fonctionnel sur R1 (version 2, clé RSA 2048 générée)",
      "Compte local de fallback 'admin' configuré avec privilege 15",
      "aaa new-model activé avec méthodes d'authentification définies",
      "SSH avec compte RADIUS 'admin-net' : connexion réussie en privilege 15",
      "SSH avec RADIUS down : fallback sur compte local fonctionnel",
      "show aaa servers : serveur RADIUS joignable, compteurs Access-Accept cohérents",
      "Accounting configuré : logs de session envoyés au serveur RADIUS"
    ],
    tags: ["aaa", "radius", "freeradius", "authentification", "ssh", "cisco", "securite", "accounting", "authorization"],
    date_ajout: "2026-03-15",
    source: "École"
  },

  {
    id: 30,
    titre: "VPN nomade WireGuard sur pfSense — clients Ubuntu et Windows",
    categorie: "securite",
    niveau: "intermédiaire",
    duree: 120,
    description: "Déployer un VPN nomade (client-to-site) avec WireGuard sur un pare-feu pfSense. Le tunnel chiffré permet à des postes distants (Ubuntu et Windows) d'accéder au réseau LAN de l'entreprise via Internet. Ce TD couvre l'installation du package, la génération des clés cryptographiques, la configuration des interfaces logiques et règles de pare-feu, ainsi que la configuration complète des clients en CLI et via GNOME.",
    objectifs: [
      "Installer le package WireGuard sur pfSense via le gestionnaire de paquets",
      "Créer un tunnel WireGuard et générer la paire de clés du serveur pfSense",
      "Assigner le tunnel à une interface logique WG_VPN avec adressage statique",
      "Configurer les règles de pare-feu WAN (UDP/51820) et WG_VPN (Any/Any)",
      "Générer les paires de clés clientes sur Ubuntu (CLI) et Windows (client graphique)",
      "Déclarer les peers sur pfSense avec leurs clés publiques et adresses VPN /32",
      "Configurer wg0.conf et activer le tunnel Ubuntu via wg-quick et GNOME",
      "Valider la connexion : handshake wg, ping LAN, Status > WireGuard pfSense"
    ],
    prerequis: [
      { type: "logiciel", nom: "pfSense CE ou Plus (accès interface web)", lien: "https://www.pfsense.org" },
      { type: "vm", nom: "VM pfSense — WAN: VMnet8 NAT (192.168.8.10) + LAN: VMnet1 (192.168.1.10)" },
      { type: "vm", nom: "VM Ubuntu 22.04+ — VMnet8 NAT" },
      { type: "vm", nom: "VM Windows 10/11 — VMnet8 NAT" },
      { type: "reseau", nom: "Sous-réseau VPN : 10.11.12.0/27 — pfSense: .13, Ubuntu: .14, Windows: .20" }
    ],
    schema_reseau: `<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr30" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
    <marker id="arr30g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#10B981"/>
    </marker>
  </defs>
  <rect x="20" y="45" width="115" height="58" rx="7" fill="#1C1917" stroke="#8B5CF6" stroke-width="1.5"/>
  <text x="77" y="68" text-anchor="middle" fill="#8B5CF6" font-size="10" font-weight="bold">Ubuntu</text>
  <text x="77" y="83" text-anchor="middle" fill="#78716C" font-size="8">192.168.8.14</text>
  <text x="77" y="96" text-anchor="middle" fill="#10B981" font-size="8">wg0: 10.11.12.14/32</text>
  <rect x="20" y="185" width="115" height="58" rx="7" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="77" y="208" text-anchor="middle" fill="#3B82F6" font-size="10" font-weight="bold">Windows</text>
  <text x="77" y="223" text-anchor="middle" fill="#78716C" font-size="8">192.168.8.20</text>
  <text x="77" y="236" text-anchor="middle" fill="#10B981" font-size="8">vpn-wg: 10.11.12.20/32</text>
  <ellipse cx="285" cy="150" rx="58" ry="42" fill="#1C1917" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="285" y="146" text-anchor="middle" fill="#F59E0B" font-size="10">Internet</text>
  <text x="285" y="160" text-anchor="middle" fill="#78716C" font-size="8">UDP:51820</text>
  <line x1="135" y1="74" x2="228" y2="133" stroke="#10B981" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr30g)"/>
  <line x1="135" y1="214" x2="228" y2="168" stroke="#10B981" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr30g)"/>
  <text x="172" y="93" text-anchor="middle" fill="#10B981" font-size="7">Tunnel WG</text>
  <text x="172" y="207" text-anchor="middle" fill="#10B981" font-size="7">Tunnel WG</text>
  <rect x="385" y="88" width="130" height="124" rx="8" fill="#1C1917" stroke="#EF4444" stroke-width="2"/>
  <text x="450" y="113" text-anchor="middle" fill="#EF4444" font-size="11" font-weight="bold">pfSense</text>
  <text x="450" y="130" text-anchor="middle" fill="#78716C" font-size="8">WAN: 192.168.8.10</text>
  <text x="450" y="145" text-anchor="middle" fill="#78716C" font-size="8">LAN: 192.168.1.10</text>
  <text x="450" y="160" text-anchor="middle" fill="#F59E0B" font-size="8">WG_VPN: 10.11.12.13</text>
  <text x="450" y="175" text-anchor="middle" fill="#A8A29E" font-size="7">Port écoute: 51820/udp</text>
  <text x="450" y="190" text-anchor="middle" fill="#A8A29E" font-size="7">Peers: .14 .20</text>
  <line x1="343" y1="150" x2="385" y2="150" stroke="#F59E0B" stroke-width="2" marker-end="url(#arr30)"/>
  <rect x="568" y="118" width="100" height="64" rx="7" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="618" y="142" text-anchor="middle" fill="#3B82F6" font-size="10" font-weight="bold">LAN</text>
  <text x="618" y="157" text-anchor="middle" fill="#78716C" font-size="8">192.168.1.0/24</text>
  <text x="618" y="170" text-anchor="middle" fill="#78716C" font-size="8">Serveurs, NAS...</text>
  <line x1="515" y1="150" x2="568" y2="150" stroke="#3B82F6" stroke-width="1.5" marker-end="url(#arr30)"/>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Installation du package WireGuard sur pfSense",
        contexte: "WireGuard n'est pas inclus par défaut dans pfSense. Il faut l'installer via le gestionnaire de paquets intégré. Une fois installé, une nouvelle entrée WireGuard apparaît dans le menu VPN.",
        commandes: [
          { os: "both", cmd: "# Interface web pfSense :\n# System > Package Manager > Available Packages\n# Rechercher 'WireGuard' > cliquer Install\n# Attendre le message 'Installation Successful'\n# Verifier : menu VPN > WireGuard apparait", commentaire: "Installation du package via l'interface web pfSense" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le menu VPN > WireGuard n'apparait pas apres installation",
            cause: "Cache navigateur affichant l'ancienne interface pfSense",
            solution: "Forcer rechargement (Ctrl+Shift+R) ou se deconnecter/reconnecter a l'interface web pfSense"
          }
        ]
      },
      {
        titre: "Étape 2 — Création du tunnel WireGuard sur pfSense",
        contexte: "Le tunnel est l'instance centrale du serveur VPN. On génère ici la paire de clés du serveur et on définit l'adresse IP du pfSense dans le réseau VPN (10.11.12.13/27). La clé publique du serveur devra être communiquée à chaque client.",
        commandes: [
          { os: "both", cmd: "# VPN > WireGuard > Add Tunnel :\n# Enable : cocher\n# Description : WG_Server\n# Listen Port : 51820\n# Interface Keys > Generate\n#   => Copier la Public Key (necessaire pour les clients)\n# Tunnel Address : 10.11.12.13/27\n# Save Tunnel", commentaire: "Creer le tunnel et noter la cle publique pfSense" },
          { os: "both", cmd: "# Activer WireGuard globalement :\n# VPN > WireGuard > onglet Settings\n# Cocher 'Enable WireGuard'\n# Save > Apply Changes", commentaire: "Activation globale obligatoire" }
        ],
        erreurs_courantes: [
          {
            symptome: "Tunnel inactif (status rouge) apres sauvegarde",
            cause: "Option 'Enable WireGuard' dans Settings non cochee",
            solution: "VPN > WireGuard > Settings > cocher Enable WireGuard > Save > Apply Changes"
          }
        ]
      },
      {
        titre: "Étape 3 — Interface logique WG_VPN et règles de pare-feu",
        contexte: "Le tunnel doit être assigné à une interface pfSense pour supporter des règles de pare-feu. Deux règles sont nécessaires : autoriser UDP/51820 en entrée WAN, et permettre tout trafic sur l'interface VPN.",
        commandes: [
          { os: "both", cmd: "# Assigner l'interface :\n# Interfaces > Assignments\n# Available network ports : selectionner tun_wg0 > + Add\n# Cliquer sur OPT1 (ou le nom attribue)\n# Enable interface : cocher\n# Description : WG_VPN\n# IPv4 Configuration Type : Static IPv4\n# IPv4 Address : 10.11.12.13 / 27\n# Save > Apply Changes", commentaire: "Creer l'interface logique WG_VPN" },
          { os: "both", cmd: "# Regle WAN :\n# Firewall > Rules > WAN > Add\n# Action : Pass | Protocol : UDP\n# Destination : WAN address | Port : 51820\n# Save > Apply Changes", commentaire: "Autoriser les connexions VPN entrantes depuis Internet" },
          { os: "both", cmd: "# Regle WG_VPN :\n# Firewall > Rules > WG_VPN > Add\n# Action : Pass | Protocol : Any\n# Source : Any | Destination : Any\n# Save > Apply Changes", commentaire: "Autoriser tout le trafic dans le tunnel (a restreindre en prod)" }
        ],
        erreurs_courantes: [
          {
            symptome: "Handshake OK mais trafic LAN ne passe pas",
            cause: "Regle sur l'interface WG_VPN manquante",
            solution: "Firewall > Rules > WG_VPN : verifier la presence d'une regle Pass Any/Any active"
          }
        ]
      },
      {
        titre: "Étape 4 — Génération des clés et configuration des clients",
        contexte: "Chaque client a sa propre paire de clés. Sous Ubuntu : génération CLI puis création du fichier wg0.conf. Sous Windows : le client graphique génère la paire automatiquement dans un tunnel vide.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install wireguard wireguard-tools -y", commentaire: "Installer WireGuard sur Ubuntu" },
          { os: "linux", cmd: "mkdir ~/.wireguard && cd ~/.wireguard && umask 077\nwg genkey | tee client_private.key | wg pubkey > client_public.key\ncat client_public.key", commentaire: "Generer la paire de cles et afficher la cle publique" },
          { os: "linux", cmd: "sudo nano /etc/wireguard/wg0.conf\n# Contenu :\n# [Interface]\n# PrivateKey = <contenu client_private.key>\n# Address = 10.11.12.14/32\n# DNS = 1.1.1.1\n#\n# [Peer]\n# PublicKey = <cle publique pfSense>\n# Endpoint = <IP_WAN_pfSense>:51820\n# AllowedIPs = 192.168.1.0/24, 10.11.12.0/27\n# PersistentKeepalive = 25", commentaire: "Fichier de config split-tunnel Ubuntu (remplacer les valeurs)" },
          { os: "linux", cmd: "sudo chmod 600 /etc/wireguard/wg0.conf", commentaire: "Securiser le fichier contenant la cle privee" },
          { os: "windows", cmd: "# Client WireGuard Windows :\n# Ajouter un tunnel > Ajouter un tunnel vide\n# Donner un nom : VPN_vers_pfSense\n# Copier la Public Key generee automatiquement\n# Completer :\n# [Interface] (existant)\n# Address = 10.11.12.20/32\n# DNS = 10.11.12.13\n# [Peer]\n# PublicKey = <cle publique pfSense>\n# Endpoint = <IP_WAN_pfSense>:51820\n# AllowedIPs = 192.168.1.0/24, 10.11.12.0/27\n# PersistentKeepalive = 25\n# Cliquer Enregistrer", commentaire: "Configuration split-tunnel Windows — IP VPN : 10.11.12.20" }
        ],
        erreurs_courantes: [
          {
            symptome: "wg-quick up wg0 echoue : 'RTNETLINK answers: Operation not permitted'",
            cause: "Module kernel WireGuard non charge",
            solution: "sudo modprobe wireguard && sudo wg-quick up wg0"
          }
        ]
      },
      {
        titre: "Étape 5 — Déclaration des peers sur pfSense et validation",
        contexte: "On enregistre chaque client sur pfSense avec sa clé publique et son IP VPN réservée. On valide ensuite la connexion depuis les clients et dans le tableau de bord WireGuard de pfSense.",
        commandes: [
          { os: "both", cmd: "# VPN > WireGuard > editer WG_Server > Peers > + Add Peer\n# Peer Ubuntu :\n#   Description : PC_Ubuntu\n#   Public Key : <cle publique Ubuntu>\n#   Allowed IPs : 10.11.12.14/32\n#   Keepalive : 25\n# Save\n# Peer Windows :\n#   Description : PC_Windows\n#   Public Key : <cle publique Windows>\n#   Allowed IPs : 10.11.12.20/32\n#   Keepalive : 25\n# Save > Apply Changes", commentaire: "Declarer les deux peers sur pfSense" },
          { os: "linux", cmd: "sudo wg-quick up wg0\nsudo wg", commentaire: "Demarrer le tunnel et verifier le handshake" },
          { os: "linux", cmd: "ping -c 3 10.11.12.13\nping -c 3 192.168.1.10", commentaire: "Tester la connectivite vers pfSense puis vers le LAN" },
          { os: "linux", cmd: "# Demarrage automatique au boot :\nsudo systemctl enable wg-quick@wg0.service", commentaire: "Rendre le VPN persistant sur Ubuntu" },
          { os: "windows", cmd: "# Client WireGuard > selectionner le tunnel > Activer\n# Statut doit passer a 'Active'\n# Verifier le champ 'Recu' dans Transfert (doit augmenter)\n# ping 10.11.12.13 depuis PowerShell", commentaire: "Activer et valider le tunnel Windows" },
          { os: "both", cmd: "# Verification pfSense :\n# Status > WireGuard > onglet Peers\n# 'Latest Handshake' : recente pour chaque peer\n# RX/TX : trafic visible", commentaire: "Validation cote serveur pfSense" }
        ],
        erreurs_courantes: [
          {
            symptome: "sudo wg n'affiche pas de 'latest handshake'",
            cause: "Endpoint injoignable, mauvaise cle publique serveur, ou peer non declare sur pfSense",
            solution: "Verifier 1) IP WAN pfSense dans Endpoint, 2) cle publique dans [Peer], 3) peer present dans VPN > WireGuard > Peers"
          },
          {
            symptome: "Handshake OK mais ping LAN echoue",
            cause: "AllowedIPs ne contient pas le reseau LAN ou regle pare-feu WG_VPN manquante",
            solution: "Verifier AllowedIPs (doit inclure 192.168.1.0/24) et Firewall > Rules > WG_VPN sur pfSense"
          }
        ]
      }
    ],
    checklist: [
      "Package pfSense-pkg-WireGuard visible dans Installed Packages",
      "Tunnel WG_Server actif avec cle publique generee (port 51820)",
      "Interface WG_VPN assignee : IP 10.11.12.13/27, activee",
      "Regle WAN : Pass UDP 51820 vers WAN address active",
      "Regle WG_VPN : Pass Any/Any active",
      "Paire de cles Ubuntu generee (client_private.key + client_public.key)",
      "Paire de cles Windows generee via client graphique",
      "Peer Ubuntu declare sur pfSense : cle publique + 10.11.12.14/32",
      "Peer Windows declare sur pfSense : cle publique + 10.11.12.20/32",
      "wg0.conf Ubuntu : chmod 600, PrivateKey/Address/Endpoint/AllowedIPs corrects",
      "sudo wg affiche un 'latest handshake' recent sur Ubuntu",
      "ping 10.11.12.13 et ping 192.168.1.x repond depuis les clients VPN",
      "Status > WireGuard pfSense : handshake + trafic RX/TX visibles pour chaque peer"
    ],
    tags: ["wireguard", "vpn", "pfsense", "pare-feu", "ubuntu", "windows", "client-to-site", "nomade", "chiffrement", "securite"],
    date_ajout: "2026-06-25",
    source: "École"
  },

  {
    id: 31,
    titre: "IPS collaboratif CrowdSec sur Ubuntu — détection, Bouncer nftables et Dashboard",
    categorie: "securite",
    niveau: "intermédiaire",
    duree: 120,
    description: "Mettre en place CrowdSec, un IPS collaboratif open-source comparable à Fail2Ban, sur un serveur Ubuntu 22.04 protégeant un serveur Apache. On installe les collections de détection, on configure l'acquisition des logs, on manipule la whitelist pour autoriser le réseau de lab, on installe le Bouncer nftables pour traduire les décisions en blocages réseau effectifs, puis on connecte le moteur au Dashboard cloud app.crowdsec.net pour visualiser les alertes en temps réel. La machine attaquante est un Kali Linux qui effectue des scans Nikto.",
    objectifs: [
      "Distinguer IDS (détection passive) et IPS (prévention active) et positionner CrowdSec",
      "Installer CrowdSec et la collection crowdsecurity/apache2 sur Ubuntu 22.04",
      "Vérifier l'acquisition des logs Apache via acquis.yaml",
      "Comprendre le rôle de la whitelist et retirer son réseau de lab pour que les scans soient détectés",
      "Lancer un scan Nikto depuis Kali et observer les décisions avec cscli decisions list",
      "Installer le Bouncer crowdsec-firewall-bouncer-nftables pour bloquer effectivement les IPs",
      "Connecter CrowdSec à la console web app.crowdsec.net et visualiser les alertes"
    ],
    prerequis: [
      { type: "vm", nom: "VM Ubuntu 22.04 — 2 interfaces : NAT (Internet) + réseau privé (192.168.1.2)" },
      { type: "vm", nom: "VM Kali Linux — 2 interfaces : NAT (Internet) + réseau privé (192.168.1.10)" },
      { type: "reseau", nom: "Réseau privé partagé entre les deux VMs (ex: VMnet2 Host-only)" },
      { type: "logiciel", nom: "Nikto préinstallé sur Kali Linux" },
      { type: "logiciel", nom: "Compte gratuit sur app.crowdsec.net (pour le Dashboard)", lien: "https://app.crowdsec.net" }
    ],
    schema_reseau: `<svg viewBox="0 0 580 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr31r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#EF4444"/>
    </marker>
    <marker id="arr31g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#10B981"/>
    </marker>
  </defs>
  <!-- Kali Linux (attaquant) -->
  <rect x="20" y="80" width="120" height="80" rx="8" fill="#1C1917" stroke="#EF4444" stroke-width="2"/>
  <text x="80" y="108" text-anchor="middle" fill="#EF4444" font-size="11" font-weight="bold">Kali Linux</text>
  <text x="80" y="124" text-anchor="middle" fill="#A8A29E" font-size="9">Attaquant</text>
  <text x="80" y="139" text-anchor="middle" fill="#78716C" font-size="8">192.168.1.10</text>
  <text x="80" y="152" text-anchor="middle" fill="#78716C" font-size="8">nikto -h .1.2</text>
  <!-- Flèche attaque -->
  <line x1="140" y1="120" x2="210" y2="120" stroke="#EF4444" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arr31r)"/>
  <text x="175" y="112" text-anchor="middle" fill="#EF4444" font-size="8">scan HTTP</text>
  <!-- Ubuntu + CrowdSec -->
  <rect x="210" y="40" width="175" height="180" rx="8" fill="#1C1917" stroke="#10B981" stroke-width="2"/>
  <text x="297" y="67" text-anchor="middle" fill="#10B981" font-size="11" font-weight="bold">Ubuntu 22.04</text>
  <text x="297" y="83" text-anchor="middle" fill="#78716C" font-size="8">192.168.1.2</text>
  <!-- Apache -->
  <rect x="228" y="92" width="140" height="32" rx="5" fill="#292524" stroke="#F59E0B" stroke-width="1"/>
  <text x="298" y="110" text-anchor="middle" fill="#F59E0B" font-size="9">Apache2 (port 80)</text>
  <text x="298" y="120" text-anchor="middle" fill="#78716C" font-size="7">/var/log/apache2/access.log</text>
  <!-- CrowdSec -->
  <rect x="228" y="132" width="140" height="42" rx="5" fill="#292524" stroke="#10B981" stroke-width="1"/>
  <text x="298" y="150" text-anchor="middle" fill="#10B981" font-size="9" font-weight="bold">CrowdSec</text>
  <text x="298" y="163" text-anchor="middle" fill="#78716C" font-size="7">analyse logs + decisions</text>
  <!-- Bouncer -->
  <rect x="228" y="182" width="140" height="28" rx="5" fill="#292524" stroke="#8B5CF6" stroke-width="1"/>
  <text x="298" y="200" text-anchor="middle" fill="#8B5CF6" font-size="9">Bouncer nftables</text>
  <!-- Flèche CrowdSec -> Dashboard -->
  <line x1="385" y1="153" x2="440" y2="153" stroke="#10B981" stroke-width="1.5" marker-end="url(#arr31g)"/>
  <!-- Dashboard cloud -->
  <rect x="440" y="110" width="120" height="85" rx="8" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="500" y="133" text-anchor="middle" fill="#3B82F6" font-size="10" font-weight="bold">Dashboard</text>
  <text x="500" y="148" text-anchor="middle" fill="#A8A29E" font-size="8">app.crowdsec.net</text>
  <text x="500" y="163" text-anchor="middle" fill="#78716C" font-size="7">Alertes / Decisions</text>
  <text x="500" y="177" text-anchor="middle" fill="#78716C" font-size="7">Scenarios / Blocklists</text>
  <text x="500" y="191" text-anchor="middle" fill="#78716C" font-size="7">Console SaaS gratuite</text>
  <!-- Label réseau privé -->
  <rect x="100" y="18" width="205" height="18" rx="4" fill="#292524" stroke="#F59E0B" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="202" y="31" text-anchor="middle" fill="#F59E0B" font-size="8">Réseau privé 192.168.1.0/24</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Préparation du lab : VMs et réseau",
        contexte: "Le lab nécessite deux VMs sur le même réseau privé (Host-only ou LAN segment dans VMware). La VM Ubuntu hébergera Apache + CrowdSec. La VM Kali sera la machine attaquante. Chacune a aussi une interface NAT pour l'accès Internet.",
        commandes: [
          { os: "both", cmd: "# Configuration VMware Workstation :\n# VM Ubuntu : Adapter 1 = NAT | Adapter 2 = Custom (VMnet2)\n# VM Kali   : Adapter 1 = NAT | Adapter 2 = Custom (VMnet2)\n# IPs réseau privé :\n#   Ubuntu : 192.168.1.2\n#   Kali   : 192.168.1.10", commentaire: "Architecture du lab — les 2 VMs sur le même segment privé" },
          { os: "linux", cmd: "# Sur Ubuntu — vérifier la connectivité avec Kali :\nip a\nping -c 3 192.168.1.10", commentaire: "Vérifier que les deux VMs se joignent avant d'installer quoi que ce soit" }
        ],
        erreurs_courantes: [
          {
            symptome: "ping entre les deux VMs échoue",
            cause: "Les interfaces Host-only ne sont pas sur le même VMnet ou les IPs statiques ne sont pas configurées",
            solution: "Vérifier que les deux adapters sont sur VMnet2 et assigner manuellement les IPs dans /etc/network/interfaces ou via nmcli"
          }
        ]
      },
      {
        titre: "Étape 2 — Installation de CrowdSec et Apache sur Ubuntu",
        contexte: "CrowdSec nécessite l'ajout de son dépôt officiel. On installe ensuite Apache2 (le service à protéger) et CrowdSec simultanément, puis on ajoute la collection de scénarios dédiée à Apache2.",
        commandes: [
          { os: "linux", cmd: "sudo apt install curl -y", commentaire: "S'assurer que curl est disponible" },
          { os: "linux", cmd: "curl -s https://install.crowdsec.net | sudo bash", commentaire: "Ajouter le dépôt officiel CrowdSec" },
          { os: "linux", cmd: "sudo apt install apache2 crowdsec -y", commentaire: "Installer Apache2 et CrowdSec en une commande" },
          { os: "linux", cmd: "sudo cscli collections install crowdsecurity/apache2", commentaire: "Installer la collection de scénarios de détection pour Apache2" },
          { os: "linux", cmd: "sudo cscli collections list", commentaire: "Vérifier que crowdsecurity/apache2 est bien listée avec status 'enabled'" }
        ],
        erreurs_courantes: [
          {
            symptome: "cscli: command not found après installation",
            cause: "Le dépôt CrowdSec n'a pas été ajouté avant apt install crowdsec",
            solution: "Relancer : curl -s https://install.crowdsec.net | sudo bash, puis sudo apt update && sudo apt install crowdsec -y"
          }
        ]
      },
      {
        titre: "Étape 3 — Vérification de l'acquisition des logs (acquis.yaml)",
        contexte: "CrowdSec analyse les fichiers de logs pour détecter les attaques. Il faut s'assurer que /etc/crowdsec/acquis.yaml pointe bien vers le log d'accès Apache2. Si le fichier est vide, il faut le remplir manuellement.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/crowdsec/acquis.yaml", commentaire: "Vérifier ou créer l'entrée d'acquisition pour Apache2" },
          { os: "linux", cmd: "# Contenu minimal requis dans acquis.yaml :\nfilenames:\n  - /var/log/apache2/access.log\nlabels:\n  type: apache2", commentaire: "Pointer CrowdSec vers le log d'accès Apache2 avec le label de type approprié" },
          { os: "linux", cmd: "sudo systemctl restart crowdsec", commentaire: "Redémarrer CrowdSec après modification de la configuration d'acquisition" },
          { os: "linux", cmd: "sudo systemctl status crowdsec", commentaire: "Vérifier que CrowdSec est bien actif (Active: running)" }
        ],
        erreurs_courantes: [
          {
            symptome: "CrowdSec ne détecte rien même après un scan Nikto",
            cause: "acquis.yaml ne contient pas l'entrée Apache2 ou pointe vers un chemin de log inexistant",
            solution: "Vérifier que /var/log/apache2/access.log existe (sudo ls -la /var/log/apache2/) et que l'entrée acquis.yaml est correctement indentée (YAML sensible aux espaces)"
          }
        ]
      },
      {
        titre: "Étape 4 — Whitelist : retirer le réseau local pour permettre la détection en lab",
        contexte: "Par défaut, CrowdSec whiteliste les plages d'IP privées (192.168.0.0/16, 10.0.0.0/8...) pour éviter de bloquer des machines du réseau local. Dans notre lab, la machine attaquante Kali est justement dans ce réseau — il faut donc commenter la règle 192.168.0.0/16 et ajouter l'IP du serveur lui-même pour éviter l'auto-blocage.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/crowdsec/parsers/s02-enrich/whitelists.yaml", commentaire: "Éditer le fichier de whitelist CrowdSec" },
          { os: "linux", cmd: "# Dans la section cidr:, commenter la ligne 192.168.0.0/16 :\n# cidr:\n#   - '127.0.0.0/8'\n#   - '192.168.0.0/16'   # <- commenter cette ligne\n#   - '10.0.0.0/8'\n#   - '172.16.0.0/12'\n# Dans la section ip:, ajouter l'IP du serveur pour ne pas s'autobloquer :\n# ip:\n#   - '192.168.1.2'      # <- IP du serveur Ubuntu", commentaire: "Commenter 192.168.0.0/16 et ajouter l'IP du serveur en whitelist IP" },
          { os: "linux", cmd: "sudo systemctl restart crowdsec", commentaire: "Appliquer les modifications de whitelist" }
        ],
        erreurs_courantes: [
          {
            symptome: "sudo cscli decisions list retourne 'No active decisions' meme apres un scan Nikto agressif",
            cause: "La plage 192.168.0.0/16 est encore active dans la whitelist — Kali (192.168.1.10) est ignorée",
            solution: "Commenter la ligne '- 192.168.0.0/16' dans whitelists.yaml (ajouter # devant) et relancer CrowdSec"
          }
        ]
      },
      {
        titre: "Étape 5 — Premier scan Nikto et observation des décisions CrowdSec",
        contexte: "On lance un scan Nikto depuis Kali vers le serveur Ubuntu. CrowdSec analyse les logs Apache en temps réel et génère des décisions de ban. On observe ces décisions avec cscli. À ce stade, les décisions sont enregistrées mais pas encore appliquées (pas de Bouncer) — Nikto peut encore scanner.",
        commandes: [
          { os: "linux", cmd: "# Sur la VM Kali Linux :\nnikto -h 192.168.1.2", commentaire: "Lancer le scan de vulnérabilités vers le serveur Ubuntu (remplacer l'IP si nécessaire)" },
          { os: "linux", cmd: "# Sur la VM Ubuntu, après le scan :\nsudo cscli decisions list", commentaire: "Lister les décisions de ban prises par CrowdSec — l'IP de Kali doit apparaître" },
          { os: "linux", cmd: "sudo cscli alerts list", commentaire: "Lister les alertes détaillées avec les scénarios déclenchés" },
          { os: "linux", cmd: "# Supprimer manuellement une décision (utile pour les tests) :\nsudo cscli decisions delete --ip 192.168.1.10", commentaire: "Réinitialiser le ban de Kali pour pouvoir refaire des tests" }
        ],
        erreurs_courantes: [
          {
            symptome: "cscli decisions list reste vide après le scan Nikto",
            cause: "La whitelist 192.168.0.0/16 n'a pas encore été commentée ou CrowdSec n'a pas été redémarré après modification",
            solution: "Vérifier whitelists.yaml, commenter 192.168.0.0/16, puis sudo systemctl restart crowdsec et relancer le scan Nikto"
          }
        ]
      },
      {
        titre: "Étape 6 — Installation du Bouncer nftables : rendre les blocages effectifs",
        contexte: "CrowdSec détecte et enregistre des décisions, mais sans Bouncer, aucun blocage réseau n'est appliqué. Le Bouncer crowdsec-firewall-bouncer-nftables lit les décisions de CrowdSec et crée des règles nftables pour bloquer les IPs bannies au niveau du pare-feu système.",
        commandes: [
          { os: "linux", cmd: "sudo apt install crowdsec-firewall-bouncer-nftables -y", commentaire: "Installer le Bouncer qui va interfacer CrowdSec avec nftables" },
          { os: "linux", cmd: "sudo service crowdsec restart", commentaire: "Redémarrer CrowdSec pour qu'il prenne en compte le nouveau Bouncer" },
          { os: "linux", cmd: "sudo cscli bouncers list", commentaire: "Vérifier que le Bouncer nftables est bien enregistré et actif" },
          { os: "linux", cmd: "# Tester le blocage depuis Kali après un nouveau scan Nikto :\n# Sur Kali : nikto -h 192.168.1.2\n# Résultat attendu : '+ 0 host(s) tested' — Nikto est bloqué avant de pouvoir scanner", commentaire: "Valider que le Bouncer bloque effectivement l'IP de Kali" },
          { os: "linux", cmd: "sudo nft list ruleset | grep crowdsec", commentaire: "Vérifier les règles nftables créées par le Bouncer CrowdSec" }
        ],
        erreurs_courantes: [
          {
            symptome: "Nikto continue de scanner après installation du Bouncer",
            cause: "CrowdSec n'a pas encore pris de nouvelle décision (ancienne décision supprimée) ou le Bouncer n'est pas actif",
            solution: "Vérifier sudo cscli bouncers list (statut doit être 'valid') et sudo systemctl status crowdsec-firewall-bouncer. Relancer un scan Nikto pour déclencher une nouvelle décision."
          }
        ]
      },
      {
        titre: "Étape 7 — Connexion au Dashboard cloud app.crowdsec.net",
        contexte: "CrowdSec propose une console web SaaS gratuite pour visualiser les alertes, les décisions et les statistiques de sécurité de ses Security Engines. On enrôle notre serveur Ubuntu via une commande cscli console enroll avec un token généré depuis l'interface web.",
        commandes: [
          { os: "linux", cmd: "# 1. Créer un compte sur https://app.crowdsec.net (gratuit)\n# 2. Dans la console : barre de recherche > 'Enroll a Security Engine'\n# 3. Onglet Linux/FreeBSD > copier la commande affichée\n# 4. Sur Ubuntu, coller et exécuter la commande :\nsudo cscli console enroll <token_copie_depuis_la_console>", commentaire: "Enrôler le moteur CrowdSec dans la console web — remplacer par le token réel" },
          { os: "linux", cmd: "sudo systemctl restart crowdsec", commentaire: "Redémarrer CrowdSec après l'enrôlement" },
          { os: "linux", cmd: "sudo cscli console status", commentaire: "Vérifier que la connexion à la console est établie (options manual, tainted, context doivent être activées)" },
          { os: "linux", cmd: "# Dans la console web :\n# Security Engines > accepter la demande 'Accept Enroll'\n# Le serveur Ubuntu apparait dans la liste des Engines\n# Cliquer Alerts pour visualiser les attaques Nikto avec IP, scenario, date/heure", commentaire: "Valider l'enrôlement depuis la console web et explorer les alertes" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le serveur Ubuntu n'apparait pas dans la console web après l'enrôlement",
            cause: "Le redémarrage de CrowdSec n'a pas été effectué après la commande console enroll, ou le token est expiré",
            solution: "Relancer sudo systemctl restart crowdsec puis retourner dans la console web — attendre 1-2 minutes pour la synchronisation"
          }
        ]
      }
    ],
    checklist: [
      "VMs Ubuntu (192.168.1.2) et Kali (192.168.1.10) se pinguent via le réseau privé",
      "sudo cscli collections list : crowdsecurity/apache2 avec status 'enabled'",
      "acquis.yaml contient l'entrée /var/log/apache2/access.log avec label apache2",
      "whitelists.yaml : ligne 192.168.0.0/16 commentée, IP 192.168.1.2 ajoutée en whitelist IP",
      "Scan Nikto depuis Kali : sudo cscli decisions list affiche l'IP 192.168.1.10 bannie",
      "sudo cscli bouncers list : crowdsec-firewall-bouncer listé avec statut valid",
      "Nikto relancé depuis Kali retourne '0 host(s) tested' (blocage effectif par nftables)",
      "sudo cscli console status : options manual et context activées (connexion SaaS)",
      "Console web app.crowdsec.net : serveur Ubuntu visible dans Engines avec alertes Nikto"
    ],
    tags: ["crowdsec", "ips", "ids", "securite", "ubuntu", "apache2", "nftables", "bouncer", "nikto", "kali", "detection"],
    date_ajout: "2026-06-25",
    source: "École"
  },

  {
    id: 37,
    titre: "pfSense — installation, règles firewall et NAT",
    categorie: "securite",
    niveau: "intermédiaire",
    duree: 120,
    description: "Installer pfSense sur une VM, configurer les interfaces WAN et LAN, créer des règles firewall, mettre en place le NAT outbound et un port forwarding, analyser les logs.",
    objectifs: [
      "Installer pfSense sur une VM avec deux interfaces réseau",
      "Configurer WAN (DHCP) et LAN (192.168.1.1/24)",
      "Créer des règles firewall : allow HTTP/HTTPS, block ICMP",
      "Configurer le NAT outbound",
      "Mettre en place un port forwarding TCP 80",
      "Analyser les logs du firewall"
    ],
    prerequis: [
      { type: "vm", nom: "VM pfSense 2.7 (512 Mo RAM, 2 cartes réseau : WAN NAT, LAN réseau interne)" },
      { type: "vm", nom: "VM cliente Linux sur le réseau LAN" },
      { type: "logiciel", nom: "ISO pfSense CE" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation et assignation des interfaces",
        contexte: "On installe pfSense depuis l'ISO et on assigne WAN/LAN au premier démarrage.",
        commandes: [
          { os: "both", cmd: "# VM : Interface 1 (WAN) en mode NAT, Interface 2 (LAN) réseau interne\n# Démarrer ISO > Install > Auto > Reboot", commentaire: "Installer pfSense depuis l'ISO" },
          { os: "both", cmd: "# Console pfSense — Option 1 : Assign Interfaces\n# WAN : em0, LAN : em1\n# Option 2 : Set interface IP\n# LAN : 192.168.1.1/24, activer DHCP .100-.200", commentaire: "Assigner WAN/LAN et configurer l'IP LAN" }
        ],
        erreurs_courantes: [
          { symptome: "WAN n'obtient pas d'IP", cause: "Interface WAN en réseau interne au lieu de NAT", solution: "Vérifier le mode réseau de l'interface 1 dans les paramètres VM" }
        ]
      },
      {
        titre: "Étape 2 — Règles firewall et NAT outbound",
        contexte: "On crée les règles depuis l'interface WebGUI et on vérifie le NAT en mode hybride.",
        commandes: [
          { os: "both", cmd: "# Client : http://192.168.1.1 > admin/pfsense\n# Firewall > Rules > LAN\n# Règle 1 : Pass TCP LAN net any 80+443 — Allow HTTP/HTTPS\n# Règle 2 : Block ICMP LAN net WAN net — Block ICMP\n# Save & Apply", commentaire: "Créer les règles firewall LAN" },
          { os: "both", cmd: "# Firewall > NAT > Outbound > Mode Hybrid\n# Vérifier les règles auto pour 192.168.1.0/24\n# Tester : curl http://example.com depuis le client", commentaire: "Vérifier le NAT outbound en mode hybride" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Port forwarding et logs",
        contexte: "On crée une redirection de port TCP 80 WAN vers 192.168.1.50, puis on analyse les logs.",
        commandes: [
          { os: "both", cmd: "# Firewall > NAT > Port Forward > Add\n# Interface : WAN, Protocol : TCP, Dest port : 80\n# Redirect target : 192.168.1.50:80\n# Cocher Add associated firewall rule > Save & Apply", commentaire: "Créer le port forwarding TCP 80" },
          { os: "both", cmd: "# Status > System Logs > Firewall\n# Générer du ping depuis le LAN et observer les entrées bloquées", commentaire: "Analyser les logs firewall" }
        ],
        erreurs_courantes: [
          { symptome: "Port forwarding inopérant", cause: "Règle WAN associée absente ou serveur interne absent", solution: "Vérifier Firewall > Rules > WAN et que 192.168.1.50 écoute sur port 80" }
        ]
      }
    ],
    checklist: [
      "WebGUI pfSense accessible sur 192.168.1.1",
      "Client LAN obtient une IP DHCP 192.168.1.100-200",
      "Règles Allow HTTP/HTTPS et Block ICMP dans LAN",
      "curl http://example.com fonctionne depuis le client",
      "Port forwarding TCP 80 avec règle WAN associée",
      "Logs firewall affichent les connexions bloquées ICMP"
    ],
    tags: ["pfsense", "firewall", "nat", "port-forwarding", "securite", "reseau"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 38,
    titre: "Nmap — audit et cartographie de sécurité réseau",
    categorie: "securite",
    niveau: "débutant",
    duree: 60,
    description: "Maîtriser Nmap pour un audit de sécurité réseau : découverte d'hôtes, scans TCP, détection services et OS, scripts NSE et génération d'un rapport XML.",
    objectifs: [
      "Découverte d'hôtes sur un réseau local",
      "Scans TCP SYN et complets",
      "Détection de versions avec -sV",
      "Identification OS avec -O",
      "Scripts NSE pour audits ciblés",
      "Rapport XML converti en HTML"
    ],
    prerequis: [
      { type: "vm", nom: "VM Kali Linux ou machine Linux avec Nmap" },
      { type: "vm", nom: "VM cible : Metasploitable 2 ou Ubuntu avec services ouverts" },
      { type: "reseau", nom: "Les deux VMs dans le même réseau local" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Découverte d'hôtes et scans de ports",
        contexte: "On identifie les hôtes actifs puis on scanne les ports avec différentes techniques.",
        commandes: [
          { os: "linux", cmd: "nmap -sn 192.168.1.0/24", commentaire: "Ping scan — liste les hôtes actifs sans scanner les ports" },
          { os: "linux", cmd: "sudo nmap -sS 192.168.1.20", commentaire: "TCP SYN scan (furtif, nécessite root)" },
          { os: "linux", cmd: "nmap --top-ports 100 192.168.1.20", commentaire: "Scanner les 100 ports les plus courants" },
          { os: "linux", cmd: "nmap -p 22,80,443,3306 192.168.1.20", commentaire: "Scanner des ports spécifiques" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Détection services, OS et scripts NSE",
        contexte: "On identifie les versions, l'OS, et on utilise les scripts NSE pour des audits ciblés.",
        commandes: [
          { os: "linux", cmd: "sudo nmap -sV 192.168.1.20", commentaire: "Détection des versions des services" },
          { os: "linux", cmd: "sudo nmap -O 192.168.1.20", commentaire: "Détection de l'OS (nécessite root)" },
          { os: "linux", cmd: "sudo nmap -A 192.168.1.20", commentaire: "Scan agressif : -sV + -O + traceroute + NSE" },
          { os: "linux", cmd: "nmap --script=http-title 192.168.1.20 -p 80", commentaire: "Script NSE : titre des pages web" },
          { os: "linux", cmd: "nmap --script=vuln 192.168.1.20", commentaire: "Scripts de détection de vulnérabilités" }
        ],
        erreurs_courantes: [
          { symptome: "OS detection: No OS matches", cause: "Trop peu de ports ouverts ou machine filtre les paquets", solution: "Scanner plus de ports ou ajouter --osscan-guess" }
        ]
      },
      {
        titre: "Étape 3 — Génération de rapport",
        contexte: "On exporte le scan en XML et on le convertit en rapport HTML lisible.",
        commandes: [
          { os: "linux", cmd: "sudo nmap -A 192.168.1.20 -oX rapport_nmap.xml", commentaire: "Exporter en XML" },
          { os: "linux", cmd: "xsltproc rapport_nmap.xml -o rapport_nmap.html", commentaire: "Convertir XML en HTML" },
          { os: "linux", cmd: "sudo nmap -A 192.168.1.20 -oA audit_complet", commentaire: "Exporter dans les 3 formats (.nmap, .xml, .gnmap)" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "nmap -sn 192.168.1.0/24 liste les hôtes actifs",
      "nmap -sS liste les ports ouverts",
      "nmap -sV identifie les versions des services",
      "nmap -O retourne une estimation de l'OS",
      "nmap --script=vuln retourne au moins un résultat NSE",
      "rapport_nmap.xml et rapport_nmap.html générés"
    ],
    tags: ["nmap", "audit", "securite", "pentest", "port-scan", "nse", "kali"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 45,
    titre: "PKI interne avec OpenSSL — CA racine, certificats et HTTPS",
    categorie: "securite",
    niveau: "avancé",
    duree: 90,
    description: "Créer une PKI complète avec OpenSSL : CA racine auto-signée, certificat intermédiaire, certificat serveur avec SAN. Déploiement HTTPS sur Nginx et import de la CA dans le navigateur.",
    objectifs: [
      "Créer une CA racine auto-signée",
      "Créer un certificat intermédiaire signé par la CA racine",
      "Générer et signer un certificat serveur avec SAN",
      "Déployer HTTPS sur Nginx",
      "Importer la CA racine dans le navigateur",
      "Comprendre la chaîne de confiance X.509"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 avec Nginx installé" },
      { type: "logiciel", nom: "OpenSSL >= 1.1.1" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer la CA racine",
        contexte: "La CA racine est le sommet de la chaîne. Clé RSA 4096 bits protégée par passphrase, certificat auto-signé 10 ans.",
        commandes: [
          { os: "linux", cmd: "mkdir -p ~/pki/{ca-racine,intermediaire,serveur}/{private,certs,csr}\nchmod 700 ~/pki/ca-racine/private && cd ~/pki", commentaire: "Créer la structure de répertoires PKI" },
          { os: "linux", cmd: "openssl genrsa -aes256 -out ca-racine/private/ca.key.pem 4096\nchmod 400 ca-racine/private/ca.key.pem", commentaire: "Clé privée CA racine (protégée par passphrase)" },
          { os: "linux", cmd: "openssl req -key ca-racine/private/ca.key.pem -new -x509 -days 3650 -sha256 -out ca-racine/certs/ca.cert.pem -subj '/C=FR/ST=IDF/O=Lab PKI/CN=Lab Root CA'", commentaire: "Certificat racine auto-signé (10 ans)" },
          { os: "linux", cmd: "openssl x509 -in ca-racine/certs/ca.cert.pem -text -noout | grep -E 'Subject:|Issuer:|Not After'", commentaire: "Vérifier le certificat racine" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Certificat intermédiaire et certificat serveur (SAN)",
        contexte: "L'intermédiaire signe les certs finaux. Le cert serveur doit avoir un SAN pour les navigateurs modernes.",
        commandes: [
          { os: "linux", cmd: "openssl genrsa -aes256 -out intermediaire/private/inter.key.pem 4096\nopenssl req -key intermediaire/private/inter.key.pem -new -sha256 -out intermediaire/csr/inter.csr.pem -subj '/C=FR/ST=IDF/O=Lab PKI/CN=Lab Intermediate CA'\nopenssl x509 -req -in intermediaire/csr/inter.csr.pem -CA ca-racine/certs/ca.cert.pem -CAkey ca-racine/private/ca.key.pem -CAcreateserial -out intermediaire/certs/inter.cert.pem -days 1825 -sha256 -extensions v3_ca", commentaire: "Clé, CSR et certificat intermédiaire signé par la CA racine" },
          { os: "linux", cmd: "openssl genrsa -out serveur/private/serveur.key.pem 2048\nopenssl req -key serveur/private/serveur.key.pem -new -sha256 -out serveur/csr/serveur.csr.pem -subj '/C=FR/ST=IDF/O=Lab PKI/CN=monsite.lab.local'", commentaire: "Clé et CSR du serveur (sans passphrase pour Nginx)" },
          { os: "linux", cmd: "echo '[SAN]\\nsubjectAltName=DNS:monsite.lab.local,IP:192.168.1.10' > /tmp/san.ext\nopenssl x509 -req -in serveur/csr/serveur.csr.pem -CA intermediaire/certs/inter.cert.pem -CAkey intermediaire/private/inter.key.pem -CAcreateserial -out serveur/certs/serveur.cert.pem -days 365 -sha256 -extfile /tmp/san.ext -extensions SAN", commentaire: "Signer le certificat serveur avec SAN" }
        ],
        erreurs_courantes: [
          { symptome: "NET::ERR_CERT_COMMON_NAME_INVALID dans le navigateur", cause: "SAN absent — navigateurs modernes n'acceptent plus le CN seul", solution: "Recréer le certificat avec subjectAltName incluant le DNS et/ou l'IP" }
        ]
      },
      {
        titre: "Étape 3 — HTTPS sur Nginx et import de la CA",
        contexte: "On déploie HTTPS avec la chaîne de certificats et on importe la CA dans le système.",
        commandes: [
          { os: "linux", cmd: "sudo mkdir -p /etc/nginx/ssl\ncat serveur/certs/serveur.cert.pem intermediaire/certs/inter.cert.pem | sudo tee /etc/nginx/ssl/chaine_complete.pem\nsudo cp serveur/private/serveur.key.pem /etc/nginx/ssl/ && sudo chmod 600 /etc/nginx/ssl/serveur.key.pem", commentaire: "Bundle cert + intermediate pour Nginx" },
          { os: "linux", cmd: "# Dans le VHost Nginx :\n# listen 443 ssl;\n# ssl_certificate /etc/nginx/ssl/chaine_complete.pem;\n# ssl_certificate_key /etc/nginx/ssl/serveur.key.pem;\n# ssl_protocols TLSv1.2 TLSv1.3;\nsudo nginx -t && sudo systemctl reload nginx", commentaire: "Configurer HTTPS et recharger Nginx" },
          { os: "linux", cmd: "openssl s_client -connect localhost:443 -CAfile ca-racine/certs/ca.cert.pem < /dev/null 2>/dev/null | grep 'Verify return code'", commentaire: "Vérifier la chaîne — doit retourner Verify return code: 0 (ok)" },
          { os: "linux", cmd: "sudo cp ca-racine/certs/ca.cert.pem /usr/local/share/ca-certificates/lab-root-ca.crt\nsudo update-ca-certificates", commentaire: "Importer la CA dans le magasin système Linux" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "openssl verify ca-racine/certs/ca.cert.pem : OK",
      "Certificat serveur avec SAN DNS:monsite.lab.local",
      "nginx -t : syntax is ok",
      "openssl s_client : Verify return code: 0 (ok)",
      "CA importée dans le magasin système",
      "Navigateur affiche le cadenas vert"
    ],
    tags: ["pki", "openssl", "certificats", "https", "tls", "ssl", "ca", "x509", "securite"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  // ─── DÉBUTANT ───────────────────────────────────────────────────────────────

  {
    id: 56,
    titre: "Pare-feu UFW sur Ubuntu — règles de filtrage et journalisation",
    categorie: "securite",
    niveau: "débutant",
    duree: 60,
    description: "Découvrir la gestion d'un pare-feu Linux avec UFW (Uncomplicated Firewall), le frontal simplifié d'iptables. On part d'une VM Ubuntu vierge pour activer UFW, définir une politique par défaut (deny in / allow out), ouvrir les ports légitimes (SSH, HTTP, HTTPS), bloquer des IPs suspectes, activer la journalisation et vérifier les règles actives. TP idéal en première approche de la sécurité périmétrique sous Linux.",
    objectifs: [
      "Comprendre le rôle d'un pare-feu et la différence entrée/sortie",
      "Activer UFW et définir les politiques par défaut",
      "Ouvrir des ports par numéro et par nom de service (ssh, http, https)",
      "Bloquer une IP ou un sous-réseau spécifique",
      "Activer la journalisation UFW et lire les logs dans /var/log/ufw.log",
      "Lister, numéroter et supprimer des règles existantes"
    ],
    prerequis: [
      { type: "vm", nom: "VM Ubuntu 22.04 LTS (1 interface réseau, accès Internet)" },
      { type: "logiciel", nom: "UFW préinstallé sur Ubuntu (paquet ufw)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Activation d'UFW et politique par défaut",
        contexte: "Par défaut UFW est désactivé sur Ubuntu. Avant de l'activer, on s'assure d'autoriser SSH pour ne pas se couper l'accès. La bonne pratique est : bloquer tout le trafic entrant, autoriser tout le trafic sortant, puis n'ouvrir que ce qui est nécessaire.",
        commandes: [
          { os: "linux", cmd: "sudo ufw status", commentaire: "Vérifier l'état initial (Status: inactive)" },
          { os: "linux", cmd: "sudo ufw default deny incoming\nsudo ufw default allow outgoing", commentaire: "Politique par défaut : bloquer les connexions entrantes, autoriser les sortantes" },
          { os: "linux", cmd: "sudo ufw allow ssh", commentaire: "CRITIQUE : autoriser SSH avant d'activer UFW pour ne pas se couper l'accès" },
          { os: "linux", cmd: "sudo ufw enable", commentaire: "Activer UFW — confirmation demandée (y)" },
          { os: "linux", cmd: "sudo ufw status verbose", commentaire: "Vérifier l'état détaillé avec les politiques par défaut" }
        ],
        erreurs_courantes: [
          {
            symptome: "Connexion SSH perdue après activation d'UFW",
            cause: "La règle allow ssh n'a pas été ajoutée avant d'activer UFW",
            solution: "Accéder à la VM en console directe (interface VMware/VirtualBox), puis exécuter : sudo ufw allow ssh && sudo ufw reload"
          }
        ]
      },
      {
        titre: "Étape 2 — Ouverture de ports et services courants",
        contexte: "On installe Apache pour avoir quelque chose à exposer, puis on ouvre les ports HTTP et HTTPS. UFW reconnaît les noms de services définis dans /etc/services et dispose de profils d'application dans /etc/ufw/applications.d/.",
        commandes: [
          { os: "linux", cmd: "sudo apt install apache2 -y\nsudo systemctl start apache2", commentaire: "Installer Apache pour tester l'ouverture HTTP" },
          { os: "linux", cmd: "sudo ufw allow http\nsudo ufw allow https", commentaire: "Ouvrir les ports 80 et 443 par nom de service" },
          { os: "linux", cmd: "sudo ufw allow 8080/tcp", commentaire: "Ouvrir un port spécifique (ici 8080 TCP)" },
          { os: "linux", cmd: "sudo ufw allow from 192.168.1.0/24 to any port 3306", commentaire: "Autoriser MySQL (3306) uniquement depuis le réseau LAN" },
          { os: "linux", cmd: "sudo ufw app list", commentaire: "Lister les profils d'application disponibles (Apache, OpenSSH, etc.)" },
          { os: "linux", cmd: "sudo ufw allow 'Apache Full'", commentaire: "Ouvrir HTTP+HTTPS via le profil d'application Apache" }
        ],
        erreurs_courantes: [
          {
            symptome: "curl http://localhost fonctionne mais le navigateur ne charge pas depuis une autre machine",
            cause: "La règle UFW autorise le port 80 mais pas depuis l'IP distante, ou le profil Apache n'est pas activé",
            solution: "Vérifier avec sudo ufw status numbered que la règle 80/tcp (ou Apache Full) est bien présente et active"
          }
        ]
      },
      {
        titre: "Étape 3 — Blocage d'IPs et gestion des règles",
        contexte: "On simule le blocage d'une IP suspecte et d'un sous-réseau entier. On apprend à lister les règles avec leurs numéros pour pouvoir en supprimer une précisément sans repartir de zéro.",
        commandes: [
          { os: "linux", cmd: "sudo ufw deny from 10.0.0.5", commentaire: "Bloquer toutes les connexions depuis l'IP 10.0.0.5" },
          { os: "linux", cmd: "sudo ufw deny from 10.0.0.0/24", commentaire: "Bloquer tout un sous-réseau" },
          { os: "linux", cmd: "sudo ufw status numbered", commentaire: "Lister toutes les règles avec leurs numéros" },
          { os: "linux", cmd: "sudo ufw delete 3", commentaire: "Supprimer la règle numéro 3 (confirmation demandée)" },
          { os: "linux", cmd: "sudo ufw delete allow http", commentaire: "Supprimer une règle par son nom" },
          { os: "linux", cmd: "sudo ufw reload", commentaire: "Recharger UFW après modification des règles" }
        ],
        erreurs_courantes: [
          {
            symptome: "sudo ufw delete 3 supprime la mauvaise règle",
            cause: "Les numéros changent après chaque suppression et entre IPv4/IPv6",
            solution: "Toujours relancer sudo ufw status numbered avant chaque suppression pour confirmer le bon numéro"
          }
        ]
      },
      {
        titre: "Étape 4 — Journalisation et lecture des logs",
        contexte: "La journalisation UFW enregistre les paquets bloqués et acceptés dans /var/log/ufw.log (et dans syslog). On active le niveau 'low' pour les TPs (les niveaux medium/high sont très verbeux). On provoque ensuite des blocages pour observer les logs.",
        commandes: [
          { os: "linux", cmd: "sudo ufw logging on", commentaire: "Activer la journalisation (niveau low par défaut)" },
          { os: "linux", cmd: "sudo ufw logging medium", commentaire: "Niveau medium : log des paquets bloqués ET acceptés" },
          { os: "linux", cmd: "sudo tail -f /var/log/ufw.log", commentaire: "Suivre les logs en temps réel" },
          { os: "linux", cmd: "# Depuis une autre machine ou dans un 2e terminal :\nnmap -p 23,3389 <IP_ubuntu>", commentaire: "Provoquer des tentatives de connexion bloquées (Telnet, RDP)" },
          { os: "linux", cmd: "sudo grep 'BLOCK' /var/log/ufw.log | tail -20", commentaire: "Filtrer uniquement les paquets bloqués — chercher SRC= DST= DPT=" },
          { os: "linux", cmd: "sudo ufw logging off", commentaire: "Désactiver la journalisation quand on a terminé les tests" }
        ],
        erreurs_courantes: [
          {
            symptome: "/var/log/ufw.log est vide même avec logging activé",
            cause: "rsyslog n'est pas installé ou le service est arrêté",
            solution: "sudo apt install rsyslog -y && sudo systemctl start rsyslog"
          }
        ]
      }
    ],
    checklist: [
      "sudo ufw status verbose : Status active, politique deny incoming / allow outgoing",
      "Port 22 (SSH) ouvert — connexion SSH toujours fonctionnelle",
      "Port 80 (HTTP) ouvert — curl http://localhost retourne la page Apache",
      "IP 10.0.0.5 bloquée — visible dans sudo ufw status numbered",
      "sudo ufw status numbered liste toutes les règles avec numéros",
      "/var/log/ufw.log contient des entrées BLOCK après scan nmap"
    ],
    tags: ["ufw", "firewall", "pare-feu", "ubuntu", "linux", "iptables", "securite", "filtrage", "debutant"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 57,
    titre: "Durcissement SSH — authentification par clés, bannière et Fail2Ban",
    categorie: "securite",
    niveau: "débutant",
    duree: 75,
    description: "Sécuriser l'accès SSH à un serveur Linux en trois étapes progressives : génération et déploiement d'une paire de clés RSA/ED25519, durcissement du fichier sshd_config (désactivation du login root, de l'authentification par mot de passe, changement de port), ajout d'une bannière d'avertissement légal, et installation de Fail2Ban pour bloquer automatiquement les tentatives de brute-force. Un TP fondamental pour tout administrateur système.",
    objectifs: [
      "Générer une paire de clés SSH (RSA 4096 et ED25519) et déployer la clé publique",
      "Modifier sshd_config pour désactiver root login et l'authentification par mot de passe",
      "Changer le port d'écoute SSH et comprendre le security through obscurity",
      "Configurer une bannière légale affichée avant authentification",
      "Installer Fail2Ban et comprendre le fonctionnement des jails",
      "Lire les logs Fail2Ban et débloquer une IP manuellement"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 (serveur SSH cible)" },
      { type: "vm", nom: "VM ou machine cliente pour se connecter en SSH" },
      { type: "reseau", nom: "Connectivité réseau entre client et serveur" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Authentification par clés SSH",
        contexte: "L'authentification par clé est plus sécurisée que par mot de passe : la clé privée ne transite jamais sur le réseau. On génère la paire sur la machine CLIENT, on copie la clé publique sur le SERVEUR, puis on vérifie que la connexion fonctionne sans mot de passe.",
        commandes: [
          { os: "linux", cmd: "# Sur le CLIENT :\nssh-keygen -t ed25519 -C 'admin@lab' -f ~/.ssh/id_lab_ed25519", commentaire: "Générer une paire ED25519 (plus moderne que RSA) avec commentaire" },
          { os: "linux", cmd: "# Générer RSA 4096 si ED25519 non supporté :\nssh-keygen -t rsa -b 4096 -C 'admin@lab' -f ~/.ssh/id_lab_rsa", commentaire: "Alternative RSA 4096 bits" },
          { os: "linux", cmd: "ssh-copy-id -i ~/.ssh/id_lab_ed25519.pub user@192.168.1.10", commentaire: "Copier la clé publique sur le serveur (demande le mot de passe une dernière fois)" },
          { os: "linux", cmd: "# Alternative manuelle si ssh-copy-id indisponible :\ncat ~/.ssh/id_lab_ed25519.pub | ssh user@192.168.1.10 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'", commentaire: "Méthode manuelle équivalente" },
          { os: "linux", cmd: "ssh -i ~/.ssh/id_lab_ed25519 user@192.168.1.10", commentaire: "Tester la connexion par clé — ne doit pas demander de mot de passe" },
          { os: "windows", cmd: "# Sur Windows (PowerShell) :\nssh-keygen -t ed25519 -C 'admin@lab'\ntype $env:USERPROFILE\\.ssh\\id_ed25519.pub | ssh user@192.168.1.10 'cat >> ~/.ssh/authorized_keys'", commentaire: "Génération et déploiement depuis Windows" }
        ],
        erreurs_courantes: [
          {
            symptome: "Permission denied (publickey) malgré la clé copiée",
            cause: "Permissions incorrectes sur ~/.ssh ou authorized_keys côté serveur",
            solution: "Sur le serveur : chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys && chown -R $USER:$USER ~/.ssh"
          }
        ]
      },
      {
        titre: "Étape 2 — Durcissement de sshd_config",
        contexte: "Le fichier /etc/ssh/sshd_config contrôle tous les paramètres du démon SSH. On modifie les options les plus importantes pour la sécurité. ATTENTION : toujours garder une session SSH ouverte pendant les modifications pour pouvoir corriger en cas d'erreur.",
        commandes: [
          { os: "linux", cmd: "sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak", commentaire: "Sauvegarder la config avant toute modification — INDISPENSABLE" },
          { os: "linux", cmd: "sudo nano /etc/ssh/sshd_config\n# Modifier / décommenter les lignes suivantes :\n# Port 2222\n# PermitRootLogin no\n# PasswordAuthentication no\n# PubkeyAuthentication yes\n# MaxAuthTries 3\n# ClientAliveInterval 300\n# ClientAliveCountMax 2\n# Banner /etc/ssh/banniere_ssh.txt", commentaire: "Options de durcissement essentielles" },
          { os: "linux", cmd: "sudo sshd -t", commentaire: "Tester la syntaxe avant de recharger (aucun output = OK)" },
          { os: "linux", cmd: "sudo systemctl reload ssh", commentaire: "Recharger sans couper les sessions actives" },
          { os: "linux", cmd: "# Tester depuis le CLIENT sur le nouveau port :\nssh -p 2222 -i ~/.ssh/id_lab_ed25519 user@192.168.1.10", commentaire: "Vérifier que la connexion fonctionne sur le nouveau port" }
        ],
        erreurs_courantes: [
          {
            symptome: "Connexion SSH refusée après reload",
            cause: "Erreur de syntaxe dans sshd_config ou PasswordAuthentication no sans clé déployée",
            solution: "Depuis la console VM : sudo sshd -t pour voir l'erreur, puis sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config && sudo systemctl reload ssh"
          }
        ]
      },
      {
        titre: "Étape 3 — Bannière légale SSH",
        contexte: "Une bannière affichée avant l'authentification a une valeur juridique : elle avertit que l'accès est réservé aux personnes autorisées. Elle est configurée via la directive Banner dans sshd_config.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/ssh/banniere_ssh.txt\n# Exemple de contenu :\n# ************************************************************\n# * Acces reserve au personnel autorise.                    *\n# * Toute tentative non autorisee sera enregistree et       *\n# * poursuivie conformement aux lois en vigueur.            *\n# ************************************************************", commentaire: "Créer le fichier de bannière" },
          { os: "linux", cmd: "# Vérifier que Banner /etc/ssh/banniere_ssh.txt\n# est bien présent dans sshd_config\ngrep Banner /etc/ssh/sshd_config", commentaire: "Vérifier la directive Banner dans sshd_config" },
          { os: "linux", cmd: "sudo systemctl reload ssh\nssh -p 2222 user@192.168.1.10", commentaire: "Recharger et tester — la bannière doit s'afficher avant le prompt de connexion" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Fail2Ban : protection anti brute-force",
        contexte: "Fail2Ban analyse les logs système et bannit automatiquement les IPs après un nombre configuré d'échecs d'authentification. Il crée des règles iptables/nftables temporaires. On configure une jail SSH personnalisée et on teste avec des tentatives de connexion échouées.",
        commandes: [
          { os: "linux", cmd: "sudo apt install fail2ban -y\nsudo systemctl enable fail2ban --now", commentaire: "Installer et activer Fail2Ban" },
          { os: "linux", cmd: "sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local", commentaire: "Copier la config par défaut — ne jamais modifier jail.conf directement" },
          { os: "linux", cmd: "sudo nano /etc/fail2ban/jail.local\n# Section [sshd] :\n# [sshd]\n# enabled  = true\n# port     = 2222\n# filter   = sshd\n# logpath  = /var/log/auth.log\n# maxretry = 3\n# bantime  = 3600\n# findtime = 600", commentaire: "Configurer la jail SSH (adapter le port si changé à l'étape 2)" },
          { os: "linux", cmd: "sudo systemctl restart fail2ban\nsudo fail2ban-client status", commentaire: "Redémarrer Fail2Ban et vérifier les jails actives" },
          { os: "linux", cmd: "sudo fail2ban-client status sshd", commentaire: "Voir le détail de la jail SSH : Currently banned, Total banned, IP list" },
          { os: "linux", cmd: "# Depuis le CLIENT — simuler des échecs :\nfor i in $(seq 1 5); do ssh -p 2222 -o ConnectTimeout=3 mauvaisuser@192.168.1.10; done", commentaire: "Provoquer 5 tentatives échouées pour déclencher le ban" },
          { os: "linux", cmd: "sudo fail2ban-client status sshd\nsudo grep 'Ban' /var/log/fail2ban.log", commentaire: "Vérifier que l'IP cliente est bannie" },
          { os: "linux", cmd: "sudo fail2ban-client set sshd unbanip 192.168.1.5", commentaire: "Débloquer manuellement une IP bannie" }
        ],
        erreurs_courantes: [
          {
            symptome: "fail2ban-client status sshd : 0 banned même après plusieurs échecs",
            cause: "Le port SSH dans jail.local ne correspond pas au port réel configuré dans sshd_config",
            solution: "Vérifier port = 2222 dans [sshd] de jail.local et relancer sudo systemctl restart fail2ban"
          },
          {
            symptome: "fail2ban ne démarre pas (service failed)",
            cause: "Erreur de syntaxe dans jail.local ou mauvais chemin logpath",
            solution: "sudo fail2ban-client -vvv start pour voir l'erreur détaillée"
          }
        ]
      }
    ],
    checklist: [
      "Connexion SSH par clé fonctionnelle sans mot de passe",
      "PermitRootLogin no vérifié dans sshd_config",
      "PasswordAuthentication no vérifié dans sshd_config",
      "Port SSH changé (ex: 2222) — connexion OK sur le nouveau port",
      "Bannière légale affichée avant le prompt d'authentification",
      "sudo fail2ban-client status sshd : jail active, enabled = true",
      "IP cliente bannie après 3 tentatives échouées",
      "sudo fail2ban-client set sshd unbanip : déban manuel fonctionnel"
    ],
    tags: ["ssh", "fail2ban", "durcissement", "cles-ssh", "securite", "brute-force", "linux", "debutant", "sshd"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  // ─── INTERMÉDIAIRE ──────────────────────────────────────────────────────────

  {
    id: 58,
    titre: "Suricata IDS/IPS sur Ubuntu — détection d'intrusion et règles personnalisées",
    categorie: "securite",
    niveau: "intermédiaire",
    duree: 100,
    description: "Déployer Suricata, l'IDS/IPS open-source de référence, sur Ubuntu 22.04 en mode IDS (détection passive via AF_PACKET) puis en mode IPS (prévention active via NFQueue). On installe les règles communautaires Emerging Threats, on active la détection de scans nmap et de trafic Metasploit, on écrit une règle personnalisée, et on analyse les alertes dans eve.json avec jq. La machine attaquante est un Kali Linux.",
    objectifs: [
      "Distinguer IDS (mode AF_PACKET, lecture passive) et IPS (mode NFQueue, blocage actif)",
      "Installer Suricata depuis le PPA officiel et configurer la capture sur la bonne interface",
      "Activer et mettre à jour les règles Emerging Threats avec suricata-update",
      "Lire et interpréter les alertes dans /var/log/suricata/eve.json avec jq",
      "Écrire une règle Suricata personnalisée (detect ICMP, bannière HTTP, payload custom)",
      "Passer en mode IPS avec NFQueue et vérifier le blocage actif"
    ],
    prerequis: [
      { type: "vm", nom: "VM Ubuntu 22.04 — 2 interfaces : NAT + réseau privé (192.168.1.2)" },
      { type: "vm", nom: "VM Kali Linux — réseau privé (192.168.1.10)" },
      { type: "logiciel", nom: "nmap et metasploit-framework sur Kali" },
      { type: "reseau", nom: "Connectivité entre les deux VMs" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation de Suricata et configuration de base",
        contexte: "On installe Suricata depuis le PPA OISF (Open Information Security Foundation) pour avoir la dernière version stable. L'interface de capture doit correspondre à l'interface réseau réelle de la VM (souvent ens33 ou enp0s3 — à vérifier avec ip a).",
        commandes: [
          { os: "linux", cmd: "sudo add-apt-repository ppa:oisf/suricata-stable -y\nsudo apt update && sudo apt install suricata jq -y", commentaire: "Installer Suricata depuis le PPA officiel + jq pour lire eve.json" },
          { os: "linux", cmd: "ip a", commentaire: "Identifier le nom de l'interface réseau (ex: ens33, ens18, enp0s3)" },
          { os: "linux", cmd: "sudo nano /etc/suricata/suricata.yaml\n# Modifier :\n# af-packet:\n#   - interface: ens33   # adapter au nom réel\n# HOME_NET: '[192.168.1.0/24]'\n# EXTERNAL_NET: '!$HOME_NET'", commentaire: "Configurer l'interface de capture et les variables réseau" },
          { os: "linux", cmd: "sudo suricata-update", commentaire: "Télécharger et mettre à jour les règles (Emerging Threats Free + autres)" },
          { os: "linux", cmd: "sudo suricata -T -c /etc/suricata/suricata.yaml", commentaire: "Tester la configuration — doit terminer par 'Configuration provided was successfully loaded.'" },
          { os: "linux", cmd: "sudo systemctl enable suricata --now\nsudo systemctl status suricata", commentaire: "Démarrer Suricata et vérifier qu'il est actif" }
        ],
        erreurs_courantes: [
          {
            symptome: "suricata.yaml : interface not found",
            cause: "Le nom de l'interface dans suricata.yaml ne correspond pas à celui retourné par ip a",
            solution: "Copier exactement le nom affiché par 'ip a' (ex: ens33) dans la section af-packet du yaml"
          }
        ]
      },
      {
        titre: "Étape 2 — Génération d'alertes depuis Kali et lecture d'eve.json",
        contexte: "On lance des attaques depuis Kali (scan nmap, scan HTTP Nikto) pour générer des alertes Suricata. Les alertes sont enregistrées en JSON dans /var/log/suricata/eve.json — on les lit avec jq pour extraire les infos pertinentes.",
        commandes: [
          { os: "linux", cmd: "# Sur Kali :\nsudo nmap -sS -A 192.168.1.2", commentaire: "Scan agressif depuis Kali — doit déclencher des règles ET.SCAN" },
          { os: "linux", cmd: "# Sur Ubuntu — lire les alertes en temps réel :\nsudo tail -f /var/log/suricata/eve.json | jq 'select(.event_type==\"alert\")'", commentaire: "Filtrer uniquement les événements de type alerte" },
          { os: "linux", cmd: "sudo cat /var/log/suricata/eve.json | jq 'select(.event_type==\"alert\") | {signature: .alert.signature, src_ip: .src_ip, dest_ip: .dest_ip, severity: .alert.severity}'", commentaire: "Extraire les champs clés des alertes" },
          { os: "linux", cmd: "sudo cat /var/log/suricata/eve.json | jq -r 'select(.event_type==\"alert\") | .alert.signature' | sort | uniq -c | sort -rn | head -20", commentaire: "Top 20 des règles déclenchées (détection des attaques les plus fréquentes)" },
          { os: "linux", cmd: "sudo suricatasc -c 'iface-stat ens33'", commentaire: "Statistiques de capture en temps réel" }
        ],
        erreurs_courantes: [
          {
            symptome: "eve.json vide après le scan nmap",
            cause: "Suricata écoute sur la mauvaise interface ou le scan ne passe pas par l'interface configurée",
            solution: "Vérifier avec 'sudo tcpdump -i ens33 -c 10' que le trafic Kali passe bien par ens33"
          }
        ]
      },
      {
        titre: "Étape 3 — Écriture d'une règle personnalisée",
        contexte: "Les règles Suricata suivent une syntaxe précise : action proto src_ip src_port direction dst_ip dst_port (options). On écrit trois règles progressives : détection ICMP, détection d'un User-Agent suspect, détection d'un payload personnalisé.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/suricata/rules/local.rules\n# Règle 1 — Détecter les pings depuis l'externe :\n# alert icmp $EXTERNAL_NET any -> $HOME_NET any (msg:'ICMP ping depuis externe'; itype:8; sid:9000001; rev:1;)\n#\n# Règle 2 — Détecter un User-Agent Nmap :\n# alert http $EXTERNAL_NET any -> $HOME_NET 80 (msg:'HTTP User-Agent Nmap detecte'; flow:to_server; content:'Nmap'; http_user_agent; sid:9000002; rev:1;)\n#\n# Règle 3 — Détecter un payload personnalisé :\n# alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:'Tentative acces secret'; content:'HACKED'; sid:9000003; rev:1;)", commentaire: "Fichier de règles locales — les sid perso commencent à 9000000+" },
          { os: "linux", cmd: "# Vérifier que local.rules est inclus dans suricata.yaml :\ngrep 'local.rules' /etc/suricata/suricata.yaml", commentaire: "S'assurer que le fichier local est bien référencé" },
          { os: "linux", cmd: "# Si absent, ajouter dans suricata.yaml section rule-files :\n# rule-files:\n#   - suricata.rules\n#   - local.rules", commentaire: "Ajouter local.rules à la liste des fichiers de règles" },
          { os: "linux", cmd: "sudo systemctl restart suricata\n# Tester depuis Kali :\nping -c 3 192.168.1.2\ncurl -A 'Nmap Scripting Engine' http://192.168.1.2/", commentaire: "Redémarrer et déclencher les nouvelles règles" },
          { os: "linux", cmd: "sudo cat /var/log/suricata/eve.json | jq 'select(.alert.signature_id >= 9000000)'", commentaire: "Vérifier que les alertes avec nos SIDs personnalisés apparaissent" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les règles local.rules ne déclenchent aucune alerte",
            cause: "local.rules n'est pas listé dans suricata.yaml, ou Suricata n'a pas été redémarré",
            solution: "Vérifier la section rule-files dans suricata.yaml, relancer sudo systemctl restart suricata et surveiller sudo journalctl -u suricata -f"
          }
        ]
      },
      {
        titre: "Étape 4 — Mode IPS avec NFQueue (blocage actif)",
        contexte: "En mode IPS, Suricata intercepte les paquets via netfilter (NFQueue) avant qu'ils n'atteignent l'application. On configure une règle iptables pour rediriger le trafic vers Suricata, qui peut alors décider de l'accepter ou de le bloquer. Les règles 'alert' deviennent 'drop'.",
        commandes: [
          { os: "linux", cmd: "# Arrêter Suricata en mode IDS :\nsudo systemctl stop suricata", commentaire: "Arrêter le daemon IDS avant de passer en IPS" },
          { os: "linux", cmd: "# Règle iptables pour rediriger vers NFQueue 0 :\nsudo iptables -I FORWARD -j NFQUEUE --queue-num 0\nsudo iptables -I INPUT -j NFQUEUE --queue-num 0\nsudo iptables -I OUTPUT -j NFQUEUE --queue-num 0", commentaire: "Rediriger tout le trafic vers la queue Suricata" },
          { os: "linux", cmd: "# Modifier une règle alert en drop dans local.rules :\n# drop icmp $EXTERNAL_NET any -> $HOME_NET any (msg:'IPS BLOCK ICMP ping'; itype:8; sid:9000010; rev:1;)", commentaire: "Une règle 'drop' bloque le paquet au lieu de juste l'alerter" },
          { os: "linux", cmd: "sudo suricata -c /etc/suricata/suricata.yaml -q 0", commentaire: "Démarrer Suricata en mode IPS (NFQueue 0) — laisser tourner en foreground pour voir les logs" },
          { os: "linux", cmd: "# Depuis Kali — tester le blocage :\nping -c 5 192.168.1.2", commentaire: "Les pings doivent être bloqués (100% packet loss)" },
          { os: "linux", cmd: "# Nettoyer les règles iptables après le TP :\nsudo iptables -D FORWARD -j NFQUEUE --queue-num 0\nsudo iptables -D INPUT -j NFQUEUE --queue-num 0\nsudo iptables -D OUTPUT -j NFQUEUE --queue-num 0\nsudo systemctl start suricata", commentaire: "Remettre en mode IDS à la fin du TP" }
        ],
        erreurs_courantes: [
          {
            symptome: "sudo suricata -q 0 : error creating NFQ handler",
            cause: "La règle iptables NFQUEUE n'est pas appliquée ou un autre processus écoute sur la queue 0",
            solution: "Vérifier avec sudo iptables -L -n | grep NFQUEUE que les règles sont bien actives"
          }
        ]
      }
    ],
    checklist: [
      "sudo suricata -T : 'Configuration provided was successfully loaded'",
      "sudo systemctl status suricata : active (running)",
      "Scan nmap depuis Kali génère des alertes dans eve.json (event_type: alert)",
      "jq filtre correctement les alertes avec les champs signature, src_ip, severity",
      "Règles locales SID 9000001-9000003 déclenchées et visibles dans eve.json",
      "Mode IPS : ping depuis Kali bloqué (100% packet loss) avec règle drop ICMP",
      "iptables vidé et Suricata remis en mode IDS en fin de TP"
    ],
    tags: ["suricata", "ids", "ips", "intrusion", "detection", "securite", "kali", "nfqueue", "eve-json", "ubuntu", "intermediaire"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 59,
    titre: "Audit de mots de passe avec Hashcat et John the Ripper",
    categorie: "securite",
    niveau: "intermédiaire",
    duree: 90,
    description: "Apprendre à identifier, extraire et craquer des hachages de mots de passe dans un contexte légal d'audit de sécurité (audit de son propre système de lab). On identifie les types de hachages courants (MD5, SHA1, bcrypt, NTLM), on utilise John the Ripper avec le fichier /etc/shadow Linux, puis Hashcat en mode dictionnaire et hybride pour craquer des hachages NTLM Windows extraits d'un dump SAM. On mesure l'impact de la complexité du mot de passe sur le temps de craquage.",
    objectifs: [
      "Identifier les types de hachages courants avec hash-identifier et hashid",
      "Utiliser John the Ripper sur /etc/shadow (Linux) avec wordlist et règles",
      "Utiliser Hashcat en mode dictionnaire (-a 0), brute-force (-a 3) et hybride (-a 6)",
      "Extraire des hachages NTLM depuis un dump SAM Windows avec impacket",
      "Comprendre l'impact des salts et des algorithmes (MD5 vs bcrypt vs NTLM)",
      "Mesurer le temps de craquage selon la complexité du mot de passe cible"
    ],
    prerequis: [
      { type: "vm", nom: "VM Kali Linux (John the Ripper, Hashcat, wordlist rockyou.txt préinstallés)" },
      { type: "vm", nom: "VM Windows Server 2019/2022 (pour l'extraction SAM NTLM)" },
      { type: "logiciel", nom: "impacket-secretsdump (inclus dans Kali)" },
      { type: "logiciel", nom: "GPU recommandé pour Hashcat (CPU accepté en lab)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Identification de hachages et préparation de la wordlist",
        contexte: "Avant de craquer, il faut identifier le type de hachage. On utilise hash-identifier ou hashid, deux outils Kali. On prépare aussi la wordlist rockyou.txt (14 millions de mots de passe réels issus d'une fuite), et on crée un petit fichier de hachages de test.",
        commandes: [
          { os: "linux", cmd: "# Générer des hachages de test :\necho -n 'Password123' | md5sum\necho -n 'Password123' | sha1sum\necho -n 'Password123' | sha256sum\nopenssl passwd -6 'Password123'", commentaire: "Créer des hachages avec différents algorithmes pour les exercices" },
          { os: "linux", cmd: "hash-identifier", commentaire: "Outil interactif — coller un hachage pour identifier le type" },
          { os: "linux", cmd: "hashid 5f4dcc3b5aa765d61d8327deb882cf99", commentaire: "Identifier un hachage MD5 directement en ligne de commande" },
          { os: "linux", cmd: "ls -lh /usr/share/wordlists/rockyou.txt*\n# Si compressé :\nsudo gunzip /usr/share/wordlists/rockyou.txt.gz", commentaire: "Vérifier la présence de rockyou.txt (14M mots de passe)" },
          { os: "linux", cmd: "wc -l /usr/share/wordlists/rockyou.txt", commentaire: "Compter les mots dans la wordlist (~14 344 392 lignes)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — John the Ripper sur /etc/shadow Linux",
        contexte: "John the Ripper (JtR) est l'outil de référence pour craquer des hachages Unix. Sur Linux, les mots de passe sont stockés dans /etc/shadow (lecture réservée à root). On crée d'abord des comptes de test avec des mots de passe faibles, puis on combine /etc/passwd et /etc/shadow avec unshadow avant de lancer JtR.",
        commandes: [
          { os: "linux", cmd: "# Créer des comptes de test avec mots de passe faibles (sur la VM Kali) :\nsudo useradd -m victime1 && echo 'victime1:password' | sudo chpasswd\nsudo useradd -m victime2 && echo 'victime2:letmein' | sudo chpasswd\nsudo useradd -m victime3 && echo 'victime3:P@ssw0rd123' | sudo chpasswd", commentaire: "Créer des comptes avec différents niveaux de complexité" },
          { os: "linux", cmd: "sudo unshadow /etc/passwd /etc/shadow > /tmp/shadow_combine.txt\ncat /tmp/shadow_combine.txt | grep -E 'victime[123]'", commentaire: "Combiner passwd et shadow pour JtR" },
          { os: "linux", cmd: "john /tmp/shadow_combine.txt --wordlist=/usr/share/wordlists/rockyou.txt", commentaire: "Attaque par dictionnaire — noter le temps pour chaque mot de passe" },
          { os: "linux", cmd: "john /tmp/shadow_combine.txt --show", commentaire: "Afficher les mots de passe craqués" },
          { os: "linux", cmd: "john /tmp/shadow_combine.txt --wordlist=/usr/share/wordlists/rockyou.txt --rules=Best64", commentaire: "Attaque hybride avec règles de mutation (Best64 ajoute des variantes comme P@ssw0rd)" }
        ],
        erreurs_courantes: [
          {
            symptome: "john affiche 'No password hashes loaded'",
            cause: "Le fichier shadow_combine.txt est mal formé ou lu sans droits root",
            solution: "Vérifier que sudo unshadow a bien fonctionné et que le fichier contient des lignes avec '$' (hachage)"
          }
        ]
      },
      {
        titre: "Étape 3 — Hashcat en mode dictionnaire et brute-force sur hachages NTLM",
        contexte: "Hashcat est plus rapide que JtR (surtout avec GPU) et excelle sur les hachages Windows NTLM. Le hash NTLM est non salté — ce qui le rend particulièrement vulnérable. On crée un fichier de hachages NTLM manuellement (ou extrait d'un dump SAM) et on teste différents modes d'attaque.",
        commandes: [
          { os: "linux", cmd: "# Générer des hachages NTLM de test avec Python :\npython3 -c \"import hashlib; print(hashlib.new('md4', 'password'.encode('utf-16le')).hexdigest())\"", commentaire: "NTLM = MD4(UTF-16LE(password)) — non salté" },
          { os: "linux", cmd: "# Créer le fichier de hachages NTLM :\ncat > /tmp/ntlm_hashes.txt << 'EOF'\n8846f7eaee8fb117ad06bdd830b7586c\n5835048ce94ad0564e29a924a03510ef\nEOF", commentaire: "Hachages NTLM de 'password' et 'letmein'" },
          { os: "linux", cmd: "hashcat -m 1000 /tmp/ntlm_hashes.txt /usr/share/wordlists/rockyou.txt --force", commentaire: "Mode -m 1000 = NTLM, -a 0 (défaut) = dictionnaire, --force pour forcer CPU" },
          { os: "linux", cmd: "hashcat -m 1000 /tmp/ntlm_hashes.txt -a 3 '?l?l?l?l?l?l' --force", commentaire: "Brute-force -a 3 : toutes les combinaisons 6 lettres minuscules (?l)" },
          { os: "linux", cmd: "hashcat -m 1000 /tmp/ntlm_hashes.txt -a 6 /usr/share/wordlists/rockyou.txt '?d?d' --force", commentaire: "Attaque hybride -a 6 : wordlist + 2 chiffres en suffixe (password01, letmein42...)" },
          { os: "linux", cmd: "hashcat -m 1000 /tmp/ntlm_hashes.txt --show", commentaire: "Afficher les résultats depuis le potfile (cache des mots craqués)" }
        ],
        erreurs_courantes: [
          {
            symptome: "hashcat : No devices found/left",
            cause: "Pas de GPU disponible et --force non spécifié pour forcer le CPU",
            solution: "Ajouter --force pour utiliser le CPU (plus lent mais fonctionnel en VM de lab)"
          }
        ]
      },
      {
        titre: "Étape 4 — Extraction SAM Windows avec impacket-secretsdump",
        contexte: "En contexte réel d'audit, les hachages NTLM sont extraits de la base SAM Windows. impacket-secretsdump peut le faire localement (avec les droits admin) ou à distance via SMB. On simule une extraction locale sur la VM Windows depuis Kali avec des credentials admin.",
        commandes: [
          { os: "linux", cmd: "# Extraction distante depuis Kali (nécessite compte admin Windows) :\nimpacket-secretsdump Administrator:'MotDePasse1'@192.168.1.20", commentaire: "Extraire les hachages SAM à distance via SMB — format User:RID:LMhash:NThash" },
          { os: "linux", cmd: "# Sauvegarder les hachages NT extraits :\nimpacket-secretsdump Administrator:'MotDePasse1'@192.168.1.20 | grep ':::' | awk -F: '{print $4}' > /tmp/ntlm_sam.txt\ncat /tmp/ntlm_sam.txt", commentaire: "Isoler uniquement les hachages NT pour Hashcat" },
          { os: "linux", cmd: "hashcat -m 1000 /tmp/ntlm_sam.txt /usr/share/wordlists/rockyou.txt --force\nhashcat -m 1000 /tmp/ntlm_sam.txt --show", commentaire: "Craquer les hachages SAM extraits avec Hashcat" }
        ],
        erreurs_courantes: [
          {
            symptome: "impacket-secretsdump : SMB connection error",
            cause: "Le pare-feu Windows bloque SMB ou les credentials sont incorrects",
            solution: "Vérifier que SMB (port 445) est accessible : nmap -p 445 192.168.1.20. Désactiver temporairement le firewall Windows pour le TP."
          }
        ]
      }
    ],
    checklist: [
      "hash-identifier identifie correctement MD5, SHA1, SHA256, NTLM",
      "john /tmp/shadow_combine.txt --show : 'password' et 'letmein' craqués",
      "john avec --rules=Best64 craque le mot de passe complexe victime3",
      "hashcat -m 1000 : hachages NTLM 'password' et 'letmein' craqués depuis rockyou.txt",
      "hashcat -a 6 (hybride) démonstration fonctionnelle",
      "impacket-secretsdump extrait des hachages depuis la VM Windows",
      "Temps de craquage comparé entre mot de passe simple (secondes) et complexe (heures/jours)"
    ],
    tags: ["hashcat", "john-the-ripper", "audit", "mots-de-passe", "ntlm", "shadow", "securite", "kali", "impacket", "intermediaire"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  // ─── AVANCÉ ─────────────────────────────────────────────────────────────────

  {
    id: 60,
    titre: "SIEM Wazuh — déploiement, agents, règles personnalisées et alertes",
    categorie: "securite",
    niveau: "avancé",
    duree: 150,
    description: "Déployer Wazuh, le SIEM open-source de référence pour les PME et la formation BTS SISR, en architecture tout-en-un (Wazuh Server + Indexer + Dashboard sur une VM Debian). On connecte des agents Windows et Linux, on analyse les événements de sécurité (connexions, modifications de fichiers, escalades de privilèges), on crée des règles personnalisées en XML, et on configure des alertes email. Wazuh remplace avantageusement OSSEC et fournit une interface Kibana-like complète.",
    objectifs: [
      "Déployer Wazuh All-in-One sur Debian 12 avec le script officiel",
      "Connecter un agent Linux (Ubuntu) et un agent Windows Server",
      "Comprendre la structure des événements Wazuh (règles, niveaux, décodeurs)",
      "Créer une règle XML personnalisée pour détecter une connexion SSH root réussie",
      "Configurer la surveillance FIM (File Integrity Monitoring) sur des répertoires sensibles",
      "Configurer les alertes email via Postfix et les webhooks Wazuh"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 — 4 vCPU, 8 Go RAM, 50 Go disque (Wazuh Manager)" },
      { type: "vm", nom: "VM Ubuntu 22.04 (agent Linux)" },
      { type: "vm", nom: "VM Windows Server 2019/2022 (agent Windows)" },
      { type: "reseau", nom: "Toutes les VMs sur le même réseau — ports 1514/1515 UDP/TCP ouverts" },
      { type: "logiciel", nom: "Accès Internet sur la VM Debian pour le script d'installation" }
    ],
    schema_reseau: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arrW" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#3B82F6"/>
    </marker>
  </defs>
  <!-- Wazuh Server -->
  <rect x="220" y="80" width="200" height="120" rx="10" fill="#1C1917" stroke="#3B82F6" stroke-width="2"/>
  <text x="320" y="108" text-anchor="middle" fill="#3B82F6" font-size="13" font-weight="bold">Wazuh Server</text>
  <text x="320" y="126" text-anchor="middle" fill="#78716C" font-size="8">Debian 12 — 192.168.1.5</text>
  <rect x="235" y="135" width="170" height="20" rx="4" fill="#292524" stroke="#6366F1" stroke-width="1"/>
  <text x="320" y="149" text-anchor="middle" fill="#6366F1" font-size="8">Wazuh Manager + Indexer</text>
  <rect x="235" y="160" width="170" height="20" rx="4" fill="#292524" stroke="#10B981" stroke-width="1"/>
  <text x="320" y="174" text-anchor="middle" fill="#10B981" font-size="8">Dashboard :443 (Kibana-like)</text>
  <!-- Agent Ubuntu -->
  <rect x="20" y="100" width="140" height="80" rx="8" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="90" y="128" text-anchor="middle" fill="#10B981" font-size="10" font-weight="bold">Agent Linux</text>
  <text x="90" y="143" text-anchor="middle" fill="#A8A29E" font-size="8">Ubuntu 22.04</text>
  <text x="90" y="157" text-anchor="middle" fill="#78716C" font-size="7">192.168.1.2</text>
  <text x="90" y="170" text-anchor="middle" fill="#78716C" font-size="7">port 1514 UDP</text>
  <!-- Agent Windows -->
  <rect x="20" y="195" width="140" height="70" rx="8" fill="#1C1917" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="90" y="221" text-anchor="middle" fill="#F59E0B" font-size="10" font-weight="bold">Agent Windows</text>
  <text x="90" y="237" text-anchor="middle" fill="#A8A29E" font-size="8">Windows Server 2022</text>
  <text x="90" y="252" text-anchor="middle" fill="#78716C" font-size="7">192.168.1.20</text>
  <!-- Lignes agents -->
  <line x1="160" y1="140" x2="220" y2="140" stroke="#10B981" stroke-width="1.5" marker-end="url(#arrW)"/>
  <line x1="160" y1="225" x2="220" y2="165" stroke="#F59E0B" stroke-width="1.5" marker-end="url(#arrW)"/>
  <!-- Dashboard access -->
  <rect x="480" y="105" width="140" height="70" rx="8" fill="#1C1917" stroke="#6366F1" stroke-width="1.5"/>
  <text x="550" y="131" text-anchor="middle" fill="#6366F1" font-size="10" font-weight="bold">Analyste</text>
  <text x="550" y="147" text-anchor="middle" fill="#A8A29E" font-size="8">Navigateur HTTPS</text>
  <text x="550" y="163" text-anchor="middle" fill="#78716C" font-size="7">https://192.168.1.5</text>
  <line x1="420" y1="140" x2="480" y2="140" stroke="#6366F1" stroke-width="1.5" marker-end="url(#arrW)"/>
  <!-- Légende -->
  <rect x="220" y="220" width="200" height="45" rx="6" fill="#292524" stroke="#78716C" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="320" y="238" text-anchor="middle" fill="#78716C" font-size="7">Ports Wazuh :</text>
  <text x="320" y="251" text-anchor="middle" fill="#78716C" font-size="7">1514 UDP/TCP — events agents</text>
  <text x="320" y="262" text-anchor="middle" fill="#78716C" font-size="7">1515 TCP — enrôlement agents</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Déploiement Wazuh All-in-One sur Debian 12",
        contexte: "Wazuh propose un script d'installation qui déploie automatiquement les trois composants : le Manager (analyse des événements), l'Indexer (stockage basé sur OpenSearch) et le Dashboard (interface web). L'installation prend 10 à 20 minutes selon la connexion Internet. La VM doit avoir au minimum 4 Go de RAM disponible.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install curl -y", commentaire: "Préparer Debian 12" },
          { os: "linux", cmd: "curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh\ncurl -sO https://packages.wazuh.com/4.7/config.yml", commentaire: "Télécharger le script et le fichier de configuration" },
          { os: "linux", cmd: "# Éditer config.yml — changer l'IP :\n# nodes:\n#   indexer:\n#     - name: node-1\n#       ip: 192.168.1.5\n#   server:\n#     - name: wazuh-1\n#       ip: 192.168.1.5\n#   dashboard:\n#     - name: dashboard\n#       ip: 192.168.1.5\nsudo nano config.yml", commentaire: "Adapter les IPs à votre réseau de lab" },
          { os: "linux", cmd: "sudo bash wazuh-install.sh -a 2>&1 | tee /tmp/wazuh_install.log", commentaire: "Lancer l'installation All-in-One — noter le mot de passe admin affiché en fin d'installation" },
          { os: "linux", cmd: "sudo systemctl status wazuh-manager wazuh-indexer wazuh-dashboard", commentaire: "Vérifier que les 3 services sont actifs" },
          { os: "linux", cmd: "# Se connecter au Dashboard :\n# https://192.168.1.5 (HTTPS, certificat auto-signé)\n# Login : admin\n# Mot de passe : affiché à la fin du script d'installation", commentaire: "Accéder à l'interface web Wazuh" }
        ],
        erreurs_courantes: [
          {
            symptome: "wazuh-indexer ne démarre pas (OOM Killer dans dmesg)",
            cause: "RAM insuffisante — Wazuh Indexer (OpenSearch) nécessite au minimum 4 Go de RAM dédiée",
            solution: "Augmenter la RAM de la VM à 8 Go minimum, ou réduire la JVM heap dans /etc/wazuh-indexer/jvm.options (-Xms2g -Xmx2g)"
          },
          {
            symptome: "Dashboard inaccessible : SSL_ERROR_RX_RECORD_TOO_LONG",
            cause: "Accès en HTTP au lieu de HTTPS",
            solution: "Utiliser https://192.168.1.5 (avec s) — les certificats auto-signés doivent être acceptés manuellement"
          }
        ]
      },
      {
        titre: "Étape 2 — Enrôlement des agents Linux et Windows",
        contexte: "Chaque machine à surveiller doit avoir l'agent Wazuh installé et enrôlé auprès du Manager. L'enrôlement génère une clé unique par agent. Le Manager écoute sur le port 1515/TCP pour l'enrôlement et 1514/UDP pour la réception des événements.",
        commandes: [
          { os: "linux", cmd: "# Sur Ubuntu (agent Linux) — installer et enrôler :\ncurl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | sudo gpg --dearmor -o /usr/share/keyrings/wazuh.gpg\necho 'deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main' | sudo tee /etc/apt/sources.list.d/wazuh.list\nsudo apt update && sudo apt install wazuh-agent -y", commentaire: "Ajouter le dépôt Wazuh et installer l'agent sur Ubuntu" },
          { os: "linux", cmd: "# Configurer l'agent Ubuntu — adresse du Manager :\nsudo sed -i 's/MANAGER_IP/192.168.1.5/' /var/ossec/etc/ossec.conf\nsudo systemctl enable wazuh-agent --now", commentaire: "Pointer l'agent vers le Manager et démarrer" },
          { os: "windows", cmd: "# Sur Windows Server — PowerShell (admin) :\nInvoke-WebRequest -Uri 'https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi' -OutFile wazuh-agent.msi\nmsiexec /i wazuh-agent.msi WAZUH_MANAGER='192.168.1.5' /qn", commentaire: "Télécharger et installer l'agent Windows silencieusement" },
          { os: "windows", cmd: "# Démarrer le service Wazuh sur Windows :\nNET START WazuhSvc\n# Vérifier :\nGet-Service WazuhSvc", commentaire: "Démarrer le service agent Windows" },
          { os: "linux", cmd: "# Sur le Manager Debian — vérifier les agents connectés :\nsudo /var/ossec/bin/agent_control -l", commentaire: "Lister tous les agents enrôlés et leur statut (Active/Disconnected)" },
          { os: "linux", cmd: "sudo /var/ossec/bin/wazuh-control status", commentaire: "Vérifier tous les processus Wazuh côté Manager" }
        ],
        erreurs_courantes: [
          {
            symptome: "agent_control -l : agent status = Disconnected",
            cause: "Port 1514 bloqué par le pare-feu sur le Manager ou l'agent ne pointe pas sur la bonne IP",
            solution: "Sur Debian : sudo ufw allow 1514 && sudo ufw allow 1515. Vérifier MANAGER_IP dans /var/ossec/etc/ossec.conf côté agent."
          }
        ]
      },
      {
        titre: "Étape 3 — Exploration du Dashboard et analyse des événements",
        contexte: "Le Dashboard Wazuh offre plusieurs vues : Security Events (tous les événements), Integrity Monitoring (FIM), Vulnerability Detection, et plus. On explore les événements générés par les agents, on comprend les niveaux de criticité (0 à 15) et on filtre par règle, agent et niveau.",
        commandes: [
          { os: "linux", cmd: "# Générer des événements sur Ubuntu (agent) :\nsudo su -   # connexion root (niveau 5)\nsudo cat /etc/shadow  # accès fichier sensible\nfailed_login_attempt() { ssh baduser@localhost; }\nfor i in $(seq 1 5); do failed_login_attempt 2>/dev/null; done", commentaire: "Générer différents types d'événements de sécurité" },
          { os: "linux", cmd: "# Sur le Manager — lire les alertes en ligne de commande :\nsudo tail -f /var/ossec/logs/alerts/alerts.log", commentaire: "Flux des alertes en temps réel (format texte)" },
          { os: "linux", cmd: "sudo tail -f /var/ossec/logs/alerts/alerts.json | python3 -m json.tool | grep -A5 '\"rule\"'", commentaire: "Alertes JSON filtrées sur les infos de règle" },
          { os: "linux", cmd: "# Dans le Dashboard :\n# Modules > Security Events\n# Filtrer : agent.name = 'ubuntu-agent'\n# Filtrer : rule.level >= 7\n# Observer : rule.id, rule.description, rule.groups", commentaire: "Navigation dans le Dashboard Wazuh" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Règle personnalisée XML et FIM (File Integrity Monitoring)",
        contexte: "Les règles Wazuh sont en XML dans /var/ossec/etc/rules/. On ne modifie jamais les règles officielles — on crée un fichier local.rules.xml. On écrit une règle qui élève le niveau d'alerte pour les connexions SSH root, puis on configure le FIM pour surveiller /etc et /home.",
        commandes: [
          { os: "linux", cmd: "sudo nano /var/ossec/etc/rules/local_rules.xml\n# Contenu :\n# <group name='custom,ssh,'>\n#   <rule id='100001' level='12'>\n#     <if_sid>5715</if_sid>\n#     <match>session opened for user root</match>\n#     <description>Connexion SSH ROOT reussie - CRITIQUE</description>\n#     <group>authentication_success,pci_dss_10.2.5,</group>\n#   </rule>\n# </group>", commentaire: "Règle personnalisée niveau 12 sur la connexion root SSH (SID 5715 = auth success)" },
          { os: "linux", cmd: "sudo /var/ossec/bin/wazuh-logtest", commentaire: "Tester les règles interactivement — coller un log SSH pour voir la règle déclenchée" },
          { os: "linux", cmd: "# Configurer FIM dans ossec.conf :\nsudo nano /var/ossec/etc/ossec.conf\n# Ajouter dans <syscheck> :\n# <directories check_all='yes' report_changes='yes' realtime='yes'>/etc</directories>\n# <directories check_all='yes' report_changes='yes'>/home</directories>\n# <frequency>300</frequency>", commentaire: "Activer la surveillance en temps réel de /etc et /home" },
          { os: "linux", cmd: "sudo systemctl restart wazuh-manager", commentaire: "Redémarrer pour appliquer les nouvelles règles et la config FIM" },
          { os: "linux", cmd: "# Tester le FIM — modifier un fichier surveillé sur l'agent :\n# Sur Ubuntu agent :\necho 'test_fim' | sudo tee -a /etc/hosts", commentaire: "Déclencher une alerte FIM (modification de /etc/hosts)" },
          { os: "linux", cmd: "sudo grep '100001' /var/ossec/logs/alerts/alerts.json | tail -5", commentaire: "Vérifier que la règle personnalisée 100001 apparaît dans les alertes" }
        ],
        erreurs_courantes: [
          {
            symptome: "wazuh-logtest : 'No rule matched'",
            cause: "L'ID parent (if_sid) ne correspond pas au bon identifiant de règle",
            solution: "Chercher l'ID exact avec : grep -r 'session opened for user root' /var/ossec/ruleset/rules/ pour trouver le SID parent réel"
          },
          {
            symptome: "FIM ne détecte pas les changements sur l'agent",
            cause: "La configuration FIM est dans ossec.conf du Manager mais n'est pas poussée sur l'agent",
            solution: "Pour les agents, ajouter la config FIM dans /var/ossec/etc/ossec.conf côté AGENT (pas Manager), puis sudo systemctl restart wazuh-agent"
          }
        ]
      },
      {
        titre: "Étape 5 — Alertes email via intégration Wazuh",
        contexte: "Wazuh peut envoyer des alertes email pour les événements dépassant un niveau configuré. On configure un relais SMTP local avec Postfix (ou un serveur SMTP externe) et on active l'envoi d'email dans ossec.conf.",
        commandes: [
          { os: "linux", cmd: "sudo apt install postfix mailutils -y\n# Sélectionner 'Internet Site' dans le configurateur\n# System mail name : lab.local", commentaire: "Installer Postfix comme relais SMTP local" },
          { os: "linux", cmd: "sudo nano /var/ossec/etc/ossec.conf\n# Dans la section <global> :\n# <email_notification>yes</email_notification>\n# <email_to>admin@lab.local</email_to>\n# <smtp_server>localhost</smtp_server>\n# <email_from>wazuh@lab.local</email_from>\n# <email_maxperhour>10</email_maxperhour>\n# <email_alert_level>10</email_alert_level>", commentaire: "Configurer l'envoi d'email pour les alertes niveau >= 10" },
          { os: "linux", cmd: "sudo systemctl restart wazuh-manager\n# Déclencher une alerte niveau >= 10 (connexion root SSH)\n# Vérifier la réception :\nmail -u root", commentaire: "Tester la réception des alertes email" },
          { os: "linux", cmd: "sudo /var/ossec/bin/ossec-maild -V", commentaire: "Vérifier la version et l'état du daemon d'envoi d'emails Wazuh" }
        ],
        erreurs_courantes: [
          {
            symptome: "Aucun email reçu malgré des alertes niveau >= 10",
            cause: "Postfix non démarré, email_alert_level trop élevé, ou les alertes générées sont sous le seuil",
            solution: "Vérifier sudo systemctl status postfix, baisser email_alert_level à 7 pour les tests, et contrôler /var/log/mail.log"
          }
        ]
      }
    ],
    checklist: [
      "https://192.168.1.5 : Dashboard Wazuh accessible, login admin fonctionnel",
      "sudo systemctl status wazuh-manager wazuh-indexer wazuh-dashboard : tous Active",
      "agent_control -l : agents Ubuntu et Windows avec statut Active",
      "Security Events : événements des deux agents visibles dans le Dashboard",
      "Règle 100001 : alerte niveau 12 déclenchée après connexion SSH root",
      "wazuh-logtest confirme la règle personnalisée sur un log SSH root",
      "FIM : modification de /etc/hosts visible dans Modules > Integrity Monitoring",
      "Email reçu pour alerte niveau >= 10 (ou alerte visible dans /var/ossec/logs/alerts/)"
    ],
    tags: ["wazuh", "siem", "ids", "fim", "securite", "alertes", "monitoring", "debian", "windows", "avance", "opensearch", "log-management"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 127,
    titre: "OpenVAS / Greenbone — scan de vulnérabilités et rapport de remédiation",
    categorie: "securite",
    niveau: "intermédiaire",
    duree: 90,
    description: "Déployer Greenbone Community Edition (OpenVAS) sur Kali ou Debian, lancer un scan de vulnérabilités authentifié et non authentifié sur des cibles Linux et Windows, interpréter les scores CVSS et produire un rapport de remédiation priorisé.",
    objectifs: [
      "Installer et initialiser Greenbone Vulnerability Management (GVM)",
      "Créer une cible et une tâche de scan",
      "Lancer un scan non authentifié puis authentifié (credentials SSH/SMB)",
      "Interpréter les résultats : CVE, CVSS, sévérité",
      "Exporter un rapport PDF et prioriser la remédiation"
    ],
    prerequis: [
      { type: "vm", nom: "VM Kali Linux ou Debian 12 — 4 vCPU, 4GB RAM min (scanner)" },
      { type: "vm", nom: "VM Metasploitable 2 ou Debian volontairement non patchée (cible)" },
      { type: "vm", nom: "VM Windows 10/Server (cible, optionnel)" },
      { type: "reseau", nom: "Connectivité IP entre scanner et cibles" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer Greenbone (GVM) et initialiser la base",
        contexte: "Sur Kali, GVM s'installe via apt puis via un script d'initialisation qui télécharge les feeds de tests de vulnérabilité (NVT, CVE, CERT). Le premier téléchargement des feeds prend 20-40 minutes selon la connexion.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install -y gvm", commentaire: "Installer Greenbone Vulnerability Management" },
          { os: "linux", cmd: "sudo gvm-setup", commentaire: "Initialiser GVM et télécharger les feeds (long — 20-40 min)" },
          { os: "linux", cmd: "sudo gvm-check-setup", commentaire: "Vérifier que tous les composants sont OK" },
          { os: "linux", cmd: "sudo gvm-feed-update", commentaire: "Mettre à jour les feeds de vulnérabilités" },
          { os: "linux", cmd: "sudo gvm-start", commentaire: "Démarrer les services — interface sur https://127.0.0.1:9392" }
        ],
        erreurs_courantes: [
          {
            symptome: "gvm-check-setup : feed non synchronisé / VT count = 0",
            cause: "Le téléchargement des feeds n'est pas terminé ou a échoué",
            solution: "Relancer sudo gvm-feed-update et attendre. Vérifier l'espace disque (df -h) — les feeds font plusieurs Go."
          },
          {
            symptome: "Mot de passe admin inconnu",
            cause: "Le mot de passe est généré aléatoirement pendant gvm-setup",
            solution: "Le relire dans la sortie de gvm-setup, ou le réinitialiser : sudo runuser -u _gvm -- gvmd --user=admin --new-password=MonMotDePasse"
          }
        ]
      },
      {
        titre: "Étape 2 — Créer une cible et lancer un scan non authentifié",
        contexte: "Un scan non authentifié simule la vision d'un attaquant externe : il ne voit que les services exposés. On crée une cible (l'IP de la machine vulnérable) puis une tâche de scan avec le profil Full and fast.",
        commandes: [
          { os: "both", cmd: "# Interface web https://127.0.0.1:9392 (admin / <mot de passe>)\n# Configuration > Targets > New Target\n# Name : cible-linux / Hosts : 192.168.1.50", commentaire: "Créer la cible à scanner" },
          { os: "both", cmd: "# Scans > Tasks > New Task\n# Name : scan-non-authentifie\n# Scan Targets : cible-linux\n# Scan Config : Full and fast > Save > ▶ Start", commentaire: "Créer et lancer la tâche de scan" },
          { os: "linux", cmd: "# En attendant, sur le scanner, vérifier la cible :\nnmap -sV 192.168.1.50", commentaire: "Corréler les ports ouverts avec les résultats OpenVAS" }
        ],
        erreurs_courantes: [
          {
            symptome: "Scan reste à 0% / statut Requested",
            cause: "Le scanner OpenVAS (ospd-openvas) n'est pas démarré",
            solution: "sudo systemctl status ospd-openvas. Relancer sudo gvm-start."
          }
        ]
      },
      {
        titre: "Étape 3 — Scan authentifié (credentials SSH et SMB)",
        contexte: "Un scan authentifié se connecte à la cible pour inspecter les paquets installés, versions et configurations — il détecte beaucoup plus de vulnérabilités qu'un scan externe. On fournit des identifiants SSH (Linux) ou SMB (Windows).",
        commandes: [
          { os: "both", cmd: "# Configuration > Credentials > New Credential\n# Name : ssh-cible / Type : Username + Password (ou clé SSH)\n# Login : labuser / Password : ******", commentaire: "Créer les identifiants SSH pour l'authentification" },
          { os: "both", cmd: "# Éditer la Target cible-linux :\n# SSH Credential : ssh-cible (port 22)\n# Relancer la tâche de scan", commentaire: "Associer les credentials à la cible et rescanner" },
          { os: "both", cmd: "# Pour Windows : Credential type SMB\n# Login : Administrateur / activer le partage admin$", commentaire: "Scan authentifié Windows via SMB" }
        ],
        erreurs_courantes: [
          {
            symptome: "Scan authentifié : Authentication failed dans le rapport",
            cause: "Mauvais identifiants, SSH refuse le mot de passe, ou compte non admin",
            solution: "Tester ssh labuser@192.168.1.50 manuellement. Pour Windows, vérifier que le partage admin$ est accessible."
          }
        ]
      },
      {
        titre: "Étape 4 — Interpréter les résultats et exporter le rapport",
        contexte: "Les résultats sont classés par sévérité (score CVSS). On priorise : Critical/High d'abord, surtout les vulnérabilités avec exploit public. Le rapport PDF sert de livrable de remédiation.",
        commandes: [
          { os: "both", cmd: "# Scans > Results — filtrer par Severity : High\n# Cliquer une vulnérabilité : CVE, CVSS, solution proposée", commentaire: "Analyser les vulnérabilités critiques" },
          { os: "both", cmd: "# Scans > Reports > sélectionner le rapport\n# Export as : PDF > Download", commentaire: "Exporter le rapport de remédiation en PDF" },
          { os: "linux", cmd: "# Appliquer une remédiation sur la cible puis rescanner :\nsudo apt update && sudo apt upgrade -y", commentaire: "Corriger puis relancer le scan pour valider la baisse du score" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "gvm-check-setup retourne OK et le feed VT est chargé (> 80000 VTs)",
      "Interface Greenbone accessible sur https://127.0.0.1:9392",
      "Cible créée et scan non authentifié terminé (statut Done)",
      "Credentials SSH/SMB créés et scan authentifié effectué",
      "Au moins une vulnérabilité High/Critical analysée (CVE + CVSS)",
      "Rapport PDF exporté",
      "Rescan après remédiation montrant une baisse du score de sévérité"
    ],
    tags: ["openvas", "greenbone", "gvm", "vulnerabilite", "cve", "cvss", "scan", "securite", "audit", "kali"],
    date_ajout: "2026-07-03",
    source: "École"
  },

  {
    id: 128,
    titre: "Active Directory — durcissement et audit avec PingCastle",
    categorie: "securite",
    niveau: "avancé",
    duree: 100,
    description: "Auditer la sécurité d'un domaine Active Directory avec PingCastle, comprendre les points faibles courants (comptes à mot de passe qui n'expire jamais, Kerberoasting, délégations dangereuses), appliquer un durcissement via GPO et mesurer l'amélioration du score de risque.",
    objectifs: [
      "Installer et exécuter PingCastle sur un domaine AD de lab",
      "Lire le score de risque et les indicateurs (Stale, Privileged, Trusts, Anomalies)",
      "Identifier les comptes vulnérables au Kerberoasting",
      "Appliquer un durcissement par GPO (mots de passe, SMB signing, LLMNR)",
      "Relancer l'audit et mesurer la baisse du score"
    ],
    prerequis: [
      { type: "vm", nom: "VM Windows Server 2019/2022 promue contrôleur de domaine (lab.local)" },
      { type: "vm", nom: "VM Windows 10/11 jointe au domaine (poste d'audit)" },
      { type: "logiciel", nom: "PingCastle (édition Community)", lien: "https://www.pingcastle.com/download/" },
      { type: "reseau", nom: "Poste d'audit membre du domaine avec un compte utilisateur standard" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Préparer le domaine de lab et des comptes vulnérables",
        contexte: "Pour que l'audit soit parlant, on crée volontairement quelques faiblesses classiques : un compte de service avec SPN (cible Kerberoasting), un compte dont le mot de passe n'expire jamais, un utilisateur dans un groupe privilégié.",
        commandes: [
          { os: "windows", cmd: "New-ADUser -Name \"svc-sql\" -SamAccountName svc-sql -AccountPassword (ConvertTo-SecureString \"P@ssw0rd\" -AsPlainText -Force) -Enabled $true -PasswordNeverExpires $true", commentaire: "Compte de service faible (PasswordNeverExpires)" },
          { os: "windows", cmd: "setspn -s MSSQLSvc/sql.lab.local:1433 lab\\svc-sql\nsetspn -l svc-sql", commentaire: "Ajouter un SPN — rend le compte Kerberoastable" },
          { os: "windows", cmd: "Add-ADGroupMember -Identity \"Domain Admins\" -Members svc-sql", commentaire: "Erreur classique : compte de service dans Domain Admins" }
        ],
        erreurs_courantes: [
          {
            symptome: "New-ADUser : terme non reconnu",
            cause: "Module ActiveDirectory non importé ou exécuté hors du DC",
            solution: "Sur le DC : Import-Module ActiveDirectory. Ou installer les RSAT sur le poste d'audit."
          }
        ]
      },
      {
        titre: "Étape 2 — Lancer l'audit PingCastle",
        contexte: "PingCastle interroge l'AD avec un simple compte utilisateur (pas besoin d'être admin) et produit un rapport HTML avec un score de risque global (0 = parfait, 100 = critique) réparti sur 4 catégories.",
        commandes: [
          { os: "windows", cmd: "cd C:\\PingCastle\n.\\PingCastle.exe --healthcheck --server lab.local", commentaire: "Audit healthcheck du domaine" },
          { os: "windows", cmd: "# Ouvrir le rapport généré :\nlab.local.html", commentaire: "Rapport HTML avec le score de risque" },
          { os: "windows", cmd: ".\\PingCastle.exe --scanner nullsession --server lab.local\n.\\PingCastle.exe --scanner smb --server lab.local", commentaire: "Scanners ciblés : null session, SMB signing" }
        ],
        erreurs_courantes: [
          {
            symptome: "Unable to connect to the domain",
            cause: "Le poste n'est pas membre du domaine ou DNS ne résout pas lab.local",
            solution: "nslookup lab.local doit renvoyer le DC. Rejoindre le domaine ou pointer le DNS vers le DC."
          }
        ]
      },
      {
        titre: "Étape 3 — Interpréter le score et repérer le Kerberoasting",
        contexte: "Le rapport détaille les indicateurs : Stale Objects (comptes obsolètes), Privileged Accounts, Trusts, Anomalies. On repère le compte svc-sql avec SPN et on démontre le Kerberoasting depuis le poste d'audit.",
        commandes: [
          { os: "windows", cmd: "# Section Privileged Accounts du rapport :\n# repérer svc-sql (SPN + Domain Admins + PasswordNeverExpires)", commentaire: "Lire les comptes privilégiés à risque" },
          { os: "windows", cmd: "# Depuis le poste (compte standard) — Rubeus ou PowerView :\nRubeus.exe kerberoast /outfile:hashes.txt", commentaire: "Extraire les tickets Kerberos des comptes à SPN" },
          { os: "linux", cmd: "hashcat -m 13100 hashes.txt rockyou.txt", commentaire: "Cracker le TGS hors ligne — démontre le risque" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Durcir via GPO et re-auditer",
        contexte: "On corrige les faiblesses : retirer le compte de service des Domain Admins, activer SMB signing, désactiver LLMNR/NBT-NS (empêche le poisoning Responder), imposer l'expiration des mots de passe. Puis on relance PingCastle pour mesurer le gain.",
        commandes: [
          { os: "windows", cmd: "Remove-ADGroupMember -Identity \"Domain Admins\" -Members svc-sql -Confirm:$false\nSet-ADUser svc-sql -PasswordNeverExpires $false", commentaire: "Corriger le compte de service" },
          { os: "windows", cmd: "# GPO : Computer > Policies > Admin Templates > Network > DNS Client\n# Turn off multicast name resolution : Enabled (désactive LLMNR)", commentaire: "Désactiver LLMNR par GPO" },
          { os: "windows", cmd: "# GPO : Security Options > Microsoft network server: Digitally sign communications (always) : Enabled\ngpupdate /force", commentaire: "Forcer le SMB signing" },
          { os: "windows", cmd: ".\\PingCastle.exe --healthcheck --server lab.local", commentaire: "Relancer l'audit — le score doit baisser" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le score ne change pas après les GPO",
            cause: "Les GPO ne sont pas appliquées ou la réplication AD n'est pas faite",
            solution: "gpupdate /force sur les machines, attendre la réplication, et relancer PingCastle."
          }
        ]
      }
    ],
    checklist: [
      "PingCastle exécuté, rapport HTML généré avec un score de risque initial",
      "Comptes à risque identifiés (SPN, PasswordNeverExpires, Domain Admins)",
      "Kerberoasting démontré : TGS extrait puis craqué hors ligne",
      "Compte de service retiré des Domain Admins et expiration réactivée",
      "GPO LLMNR désactivé et SMB signing forcé, gpupdate /force appliqué",
      "Second audit PingCastle montrant une baisse mesurable du score"
    ],
    tags: ["active-directory", "pingcastle", "kerberoasting", "gpo", "durcissement", "audit", "windows", "securite", "avance", "hardening"],
    date_ajout: "2026-07-03",
    source: "École"
  },

  {
    id: 132,
    titre: "Reverse proxy Nginx + WAF ModSecurity (OWASP CRS)",
    categorie: "securite",
    niveau: "avancé",
    duree: 95,
    description: "Mettre un reverse proxy Nginx devant une application web, puis y greffer le pare-feu applicatif ModSecurity avec les règles OWASP Core Rule Set. Passer du mode détection au mode blocage, tester avec des attaques SQLi/XSS et régler les faux positifs.",
    objectifs: [
      "Configurer Nginx en reverse proxy devant un backend web",
      "Installer ModSecurity 3 (libmodsecurity) et le connecteur Nginx",
      "Déployer l'OWASP Core Rule Set (CRS)",
      "Passer de DetectionOnly à On (blocage actif)",
      "Tester des attaques SQLi/XSS et gérer les faux positifs"
    ],
    prerequis: [
      { type: "vm", nom: "VM Ubuntu 22.04 (reverse proxy Nginx + ModSecurity)" },
      { type: "vm", nom: "Backend web (app quelconque, ou conteneur DVWA pour tester)" },
      { type: "vm", nom: "Kali/poste attaquant (curl suffit)" },
      { type: "reseau", nom: "Le proxy joint le backend et est accessible des clients" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Nginx en reverse proxy",
        contexte: "On place Nginx devant l'application : il reçoit les requêtes des clients et les transmet au backend. C'est le point de passage idéal pour inspecter le trafic avec un WAF.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install -y nginx", commentaire: "Installer Nginx" },
          { os: "linux", cmd: "# /etc/nginx/sites-available/proxy.conf :\nserver {\n  listen 80;\n  server_name app.lab.local;\n  location / {\n    proxy_pass http://192.168.1.60:8080;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n}", commentaire: "Configurer le reverse proxy vers le backend" },
          { os: "linux", cmd: "sudo ln -s /etc/nginx/sites-available/proxy.conf /etc/nginx/sites-enabled/\nsudo nginx -t && sudo systemctl reload nginx", commentaire: "Activer et recharger la configuration" }
        ],
        erreurs_courantes: [
          {
            symptome: "502 Bad Gateway",
            cause: "Backend injoignable ou mauvais proxy_pass",
            solution: "curl http://192.168.1.60:8080 depuis le proxy. Vérifier IP/port du backend et le firewall."
          }
        ]
      },
      {
        titre: "Étape 2 — Installer ModSecurity 3 et le connecteur Nginx",
        contexte: "ModSecurity 3 (libmodsecurity) est le moteur WAF ; le connecteur nginx fait le pont. Sur Ubuntu, on peut utiliser le paquet libnginx-mod-http-modsecurity.",
        commandes: [
          { os: "linux", cmd: "sudo apt install -y libnginx-mod-http-modsecurity", commentaire: "Installer le connecteur ModSecurity pour Nginx" },
          { os: "linux", cmd: "sudo mkdir -p /etc/nginx/modsec\nsudo cp /etc/modsecurity/modsecurity.conf-recommended /etc/nginx/modsec/modsecurity.conf", commentaire: "Préparer le fichier de configuration ModSecurity" },
          { os: "linux", cmd: "# Dans /etc/nginx/modsec/modsecurity.conf, garder pour l'instant :\n# SecRuleEngine DetectionOnly\ngrep SecRuleEngine /etc/nginx/modsec/modsecurity.conf", commentaire: "Démarrer en mode détection seule (pas de blocage)" }
        ],
        erreurs_courantes: [
          {
            symptome: "unknown directive modsecurity",
            cause: "Module non chargé",
            solution: "Vérifier que load_module modules/ngx_http_modsecurity_module.so; est présent en tête de nginx.conf."
          }
        ]
      },
      {
        titre: "Étape 3 — Déployer l'OWASP Core Rule Set",
        contexte: "Le CRS est un ensemble de règles génériques couvrant l'OWASP Top 10 (injections, XSS, etc.). On le télécharge, on active le fichier de règles dans ModSecurity puis on l'attache au server block Nginx.",
        commandes: [
          { os: "linux", cmd: "cd /etc/nginx/modsec\nsudo git clone https://github.com/coreruleset/coreruleset.git\nsudo cp coreruleset/crs-setup.conf.example coreruleset/crs-setup.conf", commentaire: "Récupérer l'OWASP CRS" },
          { os: "linux", cmd: "# /etc/nginx/modsec/main.conf :\nInclude /etc/nginx/modsec/modsecurity.conf\nInclude /etc/nginx/modsec/coreruleset/crs-setup.conf\nInclude /etc/nginx/modsec/coreruleset/rules/*.conf", commentaire: "Fichier d'inclusion global des règles" },
          { os: "linux", cmd: "# Dans le server block Nginx :\n# modsecurity on;\n# modsecurity_rules_file /etc/nginx/modsec/main.conf;\nsudo nginx -t && sudo systemctl reload nginx", commentaire: "Activer ModSecurity + CRS sur le proxy" }
        ],
        erreurs_courantes: [
          {
            symptome: "nginx -t échoue après ajout des règles",
            cause: "Chemin d'include incorrect ou crs-setup.conf manquant",
            solution: "Vérifier chaque chemin Include. Le crs-setup.conf doit être copié depuis l'exemple."
          }
        ]
      },
      {
        titre: "Étape 4 — Blocage actif, tests d'attaque et faux positifs",
        contexte: "On passe en mode blocage, puis on lance des requêtes malveillantes (SQLi, XSS) qui doivent être bloquées en 403. On observe le journal d'audit et on neutralise un faux positif par exclusion de règle.",
        commandes: [
          { os: "linux", cmd: "# Passer SecRuleEngine On dans modsecurity.conf\nsudo sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/nginx/modsec/modsecurity.conf\nsudo systemctl reload nginx", commentaire: "Activer le blocage" },
          { os: "linux", cmd: "curl \"http://app.lab.local/?id=1' OR '1'='1\"\ncurl \"http://app.lab.local/?q=<script>alert(1)</script>\"", commentaire: "Attaques SQLi et XSS — doivent renvoyer 403" },
          { os: "linux", cmd: "sudo tail -f /var/log/modsec_audit.log", commentaire: "Voir les règles déclenchées (ID, message)" },
          { os: "linux", cmd: "# Neutraliser un faux positif par ID de règle, dans le server block :\n# modsecurity_rules 'SecRuleRemoveById 942100';\nsudo systemctl reload nginx", commentaire: "Exclure une règle qui bloque du trafic légitime" }
        ],
        erreurs_courantes: [
          {
            symptome: "Trop de faux positifs bloquent l'app légitime",
            cause: "CRS en paranoia level élevé sans tuning",
            solution: "Rester en DetectionOnly le temps du tuning, puis exclure les règles fautives par ID (SecRuleRemoveById) avant de passer On."
          }
        ]
      }
    ],
    checklist: [
      "Nginx relaie correctement vers le backend (reverse proxy OK)",
      "ModSecurity chargé (aucune erreur nginx -t)",
      "OWASP CRS inclus et actif",
      "Requête SQLi bloquée en 403",
      "Requête XSS bloquée en 403",
      "Faux positif neutralisé par SecRuleRemoveById, trafic légitime rétabli"
    ],
    tags: ["nginx", "reverse-proxy", "modsecurity", "waf", "owasp", "crs", "securite", "sqli", "xss", "avance"],
    date_ajout: "2026-07-03",
    source: "École"
  }
];
