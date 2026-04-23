const heroChips = [
  "Clean Architecture (Bancolombia)",
  "Microservicios Java + Reactor",
  "Supabase (PostgreSQL)",
  "Spring Cloud Gateway + Eureka",
  "JWT + RLS + API Key"
];

const functionalHighlights = [
  {
    title: "Objetivo del producto",
    body: "Gestionar torneos de videojuegos de punta a punta: creacion, inscripcion, ejecucion de matches, monetizacion y entrega de recompensas."
  },
  {
    title: "Actores del negocio",
    body: "ADMIN, PROMOTER, PLAYER, VIEWER y MOD por torneo. Cada rol posee permisos globales o contextuales."
  },
  {
    title: "Monetizacion",
    body: "Ingresos por participacion, visualizacion y donaciones; aplicacion de comisiones para torneos FREE y PAID."
  },
  {
    title: "Control operacional",
    body: "Estados para torneos, tickets y matches con validaciones para impedir inconsistencias del flujo de negocio."
  }
];

const domainModels = [
  ["Tournaments", "Esta es la entidad principal, pues es el evento sobre el cual se ejecutarán todas las acciones y la monetización final."],
  ["Matches", "Gestion de partidas entre dos o más equipos."],
  ["Match teams", "Relaciona equipos con partidas."],
  ["Teams", "Es la entidad que puede participar en los torneos. Un usuario con rol de player puede crear torneos y agregar integrantes."],
  ["Team members", "Relaciona usuarios con equipos, permitiendo que un usuario sea parte de varios equipos y un equipo tenga varios miembros."],
  ["Participation tickets", "Entrada de participacion con estado de transaccion y estado del ticket para registrar equipos."],
  ["Visualization tickets", "Entrada para visualizacion de streams en torneos que sean de pago."],
  ["Streams", "Canales de transmision con control FREE/PAID y restricciones de acceso."],
  ["Donations", "Donaciones al torneo o a equipos, consideradas solo cuando estan aprobadas por la entidad financiera."],
  ["Rewards", "Posiciones y premios monetarios al cierre del torneo."],
  ["User roles", "Modelo de autorizacion global y contextual por torneo."],
  ["Tournament moderators", "Relaciona a los moderadores que puede tener un torneo."],
  ["Commissions", "Porcentajes para calculo de comisiones en torneos gratuitos y de pago."]
];

