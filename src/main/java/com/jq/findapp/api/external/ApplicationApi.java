package com.jq.findapp.api.external;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.SimpleEmail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class ApplicationApi {
	@Value("${app.api.base.url}")
	private String apiBaseUrl;
	@Value("${app.api.observable.url}")
	private String observableUrl;

	@Value("${app.restartApp}")
	private String restartApp;

	@Value("${app.restartWeb}")
	private String restartWeb;

	@Value("${app.scheduler.secret}")
	private String schedulerSecret;

	@Value("${app.mail.address}")
	private String address;

	@Value("${app.mail.host}")
	private String host;

	@Value("${app.mail.port}")
	private int port;

	@Value("${app.mail.password}")
	private String password;

	public void scheduler() {
		WebClient.create(apiBaseUrl + "scheduler").put()
				.header("secret", schedulerSecret).retrieve().toEntity(Void.class).block();
	}

	public void healthcheck() throws Exception {
		try {
			WebClient.create(apiBaseUrl + "healthcheck").get()
					.header("secret", schedulerSecret).retrieve().toEntity(Void.class).block();
		} catch (final Exception ex) {
			restart(restartApp);
		}
		try {
			WebClient.create(observableUrl).get().retrieve().toEntity(Void.class).block();
		} catch (final Exception ex) {
			restart(restartWeb);
		}
	}

	private void restart(final String process) {
		try {
			new ProcessBuilder(process.split(" ")).start();
			mail(process);
		} catch (final IOException e) {
			mail(process + " failed: " + e.getMessage());
		}
	}

	private void mail(final String process) {
		try {
			final SimpleEmail email = new SimpleEmail();
			email.setHostName(host);
			email.setSmtpPort(port);
			email.setCharset(StandardCharsets.UTF_8.name());
			email.setAuthenticator(new DefaultAuthenticator(address, password));
			email.setSSLOnConnect(true);
			email.setFrom(address);
			email.addTo(address);
			email.setSubject("HEALTCHECK");
			email.setMsg(process);
			email.send();
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}
}