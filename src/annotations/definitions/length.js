import { LineString } from 'ol/geom';
import { getLength } from 'ol/sphere';

import { Annotation } from '../';
import { defaultStyle } from '../styles';
import { getUnitsSuffix } from '../utils';

const getStyleFunction = (options) => {
  return (feature, resolution) => {
    const styles = [];

    if (isLength(feature)) {
      styles.push(defaultStyle);
    }

    return styles;
  };
};

/**
 * Format length output
 * @param {LineString} line geometry
 * @return {string} The formatted output
 */
const formatLength = (feature, geometry, units) => {
  const line = feature ? feature.getGeometry() : geometry;
  const length = getLength(line);
  let output = Math.round((length / 10) * 100) / 100 + ' ' + units;
  return output;
};

const isLength = feature => Annotation.Length === feature.getGeometryName();

const LengthAnnotation = api => {
  return {
    getROIProperties: (feature, properties = {}) => {
      return isLength(feature) ? {
        ...properties,
        geometryName: Annotation.Length,
      } : properties;
    },
    onRemove: feature => {
      if (isLength(feature)) {
        const featureId = feature.getId();
        api.markerManager.remove(featureId);
      }
    },
    onAdd: (feature) => {
      if (isLength(feature)) {
        const view = api.map.getView();
        const length = formatLength(feature, null, getUnitsSuffix(view));
        api.markerManager.create({ feature, value: length });
      }
    },
    onDrawEnd: (feature) => {
      if (isLength(feature)) {
        feature.setStyle(getStyleFunction());
      }
    },
    onUpdate: feature => { },
    onInteractionsChange: interactions => {
      api.markerManager.onInteractionsChange(interactions);
    },
    getDefinition: (options) => {
      const styleFunction = getStyleFunction(options);

      /** Length Geometry Definition */
      return {
        length: {
          type: 'LineString',
          geometryName: Annotation.Length,
          freehand: false,
          maxPoints: 1,
          minPoints: 1,
          style: styleFunction
        },
      };
    },
    isLength,
    format: formatLength,
    style: getStyleFunction
  };
};

export default LengthAnnotation;