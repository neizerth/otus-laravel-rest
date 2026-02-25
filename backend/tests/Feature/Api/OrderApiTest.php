<?php

namespace Tests\Feature\Api;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_order_requires_authentication(): void
    {
        $service = Service::factory()->create();
        $response = $this->postJson('/api/v1/orders', [
            'service_id' => $service->id,
            'event_date' => now()->addWeek()->format('Y-m-d'),
        ]);

        $response->assertStatus(401);
    }

    public function test_customer_can_create_order(): void
    {
        $customer = User::factory()->customer()->create();
        $service = Service::factory()->create();
        $eventDate = now()->addWeeks(2)->format('Y-m-d');

        $response = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/orders', [
                'service_id' => $service->id,
                'event_date' => $eventDate,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.event_date', $eventDate)
            ->assertJsonPath('data.service.id', $service->id);

        $this->assertDatabaseHas('orders', [
            'client_id' => $customer->id,
            'service_id' => $service->id,
            'status' => 'new',
        ]);
    }

    public function test_create_order_validates_event_date(): void
    {
        $customer = User::factory()->customer()->create();
        $service = Service::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/orders', [
                'service_id' => $service->id,
                'event_date' => now()->subDay()->format('Y-m-d'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['event_date']);
    }
}
