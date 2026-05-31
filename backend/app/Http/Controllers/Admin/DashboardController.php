<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Group;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $confirmedRevenue = Payment::where('status', Payment::STATUS_CONFIRMED)->sum('amount');

        $recentPayments = Payment::with('student')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Payment $p) => [
                'id' => $p->id,
                'student_name' => $p->student?->name,
                'amount' => (float) $p->amount,
                'month' => $p->month,
                'status' => $p->status,
                'created_at' => $p->created_at,
            ]);

        return response()->json([
            'data' => [
                'totals' => [
                    'students' => User::role(User::ROLE_STUDENT)->count(),
                    'teachers' => User::role(User::ROLE_TEACHER)->count(),
                    'parents' => User::role(User::ROLE_PARENT)->count(),
                    'groups' => Group::count(),
                    'courses' => Course::count(),
                    'pending_payments' => Payment::where('status', Payment::STATUS_PENDING)->count(),
                    'confirmed_revenue' => (float) $confirmedRevenue,
                ],
                'recent_payments' => $recentPayments,
            ],
        ]);
    }
}
