import { component$ } from "@builder.io/qwik";
import { LinkNew } from "./link-text-based";
import { Text } from "../text/text";

/**
 * Demo showcasing the Link component built on top of Text component.
 * Demonstrates all inherited typography capabilities plus link-specific features.
 */
export default component$(() => {
  return (
    <div class="space-y-8 p-6">
      <Text as="h1" weight="bold" size="xl" color="gray-900" class="mb-8">
        Link Component Demo (Built on Text)
      </Text>

      {/* Typography Inheritance */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          Typography Inheritance from Text Component
        </Text>
        
        <div class="space-y-2">
          <LinkNew href="/title" textStyle="title" color="primary">
            Title Link (textStyle="title")
          </LinkNew>
          
          <LinkNew href="/subtitle" textStyle="subtitle" color="secondary">
            Subtitle Link (textStyle="subtitle")
          </LinkNew>
          
          <LinkNew href="/body" textStyle="body" color="success">
            Body Link (textStyle="body")
          </LinkNew>
          
          <LinkNew href="/caption" textStyle="caption" color="warning">
            Caption Link (textStyle="caption")
          </LinkNew>
          
          <LinkNew href="/overline" textStyle="overline" color="error">
            Overline Link (textStyle="overline")
          </LinkNew>
        </div>
      </section>

      {/* Weight and Style Variations */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          Weight and Style Variations
        </Text>
        
        <div class="space-y-2">
          <LinkNew href="/light" weight="light" color="primary">
            Light Weight Link
          </LinkNew>
          
          <LinkNew href="/normal" weight="normal" color="primary">
            Normal Weight Link
          </LinkNew>
          
          <LinkNew href="/medium" weight="medium" color="primary">
            Medium Weight Link
          </LinkNew>
          
          <LinkNew href="/semibold" weight="semibold" color="primary">
            Semibold Weight Link
          </LinkNew>
          
          <LinkNew href="/bold" weight="bold" color="primary">
            Bold Weight Link
          </LinkNew>
          
          <LinkNew href="/italic" italic color="primary">
            Italic Link
          </LinkNew>
        </div>
      </section>

      {/* Size Variations */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          Size Variations
        </Text>
        
        <div class="flex gap-4 items-baseline">
          <LinkNew href="/xs" size="xs" color="primary">XS Link</LinkNew>
          <LinkNew href="/sm" size="sm" color="primary">SM Link</LinkNew>
          <LinkNew href="/md" size="md" color="primary">MD Link</LinkNew>
          <LinkNew href="/lg" size="lg" color="primary">LG Link</LinkNew>
          <LinkNew href="/xl" size="xl" color="primary">XL Link</LinkNew>
        </div>
      </section>

      {/* Color Variations */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          Color Variations
        </Text>
        
        <div class="space-y-2">
          <LinkNew href="/primary" color="primary">Primary Color Link</LinkNew>
          <LinkNew href="/secondary" color="secondary">Secondary Color Link</LinkNew>
          <LinkNew href="/success" color="success">Success Color Link</LinkNew>
          <LinkNew href="/warning" color="warning">Warning Color Link</LinkNew>
          <LinkNew href="/error" color="error">Error Color Link</LinkNew>
          <LinkNew href="/info" color="info">Info Color Link</LinkNew>
          <LinkNew href="/custom" color="/* USE DESIGN TOKENS INSTEAD */">Custom Color Link</LinkNew>
        </div>
      </section>

      {/* Link Variants */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          Link Variants
        </Text>
        
        <div class="space-y-2">
          <LinkNew href="/default" variant="default" color="primary">
            Default Link (hover underline)
          </LinkNew>
          
          <LinkNew href="/underlined" variant="underlined" color="primary">
            Underlined Link (always underlined)
          </LinkNew>
          
          <LinkNew href="/hover-underline" variant="hover-underline" color="primary">
            Hover Underline Link
          </LinkNew>
          
          <LinkNew href="/button" variant="button" color="primary">
            Button Style Link
          </LinkNew>
          
          <LinkNew href="/unstyled" variant="unstyled" color="primary">
            Unstyled Link
          </LinkNew>
        </div>
      </section>

      {/* External Links */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          External Links
        </Text>
        
        <div class="space-y-2">
          <LinkNew href="https://example.com" target="_blank" color="primary">
            Auto-detected External Link
          </LinkNew>
          
          <LinkNew href="https://github.com" external target="_blank" color="secondary">
            Explicitly External Link
          </LinkNew>
          
          <LinkNew href="mailto:test@example.com" color="info">
            Email Link
          </LinkNew>
        </div>
      </section>

      {/* State Variations */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          State Variations
        </Text>
        
        <div class="space-y-2">
          <LinkNew href="/disabled" disabled color="secondary">
            Disabled Link
          </LinkNew>
          
          <LinkNew href="/loading" loading color="primary">
            Loading Link
          </LinkNew>
        </div>
      </section>

      {/* Text Alignment and Transform */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          Text Alignment and Transform
        </Text>
        
        <div class="space-y-2">
          <div class="text-center">
            <LinkNew href="/center" align="center" color="primary">
              Centered Link
            </LinkNew>
          </div>
          
          <div class="text-right">
            <LinkNew href="/right" align="right" color="primary">
              Right Aligned Link
            </LinkNew>
          </div>
          
          <LinkNew href="/uppercase" transform="uppercase" color="primary">
            uppercase link
          </LinkNew>
          
          <LinkNew href="/capitalize" transform="capitalize" color="primary">
            capitalize link
          </LinkNew>
        </div>
      </section>

      {/* Complex Examples */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          Complex Examples
        </Text>
        
        <div class="space-y-4">
          <LinkNew 
            href="https://github.com/rxops/ui" 
            external 
            target="_blank"
            textStyle="subtitle"
            weight="semibold"
            color="primary"
            variant="underlined"
          >
            GitHub Repository (Complex Link)
          </LinkNew>
          
          <LinkNew 
            href="/download-file.pdf" 
            download
            variant="button"
            textStyle="body"
            weight="medium"
            color="success"
          >
            Download PDF File
          </LinkNew>
          
          <LinkNew 
            href="/truncated-example"
            textStyle="body"
            color="primary"
            truncate
            class="max-w-xs"
          >
            This is a very long link text that will be truncated when it exceeds the container width
          </LinkNew>
        </div>
      </section>

      {/* Code Examples */}
      <section class="space-y-4">
        <Text as="h2" weight="semibold" size="lg" color="gray-800" class="mb-4">
          Usage Examples
        </Text>
        
        <div class="bg-neutral-lighter p-4 rounded-lg">
          <pre class="text-sm text-neutral-darker">
{`// Basic link with typography
<Link href="/page" textStyle="body" color="primary">
  Internal Link
</Link>

// External link with custom styling
<Link 
  href="https://example.com" 
  external 
  target="_blank"
  textStyle="subtitle"
  weight="semibold"
  color="primary"
  variant="underlined"
>
  External Link
</Link>

// Button-style download link
<Link 
  href="/file.pdf" 
  download
  variant="button"
  color="success"
  weight="medium"
>
  Download File
</Link>

// Disabled link
<Link href="/disabled" disabled color="secondary">
  Disabled Link
</Link>`}
          </pre>
        </div>
      </section>
    </div>
  );
});
