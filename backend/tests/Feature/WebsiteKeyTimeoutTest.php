<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use Tests\WebsiteTestCase;

class WebsiteKeyTimeoutTest extends WebsiteTestCase
{
    public function test_a_slow_valid_cms_key_response_is_accepted(): void
    {
        $socket = stream_socket_server('tcp://127.0.0.1:0');
        $address = stream_socket_get_name($socket, false);
        fclose($socket);
        $fixture = tempnam(sys_get_temp_dir(), 'site-key-fixture-');
        $log = tempnam(sys_get_temp_dir(), 'site-key-server-');
        file_put_contents($fixture, json_encode($this->grant));
        $process = proc_open([PHP_BINARY, '-S', $address, __DIR__.'/../Fixtures/slow-cms.php'],
            [['pipe', 'r'], ['file', $log, 'a'], ['file', $log, 'a']], $pipes, null,
            [...getenv(), 'TEST_WEBSITE_GRANT_FILE' => $fixture]);
        try {
            $this->assertIsResource($process);
            $port = (int) substr($address, strrpos($address, ':') + 1);
            $ready = false;
            for ($attempt = 0; $attempt < 40; $attempt++) {
                $connection = @fsockopen('127.0.0.1', $port, $code, $message, 0.05);
                if ($connection) {
                    fclose($connection);
                    $ready = true;
                    break;
                }
                usleep(50_000);
            }
            $this->assertTrue($ready, 'Fixture server did not start.');
            Http::swap(new Factory);
            config(['website.cms_url' => 'http://'.$address]);
            $this->getJson('/api/articles?locale=en')->assertOk()->assertJsonPath('data', []);
        } finally {
            if (is_resource($process)) {
                proc_terminate($process);
                fclose($pipes[0]);
                proc_close($process);
            }
            unlink($fixture);
            unlink($log);
        }
    }
}
