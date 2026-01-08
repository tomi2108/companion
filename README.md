# 🧙‍♂️✝️  Clerc

**Clerc** es una herramienta CLI de asistencia para desarrolladores y equipos técnicos.

En la tradición europea medieval, un *clerc* no era solo alguien que sabía leer y escribir.
Era un **intérprete del mundo**, un mediador entre lo cotidiano y lo sagrado, entre sistemas incomprensibles y conocimiento aplicable.

El clerc estudiaba textos, observaba patrones, seguía rituales… y, cuando era necesario,
**invocaba lo invisible** para que el orden se mantuviera.

Este **Clerc** hace algo parecido, pero con:
OpenShift, GitLab, Jira, Vault… y tu entorno local.

Clerc no reemplaza tus herramientas.
Las entiende, las conecta y actúa como intermediario entre tú y sistemas que a veces parecen divinos,
traduciendo su complejidad en rituales simples y repetibles.

---

## ✨ ¿Para qué sirve Rishi?

* Simplificar y acelerar la configuración de entornos locales.
* Automatizar tareas repetitivas relacionadas con OpenShift, GitLab y Jira.
* Centralizar configuraciones según equipo o proyecto.
* Unificar flujos de trabajo sin perder flexibilidad.
* Reducir el “conocimiento tribal” necesario para operar un proyecto.

Rishi está pensado tanto para:

* incorporar nuevos miembros sin fricción
* como para desarrolladores experimentados que ya saben *demasiado*.

---

## ✨ Funcionalidades

### 🔧 Inicialización de Entornos

Configura automáticamente entornos locales usando configuraciones predefinidas según el equipo o proyecto.

### 🧠 Configuraciones por Equipo

Carga y cambia configuraciones basadas en tu equipo, manteniendo coherencia sin sacrificar personalización.

### 🚀 Integración con OpenShift

Interactúa con clústeres de OpenShift para tareas comunes como deploys, logs, pods, secretos y debugging.

### 🔁 Utilidades para GitLab

Automatiza flujos diarios de GitLab: repositorios, ramas, merge requests, pipelines y revisores.

### 📋 Integración con Jira

Gestiona tickets directamente desde la terminal y reduce el cambio de contexto.

### 📈 Integración con Dynatrace

Consulta métricas y estado de aplicaciones para diagnosticar problemas sin salir del flujo.

### 🛡️ Integración con Vault

Accede y gestiona secretos de forma segura y centralizada.

### 🗄️ Utilidades para MongoDB

Acceso rápido a operaciones comunes sobre bases de datos MongoDB.

---

## ✅ Checklist de funcionalidades

### 🔧 Inicialización de Entornos

* [x] Generación automática de estructura de carpetas
* [x] Carga de configuraciones según equipo (frontend, backend, devops)

### 🧠 Configuración por Equipo/Proyecto

* [x] Carga condicional basada en `"team"`
* [x] Fallback a configuraciones por defecto
* [x] Comando interactivo `rishi setup`
* [x] Validación automática de esquemas

### 🚀 OpenShift

* [x] Login automático al clúster
* [x] Deploy de aplicaciones
* [x] Logs en tiempo real
* [ ] Ejecución de comandos en contenedores (`oc rsh`)
* [x] Gestión de pods y deployments
* [ ] Port forwarding
* [x] Gestión de secretos y variables de entorno
* [x] Generación de rutas públicas
* [x] Creación de archivos `.env`

### 🔁 GitLab

* [x] Clonación inteligente de repositorios
* [x] Creación automática de merge requests
* [x] Estado de pipelines
* [x] Asignación automática de revisores
* [ ] Integración con ramas de Jira
* [x] Sincronización con `origin`
* [x] Nivelación de ramas

### 📋 Jira

* [x] Creación de tickets
* [x] Comentarios en tickets
* [x] Estimación de tickets
* [ ] Transiciones automáticas por eventos
* [ ] Búsqueda avanzada desde CLI (🚧)

### 🛡️ Vault

* [x] Lectura y escritura de secretos
* [x] Reinicio de deployments afectados

### 🗄️ MongoDB

