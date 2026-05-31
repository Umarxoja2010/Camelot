<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->json('title');            // ko'p tilli
            $table->json('body');             // ko'p tilli
            // all | teachers | students | parents | group
            $table->string('audience')->default('all');
            $table->foreignId('group_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index('audience');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
