type Environment = Record<string, string | undefined>;

const allowedEnvironments = new Set([
  'development',
  'test',
  'staging',
  'production',
]);

const requireValue = (
  config: Environment,
  key: string,
  errors: string[],
): void => {
  if (!config[key] || config[key]?.trim() === '') {
    errors.push(`${key} is required`);
  }
};

const validateNumber = (
  config: Environment,
  key: string,
  errors: string[],
): void => {
  if (config[key] === undefined) {
    return;
  }

  const value = Number(config[key]);
  if (!Number.isInteger(value) || value <= 0) {
    errors.push(`${key} must be a positive integer`);
  }
};

export const validateEnvironment = (config: Environment): Environment => {
  const errors: string[] = [];

  requireValue(config, 'DATABASE_URL', errors);
  requireValue(config, 'JWT_SECRET', errors);
  validateNumber(config, 'PORT', errors);

  const nodeEnv = config.NODE_ENV ?? 'development';
  if (!allowedEnvironments.has(nodeEnv)) {
    errors.push(
      `NODE_ENV must be one of: ${Array.from(allowedEnvironments).join(', ')}`,
    );
  }

  if (
    config.API_GLOBAL_PREFIX !== undefined &&
    config.API_GLOBAL_PREFIX.trim() === ''
  ) {
    errors.push('API_GLOBAL_PREFIX cannot be empty');
  }

  if (config.SWAGGER_PATH !== undefined && config.SWAGGER_PATH.trim() === '') {
    errors.push('SWAGGER_PATH cannot be empty');
  }

  if (
    config.JWT_EXPIRES_IN !== undefined &&
    config.JWT_EXPIRES_IN.trim() === ''
  ) {
    errors.push('JWT_EXPIRES_IN cannot be empty');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.join('; ')}`);
  }

  return config;
};
