package com.Tracker.Controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class FrontendControllerTest {

    @Test
    void shouldForwardClientRoutesToIndexHtml() {
        FrontendController controller = new FrontendController();

        assertEquals("forward:/index.html", controller.index());
    }
}
