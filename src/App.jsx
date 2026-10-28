import { useEffect, useRef, useState } from "react"
import "./App.css"

const ART = {
  closed: "/art/envelope-closed.png",
  open: "/art/envelope-open.png",
  painting: "/art/painting.png",
  still: "/art/still-life.png",
  gramophone: "/art/gramophone.png",
  olives: "/art/olives.png",
  phone: "/art/phone.png",
  mirror: "/art/mirror.png",
}

const STORAGE_KEY = "heirloom-rsvp"

function loadRsvp() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
  } catch {
    return null
  }
}

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  window.history.replaceState(null, "", `#${id}`)
}

export default function App() {
  const storyRef = useRef(null)
  const audioRef = useRef(null)
  const shouldScroll = useRef(false)
  const [opened, setOpened] = useState(
    () => ["#inbjudan", "#information", "#osa"].includes(window.location.hash),
  )
  const [opening, setOpening] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [savedRsvp] = useState(loadRsvp)
  const [form, setForm] = useState({
    name: "",
    attendance: "",
  })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(Boolean(savedRsvp))
  const [sentName, setSentName] = useState(savedRsvp?.name || "")

  useEffect(() => {
    if (!opened || !shouldScroll.current) return
    shouldScroll.current = false
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    storyRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    })
  }, [opened])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => setPlaying(false)
    audio.addEventListener("ended", onEnded)
    return () => audio.removeEventListener("ended", onEnded)
  }, [opened])

  function openInvitation() {
    if (opened || opening) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setOpening(true)
    window.setTimeout(() => {
      shouldScroll.current = true
      setOpened(true)
      setOpening(false)
      window.history.replaceState(null, "", "#inbjudan")
    }, reduce ? 0 : 700)
  }

  function toggleListen() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function chooseAttendance(value) {
    setForm((current) => ({ ...current, attendance: value }))
    setErrors((current) => {
      if (!current.attendance) return current
      const next = { ...current }
      delete next.attendance
      return next
    })
  }

  function submitRsvp(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = "Ange ditt namn."
    if (!form.attendance) nextErrors.attendance = "Välj om du kommer."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const entry = {
      name: form.name.trim(),
      attendance: form.attendance,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
    } catch {
      /* The thank-you still shows if storage is blocked. */
    }
    setSentName(entry.name)
    setSent(true)
  }

  return (
    <main>
      <audio ref={audioRef} src="/audio/listen.wav" preload="none" loop={false} />

      <section className="page cover">
        <p className="eyebrow">The Heirloom Collection</p>
        {opened ? (
          <div className="envelope" aria-hidden="true">
            <img src={ART.closed} alt="" />
          </div>
        ) : (
          <button
            type="button"
            className={opening ? "envelope is-opening" : "envelope"}
            onClick={openInvitation}
            aria-label="Klicka här för att öppna inbjudan"
          >
            <img src={ART.closed} alt="Kuvert med sigill. Klicka här." />
          </button>
        )}
        <h1>
          Vissa berättelser
          <br />
          förtjänar att bevaras.
        </h1>
        <p className="exclusive">En exklusiv konstutställning</p>
      </section>

      {opened && (
        <div className="pages">
          <section className="page story" id="inbjudan" ref={storyRef}>
            <div className="column">
              <img
                className="story-hero"
                src={ART.painting}
                alt="Inramad målning av ett par i ett sommarlandskap"
              />
              <div className="open-env">
                <img src={ART.open} alt="Öppnat kuvert med sigill" />
                <p className="card-note">
                  Du är inbjuden till
                  <br />
                  en konstutställning
                </p>
              </div>
              <h2 className="story-title">
                Konsten att
                <br />
                bevara arvet
              </h2>
              <div className="relics">
                <div className="relic relic-listen">
                  <img src={ART.gramophone} alt="" />
                  <button
                    type="button"
                    className={playing ? "hotspot listen is-playing" : "hotspot listen"}
                    onClick={toggleListen}
                    aria-label={playing ? "pausa" : "klicka för att lyssna"}
                  >
                    {playing ? (
                      <span className="listen-flat">pausa</span>
                    ) : (
                      <svg
                        className="listen-arc"
                        viewBox="0 0 168 72"
                        aria-hidden="true"
                      >
                        <defs>
                          <path
                            id="horn-arc"
                            d="M 10 54 Q 84 6 158 50"
                            fill="none"
                          />
                        </defs>
                        <text fill="currentColor">
                          <textPath
                            href="#horn-arc"
                            startOffset="50%"
                            textAnchor="middle"
                          >
                            klicka för att lyssna
                          </textPath>
                        </text>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="relic relic-still">
                  <img
                    src={ART.still}
                    alt="Porslinstallrik, fickur och ett brevpapper"
                  />
                  <button
                    type="button"
                    className="hotspot goto-osa"
                    onClick={() => scrollToId("osa")}
                  >
                    klicka för RSVP
                  </button>
                  <button
                    type="button"
                    className="hotspot info"
                    onClick={() => scrollToId("information")}
                  >
                    <span>klicka för mer</span>
                    <span>information</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="page details" id="information">
            <div className="details-sheet">
              <div className="details-hero">
                <img className="olives" src={ART.olives} alt="" />
                <h2 className="details-title">Utställningsinformation</h2>
              </div>
              <div className="facts">
                <div className="fact">
                  <p className="fact-label">Datum</p>
                  <p className="fact-value">Lördag 21 november 2026</p>
                </div>
                <div className="fact">
                  <p className="fact-label">Tid</p>
                  <p className="fact-value">Kl. 17.00-20.00</p>
                </div>
                <div className="fact">
                  <p className="fact-label">Plats</p>
                  <p className="fact-value">
                    <a
                      href="https://maps.google.com/?q=Dicksonska+palatset,+Göteborg"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Dicksonska palatset
                    </a>
                    <br />
                    Göteborg
                  </p>
                </div>
              </div>
              <p className="welcome">
                <span>Välkommen till en stämningsfull kväll bland konst, historia och</span>
                <span>tidlösa berättelser.</span>
              </p>
              <div className="osa">
                <img className="phone" src={ART.phone} alt="" />
                <p>OSA senast 14 november 2026</p>
              </div>
            </div>
          </section>

          <section className="page reply" id="osa">
            <div className="column">
              <div className="mirror-wrap">
                <img className="mirror" src={ART.mirror} alt="" />
                {sent ? (
                  <div className="thanks" role="status">
                    <strong>Tack</strong>
                    <p>
                      {sentName ? `${sentName}, ditt svar är mottaget.` : "Ditt svar är mottaget."}
                    </p>
                  </div>
                ) : (
                  <form className="rsvp-form" onSubmit={submitRsvp} noValidate>
                    <p className="form-title">Du är inbjuden</p>
                    <label className="field name-field">
                      <span className="field-label">Ditt namn</span>
                      <input
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && <span className="error">{errors.name}</span>}
                    </label>
                    <fieldset className="attendance">
                      <legend>Kommer du att delta i vår konstutställning?</legend>
                      <button
                        type="button"
                        className={`choice${form.attendance === "yes" ? " is-selected" : ""}`}
                        onClick={() => chooseAttendance("yes")}
                        aria-pressed={form.attendance === "yes"}
                      >
                        Ja, jag kommer gärna
                      </button>
                      <button
                        type="button"
                        className={`choice${form.attendance === "no" ? " is-selected" : ""}`}
                        onClick={() => chooseAttendance("no")}
                        aria-pressed={form.attendance === "no"}
                      >
                        Tyvärr kan jag inte komma
                      </button>
                      {errors.attendance && (
                        <span className="error">{errors.attendance}</span>
                      )}
                    </fieldset>
                    <button className="submit" type="submit">
                      OSA
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
