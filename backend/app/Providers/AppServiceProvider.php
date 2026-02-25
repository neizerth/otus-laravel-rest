<?php

namespace App\Providers;

use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Dedoc\Scramble\Scramble;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Scramble::afterOpenApiGenerated(function ($openApi) {
            $openApi->secure(
                SecurityScheme::http('bearer', 'JWT')
                    ->as('sanctum')
                    ->setDescription('Laravel Sanctum token. Получить: POST /api/v1/login или /api/v1/register.')
            );
        });
    }
}
