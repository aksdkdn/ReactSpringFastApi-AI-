import PostForm from "./components/PostForm";
import PostList from "./components/PostList";

export default function App() {
    return (
        <div className="container">
            <h1>🦥🦥🦥AI 요약 게시판</h1>
            <PostForm onCreated={() => window.location.reload()} />
            <PostList />
        </div>
    );
}
