<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    /** @use HasFactory<\Database\Factories\GradeFactory> */
    use HasFactory;

    public const TYPE_LESSON = 'lesson';
    public const TYPE_HOMEWORK = 'homework';
    public const TYPE_TEST = 'test';
    public const TYPE_EXAM = 'exam';

    public const TYPES = [
        self::TYPE_LESSON,
        self::TYPE_HOMEWORK,
        self::TYPE_TEST,
        self::TYPE_EXAM,
    ];

    protected $fillable = [
        'group_id',
        'student_id',
        'type',
        'title',
        'score',
        'max_score',
        'date',
        'comment',
        'graded_by',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'max_score' => 'decimal:2',
            'date' => 'date',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
