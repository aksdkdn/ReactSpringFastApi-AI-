package com.example.demo;

import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

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
