# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies (cached layer for faster rebuilds)
COPY backend/pom.xml ./backend/pom.xml
RUN cd backend && mvn dependency:resolve

# Copy entire backend source and build
COPY backend/ ./backend/
RUN cd backend && mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/backend/target/interview-coach-*.jar app.jar

# Expose port for Spring Boot
EXPOSE 8080

# Set production Spring profile and run
ENV SPRING_PROFILES_ACTIVE=prod
CMD ["java", "-jar", "app.jar"]
