import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { categories, courses } from "./data/courses.js";

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [enrolled, setEnrolled] = useState(() => readStorage("skillup-enrolled", []));
  const [progress, setProgress] = useState(() => readStorage("skillup-progress", {}));
  const [user, setUser] = useState(() => readStorage("skillup-user", null));

  useEffect(() => localStorage.setItem("skillup-enrolled", JSON.stringify(enrolled)), [enrolled]);
  useEffect(() => localStorage.setItem("skillup-progress", JSON.stringify(progress)), [progress]);
  useEffect(() => {
    if (user) localStorage.setItem("skillup-user", JSON.stringify(user));
    else localStorage.removeItem("skillup-user");
  }, [user]);

  const enroll = (id) => setEnrolled((current) => current.includes(id) ? current : [...current, id]);
  const toggleLesson = (course, lessonIndex) => {
    setProgress((current) => {
      const completed = current[course.id] || [];
      const next = completed.includes(lessonIndex)
        ? completed.filter((lesson) => lesson !== lessonIndex)
        : [...completed, lessonIndex];
      return { ...current, [course.id]: next };
    });
  };

  return (
    <div className="app-shell">
      <Header user={user} onLogout={() => setUser(null)} />
      <main>
        <Routes>
          <Route path="/" element={<Home enrolled={enrolled} />} />
          <Route path="/courses" element={<CoursesPage enrolled={enrolled} />} />
          <Route path="/courses/:courseId" element={<CourseDetails enrolled={enrolled} progress={progress} onEnroll={enroll} onToggleLesson={toggleLesson} />} />
          <Route path="/my-learning" element={<MyLearning enrolled={enrolled} progress={progress} />} />
          <Route path="/login" element={<AuthPage mode="login" onAuth={setUser} />} />
          <Route path="/register" element={<AuthPage mode="register" onAuth={setUser} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="SkillUp home"><span className="brand-mark">s</span>skillup<span className="brand-period">.</span></Link>
        <button className="menu-toggle" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} onClick={() => setMenuOpen(false)}>
          <NavLink to="/courses">Explore courses</NavLink>
          <NavLink to="/my-learning">My learning</NavLink>
          {user ? (
            <div className="account-actions"><span className="user-greeting">Hi, {user.name.split(" ")[0]}</span><button className="text-button" onClick={onLogout}>Log out</button></div>
          ) : (
            <div className="account-actions"><Link className="login-link" to="/login">Log in</Link><Link className="button button-small" to="/register">Get started <span>↗</span></Link></div>
          )}
        </nav>
      </div>
    </header>
  );
}

function Home({ enrolled }) {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> A little learning goes a long way</div>
          <h1>Make room for<br />your <span>next thing.</span></h1>
          <p className="hero-description">Good things happen when you stay curious. Learn practical skills from people who love what they do.</p>
          <div className="hero-actions"><Link className="button" to="/courses">Explore courses <span>↗</span></Link><div className="learner-proof"><div className="avatar-stack"><i>J</i><i>M</i><i>A</i></div><span><strong>12,000+</strong><br />happy learners</span></div></div>
          <div className="hero-note">Made for your real life <span>✳</span></div>
        </div>
        <div className="hero-art">
          <div className="hero-image" role="img" aria-label="A student learning at a desk" />
          <div className="floating-card card-progress"><div className="float-icon">✦</div><div><strong>Little by little</strong><small>you’re getting there</small></div><span className="mini-chart">↗</span></div>
          <div className="floating-card card-rating"><span className="star">★</span><div><strong>4.9 / 5</strong><small>learner-loved courses</small></div></div>
          <div className="hero-sparkle sparkle-one">✳</div><div className="hero-sparkle sparkle-two">✴</div>
        </div>
      </section>

      <section className="trust-strip"><div className="container trust-inner"><span>LEARN FROM PEOPLE AT</span><strong>◈ notion</strong><strong>◉ vercel</strong><strong>◌ linear</strong><strong>✳ figma</strong><strong>◎ Webflow</strong></div></section>

      <section className="section container">
        <div className="section-heading"><div><div className="eyebrow">A good place to start</div><h2>Popular right now<span>.</span></h2></div><Link className="arrow-link" to="/courses">See all courses <span>↗</span></Link></div>
        <CourseGrid items={courses.slice(0, 3)} enrolled={enrolled} />
      </section>

      <section className="callout-section"><div className="container callout"><div className="callout-shape">✳</div><div><div className="eyebrow">Your pace, your place</div><h2>Learning that fits<br />into real life.</h2><p>Short, thoughtful lessons. No pressure. Just progress that feels good.</p><Link className="button button-light" to="/courses">Find your next course <span>↗</span></Link></div><div className="callout-stats"><div><strong>20<span>min</span></strong><small>average lesson</small></div><div><strong>100<span>%</span></strong><small>learn at your pace</small></div></div></div></section>
      <section className="section container home-bottom"><div><div className="eyebrow">Keep your curiosity close</div><h2>There’s always<br />something new.</h2></div><Link className="button" to="/courses">Browse all courses <span>↗</span></Link></section>
    </>
  );
}

