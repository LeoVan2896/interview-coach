-- V8__expand_lesson_library.sql
-- Adds 27 new lessons across 8 categories (sort_order 7–33)
-- Each lesson is a separate INSERT to avoid escaping complexity in multi-value statements

-- ============================================================
-- JAVA_CORE (sort_order 7–11)
-- ============================================================

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'JAVA_CORE',
  'Java Memory Model & Garbage Collection',
  'Stack vs Heap · Young/Old Gen · GC roots · G1GC regions · how to diagnose OutOfMemoryError and StackOverflowError',
  'ADVANCED', 55, 'NOT_STARTED', 7,
  '<h3>Why This Is Asked</h3>
<p>Memory management questions separate intermediate developers from seniors. Interviewers want to know you understand what the JVM does automatically — and what can go wrong.</p>

<h3>Stack vs Heap</h3>
<ul>
  <li><strong>Stack:</strong> One per thread. Stores method frames, local variables, and object references (not the objects themselves). Operates LIFO — pushed on method call, popped on return. Automatically reclaimed — no GC needed. <code>StackOverflowError</code> = infinite recursion filling the stack.</li>
  <li><strong>Heap:</strong> Shared across all threads. All <code>new</code> allocations go here. Managed by the Garbage Collector. <code>OutOfMemoryError</code> when exhausted.</li>
</ul>
<pre><code>void process() {
    int x = 42;                // x lives on the Stack (primitive)
    User user = new User();    // ''user'' reference on Stack, User object on Heap
}
// Method returns → stack frame popped → reference gone → User eligible for GC</code></pre>

<h3>Heap Generations</h3>
<ul>
  <li><strong>Young Gen (Eden + S0/S1 Survivors):</strong> New objects land here. Minor GC is fast and frequent.</li>
  <li><strong>Old Gen (Tenured):</strong> Objects promoted after surviving multiple Minor GCs. Major GC is slow and infrequent.</li>
  <li><strong>Metaspace (Java 8+):</strong> Class metadata in native memory. Replaced PermGen. Grows dynamically.</li>
</ul>

<h3>GC Roots</h3>
<p>Starting points the GC traces to find live objects: active thread stacks, static fields, JNI references. Any object NOT reachable from a GC root is eligible for collection.</p>

<h3>G1GC (Default Since Java 9)</h3>
<ul>
  <li>Divides heap into equal-sized regions (~1–32MB) instead of fixed generational areas</li>
  <li>Collects regions with the most garbage first ("Garbage First")</li>
  <li>Targets a configurable pause goal: <code>-XX:MaxGCPauseMillis=200</code></li>
  <li>Avoids full stop-the-world pauses via concurrent marking</li>
</ul>

<h3>Common Interview Question</h3>
<p><em>"What happens in memory when you call <code>new User()</code> inside a method?"</em></p>
<p>The reference lives on the Stack. The <code>User</code> object is allocated in Eden (Young Gen). When the method returns, the reference disappears. At the next Minor GC, if nothing else references that <code>User</code>, it is collected. If it survives multiple GCs, it is promoted to Old Gen.</p>',
  'In fintech systems, OutOfMemoryError in production often means a memory leak — holding references too long (e.g., caching too aggressively, unclosed streams). Knowing GC tuning flags (-Xmx, -XX:MaxGCPauseMillis) signals you can operate production JVMs, not just write code for them.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'JAVA_CORE',
  'Design Patterns: Singleton, Factory, Builder, Strategy',
  'The four most-tested GoF patterns · how Spring implements each · when to use Builder over constructors · Strategy vs if/else chains',
  'INTERMEDIATE', 50, 'NOT_STARTED', 8,
  '<h3>Why This Is Asked</h3>
<p>These four patterns appear in virtually every Java codebase. Interviewers expect you to name them, implement them, and — critically — explain when NOT to use them.</p>

<h3>Singleton — One Instance Globally</h3>
<pre><code>public class ConfigService {
    private static volatile ConfigService instance;
    private ConfigService() {}

    public static ConfigService getInstance() {
        if (instance == null) {
            synchronized (ConfigService.class) {
                if (instance == null) instance = new ConfigService();
            }
        }
        return instance;
    }
}</code></pre>
<p><strong>volatile</strong> prevents CPU instruction reordering. The double-checked locking prevents thread races. In Spring, every <code>@Bean</code> is a Singleton by default — Spring manages the single instance for you.</p>

<h3>Factory — Hide Construction Logic</h3>
<pre><code>public interface PaymentProcessor { void process(double amount); }

public class PaymentFactory {
    public static PaymentProcessor create(String type) {
        return switch (type) {
            case "CREDIT" -> new CreditCardProcessor();
            case "ACH"    -> new AchProcessor();
            default -> throw new IllegalArgumentException("Unknown: " + type);
        };
    }
}</code></pre>
<p>The caller gets a <code>PaymentProcessor</code> without knowing the concrete type — decoupling caller from implementation.</p>

<h3>Builder — Readable Object Construction</h3>
<pre><code>User user = User.builder()
    .name("Huy")
    .email("huy@example.com")
    .role("ADMIN")
    .build();</code></pre>
<p><strong>When to use:</strong> 4+ parameters, especially optional ones. Constructors with many optional params become unreadable (which arg is which?). Lombok''s <code>@Builder</code> generates this automatically.</p>

<h3>Strategy — Swappable Algorithms</h3>
<pre><code>public interface SortStrategy { void sort(int[] data); }

public class SortContext {
    private SortStrategy strategy;
    public void setStrategy(SortStrategy s) { this.strategy = s; }
    public void sort(int[] data) { strategy.sort(data); }
}

// Usage — swap at runtime
ctx.setStrategy(new QuickSort());
ctx.sort(arr);</code></pre>
<p>Strategy replaces <code>if/else</code> chains. When you add a new algorithm, you add a class — you don''t modify existing code (Open/Closed Principle).</p>',
  'Factory pattern is everywhere in Spring — @Configuration classes return beans via @Bean methods (factory methods). Builder is the pattern behind Spring Security''s HttpSecurity fluent API. Strategy is how Spring MVC selects the right HandlerAdapter for different controller types.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'JAVA_CORE',
  'String Internals: Pool, Immutability & StringBuilder',
  'Why String is immutable · String pool and interning · == vs .equals() · when to use StringBuilder · thread safety comparison',
  'INTERMEDIATE', 35, 'NOT_STARTED', 9,
  '<h3>Why This Is Asked</h3>
<p>String is the most-used class in Java. Interviewers test whether you understand its performance characteristics and the pitfalls of naive string concatenation.</p>

<h3>String is Immutable</h3>
<p>Every operation on a String creates a new object. <strong>Three reasons:</strong></p>
<ul>
  <li><strong>Security:</strong> Strings are used as class names in classloaders, DB connection URLs, and file paths — mutability would be a security risk</li>
  <li><strong>Thread Safety:</strong> Immutable objects are inherently thread-safe — no synchronization needed</li>
  <li><strong>String Pool Efficiency:</strong> Multiple references can safely share the same interned string</li>
</ul>

<h3>The String Pool</h3>
<pre><code>String a = "hello";           // literal → goes to pool
String b = "hello";           // same pool reference returned
System.out.println(a == b);   // true — same reference

String c = new String("hello"); // forces new heap object
System.out.println(a == c);     // false — different reference
System.out.println(a.equals(c)); // true — same content

// Always use .equals() for String comparison, never ==
</code></pre>
<p><code>String.intern()</code> manually places a string into the pool and returns the canonical reference.</p>

<h3>String vs StringBuilder vs StringBuffer</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Property</th><th style="padding:6px;border:1px solid #e2e8f0">String</th><th style="padding:6px;border:1px solid #e2e8f0">StringBuilder</th><th style="padding:6px;border:1px solid #e2e8f0">StringBuffer</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Mutability</td><td style="padding:6px;border:1px solid #e2e8f0">Immutable</td><td style="padding:6px;border:1px solid #e2e8f0">Mutable</td><td style="padding:6px;border:1px solid #e2e8f0">Mutable</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Thread Safe</td><td style="padding:6px;border:1px solid #e2e8f0">Yes (immutable)</td><td style="padding:6px;border:1px solid #e2e8f0">No</td><td style="padding:6px;border:1px solid #e2e8f0">Yes (synchronized)</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Use When</td><td style="padding:6px;border:1px solid #e2e8f0">Fixed text, map keys</td><td style="padding:6px;border:1px solid #e2e8f0">Building strings in a loop</td><td style="padding:6px;border:1px solid #e2e8f0">Multi-thread string building (rare)</td></tr>
</table>

<h3>Performance Trap</h3>
<pre><code>// BAD — creates N intermediate String objects in a loop
String result = "";
for (String s : list) result += s;

// GOOD — one StringBuilder, one final toString()
StringBuilder sb = new StringBuilder();
for (String s : list) sb.append(s);
String result = sb.toString();</code></pre>',
  'In API services that build dynamic SQL, XML, or JSON responses by concatenation, using String + in a loop causes O(n²) memory allocation. Every code review at a Java shop will flag this. Knowing why — not just that you should use StringBuilder — shows depth.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'JAVA_CORE',
  'equals(), hashCode() Contract & Sorting',
  'The contract interviewers always test · what breaks when you violate it · Comparable vs Comparator · how HashMap buckets work',
  'INTERMEDIATE', 40, 'NOT_STARTED', 10,
  '<h3>Why This Is Asked</h3>
<p>Violating the equals/hashCode contract is one of the most common silent bugs in Java. It breaks HashMap lookups in ways that are hard to debug.</p>

