package com.jq.findapp.api.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class ApplicationApi {
	@Value("${app.api.base.url}")
	private String apiBaseUrl;

	@Value("${app.scheduler.secret}")
	private String schedulerSecret;

	public void refreshDB() {
		WebClient.create(apiBaseUrl + "refreshDB").put()
				.header("secret", schedulerSecret).retrieve().toEntity(Void.class).block();
	}
}