<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'event_date' => $this->event_date?->format('Y-m-d'),
            'service' => new ServiceResource($this->whenLoaded('service')),
            'client' => $this->when(
                $this->relationLoaded('client') && ($request->user()?->id === $this->client_id || $request->user()?->id === $this->service?->user_id),
                fn () => [
                    'id' => $this->client->id,
                    'name' => $this->client->name,
                    'email' => $this->client->email,
                ]
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
