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

	@Value("${app.cron.secret}")
	private String cronSecret;

	@Value("${app.mail.address}")
	private String address;

	@Value("${app.mail.host}")
	private String host;

	@Value("${app.mail.port}")
	private int port;

	@Value("${app.mail.password}")
	private String password;

	private volatile long restart = 0;

	public void cron() {
		WebClient.create(this.apiBaseUrl + "cron").put()
				.header("secret", this.cronSecret).retrieve().toEntity(Void.class).block();
	}

	public void healthcheck() throws Exception {
		if (System.currentTimeMillis() - this.restart > 40000) {
			this.check(this.restartWeb, 4,
					() -> WebClient.create(this.observableUrl).get().retrieve().toEntity(Void.class).block());
			this.check(this.restartApp, 15, () -> WebClient.create(this.apiBaseUrl + "healthcheck").get()
					.header("secret", this.cronSecret).retrieve().toEntity(Void.class).block());
		}
	}

	private void check(final String process, final int max, final Runnable ping) {
		for (int i = 0; i < max; i++) {
			try {
				ping.run();
				return;
			} catch (final Exception ex) {
				try {
					Thread.sleep(2000);
				} catch (final InterruptedException e) {
					e.printStackTrace();
				}
			}
		}
		try {
			new ProcessBuilder(process.split(" ")).start();
			this.restart = System.currentTimeMillis();
			this.mail(process);
		} catch (final IOException e) {
			this.mail(process + " failed: " + e.getMessage());
		}
	}

	private void mail(final String process) {
		try {
			final SimpleEmail email = new SimpleEmail();
			email.setHostName(this.host);
			email.setSmtpPort(this.port);
			email.setCharset(StandardCharsets.UTF_8.name());
			email.setAuthenticator(new DefaultAuthenticator(this.address, this.password));
			email.setSSLOnConnect(true);
			email.setFrom(this.address);
			email.addTo(this.address);
			email.setSubject("HEALTHCHECK");
			email.setMsg(process);
			email.send();
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}
}
