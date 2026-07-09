// TP & Labs IT — Catégorie : sauvegardes
// 4 TP(s)

const LABS_SAUVEGARDES = [
  {
    id: 21,
    titre: "Sauvegardes avec rsync — locale, distante et incrémentale",
    categorie: "sauvegardes",
    niveau: "débutant",
    duree: 60,
    description: "Maîtriser rsync pour les sauvegardes locales et distantes sur Linux. On configure des sauvegardes complètes, incrémentielles avec hardlinks (technique du backup miroir), et on automatise le tout avec cron. rsync est l'outil de référence pour les sauvegardes légères sans agent.",
    objectifs: [
      "Comprendre les options essentielles de rsync (-avz, --delete, --exclude)",
      "Effectuer une sauvegarde locale et une sauvegarde distante via SSH",
      "Implémenter les sauvegardes incrémentielles avec --link-dest (hardlinks)",
      "Exclure les fichiers inutiles (cache, tmp, logs)",
      "Automatiser et planifier les sauvegardes avec cron"
    ],
    prerequis: [
      { type: "vm", nom: "1x VM Debian/Ubuntu (source)" },
      { type: "vm", nom: "1x VM Debian/Ubuntu (destination distante)" },
      { type: "reseau", nom: "SSH fonctionnel entre les deux VMs" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Bases de rsync et première sauvegarde locale",
        contexte: "rsync synchronise des fichiers localement ou via SSH. Il ne transfère que les différences (delta), ce qui le rend très efficace. L'option -a préserve les permissions, timestamps, liens symboliques et groupes.",
        commandes: [
          { os: "linux", cmd: "sudo apt install -y rsync", commentaire: "rsync est souvent déjà installé sur Debian/Ubuntu" },
          { os: "linux", cmd: "# Sauvegarde locale basique :\nrsync -av /home/user/documents/ /backup/documents/", commentaire: "-a = archive (preserve tout), -v = verbose. Le / final sur source est important !" },
          { os: "linux", cmd: "# Avec progression et compression :\nrsync -avz --progress /home/user/documents/ /backup/documents/", commentaire: "-z = compression pendant transfert, --progress = afficher la progression" },
          { os: "linux", cmd: "# Synchronisation miroir — supprimer les fichiers supprimés à la source :\nrsync -av --delete /home/user/documents/ /backup/documents/", commentaire: "--delete : les fichiers supprimés à la source sont supprimés à la destination" },
          { os: "linux", cmd: "# Exclure des répertoires inutiles :\nrsync -av --exclude='.cache/' --exclude='*.tmp' --exclude='__pycache__/' /home/user/ /backup/home/", commentaire: "Exclure cache, fichiers temp et cache Python" },
          { os: "linux", cmd: "# Dry run — simuler sans modifier :\nrsync -av --dry-run --delete /home/user/ /backup/home/", commentaire: "--dry-run : voir ce qui serait fait sans l'exécuter" }
        ],
        erreurs_courantes: [
          {
            symptome: "rsync copie le répertoire source au lieu de son contenu",
            cause: "Oubli du / final sur le chemin source",
            solution: "/source/dir/ (avec /) copie le contenu. /source/dir (sans /) copie le répertoire lui-même dans la destination."
          }
        ]
      },
      {
        titre: "Étape 2 — Sauvegarde distante via SSH",
        contexte: "rsync utilise SSH comme transport pour les sauvegardes distantes. La syntaxe est user@host:chemin pour la destination. On configure l'authentification par clé pour automatiser sans mot de passe.",
        commandes: [
          { os: "linux", cmd: "# Sauvegarde vers un serveur distant :\nrsync -avz -e ssh /home/user/documents/ user@192.168.1.100:/backup/documents/", commentaire: "-e ssh : utiliser SSH comme transport" },
          { os: "linux", cmd: "# Avec clé SSH spécifique et port non standard :\nrsync -avz -e \"ssh -i ~/.ssh/backup_key -p 2222\" /home/user/ user@192.168.1.100:/backup/home/", commentaire: "Spécifier clé SSH et port dans l'option -e" },
          { os: "linux", cmd: "# Depuis le serveur distant vers local (pull) :\nrsync -avz user@192.168.1.100:/var/www/html/ /backup/web/", commentaire: "Pull : récupérer depuis un serveur distant vers local" },
          { os: "linux", cmd: "rsync -avz --stats /home/user/ user@192.168.1.100:/backup/home/", commentaire: "--stats : afficher les statistiques de transfert (fichiers, octets, vitesse)" }
        ],
        erreurs_courantes: [
          {
            symptome: "rsync demande un mot de passe à chaque exécution",
            cause: "Authentification par clé SSH non configurée",
            solution: "ssh-keygen -t ed25519 puis ssh-copy-id user@192.168.1.100. Tester : ssh user@192.168.1.100 — doit se connecter sans mot de passe."
          }
        ]
      },
      {
        titre: "Étape 3 — Sauvegardes incrémentielles avec --link-dest",
        contexte: "La technique du backup miroir avec --link-dest crée des hardlinks vers les fichiers inchangés de la sauvegarde précédente. Résultat : chaque snapshot semble complet mais ne consomme de l'espace que pour les fichiers modifiés. C'est la technique utilisée par Time Machine d'Apple.",
        commandes: [
          { os: "linux", cmd: "# Structure des snapshots :\n# /backup/\n#   2026-04-01/  (sauvegarde complète)\n#   2026-04-02/  (incremental — hardlinks vers 2026-04-01)\n#   2026-04-03/  (incremental — hardlinks vers 2026-04-02)\nDEST=/backup\nDATE=$(date +%Y-%m-%d)\nDERNIER=$(ls -1d $DEST/20* 2>/dev/null | tail -1)", commentaire: "Variables pour la gestion des snapshots datés" },
          { os: "linux", cmd: "# Première sauvegarde (complète) :\nrsync -av /home/user/ $DEST/$DATE/", commentaire: "Snapshot initial complet" },
          { os: "linux", cmd: "# Sauvegardes suivantes (incrémentielles) :\nrsync -av --link-dest=$DEST/$DERNIER /home/user/ $DEST/$DATE/", commentaire: "--link-dest : hardlinks vers le snapshot précédent pour les fichiers inchangés" },
          { os: "linux", cmd: "# Vérifier l'espace utilisé :\ndu -sh /backup/20*/\ndu -sh /backup/", commentaire: "Chaque snapshot semble complet mais partage les fichiers inchangés" },
          { os: "linux", cmd: "# Script complet de backup incrémentiel :\n#!/bin/bash\nSOURCE=\"/home/user\"\nDEST=\"/backup\"\nDATE=$(date +%Y-%m-%d_%H-%M)\nDERNIER=$(ls -1d $DEST/20* 2>/dev/null | tail -1)\n\nif [ -z \"$DERNIER\" ]; then\n    rsync -av \"$SOURCE/\" \"$DEST/$DATE/\"\nelse\n    rsync -av --link-dest=\"$DERNIER\" \"$SOURCE/\" \"$DEST/$DATE/\"\nfi\n\necho \"Snapshot créé : $DEST/$DATE\"\nfind \"$DEST\" -maxdepth 1 -type d -name \"20*\" | sort | head -n -30 | xargs rm -rf", commentaire: "Script complet : premier backup complet, suivants incrémentiels, conservation 30 snapshots" }
        ],
        erreurs_courantes: [
          {
            symptome: "Les hardlinks ne fonctionnent pas entre deux systèmes de fichiers différents",
            cause: "--link-dest et la destination doivent être sur le même système de fichiers",
            solution: "Source et destination des snapshots doivent être sur la même partition. Pour des backups distants, le --link-dest doit pointer vers un chemin sur la machine distante."
          }
        ]
      },
      {
        titre: "Étape 4 — Automatisation et monitoring des sauvegardes",
        contexte: "On planifie les sauvegardes avec cron et on ajoute un mécanisme de vérification pour s'assurer qu'elles se déroulent correctement. Un backup non vérifié est un backup dont on ne peut pas garantir la fiabilité.",
        commandes: [
          { os: "linux", cmd: "sudo nano /opt/scripts/backup-rsync.sh\nsudo chmod +x /opt/scripts/backup-rsync.sh", commentaire: "Créer le script de backup dans /opt/scripts/" },
          { os: "linux", cmd: "# Planifier dans crontab :\ncrontab -e\n# Sauvegarde quotidienne à 3h :\n0 3 * * * /opt/scripts/backup-rsync.sh >> /var/log/backup-rsync.log 2>&1\n# Sauvegarde hebdomadaire complète le dimanche à 2h :\n0 2 * * 0 rsync -av --delete /home/ user@192.168.1.100:/backup/weekly/ >> /var/log/backup-weekly.log 2>&1", commentaire: "Backup quotidien incrémentiel + hebdomadaire complet" },
          { os: "linux", cmd: "# Vérifier les dernières sauvegardes :\nls -la /backup/ | tail -10\ndu -sh /backup/*/", commentaire: "Lister et tailles des snapshots" },
          { os: "linux", cmd: "# Tester la restauration :\nrsync -av /backup/2026-04-01/documents/ /tmp/restore-test/\ndiff -r /home/user/documents/ /tmp/restore-test/", commentaire: "Toujours tester la restauration ! Un backup non testé n'est pas fiable" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "rsync -av /home/user/ /backup/home/ : sauvegarde locale fonctionnelle",
      "rsync via SSH vers 192.168.1.100 : transfert sans mot de passe",
      "Premier snapshot complet créé dans /backup/DATE/",
      "Snapshot incrémentiel avec --link-dest : espace disque minimal utilisé",
      "du -sh /backup/*/ : chaque snapshot semblable en taille mais partage les hardlinks",
      "crontab -l : backup planifié à 3h",
      "Test de restauration depuis snapshot : diff confirme intégrité"
    ],
    tags: ["rsync", "backup", "sauvegarde", "incremental", "hardlink", "ssh", "cron", "linux"],
    date_ajout: "2026-04-20",
    source: "École"
  },

  {
    id: 22,
    titre: "BorgBackup — sauvegardes dédupliquées et chiffrées",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 75,
    description: "Utiliser BorgBackup pour des sauvegardes avancées avec déduplication (économie d'espace), compression et chiffrement AES-256. BorgBackup est idéal pour les environnements où l'espace disque est précieux et la confidentialité essentielle.",
    objectifs: [
      "Installer et initialiser un dépôt BorgBackup local et distant",
      "Créer des archives chiffrées avec compression",
      "Comprendre et exploiter la déduplication de Borg",
      "Lister, monter et restaurer des archives",
      "Automatiser les sauvegardes et la rotation avec Borgmatic"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 (source)" },
      { type: "vm", nom: "VM Debian 12 (serveur de backup distant — optionnel)" },
      { type: "reseau", nom: "SSH fonctionnel entre les VMs" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer BorgBackup et initialiser un dépôt",
        contexte: "BorgBackup stocke les sauvegardes dans un dépôt (repository). Le dépôt peut être local ou distant via SSH. On initialise le dépôt une seule fois avec un mode de chiffrement.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install -y borgbackup", commentaire: "Installer BorgBackup depuis les dépôts Debian" },
          { os: "linux", cmd: "borg --version", commentaire: "Vérifier la version installée" },
          { os: "linux", cmd: "# Initialiser un dépôt LOCAL chiffré :\nborg init --encryption=repokey /backup/borg-repo", commentaire: "repokey : clé stockée dans le dépôt, protégée par passphrase" },
          { os: "linux", cmd: "# Modes de chiffrement disponibles :\n# none        : pas de chiffrement (déconseillé)\n# repokey     : clé dans le dépôt (+ passphrase)\n# keyfile     : clé dans ~/.config/borg/ (+ passphrase)\n# repokey-blake2 : plus rapide sur CPU modernes (recommandé)", commentaire: "Choisir repokey-blake2 pour les nouvelles installations" },
          { os: "linux", cmd: "# Initialiser un dépôt DISTANT via SSH :\nborg init --encryption=repokey-blake2 user@192.168.1.100:/backup/borg-remote", commentaire: "Dépôt distant — BorgBackup doit être installé sur le serveur distant aussi" },
          { os: "linux", cmd: "# Exporter et sauvegarder la clé du dépôt :\nborg key export /backup/borg-repo /tmp/borg-key-backup.txt\ncat /tmp/borg-key-backup.txt", commentaire: "CRITIQUE : sauvegarder la clé séparément — sans elle les backups sont irrécupérables" }
        ],
        erreurs_courantes: [
          {
            symptome: "Failed to create/lock repository — directory not empty",
            cause: "Le répertoire de destination contient déjà des fichiers",
            solution: "Utiliser un répertoire vide ou un nouveau chemin. borg init échoue si le répertoire n'est pas vide."
          }
        ]
      },
      {
        titre: "Étape 2 — Créer des archives et comprendre la déduplication",
        contexte: "BorgBackup découpe les fichiers en chunks et déduplique les blocs identiques entre archives. Résultat : la 2e sauvegarde d'un fichier inchangé n'occupe presque aucun espace supplémentaire.",
        commandes: [
          { os: "linux", cmd: "# Variable d'environnement pour éviter de taper la passphrase :\nexport BORG_PASSPHRASE='MaPassphraseBorg123'", commentaire: "En prod : utiliser un fichier sécurisé ou un agent — jamais en clair dans la config" },
          { os: "linux", cmd: "# Créer une archive (sauvegarde) :\nborg create --stats --progress /backup/borg-repo::backup-{now:%Y-%m-%d_%H-%M} /home/user /etc", commentaire: "::backup-{now} = nom de l'archive avec date auto" },
          { os: "linux", cmd: "# Créer avec compression :\nborg create --compression lz4 --stats /backup/borg-repo::backup-{now:%Y-%m-%d} /home/user", commentaire: "lz4 = rapide / zstd = meilleur ratio / zlib = compatible" },
          { os: "linux", cmd: "# Lister les archives du dépôt :\nborg list /backup/borg-repo", commentaire: "Voir toutes les archives avec date et taille" },
          { os: "linux", cmd: "# Infos sur une archive spécifique :\nborg list /backup/borg-repo::backup-2026-04-20", commentaire: "Lister les fichiers dans une archive" },
          { os: "linux", cmd: "# Statistiques du dépôt (déduplication) :\nborg info /backup/borg-repo", commentaire: "Voir l'espace original vs compressé vs dédupliqué — l'économie est souvent 50-80%" }
        ],
        erreurs_courantes: [
          {
            symptome: "ERROR passphrase provided in BORG_PASSPHRASE is incorrect",
            cause: "La passphrase ne correspond pas à celle utilisée lors de borg init",
            solution: "Vérifier la passphrase. Si perdue et pas de backup de la clé, les données sont irrécupérables. C'est pourquoi borg key export est critique."
          }
        ]
      },
      {
        titre: "Étape 3 — Restaurer depuis une archive Borg",
        contexte: "BorgBackup permet de restaurer tout ou partie d'une archive. On peut aussi monter une archive comme un système de fichiers FUSE pour naviguer et restaurer des fichiers individuels.",
        commandes: [
          { os: "linux", cmd: "# Restaurer une archive complète :\ncd /tmp/restore\nborg extract /backup/borg-repo::backup-2026-04-20", commentaire: "Restaure dans le répertoire courant en recréant l'arborescence" },
          { os: "linux", cmd: "# Restaurer un fichier ou dossier spécifique :\nborg extract /backup/borg-repo::backup-2026-04-20 home/user/documents/important.txt", commentaire: "Restauration sélective — chemin relatif sans / initial" },
          { os: "linux", cmd: "# Monter une archive en FUSE pour naviguer :\nsudo apt install -y borgbackup-fuse\nmkdir /mnt/borg-mount\nborg mount /backup/borg-repo::backup-2026-04-20 /mnt/borg-mount\nls /mnt/borg-mount/", commentaire: "Navigation interactive dans l'archive comme un système de fichiers" },
          { os: "linux", cmd: "# Démonter après consultation :\nborg umount /mnt/borg-mount", commentaire: "Toujours démonter proprement" },
          { os: "linux", cmd: "# Vérifier l'intégrité d'une archive :\nborg check /backup/borg-repo\nborg check --verify-data /backup/borg-repo", commentaire: "Vérifier la cohérence du dépôt et l'intégrité des données" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Rotation des archives avec Borgmatic",
        contexte: "Borgmatic est un wrapper autour de BorgBackup qui simplifie la configuration et automatise la rotation (pruning). Un seul fichier YAML remplace les scripts Bash complexes.",
        commandes: [
          { os: "linux", cmd: "sudo apt install -y borgmatic", commentaire: "Installer Borgmatic" },
          { os: "linux", cmd: "# Créer la configuration :\nsudo mkdir -p /etc/borgmatic\nsudo nano /etc/borgmatic/config.yaml", commentaire: "Fichier de configuration Borgmatic" },
          { os: "linux", cmd: "# Contenu config.yaml :\nlocation:\n    source_directories:\n        - /home/user\n        - /etc\n    repositories:\n        - path: /backup/borg-repo\n          label: local\n\nstorage:\n    encryption_passphrase: \"MaPassphraseBorg123\"\n    compression: lz4\n\nretention:\n    keep_daily: 7\n    keep_weekly: 4\n    keep_monthly: 6\n\nconsistency:\n    checks:\n        - name: repository\n        - name: archives", commentaire: "Config complète : sources, dépôt, passphrase, rétention 7j/4s/6m" },
          { os: "linux", cmd: "borgmatic --verbosity 1", commentaire: "Lancer une sauvegarde avec Borgmatic" },
          { os: "linux", cmd: "borgmatic list\nborgmatic info", commentaire: "Lister les archives et infos du dépôt via Borgmatic" },
          { os: "linux", cmd: "# Planifier avec cron :\ncrontab -e\n# 0 4 * * * borgmatic >> /var/log/borgmatic.log 2>&1", commentaire: "Sauvegarde quotidienne à 4h avec rotation automatique" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "borg init : dépôt local initialisé avec chiffrement repokey",
      "borg key export : clé exportée et sauvegardée séparément",
      "borg create --stats : archive créée, statistiques de déduplication visibles",
      "borg list : archives listées avec dates",
      "borg extract : restauration complète dans /tmp/restore fonctionnelle",
      "borg mount : archive montée en FUSE et navigation possible",
      "borgmatic configuré et planifié avec rotation 7j/4s/6m"
    ],
    tags: ["borg", "borgbackup", "borgmatic", "sauvegarde", "chiffrement", "deduplication", "linux", "backup"],
    date_ajout: "2026-04-25",
    source: "École"
  },

  {
    id: 23,
    titre: "PRA — Plan de Reprise d'Activité avec snapshots et restauration",
    categorie: "sauvegardes",
    niveau: "avancé",
    duree: 90,
    description: "Mettre en place un Plan de Reprise d'Activité (PRA) complet : snapshots VM Proxmox, réplication vers un site secondaire, procédures de restauration documentées et tests de bascule. On définit les objectifs RTO (Recovery Time Objective) et RPO (Recovery Point Objective) et on les valide par des tests.",
    objectifs: [
      "Comprendre et définir RTO et RPO pour un service donné",
      "Créer et gérer des snapshots VM sous Proxmox",
      "Configurer la réplication Proxmox vers un site secondaire",
      "Documenter et tester les procédures de restauration",
      "Valider le PRA par un exercice de bascule complet"
    ],
    prerequis: [
      { type: "logiciel", nom: "Proxmox VE 8.x (TP 3 recommandé)", lien: "https://proxmox.com" },
      { type: "vm", nom: "Au moins 2 VMs Proxmox pour les tests" },
      { type: "reseau", nom: "Connexion réseau entre nœuds Proxmox (optionnel pour réplication)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Définir RTO, RPO et stratégie de sauvegarde",
        contexte: "Avant toute configuration technique, on définit les objectifs du PRA. Le RPO (Recovery Point Objective) est la perte de données maximale acceptable. Le RTO (Recovery Time Objective) est le délai maximal de reprise. Ces deux métriques dictent la stratégie technique.",
        commandes: [
          { os: "both", cmd: "# Exemple de matrice RTO/RPO pour un lab BTS :\n#\n# Service         | RPO      | RTO      | Stratégie\n# ----------------|----------|----------|-------------------\n# Serveur Web     | 24h      | 2h       | Backup quotidien + snapshot\n# Base de données | 1h       | 30min    | Backup toutes les heures\n# Active Directory| 4h       | 1h       | Réplication + snapshot\n# Fichiers users  | 24h      | 4h       | rsync quotidien\n#\n# RPO court = backups fréquents = plus de stockage\n# RTO court = restauration rapide = infrastructure redondante", commentaire: "Matrice RTO/RPO — adapter selon les services supervisés" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Snapshots VM Proxmox et planification",
        contexte: "Proxmox permet des snapshots instantanés des VMs (avec ou sans état RAM). On configure des snapshots automatiques via l'éducation/cron Proxmox et on gère leur rétention.",
        commandes: [
          { os: "linux", cmd: "# Snapshot manuel via CLI Proxmox :\nqm snapshot 100 \"pre-update-$(date +%Y%m%d)\" --description \"Avant mise à jour système\"\nqm listsnapshot 100", commentaire: "Snapshot de la VM 100 avec nom daté" },
          { os: "linux", cmd: "# Script de snapshot automatique avec rotation :\n#!/bin/bash\nVMID=100\nNOM=\"auto-$(date +%Y-%m-%d_%H)\"\nRETENTION=5\n\n# Créer le snapshot\nqm snapshot $VMID \"$NOM\" --description \"Snapshot automatique $NOM\"\n\n# Lister et supprimer les anciens\nSNAPS=$(qm listsnapshot $VMID | grep \"auto-\" | awk \'{print $2}\' | head -n -$RETENTION)\nfor snap in $SNAPS; do\n    qm delsnapshot $VMID \"$snap\"\n    echo \"Supprimé : $snap\"\ndone", commentaire: "Script rotation : garde les 5 derniers snapshots auto" },
          { os: "linux", cmd: "# Planifier via crontab sur le nœud Proxmox :\ncrontab -e\n# Snapshot toutes les 6h :\n0 */6 * * * /opt/scripts/snapshot-vm.sh >> /var/log/snapshots.log 2>&1", commentaire: "Snapshot automatique toutes les 6h — RPO = 6h" },
          { os: "linux", cmd: "# Restaurer un snapshot :\nqm stop 100\nqm rollback 100 \"pre-update-20260420\"\nqm start 100", commentaire: "Rollback vers un snapshot — la VM doit être arrêtée" }
        ],
        erreurs_courantes: [
          {
            symptome: "qm snapshot échoue — storage does not support snapshots",
            cause: "Le stockage utilisé par la VM ne supporte pas les snapshots",
            solution: "Migrer le disque vers LVM-thin ou ZFS. Dans Proxmox : VM → Hardware → Hard Disk → Move Disk vers local-lvm."
          }
        ]
      },
      {
        titre: "Étape 3 — Réplication Proxmox vers site secondaire",
        contexte: "La réplication Proxmox synchronise les disques d'une VM vers un nœud secondaire à intervalles réguliers. En cas de panne du nœud primaire, on peut démarrer la VM sur le secondaire avec un minimum de perte de données.",
        commandes: [
          { os: "linux", cmd: "# Prérequis : les deux nœuds Proxmox doivent être dans le même cluster\n# OU avoir la même configuration de stockage\n\n# Configurer la réplication via l'interface web :\n# VM 100 → Replication → Add\n# Target node : pve-node2\n# Schedule : */15 (toutes les 15 minutes)\n# Rate limit : 50 MB/s (pour ne pas saturer le réseau)", commentaire: "Interface web Proxmox : VM → Replication → Add" },
          { os: "linux", cmd: "# Via CLI pvesr :\npvesr create-local-job 100-0 --target pve-node2 --schedule \"*/15\" --rate 50", commentaire: "Créer une tâche de réplication toutes les 15 minutes" },
          { os: "linux", cmd: "pvesr list\npvesr status", commentaire: "Lister et vérifier l'état des tâches de réplication" },
          { os: "linux", cmd: "pvesr run 100-0", commentaire: "Forcer une réplication immédiate" }
        ],
        erreurs_courantes: [
          {
            symptome: "Réplication échoue — node not reachable",
            cause: "Les nœuds ne sont pas dans le même cluster Proxmox ou SSH entre nœuds non configuré",
            solution: "La réplication Proxmox nécessite un cluster. Pour un lab mono-nœud, utiliser à la place vzdump + rsync vers un NAS ou une VM dédiée backup."
          }
        ]
      },
      {
        titre: "Étape 4 — Sauvegardes vzdump et procédure de restauration",
        contexte: "vzdump est l'outil natif Proxmox pour sauvegarder des VMs/conteneurs LXC en fichiers .vma compressés. On configure les sauvegardes automatiques et on documente et teste la procédure de restauration complète.",
        commandes: [
          { os: "linux", cmd: "# Sauvegarde manuelle d'une VM avec vzdump :\nvzdump 100 --storage local --compress gzip --mode snapshot", commentaire: "Backup VM 100 en mode snapshot (VM reste démarrée)" },
          { os: "linux", cmd: "# Modes vzdump :\n# snapshot : VM reste up, cohérence via snapshot (recommandé)\n# suspend  : VM suspendue pendant le backup\n# stop     : VM arrêtée pendant le backup (plus cohérent, RPO = durée backup)\nvzdump 100 --storage local --compress lzo --mode snapshot --notes \"Backup PRA $(date)\"", commentaire: "Backup avec compression LZO (plus rapide que gzip)" },
          { os: "linux", cmd: "# Planifier via l'interface web Proxmox :\n# Datacenter → Backup → Add\n# Schedule : 02:00 (2h du matin)\n# Storage : local\n# Mode : Snapshot\n# Compression : LZO\n# Retention : Keep Last 7", commentaire: "Backup automatique via l'interface Proxmox" },
          { os: "linux", cmd: "# Restaurer une VM depuis un backup vzdump :\n# Interface web : Storage → local → Backups → Sélectionner le .vma → Restore\n# Ou CLI :\nqmrestore /var/lib/vz/dump/vzdump-qemu-100-2026_04_20-02_00_00.vma.gz 101 --storage local-lvm", commentaire: "Restaurer la VM avec un nouvel ID (101) pour ne pas écraser l'existant" },
          { os: "linux", cmd: "# Documentation de la procédure PRA :\ncat > /opt/pra/procedure-restauration.md << \'EOF\'\n# Procédure de Restauration PRA\n## RTO cible : 2h | RPO cible : 24h\n\n## Étapes :\n1. Identifier le dernier backup valide dans Proxmox → Storage → Backups\n2. Vérifier la date et l'intégrité du backup\n3. Restaurer la VM : qmrestore /chemin/backup.vma VMID --storage local-lvm\n4. Démarrer la VM : qm start VMID\n5. Vérifier les services : systemctl status nginx mysql ssh\n6. Valider l'accès applicatif et notifier les utilisateurs\n7. Documenter la panne et la restauration dans le registre incidents\nEOF", commentaire: "Documentation procédure PRA — essentielle pour le BTS E4/E5" }
        ],
        erreurs_courantes: [
          {
            symptome: "vzdump échoue en mode snapshot — snapshot support not available",
            cause: "Le type de stockage ne supporte pas les snapshots",
            solution: "Utiliser --mode suspend ou --mode stop. Ou migrer les disques vers LVM-thin qui supporte les snapshots."
          }
        ]
      },
      {
        titre: "Étape 5 — Test de bascule et validation du PRA",
        contexte: "Un PRA non testé n'est pas un PRA. On effectue un exercice complet de bascule : simulation de panne, restauration, vérification des services et mesure du RTO réel. On compare avec l'objectif défini.",
        commandes: [
          { os: "linux", cmd: "# Exercice PRA — simuler une panne et mesurer le RTO :\nTIME_DEBUT=$(date +%s)\necho \"Début exercice PRA : $(date)\"\n\n# 1. Arrêter la VM production (simulation panne)\nqm stop 100\n\n# 2. Restaurer depuis le dernier backup\nqmrestore /var/lib/vz/dump/vzdump-qemu-100-*.vma.gz 101 --storage local-lvm --force\n\n# 3. Démarrer la VM restaurée\nqm start 101\nsleep 30\n\n# 4. Vérifier les services\nssh user@IP-VM-101 \"systemctl is-active nginx mysql ssh\"\n\nTIME_FIN=$(date +%s)\nRTO_REEL=$((TIME_FIN - TIME_DEBUT))\necho \"RTO réel : ${RTO_REEL}s ($(($RTO_REEL/60)) minutes)\"", commentaire: "Mesurer le RTO réel — comparer avec l'objectif défini" },
          { os: "linux", cmd: "# Rapport de test PRA :\necho \"=== RAPPORT TEST PRA $(date) ===\nRPO cible : 24h\nDernière sauvegarde : $(ls -lt /var/lib/vz/dump/*.vma.gz | head -1)\nRTO cible : 2h\nRTO mesuré : XX minutes\nServices restaurés : nginx OK, mysql OK, ssh OK\nStatut : SUCCÈS / ÉCHEC\" > /opt/pra/rapport-test-$(date +%Y%m%d).txt", commentaire: "Documenter le résultat du test pour le dossier BTS" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Matrice RTO/RPO définie pour les services du lab",
      "Snapshot manuel VM 100 créé et listé avec qm listsnapshot",
      "Script de snapshot automatique avec rotation des 5 derniers",
      "vzdump configuré en mode snapshot, backup .vma créé dans le storage local",
      "Restauration testée : qmrestore vers VM 101, services vérifiés",
      "RTO mesuré et comparé à l'objectif défini",
      "Procédure de restauration documentée dans /opt/pra/"
    ],
    tags: ["pra", "pca", "rto", "rpo", "proxmox", "snapshot", "vzdump", "restauration", "sauvegarde"],
    date_ajout: "2026-04-30",
    source: "École"
  },

  {
    id: 41,
    titre: "Veeam Agent for Linux — sauvegarde et restauration",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 90,
    description: "Installer Veeam Agent for Linux (version gratuite), configurer un job de sauvegarde planifié vers un dépôt local, lancer une sauvegarde manuelle et restaurer des fichiers depuis un point de restauration.",
    objectifs: [
      "Installer Veeam Agent for Linux",
      "Créer un dépôt de sauvegarde local",
      "Configurer un job avec retention via l'interface TUI",
      "Lancer une sauvegarde manuelle",
      "Monter un point de restauration et récupérer des fichiers"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 LTS" },
      { type: "vm", nom: "Espace disque supplémentaire (min 20 Go) pour le dépôt" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer Veeam Agent",
        contexte: "Veeam Agent s'installe depuis le dépôt officiel (compte gratuit requis sur veeam.com).",
        commandes: [
          { os: "linux", cmd: "# Télécharger veeam-release depuis https://www.veeam.com/linux-backup-free.html\ncurl -O https://repository.veeam.com/backup/linux/agent/dpkg/veeam-release-deb_1.0.8_amd64.deb\nsudo dpkg -i veeam-release-deb_1.0.8_amd64.deb\nsudo apt update && sudo apt install veeam -y", commentaire: "Ajouter le dépôt Veeam et installer l'agent" },
          { os: "linux", cmd: "veeam --version", commentaire: "Vérifier l'installation" }
        ],
        erreurs_courantes: [
          { symptome: "dpkg: needs kernel headers", cause: "Headers kernel absents — VeeamSnap doit compiler un module", solution: "sudo apt install linux-headers-$(uname -r) puis relancer l'installation" }
        ]
      },
      {
        titre: "Étape 2 — Créer le dépôt et configurer le job",
        contexte: "On crée un répertoire local pour le dépôt et on configure le job via l'interface TUI Veeam.",
        commandes: [
          { os: "linux", cmd: "sudo mkdir -p /backup/veeam && sudo chmod 777 /backup/veeam", commentaire: "Créer le répertoire de dépôt" },
          { os: "linux", cmd: "sudo veeam", commentaire: "Lancer l'interface TUI Veeam" },
          { os: "linux", cmd: "# TUI : Configure > Add New Job > Backup_Debian\n# Mode : Entire machine\n# Destination : Local > /backup/veeam\n# Schedule : Daily 02:00, retention 7 points > Save", commentaire: "Configurer le job via le menu TUI" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Lancer la sauvegarde et restaurer",
        contexte: "On déclenche le job manuellement et on monte le point de restauration pour récupérer des fichiers.",
        commandes: [
          { os: "linux", cmd: "sudo veeamconfig job start --name Backup_Debian\nsudo veeamconfig session list\nsudo veeamconfig point list", commentaire: "Lancer le job et vérifier les points de restauration" },
          { os: "linux", cmd: "ls -lh /backup/veeam/", commentaire: "Vérifier les fichiers .vbk créés" },
          { os: "linux", cmd: "sudo mkdir /mnt/veeam_restore\nsudo veeamconfig point mount --id <point_id> --mountDir /mnt/veeam_restore\nls /mnt/veeam_restore/\nsudo cp /mnt/veeam_restore/etc/hostname /tmp/hostname.restored\nsudo veeamconfig point umount --id <point_id>", commentaire: "Monter, restaurer un fichier et démonter" }
        ],
        erreurs_courantes: [
          { symptome: "Job failed: Failed to create snapshot", cause: "Module VeeamSnap non chargé", solution: "sudo modprobe veeamsnap et vérifier avec lsmod | grep veeam" }
        ]
      }
    ],
    checklist: [
      "veeam --version affiche la version",
      "Dépôt /backup/veeam accessible en écriture",
      "Job Backup_Debian avec rétention 7 points",
      "session list : statut Success",
      "point list : au moins 1 point disponible",
      "Fichiers .vbk présents dans /backup/veeam/",
      "Fichier restauré depuis le point monté"
    ],
    tags: ["veeam", "sauvegarde", "restauration", "linux", "backup", "pra"],
    date_ajout: "2026-06-26",
    source: "École"
  }
,

  {
    id: 84,
    titre: "Sauvegarde MySQL/MariaDB — mysqldump, mysqlpump et binlog",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Maîtriser les différentes méthodes de sauvegarde de bases de données MySQL/MariaDB : dump logique avec mysqldump, sauvegarde parallèle avec mysqlpump, sauvegarde à chaud avec mysqldump --single-transaction, et utilisation des binary logs pour la restauration point-in-time (PITR).",
    objectifs: [
      "Effectuer un dump complet avec mysqldump",
      "Sauvegarder une base spécifique avec compression",
      "Utiliser --single-transaction pour les sauvegardes à chaud InnoDB",
      "Activer et utiliser les binary logs pour le PITR",
      "Restaurer depuis un dump et depuis les binlogs"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 avec MariaDB ou MySQL installé" },
      { type: "logiciel", nom: "Base de données avec des données de test" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Sauvegardes avec mysqldump",
        contexte: "mysqldump génère un fichier SQL contenant les instructions CREATE TABLE et INSERT pour recréer la base. C'est la méthode la plus simple et la plus portable.",
        commandes: [
          { os: "linux", cmd: "# Dump complet de toutes les bases :\nmysqldump -u root -p --all-databases --single-transaction --routines --triggers > /backup/all-databases-$(date +%Y%m%d).sql", commentaire: "--single-transaction : dump cohérent sans lock sur InnoDB. --routines/--triggers : inclure les procédures et triggers." },
          { os: "linux", cmd: "# Dump d'une base spécifique avec compression :\nmysqldump -u root -p --single-transaction webapp | gzip > /backup/webapp-$(date +%Y%m%d_%H%M).sql.gz", commentaire: "Compresser à la volée avec gzip — divise la taille par 5-10" },
          { os: "linux", cmd: "# Vérifier le contenu sans extraire :\nzcat /backup/webapp-$(date +%Y%m%d)*.sql.gz | head -50", commentaire: "Afficher les premières lignes du dump compressé" },
          { os: "linux", cmd: "ls -lh /backup/*.sql.gz", commentaire: "Vérifier les tailles des fichiers de sauvegarde" }
        ],
        erreurs_courantes: [
          { symptome: "ERROR 1044: Access denied for user root", cause: "L'utilisateur MySQL n'a pas les privilèges suffisants pour dumper toutes les bases", solution: "Utiliser le compte root MySQL avec sudo mysql ou créer un utilisateur dédié : GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON *.* TO 'backup'@'localhost';" }
        ]
      },
      {
        titre: "Étape 2 — Restauration depuis un dump",
        contexte: "La restauration consiste à rejouer le fichier SQL dans MySQL. On peut restaurer toutes les bases ou une seule base spécifique.",
        commandes: [
          { os: "linux", cmd: "# Restaurer toutes les bases :\nmysql -u root -p < /backup/all-databases-20260627.sql", commentaire: "Rejouer le fichier SQL complet" },
          { os: "linux", cmd: "# Restaurer une base spécifique depuis un dump compressé :\nmysql -u root -p -e 'CREATE DATABASE IF NOT EXISTS webapp;'\nzcat /backup/webapp-20260627.sql.gz | mysql -u root -p webapp", commentaire: "Créer la base puis injecter le dump" },
          { os: "linux", cmd: "# Vérifier la restauration :\nmysql -u root -p webapp -e 'SHOW TABLES; SELECT COUNT(*) FROM ma_table;'", commentaire: "Vérifier que les tables et données sont bien restaurées" }
        ],
        erreurs_courantes: [
          { symptome: "ERROR 1005: Can't create table — foreign key constraint fails", cause: "Les tables sont recréées dans un ordre qui viole les contraintes de clé étrangère", solution: "Ajouter SET FOREIGN_KEY_CHECKS=0; au début du dump ou utiliser mysqldump --disable-keys" }
        ]
      },
      {
        titre: "Étape 3 — Binary logs et restauration PITR",
        contexte: "Les binary logs enregistrent toutes les modifications de données. Combinés à un dump, ils permettent une restauration Point-In-Time (jusqu'à une minute ou transaction précise avant la panne).",
        commandes: [
          { os: "linux", cmd: "# Activer les binary logs dans /etc/mysql/mariadb.conf.d/50-server.cnf :\n# [mysqld]\n# log_bin = /var/log/mysql/mysql-bin\n# binlog_format = ROW\n# expire_logs_days = 7\nsudo systemctl restart mariadb", commentaire: "Activer les binary logs et redémarrer MariaDB" },
          { os: "linux", cmd: "mysql -u root -p -e 'SHOW BINARY LOGS;'", commentaire: "Lister les fichiers binlog disponibles" },
          { os: "linux", cmd: "# Scénario de restauration PITR :\n# 1. Restaurer le dernier dump complet\nmysql -u root -p < /backup/all-databases-20260627.sql\n# 2. Appliquer les binlogs jusqu'à la panne (ex: 14:30:00)\nmysqlbinlog --stop-datetime='2026-06-27 14:30:00' /var/log/mysql/mysql-bin.* | mysql -u root -p", commentaire: "Restaurer le dump puis rejouer les binlogs jusqu'au moment de la panne" },
          { os: "linux", cmd: "# Flush et rotation des binlogs :\nmysql -u root -p -e 'FLUSH BINARY LOGS;'\nmysql -u root -p -e 'PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 7 DAY);'", commentaire: "Forcer la rotation et purger les anciens binlogs" }
        ],
        erreurs_courantes: [
          { symptome: "mysqlbinlog: command not found", cause: "Paquet client MySQL non installé", solution: "sudo apt install mysql-client ou mariadb-client" }
        ]
      },
      {
        titre: "Étape 4 — Automatisation avec cron",
        contexte: "On crée un script de sauvegarde automatisé qui tourne chaque nuit et nettoie les anciennes sauvegardes.",
        commandes: [
          { os: "linux", cmd: "sudo nano /usr/local/bin/backup-mysql.sh", commentaire: "Créer le script de sauvegarde automatisé" },
          { os: "linux", cmd: "# Contenu du script :\n#!/bin/bash\nBACKUP_DIR=/backup/mysql\nDATE=$(date +%Y%m%d_%H%M)\nMYSQL_USER=backup\nMYSQL_PASS=motdepasse\nmkdir -p $BACKUP_DIR\nmysqldump -u$MYSQL_USER -p$MYSQL_PASS --all-databases --single-transaction --routines --triggers | gzip > $BACKUP_DIR/all-$DATE.sql.gz\nfind $BACKUP_DIR -name '*.sql.gz' -mtime +7 -delete\necho \"[$DATE] Sauvegarde MySQL terminee\" >> /var/log/backup-mysql.log", commentaire: "Script complet avec dump, compression et rotation 7 jours" },
          { os: "linux", cmd: "sudo chmod +x /usr/local/bin/backup-mysql.sh\n# Cron à 1h chaque nuit :\necho '0 1 * * * root /usr/local/bin/backup-mysql.sh' | sudo tee /etc/cron.d/backup-mysql", commentaire: "Planifier la sauvegarde MySQL chaque nuit à 1h" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "mysqldump --all-databases génère un fichier SQL valide",
      "Dump compressé avec gzip — taille vérifiée",
      "Restauration depuis le dump : tables et données intactes",
      "Binary logs activés : SHOW BINARY LOGS liste les fichiers",
      "PITR testé : restauration dump + replay binlogs jusqu'à une heure précise",
      "Script backup-mysql.sh planifié via cron et testé manuellement"
    ],
    tags: ["mysql", "mariadb", "mysqldump", "binlog", "pitr", "sauvegarde", "restauration", "cron"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 85,
    titre: "Sauvegarde PostgreSQL — pg_dump, pg_basebackup et PITR",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Maîtriser les outils de sauvegarde PostgreSQL : dump logique avec pg_dump, sauvegarde physique avec pg_basebackup, archivage des WAL pour le Point-In-Time Recovery et restauration complète.",
    objectifs: [
      "Effectuer un dump logique avec pg_dump et pg_dumpall",
      "Réaliser une sauvegarde physique avec pg_basebackup",
      "Comprendre le rôle des fichiers WAL",
      "Configurer l'archivage WAL pour le PITR",
      "Restaurer une base jusqu'à un point précis dans le temps"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 avec PostgreSQL installé" },
      { type: "logiciel", nom: "PostgreSQL 14+ installé (sudo apt install postgresql)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Dump logique avec pg_dump",
        contexte: "pg_dump exporte une base PostgreSQL en SQL ou en format binaire. Il est non-bloquant et cohérent grâce au MVCC de PostgreSQL.",
        commandes: [
          { os: "linux", cmd: "# Dump en format SQL :\nsudo -u postgres pg_dump webapp > /backup/webapp-$(date +%Y%m%d).sql", commentaire: "Dump de la base 'webapp' en SQL standard" },
          { os: "linux", cmd: "# Dump en format custom (compressé, restauration sélective) :\nsudo -u postgres pg_dump -Fc webapp > /backup/webapp-$(date +%Y%m%d).dump", commentaire: "-Fc : format custom — compressé et permet la restauration table par table" },
          { os: "linux", cmd: "# Dump de toutes les bases (roles inclus) :\nsudo -u postgres pg_dumpall > /backup/all-$(date +%Y%m%d).sql", commentaire: "pg_dumpall inclut les rôles et tablespaces globaux" },
          { os: "linux", cmd: "# Lister le contenu d'un dump custom :\nsudo -u postgres pg_restore -l /backup/webapp-$(date +%Y%m%d).dump | head -20", commentaire: "Voir les objets contenus dans le dump sans l'extraire" }
        ],
        erreurs_courantes: [
          { symptome: "pg_dump: error: connection to server failed: FATAL: role 'root' does not exist", cause: "pg_dump doit être exécuté en tant qu'utilisateur postgres", solution: "Toujours préfixer avec sudo -u postgres pg_dump ou se connecter avec psql -U postgres" }
        ]
      },
      {
        titre: "Étape 2 — Restauration depuis un dump",
        contexte: "On restaure un dump SQL avec psql ou un dump custom avec pg_restore. Le format custom offre plus de flexibilité (restauration partielle, parallèle).",
        commandes: [
          { os: "linux", cmd: "# Restaurer depuis un dump SQL :\nsudo -u postgres psql -c 'CREATE DATABASE webapp_restore;'\nsudo -u postgres psql webapp_restore < /backup/webapp-20260627.sql", commentaire: "Créer la base puis restaurer le dump SQL" },
          { os: "linux", cmd: "# Restaurer depuis un dump custom :\nsudo -u postgres pg_restore -d webapp_restore -v /backup/webapp-20260627.dump", commentaire: "pg_restore avec -v pour voir chaque objet restauré" },
          { os: "linux", cmd: "# Restaurer une seule table depuis un dump custom :\nsudo -u postgres pg_restore -d webapp_restore -t ma_table /backup/webapp-20260627.dump", commentaire: "-t : restaurer uniquement la table 'ma_table'" },
          { os: "linux", cmd: "# Restauration parallèle (plus rapide sur grandes bases) :\nsudo -u postgres pg_restore -d webapp_restore -j 4 /backup/webapp-20260627.dump", commentaire: "-j 4 : utiliser 4 workers parallèles" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — pg_basebackup (sauvegarde physique)",
        contexte: "pg_basebackup copie les fichiers physiques du cluster PostgreSQL. Plus rapide que pg_dump pour les grosses bases, il est la base du PITR.",
        commandes: [
          { os: "linux", cmd: "# Configurer pg_hba.conf pour autoriser la réplication locale :\nsudo nano /etc/postgresql/*/main/pg_hba.conf\n# Ajouter : local replication postgres trust", commentaire: "Autoriser pg_basebackup en local" },
          { os: "linux", cmd: "sudo -u postgres pg_basebackup -D /backup/basebackup-$(date +%Y%m%d) -Ft -z -P", commentaire: "-D : destination, -Ft : format tar, -z : compresser, -P : progression" },
          { os: "linux", cmd: "ls -lh /backup/basebackup-$(date +%Y%m%d)/", commentaire: "Vérifier les fichiers créés : base.tar.gz et pg_wal.tar.gz" }
        ],
        erreurs_courantes: [
          { symptome: "pg_basebackup: error: could not connect to the server", cause: "Réplication non autorisée dans pg_hba.conf", solution: "Ajouter local replication postgres trust dans pg_hba.conf et recharger : sudo systemctl reload postgresql" }
        ]
      },
      {
        titre: "Étape 4 — Archivage WAL et PITR",
        contexte: "Les WAL (Write-Ahead Logs) permettent de rejouer les transactions après un basebackup. On active l'archivage pour conserver les WAL et pouvoir faire du PITR.",
        commandes: [
          { os: "linux", cmd: "# Activer l'archivage WAL dans postgresql.conf :\nsudo nano /etc/postgresql/*/main/postgresql.conf\n# wal_level = replica\n# archive_mode = on\n# archive_command = 'cp %p /backup/wal/%f'\nsudo mkdir -p /backup/wal && sudo chown postgres:postgres /backup/wal\nsudo systemctl restart postgresql", commentaire: "Activer l'archivage des WAL vers /backup/wal/" },
          { os: "linux", cmd: "# Pour restaurer jusqu'à un point précis :\n# 1. Restaurer le basebackup\nsudo systemctl stop postgresql\nsudo rm -rf /var/lib/postgresql/*/main/*\nsudo -u postgres tar -xzf /backup/basebackup-20260627/base.tar.gz -C /var/lib/postgresql/*/main/", commentaire: "Restaurer les fichiers physiques depuis le basebackup" },
          { os: "linux", cmd: "# 2. Créer le fichier recovery.conf (PostgreSQL < 12) ou recovery signal :\nsudo -u postgres touch /var/lib/postgresql/*/main/recovery.signal\n# Dans postgresql.conf ajouter :\n# restore_command = 'cp /backup/wal/%f %p'\n# recovery_target_time = '2026-06-27 14:30:00'", commentaire: "Configurer la restauration PITR jusqu'à 14h30" },
          { os: "linux", cmd: "sudo systemctl start postgresql\nsudo -u postgres psql -c 'SELECT pg_is_in_recovery();'", commentaire: "Démarrer PostgreSQL — il rejoue les WAL jusqu'au target_time" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "pg_dump webapp génère un fichier SQL valide",
      "pg_dump -Fc génère un dump custom compressé",
      "pg_restore restaure la base avec toutes les tables",
      "pg_basebackup crée base.tar.gz et pg_wal.tar.gz",
      "Archivage WAL actif : fichiers WAL copiés dans /backup/wal/",
      "PITR testé : PostgreSQL rejoue les WAL jusqu'au recovery_target_time"
    ],
    tags: ["postgresql", "pg-dump", "pg-basebackup", "wal", "pitr", "sauvegarde", "restauration"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 86,
    titre: "Restic — sauvegarde moderne multi-destinations",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Utiliser Restic pour des sauvegardes chiffrées, dédupliquées et vérifiables vers plusieurs destinations : répertoire local, serveur SFTP et stockage objet S3 compatible (MinIO). Restic est rapide, léger et open source.",
    objectifs: [
      "Installer Restic et initialiser un dépôt",
      "Effectuer des sauvegardes avec tags et exclusions",
      "Lister et restaurer des snapshots",
      "Configurer plusieurs destinations (local, SFTP, S3/MinIO)",
      "Vérifier l'intégrité du dépôt et appliquer une politique de rétention"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" },
      { type: "vm", nom: "Serveur SFTP ou MinIO optionnel pour les destinations distantes" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation et initialisation du dépôt",
        contexte: "Restic s'installe depuis les dépôts ou en binaire. Le dépôt est chiffré avec un mot de passe maître — sans lui, impossible de lire les données.",
        commandes: [
          { os: "linux", cmd: "sudo apt install restic -y\nrestic version", commentaire: "Installer Restic depuis les dépôts Debian/Ubuntu" },
          { os: "linux", cmd: "# Initialiser un dépôt local :\nmkdir -p /backup/restic\nrestic init --repo /backup/restic", commentaire: "Créer et chiffrer le dépôt local — noter le mot de passe !" },
          { os: "linux", cmd: "# Utiliser une variable d'environnement pour le mot de passe :\nexport RESTIC_REPOSITORY=/backup/restic\nexport RESTIC_PASSWORD=MonMotDePasseSecure\nrestic snapshots", commentaire: "Variables d'env pour éviter de saisir le mot de passe à chaque commande" }
        ],
        erreurs_courantes: [
          { symptome: "Fatal: wrong password or no key found", cause: "Mot de passe incorrect ou dépôt corrompu", solution: "Le mot de passe du dépôt Restic ne peut PAS être récupéré. Toujours noter et sauvegarder le mot de passe dans un gestionnaire de mots de passe." }
        ]
      },
      {
        titre: "Étape 2 — Sauvegardes avec tags et exclusions",
        contexte: "restic backup crée un snapshot du répertoire cible. Les tags permettent d'identifier les sauvegardes, les exclusions d'ignorer certains fichiers.",
        commandes: [
          { os: "linux", cmd: "restic backup /home/ --tag home --tag quotidien", commentaire: "Sauvegarder /home avec des tags pour identifier le snapshot" },
          { os: "linux", cmd: "restic backup /etc/ --tag config --exclude='*.log' --exclude='/etc/ssl/private'", commentaire: "Sauvegarder /etc en excluant les logs et les clés privées" },
          { os: "linux", cmd: "restic snapshots", commentaire: "Lister tous les snapshots : ID, date, tags, taille" },
          { os: "linux", cmd: "restic snapshots --tag home", commentaire: "Filtrer les snapshots par tag" },
          { os: "linux", cmd: "restic stats", commentaire: "Statistiques du dépôt : taille totale et après déduplication" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Restauration",
        contexte: "On peut restaurer un snapshot complet ou des fichiers individuels. Restic monte aussi le dépôt comme un système de fichiers FUSE pour naviguer dans les sauvegardes.",
        commandes: [
          { os: "linux", cmd: "# Restaurer le dernier snapshot de /home :\nrestic restore latest --target /tmp/restore-home --tag home", commentaire: "Restaurer dans /tmp/restore-home — latest = snapshot le plus récent" },
          { os: "linux", cmd: "# Restaurer un snapshot spécifique par son ID :\nrestic restore abc12345 --target /tmp/restore-specific", commentaire: "Les 8 premiers caractères de l'ID suffisent" },
          { os: "linux", cmd: "# Restaurer un seul fichier :\nrestic restore latest --target /tmp/restore --include '/home/alice/.bashrc'", commentaire: "Restaurer uniquement un fichier spécifique depuis le snapshot" },
          { os: "linux", cmd: "# Monter le dépôt en FUSE pour naviguer :\nmkdir /mnt/restic\nrestic mount /mnt/restic &\nls /mnt/restic/snapshots/\numount /mnt/restic", commentaire: "Parcourir les snapshots comme un système de fichiers (nécessite fuse)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Dépôt SFTP et politique de rétention",
        contexte: "Restic supporte SFTP nativement comme backend distant. On configure aussi une politique de rétention pour supprimer automatiquement les vieux snapshots.",
        commandes: [
          { os: "linux", cmd: "# Initialiser un dépôt SFTP :\nrestic init --repo sftp:user@192.168.56.20:/backup/restic-remote", commentaire: "Dépôt sur un serveur SFTP distant — SSH doit être configuré" },
          { os: "linux", cmd: "# Sauvegarder vers SFTP :\nrestic backup /home/ --repo sftp:user@192.168.56.20:/backup/restic-remote", commentaire: "Même syntaxe, juste changer --repo" },
          { os: "linux", cmd: "# Politique de rétention (forget + prune) :\nrestic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune", commentaire: "Garder 7 jours, 4 semaines, 6 mois — --prune supprime les données orphelines" },
          { os: "linux", cmd: "# Vérifier l'intégrité du dépôt :\nrestic check\nrestic check --read-data-subset=10%", commentaire: "Vérifier la structure du dépôt et 10% des données (vérification complète avec --read-data)" }
        ],
        erreurs_courantes: [
          { symptome: "restic check : error in pack file", cause: "Corruption du dépôt ou espace disque insuffisant lors de la sauvegarde", solution: "Lancer restic rebuild-index puis restic check. Si la corruption persiste, restaurer depuis une copie du dépôt (règle 3-2-1)." }
        ]
      }
    ],
    checklist: [
      "restic init crée le dépôt chiffré",
      "restic backup /home/ : snapshot créé",
      "restic snapshots liste les snapshots avec tags",
      "restic stats : déduplication visible (taille réelle < taille logique)",
      "restic restore : fichiers restaurés dans /tmp/restore-home",
      "restic forget --keep-daily 7 --prune : anciens snapshots supprimés",
      "restic check : dépôt intègre sans erreurs"
    ],
    tags: ["restic", "sauvegarde", "chiffrement", "deduplication", "sftp", "snapshot", "retention"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 87,
    titre: "Windows Server Backup — sauvegarde et restauration native",
    categorie: "sauvegardes",
    niveau: "débutant",
    duree: 60,
    description: "Utiliser la fonctionnalité Windows Server Backup intégrée à Windows Server 2022 pour sauvegarder l'état du système, des volumes et des dossiers spécifiques. Planifier des sauvegardes automatiques et tester la restauration de fichiers et du BMR (Bare Metal Recovery).",
    objectifs: [
      "Installer la fonctionnalité Windows Server Backup",
      "Configurer une sauvegarde complète du volume système",
      "Planifier des sauvegardes automatiques quotidiennes",
      "Restaurer des fichiers et dossiers individuels",
      "Comprendre le Bare Metal Recovery (BMR)"
    ],
    prerequis: [
      { type: "vm", nom: "VM Windows Server 2022 (Standard ou Datacenter)" },
      { type: "vm", nom: "Disque secondaire ou partage réseau pour stocker les sauvegardes" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer Windows Server Backup",
        contexte: "Windows Server Backup est une fonctionnalité optionnelle qui doit être installée avant utilisation. Elle comprend l'interface graphique et les outils PowerShell.",
        commandes: [
          { os: "windows", cmd: "Install-WindowsFeature Windows-Server-Backup -IncludeManagementTools", commentaire: "Installer Windows Server Backup via PowerShell" },
          { os: "windows", cmd: "Get-WindowsFeature Windows-Server-Backup", commentaire: "Vérifier l'installation — InstallState doit être Installed" },
          { os: "windows", cmd: "# Ou via Server Manager :\n# Gérer > Ajouter des rôles et fonctionnalités\n# Fonctionnalités > Windows Server Backup > Installer", commentaire: "Installation via l'interface graphique Server Manager" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer une sauvegarde planifiée",
        contexte: "On configure une sauvegarde quotidienne du volume système vers un disque dédié. Le disque de sauvegarde est formaté et dédié exclusivement aux sauvegardes.",
        commandes: [
          { os: "windows", cmd: "# Ouvrir Windows Server Backup (wbadmin.msc)\n# Action > Planifier la sauvegarde\n# Configuration : Serveur complet ou Personnalisée\n# Planification : 21:00 chaque jour\n# Destination : Disque dédié (D:) ou Dossier réseau", commentaire: "Configurer la sauvegarde planifiée via l'interface graphique" },
          { os: "windows", cmd: "# Via PowerShell :\n$policy = New-WBPolicy\n$fileSpec = New-WBFileSpec -FileSpec 'C:\\Important'\nAdd-WBFileSpec -Policy $policy -FileSpec $fileSpec\n$backupLocation = New-WBBackupTarget -VolumePath D:\nAdd-WBBackupTarget -Policy $policy -Target $backupLocation\nSet-WBSchedule -Policy $policy -Schedule 21:00\nSet-WBPolicy -Policy $policy", commentaire: "Configurer une sauvegarde de C:\\Important vers D: à 21h via PowerShell" },
          { os: "windows", cmd: "Get-WBPolicy", commentaire: "Afficher la politique de sauvegarde configurée" }
        ],
        erreurs_courantes: [
          { symptome: "Le disque de destination n'apparaît pas dans la liste", cause: "Le disque n'est pas initialisé ou partitionné", solution: "Initialiser le disque dans Gestion des disques (diskmgmt.msc) — Windows Server Backup le formatera automatiquement en NTFS lors de la configuration." }
        ]
      },
      {
        titre: "Étape 3 — Lancer une sauvegarde manuelle",
        contexte: "On déclenche une sauvegarde immédiate pour tester la configuration sans attendre la planification.",
        commandes: [
          { os: "windows", cmd: "# Via l'interface :\n# Windows Server Backup > Action > Sauvegarder une fois\n# Options : Mêmes options que la sauvegarde planifiée > Suivant > Sauvegarder", commentaire: "Lancer une sauvegarde manuelle immédiate" },
          { os: "windows", cmd: "# Via wbadmin (CLI) :\nwbadmin start backup -backupTarget:D: -include:C: -allCritical -quiet", commentaire: "Sauvegarde CLI de C: (volumes critiques) vers D:" },
          { os: "windows", cmd: "wbadmin get status", commentaire: "Suivre la progression de la sauvegarde en cours" },
          { os: "windows", cmd: "wbadmin get versions", commentaire: "Lister toutes les versions de sauvegarde disponibles avec leur identifiant" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Restaurer des fichiers et dossiers",
        contexte: "On restaure des fichiers individuels depuis une sauvegarde existante. La restauration peut se faire vers l'emplacement original ou un emplacement alternatif.",
        commandes: [
          { os: "windows", cmd: "# Via l'interface :\n# Windows Server Backup > Action > Récupérer\n# Ce serveur > Sélectionner la date > Fichiers et dossiers\n# Naviguer vers le fichier à restaurer > Récupérer", commentaire: "Restaurer un fichier via l'interface graphique" },
          { os: "windows", cmd: "# Via wbadmin :\n# Obtenir l'identifiant de version :\nwbadmin get versions\n# Restaurer un dossier :\nwbadmin start recovery -version:06/27/2026-21:00 -itemType:File -items:C:\\Important\\MonFichier.txt -recoveryTarget:C:\\Restore", commentaire: "Restaurer un fichier spécifique vers C:\\Restore" },
          { os: "windows", cmd: "wbadmin get items -version:06/27/2026-21:00", commentaire: "Lister les éléments disponibles dans une version de sauvegarde spécifique" }
        ],
        erreurs_courantes: [
          { symptome: "wbadmin : La version spécifiée est introuvable", cause: "Format de la date incorrect dans la commande wbadmin", solution: "Utiliser wbadmin get versions pour récupérer l'identifiant exact de version au format MM/JJ/AAAA-HH:MM" }
        ]
      }
    ],
    checklist: [
      "Get-WindowsFeature Windows-Server-Backup : InstallState = Installed",
      "Get-WBPolicy affiche la politique configurée",
      "wbadmin start backup réussit sans erreur",
      "wbadmin get versions liste au moins une version de sauvegarde",
      "Restauration d'un fichier vers C:\\Restore réussie",
      "wbadmin get items liste les fichiers de la sauvegarde"
    ],
    tags: ["windows-server", "windows-server-backup", "wbadmin", "restauration", "bmr", "sauvegarde", "windows"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 88,
    titre: "Stratégie 3-2-1 — mise en pratique de la règle d'or",
    categorie: "sauvegardes",
    niveau: "débutant",
    duree: 45,
    description: "Mettre en pratique la règle de sauvegarde 3-2-1 : 3 copies des données, sur 2 supports différents, dont 1 hors site. Concevoir et implémenter une stratégie complète combinant sauvegarde locale, NAS et cloud pour un contexte PME.",
    objectifs: [
      "Comprendre et appliquer la règle 3-2-1",
      "Mettre en place une sauvegarde locale automatisée",
      "Synchroniser vers un NAS avec rsync",
      "Configurer une copie hors site vers un stockage S3 compatible",
      "Tester et documenter la procédure de restauration"
    ],
    prerequis: [
      { type: "vm", nom: "VM Linux serveur de production" },
      { type: "vm", nom: "VM NAS ou serveur de sauvegarde secondaire" },
      { type: "logiciel", nom: "Accès à un stockage S3 compatible (MinIO en local ou AWS S3)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Comprendre la règle 3-2-1",
        contexte: "La règle 3-2-1 est le standard de l'industrie : 3 copies (original + 2 sauvegardes), 2 supports différents (disque local + NAS par exemple), 1 copie hors site (cloud ou site distant). Elle protège contre les pannes matérielles, les sinistres locaux et les ransomwares.",
        commandes: [
          { os: "linux", cmd: "# Architecture 3-2-1 dans notre lab :\n# Copie 1 : données originales sur /srv/production (disque local VM)\n# Copie 2 : sauvegarde locale sur /backup (second disque ou partition)\n# Copie 3 : sauvegarde distante vers NAS 192.168.56.20 ou S3\nmkdir -p /srv/production /backup/local /backup/logs", commentaire: "Créer la structure de répertoires pour le lab 3-2-1" },
          { os: "linux", cmd: "# Créer des données de test :\nfor i in $(seq 1 10); do echo \"Fichier critique $i - $(date)\" > /srv/production/fichier-$i.txt; done\nls -la /srv/production/", commentaire: "Générer des fichiers de test dans la zone de production" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Copie 2 : sauvegarde locale automatisée",
        contexte: "On crée la deuxième copie sur un disque local différent avec rsync et rotation quotidienne.",
        commandes: [
          { os: "linux", cmd: "# Sauvegarde locale avec rsync :\nrsync -av --delete --backup --backup-dir=/backup/local/$(date +%Y%m%d) /srv/production/ /backup/local/current/", commentaire: "--backup : copie les fichiers modifiés/supprimés dans un sous-dossier daté avant de les écraser" },
          { os: "linux", cmd: "ls -la /backup/local/\necho 'Sauvegarde locale terminee' >> /backup/logs/backup.log", commentaire: "Vérifier la sauvegarde locale et loguer" },
          { os: "linux", cmd: "# Planifier avec cron :\necho '0 0 * * * root rsync -a --delete /srv/production/ /backup/local/current/ >> /backup/logs/backup.log 2>&1' | sudo tee /etc/cron.d/backup-local", commentaire: "Sauvegarde locale chaque nuit à minuit" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Copie 3 : synchronisation vers le NAS",
        contexte: "La troisième copie est envoyée vers un NAS ou serveur distant via rsync over SSH. Elle protège contre les sinistres locaux (incendie, vol, inondation).",
        commandes: [
          { os: "linux", cmd: "# Générer une clé SSH pour la sauvegarde automatique :\nssh-keygen -t ed25519 -f ~/.ssh/backup_key -N ''\nssh-copy-id -i ~/.ssh/backup_key.pub backup@192.168.56.20", commentaire: "Clé SSH sans passphrase pour la sauvegarde automatisée" },
          { os: "linux", cmd: "# Synchroniser vers le NAS :\nrsync -avz --delete -e 'ssh -i ~/.ssh/backup_key' /srv/production/ backup@192.168.56.20:/backup/prod/", commentaire: "Rsync chiffré via SSH vers le NAS" },
          { os: "linux", cmd: "# Via rclone vers S3/MinIO (alternative cloud) :\n# Installer rclone et configurer le backend S3 :\nsudo apt install rclone -y\nrclone config\n# Puis synchroniser :\nrclone sync /srv/production/ s3:mon-bucket/prod/ --progress", commentaire: "Alternative : synchronisation vers S3 avec rclone" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Tester et documenter la restauration",
        contexte: "Une sauvegarde non testée n'est pas une sauvegarde. On simule une perte de données et on restaure depuis chaque copie pour valider la procédure.",
        commandes: [
          { os: "linux", cmd: "# Simuler une perte de données :\nrm -rf /srv/production/*\nls /srv/production/", commentaire: "Supprimer toutes les données de production" },
          { os: "linux", cmd: "# Restaurer depuis la copie locale :\nrsync -av /backup/local/current/ /srv/production/\nls /srv/production/", commentaire: "Restauration depuis la copie locale — cas le plus rapide" },
          { os: "linux", cmd: "# Restaurer depuis le NAS (si copie locale aussi compromise) :\nrsync -avz -e 'ssh -i ~/.ssh/backup_key' backup@192.168.56.20:/backup/prod/ /srv/production/", commentaire: "Restauration depuis le NAS distant" },
          { os: "linux", cmd: "# Documenter les temps de restauration :\necho \"RTO (copie locale) : < 5 min\" >> /backup/logs/test-restauration.log\necho \"RTO (NAS) : < 30 min selon debit\" >> /backup/logs/test-restauration.log\necho \"RPO : max 24h (sauvegarde quotidienne)\" >> /backup/logs/test-restauration.log", commentaire: "Documenter RTO (Recovery Time Objective) et RPO (Recovery Point Objective)" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "3 copies identifiées : local /backup/local, NAS 192.168.56.20, optionnel S3",
      "rsync local : /backup/local/current/ synchronisé avec /srv/production/",
      "Cron configuré pour la sauvegarde locale nocturne",
      "Clé SSH sans passphrase configurée pour la sauvegarde NAS",
      "rsync NAS : synchronisation vers 192.168.56.20 réussie",
      "Test de restauration depuis chaque copie réussi",
      "RTO et RPO documentés dans test-restauration.log"
    ],
    tags: ["3-2-1", "strategie", "rsync", "nas", "cloud", "rto", "rpo", "sauvegarde", "restauration"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 89,
    titre: "Bacula — solution de sauvegarde entreprise client/serveur",
    categorie: "sauvegardes",
    niveau: "avancé",
    duree: 90,
    description: "Déployer Bacula, solution de sauvegarde réseau entreprise open source, avec ses composants Director, Storage Daemon et File Daemon. Configurer un job de sauvegarde complète/incrémentale et tester la restauration.",
    objectifs: [
      "Comprendre l'architecture Bacula (Director, SD, FD, Catalog)",
      "Installer et configurer le Director Bacula",
      "Installer le File Daemon sur les clients",
      "Créer un job de sauvegarde complète et incrémentale",
      "Restaurer des fichiers depuis la console Bacula"
    ],
    prerequis: [
      { type: "vm", nom: "VM serveur Debian 12 (Director + Storage Daemon)" },
      { type: "vm", nom: "VM cliente Debian 12 (File Daemon)" },
      { type: "reseau", nom: "Les deux VMs joignables sur le réseau local" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Architecture et installation",
        contexte: "Bacula est composé de 4 éléments : Director (orchestrateur), Storage Daemon (gère le stockage), File Daemon (agent sur les clients), et Catalog (base de données des sauvegardes — PostgreSQL ou MySQL).",
        commandes: [
          { os: "linux", cmd: "# Sur le serveur (Director + Storage Daemon) :\nsudo apt install bacula-director bacula-sd bacula-console -y\n# Choisir PostgreSQL comme backend Catalog pendant l'installation", commentaire: "Installer les composants serveur Bacula" },
          { os: "linux", cmd: "# Sur les clients (File Daemon uniquement) :\nsudo apt install bacula-fd -y", commentaire: "Installer uniquement le File Daemon sur les clients" },
          { os: "linux", cmd: "sudo systemctl status bacula-director bacula-sd", commentaire: "Vérifier que les services démarrent correctement" }
        ],
        erreurs_courantes: [
          { symptome: "bacula-director failed to start : cannot connect to catalog", cause: "PostgreSQL non configuré ou droits insuffisants", solution: "Vérifier que PostgreSQL tourne et que la base bacula existe : sudo -u postgres psql -c '\\l' | grep bacula" }
        ]
      },
      {
        titre: "Étape 2 — Configurer le Director",
        contexte: "La configuration du Director se trouve dans /etc/bacula/bacula-dir.conf. On définit les clients, jobs, fileset et schedules.",
        commandes: [
          { os: "linux", cmd: "sudo nano /etc/bacula/bacula-dir.conf", commentaire: "Fichier de configuration principal du Director" },
          { os: "linux", cmd: "# Ajouter un client :\n# Client {\n#   Name = client01-fd\n#   Address = 192.168.56.20\n#   FDPort = 9102\n#   Catalog = MyCatalog\n#   Password = motdepasse-fd\n#   File Retention = 30 days\n#   Job Retention = 6 months\n# }", commentaire: "Déclarer le client dans la config du Director" },
          { os: "linux", cmd: "# Créer un FileSet (quoi sauvegarder) :\n# FileSet {\n#   Name = HomeFiles\n#   Include {\n#     Options { signature = MD5; compression = GZIP }\n#     File = /home\n#     File = /etc\n#   }\n#   Exclude {\n#     File = /home/.cache\n#   }\n# }", commentaire: "FileSet définissant /home et /etc avec compression GZIP" },
          { os: "linux", cmd: "# Créer un Job de sauvegarde :\n# Job {\n#   Name = BackupClient01\n#   Type = Backup\n#   Client = client01-fd\n#   FileSet = HomeFiles\n#   Schedule = WeeklyCycle\n#   Storage = File1\n#   Pool = Default\n#   Messages = Standard\n# }", commentaire: "Job de sauvegarde hebdomadaire pour client01" },
          { os: "linux", cmd: "sudo bacula-dir -t -c /etc/bacula/bacula-dir.conf", commentaire: "Vérifier la syntaxe du fichier de configuration" }
        ],
        erreurs_courantes: [
          { symptome: "bacula-dir -t : Could not find Client resource client01-fd", cause: "Nom du client dans le Job ne correspond pas à la ressource Client déclarée", solution: "Les noms Bacula sont sensibles à la casse. Vérifier que Name = client01-fd correspond exactement dans les deux ressources." }
        ]
      },
      {
        titre: "Étape 3 — Configurer le File Daemon client",
        contexte: "Sur le client, on configure le File Daemon avec le mot de passe correspondant à celui du Director.",
        commandes: [
          { os: "linux", cmd: "# Sur la VM cliente :\nsudo nano /etc/bacula/bacula-fd.conf", commentaire: "Configuration du File Daemon" },
          { os: "linux", cmd: "# Modifier le Director autorisé :\n# Director {\n#   Name = bacula-dir\n#   Password = motdepasse-fd\n# }", commentaire: "Le mot de passe doit correspondre à celui du Director" },
          { os: "linux", cmd: "sudo systemctl restart bacula-fd\nsudo systemctl status bacula-fd", commentaire: "Redémarrer et vérifier le File Daemon" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Lancer et restaurer via bconsole",
        contexte: "bconsole est l'interface interactive de Bacula. On l'utilise pour lancer des jobs, vérifier le statut et restaurer des fichiers.",
        commandes: [
          { os: "linux", cmd: "sudo bconsole", commentaire: "Ouvrir la console interactive Bacula" },
          { os: "linux", cmd: "# Dans bconsole :\n# status director       -> état du Director\n# run job=BackupClient01 -> lancer le job de sauvegarde\n# status client=client01-fd -> état du client\n# list jobs             -> lister les jobs exécutés\n# list files jobid=1    -> lister les fichiers sauvegardés dans le job 1", commentaire: "Commandes bconsole essentielles" },
          { os: "linux", cmd: "# Restaurer des fichiers :\n# restore client=client01-fd\n# Sélectionner 'Most recent backup'\n# Naviguer dans l'arborescence avec cd/ls/mark\n# mark /home/alice/.bashrc\n# done -> lancer la restauration", commentaire: "Procédure de restauration interactive dans bconsole" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "bacula-director et bacula-sd actifs sur le serveur",
      "bacula-fd actif sur le client",
      "bacula-dir -t : syntaxe du fichier de config OK",
      "bconsole : status director affiche les ressources",
      "Job BackupClient01 exécuté avec succès (list jobs : T = Terminated OK)",
      "Restauration de fichiers via bconsole réussie"
    ],
    tags: ["bacula", "sauvegarde", "entreprise", "client-serveur", "director", "file-daemon", "restauration"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 90,
    titre: "Amanda — sauvegarde réseau centralisée open source",
    categorie: "sauvegardes",
    niveau: "avancé",
    duree: 75,
    description: "Déployer Amanda (Advanced Maryland Automatic Network Disk Archiver) pour la sauvegarde centralisée de plusieurs clients Linux via le réseau. Configurer le serveur Amanda, les clients et les tapetypes, puis exécuter et vérifier les sauvegardes.",
    objectifs: [
      "Comprendre l'architecture Amanda (serveur + clients)",
      "Installer et configurer le serveur Amanda",
      "Configurer les clients Amanda",
      "Définir les disklist et les DLE (Disk List Entries)",
      "Lancer des sauvegardes et vérifier avec amcheck/amreport"
    ],
    prerequis: [
      { type: "vm", nom: "VM serveur Debian 12 (serveur Amanda)" },
      { type: "vm", nom: "Une ou deux VMs clientes Debian 12" },
      { type: "reseau", nom: "Les VMs joignables en SSH et sur le port 10080 (Amanda)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation du serveur Amanda",
        contexte: "Amanda utilise un utilisateur système 'amanda' dédié. Le serveur orchestre les sauvegardes et les stocke dans un holding disk (zone tampon) avant de les écrire sur le support final.",
        commandes: [
          { os: "linux", cmd: "sudo apt install amanda-server amanda-client -y", commentaire: "Installer Amanda server et client sur le serveur" },
          { os: "linux", cmd: "sudo -u amanda amandad --version", commentaire: "Vérifier l'installation d'Amanda" },
          { os: "linux", cmd: "# Créer le répertoire de configuration :\nsudo mkdir -p /etc/amanda/LabBackup\nsudo mkdir -p /backup/amanda/holding\nsudo chown -R amanda:amanda /backup/amanda /etc/amanda", commentaire: "Créer les répertoires nécessaires pour la configuration LabBackup" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer amanda.conf",
        contexte: "amanda.conf est le fichier de configuration principal du set de sauvegarde. Il définit le holding disk, les tapetypes et les dumptype.",
        commandes: [
          { os: "linux", cmd: "sudo -u amanda nano /etc/amanda/LabBackup/amanda.conf", commentaire: "Créer et éditer la configuration Amanda" },
          { os: "linux", cmd: "# Contenu minimal amanda.conf :\n# org 'LabBackup'\n# mailto 'root'\n# dumpuser 'amanda'\n# inparallel 4\n# netusage 10000 Kbps\n# holdingdisk hd1 {\n#   directory '/backup/amanda/holding'\n#   use 2000 Mb\n# }\n# define tapetype DIRECTORY {\n#   length 10000 Mbytes\n#   filemark 4 Kbytes\n# }\n# tapetype DIRECTORY\n# tpchanger 'chg-disk:/backup/amanda/vtapes'\n# tapecycle 7\n# dumpcycle 1 week\n# define dumptype simple-gnutar {\n#   program 'GNUTAR'\n#   compress client fast\n#   index yes\n# }", commentaire: "Configuration Amanda avec holding disk et vtapes (bandes virtuelles)" },
          { os: "linux", cmd: "sudo -u amanda mkdir -p /backup/amanda/vtapes/slot{1..7}\nsudo -u amanda amdiskd &", commentaire: "Créer les slots de bandes virtuelles" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Configurer les clients et la disklist",
        contexte: "La disklist définit quels répertoires de quels clients doivent être sauvegardés (DLE - Disk List Entries). Chaque client doit avoir Amanda installé et autorisé.",
        commandes: [
          { os: "linux", cmd: "# Sur chaque VM cliente :\nsudo apt install amanda-client -y\n# Autoriser le serveur Amanda dans .amandahosts :\necho '192.168.56.10 amanda' | sudo tee -a /var/lib/amanda/.amandahosts\nsudo chown amanda:amanda /var/lib/amanda/.amandahosts\nsudo chmod 600 /var/lib/amanda/.amandahosts", commentaire: "Installer Amanda client et autoriser le serveur" },
          { os: "linux", cmd: "# Sur le serveur — éditer la disklist :\nsudo -u amanda nano /etc/amanda/LabBackup/disklist", commentaire: "Définir les DLE à sauvegarder" },
          { os: "linux", cmd: "# Contenu disklist :\n# client01.lab.local /home simple-gnutar\n# client01.lab.local /etc simple-gnutar\n# client02.lab.local /home simple-gnutar", commentaire: "Chaque ligne : hôte, répertoire, dumptype" }
        ],
        erreurs_courantes: [
          { symptome: "amcheck : Connection refused from client", cause: "Amanda daemon non démarré sur le client ou pare-feu bloque le port 10080", solution: "Sur le client : sudo systemctl start amanda ou vérifier que amandad est dans inetd/xinetd. Ouvrir le port TCP 10080." }
        ]
      },
      {
        titre: "Étape 4 — Lancer et vérifier les sauvegardes",
        contexte: "On utilise les commandes Amanda (amcheck, amdump, amreport) pour vérifier la configuration, lancer les sauvegardes et consulter les rapports.",
        commandes: [
          { os: "linux", cmd: "sudo -u amanda amcheck LabBackup", commentaire: "Vérifier la configuration avant la première sauvegarde — doit retourner OK" },
          { os: "linux", cmd: "sudo -u amanda amdump LabBackup", commentaire: "Lancer la sauvegarde du jour (s'exécute en arrière-plan)" },
          { os: "linux", cmd: "sudo -u amanda amreport LabBackup", commentaire: "Afficher le rapport de la dernière sauvegarde" },
          { os: "linux", cmd: "sudo -u amanda amstatus LabBackup", commentaire: "Statut en temps réel d'une sauvegarde en cours" },
          { os: "linux", cmd: "sudo -u amanda amrestore -C /tmp/restore LabBackup client01.lab.local /home", commentaire: "Restaurer le /home du client01 dans /tmp/restore" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "amandad --version affiche la version installée",
      "Holding disk et vtapes créés dans /backup/amanda/",
      "disklist contient les DLE des clients",
      "amcheck LabBackup : Amanda Backup Hosts OK",
      "amdump LabBackup se termine sans erreur",
      "amreport affiche le rapport avec tailles et durées"
    ],
    tags: ["amanda", "sauvegarde", "reseau", "centralise", "linux", "dumptype", "disklist"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 91,
    titre: "Duplicati — sauvegarde chiffrée avec interface web",
    categorie: "sauvegardes",
    niveau: "débutant",
    duree: 45,
    description: "Utiliser Duplicati pour configurer des sauvegardes chiffrées et compressées avec une interface web intuitive. Duplicati supporte de nombreuses destinations : local, SFTP, S3, Google Drive, OneDrive, et propose des sauvegardes incrémentales avec déduplication.",
    objectifs: [
      "Installer Duplicati sur Linux",
      "Configurer une sauvegarde via l'interface web",
      "Choisir la destination et le chiffrement AES-256",
      "Planifier les sauvegardes et configurer la rétention",
      "Tester la restauration depuis l'interface web"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" },
      { type: "logiciel", nom: "Mono runtime (dépendance Duplicati sur Linux)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation de Duplicati",
        contexte: "Duplicati est une application .NET qui tourne sur Mono sous Linux. Elle expose une interface web sur le port 8200 pour toute la configuration.",
        commandes: [
          { os: "linux", cmd: "sudo apt install mono-complete -y", commentaire: "Installer le runtime Mono (prérequis Duplicati sur Linux)" },
          { os: "linux", cmd: "# Télécharger la dernière version de Duplicati :\nwget https://github.com/duplicati/duplicati/releases/download/v2.0.7.1/duplicati_2.0.7.1-1_all.deb\nsudo dpkg -i duplicati_2.0.7.1-1_all.deb", commentaire: "Télécharger et installer le paquet Duplicati DEB" },
          { os: "linux", cmd: "sudo systemctl enable --now duplicati\nsudo systemctl status duplicati", commentaire: "Activer et démarrer le service Duplicati" },
          { os: "linux", cmd: "# Accéder à l'interface web depuis l'hôte :\n# http://IP-VM:8200", commentaire: "Interface web Duplicati accessible sur le port 8200" }
        ],
        erreurs_courantes: [
          { symptome: "Interface web inaccessible depuis l'hôte", cause: "Duplicati écoute uniquement sur localhost par défaut", solution: "Éditer /etc/default/duplicati et ajouter --webservice-interface=any dans DAEMON_OPTS, puis sudo systemctl restart duplicati" }
        ]
      },
      {
        titre: "Étape 2 — Configurer une sauvegarde via l'interface web",
        contexte: "L'assistant Duplicati guide pas à pas : nom de la sauvegarde, chiffrement, destination, sources et planification.",
        commandes: [
          { os: "both", cmd: "# Dans l'interface web Duplicati :\n# Ajouter une sauvegarde > Configurer une nouvelle sauvegarde\n# Étape 1 - Général :\n#   Nom : Sauvegarde-Home\n#   Chiffrement : AES-256 (intégré)\n#   Passphrase : MonMotDePasseSecret", commentaire: "Étape 1 : nommer la sauvegarde et choisir le chiffrement AES-256" },
          { os: "both", cmd: "# Étape 2 - Destination :\n#   Type : Dossier local\n#   Chemin : /backup/duplicati\n# (ou SFTP/S3 pour une vraie sauvegarde hors site)", commentaire: "Choisir la destination locale ou distante" },
          { os: "both", cmd: "# Étape 3 - Données sources :\n#   Ajouter /home et /etc\n#   Exclusions : *.tmp, .cache/", commentaire: "Sélectionner les dossiers à sauvegarder et les exclusions" },
          { os: "both", cmd: "# Étape 4 - Planification :\n#   Fréquence : Quotidienne à 02:00\n# Étape 5 - Options :\n#   Conserver toutes les sauvegardes : 7 derniers jours\n#   Taille de bloc : 100KB (déduplication)", commentaire: "Planifier et configurer la rétention" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Lancer et vérifier la sauvegarde",
        contexte: "On lance la première sauvegarde manuellement et on vérifie les statistiques de compression et déduplication.",
        commandes: [
          { os: "both", cmd: "# Dans l'interface Duplicati :\n# Accueil > Sauvegarde-Home > Sauvegarder maintenant\n# Suivre la progression en temps réel", commentaire: "Lancer la sauvegarde manuelle depuis l'interface" },
          { os: "linux", cmd: "ls -lh /backup/duplicati/", commentaire: "Vérifier les fichiers créés — chiffrés et portant l'extension .dblock, .dindex, .dlist" },
          { os: "both", cmd: "# Vérifier les statistiques dans l'interface :\n# Sauvegarde-Home > Afficher les journaux\n# Observer : taille originale, taille compressée, taille uploadée", commentaire: "Consulter les journaux et statistiques de compression" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Restaurer depuis l'interface web",
        contexte: "La restauration Duplicati se fait entièrement depuis l'interface web — on navigue dans les snapshots et on sélectionne les fichiers à restaurer.",
        commandes: [
          { os: "both", cmd: "# Dans l'interface Duplicati :\n# Sauvegarde-Home > Restaurer des fichiers\n# Sélectionner la date du snapshot\n# Naviguer dans l'arborescence\n# Cocher les fichiers/dossiers à restaurer\n# Choisir : Emplacement original ou Autre emplacement\n# Cliquer : Restaurer", commentaire: "Restauration guidée depuis l'interface web" },
          { os: "linux", cmd: "# Vérifier la restauration :\nls -la /tmp/duplicati-restore/\ndiff /home/alice/.bashrc /tmp/duplicati-restore/home/alice/.bashrc", commentaire: "Vérifier que les fichiers restaurés sont identiques aux originaux" }
        ],
        erreurs_courantes: [
          { symptome: "Erreur de passphrase lors de la restauration", cause: "Passphrase incorrecte ou modifiée depuis la sauvegarde", solution: "La passphrase Duplicati ne peut PAS être récupérée. La noter impérativement lors de la configuration et la stocker séparément des sauvegardes." }
        ]
      }
    ],
    checklist: [
      "sudo systemctl status duplicati : active (running)",
      "Interface web accessible sur http://IP-VM:8200",
      "Sauvegarde configurée avec chiffrement AES-256",
      "Première sauvegarde manuelle réussie",
      "Fichiers .dblock et .dindex présents dans /backup/duplicati/",
      "Restauration d'un fichier depuis l'interface web réussie",
      "diff confirme que le fichier restauré est identique à l'original"
    ],
    tags: ["duplicati", "sauvegarde", "chiffrement", "aes-256", "interface-web", "linux", "deduplication"],
    date_ajout: "2026-06-27",
    source: "École"
  }

,

  {
    id: 92,
    titre: "Timeshift — snapshots système Linux type Time Machine",
    categorie: "sauvegardes",
    niveau: "débutant",
    duree: 45,
    description: "Utiliser Timeshift pour créer des points de restauration système sur Linux, similaire à Time Machine sur macOS. Timeshift prend des snapshots rsync ou BTRFS du système et permet de revenir à un état antérieur après une mise à jour catastrophique ou une mauvaise manipulation.",
    objectifs: [
      "Installer et configurer Timeshift",
      "Créer des snapshots manuels et planifiés",
      "Comprendre la différence entre mode rsync et BTRFS",
      "Restaurer le système depuis un snapshot",
      "Configurer les exclusions et la rétention"
    ],
    prerequis: [
      { type: "vm", nom: "VM Ubuntu 22.04 ou Linux Mint (Timeshift préinstallé)" },
      { type: "vm", nom: "Espace disque suffisant pour les snapshots (min 10 Go libres)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation et configuration initiale",
        contexte: "Timeshift est disponible dans les dépôts Ubuntu. Il propose deux modes : rsync (universel, fonctionne sur tous les FS) et BTRFS (instantané, nécessite une partition BTRFS).",
        commandes: [
          { os: "linux", cmd: "sudo apt install timeshift -y", commentaire: "Installer Timeshift" },
          { os: "linux", cmd: "sudo timeshift --list", commentaire: "Lister les snapshots existants (vide au départ)" },
          { os: "linux", cmd: "# Configuration via l'interface graphique :\n# Lancer : sudo timeshift-gtk\n# Type de snapshot : RSYNC\n# Emplacement : sélectionner le disque cible\n# Niveaux de rétention : Daily=5, Weekly=2, Monthly=1", commentaire: "Configurer Timeshift via l'interface graphique" },
          { os: "linux", cmd: "# Configuration via CLI :\nsudo timeshift --setup --snapshot-type rsync --snapshot-device /dev/sdb1", commentaire: "Configurer Timeshift en ligne de commande" }
        ],
        erreurs_courantes: [
          { symptome: "Timeshift refuse de créer un snapshot sur la partition système", cause: "Timeshift recommande un disque ou partition séparé pour les snapshots", solution: "Ajouter un second disque à la VM ou utiliser une partition dédiée. Timeshift peut fonctionner sur la même partition mais c'est déconseillé." }
        ]
      },
      {
        titre: "Étape 2 — Créer des snapshots et configurer la planification",
        contexte: "On crée un snapshot manuel pour tester, puis on configure la planification automatique. Timeshift utilise cron en arrière-plan.",
        commandes: [
          { os: "linux", cmd: "sudo timeshift --create --comments 'Avant mise à jour système' --tags D", commentaire: "Créer un snapshot manuel avec commentaire et tag Daily" },
          { os: "linux", cmd: "sudo timeshift --list", commentaire: "Lister les snapshots créés avec leur taille et date" },
          { os: "linux", cmd: "# Simuler une modification destructrice :\nsudo rm /etc/hosts\ncat /etc/hosts", commentaire: "Supprimer un fichier système pour tester la restauration" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Restaurer depuis un snapshot",
        contexte: "La restauration Timeshift en mode rsync peut se faire sur un système en cours d'exécution. Pour une restauration complète, il vaut mieux démarrer depuis un live CD.",
        commandes: [
          { os: "linux", cmd: "sudo timeshift --list", commentaire: "Récupérer l'ID du snapshot à restaurer" },
          { os: "linux", cmd: "sudo timeshift --restore --snapshot '2026-06-27_02-00-00' --skip-grub", commentaire: "Restaurer le snapshot — --skip-grub évite de réinstaller GRUB si non nécessaire" },
          { os: "linux", cmd: "# Vérifier après restauration :\ncat /etc/hosts", commentaire: "Le fichier /etc/hosts doit être restauré" },
          { os: "linux", cmd: "# Exclure des répertoires de la sauvegarde :\nsudo timeshift --create --exclude '/home/**' --exclude '/tmp/**'", commentaire: "Exclure /home et /tmp des snapshots (Timeshift sauvegarde le système, pas les données)" }
        ],
        erreurs_courantes: [
          { symptome: "Restauration échoue : target device is busy", cause: "Impossible de restaurer une partition montée en écriture depuis le système actif", solution: "Démarrer depuis un live USB Ubuntu, installer Timeshift dans le live, puis restaurer" }
        ]
      }
    ],
    checklist: [
      "sudo timeshift --list affiche les snapshots disponibles",
      "Snapshot manuel créé avec commentaire",
      "Fichier système supprimé puis restauré avec succès",
      "Planification automatique configurée (Daily, Weekly)",
      "Exclusions /home et /tmp configurées"
    ],
    tags: ["timeshift", "snapshot", "systeme", "restauration", "rsync", "btrfs", "linux", "ubuntu"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 93,
    titre: "Clonezilla — clonage bare-metal disque et partition",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Utiliser Clonezilla Live pour cloner un disque ou une partition en bare-metal. Créer une image de disque compressée, la sauvegarder vers un partage réseau SAMBA/NFS, et restaurer sur une machine identique ou différente. Indispensable pour le déploiement en masse ou la reprise après sinistre.",
    objectifs: [
      "Démarrer sur Clonezilla Live depuis un ISO",
      "Créer une image disque-à-disque",
      "Sauvegarder une image vers un partage réseau",
      "Restaurer depuis une image sur un nouveau disque",
      "Comprendre les différences device-image vs device-device"
    ],
    prerequis: [
      { type: "logiciel", nom: "ISO Clonezilla Live", lien: "https://clonezilla.org/downloads.php" },
      { type: "vm", nom: "VM source avec un système Linux installé" },
      { type: "vm", nom: "VM destination (disque vierge) ou partage réseau NFS/SAMBA" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Démarrer sur Clonezilla Live",
        contexte: "Clonezilla est un live CD/USB basé sur Debian. On démarre dessus pour cloner le disque sans que le système source soit en cours d'exécution — garantissant la cohérence des données.",
        commandes: [
          { os: "both", cmd: "# Dans VirtualBox/VMware :\n# 1. Ajouter l'ISO Clonezilla dans le lecteur CD de la VM\n# 2. Démarrer la VM en bootant sur le CD\n# 3. Sélectionner : Clonezilla live (Default settings)\n# 4. Choisir la langue et le clavier", commentaire: "Démarrer la VM sur l'ISO Clonezilla" },
          { os: "both", cmd: "# Dans le menu Clonezilla :\n# Start Clonezilla > device-image (disque vers image)", commentaire: "Choisir le mode device-image pour créer une image du disque" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Créer une image disque vers partage réseau",
        contexte: "On sauvegarde l'image du disque source vers un partage réseau NFS ou SAMBA. L'image est compressée avec gzip ou zstd.",
        commandes: [
          { os: "both", cmd: "# Dans Clonezilla — choisir la destination :\n# samba_server -> entrer IP, partage, utilisateur et mot de passe du serveur SAMBA\n# OU nfs_server -> entrer IP et chemin du partage NFS", commentaire: "Sélectionner le serveur réseau comme destination" },
          { os: "both", cmd: "# Options de sauvegarde recommandées :\n# Beginner mode\n# savedisk (sauvegarder disque entier)\n# Nom de l'image : debian-lab-20260627\n# Disque source : sda\n# Compression : -z1p (gzip parallèle — bon compromis vitesse/taille)", commentaire: "Configurer le nom de l'image et les options de compression" },
          { os: "both", cmd: "# Clonezilla affiche la commande partclone exécutée :\n# partclone.ext4 -c -s /dev/sda1 | gzip > debian-lab-20260627/sda1.ext4-ptcl-img.gz", commentaire: "Observer la commande partclone pour comprendre le processus" }
        ],
        erreurs_courantes: [
          { symptome: "Clonezilla ne peut pas monter le partage SAMBA", cause: "SMB version incompatible ou credentials incorrects", solution: "Vérifier que le partage SAMBA est accessible depuis Linux avec smbclient. Essayer en ajoutant -o vers=2.0 dans les options de montage Clonezilla." }
        ]
      },
      {
        titre: "Étape 3 — Restaurer depuis une image",
        contexte: "On restaure l'image sur un disque destination vierge de taille égale ou supérieure. Clonezilla peut aussi redimensionner les partitions automatiquement.",
        commandes: [
          { os: "both", cmd: "# Démarrer Clonezilla sur la VM destination\n# device-image > restoredisk\n# Sélectionner l'image : debian-lab-20260627\n# Disque cible : sdb (vérifier soigneusement !)\n# Option : -k1 (redimensionner proportionnellement si disque plus grand)", commentaire: "Restaurer l'image sur le disque destination" },
          { os: "both", cmd: "# Clonezilla affiche la progression par partition :\n# Elapsed : X min, Rate : XX GB/min, Remaining : X min", commentaire: "Observer la progression de la restauration" },
          { os: "both", cmd: "# Après restauration :\n# Retirer l'ISO Clonezilla\n# Démarrer sur le disque restauré\n# Vérifier que le système démarre normalement", commentaire: "Valider la restauration en démarrant le système" }
        ],
        erreurs_courantes: [
          { symptome: "Le système restauré ne démarre pas (GRUB error)", cause: "Le disque destination a un UUID différent ou GRUB n'est pas réinstallé", solution: "Démarrer sur un live CD, chroote dans le système restauré et relancer update-grub + grub-install" }
        ]
      }
    ],
    checklist: [
      "VM démarre correctement sur l'ISO Clonezilla",
      "Image créée sur le partage réseau avec nom daté",
      "Taille de l'image cohérente avec les données du disque source",
      "Restauration sur VM destination réussie",
      "VM restaurée démarre normalement sur le disque cloné"
    ],
    tags: ["clonezilla", "bare-metal", "clonage", "partclone", "image-disque", "restauration", "sauvegarde"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 94,
    titre: "LVM Snapshots — sauvegarde à chaud sans interruption de service",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Utiliser les snapshots LVM pour sauvegarder des données à chaud (sans arrêter les services) tout en garantissant la cohérence. Technique professionnelle utilisée pour sauvegarder des bases de données et serveurs web en production sans interruption.",
    objectifs: [
      "Créer un snapshot LVM d'un volume en production",
      "Monter le snapshot pour sauvegarder les données gelées",
      "Utiliser le snapshot pour sauvegarder une base de données à chaud",
      "Gérer la taille du snapshot et surveiller son utilisation",
      "Automatiser le processus avec un script"
    ],
    prerequis: [
      { type: "vm", nom: "VM Linux avec LVM configuré (suite du TP LVM id:32)" },
      { type: "logiciel", nom: "MariaDB ou MySQL installé sur un volume LVM" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Principe et création du snapshot",
        contexte: "Un snapshot LVM capture l'état d'un LV à un instant T en utilisant le mécanisme Copy-On-Write (COW). Les blocs ne sont copiés dans le snapshot que lorsqu'ils sont modifiés après sa création. On peut alors monter le snapshot en lecture seule et sauvegarder les données figées.",
        commandes: [
          { os: "linux", cmd: "sudo lvs", commentaire: "Vérifier les LV existants — ex: /dev/vg_data/lv_web monté sur /var/www" },
          { os: "linux", cmd: "sudo vgs", commentaire: "Vérifier l'espace libre dans le VG — nécessaire pour le snapshot" },
          { os: "linux", cmd: "sudo lvcreate -L 2G -s -n lv_web_snap /dev/vg_data/lv_web", commentaire: "Créer un snapshot de 2 Go du LV lv_web — instantané" },
          { os: "linux", cmd: "sudo lvs", commentaire: "Vérifier : lv_web_snap avec attribut 's' (snapshot) et origine = lv_web" }
        ],
        erreurs_courantes: [
          { symptome: "Le snapshot grossit rapidement et devient 100%", cause: "Trop d'activité d'écriture sur le LV source — le snapshot COW se remplit", solution: "Augmenter la taille du snapshot : sudo lvextend -L +1G /dev/vg_data/lv_web_snap. Un snapshot à 100% est automatiquement invalidé." }
        ]
      },
      {
        titre: "Étape 2 — Monter et sauvegarder depuis le snapshot",
        contexte: "On monte le snapshot en lecture seule et on archive son contenu avec tar. Les données sont figées à l'instant de la création du snapshot, même si le LV source continue d'évoluer.",
        commandes: [
          { os: "linux", cmd: "sudo mkdir -p /mnt/snap\nsudo mount -o ro /dev/vg_data/lv_web_snap /mnt/snap", commentaire: "Monter le snapshot en lecture seule" },
          { os: "linux", cmd: "ls /mnt/snap/", commentaire: "Vérifier le contenu — identique à l'état du LV au moment du snapshot" },
          { os: "linux", cmd: "sudo tar -czf /backup/web-$(date +%Y%m%d_%H%M).tar.gz -C /mnt/snap .", commentaire: "Archiver le contenu du snapshot vers /backup/" },
          { os: "linux", cmd: "sudo umount /mnt/snap\nsudo lvremove -f /dev/vg_data/lv_web_snap", commentaire: "Démonter et supprimer le snapshot après la sauvegarde" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Snapshot pour base de données MariaDB",
        contexte: "Pour une base de données, on flush et lock les tables avant le snapshot pour garantir la cohérence, puis on unlock immédiatement après — le lock dure quelques secondes seulement.",
        commandes: [
          { os: "linux", cmd: "# Procédure complète pour MariaDB :\n# 1. Flusher et locker les tables (quelques ms)\nmysql -u root -p -e 'FLUSH TABLES WITH READ LOCK; FLUSH LOGS;'\n# 2. Créer le snapshot instantanément\nsudo lvcreate -L 2G -s -n lv_mysql_snap /dev/vg_data/lv_mysql\n# 3. Unlocker immédiatement\nmysql -u root -p -e 'UNLOCK TABLES;'", commentaire: "Lock court (< 1 seconde) puis snapshot instantané puis unlock" },
          { os: "linux", cmd: "sudo mount -o ro /dev/vg_data/lv_mysql_snap /mnt/snap\nsudo tar -czf /backup/mysql-$(date +%Y%m%d_%H%M).tar.gz -C /mnt/snap .\nsudo umount /mnt/snap && sudo lvremove -f /dev/vg_data/lv_mysql_snap", commentaire: "Sauvegarder les fichiers MySQL depuis le snapshot puis nettoyer" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Script automatisé",
        contexte: "On encapsule toute la procédure dans un script bash réutilisable.",
        commandes: [
          { os: "linux", cmd: "sudo nano /usr/local/bin/lvm-backup.sh", commentaire: "Créer le script de sauvegarde LVM snapshot" },
          { os: "linux", cmd: "#!/bin/bash\nVG=vg_data\nLV=lv_web\nSNAP=${LV}_snap\nSNAP_SIZE=2G\nBACKUP_DIR=/backup/lvm\nDATE=$(date +%Y%m%d_%H%M)\nmkdir -p $BACKUP_DIR\n# Créer le snapshot\nlvcreate -L $SNAP_SIZE -s -n $SNAP /dev/$VG/$LV\n# Monter et sauvegarder\nmount -o ro /dev/$VG/$SNAP /mnt/snap\ntar -czf $BACKUP_DIR/${LV}-${DATE}.tar.gz -C /mnt/snap .\n# Nettoyer\numount /mnt/snap\nlvremove -f /dev/$VG/$SNAP\necho \"[$DATE] Sauvegarde LVM terminee\" >> /var/log/lvm-backup.log", commentaire: "Script complet de sauvegarde via snapshot LVM" },
          { os: "linux", cmd: "sudo chmod +x /usr/local/bin/lvm-backup.sh\nsudo /usr/local/bin/lvm-backup.sh", commentaire: "Rendre exécutable et tester" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "sudo lvs : snapshot lv_web_snap créé avec attribut s",
      "Snapshot monté en lecture seule sur /mnt/snap",
      "tar archive créée dans /backup/lvm/",
      "Snapshot démonté et supprimé après sauvegarde",
      "Procédure MariaDB : FLUSH LOCK -> snapshot -> UNLOCK en < 1 seconde",
      "Script lvm-backup.sh exécuté sans erreur"
    ],
    tags: ["lvm", "snapshot", "sauvegarde-a-chaud", "cow", "mysql", "mariadb", "linux", "production"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 95,
    titre: "Chiffrement GPG — sécuriser les archives de sauvegarde",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 45,
    description: "Chiffrer les archives de sauvegarde avec GPG (GNU Privacy Guard) pour protéger les données sensibles en transit et au repos. Utilisation du chiffrement symétrique (passphrase) et asymétrique (clé publique/privée) pour les sauvegardes automatisées.",
    objectifs: [
      "Chiffrer une archive avec GPG en mode symétrique",
      "Générer une paire de clés GPG asymétrique",
      "Chiffrer et déchiffrer avec la clé publique",
      "Intégrer le chiffrement GPG dans un script de sauvegarde",
      "Gérer le trousseau de clés GPG"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" },
      { type: "logiciel", nom: "GPG installé (sudo apt install gnupg)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Chiffrement symétrique",
        contexte: "Le chiffrement symétrique GPG utilise une passphrase pour chiffrer et déchiffrer. Simple à mettre en place mais la passphrase doit être transmise séparément.",
        commandes: [
          { os: "linux", cmd: "gpg --version", commentaire: "Vérifier l'installation GPG" },
          { os: "linux", cmd: "# Créer une archive de test :\ntar -czf /tmp/backup-test.tar.gz /etc/hostname /etc/hosts", commentaire: "Créer une archive à chiffrer" },
          { os: "linux", cmd: "gpg --symmetric --cipher-algo AES256 --output /backup/backup-test.tar.gz.gpg /tmp/backup-test.tar.gz", commentaire: "Chiffrer avec AES256 — demande une passphrase" },
          { os: "linux", cmd: "ls -lh /backup/backup-test.tar.gz.gpg", commentaire: "Vérifier le fichier chiffré créé" },
          { os: "linux", cmd: "gpg --output /tmp/backup-decrypte.tar.gz --decrypt /backup/backup-test.tar.gz.gpg", commentaire: "Déchiffrer — demande la passphrase" },
          { os: "linux", cmd: "tar -tzf /tmp/backup-decrypte.tar.gz", commentaire: "Vérifier le contenu de l'archive déchiffrée" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Chiffrement asymétrique (clé publique)",
        contexte: "Avec le chiffrement asymétrique, on chiffre avec la clé publique du destinataire. Seule sa clé privée peut déchiffrer. Idéal pour les sauvegardes automatisées sans passphrase en clair.",
        commandes: [
          { os: "linux", cmd: "gpg --full-generate-key", commentaire: "Générer une paire de clés RSA 4096 bits (choisir RSA, 4096, expiration selon besoin)" },
          { os: "linux", cmd: "gpg --list-keys", commentaire: "Lister les clés dans le trousseau — noter l'email associé" },
          { os: "linux", cmd: "gpg --encrypt --recipient 'admin@lab.local' --output /backup/backup-test.enc.gpg /tmp/backup-test.tar.gz", commentaire: "Chiffrer avec la clé publique de admin@lab.local" },
          { os: "linux", cmd: "gpg --decrypt /backup/backup-test.enc.gpg > /tmp/backup-decrypte2.tar.gz", commentaire: "Déchiffrer avec la clé privée (demande le mot de passe de la clé)" }
        ],
        erreurs_courantes: [
          { symptome: "gpg: no public key — encryption failed", cause: "La clé publique du destinataire n'est pas dans le trousseau", solution: "Vérifier avec gpg --list-keys que la clé existe. Si non, l'importer : gpg --import cle-publique.asc" }
        ]
      },
      {
        titre: "Étape 3 — Sauvegarde automatisée avec GPG sans interaction",
        contexte: "Pour les scripts automatisés, on utilise --batch et --passphrase-file pour éviter la saisie interactive de la passphrase.",
        commandes: [
          { os: "linux", cmd: "# Stocker la passphrase dans un fichier protégé :\necho 'MaPassphraseSecrete' > /root/.gpg-passphrase\nchmod 600 /root/.gpg-passphrase", commentaire: "Fichier de passphrase lisible uniquement par root" },
          { os: "linux", cmd: "# Chiffrement non-interactif dans un script :\ngpg --batch --passphrase-file /root/.gpg-passphrase --symmetric --cipher-algo AES256 --output /backup/auto-$(date +%Y%m%d).tar.gz.gpg /tmp/backup-test.tar.gz", commentaire: "Chiffrement automatique sans interaction utilisateur" },
          { os: "linux", cmd: "# Exporter la clé publique pour la partager :\ngpg --export --armor 'admin@lab.local' > /backup/cle-publique-admin.asc", commentaire: "Exporter la clé publique pour l'importer sur d'autres machines" },
          { os: "linux", cmd: "# Sauvegarder la clé privée (CRITIQUE — stocker hors site) :\ngpg --export-secret-keys --armor 'admin@lab.local' > /secure/cle-privee-admin.asc\nchmod 600 /secure/cle-privee-admin.asc", commentaire: "Exporter la clé privée — la conserver en lieu sûr hors site" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "gpg --symmetric chiffre l'archive et crée un .gpg",
      "gpg --decrypt restaure l'archive originale intacte",
      "Paire de clés GPG générée et visible dans gpg --list-keys",
      "Chiffrement asymétrique avec clé publique fonctionnel",
      "Script automatisé avec --passphrase-file exécuté sans interaction",
      "Clé publique exportée en .asc",
      "Clé privée sauvegardée en lieu sûr"
    ],
    tags: ["gpg", "chiffrement", "aes256", "cle-publique", "securite", "sauvegarde", "asymetrique"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 96,
    titre: "MinIO — stockage objet S3 compatible auto-hébergé",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Déployer MinIO, un serveur de stockage objet compatible S3, pour héberger ses propres sauvegardes cloud en local. MinIO est utilisé comme destination par Restic, Duplicati, Veeam et rclone. On configure le serveur, crée des buckets et interagit avec l'API S3.",
    objectifs: [
      "Déployer MinIO via Docker",
      "Créer des buckets et des politiques d'accès",
      "Interagir avec MinIO via le client mc (MinIO Client)",
      "Configurer Restic pour utiliser MinIO comme backend",
      "Comprendre les concepts clés S3 (bucket, object, access key)"
    ],
    prerequis: [
      { type: "vm", nom: "VM Linux avec Docker installé" },
      { type: "vm", nom: "Au moins 10 Go d'espace disque disponible" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Déployer MinIO avec Docker",
        contexte: "MinIO s'installe en une commande Docker. Il expose deux ports : 9000 (API S3) et 9001 (console web).",
        commandes: [
          { os: "linux", cmd: "mkdir -p /data/minio\ndocker run -d --name minio -p 9000:9000 -p 9001:9001 -v /data/minio:/data -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin123 --restart always quay.io/minio/minio server /data --console-address ':9001'", commentaire: "Lancer MinIO — API sur 9000, console web sur 9001" },
          { os: "linux", cmd: "docker ps | grep minio\ncurl http://localhost:9000/minio/health/live", commentaire: "Vérifier que MinIO est actif et répond" },
          { os: "linux", cmd: "# Accéder à la console web :\n# http://IP-VM:9001\n# Login : minioadmin / minioadmin123", commentaire: "Interface web MinIO accessible sur le port 9001" }
        ],
        erreurs_courantes: [
          { symptome: "MinIO démarre mais la console web est inaccessible", cause: "--console-address non spécifié ou port 9001 non exposé", solution: "Vérifier que le run Docker inclut -p 9001:9001 ET --console-address ':9001'" }
        ]
      },
      {
        titre: "Étape 2 — Installer mc et créer des buckets",
        contexte: "mc (MinIO Client) est l'outil CLI pour interagir avec MinIO et tout stockage S3 compatible. On crée un bucket dédié aux sauvegardes.",
        commandes: [
          { os: "linux", cmd: "wget https://dl.min.io/client/mc/release/linux-amd64/mc\nchmod +x mc && sudo mv mc /usr/local/bin/\nmc --version", commentaire: "Installer le client MinIO mc" },
          { os: "linux", cmd: "mc alias set local http://localhost:9000 minioadmin minioadmin123", commentaire: "Configurer l'alias 'local' pointant vers notre MinIO" },
          { os: "linux", cmd: "mc mb local/backups\nmc mb local/restic-repo", commentaire: "Créer deux buckets : un pour les backups généraux, un pour Restic" },
          { os: "linux", cmd: "mc ls local/", commentaire: "Lister les buckets créés" },
          { os: "linux", cmd: "# Uploader un fichier de test :\necho 'test backup' > /tmp/test.txt\nmc cp /tmp/test.txt local/backups/test.txt\nmc ls local/backups/", commentaire: "Tester l'upload et le listing d'objets" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Configurer Restic avec MinIO comme backend",
        contexte: "On configure Restic pour utiliser MinIO comme destination de sauvegarde via le protocole S3.",
        commandes: [
          { os: "linux", cmd: "export AWS_ACCESS_KEY_ID=minioadmin\nexport AWS_SECRET_ACCESS_KEY=minioadmin123\nexport RESTIC_REPOSITORY=s3:http://localhost:9000/restic-repo\nexport RESTIC_PASSWORD=MonMotDePasse", commentaire: "Variables d'environnement pour Restic avec MinIO" },
          { os: "linux", cmd: "restic init", commentaire: "Initialiser le dépôt Restic dans le bucket MinIO" },
          { os: "linux", cmd: "restic backup /home/ --tag minio-backup", commentaire: "Sauvegarder /home vers MinIO via Restic" },
          { os: "linux", cmd: "restic snapshots", commentaire: "Vérifier les snapshots dans le dépôt MinIO" },
          { os: "linux", cmd: "mc ls local/restic-repo/", commentaire: "Observer les objets créés par Restic dans le bucket MinIO" }
        ],
        erreurs_courantes: [
          { symptome: "restic init : RequestError: send request failed — connection refused", cause: "MinIO non accessible ou mauvaise URL S3", solution: "Vérifier que MinIO tourne sur le port 9000 et que l'URL utilise http:// (non https) pour MinIO sans TLS" }
        ]
      },
      {
        titre: "Étape 4 — Politique de versioning et lifecycle",
        contexte: "MinIO supporte le versioning S3 (garder toutes les versions d'un objet) et les règles de lifecycle (supprimer automatiquement les anciens objets).",
        commandes: [
          { os: "linux", cmd: "mc version enable local/backups", commentaire: "Activer le versioning sur le bucket backups" },
          { os: "linux", cmd: "# Définir une règle de lifecycle (supprimer après 30 jours) :\nmc ilm add --expiry-days 30 local/backups", commentaire: "Expiration automatique des objets après 30 jours" },
          { os: "linux", cmd: "mc ilm ls local/backups", commentaire: "Vérifier les règles de lifecycle configurées" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "docker ps : conteneur minio actif",
      "curl http://localhost:9000/minio/health/live : retourne 200",
      "Console web MinIO accessible sur port 9001",
      "mc ls local/ : buckets backups et restic-repo présents",
      "restic init dans le bucket MinIO réussit",
      "restic backup : snapshots visibles dans restic snapshots",
      "mc ls local/restic-repo/ : objets Restic présents dans MinIO"
    ],
    tags: ["minio", "s3", "stockage-objet", "docker", "restic", "cloud-prive", "sauvegarde"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 97,
    titre: "rclone — synchronisation multi-cloud et multi-destinations",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 60,
    description: "Utiliser rclone pour synchroniser et sauvegarder des données vers plus de 40 providers cloud et stockages distants. Configuration de backends locaux, SFTP, S3/MinIO et Google Drive. Synchronisation, copie et montage de stockages distants comme systèmes de fichiers.",
    objectifs: [
      "Installer rclone et comprendre ses commandes essentielles",
      "Configurer un backend SFTP et S3/MinIO",
      "Synchroniser des données vers plusieurs destinations",
      "Utiliser rclone mount pour monter un stockage distant",
      "Chiffrer les données avec le backend crypt de rclone"
    ],
    prerequis: [
      { type: "vm", nom: "VM Linux Debian 12 ou Ubuntu 22.04" },
      { type: "vm", nom: "Serveur SFTP ou MinIO accessible (TP MinIO id:96 recommandé)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation et configuration des remotes",
        contexte: "Un remote rclone est une configuration de connexion vers un stockage distant. On peut en avoir plusieurs et les nommer librement.",
        commandes: [
          { os: "linux", cmd: "sudo apt install rclone -y\nrclone version", commentaire: "Installer rclone" },
          { os: "linux", cmd: "rclone config", commentaire: "Lancer l'assistant interactif de configuration des remotes" },
          { os: "linux", cmd: "# Configuration SFTP (non-interactive) :\nrclone config create sftp-nas sftp host=192.168.56.20 user=backup port=22 key_file=/root/.ssh/backup_key", commentaire: "Configurer un remote SFTP vers le NAS" },
          { os: "linux", cmd: "# Configuration S3/MinIO :\nrclone config create minio s3 provider=Minio endpoint=http://localhost:9000 access_key_id=minioadmin secret_access_key=minioadmin123", commentaire: "Configurer un remote MinIO comme backend S3" },
          { os: "linux", cmd: "rclone listremotes", commentaire: "Lister tous les remotes configurés" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Commandes essentielles rclone",
        contexte: "rclone propose plusieurs modes : copy (copier sans supprimer), sync (synchroniser avec suppression), move (déplacer) et check (vérifier).",
        commandes: [
          { os: "linux", cmd: "rclone copy /srv/production/ sftp-nas:backup/prod/ --progress", commentaire: "Copier vers le NAS SFTP — ne supprime pas les fichiers existants" },
          { os: "linux", cmd: "rclone sync /srv/production/ minio:backups/prod/ --progress", commentaire: "Synchroniser vers MinIO — supprime les fichiers non présents en source" },
          { os: "linux", cmd: "rclone ls sftp-nas:backup/prod/", commentaire: "Lister les fichiers sur le NAS distant" },
          { os: "linux", cmd: "rclone check /srv/production/ sftp-nas:backup/prod/", commentaire: "Vérifier que source et destination sont identiques (checksums)" },
          { os: "linux", cmd: "rclone size sftp-nas:backup/", commentaire: "Afficher la taille totale du stockage distant" }
        ],
        erreurs_courantes: [
          { symptome: "rclone sync supprime des fichiers inattendus", cause: "sync rend la destination identique à la source — les fichiers only-destination sont supprimés", solution: "Utiliser --dry-run d'abord pour voir ce qui serait supprimé. Ou utiliser rclone copy si on ne veut pas de suppression." }
        ]
      },
      {
        titre: "Étape 3 — Backend crypt pour chiffrement transparent",
        contexte: "Le backend crypt de rclone chiffre les données à la volée avant envoi. Il peut s'empiler sur n'importe quel autre remote.",
        commandes: [
          { os: "linux", cmd: "# Créer un remote chiffré par-dessus MinIO :\nrclone config create minio-crypt crypt remote=minio:backups/chiffre password=$(rclone obscure MonMotDePasseSecret) password2=$(rclone obscure SelCryptographique)", commentaire: "Remote crypt encapsulant MinIO — chiffre les noms de fichiers et le contenu" },
          { os: "linux", cmd: "rclone copy /srv/production/ minio-crypt: --progress", commentaire: "Copier vers MinIO avec chiffrement transparent" },
          { os: "linux", cmd: "mc ls local/backups/chiffre/", commentaire: "Observer : les noms de fichiers sont chiffrés dans MinIO" },
          { os: "linux", cmd: "rclone ls minio-crypt:", commentaire: "Via rclone : les noms sont déchiffrés automatiquement" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Automatisation et planification",
        contexte: "On crée un script rclone multi-destinations et on le planifie avec cron pour une sauvegarde 3-2-1 automatisée.",
        commandes: [
          { os: "linux", cmd: "sudo nano /usr/local/bin/rclone-backup.sh", commentaire: "Créer le script de sauvegarde multi-destinations" },
          { os: "linux", cmd: "#!/bin/bash\nLOG=/var/log/rclone-backup.log\nDATE=$(date '+%Y-%m-%d %H:%M')\necho \"[$DATE] Debut sauvegarde\" >> $LOG\n# Copie vers NAS\nrclone sync /srv/production/ sftp-nas:backup/prod/ --log-file=$LOG --log-level INFO\n# Copie vers MinIO chiffre\nrclone sync /srv/production/ minio-crypt: --log-file=$LOG --log-level INFO\necho \"[$DATE] Sauvegarde terminee\" >> $LOG", commentaire: "Script synchronisant vers NAS ET MinIO en une passe" },
          { os: "linux", cmd: "sudo chmod +x /usr/local/bin/rclone-backup.sh\necho '0 3 * * * root /usr/local/bin/rclone-backup.sh' | sudo tee /etc/cron.d/rclone-backup", commentaire: "Planifier la sauvegarde multi-cloud à 3h chaque nuit" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "rclone listremotes : sftp-nas et minio configurés",
      "rclone copy vers sftp-nas réussit",
      "rclone sync vers minio réussit",
      "rclone check : aucune différence entre source et destination",
      "Backend minio-crypt : fichiers chiffrés visibles dans MinIO",
      "Script rclone-backup.sh synchronise vers les deux destinations",
      "Cron planifié et vérifié"
    ],
    tags: ["rclone", "cloud", "sftp", "s3", "minio", "chiffrement", "synchronisation", "sauvegarde"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 98,
    titre: "ZFS — pool, datasets et snapshots",
    categorie: "sauvegardes",
    niveau: "avancé",
    duree: 90,
    description: "Découvrir ZFS (Zettabyte File System), le système de fichiers avancé qui intègre nativement la gestion de volumes, la compression, la déduplication, les checksums d'intégrité et les snapshots instantanés. Base indispensable avant le TP ZFS send/receive.",
    objectifs: [
      "Créer un pool ZFS sur des disques virtuels",
      "Comprendre les datasets et leurs propriétés",
      "Activer la compression et la déduplication",
      "Créer et gérer des snapshots ZFS",
      "Surveiller l'intégrité avec zpool scrub"
    ],
    prerequis: [
      { type: "vm", nom: "VM Ubuntu 22.04 ou Debian 12 avec 3 disques secondaires" },
      { type: "logiciel", nom: "ZFS on Linux : sudo apt install zfsutils-linux" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer ZFS et créer un pool",
        contexte: "Un pool ZFS regroupe un ou plusieurs disques. On peut créer différentes topologies : stripe (RAID0), mirror (RAID1), raidz (RAID5), raidz2 (RAID6).",
        commandes: [
          { os: "linux", cmd: "sudo apt install zfsutils-linux -y\nzfs --version", commentaire: "Installer ZFS on Linux" },
          { os: "linux", cmd: "lsblk", commentaire: "Identifier les disques disponibles (/dev/sdb, /dev/sdc, /dev/sdd)" },
          { os: "linux", cmd: "sudo zpool create tank mirror /dev/sdb /dev/sdc", commentaire: "Créer un pool 'tank' en mode miroir (RAID1) sur sdb et sdc" },
          { os: "linux", cmd: "sudo zpool status tank", commentaire: "Vérifier l'état du pool — ONLINE = sain" },
          { os: "linux", cmd: "sudo zpool list", commentaire: "Voir la taille, l'espace utilisé et le statut du pool" },
          { os: "linux", cmd: "df -h /tank", commentaire: "ZFS monte automatiquement le pool sur /tank" }
        ],
        erreurs_courantes: [
          { symptome: "cannot create pool : no such device", cause: "Les disques sont déjà utilisés ou ont une signature de pool existante", solution: "sudo wipefs -a /dev/sdb /dev/sdc pour effacer toutes les signatures, puis recréer le pool" }
        ]
      },
      {
        titre: "Étape 2 — Datasets et propriétés",
        contexte: "Les datasets ZFS sont des systèmes de fichiers imbriqués avec leurs propres propriétés héritables (compression, quota, mountpoint). Ils remplacent les partitions traditionnelles.",
        commandes: [
          { os: "linux", cmd: "sudo zfs create tank/data", commentaire: "Créer un dataset 'data' dans le pool tank" },
          { os: "linux", cmd: "sudo zfs create tank/data/web\nsudo zfs create tank/data/db", commentaire: "Créer des sous-datasets pour web et db" },
          { os: "linux", cmd: "sudo zfs set compression=lz4 tank/data", commentaire: "Activer la compression LZ4 sur data (héritée par web et db)" },
          { os: "linux", cmd: "sudo zfs set quota=10G tank/data/web", commentaire: "Limiter web à 10 Go maximum" },
          { os: "linux", cmd: "sudo zfs get compression,quota,compressratio tank/data/web", commentaire: "Vérifier les propriétés et le ratio de compression effectif" },
          { os: "linux", cmd: "sudo zfs list", commentaire: "Lister tous les datasets avec leur utilisation" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Snapshots ZFS",
        contexte: "Les snapshots ZFS sont instantanés et quasi sans coût initial. Ils ne consomment de l'espace que pour stocker les blocs modifiés après leur création.",
        commandes: [
          { os: "linux", cmd: "sudo zfs snapshot tank/data/web@avant-maj", commentaire: "Créer un snapshot instantané du dataset web" },
          { os: "linux", cmd: "sudo zfs list -t snapshot", commentaire: "Lister tous les snapshots" },
          { os: "linux", cmd: "# Simuler une modification :\necho 'contenu web' | sudo tee /tank/data/web/index.html\nsudo rm /tank/data/web/index.html", commentaire: "Créer puis supprimer un fichier" },
          { os: "linux", cmd: "sudo zfs rollback tank/data/web@avant-maj", commentaire: "Restaurer le dataset à l'état du snapshot" },
          { os: "linux", cmd: "ls /tank/data/web/", commentaire: "index.html est restauré" },
          { os: "linux", cmd: "# Accéder directement aux fichiers d'un snapshot :\nls /tank/data/web/.zfs/snapshot/avant-maj/", commentaire: "Le répertoire .zfs/snapshot permet de naviguer dans les snapshots sans rollback" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Intégrité et scrub",
        contexte: "ZFS calcule des checksums pour tous les blocs. zpool scrub vérifie l'intégrité de tous les données et répare automatiquement depuis le miroir si une corruption est détectée.",
        commandes: [
          { os: "linux", cmd: "sudo zpool scrub tank", commentaire: "Lancer un scrub d'intégrité sur le pool" },
          { os: "linux", cmd: "sudo zpool status tank", commentaire: "Vérifier l'avancement et les résultats du scrub" },
          { os: "linux", cmd: "# Planifier un scrub hebdomadaire :\necho '0 2 * * 0 root zpool scrub tank' | sudo tee /etc/cron.d/zfs-scrub", commentaire: "Scrub automatique chaque dimanche à 2h" },
          { os: "linux", cmd: "sudo zpool iostat tank 1 5", commentaire: "Statistiques d'I/O du pool en temps réel" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "zpool status tank : ONLINE, mirror avec sdb et sdc",
      "zfs list : datasets tank/data, tank/data/web, tank/data/db visibles",
      "zfs get compression tank/data/web : lz4 activé (hérité)",
      "Snapshot tank/data/web@avant-maj créé instantanément",
      "zfs rollback restaure les données supprimées",
      ".zfs/snapshot/ accessible en lecture seule",
      "zpool scrub tank termine sans erreur"
    ],
    tags: ["zfs", "pool", "dataset", "snapshot", "compression", "scrub", "intégrité", "linux"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 99,
    titre: "ZFS send/receive — sauvegarde incrémentale via snapshots",
    categorie: "sauvegardes",
    niveau: "avancé",
    duree: 75,
    description: "Utiliser ZFS send/receive pour la sauvegarde et la réplication incrémentale de datasets entre deux systèmes. zfs send exporte un snapshot (ou le delta entre deux snapshots) que zfs receive importe sur le serveur de sauvegarde. Technique utilisée en production pour la réplication ZFS.",
    objectifs: [
      "Envoyer un snapshot ZFS complet vers un serveur distant",
      "Effectuer des envois incrémentaux (delta entre snapshots)",
      "Automatiser la réplication ZFS via SSH",
      "Gérer la politique de rétention des snapshots",
      "Utiliser sanoid/syncoid pour la réplication automatisée"
    ],
    prerequis: [
      { type: "vm", nom: "VM source avec ZFS et pool 'tank' configuré (suite du TP id:98)" },
      { type: "vm", nom: "VM destination avec ZFS installé (pool 'backup')" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Envoi complet d'un snapshot",
        contexte: "zfs send génère un flux de données représentant un snapshot. Ce flux peut être redirigé vers un fichier ou envoyé directement à zfs receive sur une machine distante.",
        commandes: [
          { os: "linux", cmd: "# Sur la VM source :\nsudo zfs snapshot tank/data/web@snap1", commentaire: "Créer le premier snapshot" },
          { os: "linux", cmd: "# Envoi vers un fichier local (test) :\nsudo zfs send tank/data/web@snap1 | gzip > /backup/web-snap1.zfs.gz", commentaire: "Exporter le snapshot vers un fichier compressé" },
          { os: "linux", cmd: "# Envoi directement vers la VM destination via SSH :\nsudo zfs send tank/data/web@snap1 | ssh backup@192.168.56.20 'sudo zfs receive backup/web'", commentaire: "Envoyer le snapshot vers le pool 'backup' de la VM distante" },
          { os: "linux", cmd: "# Sur la VM destination :\nsudo zfs list\nsudo zfs list -t snapshot", commentaire: "Vérifier que backup/web@snap1 est bien reçu" }
        ],
        erreurs_courantes: [
          { symptome: "cannot receive : pool backup does not exist", cause: "Le pool de destination n'existe pas", solution: "Créer le pool sur la VM destination avant de recevoir : sudo zpool create backup /dev/sdb" }
        ]
      },
      {
        titre: "Étape 2 — Envoi incrémental (delta)",
        contexte: "L'envoi incrémental (-i) n'envoie que les blocs modifiés entre deux snapshots. C'est la clé de l'efficacité de ZFS send — seules les différences sont transmises.",
        commandes: [
          { os: "linux", cmd: "# Ajouter des données et créer un second snapshot :\necho 'nouvelles données' | sudo tee /tank/data/web/nouveau.html\nsudo zfs snapshot tank/data/web@snap2", commentaire: "Modifier des données et créer snap2" },
          { os: "linux", cmd: "# Envoi incrémental snap1 -> snap2 :\nsudo zfs send -i tank/data/web@snap1 tank/data/web@snap2 | ssh backup@192.168.56.20 'sudo zfs receive backup/web'", commentaire: "-i : envoyer uniquement le delta entre snap1 et snap2 (beaucoup plus petit)" },
          { os: "linux", cmd: "# Vérifier sur la destination :\nssh backup@192.168.56.20 'sudo zfs list -t snapshot backup/web'", commentaire: "snap1 et snap2 doivent être présents sur la destination" }
        ],
        erreurs_courantes: [
          { symptome: "cannot receive incremental stream : destination has been modified", cause: "Des modifications ont été faites sur le dataset destination", solution: "La destination ZFS doit être en lecture seule (readonly=on) pour la réplication. sudo zfs set readonly=on backup/web" }
        ]
      },
      {
        titre: "Étape 3 — Automatisation avec sanoid/syncoid",
        contexte: "Sanoid gère automatiquement la création et la rétention des snapshots ZFS. Syncoid gère la réplication automatique. Ce sont les outils standards pour ZFS en production.",
        commandes: [
          { os: "linux", cmd: "sudo apt install sanoid -y", commentaire: "Installer sanoid (inclut syncoid)" },
          { os: "linux", cmd: "sudo nano /etc/sanoid/sanoid.conf", commentaire: "Configurer la politique de snapshots" },
          { os: "linux", cmd: "# Contenu sanoid.conf :\n# [tank/data/web]\n# use_template = production\n# [template_production]\n# frequently = 0\n# hourly = 24\n# daily = 30\n# monthly = 3\n# yearly = 0\n# autosnap = yes\n# autoprune = yes", commentaire: "24 snapshots horaires, 30 quotidiens, 3 mensuels — gestion automatique" },
          { os: "linux", cmd: "sudo sanoid --cron", commentaire: "Tester sanoid manuellement (normalement déclenché par cron)" },
          { os: "linux", cmd: "sudo syncoid tank/data/web backup@192.168.56.20:backup/web", commentaire: "Répliquer avec syncoid — gère automatiquement l'incrémental" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "zfs send snap1 vers fichier .zfs.gz réussit",
      "zfs receive sur VM destination : backup/web@snap1 présent",
      "Envoi incrémental snap1->snap2 : taille du flux < envoi complet",
      "backup/web@snap1 ET snap2 présents sur la destination",
      "sanoid.conf configuré avec politique de rétention",
      "syncoid réplique vers la VM destination sans erreur"
    ],
    tags: ["zfs", "send", "receive", "replication", "incremental", "sanoid", "syncoid", "sauvegarde"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 100,
    titre: "Azure Backup — sauvegarde cloud Microsoft enterprise",
    categorie: "sauvegardes",
    niveau: "avancé",
    duree: 75,
    description: "Configurer Azure Backup pour protéger des VMs Azure et des serveurs on-premises via le Recovery Services Vault. Comprendre les politiques de sauvegarde, la gestion de la rétention, la restauration de fichiers et la supervision depuis le portail Azure.",
    objectifs: [
      "Créer un Recovery Services Vault dans Azure",
      "Configurer la sauvegarde d'une VM Azure",
      "Déployer l'agent MARS pour les serveurs on-premises",
      "Définir une politique de sauvegarde avec rétention",
      "Restaurer des fichiers individuels depuis Azure"
    ],
    prerequis: [
      { type: "logiciel", nom: "Compte Azure (gratuit avec 200$ de crédits)", lien: "https://azure.microsoft.com/free" },
      { type: "logiciel", nom: "Azure CLI installé ou accès au portail Azure" },
      { type: "vm", nom: "VM Azure créée (Windows Server 2022 ou Ubuntu)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer le Recovery Services Vault",
        contexte: "Le Recovery Services Vault est le conteneur Azure qui stocke les sauvegardes et les points de restauration. Il est régionalement localisé — il doit être dans la même région que les ressources à protéger.",
        commandes: [
          { os: "both", cmd: "# Via Azure CLI :\naz login\naz group create --name rg-backup --location westeurope", commentaire: "Se connecter à Azure et créer un groupe de ressources" },
          { os: "both", cmd: "az backup vault create --name vault-lab-backup --resource-group rg-backup --location westeurope", commentaire: "Créer le Recovery Services Vault" },
          { os: "both", cmd: "az backup vault show --name vault-lab-backup --resource-group rg-backup", commentaire: "Vérifier la création du vault" },
          { os: "both", cmd: "# Ou via le portail Azure :\n# Rechercher Recovery Services Vault > Créer\n# Subscription, Resource Group, Name, Region\n# Review + Create", commentaire: "Alternative via le portail web Azure" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Configurer la sauvegarde d'une VM Azure",
        contexte: "Azure Backup peut protéger les VMs Azure nativement via des snapshots cohérents (application-consistent grâce à VSS/pre-post scripts). Aucun agent n'est requis pour les VMs Azure.",
        commandes: [
          { os: "both", cmd: "# Créer une politique de sauvegarde :\naz backup policy create --backup-management-type AzureIaasVM --name pol-daily --vault-name vault-lab-backup --resource-group rg-backup --policy '{\"schedulePolicy\":{\"schedulePolicyType\":\"SimpleSchedulePolicy\",\"scheduleRunFrequency\":\"Daily\",\"scheduleRunTimes\":[\"2026-06-27T02:00:00Z\"]},\"retentionPolicy\":{\"retentionPolicyType\":\"LongTermRetentionPolicy\",\"dailySchedule\":{\"retentionTimes\":[\"2026-06-27T02:00:00Z\"],\"retentionDuration\":{\"count\":30,\"durationType\":\"Days\"}}}}'", commentaire: "Politique quotidienne avec 30 jours de rétention" },
          { os: "both", cmd: "# Activer la sauvegarde sur une VM :\naz backup protection enable-for-vm --resource-group rg-backup --vault-name vault-lab-backup --vm ma-vm-azure --policy-name pol-daily", commentaire: "Associer la VM à la politique de sauvegarde" },
          { os: "both", cmd: "# Lancer une sauvegarde manuelle immédiate :\naz backup protection backup-now --resource-group rg-backup --vault-name vault-lab-backup --container-name ma-vm-azure --item-name ma-vm-azure --backup-management-type AzureIaasVM", commentaire: "Déclencher une sauvegarde à la demande" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Agent MARS pour serveurs on-premises",
        contexte: "L'agent MARS (Microsoft Azure Recovery Services) permet de sauvegarder des serveurs physiques ou des VMs Hyper-V/VMware on-premises vers Azure Backup sans nécessiter Azure Site Recovery.",
        commandes: [
          { os: "windows", cmd: "# Télécharger l'agent MARS depuis le portail :\n# Recovery Services Vault > Backup > On-Premises\n# Télécharger l'agent (MARSAgentInstaller.exe)\n# Installer et enregistrer le serveur avec les credentials du vault", commentaire: "Installer l'agent MARS sur le serveur on-premises" },
          { os: "windows", cmd: "# Configurer la sauvegarde via l'interface MARS :\n# Schedule Backup > Add Items > sélectionner dossiers\n# Spécifier l'heure et la rétention\n# Définir le chiffrement (passphrase obligatoire)", commentaire: "Configurer les éléments à sauvegarder via l'agent MARS" }
        ],
        erreurs_courantes: [
          { symptome: "L'agent MARS ne peut pas se connecter au vault", cause: "Proxy ou pare-feu bloque les URLs Azure Backup", solution: "Autoriser *.backup.windowsazure.com et *.blob.core.windows.net sur le pare-feu. Configurer le proxy dans les paramètres de l'agent MARS." }
        ]
      },
      {
        titre: "Étape 4 — Restauration de fichiers individuels",
        contexte: "Azure Backup permet de restaurer des fichiers individuels depuis un point de restauration sans restaurer toute la VM — via le mécanisme de File Recovery.",
        commandes: [
          { os: "both", cmd: "# Via le portail Azure :\n# Recovery Services Vault > Backup Items > Azure Virtual Machine\n# Sélectionner la VM > File Recovery\n# Choisir un point de restauration\n# Télécharger le script de montage (.py pour Linux, .exe pour Windows)", commentaire: "Initier la récupération de fichiers depuis le portail" },
          { os: "linux", cmd: "# Exécuter le script de montage sur la VM :\npython3 script-montage-azure.py\n# Les disques de sauvegarde sont montés dans /restore/...\nls /restore/\ncp /restore/var/www/html/index.php /var/www/html/index.php.restored", commentaire: "Monter les disques de sauvegarde et récupérer des fichiers spécifiques" },
          { os: "both", cmd: "# Via Azure CLI :\naz backup restore restore-disks --resource-group rg-backup --vault-name vault-lab-backup --container-name ma-vm-azure --item-name ma-vm-azure --rp-name <recovery-point-name> --storage-account mon-storage", commentaire: "Restaurer les disques vers un compte de stockage Azure" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Recovery Services Vault créé dans la bonne région",
      "Politique pol-daily créée avec rétention 30 jours",
      "Sauvegarde VM Azure activée et première sauvegarde déclenchée",
      "az backup job list : job de sauvegarde Completed",
      "File Recovery : script de montage téléchargé et disques montés",
      "Fichier restauré depuis le point de restauration Azure"
    ],
    tags: ["azure", "azure-backup", "cloud", "recovery-vault", "mars", "microsoft", "enterprise", "sauvegarde"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 101,
    titre: "DR Drill — test complet de restauration et documentation PRA",
    categorie: "sauvegardes",
    niveau: "avancé",
    duree: 90,
    description: "Conduire un exercice complet de reprise après sinistre (Disaster Recovery Drill) : simuler une perte totale du système, exécuter le plan de reprise, mesurer les temps réels RTO/RPO et documenter les résultats. Un DR Drill annuel est une obligation dans les référentiels ISO 27001 et SOC 2.",
    objectifs: [
      "Définir et documenter un plan de reprise d'activité (PRA)",
      "Simuler une perte totale du serveur de production",
      "Exécuter la procédure de restauration complète",
      "Mesurer les RTO et RPO réels vs objectifs",
      "Documenter les résultats et identifier les axes d'amélioration"
    ],
    prerequis: [
      { type: "vm", nom: "VM de production avec données et services configurés" },
      { type: "vm", nom: "Sauvegardes récentes disponibles (Restic, Veeam, ou tar+cron)" },
      { type: "logiciel", nom: "VM vierge pour la restauration (simule le nouveau serveur)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Documenter le plan de reprise (PRA)",
        contexte: "Avant l'exercice, on documente l'inventaire des systèmes critiques, les dépendances, les contacts d'urgence et la procédure de restauration étape par étape. Un PRA non documenté n'est pas un PRA.",
        commandes: [
          { os: "linux", cmd: "# Inventaire des services critiques :\nmkdir -p /doc/pra\ncat > /doc/pra/inventaire.md << 'EOF'\n# Inventaire systèmes critiques\n## Serveur web (192.168.56.10)\n- OS : Debian 12\n- Services : nginx, php-fpm, mariadb\n- Données : /var/www (20 Go), /var/lib/mysql (5 Go)\n- RPO objectif : 24h\n- RTO objectif : 2h\n## Sauvegarde\n- Outil : Restic vers MinIO\n- Fréquence : quotidienne à 2h\n- Dernier test de restauration : jamais\nEOF", commentaire: "Documenter l'inventaire et les objectifs RTO/RPO" },
          { os: "linux", cmd: "# Procédure de restauration documentée :\ncat > /doc/pra/procedure-restauration.md << 'EOF'\n# Procédure de restauration\n1. Provisionner une nouvelle VM (Debian 12)\n2. Installer les paquets requis (nginx, php-fpm, mariadb)\n3. Restaurer /var/www depuis Restic\n4. Restaurer la base MariaDB depuis le dump\n5. Mettre à jour le DNS / load balancer\n6. Vérifier les services\n7. Valider avec les tests fonctionnels\nEOF", commentaire: "Rédiger la procédure pas à pas avant l'exercice" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Simuler le sinistre",
        contexte: "On simule la perte totale du serveur de production. L'heure de début est notée — le chronomètre RTO est lancé.",
        commandes: [
          { os: "linux", cmd: "# Noter l'heure de début du sinistre :\necho \"SINISTRE SIMULÉ : $(date)\" | tee /doc/pra/dr-drill-$(date +%Y%m%d).log", commentaire: "Horodater le début de l'exercice" },
          { os: "linux", cmd: "# Simuler la perte en arrêtant tous les services :\nsudo systemctl stop nginx php8.2-fpm mariadb\n# Corrompre les données de production :\nsudo rm -rf /var/www/html/*\nsudo mysql -u root -p -e 'DROP DATABASE webapp;'", commentaire: "Simuler la perte complète des services et données" },
          { os: "linux", cmd: "# Vérifier que tout est bien indisponible :\ncurl http://localhost\nmysql -u root -p -e 'SHOW DATABASES;'", commentaire: "Confirmer l'indisponibilité du service" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Exécuter la restauration",
        contexte: "On suit la procédure documentée et on note les heures de chaque étape pour mesurer le RTO réel.",
        commandes: [
          { os: "linux", cmd: "# Étape 1 : Réinstaller les services\nsudo apt install nginx php-fpm mariadb-server -y\necho \"[$(date)] Paquets installés\" >> /doc/pra/dr-drill-$(date +%Y%m%d).log", commentaire: "Réinstaller les prérequis et horodater" },
          { os: "linux", cmd: "# Étape 2 : Restaurer les données web depuis Restic\nexport RESTIC_REPOSITORY=s3:http://localhost:9000/restic-repo\nexport RESTIC_PASSWORD=MonMotDePasse\nrestic restore latest --target / --include '/var/www'\necho \"[$(date)] Données web restaurées\" >> /doc/pra/dr-drill-$(date +%Y%m%d).log", commentaire: "Restaurer /var/www depuis Restic" },
          { os: "linux", cmd: "# Étape 3 : Restaurer la base MariaDB\nmysql -u root -p -e 'CREATE DATABASE webapp;'\nzcat /backup/mysql/all-$(date +%Y%m%d)*.sql.gz | mysql -u root -p\necho \"[$(date)] Base MariaDB restaurée\" >> /doc/pra/dr-drill-$(date +%Y%m%d).log", commentaire: "Restaurer la base depuis le dump compressé" },
          { os: "linux", cmd: "# Étape 4 : Redémarrer les services\nsudo systemctl start nginx php8.2-fpm mariadb\ncurl http://localhost\necho \"[$(date)] Services redémarrés et validés\" >> /doc/pra/dr-drill-$(date +%Y%m%d).log", commentaire: "Redémarrer et valider la disponibilité" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Mesurer et documenter les résultats",
        contexte: "On calcule le RTO réel (durée de l'interruption) et le RPO réel (perte de données), on compare aux objectifs et on identifie les axes d'amélioration.",
        commandes: [
          { os: "linux", cmd: "cat /doc/pra/dr-drill-$(date +%Y%m%d).log", commentaire: "Afficher le journal horodaté du DR Drill" },
          { os: "linux", cmd: "# Calculer et documenter les métriques :\ncat >> /doc/pra/dr-drill-$(date +%Y%m%d).log << 'EOF'\n## Résultats\n- RTO réel : XX minutes (objectif : 120 min)\n- RPO réel : XX heures (objectif : 24h)\n## Points positifs\n- Procédure de restauration claire\n## Axes d'amélioration\n- Automatiser la restauration avec un script\n- Tester la restauration plus régulièrement\nEOF", commentaire: "Documenter les résultats, écarts et axes d'amélioration" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "PRA documenté : inventaire, procédure, objectifs RTO/RPO",
      "Heure du sinistre simulé notée dans le journal",
      "Services et données supprimés — indisponibilité confirmée",
      "Restauration Restic réussie : /var/www récupéré",
      "Base MariaDB restaurée : SHOW DATABASES affiche webapp",
      "Services nginx et MariaDB actifs après restauration",
      "RTO réel calculé et documenté vs objectif",
      "Rapport DR Drill finalisé avec axes d'amélioration"
    ],
    tags: ["dr-drill", "pra", "rto", "rpo", "restauration", "disaster-recovery", "iso27001", "sauvegarde"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 102,
    titre: "Sauvegarde GPO Active Directory — export et restauration",
    categorie: "sauvegardes",
    niveau: "intermédiaire",
    duree: 45,
    description: "Sauvegarder et restaurer les objets Active Directory critiques : GPO (Group Policy Objects), OU structure et utilisateurs. Utiliser les outils natifs Windows Server (Backup-GPO, ldifde, csvde) et les bonnes pratiques pour la protection de l'annuaire.",
    objectifs: [
      "Exporter les GPO avec PowerShell Backup-GPO",
      "Importer des GPO sur un nouveau DC ou après suppression accidentelle",
      "Exporter la structure OU avec ldifde",
      "Sauvegarder les objets utilisateurs avec csvde",
      "Automatiser la sauvegarde AD avec un script planifié"
    ],
    prerequis: [
      { type: "vm", nom: "VM Windows Server 2022 contrôleur de domaine (lab.local)" },
      { type: "logiciel", nom: "Module GroupPolicy PowerShell (inclus avec AD DS)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Sauvegarder les GPO",
        contexte: "Backup-GPO exporte les GPO dans un dossier structuré contenant les paramètres en XML. Chaque GPO a son propre sous-dossier avec un GUID unique.",
        commandes: [
          { os: "windows", cmd: "# Créer le dossier de sauvegarde :\nNew-Item -ItemType Directory -Force C:\\Backup\\GPO\\$(Get-Date -Format 'yyyy-MM-dd')", commentaire: "Créer le répertoire de sauvegarde daté" },
          { os: "windows", cmd: "# Sauvegarder toutes les GPO :\nBackup-Gpo -All -Path C:\\Backup\\GPO\\$(Get-Date -Format 'yyyy-MM-dd') -Comment 'Sauvegarde quotidienne'", commentaire: "Exporter toutes les GPO du domaine" },
          { os: "windows", cmd: "# Sauvegarder une GPO spécifique :\nBackup-Gpo -Name 'Restriction_Panneau' -Path C:\\Backup\\GPO\\$(Get-Date -Format 'yyyy-MM-dd')", commentaire: "Sauvegarder uniquement la GPO Restriction_Panneau" },
          { os: "windows", cmd: "Get-ChildItem C:\\Backup\\GPO\\$(Get-Date -Format 'yyyy-MM-dd')", commentaire: "Vérifier les GPO sauvegardées — un dossier par GPO avec son GUID" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Restaurer une GPO supprimée accidentellement",
        contexte: "On simule la suppression accidentelle d'une GPO et on la restaure depuis la sauvegarde.",
        commandes: [
          { os: "windows", cmd: "# Simuler la suppression :\nRemove-GPO -Name 'Restriction_Panneau' -Confirm:$false", commentaire: "Supprimer accidentellement la GPO" },
          { os: "windows", cmd: "Get-GPO -All | Where-Object {$_.DisplayName -eq 'Restriction_Panneau'}", commentaire: "Vérifier que la GPO est bien supprimée (résultat vide)" },
          { os: "windows", cmd: "# Restaurer depuis la sauvegarde :\n$backup = Get-GpoBackup -Name 'Restriction_Panneau' -Path C:\\Backup\\GPO\\$(Get-Date -Format 'yyyy-MM-dd')\nRestore-GPO -Name 'Restriction_Panneau' -BackupId $backup.Id -Path C:\\Backup\\GPO\\$(Get-Date -Format 'yyyy-MM-dd')", commentaire: "Restaurer la GPO depuis la sauvegarde" },
          { os: "windows", cmd: "Get-GPO -Name 'Restriction_Panneau'", commentaire: "Vérifier que la GPO est bien restaurée" }
        ],
        erreurs_courantes: [
          { symptome: "Restore-GPO : GPO not found in backup", cause: "Le nom dans Restore-GPO ne correspond pas au nom dans la sauvegarde", solution: "Utiliser Get-GpoBackup -All -Path ... pour lister les GPO dans la sauvegarde et récupérer le bon BackupId" }
        ]
      },
      {
        titre: "Étape 3 — Exporter la structure OU et les utilisateurs",
        contexte: "ldifde exporte la structure de l'annuaire en format LDIF standard. csvde exporte les objets en CSV pour traitement dans Excel ou réimport.",
        commandes: [
          { os: "windows", cmd: "# Exporter toute la structure AD en LDIF :\nldifde -f C:\\Backup\\AD\\structure-$(Get-Date -Format 'yyyy-MM-dd').ldf -s DC01", commentaire: "Export LDIF complet de l'AD (inclut OUs, utilisateurs, groupes)" },
          { os: "windows", cmd: "# Exporter uniquement les utilisateurs en CSV :\ncsvde -f C:\\Backup\\AD\\utilisateurs-$(Get-Date -Format 'yyyy-MM-dd').csv -r '(objectClass=user)' -l 'cn,sAMAccountName,mail,department'", commentaire: "Export CSV des utilisateurs avec attributs sélectionnés" },
          { os: "windows", cmd: "# Export PowerShell plus complet :\nGet-ADUser -Filter * -Properties * | Select-Object Name,SamAccountName,EmailAddress,Department,Enabled,DistinguishedName | Export-Csv C:\\Backup\\AD\\users-$(Get-Date -Format 'yyyy-MM-dd').csv -NoTypeInformation -Encoding UTF8", commentaire: "Export PowerShell avec tous les attributs utiles" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Script de sauvegarde AD automatisé",
        contexte: "On crée un script PowerShell complet qui sauvegarde GPO + export LDIF + utilisateurs CSV, et on le planifie chaque nuit.",
        commandes: [
          { os: "windows", cmd: "# backup-ad.ps1 :\n$DATE = Get-Date -Format 'yyyy-MM-dd'\n$BACKUP_ROOT = 'C:\\Backup\\AD'\n$GPO_PATH = \"$BACKUP_ROOT\\GPO\\$DATE\"\n$AD_PATH = \"$BACKUP_ROOT\\Export\\$DATE\"\nNew-Item -ItemType Directory -Force $GPO_PATH, $AD_PATH\n# Sauvegarder les GPO\nBackup-Gpo -All -Path $GPO_PATH -Comment 'Sauvegarde auto'\n# Exporter les utilisateurs\nGet-ADUser -Filter * -Properties * | Select-Object Name,SamAccountName,EmailAddress,Department,Enabled | Export-Csv \"$AD_PATH\\users.csv\" -NoTypeInformation -Encoding UTF8\n# Exporter les GPO en rapport HTML\nGet-GPO -All | Get-GPOReport -ReportType HTML -Path \"$AD_PATH\\gpo-report.html\"\nWrite-Host \"Sauvegarde AD terminee : $DATE\"", commentaire: "Script complet de sauvegarde AD : GPO + utilisateurs + rapport" },
          { os: "windows", cmd: "$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-File C:\\Scripts\\backup-ad.ps1'\n$trigger = New-ScheduledTaskTrigger -Daily -At '01:00'\nRegister-ScheduledTask -TaskName 'BackupActiveDirectory' -Action $action -Trigger $trigger -RunLevel Highest", commentaire: "Planifier la sauvegarde AD à 1h chaque nuit" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Backup-Gpo -All crée un dossier par GPO dans C:\\Backup\\GPO",
      "Suppression simulée de Restriction_Panneau réussie",
      "Restore-GPO restaure la GPO avec ses paramètres intacts",
      "ldifde génère un fichier .ldf avec la structure AD",
      "csvde ou Export-Csv génère un fichier CSV des utilisateurs",
      "Script backup-ad.ps1 exécuté sans erreur",
      "Tâche planifiée BackupActiveDirectory visible dans le Planificateur"
    ],
    tags: ["active-directory", "gpo", "backup-gpo", "ldifde", "csvde", "windows-server", "powershell", "sauvegarde"],
    date_ajout: "2026-06-27",
    source: "École"
  }

];
