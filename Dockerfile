# Multi-stage Dockerfile
# 1) Build frontend (Vite/React)
# 2) Build backend (Maven + Spring Boot) and copy frontend build into resources
# 3) Runtime: run the packaged Spring Boot jar; server port respects $PORT (Railway)

FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY Frontend/package*.json ./
RUN npm ci --silent
COPY Frontend/ .
RUN npm run build

## Use a supported Maven image with OpenJDK 17. Some older tags are not available on Docker Hub.
## Use a supported Maven image with OpenJDK 17. Some tags vary across registries.
## Using the official `maven:3.9.4-jdk-17` tag which is widely available.
FROM maven:3.9.4-jdk-17 AS maven-build
WORKDIR /app
# Copy pom and backend sources
COPY pom.xml ./
COPY src ./src
# Copy the frontend build into Spring Boot static resources so the jar serves the UI
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

# Build the Spring Boot jar (skip tests for faster builds; remove -DskipTests to run tests)
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app
COPY --from=maven-build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS=""
# Allow Railway to set the listening port via $PORT; fallback to 8080 locally
CMD ["sh","-c","java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
