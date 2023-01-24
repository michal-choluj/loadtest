export const HttpScenario = {
  scenarios: [
    {
      config: {
        target: 'http://localhost:3333',
        engine: 'http',
        maxVirtualUsers: 1000,
        maxRateLimit: 50,
      },
      flow: [
        {
          type: 'get',
          path: '/stats',
        },
        {
          type: 'get',
          path: '/configuration',
        },
      ],
    },
  ],
};
