## How to Debug

- Run `npm watch`
- Open a sandbox editor with no extensions.
  - Press `F5` or Command Pallete `Debug: Start Debugging`
- Make changes and press `Reload` for changes to take effect


## How to Publish

### VS Marketplace

- Run `npm prepublish`
- Publish `npm publish`
- Or bump version and publish with 
  - `vsce publish patch`
  - `vsce publish minor`
  - `vsce publish major`

### VSX Marketplace

- Run `vsce package` to build the package
- Publish `ovsx publish` 
