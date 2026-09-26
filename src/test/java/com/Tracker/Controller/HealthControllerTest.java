package com.Tracker.Controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Map;

import org.junit.jupiter.api.Test;

class HealthControllerTest {

    @Test
    void healthShouldReturnSuccessPayload() {
        HealthController controller = new HealthController();

        Map<String, Object> response = controller.health();

        assertEquals(true, response.get("success"));
        assertEquals("Server is healthy", response.get("message"));
        assertNotNull(response.get("timestamp"));
    }
}
