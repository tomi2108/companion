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

- 🚀 **Integración con OpenShift**  
  Interactúa fácilmente con clústeres de OpenShift para operaciones comunes como desplegar aplicaciones, ver logs, gestionar pods y más.

- 🔁 **Utilidades para GitLab**  
  Simplifica operaciones cotidianas de GitLab como gestionar *merge requests*, clonar repositorios, revisar pipelines y asignar revisores.

- 📋 **Integración con Jira**  
  Crea, actualiza y gestiona tickets de Jira directamente desde la terminal. Automatiza transiciones de tickets según la actividad en tu rama.

- 🧠 **Configuraciones por Equipo**  
  Carga y cambia configuraciones basadas en tu equipo o proyecto, asegurando entornos coherentes y comportamientos personalizados.

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
companion setup config
```

---

## 🛠️ Herramientas y Documentación

Companion utiliza y extiende funcionalidades de herramientas oficiales y de la comunidad.  
Aquí tienes enlaces útiles para conocer más sobre ellas:

- 🔗 **OpenShift CLI (`oc`)**  
  Herramienta oficial para gestionar clústeres de OpenShift desde la terminal.  
  [📖 Documentación oficial](https://docs.openshift.com/container-platform/latest/cli_reference/openshift_cli/)

- 🔗 **GitLab CLI (`glab`)**  
  Cliente de línea de comandos para interactuar con GitLab: MR, issues, pipelines y más.  
  [📖 Documentación oficial](https://docs.gitlab.com/17.5/editor_extensions/gitlab_cli/)

- 🔗 **Jira CLI (`jira-cli`)**  
  Cliente de línea de comandos no oficial pero muy completo para trabajar con Jira desde la terminal.  
  [📖 Proyecto en GitHub](https://github.com/ankitpokhrel/jira-cli?tab=readme-ov-file)

---

## 📬 Comentarios y Soporte

¿Tienes una sugerencia o encontraste un problema?

1. 📂 Visita la pestaña [Issues](https://github.com/tomi2108/companion/issues)
2. 📝 Abre un nuevo *issue* explicando claramente el contexto y cómo reproducirlo si es un error
3. ✅ Etiquétalo como `bug`, `feature request`, o `question` según corresponda

También puedes darle seguimiento a problemas ya reportados y votar por aquellos que consideres prioritarios.

Tu opinión es clave para que Companion siga mejorando y adaptándose a las necesidades reales de los desarrolladores.

¡Gracias por ser parte del proyecto! 🙌

