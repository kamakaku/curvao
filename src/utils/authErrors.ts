type PocketBaseErrorLike = {
  message?: string;
  status?: number;
  data?: {
    data?: Record<string, { code?: string; message?: string }>;
  };
};

export function mapAuthError(error: unknown): string {
  if (!error) return 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.';

  const authError = error as PocketBaseErrorLike;
  const message = authError.message || String(error);
  const data = authError.data?.data || {};

  // Handle specific PocketBase errors
  if (authError.status === 401 || message.includes('Failed to authenticate')) {
    return 'E-Mail oder Passwort ist nicht korrekt.';
  }

  if (message.includes('validation_invalid_email') || data.email) {
    if (data.email?.code === 'validation_is_unique') {
      return 'Diese E-Mail wird bereits verwendet.';
    }
    return 'Bitte gib eine gültige E-Mail ein.';
  }

  if (message.includes('validation_invalid_password') || data.password) {
    if (data.password?.code === 'validation_length') {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    }
  }

  if (data.passwordConfirm?.code === 'validation_must_match') {
    return 'Die Passwörter stimmen nicht überein.';
  }
  
  if (data.username?.code === 'validation_is_unique') {
    return 'Dieser Benutzername ist bereits vergeben.';
  }

  return 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.';
}
