// Polyfills for pdfjs-dist in React Native environment
// These browser APIs are not available in React Native

if (typeof global !== "undefined") {
  // DOMMatrix polyfill
  if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
      m11: number;
      m12: number;
      m21: number;
      m22: number;
      m41: number;
      m42: number;

      constructor(init?: string | number[]) {
        if (typeof init === "string") {
          // Parse matrix string
          const values = init
            .match(/matrix\(([^)]+)\)/)?.[1]
            ?.split(",")
            .map(Number) || [1, 0, 0, 1, 0, 0];
          this.a = values[0] ?? 1;
          this.b = values[1] ?? 0;
          this.c = values[2] ?? 0;
          this.d = values[3] ?? 1;
          this.e = values[4] ?? 0;
          this.f = values[5] ?? 0;
        } else if (Array.isArray(init)) {
          this.a = init[0] ?? 1;
          this.b = init[1] ?? 0;
          this.c = init[2] ?? 0;
          this.d = init[3] ?? 1;
          this.e = init[4] ?? 0;
          this.f = init[5] ?? 0;
        } else {
          this.a = 1;
          this.b = 0;
          this.c = 0;
          this.d = 1;
          this.e = 0;
          this.f = 0;
        }
        this.m11 = this.a;
        this.m12 = this.b;
        this.m21 = this.c;
        this.m22 = this.d;
        this.m41 = this.e;
        this.m42 = this.f;
      }

      static fromMatrix(other?: DOMMatrix) {
        return new DOMMatrix([
          other?.a ?? 1,
          other?.b ?? 0,
          other?.c ?? 0,
          other?.d ?? 1,
          other?.e ?? 0,
          other?.f ?? 0,
        ]);
      }

      static fromFloat32Array(array: Float32Array) {
        return new DOMMatrix([
          array[0] ?? 1,
          array[1] ?? 0,
          array[2] ?? 0,
          array[3] ?? 1,
          array[4] ?? 0,
          array[5] ?? 0,
        ]);
      }

      multiply(other: DOMMatrix) {
        return new DOMMatrix([
          this.a * other.a + this.c * other.b,
          this.b * other.a + this.d * other.b,
          this.a * other.c + this.c * other.d,
          this.b * other.c + this.d * other.d,
          this.a * other.e + this.c * other.f + this.e,
          this.b * other.e + this.d * other.f + this.f,
        ]);
      }

      translate(x: number, y: number) {
        return this.multiply(new DOMMatrix([1, 0, 0, 1, x, y]));
      }

      scale(x: number, y?: number) {
        return this.multiply(new DOMMatrix([x, 0, 0, y ?? x, 0, 0]));
      }

      rotate(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return this.multiply(new DOMMatrix([cos, sin, -sin, cos, 0, 0]));
      }
    } as any;
  }

  // DOMMatrixReadOnly polyfill
  if (!global.DOMMatrixReadOnly) {
    global.DOMMatrixReadOnly = global.DOMMatrix;
  }

  // DOMRect polyfill
  if (!global.DOMRect) {
    global.DOMRect = class DOMRect {
      x: number;
      y: number;
      width: number;
      height: number;
      top: number;
      right: number;
      bottom: number;
      left: number;

      constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.top = y;
        this.left = x;
        this.right = x + width;
        this.bottom = y + height;
      }

      static fromRect(other?: DOMRect) {
        return new DOMRect(
          other?.x ?? 0,
          other?.y ?? 0,
          other?.width ?? 0,
          other?.height ?? 0
        );
      }
    } as any;
  }

  // DOMRectReadOnly polyfill
  if (!global.DOMRectReadOnly) {
    global.DOMRectReadOnly = global.DOMRect;
  }
}
