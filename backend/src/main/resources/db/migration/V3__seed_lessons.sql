-- V3__seed_lessons.sql

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order) VALUES
(
  'JAVA_CORE',
  'Collections & Generics',
  'List, Map, Set internals · when to use ArrayList vs LinkedList · HashSet vs TreeSet · why generics prevent ClassCastException at compile time',
  'INTERMEDIATE', 45, 'DONE', 1
),
(
  'JAVA_CORE',
  'OOP: Interfaces & Abstract Classes',
  'Abstract vs interface · when each applies · SOLID principles · default interface methods in Java 8+ · why interviewers ask this constantly',
  'INTERMEDIATE', 50, 'DONE', 2
),
(
  'JAVA_CORE',
  'Streams & Lambdas',
  'filter / map / collect · Optional · method references · parallel streams pitfalls · interview pattern: replace for-loop with stream chain',
  'INTERMEDIATE', 40, 'DONE', 3
),
(
  'JAVA_CORE',
  'Exception Handling Patterns',
  'Checked vs unchecked · custom exceptions · why you never catch Exception and return 200 OK · @RestControllerAdvice pattern',
  'INTERMEDIATE', 35, 'DONE', 4
),
(
  'JAVA_CORE',
  'Concurrency: Threads & Executors',
  'Thread, Runnable, Callable · ExecutorService lifecycle · volatile vs synchronized · CompletableFuture · common race condition traps',
  'ADVANCED', 60, 'IN_PROGRESS', 5
),
(
  'SPRING_BOOT',
  'Spring Boot 3.x Architecture',
  'Auto-configuration · starter dependencies · layered architecture: Controller → Service → Repository · why constructor injection beats @Autowired fields',
  'INTERMEDIATE', 50, 'NOT_STARTED', 6
);
