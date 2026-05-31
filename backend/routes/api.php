<?php

use App\Http\Controllers\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\GroupController as AdminGroupController;
use App\Http\Controllers\Admin\PaymentCardController as AdminPaymentCardController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Student\LearningController;
use App\Http\Controllers\Student\PaymentController as StudentPaymentController;
use App\Http\Controllers\Teacher\AttendanceController;
use App\Http\Controllers\Teacher\GradeController;
use App\Http\Controllers\Teacher\GroupController as TeacherGroupController;
use App\Http\Controllers\Teacher\HomeworkController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Ochiq endpointlar
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Autentifikatsiya talab qiladigan (barcha rollar)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // E'lonlar tasmasi (rolega mos)
    Route::get('/announcements', [AnnouncementController::class, 'feed']);

    // Bildirishnomalar
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    /*
    |----------------------------------------------------------------------
    | ADMIN
    |----------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::apiResource('users', AdminUserController::class);
        Route::apiResource('courses', AdminCourseController::class);

        Route::apiResource('groups', AdminGroupController::class);
        Route::post('/groups/{group}/enroll', [AdminGroupController::class, 'enroll']);
        Route::delete('/groups/{group}/students/{studentId}', [AdminGroupController::class, 'removeStudent']);

        // To'lovlar va to'lov kartalari (bitta bo'lim)
        Route::get('/payment-cards', [AdminPaymentCardController::class, 'index']);
        Route::post('/payment-cards', [AdminPaymentCardController::class, 'store']);
        Route::put('/payment-cards/{paymentCard}', [AdminPaymentCardController::class, 'update']);
        Route::delete('/payment-cards/{paymentCard}', [AdminPaymentCardController::class, 'destroy']);

        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::get('/payments/{payment}', [AdminPaymentController::class, 'show']);
        Route::patch('/payments/{payment}/confirm', [AdminPaymentController::class, 'confirm']);
        Route::patch('/payments/{payment}/reject', [AdminPaymentController::class, 'reject']);

        // E'lonlar (boshqaruv)
        Route::apiResource('announcements', AdminAnnouncementController::class);
    });

    /*
    |----------------------------------------------------------------------
    | O'QITUVCHI (admin ham kira oladi)
    |----------------------------------------------------------------------
    */
    Route::prefix('teacher')->middleware('role:teacher,admin')->group(function () {
        Route::get('/groups', [TeacherGroupController::class, 'index']);
        Route::get('/groups/{group}', [TeacherGroupController::class, 'show']);

        Route::get('/groups/{group}/attendance', [AttendanceController::class, 'index']);
        Route::post('/groups/{group}/attendance', [AttendanceController::class, 'store']);

        Route::get('/groups/{group}/grades', [GradeController::class, 'index']);
        Route::post('/groups/{group}/grades', [GradeController::class, 'store']);
        Route::delete('/grades/{grade}', [GradeController::class, 'destroy']);

        // Uy vazifalari
        Route::get('/groups/{group}/homework', [HomeworkController::class, 'index']);
        Route::post('/groups/{group}/homework', [HomeworkController::class, 'store']);
        Route::delete('/homework/{homework}', [HomeworkController::class, 'destroy']);
    });

    /*
    |----------------------------------------------------------------------
    | O'QUVCHI
    |----------------------------------------------------------------------
    */
    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::get('/groups', [LearningController::class, 'groups']);
        Route::get('/attendance', [LearningController::class, 'attendance']);
        Route::get('/homework', [LearningController::class, 'homework']);

        Route::get('/payment-cards', [StudentPaymentController::class, 'cards']);
        Route::get('/payments', [StudentPaymentController::class, 'index']);
        Route::post('/payments', [StudentPaymentController::class, 'store']);
    });
});