<h3>The Three-Rule Contract</h3>
<ol>
  <li>If <code>a.equals(b)</code> is <code>true</code>, then <code>a.hashCode() == b.hashCode()</code> must be <code>true</code></li>
  <li>If <code>a.hashCode() == b.hashCode()</code>, <code>a.equals(b)</code> may still be <code>false</code> (collision is allowed)</li>
  <li><code>hashCode()</code> must return the same value as long as the fields used in <code>equals()</code> have not changed</li>
</ol>

<h3>What Breaks When You Violate It</h3>
<pre><code>// Override equals() only — NOT hashCode()
class User {
    String email;
    @Override public boolean equals(Object o) {
        return ((User)o).email.equals(this.email);
    }
    // hashCode() NOT overridden — uses default Object identity hash
}

Map&lt;User, String&gt; map = new HashMap&lt;&gt;();
User u1 = new User("huy@example.com");
map.put(u1, "admin");

User u2 = new User("huy@example.com");
// u1.equals(u2) == true, but u1.hashCode() != u2.hashCode()
map.get(u2); // returns NULL — HashMap looks in the wrong bucket!</code></pre>

<h3>How HashMap Uses hashCode</h3>
<p>HashMap divides its internal array into buckets. It uses <code>key.hashCode()</code> to determine which bucket to look in. If two equal objects have different hashCodes, they land in different buckets — <code>get()</code> never finds the key.</p>

<h3>Comparable vs Comparator</h3>
<pre><code>// Comparable — natural ordering built into the class
public class Employee implements Comparable&lt;Employee&gt; {
    public int compareTo(Employee other) {
        return this.salary - other.salary; // ascending
    }
}
Collections.sort(employees); // uses compareTo

// Comparator — external, multiple orderings possible
Comparator&lt;Employee&gt; byName = Comparator.comparing(Employee::getName);
Comparator&lt;Employee&gt; byNameThenSalary = byName.thenComparingInt(Employee::getSalary);
employees.sort(byNameThenSalary);</code></pre>
<p><strong>Rule:</strong> Use <code>Comparable</code> when there is one obvious "natural" order. Use <code>Comparator</code> when you need multiple sort orders or cannot modify the class.</p>',
  'In Spring Data JPA, if you use entity objects as Map keys or in Sets (e.g., caching), violating the equals/hashCode contract causes silent data loss. This is especially dangerous in fintech where transaction deduplication logic might silently fail to detect duplicates.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'JAVA_CORE',
  'Java 11–17: Records, Sealed Classes & Pattern Matching',
  'Records replace POJO boilerplate · Sealed Classes for controlled hierarchies · Text Blocks · Pattern Matching instanceof',
  'INTERMEDIATE', 40, 'NOT_STARTED', 11,
  '<h3>Why This Is Asked</h3>
<p>Java interviews increasingly target Java 14–17 features. Companies migrating from Java 8/11 want developers who know what these features offer and when to use them.</p>

<h3>Records (Java 16)</h3>
<p>Immutable data carriers. Auto-generates: constructor, accessors, <code>equals()</code>, <code>hashCode()</code>, <code>toString()</code>.</p>
<pre><code>// Before Records — ~50 lines of boilerplate
public record User(String name, String email) {}

// Usage
User u = new User("Huy", "huy@example.com");
u.name();    // accessor (NOT getName())
u.email();

// Records are perfect for DTOs:
public record LessonSummaryDto(Long id, String title, String status) {}</code></pre>
<p><strong>Limitations:</strong> Cannot extend other classes, fields are always final, no mutable state. Use for data — not behavior.</p>

<h3>Sealed Classes (Java 17)</h3>
<p>Restricts which classes can extend a type — creates closed, exhaustive hierarchies:</p>
<pre><code>public sealed interface Shape permits Circle, Rectangle, Triangle {}
public record Circle(double radius) implements Shape {}
public record Rectangle(double w, double h) implements Shape {}

// Compiler knows ALL subtypes — warns on non-exhaustive switch
double area = switch (shape) {
    case Circle c    -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.w() * r.h();
    case Triangle t  -> 0.5 * t.base() * t.height();
    // No default needed — compiler knows all cases are covered
};</code></pre>

<h3>Text Blocks (Java 15)</h3>
<pre><code>// Before
String json = "{\n    \"name\": \"Huy\",\n    \"role\": \"admin\"\n}";

// With Text Blocks
String json = """
        {
            "name": "Huy",
            "role": "admin"
        }
        """;
// Indentation stripped relative to the closing """</code></pre>

<h3>Pattern Matching for instanceof (Java 16)</h3>
<pre><code>// Before
if (obj instanceof String) {
    String s = (String) obj; // redundant cast
    System.out.println(s.toUpperCase());
}

// Java 16+
if (obj instanceof String s) {
    System.out.println(s.toUpperCase()); // s already typed, no cast needed
}</code></pre>',
  'Records are ideal for Spring Boot DTOs — they replace classes that only hold data and would otherwise need Lombok. Many Spring Boot 3.x codebases use Records for @RequestBody DTOs and repository projections. Knowing this shows you write modern Java, not Java 8 with a newer JDK.'
);

-- ============================================================
-- SPRING_BOOT (sort_order 12–14)
-- ============================================================

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SPRING_BOOT',
  'Dependency Injection & the Spring Bean Lifecycle',
  '@Component vs @Service vs @Repository vs @Bean · constructor vs field injection · ApplicationContext lifecycle · @PostConstruct and @PreDestroy',
  'INTERMEDIATE', 50, 'NOT_STARTED', 12,
  '<h3>Why This Is Asked</h3>
<p>Spring''s IoC container is the foundation of every Spring Boot app. Interviewers want to know you understand what the annotations DO, not just that they exist.</p>

<h3>Stereotype Annotations</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Annotation</th><th style="padding:6px;border:1px solid #e2e8f0">Layer</th><th style="padding:6px;border:1px solid #e2e8f0">Extra Behavior</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">@Component</td><td style="padding:6px;border:1px solid #e2e8f0">Generic</td><td style="padding:6px;border:1px solid #e2e8f0">None — base annotation</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">@Service</td><td style="padding:6px;border:1px solid #e2e8f0">Business Logic</td><td style="padding:6px;border:1px solid #e2e8f0">Semantic marker only</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">@Repository</td><td style="padding:6px;border:1px solid #e2e8f0">Data Access</td><td style="padding:6px;border:1px solid #e2e8f0">Translates persistence exceptions to Spring DataAccessException</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">@RestController</td><td style="padding:6px;border:1px solid #e2e8f0">Web</td><td style="padding:6px;border:1px solid #e2e8f0">@Controller + @ResponseBody — returns JSON automatically</td></tr>
</table>

<h3>@Bean vs @Component</h3>
<pre><code>// @Component — class-level, auto-detected by component scan
@Service
public class PaymentService { ... }

// @Bean — method-level in @Configuration, for third-party classes you don''t own
@Configuration
public class AppConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper().findAndRegisterModules();
    }
}</code></pre>

<h3>Constructor Injection — Always Preferred</h3>
<pre><code>// BAD — field injection
@Service
public class OrderService {
    @Autowired
    private PaymentRepository repo; // hidden dependency, hard to test
}

// GOOD — constructor injection
@Service
public class OrderService {
    private final PaymentRepository repo; // final! immutable!

    public OrderService(PaymentRepository repo) {
        this.repo = repo; // explicit, testable without Spring
    }
}</code></pre>

<h3>Bean Lifecycle</h3>
<ol>
  <li><code>SpringApplication.run()</code> starts, component scan finds annotated classes</li>
  <li>Beans instantiated, dependencies injected via constructors</li>
  <li><code>@PostConstruct</code> method called — one-time initialization</li>
  <li>Application ready, beans serve requests</li>
  <li>On shutdown: <code>@PreDestroy</code> method called — cleanup</li>
</ol>
<pre><code>@Service
public class CacheService {
    @PostConstruct
    public void init() { /* load initial data */ }

    @PreDestroy
    public void cleanup() { /* flush cache, close connections */ }
}</code></pre>',
  'Every Spring Boot project uses this pattern. When your interviewer asks "how does Spring know what to inject?", the answer is component scanning + constructor injection. @Repository''s exception translation is why JPA''s PersistenceException becomes a Spring DataAccessException — this is why you only catch Spring exceptions in service code.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SPRING_BOOT',
  'Spring MVC: Controllers, Routing & Validation',
  '@RestController · @GetMapping/@PostMapping · @PathVariable vs @RequestParam · @RequestBody · @Valid and Bean Validation · ResponseEntity',
  'INTERMEDIATE', 45, 'NOT_STARTED', 13,
  '<h3>Why This Is Asked</h3>
<p>Spring MVC is the HTTP layer of every REST API. You must be able to explain what each annotation does and how the request-handling pipeline works end to end.</p>

<h3>Full Controller Example</h3>
<pre><code>@RestController  // = @Controller + @ResponseBody on every method
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // GET /api/v1/users/42
    @GetMapping("/{id}")
    public ResponseEntity&lt;UserDto&gt; getUser(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // GET /api/v1/users?page=2&size=10
    @GetMapping
    public List&lt;UserDto&gt; listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.findAll(page, size);
    }

    // POST /api/v1/users  body: {"name":"Huy","email":"..."}
    @PostMapping
    public ResponseEntity&lt;UserDto&gt; createUser(@RequestBody @Valid CreateUserRequest req) {
        UserDto created = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}</code></pre>

