<?php
namespace Tests;
abstract class TestCase extends \Illuminate\Foundation\Testing\TestCase
{
    protected function setUp(): void { parent::setUp(); \Illuminate\Support\Facades\Cache::flush(); \Illuminate\Support\Facades\Http::preventStrayRequests(); }
}
