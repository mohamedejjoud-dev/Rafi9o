<?php

namespace App\Services;

use App\Models\User;

class MoroccanOrientationService
{
    /**
     * Catalog of 5 major academic fields in the Moroccan educational context.
     *
     * @var list<array<string, mixed>>
     */
    protected array $fieldsCatalog = [
        [
            'id' => 'informatique-data',
            'name' => 'Informatique & Data',
            'score' => 82,
            'explanation' => "Ton profil montre une vraie aisance avec la logique, les maths et la résolution de problèmes. Les métiers du numérique (développement, data, IA) sont en forte croissance au Maroc, avec des écoles d'excellence comme l'ENSIAS, les ENSA, 1337 ou ALX, et des salaires parmi les plus attractifs du marché.",
            'strengths' => [
                'Rigueur logique et goût pour la résolution de problèmes',
                'Curiosité technologique et autonomie d\'apprentissage',
                'Bonnes bases scientifiques (maths, physique)',
            ],
            'potentialChallenges' => [
                'Volume important de travail pratique en première année',
                'Anglais technique à consolider rapidement',
                'Concurrence élevée dans les écoles les plus demandées',
            ],
            'nextAction' => "Explore le programme de l'ENSIAS ou d'une ENSA proche de chez toi, et commence un cours d'initiation Python cette semaine.",
        ],
        [
            'id' => 'ingenierie',
            'name' => 'Ingénierie & Sciences appliquées',
            'score' => 74,
            'explanation' => "Ton goût pour l'expérimentation et les sciences appliquées correspond bien au parcours d'ingénieur (CPGE, ENSA, FST). Ce domaine ouvre des carrières variées : génie civil, mécanique, électrique, énergies renouvelables — un secteur porteur avec les grands projets d'infrastructure au Maroc.",
            'strengths' => [
                'Solides bases en sciences physiques et mathématiques',
                'Esprit pratique et goût de l\'expérimentation',
                'Persévérance face aux problèmes complexes',
            ],
            'potentialChallenges' => [
                'Cursus exigeant (classes préparatoires ou concours CNC)',
                'Charge de travail élevée sur les deux premières années',
                'Nécessité de bien choisir ta spécialité en fin de parcours',
            ],
            'nextAction' => 'Compare les programmes CPGE / ENSA / FST et assiste à une journée portes ouvertes pour parler à des étudiants.',
        ],
        [
            'id' => 'medecine-sante',
            'name' => 'Médecine & Santé',
            'score' => 71,
            'explanation' => "Ton intérêt pour les sciences du vivant et ton envie d'aider les autres pointent vers les études de santé (FMP, instituts infirmiers, pharmacie, dentaire). C'est un parcours long mais très structurant, avec une vraie demande de professionnels au Maroc.",
            'strengths' => [
                'Bonne mémorisation et rigueur scientifique',
                'Empathie et envie d\'impact direct sur les personnes',
                'Capacité de travail régulier sur la durée',
            ],
            'potentialChallenges' => [
                'Concours d\'entrée très sélectif (médecine)',
                'Durée des études (6 à 10 ans selon la spécialité)',
                'Gestion du stress pendant les périodes d\'examens',
            ],
            'nextAction' => 'Renseigne-toi sur les conditions d\'accès à la faculté de médecine de ta ville et sur les filières paramédicales alternatives.',
        ],
        [
            'id' => 'commerce-gestion',
            'name' => 'Commerce & Gestion (ENCG)',
            'score' => 68,
            'explanation' => "Ton énergie relationnelle, ton intérêt pour l'économie et ton esprit d'initiative correspondent bien aux ENCG, aux écoles de commerce privées et aux filières gestion des universités. Le Maroc a besoin de managers formés au marketing, à la finance et à l'entrepreneuriat.",
            'strengths' => [
                'Facilité de communication et travail en équipe',
                'Intérêt pour l\'économie et l\'actualité des affaires',
                'Esprit d\'initiative et d\'organisation',
            ],
            'potentialChallenges' => [
                'Concours TAFEM à bien préparer pour les ENCG',
                'Frais élevés dans certaines écoles privées',
                'Stages à multiplier pour se différencier',
            ],
            'nextAction' => 'Prépare le concours TAFEM et découvre les spécialités ENCG (marketing, finance, achats) via des témoignages d\'étudiants.',
        ],
        [
            'id' => 'droit-sciences-po',
            'name' => 'Droit & Sciences politiques',
            'score' => 63,
            'explanation' => "Ton aisance à l'écrit, ton goût du débat et ton intérêt pour la société correspondent aux filières droit (université) et sciences politiques (Rabat, Tanger, Ifrane). Débouchés : avocat, notaire, juridique d'entreprise, administration publique, organisations internationales.",
            'strengths' => [
                'Qualités rédactionnelles et argumentation',
                'Culture générale et curiosité pour l\'actualité',
                'Capacité d\'analyse de situations complexes',
            ],
            'potentialChallenges' => [
                'Amphi chargés en première année de droit',
                'Mémorisation intensive (codes, jurisprudence)',
                'Concours administratifs compétitifs en sortie',
            ],
            'nextAction' => 'Assiste à un cours ouvert en fac de droit et lis un arrêt commenté pour tester ton intérêt réel pour la matière.',
        ],
    ];