<h3>Key Annotation Breakdown</h3>
<ul>
  <li><strong>@RestController:</strong> Combines @Controller + @ResponseBody. Return values are serialized to JSON via Jackson automatically.</li>
  <li><strong>@PathVariable:</strong> Extracts <code>{id}</code> from the URI path — use for resource identification.</li>
  <li><strong>@RequestParam:</strong> Extracts <code>?page=2</code> from query string — use for filtering, pagination, sorting.</li>
  <li><strong>@RequestBody:</strong> Deserializes the HTTP body (Jackson by default).</li>
  <li><strong>@Valid:</strong> Triggers Bean Validation on the parameter. Throws <code>MethodArgumentNotValidException</code> on failure → your @RestControllerAdvice catches it and returns 400.</li>
</ul>

<h3>Bean Validation Annotations</h3>
<pre><code>public record CreateUserRequest(
    @NotBlank String name,
    @Email @NotNull String email,
    @Min(0) @Max(150) int age,
    @Size(min = 8) String password
) {}</code></pre>',
  'This is the exact pattern used in every Spring Boot REST service. When you can explain the full request lifecycle — HTTP request → DispatcherServlet → HandlerMapping → Controller → Service → Repository → response — you demonstrate you understand the framework, not just its annotations.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SPRING_BOOT',
  'Spring Boot Testing: @WebMvcTest, @DataJpaTest, @SpringBootTest',
  'When to use each test slice · MockMvc patterns · @MockBean vs @Mock · @DataJpaTest with H2 · avoiding slow full-context tests',
  'INTERMEDIATE', 50, 'NOT_STARTED', 14,
  '<h3>Why This Is Asked</h3>
<p>Spring Boot has three test annotations that load different slices of the context. Choosing the right one shows you care about test speed and isolation — a sign of a mature developer.</p>

<h3>Test Slice Comparison</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Annotation</th><th style="padding:6px;border:1px solid #e2e8f0">Context Loaded</th><th style="padding:6px;border:1px solid #e2e8f0">Speed</th><th style="padding:6px;border:1px solid #e2e8f0">Use For</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">@SpringBootTest</td><td style="padding:6px;border:1px solid #e2e8f0">Full app</td><td style="padding:6px;border:1px solid #e2e8f0">Slow</td><td style="padding:6px;border:1px solid #e2e8f0">End-to-end integration tests</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">@WebMvcTest</td><td style="padding:6px;border:1px solid #e2e8f0">Web layer only</td><td style="padding:6px;border:1px solid #e2e8f0">Fast</td><td style="padding:6px;border:1px solid #e2e8f0">Controller unit tests</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">@DataJpaTest</td><td style="padding:6px;border:1px solid #e2e8f0">JPA + in-memory DB</td><td style="padding:6px;border:1px solid #e2e8f0">Fast</td><td style="padding:6px;border:1px solid #e2e8f0">Repository query tests</td></tr>
</table>

<h3>@WebMvcTest Pattern</h3>
<pre><code>@WebMvcTest(LessonController.class)
class LessonControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean LessonService lessonService; // registers mock IN Spring context

    @Test
    void getLesson_returns200() throws Exception {
        when(lessonService.getLessonById(1L))
            .thenReturn(new LessonDetailDto(1L, "Collections", ...));

        mockMvc.perform(get("/api/v1/lessons/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.title").value("Collections"));
    }

    @Test
    void getLesson_notFound_returns404() throws Exception {
        when(lessonService.getLessonById(99L))
            .thenThrow(new ResourceNotFoundException("Lesson", 99L));

        mockMvc.perform(get("/api/v1/lessons/99"))
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.message").exists());
    }
}</code></pre>

<h3>@MockBean vs @Mock</h3>
<ul>
  <li><strong>@MockBean:</strong> Creates a Mockito mock AND registers it in the Spring context, replacing the real bean. Use in @WebMvcTest and @SpringBootTest.</li>
  <li><strong>@Mock:</strong> Pure Mockito — no Spring involvement. Use in plain unit tests with @ExtendWith(MockitoExtension.class).</li>
</ul>

<h3>@DataJpaTest Pattern</h3>
<pre><code>@DataJpaTest // uses H2 in-memory; rolls back after each test
class LessonRepositoryTest {
    @Autowired LessonRepository repo;

    @Test
    void findByCategory_returnsMatchingLessons() {
        repo.save(new Lesson("JAVA_CORE", "Collections", ...));
        List&lt;Lesson&gt; results = repo.findByCategory("JAVA_CORE");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Collections");
    }
}</code></pre>',
  'In a Java shop, you will be judged on your tests as much as your implementation. Using @SpringBootTest for everything is a red flag — it shows you don''t understand test isolation or why slow tests hurt CI pipelines. @WebMvcTest + @MockBean is the pattern you should know cold.'
);

-- ============================================================
-- REST_APIS (sort_order 15–17)
-- ============================================================

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'REST_APIS',
  'REST Principles & HTTP Method Semantics',
  'The 6 REST constraints · GET/POST/PUT/PATCH/DELETE — what each means · idempotency · safe methods',
  'INTERMEDIATE', 45, 'NOT_STARTED', 15,
  '<h3>Why This Is Asked</h3>
<p>Most developers use HTTP verbs cargo-culted from examples without knowing what they mean. Interviewers want to know you understand the semantics — not just the convention.</p>

<h3>The 6 REST Constraints</h3>
<ol>
  <li><strong>Client-Server:</strong> UI and data storage separated — they evolve independently</li>
  <li><strong>Stateless:</strong> Each request contains ALL context needed — server stores no session</li>
  <li><strong>Cacheable:</strong> Responses must declare whether they can be cached</li>
  <li><strong>Uniform Interface:</strong> Resources identified by URI; standard HTTP verbs; representation in body</li>
  <li><strong>Layered System:</strong> Client doesn''t know if it''s talking to a real server, proxy, or CDN</li>
  <li><strong>Code on Demand (optional):</strong> Server can send executable code (JavaScript)</li>
</ol>

<h3>HTTP Method Semantics</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Method</th><th style="padding:6px;border:1px solid #e2e8f0">Idempotent</th><th style="padding:6px;border:1px solid #e2e8f0">Safe</th><th style="padding:6px;border:1px solid #e2e8f0">Typical Use</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">GET</td><td style="padding:6px;border:1px solid #e2e8f0">Yes</td><td style="padding:6px;border:1px solid #e2e8f0">Yes</td><td style="padding:6px;border:1px solid #e2e8f0">Read a resource</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">POST</td><td style="padding:6px;border:1px solid #e2e8f0">No</td><td style="padding:6px;border:1px solid #e2e8f0">No</td><td style="padding:6px;border:1px solid #e2e8f0">Create a resource</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">PUT</td><td style="padding:6px;border:1px solid #e2e8f0">Yes</td><td style="padding:6px;border:1px solid #e2e8f0">No</td><td style="padding:6px;border:1px solid #e2e8f0">Full replacement</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">PATCH</td><td style="padding:6px;border:1px solid #e2e8f0">Usually</td><td style="padding:6px;border:1px solid #e2e8f0">No</td><td style="padding:6px;border:1px solid #e2e8f0">Partial update</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">DELETE</td><td style="padding:6px;border:1px solid #e2e8f0">Yes</td><td style="padding:6px;border:1px solid #e2e8f0">No</td><td style="padding:6px;border:1px solid #e2e8f0">Remove a resource</td></tr>
</table>
<p><strong>Safe</strong> = no side effects (read-only). <strong>Idempotent</strong> = multiple identical requests produce the same result as one.</p>

<h3>PUT vs PATCH — The Key Difference</h3>
<pre><code>// PUT — replaces the ENTIRE resource
PUT /users/1
{"name": "Huy"}
// email, role, etc. are all set to null — omitted fields are wiped!

// PATCH — applies a PARTIAL update
PATCH /users/1
{"name": "Huy"}
// Only name changes; email, role remain unchanged</code></pre>',
  'This lesson explains why your PATCH /lessons/:id/status endpoint in this project uses PATCH — not PUT. It only changes the status field; PUT would overwrite the entire lesson. In financial APIs, using the wrong verb can have real consequences: a PUT to update a name that wipes account type is a production incident.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'REST_APIS',
  'HTTP Status Codes: Which to Use When',
  '2xx/3xx/4xx/5xx meanings · 201 vs 200 · 401 vs 403 · 409 vs 422 · what 503 tells clients to do',
  'INTERMEDIATE', 30, 'NOT_STARTED', 16,
  '<h3>Why This Is Asked</h3>
<p>Returning the wrong status code is one of the most common REST API mistakes. Interviewers specifically ask "what''s the difference between 401 and 403?" — it''s a shibboleth for REST literacy.</p>

<h3>2xx — Success</h3>
<ul>
  <li><strong>200 OK:</strong> General success — GET, PUT, PATCH responses</li>
  <li><strong>201 Created:</strong> POST that created a resource. Include <code>Location</code> header with the new resource URI: <code>Location: /api/v1/users/42</code></li>
  <li><strong>204 No Content:</strong> DELETE succeeded, nothing to return</li>
  <li><strong>202 Accepted:</strong> Async processing started — result not yet known</li>
</ul>

<h3>4xx — Client Error (Their Fault)</h3>
<ul>
  <li><strong>400 Bad Request:</strong> Malformed syntax, invalid JSON</li>
  <li><strong>401 Unauthorized:</strong> Not authenticated — no valid credentials. Fix: log in.</li>
  <li><strong>403 Forbidden:</strong> Authenticated but not authorized. Fix: request permission from admin.</li>
  <li><strong>404 Not Found:</strong> Resource doesn''t exist</li>
  <li><strong>409 Conflict:</strong> State conflict — duplicate email, optimistic lock failure</li>
  <li><strong>422 Unprocessable Entity:</strong> Syntactically valid but semantically wrong — preferred for validation errors over 400</li>
  <li><strong>429 Too Many Requests:</strong> Rate limit exceeded — include <code>Retry-After</code> header</li>
