#!/bin/bash

echo "Desplegando NATS..."
skaffold run -p nats

skaffold dev