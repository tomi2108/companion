# 🧘‍♂️ Rishi

**Rishi** es una herramienta CLI de asistencia para desarrolladores y equipos técnicos.

En la tradición védica, un *rishi* es un sabio que observa, entiende patrones complejos
y transmite conocimiento práctico para mantener el orden del mundo.

Este **Rishi** hace algo parecido, pero con:
OpenShift, GitLab, Jira, Vault… y tu entorno local.

Rishi no reemplaza tus herramientas.
Las entiende, las conecta y te ahorra repetir los mismos rituales todos los días.

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

## ✅ Checklist funcionalidaderishi 

### 🔧 Inicialización de Entornos
- [x] Generación automática de estructura de carpetas para el proyecto
- [x] Carga de configuraciones según equipo (ej. frontend, backend, devops)

### 🧠 Configuraciones por Equipo/Proyecto
- [x] Carga condicional de configuración basada en clave `"team"`
- [x] Fallback a configuraciones por defecto si no se encuentra personalización
- [x] Comando interactivo `rishi setup` para facilitar configuración 
- [x] Validación automática de esquemas de configuración.

### 🚀 Integración con OpenShift
- [x] Login automático al clúster mediante configuración guardada
- [x] Despliegue de aplicaciones 
- [x] Visualización de logs en tiempo real de pods específicos
- [ ] Ejecución de comandos dentro de contenedores activos (`oc rsh`)
- [x] Eliminación, reinicio y monitoreo de pods y deployments
- [ ] Forwarding de puertos para servicios específicos
- [x] Gestión de secretos y configuración de variables de entorno
- [x] Generación de rutas públicas para testing rápido
- [x] Creación de archivos `.env` con la configuración de ambientes desplegados

### 🔁 Utilidades para GitLab
- [x] Clonación inteligente de repositorios del grupo del proyecto
- [x] Creación y asignación automática de *merge requests*
- [x] Revisión del estado de pipelines asociados a una MR o branch
- [x] Asignación de revisores automáticamente según reglas del equipo
- [ ] Integración con ramas de Jira para nombrar ramas con prefijos de ticket
- [x] Sincronización de ramas locales con `origin` automáticamente
- [x] Nivelación de ramas

### 📋 Integración con Jira
- [x] Creación de tickets 
- [ ] Cambio automático de estado de ticket al crear una nueva rama
- [x] Actualización del ticket con comentarios 
- [ ] Enlace automático entre tickets y commits o MRs
- [ ] Búsqueda de tickets abiertos asignados al usuario actual (🚧 en progreso)
- [ ] Filtro de tickets por sprint, tipo o estado desde la CLI (🚧 en progreso)
- [ ] Transiciones de estado automatizadas según evento (ej. push a `main`)
- [x] Comando para estimar tickets 

### 🛡️ Integración con Vault  
- [x] Lectura y escritura de secretos por entorno/proyecto
- [x] Reinicio de deployments afectados por un secret luego de su actualizacion

### 🗄️ Utilidades para MongoDB  
- [ ] Conexión simplificada a instancias MongoDB.
- [ ] Exploración rápida de colecciones y conteo de documentos  
- [ ] Ejecución de consultas predefinidas o scripts desde archivos `.js`  
- [ ] Exportación e importación de datos.
- [ ] Generación de backups. 

### 🛠 Otras Utilidades
- [ ] Generación de documentación interna 
- [ ] Notificaciones locales o vía Slack en eventos clave
- [x] Comando `rishi upgrade` para autoactualización de la herramienta
- [x] Comando `rishi open` para abrir un repositorio en el editor 

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

* Integraciones alternativas
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
  [📚 Referencia API](https://docs.redhat.com/en/documentation/openshift_container_platform)

### 🧪 GitLab

* API REST de GitLab
  [📚 Referencia API](https://docs.gitlab.com/api/rest/)

### 📋 Jira

* API REST de Jira Cloud
  [📚 Referencia API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

### 🛡️ Vault

* API REST de HashiCorp Vault
 [📚 Referencia API](https://developer.hashicorp.com/vault/api-docs)

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
