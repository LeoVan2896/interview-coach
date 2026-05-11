# Deployment Security Checklist

Before deploying interview-coach with Docker, ensure the following security practices are followed:

## Environment Variables

- [ ] Set strong, unique passwords for `DB_PASSWORD` (PostgreSQL)
- [ ] Set strong, unique password for `PGADMIN_PASSWORD`
- [ ] Set valid `ANTHROPIC_API_KEY` from [https://console.anthropic.com](https://console.anthropic.com)
- [ ] Never commit actual secrets to git
- [ ] Use `.env.production` as a template only; create local `.env` with real values
- [ ] Copy `.env.production` to `.env` locally before running `docker-compose up`

```bash
cp .env.production .env
# Edit .env with real values
nano .env  # or your editor
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
