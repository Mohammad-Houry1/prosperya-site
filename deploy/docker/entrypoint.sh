#!/bin/sh
set -eu
export PORT="${PORT:-8080}"
case "$PORT" in
    ''|*[!0-9]*) echo "PORT must be numeric." >&2; exit 1 ;;
esac

# Runtime secrets come from Cloud Run, never from the image build.
php artisan config:cache --no-interaction
exec "$@"
