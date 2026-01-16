const BASE_URL = "http://localhost:8080/posts";

/**
 * 게시글 전체 조회
 * GET /posts
 */
export const fetchPosts = async () => {
    const res = await fetch(BASE_URL);

    if (!res.ok) {
        throw new Error("게시글 조회 실패");
    }

    return res.json();
};

/**
 * 게시글 생성
 * POST /posts
 */
export const createPost = async (data) => {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("게시글 생성 실패");
    }

    return res.json();
};

/**
 * 게시글 요약 (FastAPI or Spring AI)
 * GET /posts/{id}/summary
 */
export const summarizePost = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}/summary`);

    if (!res.ok) {
        throw new Error("요약 생성 실패");
    }

    return res.text();
};
