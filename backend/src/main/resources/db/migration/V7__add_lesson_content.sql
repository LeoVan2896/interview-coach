-- V7__add_lesson_content.sql
-- Reset all statuses to NOT_STARTED
UPDATE lessons SET status = 'NOT_STARTED';

-- Lesson 1: Collections & Generics
UPDATE lessons SET
  content_html = '<h3>Why This Is Asked</h3>
<p>Collections internals are tested in nearly every Java interview. Interviewers want to confirm you understand <em>why</em> to choose one data structure over another — not just that you know the names.</p>

<h3>List: ArrayList vs LinkedList</h3>
<ul>
  <li><strong>ArrayList</strong>: backed by a resizable array. O(1) random access by index. O(n) insertion/deletion in the middle (elements shift). Best for read-heavy workloads.</li>
  <li><strong>LinkedList</strong>: doubly-linked nodes. O(1) insert/delete at head or tail. O(n) random access. Best when you frequently add/remove from ends.</li>
</ul>
<p><strong>Interview tip:</strong> Always choose ArrayList unless you have a specific reason not to. LinkedList has overhead per node (two pointers) that usually outweighs the benefit.</p>

<h3>Map: HashMap vs LinkedHashMap vs TreeMap</h3>
<ul>
  <li><strong>HashMap</strong>: O(1) average get/put. No ordering. Allows one null key.</li>
  <li><strong>LinkedHashMap</strong>: O(1) average, maintains insertion order. Good for LRU cache.</li>
  <li><strong>TreeMap</strong>: O(log n). Keys sorted by natural order or Comparator. Use when you need range queries (headMap, tailMap).</li>
</ul>

<h3>Set: HashSet vs TreeSet vs LinkedHashSet</h3>
<ul>
  <li><strong>HashSet</strong>: backed by HashMap. O(1) add/contains. No ordering.</li>
  <li><strong>TreeSet</strong>: backed by TreeMap. O(log n). Sorted. Useful for floor/ceiling lookups.</li>
  <li><strong>LinkedHashSet</strong>: insertion-ordered HashSet. O(1). Use when iteration order matters.</li>
</ul>

<h3>Generics: Why They Exist</h3>
<p>Generics move type errors from runtime to compile time. Without generics, a <code>List</code> can hold anything — you only discover mismatches when you cast at runtime, causing <code>ClassCastException</code>. With generics, <code>List&lt;String&gt;</code> enforces the type at compile time.</p>
<pre><code>// Without generics (unsafe)
List list = new ArrayList();
list.add("hello");
Integer i = (Integer) list.get(0); // ClassCastException at runtime!

// With generics (safe)
List&lt;String&gt; safe = new ArrayList&lt;&gt;();
safe.add("hello");
// safe.add(42); // compile error — caught immediately</code></pre>

<h3>Common Interview Question</h3>
<p><em>"What happens when two keys have the same hashCode in a HashMap?"</em> — HashMap uses chaining: keys with the same bucket index are stored as a linked list (or tree in Java 8+). Performance degrades from O(1) to O(n) in extreme collision scenarios, which is why a good <code>hashCode()</code> implementation matters.</p>',
  company_note = 'At fintech companies like Fiserv, HashMaps are everywhere in transaction routing and account lookup. Interviewers will ask you to pick the right collection for a cache, a sorted ledger, or a dedup set. Know why, not just which.'
WHERE sort_order = 1;

-- Lesson 2: OOP: Interfaces & Abstract Classes
UPDATE lessons SET
  content_html = '<h3>Why This Is Asked</h3>
<p>This question separates developers who understand design from those who just write code. Every senior engineer must know when to reach for each tool.</p>

<h3>Abstract Class</h3>
<ul>
  <li>Can have state (instance fields)</li>
  <li>Can have constructors</li>
  <li>Methods can be abstract (no body) or concrete (with body)</li>
  <li>A class can extend only ONE abstract class</li>
</ul>
<p><strong>Use when:</strong> you have shared state or partial implementation that subclasses build on. Example: <code>BaseEntity</code> with <code>id</code>, <code>createdAt</code>, <code>updatedAt</code>.</p>

<h3>Interface</h3>
<ul>
  <li>No instance state (only static constants)</li>
  <li>All methods implicitly public</li>
  <li>Since Java 8: can have <code>default</code> methods (concrete) and <code>static</code> methods</li>
  <li>A class can implement MULTIPLE interfaces</li>
</ul>
<p><strong>Use when:</strong> you want to define a contract (what something does) without dictating how. Example: <code>Comparable</code>, <code>Runnable</code>, <code>Repository</code>.</p>

<h3>The Rule of Thumb</h3>
<p><em>"Program to an interface, not an implementation."</em> — GoF Design Patterns. This decouples callers from concrete types, making code testable and swappable.</p>

<h3>SOLID Principles (Quick Reference)</h3>
<ul>
  <li><strong>S</strong>ingle Responsibility: one class, one reason to change</li>
  <li><strong>O</strong>pen/Closed: open for extension, closed for modification (use interfaces)</li>
  <li><strong>L</strong>iskov Substitution: subclasses must be substitutable for their parent</li>
  <li><strong>I</strong>nterface Segregation: prefer small focused interfaces over one fat interface</li>
  <li><strong>D</strong>ependency Inversion: depend on abstractions, not concretions</li>
