export const PLAN_DETAILS = {
  trial: {
    name: 'Período de Testes',
    price: 'Grátis',
    unlocked: ['/dashboard', '/settings'] // Locked out of everything else if trial is expired
  },
  basico: {
    name: 'Plano Básico',
    price: 'R$ 49/mês',
    unlocked: [
      '/dashboard',
      '/settings',
      '/', // Clientes is the home route '/'
      '/orçamentos',
      '/tasks'
    ]
  },
  pro: {
    name: 'Plano Pro',
    price: 'R$ 99/mês',
    unlocked: [
      '/dashboard',
      '/settings',
      '/',
      '/orçamentos',
      '/tasks',
      '/pipelines',
      '/agenda',
      '/finance',
      '/services',
      '/briefings',
      '/equipe',
      '/log'
    ]
  },
  next: {
    name: 'Plano NEXT',
    price: 'R$ 199/mês',
    unlocked: ['*'] // Unlocks everything
  }
};

/**
 * Checks if a specific client route is locked for a given user.
 * @param {string} path - The target location pathname (e.g. '/finance')
 * @param {object} user - Active user profile object from context
 * @returns {boolean} - True if access is blocked, False if allowed
 */
export function isRouteLocked(path, user) {
  if (!user) return false;

  const plan = user.plan || 'trial';

  // Plano NEXT is fully unlocked
  if (plan === 'next') return false;

  // 1. Check if user is in trial and the trial has expired
  if (plan === 'trial') {
    // If no explicit trial end timestamp, assume 7 days from user creation date
    const trialEndsAt = user.trial_ends_at 
      ? new Date(user.trial_ends_at.replace(' ', 'T')) // support both SQLite space and ISO formats
      : new Date(new Date(user.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const now = new Date();
    if (now > trialEndsAt) {
      // Trial is indeed expired. In this state, only Dashboard and Settings are allowed
      const normalized = path.split('?')[0].split('#')[0];
      const isAllowed = normalized === '/dashboard' || normalized === '/settings';
      return !isAllowed; // locked out if not one of these
    }

    // Active trial: completely unlocked
    return false;
  }

  // 2. Handling tiered subscriptions (basico, pro)
  const details = PLAN_DETAILS[plan];
  if (!details) return true; // Safety block for invalid/undefined plan states

  const normalized = path.split('?')[0].split('#')[0];

  const isAllowed = details.unlocked.some(allowedPath => {
    // Handle home path '/' exactly to prevent prefix matching everything
    if (allowedPath === '/') {
      return normalized === '/';
    }
    // Check if the current route starts with the allowed path prefix (handles /tasks/board, etc.)
    return normalized.startsWith(allowedPath);
  });

  return !isAllowed;
}

export default { PLAN_DETAILS, isRouteLocked };