</ul>

<h3>5xx — Server Error (Your Fault)</h3>
<ul>
  <li><strong>500 Internal Server Error:</strong> Generic failure — client can retry</li>
  <li><strong>502 Bad Gateway:</strong> Upstream service returned invalid response</li>
  <li><strong>503 Service Unavailable:</strong> Overloaded or in maintenance — include <code>Retry-After</code></li>
  <li><strong>504 Gateway Timeout:</strong> Upstream service didn''t respond in time</li>
</ul>

<h3>The 401 vs 403 Trap</h3>
<p><strong>401 Unauthorized</strong> is confusingly named — it actually means "unauthenticated." The client has not proven who they are. Logging in with valid credentials will fix it.</p>
<p><strong>403 Forbidden</strong> means the server knows WHO you are, but you don''t have permission. Logging in again won''t help — you need an admin to grant access.</p>',
  'Returning 200 with an error body ("success: false") is a common anti-pattern in legacy fintech systems. It breaks HTTP clients, monitoring tools, and load balancers that route based on status codes. Proper status codes let API gateways, circuit breakers, and retry logic work correctly without custom parsing.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'REST_APIS',
  'API Versioning Strategies',
  'URI vs Header vs Query Param versioning · pros and cons of each · Richardson Maturity Model levels 0–3 · why most APIs stop at Level 2',
  'INTERMEDIATE', 35, 'NOT_STARTED', 17,
  '<h3>Why This Is Asked</h3>
<p>Every API evolves. Interviewers ask about versioning to see if you understand backward compatibility — breaking a public API is a production incident.</p>

<h3>Three Main Strategies</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Strategy</th><th style="padding:6px;border:1px solid #e2e8f0">Example</th><th style="padding:6px;border:1px solid #e2e8f0">Pros</th><th style="padding:6px;border:1px solid #e2e8f0">Cons</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">URI versioning</td><td style="padding:6px;border:1px solid #e2e8f0">/api/v1/users</td><td style="padding:6px;border:1px solid #e2e8f0">Visible, cacheable, browser-testable</td><td style="padding:6px;border:1px solid #e2e8f0">Pollutes URIs</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Header versioning</td><td style="padding:6px;border:1px solid #e2e8f0">Api-Version: 2</td><td style="padding:6px;border:1px solid #e2e8f0">Clean URIs</td><td style="padding:6px;border:1px solid #e2e8f0">Not visible, harder to test</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Query param</td><td style="padding:6px;border:1px solid #e2e8f0">/users?version=2</td><td style="padding:6px;border:1px solid #e2e8f0">Easy to test</td><td style="padding:6px;border:1px solid #e2e8f0">Breaks caching</td></tr>
</table>
<p><strong>Recommendation:</strong> URI versioning. It is the most visible, routes cleanly in Nginx/API Gateway, and is browser-testable. This is why this project uses <code>/api/v1/</code>.</p>

<h3>Richardson Maturity Model</h3>
<ul>
  <li><strong>Level 0 — HTTP as tunnel:</strong> Single URI, all operations POSTed with action in body. This is SOAP/WSDL.</li>
  <li><strong>Level 1 — Resources:</strong> Multiple URIs per resource, but everything is POST.</li>
  <li><strong>Level 2 — HTTP Verbs:</strong> Correct use of GET/POST/PUT/PATCH/DELETE. Most real-world "REST" APIs are here.</li>
  <li><strong>Level 3 — HATEOAS:</strong> Responses include hypermedia links for next actions. True REST per Fielding. Rare in practice.</li>
</ul>
<pre><code>// Level 3 HATEOAS response example
{
  "id": 42,
  "status": "PENDING",
  "links": [
    {"rel": "approve", "href": "/orders/42/approve", "method": "POST"},
    {"rel": "cancel",  "href": "/orders/42/cancel",  "method": "DELETE"}
  ]
}</code></pre>',
  'Your project uses /api/v1/ — URI versioning. This is intentional and correct. When interviewers ask "why v1?", the answer is: to allow a non-breaking v2 rollout where the old clients continue working while new clients migrate at their own pace — critical in fintech where client upgrades are slow and contractual.'
);

-- ============================================================
-- JPA_HIBERNATE (sort_order 18–20)
-- ============================================================

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'JPA_HIBERNATE',
  'JPA Entity Mapping: @Entity, @Column, @GeneratedValue',
  '@Entity and @Table · @Id and GeneratedValue strategies · @Column constraints · updatable=false trick · why IDENTITY prevents batch inserts',
  'INTERMEDIATE', 45, 'NOT_STARTED', 18,
  '<h3>Why This Is Asked</h3>
<p>JPA entity mapping is the bridge between your Java objects and your database tables. Getting it wrong causes subtle bugs — wrong nullability, unexpected updates, or poor insert performance.</p>

<h3>Basic Entity</h3>
<pre><code>@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    // updatable=false: Hibernate never emits UPDATE for this column

    @Column(columnDefinition = "TEXT")
    private String bio; // no length limit, maps to TEXT in PostgreSQL
}</code></pre>

<h3>@GeneratedValue Strategies</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Strategy</th><th style="padding:6px;border:1px solid #e2e8f0">How It Works</th><th style="padding:6px;border:1px solid #e2e8f0">Note</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">IDENTITY</td><td style="padding:6px;border:1px solid #e2e8f0">DB auto-increment (SERIAL)</td><td style="padding:6px;border:1px solid #e2e8f0">Most common; prevents JDBC batch inserts</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">SEQUENCE</td><td style="padding:6px;border:1px solid #e2e8f0">DB sequence object</td><td style="padding:6px;border:1px solid #e2e8f0">Allows batching; Hibernate-preferred for performance</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">UUID</td><td style="padding:6px;border:1px solid #e2e8f0">App generates UUID</td><td style="padding:6px;border:1px solid #e2e8f0">No DB round-trip; ideal for distributed systems</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">AUTO</td><td style="padding:6px;border:1px solid #e2e8f0">JPA picks based on DB</td><td style="padding:6px;border:1px solid #e2e8f0">Unpredictable; avoid</td></tr>
</table>

<h3>Why IDENTITY Prevents Batch Inserts</h3>
<p>With <code>IDENTITY</code>, the database generates the ID upon INSERT — Hibernate must flush each INSERT immediately to get the generated key, which prevents batching multiple INSERTs into a single JDBC statement. With <code>SEQUENCE</code>, Hibernate pre-fetches a block of IDs and can batch all the INSERTs at once.</p>

<h3>Enum Mapping — Always Use STRING</h3>
<pre><code>@Enumerated(EnumType.STRING)  // stores "ACTIVE", not 0
@Column(nullable = false, length = 20)
private UserStatus status = UserStatus.ACTIVE;
// EnumType.ORDINAL stores integers — breaks if you reorder enum values!</code></pre>',
  'In a fintech system with high INSERT volume (transaction records), switching from GenerationType.IDENTITY to SEQUENCE with allocationSize=50 can dramatically improve throughput by enabling JDBC batch inserts. This is a real production optimization you can discuss with confidence.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'JPA_HIBERNATE',
  'JPA Relationships: @OneToMany, Cascade & orphanRemoval',
  'Owning side vs mappedBy · CascadeType.ALL · orphanRemoval vs CascadeType.REMOVE · bidirectional relationship pitfalls',
  'ADVANCED', 50, 'NOT_STARTED', 19,
  '<h3>Why This Is Asked</h3>
<p>JPA relationships are the most common source of bugs in Spring Boot applications: LazyInitializationException, unintended deletes, and infinite recursion in JSON serialization all come from misunderstanding this.</p>

<h3>Bidirectional @OneToMany</h3>
<pre><code>@Entity
public class Order {
    @OneToMany(
        mappedBy = "order",       // ''order'' = field name in OrderItem
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List&lt;OrderItem&gt; items = new ArrayList&lt;&gt;();
}

@Entity
public class OrderItem {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")  // FK column in order_item table
    private Order order;            // this side OWNS the relationship (has the FK)
}</code></pre>
<p><strong>Key rule:</strong> The child side (<code>@ManyToOne</code>) always owns the relationship — it holds the foreign key column. <code>mappedBy</code> on the parent tells JPA "the other side manages this."</p>

<h3>CascadeType.REMOVE vs orphanRemoval</h3>
<ul>
  <li><strong>CascadeType.REMOVE:</strong> When you delete the parent Order, its items are also deleted.</li>
  <li><strong>orphanRemoval = true:</strong> ALSO fires when you remove an item from the <code>items</code> list in memory — <code>order.getItems().remove(item)</code> — and the session is flushed. This deletes the item from the DB even though the parent Order was not deleted.</li>
</ul>

<h3>Cascade Types Reference</h3>
<ul>
  <li><code>PERSIST</code> — saving parent saves children</li>
  <li><code>MERGE</code> — merging parent merges children</li>
  <li><code>REMOVE</code> — deleting parent deletes children</li>
  <li><code>ALL</code> — all of the above (most common for parent-owns-children)</li>
</ul>

<h3>Bidirectional Helper Methods</h3>
<pre><code>// Always maintain both sides of the relationship in memory
public class Order {
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this); // keep the owning side in sync
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}</code></pre>',
  'In payment systems, Order → Transaction is a classic parent-child relationship. Using orphanRemoval incorrectly can delete transaction records when they''re removed from an in-memory list — a serious bug in financial systems. This is a nuance senior developers know; juniors don''t.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'JPA_HIBERNATE',
  'Lazy/Eager Loading, OSIV & the N+1 Problem',
  'Default fetch types · Open Session In View anti-pattern · N+1 problem · JOIN FETCH · @EntityGraph · batch fetching',
  'ADVANCED', 55, 'NOT_STARTED', 20,
  '<h3>Why This Is Asked</h3>
