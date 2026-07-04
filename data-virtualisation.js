// TP & Labs IT — Catégorie : virtualisation
// 12 TP(s)

const LABS_VIRTUALISATION = [
  {
    id: 3,
    titre: "Création et snapshot d'une VM sous Proxmox VE",
    categorie: "virtualisation",
    niveau: "débutant",
    duree: 45,
    description: "Prendre en main Proxmox VE : créer une machine virtuelle Debian depuis une ISO, configurer les ressources, démarrer la VM, effectuer l'installation de base, puis réaliser un snapshot pour capturer l'état initial de la machine.",
    objectifs: [
      "Naviguer dans l'interface web Proxmox VE et comprendre l'arborescence",
      "Créer une VM avec ressources adaptées (RAM, CPU, disque, réseau)",
      "Installer Debian 12 sur la VM depuis une ISO uploadée",
      "Créer un snapshot de la VM installée et le restaurer"
    ],
    prerequis: [
      { type: "logiciel", nom: "Proxmox VE 8.x installé", lien: "https://proxmox.com/en/downloads" },
      { type: "reseau",   nom: "Accès à l'interface web https://IP-PROXMOX:8006" },
      { type: "logiciel", nom: "ISO Debian 12 netinst", lien: "https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Uploader l'ISO dans Proxmox",
        contexte: "Avant de créer la VM, il faut rendre l'ISO disponible dans le stockage Proxmox. On peut l'uploader depuis l'interface web ou directement via wget en ligne de commande sur le nœud Proxmox.",
        commandes: [
          { os: "linux", cmd: "# Via CLI sur le nœud Proxmox (SSH) :\nwget -P /var/lib/vz/template/iso/ \\\n  https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.5.0-amd64-netinst.iso", commentaire: "Téléchargement direct de l'ISO sur le nœud — plus rapide que l'upload" },
          { os: "linux", cmd: "ls -lh /var/lib/vz/template/iso/", commentaire: "Vérifier que l'ISO est bien présente" }
        ],
        erreurs_courantes: [
          {
            symptome: "L'ISO n'apparaît pas dans la liste lors de la création de VM",
            cause: "Le stockage 'local' n'a pas le type 'ISO image' activé",
            solution: "Dans Proxmox → Datacenter → Storage → local → Edit → vérifier que 'ISO image' est coché dans Content."
          }
        ]
      },
      {
        titre: "Étape 2 — Créer la VM via l'interface web",
        contexte: "On crée la VM depuis l'interface web Proxmox en suivant l'assistant. L'ID de la VM (VMID) est attribué automatiquement ou peut être choisi. On configure les ressources minimales pour une installation Debian légère.",
        commandes: [
          { os: "both", cmd: "# Paramètres recommandés pour la VM Debian :\n# Général : Nom = 'debian-tp', VMID = 100\n# OS : ISO = debian-12.5.0..., Guest OS = Linux 6.x\n# Système : BIOS = SeaBIOS, Machine = q35\n# Disques : Bus = VirtIO, Taille = 20G, Storage = local-lvm\n# CPU : Sockets = 1, Cores = 2, Type = host\n# Mémoire : 2048 MB\n# Réseau : Bridge = vmbr0, Modèle = VirtIO", commentaire: "Suivre l'assistant Create VM avec ces paramètres" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Installer Debian sur la VM",
        contexte: "On démarre la VM et on suit l'installateur Debian standard. Pour un TP, on choisit l'installation minimale sans environnement graphique. Décocher toutes les tâches tasksel sauf 'SSH server' et 'standard system utilities'.",
        commandes: [
          { os: "linux", cmd: "# Après l'installation, depuis le nœud Proxmox :\nqm status 100", commentaire: "Vérifier l'état de la VM (100 = VMID)" },
          { os: "linux", cmd: "qm config 100", commentaire: "Afficher la configuration complète de la VM" },
          { os: "linux", cmd: "# Depuis la VM Debian après boot :\nip a show\nhostname -I", commentaire: "Vérifier que la VM a bien une IP via DHCP" }
        ],
        erreurs_courantes: [
          {
            symptome: "La VM n'obtient pas d'adresse IP après installation",
            cause: "Le bridge vmbr0 n'est pas connecté à l'interface physique du nœud Proxmox",
            solution: "Sur le nœud Proxmox → Réseau → vmbr0 → vérifier que le Bridge port pointe vers l'interface physique (ex: eno1, eth0). Redémarrer le réseau : ifreload -a"
          },
          {
            symptome: "Écran noir après démarrage de la VM",
            cause: "Le pilote graphique n'est pas chargé, problème de machine type",
            solution: "Dans la config VM → Hardware → Display → changer en 'VirtIO-GPU' ou 'std'. Redémarrer la VM."
          }
        ]
      },
      {
        titre: "Étape 4 — Créer un snapshot de la VM",
        contexte: "Un snapshot capture l'état du disque (et optionnellement de la RAM) de la VM à un instant T. C'est essentiel pour pouvoir revenir à un état connu avant des opérations risquées. Sur Proxmox, les snapshots de VMs avec disques qcow2 ou raw sur LVM-thin sont instantanés.",
        commandes: [
          { os: "linux", cmd: "# Via CLI Proxmox :\nqm snapshot 100 \"post-install\" --description \"Debian 12 installée, SSH actif\" --vmstate 0", commentaire: "Crée un snapshot sans état RAM (plus rapide, VM peut être allumée)" },
          { os: "linux", cmd: "qm listsnapshot 100", commentaire: "Lister les snapshots de la VM 100" },
          { os: "linux", cmd: "# Pour restaurer le snapshot :\nqm rollback 100 post-install", commentaire: "Restaurer la VM à l'état du snapshot (la VM doit être arrêtée)" },
          { os: "linux", cmd: "# Supprimer un snapshot :\nqm delsnapshot 100 post-install", commentaire: "Supprimer le snapshot (libère l'espace disque)" }
        ],
        erreurs_courantes: [
          {
            symptome: "Erreur 'storage does not support snapshots'",
            cause: "Le stockage utilisé (ex: local, dir) ne supporte pas les snapshots — seul LVM-thin ou ZFS les supportent nativement",
            solution: "Migrer le disque de la VM vers un stockage LVM-thin (local-lvm dans Proxmox). Datacenter → Storage → Ajouter LVM-thin si pas déjà configuré."
          }
        ]
      }
    ],
    checklist: [
      "La VM Debian 12 est créée et apparaît dans l'arborescence Proxmox",
      "La VM démarre et répond au ping depuis le réseau local",
      "La connexion SSH à la VM fonctionne",
      "Un snapshot 'post-install' est visible via 'qm listsnapshot 100'"
    ],
    tags: ["proxmox", "vm", "virtualisation", "debian", "snapshot", "qm", "kvm"],
    date_ajout: "2026-01-25",
    source: "Personnel"
  },

  {
    id: 35,
    titre: "Proxmox — templates, clonage lié et réseau virtuel interne",
    categorie: "virtualisation",
    niveau: "intermédiaire",
    duree: 90,
    description: "Convertir une VM Proxmox en template, créer des clones liés et complets, configurer un Linux Bridge isolé (réseau interne) et utiliser cloud-init pour pré-configurer les VMs clonées.",
    objectifs: [
      "Créer un template depuis une VM existante",
      "Créer un clone lié et un clone complet",
      "Configurer un Linux Bridge sans interface physique",
      "Utiliser cloud-init pour définir IP et mot de passe",
      "Valider la communication inter-VMs sur le bridge interne"
    ],
    prerequis: [
      { type: "logiciel", nom: "Proxmox VE 8.x accessible sur https://192.168.1.200:8006" },
      { type: "vm", nom: "VM Debian 12 existante dans Proxmox" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Préparer et convertir en template",
        contexte: "On nettoie la VM (cloud-init clean, machine-id) puis on ajoute un drive cloud-init et on convertit.",
        commandes: [
          { os: "linux", cmd: "sudo cloud-init clean && sudo truncate -s 0 /etc/machine-id && sudo poweroff", commentaire: "Nettoyer la VM avant conversion" },
          { os: "linux", cmd: "# Interface Proxmox :\n# VM > Hardware > Add > CloudInit Drive > local-lvm\n# VM > Cloud-Init > User, Password, IP\n# VM (clic droit) > Convert to Template", commentaire: "Ajouter cloud-init et convertir en template" },
          { os: "linux", cmd: "# Ou via CLI sur le noeud Proxmox :\nqm set 100 --ide2 local-lvm:cloudinit\nqm set 100 --ciuser admin --cipassword 'P@ssw0rd'\nqm template 100", commentaire: "Alternative CLI (VM ID = 100)" }
        ],
        erreurs_courantes: [
          { symptome: "Bouton Convert to Template grisé", cause: "VM encore allumée", solution: "Éteindre complètement (Shutdown) avant de convertir" }
        ]
      },
      {
        titre: "Étape 2 — Créer le bridge interne et cloner",
        contexte: "On crée un bridge Proxmox sans port physique (réseau isolé), puis on crée les deux clones.",
        commandes: [
          { os: "linux", cmd: "# Proxmox > Noeud > Network > Create > Linux Bridge\n# Nom : vmbr1, Bridge ports : VIDE, CIDR : 10.10.0.1/24\n# Apply Configuration", commentaire: "Créer le bridge interne isolé vmbr1" },
          { os: "linux", cmd: "qm clone 100 101 --name clone-lie --full 0\nqm clone 100 102 --name clone-complet --full 1", commentaire: "Clone lié (--full 0) et complet (--full 1)" },
          { os: "linux", cmd: "qm set 101 --net0 virtio,bridge=vmbr1\nqm set 102 --net0 virtio,bridge=vmbr1\nqm start 101 && qm start 102", commentaire: "Connecter au bridge et démarrer" }
        ],
        erreurs_courantes: [
          { symptome: "linked clone : base snapshot not found", cause: "Template non créé correctement", solution: "Refaire la conversion depuis une VM proprement éteinte" }
        ]
      },
      {
        titre: "Étape 3 — Valider cloud-init et connectivité",
        contexte: "On vérifie que cloud-init a appliqué la config et que les deux VMs communiquent via vmbr1.",
        commandes: [
          { os: "linux", cmd: "# Console Proxmox du clone 101 :\nip a | grep inet\ncat /etc/hostname", commentaire: "Vérifier IP et hostname cloud-init" },
          { os: "linux", cmd: "ping -c3 10.10.0.102", commentaire: "Pinger le clone-complet depuis clone-lie" }
        ],
        erreurs_courantes: [
          { symptome: "cloud-init n'a pas configuré l'IP", cause: "cloud-init absent dans la VM source", solution: "Installer cloud-init (sudo apt install cloud-init) avant de créer le template" }
        ]
      }
    ],
    checklist: [
      "VM source nettoyée avant conversion",
      "Template visible avec icône template dans Proxmox",
      "Bridge vmbr1 sans port physique dans /etc/network/interfaces",
      "Clone lié (101) et complet (102) démarrés",
      "cloud-init a appliqué IP et mot de passe",
      "Ping entre les deux clones via vmbr1 fonctionnel"
    ],
    tags: ["proxmox", "virtualisation", "template", "clone", "cloud-init", "bridge"],
    date_ajout: "2026-06-26",
    source: "École"
  }
,

  {
    id: 122,
    titre: "VirtualBox — modes réseau NAT, Bridge et Host-Only",
    categorie: "virtualisation",
    niveau: "débutant",
    duree: 60,
    description: "Comprendre et expérimenter les trois principaux modes réseau de VirtualBox : NAT (accès Internet via l'hôte), Bridge (VM sur le réseau physique) et Host-Only (réseau isolé entre VMs et hôte). Indispensable pour configurer correctement ses environnements de lab.",
    objectifs: [
      "Comprendre les différences entre NAT, Bridge et Host-Only",
      "Configurer chaque mode réseau sur une VM VirtualBox",
      "Tester la connectivité dans chaque mode",
      "Combiner plusieurs interfaces réseau sur une même VM",
      "Créer un réseau Host-Only personnalisé"
    ],
    prerequis: [
      { type: "logiciel", nom: "Oracle VirtualBox 7.x installé", lien: "https://www.virtualbox.org/wiki/Downloads" },
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 existante dans VirtualBox" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Mode NAT (accès Internet)",
        contexte: "En mode NAT, VirtualBox crée un routeur virtuel entre la VM et l'hôte. La VM accède à Internet via l'hôte mais n'est pas joignable depuis le réseau — sauf port forwarding. C'est le mode par défaut.",
        commandes: [
          { os: "both", cmd: "# VirtualBox > VM > Configuration > Réseau\n# Adaptateur 1 > Attaché à : NAT\n# Démarrer la VM", commentaire: "Configurer l'adaptateur en mode NAT" },
          { os: "linux", cmd: "ip a\nip route\nping -c3 8.8.8.8\ncurl ifconfig.me", commentaire: "Vérifier l'IP (10.0.2.x), la passerelle (10.0.2.2) et l'accès Internet" },
          { os: "both", cmd: "# Port Forwarding NAT :\n# Configuration > Réseau > NAT > Redirection de ports\n# Nom: SSH, Protocole: TCP, IP hôte: 127.0.0.1, Port hôte: 2222, Port invité: 22", commentaire: "Rendre le SSH de la VM accessible depuis l'hôte via localhost:2222" },
          { os: "both", cmd: "# Depuis l'hôte :\nssh -p 2222 user@127.0.0.1", commentaire: "Connexion SSH via le port forwarding NAT" }
        ],
        erreurs_courantes: [
          { symptome: "Pas d'accès Internet en mode NAT", cause: "L'hôte lui-même n'a pas accès à Internet", solution: "Vérifier la connexion Internet de la machine hôte. Le NAT VirtualBox dépend entièrement de la connectivité de l'hôte." }
        ]
      },
      {
        titre: "Étape 2 — Mode Bridge (VM sur le réseau physique)",
        contexte: "En mode Bridge, la VM se connecte directement au réseau physique via l'interface de l'hôte. Elle obtient une IP du DHCP du réseau local et est joignable comme n'importe quelle machine physique.",
        commandes: [
          { os: "both", cmd: "# Configuration > Réseau > Adaptateur 1\n# Attaché à : Réseau bridgé\n# Nom : sélectionner l'interface physique de l'hôte (ex: Intel Wi-Fi, Ethernet)", commentaire: "Configurer le mode Bridge sur l'interface physique de l'hôte" },
          { os: "linux", cmd: "ip a\nping -c3 192.168.1.1", commentaire: "La VM obtient une IP du réseau local (ex: 192.168.1.x) — joignable depuis tous les hôtes du réseau" },
          { os: "both", cmd: "# Depuis n'importe quelle machine du réseau :\nping <IP-de-la-VM>\nssh user@<IP-de-la-VM>", commentaire: "La VM est joignable directement depuis le réseau physique" }
        ],
        erreurs_courantes: [
          { symptome: "La VM ne reçoit pas d'IP en mode Bridge sur Wi-Fi", cause: "Certains routeurs/points d'accès Wi-Fi bloquent les adresses MAC inconnues", solution: "Essayer avec la connexion Ethernet de l'hôte plutôt que le Wi-Fi. Ou utiliser le mode NAT Network à la place." }
        ]
      },
      {
        titre: "Étape 3 — Mode Host-Only (réseau isolé)",
        contexte: "Host-Only crée un réseau virtuel privé entre la machine hôte et les VMs. Les VMs ne voient pas Internet mais peuvent communiquer entre elles et avec l'hôte. Parfait pour les labs multi-VMs.",
        commandes: [
          { os: "both", cmd: "# Créer un réseau Host-Only :\n# VirtualBox > Fichier > Gestionnaire de réseau hôte (Ctrl+H)\n# Créer > Configurer l'adresse : 192.168.56.1/24\n# Activer le serveur DHCP : 192.168.56.100 - 192.168.56.200", commentaire: "Créer un réseau Host-Only avec DHCP intégré" },
          { os: "both", cmd: "# Configuration VM > Réseau > Adaptateur 2\n# Attaché à : Réseau hôte uniquement\n# Nom : vboxnet0 (ou le réseau créé)", commentaire: "Ajouter un second adaptateur en Host-Only sur la VM" },
          { os: "linux", cmd: "ip a\nping -c3 192.168.56.1", commentaire: "La VM obtient une IP en 192.168.56.x — pinger l'hôte (192.168.56.1)" },
          { os: "both", cmd: "# Depuis l'hôte :\nping 192.168.56.x\n# L'hôte et la VM se voient mais la VM n'a pas Internet", commentaire: "Tester la communication hôte <-> VM" }
        ],
        erreurs_courantes: [
          { symptome: "vboxnet0 absent dans la liste des adaptateurs", cause: "Aucun réseau Host-Only créé dans VirtualBox", solution: "Aller dans Fichier > Gestionnaire de réseau hôte et créer un nouveau réseau" }
        ]
      },
      {
        titre: "Étape 4 — Combiner NAT + Host-Only (configuration lab)",
        contexte: "La configuration idéale pour un lab : Adaptateur 1 en NAT (accès Internet) + Adaptateur 2 en Host-Only (communication inter-VMs et avec l'hôte). C'est la config recommandée pour tous les TPs.",
        commandes: [
          { os: "both", cmd: "# Configuration VM :\n# Adaptateur 1 : NAT (Internet via l'hôte)\n# Adaptateur 2 : Host-Only vboxnet0 (IP fixe ou DHCP)", commentaire: "Deux adaptateurs : NAT pour Internet, Host-Only pour le lab" },
          { os: "linux", cmd: "ip a\n# eth0/enp0s3 : 10.0.2.15 (NAT)\n# eth1/enp0s8 : 192.168.56.x (Host-Only)", commentaire: "Deux interfaces visibles dans la VM" },
          { os: "linux", cmd: "ping -c3 8.8.8.8\nping -c3 192.168.56.1", commentaire: "Tester Internet (via NAT) et l'hôte (via Host-Only)" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Mode NAT : VM obtient 10.0.2.x et accède à Internet",
      "Port forwarding NAT SSH : ssh -p 2222 localhost fonctionne depuis l'hôte",
      "Mode Bridge : VM obtient une IP du réseau physique (192.168.1.x)",
      "Mode Bridge : VM joignable par ping depuis une autre machine du réseau",
      "Réseau Host-Only créé dans le Gestionnaire VirtualBox",
      "Mode Host-Only : VM obtient 192.168.56.x et ping l'hôte",
      "Config combinée NAT+Host-Only : Internet ET communication inter-VMs OK"
    ],
    tags: ["virtualbox", "nat", "bridge", "host-only", "reseau", "virtualisation", "lab"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 123,
    titre: "VirtualBox — snapshots, clonage et export OVA",
    categorie: "virtualisation",
    niveau: "débutant",
    duree: 45,
    description: "Maîtriser la gestion des VMs VirtualBox : créer et restaurer des snapshots, cloner une VM complètement ou en lié, et exporter/importer une VM au format OVA pour la portabilité.",
    objectifs: [
      "Créer des snapshots à différents états de la VM",
      "Naviguer dans l'arbre des snapshots et restaurer",
      "Cloner une VM (clone complet vs clone lié)",
      "Exporter une VM au format OVA",
      "Importer une OVA sur une autre machine VirtualBox"
    ],
    prerequis: [
      { type: "logiciel", nom: "Oracle VirtualBox 7.x installé" },
      { type: "vm", nom: "VM Linux existante et fonctionnelle" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer et gérer les snapshots",
        contexte: "Un snapshot capture l'état complet de la VM (disque + RAM optionnelle) à un instant T. On peut créer plusieurs snapshots et former un arbre de versions.",
        commandes: [
          { os: "both", cmd: "# Interface VirtualBox : VM sélectionnée > Snapshots (icône en haut à droite)\n# Bouton 'Prendre un snapshot'\n# Nom : 'post-install', Description : 'Debian fraîchement installée'", commentaire: "Créer un snapshot via l'interface graphique" },
          { os: "both", cmd: "# Via CLI VBoxManage :\nVBoxManage snapshot \"nom-vm\" take \"post-install\" --description \"Etat initial\" --live", commentaire: "--live permet de snapshoter sans éteindre la VM" },
          { os: "both", cmd: "VBoxManage snapshot \"nom-vm\" list", commentaire: "Lister tous les snapshots de la VM" },
          { os: "both", cmd: "# Restaurer un snapshot (VM doit être éteinte) :\nVBoxManage snapshot \"nom-vm\" restore \"post-install\"", commentaire: "Restaurer la VM à l'état du snapshot" },
          { os: "both", cmd: "VBoxManage snapshot \"nom-vm\" delete \"nom-snapshot\"", commentaire: "Supprimer un snapshot (libère l'espace disque)" }
        ],
        erreurs_courantes: [
          { symptome: "Impossible de prendre un snapshot : VM en état sauvegardé", cause: "La VM est en pause/hibernation", solution: "Démarrer ou éteindre complètement la VM avant de prendre le snapshot" }
        ]
      },
      {
        titre: "Étape 2 — Cloner une VM",
        contexte: "Le clone complet crée une VM totalement indépendante. Le clone lié partage le disque de base avec la VM source (moins d'espace mais dépendant). On clone toujours depuis un snapshot.",
        commandes: [
          { os: "both", cmd: "# Interface : clic droit sur la VM > Cloner\n# Nom : debian-clone\n# Type de clone : Clone complet (indépendant) ou Clone lié (dépendant)\n# Options : Réinitialiser l'adresse MAC (recommandé)", commentaire: "Cloner via l'interface graphique" },
          { os: "both", cmd: "# Via CLI :\nVBoxManage clonevm \"nom-vm\" --name \"debian-clone\" --mode machine --options keephwuuids --register", commentaire: "Clone complet en ligne de commande" },
          { os: "both", cmd: "VBoxManage list vms", commentaire: "Vérifier que le clone apparaît dans la liste des VMs" }
        ],
        erreurs_courantes: [
          { symptome: "Le clone démarre avec la même IP que la VM source", cause: "L'adresse MAC n'a pas été réinitialisée au clonage", solution: "Cloner à nouveau en cochant 'Réinitialiser l'adresse MAC' ou changer manuellement la MAC dans les paramètres réseau" }
        ]
      },
      {
        titre: "Étape 3 — Exporter et importer au format OVA",
        contexte: "Le format OVA (Open Virtualization Archive) est standard et compatible avec VirtualBox, VMware et d'autres hyperviseurs. Utile pour partager ou archiver une VM.",
        commandes: [
          { os: "both", cmd: "# Exporter via l'interface :\n# Fichier > Exporter un appareil virtuel\n# Sélectionner la VM > Format : OVF 2.0 > Fichier : debian-lab.ova", commentaire: "Exporter la VM en OVA via le menu" },
          { os: "both", cmd: "# Via CLI :\nVBoxManage export \"nom-vm\" --output /chemin/debian-lab.ova --ovf20", commentaire: "Export CLI en format OVF 2.0" },
          { os: "both", cmd: "# Importer une OVA :\n# Fichier > Importer un appareil virtuel > sélectionner debian-lab.ova\n# Vérifier les ressources proposées > Importer", commentaire: "Importer l'OVA sur une autre machine" },
          { os: "both", cmd: "VBoxManage import /chemin/debian-lab.ova --dry-run", commentaire: "--dry-run simule l'import sans l'effectuer (vérification préalable)" }
        ],
        erreurs_courantes: [
          { symptome: "Import OVA : Failed to open OVF file", cause: "Fichier OVA corrompu ou format incompatible", solution: "Vérifier l'intégrité du fichier. Si généré par VMware, essayer avec --vsys 0 --unit 5 pour ajuster les paramètres." }
        ]
      }
    ],
    checklist: [
      "Snapshot post-install créé et visible dans l'arbre des snapshots",
      "VBoxManage snapshot list affiche le snapshot",
      "Restauration du snapshot fonctionne — VM revient à l'état initial",
      "Clone complet créé avec adresse MAC différente",
      "Clone démarre indépendamment sans conflit d'IP",
      "OVA exportée et présente sur le disque",
      "OVA réimportée et VM démarrable"
    ],
    tags: ["virtualbox", "snapshot", "clone", "ova", "export", "import", "virtualisation"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 124,
    titre: "VirtualBox — réseau interne multi-VMs et routage",
    categorie: "virtualisation",
    niveau: "intermédiaire",
    duree: 75,
    description: "Créer un lab réseau complet dans VirtualBox avec plusieurs VMs interconnectées via le mode Réseau Interne. Simuler une topologie avec un routeur Linux (VM gateway), un serveur et un client, et configurer le routage IP entre les segments.",
    objectifs: [
      "Comprendre le mode Réseau Interne de VirtualBox",
      "Créer une topologie multi-VMs avec deux segments réseau",
      "Configurer une VM Linux comme routeur/gateway",
      "Activer le forwarding IP et configurer les routes",
      "Tester la connectivité end-to-end entre segments"
    ],
    prerequis: [
      { type: "logiciel", nom: "VirtualBox 7.x installé" },
      { type: "vm", nom: "Trois VMs Linux (Debian ou Ubuntu) — peuvent être des clones" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Topologie et configuration des adaptateurs",
        contexte: "On crée deux segments réseau internes : intnet-lan1 (10.0.1.0/24) et intnet-lan2 (10.0.2.0/24). La VM routeur a un pied dans chaque réseau. Les VMs client et serveur sont dans des segments différents.",
        commandes: [
          { os: "both", cmd: "# VM-ROUTEUR (2 adaptateurs) :\n# Adaptateur 1 : Réseau interne > intnet-lan1\n# Adaptateur 2 : Réseau interne > intnet-lan2\n# (optionnel : Adaptateur 3 : NAT pour accès Internet)", commentaire: "Configurer le routeur avec un pied dans chaque segment" },
          { os: "both", cmd: "# VM-CLIENT :\n# Adaptateur 1 : Réseau interne > intnet-lan1", commentaire: "Client dans le segment LAN1" },
          { os: "both", cmd: "# VM-SERVEUR :\n# Adaptateur 1 : Réseau interne > intnet-lan2", commentaire: "Serveur dans le segment LAN2" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer les IPs statiques",
        contexte: "Les VMs en réseau interne n'ont pas de DHCP — on configure les IPs manuellement sur chaque VM.",
        commandes: [
          { os: "linux", cmd: "# Sur VM-ROUTEUR :\nsudo ip addr add 10.0.1.1/24 dev enp0s3\nsudo ip addr add 10.0.2.1/24 dev enp0s8\nsudo ip link set enp0s3 up\nsudo ip link set enp0s8 up", commentaire: "IPs statiques sur le routeur (adapter les noms d'interfaces)" },
          { os: "linux", cmd: "# Sur VM-CLIENT :\nsudo ip addr add 10.0.1.10/24 dev enp0s3\nsudo ip link set enp0s3 up\nsudo ip route add default via 10.0.1.1", commentaire: "IP statique + route par défaut vers le routeur" },
          { os: "linux", cmd: "# Sur VM-SERVEUR :\nsudo ip addr add 10.0.2.10/24 dev enp0s3\nsudo ip link set enp0s3 up\nsudo ip route add default via 10.0.2.1", commentaire: "IP statique + route par défaut vers le routeur" }
        ],
        erreurs_courantes: [
          { symptome: "ip addr add : RTNETLINK answers: File exists", cause: "L'IP est déjà configurée sur l'interface", solution: "sudo ip addr flush dev enp0s3 pour supprimer toutes les IPs de l'interface, puis reconfigurer" }
        ]
      },
      {
        titre: "Étape 3 — Activer le forwarding IP sur le routeur",
        contexte: "Par défaut Linux ne route pas les paquets entre interfaces. On active le forwarding IP pour transformer la VM en routeur.",
        commandes: [
          { os: "linux", cmd: "# Sur VM-ROUTEUR :\necho 1 | sudo tee /proc/sys/net/ipv4/ip_forward", commentaire: "Activer le forwarding IP (temporaire)" },
          { os: "linux", cmd: "# Pour rendre permanent :\necho 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf\nsudo sysctl -p", commentaire: "Activer définitivement le forwarding IP" },
          { os: "linux", cmd: "cat /proc/sys/net/ipv4/ip_forward", commentaire: "Vérifier : doit afficher 1" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Tester la connectivité inter-segments",
        contexte: "On teste que le client peut joindre le serveur via le routeur, et on analyse le chemin avec traceroute.",
        commandes: [
          { os: "linux", cmd: "# Depuis VM-CLIENT :\nping -c3 10.0.1.1\nping -c3 10.0.2.1\nping -c3 10.0.2.10", commentaire: "Ping vers le routeur, puis vers l'interface LAN2 du routeur, puis vers le serveur" },
          { os: "linux", cmd: "traceroute 10.0.2.10", commentaire: "Vérifier que le trafic passe bien par 10.0.1.1 (le routeur)" },
          { os: "linux", cmd: "# Depuis VM-SERVEUR :\nping -c3 10.0.1.10", commentaire: "Vérifier la communication dans le sens inverse" }
        ],
        erreurs_courantes: [
          { symptome: "ping 10.0.2.10 ne répond pas depuis le client", cause: "ip_forward non activé sur le routeur ou route manquante sur le serveur", solution: "Vérifier cat /proc/sys/net/ipv4/ip_forward = 1 sur le routeur. Vérifier ip route sur le serveur : default via 10.0.2.1 doit être présent." }
        ]
      },
      {
        titre: "Étape 5 — Persistance des configurations réseau",
        contexte: "Les configurations ip temporaires disparaissent au redémarrage. On les rend permanentes via /etc/network/interfaces (Debian) ou netplan (Ubuntu).",
        commandes: [
          { os: "linux", cmd: "# Debian — /etc/network/interfaces :\nsudo nano /etc/network/interfaces\n# auto enp0s3\n# iface enp0s3 inet static\n#   address 10.0.1.10\n#   netmask 255.255.255.0\n#   gateway 10.0.1.1", commentaire: "Configuration réseau permanente sur Debian" },
          { os: "linux", cmd: "# Ubuntu — netplan /etc/netplan/01-netcfg.yaml :\n# network:\n#   version: 2\n#   ethernets:\n#     enp0s3:\n#       addresses: [10.0.1.10/24]\n#       routes:\n#         - to: default\n#           via: 10.0.1.1\nsudo netplan apply", commentaire: "Configuration réseau permanente sur Ubuntu via netplan" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Trois VMs démarrées avec les bons adaptateurs réseau internes",
      "cat /proc/sys/net/ipv4/ip_forward : 1 sur le routeur",
      "ping 10.0.1.1 depuis le client : OK",
      "ping 10.0.2.10 depuis le client : OK (via routeur)",
      "traceroute 10.0.2.10 passe par 10.0.1.1",
      "ping 10.0.1.10 depuis le serveur : OK",
      "Configuration réseau persistante après reboot"
    ],
    tags: ["virtualbox", "reseau-interne", "routage", "ip-forward", "linux", "topologie", "lab"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 125,
    titre: "Hyper-V — installation, VMs et switches virtuels",
    categorie: "virtualisation",
    niveau: "débutant",
    duree: 60,
    description: "Activer et utiliser Hyper-V sur Windows 10/11 Pro ou Windows Server. Créer des machines virtuelles, configurer les trois types de switches virtuels (Externe, Interne, Privé) et gérer les checkpoints (snapshots).",
    objectifs: [
      "Activer Hyper-V sur Windows 10/11 Pro",
      "Créer une VM Linux depuis l'assistant Hyper-V",
      "Comprendre les trois types de switches virtuels",
      "Créer et restaurer un checkpoint",
      "Gérer les VMs via PowerShell Hyper-V"
    ],
    prerequis: [
      { type: "logiciel", nom: "Windows 10/11 Pro/Enterprise ou Windows Server 2019/2022" },
      { type: "logiciel", nom: "Processeur avec virtualisation Intel VT-x ou AMD-V activée dans le BIOS" },
      { type: "logiciel", nom: "ISO Debian 12 ou Ubuntu 22.04" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Activer Hyper-V",
        contexte: "Hyper-V est un hyperviseur de type 1 intégré à Windows Pro/Enterprise. Il doit être activé depuis les fonctionnalités Windows ou PowerShell.",
        commandes: [
          { os: "windows", cmd: "# Via PowerShell (en tant qu'administrateur) :\nEnable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All", commentaire: "Activer Hyper-V et redémarrer" },
          { os: "windows", cmd: "# Ou via l'interface :\n# Panneau de configuration > Programmes > Activer ou désactiver des fonctionnalités Windows\n# Cocher Hyper-V (tout le groupe) > OK > Redémarrer", commentaire: "Activation via les fonctionnalités Windows" },
          { os: "windows", cmd: "Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V", commentaire: "Vérifier que Hyper-V est bien activé (State : Enabled)" }
        ],
        erreurs_courantes: [
          { symptome: "Hyper-V absent des fonctionnalités Windows", cause: "Windows Home ne supporte pas Hyper-V — uniquement Pro/Enterprise/Education", solution: "Utiliser VirtualBox ou VMware Workstation Player sur Windows Home. Ou upgrader vers Windows Pro." }
        ]
      },
      {
        titre: "Étape 2 — Créer les switches virtuels",
        contexte: "Avant de créer une VM, on configure les switches virtuels qui déterminent la connectivité réseau. Trois types : Externe (réseau physique), Interne (hôte + VMs), Privé (VMs seulement).",
        commandes: [
          { os: "windows", cmd: "# Gestionnaire Hyper-V > Gestionnaire de commutateurs virtuels\n# Nouveau commutateur virtuel > Externe\n# Nom : vSwitch-Externe, Interface : adaptateur physique Ethernet/Wi-Fi", commentaire: "Switch externe : VMs sur le réseau physique (équivalent Bridge VirtualBox)" },
          { os: "windows", cmd: "New-VMSwitch -Name 'vSwitch-Interne' -SwitchType Internal", commentaire: "Switch interne via PowerShell : VMs + hôte se voient (équivalent Host-Only)" },
          { os: "windows", cmd: "New-VMSwitch -Name 'vSwitch-Prive' -SwitchType Private", commentaire: "Switch privé : uniquement entre VMs (équivalent Réseau Interne VirtualBox)" },
          { os: "windows", cmd: "Get-VMSwitch", commentaire: "Lister tous les switches virtuels Hyper-V" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Créer et configurer une VM",
        contexte: "On crée une VM Linux Generation 2 (UEFI) via l'assistant ou PowerShell, en attachant l'ISO et le switch réseau.",
        commandes: [
          { os: "windows", cmd: "# Assistant Hyper-V :\n# Action > Nouveau > Ordinateur virtuel\n# Nom : debian-lab, Génération : 2 (UEFI)\n# RAM : 2048 Mo, Switch : vSwitch-Interne\n# Disque : 20 Go, ISO : chemin vers debian.iso", commentaire: "Créer la VM via l'assistant graphique" },
          { os: "windows", cmd: "New-VM -Name 'debian-lab' -Generation 2 -MemoryStartupBytes 2GB -NewVHDPath 'C:\\VMs\\debian-lab.vhdx' -NewVHDSizeBytes 20GB -SwitchName 'vSwitch-Interne'", commentaire: "Créer la VM via PowerShell" },
          { os: "windows", cmd: "Add-VMDvdDrive -VMName 'debian-lab' -Path 'C:\\ISOs\\debian-12.iso'\nSet-VMFirmware -VMName 'debian-lab' -FirstBootDevice (Get-VMDvdDrive -VMName 'debian-lab')", commentaire: "Attacher l'ISO et booter dessus en priorité" },
          { os: "windows", cmd: "# Pour Linux Generation 2 : désactiver Secure Boot\nSet-VMFirmware -VMName 'debian-lab' -EnableSecureBoot Off", commentaire: "Désactiver Secure Boot (requis pour Linux sur Gen 2)" },
          { os: "windows", cmd: "Start-VM -Name 'debian-lab'\nVMConnect.exe localhost 'debian-lab'", commentaire: "Démarrer la VM et ouvrir la console" }
        ],
        erreurs_courantes: [
          { symptome: "VM Linux Generation 2 ne démarre pas sur l'ISO", cause: "Secure Boot activé — Linux non signé Microsoft est bloqué", solution: "Set-VMFirmware -VMName 'nom-vm' -EnableSecureBoot Off" }
        ]
      },
      {
        titre: "Étape 4 — Checkpoints et gestion PowerShell",
        contexte: "Les checkpoints Hyper-V sont l'équivalent des snapshots. On peut en créer, les restaurer et les supprimer. PowerShell offre une gestion complète des VMs.",
        commandes: [
          { os: "windows", cmd: "Checkpoint-VM -Name 'debian-lab' -SnapshotName 'post-install'", commentaire: "Créer un checkpoint" },
          { os: "windows", cmd: "Get-VMCheckpoint -VMName 'debian-lab'", commentaire: "Lister les checkpoints" },
          { os: "windows", cmd: "Restore-VMCheckpoint -VMName 'debian-lab' -Name 'post-install' -Confirm:$false", commentaire: "Restaurer un checkpoint" },
          { os: "windows", cmd: "Get-VM | Select-Object Name, State, CPUUsage, MemoryAssigned", commentaire: "Lister toutes les VMs avec leur état et ressources" },
          { os: "windows", cmd: "Stop-VM -Name 'debian-lab' -Force\nRemove-VM -Name 'debian-lab' -Force", commentaire: "Éteindre et supprimer une VM" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Get-WindowsOptionalFeature Hyper-V : State Enabled",
      "Trois switches créés : Externe, Interne, Privé",
      "VM debian-lab créée en Generation 2 avec Secure Boot désactivé",
      "VM démarre sur l'ISO et installe Linux",
      "Checkpoint post-install créé et restauration fonctionnelle",
      "Get-VM liste la VM avec son état"
    ],
    tags: ["hyper-v", "windows", "virtualisation", "switch-virtuel", "checkpoint", "powershell"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 126,
    titre: "VMware Workstation — VMs, snapshots et réseau virtuel",
    categorie: "virtualisation",
    niveau: "débutant",
    duree: 60,
    description: "Prendre en main VMware Workstation Pro/Player : créer une VM Linux, comprendre les modes réseau (Bridged, NAT, Host-Only), créer des snapshots et utiliser les VMware Tools pour l'intégration hôte/invité.",
    objectifs: [
      "Créer une VM Linux dans VMware Workstation",
      "Comprendre les modes réseau Bridged, NAT et Host-Only",
      "Installer les VMware Tools dans la VM",
      "Créer et restaurer des snapshots",
      "Partager un dossier entre l'hôte et la VM"
    ],
    prerequis: [
      { type: "logiciel", nom: "VMware Workstation Pro 17 ou Player (gratuit pour usage personnel)", lien: "https://www.vmware.com/products/workstation-pro.html" },
      { type: "logiciel", nom: "ISO Debian 12 ou Ubuntu 22.04" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer une VM et comprendre les modes réseau",
        contexte: "VMware Workstation propose les mêmes concepts que VirtualBox avec une terminologie légèrement différente. Bridged = réseau physique, NAT = accès Internet via l'hôte, Host-Only = réseau privé hôte+VMs.",
        commandes: [
          { os: "both", cmd: "# Nouveau > VM personnalisée\n# Compatible : Workstation 17\n# ISO : chemin vers debian.iso (Easy Install détecte automatiquement)\n# Nom : debian-lab, Emplacement : C:\\VMs\\debian-lab\n# CPU : 2, RAM : 2048 Mo, Disque : 20 Go\n# Réseau : NAT (par défaut)", commentaire: "Créer la VM via l'assistant Workstation" },
          { os: "both", cmd: "# Changer le mode réseau :\n# VM > Paramètres > Network Adapter\n# Bridged : Automatic (ou sélectionner l'interface physique)\n# NAT : partage l'IP de l'hôte\n# Host-Only : réseau privé VMnet1", commentaire: "Modifier le mode réseau dans les paramètres VM" },
          { os: "linux", cmd: "# Dans la VM :\nip a\n# NAT : 192.168.x.x (réseau VMnet8)\n# Bridged : IP du réseau physique\n# Host-Only : 192.168.y.x (réseau VMnet1)", commentaire: "Vérifier l'IP selon le mode réseau" }
        ],
        erreurs_courantes: [
          { symptome: "Mode Bridged : VM n'obtient pas d'IP", cause: "VMware Bridge Protocol non activé sur l'interface physique de l'hôte", solution: "Panneau de configuration Windows > Connexions réseau > Propriétés de l'interface > cocher VMware Bridge Protocol" }
        ]
      },
      {
        titre: "Étape 2 — Installer les VMware Tools",
        contexte: "Les VMware Tools améliorent l'intégration : résolution d'écran dynamique, copier-coller hôte/VM, glisser-déposer, dossiers partagés et synchronisation de l'heure.",
        commandes: [
          { os: "both", cmd: "# Dans VMware : VM > Install VMware Tools\n# Un CD virtuel est monté dans la VM", commentaire: "Monter l'ISO des VMware Tools" },
          { os: "linux", cmd: "sudo mount /dev/cdrom /mnt\ncp /mnt/VMwareTools-*.tar.gz /tmp/\ncd /tmp && tar -xzf VMwareTools-*.tar.gz\nsudo ./vmware-tools-distrib/vmware-install.pl", commentaire: "Installer les VMware Tools depuis le CD monté" },
          { os: "linux", cmd: "# Alternative pour Debian/Ubuntu :\nsudo apt install open-vm-tools open-vm-tools-desktop -y", commentaire: "Installer open-vm-tools (recommandé — version open source maintenue)" },
          { os: "linux", cmd: "vmware-toolsd --version", commentaire: "Vérifier l'installation des VMware Tools" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Snapshots et dossiers partagés",
        contexte: "Les snapshots VMware fonctionnent comme VirtualBox. Les dossiers partagés permettent d'accéder aux fichiers de l'hôte depuis la VM.",
        commandes: [
          { os: "both", cmd: "# Snapshots :\n# VM > Snapshot > Take Snapshot\n# Nom : post-install > OK", commentaire: "Créer un snapshot via le menu" },
          { os: "both", cmd: "# Snapshot Manager (Ctrl+M) :\n# Arbre des snapshots visible\n# Clic droit > Revert to Snapshot pour restaurer", commentaire: "Gérer les snapshots via le Snapshot Manager" },
          { os: "both", cmd: "# Dossiers partagés :\n# VM > Paramètres > Options > Shared Folders\n# Ajouter un dossier hôte : C:\\Partage\n# Nom : partage, Activé : oui", commentaire: "Configurer un dossier partagé hôte -> VM" },
          { os: "linux", cmd: "ls /mnt/hgfs/\n# ou\nvmhgfs-fuse .host:/partage /mnt/partage", commentaire: "Accéder au dossier partagé depuis la VM Linux" }
        ],
        erreurs_courantes: [
          { symptome: "/mnt/hgfs/ vide ou absent", cause: "open-vm-tools-desktop non installé ou VMware Tools non démarrés", solution: "sudo apt install open-vm-tools open-vm-tools-desktop && sudo systemctl restart open-vm-tools" }
        ]
      }
    ],
    checklist: [
      "VM Linux créée et démarrée dans VMware Workstation",
      "Mode NAT : VM accède à Internet",
      "Mode Bridged : VM obtient une IP du réseau physique",
      "open-vm-tools installé : vmware-toolsd --version OK",
      "Copier-coller hôte <-> VM fonctionne",
      "Snapshot post-install créé et restauration OK",
      "Dossier partagé accessible depuis /mnt/hgfs/"
    ],
    tags: ["vmware", "workstation", "virtualisation", "nat", "bridged", "host-only", "vmware-tools", "snapshot"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 61,
    titre: "Vagrant — environnements reproductibles avec VirtualBox",
    categorie: "virtualisation",
    niveau: "intermédiaire",
    duree: 75,
    description: "Utiliser Vagrant pour créer et gérer des environnements de développement et de lab reproductibles. Écrire un Vagrantfile pour automatiser la création de VMs VirtualBox, le provisioning et la configuration réseau.",
    objectifs: [
      "Installer Vagrant et comprendre son fonctionnement avec VirtualBox",
      "Démarrer une VM depuis une box Vagrant",
      "Écrire un Vagrantfile avec configuration réseau et provisioning",
      "Créer un lab multi-VMs avec un seul Vagrantfile",
      "Comprendre le cycle vagrant up/halt/destroy/ssh"
    ],
    prerequis: [
      { type: "logiciel", nom: "VirtualBox 7.x installé" },
      { type: "logiciel", nom: "Vagrant installé", lien: "https://developer.hashicorp.com/vagrant/install" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation et première VM",
        contexte: "Vagrant utilise des boxes (images VM préconfigurées) téléchargées depuis app.vagrantup.com. On démarre une première VM Debian avec une seule commande.",
        commandes: [
          { os: "both", cmd: "# Installer Vagrant :\n# Windows : winget install HashiCorp.Vagrant\n# Linux : sudo apt install vagrant\nvagrant --version", commentaire: "Installer et vérifier Vagrant" },
          { os: "both", cmd: "mkdir ~/vagrant-lab && cd ~/vagrant-lab\nvagrant init debian/bookworm64", commentaire: "Initialiser un projet Vagrant avec une box Debian 12" },
          { os: "both", cmd: "vagrant up", commentaire: "Télécharger la box et démarrer la VM (peut prendre quelques minutes la 1ère fois)" },
          { os: "both", cmd: "vagrant ssh", commentaire: "Se connecter à la VM via SSH (sans mot de passe)" },
          { os: "both", cmd: "vagrant halt\nvagrant destroy -f", commentaire: "Éteindre et supprimer la VM" }
        ],
        erreurs_courantes: [
          { symptome: "vagrant up : VT-x is not available", cause: "Virtualisation matérielle désactivée dans le BIOS", solution: "Redémarrer en BIOS/UEFI et activer Intel VT-x ou AMD-V. Sur Windows avec Hyper-V actif, Vagrant peut entrer en conflit — désactiver Hyper-V ou utiliser le provider Hyper-V." }
        ]
      },
      {
        titre: "Étape 2 — Écrire un Vagrantfile complet",
        contexte: "Le Vagrantfile est un fichier Ruby qui décrit la VM : ressources, réseau, dossiers partagés et provisioning (scripts d'installation automatiques).",
        commandes: [
          { os: "both", cmd: "nano Vagrantfile", commentaire: "Éditer le Vagrantfile du projet" },
          { os: "both", cmd: "# Contenu Vagrantfile complet :\n# Vagrant.configure('2') do |config|\n#   config.vm.box = 'debian/bookworm64'\n#   config.vm.hostname = 'debian-lab'\n#   config.vm.network 'private_network', ip: '192.168.56.10'\n#   config.vm.synced_folder './partage', '/vagrant_data', create: true\n#   config.vm.provider 'virtualbox' do |vb|\n#     vb.name = 'debian-lab-vagrant'\n#     vb.memory = 1024\n#     vb.cpus = 2\n#   end\n#   config.vm.provision 'shell', inline: <<-SHELL\n#     apt-get update -y\n#     apt-get install -y nginx curl\n#     systemctl enable --now nginx\n#   SHELL\n# end", commentaire: "VM avec IP fixe, dossier partagé et nginx installé automatiquement" },
          { os: "both", cmd: "vagrant up\nvagrant ssh -c 'systemctl status nginx'", commentaire: "Démarrer et vérifier que le provisioning a installé nginx" }
        ],
        erreurs_courantes: [
          { symptome: "vagrant up : No usable default provider", cause: "VirtualBox non installé ou non détecté par Vagrant", solution: "Vérifier que VirtualBox est installé. Spécifier le provider : vagrant up --provider=virtualbox" }
        ]
      },
      {
        titre: "Étape 3 — Lab multi-VMs",
        contexte: "Un seul Vagrantfile peut définir plusieurs VMs. Pratique pour simuler une infrastructure client/serveur complète.",
        commandes: [
          { os: "both", cmd: "# Vagrantfile multi-VMs :\n# Vagrant.configure('2') do |config|\n#   config.vm.define 'serveur' do |srv|\n#     srv.vm.box = 'debian/bookworm64'\n#     srv.vm.hostname = 'serveur'\n#     srv.vm.network 'private_network', ip: '192.168.56.10'\n#     srv.vm.provision 'shell', inline: 'apt-get install -y nginx -y'\n#   end\n#   config.vm.define 'client' do |cli|\n#     cli.vm.box = 'debian/bookworm64'\n#     cli.vm.hostname = 'client'\n#     cli.vm.network 'private_network', ip: '192.168.56.20'\n#   end\n# end", commentaire: "Deux VMs dans le même Vagrantfile sur le même réseau privé" },
          { os: "both", cmd: "vagrant up serveur\nvagrant up client", commentaire: "Démarrer les VMs individuellement" },
          { os: "both", cmd: "vagrant ssh client -c 'curl http://192.168.56.10'", commentaire: "Tester depuis le client que le serveur nginx répond" },
          { os: "both", cmd: "vagrant status\nvagrant global-status", commentaire: "Voir l'état des VMs du projet et de toutes les VMs Vagrant" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Commandes essentielles Vagrant",
        contexte: "Le cycle de vie complet d'un environnement Vagrant.",
        commandes: [
          { os: "both", cmd: "vagrant up", commentaire: "Créer et démarrer les VMs (+ provisioning si première fois)" },
          { os: "both", cmd: "vagrant halt", commentaire: "Éteindre proprement les VMs (conserve l'état disque)" },
          { os: "both", cmd: "vagrant suspend && vagrant resume", commentaire: "Suspendre (snapshot RAM) et reprendre" },
          { os: "both", cmd: "vagrant reload --provision", commentaire: "Redémarrer et relancer le provisioning" },
          { os: "both", cmd: "vagrant destroy -f", commentaire: "Supprimer complètement les VMs (disques effacés)" },
          { os: "both", cmd: "vagrant box list\nvagrant box update", commentaire: "Lister les boxes installées et les mettre à jour" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "vagrant --version affiche la version installée",
      "vagrant up télécharge la box et démarre la VM",
      "vagrant ssh fonctionne sans mot de passe",
      "IP 192.168.56.10 pingable depuis l'hôte",
      "Provisioning : nginx installé et actif automatiquement",
      "Lab multi-VMs : curl serveur depuis client retourne la page nginx",
      "vagrant destroy supprime proprement les VMs"
    ],
    tags: ["vagrant", "virtualbox", "iac", "provisioning", "automatisation", "virtualisation", "lab"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 62,
    titre: "Vagrant — provisioning Ansible et lab Infrastructure as Code",
    categorie: "virtualisation",
    niveau: "avancé",
    duree: 90,
    description: "Combiner Vagrant et Ansible pour créer un lab Infrastructure as Code complet : Vagrant gère les VMs, Ansible les configure automatiquement. Déploiement d'une stack web (nginx + php + mariadb) entièrement automatisé.",
    objectifs: [
      "Configurer le provisioning Ansible dans un Vagrantfile",
      "Écrire un playbook Ansible appelé par Vagrant",
      "Déployer automatiquement une stack LEMP via Vagrant + Ansible",
      "Utiliser les variables Ansible pour paramétrer le déploiement",
      "Recréer l'environnement entier depuis zéro en une commande"
    ],
    prerequis: [
      { type: "logiciel", nom: "VirtualBox 7.x installé" },
      { type: "logiciel", nom: "Vagrant installé" },
      { type: "logiciel", nom: "Ansible installé sur la machine hôte (Linux/macOS) ou dans une VM contrôleur" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Structure du projet",
        contexte: "On organise le projet avec un Vagrantfile et un dossier ansible/ contenant le playbook et les rôles.",
        commandes: [
          { os: "linux", cmd: "mkdir -p ~/vagrant-ansible-lab/ansible/roles\ncd ~/vagrant-ansible-lab\ntouch Vagrantfile ansible/playbook.yml ansible/inventory", commentaire: "Créer la structure du projet" },
          { os: "linux", cmd: "# Structure finale :\n# vagrant-ansible-lab/\n# ├── Vagrantfile\n# └── ansible/\n#     ├── playbook.yml\n#     ├── inventory\n#     └── roles/", commentaire: "Organisation recommandée Vagrant + Ansible" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Vagrantfile avec provisioning Ansible",
        contexte: "Vagrant supporte Ansible nativement comme provisioner. Il peut utiliser ansible (installé sur l'hôte) ou ansible_local (installé dans la VM).",
        commandes: [
          { os: "both", cmd: "# Contenu du Vagrantfile :\n# Vagrant.configure('2') do |config|\n#   config.vm.box = 'debian/bookworm64'\n#   config.vm.hostname = 'lemp-server'\n#   config.vm.network 'private_network', ip: '192.168.56.10'\n#   config.vm.provider 'virtualbox' do |vb|\n#     vb.memory = 1024\n#     vb.cpus = 2\n#   end\n#   config.vm.provision 'ansible_local' do |ansible|\n#     ansible.playbook = 'ansible/playbook.yml'\n#     ansible.install_mode = 'default'\n#   end\n# end", commentaire: "ansible_local : Ansible s'installe dans la VM et s'exécute localement" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Écrire le playbook Ansible LEMP",
        contexte: "Le playbook installe et configure automatiquement Nginx, PHP-FPM et MariaDB avec une page PHP de test.",
        commandes: [
          { os: "linux", cmd: "nano ansible/playbook.yml", commentaire: "Écrire le playbook Ansible" },
          { os: "linux", cmd: "# Contenu playbook.yml :\n# ---\n# - name: Deploy LEMP stack\n#   hosts: all\n#   become: yes\n#   vars:\n#     db_name: webapp\n#     db_user: webuser\n#     db_password: P@ssw0rd\n#   tasks:\n#     - name: Install packages\n#       apt:\n#         name: [nginx, php-fpm, php-mysql, mariadb-server]\n#         state: present\n#         update_cache: yes\n#     - name: Start services\n#       service:\n#         name: '{{ item }}'\n#         state: started\n#         enabled: yes\n#       loop: [nginx, php8.2-fpm, mariadb]\n#     - name: Create database\n#       community.mysql.mysql_db:\n#         name: '{{ db_name }}'\n#         state: present\n#     - name: Deploy test page\n#       copy:\n#         content: '<?php phpinfo(); ?>'\n#         dest: /var/www/html/info.php", commentaire: "Playbook qui installe nginx, php-fpm, mariadb et déploie une page PHP" },
          { os: "linux", cmd: "vagrant up", commentaire: "Lancer vagrant up — crée la VM et exécute le playbook automatiquement" }
        ],
        erreurs_courantes: [
          { symptome: "Ansible task failed : No package matching php-fpm", cause: "Les dépôts APT ne sont pas à jour dans la VM", solution: "Ajouter une tâche apt update_cache: yes avant l'installation des paquets" }
        ]
      },
      {
        titre: "Étape 4 — Tester et reconstruire from scratch",
        contexte: "On vérifie le déploiement depuis l'hôte, puis on teste la puissance de l'IaC en détruisant et recréant l'environnement en une commande.",
        commandes: [
          { os: "both", cmd: "# Depuis l'hôte :\ncurl http://192.168.56.10/info.php | grep -i php", commentaire: "Vérifier que PHP répond sur la VM déployée par Ansible" },
          { os: "both", cmd: "vagrant ssh -c 'systemctl status nginx php8.2-fpm mariadb'", commentaire: "Vérifier l'état des services dans la VM" },
          { os: "both", cmd: "vagrant destroy -f && vagrant up", commentaire: "Détruire et recréer l'environnement complet from scratch en une commande" },
          { os: "both", cmd: "vagrant provision", commentaire: "Relancer uniquement le provisioning sans recréer la VM" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Structure projet créée : Vagrantfile + ansible/playbook.yml",
      "vagrant up crée la VM et lance le playbook sans erreur",
      "curl http://192.168.56.10/info.php affiche la page phpinfo",
      "nginx, php-fpm, mariadb actifs dans la VM",
      "vagrant destroy -f && vagrant up recrée tout from scratch",
      "La stack est opérationnelle après reconstruction complète"
    ],
    tags: ["vagrant", "ansible", "iac", "lemp", "provisioning", "virtualisation", "automatisation"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 65,
    titre: "Proxmox VE — cluster 2 nœuds et migration à chaud",
    categorie: "virtualisation",
    niveau: "avancé",
    duree: 110,
    description: "Constituer un cluster Proxmox VE à deux nœuds, mettre en place un stockage partagé NFS, migrer une VM à chaud (live migration) entre les nœuds et comprendre le quorum. Introduction à la haute disponibilité.",
    objectifs: [
      "Créer un cluster Proxmox et joindre un second nœud",
      "Comprendre le quorum et le rôle de Corosync",
      "Configurer un stockage partagé NFS pour les deux nœuds",
      "Migrer une VM à chaud sans interruption de service",
      "Poser les bases de la haute disponibilité (HA)"
    ],
    prerequis: [
      { type: "vm", nom: "2x serveurs (ou VMs nested) Proxmox VE 8.x — pve1 et pve2" },
      { type: "vm", nom: "1x serveur NFS (Debian ou NAS) pour le stockage partagé" },
      { type: "reseau", nom: "Réseau commun entre les nœuds, IPs statiques et résolution des noms (/etc/hosts)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Préparer les nœuds et le réseau",
        contexte: "Un cluster exige une résolution de noms fiable et des horloges synchronisées. On renseigne /etc/hosts sur chaque nœud et on vérifie la connectivité. Corosync (couche de communication du cluster) est sensible à la latence.",
        commandes: [
          { os: "linux", cmd: "# Sur pve1 et pve2, dans /etc/hosts :\n192.168.1.11 pve1.lab.local pve1\n192.168.1.12 pve2.lab.local pve2", commentaire: "Résolution de noms des deux nœuds" },
          { os: "linux", cmd: "ping -c2 pve2\ntimedatectl", commentaire: "Vérifier connectivité et synchro horloge (NTP)" },
          { os: "linux", cmd: "pvecm status 2>/dev/null || echo 'Pas encore de cluster'", commentaire: "État initial : aucun cluster" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les nœuds ne se voient pas par leur nom",
            cause: "/etc/hosts incomplet ou DNS absent",
            solution: "Renseigner manuellement les deux nœuds dans /etc/hosts sur chaque serveur."
          }
        ]
      },
      {
        titre: "Étape 2 — Créer le cluster et joindre le second nœud",
        contexte: "On crée le cluster sur pve1 puis on y rattache pve2. Après jonction, l'interface web de n'importe quel nœud montre les deux serveurs. Attention : un nœud qui a déjà des VMs ne peut pas rejoindre un cluster.",
        commandes: [
          { os: "linux", cmd: "# Sur pve1 — créer le cluster :\npvecm create LAB-CLUSTER", commentaire: "Initialiser le cluster sur le premier nœud" },
          { os: "linux", cmd: "# Sur pve2 — rejoindre (IP de pve1) :\npvecm add 192.168.1.11", commentaire: "Joindre pve2 au cluster (mot de passe root de pve1)" },
          { os: "linux", cmd: "pvecm status\npvecm nodes", commentaire: "Vérifier : 2 nœuds, quorum OK" }
        ],
        erreurs_courantes: [
          {
            symptome: "cluster not ready - no quorum?",
            cause: "Un seul nœud actif — le quorum d'un cluster à 2 nœuds exige les deux",
            solution: "Vérifier que les deux nœuds sont en ligne. Pour un lab 2 nœuds, on peut réduire le quorum attendu : pvecm expected 1 (temporaire)."
          },
          {
            symptome: "Le nœud à joindre a déjà des VMs — refus",
            cause: "Proxmox interdit de joindre un cluster avec des VMs existantes",
            solution: "Sauvegarder puis supprimer les VMs de pve2 avant la jonction, ou repartir d'une install propre."
          }
        ]
      },
      {
        titre: "Étape 3 — Stockage partagé NFS",
        contexte: "La migration à chaud sans copie de disque nécessite un stockage partagé accessible par les deux nœuds. On exporte un partage NFS et on l'ajoute au datacenter Proxmox — il devient disponible pour tous les nœuds.",
        commandes: [
          { os: "linux", cmd: "# Sur le serveur NFS :\nsudo apt install -y nfs-kernel-server\nsudo mkdir -p /export/proxmox\necho '/export/proxmox 192.168.1.0/24(rw,sync,no_subtree_check,no_root_squash)' | sudo tee -a /etc/exports\nsudo exportfs -ra", commentaire: "Exporter un partage NFS" },
          { os: "both", cmd: "# Proxmox : Datacenter > Storage > Add > NFS\n# ID : nfs-shared / Server : 192.168.1.20\n# Export : /export/proxmox / Content : Disk image, ISO", commentaire: "Ajouter le stockage NFS au datacenter" },
          { os: "linux", cmd: "pvesm status", commentaire: "Vérifier que nfs-shared est actif sur les deux nœuds" }
        ],
        erreurs_courantes: [
          {
            symptome: "Storage nfs-shared not online",
            cause: "Export NFS non accessible ou pare-feu",
            solution: "showmount -e 192.168.1.20 depuis un nœud Proxmox. Vérifier /etc/exports et exportfs -ra."
          }
        ]
      },
      {
        titre: "Étape 4 — Migration à chaud d'une VM",
        contexte: "Avec le disque de la VM sur le stockage partagé, la migration à chaud ne transfère que la RAM et l'état CPU — la VM continue de répondre pendant l'opération. On lance un ping continu pour le prouver.",
        commandes: [
          { os: "both", cmd: "# Créer/déplacer une VM avec son disque sur nfs-shared\n# Depuis un client : ping -t <IP de la VM> (garder ouvert)", commentaire: "Lancer un ping continu vers la VM" },
          { os: "both", cmd: "# Clic droit sur la VM > Migrate\n# Target node : pve2 / Mode : Online (live) > Migrate", commentaire: "Migrer la VM à chaud vers pve2" },
          { os: "linux", cmd: "# En CLI équivalent :\nqm migrate 100 pve2 --online", commentaire: "Migration à chaud en ligne de commande" },
          { os: "both", cmd: "# Observer le ping : aucune (ou 1 seule) perte de paquet\n# La VM tourne maintenant sur pve2", commentaire: "Valider la continuité de service" }
        ],
        erreurs_courantes: [
          {
            symptome: "Migration online impossible — disque en local",
            cause: "Le disque de la VM est sur un stockage local, pas partagé",
            solution: "Déplacer le disque : VM > Hardware > Disk > Move Storage vers nfs-shared avant de migrer."
          }
        ]
      }
    ],
    checklist: [
      "Cluster LAB-CLUSTER créé et pve2 joint (pvecm status : 2 nœuds, quorum OK)",
      "Les deux nœuds visibles dans l'interface web d'un seul nœud",
      "Stockage NFS partagé actif sur les deux nœuds (pvesm status)",
      "VM avec disque sur le stockage partagé",
      "Migration à chaud pve1 → pve2 réussie",
      "Ping continu pendant la migration : 0 ou 1 perte de paquet"
    ],
    tags: ["proxmox", "cluster", "migration", "live-migration", "nfs", "corosync", "quorum", "haute-disponibilite", "virtualisation", "avance"],
    date_ajout: "2026-07-03",
    source: "École"
  },

  {
    id: 66,
    titre: "Conteneurs LXC sur Proxmox — création, templates et limites de ressources",
    categorie: "virtualisation",
    niveau: "intermédiaire",
    duree: 60,
    description: "Créer et gérer des conteneurs LXC sous Proxmox VE : télécharger un template, déployer un conteneur, définir des limites CPU/RAM/disque, comprendre la différence entre conteneurs privilégiés et non privilégiés, et convertir un conteneur en template réutilisable.",
    objectifs: [
      "Comprendre la différence entre VM (KVM) et conteneur LXC",
      "Télécharger un template LXC et créer un conteneur",
      "Configurer les limites de ressources (CPU, RAM, disque)",
      "Distinguer conteneur privilégié et non privilégié",
      "Convertir un conteneur en template et le cloner"
    ],
    prerequis: [
      { type: "vm", nom: "1x serveur Proxmox VE 8.x" },
      { type: "reseau", nom: "Accès Internet pour télécharger les templates LXC" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Télécharger un template LXC",
        contexte: "Proxmox fournit des templates de conteneurs (Debian, Ubuntu, Alpine...) via pveam. Un conteneur LXC partage le noyau de l'hôte : il démarre en une seconde et consomme très peu, contrairement à une VM complète.",
        commandes: [
          { os: "linux", cmd: "pveam update\npveam available | grep debian", commentaire: "Lister les templates disponibles" },
          { os: "linux", cmd: "pveam download local debian-12-standard_12.7-1_amd64.tar.zst", commentaire: "Télécharger le template Debian 12" },
          { os: "linux", cmd: "pveam list local", commentaire: "Vérifier le template téléchargé" }
        ],
        erreurs_courantes: [
          {
            symptome: "pveam download : 404 not found",
            cause: "Nom/version de template obsolète",
            solution: "Relancer pveam available pour obtenir le nom exact de la version courante."
          }
        ]
      },
      {
        titre: "Étape 2 — Créer un conteneur non privilégié",
        contexte: "Un conteneur non privilégié (recommandé) mappe l'utilisateur root du conteneur sur un utilisateur non-root de l'hôte — bien plus sûr. On crée le conteneur en CLI avec pct create.",
        commandes: [
          { os: "linux", cmd: "pct create 200 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \\\n  --hostname ct-web --cores 1 --memory 512 --swap 512 \\\n  --rootfs local-lvm:8 --net0 name=eth0,bridge=vmbr0,ip=dhcp \\\n  --unprivileged 1 --password", commentaire: "Créer un conteneur non privilégié (--unprivileged 1)" },
          { os: "linux", cmd: "pct start 200\npct status 200\npct list", commentaire: "Démarrer et vérifier le conteneur" },
          { os: "linux", cmd: "pct enter 200\n# On est dans le conteneur :\napt update && apt install -y nginx\nexit", commentaire: "Entrer dans le conteneur et installer un service" }
        ],
        erreurs_courantes: [
          {
            symptome: "pct start : erreur de montage rootfs",
            cause: "Stockage local-lvm inexistant ou plein",
            solution: "Vérifier pvesm status. Adapter --rootfs au nom réel du stockage (local, local-lvm...)."
          }
        ]
      },
      {
        titre: "Étape 3 — Limites de ressources et privilèges",
        contexte: "On ajuste les limites à chaud (CPU, RAM) et on illustre le contrôle fin des ressources. On compare aussi privilégié vs non privilégié pour la sécurité.",
        commandes: [
          { os: "linux", cmd: "pct set 200 --memory 1024 --cores 2\npct set 200 --cpulimit 1", commentaire: "Ajuster RAM, cœurs et limite CPU à chaud" },
          { os: "linux", cmd: "pct exec 200 -- free -m\npct exec 200 -- nproc", commentaire: "Vérifier les limites vues depuis le conteneur" },
          { os: "linux", cmd: "# Redimensionner le disque :\npct resize 200 rootfs +4G", commentaire: "Agrandir le disque du conteneur à chaud" }
        ],
        erreurs_courantes: [
          {
            symptome: "Un montage (NFS, FUSE) échoue dans le conteneur non privilégié",
            cause: "Les conteneurs non privilégiés n'ont pas certaines capabilities",
            solution: "Pour ces cas précis, utiliser un conteneur privilégié (--unprivileged 0) en connaissance de cause, ou ajouter la feature nécessaire (pct set ... --features)."
          }
        ]
      },
      {
        titre: "Étape 4 — Convertir en template et cloner",
        contexte: "Un conteneur configuré peut devenir un template en lecture seule, dont on tire des clones instantanés (linked clone) — idéal pour déployer rapidement des environnements identiques.",
        commandes: [
          { os: "linux", cmd: "pct stop 200\npct template 200", commentaire: "Convertir le conteneur en template" },
          { os: "linux", cmd: "pct clone 200 201 --hostname ct-web-clone\npct start 201", commentaire: "Cloner le template vers un nouveau conteneur" },
          { os: "linux", cmd: "pct list", commentaire: "Vérifier le conteneur cloné" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Template Debian 12 téléchargé (pveam list local)",
      "Conteneur non privilégié 200 créé et démarré",
      "Service (nginx) installé dans le conteneur",
      "Limites CPU/RAM ajustées et vérifiées depuis le conteneur",
      "Disque du conteneur agrandi (pct resize)",
      "Conteneur converti en template et cloné vers un nouveau CT"
    ],
    tags: ["lxc", "conteneur", "proxmox", "template", "pct", "ressources", "virtualisation", "cgroups", "intermediaire"],
    date_ajout: "2026-07-03",
    source: "École"
  },

  {
    id: 134,
    titre: "Docker Compose — stack LEMP multi-conteneurs (volumes, réseaux, .env)",
    categorie: "virtualisation",
    niveau: "intermédiaire",
    duree: 75,
    description: "Construire une application multi-conteneurs avec Docker Compose : Nginx, PHP-FPM et MariaDB reliés par des réseaux dédiés, données persistées par volumes, secrets dans un fichier .env. Gérer le cycle de vie (up/down), les logs et la sauvegarde/restauration de la base.",
    objectifs: [
      "Écrire un docker-compose.yml orchestrant plusieurs services",
      "Isoler les services avec des réseaux Docker dédiés",
      "Persister les données via des volumes nommés",
      "Externaliser les secrets dans un fichier .env",
      "Sauvegarder et restaurer la base de données du conteneur"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 avec Docker + Docker Compose" },
      { type: "logiciel", nom: "Docker Engine et plugin Compose", lien: "https://docs.docker.com/compose/install/" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Structure du projet et fichier .env",
        contexte: "On organise le projet dans un dossier avec un .env pour les secrets (jamais versionné) et les sources de l'app. Cette séparation config/code est une bonne pratique.",
        commandes: [
          { os: "linux", cmd: "mkdir -p ~/lemp/{nginx,src} && cd ~/lemp", commentaire: "Créer l'arborescence du projet" },
          { os: "linux", cmd: "# ~/lemp/.env :\nMYSQL_ROOT_PASSWORD=RootPass123\nMYSQL_DATABASE=appdb\nMYSQL_USER=appuser\nMYSQL_PASSWORD=AppPass123", commentaire: "Externaliser les secrets dans .env" },
          { os: "linux", cmd: "echo '.env' > .gitignore\necho \"<?php phpinfo(); ?>\" > src/index.php", commentaire: "Ignorer .env et créer une page PHP de test" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les variables du .env ne sont pas prises en compte",
            cause: ".env absent du répertoire où l'on lance compose",
            solution: "Le .env doit être dans le même dossier que docker-compose.yml (ou passé via --env-file)."
          }
        ]
      },
      {
        titre: "Étape 2 — Écrire le docker-compose.yml",
        contexte: "Le fichier décrit trois services (nginx, php, db), deux réseaux (front pour nginx/php, back pour php/db) et deux volumes (données MariaDB, code partagé). MariaDB n'est jamais exposée publiquement.",
        commandes: [
          { os: "linux", cmd: "# services:\n#   nginx: image nginx, ports 8080:80, volumes src + conf, networks [front]\n#   php: image php:8.2-fpm, volume src, networks [front, back]\n#   db: image mariadb:11, env_file .env, volume db_data, networks [back]", commentaire: "Trois services, isolation par réseaux" },
          { os: "linux", cmd: "# networks:\n#   front:\n#   back:\n# volumes:\n#   db_data:", commentaire: "Déclarer réseaux et volume persistant" },
          { os: "linux", cmd: "# nginx/default.conf : root /var/www/html;\n# location ~ \\.php$ { fastcgi_pass php:9000; ... }", commentaire: "Nginx transmet le PHP à php-fpm via le nom de service" }
        ],
        erreurs_courantes: [
          {
            symptome: "Nginx : 502 sur les fichiers PHP",
            cause: "fastcgi_pass pointe vers une mauvaise cible",
            solution: "Utiliser le nom du service (php:9000) — la résolution DNS interne de Docker le trouve sur le réseau partagé."
          }
        ]
      },
      {
        titre: "Étape 3 — Démarrer, inspecter et logs",
        contexte: "On lance la stack en arrière-plan, on vérifie l'état des services et on consulte les logs. On teste l'isolation réseau : nginx ne doit pas pouvoir joindre la base directement.",
        commandes: [
          { os: "linux", cmd: "docker compose up -d\ndocker compose ps", commentaire: "Démarrer et lister les services" },
          { os: "linux", cmd: "curl http://localhost:8080\ndocker compose logs -f nginx", commentaire: "Tester l'app et suivre les logs Nginx" },
          { os: "linux", cmd: "docker compose exec php ping -c2 db\ndocker compose exec nginx ping -c2 db || echo 'nginx isolé de db : normal'", commentaire: "php joint db (réseau back), nginx non : isolation validée" }
        ],
        erreurs_courantes: [
          {
            symptome: "Un service redémarre en boucle",
            cause: "Mauvaise variable d'environnement ou dépendance non prête",
            solution: "docker compose logs <service>. Ajouter depends_on et vérifier les valeurs du .env."
          }
        ]
      },
      {
        titre: "Étape 4 — Persistance, sauvegarde et restauration",
        contexte: "On prouve la persistance : détruire les conteneurs sans -v conserve le volume. On sauvegarde la base par mysqldump et on la restaure, compétence clé pour la reprise après incident.",
        commandes: [
          { os: "linux", cmd: "docker compose exec db mysqldump -u root -p\"$MYSQL_ROOT_PASSWORD\" appdb > backup.sql", commentaire: "Sauvegarder la base dans un fichier SQL" },
          { os: "linux", cmd: "docker compose down   # sans -v : le volume db_data survit\ndocker compose up -d\ndocker volume ls | grep db_data", commentaire: "Recréer les conteneurs — les données persistent" },
          { os: "linux", cmd: "cat backup.sql | docker compose exec -T db mysql -u root -p\"$MYSQL_ROOT_PASSWORD\" appdb", commentaire: "Restaurer la base depuis la sauvegarde" }
        ],
        erreurs_courantes: [
          {
            symptome: "Toutes les données perdues après down",
            cause: "docker compose down -v supprime aussi les volumes",
            solution: "Ne jamais utiliser -v en production. Les données vivent dans le volume nommé db_data."
          }
        ]
      }
    ],
    checklist: [
      "docker compose up -d : les 3 services UP (docker compose ps)",
      "http://localhost:8080 affiche la page PHP",
      "php joint db mais nginx ne joint pas db (isolation réseau)",
      "Secrets chargés depuis .env (non versionné)",
      "mysqldump génère backup.sql",
      "Après down/up, les données persistent ; restauration testée"
    ],
    tags: ["docker", "docker-compose", "lemp", "conteneur", "volumes", "reseaux", "virtualisation", "mariadb", "nginx", "persistance"],
    date_ajout: "2026-07-03",
    source: "École"
  }

];