    /**
     * Catalog of 8 soft skills priorities.
     *
     * @var list<array<string, mixed>>
     */
    protected array $softSkillsCatalog = [
        [
            'id' => 'communication-orale',
            'name' => 'Communication orale',
            'currentLevel' => 55,
            'reason' => 'Presque toutes les filières qui te correspondent incluent des soutenances et des présentations. Renforcer ta communication orale multiplie ton impact dès la première année.',
            'action' => 'Présente en 3 minutes un sujet qui te passionne devant un proche, une fois par semaine.',
            'completed' => false,
        ],
        [
            'id' => 'gestion-du-temps',
            'name' => 'Gestion du temps',
            'currentLevel' => 62,
            'reason' => 'Les cursus sélectifs (CPGE, médecine, écoles d\'ingénieurs) demandent un rythme soutenu. Une méthode de travail solide fait la différence dès le bac.',
            'action' => 'Planifie chaque dimanche ta semaine avec 3 priorités par jour, et compare le vendredi.',
            'completed' => false,
        ],
        [
            'id' => 'gestion-du-stress',
            'name' => 'Gestion du stress',
            'currentLevel' => 66,
            'reason' => 'Concours et examens créent des pics de pression. Apprendre à réguler ton stress protège tes performances et ta motivation.',
            'action' => 'Essaie la respiration 4-7-8 avant chaque devoir pendant deux semaines.',
            'completed' => false,
        ],
        [
            'id' => 'pensee-critique',
            'name' => 'Pensée critique',
            'currentLevel' => 72,
            'reason' => 'Savoir évaluer une information, une source ou un argument t\'aidera dans les études comme dans tes choix d\'orientation.',
            'action' => 'Analyse un article d\'actualité par semaine : quelle est la source ? Que manque-t-il ?',
            'completed' => false,
        ],
        [
            'id' => 'travail-equipe',
            'name' => 'Travail d\'équipe',
            'currentLevel' => 74,
            'reason' => 'Projets de classe, hackathons, travaux de groupe : la collaboration est au cœur des études supérieures modernes.',
            'action' => 'Prends le rôle d\'organisateur dans ton prochain travail de groupe.',
            'completed' => false,
        ],
        [
            'id' => 'adaptabilite',
            'name' => 'Adaptabilité',
            'currentLevel' => 70,
            'reason' => 'Ton parcours va te réserver des changements (ville, méthode d\'apprentissage, nouveaux rythmes). L\'adaptabilité réduit le coût de chaque transition.',
            'action' => 'Change une habitude d\'étude pendant une semaine et note ce que tu apprends.',
            'completed' => false,
        ],
        [
            'id' => 'leadership',
            'name' => 'Leadership',
            'currentLevel' => 58,
            'reason' => 'Tu as des aptitudes naturelles à organiser. Les développer t\'ouvrira des responsabilités dans les clubs étudiants et plus tard en entreprise.',
            'action' => 'Propose d\'animer une révision collective ou un événement dans ton lycée ce mois-ci.',
            'completed' => false,
        ],
        [
            'id' => 'creativite',
            'name' => 'Créativité',
            'currentLevel' => 76,
            'reason' => 'Ta capacité à proposer des idées neuves est un atout différenciant, notamment en informatique et en entrepreneuriat.',
            'action' => 'Tiens un carnet d\'idées : note 3 idées par jour, même farfelues.',
            'completed' => false,
        ],
    ];

    /**
     * Catalog of 10 curated learning resources.
     *
     * @var list<array<string, mixed>>
     */
    protected array $resourcesCatalog = [
        [
            'id' => 'res-python-oc',
            'type' => 'course',
            'title' => 'Fondamentaux de Python',
            'description' => 'Cours d\'initiation idéal avant une école d\'informatique : variables, boucles, fonctions et premier mini-projet.',
            'duration' => '20 h · OpenClassrooms',
            'completed' => false,
        ],
        [
            'id' => 'res-web-coursera',
            'type' => 'course',
            'title' => 'Introduction au développement web',
            'description' => 'HTML, CSS et JavaScript : construis ta première page personnelle et comprends le métier de développeur front-end.',
            'duration' => '30 h · Coursera',
            'completed' => false,
        ],
        [
            'id' => 'res-maths-fun',
            'type' => 'course',
            'title' => 'Mathématiques : logique et raisonnement',
            'description' => 'Remets à niveau logique, ensembles et algèbre — la base demandée en CPGE, ENSA et écoles d\'informatique.',
            'duration' => '25 h · FUN MOOC',
            'completed' => false,
        ],
        [
            'id' => 'res-data-alx',
            'type' => 'course',
            'title' => 'Initiation à la data science',
            'description' => 'Découvre ce que font les data analysts : Excel, premiers graphiques, statistiques descriptives et cas pratiques.',
            'duration' => '40 h · ALX / Coursera',
            'completed' => false,
        ],
        [
            'id' => 'res-podcast-orientation',
            'type' => 'podcast',
            'title' => 'Génération Orientation',
            'description' => 'Podcast marocain : des étudiants racontent leur parcours (ENCG, médecine, écoles d\'ingénieurs) et leurs conseils.',
            'duration' => '25 min / épisode',
            'completed' => false,
        ],
        [
            'id' => 'res-podcast-tech',
            'type' => 'podcast',
            'title' => 'Les coulisses des métiers tech',
            'description' => 'Développeurs, data analysts et product managers racontent une journée type de leur métier au Maroc et à l\'étranger.',
            'duration' => '35 min / épisode',
            'completed' => false,
        ],
        [
            'id' => 'res-podcast-methodes',
            'type' => 'podcast',
            'title' => 'Méthodes d\'apprentissage efficaces',
            'description' => 'Techniques concrètes de mémorisation, de prise de notes et de révision, applicables dès cette semaine.',
            'duration' => '20 min / épisode',
            'completed' => false,
        ],
        [
            'id' => 'res-ebook-filieres',
            'type' => 'ebook',
            'title' => 'Guide des filières scientifiques au Maroc',
            'description' => 'Panorama clair : CPGE, ENSA, FST, ENSIAS, médecine — admission, contenu, débouchés et témoignages.',
            'duration' => '60 pages · PDF',
            'completed' => false,
        ],
        [
            'id' => 'res-ebook-apprendre',
            'type' => 'ebook',
            'title' => 'Apprendre à apprendre',
            'description' => 'E-book pratique sur la concentration, le plan de révision et la mémoire : parfait avant la rentrée supérieure.',
            'duration' => '45 pages · PDF',
            'completed' => false,
        ],
        [
            'id' => 'res-ebook-confiance',
            'type' => 'ebook',
            'title' => 'Prendre confiance en sa prise de parole',
            'description' => 'Exercices progressifs pour parler en public sans stress : utile pour les soutenances et les oraux de concours.',
            'duration' => '30 pages · PDF',
            'completed' => false,
        ],
    ];

