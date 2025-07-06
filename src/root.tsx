import { Logo } from "./core/atoms/logo/logo";

export default () => {
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <title>RxOps UIKit Library</title>
      </head>
      <body>
        <div class="min-h-screen bg-neutral-lighter flex items-center justify-center">
          <div class="text-center">
            <Logo size="lg" class="mb-4 mx-auto" />
            <h1 class="text-2xl font-bold text-neutral-darker mb-2">RxOps UIKit</h1>
            <p class="text-neutral-normal">Healthcare UI UIKit</p>
            <p class="text-sm text-neutral-normal mt-4">
              This is the development server for the UIKit library.<br/>
              See the showcase repository for component demos.
            </p>
          </div>
        </div>
      </body>
    </>
  );
};
