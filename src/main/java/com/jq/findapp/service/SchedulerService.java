package com.jq.findapp.service;

import com.jq.findapp.api.external.ApplicationApi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SchedulerService {
	@Autowired
	private ApplicationApi applicationApi;

	@Scheduled(cron = "0 0 * * * *")
	public void refreshAge() throws Exception {
		applicationApi.refreshDB();
	}
}