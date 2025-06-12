const express = require('express');
const path = require('path');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { generatePdfFromHtml } = require('../utils/pdfGenerator');
const Presupuesto = require('../models/Presupuesto');

module.exports = (upload) => {
  // Importamos las funciones del controlador
  const {
    obtenerPresupuestos,
    obtenerPresupuestoPorId,
    crearPresupuesto,
    actualizarPresupuesto,
    eliminarPresupuesto,
    getResumenPresupuestos
  } = require('../controllers/presupuestoController');

  // 1) Nueva ruta: GET /api/presupuestos/summary
  //    Protegida o no, según necesites. Por ejemplo, si solo quieres mostrarla a admins, 
  //    agrega authMiddleware y requireAdmin. Si todos pueden verla, déjala pública.
  router.get('/summary', authMiddleware, getResumenPresupuestos);

  // GET /api/presupuestos        ⇒ Listar todos (sin adjunto)
  router.get('/', authMiddleware, obtenerPresupuestos);

  // GET /api/presupuestos/:id    ⇒ Obtener uno (incluyendo info de archivo)
  router.get(
    '/:id',
    [ param('id', 'ID inválido').isMongoId() ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      next();
    },
    obtenerPresupuestoPorId, authMiddleware
  );

  // POST /api/presupuestos       ⇒ Crear nuevo (admite archivo único en “archivo”)
  router.post(
    '/',
    authMiddleware,
    upload.single('archivo'),
    [
      body('titulo')
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 100 })
        .withMessage('El título debe tener entre 2 y 100 caracteres.'),
      body('cliente')
        .notEmpty()
        .withMessage('El cliente es obligatorio.')
        .isLength({ min: 3, max: 100 })
        .withMessage('El cliente debe tener entre 3 y 100 caracteres.'),
      body('descripcion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar 500 caracteres.'),
      body('importe')
        .notEmpty()
        .withMessage('El importe es obligatorio.')
        .isFloat({ min: 0 })
        .withMessage('El importe debe ser un número mayor o igual a 0.'),
      body('estado')
        .notEmpty()
        .withMessage('El estado es obligatorio.')
        .isIn(['pendiente', 'aprobado', 'rechazado'])
        .withMessage('Estado inválido.'),
      // Para archivo, no usamos express-validator, sino Multer + validación en el controlador (o puedes chequear req.file.mimetype aquí)
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si Multer detectó un error de tipo/tamaño de archivo, lo agregamos manualmente
        const multerError = req.fileValidationError;
        const arrayErrors = errors.array();
        if (multerError) {
          arrayErrors.push({ msg: multerError });
        }
        return res.status(400).json({ errors: arrayErrors });
      }
      next();
    },
    crearPresupuesto
  );

  // POST /api/presupuestos/:id/email
router.post(
  '/:id/email',
  authMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const { to } = req.body;            // dirección destino
    if (!to) return res.status(400).json({ mensaje: 'Email destino requerido' });
    try {
      const presupuesto = await Presupuesto.findById(id);
      if (!presupuesto) return res.status(404).json({ mensaje: 'No existe' });

      // 1) Montar el cuerpo del email en HTML
      const html = `
        <h1>Presupuesto #${presupuesto.identifier}</h1>
        <p><strong>Cliente:</strong> ${presupuesto.cliente}</p>
        <p><strong>Descripción:</strong> ${presupuesto.descripcion || '—'}</p>
        <p><strong>Importe:</strong> € ${presupuesto.importe.toLocaleString('es-ES', {
          minimumFractionDigits:2, maximumFractionDigits:2
        })}</p>
        <p><strong>Estado:</strong> ${presupuesto.estado}</p>
      `;

      // 2) (Opcional) adjuntar archivo si existe
      const attachments = [];
      if (presupuesto.archivo?.url) {
        attachments.push({
          filename: presupuesto.archivo.originalName,
          path: path.join(__dirname, '..', 'uploads', presupuesto.archivo.filename)
        });
      }

      // 3) Enviar
      await require('../utils/mailer').sendMail({
        to,
        subject: `Presupuesto #${presupuesto.identifier}`,
        html,
        attachments
      });

      res.json({ mensaje: 'Email enviado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: 'Error al enviar email' });
    }
  }
);

router.get(
  '/:id/pdf',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const presupuesto = await Presupuesto.findById(id);
      if (!presupuesto) return res.status(404).send('No encontrado');

      // 1) Monta tu HTML — aquí un ejemplo mínimo
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { font-size: 24px; }
              p { margin: 5px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Presupuesto #${presupuesto.identifier}</h1>
            <p><span class="label">Cliente:</span> ${presupuesto.cliente}</p>
            <p><span class="label">Descripción:</span> ${presupuesto.descripcion || '—'}</p>
            <p><span class="label">Importe:</span> € ${presupuesto.importe.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</p>
            <p><span class="label">Estado:</span> ${presupuesto.estado}</p>
            <p><span class="label">Fecha:</span> ${new Date(presupuesto.fechaCreacion).toLocaleDateString('es-ES')}</p>
          </body>
        </html>
      `;

      // 2) Genera el PDF
      const pdfBuffer = await generatePdfFromHtml(html);

      // 3) Envía el PDF como descarga
      res
        .status(200)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="presupuesto_${presupuesto.identifier}.pdf"`,
          'Content-Length': pdfBuffer.length
        })
        .send(pdfBuffer);

    } catch (err) {
      console.error(err);
      res.status(500).send('Error generando PDF');
    }
  }
);


  // PUT /api/presupuestos/:id    ⇒ Actualizar (admite reemplazar/añadir archivo)
   router.put(
    '/:id',
    authMiddleware,
    upload.single('archivo'),
    [
      param('id', 'ID inválido').isMongoId(),
      body('titulo')
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 100 })
        .withMessage('El título debe tener entre 2 y 100 caracteres.'),
      body('cliente')
        .notEmpty()
        .withMessage('El cliente es obligatorio.')
        .isLength({ min: 3, max: 100 })
        .withMessage('El cliente debe tener entre 3 y 100 caracteres.'),
      body('descripcion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar 500 caracteres.'),
      body('importe')
        .notEmpty()
        .withMessage('El importe es obligatorio.')
        .isFloat({ min: 0 })
        .withMessage('El importe debe ser un número mayor o igual a 0.'),
      body('estado')
        .notEmpty()
        .withMessage('El estado es obligatorio.')
        .isIn(['pendiente', 'aprobado', 'rechazado'])
        .withMessage('Estado inválido.'),
      body('removeFile')
        .optional()
        .isBoolean()
        .withMessage('removeFile debe ser booleano.')
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const multerError = req.fileValidationError;
        const arrayErrors = errors.array();
        if (multerError) {
          arrayErrors.push({ msg: multerError });
        }
        return res.status(400).json({ errors: arrayErrors });
      }
      next();
    },
    actualizarPresupuesto
  );

  // DELETE /api/presupuestos/:id ⇒ Eliminar
 router.delete(
    '/:id',
    authMiddleware,
    [ param('id', 'ID inválido').isMongoId() ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      next();
    },
    eliminarPresupuesto
  );

  return router;
};
