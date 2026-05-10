package com.interviewcoach.model;

public enum Topic {
    JAVA_CORE("Java Core"),
    SPRING_BOOT("Spring Boot"),
    SQL_DB("SQL & DB"),
    REST_APIS("REST APIs"),
    SYSTEM_DESIGN("System Design"),
    BEHAVIORAL("Behavioral"),
    DSA("DSA");

    private final String label;

    Topic(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
