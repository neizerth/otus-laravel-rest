<?php

namespace Tests\Unit\Policies;

use App\Models\Service;
use App\Models\User;
use App\Policies\ServicePolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServicePolicyTest extends TestCase
{
    use RefreshDatabase;

    private ServicePolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new ServicePolicy;
    }

    public function test_owner_can_update_service(): void
    {
        $user = User::factory()->performer()->create();
        $service = Service::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->update($user, $service));
    }

    public function test_other_user_cannot_update_service(): void
    {
        $owner = User::factory()->performer()->create();
        $other = User::factory()->performer()->create();
        $service = Service::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse($this->policy->update($other, $service));
    }

    public function test_owner_can_delete_service(): void
    {
        $user = User::factory()->performer()->create();
        $service = Service::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->delete($user, $service));
    }

    public function test_other_user_cannot_delete_service(): void
    {
        $owner = User::factory()->performer()->create();
        $other = User::factory()->customer()->create();
        $service = Service::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse($this->policy->delete($other, $service));
    }
}
