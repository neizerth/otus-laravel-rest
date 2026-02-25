<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_belongs_to_user(): void
    {
        $user = User::factory()->performer()->create();
        $service = Service::factory()->create(['user_id' => $user->id]);

        $service->load('user');
        $this->assertInstanceOf(User::class, $service->user);
        $this->assertSame($user->id, $service->user->id);
    }

    public function test_has_many_orders(): void
    {
        $service = Service::factory()->create();
        Order::factory()->count(2)->create(['service_id' => $service->id]);

        $this->assertCount(2, $service->orders);
        $this->assertTrue($service->orders->first() instanceof Order);
    }

    public function test_price_is_cast_to_decimal(): void
    {
        $service = Service::factory()->create(['price' => 99.99]);
        $this->assertSame('99.99', (string) $service->price);
    }

    public function test_fillable_attributes(): void
    {
        $service = new Service;
        $this->assertSame(
            ['user_id', 'category', 'name', 'description', 'price'],
            $service->getFillable()
        );
    }
}
