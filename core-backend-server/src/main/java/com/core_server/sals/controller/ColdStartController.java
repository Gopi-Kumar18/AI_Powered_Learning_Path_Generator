package com.core_server.sals.controller;

import org.springframework.web.bind.annotation.GetMapping;


public class ColdStartController {

    @GetMapping("/api/health")
    public String destroyColdStart() {

        return "Sending request to render.com/ after every 10 minutes.";
    }
}