<p>The N+1 problem is the most common JPA performance bug. Every interviewer asking about Hibernate will eventually get here — knowing the detection and solutions is essential.</p>

<h3>Default Fetch Types</h3>
<ul>
  <li><code>@OneToMany</code> and <code>@ManyToMany</code> → <strong>LAZY</strong> by default (good — load on demand)</li>
  <li><code>@ManyToOne</code> and <code>@OneToOne</code> → <strong>EAGER</strong> by default (often causes problems)</li>
</ul>

<h3>The N+1 Problem</h3>
<pre><code>// 1 query: loads 100 orders
List&lt;Order&gt; orders = orderRepo.findAll();

// 100 MORE queries: one per order to load items
orders.forEach(o -&gt; System.out.println(o.getItems().size()));
// Total: 101 queries — performance disaster at scale</code></pre>

<h3>Solution 1 — JOIN FETCH</h3>
<pre><code>@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.status = :status")
List&lt;Order&gt; findWithItems(@Param("status") String status);
// 1 query with a JOIN — no N+1</code></pre>

<h3>Solution 2 — @EntityGraph</h3>
<pre><code>@EntityGraph(attributePaths = {"items", "customer"})
@Query("SELECT o FROM Order o WHERE o.status = :status")
List&lt;Order&gt; findWithItemsAndCustomer(@Param("status") String status);
// Loads specified associations eagerly in this query only</code></pre>

<h3>Solution 3 — Batch Fetching</h3>
<pre><code># application.properties
spring.jpa.properties.hibernate.default_batch_fetch_size=25
# When lazy collections are accessed, Hibernate loads them in batches of 25
# using IN clauses instead of one query per entity</code></pre>

<h3>OSIV — Open Session In View</h3>
<p>Spring Boot enables OSIV by default (<code>spring.jpa.open-in-view=true</code>). It keeps the Hibernate session open for the ENTIRE HTTP request, including JSON serialization — so lazy collections serialize without LazyInitializationException.</p>
<p><strong>The problem:</strong> This holds a DB connection for the entire request duration. Under load, this exhausts the connection pool.</p>
<pre><code># Disable OSIV in production
spring.jpa.open-in-view=false</code></pre>
<p>Then resolve lazy loading explicitly in the service layer using JOIN FETCH, @EntityGraph, or DTOs.</p>',
  'N+1 is a real production problem. A batch job that loads 10,000 orders and touches their items fires 10,001 queries instead of 1 — turning a 1-second job into 5 minutes. Enable SQL logging in development: spring.jpa.show-sql=true. If you see the same SELECT repeated with different IDs, you have an N+1.'
);

-- ============================================================
-- SPRING_SECURITY (sort_order 21–22)
-- ============================================================

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SPRING_SECURITY',
  'Spring Security: Authentication, Authorization & JWT',
  'Authentication vs Authorization · SecurityContext · JWT structure (header.payload.signature) · stateless auth flow · @AuthenticationPrincipal',
  'ADVANCED', 55, 'NOT_STARTED', 21,
  '<h3>Why This Is Asked</h3>
<p>Security is non-negotiable in fintech. Interviewers at banking and payment companies will probe your security knowledge more deeply than average.</p>

<h3>Authentication vs Authorization</h3>
<ul>
  <li><strong>Authentication:</strong> "Who are you?" — verify identity via password, token, certificate</li>
  <li><strong>Authorization:</strong> "What can you do?" — check permissions after identity is confirmed</li>
</ul>

<h3>JWT Structure</h3>
<p>A JWT is three Base64URL-encoded parts separated by dots: <code>header.payload.signature</code></p>
<pre><code>// Header — algorithm
{"alg": "HS256", "typ": "JWT"}

// Payload — claims (NOT encrypted — readable by anyone!)
{"sub": "huy@example.com", "role": "ADMIN", "exp": 1735689600}

// Signature — HMAC-SHA256 of header + payload using server secret
// Only the server can create valid signatures
HMAC-SHA256(base64(header) + "." + base64(payload), SECRET_KEY)</code></pre>
<p><strong>Important:</strong> JWT payload is Base64-encoded, not encrypted. Never put sensitive data (passwords, SSNs) in JWT claims.</p>

<h3>Stateless JWT Auth Flow in Spring Security</h3>
<ol>
  <li>Request arrives with <code>Authorization: Bearer &lt;token&gt;</code></li>
  <li><code>JwtAuthenticationFilter</code> extracts and validates the token (checks signature + expiry)</li>
  <li>Filter reads claims, creates <code>UsernamePasswordAuthenticationToken</code> with user + authorities</li>
  <li>Stores it in <code>SecurityContextHolder</code> for the duration of the request</li>
  <li>Spring Security checks authorities on secured endpoints</li>
  <li>At request end: <code>SecurityContextHolder.clearContext()</code></li>
</ol>
<pre><code>// Access the current user anywhere in the stack
@GetMapping("/me")
public UserDto getCurrentUser(
        @AuthenticationPrincipal UserDetails user) {
    return service.findByEmail(user.getUsername());
}</code></pre>',
  'JWT is the dominant authentication mechanism for REST APIs at modern fintech companies. Knowing the structure explains why you should always validate the signature (forged tokens), why you must check expiry, and why the payload is not secret — a question that trips up many candidates.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SPRING_SECURITY',
  'Method-Level Security: @PreAuthorize & @Secured',
  '@EnableMethodSecurity · @PreAuthorize with SpEL · @Secured · @PostAuthorize · ownership checks · why @PreAuthorize beats @Secured',
  'ADVANCED', 40, 'NOT_STARTED', 22,
  '<h3>Why This Is Asked</h3>
<p>Role-based access at the URL level is coarse. Method-level security enables fine-grained authorization — per service method, per user, per data row. Senior engineers know this distinction.</p>

<h3>Setup</h3>
<pre><code>@Configuration
@EnableMethodSecurity  // replaces deprecated @EnableGlobalMethodSecurity
public class SecurityConfig { ... }</code></pre>

<h3>@PreAuthorize — Most Powerful</h3>
<pre><code>// Simple role check
@PreAuthorize("hasRole(''ADMIN'')")
public void deleteUser(Long id) { ... }

// Combine roles with OR
@PreAuthorize("hasRole(''ADMIN'') or hasRole(''MANAGER'')")
public List&lt;User&gt; getAllUsers() { ... }

// Ownership check using SpEL — #userId refers to the method parameter
@PreAuthorize("hasRole(''ADMIN'') or #userId == authentication.principal.id")
public UserDto getUser(Long userId) { ... }

// PostAuthorize — check the returned object after execution
@PostAuthorize("returnObject.ownerId == authentication.principal.id")
public Document getDocument(Long id) { ... }</code></pre>

<h3>@Secured — Legacy, No SpEL</h3>
<pre><code>@Secured("ROLE_ADMIN")  // only roles, no expressions
public void adminAction() { ... }</code></pre>

<h3>@PreAuthorize vs @Secured</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Feature</th><th style="padding:6px;border:1px solid #e2e8f0">@PreAuthorize</th><th style="padding:6px;border:1px solid #e2e8f0">@Secured</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">SpEL expressions</td><td style="padding:6px;border:1px solid #e2e8f0">Full SpEL</td><td style="padding:6px;border:1px solid #e2e8f0">Role names only</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Ownership checks</td><td style="padding:6px;border:1px solid #e2e8f0">Yes</td><td style="padding:6px;border:1px solid #e2e8f0">No</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Combine roles</td><td style="padding:6px;border:1px solid #e2e8f0">AND/OR logic</td><td style="padding:6px;border:1px solid #e2e8f0">OR implicit only</td></tr>
</table>',
  'In a multi-tenant fintech system, you need to ensure user A cannot read user B''s account data even if both are authenticated. @PreAuthorize with ownership checks (#userId == authentication.principal.id) is the correct mechanism — URL-level security alone can''t enforce this.'
);

-- ============================================================
-- TESTING (sort_order 23–24)
-- ============================================================

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'TESTING',
  'JUnit 5: Lifecycle, Assertions & Parameterized Tests',
  '@BeforeEach vs @BeforeAll · assertAll · assertThrows · @ParameterizedTest with @ValueSource @CsvSource @MethodSource',
  'INTERMEDIATE', 45, 'NOT_STARTED', 23,
  '<h3>Why This Is Asked</h3>
<p>Interviewers evaluate test code as seriously as production code. Clean, well-structured tests with proper lifecycle management signal a developer who writes maintainable software.</p>

<h3>Lifecycle Annotations</h3>
<pre><code>class OrderServiceTest {
    OrderService service;
    static Database db;

    @BeforeAll   // static; runs ONCE before all tests in this class
    static void startDb() { db = new Database(); }

    @AfterAll    // static; runs ONCE after all tests
    static void stopDb() { db.close(); }

    @BeforeEach  // runs before EACH @Test method — reset mutable state
    void setUp() { service = new OrderService(db); }

    @AfterEach   // runs after EACH @Test method
    void tearDown() { db.clearTestData(); }
}</code></pre>

<h3>Assertions</h3>
<pre><code>assertEquals("Huy", user.getName());
assertNotNull(result);
assertTrue(result.isActive());
assertFalse(list.isEmpty());

// assertThrows — verify exception type and message
Exception ex = assertThrows(IllegalArgumentException.class,
    () -&gt; service.createOrder(null));
assertTrue(ex.getMessage().contains("order cannot be null"));

