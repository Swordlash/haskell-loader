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

  var buildOption = '';
  if (extname(this.resourcePath) == '.project') {
    buildOption = `--project-file=${this.resourcePath}`;
  }
  else {
    buildOption = `--project-dir=${projectFolder}`;
  }

  // add dependency to the whole folder
  // this.addDependency(projectFolder);

  if (options['system-tools']) {
    await execa('cabal', ['build', 'all', `--builddir=${currentFolder}`, buildOption ], { 
      cwd: projectFolder,
      stdio: 'inherit'
    });

    const res = await execa('cabal', ['-v0', `--builddir=${currentFolder}`, buildOption, 'exec', '--', 'which', options['executable'] ]);
    return readFileSync(res.stdio);
  }
  else {
    const { install, run } = require('@haskell-org/ghc-installer');

    if(options['install-ghc']) {
      await install('ghc', options['install-ghc']);
    }

    if(options['install-cabal']) {
      await install('cabal', options['install-cabal']);
    }

    await run('cabal', ['build', 'all', `--builddir=${currentFolder}`, buildOption ]);

    const res = await run('cabal', ['-v0', `--builddir=${currentFolder}`, buildOption, 'exec', '--', 'which', options['executable'] ]);
    return readFileSync(res.stdio);
  }
}