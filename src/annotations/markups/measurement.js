import { getLength, getArea } from "ol/sphere";
import { fromCircle } from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";

import Enums from "../../enums";
import { defaultStyle } from "../markers/styles";
import { getUnitsSuffix } from "../markers/utils";

const state = {
  style: defaultStyle,
};

const getOpenLayersStyleFunction = (defaultStyle) => {
  return (feature, resolution) => {
    if (!isMeasurement(feature)) {
      return;
    }

    const styles = [defaultStyle];

    return styles;
  };
};

/**
 * Format measure output
 * @param {Feature} feature feature
 * @param {Geometry} geometry geometry
 * @return {string} The formatted measure of this feature
 */
const formatMeasurement = (feature, geometry, units) => {
  let output =
    Math.round((rawMeasurement(feature, geometry) / 10) * 100) / 100 +
    " " +
    units;
  return output;
};

/**
 * Get measurement from feature
 * @param {Feature} feature feature
 * @param {Geometry} geometry geometry
 * @return {string} The formatted measure of this feature
 */
const rawMeasurement = (feature, geometry) => {
  let geom = feature ? feature.getGeometry() : geometry;
  if (geom instanceof Circle) geom = fromCircle(geom);
  const value = getLength(geom) ? getLength(geom) : getArea(geom);
  let output = Math.round((value / 10) * 100) / 100;
  return output;
};

const isMeasurement = (feature) =>
  Enums.Markup.Measurement === feature.get("marker");

const MeasurementMarkup = (api) => {
  return {
    onRemove: (feature) => {
      if (isMeasurement(feature)) {
        const featureId = feature.getId();
        api.markupManager.remove(featureId);
      }
    },
    onAdd: (feature) => {
      if (isMeasurement(feature)) {
        const view = api.map.getView();
        const measurement = formatMeasurement(
          feature,
          null,
          getUnitsSuffix(view)
        );
        api.markupManager.create({ feature, value: measurement });
      }
    },
    onDrawEnd: (feature) => {
      if (isMeasurement(feature)) {
        const styleFunction = getOpenLayersStyleFunction(state.style);
        feature.setStyle(styleFunction);
      }
    },
    onUpdate: (feature) => {},
    onInteractionsChange: (interactions) => {
      api.markupManager.onInteractionsChange(interactions);
    },
    getDefinition: (options) => {
      state.style = options.style ? options.style : state.style;

      return {
        ...options,
        maxPoints: options.type === "LineString" ? 1 : undefined,
        minPoints: options.type === "LineString" ? 1 : undefined,
        style: getOpenLayersStyleFunction(state.style),
        marker: Enums.Markup.Measurement,
      };
    },
    isMeasurement,
    format: formatMeasurement,
    style: getOpenLayersStyleFunction,
  };
};

export default MeasurementMarkup;
