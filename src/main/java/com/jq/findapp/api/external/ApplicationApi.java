package com.jq.findapp.api.external;

import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class ApplicationApi {
	@Value("${app.api.base.url}")
	private String apiBaseUrl;

	@Value("${app.restart}")
	private String restart;

	@Value("${app.scheduler.secret}")
	private String schedulerSecret;

	@Value("${spring.mail.username}")
	private String address;

	@Autowired
	private JavaMailSender email;

	public void refreshDB() {
		WebClient.create(apiBaseUrl + "refreshDB").put()
				.header("secret", schedulerSecret).retrieve().toEntity(Void.class).block();
	}

	public void healthcheck() throws Exception {
		try {
			WebClient.create(apiBaseUrl + "healthcheck").get()
					.header("secret", schedulerSecret).retrieve().toEntity(Void.class).block();
		} catch (WebClientResponseException ex) {
			new ProcessBuilder(restart.split(" ")).start();
			final MimeMessage msg = email.createMimeMessage();
			final MimeMessageHelper helper = new MimeMessageHelper(msg);
			helper.setFrom(address);
			helper.setTo(address);
			helper.setSubject("HEALTCHECK");
			email.send(msg);
		}
	}
}