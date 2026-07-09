// TP & Labs IT — Catégorie : systemes
// 15 TP(s)

const LABS_SYSTEMES = [
  {
    id: 2,
    titre: "Durcissement SSH + fail2ban sur Debian/Ubuntu",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Sécuriser l'accès SSH d'un serveur Debian/Ubuntu : désactiver l'authentification par mot de passe, forcer l'authentification par clé publique, restreindre les utilisateurs autorisés, puis installer et configurer fail2ban pour bloquer automatiquement les tentatives de brute-force.",
    objectifs: [
      "Générer une paire de clés SSH Ed25519 et déployer la clé publique",
      "Durcir la configuration sshd_config (port, auth, utilisateurs)",
      "Installer et configurer fail2ban pour protéger le service SSH",
      "Tester la connexion par clé et le blocage automatique par fail2ban"
    ],
    prerequis: [
      { type: "vm",      nom: "VM Debian 12 ou Ubuntu 22.04 LTS" },
      { type: "reseau",  nom: "Accès SSH existant sur port 22" },
      { type: "logiciel", nom: "Client SSH sur machine hôte (OpenSSH, PuTTY)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Générer la paire de clés SSH Ed25519",
        contexte: "Ed25519 est l'algorithme de signature recommandé aujourd'hui : plus court, plus rapide et plus sécurisé que RSA 2048. On génère la paire sur la machine cliente (votre poste), pas sur le serveur. La clé privée ne quitte jamais votre machine.",
        commandes: [
          { os: "linux", cmd: "ssh-keygen -t ed25519 -C \"admin@tp-ssh\" -f ~/.ssh/id_ed25519_tp", commentaire: "Génère la paire de clés — entrer une passphrase forte" },
          { os: "windows", cmd: "ssh-keygen -t ed25519 -C \"admin@tp-ssh\" -f %USERPROFILE%\\.ssh\\id_ed25519_tp", commentaire: "Même commande sous Windows (PowerShell ou Git Bash)" },
          { os: "linux", cmd: "cat ~/.ssh/id_ed25519_tp.pub", commentaire: "Afficher la clé PUBLIQUE à copier vers le serveur" }
        ],
        erreurs_courantes: [
          {
            symptome: "Erreur 'No such file or directory' pour ~/.ssh/",
            cause: "Le répertoire .ssh n'existe pas encore",
            solution: "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
          }
        ]
      },
      {
        titre: "Étape 2 — Copier la clé publique sur le serveur",
        contexte: "On dépose la clé publique dans le fichier authorized_keys du compte cible sur le serveur. La commande ssh-copy-id automatise cela proprement. Si elle n'est pas disponible, on le fait manuellement.",
        commandes: [
          { os: "linux", cmd: "ssh-copy-id -i ~/.ssh/id_ed25519_tp.pub user@192.168.1.10", commentaire: "Copie automatique — requiert encore le mot de passe une dernière fois" },
          { os: "linux", cmd: "# Méthode manuelle si ssh-copy-id indisponible :\ncat ~/.ssh/id_ed25519_tp.pub | ssh user@192.168.1.10 \\\n  \"mkdir -p ~/.ssh && chmod 700 ~/.ssh && \\\n   cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys\"", commentaire: "Alternative manuelle équivalente" },
          { os: "linux", cmd: "ssh -i ~/.ssh/id_ed25519_tp user@192.168.1.10", commentaire: "Test de connexion par clé — doit fonctionner sans mot de passe (ou avec passphrase)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Durcir sshd_config",
        contexte: "Une fois la connexion par clé confirmée, on durcit la configuration du serveur SSH. IMPORTANT : ne jamais fermer la session active pendant la modification — ouvrir une deuxième session de test avant de valider.",
        commandes: [
          { os: "linux", cmd: "sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak", commentaire: "Sauvegarde obligatoire avant toute modification" },
          { os: "linux", cmd: "sudo nano /etc/ssh/sshd_config", commentaire: "Éditer la configuration — voir les paramètres ci-dessous" },
          { os: "linux", cmd: "# Paramètres à modifier/vérifier dans sshd_config :\nPort 2222\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nMaxAuthTries 3\nLoginGraceTime 20\nAllowUsers votre_user", commentaire: "Coller/modifier ces lignes dans le fichier sshd_config" },
          { os: "linux", cmd: "sudo sshd -t", commentaire: "Vérifier la syntaxe AVANT de recharger (pas d'erreur = OK)" },
          { os: "linux", cmd: "sudo systemctl restart ssh", commentaire: "Appliquer la configuration (Debian: 'ssh', Ubuntu: 'sshd')" },
          { os: "linux", cmd: "ssh -i ~/.ssh/id_ed25519_tp -p 2222 user@192.168.1.10", commentaire: "Tester la connexion sur le nouveau port" }
        ],
        erreurs_courantes: [
          {
            symptome: "Permission denied (publickey) après rechargement",
            cause: "La clé publique n'est pas dans authorized_keys, ou les permissions du fichier sont incorrectes",
            solution: "Sur le serveur : chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys. Vérifier aussi que la clé privée correspond bien à la publique déposée."
          },
          {
            symptome: "ssh: connect to host port 2222: Connection refused",
            cause: "Le firewall bloque le nouveau port ou sshd n'a pas redémarré correctement",
            solution: "sudo ufw allow 2222/tcp && sudo ufw reload. Vérifier avec: sudo systemctl status ssh"
          }
        ]
      },
      {
        titre: "Étape 4 — Installer et configurer fail2ban",
        contexte: "fail2ban surveille les logs système et bannit automatiquement les IPs après un certain nombre d'échecs d'authentification. On crée un fichier jail.local pour ne pas écraser la configuration par défaut lors des mises à jour.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install fail2ban -y", commentaire: "Installation de fail2ban" },
          { os: "linux", cmd: "sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local", commentaire: "Copier la config de base pour personnalisation locale" },
          { os: "linux", cmd: "sudo nano /etc/fail2ban/jail.local", commentaire: "Éditer jail.local — modifier la section [sshd]" },
          { os: "linux", cmd: "# Dans jail.local, section [sshd] :\n[sshd]\nenabled  = true\nport     = 2222\nfilter   = sshd\nlogpath  = /var/log/auth.log\nmaxretry = 3\nbantime  = 3600\nfindtime = 600", commentaire: "3 tentatives → ban 1h dans une fenêtre de 10min" },
          { os: "linux", cmd: "sudo systemctl enable fail2ban && sudo systemctl restart fail2ban", commentaire: "Activer au démarrage et relancer" },
          { os: "linux", cmd: "sudo fail2ban-client status sshd", commentaire: "Vérifier que la jail 'sshd' est active (Currently banned: 0)" }
        ],
        erreurs_courantes: [
          {
            symptome: "fail2ban.service: Control process exited with error code",
            cause: "Le fichier jail.local contient une erreur de syntaxe ou le logpath est incorrect",
            solution: "sudo fail2ban-client -t (test de config). Sur Ubuntu 22.04, le log peut être dans /var/log/auth.log ou /var/log/secure selon la distrib."
          }
        ]
      }
    ],
    checklist: [
      "Connexion SSH par clé Ed25519 fonctionnelle sur le port 2222",
      "Connexion par mot de passe rejetée (PasswordAuthentication no vérifié)",
      "Root login désactivé (PermitRootLogin no dans sshd_config)",
      "fail2ban actif avec jail sshd activée ('fail2ban-client status sshd' → OK)"
    ],
    tags: ["ssh", "fail2ban", "debian", "ubuntu", "securite", "hardening", "linux"],
    date_ajout: "2026-01-20",
    source: "École"
  },

  {
    id: 32,
    titre: "LVM sur Linux — gestion logique des volumes",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 75,
    description: "Mettre en place LVM sur un serveur Debian/Ubuntu : Physical Volume, Volume Group, Logical Volume, formatage, montage, extension à chaud et snapshot LVM.",
    objectifs: [
      "Comprendre la hiérarchie PV > VG > LV",
      "Créer un Physical Volume sur un disque secondaire",
      "Créer un Volume Group et un Logical Volume",
      "Formater et monter le Logical Volume",
      "Étendre un Logical Volume à chaud",
      "Créer et restaurer un snapshot LVM"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 LTS" },
      { type: "vm", nom: "Disque secondaire de 10 Go ajouté à la VM (ex: /dev/sdb)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Identifier les disques et installer LVM",
        contexte: "On vérifie la présence du disque secondaire et on installe lvm2.",
        commandes: [
          { os: "linux", cmd: "lsblk", commentaire: "Lister les disques — repérer /dev/sdb" },
          { os: "linux", cmd: "sudo apt install lvm2 -y", commentaire: "Installer LVM2" },
          { os: "linux", cmd: "sudo pvdisplay", commentaire: "Vérifier qu'aucun PV n'existe déjà" }
        ],
        erreurs_courantes: [
          { symptome: "/dev/sdb absent dans lsblk", cause: "Disque secondaire non ajouté dans les paramètres VM", solution: "Éteindre la VM, ajouter un disque VDI de 10 Go, redémarrer" }
        ]
      },
      {
        titre: "Étape 2 — Créer PV, VG et LV",
        contexte: "On initialise le disque comme PV, crée le VG vg_data, puis un LV de 5 Go nommé lv_web.",
        commandes: [
          { os: "linux", cmd: "sudo pvcreate /dev/sdb", commentaire: "Initialiser /dev/sdb comme Physical Volume" },
          { os: "linux", cmd: "sudo vgcreate vg_data /dev/sdb", commentaire: "Créer le Volume Group vg_data" },
          { os: "linux", cmd: "sudo vgs", commentaire: "Vérifier — VFree doit afficher ~10G" },
          { os: "linux", cmd: "sudo lvcreate -L 5G -n lv_web vg_data", commentaire: "Créer un LV de 5 Go" },
          { os: "linux", cmd: "sudo mkfs.ext4 /dev/vg_data/lv_web", commentaire: "Formater en ext4" },
          { os: "linux", cmd: "sudo mkdir -p /mnt/web && sudo mount /dev/vg_data/lv_web /mnt/web", commentaire: "Monter le LV" },
          { os: "linux", cmd: "df -h /mnt/web", commentaire: "Vérifier le montage" }
        ],
        erreurs_courantes: [
          { symptome: "pvcreate: Device /dev/sdb not found", cause: "Kernel n'a pas détecté le disque", solution: "sudo partprobe ou redémarrer la VM" }
        ]
      },
      {
        titre: "Étape 3 — Montage permanent et extension à chaud",
        contexte: "On ajoute le LV dans /etc/fstab par UUID, puis on l'étend de 5 à 8 Go sans démonter.",
        commandes: [
          { os: "linux", cmd: "sudo blkid /dev/vg_data/lv_web", commentaire: "Récupérer l'UUID du LV" },
          { os: "linux", cmd: "echo 'UUID=<uuid> /mnt/web ext4 defaults 0 2' | sudo tee -a /etc/fstab && sudo mount -a", commentaire: "Ajouter dans fstab et tester" },
          { os: "linux", cmd: "sudo lvextend -L 8G /dev/vg_data/lv_web && sudo resize2fs /dev/vg_data/lv_web", commentaire: "Étendre le LV et le FS ext4 à chaud" },
          { os: "linux", cmd: "df -h /mnt/web", commentaire: "Vérifier — taille doit afficher ~8G" }
        ],
        erreurs_courantes: [
          { symptome: "Insufficient free space dans lvextend", cause: "VG sans espace libre", solution: "Vérifier sudo vgs colonne VFree. Ajouter un PV avec vgextend si besoin." }
        ]
      },
      {
        titre: "Étape 4 — Snapshot LVM",
        contexte: "Un snapshot capture l'état du LV à un instant T — utile avant une opération risquée.",
        commandes: [
          { os: "linux", cmd: "sudo lvcreate -L 1G -s -n lv_web_snap /dev/vg_data/lv_web", commentaire: "Créer un snapshot de 1 Go" },
          { os: "linux", cmd: "sudo rm /mnt/web/fichier_test.txt", commentaire: "Simuler une suppression accidentelle" },
          { os: "linux", cmd: "sudo umount /mnt/web && sudo lvconvert --merge /dev/vg_data/lv_web_snap", commentaire: "Démonter et restaurer depuis le snapshot" },
          { os: "linux", cmd: "sudo mount /dev/vg_data/lv_web /mnt/web && ls /mnt/web", commentaire: "Remonter et vérifier la restauration" }
        ],
        erreurs_courantes: [
          { symptome: "lvconvert --merge : origin volume not active", cause: "LV encore monté", solution: "sudo umount /mnt/web avant lvconvert" }
        ]
      }
    ],
    checklist: [
      "sudo pvs : /dev/sdb listé comme Physical Volume",
      "sudo vgs : vg_data avec ~10G de VFree",
      "df -h /mnt/web : LV monté et accessible",
      "/etc/fstab contient l'UUID pour montage automatique",
      "sudo lvs : lv_web de 8G après extension",
      "resize2fs exécuté — taille FS = 8G",
      "Snapshot créé, fichier supprimé, restauré avec lvconvert --merge"
    ],
    tags: ["lvm", "linux", "stockage", "volumes", "snapshot", "debian", "ubuntu", "systemes"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 33,
    titre: "Serveur DNS Bind9 — zone autoritaire et résolution récursive",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 90,
    description: "Installer et configurer Bind9 sur Debian comme serveur DNS autoritaire pour une zone locale (lab.local) et récursif pour Internet. Enregistrements A, CNAME, MX et PTR, tests avec dig et nslookup.",
    objectifs: [
      "Installer Bind9 et comprendre sa structure de configuration",
      "Créer une zone forward autoritaire pour lab.local",
      "Créer une zone reverse pour la résolution PTR",
      "Ajouter des enregistrements A, CNAME, MX",
      "Tester la résolution avec dig",
      "Configurer la résolution récursive vers les DNS publics"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 avec IP statique 192.168.1.10" },
      { type: "reseau", nom: "Réseau local 192.168.1.0/24" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation et options globales",
        contexte: "On installe Bind9 et on configure named.conf.options pour la récursion et les forwarders.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install bind9 bind9utils -y", commentaire: "Installer Bind9" },
          { os: "linux", cmd: "sudo systemctl status bind9", commentaire: "Vérifier que Bind9 est actif" },
          { os: "linux", cmd: "sudo nano /etc/bind/named.conf.options", commentaire: "Éditer les options globales" },
          { os: "linux", cmd: "# Dans options { ... } :\n# forwarders { 8.8.8.8; 1.1.1.1; };\n# allow-query { localhost; 192.168.1.0/24; };\n# recursion yes;\n# dnssec-validation auto;", commentaire: "Récursion + forwarders Google/Cloudflare" },
          { os: "linux", cmd: "sudo named-checkconf", commentaire: "Vérifier la syntaxe — aucune sortie = OK" }
        ],
        erreurs_courantes: [
          { symptome: "named-checkconf : syntax error", cause: "Point-virgule manquant ou accolade mal fermée", solution: "Chaque directive se termine par ; et chaque bloc {} doit être bien fermé" }
        ]
      },
      {
        titre: "Étape 2 — Déclarer les zones et créer les fichiers de zone",
        contexte: "On déclare la zone forward et reverse dans named.conf.local, puis on crée les fichiers avec les enregistrements.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/bind/named.conf.local", commentaire: "Déclarer les zones" },
          { os: "linux", cmd: "# Zone forward :\n# zone \"lab.local\" { type master; file \"/etc/bind/zones/db.lab.local\"; };\n# Zone reverse :\n# zone \"1.168.192.in-addr.arpa\" { type master; file \"/etc/bind/zones/db.192.168.1\"; };", commentaire: "Déclarer lab.local et sa zone reverse" },
          { os: "linux", cmd: "sudo mkdir -p /etc/bind/zones\nsudo cp /etc/bind/db.local /etc/bind/zones/db.lab.local", commentaire: "Créer le dossier zones et copier le template" },
          { os: "linux", cmd: "sudo nano /etc/bind/zones/db.lab.local", commentaire: "Éditer le fichier de zone forward" },
          { os: "linux", cmd: "# Contenu (remplacer le template) :\n# $TTL 604800\n# @ IN SOA ns1.lab.local. admin.lab.local. ( 2026062601 604800 86400 2419200 604800 )\n# @ IN NS ns1.lab.local.\n# ns1  IN A 192.168.1.10\n# srv1 IN A 192.168.1.20\n# www  IN CNAME srv1\n# @    IN MX 10 mail.lab.local.\n# mail IN A 192.168.1.30", commentaire: "Enregistrements SOA, NS, A, CNAME, MX" },
          { os: "linux", cmd: "sudo named-checkzone lab.local /etc/bind/zones/db.lab.local", commentaire: "Valider la syntaxe — doit afficher OK" }
        ],
        erreurs_courantes: [
          { symptome: "missing . at end of name", cause: "Les FQDN doivent se terminer par un point", solution: "Ajouter un point final aux noms absolus : ns1.lab.local. (avec le point)" }
        ]
      },
      {
        titre: "Étape 3 — Zone reverse et tests",
        contexte: "On crée la zone PTR pour la résolution inverse, puis on teste avec dig.",
        commandes: [
          { os: "linux", cmd: "sudo cp /etc/bind/db.127 /etc/bind/zones/db.192.168.1\nsudo nano /etc/bind/zones/db.192.168.1", commentaire: "Créer la zone reverse depuis le template" },
          { os: "linux", cmd: "# Ajouter après les lignes NS :\n# 10 IN PTR ns1.lab.local.\n# 20 IN PTR srv1.lab.local.", commentaire: "Enregistrements PTR (dernier octet = numéro)" },
          { os: "linux", cmd: "sudo named-checkzone 1.168.192.in-addr.arpa /etc/bind/zones/db.192.168.1 && sudo systemctl reload bind9", commentaire: "Valider et recharger Bind9" },
          { os: "linux", cmd: "dig @192.168.1.10 srv1.lab.local", commentaire: "Test résolution A — doit retourner 192.168.1.20" },
          { os: "linux", cmd: "dig @192.168.1.10 -x 192.168.1.20", commentaire: "Test PTR — doit retourner srv1.lab.local." },
          { os: "linux", cmd: "dig @192.168.1.10 google.com", commentaire: "Test récursion externe — doit fonctionner via forwarders" }
        ],
        erreurs_courantes: [
          { symptome: "dig retourne SERVFAIL", cause: "Bind9 n'écoute pas ou port 53 bloqué", solution: "ss -ulnp | grep 53 pour vérifier. sudo ufw allow 53 si nécessaire." }
        ]
      }
    ],
    checklist: [
      "sudo named-checkconf : aucune erreur",
      "named-checkzone lab.local : OK",
      "named-checkzone 1.168.192.in-addr.arpa : OK",
      "dig @192.168.1.10 srv1.lab.local retourne 192.168.1.20",
      "dig @192.168.1.10 -x 192.168.1.20 retourne srv1.lab.local.",
      "dig @192.168.1.10 google.com retourne une réponse (récursion OK)"
    ],
    tags: ["dns", "bind9", "linux", "zone", "ptr", "cname", "mx", "dig", "debian"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 34,
    titre: "Windows Server — Active Directory, OU, utilisateurs et GPO",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 120,
    description: "Installer le rôle AD DS sur Windows Server 2022, promouvoir le serveur en contrôleur de domaine, créer des OU, des comptes utilisateurs et groupes, joindre un poste client, puis appliquer des GPO.",
    objectifs: [
      "Installer le rôle AD DS sur Windows Server 2022",
      "Promouvoir le serveur en DC pour le domaine lab.local",
      "Créer des Unités Organisationnelles hiérarchiques",
      "Créer des comptes utilisateurs et groupes",
      "Joindre un poste Windows 10/11 au domaine",
      "Créer et appliquer une GPO de restriction"
    ],
    prerequis: [
      { type: "vm", nom: "VM Windows Server 2022 (2 vCPU, 4 Go RAM, IP statique 192.168.1.10)" },
      { type: "vm", nom: "VM Windows 10/11 cliente" },
      { type: "reseau", nom: "Les deux VMs dans le même réseau 192.168.1.0/24" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Préparer le serveur et installer AD DS",
        contexte: "On fixe l'IP statique, renomme le serveur en DC01, puis on installe le rôle AD DS.",
        commandes: [
          { os: "windows", cmd: "# Panneau de configuration > IPv4 : IP 192.168.1.10, Masque 255.255.255.0\n# DNS préféré : 127.0.0.1 (lui-même après promotion)", commentaire: "Configurer l'IP statique" },
          { os: "windows", cmd: "Rename-Computer -NewName 'DC01' -Restart", commentaire: "Renommer en DC01 et redémarrer" },
          { os: "windows", cmd: "Install-WindowsFeature AD-Domain-Services -IncludeManagementTools", commentaire: "Installer le rôle AD DS et les outils RSAT" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Promouvoir en contrôleur de domaine",
        contexte: "On crée la forêt Active Directory lab.local. Cette opération installe aussi le rôle DNS intégré.",
        commandes: [
          { os: "windows", cmd: "Install-ADDSForest -DomainName 'lab.local' -DomainNetbiosName 'LAB' -InstallDns -SafeModeAdministratorPassword (ConvertTo-SecureString 'P@ssw0rd123!' -AsPlainText -Force) -Force", commentaire: "Créer la forêt lab.local — redémarre automatiquement" }
        ],
        erreurs_courantes: [
          { symptome: "Forest Functional Level not compatible", cause: "Version non supportée pour le niveau fonctionnel demandé", solution: "Ajouter -ForestMode Win2012R2 à la commande" }
        ]
      },
      {
        titre: "Étape 3 — Créer OU, utilisateurs et groupes",
        contexte: "On structure l'AD avec 3 OU, crée un utilisateur et un groupe de sécurité.",
        commandes: [
          { os: "windows", cmd: "New-ADOrganizationalUnit -Name 'Informatique' -Path 'DC=lab,DC=local'\nNew-ADOrganizationalUnit -Name 'Direction' -Path 'DC=lab,DC=local'\nNew-ADOrganizationalUnit -Name 'Commerciaux' -Path 'DC=lab,DC=local'", commentaire: "Créer trois OU à la racine du domaine" },
          { os: "windows", cmd: "New-ADUser -Name 'Alice Martin' -SamAccountName 'amartin' -UserPrincipalName 'amartin@lab.local' -Path 'OU=Informatique,DC=lab,DC=local' -AccountPassword (ConvertTo-SecureString 'P@ssw0rd123!' -AsPlainText -Force) -Enabled $true", commentaire: "Créer un utilisateur dans l'OU Informatique" },
          { os: "windows", cmd: "New-ADGroup -Name 'GRP_Informatique' -GroupScope Global -Path 'OU=Informatique,DC=lab,DC=local'\nAdd-ADGroupMember -Identity 'GRP_Informatique' -Members 'amartin'", commentaire: "Créer un groupe et y ajouter l'utilisateur" }
        ],
        erreurs_courantes: [
          { symptome: "New-ADUser : The server is not operational", cause: "Services AD pas encore démarrés après reboot", solution: "Attendre 2 minutes que tous les services AD soient opérationnels" }
        ]
      },
      {
        titre: "Étape 4 — Joindre le client et créer une GPO",
        contexte: "On joint le poste Windows au domaine, puis on crée une GPO de restriction via gpmc.msc.",
        commandes: [
          { os: "windows", cmd: "# Sur le client : DNS préféré = 192.168.1.10\nAdd-Computer -DomainName 'lab.local' -Credential (Get-Credential) -Restart", commentaire: "Joindre le client au domaine" },
          { os: "windows", cmd: "# Sur DC01 : gpmc.msc > OU Commerciaux > Créer et lier GPO\n# Nom : Restriction_Panneau\n# Config utilisateur > Modèles d'admin > Panneau de config\n# Interdire l'accès > Activé > OK", commentaire: "Créer la GPO de restriction" },
          { os: "windows", cmd: "gpupdate /force && gpresult /r", commentaire: "Appliquer les GPO et vérifier" }
        ],
        erreurs_courantes: [
          { symptome: "Domaine lab.local introuvable", cause: "DNS client ne pointe pas vers DC01", solution: "Vérifier DNS préféré = 192.168.1.10 et tester ping dc01.lab.local" }
        ]
      }
    ],
    checklist: [
      "Get-ADDomain retourne lab.local sans erreur",
      "Trois OU créées : Informatique, Direction, Commerciaux",
      "Utilisateur amartin membre de GRP_Informatique",
      "Poste client visible dans Computers de l'AD",
      "Connexion LAB\\\\amartin fonctionne sur le client",
      "GPO Restriction_Panneau visible dans gpresult /r"
    ],
    tags: ["active-directory", "windows-server", "gpo", "ad-ds", "domaine", "ou", "windows"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 40,
    titre: "Stack LEMP — Nginx + PHP-FPM + MariaDB sur Debian",
    categorie: "systemes",
    niveau: "débutant",
    duree: 75,
    description: "Installer une stack LEMP complète sur Debian : Nginx, MariaDB, PHP-FPM. Configurer un Virtual Host, créer une base de données et déployer une page PHP dynamique.",
    objectifs: [
      "Installer Nginx et comprendre la structure de configuration",
      "Installer et sécuriser MariaDB",
      "Installer PHP-FPM et le connecter à Nginx",
      "Configurer un Virtual Host pour un domaine local",
      "Créer une base de données et un utilisateur MariaDB",
      "Déployer une page PHP qui requête MariaDB"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 avec accès Internet" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer Nginx et MariaDB",
        contexte: "On installe les deux composants principaux et on sécurise MariaDB.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install nginx -y\nsudo systemctl enable --now nginx\ncurl http://localhost", commentaire: "Installer et vérifier Nginx" },
          { os: "linux", cmd: "sudo apt install mariadb-server -y\nsudo systemctl enable --now mariadb\nsudo mysql_secure_installation", commentaire: "Installer MariaDB et sécuriser" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Installer PHP-FPM et configurer le Virtual Host",
        contexte: "PHP-FPM gère les processus PHP séparément de Nginx. On configure un Virtual Host pour monsite.local.",
        commandes: [
          { os: "linux", cmd: "sudo apt install php-fpm php-mysql -y\nsudo systemctl status php8.2-fpm", commentaire: "Installer PHP-FPM et le module MySQL" },
          { os: "linux", cmd: "sudo mkdir -p /var/www/monsite && sudo chown www-data:www-data /var/www/monsite", commentaire: "Créer le répertoire du site" },
          { os: "linux", cmd: "sudo nano /etc/nginx/sites-available/monsite", commentaire: "Créer le Virtual Host" },
          { os: "linux", cmd: "# Contenu :\n# server {\n#   listen 80;\n#   server_name monsite.local;\n#   root /var/www/monsite;\n#   index index.php;\n#   location / { try_files $uri $uri/ =404; }\n#   location ~ \\.php$ {\n#     include snippets/fastcgi-php.conf;\n#     fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;\n#   }\n# }", commentaire: "Configuration Nginx avec PHP-FPM" },
          { os: "linux", cmd: "sudo ln -s /etc/nginx/sites-available/monsite /etc/nginx/sites-enabled/\nsudo nginx -t && sudo systemctl reload nginx", commentaire: "Activer le VHost et recharger" }
        ],
        erreurs_courantes: [
          { symptome: "502 Bad Gateway", cause: "PHP-FPM pas démarré ou socket incorrect", solution: "ls /var/run/php/php*.sock et adapter le chemin dans la config Nginx" }
        ]
      },
      {
        titre: "Étape 3 — Base de données et page PHP",
        contexte: "On crée la BDD et l'utilisateur MariaDB, puis une page PHP qui affiche l'heure depuis la base.",
        commandes: [
          { os: "linux", cmd: "sudo mysql -u root -p -e \"CREATE DATABASE monsite_db; CREATE USER 'monsite_user'@'localhost' IDENTIFIED BY 'P@ssw0rd'; GRANT ALL ON monsite_db.* TO 'monsite_user'@'localhost'; FLUSH PRIVILEGES;\"", commentaire: "Créer BDD, utilisateur et droits" },
          { os: "linux", cmd: "sudo tee /var/www/monsite/index.php << 'EOF'\n<?php\n$pdo = new PDO('mysql:host=localhost;dbname=monsite_db','monsite_user','P@ssw0rd');\n$row = $pdo->query('SELECT NOW() as d')->fetch();\necho '<h1>LEMP OK</h1><p>' . $row['d'] . '</p>';\nEOF", commentaire: "Créer la page PHP qui requête MariaDB" },
          { os: "linux", cmd: "curl http://localhost -H 'Host: monsite.local'", commentaire: "Tester — doit afficher l'heure depuis MariaDB" }
        ],
        erreurs_courantes: [
          { symptome: "PHP affiche le code source", cause: "Bloc location .php absent dans le VHost", solution: "Vérifier la section fastcgi_pass et relancer nginx -t" }
        ]
      }
    ],
    checklist: [
      "curl http://localhost retourne la page Nginx par défaut",
      "systemctl status mariadb : active",
      "systemctl status php8.2-fpm : active",
      "nginx -t : syntax is ok",
      "curl -H Host: monsite.local http://localhost affiche l'heure MariaDB"
    ],
    tags: ["nginx", "php-fpm", "mariadb", "lemp", "linux", "web", "debian"],
    date_ajout: "2026-06-26",
    source: "École"
  }
,

  {
    id: 47,
    titre: "Cron & logrotate — planification de tâches et rotation des logs",
    categorie: "systemes",
    niveau: "débutant",
    duree: 45,
    description: "Maîtriser la planification de tâches récurrentes avec cron et crontab, et configurer logrotate pour gérer automatiquement la rotation et la compression des fichiers de logs. Deux outils indispensables pour l'administration quotidienne d'un serveur Linux.",
    objectifs: [
      "Comprendre la syntaxe crontab (minute heure jour mois jour_semaine)",
      "Créer des tâches planifiées utilisateur et système",
      "Vérifier l'exécution des tâches via les logs",
      "Configurer logrotate pour un fichier de log applicatif",
      "Forcer une rotation manuelle et vérifier les archives"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Syntaxe crontab et premières tâches",
        contexte: "La syntaxe crontab est : minute heure jour_du_mois mois jour_de_semaine commande. Les valeurs spéciales : * (tout), */n (tous les n), 1-5 (plage), 1,3,5 (liste).",
        commandes: [
          { os: "linux", cmd: "crontab -e", commentaire: "Éditer la crontab de l'utilisateur courant" },
          { os: "linux", cmd: "# Exemples de tâches :\n# */5 * * * * echo $(date) >> /tmp/cron_test.log\n# 0 2 * * * /usr/local/bin/backup.sh\n# 30 8 * * 1-5 /usr/local/bin/rapport.sh\n# @reboot /usr/local/bin/startup.sh", commentaire: "Toutes les 5 min / chaque jour 2h / lun-ven 8h30 / au démarrage" },
          { os: "linux", cmd: "crontab -l", commentaire: "Lister les tâches cron de l'utilisateur courant" },
          { os: "linux", cmd: "# Crontab système (root) :\nsudo nano /etc/cron.d/mon-service", commentaire: "Les crons système ont un champ utilisateur supplémentaire" }
        ],
        erreurs_courantes: [
          { symptome: "La tâche cron ne s'exécute pas", cause: "Chemin relatif dans la commande — cron n'a pas le PATH utilisateur", solution: "Toujours utiliser des chemins absolus dans crontab. Ajouter PATH=/usr/bin:/usr/local/bin en tête de crontab si nécessaire." }
        ]
      },
      {
        titre: "Étape 2 — Vérifier l'exécution des tâches cron",
        contexte: "Les erreurs cron sont loguées dans syslog ou dans un fichier dédié. On peut aussi rediriger la sortie de chaque tâche vers un fichier log.",
        commandes: [
          { os: "linux", cmd: "grep CRON /var/log/syslog | tail -20", commentaire: "Voir les dernières exécutions cron dans syslog" },
          { os: "linux", cmd: "sudo journalctl -u cron -f", commentaire: "Suivre les logs cron en temps réel (systemd)" },
          { os: "linux", cmd: "# Dans crontab, rediriger stdout et stderr :\n# */5 * * * * /mon/script.sh >> /var/log/mon-script.log 2>&1", commentaire: "Capturer toute la sortie de la tâche dans un log" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Configurer logrotate",
        contexte: "logrotate tourne quotidiennement via cron et lit les configs dans /etc/logrotate.d/. On crée une config pour un log applicatif fictif.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/logrotate.d/mon-app", commentaire: "Créer une configuration logrotate" },
          { os: "linux", cmd: "# Contenu de /etc/logrotate.d/mon-app :\n# /var/log/mon-app.log {\n#   daily\n#   rotate 7\n#   compress\n#   delaycompress\n#   missingok\n#   notifempty\n#   create 0644 www-data www-data\n#   postrotate\n#     systemctl reload mon-app 2>/dev/null || true\n#   endscript\n# }", commentaire: "Rotation quotidienne, 7 archives, compression gzip" },
          { os: "linux", cmd: "sudo logrotate -d /etc/logrotate.d/mon-app", commentaire: "Mode debug — simule la rotation sans l'effectuer" },
          { os: "linux", cmd: "echo 'ligne de test' | sudo tee -a /var/log/mon-app.log\nsudo logrotate -f /etc/logrotate.d/mon-app", commentaire: "Créer le log et forcer la rotation" },
          { os: "linux", cmd: "ls -lh /var/log/mon-app*", commentaire: "Vérifier les archives créées (.log.1.gz)" }
        ],
        erreurs_courantes: [
          { symptome: "logrotate : error: skipping because not root", cause: "logrotate doit être exécuté en root pour les logs système", solution: "Utiliser sudo logrotate -f /etc/logrotate.d/mon-app" }
        ]
      }
    ],
    checklist: [
      "crontab -l affiche les tâches configurées",
      "Tâche */5 * * * * visible et exécutée — /tmp/cron_test.log alimenté",
      "grep CRON /var/log/syslog confirme les exécutions",
      "Config /etc/logrotate.d/mon-app créée sans erreur (logrotate -d)",
      "logrotate -f crée /var/log/mon-app.log.1.gz"
    ],
    tags: ["cron", "crontab", "logrotate", "logs", "planification", "linux", "administration"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 48,
    titre: "Serveur DHCP ISC sur Debian — installation et configuration",
    categorie: "systemes",
    niveau: "débutant",
    duree: 60,
    description: "Installer et configurer isc-dhcp-server sur Debian pour distribuer des adresses IP dynamiques sur un réseau local. Configuration d'un pool, de baux statiques par adresse MAC, et vérification depuis un client.",
    objectifs: [
      "Installer isc-dhcp-server sur Debian",
      "Configurer un pool DHCP pour le réseau 192.168.1.0/24",
      "Définir les options DNS, passerelle et durée de bail",
      "Créer un bail statique (réservation MAC)",
      "Vérifier les baux depuis le serveur et le client"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 serveur avec IP statique 192.168.1.1" },
      { type: "vm", nom: "VM cliente Linux ou Windows sur le même réseau" },
      { type: "reseau", nom: "Réseau 192.168.1.0/24 — interface eth0 ou ens33" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer et identifier l'interface",
        contexte: "On installe isc-dhcp-server et on identifie l'interface réseau sur laquelle le serveur va écouter.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install isc-dhcp-server -y", commentaire: "Installer le serveur DHCP ISC" },
          { os: "linux", cmd: "ip a", commentaire: "Identifier le nom de l'interface réseau (ex: ens33, eth0, enp0s3)" },
          { os: "linux", cmd: "sudo nano /etc/default/isc-dhcp-server", commentaire: "Déclarer l'interface d'écoute" },
          { os: "linux", cmd: "# Modifier la ligne INTERFACESv4 :\n# INTERFACESv4=\"ens33\"", commentaire: "Remplacer ens33 par le nom réel de l'interface" }
        ],
        erreurs_courantes: [
          { symptome: "isc-dhcp-server failed to start", cause: "Interface non définie dans /etc/default/isc-dhcp-server", solution: "Vérifier que INTERFACESv4 contient le bon nom d'interface (ip a pour trouver le nom)" }
        ]
      },
      {
        titre: "Étape 2 — Configurer le pool DHCP",
        contexte: "La configuration principale est dans /etc/dhcp/dhcpd.conf. On définit le subnet, le pool d'adresses, la passerelle et les DNS.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/dhcp/dhcpd.conf", commentaire: "Éditer la configuration DHCP principale" },
          { os: "linux", cmd: "# Contenu minimal :\n# default-lease-time 600;\n# max-lease-time 7200;\n# authoritative;\n# subnet 192.168.1.0 netmask 255.255.255.0 {\n#   range 192.168.1.100 192.168.1.200;\n#   option routers 192.168.1.1;\n#   option domain-name-servers 8.8.8.8, 1.1.1.1;\n#   option domain-name \"lab.local\";\n# }", commentaire: "Pool de 192.168.1.100 à .200, bail 10min/2h" },
          { os: "linux", cmd: "sudo systemctl restart isc-dhcp-server\nsudo systemctl status isc-dhcp-server", commentaire: "Démarrer le service et vérifier le statut" }
        ],
        erreurs_courantes: [
          { symptome: "dhcpd: No subnet declaration for ens33", cause: "Le subnet configuré ne correspond pas à l'IP de l'interface", solution: "L'IP statique du serveur (192.168.1.1) doit être dans le subnet déclaré (192.168.1.0/24)" }
        ]
      },
      {
        titre: "Étape 3 — Réservation statique par adresse MAC",
        contexte: "On peut attribuer une IP fixe à une machine spécifique en associant son adresse MAC à une IP dans dhcpd.conf. La machine recevra toujours la même IP.",
        commandes: [
          { os: "linux", cmd: "# Récupérer l'adresse MAC de la VM cliente :\nip a | grep ether", commentaire: "Afficher l'adresse MAC de l'interface réseau" },
          { os: "linux", cmd: "# Ajouter dans dhcpd.conf :\n# host client-fixe {\n#   hardware ethernet AA:BB:CC:DD:EE:FF;\n#   fixed-address 192.168.1.50;\n# }", commentaire: "Réservation statique — remplacer la MAC par celle du client" },
          { os: "linux", cmd: "sudo systemctl restart isc-dhcp-server", commentaire: "Redémarrer pour appliquer la réservation" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Vérifier les baux depuis le serveur",
        contexte: "isc-dhcp-server enregistre tous les baux actifs dans /var/lib/dhcp/dhcpd.leases. On peut aussi surveiller en temps réel.",
        commandes: [
          { os: "linux", cmd: "cat /var/lib/dhcp/dhcpd.leases", commentaire: "Afficher tous les baux DHCP actifs" },
          { os: "linux", cmd: "sudo journalctl -u isc-dhcp-server -f", commentaire: "Suivre les attributions DHCP en temps réel" },
          { os: "linux", cmd: "# Sur le client Linux — renouveler le bail :\nsudo dhclient -r ens33 && sudo dhclient ens33\nip a show ens33", commentaire: "Forcer le renouvellement du bail DHCP côté client" }
        ],
        erreurs_courantes: [
          { symptome: "Client n'obtient pas d'IP", cause: "Le serveur DHCP n'écoute pas sur la bonne interface ou pare-feu bloque UDP 67/68", solution: "Vérifier sudo ufw allow 67/udp && sudo ufw allow 68/udp. Tester avec tcpdump -i ens33 port 67" }
        ]
      }
    ],
    checklist: [
      "isc-dhcp-server actif : systemctl status isc-dhcp-server",
      "INTERFACESv4 contient le bon nom d'interface",
      "Pool 192.168.1.100-200 déclaré dans dhcpd.conf",
      "Client reçoit une IP dans le pool attendu",
      "Réservation MAC fonctionne — client fixe obtient 192.168.1.50",
      "dhcpd.leases liste les baux actifs"
    ],
    tags: ["dhcp", "isc-dhcp-server", "linux", "debian", "reseau", "bail", "reservation-mac"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 49,
    titre: "NFS & Samba — partage de fichiers Linux et Windows",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 75,
    description: "Configurer deux types de partages de fichiers : NFS pour les clients Linux (montage transparent) et Samba pour les clients Windows (protocole SMB). Gestion des permissions et montage automatique via /etc/fstab.",
    objectifs: [
      "Installer et configurer un partage NFS sur Debian",
      "Monter le partage NFS depuis un client Linux",
      "Installer Samba et créer un partage accessible depuis Windows",
      "Créer un utilisateur Samba et tester depuis un client Windows",
      "Automatiser les montages via /etc/fstab"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 serveur (IP 192.168.1.10)" },
      { type: "vm", nom: "VM cliente Linux pour NFS" },
      { type: "vm", nom: "VM cliente Windows 10/11 pour Samba" },
      { type: "reseau", nom: "Les VMs dans le même réseau 192.168.1.0/24" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Configurer le serveur NFS",
        contexte: "NFS (Network File System) permet de partager des répertoires entre machines Linux de manière transparente. On installe le serveur et on déclare les exports.",
        commandes: [
          { os: "linux", cmd: "sudo apt install nfs-kernel-server -y", commentaire: "Installer le serveur NFS" },
          { os: "linux", cmd: "sudo mkdir -p /srv/nfs/partage\nsudo chown nobody:nogroup /srv/nfs/partage\nsudo chmod 777 /srv/nfs/partage", commentaire: "Créer le répertoire à partager" },
          { os: "linux", cmd: "sudo nano /etc/exports", commentaire: "Déclarer les exports NFS" },
          { os: "linux", cmd: "# Ajouter dans /etc/exports :\n# /srv/nfs/partage 192.168.1.0/24(rw,sync,no_subtree_check,no_root_squash)", commentaire: "Partager avec le réseau local en lecture/écriture" },
          { os: "linux", cmd: "sudo exportfs -ra\nsudo systemctl restart nfs-kernel-server\nsudo exportfs -v", commentaire: "Appliquer les exports et vérifier" }
        ],
        erreurs_courantes: [
          { symptome: "mount.nfs: access denied by server", cause: "L'IP du client n'est pas dans la plage autorisée dans /etc/exports", solution: "Vérifier que l'IP du client est dans 192.168.1.0/24 et relancer exportfs -ra" }
        ]
      },
      {
        titre: "Étape 2 — Monter le partage NFS côté client",
        contexte: "Sur le client Linux, on installe les outils NFS client et on monte le partage manuellement puis en automatique via fstab.",
        commandes: [
          { os: "linux", cmd: "sudo apt install nfs-common -y", commentaire: "Installer les outils client NFS" },
          { os: "linux", cmd: "sudo mkdir -p /mnt/nfs\nsudo mount 192.168.1.10:/srv/nfs/partage /mnt/nfs", commentaire: "Monter le partage NFS manuellement" },
          { os: "linux", cmd: "df -h /mnt/nfs\nls /mnt/nfs", commentaire: "Vérifier le montage" },
          { os: "linux", cmd: "# Montage automatique dans /etc/fstab :\n# 192.168.1.10:/srv/nfs/partage /mnt/nfs nfs defaults,_netdev 0 0", commentaire: "Ajouter dans fstab pour montage au démarrage (_netdev = attendre le réseau)" }
        ],
        erreurs_courantes: [
          { symptome: "mount.nfs: Connection timed out", cause: "Pare-feu serveur bloque les ports NFS (2049/tcp, 111/tcp)", solution: "sudo ufw allow from 192.168.1.0/24 to any port 2049 && sudo ufw allow 111" }
        ]
      },
      {
        titre: "Étape 3 — Installer et configurer Samba",
        contexte: "Samba implémente le protocole SMB/CIFS pour partager des fichiers avec les clients Windows. On crée un partage public et un partage authentifié.",
        commandes: [
          { os: "linux", cmd: "sudo apt install samba -y", commentaire: "Installer Samba" },
          { os: "linux", cmd: "sudo mkdir -p /srv/samba/public\nsudo chmod 777 /srv/samba/public", commentaire: "Créer le répertoire de partage public" },
          { os: "linux", cmd: "sudo nano /etc/samba/smb.conf", commentaire: "Éditer la configuration Samba" },
          { os: "linux", cmd: "# Ajouter à la fin de smb.conf :\n# [Public]\n#   path = /srv/samba/public\n#   browsable = yes\n#   writable = yes\n#   guest ok = yes\n#   read only = no", commentaire: "Partage public sans authentification" },
          { os: "linux", cmd: "sudo testparm", commentaire: "Vérifier la syntaxe de smb.conf — doit afficher Loaded services file OK" },
          { os: "linux", cmd: "sudo systemctl restart smbd nmbd", commentaire: "Redémarrer les services Samba" }
        ],
        erreurs_courantes: [
          { symptome: "testparm : Unknown parameter encountered", cause: "Faute de frappe dans un paramètre smb.conf", solution: "Corriger le paramètre incorrect — testparm indique la ligne en erreur" }
        ]
      },
      {
        titre: "Étape 4 — Créer un utilisateur Samba et tester",
        contexte: "Pour un partage authentifié, on crée un utilisateur Linux et on lui attribue un mot de passe Samba séparé. On teste depuis Windows.",
        commandes: [
          { os: "linux", cmd: "sudo useradd -M -s /sbin/nologin sambauser\nsudo smbpasswd -a sambauser", commentaire: "Créer l'utilisateur Linux et définir son mot de passe Samba" },
          { os: "linux", cmd: "# Ajouter un partage authentifié dans smb.conf :\n# [Prive]\n#   path = /srv/samba/prive\n#   valid users = sambauser\n#   writable = yes\n#   browsable = yes", commentaire: "Partage accessible uniquement par sambauser" },
          { os: "linux", cmd: "sudo mkdir -p /srv/samba/prive\nsudo chown sambauser:sambauser /srv/samba/prive\nsudo systemctl restart smbd", commentaire: "Créer le dossier et redémarrer" },
          { os: "windows", cmd: "# Sur le client Windows :\n# Explorateur > \\\\192.168.1.10\\Public\n# Ou via cmd : net use Z: \\\\192.168.1.10\\Prive /user:sambauser motdepasse", commentaire: "Accéder au partage depuis Windows" }
        ],
        erreurs_courantes: [
          { symptome: "Windows ne trouve pas le partage réseau", cause: "Le pare-feu Linux bloque SMB (ports 139/445)", solution: "sudo ufw allow samba — ouvre les ports Samba nécessaires" }
        ]
      }
    ],
    checklist: [
      "exportfs -v liste le partage NFS /srv/nfs/partage",
      "Montage NFS sur le client : df -h /mnt/nfs affiche le partage",
      "testparm : Loaded services file OK",
      "Partage Public accessible depuis Windows sans mot de passe",
      "Utilisateur sambauser créé avec smbpasswd",
      "Partage Prive accessible avec les credentials sambauser"
    ],
    tags: ["nfs", "samba", "smb", "partage-fichiers", "linux", "windows", "debian", "fstab"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 50,
    titre: "Gestion des utilisateurs Linux — sudo, groupes, ACL et umask",
    categorie: "systemes",
    niveau: "débutant",
    duree: 60,
    description: "Maîtriser la gestion des comptes utilisateurs sous Linux : création, modification, groupes, élévation de privilèges sudo, permissions avancées avec les ACL (Access Control Lists) et configuration du umask.",
    objectifs: [
      "Créer et gérer des comptes utilisateurs avec useradd/usermod",
      "Configurer sudo pour déléguer des privilèges précis",
      "Gérer les groupes et l'appartenance",
      "Appliquer des ACL pour des permissions fines",
      "Comprendre et configurer le umask"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer et gérer les utilisateurs",
        contexte: "useradd crée un utilisateur, usermod le modifie, userdel le supprime. passwd gère les mots de passe. Les informations sont stockées dans /etc/passwd, /etc/shadow et /etc/group.",
        commandes: [
          { os: "linux", cmd: "sudo useradd -m -s /bin/bash -c 'Alice Martin' alice", commentaire: "-m crée le home, -s définit le shell, -c ajoute un commentaire" },
          { os: "linux", cmd: "sudo passwd alice", commentaire: "Définir le mot de passe d'alice" },
          { os: "linux", cmd: "sudo usermod -aG sudo alice", commentaire: "Ajouter alice au groupe sudo (-a = append, ne pas oublier !)" },
          { os: "linux", cmd: "id alice", commentaire: "Vérifier les groupes de l'utilisateur" },
          { os: "linux", cmd: "sudo userdel -r alice", commentaire: "-r supprime aussi le répertoire home et le spool mail" }
        ],
        erreurs_courantes: [
          { symptome: "usermod -G sans -a écrase tous les groupes", cause: "Sans l'option -a (append), -G remplace la liste de groupes", solution: "Toujours utiliser usermod -aG pour ajouter un groupe sans supprimer les autres" }
        ]
      },
      {
        titre: "Étape 2 — Configurer sudo avec visudo",
        contexte: "Le fichier /etc/sudoers contrôle qui peut exécuter quoi en tant que root. On édite TOUJOURS avec visudo (vérifie la syntaxe avant d'enregistrer).",
        commandes: [
          { os: "linux", cmd: "sudo visudo", commentaire: "Éditer /etc/sudoers de manière sécurisée" },
          { os: "linux", cmd: "# Exemples de règles sudoers :\n# alice ALL=(ALL:ALL) ALL\n# bob ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx\n# %webmasters ALL=(ALL) /usr/bin/systemctl reload apache2", commentaire: "Accès total / commande sans mot de passe / groupe avec commande spécifique" },
          { os: "linux", cmd: "sudo nano /etc/sudoers.d/alice", commentaire: "Mieux : créer un fichier séparé dans sudoers.d/ pour chaque utilisateur" },
          { os: "linux", cmd: "sudo -l -U alice", commentaire: "Lister les droits sudo d'un utilisateur" }
        ],
        erreurs_courantes: [
          { symptome: "sudo: /etc/sudoers is world writable", cause: "Permissions incorrectes sur sudoers", solution: "sudo chmod 440 /etc/sudoers — ne jamais modifier sudoers sans visudo" }
        ]
      },
      {
        titre: "Étape 3 — Gestion des groupes",
        contexte: "Les groupes permettent de partager des ressources entre plusieurs utilisateurs. Un groupe propriétaire sur un répertoire + permissions g+rw suffit souvent.",
        commandes: [
          { os: "linux", cmd: "sudo groupadd webteam", commentaire: "Créer un nouveau groupe" },
          { os: "linux", cmd: "sudo usermod -aG webteam alice\nsudo usermod -aG webteam bob", commentaire: "Ajouter deux utilisateurs au groupe" },
          { os: "linux", cmd: "sudo mkdir /srv/webteam\nsudo chown root:webteam /srv/webteam\nsudo chmod 2775 /srv/webteam", commentaire: "Dossier partagé avec SGID (2775) — nouveaux fichiers héritent du groupe" },
          { os: "linux", cmd: "getent group webteam", commentaire: "Lister les membres du groupe" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — ACL (Access Control Lists)",
        contexte: "Les ACL permettent des permissions plus fines que le modèle owner/group/other. On peut donner des droits à un utilisateur spécifique sans changer le propriétaire.",
        commandes: [
          { os: "linux", cmd: "sudo apt install acl -y\nsudo mount -o remount,acl /", commentaire: "Installer acl et s'assurer que la partition supporte les ACL" },
          { os: "linux", cmd: "sudo setfacl -m u:alice:rw /srv/webteam/fichier.txt", commentaire: "Donner les droits rw à alice sur un fichier spécifique" },
          { os: "linux", cmd: "sudo setfacl -m g:webteam:rx /srv/webteam", commentaire: "Donner rx au groupe webteam sur le dossier" },
          { os: "linux", cmd: "getfacl /srv/webteam/fichier.txt", commentaire: "Afficher les ACL d'un fichier — le + dans ls -l indique des ACL présentes" },
          { os: "linux", cmd: "sudo setfacl -x u:alice /srv/webteam/fichier.txt", commentaire: "Supprimer l'ACL d'alice" }
        ],
        erreurs_courantes: [
          { symptome: "setfacl: /srv/webteam: Operation not supported", cause: "La partition n'est pas montée avec l'option acl", solution: "Ajouter acl dans /etc/fstab pour la partition concernée et remount" }
        ]
      },
      {
        titre: "Étape 5 — Umask",
        contexte: "Le umask définit les permissions par défaut des nouveaux fichiers et répertoires. La valeur standard 022 donne 644 pour les fichiers et 755 pour les répertoires.",
        commandes: [
          { os: "linux", cmd: "umask", commentaire: "Afficher le umask courant (généralement 0022)" },
          { os: "linux", cmd: "# Calcul :\n# Fichier max = 666 - umask = 666 - 022 = 644 (rw-r--r--)\n# Dossier max = 777 - umask = 777 - 022 = 755 (rwxr-xr-x)", commentaire: "umask 022 : fichiers en 644, dossiers en 755" },
          { os: "linux", cmd: "umask 027\ntouch /tmp/test_umask && ls -l /tmp/test_umask", commentaire: "Changer umask à 027 (fichiers = 640, dossiers = 750)" },
          { os: "linux", cmd: "# Pour rendre permanent (utilisateur) :\necho 'umask 027' >> ~/.bashrc", commentaire: "Ajouter dans .bashrc pour persistance" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Utilisateur alice créé avec home et shell bash",
      "alice ajoutée au groupe sudo avec -aG",
      "sudo -l -U alice liste ses droits sudo",
      "Groupe webteam créé avec alice et bob membres",
      "Dossier /srv/webteam avec SGID 2775 fonctionnel",
      "getfacl montre les ACL appliquées",
      "umask 027 appliqué — nouveaux fichiers en 640"
    ],
    tags: ["useradd", "sudo", "groupes", "acl", "umask", "permissions", "linux", "administration"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 51,
    titre: "Systemd — services, timers et journalctl",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Maîtriser systemd pour gérer les services Linux : créer un service personnalisé, comprendre les états et dépendances, créer un timer systemd (alternative à cron), et exploiter journalctl pour analyser les logs.",
    objectifs: [
      "Comprendre la structure d'un fichier .service systemd",
      "Créer et activer un service personnalisé",
      "Gérer les dépendances entre services",
      "Créer un timer systemd pour remplacer un cron",
      "Exploiter journalctl pour filtrer et analyser les logs"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Gérer les services avec systemctl",
        contexte: "systemctl est la commande principale pour interagir avec systemd. On commence par les opérations courantes sur les services.",
        commandes: [
          { os: "linux", cmd: "systemctl status nginx", commentaire: "Voir l'état complet d'un service" },
          { os: "linux", cmd: "sudo systemctl start|stop|restart|reload nginx", commentaire: "Démarrer / arrêter / redémarrer / recharger" },
          { os: "linux", cmd: "sudo systemctl enable|disable nginx", commentaire: "Activer/désactiver le démarrage automatique" },
          { os: "linux", cmd: "systemctl list-units --type=service --state=running", commentaire: "Lister tous les services en cours d'exécution" },
          { os: "linux", cmd: "systemctl list-units --type=service --state=failed", commentaire: "Lister les services en échec" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Créer un service personnalisé",
        contexte: "Un fichier .service décrit comment systemd doit démarrer, arrêter et surveiller un processus. On crée un service minimal qui exécute un script.",
        commandes: [
          { os: "linux", cmd: "sudo nano /usr/local/bin/mon-script.sh", commentaire: "Créer le script à exécuter par le service" },
          { os: "linux", cmd: "# Contenu du script :\n#!/bin/bash\nwhile true; do\n  echo \"$(date) : service actif\" >> /var/log/mon-service.log\n  sleep 60\ndone", commentaire: "Script qui logue l'heure toutes les 60 secondes" },
          { os: "linux", cmd: "sudo chmod +x /usr/local/bin/mon-script.sh", commentaire: "Rendre le script exécutable" },
          { os: "linux", cmd: "sudo nano /etc/systemd/system/mon-service.service", commentaire: "Créer le fichier de service systemd" },
          { os: "linux", cmd: "# Contenu du .service :\n# [Unit]\n# Description=Mon service de démonstration\n# After=network.target\n# [Service]\n# Type=simple\n# User=nobody\n# ExecStart=/usr/local/bin/mon-script.sh\n# Restart=on-failure\n# RestartSec=5\n# [Install]\n# WantedBy=multi-user.target", commentaire: "Structure minimale d'un service systemd" },
          { os: "linux", cmd: "sudo systemctl daemon-reload\nsudo systemctl enable --now mon-service\nsudo systemctl status mon-service", commentaire: "Recharger systemd, activer et démarrer le service" }
        ],
        erreurs_courantes: [
          { symptome: "service: Failed to execute command: Permission denied", cause: "Le script n'est pas exécutable ou l'utilisateur n'a pas les droits", solution: "chmod +x sur le script et vérifier que l'User= du service a accès au fichier" }
        ]
      },
      {
        titre: "Étape 3 — Créer un timer systemd",
        contexte: "Les timers systemd remplacent avantageusement cron : ils sont loggés, gèrent les dépendances et peuvent rattraper les exécutions manquées. Un timer nécessite un .service associé.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/systemd/system/backup-quotidien.service", commentaire: "Service associé au timer" },
          { os: "linux", cmd: "# Contenu :\n# [Unit]\n# Description=Sauvegarde quotidienne\n# [Service]\n# Type=oneshot\n# ExecStart=/usr/local/bin/backup.sh", commentaire: "Type=oneshot car le service s'exécute et se termine" },
          { os: "linux", cmd: "sudo nano /etc/systemd/system/backup-quotidien.timer", commentaire: "Créer le fichier timer" },
          { os: "linux", cmd: "# Contenu du .timer :\n# [Unit]\n# Description=Timer sauvegarde quotidienne\n# [Timer]\n# OnCalendar=*-*-* 02:00:00\n# Persistent=true\n# [Install]\n# WantedBy=timers.target", commentaire: "Chaque jour à 2h. Persistent=true rattrape si la machine était éteinte." },
          { os: "linux", cmd: "sudo systemctl daemon-reload\nsudo systemctl enable --now backup-quotidien.timer\nsystemctl list-timers", commentaire: "Activer le timer et vérifier la prochaine exécution" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Exploiter journalctl",
        contexte: "journalctl est l'interface de consultation des logs systemd. Il offre des filtres puissants par service, temps, priorité et boots.",
        commandes: [
          { os: "linux", cmd: "sudo journalctl -u mon-service", commentaire: "Logs d'un service spécifique" },
          { os: "linux", cmd: "sudo journalctl -u nginx -f", commentaire: "Suivre les logs en temps réel (-f = follow)" },
          { os: "linux", cmd: "sudo journalctl --since '1 hour ago'", commentaire: "Logs de la dernière heure" },
          { os: "linux", cmd: "sudo journalctl --since '2026-06-26 08:00' --until '2026-06-26 09:00'", commentaire: "Logs sur une plage horaire précise" },
          { os: "linux", cmd: "sudo journalctl -p err -b", commentaire: "Uniquement les erreurs depuis le dernier boot (-p = priority)" },
          { os: "linux", cmd: "sudo journalctl --disk-usage\nsudo journalctl --vacuum-time=7d", commentaire: "Voir l'espace utilisé et purger les logs de plus de 7 jours" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "systemctl list-units --state=failed : aucun service en échec",
      "Service mon-service créé, activé et actif",
      "/var/log/mon-service.log alimenté toutes les 60s",
      "Timer backup-quotidien.timer visible dans systemctl list-timers",
      "journalctl -u mon-service affiche les logs du service",
      "journalctl -p err -b : logs d'erreurs consultés"
    ],
    tags: ["systemd", "systemctl", "service", "timer", "journalctl", "linux", "logs", "administration"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 52,
    titre: "RAID logiciel mdadm — RAID 1 et RAID 5 sur Linux",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 90,
    description: "Mettre en place le RAID logiciel Linux avec mdadm : création d'un RAID 1 (miroir) sur deux disques et d'un RAID 5 (parité distribuée) sur trois disques. Simulation de panne, remplacement de disque et reconstruction.",
    objectifs: [
      "Comprendre les niveaux RAID 1 et RAID 5",
      "Créer un RAID 1 avec mdadm sur deux disques",
      "Créer un RAID 5 avec mdadm sur trois disques",
      "Simuler une panne de disque et observer la dégradation",
      "Remplacer le disque défaillant et surveiller la reconstruction"
    ],
    prerequis: [
      { type: "vm", nom: "VM Linux avec 3 disques secondaires vierges (ex: /dev/sdb, /dev/sdc, /dev/sdd)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer mdadm et identifier les disques",
        contexte: "mdadm (Multiple Disk and Device Administration) est l'outil standard pour le RAID logiciel Linux. On identifie les disques disponibles.",
        commandes: [
          { os: "linux", cmd: "sudo apt install mdadm -y", commentaire: "Installer mdadm" },
          { os: "linux", cmd: "lsblk", commentaire: "Lister les disques — repérer /dev/sdb, /dev/sdc, /dev/sdd" },
          { os: "linux", cmd: "sudo mdadm --examine /dev/sdb", commentaire: "Vérifier qu'un disque n'est pas déjà membre d'un RAID" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Créer un RAID 1 (miroir)",
        contexte: "RAID 1 = miroir sur 2 disques. Tolérance à 1 panne. Capacité = taille d'un seul disque. On crée /dev/md0 en RAID 1.",
        commandes: [
          { os: "linux", cmd: "sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc", commentaire: "Créer le RAID 1 sur sdb et sdc" },
          { os: "linux", cmd: "cat /proc/mdstat", commentaire: "Vérifier l'état et la progression de la synchronisation" },
          { os: "linux", cmd: "sudo mdadm --detail /dev/md0", commentaire: "Détail du RAID : état, membres, espace, UUID" },
          { os: "linux", cmd: "sudo mkfs.ext4 /dev/md0\nsudo mkdir /mnt/raid1 && sudo mount /dev/md0 /mnt/raid1\ndf -h /mnt/raid1", commentaire: "Formater, monter et vérifier le RAID 1" }
        ],
        erreurs_courantes: [
          { symptome: "mdadm: /dev/sdb is not suitable for this array", cause: "Le disque contient déjà des données ou une signature RAID", solution: "sudo mdadm --zero-superblock /dev/sdb pour effacer la signature RAID existante" }
        ]
      },
      {
        titre: "Étape 3 — Créer un RAID 5 (parité distribuée)",
        contexte: "RAID 5 = parité distribuée sur 3+ disques. Tolérance à 1 panne. Capacité = (n-1) * taille disque. On crée /dev/md1 en RAID 5.",
        commandes: [
          { os: "linux", cmd: "sudo mdadm --create /dev/md1 --level=5 --raid-devices=3 /dev/sdb /dev/sdc /dev/sdd", commentaire: "Créer le RAID 5 sur sdb, sdc, sdd" },
          { os: "linux", cmd: "watch cat /proc/mdstat", commentaire: "Surveiller la progression de la synchronisation en temps réel" },
          { os: "linux", cmd: "sudo mkfs.ext4 /dev/md1\nsudo mkdir /mnt/raid5 && sudo mount /dev/md1 /mnt/raid5\ndf -h /mnt/raid5", commentaire: "Formater et monter le RAID 5" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Simuler une panne et reconstruire",
        contexte: "On marque un disque comme défaillant dans le RAID 1, observe la dégradation, puis on le retire et ajoute un disque de remplacement.",
        commandes: [
          { os: "linux", cmd: "sudo mdadm /dev/md0 --fail /dev/sdc", commentaire: "Marquer sdc comme défaillant dans le RAID 1" },
          { os: "linux", cmd: "sudo mdadm --detail /dev/md0", commentaire: "Observer le RAID en état dégradé (1/2 actifs)" },
          { os: "linux", cmd: "sudo mdadm /dev/md0 --remove /dev/sdc", commentaire: "Retirer le disque défaillant" },
          { os: "linux", cmd: "sudo mdadm /dev/md0 --add /dev/sdc", commentaire: "Ajouter le disque de remplacement (ou le même après simulation)" },
          { os: "linux", cmd: "watch cat /proc/mdstat", commentaire: "Surveiller la reconstruction — indique le pourcentage et le temps restant" }
        ],
        erreurs_courantes: [
          { symptome: "mdadm: cannot open /dev/sdc: Device or resource busy", cause: "Le disque est encore monté quelque part", solution: "sudo umount /dev/sdc si monté directement, sinon vérifier avec lsof /dev/sdc" }
        ]
      },
      {
        titre: "Étape 5 — Persistance du RAID au redémarrage",
        contexte: "Sans configuration, le RAID ne persiste pas au redémarrage. On sauvegarde la configuration dans mdadm.conf et on ajoute le montage dans fstab.",
        commandes: [
          { os: "linux", cmd: "sudo mdadm --detail --scan | sudo tee -a /etc/mdadm/mdadm.conf", commentaire: "Sauvegarder la configuration RAID dans mdadm.conf" },
          { os: "linux", cmd: "sudo update-initramfs -u", commentaire: "Mettre à jour l'initramfs pour inclure mdadm.conf" },
          { os: "linux", cmd: "echo '/dev/md0 /mnt/raid1 ext4 defaults 0 2' | sudo tee -a /etc/fstab", commentaire: "Montage automatique du RAID 1 au démarrage" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "lsblk liste /dev/md0 et /dev/md1",
      "mdadm --detail /dev/md0 : state = clean, 2/2 actifs",
      "mdadm --detail /dev/md1 : state = clean, 3/3 actifs",
      "RAID 1 monté sur /mnt/raid1 et accessible",
      "Simulation panne : RAID passe en état dégradé",
      "Reconstruction visible dans /proc/mdstat",
      "mdadm.conf mis à jour et initramfs régénéré"
    ],
    tags: ["raid", "mdadm", "raid1", "raid5", "stockage", "linux", "haute-disponibilite"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 53,
    titre: "Windows Server — DHCP et DNS intégrés à Active Directory",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 90,
    description: "Déployer les rôles DHCP et DNS sur un contrôleur de domaine Windows Server 2022. Configurer des étendues DHCP, des réservations, intégrer le DNS Active Directory et créer des zones de recherche directe et inverse.",
    objectifs: [
      "Installer les rôles DHCP et DNS sur Windows Server",
      "Créer une étendue DHCP avec exclusions et réservations",
      "Autoriser le serveur DHCP dans Active Directory",
      "Créer des zones DNS intégrées à Active Directory",
      "Ajouter des enregistrements A, PTR et CNAME manuels",
      "Tester la résolution depuis un client du domaine"
    ],
    prerequis: [
      { type: "vm", nom: "VM Windows Server 2022 promu contrôleur de domaine (lab.local)" },
      { type: "vm", nom: "VM cliente Windows 10/11 sur le même réseau" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer les rôles DHCP et DNS",
        contexte: "Sur un DC Windows Server, DNS est déjà installé avec AD DS. On ajoute le rôle DHCP via Server Manager ou PowerShell.",
        commandes: [
          { os: "windows", cmd: "Install-WindowsFeature DHCP -IncludeManagementTools", commentaire: "Installer le rôle DHCP via PowerShell" },
          { os: "windows", cmd: "Add-DhcpServerInDC -DnsName 'dc01.lab.local' -IPAddress 192.168.1.10", commentaire: "Autoriser le serveur DHCP dans Active Directory (obligatoire en domaine)" },
          { os: "windows", cmd: "Get-DhcpServerInDC", commentaire: "Vérifier que le serveur DHCP est bien autorisé dans l'AD" }
        ],
        erreurs_courantes: [
          { symptome: "Les clients ne reçoivent pas d'IP malgré le service DHCP actif", cause: "Le serveur DHCP n'est pas autorisé dans Active Directory", solution: "Exécuter Add-DhcpServerInDC avec les bons paramètres" }
        ]
      },
      {
        titre: "Étape 2 — Créer une étendue DHCP",
        contexte: "Une étendue (scope) définit la plage d'adresses à distribuer, les exclusions, les options (passerelle, DNS) et la durée de bail.",
        commandes: [
          { os: "windows", cmd: "Add-DhcpServerv4Scope -Name 'LAN Lab' -StartRange 192.168.1.100 -EndRange 192.168.1.200 -SubnetMask 255.255.255.0 -State Active", commentaire: "Créer l'étendue DHCP 192.168.1.100-200" },
          { os: "windows", cmd: "Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -Router 192.168.1.1 -DnsServer 192.168.1.10 -DnsDomain 'lab.local'", commentaire: "Définir la passerelle, le DNS et le domaine pour l'étendue" },
          { os: "windows", cmd: "Add-DhcpServerv4ExclusionRange -ScopeId 192.168.1.0 -StartRange 192.168.1.100 -EndRange 192.168.1.110", commentaire: "Exclure les IP .100-.110 (réservées aux serveurs)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Réservation DHCP par adresse MAC",
        contexte: "On crée une réservation pour attribuer toujours la même IP à un client identifié par son adresse MAC.",
        commandes: [
          { os: "windows", cmd: "# Récupérer la MAC du client :\nGet-DhcpServerv4Lease -ScopeId 192.168.1.0", commentaire: "Voir les baux actifs et récupérer les adresses MAC" },
          { os: "windows", cmd: "Add-DhcpServerv4Reservation -ScopeId 192.168.1.0 -IPAddress 192.168.1.50 -ClientId 'AA-BB-CC-DD-EE-FF' -Description 'PC-Alice'", commentaire: "Créer la réservation — remplacer la MAC par la valeur réelle" },
          { os: "windows", cmd: "Get-DhcpServerv4Reservation -ScopeId 192.168.1.0", commentaire: "Lister les réservations de l'étendue" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Configurer le DNS intégré à Active Directory",
        contexte: "Le DNS AD est déjà fonctionnel après la promotion en DC. On ajoute des enregistrements manuels et on crée une zone de recherche inverse.",
        commandes: [
          { os: "windows", cmd: "# Dans DNS Manager (dnsmgmt.msc) ou PowerShell :\nAdd-DnsServerResourceRecordA -ZoneName 'lab.local' -Name 'srv-web' -IPv4Address '192.168.1.20'", commentaire: "Ajouter un enregistrement A manuel" },
          { os: "windows", cmd: "Add-DnsServerResourceRecordCName -ZoneName 'lab.local' -Name 'www' -HostNameAlias 'srv-web.lab.local.'", commentaire: "Ajouter un CNAME www -> srv-web" },
          { os: "windows", cmd: "Add-DnsServerPrimaryZone -NetworkId '192.168.1.0/24' -ReplicationScope 'Forest'", commentaire: "Créer la zone de recherche inverse pour 192.168.1.0/24" },
          { os: "windows", cmd: "Add-DnsServerResourceRecordPtr -ZoneName '1.168.192.in-addr.arpa' -Name '20' -PtrDomainName 'srv-web.lab.local.'", commentaire: "Ajouter l'enregistrement PTR pour 192.168.1.20" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 5 — Tester depuis le client",
        contexte: "On vérifie que le client reçoit une IP DHCP avec les bonnes options et que la résolution DNS fonctionne.",
        commandes: [
          { os: "windows", cmd: "ipconfig /release && ipconfig /renew", commentaire: "Renouveler le bail DHCP sur le client" },
          { os: "windows", cmd: "ipconfig /all", commentaire: "Vérifier IP, passerelle, DNS et domaine reçus" },
          { os: "windows", cmd: "nslookup srv-web.lab.local\nnslookup www.lab.local\nnslookup 192.168.1.20", commentaire: "Tester la résolution A, CNAME et PTR" },
          { os: "windows", cmd: "Resolve-DnsName srv-web.lab.local", commentaire: "Alternative PowerShell à nslookup" }
        ],
        erreurs_courantes: [
          { symptome: "nslookup : NXDOMAIN pour srv-web.lab.local", cause: "L'enregistrement A n'a pas été créé ou la réplication AD n'est pas terminée", solution: "Vérifier dans DNS Manager que l'enregistrement existe. Forcer la réplication : repadmin /syncall" }
        ]
      }
    ],
    checklist: [
      "Get-DhcpServerInDC : serveur DHCP autorisé dans l'AD",
      "Étendue 192.168.1.100-200 active dans DHCP Manager",
      "Client reçoit une IP dans la plage avec gateway et DNS corrects",
      "Réservation 192.168.1.50 visible pour la MAC configurée",
      "nslookup srv-web.lab.local retourne 192.168.1.20",
      "nslookup 192.168.1.20 retourne srv-web.lab.local (PTR OK)"
    ],
    tags: ["windows-server", "dhcp", "dns", "active-directory", "windows", "reseau", "scope"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 54,
    titre: "Sauvegarde tar + cron — archivage planifié et restauration",
    categorie: "systemes",
    niveau: "débutant",
    duree: 45,
    description: "Mettre en place une stratégie de sauvegarde simple et robuste avec tar et cron : sauvegarde complète, incrémentale, compression, rotation automatique des archives et procédure de restauration.",
    objectifs: [
      "Créer des archives tar complètes et incrémentales",
      "Compresser les archives avec gzip et bzip2",
      "Automatiser les sauvegardes avec un script cron",
      "Implémenter une rotation des archives (garder les 7 derniers jours)",
      "Restaurer depuis une archive tar"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Commandes tar essentielles",
        contexte: "tar (Tape ARchive) est l'outil standard d'archivage Linux. Les options essentielles : c (créer), x (extraire), t (lister), v (verbose), f (fichier), z (gzip), j (bzip2).",
        commandes: [
          { os: "linux", cmd: "tar -czf /backup/home-$(date +%Y%m%d).tar.gz /home/", commentaire: "Archive complète de /home en gzip — nom daté automatiquement" },
          { os: "linux", cmd: "tar -cjf /backup/etc-$(date +%Y%m%d).tar.bz2 /etc/", commentaire: "Archive de /etc en bzip2 (meilleure compression, plus lent)" },
          { os: "linux", cmd: "tar -tzf /backup/home-$(date +%Y%m%d).tar.gz | head -20", commentaire: "Lister le contenu d'une archive sans l'extraire" },
          { os: "linux", cmd: "tar -xzf /backup/home-20260626.tar.gz -C /tmp/restauration/", commentaire: "Extraire l'archive dans /tmp/restauration/" },
          { os: "linux", cmd: "tar -xzf /backup/home-20260626.tar.gz home/alice/.bashrc -C /", commentaire: "Extraire un seul fichier depuis l'archive" }
        ],
        erreurs_courantes: [
          { symptome: "tar: Removing leading / from member names", cause: "tar retire le / initial pour éviter d'écraser des fichiers système lors de la restauration", solution: "C'est un comportement normal et sécurisé. Pour restaurer à la racine : ajouter --strip-components=0" }
        ]
      },
      {
        titre: "Étape 2 — Script de sauvegarde avec rotation",
        contexte: "On crée un script bash qui effectue la sauvegarde et supprime automatiquement les archives de plus de 7 jours.",
        commandes: [
          { os: "linux", cmd: "sudo mkdir -p /backup && sudo chmod 700 /backup", commentaire: "Créer le répertoire de sauvegarde sécurisé" },
          { os: "linux", cmd: "sudo nano /usr/local/bin/backup-daily.sh", commentaire: "Créer le script de sauvegarde" },
          { os: "linux", cmd: "# Contenu du script :\n#!/bin/bash\nBACKUP_DIR=/backup\nDATE=$(date +%Y%m%d_%H%M)\nLOG=/var/log/backup.log\necho \"[$DATE] Début sauvegarde\" >> $LOG\ntar -czf $BACKUP_DIR/home-$DATE.tar.gz /home/ 2>> $LOG\ntar -czf $BACKUP_DIR/etc-$DATE.tar.gz /etc/ 2>> $LOG\n# Supprimer les archives de plus de 7 jours\nfind $BACKUP_DIR -name '*.tar.gz' -mtime +7 -delete\necho \"[$DATE] Sauvegarde terminée\" >> $LOG", commentaire: "Script complet avec log et rotation 7 jours" },
          { os: "linux", cmd: "sudo chmod +x /usr/local/bin/backup-daily.sh\nsudo /usr/local/bin/backup-daily.sh", commentaire: "Rendre exécutable et tester manuellement" },
          { os: "linux", cmd: "ls -lh /backup/\ncat /var/log/backup.log", commentaire: "Vérifier les archives créées et le log" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Planifier avec cron et tester la restauration",
        contexte: "On planifie le script via cron root pour qu'il s'exécute chaque nuit, puis on teste la procédure de restauration complète.",
        commandes: [
          { os: "linux", cmd: "sudo crontab -e", commentaire: "Éditer la crontab root" },
          { os: "linux", cmd: "# Ajouter :\n# 0 2 * * * /usr/local/bin/backup-daily.sh", commentaire: "Sauvegarde chaque nuit à 2h00" },
          { os: "linux", cmd: "# Test de restauration complète :\nsudo mkdir /tmp/restore-test\nsudo tar -xzf /backup/home-$(ls /backup/home-* | tail -1 | xargs basename) -C /tmp/restore-test/\nls /tmp/restore-test/home/", commentaire: "Extraire la dernière archive dans un dossier de test" },
          { os: "linux", cmd: "find /backup -name '*.tar.gz' -mtime +7 -ls", commentaire: "Lister les archives qui seraient supprimées par la rotation" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Archives tar.gz créées dans /backup/ avec la date dans le nom",
      "tar -tzf liste correctement le contenu de l'archive",
      "Script backup-daily.sh exécutable et testé manuellement",
      "/var/log/backup.log contient les entrées de sauvegarde",
      "Cron root configuré pour 0 2 * * *",
      "Restauration testée dans /tmp/restore-test/ avec succès",
      "find -mtime +7 -delete fonctionne pour la rotation"
    ],
    tags: ["tar", "sauvegarde", "cron", "backup", "compression", "restauration", "linux", "bash"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 55,
    titre: "Rsyslog centralisé — collecte des logs réseau et système",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Mettre en place un serveur de logs centralisé avec rsyslog. Le serveur collecte les logs de plusieurs machines (Linux et équipements réseau Cisco) via UDP/TCP 514, les trie par hôte et les stocke dans des fichiers organisés.",
    objectifs: [
      "Configurer rsyslog en mode serveur centralisé (UDP/TCP 514)",
      "Envoyer les logs depuis un client Linux vers le serveur",
      "Organiser les logs par hôte dans des fichiers séparés",
      "Configurer un équipement Cisco pour envoyer ses syslog",
      "Tester la réception et analyser les logs centralisés"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 serveur rsyslog (IP 192.168.1.10)" },
      { type: "vm", nom: "VM cliente Linux (IP 192.168.1.20)" },
      { type: "reseau", nom: "Routeur ou switch Cisco (optionnel — GNS3)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Configurer rsyslog en mode serveur",
        contexte: "Par défaut rsyslog n'écoute pas sur le réseau. On active la réception UDP et TCP sur le port 514 dans la configuration.",
        commandes: [
          { os: "linux", cmd: "sudo apt install rsyslog -y\nsudo systemctl status rsyslog", commentaire: "Installer rsyslog (souvent déjà présent)" },
          { os: "linux", cmd: "sudo nano /etc/rsyslog.conf", commentaire: "Éditer la configuration principale" },
          { os: "linux", cmd: "# Décommenter ces lignes pour activer UDP et TCP :\n# module(load=\"imudp\")\n# input(type=\"imudp\" port=\"514\")\n# module(load=\"imtcp\")\n# input(type=\"imtcp\" port=\"514\")", commentaire: "Activer la réception UDP et TCP sur le port 514" },
          { os: "linux", cmd: "sudo systemctl restart rsyslog\nsudo ss -ulnp | grep 514\nsudo ss -tlnp | grep 514", commentaire: "Redémarrer et vérifier que rsyslog écoute sur UDP et TCP 514" }
        ],
        erreurs_courantes: [
          { symptome: "rsyslog n'écoute pas sur 514 après restart", cause: "Les modules imudp/imtcp sont commentés dans rsyslog.conf", solution: "Vérifier que les lignes module(load=...) ET input(type=...) sont bien décommentées" }
        ]
      },
      {
        titre: "Étape 2 — Trier les logs par hôte",
        contexte: "On configure rsyslog pour stocker les logs de chaque client dans un fichier séparé, organisé par nom d'hôte.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/rsyslog.d/remote.conf", commentaire: "Créer un fichier de configuration pour les logs distants" },
          { os: "linux", cmd: "# Contenu de remote.conf :\n# $template RemoteLogs,\"/var/log/remote/%HOSTNAME%/%PROGRAMNAME%.log\"\n# if $fromhost-ip != '127.0.0.1' then {\n#   action(type=\"omfile\" DynaFile=\"RemoteLogs\")\n#   stop\n# }", commentaire: "Stocker chaque log dans /var/log/remote/<hostname>/<programme>.log" },
          { os: "linux", cmd: "sudo mkdir -p /var/log/remote\nsudo systemctl restart rsyslog", commentaire: "Créer le répertoire et redémarrer" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Configurer le client Linux",
        contexte: "Sur le client Linux, on configure rsyslog pour forwarder tous les logs vers le serveur centralisé.",
        commandes: [
          { os: "linux", cmd: "# Sur la VM cliente (192.168.1.20) :\nsudo nano /etc/rsyslog.d/forward.conf", commentaire: "Créer la configuration de forwarding" },
          { os: "linux", cmd: "# Contenu de forward.conf :\n# *.* @192.168.1.10:514    # UDP (@ simple)\n# *.* @@192.168.1.10:514   # TCP (@@ double, plus fiable)", commentaire: "Forwarder tous les logs vers le serveur en TCP" },
          { os: "linux", cmd: "sudo systemctl restart rsyslog\nsudo logger -t TEST 'Message de test depuis le client'", commentaire: "Redémarrer et envoyer un message de test" },
          { os: "linux", cmd: "# Sur le serveur — vérifier la réception :\nls /var/log/remote/\ncat /var/log/remote/client-hostname/TEST.log", commentaire: "Vérifier que le log est arrivé sur le serveur" }
        ],
        erreurs_courantes: [
          { symptome: "Les logs n'arrivent pas sur le serveur", cause: "Pare-feu bloque UDP/TCP 514 sur le serveur", solution: "sudo ufw allow 514/udp && sudo ufw allow 514/tcp sur le serveur rsyslog" }
        ]
      },
      {
        titre: "Étape 4 — Configurer un équipement Cisco (optionnel)",
        contexte: "Les équipements Cisco supportent le protocole syslog natif. On configure le routeur pour envoyer ses logs vers le serveur rsyslog.",
        commandes: [
          { os: "linux", cmd: "# Sur le routeur Cisco (CLI) :\nR1(config)# logging host 192.168.1.10\nR1(config)# logging trap informational\nR1(config)# logging on\nR1# show logging", commentaire: "Activer syslog vers 192.168.1.10 avec niveau informational" },
          { os: "linux", cmd: "# Sur le serveur rsyslog — observer les logs Cisco :\ntail -f /var/log/remote/R1/", commentaire: "Surveiller les logs arrivant du routeur Cisco" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 5 — Analyser et filtrer les logs",
        contexte: "On utilise grep, awk et tail pour analyser les logs collectés sur le serveur centralisé.",
        commandes: [
          { os: "linux", cmd: "sudo tail -f /var/log/remote/client-hostname/syslog.log", commentaire: "Suivre les logs d'un client en temps réel" },
          { os: "linux", cmd: "grep -i 'error\\|failed\\|warning' /var/log/remote/*/syslog.log", commentaire: "Chercher les erreurs dans tous les logs distants" },
          { os: "linux", cmd: "sudo find /var/log/remote -name '*.log' -mtime -1 -ls", commentaire: "Lister les fichiers de logs modifiés dans les dernières 24h" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "ss -ulnp | grep 514 : rsyslog écoute en UDP",
      "ss -tlnp | grep 514 : rsyslog écoute en TCP",
      "logger -t TEST depuis le client crée un fichier dans /var/log/remote/",
      "Les logs sont organisés par hostname dans /var/log/remote/",
      "Cisco : show logging affiche le serveur 192.168.1.10 configuré",
      "grep error sur les logs distants fonctionne"
    ],
    tags: ["rsyslog", "syslog", "logs", "centralisation", "linux", "cisco", "supervision", "debian"],
    date_ajout: "2026-06-26",
    source: "École"
  },

  {
    id: 129,
    titre: "Active Directory — stratégies de groupe (GPO) et déploiement centralisé",
    categorie: "systemes",
    niveau: "intermédiaire",
    duree: 90,
    description: "Créer et lier des GPO sur un domaine Active Directory pour appliquer des paramètres à des utilisateurs et ordinateurs : fond d'écran imposé, mappage de lecteur réseau, restrictions du Panneau de configuration, déploiement d'un logiciel via MSI. Comprendre l'ordre d'application (LSDOU) et le filtrage de sécurité.",
    objectifs: [
      "Créer une structure d'OU et y ranger utilisateurs et ordinateurs",
      "Créer, éditer et lier des GPO à une OU",
      "Appliquer une GPO utilisateur (fond d'écran, lecteur réseau) et ordinateur",
      "Comprendre l'ordre LSDOU et tester avec gpresult / rsop",
      "Déployer un logiciel MSI par GPO et utiliser le filtrage de sécurité"
    ],
    prerequis: [
      { type: "vm", nom: "VM Windows Server 2019/2022 contrôleur de domaine (lab.local)" },
      { type: "vm", nom: "VM Windows 10/11 jointe au domaine" },
      { type: "reseau", nom: "Client pointant vers le DNS du DC, comptes de test créés" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Structurer les OU et les comptes",
        contexte: "Les GPO se lient à des OU (Organizational Units). On crée une arborescence claire séparant utilisateurs et postes, ce qui permet de cibler précisément les stratégies. On utilise PowerShell pour aller vite.",
        commandes: [
          { os: "windows", cmd: "New-ADOrganizationalUnit -Name \"LAB\" -Path \"DC=lab,DC=local\"\nNew-ADOrganizationalUnit -Name \"Utilisateurs\" -Path \"OU=LAB,DC=lab,DC=local\"\nNew-ADOrganizationalUnit -Name \"Postes\" -Path \"OU=LAB,DC=lab,DC=local\"", commentaire: "Créer l'arborescence d'OU" },
          { os: "windows", cmd: "New-ADUser -Name \"Jean Test\" -SamAccountName jtest -Path \"OU=Utilisateurs,OU=LAB,DC=lab,DC=local\" -AccountPassword (ConvertTo-SecureString \"P@ssw0rd1\" -AsPlainText -Force) -Enabled $true", commentaire: "Créer un utilisateur de test dans l'OU" },
          { os: "windows", cmd: "Get-ADComputer -Filter * | Where-Object {$_.Name -like \"WIN*\"}\n# Déplacer le poste dans l'OU Postes :\nMove-ADObject -Identity \"CN=WIN10-01,CN=Computers,DC=lab,DC=local\" -TargetPath \"OU=Postes,OU=LAB,DC=lab,DC=local\"", commentaire: "Ranger le poste client dans l'OU Postes" }
        ],
        erreurs_courantes: [
          {
            symptome: "New-ADUser : Le terme n'est pas reconnu",
            cause: "Module ActiveDirectory absent ou console lancée hors du DC",
            solution: "Import-Module ActiveDirectory sur le DC, ou installer les outils RSAT AD."
          }
        ]
      },
      {
        titre: "Étape 2 — Créer une GPO utilisateur (lecteur réseau + fond d'écran)",
        contexte: "On crée une GPO liée à l'OU Utilisateurs. La partie Configuration utilisateur s'applique aux comptes de cette OU. On mappe un lecteur réseau via les préférences GPO et on impose un fond d'écran.",
        commandes: [
          { os: "windows", cmd: "# Outil : gpmc.msc (Gestion des stratégies de groupe)\n# Clic droit sur OU Utilisateurs > Créer un objet GPO ici > \"GPO-Utilisateurs\"", commentaire: "Créer et lier la GPO à l'OU Utilisateurs" },
          { os: "windows", cmd: "# Éditer la GPO :\n# User Config > Préférences > Paramètres Windows > Mappages de lecteurs\n# Nouveau > Lecteur mappé : \\\\SRV\\Partage sur lettre P:", commentaire: "Mapper un lecteur réseau par préférence GPO" },
          { os: "windows", cmd: "# User Config > Stratégies > Modèles d'administration > Bureau > Bureau\n# \"Papier peint du Bureau\" : Activé\n# Chemin : \\\\SRV\\Partage\\fond.jpg / Style : Ajusté", commentaire: "Imposer un fond d'écran" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le lecteur réseau n'apparaît pas côté client",
            cause: "Chemin UNC inaccessible ou GPO pas encore appliquée",
            solution: "Vérifier l'accès au partage avec le compte utilisateur. Forcer gpupdate /force et se reconnecter."
          }
        ]
      },
      {
        titre: "Étape 3 — GPO ordinateur et déploiement de logiciel MSI",
        contexte: "La Configuration ordinateur s'applique au démarrage du poste. On déploie un logiciel au format MSI (ex : 7-Zip) placé sur un partage réseau accessible en lecture par les ordinateurs du domaine.",
        commandes: [
          { os: "windows", cmd: "# Copier le MSI sur un partage lisible par Domain Computers :\n# \\\\SRV\\Deploy\\7z.msi (permissions : Domain Computers = Lecture)", commentaire: "Préparer le paquet MSI sur un partage" },
          { os: "windows", cmd: "# GPO liée à OU Postes > Computer Config > Stratégies\n# > Paramètres logiciels > Installation de logiciel\n# Nouveau > Package > \\\\SRV\\Deploy\\7z.msi > Attribué", commentaire: "Déployer le logiciel par GPO ordinateur" },
          { os: "windows", cmd: "# Sur le client, forcer et redémarrer :\ngpupdate /force\nshutdown /r /t 0", commentaire: "L'installation se fait au démarrage suivant" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le logiciel ne s'installe pas au démarrage",
            cause: "Le chemin doit être UNC (pas C:\\) et lisible par le compte ordinateur",
            solution: "Utiliser un chemin \\\\serveur\\partage. Donner la permission Lecture à Domain Computers."
          }
        ]
      },
      {
        titre: "Étape 4 — Ordre d'application, filtrage et diagnostic",
        contexte: "Les GPO s'appliquent dans l'ordre LSDOU (Local, Site, Domaine, OU) — la dernière gagne en cas de conflit. Le filtrage de sécurité restreint une GPO à un groupe précis. On diagnostique avec gpresult et rsop.",
        commandes: [
          { os: "windows", cmd: "# Filtrage de sécurité : sélectionner la GPO dans gpmc\n# Onglet Étendue > Filtrage de sécurité\n# Retirer Utilisateurs authentifiés, ajouter un groupe cible", commentaire: "Restreindre la GPO à un groupe précis" },
          { os: "windows", cmd: "# Sur le client, résultat effectif :\ngpresult /r\ngpresult /h rapport.html", commentaire: "Voir quelles GPO s'appliquent réellement" },
          { os: "windows", cmd: "rsop.msc", commentaire: "Jeu de stratégie résultant, en interface graphique" }
        ],
        erreurs_courantes: [
          {
            symptome: "Une GPO ne s'applique pas malgré le lien",
            cause: "Filtrage de sécurité trop restrictif ou GPO écrasée par une autre (LSDOU)",
            solution: "Vérifier gpresult /r pour voir les GPO refusées et l'ordre de priorité (link order)."
          }
        ]
      }
    ],
    checklist: [
      "Arborescence d'OU LAB > Utilisateurs / Postes créée",
      "GPO-Utilisateurs liée : lecteur P: mappé côté client",
      "Fond d'écran imposé visible après reconnexion",
      "GPO ordinateur : logiciel MSI installé au démarrage",
      "Filtrage de sécurité appliqué à un groupe cible",
      "gpresult /r confirme les GPO appliquées et leur ordre"
    ],
    tags: ["active-directory", "gpo", "windows-server", "systemes", "deploiement", "msi", "gpresult", "ou", "domaine"],
    date_ajout: "2026-07-03",
    source: "École"
  }

];
