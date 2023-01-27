#!/usr/bin/env node
import { Command } from 'commander';
const program = new Command();
program.name('pulse-cli').command('run', 'Run scenario');
program.parse(process.argv);

