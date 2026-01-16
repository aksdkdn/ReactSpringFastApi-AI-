import { useState } from "react";
import { createPost } from "../api/postApi";

export default function PostForm({ onCreated }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const submit = async () => {
        if (!title || !content) return alert("제목/내용 입력");
        await createPost({ title, content });
        setTitle("");
        setContent("");
        onCreated();
    };

    return (
        <div className="card">
            <h2>🍌🍌🍌🍌새 게시글</h2>
            <input
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="내용"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={submit}>등록</button>
        </div>
    );
}
