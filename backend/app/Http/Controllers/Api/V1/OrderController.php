<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->where('client_id', auth()->id())
            ->with(['service', 'client'])
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = Order::create([
            'client_id' => $request->user()->id,
            'service_id' => $request->validated('service_id'),
            'event_date' => $request->validated('event_date'),
            'status' => Order::STATUS_NEW,
        ]);

        $order->load(['service', 'client']);

        return (new OrderResource($order))->response()->setStatusCode(201);
    }

    public function show(Order $order): OrderResource|JsonResponse
    {
        if ($order->client_id !== auth()->id() && $order->service->user_id !== auth()->id()) {
            abort(403, 'Forbidden');
        }

        $order->load(['service', 'client']);

        return new OrderResource($order);
    }
}
