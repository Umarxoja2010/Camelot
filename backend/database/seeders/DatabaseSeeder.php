<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Grade;
use App\Models\Group;
use App\Models\Payment;
use App\Models\PaymentCard;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = $this->user('admin@camelot.uz', 'Camelot Admin', User::ROLE_ADMIN, '+998901112233');

        $teacher1 = $this->user('teacher1@camelot.uz', 'John Smith', User::ROLE_TEACHER, '+998901112201');
        $teacher2 = $this->user('teacher2@camelot.uz', 'Sarah Brown', User::ROLE_TEACHER, '+998901112202');

        // O'quvchilar
        $students = collect(range(1, 6))->map(fn ($i) => $this->user(
            "student{$i}@camelot.uz",
            "O'quvchi {$i}",
            User::ROLE_STUDENT,
            '+9989011130'.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
        ));

        // Ota-onalar
        $parent1 = $this->user('parent1@camelot.uz', 'Ota-ona 1', User::ROLE_PARENT, '+998901114401');
        $parent2 = $this->user('parent2@camelot.uz', 'Ota-ona 2', User::ROLE_PARENT, '+998901114402');
        $parent1->children()->sync([$students[0]->id, $students[1]->id]);
        $parent2->children()->sync([$students[2]->id]);

        // Faqat bir marta katalog yaratamiz
        if (Course::count() === 0) {
            $this->seedCatalog($admin, $teacher1, $teacher2, $students);
        }
    }

    private function user(string $email, string $name, string $role, string $phone): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'role' => $role,
                'phone' => $phone,
                'locale' => 'uz',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ]
        );
    }

    private function seedCatalog(User $admin, User $teacher1, User $teacher2, $students): void
    {
        // Kurslar
        $beginner = Course::create([
            'name' => ['uz' => 'Ingliz tili — Boshlang\'ich', 'ru' => 'Английский — Начальный', 'en' => 'English — Beginner'],
            'description' => ['uz' => 'Noldan boshlovchilar uchun', 'ru' => 'Для начинающих с нуля', 'en' => 'For absolute beginners'],
            'type' => Course::TYPE_LANGUAGE,
            'level' => 'A1',
            'monthly_fee' => 300000,
        ]);

        $ielts = Course::create([
            'name' => ['uz' => 'IELTS tayyorlov', 'ru' => 'Подготовка к IELTS', 'en' => 'IELTS Preparation'],
            'description' => ['uz' => 'IELTS imtihoniga tayyorgarlik', 'ru' => 'Подготовка к экзамену IELTS', 'en' => 'IELTS exam preparation'],
            'type' => Course::TYPE_LANGUAGE,
            'level' => 'B2+',
            'monthly_fee' => 500000,
        ]);

        $math = Course::create([
            'name' => ['uz' => 'Matematika 5-sinf', 'ru' => 'Математика 5 класс', 'en' => 'Math Grade 5'],
            'type' => Course::TYPE_SCHOOL,
            'level' => '5-sinf',
            'monthly_fee' => 250000,
        ]);

        // Guruhlar
        $g1 = Group::create([
            'course_id' => $beginner->id,
            'teacher_id' => $teacher1->id,
            'name' => 'Beginner-A',
            'schedule' => [
                ['day' => 'mon', 'start' => '18:00', 'end' => '19:30'],
                ['day' => 'wed', 'start' => '18:00', 'end' => '19:30'],
            ],
            'room' => '101',
            'starts_on' => Carbon::today()->subMonth(),
        ]);

        $g2 = Group::create([
            'course_id' => $ielts->id,
            'teacher_id' => $teacher2->id,
            'name' => 'IELTS-Evening',
            'schedule' => [
                ['day' => 'tue', 'start' => '17:00', 'end' => '19:00'],
                ['day' => 'thu', 'start' => '17:00', 'end' => '19:00'],
            ],
            'room' => '202',
            'starts_on' => Carbon::today()->subWeeks(2),
        ]);

        $g3 = Group::create([
            'course_id' => $math->id,
            'teacher_id' => $teacher1->id,
            'name' => 'Math-5A',
            'schedule' => [['day' => 'sat', 'start' => '10:00', 'end' => '11:30']],
            'room' => '103',
        ]);

        // O'quvchilarni yozish
        $enrollPivot = fn () => ['status' => 'active', 'enrolled_at' => Carbon::today()];
        $g1->students()->sync([
            $students[0]->id => $enrollPivot(),
            $students[1]->id => $enrollPivot(),
            $students[2]->id => $enrollPivot(),
        ]);
        $g2->students()->sync([
            $students[3]->id => $enrollPivot(),
            $students[4]->id => $enrollPivot(),
        ]);
        $g3->students()->sync([
            $students[0]->id => $enrollPivot(),
            $students[5]->id => $enrollPivot(),
        ]);

        // To'lov kartalari
        PaymentCard::create([
            'bank_name' => 'Kapitalbank (Uzcard)',
            'card_number' => '8600 1234 5678 9012',
            'holder_name' => 'CAMELOT LLC',
            'is_active' => true,
        ]);
        PaymentCard::create([
            'bank_name' => 'Ipak Yuli (Humo)',
            'card_number' => '9860 1111 2222 3333',
            'holder_name' => 'CAMELOT LLC',
            'is_active' => true,
        ]);

        $month = Carbon::today()->format('Y-m');

        // To'lovlar
        Payment::create([
            'student_id' => $students[0]->id,
            'group_id' => $g1->id,
            'amount' => 300000,
            'month' => $month,
            'status' => Payment::STATUS_CONFIRMED,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);
        Payment::create([
            'student_id' => $students[1]->id,
            'group_id' => $g1->id,
            'amount' => 300000,
            'month' => $month,
            'status' => Payment::STATUS_PENDING,
        ]);

        // Davomat (G1 bugungi)
        foreach ([$students[0], $students[1], $students[2]] as $i => $student) {
            Attendance::create([
                'group_id' => $g1->id,
                'student_id' => $student->id,
                'date' => Carbon::today(),
                'status' => $i === 2 ? Attendance::STATUS_ABSENT : Attendance::STATUS_PRESENT,
                'marked_by' => $teacher1->id,
            ]);
        }

        // Baholar
        Grade::create([
            'group_id' => $g1->id,
            'student_id' => $students[0]->id,
            'type' => Grade::TYPE_TEST,
            'title' => 'Unit 1 Test',
            'score' => 85,
            'max_score' => 100,
            'date' => Carbon::today()->subDays(3),
            'graded_by' => $teacher1->id,
        ]);
        Grade::create([
            'group_id' => $g1->id,
            'student_id' => $students[1]->id,
            'type' => Grade::TYPE_TEST,
            'title' => 'Unit 1 Test',
            'score' => 72,
            'max_score' => 100,
            'date' => Carbon::today()->subDays(3),
            'graded_by' => $teacher1->id,
        ]);

        // E'lon
        Announcement::create([
            'title' => ['uz' => 'Xush kelibsiz!', 'ru' => 'Добро пожаловать!', 'en' => 'Welcome!'],
            'body' => [
                'uz' => 'Camelot o\'quv markazi platformasiga xush kelibsiz.',
                'ru' => 'Добро пожаловать на платформу учебного центра Camelot.',
                'en' => 'Welcome to the Camelot learning center platform.',
            ],
            'audience' => Announcement::AUDIENCE_ALL,
            'published_by' => $admin->id,
            'is_published' => true,
        ]);
    }
}
