# Orchestra Sheet Music Library

A web-based sheet music library that replaces manual handling in Google Drive folders. The sheet music is organised so current versions are easy to access. The library also includes concerts with setlists and instrument mappings so individual musicians can find the relevant material easily.

The project is based on a real use case and also serves a learning purpose with a backend focus on:

- OpenAPI
- Go
- PostgreSQL
- REST API
- testing and CI/CD

A basic frontend will be built using:

- React / TypeScript
- shadcn/ui

## Status

Under development. Backend is approaching MVP.

## Documentation

The project uses an API-first design approach, as recommended by the OpenAPI Initiative. The API Documentation below, though subject to change, is the project's source of truth. The document is used to guide the implementation as well as to generate Swagger UI.

- [API Documentation](docs/openapi.yaml)
- [Product Description](docs/product.md)
- [Database Schema](docs/database-schema.md)
- [Domain Model](docs/domain-model.md)

## Get Started

### Prerequisites

- Go
- Docker

### Setup

Clone the repository:

```bash
git clone https://github.com/erikdsp/notbibliotek.git
cd notbibliotek
```

Create a `.env` file based on `.env.example` and configure the database credentials:

```bash
cp .env.example .env
```

Start PostgreSQL and run the backend:

```bash
make up
make run
```

Access the Swagger UI at:

```text
http://localhost:8080/docs
```

To stop the database:

```bash
make down
```

To stop the database and remove its volume:

```bash
docker compose down -v
```
