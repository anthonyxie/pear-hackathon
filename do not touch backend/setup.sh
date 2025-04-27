#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if .env exists, if not create it from example
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
  echo "Please edit .env to add your Claude API key"
fi

# Build the TypeScript code
echo "Building TypeScript..."
npm run build

echo "Setup complete!"
echo "Run 'npm run dev' to start the development server"