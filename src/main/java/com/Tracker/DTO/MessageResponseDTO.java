package com.Tracker.DTO;

/**
 * DTO: Generic response for success/error messages
 * Used for simple operations like delete, logout, etc.
 */
public class MessageResponseDTO {

    private String message;

    // ==================== CONSTRUCTORS ====================

    public MessageResponseDTO() {
    }

    public MessageResponseDTO(String message) {
        this.message = message;
    }

    // ==================== GETTERS AND SETTERS ====================

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}