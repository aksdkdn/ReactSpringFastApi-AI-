
React + Spring Boot + FastAPI + PostgreSQL 게시판 + AI 요약


프로젝트 구조:
spring-react-example/
├─ frontend/
├─ backend/
└─ fastapi-ai/



React: 화면 (게시판 UI)

Spring Boot: 게시글 CRUD, DB 저장

PostgreSQL: 실제 게시판 데이터

FastAPI: AI 요약 전용 서버

Spring → FastAPI: HTTP로 요약 요청


docker-compose.yml 작성 (DB 정의)


backend/docker-compose.yml

services:
  postgres:
    image: postgres:15
    container_name: board-postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: boarddb
      POSTGRES_USER: boarduser
      POSTGRES_PASSWORD: boardpass
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
항목	설명
POSTGRES_DB	DB 이름
POSTGRES_USER	접속 계정
POSTGRES_PASSWORD	비밀번호
5432	PostgreSQL 기본 포트
PostgreSQL 컨테이너 실행
cd backend

# 실행
docker compose up -d

# 확인
docker ps

CONTAINER ID   IMAGE         NAMES
xxxxxx         postgres:15  board-postgres
PostgreSQL 안으로 직접 접속
Spring 말고 사람이 직접 DB 들어가는 단계

docker exec -it board-postgres psql -U boarduser -d boarddb
성공하면 이 화면이 뜬다.

psql (15.x)
boarddb=#
\dt
Spring 실행

./gradlew bootRun
데이터 확인 (게시글 저장 확인)

SELECT * FROM post;
psql 종료

\q