const businessRuleCatalog = [
  {
    domain: "commissions",
    rules: [
      "Para los torneos gratuitos, se aplica la comisión definida en la tabla commissions para el tipo FREE, mientras que para los torneos de pago se aplica la comisión definida para el tipo PAID.",
      "La comisión se calcula multiplicando el porcentaje correspondiente por el monto total de ingresos de cada fuente (participación, visualización y donaciones) para cada torneo.",
      "Solo los usuarios con rol ADMIN pueden modificar las comisiones en la tabla commissions."
    ]
  },
  {
    domain: "donations",
    rules: [
      "Cualquier usuario puede realizar una donación a un torneo.",
      "Las donaciones pueden ser para apoyar a un equipo específico (en cuyo caso se debe proporcionar el team_id) o para apoyar al torneo en general (en cuyo caso el team_id es null).",
      "El estado de la donación se actualiza según el proceso de pago, y solo las donaciones con estado APPROVED se consideran válidas para el cálculo de ingresos del torneo.",
      "Sólo se puede donar a un torneo que esté en estado ONGOING."
    ]
  },
  {
    domain: "games",
    rules: [
      "Cada torneo debe estar asociado a un juego específico.",
      "Un juego puede estar asociado a múltiples torneos, pero cada torneo solo puede tener un juego.",
      "Los juegos disponibles para los torneos deben ser definidos por los administradores de la plataforma, y solo los usuarios con rol ADMIN pueden agregar o eliminar juegos de la tabla games."
    ]
  },
  {
    domain: "match_teams",
    rules: [
      "Un match puede tener uno o varios equipos participantes, y un equipo puede participar en varios matches dentro de un mismo torneo.",
      "Para que un equipo pueda participar en un match, el equipo debe estar inscrito en el torneo al que pertenece el match.",
      "Esto significa que debe existir una entrada en la tabla participation_tickets para ese equipo y torneo, con un estado de ticket_status que permita la participación (ACTIVE o USED).",
      "Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden asignar equipos a un match, y solo para matches de torneos que estén en estado ONGOING."
    ]
  },
  {
    domain: "matches",
    rules: [
      "Debe estar asociado a un torneo específico, y puede tener uno o varios equipos participantes a través de la tabla match_teams.",
      "El estado del match se actualiza según su desarrollo: comienza como SCHEDULED, cambia a ONGOING cuando inicia, a COMPLETED cuando termina con un ganador definido, o a CANCELED si es cancelado por el promotor o moderador.",
      "El ganador del match se define al completar el match, y se actualiza el campo winner_team_id con el equipo ganador. Este campo es nullable porque no todos los matches tienen un ganador definido (por ejemplo, si el match es cancelado).",
      "No se puede cancelar un match que ya ha sido completado, y solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden cancelar un match.",
      "Solo se puede definir un ganador para un match que esté en estado ONGOING, y el equipo ganador debe ser uno de los equipos participantes en ese match.",
      "Los detalles del match pueden incluir información relevante sobre el desarrollo del juego, como estadísticas, eventos importantes, etc., y pueden ser actualizados por los promotores o moderadores durante el desarrollo del match.",
      "Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden actualizar el estado y los detalles de un match, y solo para matches de torneos que estén en estado ONGOING.",
      "Una vez que un match se completa, no se pueden realizar cambios en su estado o detalles, excepto para agregar información adicional sobre el resultado del match (por ejemplo, estadísticas finales), pero no se pueden cambiar el ganador ni el estado del match.",
      "Los matches solo pueden ser programados para torneos que estén en estado ONGOING, y no se pueden programar matches para torneos que estén en estado UPCOMING, COMPLETED o CANCELED.",
      "Solo se pueden programar matches para torneos que tengan al menos dos equipos inscritos a través de la tabla participation_tickets, con un estado de ticket_status que permita la participación (ACTIVE o USED).",
      "Los matches no pueden superponerse en el tiempo para un mismo torneo y que haya conflicto con un equipo que esté en ambos matches.",
      "Todos los cambios que se realicen sobre el torneo pueden ser ejecutados solo por moderadores que estén como moderadores en ese torneo; promotores que hayan creado el torneo, o un admin sin restricciones."
    ]
  },
  {
    domain: "participation_tickets",
    rules: [
      "Cualquier usuario puede comprar una entrada para participar en un torneo, y cada entrada tiene un código QR asociado para su validación.",
      "Aunque las entradas las puede comprar cualquier persona con cualquier rol diferente de VIEWER, esta entrada tiene que tener asociado un equipo en cuando el ticket sea utilizado, porque el registro en el torneo es solo para equipos.",
      "El estado de la transacción se actualiza según el proceso de pago, y solo las entradas con estado APPROVED se consideran válidas para la participación en el torneo.",
      "Solo se puede comprar una entrada para un torneo que esté en estado UPCOMING u ONGOING, y no se pueden comprar entradas para torneos que estén en estado COMPLETED o CANCELED.",
      "Para que un equipo pueda participar en un torneo, al menos uno de sus miembros debe tener una entrada aprobada (APPROVED) para ese torneo, y el estado del ticket debe ser ACTIVE o USED.",
      "Cuando el proceso de pago inicia, se crea un ticket en estado NEW. Cuando se verifica el pago, el estado pasa automáticamente a ACTIVE. Cuando el equipo se registra en el torneo, entonces se pasa a estado USED.",
      "Una entrada se puede bloquear (BLOCKED) bajo cualquier circunstancia que amerite bloquear la participación de ese equipo en el torneo, como por ejemplo una violación de las reglas del torneo. Solo los usuarios con rol PROMOTER o ADMIN pueden bloquear una entrada."
    ]
  },
  {
    domain: "rewards",
    rules: [
      "Cada torneo puede tener múltiples recompensas definidas para diferentes posiciones (por ejemplo, primer lugar, segundo lugar, etc.), y cada recompensa debe estar asociada a un torneo específico.",
      "Una recompensa puede estar asociada a un equipo solo cuando el resultado del torneo se haya definido, es decir, cuando se hayan completado todos los matches y se hayan determinado las posiciones finales de los equipos. Antes de eso, el campo team_id en la tabla rewards debe ser null.",
      "El premio definido siempre será monetario (float8), pero puede ser null en caso de que el torneo no tenga un premio definido o sea un torneo gratuito sin premios monetarios.",
      "Solo los usuarios con rol PROMOTER o ADMIN pueden definir o modificar las recompensas."
    ]
  },
  {
    domain: "streams",
    rules: [
      "Cada torneo puede tener múltiples streams asociados, y cada stream debe estar asociado a un torneo específico.",
      "La URL de cada stream debe ser válida y debe apuntar a una transmisión en vivo de la partida del torneo.",
      "Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden agregar o modificar los streams asociados a un torneo.",
      "Si un torneo es de tipo PAID, entonces solo los usuarios que tengan una entrada de visualización (visualization_ticket) en estado USED para ese torneo pueden acceder a los streams asociados a ese torneo. Si el torneo es de tipo FREE, entonces cualquier usuario puede acceder a los streams asociados a ese torneo.",
      "Solo se pueden agregar o modificar los streams asociados a un torneo que esté en estado UPCOMING u ONGOING, y solo los promotores, moderadores o admins pueden agregar o modificar los streams asociados a un torneo."
    ]
  },
  {
    domain: "team_members",
    rules: [
      "Un equipo puede tener varios miembros, y un usuario puede ser miembro de varios equipos, pero un usuario no puede ser miembro del mismo equipo más de una vez.",
      "Para que un usuario pueda ser miembro de un equipo, el equipo debe estar inscrito en al menos un torneo a través de la tabla participation_tickets, con un estado de ticket_status que permita la participación (ACTIVE o USED).",
      "Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden agregar o eliminar miembros de un equipo, y solo para equipos que estén inscritos en torneos que estén en estado ONGOING."
    ]
  },
  {
    domain: "teams",
    rules: [
      "Un equipo debe tener un líder que es un usuario de la plataforma, y puede tener varios miembros que participan en los torneos.",
      "Un equipo no puede participar en un torneo sin tener al menos un miembro inscrito a través de la tabla participation_tickets, con un estado de ticket_status que permita la participación (ACTIVE o USED).",
      "Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden eliminar equipos.",
      "Cualquier usuario con rol PLAYER puede crear un equipo y participar en torneos, pero para que un equipo pueda participar en un torneo, al menos uno de sus miembros debe tener una entrada aprobada (APPROVED) para ese torneo, y el estado del ticket debe ser ACTIVE o USED."
    ]
  },
  {
    domain: "tournament_moderators",
    rules: [
      "Un torneo puede tener varios moderadores, y un usuario puede ser moderador de varios torneos, pero un usuario no puede ser moderador del mismo torneo más de una vez.",
      "Solo los usuarios con rol PROMOTER o ADMIN pueden asignar o eliminar moderadores de un torneo.",
      "Los moderadores de un torneo tienen permisos para gestionar ese torneo específico, lo que incluye la capacidad de actualizar el estado del torneo, gestionar los matches, asignar equipos a los matches, gestionar las entradas de participación y visualización, y gestionar los streams asociados al torneo.",
      "Un moderador no puede eliminar a otro moderador excepto a él mismo, mientras que el promotor o un admin sí puede eliminar a cualquier moderador.",
      "Un moderador no puede eliminar al promotor del torneo."
    ]
  },
  {
    domain: "tournaments",
    rules: [
      "Debe tener un promotor que es un usuario de la plataforma, y debe estar asociado a un juego específico.",
      "Puede tener varios moderadores asignados a través de la tabla tournament_moderators, y puede tener varios equipos participantes a través de la tabla participation_tickets.",
      "El estado del torneo se actualiza según su desarrollo: comienza como UPCOMING, cambia a ONGOING cuando inicia, a COMPLETED cuando termina con un ganador definido, o a CANCELED si es cancelado por el promotor o moderador.",
      "Solo los usuarios con rol PROMOTER o ADMIN pueden crear un torneo, y solo el promotor o un admin pueden actualizar el estado del torneo o cancelar el torneo.",
      "Un torneo solo puede ser cancelado si está en estado UPCOMING u ONGOING, y no se pueden cancelar torneos que estén en estado COMPLETED o CANCELED.",
      "Un torneo solo puede ser completado si está en estado ONGOING, y para completar un torneo se deben haber definido los ganadores de todos los matches asociados a ese torneo.",
      "Solo se pueden definir los ganadores de los matches de un torneo que esté en estado ONGOING, y solo los promotores, moderadores o admins pueden definir los ganadores de los matches.",
      "Solo se pueden agregar o modificar las reglas y la descripción de un torneo que esté en estado UPCOMING u ONGOING, y solo los promotores, moderadores o admins pueden agregar o modificar las reglas y la descripción de un torneo.",
      "Un torneo no puede iniciar (status ONGOING) si no tiene al menos la cantidad de equipos inscritos que marca el campo place_minimum, y no se pueden inscribir más equipos si se ha alcanzado el límite de participantes definido en place_limit.",
      "Cada vez que un ticket pase a estado USED para este torneo, el contador de place_remaining se debe reducir en 1.",
      "Cuando el torneo se crea, el valor de place_remaining debe ser igual al valor de place_limit, y este valor se va reduciendo a medida que los equipos se inscriben en el torneo a través de la compra de entradas (participation_tickets) que pasan a estado USED.",
      "Solo los usuarios con rol PROMOTER o ADMIN pueden modificar el límite de participantes (place_limit) y el mínimo de participantes (place_minimum) de un torneo, y solo para torneos que estén en estado UPCOMING.",
      "Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden agregar o modificar las reglas y la descripción de un torneo, y solo para torneos que estén en estado UPCOMING u ONGOING.",
      "Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden agregar o modificar los streams asociados a un torneo.",
      "Cuando un torneo se completa, se deben definir los ganadores, quienes son los que van a estar en la tabla rewards con su posición y premio definido. Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden definir los ganadores de un torneo, y solo para torneos que estén en estado ONGOING.",
      "Solo se pueden definir los ganadores de un torneo cuando todos los matches asociados a ese torneo estén en estado COMPLETED, y el ganador de cada match debe ser un equipo que haya participado en ese torneo a través de la tabla participation_tickets, con un estado de ticket_status que permita la participación (USED)."
    ]
  },
  {
    domain: "visualization_tickets",
    rules: [
      "Cualquier usuario puede comprar una entrada para visualizar un torneo, y cada entrada tiene un código QR asociado para su validación.",
      "El estado de la transacción se actualiza según el proceso de pago, y solo las entradas con estado APPROVED se consideran válidas para la visualización del torneo.",
      "Solo se puede comprar una entrada para visualizar un torneo que esté en estado UPCOMING u ONGOING, y no se pueden comprar entradas para torneos que estén en estado COMPLETED o CANCELED.",
      "Cuando un usuario realiza el proceso de compra, el ticket está en estado NEW. Cuando la compra se completa y se verifica, entonces pasa a estado ACTIVE. Cuando se utiliza el ticket para obtener la entrada VIP a los streams definidos para este torneo.",
      "Cuando el proceso de pago inicia, se crea un ticket en estado NEW. Cuando se verifica el pago, el estado pasa automáticamente a ACTIVE. Cuando el usuario accede a la transmisión del torneo, entonces se pasa a estado USED.",
      "Una entrada se puede bloquear (BLOCKED) bajo cualquier circunstancia que amerite bloquear la visualización de ese torneo para ese usuario, como por ejemplo una violación de las reglas del torneo. Solo los usuarios con rol PROMOTER o ADMIN pueden bloquear una entrada de visualización.",
      "No se pueden comprar tickets para un torneo FREE, pues los torneos FREE deben tener todos sus streams en tipo FREE, lo que significa que cualquier usuario puede acceder a ellos sin necesidad de una entrada de visualización.",
      "Solo se pueden comprar tickets para visualizar un torneo PAID, y para acceder a los streams de un torneo PAID se debe tener una entrada de visualización (visualization_ticket) en estado USED para ese torneo."
    ]
  },
  {
    domain: "user_roles",
    rules: [
      "Un usuario puede tener uno o varios roles, y cada rol define un conjunto de permisos que pueden ser globales o contextuales.",
      "Los permisos globales se aplican a todas las acciones del usuario en la plataforma, mientras que los permisos contextuales se aplican solo a ciertas acciones o recursos específicos (por ejemplo, un usuario puede ser moderador de un torneo específico, lo que le da permisos para gestionar ese torneo pero no otros).",
      "Solo un usuario ADMIN puede asignar un rol PROMOTER a un usuario.",
      "El rol VIEWER se crea por defecto cuando un usuario se registra en la plataforma.",
      "El rol PLAYER puede ser asignado a un usuario por sí mismo a través de un endpoint. Es decir, un usuario VIEWER puede ser player cuando él quiera.",
      "Un rol MODERATOR puede ser asignado a un usuario por sí mismo a través de un endpoint. Sin embargo, solo un PROMOTER puede darle permiso de moderador en sus torneos, o un ADMIN en cualquier torneo.",
      "Los permisos definidos por los roles se deben respetar en todas las operaciones de la plataforma, y cualquier acción que requiera ciertos permisos debe verificar que el usuario tenga el rol adecuado antes de permitir la acción.",
      "Los usuarios con rol ADMIN tienen permisos para gestionar cualquier aspecto de la plataforma sin restricciones, incluyendo la capacidad de asignar o eliminar roles a otros usuarios, gestionar torneos, matches, equipos, entradas, streams, comisiones y cualquier otro recurso de la plataforma."
    ]
  },
  {
    domain: "tournament_teams",
    rules: [
      "Un torneo puede tener varios equipos participantes, y un equipo puede participar en varios torneos, pero un equipo no puede participar en el mismo torneo más de una vez.",
      "Para que un equipo pueda participar en un torneo, al menos uno de sus miembros debe tener una entrada aprobada (APPROVED) para ese torneo, y el estado del ticket debe ser ACTIVE o USED.",
      "Esta tabla se llena automáticamente cuando una entrada de participación (participation_ticket) cambia a estado USED, lo que indica que el equipo asociado a esa entrada se ha registrado oficialmente en el torneo.",
      "Solo los usuarios con rol PROMOTER, MODERATOR o ADMIN pueden eliminar un equipo de un torneo, lo que implica eliminar la relación entre ese equipo y el torneo en la tabla tournament_teams. Esta acción se puede realizar solo para torneos que estén en estado ONGOING."
    ]
  }
];

function getUseCaseTitle(ruleText) {
  const cleanRule = ruleText.replace(/\.$/, "").trim();
  const words = cleanRule.split(/\s+/);
  return `${words.slice(0, 11).join(" ")}${words.length > 11 ? "..." : ""}`;
}

const useCases = businessRuleCatalog.flatMap((section) =>
  section.rules.map((rule, index) => ({
    title: getUseCaseTitle(rule),
    description: rule,
    domain: section.domain,
    order: index + 1
  }))
);

const roleMatrix = [
  ["Crear torneo", "PROMOTER, ADMIN", "Solo promotor creador o admin puede cambiar estado/cancelar"],
  ["Asignar moderadores", "PROMOTER, ADMIN", "Moderador no elimina al promotor; moderador solo puede auto-removerse"],
  ["Gestionar matches", "PROMOTER, MODERATOR(torneo), ADMIN", "Solo en torneos ONGOING y respetando reglas de estado"],
  ["Asignar equipos a match", "PROMOTER, MODERATOR(torneo), ADMIN", "Equipo debe estar inscrito con ticket ACTIVE o USED"],
  ["Crear equipo", "PLAYER", "El equipo requiere lider; para competir debe cumplir validaciones de ticket"],
  ["Eliminar equipo", "PROMOTER, MODERATOR, ADMIN", "Solo para equipos en torneos ONGOING"],
  ["Comprar ticket participacion", "Cualquier rol distinto de VIEWER", "Torneo en estado UPCOMING u ONGOING"],
  ["Bloquear ticket participacion", "PROMOTER, ADMIN", "Bloqueo por incumplimiento o regla operativa"],
  ["Comprar ticket visualizacion", "Usuarios autenticados", "Solo para torneos PAID"],
  ["Bloquear ticket visualizacion", "PROMOTER, ADMIN", "Torneo y usuario sujetos a reglas de plataforma"],
  ["Gestionar streams", "PROMOTER, MODERATOR(torneo), ADMIN", "Solo en torneos UPCOMING u ONGOING"],
  ["Gestionar comisiones", "ADMIN", "Comisiones separadas para FREE y PAID"],
  ["Gestion global de plataforma", "ADMIN", "Sin restricciones funcionales por recurso"],
  ["Donar a torneo", "Cualquier usuario", "Solo torneos ONGOING; cuenta ingreso si status APPROVED"]
];

