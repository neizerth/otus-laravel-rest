<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => User::factory()->customer(),
            'service_id' => Service::factory(),
            'event_date' => fake()->dateTimeBetween('+1 week', '+3 months'),
            'status' => Order::STATUS_NEW,
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => ['status' => Order::STATUS_ACCEPTED]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => ['status' => Order::STATUS_COMPLETED]);
    }
}
