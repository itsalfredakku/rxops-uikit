import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import * as path from 'path';

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {}, peerDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  peerDependencies: PkgDep;
  [key: string]: unknown;
};

// Check for duplicate dependencies before proceeding
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

const makeRegex = (dep) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj) => Object.keys(obj).map(makeRegex);

/**
 * Vite Configuration - Enhanced for stability
 * 
 * Fixes for CRITICAL-002: CSS Hot Reload Loop fix
 * - Added CSS optimizations to prevent hot reload loops
 * 
 * Fixes for CRITICAL-003: Dev Server Bus Error Crashes
 * - Added memory optimizations
 * - Added specific watch patterns
 * - Optimized dependency handling
 * - Added error handling
 */
export default defineConfig(({ mode }) => {
  // Dev mode memory optimizations to prevent bus errors on macOS
  const isDevMode = mode === 'development';
  
  return {
    build: {
      target: "es2020",
      lib: {
        entry: "./src/index.ts",
        formats: ["es", "cjs"],
        fileName: (format, entryName) =>
          `${entryName}.qwik.${format === "es" ? "mjs" : "cjs"}`,
      },
      rollupOptions: {
        output: {
          preserveModules: true,
          preserveModulesRoot: "src",
        },
        // externalize deps that shouldn't be bundled into the library
        external: [
          /^node:.*/,
          ...excludeAll(dependencies),
          ...excludeAll(peerDependencies),
        ],
      },
    },
    plugins: [qwikVite(), tsconfigPaths(), tailwindcss()],
    
    // Enhanced CSS optimization to prevent hot reload loops - CRITICAL-002 fix
    css: {
      devSourcemap: isDevMode,
      preprocessorOptions: {
        css: {
          charset: false
        }
      }
    },
    
    // Memory optimization settings to prevent crashes
    server: {
      // Add headers for better development experience
      headers: {
        "Cache-Control": "public, max-age=0",
      },
      
      fs: {
        // Limit the directories that are watched to reduce memory usage
        allow: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'lib'), path.resolve(__dirname, 'demo')],
        // Don't watch node_modules to prevent excessive memory usage
        strict: true,
      },
      watch: {
        // Use polling instead of native file system events on macOS to prevent crashes
        usePolling: process.platform === 'darwin',
        // Reduce polling frequency to lower CPU usage
        interval: 1000,
        binaryInterval: 3000,
        // Reduce file system overhead by ignoring certain patterns
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.git/**',
          '**/lib/**',
          '**/lib-types/**',
          '**/*.log',
          '**/coverage/**'
        ],
      },
      hmr: {
        // Graceful error handling for HMR to prevent crashes
        overlay: true,
        // Custom error handling for HMR
        protocol: 'ws',
        host: 'localhost',
        // Increase timeout to handle slow connections better
        timeout: 5000,
      },
      // Add memory optimizations
      middlewareMode: false,
    },
    
    // Optimization settings to prevent crashes
    optimizeDeps: {
      // Put problematic deps that break bundling here
      exclude: [],
      force: true, // Force dependency pre-bundling to avoid conflicts
      esbuildOptions: {
        target: 'node16', // Better compatibility for macOS
        platform: 'node'
      }
    },
  };
});

// *** utils ***
/**
 * Function to identify duplicate dependencies and throw an error
 * @param {Object} devDependencies - List of development dependencies
 * @param {Object} dependencies - List of production dependencies
 */
function errorOnDuplicatesPkgDeps(
  devDependencies: Record<string, string>,
  dependencies: Record<string, string>,
) {
  let msg = "";
  // Create an array 'duplicateDeps' by filtering devDependencies.
  // If a dependency also exists in dependencies, it is considered a duplicate.
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep],
  );
  
  // include any known qwik packages
  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value),
  );
  
  // any errors for missing "qwik-city-plan"
  // [PLUGIN_ERROR]: Invalid module "@qwik-city-plan" is not a valid package
  msg = `Move qwik packages ${qwikPkg.join(", ")} to devDependencies`;
  if (qwikPkg.length > 0) {
    throw new Error(msg);
  }
  
  // Format the error message with the duplicates list.
  // The `join` function is used to represent the elements of the 'duplicateDeps' array as a comma-separated string.
  msg = `
    Warning: The dependency "${duplicateDeps.join(", ")}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `;
  
  // Throw an error with the constructed message.
  if (duplicateDeps.length > 0) {
    throw new Error(msg);
  }
}