const entities = [
  {
    name: "commissions",
    description: "Configura porcentajes de comision para torneos FREE y PAID.",
    fields: ["id (uuid)", "created_at (timestampz)", "commission_type (FREE|PAID)", "participation_percentage (float4)", "visualization_percentage (float4)", "donation_percentage (float4)"],
    relations: ["Sin FK directa; se referencia por tipo de torneo"],
    rules: [
      "Para torneos FREE se usa la comision FREE; para torneos PAID la comision PAID.",
      "La comision se calcula por cada fuente de ingreso: participacion, visualizacion y donaciones.",
      "Solo ADMIN puede modificar comisiones."
    ]
  },
  {
    name: "donations",
    description: "Donaciones monetarias al torneo o a un equipo especifico.",
    fields: ["id", "created_at", "tournament_id", "user_id", "team_id (nullable)", "amount", "message", "status (APPROVED|STARTED|REJECTED|IN_PROCESS)", "payment_method"],
    relations: ["tournaments -> tournament_id", "users -> user_id", "teams -> team_id (nullable)"],
    rules: [
      "Cualquier usuario puede donar.",
      "Si team_id es null, la donacion va al torneo en general; si no, a un equipo.",
      "Solo donaciones APPROVED cuentan para ingresos del torneo.",
      "Solo se dona a torneos ONGOING."
    ]
  },
  {
    name: "games",
    description: "Catalogo de juegos disponibles para torneos.",
    fields: ["id", "created_at", "name"],
    relations: ["tournaments -> game_id"],
    rules: [
      "Cada torneo se asocia a un unico juego.",
      "Un juego puede estar en multiples torneos.",
      "Solo ADMIN agrega o elimina juegos."
    ]
  },
  {
    name: "matches",
    description: "Partidas de un torneo con estado y posible ganador.",
    fields: ["id", "created_at", "tournament_id", "winner_team_id (nullable)", "start_datetime", "end_datetime (nullable)", "status (SCHEDULED|ONGOING|COMPLETED|CANCELED)", "match_details"],
    relations: ["tournaments -> tournament_id", "teams -> winner_team_id (nullable)", "match_teams -> relacion N:M de participantes"],
    rules: [
      "Solo se programan para torneos ONGOING.",
      "No cancelar un match ya COMPLETED.",
      "Solo se define ganador cuando el match esta ONGOING.",
      "El ganador debe ser un equipo participante del match.",
      "No se permiten superposiciones de horario con conflicto de equipos.",
      "Cambios de estado y detalle solo por PROMOTER(owner), MODERATOR(torneo) o ADMIN."
    ]
  },
  {
    name: "match_teams",
    description: "Relacion entre matches y equipos participantes.",
    fields: ["id", "created_at", "match_id", "team_id"],
    relations: ["matches -> match_id", "teams -> team_id"],
    rules: [
      "Un match puede tener uno o varios equipos.",
      "El equipo debe estar inscrito en el torneo (ticket ACTIVE o USED).",
      "Asignacion permitida para PROMOTER, MODERATOR o ADMIN y en torneos ONGOING."
    ]
  },
  {
    name: "participation_tickets",
    description: "Entrada para registrar equipos en torneos.",
    fields: ["id", "created_at", "tournament_id", "user_id", "team_id (nullable)", "qr", "transaction_status", "ticket_status (NEW|ACTIVE|USED|BLOCKED)", "payment_method", "amount"],
    relations: ["tournaments -> tournament_id", "users -> user_id", "teams -> team_id (nullable)"],
    rules: [
      "Compra permitida en torneos UPCOMING u ONGOING.",
      "Flujo: NEW -> ACTIVE -> USED; se puede BLOCKED por sancion.",
      "Solo tickets APPROVED habilitan participacion.",
      "Para participar, al menos un miembro del equipo debe tener ticket ACTIVE o USED.",
      "Solo PROMOTER o ADMIN puede bloquear ticket."
    ]
  },
  {
    name: "rewards",
    description: "Premios monetarios por posicion en el torneo.",
    fields: ["id", "created_at", "tournament_id", "team_id (nullable)", "position", "prize (nullable)"],
    relations: ["tournaments -> tournament_id", "teams -> team_id (nullable)"],
    rules: [
      "Puede haber multiples premios por torneo y posicion.",
      "team_id solo se asigna al definir resultados finales.",
      "prize puede ser null en torneos sin premio monetario.",
      "Solo PROMOTER o ADMIN define/modifica recompensas."
    ]
  },
  {
    name: "streams",
    description: "Transmisiones en vivo del torneo.",
    fields: ["id", "created_at", "tournament_id", "platform (TWITCH|YOUTUBE|FACEBOOK|KICK|INSTAGRAM|TIKTOK)", "url", "type (FREE|PAID)"],
    relations: ["tournaments -> tournament_id"],
    rules: [
      "Cada stream pertenece a un torneo y su URL debe ser valida.",
      "Solo PROMOTER, MODERATOR o ADMIN pueden gestionarlos.",
      "En torneos PAID: acceso solo con visualization_ticket USED.",
      "Gestion solo para torneos UPCOMING u ONGOING."
    ]
  },
  {
    name: "teams",
    description: "Equipos participantes liderados por un usuario.",
    fields: ["id", "created_at", "name", "leader_user_id"],
    relations: ["users -> leader_user_id", "team_members -> miembros", "tournament_teams -> participacion en torneos"],
    rules: [
      "Todo equipo debe tener lider.",
      "PLAYER puede crear equipos.",
      "No participa en torneo sin ticket valido (ACTIVE o USED).",
      "Eliminar equipo: permitido a PROMOTER, MODERATOR o ADMIN."
    ]
  },
  {
    name: "team_members",
    description: "Relacion de usuarios miembros por equipo.",
    fields: ["id", "created_at", "team_id", "user_id"],
    relations: ["teams -> team_id", "users -> user_id"],
    rules: [
      "Un usuario no puede repetirse en el mismo equipo.",
      "Equipo debe estar inscrito en al menos un torneo con ticket ACTIVE o USED.",
      "Solo PROMOTER, MODERATOR o ADMIN gestionan miembros en torneos ONGOING."
    ]
  },
  {
    name: "tournaments",
    description: "Entidad principal del evento competitivo.",
    fields: ["id", "created_at", "name", "rules", "promoter_user_id", "game_id", "place_limit", "place_remaining", "place_minimum", "date_start", "date_end", "participation_price", "visualization_price", "type (FREE|PAID)", "status (UPCOMING|ONGOING|COMPLETED|CANCELED)", "description"],
    relations: ["users -> promoter_user_id", "games -> game_id", "tournament_moderators", "participation_tickets", "matches", "rewards", "streams"],
    rules: [
      "Crear torneo: solo PROMOTER o ADMIN.",
      "Transicion de estado: UPCOMING -> ONGOING -> COMPLETED o CANCELED.",
      "No iniciar ONGOING sin alcanzar place_minimum.",
      "No superar place_limit; place_remaining decrementa cuando ticket pasa a USED.",
      "Solo en ONGOING se definen ganadores de matches y torneo.",
      "Cerrar torneo solo si todos los matches estan COMPLETED.",
      "Cambios de reglas/descripcion y streams solo en UPCOMING u ONGOING."
    ]
  },
  {
    name: "tournament_moderators",
    description: "Moderadores asignados por torneo.",
    fields: ["id", "created_at", "tournament_id", "user_id"],
    relations: ["tournaments -> tournament_id", "users -> user_id"],
    rules: [
      "No duplicar moderador por torneo.",
      "Asignacion/eliminacion por PROMOTER o ADMIN.",
      "Moderador gestiona solo su torneo.",
      "Moderador no elimina al promotor ni a otros moderadores (excepto a si mismo)."
    ]
  },
  {
    name: "tournament_teams",
    description: "Equipos inscritos oficialmente en cada torneo.",
    fields: ["id", "created_at", "tournament_id", "team_id"],
    relations: ["tournaments -> tournament_id", "teams -> team_id"],
    rules: [
      "No duplicar equipo en el mismo torneo.",
      "Se llena automaticamente cuando participation_ticket pasa a USED.",
      "Eliminar relacion solo por PROMOTER, MODERATOR o ADMIN y con torneo ONGOING."
    ]
  },
  {
    name: "visualization_tickets",
    description: "Entrada para ver streams de torneos PAID.",
    fields: ["id", "created_at", "tournament_id", "user_id", "qr", "transaction_status", "ticket_status (NEW|ACTIVE|USED|BLOCKED)", "payment_method", "amount"],
    relations: ["tournaments -> tournament_id", "users -> user_id"],
    rules: [
      "Compra permitida solo para torneos PAID en UPCOMING u ONGOING.",
      "Flujo: NEW -> ACTIVE -> USED; se puede BLOCKED por sancion.",
      "Acceso a stream PAID requiere ticket USED.",
      "No aplica compra para torneos FREE."
    ]
  },
  {
    name: "user_roles",
    description: "Roles globales y permisos del usuario.",
    fields: ["id", "created_at", "user_id", "role (ADMIN|PROMOTER|PLAYER|VIEWER|MOD)"],
    relations: ["users -> user_id"],
    rules: [
      "Un usuario puede tener multiples roles.",
      "VIEWER se crea por defecto al registro.",
      "Solo ADMIN asigna rol PROMOTER.",
      "Usuario puede auto-asignarse PLAYER.",
      "Rol MOD requiere habilitacion de PROMOTER o ADMIN a nivel torneo.",
      "ADMIN tiene permisos completos sobre toda la plataforma."
    ]
  }
];

