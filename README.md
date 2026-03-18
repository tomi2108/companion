# 🏮🧭  Maro

**Maro** es el guía de los desarrolladores que deben transitar por los círculos concéntricos de la infraestructura moderna.

En la obra de Dante, Publio Virgilio **Maro** es el sabio que posee el mapa de los abismos, aquel que ya ha recorrido las profundidades y conoce los pasajes ocultos para salir indemne. Él representa la maestría técnica frente al castigo del caos administrativo.

No se trata solo de automatizar; se trata de tener un compañero que comprenda las jerarquías invisibles que separan un entorno local de un clúster de producción.

En los sistemas antiguos, siempre existió una figura encargada de interpretar: rituales, señales y reglas que los demás no podían descifrar. **Maro** ocupa ese mismo rol ante tu arquitectura.

Observa configuraciones.
Reconoce patrones.
Ejecuta rituales repetibles.
Y, cuando es necesario, **intercede entre tú y los círculos que exigen fe**.

Esta herramienta hace eso con:
**OpenShift, GitLab, Jira, Vault… y tu entorno local.**

**Maro** no reemplaza tus herramientas. Las entiende, las conecta y evita que tu flujo de trabajo se convierta en una condena eterna de tareas manuales.

---

## 🚀 Instalación

Para instalar las dependencias necesarias, ejecuta:

```sh
./install.sh
```

---

## ✨ ¿Por qué invocar a Maro?

* **Cruzar el Aqueronte:** Simplificar el paso entre tu máquina local y el clúster remoto.
* **Evitar el castigo de Sísifo:** Automatizar tareas repetitivas que no generan valor.
* **El mapa del abismo:** Centralizar configuraciones según equipo o proyecto.
* **Voz única de mando:** Unificar flujos de trabajo bajo una misma guía.
* **Memoria de los antiguos:** Preservar el “conocimiento tribal” para que no se pierda en el olvido.

**Maro** está pensado tanto para:

* Guiar a los nuevos miembros por los círculos del proyecto sin que se pierdan.
* Asistir a desarrolladores experimentados que ya han descendido demasiadas veces al foso de los logs.

---

## ✨ Los Círculos de Maro

### 🔧 Primer Círculo: El Entorno

Configura automáticamente entornos locales usando configuraciones predefinidas según el equipo o proyecto.

### 🧠 El Limbo de las Configuraciones

Carga y cambia configuraciones basadas en tu equipo, manteniendo coherencia sin sacrificar personalización.

### 🚀 El Abismo de OpenShift

Interactúa con clústeres para tareas comunes como desploys, logs, pods, secretos y debugging.

### 🔁 El Purgatorio de GitLab

Automatiza flujos diarios: repositorios, ramas, merge requests, pipelines y revisores.

### 📋 Los Juicios de Jira

Gestiona tickets directamente desde la terminal y reduce el cambio de contexto.

### 🛡️ El Tesoro de Vault

Accede y gestiona secretos de forma segura y centralizada, protegidos bajo llave.

---

## 🧰 Instrumentos del Círculo del Creador de Plugins

Las profundidades de Maro abren sus dominios a quienes deseen expandir el mapa con nuevos rituales. A disposición de los exploradores y arquitectos de nuevos “Círculos”, Maro ofrece un arsenal de instrumentos:

- **Sistema de Plugins y Comandos:** Registra, crea y publica nuevas habilidades usando `Plugin`, `PluginRegistry`, `PluginExport` y `Command`.
- **Flujos y Steps Encadenados:** Estructura lógicas complejas utilizando `Workflow`, `WorkflowStep`, `WorkflowRuntime`.
- **Guardianes del Conocimiento:** Manipula y valida configuraciones con `Config`, `ConfigRegistry`, `ValidateConfig`, `ConfigHelp` y `ConfigView`.
- **Domadores de Archivos:** Lee, escribe y transforma archivos de todo tipo (`File`, `JsonFile`, `YamlFile`, `TextFile`, `ObjectFile`, `FileFormatter`).
- **Señales y Rituales Visuales:** Construye prompts, spinners y progresos interactivos con `Input`, `Spinner`, `MultiProgressController`, `SingleProgressController`.
- **Comando sobre el Caos:** Automatiza procesos, invoca comandos y orquesta servicios (`CommandRunner`, `ServiceProcess`).
- **Voz sobre Proyectos y Repositorios:** Interactúa con repos, despliegues y estructuras de aplicaciones (`AppRepo`, `Repo`, `Project`, `Deployment`).
- **Oráculos y Efemérides:** Reacciona a eventos del flujo usando `Action`, `ActionRegistry`, `CommitEvent`, entre otros.
- **Atajos y Portales del Entorno:** Abre archivos en tu editor o browser, añade decoradores y utilidades (`openInEditor`, `openInBrowser`, `loading`).

