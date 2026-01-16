0.React+Fastapi+Spring
일반적인 연동 구조

[ Browser ]
|
v
[ React ]
|
v (REST API / JSON)
[ Spring Boot ] ← JWT 인증 / DB / 비즈니스
|
v (Internal REST)
[ FastAPI ] ← AI / ML / Python 처리

CRUD

기능	HTTP	의미
Create	POST	데이터 생성
Read	GET	데이터 조회
Update	PUT / PATCH	데이터 수정
Delete	DELETE	데이터 삭제
구조에서 CRUD 책임 분리 (핵심)

CRUD의 주인은 Spring Boot다

계층	CRUD 담당 여부	이유
React	NO	화면만
Spring Boot	YES	DB, 트랜잭션, 인증
FastAPI	NO (보조)	연산 / AI 처리
게시글 저장 (Create)

게시글 조회 (Read)

게시글 수정 (Update)

게시글 삭제 (Delete)

게시글 내용 → FastAPI로 보내서 AI 요약

React: 화면 (게시판 UI)

Spring Boot: 게시글 CRUD, DB 저장

PostgreSQL: 실제 게시판 데이터

FastAPI: AI 요약 전용 서버

Spring → FastAPI: HTTP로 요약 요청

2.실습
프로젝트 구조:
spring-react-example/
├─ frontend/
├─ backend/
└─ fastapi-ai/

전체 목표 (이 실습의 정체)

React + Spring Boot + FastAPI + PostgreSQL 게시판 + AI 요약

구조는 이거 하나로 고정 👇

[ React ] → [ Spring Boot ] → [ PostgreSQL ]
↓
[ FastAPI (AI 요약) ]

React: 화면 (게시판 UI)

Spring Boot: 게시글 CRUD, DB 저장

PostgreSQL: 실제 게시판 데이터

FastAPI: AI 요약 전용 서버

Spring → FastAPI: HTTP로 요약 요청

2-1.spring
docker-compose.yml 작성 (DB 정의)
📍 위치

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
Post.java
@Entity
@Table(name = "post")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String summary;

    // getter / setter
}
역할

DB의 post 테이블과 1:1 매핑

summary 컬럼에 AI 요약 결과 저장

PostRepository.java
public interface PostRepository extends JpaRepository<Post, Long> {
}
기본 CRUD 자동 제공
FastApiClient.java
@Component
public class FastApiClient {

    private final WebClient webClient;

    public FastApiClient(WebClient webClient) {
        this.webClient = webClient;
    }

    public String summarize(String content) {
        Map<String, String> body = Map.of("text", content);

        return webClient.post()
                .uri("/summarize")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(res -> (String) res.get("summary"))
                .block();
    }
}
역할

FastAPI /summarize 호출

{ text: "게시글 내용" } 전송

{ summary: "요약 결과" } 수신

WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000") // FastAPI
                .build();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("*");
    }
}
역할

Spring → FastAPI 통신

React CORS 허용

로컬호스트 주소가 서로 다르기때문에 이 코드를 쓰면 주소연결을 허용해준다.

PostService.java (비즈니스 로직)
@Service
public class PostService {

    private final PostRepository postRepository;
    private final FastApiClient fastApiClient;

    public PostService(PostRepository postRepository,
                       FastApiClient fastApiClient) {
        this.postRepository = postRepository;
        this.fastApiClient = fastApiClient;
    }

    public Post create(Post post) {
        return postRepository.save(post);
    }

    public List<Post> list() {
        return postRepository.findAll(
                Sort.by(Sort.Direction.DESC, "id")
        );
    }

    public String summarize(Long id) {
        Post post = postRepository.findById(id).orElseThrow();
        String summary = fastApiClient.summarize(post.getContent());
        post.setSummary(summary);
        postRepository.save(post);
        return summary;
    }
}
흐름

게시글 조회

FastAPI에 내용 전달

요약 결과 저장

결과 반환

PostController.java
@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    @PostMapping
    public Post create(@RequestBody Post post) {
        return postService.create(post);
    }

    @GetMapping
    public List<Post> list() {
        return postService.list();
    }

    @GetMapping("/{id}/summary")
    public String summarize(@PathVariable Long id) {
        return postService.summarize(id);
    }
}
메서드	URL	설명
POST	/posts	게시글 저장
GET	/posts	게시글 목록
GET	/posts/{id}/summary	AI 요약
2-2.fastapi
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()

 OpenAI 클라이언트 (환경변수에서 키 읽음)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class SummarizeRequest(BaseModel):
    text: str

@app.post("/summarize")
def summarize(req: SummarizeRequest):
