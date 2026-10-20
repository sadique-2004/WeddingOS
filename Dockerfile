# Stage 1: Build Spring Boot JAR using Maven
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy the entire backend directory
COPY services/api/ ./

# Grant executable permission to Maven wrapper and package application
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Stage 2: Minimal Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root secure application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy executable jar from builder stage
COPY --from=builder /app/target/api-*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]
