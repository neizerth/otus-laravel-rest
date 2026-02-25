<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    public function definition(): array
    {
        $categories = ['photographer', 'dj', 'catering', 'host', 'decoration'];
        return [
            'user_id' => User::factory()->performer(),
            'category' => fake()->randomElement($categories),
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 50, 5000),
        ];
    }
}