    /**
     * Catalog of 8 roadmap steps.
     *
     * @var list<array<string, mixed>>
     */
    protected array $roadmapCatalog = [
        [
            'id' => 'rm-explore-1',
            'stage' => 'explore',
            'title' => 'Rencontre un étudiant du domaine',
            'description' => 'Identifie un étudiant en informatique ou en école d\'ingénieurs (famille, lycée, LinkedIn) et pose-lui 5 questions.',
            'completed' => false,
        ],
        [
            'id' => 'rm-explore-2',
            'stage' => 'explore',
            'title' => 'Assiste à une journée portes ouvertes',
            'description' => 'Note les dates des JPO des écoles visées (ENSIAS, ENSA, FST, ENCG) et prépare 3 questions à poser.',
            'completed' => false,
        ],
        [
            'id' => 'rm-learn-1',
            'stage' => 'learn',
            'title' => 'Termine un cours d\'initiation',
            'description' => 'Choisis le cours Python ou développement web dans tes ressources et termine le premier module.',
            'completed' => false,
        ],
        [
            'id' => 'rm-learn-2',
            'stage' => 'learn',
            'title' => 'Renforce tes maths fondamentales',
            'description' => 'Consolide logique, algèbre et trigonométrie : elles servent dans toutes les filières scientifiques visées.',
            'completed' => false,
        ],
        [
            'id' => 'rm-practice-1',
            'stage' => 'practice',
            'title' => 'Réalise un mini-projet',
            'description' => 'Crée un petit projet concret : page web personnelle, script utile ou exposé présenté à ta classe.',
            'completed' => false,
        ],
        [
            'id' => 'rm-practice-2',
            'stage' => 'practice',
            'title' => 'Rejoins un club ou un hackathon',
            'description' => 'Club robotics, sciences, débat ou hackathon local : l\'expérience collective compte autant que les notes.',
            'completed' => false,
        ],
        [
            'id' => 'rm-prepare-1',
            'stage' => 'prepare',
            'title' => 'Prépare ton dossier de candidature',
            'description' => 'Rassembler relevés de notes, CV simple et lettre de motivation type pour tes candidatures.',
            'completed' => false,
        ],
        [
            'id' => 'rm-prepare-2',
            'stage' => 'prepare',
            'title' => 'Étudie les concours d\'entrée',
            'description' => 'CNC, TAFEM, concours ENSIAS/ENSA : calendrier, épreuves et annales à télécharger.',
            'completed' => false,
        ],
    ];

