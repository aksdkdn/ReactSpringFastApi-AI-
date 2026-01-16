import { useEffect, useState } from "react";
import { fetchPosts } from "../api/postApi";
import PostCard from "./PostCard";

export default function PostList() {
    const [posts, setPosts] = useState([]);

    const load = async () => {
        const data = await fetchPosts();
        setPosts(data);
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <>
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </>
    );
}
