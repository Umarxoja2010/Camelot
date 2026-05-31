<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Group;
use App\Models\User;

trait AuthorizesGroupAccess
{
    /**
     * Foydalanuvchi guruhni boshqara oladimi (o'z guruhi yoki admin).
     */
    protected function canManageGroup(?User $user, Group $group): bool
    {
        if (! $user) {
            return false;
        }

        return $user->isAdmin() || $group->teacher_id === $user->id;
    }

    /**
     * Ruxsat bo'lmasa 403 bilan to'xtatadi.
     */
    protected function authorizeGroup(?User $user, Group $group): void
    {
        abort_unless($this->canManageGroup($user, $group), 403, 'Bu guruhga ruxsatingiz yo\'q.');
    }
}
