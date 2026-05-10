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
