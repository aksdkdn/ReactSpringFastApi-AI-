import { summarizePost } from "../api/postApi";
import { useState } from "react";

export default function PostCard({ post }) {
    const [summary, setSummary] = useState(post.summary);
    const [loading, setLoading] = useState(false);

    const summarize = async () => {
        setLoading(true);
        const result = await summarizePost(post.id);
        setSummary(result);
        setLoading(false);
    };

    return (
        <div className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content}</p>

            <button className="ai-btn" onClick={summarize}>
                🤸‍♂️🤸‍♂️🤸‍♂️🤸‍♂️AI 요약🤸‍♂️🤸‍♂️🤸‍♂️
            </button>

            {loading && <p className="loading">요약 중...</p>}
            {summary && (
                <div className="summary">
                    <strong>AI 요약</strong>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
}
