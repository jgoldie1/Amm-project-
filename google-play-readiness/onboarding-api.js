'use strict';

const express = require('express');
const { deriveAgeBand } = require('./age-policy');

function createOnboardingRouter({ db, requireAuth }) {
  const router = express.Router();
  router.use(requireAuth);

  router.post('/age-band', async (req, res) => {
    try {
      const { dateOfBirth } = req.body || {};
      if (!dateOfBirth) return res.status(400).json({ error: 'DATE_OF_BIRTH_REQUIRED' });
      const ageBand = deriveAgeBand(dateOfBirth);
      await db.updateUserAgeProfile({
        userId: req.user.id,
        dateOfBirth,
        ageBand,
        ageVerifiedAt: new Date().toISOString()
      });

      const redirect = ageBand === 'CHILD' ? '/family' : ageBand === 'TEEN' ? '/teen' : '/home';
      return res.json({ ageBand, redirect });
    } catch (error) {
      return res.status(400).json({ error: 'INVALID_DATE_OF_BIRTH' });
    }
  });

  return router;
}

module.exports = { createOnboardingRouter };
