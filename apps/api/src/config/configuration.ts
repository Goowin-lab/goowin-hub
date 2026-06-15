const toBoolean = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const toNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) {
    return defaultValue;
  }

  return Number(value);
};

export const configuration = () => ({
  app: {
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
    env: process.env.NODE_ENV ?? 'development',
    globalPrefix: process.env.API_GLOBAL_PREFIX ?? 'api',
    port: toNumber(process.env.PORT, 3000),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  swagger: {
    enabled: toBoolean(process.env.SWAGGER_ENABLED, true),
    path: process.env.SWAGGER_PATH ?? 'docs',
  },
});
