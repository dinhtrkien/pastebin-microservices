##############   build stage   ##############
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# 1. Copy wrapper + pom first to leverage Docker cache
COPY .mvn/ .mvn
COPY mvnw mvnw.cmd pom.xml ./

# 2. Pre-fetch dependencies
RUN ./mvnw dependency:go-offline -B

# 3. Copy the rest of the source and build
COPY src ./src
RUN ./mvnw package -DskipTests

##############  runtime stage  ##############
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy *whatever* JAR Maven just produced
COPY --from=build /app/target/*-SNAPSHOT.jar app.jar

EXPOSE 3006
ENTRYPOINT ["java", "-jar", "app.jar"]