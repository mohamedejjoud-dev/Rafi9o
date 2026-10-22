<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Demo Student
        $student = User::updateOrCreate(
            ['email' => 'student@rafi9i.com'],
            [
                'name' => 'Amine Bennani',
                'password' => Hash::make('password123'),
                'role' => 'student',
                'subscription_status' => 'premium',
                'premium_activated_at' => now(),
                'email_verified_at' => now(),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $student->id],
            [
                'phone' => '+212600112233',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                'bio' => 'Aspiring software developer passionate about building scalable web applications and learning modern AI tools.',
                'education_level' => 'undergraduate',
                'field_of_study' => 'Computer Science & Software Engineering',
                'institution' => 'National School of Applied Sciences',
                'graduation_year' => 2027,
                'target_role' => 'Full Stack Developer',
                'skills' => ['JavaScript', 'PHP', 'HTML/CSS', 'Python', 'Git'],
                'interests' => ['Web Development', 'Artificial Intelligence', 'Open Source', 'UI/UX Design'],
                'location' => 'Casablanca, Morocco',
                'preferred_language' => 'en',
            ]
        );

        // 2. Demo Career Counselor / Mentor
        $counselor = User::updateOrCreate(
            ['email' => 'mentor@rafi9i.com'],
            [
                'name' => 'Dr. Sara El Idrissi',
                'password' => Hash::make('password123'),
                'role' => 'counselor',
                'email_verified_at' => now(),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $counselor->id],
            [
                'phone' => '+212611223344',
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                'bio' => 'Senior Tech Career Counselor with over 10 years guiding engineering students into top international tech careers.',
                'education_level' => 'graduate',
                'field_of_study' => 'Information Systems & Career Guidance',
                'institution' => 'University of Technology',
                'graduation_year' => 2014,
                'target_role' => 'Career Guidance Director',
                'skills' => ['Career Coaching', 'Talent Strategy', 'Tech Recruitment', 'Curriculum Design'],
                'interests' => ['EdTech', 'AI in Education', 'Mentorship'],
                'location' => 'Rabat, Morocco',
                'preferred_language' => 'en',
            ]
        );

        // 3. Demo Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@rafi9i.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $admin->id],
            [
                'phone' => '+212622334455',
                'bio' => 'Rafi9i platform administrator.',
                'education_level' => 'graduate',
                'target_role' => 'Platform Administrator',
                'location' => 'Casablanca, Morocco',
                'preferred_language' => 'en',
            ]
        );

        // 4. Frontend Demo Account (Yassine El Amrani)
        $yassine = User::updateOrCreate(
            ['email' => 'yassine@demo.ma'],
            [
                'name' => 'Yassine El Amrani',
                'password' => Hash::make('demo1234'),
                'role' => 'student',
                'subscription_status' => 'free',
                'email_verified_at' => now(),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $yassine->id],
            [
                'phone' => '+212600000000',
                'bio' => 'Lycéen marocain passionné par les sciences et le digital.',
                'education_level' => 'high_school',
                'field_of_study' => 'sciences-experimentales',
                'institution' => 'Lycée Ibn Sina',
                'graduation_year' => 2025,
                'target_role' => 'Ingénieur Logiciel',
                'skills' => ['Mathématiques', 'Physique', 'Python', 'Anglais'],
                'interests' => ['Intelligence Artificielle', 'Robotique'],
                'location' => 'Casablanca',
                'preferred_language' => 'fr',
            ]
        );
    }
}
