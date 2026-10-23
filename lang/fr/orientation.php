<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Academic fields catalog
    |--------------------------------------------------------------------------
    */

    'fields' => [
        'informatique-data' => [
            'name' => 'Informatique & Data',
            'explanation' => "Ton profil montre une vraie aisance avec la logique, les maths et la résolution de problèmes. Les métiers du numérique (développement, data, IA) sont en forte croissance au Maroc, avec des écoles d'excellence comme l'ENSIAS, les ENSA, 1337 ou ALX, et des salaires parmi les plus attractifs du marché.",
            'strengths' => [
                'Rigueur logique et goût pour la résolution de problèmes',
                "Curiosité technologique et autonomie d'apprentissage",
                'Bonnes bases scientifiques (maths, physique)',
            ],
            'potentialChallenges' => [
                'Volume important de travail pratique en première année',
                'Anglais technique à consolider rapidement',
                'Concurrence élevée dans les écoles les plus demandées',
            ],
            'nextAction' => "Explore le programme de l'ENSIAS ou d'une ENSA proche de chez toi, et commence un cours d'initiation Python cette semaine.",
        ],
        'ingenierie' => [
            'name' => 'Ingénierie & Sciences appliquées',
            'explanation' => "Ton goût pour l'expérimentation et les sciences appliquées correspond bien au parcours d'ingénieur (CPGE, ENSA, FST). Ce domaine ouvre des carrières variées : génie civil, mécanique, électrique, énergies renouvelables — un secteur porteur avec les grands projets d'infrastructure au Maroc.",
            'strengths' => [
                'Solides bases en sciences physiques et mathématiques',
                "Esprit pratique et goût de l'expérimentation",
                'Persévérance face aux problèmes complexes',
            ],
            'potentialChallenges' => [
                'Cursus exigeant (classes préparatoires ou concours CNC)',
                'Charge de travail élevée sur les deux premières années',
                'Nécessité de bien choisir ta spécialité en fin de parcours',
            ],
            'nextAction' => 'Compare les programmes CPGE / ENSA / FST et assiste à une journée portes ouvertes pour parler à des étudiants.',
        ],
        'medecine-sante' => [
            'name' => 'Médecine & Santé',
            'explanation' => "Ton intérêt pour les sciences du vivant et ton envie d'aider les autres pointent vers les études de santé (FMP, instituts infirmiers, pharmacie, dentaire). C'est un parcours long mais très structurant, avec une vraie demande de professionnels au Maroc.",
            'strengths' => [
                'Bonne mémorisation et rigueur scientifique',
                "Empathie et envie d'impact direct sur les personnes",
                'Capacité de travail régulier sur la durée',
            ],
            'potentialChallenges' => [
                "Concours d'entrée très sélectif (médecine)",
                'Durée des études (6 à 10 ans selon la spécialité)',
                "Gestion du stress pendant les périodes d'examens",
            ],
            'nextAction' => "Renseigne-toi sur les conditions d'accès à la faculté de médecine de ta ville et sur les filières paramédicales alternatives.",
        ],
        'commerce-gestion' => [
            'name' => 'Commerce & Gestion (ENCG)',
            'explanation' => "Ton énergie relationnelle, ton intérêt pour l'économie et ton esprit d'initiative correspondent bien aux ENCG, aux écoles de commerce privées et aux filières gestion des universités. Le Maroc a besoin de managers formés au marketing, à la finance et à l'entrepreneuriat.",
            'strengths' => [
                'Facilité de communication et travail en équipe',
                "Intérêt pour l'économie et l'actualité des affaires",
                "Esprit d'initiative et d'organisation",
            ],
            'potentialChallenges' => [
                'Concours TAFEM à bien préparer pour les ENCG',
                'Frais élevés dans certaines écoles privées',
                'Stages à multiplier pour se différencier',
            ],
            'nextAction' => "Prépare le concours TAFEM et découvre les spécialités ENCG (marketing, finance, achats) via des témoignages d'étudiants.",
        ],
        'droit-sciences-po' => [
            'name' => 'Droit & Sciences politiques',
            'explanation' => "Ton aisance à l'écrit, ton goût du débat et ton intérêt pour la société correspondent aux filières droit (université) et sciences politiques (Rabat, Tanger, Ifrane). Débouchés : avocat, notaire, juridique d'entreprise, administration publique, organisations internationales.",
            'strengths' => [
                'Qualités rédactionnelles et argumentation',
                "Culture générale et curiosité pour l'actualité",
                "Capacité d'analyse de situations complexes",
            ],
            'potentialChallenges' => [
                'Amphi chargés en première année de droit',
                'Mémorisation intensive (codes, jurisprudence)',
                'Concours administratifs compétitifs en sortie',
            ],
            'nextAction' => 'Assiste à un cours ouvert en fac de droit et lis un arrêt commenté pour tester ton intérêt réel pour la matière.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Soft skills catalog
    |--------------------------------------------------------------------------
    */

    'soft_skills' => [
        'communication-orale' => [
            'name' => 'Communication orale',
            'reason' => 'Presque toutes les filières qui te correspondent incluent des soutenances et des présentations. Renforcer ta communication orale multiplie ton impact dès la première année.',
            'action' => 'Présente en 3 minutes un sujet qui te passionne devant un proche, une fois par semaine.',
        ],
        'gestion-du-temps' => [
            'name' => 'Gestion du temps',
            'reason' => "Les cursus sélectifs (CPGE, médecine, écoles d'ingénieurs) demandent un rythme soutenu. Une méthode de travail solide fait la différence dès le bac.",
            'action' => 'Planifie chaque dimanche ta semaine avec 3 priorités par jour, et compare le vendredi.',
        ],
        'gestion-du-stress' => [
            'name' => 'Gestion du stress',
            'reason' => 'Concours et examens créent des pics de pression. Apprendre à réguler ton stress protège tes performances et ta motivation.',
            'action' => 'Essaie la respiration 4-7-8 avant chaque devoir pendant deux semaines.',
        ],
        'pensee-critique' => [
            'name' => 'Pensée critique',
            'reason' => "Savoir évaluer une information, une source ou un argument t'aidera dans les études comme dans tes choix d'orientation.",
            'action' => "Analyse un article d'actualité par semaine : quelle est la source ? Que manque-t-il ?",
        ],
        'travail-equipe' => [
            'name' => "Travail d'équipe",
            'reason' => 'Projets de classe, hackathons, travaux de groupe : la collaboration est au cœur des études supérieures modernes.',
            'action' => "Prends le rôle d'organisateur dans ton prochain travail de groupe.",
        ],
        'adaptabilite' => [
            'name' => 'Adaptabilité',
            'reason' => "Ton parcours va te réserver des changements (ville, méthode d'apprentissage, nouveaux rythmes). L'adaptabilité réduit le coût de chaque transition.",
            'action' => "Change une habitude d'étude pendant une semaine et note ce que tu apprends.",
        ],
        'leadership' => [
            'name' => 'Leadership',
            'reason' => "Tu as des aptitudes naturelles à organiser. Les développer t'ouvrira des responsabilités dans les clubs étudiants et plus tard en entreprise.",
            'action' => "Propose d'animer une révision collective ou un événement dans ton lycée ce mois-ci.",
        ],
        'creativite' => [
            'name' => 'Créativité',
            'reason' => 'Ta capacité à proposer des idées neuves est un atout différenciant, notamment en informatique et en entrepreneuriat.',
            'action' => "Tiens un carnet d'idées : note 3 idées par jour, même farfelues.",
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Learning resources catalog
    |--------------------------------------------------------------------------
    */

    'resources' => [
        'res-python-oc' => [
            'title' => 'Fondamentaux de Python',
            'description' => "Cours d'initiation idéal avant une école d'informatique : variables, boucles, fonctions et premier mini-projet.",
            'duration' => '20 h · OpenClassrooms',
        ],
        'res-web-coursera' => [
            'title' => 'Introduction au développement web',
            'description' => 'HTML, CSS et JavaScript : construis ta première page personnelle et comprends le métier de développeur front-end.',
            'duration' => '30 h · Coursera',
        ],
        'res-maths-fun' => [
            'title' => 'Mathématiques : logique et raisonnement',
            'description' => "Remets à niveau logique, ensembles et algèbre — la base demandée en CPGE, ENSA et écoles d'informatique.",
            'duration' => '25 h · FUN MOOC',
        ],
        'res-data-alx' => [
            'title' => 'Initiation à la data science',
            'description' => 'Découvre ce que font les data analysts : Excel, premiers graphiques, statistiques descriptives et cas pratiques.',
            'duration' => '40 h · ALX / Coursera',
        ],
        'res-podcast-orientation' => [
            'title' => 'Génération Orientation',
            'description' => "Podcast marocain : des étudiants racontent leur parcours (ENCG, médecine, écoles d'ingénieurs) et leurs conseils.",
            'duration' => '25 min / épisode',
        ],
        'res-podcast-tech' => [
            'title' => 'Les coulisses des métiers tech',
            'description' => "Développeurs, data analysts et product managers racontent une journée type de leur métier au Maroc et à l'étranger.",
            'duration' => '35 min / épisode',
        ],
        'res-podcast-methodes' => [
            'title' => "Méthodes d'apprentissage efficaces",
            'description' => 'Techniques concrètes de mémorisation, de prise de notes et de révision, applicables dès cette semaine.',
            'duration' => '20 min / épisode',
        ],
        'res-ebook-filieres' => [
            'title' => 'Guide des filières scientifiques au Maroc',
            'description' => 'Panorama clair : CPGE, ENSA, FST, ENSIAS, médecine — admission, contenu, débouchés et témoignages.',
            'duration' => '60 pages · PDF',
        ],
        'res-ebook-apprendre' => [
            'title' => 'Apprendre à apprendre',
            'description' => 'E-book pratique sur la concentration, le plan de révision et la mémoire : parfait avant la rentrée supérieure.',
            'duration' => '45 pages · PDF',
        ],
        'res-ebook-confiance' => [
            'title' => 'Prendre confiance en sa prise de parole',
            'description' => 'Exercices progressifs pour parler en public sans stress : utile pour les soutenances et les oraux de concours.',
            'duration' => '30 pages · PDF',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Roadmap steps catalog
    |--------------------------------------------------------------------------
    */

    'roadmap' => [
        'rm-explore-1' => [
            'title' => 'Rencontre un étudiant du domaine',
            'description' => "Identifie un étudiant en informatique ou en école d'ingénieurs (famille, lycée, LinkedIn) et pose-lui 5 questions.",
        ],
        'rm-explore-2' => [
            'title' => 'Assiste à une journée portes ouvertes',
            'description' => 'Note les dates des JPO des écoles visées (ENSIAS, ENSA, FST, ENCG) et prépare 3 questions à poser.',
        ],
        'rm-learn-1' => [
            'title' => "Termine un cours d'initiation",
            'description' => 'Choisis le cours Python ou développement web dans tes ressources et termine le premier module.',
        ],
        'rm-learn-2' => [
            'title' => 'Renforce tes maths fondamentales',
            'description' => 'Consolide logique, algèbre et trigonométrie : elles servent dans toutes les filières scientifiques visées.',
        ],
        'rm-practice-1' => [
            'title' => 'Réalise un mini-projet',
            'description' => 'Crée un petit projet concret : page web personnelle, script utile ou exposé présenté à ta classe.',
        ],
        'rm-practice-2' => [
            'title' => 'Rejoins un club ou un hackathon',
            'description' => "Club robotics, sciences, débat ou hackathon local : l'expérience collective compte autant que les notes.",
        ],
        'rm-prepare-1' => [
            'title' => 'Prépare ton dossier de candidature',
            'description' => 'Rassembler relevés de notes, CV simple et lettre de motivation type pour tes candidatures.',
        ],
        'rm-prepare-2' => [
            'title' => "Étudie les concours d'entrée",
            'description' => 'CNC, TAFEM, concours ENSIAS/ENSA : calendrier, épreuves et annales à télécharger.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Assessment questions (basic + advanced), keyed by question id
    |--------------------------------------------------------------------------
    */

    'questions' => [
        'bacStream' => [
            'question' => 'Quelle est ta filière au baccalauréat ?',
            'helper' => 'Cela nous aide à connaître tes bases académiques.',
            'options' => [
                'sciences-math' => 'Sciences Mathématiques',
                'sciences-experimentales' => 'Sciences Expérimentales',
                'sciences-economiques' => 'Sciences Économiques',
                'lettres-sciences-humaines' => 'Lettres & Sciences humaines',
                'sciences-techniques' => 'Sciences & Technologies',
                'autre' => 'Autre situation',
            ],
        ],
        'academicStrengths' => [
            'question' => 'Quels sont tes points forts académiques ?',
            'helper' => "Choisis jusqu'à 4 réponses.",
            'options' => [
                'logique-math' => 'Logique & calcul',
                'memoire' => 'Mémoire & restitution',
                'redaction' => 'Rédaction & analyse',
                'experimentation' => 'Expérimentation',
                'organisation' => 'Organisation & méthode',
                'creativite' => 'Créativité & imagination',
            ],
        ],
        'favouriteSubjects' => [
            'question' => 'Quelles sont tes matières préférées ?',
            'helper' => "Choisis jusqu'à 5 matières.",
            'options' => [
                'maths' => 'Mathématiques',
                'physique-chimie' => 'Physique-chimie',
                'svt' => 'SVT',
                'informatique' => 'Informatique',
                'francais' => 'Français',
                'histoire-geo' => 'Histoire-géographie',
                'philosophie' => 'Philosophie',
                'economie' => 'Économie',
                'langues' => 'Langues étrangères',
                'arts' => 'Arts & design',
            ],
        ],
        'interests' => [
            'question' => 'Quels sujets te passionnent en dehors des cours ?',
            'helper' => "Choisis jusqu'à 5 centres d'intérêt.",
            'options' => [
                'technologie' => 'Nouvelles technologies & IA',
                'sciences' => 'Découvertes scientifiques & espace',
                'business' => 'Entrepreneuriat & startups',
                'sante' => 'Santé, bien-être & biologie',
                'droit-justice' => 'Justice, société & débat',
                'culture' => 'Lecture, cinéma & écriture',
                'art' => 'Design, photo & création visuelle',
                'environnement' => 'Écologie & développement durable',
            ],
        ],
        'preferredActivities' => [
            'question' => 'Quelles activités préfères-tu faire concrètement ?',
            'helper' => "Choisis jusqu'à 4 activités.",
            'options' => [
                'resoudre-problemes' => 'Résoudre des énigmes complexes',
                'creer-objets' => 'Fabriquer, coder ou prototyper',
                'analyser-donnees' => 'Analyser des graphiques & chiffres',
                'aider-ecouter' => 'Aider, conseiller, écouter',
                'convaincre-animer' => 'Convaincre, négocier, animer',
                'planifier-structurer' => 'Planifier, classer, ordonner',
            ],
        ],
        'workPreference' => [
            'question' => 'Dans quel cadre te projettes-tu le plus volontiers ?',
            'options' => [
                'liberte-remote' => 'Bureau flexible / télétravail tech',
                'laboratoire' => 'Laboratoire, hôpital ou terrain',
                'bureau-structure' => 'Entreprise structurée / cabinet',
                'contact-client' => 'Au contact permanent du public',
            ],
        ],
        'city' => [
            'question' => 'Dans quelle ville souhaites-tu étudier en priorité ?',
            'options' => [
                'casablanca' => 'Casablanca & région',
                'rabat' => 'Rabat-Salé-Kénitra',
                'tanger' => 'Tanger-Tétouan-Al Hoceïma',
                'marrakech' => 'Marrakech-Safi',
                'fes' => 'Fès-Meknès',
                'agadir' => 'Souss-Massa (Agadir)',
                'oujda' => 'Oriental (Oujda)',
                'etranger' => 'Mobilité internationale',
                'indifferent' => 'Ouvert(e) à toutes les villes',
            ],
        ],
        'studyType' => [
            'question' => "Quel type d'établissement envisages-tu ?",
            'options' => [
                'public' => 'Public uniquement (gratuit / sélectif)',
                'prive' => 'Privé / international (avec frais)',
                'indifferent' => 'Les deux me conviennent selon la qualité',
            ],
        ],
        'budget' => [
            'question' => 'Quel est ton budget mensuel indicatif pour tes études ?',
            'options' => [
                'tres-accessible' => '< 1 500 DH / mois (hébergement famille/cité)',
                'modere' => '1 500 – 4 000 DH / mois',
                'confortable' => '4 000 – 8 000 DH / mois',
                'eleve' => '> 8 000 DH / mois (écoles privées, mobilité)',
            ],
        ],
        'careerInterests' => [
            'question' => "Quels secteurs t'attirent spontanément ?",
            'helper' => "Choisis jusqu'à 5 domaines.",
            'options' => [
                'informatique' => 'Informatique, IA, cybersécurité',
                'ingenierie' => 'Ingénierie, énergies, BTP',
                'sante' => 'Médecine, pharmacie, biologie',
                'commerce' => 'Commerce, marketing, communication',
                'finance' => 'Finance, audit, comptabilité',
                'droit' => 'Droit, diplomatie, administration',
                'enseignement' => 'Enseignement & recherche académique',
                'entrepreneur' => "Entrepreneuriat & création d'entreprise",
            ],
        ],
        'confidence' => [
            'question' => "Où en es-tu dans ta réflexion d'orientation ?",
            'minLabel' => 'Très indécis(e)',
            'maxLabel' => 'Idée très claire',
        ],
        'mainDifficulty' => [
            'question' => 'Quelle est ta plus grande difficulté actuellement ?',
            'options' => [
                'trop-de-choix' => 'Trop de filières, je ne sais pas trier',
                'manque-info' => "Je manque d'informations fiables sur les écoles",
                'pression-famille' => "La pression familiale ou l'hésitation",
                'peur-selection' => 'Peur de ne pas avoir les seuils / concours',
            ],
        ],
        'workEnvironment' => [
            'question' => 'Quel environnement de travail te stimule le plus au quotidien ?',
            'options' => [
                'open-space' => 'Équipe dynamique et communicante',
                'calme' => 'Espace calme favorisant la concentration',
                'terrain' => 'Chantier, atelier ou visites de terrain',
                'hybride' => 'Mix flexible bureau et travail à distance',
            ],
        ],
        'learningStyle' => [
            'question' => "Quelle est ta façon préférée d'apprendre de nouvelles notions ?",
            'options' => [
                'pratique' => 'Par la pratique directe et les projets concrets',
                'theorique' => 'Par les concepts fondamentaux, lectures et maths',
                'equilibre' => 'Un équilibre soigné entre théorie et mise en œuvre',
            ],
        ],
        'workMode' => [
            'question' => 'Dans quel mode de travail te sens-tu le plus efficace ?',
            'options' => [
                'autonome' => 'Autonome, en gérant mes priorités à mon rythme',
                'collaboratif' => 'Collaboratif, en brainstorming et co-création',
                'equilibre' => 'Un mix selon les phases du projet',
            ],
        ],
        'leadershipComfort' => [
            'question' => 'Quel est ton niveau de confort pour guider ou animer un groupe ?',
            'minLabel' => 'Je préfère exécuter',
            'maxLabel' => "Très à l'aise en leader",
        ],
        'communicationConfidence' => [
            'question' => "Quelle est ton aisance pour t'exprimer devant un auditoire ?",
            'minLabel' => 'Stress important',
            'maxLabel' => 'Totalement naturel(le)',
        ],
        'mobility' => [
            'question' => 'Quelle est ta mobilité géographique pour tes études supérieures ?',
            'options' => [
                'ma-ville' => 'Dans ma ville actuelle en priorité',
                'national' => "N'importe où au Maroc selon la meilleure école",
                'international' => 'Mobilité internationale (Europe, Canada, etc.)',
            ],
        ],
        'financialConstraint' => [
            'question' => "Quelle est l'importance des bourses et de la gratuité des études ?",
            'options' => [
                'forte' => "Essentielle (écoles publiques ou bourses d'excellence)",
                'moyenne' => 'Importante mais modulable selon opportunités',
                'aucune' => 'Non limitante pour mon choix de cursus',
            ],
        ],
        'careerPriority' => [
            'question' => 'Quelle est ta priorité numéro une dans ta future carrière ?',
            'options' => [
                'salaire' => 'Un bon salaire rapidement',
                'stabilite' => "Stabilité et sécurité de l'emploi",
                'passion' => "Faire ce que j'aime passionnément",
                'impact' => 'Avoir un impact positif sur la société',
                'equilibre' => 'Équilibre vie pro / vie perso',
            ],
        ],
        'longTermGoal' => [
            'question' => 'Où te vois-tu dans 10 ans ?',
            'options' => [
                'expert' => 'Expert reconnu dans mon domaine',
                'direction' => "À la direction d'une équipe ou entreprise",
                'entreprendre' => 'Fondateur / fondatrice de ma structure',
                'contribuer' => 'Contribuer à de grands projets nationaux',
                'flexible' => 'Gagner en liberté et flexibilité de vie',
            ],
        ],
        'mainObstacle' => [
            'question' => "Quel est ton plus grand obstacle personnel aujourd'hui ?",
            'helper' => 'Sois honnête : Rafi adapte son accompagnement à ta réponse.',
            'options' => [
                'confiance' => 'Le manque de confiance en moi',
                'finances' => 'Les contraintes financières',
                'info' => "Le manque d'information et de repères",
                'famille' => 'La pression familiale',
                'procrastination' => "La procrastination / l'organisation",
                'autre' => 'Autre chose',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Generated results
    |--------------------------------------------------------------------------
    */

    'result' => [
        'default_first_name' => 'Élève',
        'default_stream' => 'baccalauréat',
        'default_city' => 'ta ville',
        'default_field' => 'sciences appliquées',
        'cities' => [
            'casablanca' => 'Casablanca',
            'rabat' => 'Rabat',
            'tanger' => 'Tanger',
            'marrakech' => 'Marrakech',
            'fes' => 'Fès',
            'agadir' => 'Agadir',
            'oujda' => 'Oujda',
        ],
        'free_summary' => ':name, élève en :stream basé(e) à :city. Ton profil combine des bases scientifiques solides et une vraie curiosité pour les métiers qui transforment le Maroc. Rafi a identifié trois pistes qui correspondent le mieux à tes réponses.',
        'premium_summary' => ":name, élève en :stream à :city. Ta combinaison de rigueur, de curiosité pratique et d'envie d'impact dessine un profil :field. L'analyse approfondie de tes réponses confirme une forte adéquation avec ce domaine, tout en gardant deux alternatives crédibles selon tes priorités.",
        'strengths' => [
            'logique-math' => 'Rigueur logique et facilité avec les chiffres',
            'memoire' => 'Bonne capacité de mémorisation',
            'redaction' => "Qualités rédactionnelles et d'analyse",
            'experimentation' => "Esprit scientifique et goût de l'expérimentation",
            'organisation' => "Sens de l'organisation et méthode de travail",
            'creativite' => 'Créativité et imagination',
        ],
        'default_strengths' => [
            "Curiosité intellectuelle et envie d'apprendre",
            "Capacité d'adaptation aux nouveaux défis",
            'Motivation pour réussir son orientation supérieure',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    'dashboard' => [
        'next_action' => [
            'start_assessment' => "Termine l'évaluation d'orientation (10 minutes) pour débloquer ton premier résultat.",
            'unlock_premium' => 'Découvre ton résultat gratuit et débloque Premium (19 DH) via WhatsApp.',
            'pending' => 'Ta demande Premium est en cours de vérification. Tu seras activé dès confirmation du virement.',
            'advanced_assessment' => "Passe l'évaluation approfondie Premium pour affiner ton plan d'action.",
            'weekly_challenge' => 'Commence ton défi soft skills de la semaine et avance sur ton parcours.',
        ],
        'stage' => [
            'discovery' => 'Découverte — évaluation de base à faire',
            'first_results' => 'Premiers résultats obtenus',
            'advanced' => "Orientation avancée — plan d'action en cours",
        ],
    ],

];
