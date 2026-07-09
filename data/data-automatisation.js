// TP & Labs IT — Catégorie : automatisation
// 5 TP(s)

const LABS_AUTOMATISATION = [
  {
    id: 17,
    titre: "Docker — installation et premiers conteneurs sur Linux",
    categorie: "automatisation",
    niveau: "débutant",
    duree: 75,
    description: "Installer Docker Engine sur Debian/Ubuntu, comprendre l'architecture (images, conteneurs, registry), lancer les premiers conteneurs, gérer leur cycle de vie et créer une première image personnalisée avec un Dockerfile.",
    objectifs: [
      "Installer Docker Engine depuis le dépôt officiel",
      "Comprendre la différence entre image et conteneur",
      "Lancer, inspecter et supprimer des conteneurs",
      "Mapper des ports et monter des volumes",
      "Créer une image personnalisée avec un Dockerfile"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04 LTS" },
      { type: "reseau", nom: "Accès Internet pour télécharger les images Docker Hub" },
      { type: "reseau", nom: "Notions de base Linux (commandes, fichiers, droits)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer Docker Engine",
        contexte: "On installe Docker depuis le dépôt officiel Docker — pas depuis les paquets Debian/Ubuntu par défaut qui sont souvent obsolètes. On ajoute aussi l'utilisateur courant au groupe docker pour éviter sudo.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install -y ca-certificates curl gnupg", commentaire: "Installer les dépendances" },
          { os: "linux", cmd: "sudo install -m 0755 -d /etc/apt/keyrings\ncurl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg\nsudo chmod a+r /etc/apt/keyrings/docker.gpg", commentaire: "Ajouter la clé GPG officielle Docker" },
          { os: "linux", cmd: "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable\" | sudo tee /etc/apt/sources.list.d/docker.list\nsudo apt update", commentaire: "Ajouter le dépôt Docker officiel" },
          { os: "linux", cmd: "sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin", commentaire: "Installer Docker Engine + Compose plugin" },
          { os: "linux", cmd: "sudo systemctl enable docker --now\nsudo systemctl status docker", commentaire: "Démarrer Docker et activer au boot" },
          { os: "linux", cmd: "sudo usermod -aG docker $USER\nnewgrp docker", commentaire: "Ajouter l'utilisateur au groupe docker — évite sudo" },
          { os: "linux", cmd: "docker version\ndocker info", commentaire: "Vérifier l'installation — version client et serveur" }
        ],
        erreurs_courantes: [
          {
            symptome: "Permission denied sur /var/run/docker.sock",
            cause: "L'utilisateur n'est pas dans le groupe docker",
            solution: "sudo usermod -aG docker $USER puis se reconnecter (logout/login). Ou utiliser newgrp docker pour la session courante."
          }
        ]
      },
      {
        titre: "Étape 2 — Premier conteneur et commandes de base",
        contexte: "On lance les premiers conteneurs pour comprendre le cycle de vie : pulled, created, running, stopped, removed. La commande docker run combine pull + create + start en une seule commande.",
        commandes: [
          { os: "linux", cmd: "docker run hello-world", commentaire: "Premier conteneur — vérifie que Docker fonctionne end-to-end" },
          { os: "linux", cmd: "docker run -it ubuntu:22.04 bash", commentaire: "Conteneur interactif Ubuntu — -i (stdin) -t (terminal)" },
          { os: "linux", cmd: "docker run -d --name mon-nginx -p 8080:80 nginx", commentaire: "Nginx en arrière-plan : -d (detach), port 8080 hôte → 80 conteneur" },
          { os: "linux", cmd: "docker ps\ndocker ps -a", commentaire: "Lister conteneurs actifs / tous les conteneurs" },
          { os: "linux", cmd: "docker logs mon-nginx\ndocker logs -f mon-nginx", commentaire: "Afficher les logs / suivre en temps réel (-f = follow)" },
          { os: "linux", cmd: "docker exec -it mon-nginx bash", commentaire: "Ouvrir un shell dans un conteneur en cours d'exécution" },
          { os: "linux", cmd: "docker stop mon-nginx\ndocker start mon-nginx\ndocker rm mon-nginx", commentaire: "Arrêter / démarrer / supprimer un conteneur" },
          { os: "linux", cmd: "docker images\ndocker image ls\ndocker image rm nginx", commentaire: "Lister et supprimer des images locales" }
        ],
        erreurs_courantes: [
          {
            symptome: "Port already in use — bind: address already in use",
            cause: "Le port 8080 est déjà utilisé sur l'hôte",
            solution: "Changer le port hôte : -p 8081:80. Vérifier : ss -tlnp | grep 8080"
          }
        ]
      },
      {
        titre: "Étape 3 — Volumes et persistance des données",
        contexte: "Par défaut les données dans un conteneur sont perdues à sa suppression. Les volumes Docker permettent de persister les données et de les partager entre conteneurs ou avec l'hôte.",
        commandes: [
          { os: "linux", cmd: "# Volume nommé (géré par Docker) :\ndocker volume create mon-volume\ndocker volume ls\ndocker volume inspect mon-volume", commentaire: "Créer et inspecter un volume nommé" },
          { os: "linux", cmd: "docker run -d --name db-mysql \\\n  -e MYSQL_ROOT_PASSWORD=rootpass \\\n  -e MYSQL_DATABASE=madb \\\n  -v mon-volume:/var/lib/mysql \\\n  mysql:8.0", commentaire: "MySQL avec volume persistant — données survivent au rm du conteneur" },
          { os: "linux", cmd: "# Bind mount (dossier hôte → conteneur) :\ndocker run -d --name nginx-custom \\\n  -p 8080:80 \\\n  -v $(pwd)/html:/usr/share/nginx/html:ro \\\n  nginx", commentaire: "Servir des fichiers locaux dans Nginx — :ro = lecture seule" },
          { os: "linux", cmd: "docker volume rm mon-volume\ndocker volume prune", commentaire: "Supprimer un volume / nettoyer tous les volumes non utilisés" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Créer une image avec un Dockerfile",
        contexte: "Un Dockerfile décrit les instructions pour construire une image personnalisée. On crée une image Nginx avec une page HTML custom et une configuration modifiée.",
        commandes: [
          { os: "linux", cmd: "mkdir mon-site && cd mon-site", commentaire: "Créer un répertoire de travail" },
          { os: "linux", cmd: "# Créer index.html :\necho '<h1>Mon site Docker</h1>' > index.html", commentaire: "Page HTML simple" },
          { os: "linux", cmd: "# Créer Dockerfile :\nFROM nginx:alpine\nLABEL maintainer=\"admin@lab.local\"\nCOPY index.html /usr/share/nginx/html/index.html\nEXPOSE 80\nCMD [\"nginx\", \"-g\", \"daemon off;\"]", commentaire: "Dockerfile : partir de nginx:alpine, copier la page, exposer le port 80" },
          { os: "linux", cmd: "docker build -t mon-site:1.0 .", commentaire: "Construire l'image — le . = contexte de build (répertoire courant)" },
          { os: "linux", cmd: "docker images | grep mon-site", commentaire: "Vérifier que l'image est créée" },
          { os: "linux", cmd: "docker run -d -p 8080:80 --name mon-site-ctn mon-site:1.0\ncurl http://localhost:8080", commentaire: "Lancer le conteneur et tester" },
          { os: "linux", cmd: "docker history mon-site:1.0", commentaire: "Voir les couches (layers) de l'image et leur taille" }
        ],
        erreurs_courantes: [
          {
            symptome: "COPY failed: file not found in build context",
            cause: "Le fichier à copier n'est pas dans le répertoire de contexte (le . du build)",
            solution: "Vérifier que index.html est bien dans le même répertoire que le Dockerfile. Le contexte de build inclut tous les fichiers du répertoire courant."
          }
        ]
      }
    ],
    checklist: [
      "docker version : client et serveur affichent la même version",
      "docker run hello-world : message de succès affiché",
      "Conteneur Nginx lancé sur port 8080 : curl http://localhost:8080 retourne la page",
      "docker ps : conteneur Nginx visible en Running",
      "Volume MySQL créé et monté : données persistantes après rm + recreate",
      "Image mon-site:1.0 construite avec Dockerfile : docker images la liste",
      "Conteneur mon-site-ctn : page HTML custom visible sur port 8080"
    ],
    tags: ["docker", "conteneur", "dockerfile", "image", "volume", "nginx", "linux", "automatisation"],
    date_ajout: "2026-04-01",
    source: "Personnel"
  },

  {
    id: 18,
    titre: "Docker Compose — stack multi-conteneurs WordPress + MySQL",
    categorie: "automatisation",
    niveau: "intermédiaire",
    duree: 60,
    description: "Déployer une stack applicative complète avec Docker Compose : WordPress + MySQL + phpMyAdmin. Un seul fichier compose.yml définit tous les services, leurs dépendances, volumes et réseau. On apprend à gérer le cycle de vie de la stack et à déboguer.",
    objectifs: [
      "Comprendre la structure d'un fichier compose.yml",
      "Définir des services, volumes et réseaux dans Compose",
      "Gérer les dépendances entre conteneurs (depends_on)",
      "Déployer, mettre à jour et supprimer une stack Compose",
      "Utiliser les variables d'environnement et les fichiers .env"
    ],
    prerequis: [
      { type: "logiciel", nom: "Docker Engine installé (TP 17)" },
      { type: "logiciel", nom: "Docker Compose plugin (inclus avec Docker Engine)" },
      { type: "reseau", nom: "Ports 8080 et 8081 disponibles sur l'hôte" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Structure du fichier compose.yml",
        contexte: "Un fichier compose.yml définit la stack complète : services (conteneurs), volumes (persistance) et networks (communication entre conteneurs). Docker Compose crée automatiquement un réseau isolé pour la stack.",
        commandes: [
          { os: "linux", cmd: "mkdir wordpress-stack && cd wordpress-stack", commentaire: "Créer le répertoire de la stack" },
          { os: "linux", cmd: "# Créer .env avec les variables sensibles :\nDB_NAME=wordpress\nDB_USER=wpuser\nDB_PASSWORD=WpPass123\nDB_ROOT_PASSWORD=RootPass123\nWP_PORT=8080\nPMA_PORT=8081", commentaire: "Variables d'environnement dans .env — ne jamais committer en Git !" },
          { os: "linux", cmd: "# Créer compose.yml :\nservices:\n\n  db:\n    image: mysql:8.0\n    container_name: wp-mysql\n    restart: unless-stopped\n    environment:\n      MYSQL_DATABASE: ${DB_NAME}\n      MYSQL_USER: ${DB_USER}\n      MYSQL_PASSWORD: ${DB_PASSWORD}\n      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}\n    volumes:\n      - db-data:/var/lib/mysql\n    networks:\n      - wp-net\n\n  wordpress:\n    image: wordpress:latest\n    container_name: wp-app\n    restart: unless-stopped\n    depends_on:\n      - db\n    ports:\n      - \"${WP_PORT}:80\"\n    environment:\n      WORDPRESS_DB_HOST: db\n      WORDPRESS_DB_NAME: ${DB_NAME}\n      WORDPRESS_DB_USER: ${DB_USER}\n      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}\n    volumes:\n      - wp-data:/var/www/html\n    networks:\n      - wp-net\n\n  phpmyadmin:\n    image: phpmyadmin:latest\n    container_name: wp-pma\n    restart: unless-stopped\n    depends_on:\n      - db\n    ports:\n      - \"${PMA_PORT}:80\"\n    environment:\n      PMA_HOST: db\n      PMA_USER: ${DB_USER}\n      PMA_PASSWORD: ${DB_PASSWORD}\n    networks:\n      - wp-net\n\nvolumes:\n  db-data:\n  wp-data:\n\nnetworks:\n  wp-net:\n    driver: bridge", commentaire: "Stack complète : MySQL + WordPress + phpMyAdmin" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Lancer et gérer la stack",
        contexte: "Avec un seul fichier compose.yml, on lance toute la stack en une commande. Docker Compose respecte les dépendances (depends_on) et crée automatiquement le réseau et les volumes.",
        commandes: [
          { os: "linux", cmd: "docker compose up -d", commentaire: "Lancer toute la stack en arrière-plan (-d)" },
          { os: "linux", cmd: "docker compose ps", commentaire: "État de tous les services de la stack" },
          { os: "linux", cmd: "docker compose logs -f", commentaire: "Suivre les logs de tous les services en temps réel" },
          { os: "linux", cmd: "docker compose logs wordpress", commentaire: "Logs d'un service spécifique uniquement" },
          { os: "linux", cmd: "# Accéder à WordPress :\n# http://localhost:8080 → assistant installation WordPress\n# http://localhost:8081 → phpMyAdmin", commentaire: "Vérifier que les deux interfaces sont accessibles" },
          { os: "linux", cmd: "docker compose exec wordpress bash", commentaire: "Ouvrir un shell dans le conteneur WordPress" }
        ],
        erreurs_courantes: [
          {
            symptome: "WordPress affiche erreur de connexion DB au démarrage",
            cause: "MySQL n'est pas encore prêt quand WordPress démarre (depends_on attend le start, pas le ready)",
            solution: "Attendre 20-30 secondes que MySQL initialise sa DB. En prod, utiliser healthcheck dans compose.yml pour attendre que MySQL soit réellement prêt."
          }
        ]
      },
      {
        titre: "Étape 3 — Mettre à jour et scaler la stack",
        contexte: "Docker Compose permet de mettre à jour les images, de recréer les conteneurs sans perdre les données (volumes persistants) et de scaler les services sans état.",
        commandes: [
          { os: "linux", cmd: "docker compose pull", commentaire: "Télécharger les nouvelles versions des images" },
          { os: "linux", cmd: "docker compose up -d --no-deps wordpress", commentaire: "Recréer uniquement le conteneur WordPress sans toucher MySQL" },
          { os: "linux", cmd: "docker compose restart wordpress", commentaire: "Redémarrer un service spécifique" },
          { os: "linux", cmd: "docker compose down", commentaire: "Arrêter et supprimer les conteneurs (les volumes sont conservés)" },
          { os: "linux", cmd: "docker compose down -v", commentaire: "Arrêter ET supprimer les volumes — ATTENTION : perte des données !" },
          { os: "linux", cmd: "docker compose config", commentaire: "Valider et afficher la config Compose résolue (variables .env injectées)" }
        ],
        erreurs_courantes: [
          {
            symptome: "docker compose down -v puis up : WordPress demande la réinstallation",
            cause: "Les volumes ont été supprimés avec -v — les données MySQL et WP sont perdues",
            solution: "Ne jamais utiliser -v en production. Pour reset propre en dev seulement. Toujours faire des backups : docker exec wp-mysql mysqldump -u root -p wordpress > backup.sql"
          }
        ]
      },
      {
        titre: "Étape 4 — Healthcheck et dépendances robustes",
        contexte: "depends_on attend que le conteneur démarre, pas qu'il soit prêt. Pour attendre que MySQL accepte les connexions, on utilise un healthcheck. C'est la bonne pratique en production.",
        commandes: [
          { os: "linux", cmd: "# Modifier le service db dans compose.yml pour ajouter un healthcheck :\n  db:\n    image: mysql:8.0\n    healthcheck:\n      test: [\"CMD\", \"mysqladmin\", \"ping\", \"-h\", \"localhost\"]\n      interval: 10s\n      timeout: 5s\n      retries: 5\n      start_period: 30s", commentaire: "Healthcheck MySQL : tester toutes les 10s, 5 tentatives max" },
          { os: "linux", cmd: "# Modifier wordpress pour attendre que db soit healthy :\n  wordpress:\n    depends_on:\n      db:\n        condition: service_healthy", commentaire: "WordPress attend que MySQL soit healthy avant de démarrer" },
          { os: "linux", cmd: "docker compose up -d\ndocker compose ps", commentaire: "Relancer — WordPress attend maintenant que MySQL soit prêt" },
          { os: "linux", cmd: "docker inspect wp-mysql | grep -A 10 Health", commentaire: "Vérifier le statut de santé du conteneur MySQL" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "compose.yml et .env créés dans le répertoire wordpress-stack",
      "docker compose up -d : 3 services démarrés (db, wordpress, phpmyadmin)",
      "http://localhost:8080 : assistant installation WordPress accessible",
      "http://localhost:8081 : phpMyAdmin accessible et connecté à MySQL",
      "docker compose down puis up : données WordPress conservées (volumes)",
      "Healthcheck MySQL configuré : WordPress attend service_healthy"
    ],
    tags: ["docker-compose", "compose", "wordpress", "mysql", "phpmyadmin", "stack", "volume", "automatisation"],
    date_ajout: "2026-04-05",
    source: "Personnel"
  },

  {
    id: 19,
    titre: "Ansible — inventaire, playbooks et déploiement automatisé",
    categorie: "automatisation",
    niveau: "intermédiaire",
    duree: 90,
    description: "Installer Ansible sur un nœud de contrôle, configurer un inventaire de serveurs, écrire des playbooks pour automatiser la configuration de serveurs Linux : installation de paquets, configuration de services, déploiement de fichiers et gestion des utilisateurs.",
    objectifs: [
      "Installer Ansible et configurer l'accès SSH sans mot de passe vers les hôtes",
      "Créer un inventaire statique avec groupes d'hôtes",
      "Écrire et exécuter des playbooks avec les modules essentiels",
      "Utiliser les variables, les handlers et les templates Jinja2",
      "Comprendre les idempotences et les bonnes pratiques Ansible"
    ],
    prerequis: [
      { type: "vm", nom: "1x VM Debian/Ubuntu (nœud de contrôle Ansible)" },
      { type: "vm", nom: "2x VM Debian/Ubuntu (hôtes gérés)" },
      { type: "reseau", nom: "SSH fonctionnel entre le contrôleur et les hôtes" },
      { type: "reseau", nom: "Python 3 installé sur les hôtes gérés" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer Ansible et configurer SSH",
        contexte: "Ansible fonctionne en agentless — pas besoin d'installer de logiciel sur les hôtes gérés. Il se connecte via SSH. On installe Ansible sur le nœud de contrôle et on configure l'authentification par clé pour éviter les mots de passe.",
        commandes: [
          { os: "linux", cmd: "# Sur le nœud de contrôle :\nsudo apt update && sudo apt install -y ansible\nansible --version", commentaire: "Installer Ansible depuis les dépôts Debian" },
          { os: "linux", cmd: "# Générer une clé SSH dédiée Ansible :\nssh-keygen -t ed25519 -C \"ansible-control\" -f ~/.ssh/ansible_key -N \"\"", commentaire: "Clé sans passphrase pour les connexions automatisées" },
          { os: "linux", cmd: "# Copier la clé vers les hôtes gérés :\nssh-copy-id -i ~/.ssh/ansible_key.pub user@192.168.1.21\nssh-copy-id -i ~/.ssh/ansible_key.pub user@192.168.1.22", commentaire: "Déposer la clé publique sur chaque hôte géré" },
          { os: "linux", cmd: "# Tester la connexion SSH :\nssh -i ~/.ssh/ansible_key user@192.168.1.21 \"hostname\"", commentaire: "Doit retourner le hostname sans demander de mot de passe" }
        ],
        erreurs_courantes: [
          {
            symptome: "Ansible retourne UNREACHABLE sur les hôtes",
            cause: "La clé SSH n'est pas correctement déployée ou le port SSH est différent",
            solution: "Vérifier avec ssh -i ~/.ssh/ansible_key -v user@IP pour voir le détail de la connexion. Ajouter ansible_port=2222 dans l'inventaire si le port SSH est différent."
          }
        ]
      },
      {
        titre: "Étape 2 — Créer l'inventaire et la configuration Ansible",
        contexte: "L'inventaire définit les hôtes et groupes à gérer. On crée aussi ansible.cfg pour éviter de répéter les options à chaque commande.",
        commandes: [
          { os: "linux", cmd: "mkdir ~/ansible-lab && cd ~/ansible-lab", commentaire: "Répertoire de travail Ansible" },
          { os: "linux", cmd: "# Créer ansible.cfg :\n[defaults]\ninventory = inventory.yml\nremote_user = user\nprivate_key_file = ~/.ssh/ansible_key\nhost_key_checking = False\nretry_files_enabled = False", commentaire: "Config globale — évite de répéter les options en CLI" },
          { os: "linux", cmd: "# Créer inventory.yml :\nall:\n  children:\n    webservers:\n      hosts:\n        web01:\n          ansible_host: 192.168.1.21\n        web02:\n          ansible_host: 192.168.1.22\n    dbservers:\n      hosts:\n        db01:\n          ansible_host: 192.168.1.23\n  vars:\n    ansible_python_interpreter: /usr/bin/python3", commentaire: "Inventaire YAML avec groupes webservers et dbservers" },
          { os: "linux", cmd: "# Tester la connexion vers tous les hôtes :\nansible all -m ping", commentaire: "Module ping — vérifie SSH + Python sur tous les hôtes" },
          { os: "linux", cmd: "ansible webservers -m ping\nansible all -m gather_facts --limit web01", commentaire: "Ping un groupe / collecter les facts d'un hôte" }
        ],
        erreurs_courantes: [
          {
            symptome: "ansible all -m ping retourne FAILED — Python not found",
            cause: "Python 3 n'est pas installé sur l'hôte géré",
            solution: "sudo apt install -y python3 sur chaque hôte. Ou ajouter ansible_python_interpreter=/usr/bin/python3 dans l'inventaire."
          }
        ]
      },
      {
        titre: "Étape 3 — Premier playbook : installer et configurer Nginx",
        contexte: "Un playbook est un fichier YAML qui décrit les tâches à exécuter sur les hôtes. On crée un playbook pour installer Nginx, déployer une page HTML et s'assurer que le service est démarré.",
        commandes: [
          { os: "linux", cmd: "# Créer playbook-nginx.yml :\n---\n- name: Installer et configurer Nginx\n  hosts: webservers\n  become: yes\n\n  vars:\n    site_name: \"Mon site Ansible\"\n    nginx_port: 80\n\n  tasks:\n    - name: Mettre à jour le cache apt\n      apt:\n        update_cache: yes\n        cache_valid_time: 3600\n\n    - name: Installer Nginx\n      apt:\n        name: nginx\n        state: present\n\n    - name: Déployer la page index.html\n      copy:\n        content: \"<h1>{{ site_name }} — {{ inventory_hostname }}</h1>\"\n        dest: /var/www/html/index.html\n        owner: www-data\n        group: www-data\n        mode: \'0644\'\n      notify: Redémarrer Nginx\n\n    - name: S'assurer que Nginx est démarré et activé\n      service:\n        name: nginx\n        state: started\n        enabled: yes\n\n  handlers:\n    - name: Redémarrer Nginx\n      service:\n        name: nginx\n        state: restarted", commentaire: "Playbook complet avec variables, copy, service et handler" },
          { os: "linux", cmd: "# Vérifier la syntaxe sans exécuter :\nansible-playbook playbook-nginx.yml --syntax-check", commentaire: "Vérification syntaxe YAML" },
          { os: "linux", cmd: "# Simulation (dry run) :\nansible-playbook playbook-nginx.yml --check", commentaire: "Voir ce qui serait changé sans l'appliquer" },
          { os: "linux", cmd: "# Exécuter le playbook :\nansible-playbook playbook-nginx.yml -v", commentaire: "Déployer Nginx sur tous les webservers" },
          { os: "linux", cmd: "# Vérifier le résultat :\ncurl http://192.168.1.21\ncurl http://192.168.1.22", commentaire: "La page doit afficher le hostname de chaque serveur" }
        ],
        erreurs_courantes: [
          {
            symptome: "FAILED — Missing sudo password",
            cause: "become: yes nécessite sudo sans mot de passe ou le mot de passe doit être fourni",
            solution: "Configurer sudo sans mot de passe sur les hôtes : echo 'user ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/ansible. Ou ajouter --ask-become-pass à la commande."
          }
        ]
      },
      {
        titre: "Étape 4 — Variables, templates Jinja2 et roles",
        contexte: "On améliore le playbook avec des templates Jinja2 pour générer des fichiers de configuration dynamiques, et on découvre la structure des roles Ansible pour organiser le code.",
        commandes: [
          { os: "linux", cmd: "# Créer un template Jinja2 pour nginx.conf :\nmkdir templates\n\n# templates/nginx.conf.j2 :\nserver {\n    listen {{ nginx_port }};\n    server_name {{ ansible_hostname }};\n    root /var/www/html;\n    index index.html;\n\n    access_log /var/log/nginx/{{ ansible_hostname }}-access.log;\n    error_log  /var/log/nginx/{{ ansible_hostname }}-error.log;\n}", commentaire: "Template Jinja2 : variables Ansible injectées au déploiement" },
          { os: "linux", cmd: "# Ajouter une tâche template dans le playbook :\n    - name: Déployer la configuration Nginx\n      template:\n        src: templates/nginx.conf.j2\n        dest: /etc/nginx/sites-available/default\n        owner: root\n        group: root\n        mode: \'0644\'\n      notify: Redémarrer Nginx", commentaire: "Module template : génère le fichier depuis le .j2" },
          { os: "linux", cmd: "# Créer la structure d'un role :\nansible-galaxy init roles/nginx\ntree roles/nginx/", commentaire: "Structure standard : tasks, handlers, templates, vars, defaults, files" },
          { os: "linux", cmd: "ansible-playbook playbook-nginx.yml -v\nansible webservers -m command -a \"nginx -t\"", commentaire: "Appliquer et vérifier la config Nginx sur les hôtes" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "ansible all -m ping : tous les hôtes répondent pong",
      "Inventaire inventory.yml avec groupes webservers et dbservers",
      "ansible-playbook playbook-nginx.yml --syntax-check : aucune erreur",
      "Nginx installé sur web01 et web02 via le playbook",
      "curl http://192.168.1.21 : page affiche le hostname du serveur",
      "Handler Redémarrer Nginx déclenché uniquement si index.html modifié",
      "Template nginx.conf.j2 déployé avec les variables Ansible"
    ],
    tags: ["ansible", "playbook", "inventaire", "nginx", "automation", "iac", "jinja2", "ssh"],
    date_ajout: "2026-04-10",
    source: "Personnel"
  },

  {
    id: 20,
    titre: "Bash scripting — automatisation des tâches admin Linux",
    categorie: "automatisation",
    niveau: "débutant",
    duree: 75,
    description: "Apprendre les bases du scripting Bash pour automatiser les tâches d'administration système : sauvegardes automatiques, monitoring de services, rapports système, et gestion des logs. On couvre les structures de contrôle, les fonctions, les expressions régulières et la planification avec cron.",
    objectifs: [
      "Maîtriser les variables, conditions, boucles et fonctions Bash",
      "Créer un script de sauvegarde automatique avec rotation",
      "Écrire un script de monitoring de services avec alertes",
      "Utiliser sed, awk et grep pour traiter les logs",
      "Planifier l'exécution automatique avec crontab"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" },
      { type: "reseau", nom: "Notions de base Linux (fichiers, permissions, redirections)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Bases du scripting Bash",
        contexte: "Un script Bash commence par le shebang #!/bin/bash qui indique l'interpréteur. On couvre les bases : variables, paramètres, conditions et boucles que tout script admin utilise.",
        commandes: [
          { os: "linux", cmd: "#!/bin/bash\n# Structure de base d'un script\n\n# Variables\nNOM=\"Serveur-01\"\nDATE=$(date +%Y-%m-%d)\nUSER=$(whoami)\n\n# Paramètres positionnels\necho \"Script : $0\"\necho \"Paramètre 1 : $1\"\necho \"Tous les params : $@\"\n\n# Variables spéciales\necho \"PID du script : $$\"\necho \"Code retour dernier cmd : $?\"", commentaire: "Variables, paramètres et variables spéciales" },
          { os: "linux", cmd: "# Conditions :\nif [ -f /etc/passwd ]; then\n    echo \"Fichier existe\"\nelif [ -d /tmp ]; then\n    echo \"C'est un répertoire\"\nelse\n    echo \"N'existe pas\"\nfi\n\n# Comparaisons numériques :\n# -eq -ne -lt -le -gt -ge\n# Comparaisons chaînes : == != -z (vide) -n (non vide)\n# Fichiers : -f (fichier) -d (dir) -r (lisible) -w (écriture) -x (exécutable)", commentaire: "Structures conditionnelles et opérateurs de test" },
          { os: "linux", cmd: "# Boucles :\nfor i in 1 2 3 4 5; do\n    echo \"Itération $i\"\ndone\n\nfor fichier in /etc/*.conf; do\n    echo \"Config : $fichier\"\ndone\n\n# While :\ncompteur=0\nwhile [ $compteur -lt 5 ]; do\n    echo \"Compteur : $compteur\"\n    ((compteur++))\ndone", commentaire: "Boucles for et while" },
          { os: "linux", cmd: "# Fonctions :\nlog() {\n    local niveau=$1\n    local message=$2\n    echo \"[$(date +%H:%M:%S)] [$niveau] $message\" | tee -a /var/log/mon-script.log\n}\n\nlog \"INFO\" \"Démarrage du script\"\nlog \"ERROR\" \"Erreur détectée\"", commentaire: "Fonctions avec variables locales et logging" }
        ],
        erreurs_courantes: [
          {
            symptome: "Permission denied lors de l'exécution du script",
            cause: "Le script n'est pas exécutable",
            solution: "chmod +x mon-script.sh — puis ./mon-script.sh ou bash mon-script.sh"
          }
        ]
      },
      {
        titre: "Étape 2 — Script de sauvegarde automatique",
        contexte: "On crée un script de sauvegarde complet avec : rotation des anciennes sauvegardes, compression, logging et vérification des erreurs. C'est un script qu'on utilise réellement en production.",
        commandes: [
          { os: "linux", cmd: "#!/bin/bash\n# backup.sh — Sauvegarde automatique avec rotation\n\nset -euo pipefail  # Arrêt sur erreur, variables non définies interdites\n\n# Configuration\nSOURCE=\"/etc /home/user/documents\"\nDEST=\"/backup\"\nRETENTION=7  # Garder 7 jours\nDATE=$(date +%Y-%m-%d_%H-%M)\nLOG=\"/var/log/backup.log\"\n\n# Fonction de logging\nlog() { echo \"[$(date '+%Y-%m-%d %H:%M:%S')] $*\" | tee -a \"$LOG\"; }\n\n# Vérifications\n[ ! -d \"$DEST\" ] && mkdir -p \"$DEST\"\ndf -h \"$DEST\" | awk \'NR==2{if($5+0>90) exit 1}\' || { log \"ERREUR: Disque backup >90%\"; exit 1; }\n\n# Sauvegarde\nlog \"INFO: Début sauvegarde $DATE\"\ntar -czf \"\"$DEST\"/backup_$DATE.tar.gz\" $SOURCE 2>>\"\"$LOG\"\"\ && log \"OK: Sauvegarde créée\" || { log \"ERREUR: Échec tar\"; exit 1; }\n\n# Rotation — supprimer les fichiers de plus de $RETENTION jours\nfind \"$DEST\" -name \"backup_*.tar.gz\" -mtime +$RETENTION -delete\nlog \"INFO: Rotation effectuée (>$RETENTION jours supprimés)\"\n\n# Rapport\nNB=$(ls \"$DEST\"/backup_*.tar.gz 2>/dev/null | wc -l)\nTAILLE=$(du -sh \"$DEST\" | cut -f1)\nlog \"INFO: $NB sauvegardes stockées, taille totale $TAILLE\"", commentaire: "Script de backup production-ready avec rotation et logging" },
          { os: "linux", cmd: "chmod +x backup.sh\nsudo ./backup.sh\ncat /var/log/backup.log", commentaire: "Exécuter et vérifier les logs" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Script de monitoring de services",
        contexte: "On crée un script qui vérifie l'état de plusieurs services et envoie une alerte (log + mail optionnel) si l'un d'eux est arrêté, avec tentative de redémarrage automatique.",
        commandes: [
          { os: "linux", cmd: "#!/bin/bash\n# monitor-services.sh\n\nSERVICES=(\"nginx\" \"ssh\" \"cron\")\nLOG=\"/var/log/monitor.log\"\nALERTES=0\n\nlog() { echo \"[$(date '+%Y-%m-%d %H:%M:%S')] $*\" | tee -a \"$LOG\"; }\n\nfor service in \"${SERVICES[@]}\"; do\n    if systemctl is-active --quiet \"$service\"; then\n        log \"OK: $service est actif\"\n    else\n        log \"ALERTE: $service est ARRÊTÉ — tentative de redémarrage\"\n        systemctl restart \"$service\" && log \"OK: $service redémarré\" || log \"ERREUR: Impossible de redémarrer $service\"\n        ((ALERTES++))\n    fi\ndone\n\n# Vérifier la charge CPU\nCPU=$(top -bn1 | grep \"Cpu(s)\" | awk \'{print $2}\' | cut -d. -f1)\n[ \"$CPU\" -gt 80 ] && log \"ALERTE: CPU élevé — ${CPU}%\"\n\n# Vérifier l'espace disque\ndf -h / | awk \'NR==2{\n    used=$5+0\n    if(used>85) print \"[ALERTE] Disque / à \" used \"% — action requise\"\n}\' | tee -a \"$LOG\"\n\nlog \"INFO: Monitoring terminé — $ALERTES alerte(s)\"\nexit $ALERTES", commentaire: "Monitoring services, CPU et disque avec redémarrage automatique" },
          { os: "linux", cmd: "chmod +x monitor-services.sh\nsudo ./monitor-services.sh\necho \"Code retour : $?\"", commentaire: "Exécuter — code retour = nombre d'alertes" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Traitement de logs avec sed/awk/grep et crontab",
        contexte: "On utilise sed, awk et grep pour extraire des informations des logs système. Puis on planifie les scripts avec crontab pour une exécution automatique.",
        commandes: [
          { os: "linux", cmd: "# Extraire les erreurs SSH des logs :\ngrep \"Failed password\" /var/log/auth.log | tail -20", commentaire: "Tentatives de connexion SSH échouées" },
          { os: "linux", cmd: "# Top 10 IPs qui tentent de se connecter :\ngrep \"Failed password\" /var/log/auth.log | awk \'{print $(NF-3)}\' | sort | uniq -c | sort -rn | head -10", commentaire: "IPs les plus actives dans les attaques brute-force" },
          { os: "linux", cmd: "# Extraire les codes erreur HTTP depuis les logs Nginx :\nawk \'{print $9}\' /var/log/nginx/access.log | sort | uniq -c | sort -rn", commentaire: "Comptage des codes HTTP (200, 404, 500...)" },
          { os: "linux", cmd: "# sed — remplacer dans un fichier :\nsed -i \"s/127.0.0.1/0.0.0.0/g\" /etc/mon-service.conf", commentaire: "Remplacer une valeur dans un fichier de config" },
          { os: "linux", cmd: "# Planifier avec crontab :\ncrontab -e\n\n# Format : minute heure jour mois jour_semaine commande\n# Backup tous les jours à 2h du matin :\n0 2 * * * /opt/scripts/backup.sh >> /var/log/backup-cron.log 2>&1\n\n# Monitoring toutes les 5 minutes :\n*/5 * * * * /opt/scripts/monitor-services.sh >> /var/log/monitor-cron.log 2>&1\n\n# Rapport hebdomadaire le lundi à 8h :\n0 8 * * 1 /opt/scripts/rapport-semaine.sh", commentaire: "Planification cron : backup quotidien + monitoring 5min" },
          { os: "linux", cmd: "crontab -l\nsudo systemctl status cron", commentaire: "Vérifier les tâches planifiées et l'état du service cron" }
        ],
        erreurs_courantes: [
          {
            symptome: "Le script fonctionne manuellement mais pas via cron",
            cause: "Cron a un environnement minimal — PATH différent, pas de variables d'environnement",
            solution: "Toujours utiliser des chemins absolus dans les scripts cron (/usr/bin/python3 pas python3). Ajouter PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin en début de script."
          }
        ]
      }
    ],
    checklist: [
      "backup.sh : crée une archive tar.gz dans /backup avec la date",
      "backup.sh : rotation fonctionnelle (fichiers >7 jours supprimés)",
      "monitor-services.sh : détecte un service arrêté et tente le redémarrage",
      "grep + awk : top 10 IPs brute-force SSH extraites de auth.log",
      "crontab : backup planifié à 2h et monitoring toutes les 5 minutes",
      "crontab -l : tâches visibles et actives"
    ],
    tags: ["bash", "scripting", "cron", "backup", "monitoring", "awk", "sed", "grep", "automatisation"],
    date_ajout: "2026-04-15",
    source: "Personnel"
  },

  {
    id: 39,
    titre: "Terraform — Infrastructure as Code avec le provider VirtualBox",
    categorie: "automatisation",
    niveau: "avancé",
    duree: 90,
    description: "Découvrir Terraform pour décrire et provisionner une infrastructure en code. Provider VirtualBox, cycle plan/apply/destroy, variables et gestion de l'état.",
    objectifs: [
      "Installer Terraform et comprendre le cycle init/plan/apply/destroy",
      "Écrire un main.tf décrivant une VM VirtualBox",
      "Utiliser les variables Terraform",
      "Gérer l'état (terraform.tfstate)",
      "Modifier l'infrastructure et observer le diff"
    ],
    prerequis: [
      { type: "logiciel", nom: "VirtualBox 7.x installé" },
      { type: "logiciel", nom: "Terraform CLI installé (https://developer.hashicorp.com/terraform/install)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installation de Terraform",
        contexte: "On installe Terraform depuis le dépôt officiel HashiCorp.",
        commandes: [
          { os: "linux", cmd: "wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg\necho 'deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main' | sudo tee /etc/apt/sources.list.d/hashicorp.list\nsudo apt update && sudo apt install terraform", commentaire: "Ajouter le dépôt HashiCorp et installer Terraform" },
          { os: "linux", cmd: "terraform version", commentaire: "Vérifier l'installation" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Créer le projet et écrire main.tf",
        contexte: "On crée la structure du projet avec main.tf et variables.tf décrivant une VM VirtualBox.",
        commandes: [
          { os: "linux", cmd: "mkdir ~/tf-lab && cd ~/tf-lab\ntouch main.tf variables.tf", commentaire: "Créer la structure du projet" },
          { os: "linux", cmd: "# variables.tf :\n# variable \"vm_name\" { type = string; default = \"terraform-vm\" }\n# variable \"vm_cpus\" { type = number; default = 1 }", commentaire: "Déclarer les variables" },
          { os: "linux", cmd: "# main.tf :\n# terraform {\n#   required_providers {\n#     virtualbox = { source = \"terra-farm/virtualbox\"; version = \"~> 0.2\" }\n#   }\n# }\n# resource \"virtualbox_vm\" \"lab_vm\" {\n#   name   = var.vm_name\n#   image  = \"https://app.vagrantup.com/ubuntu/boxes/bionic64/versions/20180903.0.0/providers/virtualbox.box\"\n#   cpus   = var.vm_cpus\n#   memory = \"512 mib\"\n# }", commentaire: "Décrire la VM VirtualBox en HCL" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Cycle init/plan/apply/destroy",
        contexte: "On exécute le cycle complet Terraform : init télécharge les providers, plan montre les changements, apply crée, destroy supprime.",
        commandes: [
          { os: "linux", cmd: "terraform init", commentaire: "Télécharger le provider virtualbox" },
          { os: "linux", cmd: "terraform plan", commentaire: "Afficher le plan — + pour créer" },
          { os: "linux", cmd: "terraform apply", commentaire: "Créer la VM dans VirtualBox (confirmer avec yes)" },
          { os: "linux", cmd: "# Modifier main.tf : memory = \"1024 mib\"\nterraform plan", commentaire: "Observer le diff après modification : ~ pour modifier" },
          { os: "linux", cmd: "terraform apply -auto-approve && terraform destroy", commentaire: "Appliquer puis détruire l'infrastructure" }
        ],
        erreurs_courantes: [
          { symptome: "Failed to query available provider packages", cause: "Pas d'accès Internet pour télécharger le provider", solution: "Vérifier la connexion. Si proxy : configurer HTTPS_PROXY avant terraform init" }
        ]
      }
    ],
    checklist: [
      "terraform version affiche v1.x.x",
      "terraform init : provider virtualbox téléchargé dans .terraform/",
      "terraform plan : affiche 1 to add sans erreur",
      "terraform apply : VM visible dans VirtualBox",
      "terraform plan après modif RAM : affiche 1 to change",
      "terraform destroy : VM supprimée"
    ],
    tags: ["terraform", "iac", "infrastructure-as-code", "virtualbox", "automatisation", "hashicorp"],
    date_ajout: "2026-06-26",
    source: "École"
  }
,

  {
    id: 67,
    titre: "Docker — réseaux, volumes nommés et limites de ressources",
    categorie: "automatisation",
    niveau: "intermédiaire",
    duree: 60,
    description: "Approfondir Docker au-delà des bases : créer des réseaux personnalisés pour isoler les conteneurs, utiliser des volumes nommés pour la persistance des données, et limiter les ressources CPU/RAM pour éviter qu'un conteneur ne monopolise l'hôte.",
    objectifs: [
      "Créer et utiliser des réseaux Docker bridge personnalisés",
      "Comprendre l'isolation réseau entre conteneurs",
      "Créer et gérer des volumes nommés",
      "Limiter CPU et RAM d'un conteneur",
      "Inspecter les ressources consommées en temps réel"
    ],
    prerequis: [
      { type: "logiciel", nom: "Docker Engine installé sur Linux ou Docker Desktop" },
      { type: "vm", nom: "VM Debian 12 ou Ubuntu 22.04" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Réseaux Docker personnalisés",
        contexte: "Par défaut les conteneurs utilisent le réseau bridge docker0. Créer un réseau personnalisé permet la résolution DNS entre conteneurs par leur nom — bien plus pratique que les IPs.",
        commandes: [
          { os: "linux", cmd: "docker network create mon-reseau", commentaire: "Créer un réseau bridge personnalisé" },
          { os: "linux", cmd: "docker network ls", commentaire: "Lister tous les réseaux Docker" },
          { os: "linux", cmd: "docker run -d --name db --network mon-reseau -e MYSQL_ROOT_PASSWORD=secret mysql:8", commentaire: "Lancer un conteneur MySQL sur le réseau personnalisé" },
          { os: "linux", cmd: "docker run -it --network mon-reseau debian:12 bash -c 'apt-get install -y iputils-ping && ping -c3 db'", commentaire: "Pinger le conteneur db par son NOM depuis un autre conteneur du même réseau" },
          { os: "linux", cmd: "docker network inspect mon-reseau", commentaire: "Inspecter le réseau : voir les conteneurs connectés et leurs IPs" },
          { os: "linux", cmd: "docker network create --subnet 172.20.0.0/16 reseau-lab", commentaire: "Créer un réseau avec un subnet personnalisé" }
        ],
        erreurs_courantes: [
          { symptome: "ping: db: Name or service not known", cause: "Les deux conteneurs ne sont pas sur le même réseau personnalisé — le réseau bridge par défaut ne supporte pas la résolution DNS par nom", solution: "Créer un réseau personnalisé et lancer les deux conteneurs avec --network mon-reseau" }
        ]
      },
      {
        titre: "Étape 2 — Volumes nommés",
        contexte: "Les volumes nommés persistent après la suppression du conteneur et sont gérés par Docker. Contrairement aux bind mounts, ils sont indépendants du système de fichiers de l'hôte.",
        commandes: [
          { os: "linux", cmd: "docker volume create mes-donnees", commentaire: "Créer un volume nommé" },
          { os: "linux", cmd: "docker volume ls && docker volume inspect mes-donnees", commentaire: "Lister et inspecter le volume (chemin physique sur l'hôte)" },
          { os: "linux", cmd: "docker run -d --name mysql-prod --network mon-reseau -v mes-donnees:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=secret mysql:8", commentaire: "Monter le volume nommé dans le conteneur MySQL" },
          { os: "linux", cmd: "docker exec mysql-prod mysql -uroot -psecret -e 'CREATE DATABASE testdb;'", commentaire: "Créer une base de données dans le conteneur" },
          { os: "linux", cmd: "docker rm -f mysql-prod\ndocker run -d --name mysql-prod2 -v mes-donnees:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=secret mysql:8\ndocker exec mysql-prod2 mysql -uroot -psecret -e 'SHOW DATABASES;'", commentaire: "Supprimer et recréer le conteneur — les données persistent dans le volume" }
        ],
        erreurs_courantes: [
          { symptome: "Les données sont perdues après docker rm", cause: "Utilisation de volumes anonymes (-v /var/lib/mysql) au lieu de volumes nommés", solution: "Toujours nommer les volumes : -v nom-volume:/chemin/dans/conteneur" }
        ]
      },
      {
        titre: "Étape 3 — Limites de ressources CPU et RAM",
        contexte: "Sans limites, un conteneur peut consommer toute la RAM/CPU de l'hôte. On applique des contraintes avec --memory et --cpus.",
        commandes: [
          { os: "linux", cmd: "docker run -d --name app-limitee --memory 512m --cpus 0.5 nginx:alpine", commentaire: "Conteneur limité à 512 Mo RAM et 0.5 vCPU" },
          { os: "linux", cmd: "docker stats app-limitee", commentaire: "Voir la consommation en temps réel (CPU%, MEM usage/limit)" },
          { os: "linux", cmd: "docker inspect app-limitee | grep -E 'Memory|CpuQuota|NanoCpus'", commentaire: "Vérifier les limites configurées dans les métadonnées du conteneur" },
          { os: "linux", cmd: "docker update --memory 1g --cpus 1 app-limitee", commentaire: "Modifier les limites d'un conteneur en cours d'exécution" },
          { os: "linux", cmd: "docker stats --no-stream", commentaire: "Snapshot unique des stats de tous les conteneurs (sans --no-stream = temps réel)" }
        ],
        erreurs_courantes: [
          { symptome: "docker: Error response from daemon: invalid memory", cause: "Valeur mémoire sans unité ou unité incorrecte", solution: "Utiliser les suffixes : b, k, m, g (ex: --memory 512m). La valeur minimum est 6m." }
        ]
      }
    ],
    checklist: [
      "docker network create mon-reseau : réseau créé",
      "Ping entre conteneurs par nom fonctionne sur le réseau personnalisé",
      "Volume nommé mes-donnees créé et monté dans MySQL",
      "Données MySQL persistent après docker rm et recréation du conteneur",
      "docker stats : app-limitee affiche limit = 512MiB",
      "docker update modifie les limites sans recréer le conteneur"
    ],
    tags: ["docker", "reseau", "volumes", "ressources", "bridge", "conteneurs", "automatisation"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 68,
    titre: "Docker Registry privé — héberger et distribuer ses images",
    categorie: "automatisation",
    niveau: "intermédiaire",
    duree: 60,
    description: "Déployer un registry Docker privé avec l'image officielle registry:2, y pousser des images personnalisées, configurer l'authentification basique et utiliser le registry depuis plusieurs machines du réseau.",
    objectifs: [
      "Déployer le registry Docker officiel en conteneur",
      "Taguer et pousser une image vers le registry privé",
      "Configurer l'authentification HTTP basique",
      "Tirer une image depuis le registry sur un autre hôte",
      "Inspecter le catalogue du registry via l'API HTTP"
    ],
    prerequis: [
      { type: "vm", nom: "VM serveur Linux avec Docker (IP 192.168.56.10)" },
      { type: "vm", nom: "VM cliente Linux avec Docker (pour tester le pull)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Déployer le registry",
        contexte: "L'image officielle registry:2 fournit un registry Docker complet. On le lance avec un volume nommé pour persister les images.",
        commandes: [
          { os: "linux", cmd: "docker volume create registry-data", commentaire: "Volume pour persister les images du registry" },
          { os: "linux", cmd: "docker run -d --name mon-registry -p 5000:5000 --restart always -v registry-data:/var/lib/registry registry:2", commentaire: "Lancer le registry sur le port 5000" },
          { os: "linux", cmd: "curl http://localhost:5000/v2/", commentaire: "Vérifier que le registry répond — doit retourner {}" },
          { os: "linux", cmd: "curl http://localhost:5000/v2/_catalog", commentaire: "Lister les images présentes (vide au départ)" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Pousser une image vers le registry privé",
        contexte: "Pour pousser vers un registry privé, on doit taguer l'image avec l'adresse du registry, puis faire docker push.",
        commandes: [
          { os: "linux", cmd: "docker pull nginx:alpine", commentaire: "Récupérer une image de base depuis Docker Hub" },
          { os: "linux", cmd: "docker tag nginx:alpine localhost:5000/mon-nginx:v1", commentaire: "Taguer l'image avec l'adresse du registry privé" },
          { os: "linux", cmd: "docker push localhost:5000/mon-nginx:v1", commentaire: "Pousser l'image vers le registry privé" },
          { os: "linux", cmd: "curl http://localhost:5000/v2/_catalog\ncurl http://localhost:5000/v2/mon-nginx/tags/list", commentaire: "Vérifier que l'image est bien dans le registry" }
        ],
        erreurs_courantes: [
          { symptome: "http: server gave HTTP response to HTTPS client", cause: "Docker refuse les registries non sécurisés (HTTP) par défaut", solution: "Ajouter dans /etc/docker/daemon.json : {\"insecure-registries\": [\"192.168.56.10:5000\"]} puis sudo systemctl restart docker" }
        ]
      },
      {
        titre: "Étape 3 — Authentification basique",
        contexte: "Par défaut le registry est ouvert. On ajoute une authentification HTTP basique avec htpasswd.",
        commandes: [
          { os: "linux", cmd: "sudo apt install apache2-utils -y\nmkdir -p ~/registry-auth\nhtpasswd -Bc ~/registry-auth/htpasswd admin", commentaire: "Créer le fichier htpasswd avec un utilisateur admin" },
          { os: "linux", cmd: "docker rm -f mon-registry\ndocker run -d --name mon-registry -p 5000:5000 --restart always -v registry-data:/var/lib/registry -v ~/registry-auth:/auth -e REGISTRY_AUTH=htpasswd -e REGISTRY_AUTH_HTPASSWD_REALM='Registry privé' -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd registry:2", commentaire: "Relancer le registry avec authentification htpasswd" },
          { os: "linux", cmd: "docker login localhost:5000\n# Entrer admin et le mot de passe défini avec htpasswd", commentaire: "S'authentifier sur le registry privé" },
          { os: "linux", cmd: "docker push localhost:5000/mon-nginx:v1", commentaire: "Pousser après authentification" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Utiliser le registry depuis un autre hôte",
        contexte: "On configure la VM cliente pour autoriser le registry insécurisé et on tire l'image depuis le réseau.",
        commandes: [
          { os: "linux", cmd: "# Sur la VM cliente :\nsudo nano /etc/docker/daemon.json\n# Ajouter : {\"insecure-registries\": [\"192.168.56.10:5000\"]}\nsudo systemctl restart docker", commentaire: "Autoriser le registry HTTP sur la VM cliente" },
          { os: "linux", cmd: "docker login 192.168.56.10:5000\ndocker pull 192.168.56.10:5000/mon-nginx:v1", commentaire: "Se connecter et tirer l'image depuis le registry privé" },
          { os: "linux", cmd: "docker images | grep mon-nginx", commentaire: "Vérifier que l'image est bien téléchargée" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "curl http://localhost:5000/v2/ retourne {}",
      "docker push localhost:5000/mon-nginx:v1 réussi",
      "curl /v2/_catalog liste mon-nginx",
      "Authentification htpasswd active — push sans login refusé",
      "VM cliente tire l'image depuis 192.168.56.10:5000 avec succès"
    ],
    tags: ["docker", "registry", "images", "htpasswd", "authentification", "automatisation"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 69,
    titre: "Ansible — rôles, Galaxy et structure professionnelle",
    categorie: "automatisation",
    niveau: "avancé",
    duree: 90,
    description: "Structurer ses playbooks Ansible avec les rôles pour les rendre réutilisables et maintenables. Utiliser Ansible Galaxy pour télécharger des rôles communautaires, créer ses propres rôles avec la structure standard et gérer les dépendances avec requirements.yml.",
    objectifs: [
      "Comprendre la structure d'un rôle Ansible",
      "Créer un rôle avec ansible-galaxy init",
      "Utiliser handlers, defaults et templates dans un rôle",
      "Télécharger et utiliser un rôle depuis Ansible Galaxy",
      "Gérer les dépendances avec requirements.yml"
    ],
    prerequis: [
      { type: "logiciel", nom: "Ansible installé sur la machine de contrôle" },
      { type: "vm", nom: "Une ou deux VMs Linux cibles accessibles en SSH" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Structure d'un rôle Ansible",
        contexte: "Un rôle organise les tâches, variables, templates et handlers dans une structure de dossiers standard. Cela permet la réutilisation entre projets.",
        commandes: [
          { os: "linux", cmd: "mkdir -p ~/ansible-roles-lab && cd ~/ansible-roles-lab\nansible-galaxy init roles/nginx", commentaire: "Créer la structure d'un rôle nginx avec ansible-galaxy" },
          { os: "linux", cmd: "tree roles/nginx/", commentaire: "Observer la structure : tasks/, handlers/, defaults/, templates/, files/, vars/, meta/" },
          { os: "linux", cmd: "# Structure créée :\n# roles/nginx/\n# ├── tasks/main.yml       # tâches principales\n# ├── handlers/main.yml    # handlers (ex: reload nginx)\n# ├── defaults/main.yml    # variables par défaut\n# ├── templates/           # templates Jinja2\n# ├── files/               # fichiers statiques\n# └── meta/main.yml        # métadonnées du rôle", commentaire: "Chaque dossier a un rôle précis dans l'organisation" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Écrire le rôle nginx",
        contexte: "On remplit le rôle avec des tâches d'installation, un handler de reload, des variables par défaut et un template de configuration.",
        commandes: [
          { os: "linux", cmd: "# roles/nginx/defaults/main.yml :\n# ---\n# nginx_port: 80\n# nginx_server_name: localhost\n# nginx_root: /var/www/html", commentaire: "Variables par défaut (surchargeables par l'utilisateur du rôle)" },
          { os: "linux", cmd: "# roles/nginx/tasks/main.yml :\n# ---\n# - name: Installer nginx\n#   apt:\n#     name: nginx\n#     state: present\n#     update_cache: yes\n# - name: Deployer la config nginx\n#   template:\n#     src: nginx.conf.j2\n#     dest: /etc/nginx/sites-available/default\n#   notify: Reload nginx\n# - name: Activer nginx\n#   service:\n#     name: nginx\n#     state: started\n#     enabled: yes", commentaire: "Tâches du rôle : install + config template + service" },
          { os: "linux", cmd: "# roles/nginx/handlers/main.yml :\n# ---\n# - name: Reload nginx\n#   service:\n#     name: nginx\n#     state: reloaded", commentaire: "Handler déclenché par notify quand la config change" },
          { os: "linux", cmd: "# roles/nginx/templates/nginx.conf.j2 :\n# server {\n#   listen {{ nginx_port }};\n#   server_name {{ nginx_server_name }};\n#   root {{ nginx_root }};\n#   index index.html;\n# }", commentaire: "Template Jinja2 qui utilise les variables du rôle" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Utiliser le rôle dans un playbook",
        contexte: "On crée un playbook qui appelle le rôle et surcharge certaines variables par défaut.",
        commandes: [
          { os: "linux", cmd: "# site.yml :\n# ---\n# - name: Deployer le serveur web\n#   hosts: webservers\n#   become: yes\n#   roles:\n#     - role: nginx\n#       vars:\n#         nginx_port: 8080\n#         nginx_server_name: mon-serveur.local", commentaire: "Appeler le rôle en surchargeant les variables par défaut" },
          { os: "linux", cmd: "ansible-playbook site.yml -i inventory.ini", commentaire: "Exécuter le playbook avec le rôle" },
          { os: "linux", cmd: "ansible-playbook site.yml -i inventory.ini --check", commentaire: "--check : mode dry-run, simule sans appliquer" }
        ],
        erreurs_courantes: [
          { symptome: "ERROR : the role was not found", cause: "Le rôle n'est pas dans le répertoire roles/ du projet ou dans /etc/ansible/roles", solution: "Vérifier le chemin roles_path dans ansible.cfg ou utiliser un chemin absolu dans le playbook" }
        ]
      },
      {
        titre: "Étape 4 — Ansible Galaxy et requirements.yml",
        contexte: "Ansible Galaxy est le hub de rôles communautaires. On installe un rôle tiers et on gère les dépendances avec requirements.yml.",
        commandes: [
          { os: "linux", cmd: "ansible-galaxy search nginx --author geerlingguy", commentaire: "Chercher des rôles nginx sur Galaxy" },
          { os: "linux", cmd: "ansible-galaxy install geerlingguy.nginx", commentaire: "Installer un rôle depuis Galaxy" },
          { os: "linux", cmd: "# requirements.yml :\n# ---\n# roles:\n#   - name: geerlingguy.nginx\n#     version: '3.2.0'\n#   - name: geerlingguy.php\n#     version: '5.0.0'", commentaire: "Fichier de dépendances avec versions fixes" },
          { os: "linux", cmd: "ansible-galaxy install -r requirements.yml", commentaire: "Installer toutes les dépendances depuis requirements.yml" },
          { os: "linux", cmd: "ansible-galaxy list", commentaire: "Lister les rôles installés localement" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "ansible-galaxy init crée la structure complète du rôle",
      "roles/nginx/tasks/main.yml contient install + template + service",
      "Handler Reload nginx déclenché quand la config change",
      "Template nginx.conf.j2 utilise les variables Jinja2",
      "ansible-playbook --check passe sans erreur",
      "ansible-galaxy install -r requirements.yml installe les dépendances"
    ],
    tags: ["ansible", "roles", "galaxy", "jinja2", "handlers", "automatisation", "iac"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 70,
    titre: "Ansible — gestion des utilisateurs, sudo et clés SSH",
    categorie: "automatisation",
    niveau: "intermédiaire",
    duree: 60,
    description: "Automatiser avec Ansible la gestion des comptes utilisateurs sur plusieurs serveurs : création de comptes, déploiement de clés SSH autorisées, configuration sudo et suppression sécurisée. Idéal pour gérer une flotte de serveurs.",
    objectifs: [
      "Créer des utilisateurs sur plusieurs hôtes avec un playbook",
      "Déployer des clés SSH autorisées depuis Ansible",
      "Configurer les droits sudo via un template sudoers",
      "Gérer les groupes et l'appartenance",
      "Supprimer un utilisateur et ses données proprement"
    ],
    prerequis: [
      { type: "logiciel", nom: "Ansible installé sur la machine de contrôle" },
      { type: "vm", nom: "Deux VMs Linux cibles accessibles en SSH avec sudo" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Inventaire et variables de groupe",
        contexte: "On définit la liste des utilisateurs à créer dans des variables de groupe pour les réutiliser facilement.",
        commandes: [
          { os: "linux", cmd: "# inventory.ini :\n# [serveurs]\n# 192.168.56.10\n# 192.168.56.20\n# [serveurs:vars]\n# ansible_user=vagrant\n# ansible_become=yes", commentaire: "Inventaire avec deux serveurs cibles" },
          { os: "linux", cmd: "# group_vars/serveurs.yml :\n# ---\n# utilisateurs:\n#   - nom: alice\n#     groupes: [sudo, docker]\n#     shell: /bin/bash\n#     cle_ssh: 'ssh-ed25519 AAAA... alice@laptop'\n#   - nom: bob\n#     groupes: [developers]\n#     shell: /bin/bash\n#     cle_ssh: 'ssh-ed25519 BBBB... bob@laptop'", commentaire: "Liste des utilisateurs à créer dans les variables de groupe" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Playbook de création des utilisateurs",
        contexte: "On utilise les modules user, group et authorized_key pour créer les comptes et déployer les clés SSH.",
        commandes: [
          { os: "linux", cmd: "# users.yml :\n# ---\n# - name: Gestion des utilisateurs\n#   hosts: serveurs\n#   become: yes\n#   tasks:\n#     - name: Créer les groupes\n#       group:\n#         name: '{{ item }}'\n#         state: present\n#       loop: [sudo, docker, developers]\n#     - name: Créer les utilisateurs\n#       user:\n#         name: '{{ item.nom }}'\n#         groups: '{{ item.groupes }}'\n#         shell: '{{ item.shell }}'\n#         create_home: yes\n#         state: present\n#       loop: '{{ utilisateurs }}'\n#     - name: Deployer les cles SSH\n#       authorized_key:\n#         user: '{{ item.nom }}'\n#         key: '{{ item.cle_ssh }}'\n#         state: present\n#       loop: '{{ utilisateurs }}'", commentaire: "Playbook complet : groupes + utilisateurs + clés SSH" },
          { os: "linux", cmd: "ansible-playbook users.yml -i inventory.ini", commentaire: "Exécuter le playbook sur tous les serveurs" },
          { os: "linux", cmd: "ansible serveurs -i inventory.ini -m command -a 'id alice'", commentaire: "Vérifier la création d'alice sur tous les hôtes" }
        ],
        erreurs_courantes: [
          { symptome: "FAILED : user alice is not in sudoers file", cause: "Le groupe sudo n'existe pas sur la distribution cible (CentOS/RHEL utilisent wheel)", solution: "Adapter le nom du groupe : sudo pour Debian/Ubuntu, wheel pour CentOS/RHEL" }
        ]
      },
      {
        titre: "Étape 3 — Configurer sudo sans mot de passe",
        contexte: "On déploie un fichier sudoers pour chaque utilisateur ou groupe via un template Ansible, sans éditer /etc/sudoers directement.",
        commandes: [
          { os: "linux", cmd: "# templates/sudoers_user.j2 :\n# # Sudo sans mot de passe pour {{ item.nom }}\n# {{ item.nom }} ALL=(ALL) NOPASSWD: ALL", commentaire: "Template sudoers pour un utilisateur" },
          { os: "linux", cmd: "# Ajouter dans users.yml :\n#     - name: Configurer sudo\n#       template:\n#         src: templates/sudoers_user.j2\n#         dest: '/etc/sudoers.d/{{ item.nom }}'\n#         mode: '0440'\n#         validate: 'visudo -cf %s'\n#       loop: '{{ utilisateurs }}'", commentaire: "Déployer le fichier sudoers avec validation visudo avant application" },
          { os: "linux", cmd: "ansible serveurs -i inventory.ini -m command -a 'sudo -l -U alice'", commentaire: "Vérifier les droits sudo d'alice sur tous les hôtes" }
        ],
        erreurs_courantes: [
          { symptome: "visudo: /etc/sudoers.d/alice: syntax error", cause: "Erreur dans le template Jinja2 ou espace manquant", solution: "Le paramètre validate: 'visudo -cf %s' empêche le déploiement si la syntaxe est incorrecte — corriger le template" }
        ]
      },
      {
        titre: "Étape 4 — Supprimer un utilisateur",
        contexte: "On ajoute une tâche conditionnelle pour supprimer un utilisateur et nettoyer ses fichiers sudoers.",
        commandes: [
          { os: "linux", cmd: "# Ajouter dans users.yml une variable d'état :\n# utilisateurs_a_supprimer:\n#   - bob\n#\n# tasks:\n#   - name: Supprimer les utilisateurs\n#     user:\n#       name: '{{ item }}'\n#       state: absent\n#       remove: yes\n#     loop: '{{ utilisateurs_a_supprimer | default([]) }}'", commentaire: "Supprimer bob et son home avec remove: yes" },
          { os: "linux", cmd: "# Nettoyer le fichier sudoers :\n#   - name: Supprimer les sudoers\n#     file:\n#       path: '/etc/sudoers.d/{{ item }}'\n#       state: absent\n#     loop: '{{ utilisateurs_a_supprimer | default([]) }}'", commentaire: "Supprimer le fichier sudoers associé" },
          { os: "linux", cmd: "ansible-playbook users.yml -i inventory.ini -e 'utilisateurs_a_supprimer=[\"bob\"]'", commentaire: "Passer la variable en ligne de commande avec -e" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Utilisateurs alice et bob créés sur tous les hôtes",
      "id alice : groupes corrects sur chaque serveur",
      "SSH avec clé fonctionne pour alice sans mot de passe",
      "sudo -l -U alice : droits sudo configurés",
      "Fichier /etc/sudoers.d/alice validé par visudo",
      "Suppression de bob : compte et home supprimés sur tous les hôtes"
    ],
    tags: ["ansible", "utilisateurs", "ssh", "sudo", "authorized-key", "automatisation", "administration"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 71,
    titre: "Python scripting — automatisation réseau et système",
    categorie: "automatisation",
    niveau: "intermédiaire",
    duree: 75,
    description: "Écrire des scripts Python pour automatiser des tâches d'administration réseau et système : scan de ports avec socket, surveillance de services, parsing de logs, envoi d'alertes par email et interaction avec des APIs REST.",
    objectifs: [
      "Écrire un scanner de ports avec le module socket",
      "Surveiller des services et envoyer des alertes",
      "Parser des fichiers de logs avec re et collections",
      "Interagir avec une API REST avec requests",
      "Planifier un script avec schedule"
    ],
    prerequis: [
      { type: "logiciel", nom: "Python 3.10+ installé" },
      { type: "vm", nom: "VM Linux Debian 12 ou Ubuntu 22.04" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Scanner de ports Python",
        contexte: "On écrit un scanner de ports simple avec le module socket standard, sans bibliothèque externe.",
        commandes: [
          { os: "linux", cmd: "# scanner.py :\nimport socket\nimport sys\nfrom concurrent.futures import ThreadPoolExecutor\n\ndef scan_port(host, port):\n    try:\n        s = socket.socket()\n        s.settimeout(0.5)\n        s.connect((host, port))\n        s.close()\n        return port, True\n    except:\n        return port, False\n\nhost = sys.argv[1] if len(sys.argv) > 1 else '127.0.0.1'\nports = range(1, 1025)\nprint(f'Scan de {host}...')\nwith ThreadPoolExecutor(max_workers=100) as ex:\n    results = ex.map(lambda p: scan_port(host, p), ports)\nfor port, open_ in results:\n    if open_:\n        print(f'  Port {port} : OUVERT')", commentaire: "Scanner multi-threadé des 1024 premiers ports" },
          { os: "linux", cmd: "python3 scanner.py 192.168.56.10", commentaire: "Lancer le scan sur une VM du lab" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Surveillance de services avec alertes",
        contexte: "On vérifie périodiquement qu'un service répond et on envoie un email d'alerte si ce n'est pas le cas.",
        commandes: [
          { os: "linux", cmd: "pip3 install requests --break-system-packages", commentaire: "Installer requests pour les appels HTTP" },
          { os: "linux", cmd: "# monitor.py :\nimport socket\nimport smtplib\nfrom datetime import datetime\n\nSERVICES = [\n    {'nom': 'HTTP', 'host': '192.168.56.10', 'port': 80},\n    {'nom': 'SSH', 'host': '192.168.56.10', 'port': 22},\n]\n\ndef check_service(host, port, timeout=3):\n    try:\n        s = socket.create_connection((host, port), timeout)\n        s.close()\n        return True\n    except:\n        return False\n\nfor svc in SERVICES:\n    status = check_service(svc['host'], svc['port'])\n    etat = 'OK' if status else 'ALERTE'\n    print(f\"[{datetime.now():%H:%M:%S}] {svc['nom']} {svc['host']}:{svc['port']} -> {etat}\")", commentaire: "Script de monitoring multi-services avec horodatage" },
          { os: "linux", cmd: "python3 monitor.py", commentaire: "Tester le monitoring" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Parser des logs avec re et Counter",
        contexte: "On analyse un fichier de log Apache/Nginx pour extraire les IPs les plus actives, les codes d'erreur et les URLs les plus visitées.",
        commandes: [
          { os: "linux", cmd: "# parse_logs.py :\nimport re\nfrom collections import Counter\n\nLOG_FILE = '/var/log/nginx/access.log'\nLOG_PATTERN = r'(\\S+) .* \"\\S+ (\\S+) \\S+\" (\\d+)'\n\nips = Counter()\ncodes = Counter()\nurls = Counter()\n\ntry:\n    with open(LOG_FILE) as f:\n        for line in f:\n            m = re.match(LOG_PATTERN, line)\n            if m:\n                ips[m.group(1)] += 1\n                urls[m.group(2)] += 1\n                codes[m.group(3)] += 1\n    print('Top 5 IPs:', ips.most_common(5))\n    print('Top 5 URLs:', urls.most_common(5))\n    print('Codes HTTP:', dict(codes))\nexcept FileNotFoundError:\n    print('Log introuvable — générer du trafic avec curl dabord')", commentaire: "Analyser les logs nginx : top IPs, URLs et codes HTTP" },
          { os: "linux", cmd: "for i in $(seq 1 20); do curl -s http://localhost > /dev/null; done\npython3 parse_logs.py", commentaire: "Générer du trafic puis analyser les logs" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Appel API REST avec requests",
        contexte: "On interagit avec une API REST (exemple : API GitHub ou API locale) pour automatiser des tâches comme la création d'issues ou la récupération de métriques.",
        commandes: [
          { os: "linux", cmd: "# api_client.py :\nimport requests\nimport json\n\n# Exemple : API GitHub publique\nurl = 'https://api.github.com/repos/torvalds/linux'\nheaders = {'Accept': 'application/vnd.github.v3+json'}\n\nresp = requests.get(url, headers=headers, timeout=10)\nif resp.status_code == 200:\n    data = resp.json()\n    print(f\"Repo : {data['full_name']}\")\n    print(f\"Stars : {data['stargazers_count']}\")\n    print(f\"Forks : {data['forks_count']}\")\nelse:\n    print(f'Erreur {resp.status_code}')", commentaire: "Appel GET sur l'API GitHub et affichage des données JSON" },
          { os: "linux", cmd: "python3 api_client.py", commentaire: "Exécuter le client API" },
          { os: "linux", cmd: "# Exemple POST avec authentification :\nresp = requests.post(\n    'https://api.example.com/endpoint',\n    json={'cle': 'valeur'},\n    headers={'Authorization': 'Bearer MON_TOKEN'},\n    timeout=10\n)\nprint(resp.status_code, resp.json())", commentaire: "Requête POST avec token d'authentification Bearer" }
        ],
        erreurs_courantes: [
          { symptome: "requests.exceptions.ConnectionError", cause: "Pas d'accès Internet ou URL incorrecte", solution: "Vérifier la connexion réseau et l'URL. Utiliser timeout= pour éviter les blocages infinis." }
        ]
      }
    ],
    checklist: [
      "scanner.py : ports ouverts détectés sur la VM cible",
      "monitor.py : statut OK/ALERTE affiché pour chaque service",
      "parse_logs.py : top 5 IPs et URLs extraits depuis les logs nginx",
      "api_client.py : données JSON récupérées depuis l'API GitHub"
    ],
    tags: ["python", "scripting", "socket", "requests", "api", "logs", "monitoring", "automatisation"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 72,
    titre: "Makefile — automatiser les tâches de déploiement",
    categorie: "automatisation",
    niveau: "débutant",
    duree: 45,
    description: "Utiliser Make et les Makefiles pour automatiser les tâches répétitives de déploiement et d'administration : build d'images Docker, déploiement Ansible, tests et nettoyage. Un Makefile sert de point d'entrée unique pour toutes les opérations du projet.",
    objectifs: [
      "Comprendre la syntaxe d'un Makefile",
      "Créer des cibles pour les opérations courantes",
      "Utiliser des variables et des cibles phony",
      "Chaîner des dépendances entre cibles",
      "Intégrer un Makefile dans un projet Docker/Ansible"
    ],
    prerequis: [
      { type: "logiciel", nom: "Make installé (sudo apt install make)" },
      { type: "logiciel", nom: "Docker installé (pour les exemples Docker)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Syntaxe de base d'un Makefile",
        contexte: "Un Makefile définit des cibles (targets) avec leurs dépendances et les commandes shell à exécuter. L'indentation se fait avec des TABULATIONS (pas des espaces).",
        commandes: [
          { os: "linux", cmd: "sudo apt install make -y\nmake --version", commentaire: "Installer et vérifier make" },
          { os: "linux", cmd: "nano Makefile", commentaire: "Créer le Makefile (ATTENTION : indentation avec tabulations uniquement)" },
          { os: "linux", cmd: "# Makefile minimal :\n# .PHONY: help install clean\n# \n# help:  ## Afficher cette aide\n# \t@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = \":.*?## \"}; {printf \"\\033[36m%-20s\\033[0m %s\\n\", $$1, $$2}'\n# \n# install:  ## Installer les dépendances\n# \tapt-get install -y nginx curl\n# \n# clean:  ## Nettoyer les fichiers temporaires\n# \trm -rf /tmp/build/*", commentaire: "Structure de base avec cible help automatique" },
          { os: "linux", cmd: "make help", commentaire: "Afficher l'aide du Makefile" }
        ],
        erreurs_courantes: [
          { symptome: "Makefile:3: *** missing separator. Stop.", cause: "Indentation avec des espaces au lieu de tabulations", solution: "Dans nano : Ctrl+K pour couper la ligne, Ctrl+U pour coller, puis Tab pour indenter. Vérifier avec cat -A Makefile — les tabulations apparaissent comme ^I" }
        ]
      },
      {
        titre: "Étape 2 — Variables et Makefile Docker",
        contexte: "On crée un Makefile pour gérer un projet Docker : build, run, push et nettoyage avec des variables réutilisables.",
        commandes: [
          { os: "linux", cmd: "# Makefile Docker :\n# IMAGE_NAME := mon-app\n# IMAGE_TAG := latest\n# REGISTRY := localhost:5000\n# CONTAINER_NAME := mon-app-dev\n# \n# .PHONY: build run stop push clean\n# \n# build:  ## Builder l'image Docker\n# \tdocker build -t $(IMAGE_NAME):$(IMAGE_TAG) .\n# \n# run:  ## Lancer le conteneur en dev\n# \tdocker run -d --name $(CONTAINER_NAME) -p 8080:80 $(IMAGE_NAME):$(IMAGE_TAG)\n# \n# stop:  ## Stopper et supprimer le conteneur\n# \tdocker stop $(CONTAINER_NAME) || true\n# \tdocker rm $(CONTAINER_NAME) || true\n# \n# push: build  ## Builder et pousser vers le registry\n# \tdocker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)\n# \tdocker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)\n# \n# clean: stop  ## Nettoyage complet\n# \tdocker rmi $(IMAGE_NAME):$(IMAGE_TAG) || true", commentaire: "Makefile complet pour un workflow Docker" },
          { os: "linux", cmd: "make build\nmake run\nmake stop", commentaire: "Utiliser les cibles du Makefile" },
          { os: "linux", cmd: "make push REGISTRY=192.168.56.10:5000", commentaire: "Surcharger une variable depuis la ligne de commande" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Makefile pour un projet Ansible",
        contexte: "On crée un Makefile qui expose les opérations Ansible courantes avec une interface simple.",
        commandes: [
          { os: "linux", cmd: "# Makefile Ansible :\n# INVENTORY := inventory.ini\n# PLAYBOOK := site.yml\n# TAGS :=\n# \n# .PHONY: deploy check ping syntax\n# \n# deploy:  ## Déployer l'infrastructure\n# \tansible-playbook $(PLAYBOOK) -i $(INVENTORY) $(if $(TAGS),--tags $(TAGS),)\n# \n# check:  ## Dry-run sans appliquer\n# \tansible-playbook $(PLAYBOOK) -i $(INVENTORY) --check --diff\n# \n# ping:  ## Tester la connectivité Ansible\n# \tansible all -i $(INVENTORY) -m ping\n# \n# syntax:  ## Vérifier la syntaxe du playbook\n# \tansible-playbook $(PLAYBOOK) --syntax-check", commentaire: "Makefile pour simplifier les commandes Ansible" },
          { os: "linux", cmd: "make ping\nmake check\nmake deploy TAGS=nginx", commentaire: "Utiliser les cibles Ansible du Makefile" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "make --version confirme l'installation",
      "make help affiche les cibles disponibles avec description",
      "make build construit l'image Docker",
      "make run lance le conteneur",
      "make push REGISTRY=... pousse vers le registry",
      "make ping vérifie la connectivité Ansible"
    ],
    tags: ["makefile", "make", "automatisation", "docker", "ansible", "devops", "workflow"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 73,
    titre: "Webhooks — déclencher des actions automatiques via HTTP",
    categorie: "automatisation",
    niveau: "intermédiaire",
    duree: 60,
    description: "Créer un serveur de webhooks avec Python Flask pour déclencher des actions automatiques (déploiement, alertes, scripts) lorsqu'un événement externe se produit. Intégration avec GitHub webhooks pour le déploiement continu.",
    objectifs: [
      "Comprendre le mécanisme des webhooks HTTP",
      "Créer un serveur webhook avec Flask",
      "Sécuriser le webhook avec une signature HMAC",
      "Déclencher un script de déploiement depuis un webhook GitHub",
      "Tester et débugger les webhooks avec ngrok"
    ],
    prerequis: [
      { type: "vm", nom: "VM Linux avec Python 3 et pip installés" },
      { type: "logiciel", nom: "Flask : pip3 install flask" },
      { type: "logiciel", nom: "ngrok pour exposer le serveur local (optionnel)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Serveur webhook Flask basique",
        contexte: "On crée un endpoint HTTP POST qui reçoit les données d'un webhook et exécute une action.",
        commandes: [
          { os: "linux", cmd: "pip3 install flask --break-system-packages", commentaire: "Installer Flask" },
          { os: "linux", cmd: "# webhook_server.py :\nfrom flask import Flask, request, jsonify\nimport subprocess\nimport logging\n\napp = Flask(__name__)\nlogging.basicConfig(level=logging.INFO)\n\n@app.route('/webhook', methods=['POST'])\ndef webhook():\n    data = request.json\n    logging.info(f'Webhook reçu : {data}')\n    # Déclencher une action\n    result = subprocess.run(['echo', 'Déploiement déclenché'], capture_output=True, text=True)\n    return jsonify({'status': 'ok', 'output': result.stdout}), 200\n\nif __name__ == '__main__':\n    app.run(host='0.0.0.0', port=5001, debug=True)", commentaire: "Serveur webhook minimal sur le port 5001" },
          { os: "linux", cmd: "python3 webhook_server.py &\ncurl -X POST http://localhost:5001/webhook -H 'Content-Type: application/json' -d '{\"event\": \"push\", \"repo\": \"mon-projet\"}'", commentaire: "Lancer le serveur et tester avec curl" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Sécuriser avec HMAC",
        contexte: "GitHub et la plupart des services signent leurs webhooks avec HMAC-SHA256. On vérifie la signature pour s'assurer que la requête est légitime.",
        commandes: [
          { os: "linux", cmd: "# Ajouter la vérification HMAC dans webhook_server.py :\nimport hmac\nimport hashlib\n\nSECRET = b'mon-secret-webhook'\n\ndef verify_signature(payload, signature):\n    expected = 'sha256=' + hmac.new(SECRET, payload, hashlib.sha256).hexdigest()\n    return hmac.compare_digest(expected, signature)\n\n@app.route('/webhook/secure', methods=['POST'])\ndef webhook_secure():\n    sig = request.headers.get('X-Hub-Signature-256', '')\n    if not verify_signature(request.data, sig):\n        return jsonify({'error': 'Signature invalide'}), 403\n    data = request.json\n    logging.info(f'Webhook sécurisé reçu : {data}')\n    return jsonify({'status': 'ok'}), 200", commentaire: "Endpoint sécurisé avec vérification HMAC-SHA256" },
          { os: "linux", cmd: "# Tester avec la bonne signature :\nSECRET='mon-secret-webhook'\nPAYLOAD='{\"event\":\"push\"}'\nSIG=$(echo -n \"$PAYLOAD\" | openssl dgst -sha256 -hmac \"$SECRET\" | awk '{print \"sha256=\"$2}')\ncurl -X POST http://localhost:5001/webhook/secure -H 'Content-Type: application/json' -H \"X-Hub-Signature-256: $SIG\" -d \"$PAYLOAD\"", commentaire: "Tester avec une signature HMAC correcte" }
        ],
        erreurs_courantes: [
          { symptome: "Signature invalide alors que le secret est correct", cause: "Différence entre le payload brut et le payload parsé (espaces, encoding)", solution: "Utiliser request.data (bytes bruts) et non request.json pour calculer la signature" }
        ]
      },
      {
        titre: "Étape 3 — Intégration GitHub et déploiement automatique",
        contexte: "On configure un webhook GitHub qui appelle notre serveur à chaque push. Le serveur exécute alors un git pull pour mettre à jour le code en production.",
        commandes: [
          { os: "linux", cmd: "# Exposer le serveur avec ngrok :\nwget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz\ntar -xf ngrok-v3-stable-linux-amd64.tgz\n./ngrok http 5001", commentaire: "Exposer le serveur local via ngrok pour GitHub" },
          { os: "linux", cmd: "# Sur GitHub : Settings > Webhooks > Add webhook\n# Payload URL : https://xxxx.ngrok.io/webhook/secure\n# Content type : application/json\n# Secret : mon-secret-webhook\n# Events : Just the push event", commentaire: "Configurer le webhook sur GitHub" },
          { os: "linux", cmd: "# Dans webhook_server.py, remplacer l'action par un déploiement réel :\n# result = subprocess.run(\n#     ['git', '-C', '/var/www/mon-projet', 'pull', 'origin', 'main'],\n#     capture_output=True, text=True\n# )\n# logging.info(f'git pull : {result.stdout}')", commentaire: "Déclencher un git pull à chaque push GitHub" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "curl POST /webhook retourne {status: ok}",
      "Webhook sans signature correcte retourne 403",
      "Signature HMAC-SHA256 calculée et vérifiée correctement",
      "ngrok expose le serveur avec une URL publique",
      "Webhook GitHub configuré et test de livraison réussi (coche verte)"
    ],
    tags: ["webhook", "flask", "python", "hmac", "github", "deploiement", "automatisation", "cicd"],
    date_ajout: "2026-06-27",
    source: "École"
  },

  {
    id: 74,
    titre: "PowerShell scripting — automatisation Windows Server",
    categorie: "automatisation",
    niveau: "intermédiaire",
    duree: 75,
    description: "Maîtriser PowerShell pour automatiser l'administration Windows Server : gestion des services, utilisateurs Active Directory, rapports système, planification de tâches et gestion à distance avec PowerShell Remoting.",
    objectifs: [
      "Maîtriser les fondamentaux PowerShell (cmdlets, pipeline, variables)",
      "Écrire des scripts de gestion de services et processus",
      "Automatiser la gestion des utilisateurs Active Directory",
      "Générer des rapports système en CSV et HTML",
      "Utiliser PowerShell Remoting pour gérer des serveurs distants"
    ],
    prerequis: [
      { type: "vm", nom: "VM Windows Server 2022 ou Windows 10/11" },
      { type: "logiciel", nom: "PowerShell 5.1 ou PowerShell 7+ (cross-platform)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Fondamentaux PowerShell",
        contexte: "PowerShell manipule des objets .NET au lieu de texte brut. Le pipeline | passe des objets entre cmdlets. Get-Help et Get-Member sont les deux commandes les plus importantes à connaître.",
        commandes: [
          { os: "windows", cmd: "$PSVersionTable", commentaire: "Afficher la version PowerShell installée" },
          { os: "windows", cmd: "Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object Name, DisplayName | Sort-Object Name", commentaire: "Lister les services en cours d'exécution — exemple de pipeline objet" },
          { os: "windows", cmd: "Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, WorkingSet", commentaire: "Top 10 processus par consommation CPU" },
          { os: "windows", cmd: "Get-Help Get-Service -Examples", commentaire: "Afficher des exemples d'utilisation d'une cmdlet" },
          { os: "windows", cmd: "Get-Service | Get-Member", commentaire: "Voir toutes les propriétés et méthodes disponibles sur les objets retournés" }
        ],
        erreurs_courantes: [
          { symptome: "Impossible de charger le fichier car l'exécution de scripts est désactivée", cause: "ExecutionPolicy restrictive (Restricted par défaut)", solution: "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" }
        ]
      },
      {
        titre: "Étape 2 — Scripts de gestion des services",
        contexte: "On écrit un script qui vérifie l'état des services critiques et les redémarre automatiquement si nécessaire.",
        commandes: [
          { os: "windows", cmd: "# monitor-services.ps1 :\n$services_critiques = @('W32Time', 'WinRM', 'Spooler')\n$rapport = @()\nforeach ($svc in $services_critiques) {\n    $service = Get-Service -Name $svc -ErrorAction SilentlyContinue\n    if ($service -and $service.Status -ne 'Running') {\n        Write-Warning \"$svc arrete - tentative de demarrage\"\n        Start-Service -Name $svc\n        $service.Refresh()\n    }\n    $rapport += [PSCustomObject]@{\n        Nom = $svc\n        Etat = $service.Status\n        Heure = Get-Date -Format 'yyyy-MM-dd HH:mm'\n    }\n}\n$rapport | Export-Csv -Path C:\\Logs\\services.csv -NoTypeInformation -Encoding UTF8\nWrite-Host 'Rapport genere : C:\\Logs\\services.csv'", commentaire: "Script de monitoring et auto-restart des services critiques" },
          { os: "windows", cmd: "New-Item -ItemType Directory -Force C:\\Logs\nSet-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force\n.\\monitor-services.ps1", commentaire: "Créer le dossier logs et exécuter le script" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Gestion Active Directory en masse",
        contexte: "On automatise la création de plusieurs utilisateurs AD depuis un fichier CSV et on génère un rapport des comptes inactifs.",
        commandes: [
          { os: "windows", cmd: "# Créer users.csv :\n# Prenom,Nom,Service,OU\n# Alice,Martin,Informatique,OU=Informatique DC=lab DC=local\n# Bob,Dupont,RH,OU=RH DC=lab DC=local\n\n# import-users.ps1 :\nImport-Module ActiveDirectory\n$users = Import-Csv -Path .\\users.csv\nforeach ($user in $users) {\n    $sam = ($user.Prenom[0] + $user.Nom).ToLower()\n    $upn = \"$sam@lab.local\"\n    New-ADUser -GivenName $user.Prenom -Surname $user.Nom -SamAccountName $sam -UserPrincipalName $upn -Path $user.OU -AccountPassword (ConvertTo-SecureString 'P@ssw0rd123!' -AsPlainText -Force) -Enabled $true\n    Write-Host \"Cree : $sam\"\n}", commentaire: "Importer des utilisateurs AD depuis un CSV" },
          { os: "windows", cmd: "# Rapport comptes inactifs (90 jours) :\n$date_limite = (Get-Date).AddDays(-90)\nGet-ADUser -Filter {LastLogonDate -lt $date_limite -and Enabled -eq $true} -Properties LastLogonDate | Select-Object Name, SamAccountName, LastLogonDate | Export-Csv C:\\Logs\\comptes-inactifs.csv -NoTypeInformation", commentaire: "Générer un rapport CSV des comptes inactifs depuis 90 jours" }
        ],
        erreurs_courantes: [
          { symptome: "Import-Module ActiveDirectory : module introuvable", cause: "Outils RSAT non installés sur le poste", solution: "Add-WindowsCapability -Online -Name Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0" }
        ]
      },
      {
        titre: "Étape 4 — Rapport HTML et planification",
        contexte: "On génère un rapport HTML de l'état du serveur et on planifie son exécution automatique avec le Planificateur de tâches PowerShell.",
        commandes: [
          { os: "windows", cmd: "# rapport-systeme.ps1 :\n$cpu = (Get-CimInstance Win32_Processor).LoadPercentage\n$ram = Get-CimInstance Win32_OperatingSystem\n$ram_pct = [math]::Round((($ram.TotalVisibleMemorySize - $ram.FreePhysicalMemory) / $ram.TotalVisibleMemorySize) * 100, 1)\n$disques = Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Used -gt 0}\n\n$html = @\"\n<html><body>\n<h2>Rapport Systeme - $(Get-Date -Format 'dd/MM/yyyy HH:mm')</h2>\n<p>CPU : $cpu%</p>\n<p>RAM : $ram_pct%</p>\n<table border=1><tr><th>Lecteur</th><th>Libre (Go)</th></tr>\n$($disques | ForEach-Object {\"<tr><td>$($_.Name)</td><td>$([math]::Round($_.Free/1GB,1))</td></tr>\"})\n</table></body></html>\n\"@\n$html | Out-File C:\\Logs\\rapport.html -Encoding UTF8", commentaire: "Générer un rapport HTML système (CPU, RAM, disques)" },
          { os: "windows", cmd: "$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-File C:\\Scripts\\rapport-systeme.ps1'\n$trigger = New-ScheduledTaskTrigger -Daily -At '07:00'\nRegister-ScheduledTask -TaskName 'RapportSysteme' -Action $action -Trigger $trigger -RunLevel Highest", commentaire: "Planifier le rapport chaque jour à 7h avec le Planificateur de tâches" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 5 — PowerShell Remoting",
        contexte: "WinRM permet d'exécuter des commandes PowerShell sur des machines distantes. Indispensable pour gérer une flotte de serveurs Windows.",
        commandes: [
          { os: "windows", cmd: "# Sur le serveur distant : activer WinRM\nEnable-PSRemoting -Force", commentaire: "Activer PowerShell Remoting sur le serveur cible" },
          { os: "windows", cmd: "# Depuis la machine de gestion :\nEnter-PSSession -ComputerName 192.168.1.10 -Credential (Get-Credential)", commentaire: "Ouvrir une session interactive sur le serveur distant" },
          { os: "windows", cmd: "Invoke-Command -ComputerName 192.168.1.10, 192.168.1.20 -ScriptBlock { Get-Service | Where-Object Status -eq 'Stopped' }", commentaire: "Exécuter une commande sur plusieurs serveurs simultanément" },
          { os: "windows", cmd: "$session = New-PSSession -ComputerName 192.168.1.10\nCopy-Item -Path C:\\Scripts\\rapport.ps1 -Destination C:\\Scripts\\ -ToSession $session\nInvoke-Command -Session $session -ScriptBlock { C:\\Scripts\\rapport.ps1 }\nRemove-PSSession $session", commentaire: "Copier un script et l'exécuter à distance via une session persistante" }
        ],
        erreurs_courantes: [
          { symptome: "WinRM ne peut pas traiter la demande car le nom d'hôte ne correspond pas", cause: "Le serveur distant n'est pas dans TrustedHosts", solution: "Set-Item WSMan:\\localhost\\Client\\TrustedHosts -Value '192.168.1.10' -Force" }
        ]
      }
    ],
    checklist: [
      "Get-Service pipeline fonctionne — services Running listés",
      "monitor-services.ps1 génère C:\\Logs\\services.csv",
      "import-users.ps1 crée les utilisateurs dans l'AD",
      "Rapport comptes-inactifs.csv généré",
      "rapport-systeme.ps1 génère un fichier HTML valide",
      "Tâche planifiée RapportSysteme visible dans le Planificateur",
      "Invoke-Command exécute une commande sur le serveur distant"
    ],
    tags: ["powershell", "windows-server", "scripting", "active-directory", "winrm", "automatisation", "windows"],
    date_ajout: "2026-06-27",
    source: "École"
  }

];
