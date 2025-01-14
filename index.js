const { validate } = require('schema-utils');
const { resolve, dirname, extname } = require('path');
const { execa } = require('execa');
const { readFileSync } = require('fs');

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['executable'],
  properties: {
    "install-ghc": {
      type: 'string'
    },
    "install-cabal": {
      type: 'string'
    },
    "executable": {
      type: 'string'
    },
    "system-tools": {
      type: 'boolean'
    },
  }
}

module.exports = async function (_source) {
  const options = this.getOptions();
  validate(schema, options, {
    name: 'Haskell loader',
    baseDataPath: 'options'
  });

  const currentFolder = resolve(__dirname);
  const projectFolder = dirname(this.resourcePath);

  var buildOpt = '';
  if (extname(this.resourcePath) === '.project') {
    buildOpt = `--project-file=${this.resourcePath}`;
  }
  else {
    buildOpt = `--project-dir=${projectFolder}`;
  }

  // add dependency to the whole folder
  // this.addDependency(projectFolder);

  if (options['system-tools']) {
    await execa('cabal', ['build', 'all', `--builddir=${currentFolder}`, buildOpt ], { stdio: 'inherit' });

    const {stdout} = await execa('cabal', ['-v0', `--builddir=${currentFolder}`, buildOpt, 'exec', '--', 'which', options['executable'] ]);

    console.log("Output haskell file: " + stdout);
    return readFileSync(stdout);
  }
  else {
    const { install, run } = require('@haskell-org/ghc-installer');

    if(options['install-ghc']) {
      await install('ghc', options['install-ghc']);
    }

    if(options['install-cabal']) {
      await install('cabal', options['install-cabal']);
    }

    await run('cabal', ['build', 'all', `--builddir=${currentFolder}`, `--project-dir=${projectFolder}` ]);

    const {stdout} = await run('cabal', ['-v0', `--builddir=${currentFolder}`, `--project-dir=${projectFolder}`, 'exec', '--', 'which', options['executable'] ]);

    console.log("Output haskell file: " + stdout);
    return readFileSync(stdout);
  }
}