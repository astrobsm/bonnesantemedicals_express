#!/bin/bash
# disable_alembic_autodetect.sh
# This script prevents automatic Alembic execution during build

echo "Disabling automatic Alembic detection..."
export DISABLE_ALEMBIC_REVISION=1
export SKIP_ALEMBIC_UPGRADE=1
echo "Alembic auto-detection disabled"