const diagrams = [
  {
    id: "arquitectura",
    label: "Arquitectura AWS",
    code: `flowchart LR
    user[Usuarios Web/Mobile] --> r53[Route53]
    r53 --> waf[AWS WAF]
    waf --> alb[Application Load Balancer]
    alb --> eks[EKS Cluster]
    subgraph eks[EKS Namespace Platform]
      gw[API Gateway Service\nSpring Cloud Gateway]
      orch[Orchestrator Service\nJava Reactor + Clean Architecture]
      disc[Discovery Service\nEureka Server]
    end
    gw --> orch
    orch --> disc
    gw --> auth[Supabase Auth\nJWT]
    orch --> supa[(Supabase PostgreSQL)]
    orch --> sec[Secrets Manager]
    eks --> cw[CloudWatch]
    eks --> iam[IAM Roles for Service Accounts]`
  },
  {
    id: "despliegue",
    label: "Despliegue",
    code: `flowchart TB
    dev[Repositorio GitHub] --> ci[Pipeline CI/CD]
    ci --> ecr[Amazon ECR]
    ecr --> eks[EKS Cluster]
    subgraph eks[EKS - namespace videogames]
      ing[Ingress/ALB Controller]
      gwPod[Gateway Pods]
      orchPod[Orchestrator Pods]
      discPod[Discovery Pods]
      hpa[HPA Autoscaling]
    end
    ing --> gwPod
    gwPod --> orchPod
    orchPod --> discPod
    orchPod --> supa[(Supabase Cloud)]
    eks --> obs[CloudWatch + Logs]
    eks --> sec[Secrets Manager + IAM]`
  },
  {
    id: "componentes",
    label: "Componentes",
    code: `flowchart TB
    client[Cliente] --> gateway[API Gateway]
    gateway --> orchestrator[MS Orquestacion]
    gateway --> discovery[MS Discovery]
    orchestrator --> supabase[(Supabase API + DB)]
    orchestrator --> security[Spring Security + JWT]
    orchestrator --> rules[Casos de Uso + Reglas de Negocio]
    discovery --> reg[Registro de microservicios]`
  },
   {
    id: "clases",
    label: "Clases (orquestador)",
    code: `classDiagram
    class Tournament {
      +UUID id
      +String name
      +TournamentType type
      +TournamentStatus status
      +int placeLimit
      +int placeRemaining
      +int placeMinimum
    }
    class Match {
      +UUID id
      +MatchStatus status
      +OffsetDateTime startDatetime
      +OffsetDateTime endDatetime
      +UUID winnerTeamId
    }
    class Team {
      +UUID id
      +String name
      +UUID leaderUserId
    }
    class Ticket {
      +UUID id
      +TransactionStatus transactionStatus
      +TicketStatus ticketStatus
      +double amount
    }
    class TournamentUseCase
    class MatchUseCase
    class SecurityUseCase
    class TournamentRepository
    class MatchRepository

    Tournament "1" --> "*" Match : contiene
    Team "*" --> "*" Match : participa
    Tournament "1" --> "*" Ticket : habilita
    TournamentUseCase --> TournamentRepository
    MatchUseCase --> MatchRepository
    TournamentUseCase --> SecurityUseCase`
  },
  {
    id: "secuencia",
    label: "Secuencia: inscripcion equipo",
    code: `sequenceDiagram
    participant U as Usuario
    participant G as API Gateway
    participant O as Orquestador
    participant S as Supabase

    U->>G: POST /participation-tickets
    G->>O: Request + JWT
    O->>S: Crear ticket (NEW, STARTED)
    S-->>O: Ticket creado
    O-->>U: 202 In Process
    U->>G: Confirmar pago
    G->>O: webhook/payment-status
    O->>S: Actualizar ticket ACTIVE/APPROVED
    U->>G: PATCH /participation-tickets/{id}/use (team_id)
    G->>O: Validar reglas de torneo
    O->>S: Ticket->USED + insertar tournament_teams
    O-->>U: 200 Equipo inscrito`
  },
  {
    id: "flujo",
    label: "Flujo: compra y uso ticket",
    code: `flowchart TD
    A[Usuario inicia compra] --> B[Crear ticket NEW + STARTED]
    B --> C{Pago aprobado?}
    C -- No --> D[Ticket REJECTED]
    C -- Si --> E[Ticket ACTIVE + APPROVED]
    E --> F{Asigna team_id?}
    F -- No --> G[Espera de accion del usuario]
    F -- Si --> H[Validar estado torneo y cupos]
    H --> I{Reglas validas?}
    I -- No --> J[Rechazar uso de ticket]
    I -- Si --> K[Marcar ticket USED]
    K --> L[Insertar relacion en tournament_teams]
    L --> M[Reducir place_remaining]
    M --> N[Equipo inscrito oficialmente]`
  },
  {
    id: "er",
    label: "Entidad-Relacion",
    code: `erDiagram
      users ||--o{ user_roles : has
      users ||--o{ teams : leads
      users ||--o{ participation_tickets : buys
      users ||--o{ visualization_tickets : buys
      users ||--o{ donations : makes
      users ||--o{ tournament_moderators : moderates

      games ||--o{ tournaments : used_in
      tournaments ||--o{ matches : contains
      tournaments ||--o{ streams : has
      tournaments ||--o{ rewards : grants
      tournaments ||--o{ donations : receives
      tournaments ||--o{ participation_tickets : receives
      tournaments ||--o{ visualization_tickets : receives
      tournaments ||--o{ tournament_moderators : has
      tournaments ||--o{ tournament_teams : has

      teams ||--o{ team_members : has
      teams ||--o{ match_teams : appears_in
      teams ||--o{ rewards : wins

      matches ||--o{ match_teams : includes
      teams ||--o{ tournament_teams : joins`
  }
];

const routes = [
  ["POST", "/api/v1/tournaments", "Crear torneo", "PROMOTER, ADMIN"],
  ["GET", "/api/v1/tournaments", "Listar torneos", "PUBLICO"],
  ["PATCH", "/api/v1/tournaments/{id}/status", "Actualizar estado del torneo", "PROMOTER(owner), ADMIN, MODERATOR(torneo)"],
  ["POST", "/api/v1/tournament-moderators", "Asignar moderador", "PROMOTER, ADMIN"],
  ["POST", "/api/v1/teams", "Crear equipo", "PLAYER"],
  ["POST", "/api/v1/participation-tickets", "Comprar ticket de participacion", "PLAYER, PROMOTER, MODERATOR, ADMIN"],
  ["PATCH", "/api/v1/participation-tickets/{id}/use", "Marcar ticket USED y registrar equipo", "PROMOTER, MODERATOR, ADMIN"],
  ["POST", "/api/v1/matches", "Programar match", "PROMOTER(owner), MODERATOR(torneo), ADMIN"],
  ["PATCH", "/api/v1/matches/{id}/winner", "Definir ganador de match", "PROMOTER(owner), MODERATOR(torneo), ADMIN"],
  ["POST", "/api/v1/streams", "Crear stream", "PROMOTER(owner), MODERATOR(torneo), ADMIN"],
  ["POST", "/api/v1/visualization-tickets", "Comprar ticket de visualizacion", "VIEWER, PLAYER, PROMOTER, MODERATOR, ADMIN"],
  ["POST", "/api/v1/donations", "Crear donacion", "AUTHENTICATED USER"],
  ["PATCH", "/api/v1/commissions/{type}", "Actualizar comisiones", "ADMIN"],
  ["GET", "/api/v1/rewards?tournamentId={id}", "Consultar premios", "PUBLICO"],
  ["POST", "/api/v1/tournaments/{id}/close", "Cerrar torneo y consolidar rewards", "PROMOTER(owner), MODERATOR(torneo), ADMIN"]
];

