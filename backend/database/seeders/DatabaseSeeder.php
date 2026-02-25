<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Исполнители
        $photographer = User::factory()->performer()->create([
            'name' => 'Алексей Фото',
            'email' => 'performer@example.com',
        ]);
        $dj = User::factory()->performer()->create([
            'name' => 'Мария DJ',
            'email' => 'dj@example.com',
        ]);
        $host = User::factory()->performer()->create([
            'name' => 'Дмитрий Ведущий',
            'email' => 'host@example.com',
        ]);

        // Услуги фотографа
        $photoWedding = Service::factory()->create([
            'user_id' => $photographer->id,
            'category' => 'photographer',
            'name' => 'Свадебная съёмка',
            'description' => 'Полный день съёмки свадьбы, обработка 300+ фото, печать альбома.',
            'price' => 45000.00,
        ]);
        $photoCorporate = Service::factory()->create([
            'user_id' => $photographer->id,
            'category' => 'photographer',
            'name' => 'Корпоративная съёмка',
            'description' => 'Фотоотчёт с мероприятия, портреты, групповые кадры.',
            'price' => 25000.00,
        ]);
        $photoPortrait = Service::factory()->create([
            'user_id' => $photographer->id,
            'category' => 'photographer',
            'name' => 'Портретная съёмка',
            'description' => 'Студийная или выездная портретная сессия, 50 обработанных фото.',
            'price' => 12000.00,
        ]);

        // Услуги DJ
        $djWedding = Service::factory()->create([
            'user_id' => $dj->id,
            'category' => 'dj',
            'name' => 'DJ на свадьбу',
            'description' => 'Музыкальное сопровождение банкета, подбор плейлиста, световое оборудование.',
            'price' => 35000.00,
        ]);
        $djParty = Service::factory()->create([
            'user_id' => $dj->id,
            'category' => 'dj',
            'name' => 'DJ на вечеринку',
            'description' => 'Клубная или домашняя вечеринка до 6 часов, своя аппаратура.',
            'price' => 20000.00,
        ]);

        // Услуги ведущего
        $hostWedding = Service::factory()->create([
            'user_id' => $host->id,
            'category' => 'host',
            'name' => 'Ведущий свадьбы',
            'description' => 'Ведение банкета, сценарий, конкурсы, тамада на 6 часов.',
            'price' => 40000.00,
        ]);

        // Заказчики
        $customer = User::factory()->customer()->create([
            'name' => 'Тестовый Клиент',
            'email' => 'customer@example.com',
        ]);
        $bride = User::factory()->customer()->create([
            'name' => 'Анна Петрова',
            'email' => 'anna@example.com',
        ]);

        // Заказы: у клиента — несколько заказов на разные услуги
        Order::factory()->create([
            'client_id' => $customer->id,
            'service_id' => $photoCorporate->id,
            'event_date' => now()->addDays(14),
            'status' => Order::STATUS_NEW,
        ]);
        Order::factory()->accepted()->create([
            'client_id' => $customer->id,
            'service_id' => $djParty->id,
            'event_date' => now()->addDays(21),
            'status' => Order::STATUS_ACCEPTED,
        ]);
        Order::factory()->create([
            'client_id' => $customer->id,
            'service_id' => $photoPortrait->id,
            'event_date' => now()->addMonth(),
            'status' => Order::STATUS_NEW,
        ]);

        // Свадебный пакет у невесты: фото + DJ + ведущий
        Order::factory()->accepted()->create([
            'client_id' => $bride->id,
            'service_id' => $photoWedding->id,
            'event_date' => now()->addMonths(2),
            'status' => Order::STATUS_ACCEPTED,
        ]);
        Order::factory()->accepted()->create([
            'client_id' => $bride->id,
            'service_id' => $djWedding->id,
            'event_date' => now()->addMonths(2),
            'status' => Order::STATUS_ACCEPTED,
        ]);
        Order::factory()->accepted()->create([
            'client_id' => $bride->id,
            'service_id' => $hostWedding->id,
            'event_date' => now()->addMonths(2),
            'status' => Order::STATUS_ACCEPTED,
        ]);
        Order::factory()->create([
            'client_id' => $bride->id,
            'service_id' => $photoPortrait->id,
            'event_date' => now()->addDays(10),
            'status' => Order::STATUS_COMPLETED,
        ]);
    }
}
