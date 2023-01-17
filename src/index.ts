import { chain } from 'lodash';
import { TestSchema } from './schema';
import { Pool } from './threads/threads.pool';

async function bootstrap() {
  const stats = [];
  const poll = new Pool({
    size: 2,
  });

  poll.on('metrics', (data, id) => {
    for (const item of data) {
      update({ ...item, id });
    }
  });

  const update = (data) => {
    const idx: number = stats.findIndex(
      (e) => e.id === data.id && e.name === data.name,
    );
    if (idx > -1) {
      stats[idx] = data;
    } else {
      stats.push(data);
    }
  };
  setInterval(() => {
    const out = [];
    if (stats.length) {
      for (const { name } of stats) {
        out.push({
          name,
          meter: meter(name),
          histogram: histogram(name),
        });
      }
    }
    console.log(out);
  }, 1000);

  const meter = (name) => {
    return {
      count: sum(name, 'stats.meter', 'count'),
      mean: sum(name, 'stats.meter', 'mean'),
      currentRate: sum(name, 'stats.meter', 'currentRate'),
      '1MinuteRate': sum(name, 'stats.meter', '1MinuteRate'),
      '5MinuteRate': sum(name, 'stats.meter', '5MinuteRate'),
      '15MinuteRate': sum(name, 'stats.meter', '15MinuteRate'),
    };
  };

  const histogram = (name) => {
    return {
      min: avg(name, 'stats.histogram', 'min'),
      max: avg(name, 'stats.histogram', 'max'),
      sum: avg(name, 'stats.histogram', 'sum'),
      variance: avg(name, 'stats.histogram', 'variance'),
      mean: avg(name, 'stats.histogram', 'mean'),
      stddev: avg(name, 'stats.histogram', 'stddev'),
      count: sum(name, 'stats.histogram', 'count'),
      median: avg(name, 'stats.histogram', 'median'),
      p75: avg(name, 'stats.histogram', 'p75'),
      p95: avg(name, 'stats.histogram', 'p95'),
      p99: avg(name, 'stats.histogram', 'p99'),
      p999: avg(name, 'stats.histogram', 'p999'),
    };
  };

  const avg = (name, path, key): number => {
    return chain(stats)
      .filter((s) => s.name === name)
      .flatMap(path)
      .meanBy((o) => +o[key])
      .value();
  };

  const sum = (name, path, key): number => {
    return chain(stats)
      .filter((s) => s.name === name)
      .flatMap(path)
      .sumBy((o) => +o[key])
      .value();
  };

  const res = await poll.exec(TestSchema.scenarios[0]);
  console.log(res);
}
bootstrap();
