### 기술 스택
```
언어: TypeScript
런타임: Node.js
프레임워크: Nest.js
데이터베이스: PostgreSQL
테스트: Jest
린팅: ESLint
포맷팅: Prettier
인증: API 키 기반 인증
배포: AWS Lightsail, GitHub Actions
```

### 프로젝트 설명 
이 프로젝트는 스푸키 백엔드를 TypeScript와 Nest.js로 다시 작성한 프로젝트입니다. API 키 기반 인증을 사용하여 프론트엔드 서버의 요청만을 허용합니다.

### 배포
이 프로젝트는 AWS Lightsail에서 호스팅되며, GitHub Actions를 통한 자동 배포가 구성되어 있습니다.

- **배포 환경**: AWS Lightsail (Node.js 블루프린트)
- **프로세스 관리**: PM2
- **자동화**: GitHub Actions를 통한 CI/CD
- **트리거**: main 브랜치에 push 발생 시 자동 배포

배포 프로세스:
1. GitHub main 브랜치에 코드 push
2. GitHub Actions 워크플로우 실행
3. 코드 빌드 및 테스트
4. AWS Lightsail 인스턴스로 배포
5. PM2를 통한 애플리케이션 실행

### 인증
모든 API 요청은 `X-API-Key` 헤더에 유효한 API 키를 포함해야 합니다. API 키는 환경 변수로 설정되며, 프론트엔드 서버에만 제공됩니다.

### 스푸키 타운 백엔드 API 문서

스푸키 타운의 백엔드 API는 다음 엔드포인트를 제공합니다:

1. GET("/movies/theater/released")
   - 설명: 현재 상영 중인 영화 정보를 반환합니다.
   - 필요한 매개변수: 없음
   - 응답: MovieResponseDto[] 형식

2. GET("/movies/theater/upcoming")
   - 설명: 상영 예정인 영화 정보를 반환합니다.
   - 필요한 매개변수: 없음
   - 응답: MovieResponseDto[] 형식

3. GET("/movies/expiring-horror")
   - 설명: 스트리밍 서비스에서 곧 종료될 공포 영화 목록을 반환합니다.
   - 필요한 매개변수: 없음
   - 응답: ExpiringMovieResponseDto[] 형식

4. GET("/movies/expiring-horror/{id}")
   - 설명: 특정 스트리밍 종료 예정 공포 영화의 상세 정보를 반환합니다.
   - 필요한 매개변수:
     - id: 영화 ID (URL 경로에 포함)
   - 응답: ExpiringMovieDetailResponseDto 형식

5. GET("/movies/streaming/pages")
   - 설명: 스트리밍 서비스의 총 페이지 수를 반환합니다.
   - 필요한 매개변수:
     - provider: 스트리밍 서비스 이름 (쿼리 매개변수)
   - 응답: { totalPages: number } 형식

6. GET("/movies/streaming")
   - 설명: 스트리밍 서비스의 영화 정보를 페이지네이션하여 반환합니다.
   - 필요한 매개변수:
     - provider: 스트리밍 서비스 이름 (쿼리 매개변수, 선택적)
       - netflix: 넷플릭스
       - disney: 디즈니플러스
       - wavve: 웨이브
       - naver: 네이버
       - googleplay: 구글 플레이
     - page: 페이지 번호 (쿼리 매개변수, 선택적, 기본값: 1)
     - search: 검색어 (쿼리 매개변수, 선택적)
       - 영화 제목 검색
       - 최소 1자 이상
       - 대소문자 구분 없음
       - 부분 일치 검색 지원
   - 응답: StreamingPageResponseDto 형식
     ```typescript
     {
       movies: {
         id: number;
         title: string;
         posterPath: string;
         releaseDate: string;
         providers: string;
       }[];
       totalPages: number;
       currentPage: number;
     }
     ```
   - 페이지네이션:
     - 페이지당 영화 수: 18개
     - 정렬 기준: 개봉일 (release_date) 기준 내림차순
     - 예시:
       - /movies/streaming?search=스파이��맨

7. GET("/movies/streaming/{id}")
   - 설명: 스트리밍 영화의 상세 정보를 반환합니다.
   - 필요한 매개변수:
     - id: 영화 ID (URL 경로에 포함)
   - 응답: MovieDetailResponseDto 형식

8. GET("/movies/theater/{id}")
   - 설명: 극장 상영 영화의 상세 정보를 반환합니다.
   - 필요한 매개변수:
     - id: 영화 ID (URL 경로에 포함)
   - 응답: MovieDetailResponseDto 형식

9. GET("/movies/provider/{providerId}")
   - 설명: 특정 제공자의 영화 목록을 반환합니다.
   - 필요한 매개변수:
     - providerId: 제공자 ID (URL 경로에 포함)
   - 응답: MovieResponseDto[] 형식

각 DTO의 구체적인 형식은 해당 DTO 파일을 참조하세요.