* [ ] Conexión simplificada
* [ ] Exploración de colecciones
* [ ] Ejecución de scripts
* [ ] Exportación / importación
* [ ] Backups

### 🛠 Otras Utilidades

* [ ] Generación de documentación
* [ ] Notificaciones (Slack / local)
* [x] `rishi upgrade` para autoactualización
* [x] `rishi open` para abrir repositorios en el editor

---

## 🧭 Filosofía del proyecto

Rishi es una **herramienta interna**, diseñada para servir a equipos reales, con flujos reales y restricciones reales.

No busca ser genérica ni cubrir todos los casos posibles. Busca ser **útil**, **predecible** y **opinionada** cuando hace falta.

La filosofía de Rishi se basa en algunos principios simples:

* 📐 **Convenciones claras sobre configuraciones implícitas**
  Es mejor una convención explícita y compartida que infinitas opciones mal documentadas.

* 🧠 **Conocimiento codificado**
  Decisiones, rituales y buenas prácticas del equipo viven en el código, no solo en la memoria de unas pocas personas.

* 🔁 **Menos fricción, menos contexto**
  Si una tarea es repetitiva, Rishi debería encargarse de ella.

* 🛠️ **Automatizar lo aburrido, no lo importante**
  Rishi no decide por el equipo: ejecuta lo que el equipo ya decidió.

Como todo buen rishi, la herramienta observa, aprende y transmite.

Aunque Rishi es **opinionada por diseño**, un buen rishi mantiene siempre una mente abierta.

Por eso, la herramienta está construida para ser **fácilmente extensible** y adaptable a cambios en el ecosistema:

* Integraciones alternativas a GitLab, como **GitHub** u otros proveedores.
* Herramientas que reemplacen o complementen a **Jira**.
* Nuevas plataformas, servicios o flujos que el equipo adopte con el tiempo.

Rishi no asume que las herramientas actuales serán eternas.
Asume que el cambio es parte del camino, y se prepara para acompañarlo.

---

## 📦 Instalación

```bash
./install.sh
```

---

## 🔧 Sistema de Configuración (en capas)

Rishi utiliza un sistema de configuración jerárquico que equilibra
flexibilidad individual con coherencia de equipo.

El orden de prioridad es:

1. **Configuración personal (`config.json`)**
   Tiene prioridad absoluta.

2. **Configuración del equipo**
   Definida por la clave `"team"` en tu configuración personal.

3. **Valores predeterminados del sistema**
   Opciones sensatas cuando nada más está definido.

Este enfoque evita duplicación, reduce errores y mantiene consistencia.
Un buen rishi no repite conocimiento innecesariamente.

### 🛠 Configuración asistida

```bash
rishi setup
```

---

## 🛠️ Herramientas y APIs utilizadas

Rishi se apoya en APIs oficiales y bien documentadas:

### ☁️ OpenShift

* API REST de Kubernetes / OpenShift
  📚 [https://docs.redhat.com/en/documentation/openshift_container_platform](https://docs.redhat.com/en/documentation/openshift_container_platform)

### 🧪 GitLab

* API REST de GitLab
  📚 [https://docs.gitlab.com/api/rest/](https://docs.gitlab.com/api/rest/)

### 📋 Jira

* API REST de Jira Cloud
  📚 [https://developer.atlassian.com/cloud/jira/platform/rest/v3/](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

### 🛡️ Vault

* API REST de HashiCorp Vault
  📚 [https://developer.hashicorp.com/vault/api-docs](https://developer.hashicorp.com/vault/api-docs)

---

## 🤝 Contribuciones

Rishi es un proyecto abierto y evoluciona con la experiencia del equipo.

Puedes contribuir:

* 💡 proponiendo nuevas funcionalidades
* 🐛 reportando bugs
* 🛠️ enviando mejoras de código o documentación
* ✨ sugiriendo nuevas integraciones

---

## 📬 Feedback y soporte

Si algo no funciona, o si Rishi podría ser más sabio:

1. Ve a la sección **Issues**
2. Abre un issue con contexto claro
3. Etiquétalo como `bug`, `feature` o `question`

El conocimiento se comparte.
La fricción se elimina.

---

🧘 **Rishi**
*Automatizando rituales técnicos desde tiempos inmemoriales.*
