# Component Props Standards - RxOpsLibrary

## ✅ REQUIRED: Native Props Forwarding Pattern

All components MUST follow these standards for maximum flexibility and native HTML compatibility.

### 1. **Props Interface Pattern**

```typescript
// ✅ CORRECT: Extend appropriate native element type
export interface ButtonProps extends BaseComponentProps<HTMLButtonElement> {
  // Component-specific props only
  fullWidth?: boolean;
  leftIcon?: boolean;
  rightIcon?: boolean;
}

// ✅ CORRECT: For input-like components that conflict with native 'size'
export interface InputProps extends Omit<HTMLAttributes<HTMLInputElement>, 'size' | 'children'> {
  size?: ComponentSize; // Our custom size type
  // Other component-specific props
}

// ❌ INCORRECT: Not extending native props
export interface BadComponentProps {
  variant?: Variant;
  onClick?: () => void; // Missing native event signature
}
```

### 2. **Props Destructuring Pattern**

```typescript
export const MyComponent = component$<MyComponentProps>((props) => {
  const {
    // Component-specific props with defaults
    variant = "elevated",
    color = "primary",
    size = "md",
    fullWidth = false,
    
    // Native styling props (handle both Qwik and React patterns)
    class: qwikClass,
    className,
    style,
    
    // Testing props
    testId,
    'data-testid': dataTestId,
    
    // All remaining native props
    ...rest
  } = props;

  // Class merging
  const mergedClass = mergeClasses(
    computedComponentClasses,
    qwikClass,
    className
  );

  return (
    <element
      class={mergedClass}
      style={style}
      data-testid={testId || dataTestId}
      {...rest} // ✅ CRITICAL: Forward all native props
    >
      {/* Component content */}
    </element>
  );
});
```

### 3. **Class Name Handling**

```typescript
// ✅ CORRECT: Support both Qwik and React patterns
const {
  class: qwikClass,      // Qwik's preferred prop
  className,             // React compatibility
  ...rest
} = props;

// Merge classes properly
const finalClass = mergeClasses(
  computedClasses,
  qwikClass,
  className
);

// ❌ INCORRECT: Only supporting one pattern
const { className } = props; // Missing Qwik's class
const { class: cls } = props; // Missing React's className
```

### 4. **Style Prop Forwarding**

```typescript
// ✅ CORRECT: Support both object and string styles
const { style } = props;

return (
  <element
    style={style} // Works with both CSSProperties object and string
    {...rest}
  />
);

// ❌ INCORRECT: Not forwarding style
return <element {...rest} />; // Missing style prop
```

### 5. **Event Handler Forwarding**

```typescript
// ✅ CORRECT: All event handlers forwarded via {...rest}
export interface ButtonProps extends BaseComponentProps<HTMLButtonElement> {
  // Don't redefine onClick$, onFocus$, etc. - they come from HTMLAttributes
}

// ✅ Usage supports all native events
<Button
  onClick$={(e) => console.log('clicked')}
  onFocus$={(e) => console.log('focused')}
  onMouseEnter$={(e) => console.log('hover')}
  // All other native events work automatically
/>

// ❌ INCORRECT: Custom event prop definitions
export interface BadButtonProps {
  onClick?: () => void; // Wrong signature, no event object
  onHover?: () => void; // Non-standard event name
}
```

## 🎯 **Best Practices Checklist**

### For Every Component:
- [ ] ✅ **Extends BaseComponentProps<T>** or **HTMLAttributes<T>**
- [ ] ✅ **Handles both `class` and `className` props**
- [ ] ✅ **Forwards `style` prop**
- [ ] ✅ **Forwards `testId` and `data-testid` props**
- [ ] ✅ **Uses `{...rest}` to forward all remaining props**
- [ ] ✅ **Proper TypeScript generics for element type**

### Class Name Merging:
- [ ] ✅ **Uses `mergeClasses()` utility for combining classes**
- [ ] ✅ **Component classes take precedence over user classes**
- [ ] ✅ **Conditional classes handled properly**

### Event Handling:
- [ ] ✅ **All native events work automatically via `{...rest}`**
- [ ] ✅ **No custom event prop redefinitions**
- [ ] ✅ **Proper event signatures (includes event object)**

## 📚 **Real Examples**

### Button Component (Complete Example)
```typescript
export interface ButtonProps extends BaseComponentProps<HTMLButtonElement> {
  variant?: Variant;
  color?: Color; 
  fullWidth?: boolean;
  leftIcon?: boolean;
  rightIcon?: boolean;
}

export const Button = component$<ButtonProps>((props) => {
  const {
    variant = "elevated",
    color = "primary", 
    size = "md",
    fullWidth = false,
    leftIcon = false,
    rightIcon = false,
    type = "button",
    disabled = false,
    class: qwikClass,
    className,
    style,
    testId,
    'data-testid': dataTestId,
    ...rest
  } = props;

  const buttonClass = computeButtonClasses({
    variant,
    color,
    size,
    fullWidth,
    disabled,
    className: mergeClasses(qwikClass, className)
  });

  return (
    <button
      type={type}
      class={buttonClass}
      style={style}
      disabled={disabled}
      data-testid={testId || dataTestId}
      {...rest} // ✅ Forwards all native button props
    >
      <Slot />
    </button>
  );
});
```

### Usage Examples (All Work Automatically)
```tsx
// ✅ Basic usage
<Button>Click me</Button>

// ✅ With custom classes
<Button class="my-custom-class">Styled</Button>
<Button className="react-style-class">React Compatible</Button>

// ✅ With inline styles  
<Button style={{ marginTop: '10px' }}>Styled</Button>
<Button style="margin-top: 10px;">String Style</Button>

// ✅ With all native button events
<Button
  onClick$={(e) => console.log('click', e)}
  onFocus$={(e) => console.log('focus', e)} 
  onMouseEnter$={(e) => console.log('hover', e)}
  onKeyDown$={(e) => console.log('key', e)}
>
  Interactive
</Button>

// ✅ With native attributes
<Button
  id="submit-btn"
  aria-label="Submit form"
  data-analytics="submit-button"
  title="Click to submit"
>
  Submit
</Button>

// ✅ With refs and other advanced props
<Button
  ref={buttonRef}
  tabIndex={0}
  form="my-form"
  formAction="/submit"
>
  Advanced
</Button>
```

## 🚀 **Migration Strategy**

### Phase 1: Audit Existing Components
1. **Check each component** for proper native props forwarding
2. **Identify missing `{...rest}` patterns**
3. **Fix class/className handling inconsistencies**

### Phase 2: Update Component Interfaces  
1. **Update all interfaces** to extend BaseComponentProps<T>
2. **Remove redundant event handler props**
3. **Add proper TypeScript generics**

### Phase 3: Update Component Implementations
1. **Add proper props destructuring**
2. **Implement class merging with mergeClasses()**  
3. **Ensure {...rest} forwarding in JSX**

### Phase 4: Test & Validate
1. **Test all native events work**
2. **Verify custom styling works**
3. **Check accessibility attributes forward properly**

---

## 🎉 **Result: Maximum Flexibility**

With this pattern, ALL RxOpscomponents become **drop-in replacements** for native HTML elements while adding our design system enhancements. Users get:

- ✅ **Full native HTML compatibility**
- ✅ **All native events and attributes**  
- ✅ **Custom styling capabilities**
- ✅ **React and Qwik compatibility**
- ✅ **TypeScript safety**
- ✅ **Design system consistency**

**Every component becomes a "native+" element with design system superpowers!** 🚀
