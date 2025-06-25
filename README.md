# Companion

**Companion** es una herramienta de asistencia para desarrolladores diseñada para:

- Simplificar y acelerar la configuración de entornos locales.
- Automatizar tareas diarias comunes relacionadas con OpenShift, GitLab y Jira.
- Proporcionar configuraciones predefinidas según el equipo o proyecto.
- Mejorar la productividad del equipo al unificar flujos de trabajo.

Ya sea para incorporar nuevos miembros o para optimizar la rutina de desarrollo,  
**Companion** te acompaña en todo momento para que puedas concentrarte en lo que más importa: ¡codificar!

---

## ✨ Funcionalidades

- 🔧 **Inicialización de Entornos**  
  Configura automáticamente entornos locales con configuraciones preestablecidas según el equipo o proyecto.

- 🧠 **Configuraciones por Equipo**  
  Carga y cambia configuraciones basadas en tu equipo o proyecto, asegurando entornos coherentes y comportamientos personalizados.

- 🚀 **Integración con OpenShift**  
  Interactúa fácilmente con clústeres de OpenShift para operaciones comunes como desplegar aplicaciones, ver logs, gestionar pods y más.

- 🔁 **Utilidades para GitLab**  
  Simplifica operaciones cotidianas de GitLab como gestionar *merge requests*, clonar repositorios, revisar pipelines y asignar revisores.

- 📋 **Integración con Jira**  
  Crea, actualiza y gestiona tickets de Jira directamente desde la terminal. Automatiza transiciones de tickets según la actividad en tu rama.

- 📈 **Integración con Dynatrace**  
  Interfaz directa con Dynatrace para monitorear el rendimiento de tus aplicaciones y facilitar el diagnóstico

- 🛡️ **Integración con Vault**  
  Conexión a Vault para manejar secretos de forma segura y centralizada

- 🗄️ **Utilidades para MongoDB**  
  Acceso rápido a operaciones básicas sobre bases de datos MongoDB

---

## ✅ Checklist funcionalidades de Companion

### 🔧 Inicialización de Entornos
- [x] Generación automática de estructura de carpetas para el proyecto
- [x] Carga de configuraciones según equipo (ej. frontend, backend, devops)

### 🧠 Configuraciones por Equipo/Proyecto
- [x] Carga condicional de configuración basada en clave `"team"`
- [x] Fallback a configuraciones por defecto si no se encuentra personalización
- [x] Comando interactivo `companion setup` para facilitar configuración 
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
- [x] Comando `companion upgrade` para autoactualización de la herramienta
- [x] Comando `companion open` para abrir un repositorio en el editor 

---

## 📦 Instalación

```bash
./install.sh
```

---

## 🤝 Contribuciones

¡Tu colaboración es más que bienvenida!  
Companion es un proyecto abierto que busca crecer con el aporte de la comunidad.  
Si tienes ideas para nuevas funcionalidades, mejoras en la experiencia de uso,  
o simplemente notaste algo que podría hacerse mejor, no dudes en participar.

Puedes contribuir de las siguientes maneras:

- 💡 Sugerir nuevas funcionalidades
- 🐛 Reportar errores
- 🛠️ Enviar mejoras de código o documentación
- ✨ Proponer integraciones adicionales

---

## 🔧 Explicación del Sistema de Configuración

La herramienta *companion* utiliza un sistema de configuración en **capas** que te ofrece flexibilidad sin perder configuraciones predeterminadas útiles. Los valores de configuración se cargan en el siguiente orden de prioridad:

1. **Tu archivo personal `config.json`** – Este archivo tiene la prioridad más alta. Cualquier valor definido aquí **sobrescribirá todos los demás**.
2. **Configuración del equipo** – Si tu `config.json` incluye una clave `"team"` (por ejemplo: `"team": "frontend"`), la herramienta cargará la configuración compartida correspondiente al equipo. Cualquier valor **no definido** en tu configuración personal se tomará del archivo del equipo.
3. **Valores predeterminados del sistema** – Si una opción no está definida ni en tu configuración personal ni en la del equipo, se aplicarán **valores predeterminados sensatos**.

Este sistema asegura un equilibrio entre personalización individual y coherencia dentro del equipo.

### 🛠 Cómo Configurar tu Archivo

Para simplificar el proceso, la herramienta ofrece un comando interactivo:

```bash
companion setup 
```

---

## 🛠️ Herramientas y Documentación

Companion utiliza y extiende funcionalidades de herramientas oficiales y de la comunidad.  
Aquí tienes enlaces útiles para conocer más sobre ellas:

### ☁️ OpenShift

- 🌐 **API REST de OpenShift (Kubernetes Core)**  
  Permite interacción directa con el clúster (pods, deployments, namespaces, etc.).  
  [📚 Referencia API](https://docs.redhat.com/en/documentation/openshift_container_platform/4.18#API%20Reference)

---

### 🧪 GitLab

- 🌐 **API REST de GitLab**  
  Acceso completo a proyectos, repos, issues, pipelines, etc.  
  [📚 Referencia API](https://docs.gitlab.com/api/rest/)

---

### 📋 Jira

- 🔗 **Jira CLI (no oficial)**  
  Cliente de terminal para trabajar con tickets, filtros y estados de Jira.  
  [📖 Proyecto en GitHub](https://github.com/ankitpokhrel/jira-cli)

- 🌐 **API REST de Jira (Cloud)**  
  Permite crear, actualizar y buscar tickets, usuarios, sprints, etc.  
  [📚 Referencia API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)

---

### 🛡️ Vault (HashiCorp)

- 🌐 **API REST de Vault**  
  Permite leer, escribir y gestionar secretos de forma programática.  
  [📚 Referencia API](https://developer.hashicorp.com/vault/api-docs)

---

## 📬 Comentarios y Soporte

¿Tienes una sugerencia o encontraste un problema?

1. 📂 Visita la pestaña [Issues](https://github.com/tomi2108/companion/issues)
2. 📝 Abre un nuevo *issue* explicando claramente el contexto y cómo reproducirlo si es un error
3. ✅ Etiquétalo como `bug`, `feature request`, o `question` según corresponda

También puedes darle seguimiento a problemas ya reportados y votar por aquellos que consideres prioritarios.

Tu opinión es clave para que Companion siga mejorando y adaptándose a las necesidades reales de los desarrolladores.

¡Gracias por ser parte del proyecto! 🙌

