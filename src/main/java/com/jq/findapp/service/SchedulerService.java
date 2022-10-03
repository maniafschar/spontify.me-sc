package com.jq.findapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.jq.findapp.api.external.ApplicationApi;

@Component
public class SchedulerService {
	@Autowired
	private ApplicationApi applicationApi;

	@Scheduled(cron = "0 0 * * * *")
	public void refreshAge() throws Exception {
		applicationApi.refreshDB();
	}

	@Scheduled(cron = "0 * * * * *")
	public void healthcheck() throws Exception {
		applicationApi.healthcheck();
	}
}