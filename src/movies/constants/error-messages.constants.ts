export const ERROR_MESSAGES = {
    STREAMING_MOVIE_NOT_FOUND: (id: number) => `스트리밍 영화 ID ${id}를 찾을 수 없습니다.`,
    THEATRICAL_MOVIE_NOT_FOUND: (id: number) => `극장 개봉 영화 ID ${id}를 찾을 수 없습니다.`,
    EXPIRING_MOVIE_NOT_FOUND: (id: number) => `만료 예정인 영화 ID ${id}를 찾을 수 없습니다.`
} as const; 