const oas3 = `{"openapi": "3.1.0",
  "info": {
    "title": "Videogames Tournament Management API",
    "description": "Reactive API for videogame tournament management.",
    "contact": {
      "name": "Platform Team"
    },
    "version": "v1"
  },
  "servers": [
    {
      "url": "http://localhost:8080",
      "description": "Generated server url"
    }
  ],
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "paths": {
    "/api/v1/commissions": {
      "get": {
        "tags": [
          "Commissions"
        ],
        "summary": "List commissions",
        "operationId": "listCommissions",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listCommissionsApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "put": {
        "tags": [
          "Commissions"
        ],
        "summary": "Update commission",
        "operationId": "updateCommission",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateCommissionRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateCommissionApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/commissions/{commissionType}": {
      "get": {
        "tags": [
          "Commissions"
        ],
        "summary": "Get commission by type",
        "operationId": "getCommission",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getCommissionApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/donations": {
      "post": {
        "tags": [
          "Donations"
        ],
        "summary": "Create donation",
        "operationId": "createDonation",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateDonationRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createDonationApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/donations/tournament/{tournamentId}": {
      "get": {
        "tags": [
          "Donations"
        ],
        "summary": "List donations by tournament",
        "operationId": "listDonations",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listDonationsApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/donations/{id}": {
      "get": {
        "tags": [
          "Donations"
        ],
        "summary": "Get donation by id",
        "operationId": "getDonation",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getDonationApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/donations/{id}/commission": {
      "get": {
        "tags": [
          "Donations"
        ],
        "summary": "Calculate donation commission",
        "operationId": "calculateDonationCommission",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/calculateDonationCommissionApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/donations/{id}/status": {
      "patch": {
        "tags": [
          "Donations"
        ],
        "summary": "Update donation status",
        "operationId": "updateDonationStatus",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateDonationStatusRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateDonationStatusApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/games": {
      "get": {
        "tags": [
          "Games"
        ],
        "summary": "List games",
        "operationId": "listGames",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listGamesApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "post": {
        "tags": [
          "Games"
        ],
        "summary": "Create game",
        "operationId": "createGame",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateGameRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createGameApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/games/{id}": {
      "get": {
        "tags": [
          "Games"
        ],
        "summary": "Get game by id",
        "operationId": "getGame",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getGameApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "delete": {
        "tags": [
          "Games"
        ],
        "summary": "Delete game",
        "operationId": "deleteGame",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/deleteGameApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches": {
      "get": {
        "tags": [
          "Matches"
        ],
        "summary": "List matches",
        "operationId": "listMatches",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listMatchesApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "post": {
        "tags": [
          "Matches"
        ],
        "summary": "Create match",
        "operationId": "createMatch",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateMatchRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createMatchApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/tournament/{tournamentId}": {
      "get": {
        "tags": [
          "Matches"
        ],
        "summary": "List matches by tournament",
        "operationId": "listMatchesByTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listMatchesByTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/tournament/{tournamentId}/participant/{participantId}": {
      "get": {
        "tags": [
          "Matches"
        ],
        "summary": "List matches by participant and tournament",
        "operationId": "listMatchesByParticipantAndTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listMatchesByParticipantAndTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/{id}": {
      "get": {
        "tags": [
          "Matches"
        ],
        "summary": "Get match by id",
        "operationId": "getMatch",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getMatchApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "put": {
        "tags": [
          "Matches"
        ],
        "summary": "Update match",
        "operationId": "updateMatch",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateMatchRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateMatchApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/{id}/cancel": {
      "patch": {
        "tags": [
          "Matches"
        ],
        "summary": "Cancel match",
        "operationId": "cancelMatch",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/cancelMatchApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/{id}/details": {
      "patch": {
        "tags": [
          "Matches"
        ],
        "summary": "Update match details",
        "operationId": "updateMatchDetails",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateMatchDetailsRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateMatchDetailsApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/{id}/status": {
      "patch": {
        "tags": [
          "Matches"
        ],
        "summary": "Update match status",
        "operationId": "updateMatchStatus",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateMatchStatusRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateMatchStatusApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/{id}/teams": {
      "post": {
        "tags": [
          "Matches"
        ],
        "summary": "Assign team to match",
        "operationId": "assignTeam",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AssignTeamToMatchRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/assignTeamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/{id}/teams/{teamId}": {
      "delete": {
        "tags": [
          "Matches"
        ],
        "summary": "Remove team from match",
        "operationId": "removeTeam",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/removeTeamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/matches/{id}/winner": {
      "patch": {
        "tags": [
          "Matches"
        ],
        "summary": "Define match winner",
        "operationId": "defineWinner",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DefineMatchWinnerRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/defineWinnerApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/participation-tickets": {
      "post": {
        "tags": [
          "Participation Tickets"
        ],
        "summary": "Create participation ticket",
        "operationId": "createParticipationTicket",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateParticipationTicketRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createParticipationTicketApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/participation-tickets/tournament/{tournamentId}": {
      "get": {
        "tags": [
          "Participation Tickets"
        ],
        "summary": "List participation tickets by tournament",
        "operationId": "listParticipationTicketsByTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listParticipationTicketsByTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/participation-tickets/{id}": {
      "get": {
        "tags": [
          "Participation Tickets"
        ],
        "summary": "Get participation ticket",
        "operationId": "getParticipationTicket",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getParticipationTicketApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/participation-tickets/{id}/block": {
      "patch": {
        "tags": [
          "Participation Tickets"
        ],
        "summary": "Block participation ticket",
        "operationId": "blockParticipationTicket",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/blockParticipationTicketApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/participation-tickets/{id}/status": {
      "patch": {
        "tags": [
          "Participation Tickets"
        ],
        "summary": "Update participation ticket status",
        "operationId": "updateParticipationTicketStatus",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTicketStatusRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateParticipationTicketStatusApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/participation-tickets/{id}/transaction-status": {
      "patch": {
        "tags": [
          "Participation Tickets"
        ],
        "summary": "Update participation ticket transaction status",
        "operationId": "updateParticipationTicketTransactionStatus",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTicketTransactionStatusRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateParticipationTicketTransactionStatusApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/participation-tickets/{id}/validate-qr": {
      "patch": {
        "tags": [
          "Participation Tickets"
        ],
        "summary": "Validate participation ticket QR",
        "operationId": "validateParticipationTicketQr",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidateQrRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/validateParticipationTicketQrApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/rewards": {
      "post": {
        "tags": [
          "Rewards"
        ],
        "summary": "Create reward",
        "operationId": "createReward",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateRewardRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createRewardApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/rewards/tournament/{tournamentId}": {
      "get": {
        "tags": [
          "Rewards"
        ],
        "summary": "List rewards by tournament",
        "operationId": "listRewardsByTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listRewardsByTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/rewards/{id}": {
      "get": {
        "tags": [
          "Rewards"
        ],
        "summary": "Get reward by id",
        "operationId": "getReward",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getRewardApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "put": {
        "tags": [
          "Rewards"
        ],
        "summary": "Update reward",
        "operationId": "updateReward",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateRewardRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateRewardApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/rewards/{id}/team": {
      "patch": {
        "tags": [
          "Rewards"
        ],
        "summary": "Assign reward to team",
        "operationId": "assignRewardToTeam",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AssignRewardToTeamRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/assignRewardToTeamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/streams": {
      "post": {
        "tags": [
          "Streams"
        ],
        "summary": "Create stream",
        "operationId": "createStream",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateStreamRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createStreamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/streams/tournament/{tournamentId}": {
      "get": {
        "tags": [
          "Streams"
        ],
        "summary": "List streams by tournament",
        "operationId": "listStreamsByTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listStreamsByTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/streams/{id}": {
      "get": {
        "tags": [
          "Streams"
        ],
        "summary": "Get stream by id",
        "operationId": "getStream",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getStreamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "put": {
        "tags": [
          "Streams"
        ],
        "summary": "Update stream",
        "operationId": "updateStream",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateStreamRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateStreamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "delete": {
        "tags": [
          "Streams"
        ],
        "summary": "Delete stream",
        "operationId": "deleteStream",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/deleteStreamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/teams": {
      "get": {
        "tags": [
          "Teams"
        ],
        "summary": "List teams",
        "operationId": "listTeams",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listTeamsApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "post": {
        "tags": [
          "Teams"
        ],
        "summary": "Create team",
        "operationId": "createTeam",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateTeamRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createTeamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/teams/leader/{leaderUserId}": {
      "get": {
        "tags": [
          "Teams"
        ],
        "summary": "List teams by leader",
        "operationId": "listTeamsByLeader",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listTeamsByLeaderApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/teams/{id}": {
      "get": {
        "tags": [
          "Teams"
        ],
        "summary": "Get team by id",
        "operationId": "getTeam",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getTeamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "put": {
        "tags": [
          "Teams"
        ],
        "summary": "Update team",
        "operationId": "updateTeam",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTeamRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateTeamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "delete": {
        "tags": [
          "Teams"
        ],
        "summary": "Delete team",
        "operationId": "deleteTeam",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/deleteTeamApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/teams/{id}/members": {
      "get": {
        "tags": [
          "Teams"
        ],
        "summary": "List team members",
        "operationId": "listTeamMembers",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listTeamMembersApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "post": {
        "tags": [
          "Teams"
        ],
        "summary": "Add team member",
        "operationId": "addTeamMember",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AddTeamMemberRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/addTeamMemberApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/teams/{id}/members/{userId}": {
      "delete": {
        "tags": [
          "Teams"
        ],
        "summary": "Remove team member",
        "operationId": "removeTeamMember",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/removeTeamMemberApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournament-moderators": {
      "post": {
        "tags": [
          "Tournament Moderators"
        ],
        "summary": "Assign tournament moderator",
        "operationId": "assignModerator",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AssignModeratorRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/assignModeratorApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournament-moderators/tournament/{tournamentId}": {
      "get": {
        "tags": [
          "Tournament Moderators"
        ],
        "summary": "List tournament moderators",
        "operationId": "listModerators",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listModeratorsApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournament-moderators/tournament/{tournamentId}/user/{userId}": {
      "delete": {
        "tags": [
          "Tournament Moderators"
        ],
        "summary": "Remove tournament moderator",
        "operationId": "removeModerator",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/removeModeratorApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournaments": {
      "get": {
        "tags": [
          "Tournaments"
        ],
        "summary": "List tournaments",
        "operationId": "listTournaments",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listTournamentsApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "post": {
        "tags": [
          "Tournaments"
        ],
        "summary": "Create tournament",
        "operationId": "createTournament",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateTournamentRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournaments/promoter/{promoterId}": {
      "get": {
        "tags": [
          "Tournaments"
        ],
        "summary": "List tournaments by promoter",
        "operationId": "listTournamentsByPromoter",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listTournamentsByPromoterApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournaments/{id}": {
      "get": {
        "tags": [
          "Tournaments"
        ],
        "summary": "Get tournament by id",
        "operationId": "getTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "put": {
        "tags": [
          "Tournaments"
        ],
        "summary": "Update tournament",
        "operationId": "updateTournament",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTournamentRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournaments/{id}/cancel": {
      "patch": {
        "tags": [
          "Tournaments"
        ],
        "summary": "Cancel tournament",
        "operationId": "cancelTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/cancelTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournaments/{id}/complete": {
      "patch": {
        "tags": [
          "Tournaments"
        ],
        "summary": "Complete tournament",
        "operationId": "completeTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/completeTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournaments/{id}/place-limits": {
      "patch": {
        "tags": [
          "Tournaments"
        ],
        "summary": "Update place limits",
        "operationId": "updatePlaceLimits",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdatePlaceLimitsRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updatePlaceLimitsApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournaments/{id}/rules": {
      "patch": {
        "tags": [
          "Tournaments"
        ],
        "summary": "Update tournament rules",
        "operationId": "updateTournamentRules",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTournamentRulesRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateTournamentRulesApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournaments/{id}/status": {
      "patch": {
        "tags": [
          "Tournaments"
        ],
        "summary": "Update tournament status",
        "operationId": "updateTournamentStatus",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTournamentStatusRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateTournamentStatusApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournament-teams/tournament/{tournamentId}": {
      "get": {
        "tags": [
          "Tournament Teams"
        ],
        "summary": "List teams in tournament",
        "operationId": "listTeamsInTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listTeamsInTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournament-teams/tournament/{tournamentId}/team/{teamId}": {
      "get": {
        "tags": [
          "Tournament Teams"
        ],
        "summary": "Get team in tournament",
        "operationId": "getTeamInTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getTeamInTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      },
      "delete": {
        "tags": [
          "Tournament Teams"
        ],
        "summary": "Remove team from tournament",
        "operationId": "removeTeamFromTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/removeTeamFromTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/tournament-teams/tournament/{tournamentId}/team/{teamId}/exists": {
      "get": {
        "tags": [
          "Tournament Teams"
        ],
        "summary": "Check if team is in tournament",
        "operationId": "checkTeamInTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/checkTeamInTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/user-roles": {
      "post": {
        "tags": [
          "User Roles"
        ],
        "summary": "Assign role",
        "operationId": "assignRole",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AssignRoleRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/assignRoleApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/user-roles/user/{userId}": {
      "get": {
        "tags": [
          "User Roles"
        ],
        "summary": "Get user roles",
        "operationId": "getUserRoles",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getUserRolesApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/user-roles/{id}": {
      "delete": {
        "tags": [
          "User Roles"
        ],
        "summary": "Remove role",
        "operationId": "removeRole",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/removeRoleApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/visualization-tickets": {
      "post": {
        "tags": [
          "Visualization Tickets"
        ],
        "summary": "Create visualization ticket",
        "operationId": "createVisualizationTicket",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateVisualizationTicketRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ServerResponse"
                }
              }
            }
          },
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/createVisualizationTicketApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/visualization-tickets/tournament/{tournamentId}": {
      "get": {
        "tags": [
          "Visualization Tickets"
        ],
        "summary": "List visualization tickets by tournament",
        "operationId": "listVisualizationTicketsByTournament",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/listVisualizationTicketsByTournamentApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/visualization-tickets/{id}": {
      "get": {
        "tags": [
          "Visualization Tickets"
        ],
        "summary": "Get visualization ticket",
        "operationId": "getVisualizationTicket",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/getVisualizationTicketApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/visualization-tickets/{id}/block": {
      "patch": {
        "tags": [
          "Visualization Tickets"
        ],
        "summary": "Block visualization ticket",
        "operationId": "blockVisualizationTicket",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/blockVisualizationTicketApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/visualization-tickets/{id}/status": {
      "patch": {
        "tags": [
          "Visualization Tickets"
        ],
        "summary": "Update visualization ticket status",
        "operationId": "updateVisualizationTicketStatus",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTicketStatusRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateVisualizationTicketStatusApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/visualization-tickets/{id}/transaction-status": {
      "patch": {
        "tags": [
          "Visualization Tickets"
        ],
        "summary": "Update visualization ticket transaction status",
        "operationId": "updateVisualizationTicketTransactionStatus",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTicketTransactionStatusRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/updateVisualizationTicketTransactionStatusApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/api/v1/visualization-tickets/{id}/validate-qr": {
      "patch": {
        "tags": [
          "Visualization Tickets"
        ],
        "summary": "Validate visualization ticket QR",
        "operationId": "validateVisualizationTicketQr",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidateQrRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/validateVisualizationTicketQrApiResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ServerResponse": {

      },
      "CommissionResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "commissionType": {
            "type": "string",
            "enum": [
              "FREE",
              "PAID"
            ]
          },
          "participationPercentage": {
            "type": "number",
            "format": "float"
          },
          "visualizationPercentage": {
            "type": "number",
            "format": "float"
          },
          "donationPercentage": {
            "type": "number",
            "format": "float"
          }
        }
      },
      "listCommissionsApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CommissionResponse"
            }
          }
        }
      },
      "UpdateCommissionRequest": {
        "properties": {
          "commissionType": {
            "type": "string",
            "enum": [
              "FREE",
              "PAID"
            ]
          },
          "participationPercentage": {
            "type": "number",
            "format": "float"
          },
          "visualizationPercentage": {
            "type": "number",
            "format": "float"
          },
          "donationPercentage": {
            "type": "number",
            "format": "float"
          }
        },
        "required": [
          "commissionType",
          "donationPercentage",
          "participationPercentage",
          "visualizationPercentage"
        ]
      },
      "updateCommissionApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/CommissionResponse"
          }
        }
      },
      "getCommissionApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/CommissionResponse"
          }
        }
      },
      "CreateDonationRequest": {
        "properties": {
          "tournamentId": {
            "type": "string",
            "minLength": 1
          },
          "teamId": {
            "type": "string"
          },
          "amount": {
            "type": "number",
            "format": "double"
          },
          "message": {
            "type": "string"
          }
        },
        "required": [
          "tournamentId"
        ]
      },
      "DonationResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "tournamentId": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          },
          "teamId": {
            "type": "string"
          },
          "amount": {
            "type": "number",
            "format": "double"
          },
          "message": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "APPROVED",
              "STARTED",
              "REJECTED",
              "IN_PROCESS"
            ]
          },
          "paymentMethod": {
            "type": "string",
            "enum": [
              "CREDIT_CARD",
              "DEBIT_CARD",
              "PAYPAL",
              "CASH",
              "BANK_TRANSFER"
            ]
          }
        }
      },
      "createDonationApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/DonationResponse"
          }
        }
      },
      "listDonationsApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/DonationResponse"
            }
          }
        }
      },
      "getDonationApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/DonationResponse"
          }
        }
      },
      "calculateDonationCommissionApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "number"
          }
        }
      },
      "UpdateDonationStatusRequest": {
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "APPROVED",
              "STARTED",
              "REJECTED",
              "IN_PROCESS"
            ]
          }
        },
        "required": [
          "status"
        ]
      },
      "updateDonationStatusApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/DonationResponse"
          }
        }
      },
      "GameResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "name": {
            "type": "string"
          }
        }
      },
      "listGamesApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/GameResponse"
            }
          }
        }
      },
      "CreateGameRequest": {
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "name"
        ]
      },
      "createGameApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/GameResponse"
          }
        }
      },
      "getGameApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/GameResponse"
          }
        }
      },
      "deleteGameApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "MatchResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "startDateTime": {
            "type": "string"
          },
          "endDateTime": {
            "type": "string"
          },
          "tournamentId": {
            "type": "string"
          },
          "winnerTeamId": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "SCHEDULED",
              "ONGOING",
              "COMPLETED",
              "CANCELED"
            ]
          },
          "matchDetails": {
            "type": "string"
          },
          "participantIds": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "uniqueItems": true
          }
        }
      },
      "listMatchesApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/MatchResponse"
            }
          }
        }
      },
      "CreateMatchRequest": {
        "properties": {
          "tournamentId": {
            "type": "string",
            "minLength": 1
          },
          "dateStart": {
            "type": "string",
            "minLength": 1
          },
          "timeStart": {
            "type": "string"
          }
        },
        "required": [
          "dateStart",
          "tournamentId"
        ]
      },
      "createMatchApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/MatchResponse"
          }
        }
      },
      "listMatchesByTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/MatchResponse"
            }
          }
        }
      },
      "listMatchesByParticipantAndTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/MatchResponse"
            }
          }
        }
      },
      "getMatchApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/MatchResponse"
          }
        }
      },
      "UpdateMatchRequest": {
        "properties": {
          "dateTimeStart": {
            "type": "string"
          }
        }
      },
      "updateMatchApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/MatchResponse"
          }
        }
      },
      "cancelMatchApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/MatchResponse"
          }
        }
      },
      "UpdateMatchDetailsRequest": {
        "properties": {
          "matchDetails": {
            "type": "string"
          }
        }
      },
      "updateMatchDetailsApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/MatchResponse"
          }
        }
      },
      "UpdateMatchStatusRequest": {
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "SCHEDULED",
              "ONGOING",
              "COMPLETED",
              "CANCELED"
            ]
          }
        },
        "required": [
          "status"
        ]
      },
      "updateMatchStatusApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/MatchResponse"
          }
        }
      },
      "AssignTeamToMatchRequest": {
        "properties": {
          "teamId": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "teamId"
        ]
      },
      "assignTeamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/MatchResponse"
          }
        }
      },
      "removeTeamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "DefineMatchWinnerRequest": {
        "properties": {
          "winnerTeamId": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "winnerTeamId"
        ]
      },
      "defineWinnerApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/MatchResponse"
          }
        }
      },
      "CreateParticipationTicketRequest": {
        "properties": {
          "tournamentId": {
            "type": "string",
            "minLength": 1
          },
          "amount": {
            "type": "number",
            "format": "double"
          },
          "paymentMethod": {
            "type": "string",
            "enum": [
              "CREDIT_CARD",
              "DEBIT_CARD",
              "PAYPAL",
              "CASH",
              "BANK_TRANSFER"
            ]
          }
        },
        "required": [
          "paymentMethod",
          "tournamentId"
        ]
      },
      "TicketResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "qr": {
            "type": "string"
          },
          "ticketStatus": {
            "type": "string",
            "enum": [
              "NEW",
              "ACTIVE",
              "USED",
              "BLOCKED"
            ]
          },
          "transactionStatus": {
            "type": "string",
            "enum": [
              "APPROVED",
              "STARTED",
              "REJECTED",
              "IN_PROCESS"
            ]
          },
          "paymentMethod": {
            "type": "string",
            "enum": [
              "CREDIT_CARD",
              "DEBIT_CARD",
              "PAYPAL",
              "CASH",
              "BANK_TRANSFER"
            ]
          },
          "tournamentId": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          },
          "teamId": {
            "type": "string"
          },
          "amount": {
            "type": "number",
            "format": "double"
          }
        }
      },
      "createParticipationTicketApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "listParticipationTicketsByTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TicketResponse"
            }
          }
        }
      },
      "getParticipationTicketApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "blockParticipationTicketApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "UpdateTicketStatusRequest": {
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "NEW",
              "ACTIVE",
              "USED",
              "BLOCKED"
            ]
          }
        },
        "required": [
          "status"
        ]
      },
      "updateParticipationTicketStatusApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "UpdateTicketTransactionStatusRequest": {
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "APPROVED",
              "STARTED",
              "REJECTED",
              "IN_PROCESS"
            ]
          }
        },
        "required": [
          "status"
        ]
      },
      "updateParticipationTicketTransactionStatusApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "ValidateQrRequest": {
        "properties": {
          "qr": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "qr"
        ]
      },
      "validateParticipationTicketQrApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "CreateRewardRequest": {
        "properties": {
          "tournamentId": {
            "type": "string",
            "minLength": 1
          },
          "position": {
            "type": "integer",
            "format": "int32"
          },
          "prize": {
            "type": "number",
            "format": "double"
          }
        },
        "required": [
          "tournamentId"
        ]
      },
      "RewardResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "tournamentId": {
            "type": "string"
          },
          "teamId": {
            "type": "string"
          },
          "position": {
            "type": "integer",
            "format": "int32"
          },
          "prize": {
            "type": "number",
            "format": "double"
          },
          "createdAt": {
            "type": "string"
          }
        }
      },
      "createRewardApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/RewardResponse"
          }
        }
      },
      "listRewardsByTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/RewardResponse"
            }
          }
        }
      },
      "getRewardApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/RewardResponse"
          }
        }
      },
      "UpdateRewardRequest": {
        "properties": {
          "prize": {
            "type": "number",
            "format": "double"
          }
        }
      },
      "updateRewardApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/RewardResponse"
          }
        }
      },
      "AssignRewardToTeamRequest": {
        "properties": {
          "teamId": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "teamId"
        ]
      },
      "assignRewardToTeamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/RewardResponse"
          }
        }
      },
      "CreateStreamRequest": {
        "properties": {
          "tournamentId": {
            "type": "string",
            "minLength": 1
          },
          "platform": {
            "type": "string",
            "enum": [
              "TWITCH",
              "YOUTUBE",
              "FACEBOOK",
              "KICK",
              "INSTAGRAM",
              "TIKTOK"
            ]
          },
          "url": {
            "type": "string",
            "minLength": 1
          },
          "type": {
            "type": "string",
            "enum": [
              "FREE",
              "PAID"
            ]
          }
        },
        "required": [
          "platform",
          "tournamentId",
          "type",
          "url"
        ]
      },
      "StreamResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "tournamentId": {
            "type": "string"
          },
          "platform": {
            "type": "string",
            "enum": [
              "TWITCH",
              "YOUTUBE",
              "FACEBOOK",
              "KICK",
              "INSTAGRAM",
              "TIKTOK"
            ]
          },
          "url": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "FREE",
              "PAID"
            ]
          }
        }
      },
      "createStreamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/StreamResponse"
          }
        }
      },
      "listStreamsByTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StreamResponse"
            }
          }
        }
      },
      "getStreamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/StreamResponse"
          }
        }
      },
      "UpdateStreamRequest": {
        "properties": {
          "url": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "FREE",
              "PAID"
            ]
          }
        },
        "required": [
          "type"
        ]
      },
      "updateStreamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/StreamResponse"
          }
        }
      },
      "deleteStreamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "TeamResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "leaderUserId": {
            "type": "string"
          }
        }
      },
      "listTeamsApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TeamResponse"
            }
          }
        }
      },
      "CreateTeamRequest": {
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "name"
        ]
      },
      "createTeamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TeamResponse"
          }
        }
      },
      "listTeamsByLeaderApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TeamResponse"
            }
          }
        }
      },
      "getTeamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TeamResponse"
          }
        }
      },
      "UpdateTeamRequest": {
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "name"
        ]
      },
      "updateTeamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TeamResponse"
          }
        }
      },
      "deleteTeamApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "TeamMemberResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "teamId": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          }
        }
      },
      "listTeamMembersApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TeamMemberResponse"
            }
          }
        }
      },
      "AddTeamMemberRequest": {
        "properties": {
          "userId": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "userId"
        ]
      },
      "addTeamMemberApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TeamResponse"
          }
        }
      },
      "removeTeamMemberApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "AssignModeratorRequest": {
        "properties": {
          "tournamentId": {
            "type": "string",
            "minLength": 1
          },
          "userId": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "tournamentId",
          "userId"
        ]
      },
      "TournamentModeratorResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "tournamentId": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          }
        }
      },
      "assignModeratorApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentModeratorResponse"
          }
        }
      },
      "listModeratorsApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TournamentModeratorResponse"
            }
          }
        }
      },
      "removeModeratorApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "TournamentResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "rules": {
            "type": "string"
          },
          "promoterUserId": {
            "type": "string"
          },
          "gameId": {
            "type": "string"
          },
          "placeLimit": {
            "type": "integer",
            "format": "int32"
          },
          "placeRemaining": {
            "type": "integer",
            "format": "int32"
          },
          "placeMinimum": {
            "type": "integer",
            "format": "int32"
          },
          "dateStart": {
            "type": "string"
          },
          "dateEnd": {
            "type": "string"
          },
          "participationPrice": {
            "type": "number",
            "format": "double"
          },
          "visualizationPrice": {
            "type": "number",
            "format": "double"
          },
          "type": {
            "type": "string",
            "enum": [
              "FREE",
              "PAID"
            ]
          },
          "status": {
            "type": "string",
            "enum": [
              "UPCOMING",
              "ONGOING",
              "COMPLETED",
              "CANCELED"
            ]
          },
          "description": {
            "type": "string"
          }
        }
      },
      "listTournamentsApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TournamentResponse"
            }
          }
        }
      },
      "CreateTournamentRequest": {
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "rules": {
            "type": "string"
          },
          "gameId": {
            "type": "string",
            "minLength": 1
          },
          "placeLimit": {
            "type": "integer",
            "format": "int32"
          },
          "placeMinimum": {
            "type": "integer",
            "format": "int32"
          },
          "dateStart": {
            "type": "string",
            "minLength": 1
          },
          "dateEnd": {
            "type": "string",
            "minLength": 1
          },
          "participationPrice": {
            "type": "number",
            "format": "double"
          },
          "visualizationPrice": {
            "type": "number",
            "format": "double"
          },
          "type": {
            "type": "string",
            "enum": [
              "FREE",
              "PAID"
            ]
          },
          "description": {
            "type": "string"
          }
        },
        "required": [
          "dateEnd",
          "dateStart",
          "gameId",
          "name",
          "type"
        ]
      },
      "createTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentResponse"
          }
        }
      },
      "listTournamentsByPromoterApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TournamentResponse"
            }
          }
        }
      },
      "getTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentResponse"
          }
        }
      },
      "UpdateTournamentRequest": {
        "properties": {
          "name": {
            "type": "string"
          },
          "dateStart": {
            "type": "string"
          },
          "dateEnd": {
            "type": "string"
          }
        }
      },
      "updateTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentResponse"
          }
        }
      },
      "cancelTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentResponse"
          }
        }
      },
      "completeTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentResponse"
          }
        }
      },
      "UpdatePlaceLimitsRequest": {
        "properties": {
          "placeLimit": {
            "type": "integer",
            "format": "int32"
          },
          "placeMinimum": {
            "type": "integer",
            "format": "int32"
          }
        }
      },
      "updatePlaceLimitsApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentResponse"
          }
        }
      },
      "UpdateTournamentRulesRequest": {
        "properties": {
          "rules": {
            "type": "string"
          },
          "description": {
            "type": "string"
          }
        }
      },
      "updateTournamentRulesApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentResponse"
          }
        }
      },
      "UpdateTournamentStatusRequest": {
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "UPCOMING",
              "ONGOING",
              "COMPLETED",
              "CANCELED"
            ]
          }
        },
        "required": [
          "status"
        ]
      },
      "updateTournamentStatusApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentResponse"
          }
        }
      },
      "TournamentTeamResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "tournamentId": {
            "type": "string"
          },
          "teamId": {
            "type": "string"
          }
        }
      },
      "listTeamsInTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TournamentTeamResponse"
            }
          }
        }
      },
      "getTeamInTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TournamentTeamResponse"
          }
        }
      },
      "removeTeamFromTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "checkTeamInTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "boolean"
          }
        }
      },
      "AssignRoleRequest": {
        "properties": {
          "userId": {
            "type": "string",
            "minLength": 1
          },
          "role": {
            "type": "string",
            "enum": [
              "VIEWER",
              "PROMOTER",
              "ADMIN",
              "PLAYER",
              "MOD"
            ]
          }
        },
        "required": [
          "role",
          "userId"
        ]
      },
      "UserRoleResponse": {
        "properties": {
          "id": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          },
          "role": {
            "type": "string",
            "enum": [
              "VIEWER",
              "PROMOTER",
              "ADMIN",
              "PLAYER",
              "MOD"
            ]
          }
        }
      },
      "assignRoleApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/UserRoleResponse"
          }
        }
      },
      "getUserRolesApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/UserRoleResponse"
          }
        }
      },
      "removeRoleApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "CreateVisualizationTicketRequest": {
        "properties": {
          "tournamentId": {
            "type": "string",
            "minLength": 1
          },
          "amount": {
            "type": "number",
            "format": "double"
          }
        },
        "required": [
          "tournamentId"
        ]
      },
      "createVisualizationTicketApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "listVisualizationTicketsByTournamentApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TicketResponse"
            }
          }
        }
      },
      "getVisualizationTicketApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "blockVisualizationTicketApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "updateVisualizationTicketStatusApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "updateVisualizationTicketTransactionStatusApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      },
      "validateVisualizationTicketQrApiResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer",
            "format": "int32",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "$ref": "#/components/schemas/TicketResponse"
          }
        }
      }
    },
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  }
}
`;

