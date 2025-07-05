import { Logo } from "./core/atoms/logo/logo";

export default () => {
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <title>RxOps UIKit Library</title>
      </head>
      <body>
        <div class="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div class="text-center">
            <Logo size="lg" class="mb-4 mx-auto" />
            <h1 class="text-2xl font-bold text-gray-900 mb-2">RxOps UIKit</h1>
            <p class="text-gray-600">Healthcare UI Component Library</p>
            <p class="text-sm text-gray-500 mt-4">
              This is the development server for the UIKit library.<br/>
              See the showcase repository for component demos.
            </p>
          </div>
        </div>
      </body>
    </>
  );
};