// assertAll — groups assertions; ALL run even if one fails
assertAll(
    () -&gt; assertEquals("Huy", user.getName()),
    () -&gt; assertEquals("ADMIN", user.getRole()),
    () -&gt; assertNotNull(user.getCreatedAt())
);</code></pre>

<h3>Parameterized Tests</h3>
<pre><code>// Test multiple values without duplicating test code
@ParameterizedTest
@ValueSource(strings = {"", "  ", "invalid-email"})
void invalidEmail_throwsValidationException(String email) {
    assertThrows(ValidationException.class, () -&gt; service.createUser(email));
}

@ParameterizedTest
@CsvSource({"Huy,ADMIN", "Alice,USER", "Bob,MANAGER"})
void createUser_assignsCorrectRole(String name, String expectedRole) {
    User user = service.create(new CreateRequest(name));
    assertEquals(expectedRole, user.getRole());
}

@ParameterizedTest
@MethodSource("invalidPayloads") // points to a static Stream&lt;Arguments&gt; method
void invalidPayloads_return400(CreateUserRequest req, String expectedError) { ... }

static Stream&lt;Arguments&gt; invalidPayloads() {
    return Stream.of(
        Arguments.of(new CreateUserRequest(null, "email"), "name is required"),
        Arguments.of(new CreateUserRequest("Huy", null), "email is required")
    );
}</code></pre>',
  'In interviews, writing a test is often part of the coding challenge. Interviewers notice when candidates know to use @BeforeEach (not re-initialize in each test), assertAll (not fail-fast on first assertion), and parameterized tests (not copy-paste the same test 5 times). These details separate good developers from great ones.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'TESTING',
  'Mockito: @Mock, @InjectMocks, ArgumentCaptor & Verification',
  '@Mock vs @Spy vs @InjectMocks · when().thenReturn() · verify() and never() · ArgumentCaptor for deep assertion · thenThrow()',
  'INTERMEDIATE', 45, 'NOT_STARTED', 24,
  '<h3>Why This Is Asked</h3>
<p>Mockito is the standard mocking library in Java. You will write Mockito tests on every Java team — knowing ArgumentCaptor and the difference between @Mock and @Spy signals real testing experience.</p>

<h3>Core Setup</h3>
<pre><code>@ExtendWith(MockitoExtension.class) // activates Mockito annotations
class UserServiceTest {
    @Mock
    UserRepository userRepo;   // creates a mock — all methods return null/0/false by default

    @InjectMocks
    UserService userService;   // creates real UserService, injects @Mock fields automatically

    @Test
    void createUser_savesAndReturnsDto() {
        // Arrange — stub the mock
        User savedUser = new User(1L, "Huy", "huy@example.com");
        when(userRepo.save(any(User.class))).thenReturn(savedUser);

        // Act
        UserDto result = userService.create(new CreateUserRequest("Huy", "huy@example.com"));

        // Assert return value
        assertEquals("Huy", result.name());

        // Verify the repo was called once with any User
        verify(userRepo, times(1)).save(any(User.class));

        // Verify something was NEVER called
        verify(userRepo, never()).delete(any());
    }
}</code></pre>

<h3>ArgumentCaptor — Assert What Was Passed</h3>
<pre><code>@Test
void createUser_savesCorrectEmail() {
    ArgumentCaptor&lt;User&gt; captor = ArgumentCaptor.forClass(User.class);

    userService.create(new CreateUserRequest("Huy", "huy@example.com"));

    verify(userRepo).save(captor.capture()); // capture the argument
    User saved = captor.getValue();
    assertEquals("huy@example.com", saved.getEmail());
    assertEquals("NOT_STARTED", saved.getStatus()); // verify business logic set the default
}</code></pre>

<h3>Testing Exceptions</h3>
<pre><code>@Test
void getUser_notFound_throwsException() {
    when(userRepo.findById(99L)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class,
        () -&gt; userService.getUserById(99L));
}</code></pre>

<h3>@Mock vs @Spy</h3>
<ul>
  <li><strong>@Mock:</strong> Entirely fake — no real methods execute. Return values default to null/0/false unless stubbed.</li>
  <li><strong>@Spy:</strong> Wraps a REAL object — real methods execute unless you stub them. Use when you only want to intercept specific calls.</li>
</ul>',
  'ArgumentCaptor is the answer to "how do you assert on the object you passed to a dependency?" — a common interview follow-up. It proves you test business logic (was the right status set?), not just interactions (was save() called?).'
);

-- ============================================================
-- REACT (sort_order 25–28)
-- ============================================================

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'REACT',
  'React Hooks: useState & useEffect Deep Dive',
  'Dependency array rules · cleanup function · stale closure pitfall · why Object.is() matters · cancelled flag pattern for async fetches',
  'INTERMEDIATE', 45, 'NOT_STARTED', 25,
  '<h3>Why This Is Asked</h3>
<p>useEffect is the hook most developers misuse. Interviewers specifically ask about the cleanup function and dependency array to see if you understand React''s rendering model.</p>

<h3>Dependency Array Behavior</h3>
<pre><code>useEffect(() => { /* runs after every render */ });
useEffect(() => { /* runs only on mount */ }, []);
useEffect(() => { /* runs when userId changes */ }, [userId]);</code></pre>

<h3>Cleanup Function</h3>
<p>The cleanup runs in TWO situations: when the component unmounts, AND before the effect re-runs (before the next execution when a dependency changes).</p>
<pre><code>useEffect(() => {
    const controller = new AbortController();

    fetchUser(userId, { signal: controller.signal })
        .then(setUser);

    return () => {
        controller.abort(); // cancel in-flight request on re-run or unmount
    };
}, [userId]);</code></pre>

<h3>The Cancelled Flag Pattern</h3>
<p>Used in this app''s hooks to prevent setting state on unmounted components:</p>
<pre><code>useEffect(() => {
    let cancelled = false;

    fetchLessons()
        .then(data => {
            if (!cancelled) setLessons(data); // safe — component still mounted
        });

    return () => { cancelled = true; }; // cleanup: ignore stale response
}, []);</code></pre>

<h3>Object Comparison Trap</h3>
<pre><code>// WRONG — inline object creates new reference every render → effect loops!
useEffect(() => {
    fetchLessons(options);
}, [{ category: "JAVA" }]); // new object every render = always "changed"

// CORRECT — use primitive values in deps
useEffect(() => {
    fetchLessons(category);
}, [category]); // string equality is stable</code></pre>

<h3>When Does Cleanup Run?</h3>
<p>In React StrictMode (development), effects deliberately mount → cleanup → remount to expose missing cleanups. This means your fetch runs twice in dev — this is intentional. The AbortController/cancelled flag pattern handles it correctly.</p>',
  'The cancelled flag pattern is exactly what this app uses in useSchedule.js and useLessons.js. Being able to explain WHY it''s there — "to prevent setState on an unmounted component if the user navigates away during a fetch" — shows you understand the code you write, not just that you copied a pattern.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'REACT',
  'React Performance: useMemo, useCallback & React.memo',
  'When memoization helps vs hurts · React.memo for child components · stable function references in dependency arrays · measuring with Profiler',
  'INTERMEDIATE', 40, 'NOT_STARTED', 26,
  '<h3>Why This Is Asked</h3>
<p>Wrapping everything in useMemo and useCallback is a common anti-pattern. Interviewers want to see that you understand WHEN these tools help — not just that they exist.</p>

<h3>useMemo — Memoize Expensive Computations</h3>
<pre><code>// Without useMemo — re-sorts on every render
const sortedLessons = lessons.slice().sort((a, b) => a.title.localeCompare(b.title));

// With useMemo — only re-sorts when lessons array changes
const sortedLessons = useMemo(
    () => lessons.slice().sort((a, b) => a.title.localeCompare(b.title)),
    [lessons]
);</code></pre>

<h3>useCallback — Stable Function Reference</h3>
<pre><code>// Without useCallback — new function reference every render → child always re-renders
const handleSubmit = (data) => { submitOrder(data, userId); };

// With useCallback — same reference until userId changes
const handleSubmit = useCallback((data) => {
    submitOrder(data, userId);
}, [userId]);</code></pre>

<h3>When It Actually Helps</h3>
<p>Memoization ONLY prevents re-renders when the child is wrapped in <code>React.memo</code>:</p>
<pre><code>// Must wrap child in React.memo for useCallback to help
const OrderForm = React.memo(({ onSubmit }) => {
    return &lt;form onSubmit={onSubmit}&gt;...&lt;/form&gt;;
});

// Now parent re-renders don''t cause OrderForm to re-render
// as long as handleSubmit reference is stable (useCallback)</code></pre>

<h3>When It Does NOT Help</h3>
<ul>
  <li>Child is NOT wrapped in <code>React.memo</code> — it re-renders regardless of reference stability</li>
  <li>The dependency array itself changes every render (defeats the purpose)</li>
  <li>The computation is trivial — memoization overhead exceeds the computation cost</li>
</ul>
<p><strong>Rule of thumb:</strong> Measure first with React DevTools Profiler. Only memoize where re-renders are measurably expensive.</p>',
  'In a data-heavy fintech dashboard with large lesson lists and real-time updates, unnecessary re-renders cause visible jank. useMemo for expensive sorts/filters + React.memo on list items is the correct solution — but only after profiling proves it''s needed. Premature optimization is still an anti-pattern.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'REACT',
  'React Router v6: useNavigate, useParams & Nested Routes',
  'v5 vs v6 changes · useNavigate replaces useHistory · Outlet for nested layouts · useLocation for route state · passing data between routes',
  'INTERMEDIATE', 35, 'NOT_STARTED', 27,
  '<h3>Why This Is Asked</h3>
<p>React Router v6 was a significant API change. Knowing the v5 → v6 differences shows you keep up with the ecosystem, and nested routes + Outlet are patterns you''ll use in every real app.</p>

