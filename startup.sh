#!/bin/bash

# script to start up inventree docker stack
docker compose up -d docker-compose-inventree.yml
docker compose up -d docker-compose.yml

