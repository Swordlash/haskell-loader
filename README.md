# haskell-loader

Webpack loader for .cabal projects. Allows you to specify a `.cabal` or `.project` file as an entry in Webpack projects.

Example:
```js
{
  test: /\.(cabal|project)$/,
  use: 
    {
      loader: "@haskell-org/haskell-loader",
      options: {
        "install-ghc": "9.12.1",
        "install-cabal": "3.14.1.1",
        "system-tools": false, // don't use system tools since we're installing local ones
        "executable": "example"
      }
    }
},
```

You can follow an example setup [here](https://github.com/Swordlash/haskell-loader-example/).