</ul>

<h3>Java 8+ Default Methods</h3>
<pre><code>interface Greeter {
    String greet(String name);

    // Default method — concrete, but overridable
    default String greetPolitely(String name) {
        return "Dear " + greet(name);
    }
}</code></pre>
<p>Default methods let you add new behavior to existing interfaces without breaking all implementations — critical for evolving APIs.</p>',
  company_note = 'Spring Boot itself is built on this pattern: you inject interfaces (e.g. LessonService), not implementations (LessonServiceImpl). This is what makes your app testable — swap the real impl for a mock in tests without changing the controller.'
WHERE sort_order = 2;

-- Lesson 3: Streams & Lambdas
UPDATE lessons SET
  content_html = '<h3>Why This Is Asked</h3>
<p>Java 8 Streams are standard in modern Java shops. Interviewers expect you to refactor imperative loops into clean stream chains and know the gotchas.</p>

<h3>Stream Pipeline Anatomy</h3>
<pre><code>list.stream()           // source
    .filter(x -> x > 0) // intermediate (lazy)
    .map(x -> x * 2)    // intermediate (lazy)
    .collect(toList());  // terminal (triggers execution)</code></pre>
<p>Intermediate operations are <strong>lazy</strong> — nothing runs until a terminal operation is called.</p>

<h3>Key Operations</h3>
<ul>
  <li><code>filter(Predicate)</code> — keep elements matching condition</li>
  <li><code>map(Function)</code> — transform each element</li>
  <li><code>flatMap(Function)</code> — flatten nested lists</li>
  <li><code>collect(Collectors.toList())</code> — gather into collection</li>
  <li><code>reduce(identity, BinaryOperator)</code> — fold into single value</li>
  <li><code>findFirst()</code>, <code>anyMatch()</code>, <code>count()</code> — short-circuit terminals</li>
</ul>

<h3>Optional</h3>
<p>A container that may or may not hold a value — eliminates null checks and NullPointerException.</p>
<pre><code>Optional&lt;User&gt; user = userRepo.findById(id);
String name = user
    .map(User::getName)
    .orElse("Unknown");</code></pre>

<h3>Method References</h3>
<pre><code>// Lambda
list.forEach(s -> System.out.println(s));
// Method reference (cleaner)
list.forEach(System.out::println);</code></pre>

<h3>Parallel Streams — Use With Caution</h3>
<ul>
  <li><code>list.parallelStream()</code> splits work across the ForkJoinPool</li>
  <li>Avoid for small lists — thread overhead outweighs gain</li>
  <li>Never use with stateful operations or shared mutable state</li>
  <li>Order is not guaranteed in parallel streams</li>
</ul>

<h3>Interview Pattern: Replace a For-Loop</h3>
<pre><code>// Imperative
List&lt;String&gt; result = new ArrayList&lt;&gt;();
for (User u : users) {
    if (u.isActive()) result.add(u.getEmail().toUpperCase());
}

// Stream (preferred in interviews)
List&lt;String&gt; result = users.stream()
    .filter(User::isActive)
    .map(u -> u.getEmail().toUpperCase())
    .collect(Collectors.toList());</code></pre>',
  company_note = 'In payment processing, streams are used to filter transactions, aggregate totals, and transform API response payloads. Being fluent in streams shows you write modern, readable Java — a signal interviewers look for.'
WHERE sort_order = 3;

-- Lesson 4: Exception Handling Patterns
UPDATE lessons SET
  content_html = '<h3>Why This Is Asked</h3>
<p>Poor exception handling is one of the most common issues in production codebases. Interviewers test whether you know how to fail safely and informatively.</p>

<h3>Checked vs Unchecked Exceptions</h3>
<ul>
  <li><strong>Checked</strong> (extends <code>Exception</code>): caller MUST handle or declare. Examples: <code>IOException</code>, <code>SQLException</code>. Use for recoverable conditions where the caller can reasonably respond.</li>
  <li><strong>Unchecked</strong> (extends <code>RuntimeException</code>): caller does not have to handle. Examples: <code>NullPointerException</code>, <code>IllegalArgumentException</code>. Use for programming errors and validation failures.</li>
</ul>
<p><strong>Modern preference:</strong> Unchecked exceptions. Checked exceptions pollute method signatures and encourage empty catch blocks.</p>

<h3>Custom Exception</h3>
<pre><code>// Extend RuntimeException for unchecked
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " not found with id: " + id);
    }
}</code></pre>

<h3>The Anti-Pattern: Swallowing Exceptions</h3>
<pre><code>// NEVER do this
try {
    process();
} catch (Exception e) {
    // silent — the worst thing you can do
    return ResponseEntity.ok("success"); // lies!
}</code></pre>

