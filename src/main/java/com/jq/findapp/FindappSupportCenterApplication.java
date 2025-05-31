package com.jq.findapp;

import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan
public class FindappSupportCenterApplication {
	public static void main(String[] args) {
		final SpringApplicationBuilder app = new SpringApplicationBuilder(FindappSupportCenterApplication.class);
		app.web(WebApplicationType.NONE);
		app.run(args);
	}
}
