export const TestSchema = {
  scenarios: [
    {
      config: {
        target: 'https://voting-lb-1.dev.tectonicinteractive.com/voting/1',
        engine: 'socket.io',
        namespace: '/',
        transports: ['websocket'],
        path: '/voting/io',
        connectionsPerSecond: 1,
        maxVirtualUsers: 10,
      },
      flow: [
        {
          type: 'emit',
          channel: 'hello',
          payload: {
            source: 'web',
          },
        },
        {
          type: 'sleep',
          delay: 1000,
        },
        {
          type: 'emit',
          channel: 'register',
          payload: {
            type: 'phone',
            phone: {
              function: 'phone.number',
              params: '+447##0000###',
            },
            birthDate: '1960-01-05',
            tc: true,
          },
          acknowledge: {
            capture: [
              {
                json: '$.debugPin',
                as: 'debugPin',
              },
            ],
            error: [
              {
                reject: true,
                json: '$.error',
                as: 'error',
              },
            ],
          },
        },
        {
          type: 'sleep',
          delay: 1000,
        },
        {
          type: 'emit',
          channel: 'login',
          payload: {
            type: 'phone',
            wallet: 'voting',
            phone: '$.register.payload.phone',
            pin: '$.register.acknowledge.debugPin',
            birthDate: '1999-05-05',
          },
          acknowledge: {
            capture: [
              {
                json: '$.accessToken',
                as: 'accessToken',
              },
            ],
          },
        },
        {
          type: 'sleep',
          delay: 1000,
        },
        {
          type: 'emit',
          channel: 'vote',
          loop: 10,
          delay: 100,
          payload: {
            contestantId: 1,
          },
        },
        {
          type: 'disconnect',
        },
      ],
    },
  ],
};
