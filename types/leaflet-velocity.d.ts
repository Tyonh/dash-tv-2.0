import "leaflet";

declare module "leaflet" {
  interface VelocityLayerOptions {
    displayValues?: boolean;
    data?: unknown;
    minVelocity?: number;
    maxVelocity?: number;
    velocityScale?: number;
    colorScale?: string[];
    opacity?: number;
    lineWidth?: number;
    particleAge?: number;
    particleMultiplier?: number;
    frameRate?: number;
    paneName?: string;
  }

  interface VelocityLayer extends Layer {
    setData(data: unknown): void;
    setOptions(options: VelocityLayerOptions): void;
  }

  function velocityLayer(options: VelocityLayerOptions): VelocityLayer;
}