const repos = [
  {
    name: "Orchestrator",
    repoName: "AP202503_..._Orchestator",
    url: "https://github.com/assessment-pragma-fabian-camilo/AP202503_VideogamesTournamentManagement_Orchestator",
    purpose: "Implementa logica de negocio, reglas y orquestacion de flujos.",
    tags: ["Java", "Reactor", "Clean Architecture", "Core Business"]
  },
  {
    name: "Discovery",
    repoName: "AP202503_..._Discovery",
    url: "https://github.com/assessment-pragma-fabian-camilo/AP202503_VideogamesTournamentManagement_Discovery",
    purpose: "Registro y descubrimiento dinamico de microservicios con Eureka.",
    tags: ["Java", "Eureka", "Service Discovery"]
  },
  {
    name: "API Gateway",
    repoName: "AP202503_..._APIGateway",
    url: "https://github.com/assessment-pragma-fabian-camilo/AP202503_VideogamesTournamentManagement_APIGateway",
    purpose: "Punto de entrada unico; enrutamiento, seguridad y politicas transversales.",
    tags: ["Spring Cloud Gateway", "Security", "Routing"]
  }
];

const technologies = [
  ["Backend", "Java + Reactor", "Programacion reactiva para manejar flujos asincronos y alta concurrencia."],
  ["Arquitectura", "Clean Architecture (Bancolombia)", "Separacion por capas: dominio, casos de uso, infraestructura e interfaces."],
  ["Base de datos", "Supabase (PostgreSQL)", "Persistencia transaccional y politicas RLS para control de acceso a filas."],
  ["Comunicacion", "REST + JSON", "Interaccion entre cliente, gateway y microservicios."],
  ["Gateway", "Spring Cloud Gateway", "Centraliza enrutamiento, seguridad y observabilidad de APIs."],
  ["Discovery", "Eureka Server", "Descubrimiento dinamico de microservicios disponibles."],
  ["Seguridad", "JWT + Spring Security y API Keys", "Autenticacion y autorizacion por rol con tokens emitidos desde Supabase Auth."],
  ["Infra objetivo", "AWS", "Route53, WAF, ALB, EKS, IAM, CloudWatch y Secrets Manager para despliegue productivo."],
];

