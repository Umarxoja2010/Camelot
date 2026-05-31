<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Bildirishnoma xizmati.
 *
 * Har bir bildirishnoma bazaga yoziladi (ilova ichida ko'rinadi) va
 * sozlamaga qarab Telegram va/yoki SMS orqali ham yuboriladi.
 */
class NotificationService
{
    /**
     * Bitta foydalanuvchiga bildirishnoma yuborish.
     */
    public function send(
        User $user,
        string $title,
        ?string $body = null,
        string $type = 'info',
        array $data = []
    ): Notification {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);

        $this->sendExternal($user, trim($title."\n".(string) $body));

        return $notification;
    }

    /**
     * Bir nechta foydalanuvchiga (kollektsiya yoki massiv).
     *
     * @param  iterable<User>  $users
     */
    public function sendMany(iterable $users, string $title, ?string $body = null, string $type = 'info', array $data = []): int
    {
        $count = 0;
        foreach ($users as $user) {
            $this->send($user, $title, $body, $type, $data);
            $count++;
        }

        return $count;
    }

    /**
     * Tashqi kanallarga (Telegram, SMS) yuborish — xato bo'lsa to'xtatmaydi.
     */
    protected function sendExternal(User $user, string $text): void
    {
        if (config('services.telegram.enabled') && $user->telegram_chat_id) {
            $this->sendTelegram($user->telegram_chat_id, $text);
        }

        if (config('services.eskiz.enabled') && $user->phone) {
            $this->sendSms($user->phone, $text);
        }
    }

    protected function sendTelegram(string $chatId, string $text): void
    {
        $token = config('services.telegram.token');
        if (! $token) {
            return;
        }

        try {
            Http::timeout(8)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Telegram bildirishnoma yuborilmadi: '.$e->getMessage());
        }
    }

    protected function sendSms(string $phone, string $text): void
    {
        try {
            $token = $this->eskizToken();
            if (! $token) {
                return;
            }

            Http::withToken($token)
                ->timeout(8)
                ->asForm()
                ->post(config('services.eskiz.base_url').'/message/sms/send', [
                    'mobile_phone' => preg_replace('/\D/', '', $phone),
                    'message' => $text,
                    'from' => config('services.eskiz.from'),
                ]);
        } catch (\Throwable $e) {
            Log::warning('SMS yuborilmadi: '.$e->getMessage());
        }
    }

    /**
     * Eskiz auth tokenini olish (kelishilgan muddatga keshlanadi).
     */
    protected function eskizToken(): ?string
    {
        return Cache::remember('eskiz_token', now()->addDays(20), function () {
            $response = Http::asForm()->timeout(8)->post(
                config('services.eskiz.base_url').'/auth/login',
                [
                    'email' => config('services.eskiz.email'),
                    'password' => config('services.eskiz.password'),
                ]
            );

            return $response->json('data.token');
        });
    }
}
