const Module = require("node:module");

const originalLoad = Module._load;
let memoryAdjustedPlugin;

Module._load = function loadWithAdjustedTypecheckMemory(
  request,
  parent,
  isMain,
) {
  const loadedModule = originalLoad.call(this, request, parent, isMain);

  if (request !== "fork-ts-checker-webpack-plugin") {
    return loadedModule;
  }

  if (!memoryAdjustedPlugin) {
    const ForkTsCheckerWebpackPlugin = loadedModule;

    memoryAdjustedPlugin = class extends ForkTsCheckerWebpackPlugin {
      constructor(options = {}) {
        const typescriptOptions =
          options.typescript === false
            ? false
            : {
                ...(options.typescript || {}),
                memoryLimit: 3072,
              };

        super({
          ...options,
          typescript: typescriptOptions,
        });
      }
    };
  }

  return memoryAdjustedPlugin;
};

require("react-scripts/scripts/build");
