<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    /** @use HasFactory<\Database\Factories\GroupFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'teacher_id',
        'name',
        'schedule',
        'room',
        'starts_on',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'schedule' => 'array',
            'starts_on' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /** Guruhdagi o'quvchilar */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments', 'group_id', 'student_id')
            ->withPivot('status', 'enrolled_at')
            ->withTimestamps();
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