<h3>Core Hook Usage</h3>
<pre><code>// useParams — reads URL params
const { id } = useParams();  // for route: /lessons/:id

// useNavigate — programmatic navigation (replaces useHistory)
const navigate = useNavigate();
navigate(''/lessons'');                    // push to history
navigate(-1);                            // go back
navigate(''/login'', { replace: true });  // replace (no back entry)
navigate(''/practice'', { state: { lessonId: 1 } }); // pass route state

// useLocation — current URL + state
const location = useLocation();
const { lessonId } = location.state || {};  // always handle null state</code></pre>

<h3>Nested Routes with Outlet</h3>
<pre><code>// App.jsx — Shell wraps all pages
&lt;Routes&gt;
    &lt;Route path="/" element={&lt;Shell /&gt;}&gt;
        &lt;Route index element={&lt;HomePage /&gt;} /&gt;
        &lt;Route path="lessons" element={&lt;LessonsPage /&gt;} /&gt;
        &lt;Route path="lessons/:id" element={&lt;LessonDetailPage /&gt;} /&gt;
    &lt;/Route&gt;
&lt;/Routes&gt;

// Shell.jsx — renders child routes where &lt;Outlet /&gt; is placed
function Shell() {
    return (
        &lt;div style={{ display: "flex" }}&gt;
            &lt;Sidebar /&gt;
            &lt;main style={{ flex: 1 }}&gt;
                &lt;Outlet /&gt;  {/* child route renders here */}
            &lt;/main&gt;
        &lt;/div&gt;
    );
}</code></pre>

<h3>v5 → v6 Key Changes</h3>
<ul>
  <li><code>useHistory()</code> → <code>useNavigate()</code></li>
  <li><code>&lt;Switch&gt;</code> → <code>&lt;Routes&gt;</code></li>
  <li>Exact matching is now the default — remove <code>exact</code> prop</li>
  <li>Nested routes use <code>&lt;Outlet /&gt;</code> instead of <code>props.children</code></li>
  <li><code>Redirect</code> component → <code>&lt;Navigate&gt;</code> component</li>
</ul>',
  'This app uses exactly this pattern — Shell with Outlet renders Sidebar + the active page. Understanding this means you can explain the entire app structure in an interview: "Clicking a lesson card calls navigate(''/lessons/1''), which renders LessonDetailPage inside the Shell''s Outlet, keeping the Sidebar visible."'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'REACT',
  'Context API, Custom Hooks & When to Use Each',
  'Prop drilling vs Context · createContext + useContext · all consumers re-render on change · custom hook pattern · when to reach for Zustand/Redux instead',
  'INTERMEDIATE', 40, 'NOT_STARTED', 28,
  '<h3>Why This Is Asked</h3>
<p>State management is a common interview topic. Interviewers want to see you know the trade-offs — not just reach for Redux for everything or put everything in Context.</p>

<h3>The Prop Drilling Problem</h3>
<pre><code>// Without Context — passing user through 3 components that don''t need it
&lt;App user={user}&gt;
    &lt;Layout user={user}&gt;  // Layout doesn''t use user, just passes it down
        &lt;NavBar user={user} /&gt;  // finally uses it here
    &lt;/Layout&gt;
&lt;/App&gt;</code></pre>

<h3>Context Solution</h3>
<pre><code>// 1. Create
const AuthContext = createContext(null);

// 2. Provide at root
function App() {
    const [user, setUser] = useState(null);
    return (
        &lt;AuthContext.Provider value={{ user, setUser }}&gt;
            &lt;Router&gt;...&lt;/Router&gt;
        &lt;/AuthContext.Provider&gt;
    );
}

// 3. Consume anywhere — no prop passing needed
function NavBar() {
    const { user } = useContext(AuthContext);
    return &lt;span&gt;Hello, {user?.name}&lt;/span&gt;;
}</code></pre>

<h3>Custom Hook — Encapsulate Context Access</h3>
<pre><code>// Custom hook: wraps context, adds guard, provides clean API
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}

// Usage — no direct context import needed anywhere else
function ProfilePage() {
    const { user } = useAuth(); // clean, guarded
}</code></pre>

<h3>Context Performance Warning</h3>
<p>Every component consuming a context re-renders when the context value changes — even if the specific value they consume didn''t change. React compares context by reference.</p>
<p><strong>Fix:</strong> Split contexts by update frequency. Keep fast-changing state (notifications count) in its own context, separate from slow-changing state (user profile).</p>

<h3>When to Use Redux/Zustand Instead</h3>
<p>Use a proper state manager when: many components subscribe to the same state, you need selective subscriptions (only re-render when a specific slice changes), or you need time-travel debugging and middleware.</p>',
  'Custom hooks are a key React pattern for code reuse. This app uses useSchedule(), useLessons() — these ARE custom hooks. Being able to explain: "I extracted the fetch logic into a custom hook so the page component only handles rendering, not data fetching" is a strong answer that shows separation of concerns thinking.'
);

-- ============================================================
-- SYSTEM_DESIGN (sort_order 29–33)
-- ============================================================

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SYSTEM_DESIGN',
  'CAP Theorem: Consistency, Availability & Partition Tolerance',
  'Why you always keep P · CP vs AP trade-off · which databases are CP vs AP · fintech always chooses CP · PACELC extension',
  'ADVANCED', 45, 'NOT_STARTED', 29,
  '<h3>Why This Is Asked</h3>
<p>CAP theorem appears in almost every system design interview. It''s a framework for discussing database trade-offs, and knowing it shows you think beyond single-machine systems.</p>

<h3>The Three Properties</h3>
<ul>
  <li><strong>Consistency (C):</strong> Every read returns the most recent write, or an error — no stale data</li>
  <li><strong>Availability (A):</strong> Every request gets a response — but it might return stale data</li>
  <li><strong>Partition Tolerance (P):</strong> The system continues operating despite network partitions (dropped messages between nodes)</li>
</ul>

<h3>The Real Trade-off: CP vs AP</h3>
<p>Network partitions are unavoidable in distributed systems — you cannot sacrifice P. So the real choice during a partition is:</p>
<ul>
  <li><strong>CP (Consistent + Partition-tolerant):</strong> Refuse to serve stale data; return error during partition. Examples: PostgreSQL, ZooKeeper, CockroachDB, Redis (cluster with strong consistency)</li>
  <li><strong>AP (Available + Partition-tolerant):</strong> Serve potentially stale data rather than erroring. Reconcile conflicts later. Examples: DynamoDB, Cassandra, CouchDB</li>
</ul>

<h3>Fintech Always Chooses CP</h3>
<p>A payment system must never double-charge or allow a transaction that exceeds a balance. Strong consistency is non-negotiable. The acceptable failure mode is a temporary rejection ("service unavailable, try again") — NOT an inconsistent state (wrong balance).</p>
<p>Shopping carts choose AP — showing a stale product price briefly is acceptable. Payment systems never get this flexibility.</p>

<h3>Common Interview Question</h3>
<p><em>"Which would you choose for a payment service — CP or AP?"</em></p>
<p><strong>Answer:</strong> CP. Financial correctness takes priority over availability. The system should reject requests during a partition rather than risk recording a transaction on stale balance data. PostgreSQL with ACID transactions gives you CP for your primary datastore.</p>',
  'As a Fiserv engineer, you work in CP territory by definition — financial data requires strong consistency. Knowing CAP lets you explain WHY PostgreSQL is the right choice for account data, and why you might add DynamoDB only for append-only audit logs where eventual consistency is acceptable.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SYSTEM_DESIGN',
  'SQL vs NoSQL: When to Use Each',
  'ACID vs BASE · schema flexibility vs query power · horizontal vs vertical scaling · decision heuristic · using both in the same system',
  'INTERMEDIATE', 40, 'NOT_STARTED', 30,
  '<h3>Why This Is Asked</h3>
<p>"When would you use NoSQL?" is a standard system design question. The wrong answer is "NoSQL is faster" or "SQL doesn''t scale." The right answer is nuanced and use-case driven.</p>

<h3>Comparison Table</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Criterion</th><th style="padding:6px;border:1px solid #e2e8f0">SQL (PostgreSQL)</th><th style="padding:6px;border:1px solid #e2e8f0">NoSQL (DynamoDB/Cassandra)</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Transactions</td><td style="padding:6px;border:1px solid #e2e8f0">Full ACID</td><td style="padding:6px;border:1px solid #e2e8f0">Eventual consistency (some offer limited ACID)</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Schema</td><td style="padding:6px;border:1px solid #e2e8f0">Fixed, enforced</td><td style="padding:6px;border:1px solid #e2e8f0">Flexible, dynamic</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Query flexibility</td><td style="padding:6px;border:1px solid #e2e8f0">Ad-hoc JOINs, aggregations, full-text</td><td style="padding:6px;border:1px solid #e2e8f0">Limited to designed access patterns</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Scaling</td><td style="padding:6px;border:1px solid #e2e8f0">Vertical (+ read replicas)</td><td style="padding:6px;border:1px solid #e2e8f0">Horizontal sharding native</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Best for</td><td style="padding:6px;border:1px solid #e2e8f0">Banking, ERP, e-commerce, anything relational</td><td style="padding:6px;border:1px solid #e2e8f0">IoT, social feeds, real-time analytics, high-write logs</td></tr>
</table>

<h3>Decision Heuristic</h3>
<ol>
  <li>Default to SQL — it handles most use cases well</li>
  <li>Choose NoSQL when: data is document-like with variable schema, write throughput exceeds what a single RDBMS can handle, you need geographic distribution, or access patterns are fixed key-value at massive scale</li>