function CourseCard({ course, enrolled }) {
  return (
    <article className="course-card">
      <Link className={`course-cover cover-${course.color}`} to={`/courses/${course.id}`}>
        <img src={course.image} alt="" loading="lazy" />
        <span className="cover-category">{course.category}</span>
        {enrolled.includes(course.id) && <span className="enrolled-pill">Enrolled</span>}
        <span className="cover-arrow">↗</span>
      </Link>
      <div className="course-card-content">
        <div className="course-meta"><span>{course.level}</span><span>·</span><span>{course.duration}</span><span className="course-rating">★ {course.rating}</span></div>
        <Link className="course-title" to={`/courses/${course.id}`}>{course.title}</Link>
        <p className="course-instructor">with {course.instructor}</p>
        <div className="course-card-bottom"><span>{course.lessons} lessons</span><strong>${course.price}</strong></div>
      </div>
    </article>
  );
}

function CourseGrid({ items, enrolled }) {
  if (!items.length) return <div className="empty-state"><span>⌕</span><h3>No courses found</h3><p>Try another search or category.</p></div>;
  return <div className="course-grid">{items.map((course) => <CourseCard key={course.id} course={course} enrolled={enrolled} />)}</div>;
}

function CoursesPage({ enrolled }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All courses");
  const filteredCourses = useMemo(() => courses.filter((course) => {
    const matchesCategory = category === "All courses" || course.category === category;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${course.title} ${course.instructor} ${course.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }), [search, category]);

  return (
    <section className="container page-section">
      <div className="page-intro"><div className="eyebrow">Curiosity looks good on you</div><h1>Find your <span>next thing.</span></h1><p>Explore courses made by people who are really good at what they do.</p></div>
      <div className="course-toolbar"><label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses or instructors" aria-label="Search courses or instructors" />{search && <button onClick={() => setSearch("")} aria-label="Clear search">×</button>}</label><span className="result-count">{filteredCourses.length} courses</span></div>
      <div className="filter-list" aria-label="Filter by category">{categories.map((item) => <button key={item} className={category === item ? "filter-chip active" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <CourseGrid items={filteredCourses} enrolled={enrolled} />
    </section>
  );
}

function CourseDetails({ enrolled, progress, onEnroll, onToggleLesson }) {
  const { courseId } = useParams();
  const course = courses.find((item) => item.id === courseId);
  const navigate = useNavigate();
  if (!course) return <NotFound />;
  const isEnrolled = enrolled.includes(course.id);
  const completed = progress[course.id] || [];
  const percent = Math.round((completed.length / course.lessons) * 100);

  return (
    <section className="container detail-page">
      <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/courses">Courses</Link><span>/</span><span>{course.category}</span></div>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-label">{course.category} <span>·</span> {course.level}</div>
          <h1>{course.title}</h1>
          <p className="detail-description">{course.description}</p>
          <div className="detail-stats"><span>★ <strong>{course.rating}</strong> ({course.students} learners)</span><span>◷ {course.duration}</span><span>▤ {course.lessons} lessons</span></div>
          <div className="detail-image"><img src={course.image} alt={`${course.title} course`} /></div>
          <section className="detail-block"><div className="eyebrow">What you'll learn</div><h2>Skills you can put to work.</h2><div className="outcomes-grid">{course.outcomes.map((outcome) => <div key={outcome}><span>✓</span>{outcome}</div>)}</div></section>
          <section className="detail-block curriculum"><div className="eyebrow">The course</div><h2>A peek inside.</h2>{course.modules.map((module, index) => {
            const lessonIndex = Math.min(index, course.lessons - 1);
            return <div className="module-row" key={module}><div className="module-number">{String(index + 1).padStart(2, "0")}</div><div><strong>{module}</strong><small>{Math.max(2, Math.round(course.lessons / course.modules.length))} lessons · {index + 1 === course.modules.length ? "Wrap-up" : "Learn & practice"}</small></div>{isEnrolled ? <button className={completed.includes(lessonIndex) ? "lesson-check done" : "lesson-check"} onClick={() => onToggleLesson(course, lessonIndex)} aria-label={completed.includes(lessonIndex) ? "Mark module incomplete" : "Mark module complete"}>{completed.includes(lessonIndex) ? "✓" : "○"}</button> : <span className="module-lock">⌑</span>}</div>;
          })}</section>
        </div>
        <aside className="enroll-card"><div className={`enroll-cover cover-${course.color}`}><img src={course.image} alt="" /></div><div className="enroll-card-inner"><div className="price-line"><strong>${course.price}</strong><span>one-time purchase</span></div><button className="button enroll-button" onClick={() => isEnrolled ? navigate("/my-learning") : onEnroll(course.id)}>{isEnrolled ? "Continue learning" : "Enroll in course"} <span>↗</span></button><p className="enroll-caption">{isEnrolled ? `${percent}% complete · ${completed.length} of ${course.lessons} lessons` : "Full access, forever. Learn at your own pace."}</p>
            {isEnrolled && <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>}
            <div className="instructor-card"><div className="instructor-avatar">{course.instructor.split(" ").map((part) => part[0]).join("")}</div><div><small>Your instructor</small><strong>{course.instructor}</strong><span>{course.role}</span></div></div>
            <div className="included-list"><strong>Here's what you get</strong><span>✓ &nbsp;{course.lessons} bite-sized lessons</span><span>✓ &nbsp;Lifetime access</span><span>✓ &nbsp;Learn on any device</span></div>
          </div></aside>
      </div>
    </section>
  );
}

function MyLearning({ enrolled, progress }) {
  const myCourses = courses.filter((course) => enrolled.includes(course.id));
  return (
    <section className="container page-section learning-page">
      <div className="page-intro"><div className="eyebrow">Look how far you've come</div><h1>My <span>learning.</span></h1><p>Your little steps are adding up. Pick up right where you left off.</p></div>
      {myCourses.length ? <div className="learning-list">{myCourses.map((course) => {
        const done = progress[course.id] || [];
        const percent = Math.round((done.length / course.lessons) * 100);
        return <article className="learning-card" key={course.id}><Link to={`/courses/${course.id}`} className={`learning-image cover-${course.color}`}><img src={course.image} alt="" /></Link><div className="learning-info"><span className="detail-label">{course.category} <span>·</span> {course.duration}</span><Link className="learning-title" to={`/courses/${course.id}`}>{course.title}</Link><p>with {course.instructor}</p><div className="learning-progress"><div className="progress-track"><span style={{ width: `${percent}%` }} /></div><span>{percent}%</span></div><small>{done.length} of {course.lessons} lessons complete</small></div><Link className="button continue-button" to={`/courses/${course.id}`}>{percent === 100 ? "Review course" : "Continue"} <span>↗</span></Link></article>;
      })}</div> : <div className="empty-learning"><div className="empty-illustration">✳</div><h2>Your story starts here.</h2><p>You haven't enrolled in a course yet. Find something that makes you curious.</p><Link className="button" to="/courses">Explore courses <span>↗</span></Link></div>}
    </section>
  );
}

function AuthPage({ mode, onAuth }) {
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    if (isRegister && !name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 6) { setError("Your password must be at least 6 characters."); return; }
    onAuth({ name: isRegister ? name.trim() : email.split("@")[0], email: email.trim() });
    navigate("/my-learning");
  };

  return <section className="auth-page"><div className="auth-art"><div className="auth-art-content"><div className="auth-brand-mark">✳</div><h2>Curiosity is<br />a good look.</h2><p>Make a little time for the things you want to know.</p><div className="auth-quote">“The beautiful thing about learning is nobody can take it away from you.”<small>— B.B. King</small></div></div></div><div className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><div className="eyebrow">{isRegister ? "A new chapter" : "Good to have you back"}</div><h1>{isRegister ? "Create your account." : "Welcome back."}</h1><p>{isRegister ? "Start learning something lovely." : "Pick up where you left off."}</p>{isRegister && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" /></label>}<label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button auth-submit" type="submit">{isRegister ? "Create account" : "Log in"} <span>↗</span></button><div className="auth-switch">{isRegister ? "Already have an account?" : "New around here?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link></div><small className="demo-note">Demo account only — your details stay in this browser.</small></form></div></section>;
}

function NotFound() {
  return <section className="not-found container"><div className="eyebrow">A little detour</div><h1>Nothing to learn here.</h1><p>That page seems to have wandered off.</p><Link className="button" to="/">Back to home <span>↗</span></Link></section>;
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><Link className="brand" to="/"><span className="brand-mark">s</span>skillup<span className="brand-period">.</span></Link><span>Make room for your next thing.</span><span>© 2026 SkillUp</span></div></footer>;
}

export default App;
