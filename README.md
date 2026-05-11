# Interview Coach Agent

A full-stack AI-powered interview practice app. A senior engineer (Claude) guides you through clarification → approach → solution → trace → scorecard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Data JPA, Spring Web |
| Database | H2 in-memory (dev) — swap to PostgreSQL for prod |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) via `RestClient` |
| Frontend | React 18, Vite 5, React Router 6, plain CSS |
| Build | Maven |

---

## Setup

### 1. Add your API key

Open `backend/src/main/resources/application.properties` and replace:

```properties
anthropic.api-key=REPLACE_WITH_YOUR_KEY
```

with your key from [console.anthropic.com](https://console.anthropic.com).

> **Security note:** Never commit a real key. For production, set it as an environment variable and reference it as `${ANTHROPIC_API_KEY}`.

### 2. Run the backend

```bash
cd interview-coach/backend
mvn spring-boot:run
```

Backend starts on `http://localhost:8080`.

H2 console (browse the in-memory DB): `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:interviewdb`
- Username: `sa`, Password: _(blank)_

### 3. Run the frontend

```bash
cd interview-coach/frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`.

---

## Using the App

1. Pick a topic (Java Core, Spring Boot, SQL, etc.)
2. Claude researches 6 real interview questions for that topic
3. Pick a question → a session is created
4. Chat with the AI interviewer through 5 phases: Clarify → Approach → Solve → Trace → Score
5. Click **Scorecard** (or finish your trace) to get a detailed 6-dimension score

---

## Migrating to PostgreSQL

1. Add PostgreSQL dependency to `pom.xml`:
   ```xml
   <dependency>
     <groupId>org.postgresql</groupId>
     <artifactId>postgresql</artifactId>
     <scope>runtime</scope>
   </dependency>
   ```

2. Update `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/interviewdb
   spring.datasource.username=your_user
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=validate
   spring.sql.init.mode=always
   ```

3. Run `backend/src/main/resources/postgres-schema.sql` against your database.

---

## API Reference

```
POST   /api/sessions                    Create new session
GET    /api/sessions                    List all sessions (summary)
GET    /api/sessions/{id}               Get session with messages
POST   /api/sessions/{id}/messages      Send a message, get AI reply
POST   /api/sessions/{id}/scorecard     Generate final scorecard
DELETE /api/sessions/{id}               Delete a session
GET    /api/questions/research?topic=   Research questions for a topic
```

---

## Project Structure

```
interview-coach/
├── backend/
│   └── src/main/java/com/interviewcoach/
│       ├── config/        CorsConfig, GlobalExceptionHandler
│       ├── controller/    SessionController, QuestionController
│       ├── dto/           Request/Response records (never expose JPA entities)
│       ├── model/         Session, Message (JPA entities), Topic enum
│       ├── repository/    Spring Data JPA interfaces
│       └── service/       AnthropicService, SessionService (business logic)
└── frontend/
    └── src/
        ├── api/           fetch wrapper
        ├── components/    TopicSelector, QuestionList, InterviewChat, etc.
        ├── hooks/         useInterview (all session state)
        └── styles/        main.css (dark theme, CSS custom properties)
```

---

## Docker Deployment

### Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

### Quick Start

1. **Configure environment**

   Copy the production template and edit with your actual secrets:

   ```bash
   cp .env.production .env
   # Edit .env with real database passwords and Anthropic API key
   nano .env
   ```

   **Required variables:**
   - `DB_PASSWORD` — PostgreSQL password (16+ chars, mixed case, numbers, special chars)
   - `PGADMIN_PASSWORD` — pgAdmin admin password (same requirements)
   - `ANTHROPIC_API_KEY` — Claude API key from [https://console.anthropic.com](https://console.anthropic.com)

2. **Build and start containers**

   ```bash
   docker-compose up -d
   ```

   This starts:
   - **Frontend** (nginx serving React app): http://localhost:3000
   - **Backend** (Spring Boot API): http://localhost:8080 (internal only)
   - **PostgreSQL** (database): localhost:5432 (internal only)
   - **pgAdmin** (database UI): http://localhost:5050

3. **Verify services are healthy**

   ```bash
   docker-compose ps
   ```

   Expected: All services showing `(healthy)` status after 15-30 seconds.

4. **Access the application**

   Open http://localhost:3000 in your browser. The frontend will automatically proxy API requests to the backend.

### Docker Compose Services

| Service | URL | Purpose | Exposed |
|---------|-----|---------|---------|
| Frontend | http://localhost:3000 | React interview coaching app | ✓ Public |
| Backend API | http://localhost:8080 | Spring Boot REST endpoints | ✗ Internal (proxied via nginx) |
| PostgreSQL | localhost:5432 | Interview session database | ✗ Internal only |
| pgAdmin | http://localhost:5050 | Database management UI | ✓ Local access only |

### Managing the Application

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**Stop containers** (data persists):
```bash
docker-compose down
```

**Stop and remove volumes** (deletes all data):
```bash
docker-compose down -v
```

**Restart a service:**
```bash
docker-compose restart backend
```

**Rebuild images after code changes:**
```bash
docker-compose build
docker-compose up -d
```

### Accessing pgAdmin (Database Management)

1. Open http://localhost:5050
2. Login with credentials from `.env`:
   - Email: value of `PGADMIN_EMAIL`
   - Password: value of `PGADMIN_PASSWORD`
3. Add PostgreSQL server:
   - **Host name:** `postgres` (Docker service name, not localhost)
   - **Port:** `5432`
   - **Database:** value of `DB_NAME` (default: `interviewdb`)
   - **Username:** value of `DB_USER` (default: `postgres`)
   - **Password:** value of `DB_PASSWORD`

### Backup and Recovery

**Create a database backup:**
```bash
docker-compose exec -T postgres pg_dump -U postgres interviewdb > backup.sql
gzip backup.sql
```

**Restore from backup:**
```bash
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U postgres interviewdb
```

See `docs/DEPLOYMENT_SECURITY.md` for automated backup procedures.

### Production Deployment

For production deployment, see `docs/DEPLOYMENT_SECURITY.md` which includes:
- Password requirements and best practices
- Security checklist (network, TLS, firewall)
- Reverse proxy setup (nginx, Traefik)
- Monitoring and logging configuration
- Incident response procedures
- Backup and disaster recovery

**TL;DR: Never expose pgAdmin or PostgreSQL to the internet. Use a reverse proxy with HTTPS. Enable automated backups.**

### Troubleshooting

**Services not starting: Check logs**
```bash
docker-compose logs backend
docker-compose logs postgres
```

**"Container already exists" error:**
```bash
docker-compose down
docker-compose up -d
```

**Database connection refused:**
- Wait 15-30 seconds for PostgreSQL healthcheck to pass
- Verify `DB_HOST` in backend environment is `postgres` (not localhost)
- Check `docker-compose ps` to confirm postgres is healthy

**Frontend can't reach API:**
- Verify backend is healthy: `docker-compose ps`
- Check nginx logs: `docker-compose logs frontend`
- Ensure nginx is proxying `/api/` to `http://backend:8080` (see `frontend/nginx.conf`)

**Port already in use:**
- Find what's using the port: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)
- Or change port mapping in `docker-compose.yml`: `"3001:3000"` instead of `"3000:3000"`

**API key invalid (Anthropic errors):**
- Verify `ANTHROPIC_API_KEY` in `.env` is valid from https://console.anthropic.com
- Restart backend: `docker-compose restart backend`
- Check backend logs: `docker-compose logs backend`

### Multi-Environment Setup

To deploy to staging or production with different configs:

```bash
# Development (current .env)
docker-compose up -d

# Staging with separate database and credentials
docker-compose -f docker-compose.yml --env-file .env.staging up -d

# Production with resource limits
docker-compose -f docker-compose.yml \
  -f docker-compose.prod.yml \
  --env-file .env.production up -d
```

### Next Steps

- **Development:** Use `npm run dev` in frontend and `mvn spring-boot:run` in backend for faster iteration (Docker is for final testing and deployment)
- **Testing:** Use `docker-compose` to test the full stack before deploying
- **Production:** Read `docs/DEPLOYMENT_SECURITY.md` and configure reverse proxy, TLS, backups, and monitoring

---