</ol>

<h3>Using Both in the Same System</h3>
<p>In a fintech app:</p>
<ul>
  <li><strong>PostgreSQL:</strong> User accounts, balances, transactions — ACID required</li>
  <li><strong>DynamoDB/Cassandra:</strong> API request logs, audit trails, real-time notification events — high write throughput, simple key lookups, no JOINs needed</li>
  <li><strong>Redis:</strong> Session cache, rate limiting, leaderboards — in-memory speed</li>
</ul>',
  'The interview answer "SQL doesn''t scale" is a red flag. PostgreSQL with proper indexing, connection pooling, and read replicas handles millions of transactions per day. Fiserv''s core payment data is SQL. NoSQL makes sense for specific workloads — knowing which workloads is what interviewers test.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SYSTEM_DESIGN',
  'Caching: Cache-Aside Pattern, Redis & Cache Invalidation',
  'Cache-Aside read/write flow · TTL strategy · why delete on write (not update) · cache stampede · Redis vs Memcached',
  'ADVANCED', 45, 'NOT_STARTED', 31,
  '<h3>Why This Is Asked</h3>
<p>Caching is one of the most powerful performance optimizations and one of the hardest to get right. "Cache invalidation is one of the two hard problems in computer science."</p>

<h3>Cache-Aside Pattern (Most Common)</h3>
<pre><code>// Read path
public User getUser(Long id) {
    String key = "user:" + id;
    User cached = redis.get(key);
    if (cached != null) return cached;        // cache HIT

    User user = userRepo.findById(id).orElseThrow(); // cache MISS → DB
    redis.setex(key, 600, user);              // store with 10-min TTL
    return user;
}

// Write path — DELETE the cache key, don''t update it
public User updateUser(Long id, UpdateRequest req) {
    User updated = userRepo.save(apply(req));
    redis.del("user:" + id);  // invalidate — next read fetches fresh
    return updated;
}</code></pre>

<h3>Why DELETE Instead of UPDATE on Write</h3>
<p>Updating the cache on write risks a race condition: two writes interleave, and the cache ends up with the value from the first write instead of the second. Deletion is safe — the worst case is one extra DB read on the next access.</p>

<h3>TTL Strategy</h3>
<ul>
  <li>User profiles: 5–10 minutes (infrequently changing)</li>
  <li>Product catalog: 1 hour (batch-updated)</li>
  <li>Session tokens: match token expiry</li>
  <li>Real-time data (prices): seconds — or skip caching entirely</li>
</ul>

<h3>Cache Stampede</h3>
<p>When a popular cache key expires and thousands of simultaneous requests all hit the DB to repopulate it — turning a cache miss into a DB overload spike.</p>
<p><strong>Prevention:</strong></p>
<ul>
  <li><strong>Probabilistic early expiration:</strong> Refresh the cache slightly before TTL expires, based on request rate</li>
  <li><strong>Distributed lock:</strong> Only one request repopulates; others wait or serve stale</li>
  <li><strong>Background refresh:</strong> A scheduled job keeps popular keys warm</li>
</ul>',
  'Payment account balances are a classic caching dilemma — fast reads are desirable, but serving a stale balance can cause overdrafts. In practice, balance reads for payment authorization skip the cache entirely (CP requirement), while balance reads for display (the app UI) tolerate a short TTL. Knowing this distinction signals domain awareness.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SYSTEM_DESIGN',
  'Horizontal vs Vertical Scaling & Stateless Services',
  'Scale-up vs scale-out · why horizontal requires stateless design · session management · what to fix in Spring Boot for horizontal scalability',
  'ADVANCED', 40, 'NOT_STARTED', 32,
  '<h3>Why This Is Asked</h3>
<p>Scalability questions appear in every senior interview. Knowing what must change in your app to make it horizontally scalable shows you think about production systems, not just functionality.</p>

<h3>Vertical vs Horizontal</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Factor</th><th style="padding:6px;border:1px solid #e2e8f0">Vertical (Scale Up)</th><th style="padding:6px;border:1px solid #e2e8f0">Horizontal (Scale Out)</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">How</td><td style="padding:6px;border:1px solid #e2e8f0">Bigger machine (more CPU/RAM)</td><td style="padding:6px;border:1px solid #e2e8f0">More instances behind load balancer</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Ceiling</td><td style="padding:6px;border:1px solid #e2e8f0">Hard limit (biggest server)</td><td style="padding:6px;border:1px solid #e2e8f0">Virtually unlimited</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Availability</td><td style="padding:6px;border:1px solid #e2e8f0">Single point of failure</td><td style="padding:6px;border:1px solid #e2e8f0">Built-in redundancy</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Complexity</td><td style="padding:6px;border:1px solid #e2e8f0">Simple — no app changes</td><td style="padding:6px;border:1px solid #e2e8f0">Requires stateless design</td></tr>
</table>

<h3>Making a Spring Boot App Horizontally Scalable</h3>
<ol>
  <li><strong>Remove in-memory HTTP sessions:</strong> Use Redis: <code>spring-session-data-redis</code></li>
  <li><strong>Use JWT for auth:</strong> Self-contained tokens work on any instance</li>
  <li><strong>Move file storage to S3:</strong> Local disk isn''t shared across instances</li>
  <li><strong>Use a shared cache:</strong> Redis instead of in-memory Caffeine/Ehcache</li>
  <li><strong>Ensure idempotency:</strong> The same request must produce the same result on any instance</li>
  <li><strong>Externalize config:</strong> No hardcoded environment-specific values; use environment variables</li>
</ol>

<h3>Example: Kubernetes Horizontal Pod Autoscaling</h3>
<pre><code>apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          averageUtilization: 70  # scale up when CPU > 70%</code></pre>',
  'This is a real production question. If your Spring Boot app stores anything in-memory (sessions, local file uploads, in-process caches), it breaks silently when you run 2+ instances — requests that hit different instances see different state. JWT + Redis + S3 is the standard production stack for stateless Spring Boot.'
);

INSERT INTO lessons (category, title, description, level, duration_min, status, sort_order, content_html, company_note) VALUES
(
  'SYSTEM_DESIGN',
  'Message Queues: Kafka vs RabbitMQ',
  'When to use Kafka vs RabbitMQ · Kafka as a durable log · RabbitMQ for task routing · throughput comparison · event-driven architecture basics',
  'ADVANCED', 45, 'NOT_STARTED', 33,
  '<h3>Why This Is Asked</h3>
<p>Message queues appear in every microservices architecture. Interviewers ask "Kafka or RabbitMQ?" to see if you can reason about trade-offs, not just name technologies.</p>

<h3>Architecture Difference</h3>
<ul>
  <li><strong>Kafka:</strong> A distributed, append-only log. Messages are retained by policy (hours/forever). Any consumer can re-read history. Topics split into partitions for parallel consumption.</li>
  <li><strong>RabbitMQ:</strong> A traditional AMQP message broker. Messages are deleted after consumption by default. Supports complex routing via exchanges (direct, fanout, topic, headers).</li>
</ul>

<h3>Comparison Table</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:#f1f5f9"><th style="padding:6px;border:1px solid #e2e8f0;text-align:left">Factor</th><th style="padding:6px;border:1px solid #e2e8f0">Kafka</th><th style="padding:6px;border:1px solid #e2e8f0">RabbitMQ</th></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Message replay</td><td style="padding:6px;border:1px solid #e2e8f0">Yes — any consumer can re-read</td><td style="padding:6px;border:1px solid #e2e8f0">No (deleted after consumption)</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Throughput</td><td style="padding:6px;border:1px solid #e2e8f0">Millions/sec per broker</td><td style="padding:6px;border:1px solid #e2e8f0">Tens of thousands/sec</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Message routing</td><td style="padding:6px;border:1px solid #e2e8f0">Topic-based (simple)</td><td style="padding:6px;border:1px solid #e2e8f0">Exchange types — complex routing</td></tr>
  <tr style="background:#f8fafc"><td style="padding:6px;border:1px solid #e2e8f0">Message priority</td><td style="padding:6px;border:1px solid #e2e8f0">Not supported</td><td style="padding:6px;border:1px solid #e2e8f0">Supported</td></tr>
  <tr><td style="padding:6px;border:1px solid #e2e8f0">Best for</td><td style="padding:6px;border:1px solid #e2e8f0">Event streaming, audit logs, analytics pipelines</td><td style="padding:6px;border:1px solid #e2e8f0">Task queues, background jobs, microservice RPC</td></tr>
</table>

<h3>Choose Kafka When:</h3>
<ul>
  <li>You need permanent event history (audit logs are legal requirements in fintech)</li>
  <li>Multiple consumer types process the same events independently (compliance + analytics + alerting)</li>
  <li>You need to replay events to rebuild state (event sourcing)</li>
  <li>High-throughput data pipelines (payment transaction streams)</li>
</ul>

<h3>Choose RabbitMQ When:</h3>
<ul>
  <li>Complex routing logic (route to different queues based on message content)</li>
  <li>Simple background jobs (email sending, PDF generation)</li>
  <li>Lower operational complexity requirement</li>
  <li>Message priority matters</li>
</ul>

<h3>Interview Answer: Audit Log for Payments</h3>
<p>Use <strong>Kafka</strong>. Requirements: permanent retention (legal), replay capability (reconciliation), multiple consumers (compliance + analytics + alerting). All three favor Kafka''s log model.</p>',
  'Fiserv processes millions of financial transactions — an audit log is a regulatory requirement, not optional. Kafka''s durable, replayable log is architecturally correct for this. Knowing WHY (retention + replay + multiple consumers) rather than just "Kafka is better" is what distinguishes senior candidates.'
);
