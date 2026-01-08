# 🏛️ Dux

**Dux** es el guía de los desarrolladores que deben transitar por los círculos concéntricos de la infraestructura moderna.

En la obra de Dante, Virgilio es el **Dux** (*"Tu duca, tu signore e tu maestro"*): el sabio que posee el mapa de los abismos, aquel que ya ha recorrido las profundidades y conoce los pasajes ocultos para salir indemne. Representa la maestría técnica frente al castigo del caos administrativo.

No se trata solo de automatizar; se trata de tener un guía que comprenda las jerarquías invisibles que separan un entorno local de un clúster de producción.

En los sistemas antiguos, siempre existió una figura encargada de interpretar:
rituales, señales y reglas que los demás no podían descifrar.

**Dux** ocupa ese mismo rol ante tu arquitectura.

Observa configuraciones.
Reconoce patrones.
Ejecuta rituales repetibles.
Y, cuando es necesario, **intercede entre tú y los círculos que exigen fe**.

Este Dux hace eso con:
OpenShift, GitLab, Jira, Vault… y tu entorno local.

Dux no reemplaza tus herramientas. Las entiende, las conecta y evita que tu flujo de trabajo se convierta en una condena eterna de tareas manuales.

---

## ✨ ¿Por qué invocar a Dux?

* **Cruzar el Aqueronte:** Simplificar el paso entre tu máquina local y el clúster remoto.
* **Evitar el castigo de Sísifo:** Automatizar tareas repetitivas que no generan valor.
* **El mapa del abismo:** Centralizar configuraciones según equipo o proyecto.
* **Voz única de mando:** Unificar flujos de trabajo bajo una misma guía.
* **Memoria de los antiguos:** Preservar el “conocimiento tribal” para que no se pierda en el olvido.

Dux está pensado tanto para:

* Guiar a los nuevos miembros por los círculos del proyecto sin que se pierdan.
* Asistir a desarrolladores experimentados que ya han descendido demasiadas veces al foso de los logs.

---

## ✨ Los Círculos de Dux

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

## ✅ Checklist de funcionalidades

### 🔧 Inicialización de Entornos

* [x] Generación automática de estructura de carpetas
* [x] Carga de configuraciones según equipo (frontend, backend, devops)

### 🧠 Configuración por Equipo/Proyecto

* [x] Comando interactivo `dux setup`
* [x] Validación automática de esquemas

### 🚀 OpenShift

* [x] Login automático al clúster
* [x] Logs en tiempo real y gestión de pods
* [x] Generación de rutas y archivos `.env`

### 🔁 GitLab

* [x] Clonación inteligente de repositorios
* [x] Creación automática de merge requests
* [x] Sincronización y nivelación de ramas

### 🛡️ Vault

* [x] Lectura y escritura de secretos
* [x] Reinicio de deployments afectados

---

## 🧭 Filosofía del proyecto

Dux es un **guía interno**, creado para equipos que entienden que la infraestructura puede ser un infierno si no se tiene el mapa correcto.

Sus principios son:

* 📐 **La senda marcada**
Es mejor un camino compartido que mil opciones que llevan al extravío.
* 🧠 **El saber codificado**
Las decisiones del equipo viven en el código de Dux, no en la memoria frágil de los hombres.
* 🛠️ **Dominar lo mundano**
Dux ejecuta lo que el equipo ya decidió para que tú puedas dedicarte a la creación.

Aunque Dux es **opinionada por diseño**, la sabiduría siempre permanece abierta. La herramienta está construida para ser fácilmente extensible: nuevas integraciones, nuevas plataformas, nuevos círculos.

Dux no asume permanencia. Asume evolución, y te guía a través de ella.

---

## 🔧 Sistema de Configuración (en capas)

Dux utiliza una jerarquía de autoridad para resolver conflictos de configuración:

1. **La Voluntad del Individuo (`config.json`)**
2. **El Legado del Equipo** (`"team"`)
3. **El Orden Predeterminado**

Un buen guía no te hace repetir lo que ya sabe; Dux lo recuerda por ti.

### 🛠 Configuración asistida

```bash
dux setup

```

---

## 🛠️ Herramientas y APIs utilizadas

Dux se apoya en APIs oficiales:

### ☁️ OpenShift

[https://docs.redhat.com/en/documentation/openshift_container_platform](https://docs.redhat.com/en/documentation/openshift_container_platform)

### 🧪 GitLab

[https://docs.gitlab.com/api/rest/](https://docs.gitlab.com/api/rest/)

### 📋 Jira

[https://developer.atlassian.com/cloud/jira/platform/rest/v3/](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

### 🛡️ Vault

[https://developer.hashicorp.com/vault/api-docs](https://developer.hashicorp.com/vault/api-docs)

---

## 🤝 Alianzas y Legado

Dux evoluciona con la experiencia acumulada en el descenso diario de cada desarrollador. El mapa del abismo se completa entre todos.

Puedes fortalecer la guía aportando:

* 💡 **Nuevas visiones:** ideas para expandir los dominios de la herramienta.
* 🐛 **Grietas en el camino:** reportes de bugs o comportamientos inesperados.
* 🛠️ **Refuerzos:** mejoras de código o refinamiento de la documentación.
* ✨ **Nuevos Círculos:** integraciones con herramientas que aún no han sido exploradas.

---

## 📬 Encuentra el camino

Si en algún momento el rastro se pierde, o si sientes que Dux no está iluminando el pasaje correcto:

1. **Abre un Issue:** Deja una marca en el camino para que otros la vean.
2. **Aporta Contexto:** Describe en qué "círculo" te encuentras y qué intentabas invocar.
3. **Etiqueta con Precisión:** Ayuda a que la sabiduría llegue rápido a donde se necesita.

El conocimiento se comparte para que nadie quede atrapado.
La fricción se disipa bajo la luz de la razón.

---

🏛️ **Dux** *Guía de los que transitan entre sistemas que exigen fe.*
