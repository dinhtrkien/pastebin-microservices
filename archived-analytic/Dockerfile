# Stage 1: Build the application using Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Copy Maven wrapper files first
COPY .mvn/ .mvn
COPY mvnw .
COPY mvnw.cmd .
# Copy pom.xml to download dependencies
COPY pom.xml .
# Download dependencies (leverages Docker cache)
RUN ./mvnw dependency:go-offline -B
# Copy the rest of the source code
COPY src ./src
# Build the application JAR, skipping tests
RUN ./mvnw package -DskipTests

# Stage 2: Create the runtime image using OpenJDK
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the built JAR file from the build stage
COPY --from=build /app/target/pastebin-0.0.1-SNAPSHOT.jar app.jar
# Expose the port the application will run on (defined by SERVER_PORT env var)
EXPOSE 3002
# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]