<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_performer_returns_true_for_performer_role(): void
    {
        $user = User::factory()->performer()->create();
        $this->assertTrue($user->isPerformer());
        $this->assertFalse($user->isCustomer());
    }

    public function test_is_customer_returns_true_for_customer_role(): void
    {
        $user = User::factory()->customer()->create();
        $this->assertTrue($user->isCustomer());
        $this->assertFalse($user->isPerformer());
    }

    public function test_has_many_services(): void
    {
        $user = User::factory()->performer()->create();
        Service::factory()->count(2)->create(['user_id' => $user->id]);

        $this->assertCount(2, $user->services);
        $this->assertTrue($user->services->first() instanceof Service);
    }

    public function test_has_many_orders_as_client(): void
    {
        $user = User::factory()->customer()->create();
        Order::factory()->count(2)->create(['client_id' => $user->id]);

        $this->assertCount(2, $user->orders);
        $this->assertTrue($user->orders->first() instanceof Order);
    }

    public function test_role_constants(): void
    {
        $this->assertSame('customer', User::ROLE_CUSTOMER);
        $this->assertSame('performer', User::ROLE_PERFORMER);
    }
}
