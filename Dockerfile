# ── Stage 1: build ─────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Maven wrapper + descriptor first (better layer caching for dependencies)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B -q

# Sources, then build
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ── Stage 2: run ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Non-root runtime user
RUN addgroup -S unievt && adduser -S unievt -G unievt

COPY --from=builder --chown=unievt:unievt /app/target/*.jar app.jar

USER unievt

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx256m", "-Xms128m", "-jar", "app.jar"]
