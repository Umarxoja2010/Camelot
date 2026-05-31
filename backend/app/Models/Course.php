<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory, HasTranslations;

    public const TYPE_LANGUAGE = 'language';
    public const TYPE_SCHOOL = 'school';

    public array $translatable = ['name', 'description'];

    protected $fillable = [
        'name',
        'description',
        'type',
        'level',
        'monthly_fee',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'monthly_fee' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
