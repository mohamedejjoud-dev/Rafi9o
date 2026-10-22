<?php

namespace Database\Seeders;

use App\Models\CareerPath;
use Illuminate\Database\Seeder;

class CareerPathSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $careers = [
            [
                'title' => 'Full Stack Software Engineer',
                'slug' => 'full-stack-software-engineer',
                'summary' => 'Design, build, and maintain end-to-end web applications combining responsive client interfaces and robust backend services.',
                'description' => 'Full Stack Software Engineers bridge the gap between user experience and server-side infrastructure. They build RESTful and GraphQL APIs, manage databases, integrate third-party services, and create dynamic front-end components.',
                'industry' => 'Software & Technology',
                'average_salary_range' => '$75,000 - $125,000',
                'growth_outlook' => '+25% (Much faster than average)',
                'required_skills' => ['JavaScript/TypeScript', 'PHP/Laravel', 'React or Vue', 'MySQL/PostgreSQL', 'REST APIs', 'Git', 'Docker'],
                'recommended_education' => "Bachelor's in Computer Science, Software Engineering, or equivalent practical portfolio",
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'title' => 'AI & Machine Learning Engineer',
                'slug' => 'ai-machine-learning-engineer',
                'summary' => 'Develop predictive models, fine-tune neural architectures, and integrate generative AI pipelines into modern production products.',
                'description' => 'AI/ML Engineers focus on transforming data into intelligent systems. They train and fine-tune models using PyTorch/TensorFlow, build retrieval-augmented generation (RAG) workflows, deploy endpoints at scale, and ensure responsible AI safety.',
                'industry' => 'Artificial Intelligence',
                'average_salary_range' => '$95,000 - $160,000',
                'growth_outlook' => '+36% (Extremely high demand)',
                'required_skills' => ['Python', 'PyTorch/TensorFlow', 'Scikit-learn', 'Vector Databases', 'Prompt Engineering & LLMs', 'Data Pipelines', 'Docker'],
                'recommended_education' => "Master's or Bachelor's in CS, AI, Applied Mathematics, or Data Science",
                'difficulty_level' => 'advanced',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'title' => 'Cloud & DevOps Engineer',
                'slug' => 'cloud-devops-engineer',
                'summary' => 'Automate infrastructure provisioning, optimize CI/CD pipelines, and guarantee high availability, reliability, and security for cloud workloads.',
                'description' => 'Cloud & DevOps Engineers unite development and IT operations. They use Infrastructure as Code (IaC) tools like Terraform, orchestrate microservices with Kubernetes, manage cloud networks on AWS/GCP/Azure, and monitor distributed systems.',
                'industry' => 'Cloud Computing & Infrastructure',
                'average_salary_range' => '$85,000 - $140,000',
                'growth_outlook' => '+28% (High demand)',
                'required_skills' => ['Linux Administration', 'Docker & Kubernetes', 'AWS / Azure / GCP', 'Terraform', 'CI/CD Pipelines', 'Bash / Python', 'Prometheus & Grafana'],
                'recommended_education' => "Bachelor's in Computer Networks, Systems Engineering, or cloud industry certifications (AWS/CKA)",
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'order' => 3,
            ],
            [
                'title' => 'UI/UX Product Designer',
                'slug' => 'ui-ux-product-designer',
                'summary' => 'Craft intuitive, accessible user journeys and high-fidelity design systems for consumer and enterprise digital experiences.',
                'description' => 'Product Designers conduct user research, create user personas and journey maps, build clickable interactive prototypes in Figma, and collaborate closely with developers to bring pixel-perfect, accessible products to life.',
                'industry' => 'Design & Creative',
                'average_salary_range' => '$65,000 - $110,000',
                'growth_outlook' => '+16% (Faster than average)',
                'required_skills' => ['Figma', 'Design Systems', 'User Research', 'Wireframing & Prototyping', 'Usability Testing', 'HTML/CSS Basics', 'Information Architecture'],
                'recommended_education' => 'Degree in Graphic Design, Human-Computer Interaction, or demonstrated design portfolio',
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'order' => 4,
            ],
            [
                'title' => 'Cybersecurity Analyst',
                'slug' => 'cybersecurity-analyst',
                'summary' => 'Protect digital assets, monitor security event logs, evaluate vulnerabilities, and enforce regulatory compliance and threat response.',
                'description' => 'Cybersecurity Analysts safeguard networks and data from breaches. They conduct vulnerability scans, analyze SIEM telemetry, formulate incident response plans, and test web applications for OWASP Top 10 exploits.',
                'industry' => 'Information Security',
                'average_salary_range' => '$80,000 - $130,000',
                'growth_outlook' => '+32% (Critical global demand)',
                'required_skills' => ['Network Security', 'Linux', 'Vulnerability Assessment', 'SIEM & SOC Tools', 'OWASP Standards', 'Python / Bash Scripting', 'Incident Response'],
                'recommended_education' => "Bachelor's in Cybersecurity, Computer Networks, or certifications (CompTIA Security+, CEH, CISSP)",
                'difficulty_level' => 'advanced',
                'is_active' => true,
                'order' => 5,
            ],
            [
                'title' => 'Data Analyst & Business Intelligence Specialist',
                'slug' => 'data-analyst-bi-specialist',
                'summary' => 'Extract actionable business insights from complex data sets using statistical methods, SQL, and interactive dashboards.',
                'description' => 'Data Analysts empower leadership to make informed decisions. They query relational databases, perform exploratory data analysis, build executive dashboards in Power BI/Tableau, and identify strategic growth opportunities.',
                'industry' => 'Data & Business Intelligence',
                'average_salary_range' => '$65,000 - $105,000',
                'growth_outlook' => '+23% (Much faster than average)',
                'required_skills' => ['Advanced SQL', 'Tableau / Power BI', 'Python (Pandas, NumPy)', 'Data Modeling', 'Statistical Analysis', 'Excel / Sheets', 'Business Communication'],
                'recommended_education' => "Bachelor's in Statistics, Economics, Information Systems, or Data Analytics",
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'order' => 6,
            ],
        ];

        foreach ($careers as $career) {
            CareerPath::updateOrCreate(
                ['slug' => $career['slug']],
                $career
            );
        }
    }
}
