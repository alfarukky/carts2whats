import csrf from 'csrf';
const tokens = new csrf();

// Middleware to generate CSRF token for forms
export const generateCSRF = (req, res, next) => {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = tokens.secretSync();
    // Ensure session is saved before continuing
    return req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return next(err);
      }
      res.locals.csrfToken = tokens.create(req.session.csrfSecret);
      next();
    });
  }
  res.locals.csrfToken = tokens.create(req.session.csrfSecret);
  next();
};

// Middleware to validate CSRF token
export const validateCSRF = (req, res, next) => {
  if (
    req.method === 'POST' ||
    req.method === 'PUT' ||
    req.method === 'DELETE'
  ) {
    const token = req.body?._csrf || req.headers['x-csrf-token'];
    if (!req.session.csrfSecret) {
      console.error('No CSRF secret in session');
      req.flash('error', 'Session expired. Please refresh and try again.');
      return res.redirect(req.get('Referer') || '/api/products');
    }

    if (!token) {
      console.error('No CSRF token provided');
      req.flash(
        'error',
        'Missing security token. Please refresh and try again.',
      );
      return res.redirect(req.get('Referer') || '/api/products');
    }

    if (!tokens.verify(req.session.csrfSecret, token)) {
      console.error('CSRF token verification failed');
      req.flash(
        'error',
        'Invalid security token. Please refresh and try again.',
      );
      return res.redirect(req.get('Referer') || '/api/products');
    }
  }
  next();
};
