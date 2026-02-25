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
        $performer1 = User::factory()->performer()->create([
            'name' => 'Alex Photographer',
            'email' => 'performer@example.com',
        ]);
        $performer2 = User::factory()->performer()->create([
            'name' => 'DJ Maria',
            'email' => 'dj@example.com',
        ]);

        Service::factory()->count(3)->create(['user_id' => $performer1->id]);
        Service::factory()->count(2)->create(['user_id' => $performer2->id]);

        $customer = User::factory()->customer()->create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
        ]);

        $services = Service::all();
        Order::factory()->count(2)->create([
            'client_id' => $customer->id,
            'service_id' => $services->random()->id,
        ]);
        Order::factory()->accepted()->create([
            'client_id' => $customer->id,
            'service_id' => $services->first()->id,
        ]);
    }
}
