<?php

namespace App\Models;

use App\Models\Base\MongoModel as Model;
use App\Models\Concerns\Trashable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use BelongsToTenant;
    use Trashable;

    protected $table = 'media';

    protected $guarded = [];

    protected $appends = ['url', 'thumbnail_url'];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::forceDeleted(function (self $media): void {
            if ($media->path) {
                Storage::disk($media->disk)->delete($media->path);
            }
        });
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getUrlAttribute(): ?string
    {
        if (! $this->path) {
            return null;
        }

        return Storage::disk($this->disk)->url($this->path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->getUrlAttribute();
    }
}
