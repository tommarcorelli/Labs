// TP & Labs IT — Catégorie : projets
// 3 TP(s)

const LABS_PROJETS = [
  {
    id: 24,
    titre: "Projet — Infrastructure réseau complète sous GNS3",
    categorie: "projets",
    niveau: "avancé",
    duree: 180,
    description: "Concevoir et déployer une infrastructure réseau d'entreprise complète dans GNS3 : routage OSPF multi-zone, segmentation VLAN, pare-feu, DMZ, accès distant VPN et supervision. Ce projet de synthèse mobilise toutes les compétences réseau acquises et constitue un livrable de qualité pour le dossier BTS E4/E5.",
    objectifs: [
      "Concevoir un plan d'adressage cohérent pour une infrastructure multi-sites",
      "Déployer OSPF multi-zone avec redistribution de routes",
      "Mettre en place une DMZ avec filtrage ACL",
      "Configurer un accès VPN site-to-site simulé",
      "Documenter l'infrastructure avec schéma réseau et tableau d'adressage"
    ],
    prerequis: [
      { type: "logiciel", nom: "GNS3 2.2+ avec GNS3 VM", lien: "https://gns3.com" },
      { type: "vm", nom: "3x Cisco IOSv (routeurs)" },
      { type: "vm", nom: "2x Cisco IOSv-L2 (switches)" },
      { type: "reseau", nom: "TPs Réseau 1 à 7 complétés (VLAN, OSPF, NAT, ACL)" }
    ],
    schema_reseau: `<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:'JetBrains Mono',monospace">
  <!-- Site Principal -->
  <rect x="10" y="10" width="280" height="290" rx="8" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="150" y="28" text-anchor="middle" fill="#3B82F6" font-size="8">SITE PRINCIPAL</text>
  <!-- Core Router R1 -->
  <ellipse cx="150" cy="80" rx="40" ry="25" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="150" y="77" text-anchor="middle" fill="#F59E0B" font-size="9" font-weight="bold">R1-CORE</text>
  <text x="150" y="89" text-anchor="middle" fill="#78716C" font-size="7">OSPF Area 0</text>
  <!-- LAN Switch -->
  <rect x="60" y="155" width="80" height="40" rx="5" fill="#1C1917" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="100" y="173" text-anchor="middle" fill="#3B82F6" font-size="8" font-weight="bold">SW-LAN</text>
  <text x="100" y="185" text-anchor="middle" fill="#78716C" font-size="7">VLAN 10/20/30</text>
  <!-- DMZ Switch -->
  <rect x="170" y="155" width="80" height="40" rx="5" fill="#1C1917" stroke="#EF4444" stroke-width="1.5"/>
  <text x="210" y="173" text-anchor="middle" fill="#EF4444" font-size="8" font-weight="bold">SW-DMZ</text>
  <text x="210" y="185" text-anchor="middle" fill="#78716C" font-size="7">VLAN 100</text>
  <!-- Serveurs DMZ -->
  <rect x="155" y="235" width="55" height="28" rx="4" fill="#1C1917" stroke="#EF4444" stroke-width="1"/>
  <text x="182" y="248" text-anchor="middle" fill="#A8A29E" font-size="7">Web/DNS</text>
  <text x="182" y="258" text-anchor="middle" fill="#78716C" font-size="6">10.0.100.x</text>
  <!-- PCs LAN -->
  <rect x="45" y="235" width="55" height="28" rx="4" fill="#1C1917" stroke="#3B82F6" stroke-width="1"/>
  <text x="72" y="248" text-anchor="middle" fill="#A8A29E" font-size="7">PCs LAN</text>
  <text x="72" y="258" text-anchor="middle" fill="#78716C" font-size="6">10.0.10-20.x</text>
  <!-- Liens site principal -->
  <line x1="150" y1="105" x2="100" y2="155" stroke="#3B82F6" stroke-width="1.5"/>
  <line x1="150" y1="105" x2="210" y2="155" stroke="#EF4444" stroke-width="1.5"/>
  <line x1="100" y1="195" x2="72" y2="235" stroke="#3B82F6" stroke-width="1"/>
  <line x1="210" y1="195" x2="182" y2="235" stroke="#EF4444" stroke-width="1"/>
  <!-- Internet/WAN -->
  <ellipse cx="370" cy="160" rx="50" ry="35" fill="#1C1917" stroke="#44403C" stroke-width="1.5"/>
  <text x="370" y="156" text-anchor="middle" fill="#A8A29E" font-size="10">🌐</text>
  <text x="370" y="170" text-anchor="middle" fill="#78716C" font-size="8">WAN/Internet</text>
  <line x1="190" y1="80" x2="320" y2="145" stroke="#F59E0B" stroke-width="2"/>
  <!-- Site Secondaire -->
  <rect x="450" y="10" width="180" height="180" rx="8" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="540" y="28" text-anchor="middle" fill="#10B981" font-size="8">SITE SECONDAIRE</text>
  <ellipse cx="540" cy="90" rx="40" ry="25" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
  <text x="540" y="87" text-anchor="middle" fill="#F59E0B" font-size="9" font-weight="bold">R2-EDGE</text>
  <text x="540" y="99" text-anchor="middle" fill="#78716C" font-size="7">OSPF Area 1</text>
  <rect x="490" y="145" width="100" height="35" rx="5" fill="#1C1917" stroke="#10B981" stroke-width="1.5"/>
  <text x="540" y="160" text-anchor="middle" fill="#10B981" font-size="8" font-weight="bold">SW-SITE2</text>
  <text x="540" y="172" text-anchor="middle" fill="#78716C" font-size="7">VLAN 50/60</text>
  <line x1="540" y1="115" x2="540" y2="145" stroke="#10B981" stroke-width="1.5"/>
  <line x1="420" y1="160" x2="500" y2="110" stroke="#F59E0B" stroke-width="2"/>
  <!-- VPN label -->
  <text x="370" y="220" text-anchor="middle" fill="#8B5CF6" font-size="8" font-weight="bold">VPN Site-to-Site</text>
  <line x1="190" y1="90" x2="490" y2="100" stroke="#8B5CF6" stroke-width="1.5" stroke-dasharray="6,3"/>
</svg>`,
    etapes: [
      {
        titre: "Étape 1 — Conception et plan d'adressage",
        contexte: "Avant de toucher GNS3, on conçoit l'infrastructure sur papier. Un plan d'adressage bien structuré facilite le routage, les ACL et la documentation. On utilise des sous-réseaux logiques par fonction.",
        commandes: [
          { os: "both", cmd: "# Plan d'adressage :\n# 10.0.0.0/8 — Réseau global entreprise\n#\n# Site Principal :\n# 10.0.10.0/24  — LAN VLAN 10 (Admins)\n# 10.0.20.0/24  — LAN VLAN 20 (Users)\n# 10.0.30.0/24  — LAN VLAN 30 (Serveurs internes)\n# 10.0.100.0/24 — DMZ (Serveurs publics)\n# 10.0.0.0/30   — Lien WAN R1↔Internet\n#\n# Site Secondaire :\n# 10.1.50.0/24  — LAN VLAN 50\n# 10.1.60.0/24  — LAN VLAN 60\n# 10.1.0.0/30   — Lien WAN R2↔Internet\n#\n# Liens inter-routeurs /30 :\n# 10.255.0.0/30  — R1↔R2 (backbone)", commentaire: "Plan d'adressage complet — à documenter dans le dossier BTS" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Déployer OSPF multi-zone",
        contexte: "On configure OSPF avec deux zones : Area 0 (backbone, site principal) et Area 1 (site secondaire). R1 est l'ABR (Area Border Router) qui fait la liaison entre les zones.",
        commandes: [
          { os: "linux", cmd: "! R1 — ABR Area 0 + Area 1 :\nR1(config)# router ospf 1\nR1(config-router)# router-id 1.1.1.1\nR1(config-router)# network 10.0.0.0 0.0.255.255 area 0\nR1(config-router)# network 10.255.0.0 0.0.0.3 area 1\nR1(config-router)# passive-interface GigabitEthernet0/2", commentaire: "R1 annonce LAN en Area 0 et lien vers R2 en Area 1" },
          { os: "linux", cmd: "! R2 — Area 1 uniquement :\nR2(config)# router ospf 1\nR2(config-router)# router-id 2.2.2.2\nR2(config-router)# network 10.1.0.0 0.0.255.255 area 1\nR2(config-router)# network 10.255.0.0 0.0.0.3 area 1", commentaire: "R2 en Area 1 — voit le réseau site secondaire" },
          { os: "linux", cmd: "R1# show ip ospf neighbor\nR1# show ip route ospf\nR1# show ip ospf border-routers", commentaire: "Vérifier voisins OSPF, routes et ABR" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — VLANs, trunk et Router-on-a-Stick",
        contexte: "On configure les VLANs sur les switches et le routage inter-VLAN via sous-interfaces sur R1. La DMZ est isolée sur un switch dédié avec ACL strictes.",
        commandes: [
          { os: "linux", cmd: "! SW-LAN — VLANs et trunk :\nSW-LAN(config)# vlan 10\nSW-LAN(config-vlan)# name ADMINS\nSW-LAN(config)# vlan 20\nSW-LAN(config-vlan)# name USERS\nSW-LAN(config)# vlan 30\nSW-LAN(config-vlan)# name SERVEURS\nSW-LAN(config)# interface GigabitEthernet0/1\nSW-LAN(config-if)# switchport trunk encapsulation dot1q\nSW-LAN(config-if)# switchport mode trunk", commentaire: "VLANs LAN + trunk vers R1" },
          { os: "linux", cmd: "! R1 — Sous-interfaces inter-VLAN :\nR1(config)# interface GigabitEthernet0/0.10\nR1(config-subif)# encapsulation dot1Q 10\nR1(config-subif)# ip address 10.0.10.1 255.255.255.0\nR1(config)# interface GigabitEthernet0/0.20\nR1(config-subif)# encapsulation dot1Q 20\nR1(config-subif)# ip address 10.0.20.1 255.255.255.0\nR1(config)# interface GigabitEthernet0/0.30\nR1(config-subif)# encapsulation dot1Q 30\nR1(config-subif)# ip address 10.0.30.1 255.255.255.0", commentaire: "Sous-interfaces pour chaque VLAN" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — DMZ et ACL de filtrage",
        contexte: "La DMZ héberge les serveurs accessibles depuis Internet (Web, DNS). On isole la DMZ avec des ACL : les serveurs DMZ n'ont pas accès au LAN interne, et seuls les ports 80/443/53 sont accessibles depuis l'extérieur.",
        commandes: [
          { os: "linux", cmd: "! ACL de protection DMZ — appliquer sur interface vers DMZ :\nR1(config)# ip access-list extended PROTECT-DMZ\nR1(config-ext-nacl)# permit tcp any host 10.0.100.10 eq 80\nR1(config-ext-nacl)# permit tcp any host 10.0.100.10 eq 443\nR1(config-ext-nacl)# permit udp any host 10.0.100.20 eq 53\nR1(config-ext-nacl)# deny ip 10.0.100.0 0.0.0.255 10.0.0.0 0.0.255.255 log\nR1(config-ext-nacl)# permit ip any any", commentaire: "Autoriser HTTP/HTTPS/DNS vers DMZ, bloquer DMZ → LAN" },
          { os: "linux", cmd: "R1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip access-group PROTECT-DMZ in", commentaire: "Appliquer ACL sur l'interface DMZ en entrée" },
          { os: "linux", cmd: "R1# show ip access-lists PROTECT-DMZ", commentaire: "Vérifier les compteurs de matches après tests" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 5 — NAT et documentation finale",
        contexte: "On configure le NAT/PAT pour l'accès Internet du LAN interne et on documente l'infrastructure complète : schéma réseau, tableau d'adressage, configurations sauvegardées.",
        commandes: [
          { os: "linux", cmd: "! NAT/PAT sur R1 :\nR1(config)# access-list 10 permit 10.0.0.0 0.0.255.255\nR1(config)# ip nat inside source list 10 interface GigabitEthernet0/0 overload\nR1(config)# interface GigabitEthernet0/0\nR1(config-if)# ip nat outside\nR1(config)# interface GigabitEthernet0/1\nR1(config-if)# ip nat inside", commentaire: "PAT pour tout le réseau interne 10.0.0.0/16" },
          { os: "linux", cmd: "! Sauvegarder les configurations :\nR1# copy running-config tftp\n! Ou vers un fichier :\nR1# show running-config | redirect tftp://192.168.1.100/R1-config.txt", commentaire: "Sauvegarder les configs pour le dossier BTS" },
          { os: "linux", cmd: "# Tests de validation complets :\n# Ping LAN VLAN 10 → VLAN 20 : OK (inter-VLAN)\n# Ping LAN → DMZ HTTP port 80 : OK\n# Ping DMZ → LAN 10.0.10.x : BLOQUÉ (ACL)\n# Ping Site1 → Site2 (10.1.50.x) : OK (OSPF)\n# show ip route sur R1 : toutes les routes présentes", commentaire: "Checklist de validation de l'infrastructure complète" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Plan d'adressage complet documenté avec tous les sous-réseaux",
      "OSPF Area 0 et Area 1 : voisins en état FULL, routes inter-sites visibles",
      "VLANs 10/20/30 sur SW-LAN : ping inter-VLAN via R1 fonctionnel",
      "DMZ isolée : ping DMZ → LAN bloqué par ACL PROTECT-DMZ",
      "HTTP port 80 vers serveur DMZ : autorisé depuis l'extérieur",
      "NAT/PAT : LAN interne accède à Internet via R1",
      "Configurations sauvegardées — schéma réseau et tableau d'adressage documentés"
    ],
    tags: ["projet", "ospf", "vlan", "dmz", "acl", "nat", "gns3", "infrastructure", "bts"],
    date_ajout: "2026-05-01",
    source: "École"
  },

  {
    id: 25,
    titre: "Veille technologique — Cybersécurité et flux RSS automatisés",
    categorie: "projets",
    niveau: "débutant",
    duree: 60,
    description: "Mettre en place un système de veille technologique sur la cybersécurité : sélection des sources fiables (CERT-FR, ANSSI, CVE), agrégation via RSS, organisation par catégories et intégration dans un workflow de lecture régulière. Ce projet est directement exploitable pour l'épreuve E5 du BTS SIO.",
    objectifs: [
      "Identifier les sources de veille cybersécurité de référence en France et international",
      "Configurer un agrégateur RSS (Miniflux ou FreshRSS) auto-hébergé",
      "Organiser les flux par catégories (vulnérabilités, actualités, outils, réglementaire)",
      "Mettre en place une routine de veille hebdomadaire",
      "Produire une synthèse de veille mensuelle pour le dossier BTS"
    ],
    prerequis: [
      { type: "vm", nom: "VM Debian 12 avec Docker installé (TP 17)" },
      { type: "reseau", nom: "Accès Internet pour les flux RSS" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Sources de veille cybersécurité de référence",
        contexte: "La veille commence par le choix des sources. En cybersécurité, certaines sources font autorité. On sélectionne un mix de sources institutionnelles françaises, européennes et internationales, couvrant les vulnérabilités, les alertes et l'actualité.",
        commandes: [
          { os: "both", cmd: "# Sources institutionnelles françaises :\n# CERT-FR (ANSSI) : https://www.cert.fr/avis/\n# ANSSI actualités : https://www.ssi.gouv.fr/actualite/\n# CNIL : https://www.cnil.fr/fr/flux-rss\n\n# Sources internationales de référence :\n# NIST NVD (CVE) : https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss-analyzed.xml\n# CISA Alerts : https://www.cisa.gov/uscert/ncas/alerts.xml\n# Krebs on Security : https://krebsonsecurity.com/feed/\n# The Hacker News : https://feeds.feedburner.com/TheHackersNews\n\n# Sources techniques :\n# Exploit-DB : https://www.exploit-db.com/rss.xml\n# Schneier on Security : https://www.schneier.com/feed/atom\n# IT-Connect : https://www.it-connect.fr/feed/", commentaire: "Sources validées pour une veille BTS SIO SISR complète" },
          { os: "both", cmd: "# Catégories recommandées :\n# 1. Vulnérabilités & CVE (CERT-FR, NVD, Exploit-DB)\n# 2. Alertes & Incidents (CERT-FR avis, CISA)\n# 3. Actualités générales (The Hacker News, Krebs)\n# 4. Réglementaire & RGPD (CNIL, ANSSI)\n# 5. Technique & Outils (IT-Connect, Schneier)", commentaire: "5 catégories pour couvrir tous les aspects de la cybersécurité" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Déployer FreshRSS avec Docker",
        contexte: "FreshRSS est un agrégateur RSS open-source auto-hébergé, léger et complet. On le déploie avec Docker Compose en quelques minutes.",
        commandes: [
          { os: "linux", cmd: "mkdir freshrss && cd freshrss", commentaire: "Répertoire de la stack FreshRSS" },
          { os: "linux", cmd: "# compose.yml :\nservices:\n  freshrss:\n    image: freshrss/freshrss:latest\n    container_name: freshrss\n    restart: unless-stopped\n    ports:\n      - \"8080:80\"\n    environment:\n      TZ: Europe/Paris\n      CRON_MIN: \"*/30\"\n    volumes:\n      - freshrss-data:/var/www/FreshRSS/data\n      - freshrss-extensions:/var/www/FreshRSS/extensions\n\nvolumes:\n  freshrss-data:\n  freshrss-extensions:", commentaire: "Stack FreshRSS avec mise à jour des flux toutes les 30 minutes" },
          { os: "linux", cmd: "docker compose up -d\ndocker compose ps", commentaire: "Lancer FreshRSS" },
          { os: "linux", cmd: "# Accéder à l'interface :\n# http://IP-VM:8080\n# Créer un compte admin lors du premier accès\n# Puis : Gérer → Abonnements → Ajouter un flux", commentaire: "Assistant de configuration initial" }
        ],
        erreurs_courantes: [
          {
            symptome: "FreshRSS ne met pas à jour les flux automatiquement",
            cause: "Le cron interne n'est pas actif",
            solution: "Vérifier CRON_MIN dans le compose.yml. Alternativement, ajouter un cron sur l'hôte : */30 * * * * docker exec freshrss php /var/www/FreshRSS/app/actualize_script.php"
          }
        ]
      },
      {
        titre: "Étape 3 — Configurer les flux RSS par catégorie",
        contexte: "On ajoute tous les flux RSS organisés par catégories dans FreshRSS. L'organisation par catégorie permet une lecture ciblée et efficace.",
        commandes: [
          { os: "both", cmd: "# Dans FreshRSS — Gérer → Abonnements → Ajouter un flux :\n\n# Catégorie VULNÉRABILITÉS :\n# https://www.cert.fr/avis/feed/\n# https://www.cert.fr/alertes/feed/\n\n# Catégorie ACTUALITÉS :\n# https://feeds.feedburner.com/TheHackersNews\n# https://krebsonsecurity.com/feed/\n\n# Catégorie TECHNIQUE :\n# https://www.it-connect.fr/feed/\n# https://www.schneier.com/feed/atom\n\n# Catégorie RÉGLEMENTAIRE :\n# https://www.cnil.fr/fr/flux-rss\n# https://www.ssi.gouv.fr/feed/", commentaire: "Ajouter un flux à la fois dans chaque catégorie" },
          { os: "both", cmd: "# Paramètres recommandés par flux :\n# Fréquence de mise à jour : 30 minutes (vulnérabilités) / 2h (actualités)\n# Conservation : 100 articles par flux\n# Archivage : 6 mois", commentaire: "Configurer la rétention dans Gérer → Archivage" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Routine de veille et synthèse mensuelle",
        contexte: "La veille n'a de valeur que si elle est régulière et exploitée. On définit une routine de lecture et un template de synthèse mensuelle directement utilisable pour le dossier BTS E5.",
        commandes: [
          { os: "both", cmd: "# Routine de veille recommandée :\n# Quotidien (5 min) : parcourir les alertes CERT-FR\n# Hebdomadaire (15 min) : lire les actualités cybersécurité\n# Mensuel (30 min) : produire une synthèse\n\n# Template de synthèse mensuelle BTS :\n# 1. Faits marquants du mois (3-5 événements majeurs)\n# 2. Vulnérabilités critiques (CVE avec CVSS > 9.0)\n# 3. Nouvelles menaces et techniques d'attaque\n# 4. Évolutions réglementaires (RGPD, NIS2...)\n# 5. Outils et bonnes pratiques découverts\n# 6. Impact potentiel sur notre infrastructure", commentaire: "Template de synthèse pour le dossier BTS E5" },
          { os: "linux", cmd: "# Script de génération automatique d'un rapport de veille :\n#!/bin/bash\nMOIS=$(date +%Y-%m)\nRAPPORT=\"/opt/veille/synthese-$MOIS.md\"\n\necho \"# Synthèse de veille cybersécurité — $MOIS\" > $RAPPORT\necho \"## Sources consultées\" >> $RAPPORT\necho \"- CERT-FR, ANSSI, The Hacker News, IT-Connect\" >> $RAPPORT\necho \"## Vulnérabilités critiques (CVSS >= 9.0)\" >> $RAPPORT\necho \"## Incidents notables\" >> $RAPPORT\necho \"## Évolutions réglementaires\" >> $RAPPORT\necho \"## Impact sur notre infrastructure\" >> $RAPPORT\n\necho \"Template créé : $RAPPORT\"", commentaire: "Script génère le template de synthèse mensuelle" },
          { os: "linux", cmd: "mkdir -p /opt/veille\nchmod +x /opt/veille/generer-synthese.sh\n# Planifier le 1er de chaque mois :\ncrontab -e\n# 0 9 1 * * /opt/veille/generer-synthese.sh", commentaire: "Générer automatiquement le template de synthèse le 1er du mois" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Liste des sources de veille documentée (min 8 sources dans 4 catégories)",
      "FreshRSS déployé et accessible sur http://IP:8080",
      "Flux RSS ajoutés et organisés par catégories dans FreshRSS",
      "Mise à jour automatique des flux toutes les 30 minutes fonctionnelle",
      "Template de synthèse mensuelle créé dans /opt/veille/",
      "Cron planifié pour générer le template le 1er de chaque mois",
      "Première synthèse rédigée avec au moins 3 faits marquants"
    ],
    tags: ["veille", "rss", "freshrss", "cybersecurite", "cert-fr", "anssi", "cve", "bts", "e5"],
    date_ajout: "2026-05-05",
    source: "École"
  },

  {
    id: 46,
    titre: "CI/CD avec GitHub Actions — test, build Docker et déploiement SSH",
    categorie: "projets",
    niveau: "avancé",
    duree: 90,
    description: "Pipeline CI/CD complet avec GitHub Actions pour une application Flask : tests pytest, build image Docker, push sur GitHub Container Registry, déploiement automatique sur un serveur via SSH.",
    objectifs: [
      "Créer un workflow GitHub Actions déclenché sur push",
      "Exécuter des tests pytest dans un runner GitHub",
      "Builder et pousser une image Docker sur GHCR",
      "Déployer automatiquement via SSH avec appleboy/ssh-action",
      "Utiliser les secrets GitHub pour les credentials",
      "Lire et débugger les logs d'un pipeline"
    ],
    prerequis: [
      { type: "logiciel", nom: "Compte GitHub avec un dépôt" },
      { type: "vm", nom: "Serveur Linux avec Docker, accessible SSH depuis Internet (ou ngrok)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Préparer l'application Flask",
        contexte: "On crée une app Flask minimale avec un test pytest et un Dockerfile.",
        commandes: [
          { os: "linux", cmd: "mkdir flask-cicd && cd flask-cicd\n# app.py :\n# from flask import Flask\n# app = Flask(__name__)\n# @app.route('/')\n# def index(): return 'Hello CI/CD!'\n# if __name__ == '__main__': app.run()", commentaire: "Application Flask minimale" },
          { os: "linux", cmd: "# test_app.py :\n# from app import app\n# def test_index():\n#   r = app.test_client().get('/')\n#   assert r.status_code == 200 and b'Hello CI/CD!' in r.data", commentaire: "Test unitaire pytest" },
          { os: "linux", cmd: "# Dockerfile :\n# FROM python:3.11-slim\n# WORKDIR /app\n# COPY requirements.txt .\n# RUN pip install -r requirements.txt\n# COPY . .\n# CMD [\"python\",\"app.py\"]", commentaire: "Dockerfile pour l'image Flask" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Créer le workflow CI/CD",
        contexte: "Le workflow .github/workflows/ci.yml contient 3 jobs : test, build (Docker/GHCR) et deploy (SSH).",
        commandes: [
          { os: "linux", cmd: "mkdir -p .github/workflows && nano .github/workflows/ci.yml", commentaire: "Créer le fichier de workflow" },
          { os: "linux", cmd: "# Job test :\n# name: CI Pipeline\n# on: [push, pull_request]\n# jobs:\n#   test:\n#     runs-on: ubuntu-latest\n#     steps:\n#       - uses: actions/checkout@v4\n#       - uses: actions/setup-python@v5\n#         with: {python-version: '3.11'}\n#       - run: pip install flask pytest && pytest test_app.py -v", commentaire: "Job test : checkout + install + pytest" },
          { os: "linux", cmd: "# Job build (needs: test) :\n#   build:\n#     steps:\n#       - uses: docker/login-action@v3\n#         with: {registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }}}\n#       - uses: docker/build-push-action@v5\n#         with: {push: true, tags: ghcr.io/${{ github.repository }}:${{ github.sha }}}", commentaire: "Job build : login GHCR + build + push" },
          { os: "linux", cmd: "# Job deploy (needs: build) :\n#   deploy:\n#     steps:\n#       - uses: appleboy/ssh-action@v1\n#         with:\n#           host: ${{ secrets.SSH_HOST }}\n#           username: ${{ secrets.SSH_USER }}\n#           key: ${{ secrets.SSH_PRIVATE_KEY }}\n#           script: |\n#             docker pull ghcr.io/${{ github.repository }}:${{ github.sha }}\n#             docker stop flask-app || true && docker rm flask-app || true\n#             docker run -d --name flask-app -p 5000:5000 ghcr.io/${{ github.repository }}:${{ github.sha }}", commentaire: "Job deploy : SSH + pull + restart conteneur" }
        ],
        erreurs_courantes: [
          { symptome: "denied: not allowed to Write organization package", cause: "GITHUB_TOKEN sans permission packages write", solution: "Settings > Actions > Workflow permissions > Read and write permissions" }
        ]
      },
      {
        titre: "Étape 3 — Secrets SSH et test du pipeline",
        contexte: "On génère une clé SSH dédiée CI/CD, on ajoute les secrets GitHub et on déclenche le pipeline.",
        commandes: [
          { os: "linux", cmd: "ssh-keygen -t ed25519 -f ~/.ssh/gh_actions -N ''\nssh-copy-id -i ~/.ssh/gh_actions.pub user@serveur", commentaire: "Générer la clé SSH CI/CD et la déployer" },
          { os: "linux", cmd: "# GitHub > Settings > Secrets > New secret :\n# SSH_HOST = IP ou DNS du serveur\n# SSH_USER = utilisateur SSH\n# SSH_PRIVATE_KEY = contenu de ~/.ssh/gh_actions", commentaire: "Ajouter les 3 secrets dans GitHub" },
          { os: "linux", cmd: "git add . && git commit -m 'ci: pipeline GitHub Actions' && git push origin main", commentaire: "Déclencher le pipeline en poussant" },
          { os: "linux", cmd: "# Onglet Actions GitHub : observer test > build > deploy\ndocker ps | grep flask-app\ncurl http://localhost:5000", commentaire: "Vérifier le pipeline et le conteneur déployé" }
        ],
        erreurs_courantes: [
          { symptome: "deploy: ssh: Connection refused", cause: "Serveur non accessible depuis les runners GitHub", solution: "Utiliser ngrok (ngrok tcp 22) et mettre à jour SSH_HOST avec l'URL ngrok" }
        ]
      }
    ],
    checklist: [
      "Workflow ci.yml dans .github/workflows/",
      "Job test : pytest vert sur GitHub Actions",
      "Image Docker poussée sur ghcr.io avec le tag SHA",
      "Secrets SSH_HOST, SSH_USER, SSH_PRIVATE_KEY configurés",
      "Job deploy : connexion SSH + conteneur redémarré",
      "docker ps : flask-app Up sur le serveur",
      "curl http://serveur:5000 retourne Hello CI/CD!"
    ],
    tags: ["cicd", "github-actions", "docker", "flask", "python", "automatisation", "projets", "devops"],
    date_ajout: "2026-06-26",
    source: "École"
  }
];
