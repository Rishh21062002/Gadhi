import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, Star, Music, Gift, Cake, Lock, LogIn, ChevronRight,
  Home, Sparkles, PartyPopper, Package, BookOpen, Quote, Smile
} from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────
type Page = "login" | "home" | "letters" | "capsules";

// ── confetti ──────────────────────────────────────────────────────────────────
const COLORS = ["#e8417a", "#f7c948", "#a855f7", "#34d399", "#60a5fa", "#f97316"];

function Confetti({ count = 32 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 3,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: "-20px", width: p.size, height: p.size * 0.6, backgroundColor: p.color, rotate: p.rotation }}
          animate={{ y: ["0vh", "110vh"], rotate: [p.rotation, p.rotation + 360], opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function Balloons() {
  const b = [{ c: "#e8417a", x: 5, d: 0 }, { c: "#f7c948", x: 12, d: 1.2 }, { c: "#a855f7", x: 88, d: 0.6 }, { c: "#34d399", x: 94, d: 1.8 }];
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {b.map((balloon, i) => (
        <motion.div key={i} className="absolute bottom-0" style={{ left: `${balloon.x}%` }}
          animate={{ y: [0, -24, 0] }} transition={{ duration: 3.5 + i * 0.4, delay: balloon.d, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-10 h-12 rounded-full shadow-lg" style={{ backgroundColor: balloon.c }} />
          <div className="w-px h-16 bg-gray-400 mx-auto opacity-50" />
        </motion.div>
      ))}
    </div>
  );
}

// ── photo slot (reusable if needed) ───────────────────────────────────────────
function PhotoSpot({ label, shape = "rect" }: { label: string; shape?: "rect" | "circle" | "polaroid" }) {
  const [src, setSrc] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSrc(URL.createObjectURL(file));
  }

  const base = "relative overflow-hidden border-2 border-dashed border-primary/40 bg-white/80 hover:border-primary transition-all cursor-pointer group shadow-md hover:shadow-lg";

  const shapeClass =
    shape === "circle"
      ? `${base} rounded-full aspect-square w-full h-full`
      : shape === "polaroid"
      ? `${base} rounded-xl`
      : `${base} rounded-2xl`;

  return (
    <div className={shapeClass} onClick={() => ref.current?.click()}>
      {src ? (
        <>
          <img src={src} alt={label} className={`w-full h-full object-cover ${shape === "circle" ? "rounded-full" : ""}`} />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-['Nunito'] text-xs font-700 bg-black/40 px-2 py-1 rounded-full">Change</span>
          </div>
        </>
      ) : (
        <div className={`flex flex-col items-center justify-center h-full w-full gap-2 text-muted-foreground group-hover:text-primary transition-colors p-4`}>
          <span className="text-2xl">📷</span>
          <span className="font-['Nunito'] text-xs text-center leading-snug">{label}</span>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── nav ───────────────────────────────────────────────────────────────────────
function NavBar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const tabs: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home size={15} /> },
    { id: "letters", label: "Kuch Shabdh", icon: <Star size={15} /> },
    { id: "capsules", label: "Surprises!", icon: <Package size={15} /> },
  ];
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-3 bg-white/85 backdrop-blur-sm border-b border-border shadow-sm">
      <span className="font-['Pacifico'] text-primary text-2xl cursor-pointer" onClick={() => setPage("home")}>
        🎂
      </span>
      <div className="hidden sm:flex gap-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setPage(t.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-['Nunito'] font-600 transition-all duration-200 ${page === t.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <div className="flex sm:hidden gap-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setPage(t.id)}
            className={`p-2 rounded-full transition-all ${page === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            {t.icon}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── login ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().toLowerCase() === "debu" && pw === "tiyagadhi") {
      onLogin();
    } else {
      setErr("Hmm, that doesn't seem right. Try again! 🎈");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      <Confetti />
      <Balloons />
      <motion.div initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl border-4 border-primary/20 mb-4">
            <span className="text-5xl">🎂</span>
          </div>
          <h1 className="font-['Pacifico'] text-4xl text-primary leading-tight">Iske liye bhi meri help lgegi</h1>
        </div>
        <motion.form animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }} onSubmit={submit}
          className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-2xl border border-border space-y-5">
          <div>
            <label className="font-['Nunito'] text-sm font-600 text-foreground block mb-1.5">Your Name 🌸</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Who are you?"
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-['Nunito'] placeholder:text-muted-foreground transition" />
          </div>
          <div>
            <label className="font-['Nunito'] text-sm font-600 text-foreground block mb-1.5">Secret Password 🔐</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Shh… it's a secret"
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-['Nunito'] placeholder:text-muted-foreground transition" />
          </div>
          {err && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="font-['Nunito'] text-sm text-destructive bg-red-50 rounded-xl px-4 py-2 border border-red-200">{err}</motion.p>
          )}
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-['Nunito'] font-700 py-3.5 rounded-xl shadow-lg hover:bg-pink-600 active:scale-95 transition-all">
            <LogIn size={18} /> Idhr click kr
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

// ── home ──────────────────────────────────────────────────────────────────────
function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 relative overflow-hidden">
      <Confetti count={24} />

      {/* hero */}
      <div className="max-w-4xl mx-auto text-center pt-10 pb-12 relative z-10">
        <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.1 }} className="text-8xl mb-6 inline-block">
          🎉
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="font-['Pacifico'] text-4xl sm:text-6xl text-primary leading-tight mb-8">
          Gadhi click on the<br />
          <span style={{ WebkitTextStroke: "1px #e8417a", color: "#f7c948" }}>things given below.</span>
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center">
          {[
            { page: "letters" as Page, label: "Kuch Shabdh", icon: <Star size={18} />, color: "bg-amber-400 text-amber-900" },
            { page: "capsules" as Page, label: "Open Surprises", icon: <Package size={18} />, color: "bg-purple-500 text-white" },
          ].map((btn) => (
            <button key={btn.page} onClick={() => setPage(btn.page)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-['Nunito'] font-700 text-base shadow-lg hover:scale-105 active:scale-95 transition-all ${btn.color}`}>
              {btn.icon}{btn.label}<ChevronRight size={16} />
            </button>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="max-w-2xl mx-auto text-center mt-16 relative z-10 pb-10">
        <p className="font-['Dancing_Script'] text-3xl text-primary/80 italic leading-relaxed">
          "May your day be as wonderful and as special as you are."
        </p>
        <div className="flex justify-center gap-3 mt-4 text-2xl">
          {["🎈", "🎊", "🎁", "🌸", "✨"].map((e, i) => (
            <motion.span key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 1.8, delay: i * 0.2, repeat: Infinity }}>{e}</motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── letters ────────────────────────────────────────────────────────────────────
function LettersPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-b from-amber-50 to-background">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="font-['Pacifico'] text-4xl sm:text-5xl text-primary mb-3">Kuch Shabdh</h1>
          <p className="font-['Nunito'] text-muted-foreground text-lg max-w-xl mx-auto">
            Words of love, carefully written just for you.
          </p>
        </motion.div>

        {/* Featured Open Letter */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-[2.5rem] p-8 sm:p-14 shadow-xl border border-border mb-16 relative overflow-hidden">
          <div className="absolute top-6 left-6 text-primary/10"><Quote size={80} /></div>
          
          <div className="relative z-10">
            <h2 className="font-['Pacifico'] text-2xl sm:text-3xl text-foreground mb-8 text-center border-b border-border pb-6 max-w-md mx-auto leading-relaxed">
              To my homegirl who is like a home to me,
            </h2>
            <div className="space-y-6 font-['Dancing_Script'] text-xl sm:text-2xl text-muted-foreground leading-relaxed px-2 sm:px-6 text-justify">
              <p>
                Happy birthday Tiya or Debu? What should I call you? I'll call you a strong woman for now but according to the context I'll switch names. Another year passed, more lessons learned. Some built you strong and some got added to your weakness. The thing that remained constant was your will to be better, not just as a mature person but as an emotional being too. To me birthdays are not about celebrating the day that we were born but it remarks more as an achievement status. When I look at you, I see you growing, trying to fly but not trying to stop yourself from moving forward. We all know that there will be challenges but you are one of those people who would try to make it through. That is a skill not every person has.
              </p>
              <p>
                People have different types of difficulties in their life, some people struggle with academics, some struggle with personal relations, some struggle with dealing with the public. I know you're not perfect in everything and I know that there's a lot that you don't tell me, maybe because you think that you'll be a burden to me or any other reasons that you may have. I just wish that you heal and win from the things you don't talk about. Whenever you try to sleep you would want to see dreams and not get scared of them, the smile and the laugh that comes out should be genuine and not forced. I wish people value you like you value them so that you don't get burnt out during the process. I hope you find the right career and success that comes along with it because I see you working hard for it. You've earned these things and a lot more that are not mentioned here. I know that you always have some kind of guilts and sometimes people make mistakes, sometimes it's not the right time to shine and remember, just because the stars don't shine in the sunlight doesn't mean they don't exist. I want you to focus on the things that can make things right and forget about the rest, things will get better. You've always got me by your side, making fun of the things that causes you harm so that you can get mad at me instead of worrying about your problems.
              </p>
              <p>
                You've contributed a lot in my life from the time we met. At first, you were the first Indian I met on sky but things changed with time. The reason why I was looking for an Indian on the platform was because I wanted to have someone who can feel like "me". As our friendship grew you became a part of me, someone who can pop up in my mind in the middle of the day and for me it's rare. The only people who would come to my mind in the middle of nowhere are very close to me and that should explain how much you mean to me as a person, as a friend, as someone whom I trust. You've shown me that there are other ways to grow in a friendship too, I can be vulnerable too. You've stayed by me whenever you felt like my mood is not good. You've been vulnerable around me and as a person who can't speak it's heart out, I know how tough it can be. Trusting someone with your things is very hard. I will be lying if I will say that I don't feel comfortable around you because I can be myself without any filters and its kind off releases the burden on my shoulders. Even though I am far away from my family, you've made sure I don't miss them tooooo much.
              </p>
              <p className="text-center italic mt-10">
                Hoping that you remember that you've always got me by your side
              </p>
            </div>
            <div className="mt-12 text-center sm:text-right sm:pr-10">
              <p className="font-['Pacifico'] text-3xl text-foreground mt-2">~ Your homeboy</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── surprise capsules ─────────────────────────────────────────────────────────
const CAPSULE_COLORS = [
  { bg: "from-pink-400 to-rose-500", light: "bg-pink-50", border: "border-pink-200", icon: "💌" },
  { bg: "from-amber-400 to-yellow-500", light: "bg-amber-50", border: "border-amber-200", icon: "⭐" },
  { bg: "from-violet-400 to-purple-500", light: "bg-violet-50", border: "border-violet-200", icon: "🌙" },
  { bg: "from-emerald-400 to-green-500", light: "bg-emerald-50", border: "border-emerald-200", icon: "🌸" },
  { bg: "from-sky-400 to-blue-500", light: "bg-sky-50", border: "border-sky-200", icon: "✨" },
  { bg: "from-orange-400 to-red-400", light: "bg-orange-50", border: "border-orange-200", icon: "🎉" },
];

const CAPSULE_MESSAGES = [
  "I hope you remember that you're beautiful just the way you are.",
  "I hope you get all the things that can make you whole.",
  "I hope you're surrounded by people who genuinely want to be with you",
  "I hope you don't lose the spark in you.",
  "We love you and you should always remember that",
  "I'll always be there to annoy you.",
];

function CapsulesPage() {
  const [opened, setOpened] = useState<boolean[]>(Array(6).fill(false));
  const [allOpened, setAllOpened] = useState(false);
  const [celebrationConfetti, setCelebrationConfetti] = useState(false);

  const openedCount = opened.filter(Boolean).length;

  function openCapsule(i: number) {
    const next = opened.map((v, idx) => (idx === i ? true : v));
    setOpened(next);
    if (next.every(Boolean)) {
      setTimeout(() => {
        setAllOpened(true);
        setCelebrationConfetti(true);
      }, 500);
    }
  }

  function reset() {
    setOpened(Array(6).fill(false));
    setAllOpened(false);
    setCelebrationConfetti(false);
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-b from-violet-50 to-background relative overflow-hidden">
      {celebrationConfetti && <Confetti count={60} />}

      <AnimatePresence>
        {allOpened && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
              className="bg-white rounded-[2.5rem] p-10 sm:p-16 text-center shadow-2xl max-w-lg w-full border-4 border-primary/30">
              <motion.div animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
                transition={{ duration: 1, delay: 0.4, repeat: Infinity, repeatDelay: 2 }}
                className="text-8xl mb-6 inline-block">🎂</motion.div>
              <h2 className="font-['Pacifico'] text-4xl sm:text-5xl text-primary mb-4 leading-tight">
                Once again<br />"janamdin mubarak"
              </h2>
              <p className="font-['Dancing_Script'] text-2xl text-muted-foreground mb-6">
                You opened all 6 surprises — you deserve all the love in the world! 💖
              </p>
              <div className="flex justify-center gap-2 text-3xl mb-8">
                {["🎈", "🎊", "🎁", "🌟", "💕", "🥳"].map((e, i) => (
                  <motion.span key={i} animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}>{e}</motion.span>
                ))}
              </div>
              <button onClick={reset}
                className="font-['Nunito'] font-700 text-sm text-muted-foreground border border-border px-5 py-2 rounded-full hover:bg-secondary transition">
                Open Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <div className="text-5xl mb-3">🎁</div>
          <h1 className="font-['Pacifico'] text-4xl sm:text-5xl text-primary mb-2">Surprise Capsules</h1>
          <p className="font-['Nunito'] text-muted-foreground text-base max-w-lg mx-auto">
            Six secret messages, sealed just for you. Tap each gift box to pop it open!
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Nunito'] text-sm font-600 text-muted-foreground">{openedCount} of 6 opened</span>
            <span className="font-['Nunito'] text-sm font-600 text-primary">
              {openedCount === 6 ? "All revealed! 🎉" : `${6 - openedCount} surprise${6 - openedCount === 1 ? "" : "s"} left…`}
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-pink-400 rounded-full"
              animate={{ width: `${(openedCount / 6) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {CAPSULE_MESSAGES.map((message, i) => {
            const col = CAPSULE_COLORS[i];
            return (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 18 }}>
                {opened[i] ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                    className={`${col.light} ${col.border} border-2 rounded-3xl p-6 min-h-52 flex flex-col shadow-md`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{col.icon}</span>
                      <span className="font-['Nunito'] text-xs font-700 text-muted-foreground uppercase tracking-wide">
                        Capsule {i + 1}
                      </span>
                    </div>
                    <p className="font-['Dancing_Script'] text-lg text-foreground leading-relaxed flex-1">
                      {message}
                    </p>
                    <div className="mt-3">
                      <PartyPopper size={16} className="text-primary opacity-60" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                    onClick={() => openCapsule(i)}
                    className={`w-full bg-gradient-to-br ${col.bg} rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg border-2 border-white/40 min-h-52 text-white cursor-pointer`}>
                    <motion.div animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-6xl drop-shadow-sm">🎁</motion.div>
                    <span className="font-['Nunito'] font-700 text-sm opacity-90">Tap to open!</span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, delay: d * 0.2, repeat: Infinity }}
                          className="text-base">✨</motion.span>
                      ))}
                    </div>
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [loggedIn, setLoggedIn] = useState(false);

  function handleLogin() {
    setLoggedIn(true);
    setPage("home");
  }

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-background relative">
      <NavBar page={page} setPage={setPage} />
      <AnimatePresence mode="wait">
        <motion.div key={page} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
          {page === "home" && <HomePage setPage={setPage} />}
          {page === "letters" && <LettersPage />}
          {page === "capsules" && <CapsulesPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