Cada herramienta es un fragmento del saber de Maro, lista para ser encadenada en nuevos rituales y extensiones.

---

## 🧭 Filosofía del proyecto

**Maro** es un **guía interno**, creado para equipos que entienden que la infraestructura puede ser un infierno si no se tiene el mapa correcto.

Sus principios son:

* 📐 **La senda marcada:** Es mejor un camino compartido que mil opciones que llevan al extravío.
* 🧠 **El saber codificado:** Las decisiones del equipo viven en el código de Maro, no en la memoria frágil de los hombres.
* 🛠️ **Dominar lo mundano:** Maro ejecuta lo que el equipo ya decidió para que tú puedas dedicarte a la creación.

Aunque **Maro** es **opinionada por diseño**, la sabiduría siempre permanece abierta. La herramienta está construida para ser fácilmente extensible: nuevas integraciones, nuevas plataformas, nuevos círculos.

---

## 🔧 Sistema de Configuración (en capas)

**Maro** utiliza una jerarquía de autoridad para resolver conflictos de configuración:

1. **La Voluntad del Individuo (`config.json`)**
2. **El Legado del Equipo** (`"team"`)
3. **El Orden Predeterminado**

Un buen guía no te hace repetir lo que ya sabe; **Maro** lo recuerda por ti.

### 🛠️ Configuración asistida

```bash
maro setup

```

---

## 🧩 Sistema de Plugins y Extensiones

Cuando los caminos trazados no bastan, Maro abre portales a nuevos círculos a través de su sistema de plugins. Estos rituales codificados —creados tanto por los antiguos como por los osados viajeros de hoy— permiten a cada equipo expandir los dominios del guía según sus propias necesidades y desafíos.

Cualquiera puede forjar un plugin: una integración inédita, un flujo jamás recorrido, una herramienta perdida en el tiempo. Cada plugin es un fragmento de sabiduría compartida, un atajo secreto en el inframundo de la infraestructura.

- Los **plugins oficiales**, validados por los guardianes del mapa, se encuentran en: [https://github.com/Maro-Ecosystem](https://github.com/Maro-Ecosystem).
- La comunidad es bienvenida a enriquecer el legado: crea, comparte y documenta tu propio plugin para sumar un círculo nuevo a la guía de Maro.

No te conformes con las rutas existentes. Dirige el curso de tu propio descenso, deja tu marca en el abismo y ayuda a iluminar el sendero para quienes vendrán. A través de los plugins, tu conocimiento puede trascender los siglos y ser la luz de futuras expediciones.

---

## 🤝 Alianzas y Legado

**Maro** evoluciona con la experiencia acumulada en el descenso diario de cada desarrollador. El mapa del abismo se completa entre todos.

Puedes fortalecer la guía aportando:

* 💡 **Nuevas visiones:** ideas para expandir los dominios de la herramienta.
* 🐛 **Grietas en el camino:** reportes de bugs o comportamientos inesperados.
* ✨ **Nuevos Círculos:** integraciones con herramientas aún no exploradas.

---

## 📬 Encuentra el camino

Si en algún momento el rastro se pierde, o si sientes que Maro no está iluminando el pasaje correcto:

1. **Abre un Issue:** Deja una marca en el camino para que otros la vean.
2. **Aporta Contexto:** Describe en qué "círculo" te encuentras y qué intentabas invocar.
3. **Etiqueta con Precisión:** Ayuda a que la sabiduría llegue rápido a donde se necesita.

El conocimiento se comparte para que nadie quede atrapado.
La fricción se disipa bajo la luz de la razón.

---

🏮🧭 **Maro** *El guía que conoce los pasajes ocultos.*
