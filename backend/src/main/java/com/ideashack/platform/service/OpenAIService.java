package com.ideashack.platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-4o-mini";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            You are a science commercialization auditor. Analyze the research abstract provided and return a JSON object with exactly this structure:
            {
              "summary": "2-3 sentence commercial assessment",
              "applications": [
                { "name": "Application name", "market": "Market size estimate", "confidence": "High|Medium|Low", "reasoning": "Why this application fits" }
              ],
              "claims": [
                { "claim": "Technical claim from the text", "status": "VERIFIED|ASSUMED", "source": "Evidence or note" }
              ],
              "risks": [
                { "level": "HIGH|MEDIUM|LOW", "risk": "Risk category name", "detail": "Specific risk detail" }
              ],
              "actions": ["Action 1", "Action 2", "Action 3"]
            }

            Rules:
            - summary: investor-focused commercial potential in 2-3 sentences
            - applications: exactly 3 commercial applications with real market size estimates
            - claims: 4-5 key technical claims; VERIFIED = explicitly stated, ASSUMED = implied or extrapolated
            - risks: 3-4 risks at HIGH/MEDIUM/LOW levels
            - actions: 3-5 specific, concrete validation steps
            Return only valid JSON, no markdown code blocks.
            """;

    public Map<String, Object> runAudit(String apiKey, String abstract_) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", abstract_)
                ),
                "temperature", 0.3
        );

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    API_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(mapper.writeValueAsString(body), headers),
                    String.class
            );

            JsonNode root = mapper.readTree(response.getBody());
            String content = root.at("/choices/0/message/content").asText();
            return mapper.readValue(content, Map.class);

        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("401")) throw new IllegalArgumentException("Invalid OpenAI API key");
            if (msg != null && msg.contains("429")) throw new IllegalStateException("OpenAI rate limit exceeded");
            throw new RuntimeException("OpenAI call failed: " + msg);
        }
    }
}
