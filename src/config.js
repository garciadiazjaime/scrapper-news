const convict = require('convict');

// Define a schema
const config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  ipaddress: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'NODE_IP',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3060,
    env: 'NODE_PORT',
  },
  dataFolder: {
    doc: 'Files',
    format: String,
    default: `${process.env.PWD}/data`,
    env: 'OPENSHIFT_DATA_DIR',
  },
  api: {
    url: {
      doc: 'API URL',
      format: String,
      default: 'http://127.0.0.1:3030/',
      env: 'API_URL',
    },
  },
});

// Perform validation
config.validate({ allowed: 'strict' });

module.exports = config;
