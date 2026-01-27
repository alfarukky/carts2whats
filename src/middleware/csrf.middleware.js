import csrf from "csrf";

const tokens = new csrf();

export const validateCSRF = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const token = req.body?._csrf || req.headers['x-csrf-token'];
    if (!req.session.csrfSecret || !token || !tokens.verify(req.session.csrfSecret, token)) {
      req.flash('error', 'Invalid security token. Please try again.');
      return res.redirect('back');
    }
  }
  next();
};
