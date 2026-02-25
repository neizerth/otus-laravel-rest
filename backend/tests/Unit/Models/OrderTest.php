<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_constants(): void
    {
        $this->assertSame('new', Order::STATUS_NEW);
        $this->assertSame('accepted', Order::STATUS_ACCEPTED);
        $this->assertSame('completed', Order::STATUS_COMPLETED);
    }

    public function test_belongs_to_client(): void
    {
        $client = User::factory()->customer()->create();
        $order = Order::factory()->create(['client_id' => $client->id]);

        $order->load('client');
        $this->assertInstanceOf(User::class, $order->client);
        $this->assertSame($client->id, $order->client->id);
    }

    public function test_belongs_to_service(): void
    {
        $service = Service::factory()->create();
        $order = Order::factory()->create(['service_id' => $service->id]);

        $order->load('service');
        $this->assertInstanceOf(Service::class, $order->service);
        $this->assertSame($service->id, $order->service->id);
    }

    public function test_event_date_is_cast_to_date(): void
    {
        $order = Order::factory()->create([
            'event_date' => '2025-06-15',
        ]);

        $this->assertInstanceOf(\Carbon\CarbonInterface::class, $order->event_date);
        $this->assertSame('2025-06-15', $order->event_date->format('Y-m-d'));
    }

    public function test_fillable_attributes(): void
    {
        $order = new Order;
        $this->assertSame(
            ['client_id', 'service_id', 'event_date', 'status'],
            $order->getFillable()
        );
    }
}
