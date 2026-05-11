# Deployment Security Checklist

Before deploying interview-coach with Docker, ensure the following security practices are followed:

## Environment Variables

Before deploying to production, set strong credentials:

### Environment Variable Reference

| Variable | Purpose | Required? | Example |
|----------|---------|-----------|---------|
| `DB_NAME` | PostgreSQL database name | Yes | `interviewdb` |
| `DB_USER` | PostgreSQL database user | Yes | `postgres` |
| `DB_PASSWORD` | PostgreSQL user password | Yes | `Db@Prod2026#SecurePass!` |
| `PGADMIN_EMAIL` | pgAdmin login email | Yes | `admin@interview-coach.local` |
| `PGADMIN_PASSWORD` | pgAdmin login password | Yes | `Pgadmin@2026#SecurePass!` |
| `ANTHROPIC_API_KEY` | Claude API key from console.anthropic.com | Yes | `sk-ant-xxxxxxxxxxxxxxxxxxxxx` |

**Security Notes:**
- All passwords must be strong (16+ chars, mixed case, numbers, symbols)
- Store `.env` file securely; never commit to version control
- Rotate `ANTHROPIC_API_KEY` quarterly
- Update passwords immediately if exposed

### Password Setup Checklist

- [ ] Set **strong, unique password** for `DB_PASSWORD` (PostgreSQL)
  - Minimum 16 characters
  - Must include: uppercase, lowercase, numbers, special characters
  - Example: `Db@Prod2026#SecurePass!`
- [ ] Set **strong, unique password** for `PGADMIN_PASSWORD`
  - Same requirements as DB_PASSWORD
- [ ] Set valid `ANTHROPIC_API_KEY` from [https://console.anthropic.com](https://console.anthropic.com)
  - Must start with `sk-ant-`
  - Never share or commit to version control
  - Rotate quarterly or after suspected compromise
- [ ] Never commit actual secrets to git
- [ ] Use `.env.production` as a template only
- [ ] Create local `.env` with real values

Setup:
```bash
cp .env.production .env
# Edit .env with real values
nano .env  # or your editor
# docker-compose will load this file
```

## Docker & Container Security

- [ ] Images are from trusted registries (postgres, nginx, node, openjdk official images)
- [ ] Regular security updates: `docker pull postgres:15-alpine` etc. to get patches
- [ ] No hardcoded secrets in Dockerfiles (use environment variables)
- [ ] Resource limits enforced in docker-compose.yml (memory, CPU)
- [ ] Restart policies enabled for automatic recovery

## Network Security

- [ ] pgAdmin only exposed on `localhost:5050` (not internet-facing)
- [ ] Backend API only on `localhost:8080` (behind nginx proxy in prod)
- [ ] Frontend on `localhost:3000` (nginx handles public access)
- [ ] Use reverse proxy (Traefik, nginx) in front of frontend for TLS/HTTPS
- [ ] Set up firewall rules to restrict port access

## Database Backup & Recovery

**Always maintain a backup strategy** — container data is ephemeral.

### Regular Backups

Create a backup script `scripts/backup-db.sh`:

```bash
#!/bin/bash
# Backup PostgreSQL database from running container
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/interview-coach_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

# Dump database from running postgres container
docker-compose exec -T postgres pg_dump \
  -U postgres \
  interviewdb > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

echo "Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "interview-coach_*.sql.gz" -mtime +7 -delete
```

Run daily with cron:
```bash
0 2 * * * cd /path/to/interview-coach && ./scripts/backup-db.sh
```

### Restore from Backup

```bash
# List available backups
ls -lh backups/

# Restore from backup (this will OVERWRITE current data)
gunzip -c backups/interview-coach_20260511_020000.sql.gz | \
  docker-compose exec -T postgres psql -U postgres interviewdb

# Verify restore
docker-compose exec postgres psql -U postgres -d interviewdb -c "\dt"
```

### Backup Checklist

- [ ] Create and test backup script before going live
- [ ] Run `./scripts/backup-db.sh` manually to verify it works
- [ ] Schedule daily backups via cron
- [ ] Test restore procedure on staging database
- [ ] Monitor disk space for backups (each backup ~2-5MB)
- [ ] Consider off-site backup (S3, Google Cloud Storage) for production

## Production Deployment

### Recommended Setup

1. **Reverse Proxy (nginx, Traefik, or HAProxy)**
   - Terminates HTTPS/TLS
   - Routes traffic to frontend container
   - Frontend nginx proxies `/api/` to backend

2. **Database Backup**
   - Enable PostgreSQL backups outside container
   - Use volume snapshots or `pg_dump` with cron

3. **Monitoring & Logging**
   - Centralize logs (ELK, Splunk, CloudWatch)
   - Monitor container health and resource usage
   - Set up alerts for API errors and timeouts

4. **Updates & Maintenance**
   - Schedule regular updates to base images
   - Test updates in staging before production
   - Plan maintenance windows for database migrations

### Never in Production

❌ Don't expose pgAdmin to the internet
❌ Don't hardcode API keys in version control
❌ Don't skip TLS/HTTPS
❌ Don't rely on default passwords
❌ Don't run without backup strategy
❌ Don't expose PostgreSQL port (5432) directly to internet

## Example: Secure Docker Compose Deployment

```bash
# 1. Create secure .env from template
cp .env.production .env
# Edit .env with strong credentials and valid API key
# $ EDITOR=nano nano .env

# 2. Start services
docker-compose up -d

# 3. Verify services are healthy
docker-compose ps
# All services should show "healthy" status after ~15 seconds

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080 (internal only)
# pgAdmin: http://localhost:5050 (internal only)

# 5. Set up reverse proxy (example with Traefik)
# Define labels in docker-compose.yml for automatic HTTPS setup
```

## Incident Response

**If API key is compromised:**
1. Immediately rotate the key at console.anthropic.com
2. Update `.env` with new key
3. Restart backend service: `docker-compose restart backend`

**If database password is exposed:**
1. Spin up new PostgreSQL instance
2. Migrate data via `pg_dump` and `pg_restore`
3. Update `.env` and restart services

**If container is compromised:**
1. Stop services: `docker-compose down`
2. Investigate logs: `docker-compose logs backend`
3. Review volume mounts and file permissions
4. Redeploy with fresh volumes and new secrets