const securityItems = [
  ["Autenticacion", "Supabase Auth emite JWT y los microservicios validan firma, expiracion y claims."],
  ["Autorizacion", "El token JWT contiene los roles específicos con los que un usuario puede interactuar."],
  ["Seguridad entre componentes", "Se utilizan API Keys con las que los microservicios se autentican entre si y hacia Supabase."],
  ["RLS", "Supabase aplica Row-Level Security para restringir lectura/escritura por usuario y contexto."],
  ["Defensa en profundidad", "Controles en capa API (gateway + orquestador) y capa datos (RLS) para reducir bypass."],
  ["Control de operaciones", "Reglas de estado evitan transiciones invalidas: ejemplo, no completar torneo con matches pendientes."],
  ["Proteccion en nube", "WAF, IAM de minimo privilegio, manejo de secretos con Secrets Manager y auditoria por logs."],
  ["Trazabilidad", "Registro de eventos de negocio y operaciones tecnicas para auditoria y soporte post-produccion."]
];

const installSteps = [
  "Clonar los 3 repositorios (orquestador, discovery y gateway) en una misma carpeta de trabajo.",
  "Configurar variables de entorno por microservicio: credenciales de Supabase y secretos JWT",
  "Iniciar el servicio de discovery (Eureka) y validar que quede saludable en su endpoint de estado.",
  "Levantar el orquestador con perfil local y confirmar conexion a Supabase y registro en discovery.",
  "Levantar el API Gateway y validar que enrute peticiones al orquestador y discovery.",
  "Cargar datos base minimos (roles, comisiones, juegos).",
  "Probar flujo end-to-end: crear torneo, comprar ticket, registrar equipo, crear match y cerrar torneo."
];

