# 🔮✝️ Clair

**Clair** es una herramienta CLI de asistencia para desarrolladores y equipos técnicos.

El nombre *Clair* proviene del latín clarus, que significa claro, luminoso, evidente.
El nombre Clair proviene del latín clarus, que significa claro, luminoso, evidente. 
No se trata solo de ver lo evidente, sino de percibir aquello que permite ver: la luz, la claridad, lo comprensible.

De ahí palabras como *clairvoyance*: la capacidad de percibir más allá de la superficie.

En muchas tradiciones espirituales y religiosas, siempre existió una figura encargada de interpretar:
rituales, textos, señales, reglas invisibles.
Alguien que conectaba lo humano con sistemas más grandes que él mismo.

**Clair** ocupa ese mismo rol, pero en el mundo técnico.

Observa configuraciones.
Reconoce patrones.
Ejecuta rituales repetibles.
Y, cuando es necesario, **intercede entre tú y sistemas que exigen fe**.

Este Clair hace eso con:
OpenShift, GitLab, Jira, Vault… y tu entorno local.

Clair no reemplaza tus herramientas.
Las entiende, las conecta y traduce su complejidad en acciones simples, previsibles y confiables.

---

## ✨ ¿Para qué sirve Clair?

* Simplificar y acelerar la configuración de entornos locales.
* Automatizar tareas repetitivas relacionadas con OpenShift, GitLab y Jira.
* Centralizar configuraciones según equipo o proyecto.
* Unificar flujos de trabajo sin perder flexibilidad.
* Reducir el “conocimiento tribal” necesario para operar un proyecto.

Clair está pensado tanto para:

* incorporar nuevos miembros sin fricción
* como para desarrolladores experimentados que ya han visto demasiado

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
* [x] Comando interactivo `clair setup`
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
* [x] `clair upgrade` para autoactualización
* [x] `clair open` para abrir repositorios en el editor

---

## 🧭 Filosofía del proyecto

Clair es una **herramienta interna**, creada para equipos reales, con flujos reales y limitaciones reales.

No intenta ser universal.
Busca ser **útil**, **predecible** y **opinionada** cuando es necesario.

Sus principios son simples:

* 📐 **Convenciones claras**
  Es mejor un camino compartido que infinitas opciones ambiguas.

* 🧠 **Conocimiento codificado**
  Las decisiones del equipo viven en el código, no solo en la memoria.

* 🔁 **Menos fricción, menos contexto**
  Si una tarea es repetitiva, Clair debería encargarse.

* 🛠️ **Automatizar lo aburrido, no lo importante**
  Clair ejecuta lo que el equipo ya decidió.

Aunque Clair es **opinionada por diseño**, una mente verdaderamente clara permanece abierta.

Por eso, la herramienta está construida para ser **fácilmente extensible**:

* Integraciones alternativas a GitLab, como **GitHub**.
* Herramientas que reemplacen o complementen a **Jira**.
* Nuevas plataformas y flujos que el equipo adopte con el tiempo.

Clair no asume permanencia.
Asume cambio, y se adapta a él.

---

## 📦 Instalación

```bash
./install.sh
```

---

## 🔧 Sistema de Configuración (en capas)

Clair utiliza un sistema de configuración jerárquico que equilibra
flexibilidad individual con coherencia colectiva.

Prioridad:

1. **Configuración personal (`config.json`)**
2. **Configuración del equipo** (`"team"`)
3. **Valores predeterminados**

Un buen intérprete no repite conocimiento innecesariamente.

### 🛠 Configuración asistida

```bash
clair setup
```

---

## 🛠️ Herramientas y APIs utilizadas

Clair se apoya en APIs oficiales:

### ☁️ OpenShift

[https://docs.redhat.com/en/documentation/openshift_container_platform](https://docs.redhat.com/en/documentation/openshift_container_platform)

### 🧪 GitLab

[https://docs.gitlab.com/api/rest/](https://docs.gitlab.com/api/rest/)

### 📋 Jira

[https://developer.atlassian.com/cloud/jira/platform/rest/v3/](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

### 🛡️ Vault

[https://developer.hashicorp.com/vault/api-docs](https://developer.hashicorp.com/vault/api-docs)

---

## 🤝 Contribuciones

Clair evoluciona con la experiencia del equipo.

Puedes contribuir:

* 💡 nuevas ideas
* 🐛 bugs
* 🛠️ mejoras de código o docs
* ✨ nuevas integraciones

---

## 📬 Feedback y soporte

Si algo no funciona, o si Clair podría ver con más claridad:

1. Abre un issue
2. Aporta contexto
3. Etiquétalo correctamente

El conocimiento se comparte.
La fricción se disipa.

---

🧘 **Clair**
*Viendo con claridad entre sistemas que exigen fe.*
