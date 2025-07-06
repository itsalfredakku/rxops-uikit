import { beforeEach, vi } from 'vitest';
import './testing/qwik-dom-patches';

// Additional DOM compatibility declarations
declare global {
  interface Element {
    isAncestor?(node: Node): boolean;
    _ensureInsertValid?(node: Node): void;
  }
  interface HTMLElement {
    isAncestor?(node: Node): boolean;
    _ensureInsertValid?(node: Node): void;
  }
  interface Node {
    isAncestor?(node: Node): boolean;
    _ensureInsertValid?(node: Node): void;
    _ownerDocument?: Document | null;
  }
}

// Enhanced DOM patching for Qwik compatibility (now handled by qwik-dom-patches)
const patchDOMForQwik = () => {
  // Basic isAncestor implementation for remaining compatibility
  const isAncestorImplementation = function(this: Element | Node, node: Node): boolean {
    if (!node || !this) return false;
    
    // Check if this element contains the node
    if ('contains' in this && typeof this.contains === 'function') {
      try {
        if (node && typeof node === 'object' && 'nodeType' in node) {
          return this.contains(node);
        }
      } catch (error) {
        console.warn('DOM contains method failed, using fallback traversal');
      }
    }
    
    // Fallback traversal
    let current = node.parentNode;
    while (current) {
      if (current === this) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  };

  // Add _ensureInsertValid method (used by Qwik's DOM implementation)
  const ensureInsertValidImplementation = function(this: Element | Node, node: Node): void {
    if (!node) {
      throw new Error('Cannot insert null or undefined node');
    }
    return;
  };

  // Apply patches if not already applied
  if (typeof Element !== 'undefined' && !Element.prototype.isAncestor) {
    Element.prototype.isAncestor = isAncestorImplementation;
    Element.prototype._ensureInsertValid = ensureInsertValidImplementation;
  }

  if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.isAncestor) {
    HTMLElement.prototype.isAncestor = isAncestorImplementation;
    HTMLElement.prototype._ensureInsertValid = ensureInsertValidImplementation;
  }

  if (typeof Node !== 'undefined' && !Node.prototype.isAncestor) {
    Node.prototype.isAncestor = isAncestorImplementation;
    Node.prototype._ensureInsertValid = ensureInsertValidImplementation;
  }
};

// Apply basic DOM compatibility patches
patchDOMForQwik();

// Setup cleanup
beforeEach(() => {
  vi.clearAllMocks();
});