<h3>@RestControllerAdvice Pattern (Spring Boot)</h3>
<pre><code>@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return new ErrorResponse(msg);
    }
}</code></pre>
<p>One central place handles all exceptions. Controllers stay clean — they just throw, never catch.</p>',
  company_note = 'In financial APIs, every exception must be caught and mapped to a meaningful response — never expose stack traces or internal details to clients. The @RestControllerAdvice pattern is exactly what interviewers expect you to know for Spring Boot roles.'
WHERE sort_order = 4;

-- Lesson 5: Concurrency: Threads & Executors
UPDATE lessons SET
  content_html = '<h3>Why This Is Asked</h3>
<p>Concurrency bugs are subtle, hard to reproduce, and expensive. Senior Java roles expect you to write thread-safe code and reason about race conditions.</p>

<h3>Thread vs Runnable vs Callable</h3>
<pre><code>// Runnable — no return value, no checked exception
Runnable r = () -> System.out.println("running");

// Callable — returns a value, can throw checked exceptions
Callable&lt;Integer&gt; c = () -> compute();

// Thread — wraps Runnable, call start() not run()
new Thread(r).start();</code></pre>

<h3>ExecutorService</h3>
<pre><code>ExecutorService pool = Executors.newFixedThreadPool(4);
Future&lt;Integer&gt; future = pool.submit(() -> compute());
Integer result = future.get(); // blocks until done
pool.shutdown(); // always shut down when done</code></pre>
<p><strong>Why not raw Thread?</strong> ExecutorService manages a thread pool — thread creation is expensive. Reusing threads is far more efficient.</p>

<h3>volatile vs synchronized</h3>
<ul>
  <li><code>volatile</code>: guarantees visibility (changes by one thread are immediately visible to others). Does NOT guarantee atomicity. Good for simple flags: <code>private volatile boolean running = true;</code></li>
  <li><code>synchronized</code>: guarantees both visibility AND atomicity. Use for compound operations (check-then-act, read-modify-write).</li>
</ul>

<h3>Common Race Condition</h3>
<pre><code>// NOT thread-safe
if (map.containsKey(key)) {       // check
    return map.get(key);           // act — another thread could remove between check and act!
}

// Thread-safe
return map.computeIfAbsent(key, k -> createValue(k));</code></pre>

<h3>CompletableFuture (Java 8+)</h3>
<pre><code>CompletableFuture.supplyAsync(() -> fetchUser(id))
    .thenApply(user -> enrichUser(user))
    .thenAccept(user -> save(user))
    .exceptionally(ex -> { log.error("failed", ex); return null; });</code></pre>
<p>Non-blocking async pipeline. Much cleaner than raw Future.</p>',
  company_note = 'Payment systems process thousands of concurrent transactions. Race conditions on account balances are catastrophic. Interviewers at fintech companies will probe your concurrency knowledge harder than average — know volatile, synchronized, and when to use each.'
WHERE sort_order = 5;

-- Lesson 6: Spring Boot 3.x Architecture
UPDATE lessons SET
  content_html = '<h3>Why This Is Asked</h3>
<p>Spring Boot is the dominant Java framework. Interviewers expect you to explain its magic — not just use it.</p>

<h3>Auto-Configuration</h3>
<p>Spring Boot scans the classpath and automatically configures beans based on what it finds. Add <code>spring-boot-starter-data-jpa</code> and Spring Boot auto-configures a DataSource, EntityManagerFactory, and transaction management — you write zero config XML.</p>
<p>Under the hood: <code>@EnableAutoConfiguration</code> reads <code>META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports</code> and loads matching configuration classes.</p>

<h3>Starter Dependencies</h3>
<p>Starters are dependency aggregators. <code>spring-boot-starter-web</code> pulls in Spring MVC, Jackson, Tomcat, and validation — all at compatible versions. No more dependency hell.</p>

<h3>Layered Architecture</h3>
<pre><code>@RestController          // HTTP layer — handles requests, returns responses
class LessonController {
    private final LessonService service; // inject interface, not impl

    @GetMapping("/lessons")
    List&lt;LessonSummaryDto&gt; getAll() { return service.getAll(); }
}

@Service                 // Business logic layer
class LessonServiceImpl implements LessonService { ... }

@Repository              // Data access layer
interface LessonRepository extends JpaRepository&lt;Lesson, Long&gt; { ... }</code></pre>

<h3>Constructor Injection (Always Preferred)</h3>
<pre><code>// BAD — field injection (not testable without Spring context)
@Autowired
private LessonService service;

// GOOD — constructor injection (testable, immutable, explicit)
private final LessonService service;

public LessonController(LessonService service) {
    this.service = service;
}</code></pre>
<p>Constructor injection: dependencies are explicit, the class is testable with plain Mockito, and fields can be final (immutable).</p>

<h3>DTO Pattern</h3>
<p>Never expose JPA entities directly in API responses. Entities can trigger lazy-loading issues, expose internal fields, and couple your API to your DB schema. Use DTOs (Data Transfer Objects) as the public contract.</p>',
  company_note = 'Every Spring Boot project at a company like Fiserv follows this layered pattern. When an interviewer asks "how does Spring Boot work?", they expect you to describe auto-configuration and the Controller → Service → Repository stack without hesitation.'
WHERE sort_order = 6;
