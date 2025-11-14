// === Simple static CV chatbot for "Jordan Rivera" ===
// No backend, no API key, no OpenAI.
// ---------- DOM ----------
const chatBox = document.getElementById("chat-box");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const helpBtn = document.getElementById("help-btn");
const helpModal = document.getElementById("help-modal");
const closeHelp = document.getElementById("close-help");
// ---------- Utilities ----------
function escapeHtml(s = "") {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function normalize(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
// Very light language detection: check question + browser language
function detectLanguage(question) {
  const q = normalize(question);
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  // Hard hints
  if (q.match(/¿|¡| carrera|fortalezas|herramientas|plazos/)) return "es";
  if (q.match(/ à | de | sa carrière|quelles|outils|délais/)) return "fr";
  // Simple words
  if (q.match(/que edad|cuantos anos|hazme un resumen|idiomas/)) return "es";
  if (q.match(/quel age|quelles sont ses|parcours|delais/)) return "fr";
  // Fallback to browser, else English
  if (browser === "es") return "es";
  if (browser === "fr") return "fr";
  return "en";
}
// ---------- Q&A BANK (Jordan Rivera, she/her) ----------
// Each cluster: triggers per language and answers per language.
// If a trigger substring is found in the question, we use that cluster.
const QA_CLUSTERS = [
  // === BOUNDARIES ===
  {
    id: "boundary_age",
    type: "boundary",
    triggers: {
      en: ["how old", "age", "years old"],
      es: ["cuantos años tiene", "qué edad", "edad"],
      fr: ["quel âge", "age a-t-elle", "a quel age"]
    },
    answers: {
      en: [
        "Age isn’t a meaningful signal here. It’s more useful to look at Jordan’s capabilities, her track record, and how well she fits the role."
      ],
      es: [
        "La edad no es un dato relevante aquí. Es más útil fijarse en las capacidades de Jordan, en su experiencia y en su encaje con el puesto."
      ],
      fr: [
        "L’âge n’est pas un critère pertinent ici. Il est plus utile de se concentrer sur les compétences de Jordan, son expérience et son adéquation avec le poste."
      ]
    }
  },
  {
    id: "boundary_kids",
    type: "boundary",
    triggers: {
      en: ["kids", "children", "have children", "have kids"],
      es: ["tiene hijos", "hijos", "tener hijos"],
      fr: ["des enfants", "a-t-elle des enfants", "enfants"]
    },
    answers: {
      en: [
        "Family details aren’t part of this profile. The focus should stay on Jordan’s work, skills, and the outcomes she delivers."
      ],
      es: [
        "Los detalles sobre su vida familiar no forman parte de este perfil. Es mejor centrarse en el trabajo de Jordan, sus habilidades y los resultados que consigue."
      ],
      fr: [
        "Les détails sur sa vie familiale ne font pas partie de ce profil. Il vaut mieux se concentrer sur le travail de Jordan, ses compétences et les résultats qu’elle obtient."
      ]
    }
  },
  {
    id: "boundary_marital",
    type: "boundary",
    triggers: {
      en: ["married", "single", "relationship status", "boyfriend", "husband"],
      es: ["esta casada", "estado civil", "pareja"],
      fr: ["est-elle mariee", "mariée", "célibataire", "statut marital"]
    },
    answers: {
      en: [
        "Jordan’s relationship status is part of her private life, not her professional profile. It’s more helpful to focus on how she works, decides, and collaborates."
      ],
      es: [
        "La situación sentimental de Jordan forma parte de su vida privada, no de su perfil profesional. Es más útil centrarse en cómo trabaja, decide y colabora."
      ],
      fr: [
        "La situation personnelle de Jordan relève de sa vie privée, pas de son profil professionnel. Il est plus utile de se concentrer sur sa façon de travailler, décider et collaborer."
      ]
    }
  },
  {
    id: "boundary_salary",
    type: "boundary",
    triggers: {
      en: ["salary", "pay", "compensation", "how much does she make"],
      es: ["salario", "sueldo", "compensacion", "cuanto gana"],
      fr: ["salaire", "remuneration", "rémunération", "combien gagne"]
    },
    answers: {
      en: [
        "Salary expectations depend on the role scope, location, and market benchmarks. They’re best discussed transparently in a direct conversation, not through this résumé demo."
      ],
      es: [
        "Las expectativas salariales dependen del alcance del puesto, la localización y las referencias de mercado. Es mejor tratarlas en una conversación directa y transparente, no a través de esta demo de CV."
      ],
      fr: [
        "Les attentes salariales dépendent du périmètre du poste, du lieu et des références de marché. Il est préférable d’en discuter directement et de façon transparente plutôt que via cette démo de CV."
      ]
    }
  },
  // === NORMAL CV / INTERVIEW TOPICS ===
  // 1) Career overview / profile
  {
    id: "overview",
    type: "normal",
    triggers: {
      en: [
        "overview", "summary", "resume", "cv", "background", "walk me through",
        // NEW ONES
        "what's her background", "can i get a summary of her experience",
        "walk me through her cv", "give me an overview of her resume"
      ],
      es: [
        "resumen", "resumen rapido", "trayectoria", "cv", "curriculum",
        // NEW ONES
        "¿cuál es su trayectoria", "puedes darme un resumen de su experiencia",
        "hazme un recorrido por su cv", "dame una visión general de su currículum"
      ],
      fr: [
        "resumé", "résumé", "parcours", "vue d'ensemble", "cv",
        // NEW ONES
        "quel est son parcours", "puis-je avoir un résumé de son expérience",
        "fais-moi un tour de son cv", "donne-moi un aperçu de son curriculum"
      ]
    },
    answers: {
      en: [
        "Jordan Rivera is a learning-design specialist who builds online and cohort-based programs for adults. She combines user research, facilitation, and curriculum design to turn complex topics into practical learning experiences.",
        "Across her roles, Jordan has designed programs for professionals in technology, public service, and non-profits. The common thread is simple: make learning clear, structured, and actually usable in people’s day-to-day work."
      ],
      es: [
        "Jordan Rivera es especialista en diseño de aprendizaje y crea programas en línea y en cohortes para personas adultas. Combina investigación de usuarios, facilitación y diseño de contenidos para convertir temas complejos en experiencias prácticas.",
        "A lo largo de su carrera, Jordan ha diseñado programas para profesionales de tecnología, sector público y organizaciones sin ánimo de lucro. El hilo conductor es claro: hacer que el aprendizaje sea estructurado, claro y aplicable al trabajo diario."
      ],
      fr: [
        "Jordan Rivera est spécialiste du design pédagogique et conçoit des programmes en ligne et en cohorte pour adultes. Elle combine recherche utilisateur, facilitation et conception de parcours pour rendre des sujets complexes concrets et actionnables.",
        "Au fil de sa carrière, Jordan a créé des programmes pour des professionnels de la tech, du service public et du secteur associatif. Son fil rouge : un apprentissage structuré, clair et réellement utilisable dans le travail au quotidien."
      ]
    }
  },
  // 2) Current role
  {
    id: "current_role",
    type: "normal",
    triggers: {
      en: [
        "current role", "what does she do now", "what does she do in her current role",
        // NEW ONES
        "what does she do in her current job", "what's her current role", "what does she do now"
      ],
      es: [
        "puesto actual", "que hace ahora", "rol actual",
        // NEW ONES
        "qué hace en su trabajo actual", "cuál es su rol actual", "qué hace ahora"
      ],
      fr: [
        "poste actuel", "que fait-elle actuellement", "role actuel",
        // NEW ONES
        "que fait-elle dans son poste actuel", "quel est son rôle actuel", "que fait-elle maintenant"
      ]
    },
    answers: {
      en: [
        "In her current role, Jordan leads the design of learning programs from idea to launch. She maps learner journeys, structures content, and sets up feedback loops so each cohort improves the next.",
        "She also works closely with product and community teams, aligning learning experiences with platform features and real learner behaviour rather than just theory."
      ],
      es: [
        "En su puesto actual, Jordan lidera el diseño de programas de aprendizaje desde la idea inicial hasta el lanzamiento. Define el recorrido del participante, estructura los contenidos y crea bucles de feedback para que cada cohorte mejore la siguiente.",
        "También colabora de cerca con equipos de producto y comunidad, alineando las experiencias de aprendizaje con las funcionalidades de la plataforma y el comportamiento real de los usuarios."
      ],
      fr: [
        "Dans son poste actuel, Jordan pilote la conception de programmes d’apprentissage de l’idée au lancement. Elle cartographie les parcours apprenants, structure les contenus et met en place des boucles de retour pour améliorer chaque cohorte.",
        "Elle travaille aussi en étroite collaboration avec les équipes produit et communauté afin d’aligner les expériences de formation sur les fonctionnalités de la plateforme et le comportement réel des apprenants."
      ]
    }
  },
  // 3) Experience by company (generic)
  {
    id: "experience_company",
    type: "normal",
    triggers: {
      en: [
        "what did she do at", "her role at", "previous company",
        // NEW ONES
        "what did she do at distilled", "what was her role at indigo",
        "what did she do in previous companies"
      ],
      es: [
        "que hacia en", "su rol en", "empresa anterior",
        // NEW ONES
        "qué hizo en distilled", "cuál fue su rol en indigo",
        "qué hizo en empresas anteriores"
      ],
      fr: [
        "que faisait-elle chez", "son role chez", "entreprise precedente",
        // NEW ONES
        "que faisait-elle chez distilled", "quel était son rôle chez indigo",
        "que faisait-elle dans ses entreprises précédentes"
      ]
    },
    answers: {
      en: [
        "In her previous roles, Jordan designed and rolled out learning programs around digital skills and collaboration. She often owned the full cycle: needs analysis, curriculum design, facilitation, and iteration based on feedback.",
        "She frequently acted as the bridge between subject-matter experts and learners, translating expert knowledge into formats that busy professionals can actually absorb and apply."
      ],
      es: [
        "En sus puestos anteriores, Jordan diseñó y lanzó programas de aprendizaje sobre competencias digitales y trabajo colaborativo. A menudo se encargaba del ciclo completo: análisis de necesidades, diseño curricular, facilitación e iteración según el feedback.",
        "Con frecuencia actuó como puente entre personas expertas en contenido y participantes, traduciendo conocimiento técnico en formatos que profesionales ocupados pueden entender y aplicar."
      ],
      fr: [
        "Dans ses postes précédents, Jordan a conçu et déployé des programmes de formation sur les compétences numériques et la collaboration. Elle prenait souvent en charge tout le cycle : analyse des besoins, conception, animation et itérations.",
        "Elle jouait régulièrement le rôle de passerelle entre experts métier et apprenants, en transformant des connaissances complexes en formats accessibles pour des professionnels très occupés."
      ]
    }
  },
  // 4) Strengths
  {
    id: "strengths",
    type: "normal",
    triggers: {
      en: [
        "strengths", "main strengths", "strongest skills", "what is she best at",
        // NEW ONES
        "what are her strengths", "what is she best at", "what are her strongest skills"
      ],
      es: [
        "fortalezas", "puntos fuertes", "principales fortalezas",
        // NEW ONES
        "cuáles son sus fortalezas", "en qué es mejor", "cuáles son sus habilidades más fuertes"
      ],
      fr: [
        "forces", "points forts", "principales forces",
        // NEW ONES
        "quelles sont ses forces", "en quoi est-elle la meilleure", "quelles sont ses compétences les plus fortes"
      ]
    },
    answers: {
      en: [
        "Jordan’s main strengths are structured thinking and clear communication. She can break down messy topics into simple steps and explain them in language that non-experts understand.",
        "She is also strong at cross-team collaboration: she listens carefully, aligns different stakeholders, and keeps projects moving without losing quality."
      ],
      es: [
        "Las principales fortalezas de Jordan son su pensamiento estructurado y su comunicación clara. Sabe descomponer temas complejos en pasos sencillos y explicarlos en un lenguaje accesible.",
        "También es muy fuerte en la colaboración entre equipos: escucha, alinea a las partes interesadas y mantiene los proyectos avanzando sin perder calidad."
      ],
      fr: [
        "Les principales forces de Jordan sont sa pensée structurée et sa communication claire. Elle sait découper des sujets complexes en étapes simples et les expliquer dans un langage accessible.",
        "Elle excelle également dans la collaboration inter-équipes : elle écoute, aligne les parties prenantes et fait avancer les projets sans sacrifier la qualité."
      ]
    }
  },
  // 5) Weaknesses / growth areas
  {
    id: "weaknesses",
    type: "normal",
    triggers: {
      en: [
        "weaknesses", "weakness", "what is she working on improving", "improvement areas",
        // NEW ONES
        "what is she working on improving", "what are her weaknesses",
        "what areas is she trying to grow"
      ],
      es: [
        "puntos debiles", "debilidades", "en que esta trabajando para mejorar",
        // NEW ONES
        "en qué está trabajando para mejorar", "cuáles son sus debilidades",
        "en qué áreas está intentando crecer"
      ],
      fr: [
        "faiblesses", "points faibles", "sur quoi travaille-t-elle pour s'ameliorer",
        // NEW ONES
        "sur quoi travaille-t-elle pour s'améliorer", "quelles sont ses faiblesses",
        "dans quels domaines cherche-t-elle à progresser"
      ]
    },
    answers: {
      en: [
        "Jordan has a tendency to over-prepare and add too much detail. She manages this by time-boxing prep work and agreeing on a clear definition of “good enough” with stakeholders.",
        "She also works on delegating more rather than owning every step herself, especially in large programs with many moving parts."
      ],
      es: [
        "Jordan tiende a prepararse en exceso y a añadir demasiados detalles. Lo gestiona acotando el tiempo de preparación y acordando con las partes interesadas qué significa exactamente “suficientemente bueno”.",
        "También está trabajando en delegar más en proyectos grandes, en lugar de asumir cada paso por su cuenta."
      ],
      fr: [
        "Jordan a tendance à trop se préparer et à ajouter plus de détails que nécessaire. Elle gère cela en limitant le temps de préparation et en définissant avec les parties prenantes ce que signifie « suffisant ».",
        "Elle travaille aussi à déléguer davantage sur les grands programmes au lieu de porter chaque étape seule."
      ]
    }
  },
  // 6) Tools / stack
  {
    id: "tools",
    type: "normal",
    triggers: {
      en: [
        "which tools", "tool stack", "software does she use",
        // NEW ONES
        "what tools does she use", "which tools are in her stack",
        "what software is she familiar with"
      ],
      es: [
        "que herramientas usa", "con que herramientas trabaja", "stack de herramientas",
        // NEW ONES
        "qué herramientas usa", "cuáles son las herramientas de su stack",
        "con qué software está familiarizada"
      ],
      fr: [
        "quels outils", "avec quels outils travaille-t-elle", "stack d'outils",
        // NEW ONES
        "quels outils utilise-t-elle", "quels outils sont dans son stack",
        "avec quel logiciel est-elle familière"
      ]
    },
    answers: {
      en: [
        "Jordan typically works with tools like Figma and Miro for design and mapping, Notion or Airtable for documentation and tracking, and Google Workspace for collaboration.",
        "She chooses tools based on the team’s context: simple enough that people actually use them, but structured enough to keep programs consistent over time."
      ],
      es: [
        "Jordan suele trabajar con herramientas como Figma y Miro para diseño y diagramas, Notion o Airtable para documentación y seguimiento, y Google Workspace para la colaboración diaria.",
        "Elige herramientas en función del contexto del equipo: lo bastante sencillas para que la gente las use, pero lo bastante estructuradas para mantener coherencia en el tiempo."
      ],
      fr: [
        "Jordan utilise souvent Figma et Miro pour le design et la cartographie, Notion ou Airtable pour la documentation et le suivi, ainsi que Google Workspace pour la collaboration quotidienne.",
        "Elle choisit ses outils en fonction du contexte : suffisamment simples pour être adoptés, mais assez structurés pour garantir la cohérence des programmes."
      ]
    }
  },
  // 7) Languages spoken
  {
    id: "languages_spoken",
    type: "normal",
    triggers: {
      en: [
        "which languages does she speak", "what languages can she work in", "languages spoken",
        // NEW ONES
        "what languages does she speak", "which languages can she work in"
      ],
      es: [
        "que idiomas habla", "en que idiomas puede trabajar",
        // NEW ONES
        "qué idiomas habla", "en qué idiomas puede trabajar"
      ],
      fr: [
        "quelles langues parle-t-elle", "dans quelles langues peut-elle travailler",
        // NEW ONES
        "quelles langues parle-t-elle", "dans quelles langues peut-elle travailler"
      ]
    },
    answers: {
      en: [
        "Jordan works comfortably in English as her primary language and can support participants who use Spanish or French, especially in written communication.",
        "For high-stakes facilitation, she prefers to lead in English and use Spanish or French to support understanding when needed."
      ],
      es: [
        "Jordan trabaja con comodidad en inglés como idioma principal y puede apoyar a participantes que usen español o francés, especialmente en comunicación escrita.",
        "En sesiones críticas de facilitación prefiere liderar en inglés y usar español o francés como apoyo cuando es necesario."
      ],
      fr: [
        "Jordan travaille aisément en anglais, sa langue principale, et peut accompagner des participants hispanophones ou francophones, notamment à l’écrit.",
        "Pour les animations à fort enjeu, elle préfère intervenir en anglais et utiliser l’espagnol ou le français en soutien si besoin."
      ]
    }
  },
  // 8) Work style / teamwork
  {
    id: "work_style",
    type: "normal",
    triggers: {
      en: [
        "how does she work in a team", "collaboration style", "work style", "teamwork",
        // NEW ONES
        "what’s her collaboration style", "how does she work in a team", "what is her work style"
      ],
      es: [
        "como trabaja en equipo", "estilo de colaboracion", "forma de trabajar",
        // NEW ONES
        "cuál es su estilo de colaboración", "cómo trabaja en equipo", "cuál es su forma de trabajar"
      ],
      fr: [
        "comment travaille-t-elle en equipe", "style de collaboration", "maniere de travailler",
        // NEW ONES
        "quel est son style de collaboration", "comment travaille-t-elle en équipe", "quelle est sa manière de travailler"
      ]
    },
    answers: {
      en: [
        "Jordan usually starts by bringing structure: she clarifies goals, constraints, and responsibilities so the team knows who does what.",
        "In a team setting she listens first, then summarizes options clearly and helps the group move toward a practical decision."
      ],
      es: [
        "Jordan suele empezar aportando estructura: aclara objetivos, limitaciones y responsabilidades para que el equipo sepa quién hace qué.",
        "En un entorno de equipo escucha primero, resume las opciones con claridad y ayuda al grupo a avanzar hacia una decisión práctica."
      ],
      fr: [
        "Jordan commence généralement par apporter de la structure : elle clarifie les objectifs, les contraintes et les responsabilités pour que chacun sache ce qu’il a à faire.",
        "En équipe, elle écoute d’abord, reformule les options de façon claire et aide le groupe à avancer vers une décision concrète."
      ]
    }
  },
  // 9) Handling pressure / deadlines
  {
    id: "deadlines",
    type: "normal",
    triggers: {
      en: [
        "tight deadlines", "work under pressure", "handle deadlines", "time pressure",
        // NEW ONES
        "how does she handle tight deadlines", "can she work under pressure",
        "how does she manage time pressure"
      ],
      es: [
        "plazos ajustados", "trabajar bajo presion", "tiempo limite",
        // NEW ONES
        "cómo maneja plazos ajustados", "puede trabajar bajo presión",
        "cómo gestiona la presión de tiempo"
      ],
      fr: [
        "delais serres", "travailler sous pression", "gere les delais",
        // NEW ONES
        "comment gère-t-elle les délais serrés", "peut-elle travailler sous pression",
        "comment gère-t-elle la pression temporelle"
      ]
    },
    answers: {
      en: [
        "Under tight deadlines, Jordan prioritises by impact: she asks what breaks if it doesn’t happen today and tackles that first.",
        "She communicates early when trade-offs are needed, so stakeholders know exactly what will be ready and what will follow later."
      ],
      es: [
        "Ante plazos ajustados, Jordan prioriza por impacto: se pregunta qué se rompe si esa tarea no se hace hoy y empieza por ahí.",
        "Comunica pronto cuando hay que hacer concesiones, para que las personas implicadas sepan qué estará listo a tiempo y qué quedará para después."
      ],
      fr: [
        "Face à des délais serrés, Jordan priorise par impact : elle se demande ce qui bloque vraiment si ce n’est pas fait aujourd’hui et commence par là.",
        "Elle communique tôt lorsqu’il faut faire des arbitrages, afin que les parties prenantes sachent ce qui sera prêt à temps et ce qui viendra ensuite."
      ]
    }
  },
  // 10) Motivation / fit
  {
    id: "motivation_fit",
    type: "normal",
    triggers: {
      en: [
        "what motivates her", "why would she be a good fit", "motivation", "fit for this role",
        // NEW ONES
        "what motivates her", "why is she a good fit", "what drives her"
      ],
      es: [
        "que la motiva", "por que seria un buen fichaje", "encaje con el puesto",
        // NEW ONES
        "qué la motiva", "por qué sería un buen fichaje", "qué la impulsa"
      ],
      fr: [
        "ce qui la motive", "pourquoi serait-elle un bon recrutement", "motivation pour ce poste",
        // NEW ONES
        "qu'est-ce qui la motive", "pourquoi serait-elle un bon recrutement", "qu'est-ce qui la pousse"
      ]
    },
    answers: {
      en: [
        "Jordan is motivated by seeing people actually finish a program and change how they work afterwards. For her, the real win is when learning shows up in behaviour, not just in completion rates.",
        "She would be a good fit for teams that value clear thinking, honest communication, and steady progress over flashy one-off launches."
      ],
      es: [
        "A Jordan la motiva ver que las personas terminan un programa y cambian su forma de trabajar después. Para ella, la victoria real es que el aprendizaje se note en el comportamiento, no solo en el porcentaje de finalización.",
        "Encaja bien en equipos que valoran el pensamiento claro, la comunicación honesta y el progreso constante por encima de los lanzamientos llamativos de un solo día."
      ],
      fr: [
        "Jordan est motivée lorsqu’elle voit les participants terminer un programme et modifier ensuite leur façon de travailler. Pour elle, le vrai succès se voit dans les comportements, pas seulement dans les taux de complétion.",
        "Elle convient particulièrement aux équipes qui apprécient la clarté, la communication honnête et les progrès réguliers plutôt que les lancements spectaculaires mais isolés."
      ]
    }
  }
];
// ---------- Matching logic ----------
function findAnswer(question) {
  const lang = detectLanguage(question);
  const qNorm = normalize(question);
  // Try to match any cluster
  for (const cluster of QA_CLUSTERS) {
    const trigList = cluster.triggers[lang] || [];
    for (const trig of trigList) {
      if (!trig) continue;
      if (qNorm.includes(normalize(trig))) {
        const answers = cluster.answers[lang] || cluster.answers["en"] || [];
        if (!answers.length) break;
        const answer = answers[Math.floor(Math.random() * answers.length)];
        return { lang, answer, type: cluster.type, id: cluster.id };
      }
    }
  }
  // Fallback: generic scope message
  let fallback;
  if (lang === "es") {
    fallback =
      "Esta demo solo responde a preguntas sobre la experiencia profesional, las habilidades y la forma de trabajar de Jordan. Intenta reformular tu pregunta en esa línea.";
  } else if (lang === "fr") {
    fallback =
      "Cette démo répond uniquement aux questions sur l’expérience, les compétences et la façon de travailler de Jordan. Reformule ta question dans ce cadre.";
  } else {
    fallback =
      "This demo only answers questions about Jordan’s professional experience, skills, and work style. Try rephrasing your question in that direction.";
  }
  return { lang, answer: fallback, type: "fallback", id: "fallback" };
}
// ---------- Chat UI helpers ----------
function addMessage(sender, msg, who = "bot") {
  const wrap = document.createElement("div");
  wrap.className = `msg ${who === "you" ? "you" : "bot"}`;
  if (who === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "J";
    wrap.appendChild(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `<span class="sender">${escapeHtml(sender)}</span><p>${escapeHtml(
    msg
  )}</p>`;
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function showTyping() {
  const wrap = document.createElement("div");
  wrap.className = "msg bot typing-indicator";
  wrap.id = "typing-indicator";
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "J";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML =
    '<span class="sender">Jordan, Distilled</span><div class="typing-dots"><span></span><span></span><span></span></div>';
  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function hideTyping() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}
// ---------- Help modal ----------
helpBtn.addEventListener("click", () => {
  helpModal.classList.remove("hidden");
});
closeHelp.addEventListener("click", () => {
  helpModal.classList.add("hidden");
});
helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    helpModal.classList.add("hidden");
  }
});
document.querySelectorAll(".sample-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const q = btn.getAttribute("data-question") || "";
    input.value = q;
    helpModal.classList.add("hidden");
    form.dispatchEvent(new Event("submit"));
  });
});
// ---------- Form handling ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const userMsg = input.value.trim();
  if (!userMsg) return;
  addMessage("You", userMsg, "you");
  input.value = "";
  showTyping();
  setTimeout(() => {
    const { answer } = findAnswer(userMsg);
    hideTyping();
    addMessage("Jordan, Distilled", answer, "bot");
  }, 400); // small delay to show typing indicator
});
// ---------- Initial greeting ----------
(function initialGreeting() {
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  let greet;
  if (browser === "es") {
    greet =
      "Hola. Soy la versión interactiva del CV de Jordan Rivera. Respondo en inglés, español y francés a preguntas sobre su experiencia y forma de trabajar.";
  } else if (browser === "fr") {
    greet =
      "Bonjour. Je suis la version interactive du CV de Jordan Rivera. Je réponds en anglais, espagnol et français à des questions sur son expérience et sa manière de travailler.";
  } else {
    greet =
      "Hi. I’m the interactive résumé of Jordan Rivera. I can answer in English, Spanish, and French about her experience, skills, and work style.";
  }
  addMessage("Jordan, Distilled", greet, "bot");
})();
