<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->json('name');                 // ko'p tilli: {"uz":..,"ru":..,"en":..}
            $table->json('description')->nullable();
            $table->string('type')->default('language'); // language | school
            $table->string('level')->nullable();  // A1, B2, IELTS yoki "5-sinf"
            $table->decimal('monthly_fee', 12, 2)->default(0); // oylik to'lov
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
