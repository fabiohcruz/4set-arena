#!/bin/bash

# Iniciar o backend em background
echo "🚀 Iniciando backend..."
cd backend && npm start &

# Aguardar um pouco para o backend inicializar
sleep 5

# Iniciar o frontend
echo "🚀 Iniciando frontend..."
cd ../frontend && npm start