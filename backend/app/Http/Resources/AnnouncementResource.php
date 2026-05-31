<?php

namespace App\Http\Resources;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Announcement
 */
class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->translate('title'),
            'body' => $this->translate('body'),
            'title_translations' => $this->getTranslations('title'),
            'body_translations' => $this->getTranslations('body'),
            'audience' => $this->audience,
            'group_id' => $this->group_id,
            'group' => new GroupResource($this->whenLoaded('group')),
            'publisher' => new UserResource($this->whenLoaded('publisher')),
            'is_published' => (bool) $this->is_published,
            'created_at' => $this->created_at,
        ];
    }
}
