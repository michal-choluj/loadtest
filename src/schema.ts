export const TestSchema = {
  config: {
    target: 'http://voting-lb-0.dev.tectonicinteractive.com/voting',
    maxUsers: 100,
    servers: 1,
  },
  scenarios: [
    {
      config: {
        target: 'https://voting-lb-0.dev.tectonicinteractive.com/voting/1137',
        engine: 'socket.io',
        namespace: '/',
        transports: ['websocket'],
        path: '/voting/io',
        maxUsers: 100,
        connectionRate: 1000,
        maxVirtualUsers: 100,
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
          delay: 5000,
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
        },
      ],
    },
  ],
};