const management = [
  {
    title: "Tablero Jira",
    body: "Estructura recomendada: Epic por macroflujo (Torneos, Tickets, Matches, Seguridad), historias por funcionalidad y subtareas tecnicas por capa.",
    details: [
      "Estados: Backlog -> Ready -> In Progress -> Code Review -> QA -> Done",
      "Definition of Done: pruebas, documentacion, evidencia de endpoints y seguridad",
      "Etiquetas: domain, infra, security, api, bugfix"
    ]
  },
  {
    title: "Convenciones de commits",
    body: "Usar convencion tipo Conventional Commits para trazabilidad de cambios y releases.",
    details: [
      "feat(tournaments): validar place_minimum antes de ONGOING",
      "fix(matches): bloquear cancelacion en COMPLETED",
      "docs(api): actualizar contrato OAS3 de tickets"
    ]
  },
  {
    title: "Pull Requests",
    body: "PR pequeno y enfocado, con checklist tecnico y funcional.",
    details: [
      "Plantilla: contexto, alcance, riesgos, pruebas, evidencia",
      "Minimo 1-2 reviewers segun criticidad",
      "Bloqueo de merge sin validacion de pipeline"
    ]
  },
  {
    title: "Evidencia de entregables",
    body: "Consolidar vinculos de Jira, commits y PR por cada historia para demostrar trazabilidad de punta a punta.",
    details: [
      "Historia -> commit(s) -> PR -> release note",
      "Matriz de cumplimiento de reglas de negocio",
      "Resumen de deuda tecnica y acciones futuras"
    ]
  }
];

function renderHeroChips() {
  const container = document.getElementById("heroChips");
  container.innerHTML = heroChips.map((chip) => `<span>${chip}</span>`).join("");
}

function renderFunctional() {
  const cards = document.getElementById("functionalCards");
  cards.innerHTML = functionalHighlights
    .map(
      (item) => `
      <article class="metric">
        <h4>${item.title}</h4>
        <p>${item.body}</p>
      </article>
    `
    )
    .join("");

  const modelContainer = document.getElementById("domainModels");
  modelContainer.innerHTML = domainModels
    .map(
      ([name, desc]) => `
      <article class="model-item searchable" data-keywords="${name} ${desc}">
        <h4>${name}</h4>
        <p>${desc}</p>
      </article>
    `
    )
    .join("");

  const rolesTable = document.getElementById("rolesTable");
  rolesTable.innerHTML = roleMatrix
    .map(
      ([action, roles, restriction]) => `
      <tr class="searchable" data-keywords="${action} ${roles} ${restriction}">
        <td>${action}</td>
        <td>${roles}</td>
        <td>${restriction}</td>
      </tr>
    `
    )
    .join("");
}

function renderEntities() {
  const container = document.getElementById("entitiesAccordion");
  container.innerHTML = entities
    .map(
      (entity, index) => `
      <article class="entity-item searchable ${index === 0 ? "open" : ""}" data-keywords="${entity.name} ${entity.description} ${entity.fields.join(" ")} ${entity.relations.join(" ")} ${entity.rules.join(" ")}">
        <button type="button" class="entity-summary" data-entity-toggle>
          <div>
            <h4>${entity.name}</h4>
            <p>${entity.description}</p>
          </div>
          <span class="entity-meta">${entity.fields.length} campos</span>
        </button>
        <div class="entity-body">
          <div class="entity-grid">
            <section class="entity-block">
              <h5>Campos</h5>
              <ul>${entity.fields.map((field) => `<li>${field}</li>`).join("")}</ul>
            </section>
            <section class="entity-block">
              <h5>Relaciones</h5>
              <ul>${entity.relations.map((relation) => `<li>${relation}</li>`).join("")}</ul>
            </section>
            <section class="entity-block">
              <h5>Reglas de negocio</h5>
              <ul>${entity.rules.map((rule) => `<li>${rule}</li>`).join("")}</ul>
            </section>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  container.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-entity-toggle]");
    if (!trigger) return;
    const item = trigger.closest(".entity-item");
    item.classList.toggle("open");
  });
}

function renderDiagrams() {
  const tabs = document.getElementById("diagramTabs");
  const content = document.getElementById("diagramContent");

  tabs.innerHTML = diagrams
    .map(
      (diagram, index) => `
      <button class="tab-btn ${index === 0 ? "active" : ""}" data-id="${diagram.id}" type="button">${diagram.label}</button>
    `
    )
    .join("");

  function mountDiagram(id) {
    const selected = diagrams.find((d) => d.id === id) || diagrams[0];
    content.innerHTML = `<div class="mermaid">${selected.code}</div>`;
    if (window.mermaid) {
      window.mermaid.run({ querySelector: ".mermaid" });
    }
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest(".tab-btn");
    if (!button) return;
    tabs.querySelectorAll(".tab-btn").forEach((el) => el.classList.remove("active"));
    button.classList.add("active");
    mountDiagram(button.dataset.id);
  });

  mountDiagram(diagrams[0].id);
}

function renderRoutes(method = "ALL") {
  const tbody = document.getElementById("routesTable");
  const filtered = method === "ALL" ? routes : routes.filter((r) => r[0] === method);

  tbody.innerHTML = filtered
    .map(
      ([m, route, desc, roles]) => `
      <tr class="searchable" data-keywords="${m} ${route} ${desc} ${roles}">
        <td><span class="method ${m}">${m}</span></td>
        <td>${route}</td>
        <td>${desc}</td>
        <td>${roles}</td>
      </tr>
    `
    )
    .join("");
}

function renderRepos() {
  const grid = document.getElementById("reposGrid");
  grid.innerHTML = repos
    .map(
      (repo) => `
      <article class="card repo-card searchable" data-keywords="${repo.name} ${repo.purpose} ${repo.tags.join(" ")}">
        <h4>${repo.name}</h4>
        <p>${repo.purpose}</p>
        <p><a href="${repo.url}" target="_blank" rel="noopener noreferrer">${repo.repoName}</a></p>
        <div class="tag-row">${repo.tags.map((t) => `<span>${t}</span>`).join("")}</div>
      </article>
    `
    )
    .join("");
}

function renderTechnologies() {
  const grid = document.getElementById("techGrid");
  grid.innerHTML = technologies
    .map(
      ([category, tech, desc]) => `
      <article class="card searchable" data-keywords="${category} ${tech} ${desc}">
        <p class="section-kicker">${category}</p>
        <h4>${tech}</h4>
        <p>${desc}</p>
      </article>
    `
    )
    .join("");
}

function renderSecurity() {
  const list = document.getElementById("securityList");
  list.innerHTML = securityItems
    .map(
      ([title, desc]) => `
      <article class="timeline-item searchable" data-keywords="${title} ${desc}">
        <h4>${title}</h4>
        <p>${desc}</p>
      </article>
    `
    )
    .join("");
}

function renderInstallSteps() {
  const list = document.getElementById("installSteps");
  list.innerHTML = installSteps
    .map((step) => `<li class="searchable" data-keywords="${step}">${step}</li>`)
    .join("");
}

function renderManagement() {
  const container = document.getElementById("managementCards");
  container.innerHTML = management
    .map(
      (item) => `
      <article class="card searchable" data-keywords="${item.title} ${item.body} ${item.details.join(" ")}">
        <h4>${item.title}</h4>
        <p>${item.body}</p>
        <ul>
          ${item.details.map((d) => `<li>${d}</li>`).join("")}
        </ul>
      </article>
    `
    )
    .join("");
}

function setupInteractions() {
  const routeFilter = document.getElementById("routeFilter");
  if (routeFilter) {
    routeFilter.addEventListener("change", (event) => renderRoutes(event.target.value));
  }

  const preview = document.getElementById("oasPreview");
  if (preview) {
    preview.textContent = oas3;
  }

  const copyBtn = document.getElementById("copyOasBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      try {
        const link = document.createElement("a");
        link.href = "./oas3.json";
        link.download = "oas3.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        copyBtn.textContent = "Descargando OAS3";
        setTimeout(() => {
          copyBtn.textContent = "Descargar OAS3";
        }, 1400);
      } catch {
        copyBtn.textContent = "No se pudo descargar";
        setTimeout(() => {
          copyBtn.textContent = "Descargar OAS3";
        }, 1400);
      }
    });
  }

  const panel = document.getElementById("searchPanel");
  const toggle = document.getElementById("searchToggle");
  const input = document.getElementById("globalSearch");

  if (panel && toggle && input) {
    toggle.addEventListener("click", () => {
      panel.classList.toggle("open");
      const visible = panel.classList.contains("open");
      panel.setAttribute("aria-hidden", String(!visible));
      if (visible) input.focus();
    });

    input.addEventListener("input", () => {
      const term = input.value.trim().toLowerCase();
      const nodes = document.querySelectorAll(".searchable");
      nodes.forEach((node) => {
        const text = ((node.dataset.keywords || "") + " " + node.textContent).toLowerCase();
        const show = !term || text.includes(term);
        node.style.display = show ? "" : "none";
      });
    });
  }

  const today = document.getElementById("today");
  if (today) {
    today.textContent = new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}

function init() {
  if (window.mermaid) {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose"
    });
  }

  setupInteractions();

  renderHeroChips();
  renderFunctional();
  renderEntities();
  renderRoutes();

  try {
    renderDiagrams();
  } catch (error) {
    console.error("No se pudo renderizar Mermaid:", error);
  }

  renderRepos();
  renderTechnologies();
  renderSecurity();
  renderInstallSteps();
  renderManagement();
}

document.addEventListener("DOMContentLoaded", init);
