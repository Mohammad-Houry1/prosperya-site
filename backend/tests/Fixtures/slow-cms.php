<?php
// A real HTTP boundary: valid CMS responses may arrive after a cold start.
usleep(4_000_000);
header('Content-Type: application/json');
echo file_get_contents(getenv('TEST_WEBSITE_GRANT_FILE'));
