package com.example.demo;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

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
