// TP & Labs IT — Catégorie : slam
// 4 TP(s)

const LABS_SLAM = [
  {
    id: 26,
    titre: "API REST avec Python Flask — CRUD et documentation",
    categorie: "slam",
    niveau: "intermédiaire",
    duree: 90,
    description: "Créer une API REST complète avec Python Flask : endpoints CRUD (Create, Read, Update, Delete), validation des données, authentification par token JWT, gestion des erreurs et documentation automatique avec Swagger. L'API expose des ressources d'un inventaire réseau.",
    objectifs: [
      "Créer une API REST avec Flask et les verbes HTTP (GET, POST, PUT, DELETE)",
      "Connecter l'API à une base de données SQLite via SQLAlchemy",
      "Implémenter l'authentification JWT (JSON Web Token)",
      "Valider les données entrantes et gérer les erreurs proprement",
      "Documenter l'API avec Flask-RESTX et Swagger UI"
    ],
    prerequis: [
      { type: "logiciel", nom: "Python 3.10+ installé" },
      { type: "logiciel", nom: "pip et venv disponibles" },
      { type: "reseau", nom: "Notions de base en Python (fonctions, classes, dictionnaires)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Créer l'environnement et installer Flask",
        contexte: "On crée un environnement virtuel Python isolé pour le projet. C'est la bonne pratique — chaque projet a ses propres dépendances sans conflits.",
        commandes: [
          { os: "linux", cmd: "mkdir api-inventaire && cd api-inventaire\npython3 -m venv venv\nsource venv/bin/activate", commentaire: "Créer et activer l'environnement virtuel" },
          { os: "windows", cmd: "mkdir api-inventaire && cd api-inventaire\npython -m venv venv\nvenv\\Scripts\\activate", commentaire: "Windows : activer avec Scripts\\activate" },
          { os: "linux", cmd: "pip install flask flask-sqlalchemy flask-jwt-extended flask-restx", commentaire: "Installer Flask et ses extensions" },
          { os: "linux", cmd: "pip freeze > requirements.txt", commentaire: "Sauvegarder les dépendances pour reproduction" }
        ],
        erreurs_courantes: [
          {
            symptome: "ModuleNotFoundError lors du lancement de l'API",
            cause: "L'environnement virtuel n'est pas activé",
            solution: "source venv/bin/activate (Linux) ou venv\\Scripts\\activate (Windows) avant tout pip install ou python."
          }
        ]
      },
      {
        titre: "Étape 2 — Créer l'application Flask et les modèles",
        contexte: "On structure l'application avec le pattern Application Factory et on définit les modèles de données avec SQLAlchemy ORM.",
        commandes: [
          { os: "linux", cmd: "# app.py :\nfrom flask import Flask\nfrom flask_sqlalchemy import SQLAlchemy\nfrom flask_jwt_extended import JWTManager\n\ndb = SQLAlchemy()\njwt = JWTManager()\n\ndef create_app():\n    app = Flask(__name__)\n    app.config[\'SQLALCHEMY_DATABASE_URI\'] = \'sqlite:///inventaire.db\'\n    app.config[\'JWT_SECRET_KEY\'] = \'super-secret-key-change-in-prod\'\n    db.init_app(app)\n    jwt.init_app(app)\n    return app", commentaire: "Application Factory — bonne pratique Flask" },
          { os: "linux", cmd: "# models.py :\nfrom app import db\n\nclass Equipement(db.Model):\n    id = db.Column(db.Integer, primary_key=True)\n    nom = db.Column(db.String(100), nullable=False)\n    type = db.Column(db.String(50), nullable=False)\n    ip = db.Column(db.String(15), unique=True, nullable=False)\n    site = db.Column(db.String(100))\n    actif = db.Column(db.Boolean, default=True)\n\n    def to_dict(self):\n        return {\n            \'id\': self.id,\n            \'nom\': self.nom,\n            \'type\': self.type,\n            \'ip\': self.ip,\n            \'site\': self.site,\n            \'actif\': self.actif\n        }", commentaire: "Modèle Equipement avec méthode de sérialisation" },
          { os: "linux", cmd: "# Créer la DB et insérer des données de test :\npython3 -c \"\nfrom app import create_app, db\nfrom models import Equipement\napp = create_app()\nwith app.app_context():\n    db.create_all()\n    e = Equipement(nom=\'SW-CORE-01\', type=\'switch\', ip=\'10.0.0.1\', site=\'Paris\')\n    db.session.add(e)\n    db.session.commit()\n    print(\'DB créée avec données de test\')\n\"", commentaire: "Initialiser la base SQLite avec un équipement exemple" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Créer les endpoints CRUD",
        contexte: "On crée les routes REST pour chaque opération CRUD. On respecte les conventions REST : GET pour lire, POST pour créer, PUT pour modifier, DELETE pour supprimer.",
        commandes: [
          { os: "linux", cmd: "# routes.py — endpoints CRUD :\nfrom flask import Blueprint, jsonify, request\nfrom models import Equipement\nfrom app import db\n\nbp = Blueprint(\'api\', __name__, url_prefix=\'/api/v1\')\n\n# GET tous les équipements\n@bp.route(\'/equipements\', methods=[\'GET\'])\ndef get_equipements():\n    equips = Equipement.query.filter_by(actif=True).all()\n    return jsonify([\'e.to_dict() for e in equips\'])\n\n# GET un équipement par ID\n@bp.route(\'/equipements/<int:id>\', methods=[\'GET\'])\ndef get_equipement(id):\n    e = Equipement.query.get_or_404(id)\n    return jsonify(e.to_dict())\n\n# POST créer un équipement\n@bp.route(\'/equipements\', methods=[\'POST\'])\ndef create_equipement():\n    data = request.get_json()\n    if not data or not data.get(\'nom\') or not data.get(\'ip\'):\n        return jsonify({\'error\': \'nom et ip obligatoires\'}), 400\n    e = Equipement(**data)\n    db.session.add(e)\n    db.session.commit()\n    return jsonify(e.to_dict()), 201\n\n# PUT modifier un équipement\n@bp.route(\'/equipements/<int:id>\', methods=[\'PUT\'])\ndef update_equipement(id):\n    e = Equipement.query.get_or_404(id)\n    data = request.get_json()\n    for key, value in data.items():\n        setattr(e, key, value)\n    db.session.commit()\n    return jsonify(e.to_dict())\n\n# DELETE supprimer (soft delete)\n@bp.route(\'/equipements/<int:id>\', methods=[\'DELETE\'])\ndef delete_equipement(id):\n    e = Equipement.query.get_or_404(id)\n    e.actif = False\n    db.session.commit()\n    return jsonify({\'message\': \'Équipement désactivé\'}), 200", commentaire: "4 endpoints CRUD complets avec gestion d'erreurs basique" },
          { os: "linux", cmd: "# Tester avec curl :\n# GET tous :\ncurl http://localhost:5000/api/v1/equipements\n\n# POST créer :\ncurl -X POST http://localhost:5000/api/v1/equipements \\\n  -H \"Content-Type: application/json\" \\\n  -d \'{\"nom\": \"R1-CORE\", \"type\": \"routeur\", \"ip\": \"10.0.0.2\", \"site\": \"Lyon\"}\'\n\n# PUT modifier :\ncurl -X PUT http://localhost:5000/api/v1/equipements/1 \\\n  -H \"Content-Type: application/json\" \\\n  -d \'{\"site\": \"Marseille\"}\'\n\n# DELETE :\ncurl -X DELETE http://localhost:5000/api/v1/equipements/1", commentaire: "Tests curl de tous les endpoints CRUD" }
        ],
        erreurs_courantes: [
          {
            symptome: "405 Method Not Allowed sur un endpoint",
            cause: "Le verbe HTTP utilisé (POST, PUT...) n'est pas dans la liste methods=[] de la route",
            solution: "Vérifier que methods=['GET','POST'] contient bien le verbe utilisé. Par défaut Flask n'accepte que GET."
          }
        ]
      },
      {
        titre: "Étape 4 — Authentification JWT",
        contexte: "On protège les endpoints de modification avec JWT. L'utilisateur s'authentifie via /login et reçoit un token qu'il doit envoyer dans le header Authorization pour les requêtes suivantes.",
        commandes: [
          { os: "linux", cmd: "# Endpoint de login :\n@bp.route(\'/login\', methods=[\'POST\'])\ndef login():\n    from flask_jwt_extended import create_access_token\n    data = request.get_json()\n    # En prod : vérifier en base de données\n    if data.get(\'username\') == \'admin\' and data.get(\'password\') == \'admin123\':\n        token = create_access_token(identity=\'admin\')\n        return jsonify({\'access_token\': token})\n    return jsonify({\'error\': \'Identifiants invalides\'}), 401", commentaire: "Endpoint /login retourne un JWT valide 1h" },
          { os: "linux", cmd: "# Protéger un endpoint avec @jwt_required() :\nfrom flask_jwt_extended import jwt_required\n\n@bp.route(\'/equipements\', methods=[\'POST\'])\n@jwt_required()\ndef create_equipement():\n    # ... reste du code", commentaire: "Décorateur @jwt_required() — retourne 401 si pas de token valide" },
          { os: "linux", cmd: "# Test avec curl :\n# 1. Obtenir le token :\nTOKEN=$(curl -s -X POST http://localhost:5000/api/v1/login \\\n  -H \"Content-Type: application/json\" \\\n  -d \'{\"username\": \"admin\", \"password\": \"admin123\"}\'\n  | python3 -c \"import sys,json; print(json.load(sys.stdin)[\'access_token\'])\"  )\n\n# 2. Utiliser le token :\ncurl -X POST http://localhost:5000/api/v1/equipements \\\n  -H \"Authorization: Bearer $TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d \'{\"nom\": \"FW-01\", \"type\": \"firewall\", \"ip\": \"10.0.0.3\"}\'", commentaire: "Obtenir le JWT puis l'utiliser dans les requêtes protégées" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Environnement virtuel activé, Flask et extensions installés",
      "Base SQLite créée avec modèle Equipement",
      "GET /api/v1/equipements : retourne la liste JSON",
      "POST /api/v1/equipements : crée un équipement, retourne 201",
      "PUT /api/v1/equipements/1 : modifie l'équipement",
      "DELETE /api/v1/equipements/1 : soft delete, actif=False",
      "POST /api/v1/login : retourne un JWT valide",
      "Endpoint POST protégé par @jwt_required() : 401 sans token"
    ],
    tags: ["flask", "python", "api", "rest", "crud", "jwt", "sqlalchemy", "sqlite", "slam"],
    date_ajout: "2026-05-10",
    source: "École"
  },

  {
    id: 27,
    titre: "Base de données MySQL — conception, requêtes SQL et procédures",
    categorie: "slam",
    niveau: "intermédiaire",
    duree: 75,
    description: "Concevoir une base de données relationnelle pour un parc informatique : modélisation MCD/MLD, création des tables avec contraintes, requêtes SQL avancées (jointures, agrégations, sous-requêtes) et procédures stockées. Directement applicable pour les TP BTS SIO SLAM.",
    objectifs: [
      "Concevoir un MCD et le traduire en MLD puis en schéma SQL",
      "Créer des tables avec clés primaires, étrangères et contraintes",
      "Écrire des requêtes SELECT avec jointures, GROUP BY et sous-requêtes",
      "Créer des vues, procédures stockées et triggers",
      "Sauvegarder et restaurer une base MySQL avec mysqldump"
    ],
    prerequis: [
      { type: "logiciel", nom: "MySQL 8.x ou MariaDB 10.x installé" },
      { type: "logiciel", nom: "MySQL Workbench ou DBeaver (optionnel)" },
      { type: "reseau", nom: "Notions de base SQL (SELECT, INSERT, UPDATE, DELETE)" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Installer MySQL et créer la base",
        contexte: "On installe MySQL Server sur Debian/Ubuntu, on sécurise l'installation et on crée la base de données du parc informatique.",
        commandes: [
          { os: "linux", cmd: "sudo apt update && sudo apt install -y mysql-server\nsudo systemctl enable mysql --now\nsudo mysql_secure_installation", commentaire: "Installer MySQL et sécuriser l'installation (root pwd, suppression anonymes)" },
          { os: "linux", cmd: "sudo mysql -uroot -p\n-- Dans MySQL :\nCREATE DATABASE parc_info CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nCREATE USER \'parc_user\'@\'localhost\' IDENTIFIED BY \'ParcPass123\';\nGRANT ALL PRIVILEGES ON parc_info.* TO \'parc_user\'@\'localhost\';\nFLUSH PRIVILEGES;\nUSE parc_info;", commentaire: "Créer la base et l'utilisateur dédié" }
        ],
        erreurs_courantes: [
          {
            symptome: "ERROR 1698 Access denied for user root",
            cause: "MySQL 8 utilise auth_socket par défaut pour root sur Debian",
            solution: "sudo mysql (sans -p) puis ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MonMotDePasse';"
          }
        ]
      },
      {
        titre: "Étape 2 — Créer les tables avec contraintes",
        contexte: "On traduit le MLD en SQL. Le schéma gère les sites, les salles, les équipements et les utilisateurs du parc informatique avec toutes les contraintes d'intégrité.",
        commandes: [
          { os: "linux", cmd: "-- Tables du parc informatique :\nCREATE TABLE sites (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    nom VARCHAR(100) NOT NULL,\n    ville VARCHAR(100) NOT NULL,\n    adresse TEXT\n);\n\nCREATE TABLE salles (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    nom VARCHAR(50) NOT NULL,\n    capacite INT DEFAULT 0,\n    id_site INT NOT NULL,\n    FOREIGN KEY (id_site) REFERENCES sites(id) ON DELETE CASCADE\n);\n\nCREATE TABLE types_equipement (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    libelle VARCHAR(50) NOT NULL UNIQUE\n);\n\nCREATE TABLE equipements (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    nom VARCHAR(100) NOT NULL,\n    adresse_ip VARCHAR(15) UNIQUE,\n    adresse_mac VARCHAR(17),\n    marque VARCHAR(50),\n    modele VARCHAR(100),\n    date_achat DATE,\n    garantie_fin DATE,\n    actif BOOLEAN DEFAULT TRUE,\n    id_type INT NOT NULL,\n    id_salle INT,\n    FOREIGN KEY (id_type) REFERENCES types_equipement(id),\n    FOREIGN KEY (id_salle) REFERENCES salles(id)\n);\n\nCREATE TABLE utilisateurs (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    nom VARCHAR(50) NOT NULL,\n    prenom VARCHAR(50) NOT NULL,\n    email VARCHAR(100) UNIQUE NOT NULL,\n    id_salle INT,\n    FOREIGN KEY (id_salle) REFERENCES salles(id)\n);\n\nCREATE TABLE affectations (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    id_equipement INT NOT NULL,\n    id_utilisateur INT NOT NULL,\n    date_debut DATE NOT NULL,\n    date_fin DATE,\n    FOREIGN KEY (id_equipement) REFERENCES equipements(id),\n    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id)\n);", commentaire: "Schéma complet parc informatique avec FK et contraintes" },
          { os: "linux", cmd: "-- Insérer des données de test :\nINSERT INTO sites (nom, ville) VALUES ('Siège', 'Paris'), ('Agence Lyon', 'Lyon');\nINSERT INTO types_equipement (libelle) VALUES ('PC'), ('Switch'), ('Routeur'), ('Imprimante'), ('Serveur');\nINSERT INTO salles (nom, capacite, id_site) VALUES ('Salle A', 20, 1), ('Salle B', 15, 1), ('DataCenter', 0, 1);\nINSERT INTO equipements (nom, adresse_ip, marque, modele, date_achat, id_type, id_salle)\nVALUES\n    ('PC-ADMIN-01', '192.168.1.10', 'Dell', 'OptiPlex 7090', '2024-01-15', 1, 1),\n    ('SW-CORE', '10.0.0.1', 'Cisco', 'Catalyst 2960', '2023-06-01', 2, 3),\n    ('R1-EDGE', '10.0.0.254', 'Cisco', 'ISR 4331', '2023-06-01', 3, 3);", commentaire: "Données de test pour tester les requêtes" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 3 — Requêtes SQL avancées",
        contexte: "On écrit les requêtes utiles pour la gestion du parc : inventaire par site, équipements en fin de garantie, statistiques par type. On utilise les jointures, agrégations et sous-requêtes.",
        commandes: [
          { os: "linux", cmd: "-- Inventaire complet avec jointures :\nSELECT e.nom, e.adresse_ip, te.libelle AS type,\n       s.nom AS salle, si.ville AS site\nFROM equipements e\nJOIN types_equipement te ON e.id_type = te.id\nLEFT JOIN salles s ON e.id_salle = s.id\nLEFT JOIN sites si ON s.id_site = si.id\nWHERE e.actif = TRUE\nORDER BY si.ville, te.libelle;", commentaire: "Inventaire complet avec toutes les infos via jointures" },
          { os: "linux", cmd: "-- Équipements dont la garantie expire dans 30 jours :\nSELECT nom, marque, modele, garantie_fin,\n       DATEDIFF(garantie_fin, CURDATE()) AS jours_restants\nFROM equipements\nWHERE garantie_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)\nORDER BY garantie_fin;", commentaire: "Alertes garantie — utile pour la gestion du parc" },
          { os: "linux", cmd: "-- Statistiques par type d'équipement :\nSELECT te.libelle, COUNT(*) AS total,\n       SUM(CASE WHEN e.actif THEN 1 ELSE 0 END) AS actifs\nFROM equipements e\nJOIN types_equipement te ON e.id_type = te.id\nGROUP BY te.libelle\nORDER BY total DESC;", commentaire: "Comptage et statistiques par type avec GROUP BY" },
          { os: "linux", cmd: "-- Sous-requête : équipements sans utilisateur affecté :\nSELECT nom, adresse_ip FROM equipements\nWHERE id NOT IN (\n    SELECT DISTINCT id_equipement FROM affectations\n    WHERE date_fin IS NULL\n)\nAND actif = TRUE;", commentaire: "Sous-requête NOT IN — équipements non affectés" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Vues, procédures et mysqldump",
        contexte: "On crée des vues pour simplifier les requêtes complexes, une procédure stockée pour affecter un équipement et on sauvegarde la base avec mysqldump.",
        commandes: [
          { os: "linux", cmd: "-- Vue inventaire simplifié :\nCREATE VIEW v_inventaire AS\nSELECT e.id, e.nom, e.adresse_ip, te.libelle AS type,\n       s.nom AS salle, si.ville AS site, e.actif\nFROM equipements e\nJOIN types_equipement te ON e.id_type = te.id\nLEFT JOIN salles s ON e.id_salle = s.id\nLEFT JOIN sites si ON s.id_site = si.id;\n\n-- Utilisation de la vue :\nSELECT * FROM v_inventaire WHERE site = 'Paris';", commentaire: "Vue = requête mémorisée — simplifie les SELECT complexes" },
          { os: "linux", cmd: "-- Procédure : affecter un équipement à un utilisateur :\nDELIMITER //\nCREATE PROCEDURE affecter_equipement(\n    IN p_id_equip INT,\n    IN p_id_user INT\n)\nBEGIN\n    -- Clôturer l'affectation précédente\n    UPDATE affectations\n    SET date_fin = CURDATE()\n    WHERE id_equipement = p_id_equip AND date_fin IS NULL;\n    -- Créer la nouvelle affectation\n    INSERT INTO affectations (id_equipement, id_utilisateur, date_debut)\n    VALUES (p_id_equip, p_id_user, CURDATE());\n    SELECT CONCAT('Équipement ', p_id_equip, ' affecté à utilisateur ', p_id_user) AS resultat;\nEND //\nDELIMITER ;\n\n-- Appel :\nCALL affecter_equipement(1, 1);", commentaire: "Procédure stockée avec gestion de l'historique des affectations" },
          { os: "linux", cmd: "# Sauvegarder la base avec mysqldump :\nmysqldump -u parc_user -p parc_info > backup-parc-$(date +%Y%m%d).sql", commentaire: "Export SQL complet de la base" },
          { os: "linux", cmd: "# Restaurer depuis un dump :\nmysql -u parc_user -p parc_info < backup-parc-20260510.sql", commentaire: "Import du dump SQL pour restauration" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Base parc_info créée avec utilisateur dédié parc_user",
      "6 tables créées avec clés primaires, étrangères et contraintes",
      "Données de test insérées (sites, salles, équipements, types)",
      "Requête inventaire complet avec jointures : résultats corrects",
      "Requête garanties expirantes : filtre BETWEEN fonctionnel",
      "Vue v_inventaire créée et interrogeable",
      "Procédure affecter_equipement testée et fonctionnelle",
      "mysqldump : fichier .sql créé et restauration testée"
    ],
    tags: ["mysql", "sql", "base-de-donnees", "jointure", "procedure", "vue", "mysqldump", "slam"],
    date_ajout: "2026-05-15",
    source: "École"
  },

  {
    id: 28,
    titre: "Application web Flask + MySQL — interface de gestion du parc",
    categorie: "slam",
    niveau: "avancé",
    duree: 120,
    description: "Développer une application web complète avec Flask et MySQL pour gérer le parc informatique : interface CRUD avec formulaires HTML, authentification utilisateur avec sessions, tableaux de bord avec statistiques et export CSV. Ce projet de synthèse SLAM est directement valorisable dans le dossier BTS.",
    objectifs: [
      "Créer une application web Flask avec templates Jinja2",
      "Implémenter l'authentification par sessions avec Flask-Login",
      "Créer des formulaires HTML avec validation côté serveur",
      "Afficher des données depuis MySQL dans des tableaux paginés",
      "Exporter les données en CSV et implémenter une recherche"
    ],
    prerequis: [
      { type: "logiciel", nom: "Python 3.10+ avec venv" },
      { type: "logiciel", nom: "MySQL avec base parc_info (TP 27 recommandé)" },
      { type: "reseau", nom: "TP 26 Flask API recommandé" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Structure de l'application et dépendances",
        contexte: "On organise l'application avec une structure modulaire. Flask-Login gère les sessions utilisateur, Flask-WTF les formulaires avec protection CSRF, et PyMySQL la connexion MySQL.",
        commandes: [
          { os: "linux", cmd: "mkdir parc-web && cd parc-web\npython3 -m venv venv && source venv/bin/activate\npip install flask flask-sqlalchemy flask-login flask-wtf pymysql", commentaire: "Environnement et dépendances" },
          { os: "linux", cmd: "# Structure du projet :\n# parc-web/\n# ├── app.py           (Application Factory)\n# ├── config.py        (Configuration)\n# ├── models.py        (Modèles SQLAlchemy)\n# ├── routes/\n# │   ├── auth.py      (Login/Logout)\n# │   └── equipements.py (CRUD)\n# ├── templates/\n# │   ├── base.html    (Layout commun)\n# │   ├── login.html\n# │   ├── dashboard.html\n# │   └── equipements/\n# │       ├── liste.html\n# │       └── form.html\n# └── static/\n#     └── style.css", commentaire: "Arborescence modulaire Flask — bonne pratique BTS" },
          { os: "linux", cmd: "# config.py :\nclass Config:\n    SECRET_KEY = \'change-this-in-production\'\n    SQLALCHEMY_DATABASE_URI = \'mysql+pymysql://parc_user:ParcPass123@localhost/parc_info\'\n    SQLALCHEMY_TRACK_MODIFICATIONS = False\n    WTF_CSRF_ENABLED = True", commentaire: "Configuration centralisée avec URI MySQL" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Authentification avec Flask-Login",
        contexte: "On implémente un système de login avec sessions persistantes. Flask-Login gère le current_user et les routes protégées avec @login_required.",
        commandes: [
          { os: "linux", cmd: "# models.py — Modèle User pour Flask-Login :\nfrom flask_login import UserMixin\nfrom werkzeug.security import generate_password_hash, check_password_hash\nfrom app import db\n\nclass User(UserMixin, db.Model):\n    id = db.Column(db.Integer, primary_key=True)\n    username = db.Column(db.String(80), unique=True, nullable=False)\n    password_hash = db.Column(db.String(255))\n\n    def set_password(self, password):\n        self.password_hash = generate_password_hash(password)\n\n    def check_password(self, password):\n        return check_password_hash(self.password_hash, password)", commentaire: "Modèle User avec hash bcrypt via werkzeug" },
          { os: "linux", cmd: "# routes/auth.py :\nfrom flask import Blueprint, render_template, redirect, url_for, flash, request\nfrom flask_login import login_user, logout_user, login_required\nfrom models import User\n\nbp = Blueprint(\'auth\', __name__)\n\n@bp.route(\'/login\', methods=[\'GET\', \'POST\'])\ndef login():\n    if request.method == \'POST\':\n        user = User.query.filter_by(username=request.form[\'username\']).first()\n        if user and user.check_password(request.form[\'password\']):\n            login_user(user, remember=True)\n            return redirect(url_for(\'main.dashboard\'))\n        flash(\'Identifiants incorrects\', \'error\')\n    return render_template(\'login.html\')\n\n@bp.route(\'/logout\')\n@login_required\ndef logout():\n    logout_user()\n    return redirect(url_for(\'auth.login\'))", commentaire: "Routes login/logout avec vérification du hash" }
        ],
        erreurs_courantes: [
          {
            symptome: "Redirect loop sur /login",
            cause: "Flask-Login redirige vers /login mais login_view n'est pas configuré",
            solution: "Dans app.py : login_manager.login_view = 'auth.login' et login_manager.login_message = 'Connexion requise'"
          }
        ]
      },
      {
        titre: "Étape 3 — Templates Jinja2 et interface CRUD",
        contexte: "On crée les templates HTML avec Jinja2 pour lister, créer et modifier les équipements. Le template de base (base.html) définit le layout commun avec navigation.",
        commandes: [
          { os: "linux", cmd: "<!-- templates/base.html :\n<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>{% block title %}Parc IT{% endblock %}</title>\n    <link rel=\"stylesheet\" href=\"{{ url_for(\'static\', filename=\'style.css\') }}\">\n</head>\n<body>\n    <nav>\n        <a href=\"{{ url_for(\'main.dashboard\') }}\">Dashboard</a>\n        <a href=\"{{ url_for(\'equip.liste\') }}\">Équipements</a>\n        <a href=\"{{ url_for(\'auth.logout\') }}\">Déconnexion</a>\n    </nav>\n    {% with messages = get_flashed_messages(with_categories=true) %}\n        {% for category, message in messages %}\n            <div class=\"alert alert-{{ category }}\">{{ message }}</div>\n        {% endfor %}\n    {% endwith %}\n    <main>{% block content %}{% endblock %}</main>\n</body>\n</html> -->", commentaire: "Layout de base avec navigation et messages flash" },
          { os: "linux", cmd: "<!-- templates/equipements/liste.html :\n{% extends \'base.html\' %}\n{% block content %}\n<h1>Inventaire équipements ({{ equipements|length }})</h1>\n<a href=\"{{ url_for(\'equip.nouveau\') }}\">+ Ajouter</a>\n<input type=\"text\" id=\"search\" placeholder=\"Rechercher...\">\n<table>\n    <tr><th>Nom</th><th>IP</th><th>Type</th><th>Salle</th><th>Actions</th></tr>\n    {% for e in equipements %}\n    <tr>\n        <td>{{ e.nom }}</td>\n        <td>{{ e.adresse_ip }}</td>\n        <td>{{ e.type.libelle }}</td>\n        <td>{{ e.salle.nom if e.salle else \'-\' }}</td>\n        <td>\n            <a href=\"{{ url_for(\'equip.modifier\', id=e.id) }}\">Modifier</a>\n            <a href=\"{{ url_for(\'equip.supprimer\', id=e.id) }}\">Supprimer</a>\n        </td>\n    </tr>\n    {% endfor %}\n</table>\n{% endblock %} -->", commentaire: "Template liste avec tableau et liens CRUD" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 4 — Export CSV et recherche",
        contexte: "On ajoute des fonctionnalités avancées : export CSV de l'inventaire et recherche full-text côté serveur.",
        commandes: [
          { os: "linux", cmd: "# Export CSV dans routes/equipements.py :\nimport csv\nimport io\nfrom flask import make_response\n\n@bp.route(\'/equipements/export-csv\')\n@login_required\ndef export_csv():\n    equipements = Equipement.query.filter_by(actif=True).all()\n    output = io.StringIO()\n    writer = csv.writer(output)\n    writer.writerow([\'ID\', \'Nom\', \'IP\', \'Type\', \'Salle\', \'Site\'])\n    for e in equipements:\n        writer.writerow([\n            e.id, e.nom, e.adresse_ip,\n            e.type.libelle,\n            e.salle.nom if e.salle else \'-\',\n            e.salle.site.nom if e.salle else \'-\'\n        ])\n    response = make_response(output.getvalue())\n    response.headers[\'Content-Type\'] = \'text/csv\'\n    response.headers[\'Content-Disposition\'] = \'attachment; filename=inventaire.csv\'\n    return response", commentaire: "Export CSV téléchargeable depuis le navigateur" },
          { os: "linux", cmd: "# Recherche full-text :\n@bp.route(\'/equipements\')\n@login_required\ndef liste():\n    q = request.args.get(\'q\', \'\')\n    query = Equipement.query.filter_by(actif=True)\n    if q:\n        query = query.filter(\n            db.or_(\n                Equipement.nom.ilike(f\'%{q}%\'),\n                Equipement.adresse_ip.ilike(f\'%{q}%\')\n            )\n        )\n    equipements = query.order_by(Equipement.nom).all()\n    return render_template(\'equipements/liste.html\',\n                           equipements=equipements, q=q)", commentaire: "Recherche sur nom et IP avec ilike (insensible casse)" },
          { os: "linux", cmd: "# Lancer l'application :\nflask --app app run --debug --host=0.0.0.0 --port=5000\n# Accéder sur : http://IP:5000", commentaire: "Démarrer en mode debug pour le développement" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "Application Flask démarre sans erreur sur le port 5000",
      "Login /login : authentification fonctionnelle avec hash password",
      "Route protégée redirige vers /login si non authentifié",
      "Liste /equipements : tableau des équipements affiché depuis MySQL",
      "Formulaire création : nouvel équipement ajouté en base",
      "Export /equipements/export-csv : fichier CSV téléchargeable",
      "Recherche ?q=cisco : filtre les équipements par nom ou IP"
    ],
    tags: ["flask", "python", "mysql", "web", "crud", "login", "jinja2", "csv", "slam"],
    date_ajout: "2026-05-20",
    source: "École"
  },

  {
    id: 43,
    titre: "Git & GitHub — workflow collaboratif, branches et pull requests",
    categorie: "slam",
    niveau: "débutant",
    duree: 60,
    description: "Maîtriser Git et GitHub : commits, branches, merge, résolution de conflits et pull requests. Fondamental pour tout projet de développement ou d'infrastructure as code.",
    objectifs: [
      "Configurer l'identité Git et initialiser un dépôt",
      "Faire des commits et naviguer dans l'historique",
      "Créer et fusionner des branches",
      "Pousser sur GitHub et créer une pull request",
      "Résoudre un conflit de merge",
      "Utiliser .gitignore"
    ],
    prerequis: [
      { type: "logiciel", nom: "Git installé (apt install git ou git-scm.com)" },
      { type: "logiciel", nom: "Compte GitHub gratuit" }
    ],
    schema_reseau: null,
    etapes: [
      {
        titre: "Étape 1 — Configuration et premiers commits",
        contexte: "On configure l'identité Git, initialise un dépôt et fait les premiers commits.",
        commandes: [
          { os: "both", cmd: "git config --global user.name \"Ton Nom\"\ngit config --global user.email \"ton@email.com\"\ngit config --list", commentaire: "Configurer l'identité Git globale" },
          { os: "both", cmd: "mkdir mon-projet && cd mon-projet && git init", commentaire: "Initialiser le dépôt" },
          { os: "both", cmd: "echo '# Mon Projet' > README.md\ngit add README.md && git commit -m 'feat: README initial'\ngit log --oneline", commentaire: "Premier commit et vérification de l'historique" }
        ],
        erreurs_courantes: []
      },
      {
        titre: "Étape 2 — Branches, merge et GitHub",
        contexte: "On crée une branche feature, on commit, on fusionne dans main, puis on pousse sur GitHub.",
        commandes: [
          { os: "both", cmd: "git checkout -b feature/config\necho 'config: value' > config.txt\ngit add config.txt && git commit -m 'feat: ajout config'\ngit checkout main && git merge feature/config\ngit branch -d feature/config", commentaire: "Créer branche, committer et fusionner" },
          { os: "both", cmd: "git remote add origin https://github.com/ton-user/mon-projet.git\ngit push -u origin main", commentaire: "Pousser sur GitHub" },
          { os: "both", cmd: "git checkout -b feature/nouvelle\ngit push origin feature/nouvelle\n# Sur GitHub : Compare & pull request > Merge", commentaire: "Pousser une branche et créer une Pull Request" }
        ],
        erreurs_courantes: [
          { symptome: "remote: Permission denied (publickey)", cause: "Authentification SSH non configurée", solution: "Utiliser HTTPS avec token ou configurer une clé SSH dans GitHub > Settings > SSH keys" }
        ]
      },
      {
        titre: "Étape 3 — Résoudre un conflit et .gitignore",
        contexte: "On simule un conflit de merge, on le résout manuellement, puis on crée un .gitignore.",
        commandes: [
          { os: "both", cmd: "git checkout -b branche-a\necho 'Version A' > conflit.txt && git add conflit.txt && git commit -m 'A'\ngit checkout main\necho 'Version B' > conflit.txt && git add conflit.txt && git commit -m 'B'\ngit merge branche-a", commentaire: "Créer un conflit de merge" },
          { os: "both", cmd: "# Éditer conflit.txt : supprimer les marqueurs <<<<<<, ====== et >>>>>>\ngit add conflit.txt && git commit -m 'fix: résolution conflit'", commentaire: "Résoudre et committer" },
          { os: "both", cmd: "printf '.env\\n*.log\\nnode_modules/' > .gitignore\ngit add .gitignore && git commit -m 'chore: .gitignore'", commentaire: "Créer le .gitignore" }
        ],
        erreurs_courantes: []
      }
    ],
    checklist: [
      "git config --list : user.name et user.email configurés",
      "git log --oneline : au moins 3 commits",
      "Branche feature mergée dans main",
      "Dépôt GitHub créé et main poussé",
      "Pull Request créée et mergée",
      "Conflit résolu et committé",
      ".gitignore présent avec les patterns essentiels"
    ],
    tags: ["git", "github", "versionning", "branches", "pull-request", "merge", "slam"],
    date_ajout: "2026-06-26",
    source: "École"
  }
];
