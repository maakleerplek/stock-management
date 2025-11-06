#!/bin/bash


docker compose down
docker compose rm

docker compose up -d
# docker compose run --rm inventree-server invoke update --skip-backup
