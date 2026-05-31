<?php

namespace App\Models\Concerns;

/**
 * Ko'p tilli (JSON) atributlar bilan ishlash uchun trait.
 *
 * Modelda $translatable massivini e'lon qiling, masalan:
 *   public array $translatable = ['name', 'description'];
 *
 * Bu ustunlar bazada JSON sifatida saqlanadi:
 *   {"uz": "Divan", "ru": "Диван", "en": "Sofa"}
 *
 * translate('name') joriy locale qiymatini (fallback bilan) qaytaradi.
 */
trait HasTranslations
{
    /**
     * Berilgan maydonning ma'lum (yoki joriy) tildagi qiymatini qaytaradi.
     */
    public function translate(string $field, ?string $locale = null): ?string
    {
        $locale = $locale ?: app()->getLocale();
        $values = $this->getTranslations($field);

        if (isset($values[$locale]) && $values[$locale] !== '') {
            return $values[$locale];
        }

        // Fallback til
        $fallback = config('app.fallback_locale');
        if (isset($values[$fallback]) && $values[$fallback] !== '') {
            return $values[$fallback];
        }

        // Mavjud birinchi qiymat
        foreach ($values as $value) {
            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return null;
    }

    /**
     * Maydonning barcha tarjimalarini massiv ko'rinishida qaytaradi.
     *
     * @return array<string, string>
     */
    public function getTranslations(string $field): array
    {
        $raw = $this->getAttribute($field);

        if (is_array($raw)) {
            return $raw;
        }

        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);

            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    /**
     * Bitta til uchun tarjimani o'rnatadi.
     */
    public function setTranslation(string $field, string $locale, ?string $value): static
    {
        $translations = $this->getTranslations($field);
        $translations[$locale] = $value;
        $this->setAttribute($field, $translations);

        return $this;
    }

    /**
     * Tarjima qilinadigan maydonlar ro'yxati.
     *
     * @return array<int, string>
     */
    public function getTranslatableAttributes(): array
    {
        return $this->translatable ?? [];
    }
}
