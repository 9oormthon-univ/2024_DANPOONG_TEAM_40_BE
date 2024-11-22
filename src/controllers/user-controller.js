exports.mainPage = (req, res) => {
    res.render('index', { user: req.isAuthenticated() ? req.user : null });
  };