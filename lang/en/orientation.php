<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Academic fields catalog
    |--------------------------------------------------------------------------
    */

    'fields' => [
        'informatique-data' => [
            'name' => 'Computer Science & Data',
            'explanation' => 'Your profile shows real ease with logic, maths and problem-solving. Digital careers (software development, data, AI) are growing fast in Morocco, with top schools like ENSIAS, the ENSA network, 1337 or ALX, and some of the most attractive salaries on the market.',
            'strengths' => [
                'Logical rigour and a taste for problem-solving',
                'Curiosity about technology and self-directed learning',
                'Solid science foundations (maths, physics)',
            ],
            'potentialChallenges' => [
                'A heavy load of hands-on work in first year',
                'Technical English to strengthen quickly',
                'Strong competition for the most sought-after schools',
            ],
            'nextAction' => 'Explore the ENSIAS programme or an ENSA near you, and start an introductory Python course this week.',
        ],
        'ingenierie' => [
            'name' => 'Engineering & Applied Sciences',
            'explanation' => 'Your love of experimenting and of applied sciences fits the engineering path well (CPGE, ENSA, FST). This field opens up a wide range of careers: civil, mechanical and electrical engineering, renewable energy — a booming sector driven by Morocco\'s major infrastructure projects.',
            'strengths' => [
                'Strong foundations in physics and mathematics',
                'Practical mindset and a taste for experimenting',
                'Perseverance when facing complex problems',
            ],
            'potentialChallenges' => [
                'Demanding programmes (preparatory classes or the CNC entrance exam)',
                'Heavy workload during the first two years',
                'You will need to choose your specialisation carefully at the end',
            ],
            'nextAction' => 'Compare the CPGE / ENSA / FST programmes and attend an open day to talk with current students.',
        ],
        'medecine-sante' => [
            'name' => 'Medicine & Health',
            'explanation' => 'Your interest in life sciences and your wish to help others point towards health studies (FMP, nursing institutes, pharmacy, dentistry). It is a long path but a very formative one, with real demand for health professionals in Morocco.',
            'strengths' => [
                'Good memory and scientific rigour',
                'Empathy and a wish to have a direct impact on people',
                'Ability to work steadily over the long term',
            ],
            'potentialChallenges' => [
                'Highly selective entrance exam (medicine)',
                'Length of studies (6 to 10 years depending on the specialty)',
                'Managing stress during exam periods',
            ],
            'nextAction' => 'Look into the admission requirements of the faculty of medicine in your city and into alternative paramedical tracks.',
        ],
        'commerce-gestion' => [
            'name' => 'Business & Management (ENCG)',
            'explanation' => 'Your people skills, your interest in economics and your sense of initiative are a great fit for the ENCG schools, private business schools and university management programmes. Morocco needs managers trained in marketing, finance and entrepreneurship.',
            'strengths' => [
                'Easy communication and teamwork',
                'Interest in economics and business news',
                'Sense of initiative and organisation',
            ],
            'potentialChallenges' => [
                'The TAFEM entrance exam to prepare well for the ENCG',
                'High fees at some private schools',
                'Internships to pile up to stand out',
            ],
            'nextAction' => 'Prepare for the TAFEM exam and discover the ENCG specialisations (marketing, finance, purchasing) through student testimonials.',
        ],
        'droit-sciences-po' => [
            'name' => 'Law & Political Science',
            'explanation' => 'Your ease with writing, your love of debate and your interest in society fit law programmes (university) and political science (Rabat, Tangier, Ifrane). Career paths: lawyer, notary, corporate legal counsel, public administration, international organisations.',
            'strengths' => [
                'Writing and argumentation skills',
                'General knowledge and curiosity about current affairs',
                'Ability to analyse complex situations',
            ],
            'potentialChallenges' => [
                'Crowded lecture halls in the first year of law',
                'Intensive memorisation (legal codes, case law)',
                'Competitive civil-service exams after graduation',
            ],
            'nextAction' => 'Sit in on an open lecture at a law faculty and read an annotated court ruling to test your real interest in the subject.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Soft skills catalog
    |--------------------------------------------------------------------------
    */

    'soft_skills' => [
        'communication-orale' => [
            'name' => 'Public speaking',
            'reason' => 'Almost every programme that suits you includes oral defences and presentations. Strengthening your speaking skills multiplies your impact from the very first year.',
            'action' => 'Once a week, present a topic you love in 3 minutes to someone close to you.',
        ],
        'gestion-du-temps' => [
            'name' => 'Time management',
            'reason' => 'Selective programmes (CPGE, medicine, engineering schools) demand a sustained pace. A solid study method makes the difference from the Bac onwards.',
            'action' => 'Every Sunday, plan your week with 3 priorities per day, and review on Friday.',
        ],
        'gestion-du-stress' => [
            'name' => 'Stress management',
            'reason' => 'Entrance exams and tests create peaks of pressure. Learning to regulate your stress protects your performance and your motivation.',
            'action' => 'Try 4-7-8 breathing before every test for two weeks.',
        ],
        'pensee-critique' => [
            'name' => 'Critical thinking',
            'reason' => 'Knowing how to evaluate a piece of information, a source or an argument will help you in your studies as well as in your orientation choices.',
            'action' => 'Analyse one news article a week: what is the source? What is missing?',
        ],
        'travail-equipe' => [
            'name' => 'Teamwork',
            'reason' => 'Class projects, hackathons, group work: collaboration is at the heart of modern higher education.',
            'action' => 'Take on the organiser role in your next group project.',
        ],
        'adaptabilite' => [
            'name' => 'Adaptability',
            'reason' => 'Your path will bring changes (new city, new ways of learning, new rhythms). Adaptability lowers the cost of every transition.',
            'action' => 'Change one study habit for a week and write down what you learn.',
        ],
        'leadership' => [
            'name' => 'Leadership',
            'reason' => 'You have a natural knack for organising. Developing it will open up responsibilities in student clubs and later at work.',
            'action' => 'Offer to lead a group revision session or an event at your high school this month.',
        ],
        'creativite' => [
            'name' => 'Creativity',
            'reason' => 'Your ability to come up with fresh ideas is a real differentiator, especially in computer science and entrepreneurship.',
            'action' => 'Keep an idea notebook: write down 3 ideas a day, even wild ones.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Learning resources catalog
    |--------------------------------------------------------------------------
    */

    'resources' => [
        'res-python-oc' => [
            'title' => 'Python Fundamentals',
            'description' => 'The ideal introductory course before a computer science school: variables, loops, functions and a first mini-project.',
            'duration' => '20 h · OpenClassrooms',
        ],
        'res-web-coursera' => [
            'title' => 'Introduction to Web Development',
            'description' => 'HTML, CSS and JavaScript: build your first personal page and understand what a front-end developer does.',
            'duration' => '30 h · Coursera',
        ],
        'res-maths-fun' => [
            'title' => 'Mathematics: Logic and Reasoning',
            'description' => 'Brush up on logic, sets and algebra — the foundation expected in CPGE, ENSA and computer science schools.',
            'duration' => '25 h · FUN MOOC',
        ],
        'res-data-alx' => [
            'title' => 'Introduction to Data Science',
            'description' => 'Discover what data analysts do: Excel, first charts, descriptive statistics and case studies.',
            'duration' => '40 h · ALX / Coursera',
        ],
        'res-podcast-orientation' => [
            'title' => 'Génération Orientation',
            'description' => 'A Moroccan podcast: students share their journeys (ENCG, medicine, engineering schools) and their advice.',
            'duration' => '25 min / episode',
        ],
        'res-podcast-tech' => [
            'title' => 'Behind the Scenes of Tech Jobs',
            'description' => 'Developers, data analysts and product managers describe a typical day at work, in Morocco and abroad.',
            'duration' => '35 min / episode',
        ],
        'res-podcast-methodes' => [
            'title' => 'Effective Learning Methods',
            'description' => 'Practical techniques for memorising, note-taking and revising that you can apply this very week.',
            'duration' => '20 min / episode',
        ],
        'res-ebook-filieres' => [
            'title' => 'Guide to Science Programmes in Morocco',
            'description' => 'A clear overview: CPGE, ENSA, FST, ENSIAS, medicine — admission, content, career prospects and testimonials.',
            'duration' => '60 pages · PDF',
        ],
        'res-ebook-apprendre' => [
            'title' => 'Learning How to Learn',
            'description' => 'A practical e-book on focus, revision planning and memory: perfect before starting higher education.',
            'duration' => '45 pages · PDF',
        ],
        'res-ebook-confiance' => [
            'title' => 'Gaining Confidence in Public Speaking',
            'description' => 'Step-by-step exercises to speak in public without stress: useful for oral defences and entrance interviews.',
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
            'title' => 'Meet a student in the field',
            'description' => 'Find a computer science or engineering student (family, high school, LinkedIn) and ask them 5 questions.',
        ],
        'rm-explore-2' => [
            'title' => 'Attend an open day',
            'description' => 'Write down the open-day dates of your target schools (ENSIAS, ENSA, FST, ENCG) and prepare 3 questions to ask.',
        ],
        'rm-learn-1' => [
            'title' => 'Finish an introductory course',
            'description' => 'Pick the Python or web development course in your resources and complete the first module.',
        ],
        'rm-learn-2' => [
            'title' => 'Strengthen your core maths',
            'description' => 'Consolidate logic, algebra and trigonometry: they are used in every science programme you are aiming for.',
        ],
        'rm-practice-1' => [
            'title' => 'Build a mini-project',
            'description' => 'Create a small, concrete project: a personal web page, a useful script or a presentation given to your class.',
        ],
        'rm-practice-2' => [
            'title' => 'Join a club or a hackathon',
            'description' => 'Robotics, science or debate club, or a local hackathon: group experience counts as much as grades.',
        ],
        'rm-prepare-1' => [
            'title' => 'Prepare your application file',
            'description' => 'Gather your transcripts, a simple CV and a template cover letter for your applications.',
        ],
        'rm-prepare-2' => [
            'title' => 'Study the entrance exams',
            'description' => 'CNC, TAFEM, ENSIAS/ENSA exams: calendar, tests and past papers to download.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Assessment questions (basic + advanced), keyed by question id
    |--------------------------------------------------------------------------
    */

    'questions' => [
        'bacStream' => [
            'question' => 'What is your Bac stream?',
            'helper' => 'This helps us understand your academic background.',
            'options' => [
                'sciences-math' => 'Mathematical Sciences',
                'sciences-experimentales' => 'Experimental Sciences',
                'sciences-economiques' => 'Economic Sciences',
                'lettres-sciences-humaines' => 'Literature & Humanities',
                'sciences-techniques' => 'Science & Technology',
                'autre' => 'Other situation',
            ],
        ],
        'academicStrengths' => [
            'question' => 'What are your academic strengths?',
            'helper' => 'Pick up to 4 answers.',
            'options' => [
                'logique-math' => 'Logic & calculation',
                'memoire' => 'Memory & recall',
                'redaction' => 'Writing & analysis',
                'experimentation' => 'Experimenting',
                'organisation' => 'Organisation & method',
                'creativite' => 'Creativity & imagination',
            ],
        ],
        'favouriteSubjects' => [
            'question' => 'What are your favourite subjects?',
            'helper' => 'Pick up to 5 subjects.',
            'options' => [
                'maths' => 'Mathematics',
                'physique-chimie' => 'Physics & chemistry',
                'svt' => 'Life & earth sciences',
                'informatique' => 'Computer science',
                'francais' => 'French',
                'histoire-geo' => 'History & geography',
                'philosophie' => 'Philosophy',
                'economie' => 'Economics',
                'langues' => 'Foreign languages',
                'arts' => 'Arts & design',
            ],
        ],
        'interests' => [
            'question' => 'What topics excite you outside of class?',
            'helper' => 'Pick up to 5 interests.',
            'options' => [
                'technologie' => 'New technologies & AI',
                'sciences' => 'Scientific discoveries & space',
                'business' => 'Entrepreneurship & startups',
                'sante' => 'Health, well-being & biology',
                'droit-justice' => 'Justice, society & debate',
                'culture' => 'Reading, cinema & writing',
                'art' => 'Design, photography & visual creation',
                'environnement' => 'Ecology & sustainable development',
            ],
        ],
        'preferredActivities' => [
            'question' => 'Which activities do you most enjoy doing hands-on?',
            'helper' => 'Pick up to 4 activities.',
            'options' => [
                'resoudre-problemes' => 'Solving complex puzzles',
                'creer-objets' => 'Building, coding or prototyping',
                'analyser-donnees' => 'Analysing charts & numbers',
                'aider-ecouter' => 'Helping, advising, listening',
                'convaincre-animer' => 'Persuading, negotiating, leading',
                'planifier-structurer' => 'Planning, sorting, organising',
            ],
        ],
        'workPreference' => [
            'question' => 'Which work setting do you picture yourself in most?',
            'options' => [
                'liberte-remote' => 'Flexible office / remote tech work',
                'laboratoire' => 'Lab, hospital or field work',
                'bureau-structure' => 'Structured company / firm',
                'contact-client' => 'Constant contact with the public',
            ],
        ],
        'city' => [
            'question' => 'Which city would you prefer to study in?',
            'options' => [
                'casablanca' => 'Casablanca & region',
                'rabat' => 'Rabat-Salé-Kénitra',
                'tanger' => 'Tangier-Tetouan-Al Hoceima',
                'marrakech' => 'Marrakech-Safi',
                'fes' => 'Fez-Meknes',
                'agadir' => 'Souss-Massa (Agadir)',
                'oujda' => 'Oriental (Oujda)',
                'etranger' => 'Studying abroad',
                'indifferent' => 'Open to any city',
            ],
        ],
        'studyType' => [
            'question' => 'What type of institution are you considering?',
            'options' => [
                'public' => 'Public only (free / selective)',
                'prive' => 'Private / international (with fees)',
                'indifferent' => 'Either works, depending on quality',
            ],
        ],
        'budget' => [
            'question' => 'What is your approximate monthly budget for your studies?',
            'options' => [
                'tres-accessible' => '< 1,500 DH / month (living with family / in student housing)',
                'modere' => '1,500 – 4,000 DH / month',
                'confortable' => '4,000 – 8,000 DH / month',
                'eleve' => '> 8,000 DH / month (private schools, studying abroad)',
            ],
        ],
        'careerInterests' => [
            'question' => 'Which sectors naturally attract you?',
            'helper' => 'Pick up to 5 fields.',
            'options' => [
                'informatique' => 'Computer science, AI, cybersecurity',
                'ingenierie' => 'Engineering, energy, construction',
                'sante' => 'Medicine, pharmacy, biology',
                'commerce' => 'Business, marketing, communication',
                'finance' => 'Finance, audit, accounting',
                'droit' => 'Law, diplomacy, public administration',
                'enseignement' => 'Teaching & academic research',
                'entrepreneur' => 'Entrepreneurship & starting a business',
            ],
        ],
        'confidence' => [
            'question' => 'Where are you in your orientation thinking?',
            'minLabel' => 'Very undecided',
            'maxLabel' => 'Very clear idea',
        ],
        'mainDifficulty' => [
            'question' => 'What is your biggest difficulty right now?',
            'options' => [
                'trop-de-choix' => "Too many programmes, I don't know how to narrow them down",
                'manque-info' => 'I lack reliable information about schools',
                'pression-famille' => 'Family pressure or hesitation',
                'peur-selection' => 'Fear of not meeting the cut-offs / passing the entrance exams',
            ],
        ],
        'workEnvironment' => [
            'question' => 'Which work environment motivates you most day to day?',
            'options' => [
                'open-space' => 'A dynamic, talkative team',
                'calme' => 'A quiet space that helps you focus',
                'terrain' => 'Construction site, workshop or field visits',
                'hybride' => 'A flexible mix of office and remote work',
            ],
        ],
        'learningStyle' => [
            'question' => 'What is your favourite way to learn new concepts?',
            'options' => [
                'pratique' => 'Hands-on practice and concrete projects',
                'theorique' => 'Core concepts, reading and maths',
                'equilibre' => 'A careful balance of theory and practice',
            ],
        ],
        'workMode' => [
            'question' => 'In which work mode do you feel most effective?',
            'options' => [
                'autonome' => 'Independently, managing my priorities at my own pace',
                'collaboratif' => 'Collaboratively, brainstorming and co-creating',
                'equilibre' => 'A mix depending on the project phase',
            ],
        ],
        'leadershipComfort' => [
            'question' => 'How comfortable are you guiding or leading a group?',
            'minLabel' => 'I prefer to execute',
            'maxLabel' => 'Very comfortable as a leader',
        ],
        'communicationConfidence' => [
            'question' => 'How comfortable are you speaking in front of an audience?',
            'minLabel' => 'Very stressful',
            'maxLabel' => 'Completely natural',
        ],
        'mobility' => [
            'question' => 'How far are you willing to move for your higher education?',
            'options' => [
                'ma-ville' => 'My current city, ideally',
                'national' => 'Anywhere in Morocco for the best school',
                'international' => 'Abroad (Europe, Canada, etc.)',
            ],
        ],
        'financialConstraint' => [
            'question' => 'How important are scholarships and tuition-free studies to you?',
            'options' => [
                'forte' => 'Essential (public schools or merit scholarships)',
                'moyenne' => 'Important but flexible depending on opportunities',
                'aucune' => 'Not a limiting factor for my choice',
            ],
        ],
        'careerPriority' => [
            'question' => 'What is your number one priority in your future career?',
            'options' => [
                'salaire' => 'A good salary, quickly',
                'stabilite' => 'Job stability and security',
                'passion' => 'Doing what I truly love',
                'impact' => 'Having a positive impact on society',
                'equilibre' => 'Work-life balance',
            ],
        ],
        'longTermGoal' => [
            'question' => 'Where do you see yourself in 10 years?',
            'options' => [
                'expert' => 'A recognised expert in my field',
                'direction' => 'Leading a team or a company',
                'entreprendre' => 'Founder of my own venture',
                'contribuer' => 'Contributing to major national projects',
                'flexible' => 'Gaining freedom and flexibility in life',
            ],
        ],
        'mainObstacle' => [
            'question' => 'What is your biggest personal obstacle today?',
            'helper' => 'Be honest: Rafi adapts his support to your answer.',
            'options' => [
                'confiance' => 'Lack of self-confidence',
                'finances' => 'Financial constraints',
                'info' => 'Lack of information and guidance',
                'famille' => 'Family pressure',
                'procrastination' => 'Procrastination / organisation',
                'autre' => 'Something else',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Generated results
    |--------------------------------------------------------------------------
    */

    'result' => [
        'default_first_name' => 'Student',
        'default_stream' => 'the Bac',
        'default_city' => 'your city',
        'default_field' => 'applied sciences',
        'cities' => [
            'casablanca' => 'Casablanca',
            'rabat' => 'Rabat',
            'tanger' => 'Tangier',
            'marrakech' => 'Marrakech',
            'fes' => 'Fez',
            'agadir' => 'Agadir',
            'oujda' => 'Oujda',
        ],
        'free_summary' => ':name, a student in :stream, based in :city. Your profile combines solid science foundations with genuine curiosity for the careers transforming Morocco. Rafi has identified three paths that best match your answers.',
        'premium_summary' => ':name, a student in :stream, based in :city. Your mix of rigour, practical curiosity and desire for impact points to a :field profile. The in-depth analysis of your answers confirms a strong fit with this field, while keeping two credible alternatives depending on your priorities.',
        'strengths' => [
            'logique-math' => 'Logical rigour and ease with numbers',
            'memoire' => 'Strong memorisation skills',
            'redaction' => 'Writing and analytical skills',
            'experimentation' => 'Scientific mindset and a taste for experimenting',
            'organisation' => 'Sense of organisation and a solid work method',
            'creativite' => 'Creativity and imagination',
        ],
        'default_strengths' => [
            'Intellectual curiosity and eagerness to learn',
            'Ability to adapt to new challenges',
            'Motivation to succeed in your higher-education orientation',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    'dashboard' => [
        'next_action' => [
            'start_assessment' => 'Complete the orientation assessment (10 minutes) to unlock your first result.',
            'unlock_premium' => 'Check out your free result and unlock Premium (19 DH) via WhatsApp.',
            'pending' => 'Your Premium request is being verified. You will be activated as soon as the transfer is confirmed.',
            'advanced_assessment' => 'Take the in-depth Premium assessment to refine your action plan.',
            'weekly_challenge' => "Start this week's soft skills challenge and move forward on your path.",
        ],
        'stage' => [
            'discovery' => 'Discovery — basic assessment to complete',
            'first_results' => 'First results obtained',
            'advanced' => 'Advanced orientation — action plan in progress',
        ],
    ],

];
