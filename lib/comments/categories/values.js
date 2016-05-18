var values = module.exports = [
  {
    name: 'pregunta',
    title: 'Pregunta',
    plural: 'Preguntas',
    color: '#0273ba'
  },
  {
    name: 'propuesta',
    title: 'Propuesta',
    plural: 'Propuestas',
    color: '#0aad4b'
  },
  {
    name: 'observacion',
    title: 'Observación',
    plural: 'Observaciones',
    color: '#d96527'
  }
];

module.exports.names = values.map(cat => cat.name);
