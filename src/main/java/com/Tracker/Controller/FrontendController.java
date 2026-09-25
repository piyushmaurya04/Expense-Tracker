package com.Tracker.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    @GetMapping(value = {
            "/",
            "/login",
            "/register",
            "/dashboard",
            "/add-expense",
            "/all-expenses",
            "/add-income",
            "/all-incomes",
            "/profile",
            "/analytics",
            "/budget",
            "/{path:[^\\.]+}"
    })
    public String index() {
        return "forward:/index.html";
    }
}
