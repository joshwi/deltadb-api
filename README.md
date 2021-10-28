# deltaDB API Server

## Table of contents
* [Setup](#setup)
* [Publish](#publish)

## Setup

1. Change directory to the app folder: 
```
cd app
```
2. Create .env file: 
```
touch .env
```
3. Open .env in editor: 
```
nano .env
```
4. Paste variables and input proper values

```
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password123
NEO4J_SERVICE_HOST=neo4j
NEO4J_SERVICE_PORT=7687
REDIS_SERVICE_HOST=redis
REDIS_SERVICE_PORT=6379
MARIANADB_SERVICE_HOST=localhost
MARIANADB_SERVICE_PORT=5000
```
5. Change directory to root:
```
cd ..
```
6. Build app in docker container image: 
```
sudo docker build -t deltadb-api .
```
7. Run docker container:
```
sudo docker run -d --net <docker_network> --env-file <path_to_env>  --name deltadb-api -p 5000:5000 deltadb-api
```

## Publish

1. Build app in docker container image: 
```
sudo docker build -t <container_repo>/deltadb-api .
```

2. Push docker image to container repo: 
```
sudo docker push <container_repo>/deltadb-api:latest
```