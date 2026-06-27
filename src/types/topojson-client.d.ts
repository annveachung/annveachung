// Minimal ambient types for topojson-client (no @types package installed).
// We only use `feature()` to turn a TopoJSON object into GeoJSON.
declare module "topojson-client" {
  import type { Feature, FeatureCollection, Geometry } from "geojson";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function feature(
    topology: any,
    object: any,
  ): Feature<Geometry> | FeatureCollection<Geometry>;
}
