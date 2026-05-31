<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    /** @use HasFactory<\Database\Factories\AnnouncementFactory> */
    use HasFactory, HasTranslations;

    public const AUDIENCE_ALL = 'all';
    public const AUDIENCE_TEACHERS = 'teachers';
    public const AUDIENCE_STUDENTS = 'students';
    public const AUDIENCE_GROUP = 'group';

    public const AUDIENCES = [
        self::AUDIENCE_ALL,
        self::AUDIENCE_TEACHERS,
        self::AUDIENCE_STUDENTS,
        self::AUDIENCE_GROUP,
    ];

    public array $translatable = ['title', 'body'];

    protected $fillable = [
        'title',
        'body',
        'audience',
        'group_id',
        'published_by',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'body' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
