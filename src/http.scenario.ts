export const HttpScenario = {
  scenarios: [
    {
      config: {
        target: 'http://localhost:3333',
        engine: 'http',
        maxVirtualUsers: 100,
        maxRateLimit: 10,
      },
      flow: [
        {
          type: 'get',
          path: '/stats',
        },
        {
          type: 'post',
          path: '/configuration',
          payload: {
            servers: 1,
            workers: 1,
            packageName: 'name',
            config: {},
            stats: {},
            description: {
              plugin: 'faker',
              function: 'lorem.paragraph',
            },
          },
          capture: [
            {
              json: '$.id',
              as: 'configurationId',
            },
          ],
        },
        {
          type: 'get',
          path: '/configuration/${configurationId}',
          validate: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
            required: ['id'],
          },
        },
      ],
    },
  ],
};
