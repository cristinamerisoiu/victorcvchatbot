// === Simple static CV chatbot for "Victor Maracine" ===
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

// ---------- Q&A BANK (Victor Maracine, he/him) ----------
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
      fr: ["quel âge", "age a-t-il", "a quel age"]
    },
    answers: {
      en: [
        "Age isn’t a meaningful signal here. It’s more useful to look at Victor’s capabilities, his track record, and how well he fits the role."
      ],
      es: [
        "La edad no es un dato relevante aquí. Es más útil fijarse en las capacidades de Victor, en su experiencia y en su encaje con el puesto."
      ],
      fr: [
        "L’âge n’est pas un critère pertinent ici. Il est plus utile de se concentrer sur les compétences de Victor, son expérience et son adéquation avec le poste."
      ]
    }
  },
  {
    id: "boundary_kids",
    type: "boundary",
    triggers: {
      en: ["kids", "children", "have children", "have kids"],
      es: ["tiene hijos", "hijos", "tener hijos"],
      fr: ["des enfants", "a-t-il des enfants", "enfants"]
    },
    answers: {
      en: [
        "Family details aren’t part of this profile. The focus should stay on Victor’s work, skills, and the outcomes he delivers."
      ],
      es: [
        "Los detalles sobre su vida familiar no forman parte de este perfil. Es mejor centrarse en el trabajo de Victor, sus habilidades y los resultados que consigue."
      ],
      fr: [
        "Les détails sur sa vie familiale ne font pas partie de ce profil. Il vaut mieux se concentrer sur le travail de Victor, ses compétences et les résultats qu’il obtient."
      ]
    }
  },
  {
    id: "boundary_marital",
    type: "boundary",
    triggers: {
      en: ["married", "single", "relationship status", "girlfriend", "wife"],
      es: ["esta casado", "estado civil", "pareja"],
      fr: ["est-il marie", "marié", "célibataire", "statut marital"]
    },
    answers: {
      en: [
        "Victor’s relationship status is part of his private life, not his professional profile. It’s more helpful to focus on how he works, decides, and collaborates."
      ],
      es: [
        "La situación sentimental de Victor forma parte de su vida privada, no de su perfil profesional. Es más útil centrarse en cómo trabaja, decide y colabora."
      ],
      fr: [
        "La situation personnelle de Victor relève de sa vie privée, pas de son profil professionnel. Il est plus utile de se concentrer sur sa façon de travailler, décider et collaborer."
      ]
    }
  },
  {
    id: "boundary_salary",
    type: "boundary",
    triggers: {
      en: ["salary", "pay", "compensation", "how much does he make"],
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
        "overview",
        "summary",
        "resume",
        "cv",
        "background",
        "walk me through",
        "what's his background",
        "can i get a summary of his experience",
        "walk me through his cv",
        "give me an overview of his resume"
      ],
      es: [
        "resumen",
        "resumen rapido",
        "trayectoria",
        "cv",
        "curriculum",
        "¿cuál es su trayectoria",
        "puedes darme un resumen de su experiencia",
        "hazme un recorrido por su cv",
        "dame una visión general de su currículum"
      ],
      fr: [
        "resumé",
        "résumé",
        "parcours",
        "vue d'ensemble",
        "cv",
        "quel est son parcours",
        "puis-je avoir un résumé de son expérience",
        "fais-moi un tour de son cv",
        "donne-moi un aperçu de son curriculum"
      ]
    },
    answers: {
      en: [
        "Victor Maracine is an IT project and process manager with a strong background in warehouse operations and logistics. At Kölner Weinkeller (REWE Wein Online GmbH) he connects day-to-day warehouse reality with digital systems so inventory, logistics, and online orders run smoothly.",
        "Before moving into IT and process management, Victor spent several years leading warehouses in the Cologne/Bonn region, including roles as Head of Warehouse and Warehouse Manager. His profile combines operational experience on the floor with a structured, data-driven approach to improvement."
      ],
      es: [
        "Victor Maracine es gestor de proyectos y procesos de TI con una sólida trayectoria en operaciones de almacén y logística. En Kölner Weinkeller (REWE Wein Online GmbH) conecta la realidad diaria del almacén con los sistemas digitales para que el inventario, la logística y los pedidos online funcionen sin fricciones.",
        "Antes de centrarse en proyectos de TI, Victor pasó varios años dirigiendo almacenes en la región de Colonia/Bonn, incluyendo puestos como Jefe de Almacén y Warehouse Manager. Su perfil combina experiencia operativa en primera línea con una forma de trabajar estructurada y orientada a los datos."
      ],
      fr: [
        "Victor Maracine est chef de projet et responsable de processus IT avec une solide expérience dans la logistique et la gestion d’entrepôt. Chez Kölner Weinkeller (REWE Wein Online GmbH), il fait le lien entre la réalité du terrain et les systèmes digitaux afin que les stocks, la logistique et les commandes en ligne restent fluides.",
        "Avant de se concentrer sur les projets IT, Victor a dirigé des entrepôts dans la région de Cologne/Bonn, notamment comme Head of Warehouse et Warehouse Manager. Son profil associe une expérience opérationnelle de terrain à une approche structurée et orientée données."
      ]
    }
  },

  // 2) Current role
  {
    id: "current_role",
    type: "normal",
    triggers: {
      en: [
        "current role",
        "what does he do now",
        "what does he do in his current role",
        "what does he do in his current job",
        "what's his current role"
      ],
      es: [
        "puesto actual",
        "que hace ahora",
        "rol actual",
        "qué hace en su trabajo actual",
        "cuál es su rol actual"
      ],
      fr: [
        "poste actuel",
        "que fait-il actuellement",
        "role actuel",
        "que fait-il dans son poste actuel",
        "quel est son rôle actuel"
      ]
    },
    answers: {
      en: [
        "In his current role as IT Project & Process Manager at Kölner Weinkeller, Victor coordinates projects around inventory, warehouse systems, and logistics processes. He translates requirements between operations teams and technical stakeholders so both sides work on the same problem.",
        "He looks at how orders, stock, and warehouse tasks flow through the system, identifies bottlenecks, and then works on process changes or system adjustments that make daily work more reliable and predictable."
      ],
      es: [
        "En su puesto actual como IT Project & Process Manager en Kölner Weinkeller, Victor coordina proyectos relacionados con inventario, sistemas de almacén y procesos logísticos. Traduce las necesidades entre los equipos operativos y los interlocutores técnicos para que todos trabajen sobre el mismo problema.",
        "Analiza cómo circulan los pedidos, el stock y las tareas del almacén por el sistema, detecta cuellos de botella y trabaja en cambios de proceso o ajustes de sistema que hacen el trabajo diario más fiable y predecible."
      ],
      fr: [
        "Dans son poste actuel d’IT Project & Process Manager chez Kölner Weinkeller, Victor pilote des projets liés aux stocks, aux systèmes d’entrepôt et aux processus logistiques. Il fait la traduction entre les équipes opérationnelles et les interlocuteurs techniques pour que tout le monde traite le même problème.",
        "Il observe la façon dont les commandes, les stocks et les tâches d’entrepôt circulent dans le système, identifie les goulots d’étranglement et propose des améliorations de processus ou des ajustements de système pour rendre le quotidien plus fiable et plus fluide."
      ]
    }
  },

  // 3) Experience by company (generic)
  {
    id: "experience_company",
    type: "normal",
    triggers: {
      en: [
        "what did he do at",
        "his role at",
        "previous company",
        "what did he do in previous companies"
      ],
      es: [
        "que hacia en",
        "su rol en",
        "empresa anterior",
        "qué hizo en empresas anteriores"
      ],
      fr: [
        "que faisait-il chez",
        "son role chez",
        "entreprise precedente",
        "que faisait-il dans ses entreprises précédentes"
      ]
    },
    answers: {
      en: [
        "As Head of Warehouse at Kölner Weinkeller, Victor was responsible for day-to-day warehouse operations: leading teams, managing inbound and outbound flows, and making sure service levels stayed high even in peak periods.",
        "Before that, as Warehouse Manager at AUGER Autotechnik GmbH in the Cologne/Bonn region, he handled warehouse organisation, process efficiency, and coordination with logistics partners so that goods moved on time and correctly documented."
      ],
      es: [
        "Como Head of Warehouse en Kölner Weinkeller, Victor era responsable de las operaciones diarias del almacén: gestión de equipos, control de flujos de entrada y salida y mantenimiento de los niveles de servicio incluso en temporadas de pico.",
        "Antes, como Warehouse Manager en AUGER Autotechnik GmbH en la región de Colonia/Bonn, se encargaba de la organización del almacén, la eficiencia de los procesos y la coordinación con socios logísticos para que la mercancía saliera a tiempo y bien documentada."
      ],
      fr: [
        "En tant que Head of Warehouse chez Kölner Weinkeller, Victor était responsable des opérations quotidiennes de l’entrepôt : management des équipes, gestion des flux entrants et sortants et maintien du niveau de service, y compris en période de pic.",
        "Auparavant, comme Warehouse Manager chez AUGER Autotechnik GmbH dans la région de Cologne/Bonn, il s’occupait de l’organisation de l’entrepôt, de l’efficacité des processus et de la coordination avec les partenaires logistiques pour que les marchandises partent à l’heure et correctement documentées."
      ]
    }
  },

  // 4) Strengths
  {
    id: "strengths",
    type: "normal",
    triggers: {
      en: [
        "strengths",
        "main strengths",
        "strongest skills",
        "what is he best at",
        "what are his strengths",
        "what are his strongest skills"
      ],
      es: [
        "fortalezas",
        "puntos fuertes",
        "principales fortalezas",
        "cuáles son sus fortalezas",
        "en qué es mejor",
        "cuáles son sus habilidades más fuertes"
      ],
      fr: [
        "forces",
        "points forts",
        "principales forces",
        "quelles sont ses forces",
        "en quoi est-il le meilleur",
        "quelles sont ses compétences les plus fortes"
      ]
    },
    answers: {
      en: [
        "Victor’s main strengths are process thinking and reliability. He sees how small changes in the warehouse or system setup impact the whole chain from supplier to customer.",
        "He is also strong at communication between operations and IT: he speaks the language of both, keeps expectations realistic, and makes sure changes are tested before they hit daily business."
      ],
      es: [
        "Las principales fortalezas de Victor son su pensamiento orientado a procesos y su fiabilidad. Ve cómo pequeños cambios en el almacén o en la configuración del sistema afectan a toda la cadena desde el proveedor hasta el cliente final.",
        "También destaca en la comunicación entre operaciones e IT: entiende el lenguaje de ambos mundos, mantiene las expectativas realistas y se asegura de que los cambios se prueben antes de impactar el día a día."
      ],
      fr: [
        "Les principales forces de Victor sont sa pensée orientée processus et sa fiabilité. Il voit comment de petits changements dans l’entrepôt ou dans les systèmes impactent l’ensemble de la chaîne, du fournisseur au client.",
        "Il est également très bon dans la communication entre les opérations et l’IT : il comprend les deux univers, garde des attentes réalistes et veille à ce que les changements soient testés avant de toucher l’activité quotidienne."
      ]
    }
  },

  // 5) Weaknesses / growth areas
  {
    id: "weaknesses",
    type: "normal",
    triggers: {
      en: [
        "weaknesses",
        "weakness",
        "what is he working on improving",
        "improvement areas",
        "what are his weaknesses",
        "what areas is he trying to grow"
      ],
      es: [
        "puntos debiles",
        "debilidades",
        "en que esta trabajando para mejorar",
        "en qué está trabajando para mejorar",
        "cuáles son sus debilidades",
        "en qué áreas está intentando crecer"
      ],
      fr: [
        "faiblesses",
        "points faibles",
        "sur quoi travaille-t-il pour s'ameliorer",
        "sur quoi travaille-t-il pour s'améliorer",
        "quelles sont ses faiblesses",
        "dans quels domaines cherche-t-il à progresser"
      ]
    },
    answers: {
      en: [
        "Victor can sometimes go very deep into details when he wants a process to be perfect. He manages this by agreeing upfront on priorities and on what “good enough” means for each project.",
        "He is also working on delegating more and letting teams own parts of the solution instead of trying to solve everything himself."
      ],
      es: [
        "Victor a veces entra muy al detalle cuando quiere que un proceso quede perfecto. Lo gestiona acordando desde el principio las prioridades y qué significa exactamente “suficientemente bueno” en cada proyecto.",
        "También está trabajando en delegar más y permitir que los equipos se apropien de partes de la solución en lugar de intentar resolverlo todo él solo."
      ],
      fr: [
        "Victor peut parfois aller très loin dans le détail lorsqu’il veut qu’un processus soit parfait. Il gère cela en clarifiant dès le départ les priorités et ce que signifie « suffisant » pour chaque projet.",
        "Il travaille également à déléguer davantage et à laisser les équipes s’approprier certaines parties des solutions au lieu d’essayer de tout régler lui-même."
      ]
    }
  },

  // 6) Tools / stack
  {
    id: "tools",
    type: "normal",
    triggers: {
      en: [
        "which tools",
        "tool stack",
        "software does he use",
        "what tools does he use",
        "which tools are in his stack",
        "what software is he familiar with"
      ],
      es: [
        "que herramientas usa",
        "con que herramientas trabaja",
        "stack de herramientas",
        "qué herramientas usa",
        "cuáles son las herramientas de su stack",
        "con qué software está familiarizado"
      ],
      fr: [
        "quels outils",
        "avec quels outils travaille-t-il",
        "stack d'outils",
        "quels outils utilise-t-il",
        "quels outils sont dans son stack",
        "avec quel logiciel est-il familier"
      ]
    },
    answers: {
      en: [
        "Victor typically works with warehouse management systems (WMS), ERP tools and inventory modules, as well as spreadsheets for analysis and reporting.",
        "Depending on the project, he collaborates with IT on system integrations and uses simple dashboards or reports to keep an eye on stock levels, lead times, and service quality."
      ],
      es: [
        "Victor suele trabajar con sistemas de gestión de almacén (WMS), herramientas ERP y módulos de inventario, además de hojas de cálculo para análisis e informes.",
        "Según el proyecto, colabora con IT en integraciones de sistemas y utiliza cuadros de mando sencillos o informes para controlar niveles de stock, tiempos de entrega y calidad de servicio."
      ],
      fr: [
        "Victor travaille généralement avec des systèmes de gestion d’entrepôt (WMS), des outils ERP et des modules de gestion de stock, ainsi qu’avec des feuilles de calcul pour l’analyse et le reporting.",
        "Selon les projets, il collabore avec l’IT sur les intégrations de systèmes et utilise des tableaux de bord ou des rapports simples pour suivre les niveaux de stock, les délais et la qualité de service."
      ]
    }
  },

  // 7) Languages spoken
  {
    id: "languages_spoken",
    type: "normal",
    triggers: {
      en: [
        "which languages does he speak",
        "what languages can he work in",
        "languages spoken",
        "what languages does he speak"
      ],
      es: [
        "que idiomas habla",
        "en que idiomas puede trabajar",
        "qué idiomas habla",
        "en qué idiomas puede trabajar"
      ],
      fr: [
        "quelles langues parle-t-il",
        "dans quelles langues peut-il travailler"
      ]
    },
    answers: {
      en: [
        "This interactive résumé answers questions in English, Spanish, and French. In his actual work, Victor is used to adapting to international teams and working with the languages required by his colleagues and partners.",
        "For detailed or high-stakes topics, he prefers to work in the languages that give everyone full clarity rather than forcing a single default."
      ],
      es: [
        "Este currículum interactivo responde a preguntas en inglés, español y francés. En su trabajo real, Victor está acostumbrado a adaptarse a equipos internacionales y usar los idiomas que necesitan sus colegas y socios.",
        "En temas complejos o críticos prefiere trabajar en los idiomas que den mayor claridad a todas las partes en lugar de imponer un único idioma por defecto."
      ],
      fr: [
        "Ce CV interactif répond aux questions en anglais, espagnol et français. Dans son travail, Victor s’adapte aux équipes internationales et utilise les langues dont ses collègues et partenaires ont besoin.",
        "Pour les sujets complexes ou sensibles, il préfère travailler dans les langues qui offrent le plus de clarté à tout le monde plutôt que d’imposer un seul idiome par défaut."
      ]
    }
  },

  // 8) Work style / teamwork
  {
    id: "work_style",
    type: "normal",
    triggers: {
      en: [
        "how does he work in a team",
        "collaboration style",
        "work style",
        "teamwork",
        "what’s his collaboration style",
        "what is his work style"
      ],
      es: [
        "como trabaja en equipo",
        "estilo de colaboracion",
        "forma de trabajar",
        "cuál es su estilo de colaboración",
        "cómo trabaja en equipo",
        "cuál es su forma de trabajar"
      ],
      fr: [
        "comment travaille-t-il en equipe",
        "style de collaboration",
        "maniere de travailler",
        "quel est son style de collaboration",
        "comment travaille-t-il en équipe",
        "quelle est sa manière de travailler"
      ]
    },
    answers: {
      en: [
        "Victor usually starts by making roles and processes explicit: who is responsible for what, which steps are critical, and how information will flow between teams.",
        "In a team setting he is pragmatic and calm. He listens to operators, planners, and IT, then helps the group converge on a solution that actually works on the warehouse floor."
      ],
      es: [
        "Victor suele empezar haciendo explícitos los roles y procesos: quién es responsable de qué, qué pasos son críticos y cómo va a circular la información entre equipos.",
        "En un entorno de equipo es pragmático y tranquilo. Escucha a operarios, planificadores y personal de IT, y luego ayuda al grupo a converger en una solución que funcione de verdad en el almacén."
      ],
      fr: [
        "Victor commence généralement par clarifier les rôles et les processus : qui est responsable de quoi, quelles étapes sont critiques et comment l’information circulera entre les équipes.",
        "En équipe, il reste pragmatique et calme. Il écoute les opérateurs, les planificateurs et l’IT, puis aide le groupe à converger vers une solution qui fonctionne réellement sur le terrain."
      ]
    }
  },

  // 9) Handling pressure / deadlines
  {
    id: "deadlines",
    type: "normal",
    triggers: {
      en: [
        "tight deadlines",
        "work under pressure",
        "handle deadlines",
        "time pressure",
        "how does he handle tight deadlines",
        "can he work under pressure",
        "how does he manage time pressure"
      ],
      es: [
        "plazos ajustados",
        "trabajar bajo presion",
        "tiempo limite",
        "cómo maneja plazos ajustados",
        "puede trabajar bajo presión",
        "cómo gestiona la presión de tiempo"
      ],
      fr: [
        "delais serres",
        "travailler sous pression",
        "gere les delais",
        "comment gère-t-il les délais serrés",
        "peut-il travailler sous pression",
        "comment gère-t-il la pression temporelle"
      ]
    },
    answers: {
      en: [
        "Under tight deadlines, for example around seasonal peaks or important promotions, Victor focuses on what protects customers and the warehouse team first. He identifies the minimum viable process that keeps orders moving.",
        "He communicates early about trade-offs, so stakeholders know which tasks can be postponed and which ones must happen today to avoid bigger issues later."
      ],
      es: [
        "Ante plazos ajustados, por ejemplo en temporadas de pico o promociones importantes, Victor se centra primero en lo que protege al cliente y al equipo de almacén. Define el proceso mínimo viable que mantiene los pedidos en movimiento.",
        "Comunica pronto los compromisos necesarios, para que las personas implicadas sepan qué tareas se pueden aplazar y cuáles deben hacerse hoy para evitar problemas mayores después."
      ],
      fr: [
        "Face à des délais serrés, par exemple pendant les pics saisonniers ou des promotions importantes, Victor se concentre d’abord sur ce qui protège le client et l’équipe d’entrepôt. Il définit le processus minimum viable qui permet de continuer à traiter les commandes.",
        "Il communique tôt sur les arbitrages nécessaires afin que les parties prenantes sachent quelles tâches peuvent être décalées et lesquelles doivent absolument être réalisées aujourd’hui pour éviter de plus gros problèmes ensuite."
      ]
    }
  },

  // 10) Motivation / fit
  {
    id: "motivation_fit",
    type: "normal",
    triggers: {
      en: [
        "what motivates him",
        "why would he be a good fit",
        "motivation",
        "fit for this role",
        "why is he a good fit",
        "what drives him"
      ],
      es: [
        "que le motiva",
        "por que seria un buen fichaje",
        "encaje con el puesto",
        "qué le motiva",
        "por qué sería un buen fichaje",
        "qué le impulsa"
      ],
      fr: [
        "ce qui le motive",
        "pourquoi serait-il un bon recrutement",
        "motivation pour ce poste",
        "qu'est-ce qui le motive",
        "pourquoi serait-il un bon recrutement",
        "qu'est-ce qui le pousse"
      ]
    },
    answers: {
      en: [
        "Victor is motivated by seeing a warehouse or logistics process run smoothly end-to-end: correct stock, clear responsibilities, and orders leaving on time without chaos.",
        "He is a good fit for teams that value stability, continuous improvement, and clear communication between operations and IT rather than quick fixes that break again a few weeks later."
      ],
      es: [
        "A Victor le motiva ver que un proceso logístico o de almacén funciona de forma fluida de principio a fin: stock correcto, responsabilidades claras y pedidos saliendo a tiempo sin caos.",
        "Encaja bien en equipos que valoran la estabilidad, la mejora continua y la comunicación clara entre operaciones e IT, en lugar de soluciones rápidas que vuelven a romperse a las pocas semanas."
      ],
      fr: [
        "Victor est motivé lorsqu’il voit un processus logistique ou d’entrepôt fonctionner de façon fluide de bout en bout : stock correct, responsabilités claires et commandes qui partent à l’heure sans chaos.",
        "Il convient particulièrement aux équipes qui valorisent la stabilité, l’amélioration continue et une communication claire entre les opérations et l’IT plutôt que les « quick fixes » qui cassent à nouveau quelques semaines plus tard."
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
      "Esta demo solo responde a preguntas sobre la experiencia profesional, las habilidades y la forma de trabajar de Victor. Intenta reformular tu pregunta en esa línea.";
  } else if (lang === "fr") {
    fallback =
      "Cette démo répond uniquement aux questions sur l’expérience, les compétences et la façon de travailler de Victor. Reformule ta question dans ce cadre.";
  } else {
    fallback =
      "This demo only answers questions about Victor’s professional experience, skills, and work style. Try rephrasing your question in that direction.";
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
    avatar.textContent = "V";
    wrap.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `<span class="sender">${escapeHtml(
    sender
  )}</span><p>${escapeHtml(msg)}</p>`;
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
  avatar.textContent = "V";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML =
    '<span class="sender">Victor Maracine</span><div class="typing-dots"><span></span><span></span><span></span></div>';

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
    addMessage("Victor Maracine", answer, "bot");
  }, 400); // small delay to show typing indicator
});

// ---------- Initial greeting ----------
(function initialGreeting() {
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  let greet;

  if (browser === "es") {
    greet =
      "Hola. Soy la versión interactiva del CV de Victor Maracine. Respondo en inglés, español y francés a preguntas sobre su experiencia y forma de trabajar.";
  } else if (browser === "fr") {
    greet =
      "Bonjour. Je suis la version interactive du CV de Victor Maracine. Je réponds en anglais, espagnol et français à des questions sur son expérience et sa manière de travailler.";
  } else {
    greet =
      "Hi. I’m the interactive résumé of Victor Maracine. I can answer in English, Spanish, and French about his experience, skills, and work style.";
  }

  addMessage("Victor Maracine", greet, "bot");
})();