    /**
     * Get the 12 Basic Assessment Questions for Moroccan High School students.
     */
    public function getBasicQuestions(): array
    {
        return [
            [
                'id' => 'bacStream',
                'question' => 'Quelle est ta filière au baccalauréat ?',
                'helper' => 'Cela nous aide à connaître tes bases académiques.',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'sciences-math', 'label' => 'Sciences Mathématiques', 'emoji' => '📐'],
                    ['value' => 'sciences-experimentales', 'label' => 'Sciences Expérimentales', 'emoji' => '🔬'],
                    ['value' => 'sciences-economiques', 'label' => 'Sciences Économiques', 'emoji' => '📊'],
                    ['value' => 'lettres-sciences-humaines', 'label' => 'Lettres & Sciences humaines', 'emoji' => '📚'],
                    ['value' => 'sciences-techniques', 'label' => 'Sciences & Technologies', 'emoji' => '⚙️'],
                    ['value' => 'autre', 'label' => 'Autre situation', 'emoji' => '🎒'],
                ],
            ],
            [
                'id' => 'academicStrengths',
                'question' => 'Quels sont tes points forts académiques ?',
                'helper' => 'Choisis jusqu\'à 4 réponses.',
                'type' => 'multi',
                'maxSelections' => 4,
                'required' => true,
                'options' => [
                    ['value' => 'logique-math', 'label' => 'Logique & calcul', 'emoji' => '🧮'],
                    ['value' => 'memoire', 'label' => 'Mémoire & restitution', 'emoji' => '🧠'],
                    ['value' => 'redaction', 'label' => 'Rédaction & analyse', 'emoji' => '✍️'],
                    ['value' => 'experimentation', 'label' => 'Expérimentation', 'emoji' => '⚗️'],
                    ['value' => 'organisation', 'label' => 'Organisation & méthode', 'emoji' => '🗂️'],
                    ['value' => 'creativite', 'label' => 'Créativité & imagination', 'emoji' => '💡'],
                ],
            ],
            [
                'id' => 'favouriteSubjects',
                'question' => 'Quelles sont tes matières préférées ?',
                'helper' => 'Choisis jusqu\'à 5 matières.',
                'type' => 'multi',
                'maxSelections' => 5,
                'required' => true,
                'options' => [
                    ['value' => 'maths', 'label' => 'Mathématiques', 'emoji' => '➗'],
                    ['value' => 'physique-chimie', 'label' => 'Physique-chimie', 'emoji' => '🧪'],
                    ['value' => 'svt', 'label' => 'SVT', 'emoji' => '🌱'],
                    ['value' => 'informatique', 'label' => 'Informatique', 'emoji' => '💻'],
                    ['value' => 'francais', 'label' => 'Français', 'emoji' => '🇫🇷'],
                    ['value' => 'histoire-geo', 'label' => 'Histoire-géographie', 'emoji' => '🌍'],
                    ['value' => 'philosophie', 'label' => 'Philosophie', 'emoji' => '🦉'],
                    ['value' => 'economie', 'label' => 'Économie', 'emoji' => '📈'],
                    ['value' => 'langues', 'label' => 'Langues étrangères', 'emoji' => '🗣️'],
                    ['value' => 'arts', 'label' => 'Arts & design', 'emoji' => '🎨'],
                ],
            ],
            [
                'id' => 'interests',
                'question' => 'Quels sujets te passionnent en dehors des cours ?',
                'helper' => 'Choisis jusqu\'à 5 centres d\'intérêt.',
                'type' => 'multi',
                'maxSelections' => 5,
                'required' => true,
                'options' => [
                    ['value' => 'technologie', 'label' => 'Nouvelles technologies & IA', 'emoji' => '🤖'],
                    ['value' => 'sciences', 'label' => 'Découvertes scientifiques & espace', 'emoji' => '🔭'],
                    ['value' => 'business', 'label' => 'Entrepreneuriat & startups', 'emoji' => '💼'],
                    ['value' => 'sante', 'label' => 'Santé, bien-être & biologie', 'emoji' => '🩺'],
                    ['value' => 'droit-justice', 'label' => 'Justice, société & débat', 'emoji' => '⚖️'],
                    ['value' => 'culture', 'label' => 'Lecture, cinéma & écriture', 'emoji' => '📖'],
                    ['value' => 'art', 'label' => 'Design, photo & création visuelle', 'emoji' => '🎨'],
                    ['value' => 'environnement', 'label' => 'Écologie & développement durable', 'emoji' => '🌿'],
                ],
            ],
            [
                'id' => 'preferredActivities',
                'question' => 'Quelles activités préfères-tu faire concrètement ?',
                'helper' => 'Choisis jusqu\'à 4 activités.',
                'type' => 'multi',
                'maxSelections' => 4,
                'required' => true,
                'options' => [
                    ['value' => 'resoudre-problemes', 'label' => 'Résoudre des énigmes complexes', 'emoji' => '🧩'],
                    ['value' => 'creer-objets', 'label' => 'Fabriquer, coder ou prototyper', 'emoji' => '🛠️'],
                    ['value' => 'analyser-donnees', 'label' => 'Analyser des graphiques & chiffres', 'emoji' => '📊'],
                    ['value' => 'aider-ecouter', 'label' => 'Aider, conseiller, écouter', 'emoji' => '🤝'],
                    ['value' => 'convaincre-animer', 'label' => 'Convaincre, négocier, animer', 'emoji' => '🎤'],
                    ['value' => 'planifier-structurer', 'label' => 'Planifier, classer, ordonner', 'emoji' => '📋'],
                ],
            ],
            [
                'id' => 'workPreference',
                'question' => 'Dans quel cadre te projettes-tu le plus volontiers ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'liberte-remote', 'label' => 'Bureau flexible / télétravail tech', 'emoji' => '💻'],
                    ['value' => 'laboratoire', 'label' => 'Laboratoire, hôpital ou terrain', 'emoji' => '🏥'],
                    ['value' => 'bureau-structure', 'label' => 'Entreprise structurée / cabinet', 'emoji' => '🏢'],
                    ['value' => 'contact-client', 'label' => 'Au contact permanent du public', 'emoji' => '👥'],
                ],
            ],
            [
                'id' => 'city',
                'question' => 'Dans quelle ville souhaites-tu étudier en priorité ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'casablanca', 'label' => 'Casablanca & région', 'emoji' => '🏙️'],
                    ['value' => 'rabat', 'label' => 'Rabat-Salé-Kénitra', 'emoji' => '🏛️'],
                    ['value' => 'tanger', 'label' => 'Tanger-Tétouan-Al Hoceïma', 'emoji' => '🌊'],
                    ['value' => 'marrakech', 'label' => 'Marrakech-Safi', 'emoji' => '🌴'],
                    ['value' => 'fes', 'label' => 'Fès-Meknès', 'emoji' => '🏺'],
                    ['value' => 'agadir', 'label' => 'Souss-Massa (Agadir)', 'emoji' => '☀️'],
                    ['value' => 'oujda', 'label' => 'Oriental (Oujda)', 'emoji' => '🏜️'],
                    ['value' => 'etranger', 'label' => 'Mobilité internationale', 'emoji' => '✈️'],
                    ['value' => 'indifferent', 'label' => 'Ouvert(e) à toutes les villes', 'emoji' => '🧭'],
                ],
            ],
            [
                'id' => 'studyType',
                'question' => 'Quel type d\'établissement envisages-tu ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'public', 'label' => 'Public uniquement (gratuit / sélectif)', 'emoji' => '🏛️'],
                    ['value' => 'prive', 'label' => 'Privé / international (avec frais)', 'emoji' => '🎓'],
                    ['value' => 'indifferent', 'label' => 'Les deux me conviennent selon la qualité', 'emoji' => '⚖️'],
                ],
            ],
            [
                'id' => 'budget',
                'question' => 'Quel est ton budget mensuel indicatif pour tes études ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'tres-accessible', 'label' => '< 1 500 DH / mois (hébergement famille/cité)', 'emoji' => '🪙'],
                    ['value' => 'modere', 'label' => '1 500 – 4 000 DH / mois', 'emoji' => '💵'],
                    ['value' => 'confortable', 'label' => '4 000 – 8 000 DH / mois', 'emoji' => '💳'],
                    ['value' => 'eleve', 'label' => '> 8 000 DH / mois (écoles privées, mobilité)', 'emoji' => '💎'],
                ],
            ],
            [
                'id' => 'careerInterests',
                'question' => 'Quels secteurs t\'attirent spontanément ?',
                'helper' => 'Choisis jusqu\'à 5 domaines.',
                'type' => 'multi',
                'maxSelections' => 5,
                'required' => true,
                'options' => [
                    ['value' => 'informatique', 'label' => 'Informatique, IA, cybersécurité', 'emoji' => '💻'],
                    ['value' => 'ingenierie', 'label' => 'Ingénierie, énergies, BTP', 'emoji' => '⚡'],
                    ['value' => 'sante', 'label' => 'Médecine, pharmacie, biologie', 'emoji' => '🩺'],
                    ['value' => 'commerce', 'label' => 'Commerce, marketing, communication', 'emoji' => '📢'],
                    ['value' => 'finance', 'label' => 'Finance, audit, comptabilité', 'emoji' => '📈'],
                    ['value' => 'droit', 'label' => 'Droit, diplomatie, administration', 'emoji' => '⚖️'],
                    ['value' => 'enseignement', 'label' => 'Enseignement & recherche académique', 'emoji' => '🎓'],
                    ['value' => 'entrepreneur', 'label' => 'Entrepreneuriat & création d\'entreprise', 'emoji' => '🚀'],
                ],
            ],
            [
                'id' => 'confidence',
                'question' => 'Où en es-tu dans ta réflexion d\'orientation ?',
                'type' => 'scale',
                'scale' => [
                    'min' => 1,
                    'max' => 5,
                    'minLabel' => 'Très indécis(e)',
                    'maxLabel' => 'Idée très claire',
                ],
                'required' => true,
            ],
            [
                'id' => 'mainDifficulty',
                'question' => 'Quelle est ta plus grande difficulté actuellement ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'trop-de-choix', 'label' => 'Trop de filières, je ne sais pas trier', 'emoji' => '🌀'],
                    ['value' => 'manque-info', 'label' => 'Je manque d\'informations fiables sur les écoles', 'emoji' => '📚'],
                    ['value' => 'pression-famille', 'label' => 'La pression familiale ou l\'hésitation', 'emoji' => '💬'],
                    ['value' => 'peur-selection', 'label' => 'Peur de ne pas avoir les seuils / concours', 'emoji' => '🎯'],
                ],
            ],
        ];
    }

    /**
     * Get the 10 Advanced Assessment Questions for deep dive orientation.
     */
    public function getAdvancedQuestions(): array
    {
        return [
            [
                'id' => 'workEnvironment',
                'question' => 'Quel environnement de travail te stimule le plus au quotidien ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'open-space', 'label' => 'Équipe dynamique et communicante', 'emoji' => '🏢'],
                    ['value' => 'calme', 'label' => 'Espace calme favorisant la concentration', 'emoji' => '🎧'],
                    ['value' => 'terrain', 'label' => 'Chantier, atelier ou visites de terrain', 'emoji' => '🏗️'],
                    ['value' => 'hybride', 'label' => 'Mix flexible bureau et travail à distance', 'emoji' => '💻'],
                ],
            ],
            [
                'id' => 'learningStyle',
                'question' => 'Quelle est ta façon préférée d\'apprendre de nouvelles notions ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'pratique', 'label' => 'Par la pratique directe et les projets concrets', 'emoji' => '🛠️'],
                    ['value' => 'theorique', 'label' => 'Par les concepts fondamentaux, lectures et maths', 'emoji' => '📚'],
                    ['value' => 'equilibre', 'label' => 'Un équilibre soigné entre théorie et mise en œuvre', 'emoji' => '⚖️'],
                ],
            ],
            [
                'id' => 'workMode',
                'question' => 'Dans quel mode de travail te sens-tu le plus efficace ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'autonome', 'label' => 'Autonome, en gérant mes priorités à mon rythme', 'emoji' => '🎯'],
                    ['value' => 'collaboratif', 'label' => 'Collaboratif, en brainstorming et co-création', 'emoji' => '👥'],
                    ['value' => 'equilibre', 'label' => 'Un mix selon les phases du projet', 'emoji' => '🔄'],
                ],
            ],
            [
                'id' => 'leadershipComfort',
                'question' => 'Quel est ton niveau de confort pour guider ou animer un groupe ?',
                'type' => 'scale',
                'scale' => [
                    'min' => 1,
                    'max' => 5,
                    'minLabel' => 'Je préfère exécuter',
                    'maxLabel' => 'Très à l\'aise en leader',
                ],
                'required' => true,
            ],
            [
                'id' => 'communicationConfidence',
                'question' => 'Quelle est ton aisance pour t\'exprimer devant un auditoire ?',
                'type' => 'scale',
                'scale' => [
                    'min' => 1,
                    'max' => 5,
                    'minLabel' => 'Stress important',
                    'maxLabel' => 'Totalement naturel(le)',
                ],
                'required' => true,
            ],
            [
                'id' => 'mobility',
                'question' => 'Quelle est ta mobilité géographique pour tes études supérieures ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'ma-ville', 'label' => 'Dans ma ville actuelle en priorité', 'emoji' => '🏡'],
                    ['value' => 'national', 'label' => 'N\'importe où au Maroc selon la meilleure école', 'emoji' => '🇲🇦'],
                    ['value' => 'international', 'label' => 'Mobilité internationale (Europe, Canada, etc.)', 'emoji' => '✈️'],
                ],
            ],
            [
                'id' => 'financialConstraint',
                'question' => 'Quelle est l\'importance des bourses et de la gratuité des études ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'forte', 'label' => 'Essentielle (écoles publiques ou bourses d\'excellence)', 'emoji' => '🛡️'],
                    ['value' => 'moyenne', 'label' => 'Importante mais modulable selon opportunités', 'emoji' => '⚖️'],
                    ['value' => 'aucune', 'label' => 'Non limitante pour mon choix de cursus', 'emoji' => '✨'],
                ],
            ],
            [
                'id' => 'careerPriority',
                'question' => 'Quelle est ta priorité numéro une dans ta future carrière ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'salaire', 'label' => 'Un bon salaire rapidement', 'emoji' => '💵'],
                    ['value' => 'stabilite', 'label' => 'Stabilité et sécurité de l\'emploi', 'emoji' => '🛡️'],
                    ['value' => 'passion', 'label' => 'Faire ce que j\'aime passionnément', 'emoji' => '❤️'],
                    ['value' => 'impact', 'label' => 'Avoir un impact positif sur la société', 'emoji' => '🌱'],
                    ['value' => 'equilibre', 'label' => 'Équilibre vie pro / vie perso', 'emoji' => '🌿'],
                ],
            ],
            [
                'id' => 'longTermGoal',
                'question' => 'Où te vois-tu dans 10 ans ?',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'expert', 'label' => 'Expert reconnu dans mon domaine', 'emoji' => '🎯'],
                    ['value' => 'direction', 'label' => 'À la direction d\'une équipe ou entreprise', 'emoji' => '📊'],
                    ['value' => 'entreprendre', 'label' => 'Fondateur / fondatrice de ma structure', 'emoji' => '🚀'],
                    ['value' => 'contribuer', 'label' => 'Contribuer à de grands projets nationaux', 'emoji' => '🏗️'],
                    ['value' => 'flexible', 'label' => 'Gagner en liberté et flexibilité de vie', 'emoji' => '🕊️'],
                ],
            ],
            [
                'id' => 'mainObstacle',
                'question' => 'Quel est ton plus grand obstacle personnel aujourd\'hui ?',
                'helper' => 'Sois honnête : Rafi adapte son accompagnement à ta réponse.',
                'type' => 'single',
                'required' => true,
                'options' => [
                    ['value' => 'confiance', 'label' => 'Le manque de confiance en moi', 'emoji' => '🌧️'],
                    ['value' => 'finances', 'label' => 'Les contraintes financières', 'emoji' => '💰'],
                    ['value' => 'info', 'label' => 'Le manque d\'information et de repères', 'emoji' => '🧭'],
                    ['value' => 'famille', 'label' => 'La pression familiale', 'emoji' => '👨‍👩‍👧'],
                    ['value' => 'procrastination', 'label' => 'La procrastination / l\'organisation', 'emoji' => '⏳'],
                    ['value' => 'autre', 'label' => 'Autre chose', 'emoji' => '🔹'],
                ],
            ],
        ];
    }

    /**
     * Compute 0-100 match percentages for the 5 Moroccan academic fields based on answers.
     */
    public function computeFieldScores(array $answers): array
    {
        $scores = [
            'informatique-data' => 70,
            'ingenierie' => 65,
            'medecine-sante' => 62,
            'commerce-gestion' => 60,
            'droit-sciences-po' => 55,
        ];

        $bump = function (string $id, int $n) use (&$scores) {
            if (isset($scores[$id])) {
                $scores[$id] = min(96, $scores[$id] + $n);
            }
        };

        $stream = $answers['bacStream'] ?? null;
        if ($stream === 'sciences-math') {
            $bump('informatique-data', 6);
            $bump('ingenierie', 4);
        } elseif ($stream === 'sciences-experimentales') {
            $bump('medecine-sante', 5);
            $bump('ingenierie', 3);
        } elseif ($stream === 'sciences-economiques') {
            $bump('commerce-gestion', 6);
        } elseif ($stream === 'lettres-sciences-humaines') {
            $bump('droit-sciences-po', 6);
            $bump('commerce-gestion', 3);
        } elseif ($stream === 'sciences-techniques') {
            $bump('ingenierie', 5);
            $bump('informatique-data', 3);
        }

        $interests = (array) ($answers['interests'] ?? []);
        foreach ($interests as $v) {
            if ($v === 'technologie') {
                $bump('informatique-data', 8);
            }
            if ($v === 'sciences') {
                $bump('ingenierie', 5);
                $bump('medecine-sante', 3);
            }
            if ($v === 'sante') {
                $bump('medecine-sante', 8);
            }
            if ($v === 'business') {
                $bump('commerce-gestion', 7);
            }
            if ($v === 'droit-justice') {
                $bump('droit-sciences-po', 8);
            }
            if ($v === 'culture') {
                $bump('droit-sciences-po', 3);
            }
            if ($v === 'environnement') {
                $bump('ingenierie', 3);
            }
            if ($v === 'art') {
                $bump('commerce-gestion', 2);
            }
        }

        $subjects = (array) ($answers['favouriteSubjects'] ?? []);
        foreach ($subjects as $v) {
            if ($v === 'informatique') {
                $bump('informatique-data', 4);
            }
            if ($v === 'maths') {
                $bump('informatique-data', 3);
                $bump('ingenierie', 2);
            }
            if ($v === 'physique-chimie') {
                $bump('ingenierie', 3);
                $bump('medecine-sante', 2);
            }
            if ($v === 'svt') {
                $bump('medecine-sante', 3);
            }
            if ($v === 'economie') {
                $bump('commerce-gestion', 3);
            }
            if (in_array($v, ['histoire-geo', 'philosophie', 'francais'], true)) {
                $bump('droit-sciences-po', 2);
            }
        }

        $careerInterests = (array) ($answers['careerInterests'] ?? []);
        foreach ($careerInterests as $v) {
            if ($v === 'informatique' || $v === 'data') {
                $bump('informatique-data', 6);
            }
            if ($v === 'ingenierie') {
                $bump('ingenierie', 6);
            }
            if ($v === 'sante') {
                $bump('medecine-sante', 6);
            }
            if (in_array($v, ['commerce', 'finance', 'entrepreneur'], true)) {
                $bump('commerce-gestion', 5);
            }
            if ($v === 'droit') {
                $bump('droit-sciences-po', 6);
            }
        }

        $wp = $answers['workPreference'] ?? null;
        if ($wp === 'laboratoire') {
            $bump('medecine-sante', 3);
            $bump('ingenierie', 3);
        }
        if ($wp === 'bureau-structure') {
            $bump('droit-sciences-po', 3);
            $bump('commerce-gestion', 2);
        }
        if ($wp === 'liberte-remote') {
            $bump('informatique-data', 4);
        }
        if ($wp === 'contact-client') {
            $bump('medecine-sante', 3);
            $bump('commerce-gestion', 3);
        }

        $ranked = [];
        foreach ($scores as $id => $val) {
            $ranked[] = ['id' => $id, 'score' => (int) round($val)];
        }

        usort($ranked, fn ($a, $b) => $b['score'] <=> $a['score']);

        return $ranked;
    }

    /**
     * Generate the free orientation result object based on basic assessment answers.
     */
    public function generateFreeResult(User $user, array $answers): array
    {
        $scores = $this->computeFieldScores($answers);
        $fieldsById = collect($this->fieldsCatalog)->keyBy('id');

        $topFields = array_map(function ($item) use ($fieldsById) {
            $field = $fieldsById->get($item['id']);

            return array_merge($field, ['score' => $item['score']]);
        }, array_slice($scores, 0, 3));

        $firstName = explode(' ', $user->name)[0] ?? 'Élève';
        $stream = $answers['bacStream'] ?? 'baccalauréat';
        $city = $answers['city'] ?? 'ta ville';

        $summary = "{$firstName}, élève en {$stream} basé(e) à {$city}. Ton profil combine des bases scientifiques solides et une vraie curiosité pour les métiers qui transforment le Maroc. Rafi a identifié trois pistes qui correspondent le mieux à tes réponses.";

        $strengthsMap = [
            'logique-math' => 'Rigueur logique et facilité avec les chiffres',
            'memoire' => 'Bonne capacité de mémorisation',
            'redaction' => 'Qualités rédactionnelles et d\'analyse',
            'experimentation' => 'Esprit scientifique et goût de l\'expérimentation',
            'organisation' => 'Sens de l\'organisation et méthode de travail',
            'creativite' => 'Créativité et imagination',
        ];

        $strengths = [];
        $academicStrengths = (array) ($answers['academicStrengths'] ?? []);
        foreach ($academicStrengths as $s) {
            if (isset($strengthsMap[$s])) {
                $strengths[] = $strengthsMap[$s];
            }
        }
        if (count($strengths) < 3) {
            $strengths[] = 'Curiosité intellectuelle et envie d\'apprendre';
            $strengths[] = 'Capacité d\'adaptation aux nouveaux défis';
            $strengths[] = 'Motivation pour réussir son orientation supérieure';
        }
        $strengths = array_slice($strengths, 0, 3);

        $trial = $this->getTrialStatus($user);

        return [
            'kind' => 'free',
            'result' => [
                'profileSummary' => $summary,
                'topFields' => $topFields,
                'strengths' => $strengths,
                'softSkillPriorities' => [$this->softSkillsCatalog[0]],
                'resources' => [],
                'roadmap' => [],
            ],
            'accessLevel' => $trial['accessLevel'],
            'source' => 'ai',
            'generatedAt' => now()->toISOString(),
        ];
    }

    /**
     * Generate the complete premium result including customized soft skills, resources, and roadmap.
     */
    public function generatePremiumResult(User $user, array $basic, array $advanced): array
    {
        $freeResult = $this->generateFreeResult($user, $basic);
        $topFields = $freeResult['result']['topFields'];

        $commConfidence = (int) ($advanced['communicationConfidence'] ?? 3);
        $leadComfort = (int) ($advanced['leadershipComfort'] ?? 3);

        $commLevel = max(40, min(80, 30 + 10 * $commConfidence));
        $leadLevel = max(40, min(80, 30 + 10 * $leadComfort));

        $skills = [
            array_merge($this->softSkillsCatalog[0], ['currentLevel' => $commLevel]),
            $this->softSkillsCatalog[1],
            $leadComfort >= 4
                ? array_merge($this->softSkillsCatalog[6], ['currentLevel' => $leadLevel])
                : (($advanced['financialConstraint'] ?? '') === 'forte' ? $this->softSkillsCatalog[2] : $this->softSkillsCatalog[3]),
        ];

        $firstName = explode(' ', $user->name)[0] ?? 'Élève';
        $stream = $basic['bacStream'] ?? 'baccalauréat';
        $city = $basic['city'] ?? 'ta ville';
        $primaryFieldName = strtolower($topFields[0]['name'] ?? 'sciences appliquées');

        $summary = "{$firstName}, élève en {$stream} à {$city}. Ta combinaison de rigueur, de curiosité pratique et d'envie d'impact dessine un profil {$primaryFieldName}. L'analyse approfondie de tes réponses confirme une forte adéquation avec ce domaine, tout en gardant deux alternatives crédibles selon tes priorités.";

        $trial = $this->getTrialStatus($user);

        return [
            'kind' => 'premium',
            'result' => [
                'profileSummary' => $summary,
                'topFields' => $topFields,
                'strengths' => $freeResult['result']['strengths'],
                'softSkillPriorities' => $skills,
                'resources' => $this->resourcesCatalog,
                'roadmap' => $this->roadmapCatalog,
            ],
            'accessLevel' => $trial['accessLevel'],
            'source' => 'ai',
            'generatedAt' => now()->toISOString(),
        ];
    }

    /**
     * Compute current trial and subscription status for a user.
     */
    public function getTrialStatus(User $user): array
    {
        if ($user->role === 'admin' || $user->subscription_status === 'premium') {
            if ($user->premium_expires_at && $user->premium_expires_at->isPast()) {
                return [
                    'status' => 'expired',
                    'startedAt' => $user->premium_activated_at?->toISOString(),
                    'expiresAt' => $user->premium_expires_at?->toISOString(),
                    'daysRemaining' => 0,
                    'accessLevel' => 'free',
                ];
            }

            $days = $user->premium_expires_at ? max(0, (int) now()->diffInDays($user->premium_expires_at, false)) : 30;

            return [
                'status' => 'active',
                'startedAt' => $user->premium_activated_at?->toISOString() ?? now()->toISOString(),
                'expiresAt' => $user->premium_expires_at?->toISOString(),
                'daysRemaining' => $days,
                'accessLevel' => 'premium',
            ];
        }

        return [
            'status' => 'not_started',
            'startedAt' => null,
            'expiresAt' => null,
            'daysRemaining' => 0,
            'accessLevel' => 'free',
        ];
    }

    /**
     * Compute dashboard state for the authenticated user.
     */
    public function getDashboard(User $user, ?array $latestResult = null): array
    {
        $trial = $this->getTrialStatus($user);
        $isFree = $latestResult && ($latestResult['kind'] ?? '') === 'free';
        $isPremium = $latestResult && ($latestResult['kind'] ?? '') === 'premium';

        $profileCompletion = 40;
        if ($latestResult) {
            $profileCompletion += 35;
        }
        if ($trial['accessLevel'] === 'premium') {
            $profileCompletion += 25;
        }

        $primaryField = $latestResult['result']['topFields'][0] ?? null;
        $weeklyChallenge = $latestResult['result']['softSkillPriorities'][0] ?? null;

        $nextAction = ! $latestResult
            ? "Termine l'évaluation d'orientation (10 minutes) pour débloquer ton premier résultat."
            : ($trial['status'] === 'not_started'
                ? "Découvre ton résultat gratuit et active l'Aperçu Premium de 3 jours."
                : ($trial['status'] === 'active' && ! $isPremium
                    ? "Passe l'évaluation approfondie Premium pour affiner ton plan d'action."
                    : 'Commence ton défi soft skills de la semaine et avance sur ton parcours.'));

        return [
            'profileCompletion' => min(100, $profileCompletion),
            'trial' => $trial,
            'orientationStage' => ! $latestResult
                ? 'Découverte — évaluation de base à faire'
                : (! $isPremium ? 'Premiers résultats obtenus' : 'Orientation avancée — plan d\'action en cours'),
            'primaryField' => $primaryField,
            'weeklyChallenge' => $weeklyChallenge,
            'roadmapProgress' => $isPremium ? 25 : 0,
            'completedResources' => $isPremium ? 2 : 0,
            'streak' => 4,
            'nextAction' => $nextAction,
        ];
    }
}
