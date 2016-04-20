var values = module.exports = [
  {
    name: "pregunta",
    title: "Pregunta",
    plural: "Preguntas",
    icon: "glyphicon-question-sign"
  },
  {
    name: "propuesta",
    title: "Propuesta",
    plural: "Propuestas",
    icon: "glyphicon-ok-sign"
  },
  {
    name: "comentario",
    title: "Comentario",
    plural: "Comentarios",
    icon: "glyphicon-info-sign"
  },
  {
    name: "queja",
    title: "Queja",
    plural: "Quejas",
    icon: "glyphicon-remove-sign"
  }
]

module.exports.names = values.map(cat => cat.name);