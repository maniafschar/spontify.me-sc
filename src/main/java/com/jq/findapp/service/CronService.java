package com.jq.findapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.jq.findapp.api.external.ApplicationApi;

@Component
public class CronService {
	@Autowired
	private ApplicationApi applicationApi;

	@Scheduled(cron = "0 */10 * * * *")
	public void cron() throws Exception {
		applicationApi.cron();
	}

	@Scheduled(cron = "0 * * * * *")
	public void healthcheck() throws Exception {
		applicationApi.healthcheck();
	}
}
